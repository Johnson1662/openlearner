export type InteractionType = 
  | 'multiple_choice' 
  | 'segmenter' 
  | 'connector' 
  | 'categorizer' 
  | 'info';

export interface VisualAsset {
  type: 'image' | 'diagram' | 'formula';
  src?: string;
  alt?: string;
  latex?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface LessonStep {
  id: string;
  type: InteractionType;
  title?: string;
  content: string;
  question?: string;
  hint?: string;
  options?: QuizOption[];
  correctAnswer?: string | string[];
  visualAssets?: VisualAsset[];
}

export interface Level {
  id: string;
  title: string;
  description: string;
  order: number;
  chapterId: string;
  status: 'locked' | 'available' | 'completed';
  steps: LessonStep[];
  xpReward: number;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  levelIds: string[]; // 关卡ID列表
}

export interface UserProgress {
  totalXP: number;
  currentStreak: number;
  energy: number;
  maxEnergy: number;
  completedLevels: string[];
  lastStudyDate?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 课程（学习路径）
export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  thumbnail: string; // 缩略图
  coverImage: string; // 封面大图
  lessons: number;
  exercises: number;
  chapters: Chapter[];
  levels: Level[];
  progress: number; // 0-100
  createdAt: Date;
  lastAccessedAt?: Date;
}

export interface StreakDay {
  day: string;
  label: string;
  active: boolean;
  isToday?: boolean;
}

export type PageView = 'home' | 'courses' | 'learning' | 'quiz' | 'course-detail';

// 最近学习的课程
export interface RecentCourse {
  courseId: string;
  courseTitle: string;
  thumbnail: string;
  progress: number;
  lastAccessedAt: Date;
}

export interface StudyRecord {
  id: string;
  userId: string;
  courseId: string;
  levelId?: string;
  studyDate: string;
  duration: number;
  xpEarned: number;
}
