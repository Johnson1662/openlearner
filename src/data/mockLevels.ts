import { Level, Course, Chapter, UserProgress, RecentCourse } from '@/types';

export const mockChapters: Chapter[] = [];

export const mockLevels: Level[] = [];

export const mockCourses: Course[] = [];

export const mockUserProgress: UserProgress = {
  totalXP: 0,
  currentStreak: 0,
  energy: 100,
  maxEnergy: 100,
  completedLevels: [],
  lastStudyDate: null,
};

export const mockRecentCourses: RecentCourse[] = [];

export const mockAIResponses: Record<string, string> = {
  hint: '',
  explain: '',
};

export function getStreakDays(_currentStreak?: number, _lastStudyDate?: string): { day: string; label: string; active: boolean; isToday?: boolean }[] {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();
  
  return days.map((day, index) => ({
    day,
    label: day,
    active: index < today,
    isToday: index === today,
  }));
}
