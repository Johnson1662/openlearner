import { Course, UserProgress, StudyRecord } from '@/types';

const API_BASE = '/api';

export async function fetchUserData(userId: string = 'user-1') {
  const response = await fetch(`${API_BASE}/user?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
}

export async function fetchCourses() {
  const response = await fetch(`${API_BASE}/courses`);
  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
}

export async function fetchCourseDetails(courseId: string, userId: string = 'user-1') {
  const response = await fetch(`${API_BASE}/courses?id=${courseId}&userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch course details');
  return response.json();
}

export async function recordStudySession(
  userId: string,
  courseId: string,
  levelId: string | null,
  duration: number,
  xpEarned: number
) {
  const response = await fetch(`${API_BASE}/study`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, courseId, levelId, duration, xpEarned }),
  });
  if (!response.ok) throw new Error('Failed to record study session');
  return response.json();
}

export async function fetchStudyStats(userId: string = 'user-1') {
  const response = await fetch(`${API_BASE}/study?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch study stats');
  return response.json();
}

export async function checkTodayStudy(userId: string = 'user-1') {
  const response = await fetch(`${API_BASE}/study?userId=${userId}&type=today`);
  if (!response.ok) throw new Error('Failed to check today study');
  return response.json();
}

export async function updateProgress(
  userId: string,
  courseId: string,
  levelId: string,
  status: 'locked' | 'available' | 'completed',
  xpEarned?: number
) {
  const response = await fetch(`${API_BASE}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, courseId, levelId, status, xpEarned }),
  });
  if (!response.ok) throw new Error('Failed to update progress');
  return response.json();
}

export async function fetchProgress(userId: string, courseId: string) {
  const response = await fetch(`${API_BASE}/progress?userId=${userId}&courseId=${courseId}`);
  if (!response.ok) throw new Error('Failed to fetch progress');
  return response.json();
}

export async function generateCourse(
  material: string,
  title?: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
) {
  const response = await fetch(`${API_BASE}/ai/generate-course`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ material, title, difficulty }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate course');
  }
  return response.json();
}

export async function getAIHint(question: string, attempt?: string) {
  const response = await fetch(`${API_BASE}/user?action=hint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, attempt }),
  });
  if (!response.ok) throw new Error('Failed to get hint');
  const data = await response.json();
  return data.hint;
}

export async function getAIExplanation(content: string) {
  const response = await fetch(`${API_BASE}/user?action=explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to get explanation');
  const data = await response.json();
  return data.explanation;
}
