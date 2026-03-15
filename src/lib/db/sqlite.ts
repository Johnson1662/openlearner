import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync, renameSync } from 'fs';
import { dirname, isAbsolute, join } from 'path';
import { Course, Chapter, Level } from '@/types';

const DB_PATH = process.env.DATABASE_PATH || './src/data/openlearner.db';

let db: Database.Database | null = null;
let activeDbPath: string | null = null;

function resolveDbPath() {
  return isAbsolute(DB_PATH) ? DB_PATH : join(process.cwd(), DB_PATH);
}

function isCorruptionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string };
  const message = (err.message || '').toLowerCase();
  return (
    err.code === 'SQLITE_CORRUPT' ||
    message.includes('database disk image is malformed') ||
    message.includes('sqlite_corrupt')
  );
}

function backupCorruptedDatabase(dbPath: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const candidates = [dbPath, `${dbPath}-wal`, `${dbPath}-shm`];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;
    renameSync(filePath, `${filePath}.corrupt-${stamp}.bak`);
  }
}

function initializeDatabase(dbPath: string) {
  mkdirSync(dirname(dbPath), { recursive: true });
  db = new Database(dbPath);
  activeDbPath = dbPath;
  db.pragma('journal_mode = WAL');
  initSchema();
}

function rebuildDatabaseFromCorruption(dbPath: string, reason: unknown) {
  if (db) {
    try {
      db.close();
    } catch {
      // ignore close errors during recovery
    }
    db = null;
  }
  let rebuiltPath = dbPath;
  try {
    backupCorruptedDatabase(dbPath);
  } catch (backupError) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    rebuiltPath = `${dbPath}.recovered-${stamp}.db`;
    console.warn('SQLite backup rename failed, switching to recovered DB path.', backupError);
  }

  initializeDatabase(rebuiltPath);
  console.warn('SQLite corruption detected. Database was rebuilt.', reason);
}

function assertDatabaseHealthy() {
  if (!db) return;
  const quickCheck = db.prepare('PRAGMA quick_check').get() as { quick_check?: string };
  if (quickCheck?.quick_check !== 'ok') {
    const err = new Error(`SQLite quick_check failed: ${quickCheck?.quick_check || 'unknown'}`);
    (err as any).code = 'SQLITE_CORRUPT';
    throw err;
  }
}

export function getDatabase(): Database.Database {
  const dbPath = activeDbPath || resolveDbPath();
  try {
    if (!db) {
      initializeDatabase(dbPath);
    } else {
      assertDatabaseHealthy();
    }
  } catch (error) {
    if (!isCorruptionError(error)) {
      throw error;
    }
    rebuildDatabaseFromCorruption(dbPath, error);
  }
  return db;
}

function initSchema() {
  if (!db) return;
  const schemaPath = join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  
  // Insert sample course if no courses exist
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get() as any;
  if (courseCount.count === 0) {
    insertSampleCourse();
  }
}

function insertSampleCourse() {
  if (!db) return;
  
  const sampleCourseId = 'course-sample-001';
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT OR IGNORE INTO courses (id, title, description, icon, thumbnail, cover_image, lessons, exercises, progress, created_at, last_accessed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sampleCourseId,
    '欢迎来到 OpenLearner',
    '这是一个示例课程，帮助你快速了解如何使用 OpenLearner 学习平台',
    '🚀',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
    3,
    3,
    0,
    now,
    now
  );
  
  const chapterId = `chapter-${sampleCourseId}-0`;
  db.prepare(`
    INSERT OR IGNORE INTO chapters (id, course_id, title, description, order_index)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    chapterId,
    sampleCourseId,
    '开始你的学习之旅',
    '了解平台基本功能',
    1
  );
  
  const levels = [
    { title: '平台介绍', description: '了解 OpenLearner 的基本功能', order: 1, xp: 50 },
    { title: '如何学习', description: '学习路径和进度追踪', order: 2, xp: 50 },
    { title: '创建你的第一个课程', description: '使用 AI 生成个性化课程', order: 3, xp: 100 },
  ];
  
  levels.forEach((lvl, idx) => {
    db.prepare(`
      INSERT OR IGNORE INTO levels (id, course_id, chapter_id, title, description, order_index, status, steps, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `level-${sampleCourseId}-${idx}`,
      sampleCourseId,
      chapterId,
      lvl.title,
      lvl.description,
      lvl.order,
      'available',
      '[]',
      lvl.xp
    );
  });
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
  
  // Handle both Date objects and ISO strings
  const createdAt = course.createdAt instanceof Date 
    ? course.createdAt.toISOString() 
    : (course.createdAt || new Date().toISOString());
  const lastAccessedAt = course.lastAccessedAt instanceof Date
    ? course.lastAccessedAt.toISOString()
    : (course.lastAccessedAt || null);
  
  db.prepare(`
    INSERT OR REPLACE INTO courses (id, title, description, icon, thumbnail, cover_image, lessons, exercises, progress, created_at, last_accessed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    course.id, course.title, course.description, course.icon, course.thumbnail,
    course.coverImage, course.lessons || 0, course.exercises || 0, course.progress || 0,
    createdAt, lastAccessedAt
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

export function getCourseWithDetails(courseId: string, userId: string = 'user-1') {
  const db = getDatabase();
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
  if (!course) return null;

  const chapters = db.prepare('SELECT * FROM chapters WHERE course_id = ? ORDER BY order_index').all(courseId) as any[];
  const levels = db.prepare('SELECT * FROM levels WHERE course_id = ? ORDER BY order_index').all(courseId) as any[];
  
  // Get user's completed levels for this course
  const completedLevels = db.prepare(`
    SELECT level_id FROM user_progress WHERE user_id = ? AND course_id = ? AND status = 'completed'
  `).all(userId, courseId) as any[];
  const completedLevelIds = new Set(completedLevels.map(r => r.level_id));
  
  const totalLevels = levels.length;
  const completedCount = completedLevelIds.size;
  const progress = totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;
  
  // Map levelIds to chapters
  const chaptersWithLevelIds = chapters.map(ch => ({
    ...ch,
    order: ch.order_index,
    levelIds: levels
      .filter(l => l.chapter_id === ch.id)
      .map(l => l.id)
  }));

  return {
    course: { ...course, coverImage: course.cover_image, progress },
    chapters: chaptersWithLevelIds,
    levels: levels.map(lvl => ({ 
      ...lvl, 
      order: lvl.order_index, 
      xpReward: lvl.xp_reward, 
      chapterId: lvl.chapter_id, 
      steps: JSON.parse(lvl.steps || '[]'),
      status: completedLevelIds.has(lvl.id) ? 'completed' : lvl.status
    })),
    completedLevelIds: Array.from(completedLevelIds),
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

export function saveUserAnswer(
  userId: string,
  courseId: string,
  levelId: string,
  stepId: string,
  answer: string,
  isCorrect: boolean
) {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO user_answers (id, user_id, course_id, level_id, step_id, answer, is_correct, answered_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `answer-${Date.now()}`,
    userId,
    courseId,
    levelId,
    stepId,
    answer,
    isCorrect ? 1 : 0,
    new Date().toISOString()
  );
}

export function saveUserFeedback(
  userId: string,
  courseId: string,
  levelId: string | null,
  feedbackType: 'after_question' | 'after_level',
  difficulty: string | null,
  feedbackText: string
) {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO user_feedback (id, user_id, course_id, level_id, feedback_type, difficulty, feedback_text, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `feedback-${Date.now()}`,
    userId,
    courseId,
    levelId,
    feedbackType,
    difficulty,
    feedbackText,
    new Date().toISOString()
  );
}

export function getUserAnswers(userId: string, courseId: string, levelId: string) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM user_answers WHERE user_id = ? AND course_id = ? AND level_id = ?
    ORDER BY answered_at ASC
  `).all(userId, courseId, levelId);
}

export function getUserFeedback(userId: string, courseId: string, levelId?: string) {
  const db = getDatabase();
  if (levelId) {
    return db.prepare(`
      SELECT * FROM user_feedback WHERE user_id = ? AND course_id = ? AND level_id = ?
      ORDER BY created_at DESC
    `).all(userId, courseId, levelId);
  }
  return db.prepare(`
    SELECT * FROM user_feedback WHERE user_id = ? AND course_id = ?
    ORDER BY created_at DESC
  `).all(userId, courseId);
}

// Course requirements operations
export function saveCourseRequirements(
  courseId: string,
  requirements: {
    subject?: string;
    priorKnowledge?: string;
    learningGoal?: string;
    learningPacing?: string;
    materialSourceType?: string;
  }
) {
  const db = getDatabase();
  db.prepare(`
    INSERT OR REPLACE INTO course_requirements (course_id, subject, prior_knowledge, learning_goal, learning_pacing, material_source_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    courseId,
    requirements.subject || null,
    requirements.priorKnowledge || 'intermediate',
    requirements.learningGoal || 'professional',
    requirements.learningPacing || 'balanced',
    requirements.materialSourceType || 'paste',
    new Date().toISOString()
  );
}

export function getCourseRequirements(courseId: string) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM course_requirements WHERE course_id = ?').get(courseId) as any;
}
