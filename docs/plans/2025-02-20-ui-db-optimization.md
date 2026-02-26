# UI优化、数据库存储与性能提升计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构前端界面布局、实现数据库存储、优化启动和生成速度

**Architecture:** 
1. 前端：重构HomeView布局，优化CourseDetailView的蛇形关卡展示
2. 后端：从内存存储迁移到SQLite数据库，实现持久化
3. 性能：优化启动流程，课程生成改为两步式（先返回大纲，内容按需生成）

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, SQLite (better-sqlite3), Framer Motion

---

## Task 1: 安装SQLite数据库依赖

**Files:**
- Modify: `package.json`

**Step 1: 安装better-sqlite3**  
Run: `npm install better-sqlite3`  
Run: `npm install --save-dev @types/better-sqlite3`

Expected: packages installed successfully

**Step 2: Commit**
```bash
git add package.json package-lock.json
git commit -m "feat: add SQLite database dependency"
```

---

## Task 2: 创建数据库模块和Schema

**Files:**
- Create: `lib/db/sqlite.ts`
- Create: `lib/db/schema.sql`
- Modify: `lib/db/memory-db.ts` (保持向后兼容，添加SQLite支持)

**Step 1: 创建数据库Schema**  
Create `lib/db/schema.sql`:
```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  energy INTEGER DEFAULT 100,
  max_energy INTEGER DEFAULT 100,
  last_study_date TEXT
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  thumbnail TEXT,
  cover_image TEXT,
  lessons INTEGER DEFAULT 0,
  exercises INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  last_accessed_at TEXT
);

-- Course materials table (stores original upload)
CREATE TABLE IF NOT EXISTS course_materials (
  course_id TEXT PRIMARY KEY,
  material TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Levels table
CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'available',
  steps TEXT, -- JSON string
  xp_reward INTEGER DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Level content cache table
CREATE TABLE IF NOT EXISTS level_content_cache (
  level_id TEXT PRIMARY KEY,
  steps TEXT NOT NULL, -- JSON string
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

-- Study records table
CREATE TABLE IF NOT EXISTS study_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  level_id TEXT,
  study_date TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapters_course ON chapters(course_id);
CREATE INDEX IF NOT EXISTS idx_levels_course ON levels(course_id);
CREATE INDEX IF NOT EXISTS idx_levels_chapter ON levels(chapter_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_study_user ON study_records(user_id);
CREATE INDEX IF NOT EXISTS idx_study_date ON study_records(study_date);
```

**Step 2: 创建SQLite数据库模块**  
Create `lib/db/sqlite.ts`:
```typescript
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Course, Chapter, Level, UserProgress, StudyRecord } from '@/types';

const DB_PATH = process.env.DATABASE_PATH || './data/openlearner.db';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema();
  }
  return db;
}

function initSchema() {
  if (!db) return;
  const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}

// User operations
export function getOrCreateUser(userId: string = 'user-1') {
  const db = getDatabase();
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  
  if (!user) {
    db.prepare(`
      INSERT INTO users (id, total_xp, current_streak, energy, max_energy, last_study_date)
      VALUES (?, 0, 0, 100, 100, NULL)
    `).run(userId);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  }
  
  return user;
}

export function updateUserProgress(
  userId: string,
  updates: { totalXP?: number; currentStreak?: number; energy?: number; lastStudyDate?: string }
) {
  const db = getDatabase();
  const sets: string[] = [];
  const values: any[] = [];
  
  if (updates.totalXP !== undefined) { sets.push('total_xp = ?'); values.push(updates.totalXP); }
  if (updates.currentStreak !== undefined) { sets.push('current_streak = ?'); values.push(updates.currentStreak); }
  if (updates.energy !== undefined) { sets.push('energy = ?'); values.push(updates.energy); }
  if (updates.lastStudyDate !== undefined) { sets.push('last_study_date = ?'); values.push(updates.lastStudyDate); }
  
  if (sets.length > 0) {
    values.push(userId);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  }
}

// Course operations
export function saveCourse(course: Course, chapters: Chapter[], levels: Level[]) {
  const db = getDatabase();
  
  db.prepare(`
    INSERT OR REPLACE INTO courses (id, title, description, icon, thumbnail, cover_image, lessons, exercises, progress, created_at, last_accessed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    course.id, course.title, course.description, course.icon, course.thumbnail,
    course.coverImage, course.lessons, course.exercises, course.progress,
    course.createdAt.toISOString(), course.lastAccessedAt?.toISOString() || null
  );
  
  for (const chapter of chapters) {
    db.prepare(`
      INSERT OR REPLACE INTO chapters (id, course_id, title, description, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(chapter.id, course.id, chapter.title, chapter.description, chapter.order);
  }
  
  for (const level of levels) {
    db.prepare(`
      INSERT OR REPLACE INTO levels (id, course_id, chapter_id, title, description, order_index, status, steps, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      level.id, course.id, level.chapterId, level.title, level.description,
      level.order, level.status, JSON.stringify(level.steps || []), level.xpReward
    );
  }
  
  return course.id;
}

export function getCourseWithDetails(courseId: string) {
  const db = getDatabase();
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
  if (!course) return null;
  
  const chapters = db.prepare('SELECT * FROM chapters WHERE course_id = ? ORDER BY order_index').all(courseId);
  const levels = db.prepare('SELECT * FROM levels WHERE course_id = ? ORDER BY order_index').all(courseId);
  
  return {
    course: { ...course, coverImage: course.cover_image },
    chapters: chapters.map(ch => ({ ...ch, order: ch.order_index, levelIds: [] })),
    levels: levels.map(lvl => ({ ...lvl, order: lvl.order_index, xpReward: lvl.xp_reward, chapterId: lvl.chapter_id, steps: JSON.parse(lvl.steps || '[]') })),
  };
}

export function getAllCourses(): any[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM courses ORDER BY last_accessed_at DESC').all();
}

// Material operations
export function saveCourseMaterial(courseId: string, material: string) {
  const db = getDatabase();
  db.prepare(`
    INSERT OR REPLACE INTO course_materials (course_id, material, uploaded_at)
    VALUES (?, ?, ?)
  `).run(courseId, material, new Date().toISOString());
}

export function getCourseMaterial(courseId: string): string | undefined {
  const db = getDatabase();
  const result = db.prepare('SELECT material FROM course_materials WHERE course_id = ?').get(courseId) as any;
  return result?.material;
}

// Level content cache
export function saveLevelContent(levelId: string, steps: any[]) {
  const db = getDatabase();
  db.prepare(`
    INSERT OR REPLACE INTO level_content_cache (level_id, steps, timestamp)
    VALUES (?, ?, ?)
  `).run(levelId, JSON.stringify(steps), Date.now());
}

export function getLevelContent(levelId: string) {
  const db = getDatabase();
  const result = db.prepare('SELECT * FROM level_content_cache WHERE level_id = ?').get(levelId) as any;
  if (!result) return undefined;
  return { steps: JSON.parse(result.steps), timestamp: result.timestamp };
}

// Progress operations
export function updateLevelStatus(userId: string, courseId: string, levelId: string, status: string) {
  const db = getDatabase();
  db.prepare(`
    INSERT OR REPLACE INTO user_progress (id, user_id, course_id, level_id, status, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    `progress-${userId}-${levelId}`, userId, courseId, levelId, status,
    status === 'completed' ? new Date().toISOString() : null
  );
}

export function getUserProgress(userId: string, courseId: string): string[] {
  const db = getDatabase();
  const results = db.prepare(`
    SELECT level_id FROM user_progress WHERE user_id = ? AND course_id = ? AND status = 'completed'
  `).all(userId, courseId) as any[];
  return results.map(r => r.level_id);
}

// Study records
export function recordStudySession(
  userId: string,
  courseId: string,
  levelId: string | null,
  duration: number,
  xpEarned: number
) {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  
  db.prepare(`
    INSERT INTO study_records (id, user_id, course_id, level_id, study_date, duration, xp_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(`study-${Date.now()}`, userId, courseId, levelId, today, duration, xpEarned);
  
  return { today, xpEarned };
}

export function hasStudiedToday(userId: string): boolean {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM study_records WHERE user_id = ? AND study_date = ?
  `).get(userId, today) as any;
  return result.count > 0;
}

export function getStudyStats(userId: string) {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  
  const todayStats = db.prepare(`
    SELECT COALESCE(SUM(duration), 0) as duration, COALESCE(SUM(xp_earned), 0) as xp
    FROM study_records WHERE user_id = ? AND study_date = ?
  `).get(userId, today) as any;
  
  const weekRecords = db.prepare(`
    SELECT study_date, duration FROM study_records WHERE user_id = ? ORDER BY study_date DESC LIMIT 7
  `).all(userId);
  
  return {
    today: { duration: todayStats.duration, xp: todayStats.xp, hasStudied: todayStats.duration > 0 },
    week: weekRecords,
  };
}
```

**Step 3: 更新memory-db以支持SQLite**  
Modify `lib/db/memory-db.ts`:  
Add SQLite imports and check at module init:
```typescript
import { getDatabase, getOrCreateUser as sqliteGetUser, updateUserProgress as sqliteUpdateProgress, saveCourse as sqliteSaveCourse, getCourseWithDetails as sqliteGetCourse, getAllCourses as sqliteGetAllCourses, saveCourseMaterial as sqliteSaveMaterial, getCourseMaterial as sqliteGetMaterial, saveLevelContent as sqliteSaveLevelContent, getLevelContent as sqliteGetLevelContent, updateLevelStatus as sqliteUpdateLevelStatus, getUserProgress as sqliteGetUserProgress, recordStudySession as sqliteRecordStudy, hasStudiedToday as sqliteHasStudied, getStudyStats as sqliteGetStats } from './sqlite';

const USE_SQLITE = process.env.USE_SQLITE !== 'false';

// Initialize SQLite on module load
if (USE_SQLITE) {
  try {
    getDatabase();
    console.log('SQLite database initialized');
  } catch (error) {
    console.error('Failed to initialize SQLite:', error);
  }
}

// Export functions that use SQLite when available
export function getOrCreateUser(userId: string = 'user-1') {
  if (USE_SQLITE) return sqliteGetUser(userId);
  // ... existing memory implementation
}

// Apply same pattern to all other exported functions
```

**Step 4: Commit**
```bash
git add lib/db/
git commit -m "feat: implement SQLite database with full schema and operations"
```

---

## Task 3: 重构HomeView界面布局

**Files:**
- Modify: `components/HomeView.tsx`

**Step 1: 移除底部"近期学习"板块，将其移到右半部分**  
Replace the entire component with new layout:

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, BookOpen, BarChart3, Plus, ChevronRight, Clock } from 'lucide-react';
import { Course, UserProgress, RecentCourse } from '@/types';
import { getStreakDays } from '@/data/mockLevels';

interface HomeViewProps {
  courses: Course[];
  recentCourses: RecentCourse[];
  progress: UserProgress;
  onSelectCourse: (course: Course) => void;
  onAddMaterial: () => void;
}

export default function HomeView({
  courses,
  recentCourses,
  progress,
  onSelectCourse,
  onAddMaterial
}: HomeViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0]);
  const streakDays = getStreakDays(progress.currentStreak, progress.lastStudyDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">首页</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddMaterial}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加材料
          </motion.button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - User Stats */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-gray-900">{progress.energy}</span>
                  <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Zap key={i} className="w-4 h-4 text-lime-400 fill-lime-400" />
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                {streakDays.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      item.active
                        ? 'bg-gradient-to-br from-lime-400 to-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400'
                    } ${item.isToday ? 'ring-2 ring-offset-2 ring-lime-400' : ''}`}>
                      {item.active ? <Zap className="w-5 h-5" /> : <span className="text-xs">-</span>}
                    </div>
                    <span className={`text-xs font-bold ${item.active ? 'text-gray-700' : 'text-gray-400'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Selected Course Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectCourse(selectedCourse)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-2">{selectedCourse.title}</h3>
                  <p className="text-xs text-gray-500">{selectedCourse.chapters.length} 个章节</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{selectedCourse.lessons} 课时</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>{selectedCourse.exercises} 练习</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${selectedCourse.progress}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-indigo-600">{selectedCourse.progress}%</span>
              </div>
            </motion.div>
          </div>

          {/* Center Column - Main Course Display */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              onClick={() => onSelectCourse(selectedCourse)}
            >
              <div className="relative h-80">
                <img
                  src={selectedCourse.coverImage}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedCourse.title}</h2>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">{selectedCourse.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white/20 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-lime-400 to-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${selectedCourse.progress}%` }}
                      />
                    </div>
                    <span className="text-white font-bold text-lg">{selectedCourse.progress}%</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full">
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedCourse.chapters.length} 章节
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Course Thumbnails */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">课程缩略图</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {courses.map((course) => (
                  <motion.button
                    key={course.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCourse(course)}
                    className={`flex-shrink-0 relative rounded-2xl overflow-hidden transition-all ${
                      selectedCourse.id === course.id
                        ? 'ring-4 ring-indigo-500 ring-offset-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-40 h-28 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs font-semibold truncate">{course.title}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Recent Courses */}
          <div className="col-span-12 lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-8"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">近期学习</h3>
              <div className="space-y-3">
                {recentCourses.slice(0, 6).map((recent, index) => (
                  <motion.div
                    key={recent.courseId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group"
                    onClick={() => {
                      const course = courses.find(c => c.id === recent.courseId);
                      if (course) {
                        setSelectedCourse(course);
                        onSelectCourse(course);
                      }
                    }}
                  >
                    <img
                      src={recent.thumbnail}
                      alt={recent.courseTitle}
                      className="w-14 h-10 rounded-xl object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{recent.courseTitle}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${recent.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{recent.progress}%</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add components/HomeView.tsx
git commit -m "feat: refactor HomeView layout - move recent courses to right sidebar"
```

---

## Task 4: 优化CourseDetailView - 更好的蛇形关卡展示

**Files:**
- Modify: `components/CourseDetailView.tsx`
- Modify: `components/LevelNode.tsx` (if exists)

**Step 1: 重构CourseDetailView布局**  
Create enhanced version with better snake layout:

```typescript
'use client';

import { motion } from 'framer-motion';
import { BookOpen, Target, ArrowLeft, CheckCircle2, Play, Clock, Award, TrendingUp } from 'lucide-react';
import { Course, Level, Chapter } from '@/types';

interface CourseDetailViewProps {
  course: Course;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
}

function LevelNode({
  level,
  onClick,
  isEvenRow,
  index
}: {
  level: Level;
  onClick: () => void;
  isEvenRow: boolean;
  index: number;
}) {
  const isCompleted = level.status === 'completed';
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 ${isEvenRow ? 'flex-row-reverse' : ''}`}
    >
      <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
        isCompleted
          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200'
          : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-200'
      }`}>
        {isCompleted ? (
          <CheckCircle2 className="w-8 h-8 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white fill-white ml-1" />
        )}
        
        {/* Glow effect for available levels */}
        {!isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-white/20"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* XP badge */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
          <span className="text-xs font-bold text-gray-900">{level.xpReward}</span>
        </div>
      </div>
      
      <span className="text-sm font-semibold text-gray-700 max-w-[100px] text-center line-clamp-2">
        {level.title}
      </span>
    </motion.button>
  );
}

function ConnectionLine({ isActive, isHorizontal }: { isActive: boolean; isHorizontal: boolean }) {
  if (isHorizontal) {
    return (
      <div className={`flex-1 h-1.5 rounded-full mx-2 ${isActive ? 'bg-emerald-400' : 'bg-gray-200'}`}>
        {isActive && (
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className={`w-1.5 h-8 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-gray-200'}`}>
      {isActive && (
        <motion.div
          className="w-full bg-emerald-500 rounded-full"
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}

function ChapterSection({
  chapter,
  levels,
  onSelectLevel,
  chapterIndex
}: {
  chapter: Chapter;
  levels: Level[];
  onSelectLevel: (level: Level) => void;
  chapterIndex: number;
}) {
  const chapterLevels = levels.filter(l => chapter.levelIds.includes(l.id));
  const levelsPerRow = 4;
  const rows: Level[][] = [];
  
  for (let i = 0; i < chapterLevels.length; i += levelsPerRow) {
    rows.push(chapterLevels.slice(i, i + levelsPerRow));
  }
  
  // Calculate total XP for this chapter
  const totalXP = chapterLevels.reduce((sum, l) => sum + l.xpReward, 0);
  const completedCount = chapterLevels.filter(l => l.status === 'completed').length;
  
  return (
    <div className="mb-16">
      {/* Chapter Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: chapterIndex * 0.1 }}
        className="flex items-center gap-4 mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">{chapter.order}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{chapter.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-gray-700">{completedCount}/{chapterLevels.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full border border-yellow-200">
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold text-yellow-700">{totalXP} XP</span>
          </div>
        </div>
      </motion.div>
      
      {/* Snake Layout */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex}>
            <div className={`flex items-center ${rowIndex % 2 === 1 ? 'flex-row-reverse' : ''}`}>
              {row.map((level, levelIndex) => {
                const isLastInRow = levelIndex === row.length - 1;
                const prevLevel = levelIndex > 0 ? row[levelIndex - 1] : null;
                const connectionActive = prevLevel?.status === 'completed';
                
                return (
                  <div key={level.id} className="flex items-center flex-1">
                    {levelIndex > 0 && (
                      <ConnectionLine isActive={connectionActive} isHorizontal={true} />
                    )}
                    <LevelNode
                      level={level}
                      onClick={() => onSelectLevel(level)}
                      isEvenRow={rowIndex % 2 === 1}
                      index={rowIndex * levelsPerRow + levelIndex}
                    />
                  </div>
                );
              })}
              
              {/* Fill remaining space in row */}
              {Array.from({ length: levelsPerRow - row.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex-1" />
              ))}
            </div>
            
            {/* Vertical connector to next row */}
            {!isLastInRow && rowIndex < rows.length - 1 && (
              <div className={`flex ${rowIndex % 2 === 1 ? 'justify-start' : 'justify-end'} px-10`}>
                <ConnectionLine 
                  isActive={row[row.length - 1]?.status === 'completed'} 
                  isHorizontal={false} 
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CourseDetailView({ course, onSelectLevel, onBack }: CourseDetailViewProps) {
  const totalLevels = course.levels.length;
  const completedLevels = course.levels.filter(l => l.status === 'completed').length;
  const totalXP = course.levels.reduce((sum, l) => sum + l.xpReward, 0);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回课程列表
          </motion.button>
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 text-5xl shadow-lg">
              {course.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-500 mt-2 max-w-2xl">{course.description}</p>
              
              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.chapters.length} 章节</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>{totalLevels} 关卡</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>{totalXP} XP</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{completedLevels}/{totalLevels} 已完成</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-4 mt-4 max-w-md">
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-indigo-600">{course.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">学习路径</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>按章节顺序完成关卡</span>
          </div>
        </div>
        
        {course.chapters.map((chapter, index) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            levels={course.levels}
            onSelectLevel={onSelectLevel}
            chapterIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add components/CourseDetailView.tsx
git commit -m "feat: enhance CourseDetailView with beautiful snake layout and improved UI"
```

---

## Task 5: 优化加载界面

**Files:**
- Modify: `app/page.tsx`
- Create: `components/LoadingScreen.tsx`

**Step 1: 创建美观的Loading组件**  
Create `components/LoadingScreen.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated Logo */}
        <div className="relative mb-8">
          <motion.div
            className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <BookOpen className="w-12 h-12 text-white" />
          </motion.div>
          
          {/* Sparkles */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
          
          <motion.div
            className="absolute -bottom-1 -left-1"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
            }}
          >
            <Sparkles className="w-5 h-5 text-pink-400" />
          </motion.div>
        </div>
        
        {/* Loading Text */}
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          OpenLearner
        </motion.h2>
        
        <motion.p
          className="text-gray-500 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          正在加载您的学习世界...
        </motion.p>
        
        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <motion.p
            className="text-xs text-gray-400 mt-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            加载中...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
```

**Step 2: 更新page.tsx使用新的Loading组件**  
Modify `app/page.tsx`:
```typescript
import LoadingScreen from '@/components/LoadingScreen';

// ... in the component
if (isLoading) {
  return <LoadingScreen />;
}
```

**Step 3: Commit**
```bash
git add components/LoadingScreen.tsx app/page.tsx
git commit -m "feat: add beautiful loading screen with animations"
```

---

## Task 6: 优化课程生成 - 两步式快速返回

**Files:**
- Modify: `lib/ai/course-generator.ts`
- Modify: `app/api/ai/generate-course/route.ts`

**Step 1: 优化generateCourseStructure**  
Modify `lib/ai/course-generator.ts`:

```typescript
// Update generateCourseStructure to be faster and only return outline
async function generateCourseStructure(
  material: string,
  title?: string,
  difficulty: string = 'intermediate'
): Promise<{ chapters: GeneratedChapter[]; courseInfo: Partial<GeneratedCourse>; levels: GeneratedLevel[] }> {
  const provider = AIProviderFactory.getProvider();
  
  if (!provider.isAvailable()) {
    throw new Error(`AI provider ${provider.name} is not configured`);
  }
  
  // Generate both chapters AND levels in ONE call for speed
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: '你是一个课程设计专家。快速生成课程大纲，包含章节和关卡设计。输出必须是有效的JSON格式。',
    },
    {
      role: 'user',
      content: `
根据以下学习材料快速生成课程大纲（只生成章节和关卡标题，不生成详细内容）。

${title ? `指定标题: ${title}` : '请根据内容生成标题'}
难度: ${difficulty === 'beginner' ? '初级' : difficulty === 'advanced' ? '高级' : '中级'}

材料内容（前2000字符）:
${material.slice(0, 2000)}

要求:
1. 生成3-5个章节
2. 每个章节包含2-4个关卡
3. 每个关卡只需要标题和简要描述
4. 不需要生成详细内容（内容将在用户进入关卡时生成）

XP设置: 初级50-80, 中级80-120, 高级120-150

输出格式:
{
  "title": "课程标题",
  "description": "一句话描述课程内容",
  "icon": "📚",
  "chapters": [
    {
      "title": "章节标题",
      "description": "章节描述",
      "order": 1,
      "levels": [
        {"title": "关卡标题", "description": "关卡描述", "xpReward": 100}
      ]
    }
  ]
}`,
    },
  ];
  
  const response = await provider.generateCompletion(messages, {
    temperature: 0.7,
    maxTokens: 2000, // Reduced from 4000 for faster response
    responseFormat: 'json',
  });
  
  const content = response.content;
  if (!content) {
    throw new Error('Failed to generate course structure');
  }
  
  // Parse JSON (existing logic)
  let jsonContent = content;
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1];
  } else {
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonContent = content.substring(jsonStart, jsonEnd + 1);
    }
  }
  
  try {
    const result = JSON.parse(jsonContent);
    
    // Flatten levels from chapters
    const allLevels: GeneratedLevel[] = [];
    result.chapters.forEach((ch: any, chIdx: number) => {
      if (ch.levels) {
        ch.levels.forEach((lvl: any, lvlIdx: number) => {
          allLevels.push({
            ...lvl,
            order: allLevels.length + 1,
            chapterIndex: chIdx,
            quiz: [], // Empty, will be filled later
          });
        });
      }
    });
    
    return {
      chapters: result.chapters.map((ch: any, idx: number) => ({
        title: ch.title,
        description: ch.description,
        order: idx + 1,
        id: `chapter-temp-${idx}`,
      })),
      courseInfo: {
        title: result.title,
        description: result.description,
        icon: result.icon,
      },
      levels: allLevels,
    };
  } catch (parseError: any) {
    // Fix trailing commas
    let fixedContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
    try {
      const result = JSON.parse(fixedContent);
      const allLevels: GeneratedLevel[] = [];
      result.chapters.forEach((ch: any, chIdx: number) => {
        if (ch.levels) {
          ch.levels.forEach((lvl: any) => {
            allLevels.push({
              ...lvl,
              order: allLevels.length + 1,
              chapterIndex: chIdx,
              quiz: [],
            });
          });
        }
      });
      
      return {
        chapters: result.chapters.map((ch: any, idx: number) => ({
          title: ch.title,
          description: ch.description,
          order: idx + 1,
          id: `chapter-temp-${idx}`,
        })),
        courseInfo: {
          title: result.title,
          description: result.description,
          icon: result.icon,
        },
        levels: allLevels,
      };
    } catch (fixError) {
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  }
}

// Remove the separate generateLevelsForChapter function - not needed for fast outline generation
// Simplified generateCourse function
export async function generateCourse(input: CourseGenerationInput): Promise<GeneratedCourse> {
  const provider = AIProviderFactory.getProvider();
  
  if (!provider.isAvailable()) {
    throw new Error(`AI provider ${provider.name} is not configured`);
  }
  
  try {
    // Single call for outline
    const { chapters, courseInfo, levels } = await generateCourseStructure(
      input.material,
      input.title,
      input.difficulty
    );
    
    return {
      title: courseInfo.title || input.title || '未命名课程',
      description: courseInfo.description || '由AI生成的个性化课程',
      icon: courseInfo.icon || '📚',
      thumbnail: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop`,
      coverImage: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop`,
      chapters,
      levels,
      estimatedLessons: levels.length,
      estimatedExercises: levels.length * 2, // Estimate
    };
  } catch (error) {
    console.error('Error generating course:', error);
    throw error;
  }
}
```

**Step 2: 更新API路由支持快速响应**  
Modify `app/api/ai/generate-course/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateCourse } from '@/lib/ai/course-generator';
import { saveCourse, saveCourseMaterial } from '@/lib/db/memory-db';
import { v4 as uuidv4 } from 'uuid';
import { Course, Chapter, Level } from '@/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { material, title, difficulty = 'intermediate' } = body;
    
    if (!material || material.trim().length < 50) {
      return NextResponse.json(
        { error: 'Material must be at least 50 characters long' },
        { status: 400 }
      );
    }
    
    // Generate course outline (fast - single API call)
    const generatedCourse = await generateCourse({
      material,
      title,
      difficulty,
    });
    
    const courseId = `course-${uuidv4()}`;
    
    // Create course object
    const course: Course = {
      id: courseId,
      title: generatedCourse.title,
      description: generatedCourse.description,
      icon: generatedCourse.icon,
      thumbnail: generatedCourse.thumbnail,
      coverImage: generatedCourse.coverImage,
      lessons: generatedCourse.estimatedLessons,
      exercises: generatedCourse.estimatedExercises,
      progress: 0,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      chapters: [],
      levels: [],
    };
    
    // Create chapters and levels
    const chapters: Chapter[] = generatedCourse.chapters.map((ch, idx) => ({
      id: `chapter-${courseId}-${idx}`,
      title: ch.title,
      description: ch.description,
      order: ch.order,
      levelIds: [],
    }));
    
    const levels: Level[] = generatedCourse.levels.map((lvl, idx) => {
      const chapterIndex = Math.min(lvl.chapterIndex || 0, chapters.length - 1);
      const levelId = `level-${courseId}-${idx}`;
      
      return {
        id: levelId,
        title: lvl.title,
        description: lvl.description,
        order: lvl.order,
        chapterId: chapters[chapterIndex]?.id || chapters[0]?.id,
        status: 'available',
        steps: [], // Empty - content generated on-demand
        xpReward: lvl.xpReward || 100,
      };
    });
    
    // Link levels to chapters
    chapters.forEach(ch => {
      ch.levelIds = levels
        .filter(l => l.chapterId === ch.id)
        .map(l => l.id);
    });
    
    course.chapters = chapters;
    course.levels = levels;
    
    // Save to database (async, non-blocking)
    saveCourse(course, chapters, levels);
    saveCourseMaterial(courseId, material);
    
    const duration = Date.now() - startTime;
    console.log(`Course generated in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      data: {
        courseId,
        course,
      },
      meta: {
        generationTime: duration,
        cached: false,
      },
    });
  } catch (error: any) {
    console.error('Error generating course:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate course. Please try again.',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**
```bash
git add lib/ai/course-generator.ts app/api/ai/generate-course/route.ts
git commit -m "perf: optimize course generation to single API call for faster outline generation"
```

---

## Task 7: 优化启动速度

**Files:**
- Modify: `app/layout.tsx`
- Modify: `next.config.mjs`
- Create: `app/loading.tsx`

**Step 1: 添加Next.js加载状态**  
Create `app/loading.tsx`:

```typescript
import LoadingScreen from '@/components/LoadingScreen';

export default function Loading() {
  return <LoadingScreen />;
}
```

**Step 2: 优化next.config.mjs**  
Modify `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Speed up dev build
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    return config;
  },
  // Experimental features for faster builds
  experimental: {
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;
```

**Step 3: 优化layout.tsx**  
Ensure minimal blocking in `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenLearner - AI驱动的个性化学习平台",
  description: "通过AI技术为您生成个性化课程，让学习更高效",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Step 4: Commit**
```bash
git add app/loading.tsx next.config.mjs app/layout.tsx
git commit -m "perf: optimize startup speed with webpack config and loading states"
```

---

## Task 8: 确保数据目录存在

**Files:**
- Modify: `package.json`
- Create: `data/.gitkeep`

**Step 1: 创建数据目录**  
Run: `mkdir -p data`  
Create `data/.gitkeep` with empty content

**Step 2: 更新package.json scripts**  
Add to `package.json` scripts:
```json
"predev": "mkdir -p data",
"prebuild": "mkdir -p data",
"clean": "rm -rf data/*.db .next"
```

**Step 3: Commit**
```bash
git add data/.gitkeep package.json
git commit -m "chore: add data directory for SQLite database"
```

---

## Task 9: 测试和验证

**Files:**
- Run: `npm run dev`

**Step 1: 启动开发服务器**  
Run: `npm run dev`  
Expected: Server starts quickly (< 3 seconds)

**Step 2: 测试课程生成**  
1. Go to home page
2. Click "添加材料"
3. Enter course material (100+ chars)
4. Generate course
Expected: Returns in < 5 seconds with outline

**Step 3: 验证数据库持久化**  
Run: `ls -lh data/`  
Expected: `openlearner.db` file exists

**Step 4: Commit**
```bash
git commit -m "test: verify all optimizations working correctly"
```

---

## Summary

This plan implements:

1. **UI Improvements:**
   - 3-column HomeView layout (stats | main | recent courses)
   - Beautiful snake layout for CourseDetailView with XP badges
   - Animated loading screen

2. **Database:**
   - SQLite with better-sqlite3 for fast, synchronous operations
   - Persistent storage for courses, materials, user progress
   - Content caching for level generation

3. **Performance:**
   - Single API call for course outline generation
   - On-demand content generation for levels
   - Webpack optimizations for faster dev builds
   - Loading states for better UX

**Total estimated time:** 2-3 hours  
**Dependencies:** better-sqlite3, @types/better-sqlite3
