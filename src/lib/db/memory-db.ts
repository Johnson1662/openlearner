import { Course, Chapter, Level, UserProgress, StudyRecord } from '@/types';

const USE_SQLITE = process.env.USE_SQLITE === 'true';

// Lazy-load sqlite module only when USE_SQLITE is true to avoid native binding errors
function getSqlite() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./sqlite');
}

interface MemoryDB {
  users: Map<string, any>;
  courses: Map<string, any>;
  chapters: Map<string, any>;
  levels: Map<string, any>;
  userProgress: Map<string, any>;
  studyRecords: Map<string, any>;
  courseMaterials: Map<string, string>;
  levelContentCache: Map<string, { steps: any[]; timestamp: number }>;
}

const memoryDB: MemoryDB = {
  users: new Map(),
  courses: new Map(),
  chapters: new Map(),
  levels: new Map(),
  userProgress: new Map(),
  studyRecords: new Map(),
  courseMaterials: new Map(),
  levelContentCache: new Map(),
};

export function initDatabase() {
  if (!USE_SQLITE) {
    if (!memoryDB.users.has('user-1')) {
      memoryDB.users.set('user-1', {
        id: 'user-1',
        total_xp: 2400,
        current_streak: 5,
        energy: 85,
        max_energy: 100,
        last_study_date: new Date().toISOString(),
      });
    }
    
    // Add sample course if no courses exist
    if (memoryDB.courses.size === 0) {
      const sampleCourseId = 'course-sample-001';
      const sampleCourse = {
        id: sampleCourseId,
        title: '欢迎来到 OpenLearner',
        description: '这是一个示例课程，帮助你快速了解如何使用 OpenLearner 学习平台',
        icon: '🚀',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
        cover_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
        lessons: 3,
        exercises: 3,
        progress: 0,
        created_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      };
      
      const sampleChapters = [
        {
          id: `chapter-${sampleCourseId}-0`,
          course_id: sampleCourseId,
          title: '开始你的学习之旅',
          description: '了解平台基本功能',
          order_index: 1,
        },
      ];
      
      const sampleLevels = [
        {
          id: `level-${sampleCourseId}-0`,
          course_id: sampleCourseId,
          chapter_id: `chapter-${sampleCourseId}-0`,
          title: '平台介绍',
          description: '了解 OpenLearner 的基本功能',
          order_index: 1,
          status: 'available',
          steps: JSON.stringify([]),
          xp_reward: 50,
        },
        {
          id: `level-${sampleCourseId}-1`,
          course_id: sampleCourseId,
          chapter_id: `chapter-${sampleCourseId}-0`,
          title: '如何学习',
          description: '学习路径和进度追踪',
          order_index: 2,
          status: 'available',
          steps: JSON.stringify([]),
          xp_reward: 50,
        },
        {
          id: `level-${sampleCourseId}-2`,
          course_id: sampleCourseId,
          chapter_id: `chapter-${sampleCourseId}-0`,
          title: '创建你的第一个课程',
          description: '使用 AI 生成个性化课程',
          order_index: 3,
          status: 'available',
          steps: JSON.stringify([]),
          xp_reward: 100,
        },
      ];
      
      memoryDB.courses.set(sampleCourseId, sampleCourse);
      sampleChapters.forEach(ch => memoryDB.chapters.set(ch.id, ch));
      sampleLevels.forEach(lvl => memoryDB.levels.set(lvl.id, lvl));
    }
  }
}

export function getOrCreateUser(userId: string = 'user-1') {
  if (USE_SQLITE) {
    return getSqlite().getOrCreateUser(userId);
  }
  if (!memoryDB.users.has(userId)) {
    memoryDB.users.set(userId, {
      id: userId,
      total_xp: 0,
      current_streak: 0,
      energy: 100,
      max_energy: 100,
      last_study_date: null,
    });
  }
  return memoryDB.users.get(userId);
}

export function updateUserProgress(
  userId: string,
  updates: { totalXP?: number; currentStreak?: number; energy?: number; lastStudyDate?: string }
) {
  if (USE_SQLITE) {
    return getSqlite().updateUserProgress(userId, updates);
  }
  const user = getOrCreateUser(userId);
  if (updates.totalXP !== undefined) user.total_xp = updates.totalXP;
  if (updates.currentStreak !== undefined) user.current_streak = updates.currentStreak;
  if (updates.energy !== undefined) user.energy = updates.energy;
  if (updates.lastStudyDate !== undefined) user.last_study_date = updates.lastStudyDate;
  memoryDB.users.set(userId, user);
}

export function recordStudySession(
  userId: string,
  courseId: string,
  levelId: string | null,
  duration: number,
  xpEarned: number
) {
  if (USE_SQLITE) {
    getSqlite().recordStudySession(userId, courseId, levelId, duration, xpEarned);
    const user = getSqlite().getOrCreateUser(userId);
    const lastStudyDate = user.last_study_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    let newStreak = user.current_streak;
    if (lastStudyDate === today) {
    } else if (lastStudyDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
    
    getSqlite().updateUserProgress(userId, {
      totalXP: user.total_xp + xpEarned,
      currentStreak: newStreak,
      lastStudyDate: today,
    });
    
    return { streak: newStreak, xpEarned };
  }
  
  const today = new Date().toISOString().split('T')[0];
  const id = `study-${Date.now()}`;

  memoryDB.studyRecords.set(id, {
    id,
    user_id: userId,
    course_id: courseId,
    level_id: levelId,
    study_date: today,
    duration,
    xp_earned: xpEarned,
  });

  const user = getOrCreateUser(userId);
  const lastStudyDate = user.last_study_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = user.current_streak;
  if (lastStudyDate === today) {
  } else if (lastStudyDate === yesterdayStr) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  updateUserProgress(userId, {
    totalXP: user.total_xp + xpEarned,
    currentStreak: newStreak,
    lastStudyDate: today,
  });

  return { streak: newStreak, xpEarned };
}

export function hasStudiedToday(userId: string): boolean {
  if (USE_SQLITE) {
    return getSqlite().hasStudiedToday(userId);
  }
  const today = new Date().toISOString().split('T')[0];
  for (const record of memoryDB.studyRecords.values()) {
    if (record.user_id === userId && record.study_date === today) {
      return true;
    }
  }
  return false;
}

export function getStudyStats(userId: string) {
  if (USE_SQLITE) {
    return getSqlite().getStudyStats(userId);
  }
  const today = new Date().toISOString().split('T')[0];
  let todayDuration = 0;
  let todayXP = 0;
  const weekRecords: { study_date: string; duration: number }[] = [];

  for (const record of memoryDB.studyRecords.values()) {
    if (record.user_id === userId) {
      if (record.study_date === today) {
        todayDuration += record.duration;
        todayXP += record.xp_earned;
      }
      weekRecords.push({
        study_date: record.study_date,
        duration: record.duration,
      });
    }
  }

  return {
    today: {
      duration: todayDuration,
      xp: todayXP,
      hasStudied: todayDuration > 0,
    },
    week: weekRecords,
  };
}

export function saveCourse(course: Course, chapters: Chapter[], levels: Level[]) {
  if (USE_SQLITE) {
    return getSqlite().saveCourse(course, chapters, levels);
  }
  memoryDB.courses.set(course.id, {
    id: course.id,
    title: course.title,
    description: course.description,
    icon: course.icon,
    thumbnail: course.thumbnail,
    cover_image: course.coverImage,
    lessons: course.lessons,
    exercises: course.exercises,
    progress: course.progress,
    created_at: course.createdAt.toISOString(),
    last_accessed_at: course.lastAccessedAt?.toISOString(),
  });

  for (const chapter of chapters) {
    memoryDB.chapters.set(chapter.id, {
      id: chapter.id,
      course_id: course.id,
      title: chapter.title,
      description: chapter.description,
      order_index: chapter.order,
    });
  }

  for (const level of levels) {
    const infoSteps = level.steps?.filter(s => s.type === 'info') || [];
    const firstInfo = infoSteps[0];
    const secondInfo = infoSteps[1];
    
    memoryDB.levels.set(level.id, {
      id: level.id,
      course_id: course.id,
      chapter_id: level.chapterId,
      title: level.title,
      description: level.description,
      order_index: level.order,
      status: level.status,
      steps: level.steps,
      example_title: firstInfo?.title || '',
      example_scenario: firstInfo?.content?.split('\n')[0] || '',
      example_content: firstInfo?.content || '',
      example_latex: firstInfo?.visualAssets?.[0]?.latex || '',
      knowledge_title: secondInfo?.title || '',
      knowledge_content: secondInfo?.content || '',
      knowledge_latex: secondInfo?.visualAssets?.[0]?.latex || '',
      knowledge_image_prompt: '',
      xp_reward: level.xpReward,
    });
  }

  return course.id;
}

export function getCourseWithDetails(courseId: string, userId: string = 'user-1') {
  if (USE_SQLITE) {
    return getSqlite().getCourseWithDetails(courseId, userId);
  }
  const course = memoryDB.courses.get(courseId);
  if (!course) return null;

  const chapters: any[] = [];
  const levels: any[] = [];

  for (const chapter of memoryDB.chapters.values()) {
    if (chapter.course_id === courseId) {
      chapters.push(chapter);
    }
  }

  for (const level of memoryDB.levels.values()) {
    if (level.course_id === courseId) {
      levels.push(level);
    }
  }

  // Get user's completed levels
  const completedLevelIds = new Set<string>();
  for (const progress of memoryDB.userProgress.values()) {
    if (progress.user_id === userId && progress.course_id === courseId && progress.status === 'completed') {
      completedLevelIds.add(progress.level_id);
    }
  }

  chapters.sort((a, b) => a.order_index - b.order_index);
  levels.sort((a, b) => a.order_index - b.order_index);
  
  // Map levelIds to chapters
  const chaptersWithLevelIds = chapters.map(ch => ({
    ...ch,
    order: ch.order_index,
    levelIds: levels
      .filter(l => l.chapter_id === ch.id)
      .map(l => l.id)
  }));

  return { 
    course, 
    chapters: chaptersWithLevelIds, 
    levels: levels.map(lvl => ({
      ...lvl,
      order: lvl.order_index,
      xpReward: lvl.xp_reward,
      chapterId: lvl.chapter_id,
      steps: typeof lvl.steps === 'string' ? JSON.parse(lvl.steps || '[]') : lvl.steps,
      status: completedLevelIds.has(lvl.id) ? 'completed' : lvl.status
    })),
    completedLevelIds: Array.from(completedLevelIds),
  };
}

export function getAllCourses(): any[] {
  if (USE_SQLITE) {
    return getSqlite().getAllCourses();
  }
  return Array.from(memoryDB.courses.values()).sort((a, b) => {
    const dateA = a.last_accessed_at ? new Date(a.last_accessed_at) : new Date(0);
    const dateB = b.last_accessed_at ? new Date(b.last_accessed_at) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
}

export function updateLevelStatus(userId: string, courseId: string, levelId: string, status: string) {
  if (USE_SQLITE) {
    return getSqlite().updateLevelStatus(userId, courseId, levelId, status);
  }
  const id = `progress-${userId}-${levelId}`;
  memoryDB.userProgress.set(id, {
    id,
    user_id: userId,
    course_id: courseId,
    level_id: levelId,
    status,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
  });
}

export function getUserProgress(userId: string, courseId: string): string[] {
  if (USE_SQLITE) {
    return getSqlite().getUserProgress(userId, courseId);
  }
  const completed: string[] = [];
  for (const progress of memoryDB.userProgress.values()) {
    if (progress.user_id === userId && progress.course_id === courseId && progress.status === 'completed') {
      completed.push(progress.level_id);
    }
  }
  return completed;
}

export function saveCourseMaterial(courseId: string, material: string) {
  if (USE_SQLITE) {
    return getSqlite().saveCourseMaterial(courseId, material);
  }
  memoryDB.courseMaterials.set(courseId, material);
}

export function getCourseMaterial(courseId: string): string | undefined {
  if (USE_SQLITE) {
    return getSqlite().getCourseMaterial(courseId);
  }
  return memoryDB.courseMaterials.get(courseId);
}

export function saveLevelContent(levelId: string, steps: any[]) {
  if (USE_SQLITE) {
    return getSqlite().saveLevelContent(levelId, steps);
  }
  memoryDB.levelContentCache.set(levelId, {
    steps,
    timestamp: Date.now(),
  });
}

export function getLevelContent(levelId: string): { steps: any[]; timestamp: number } | undefined {
  if (USE_SQLITE) {
    return getSqlite().getLevelContent(levelId);
  }
  return memoryDB.levelContentCache.get(levelId);
}

initDatabase();
