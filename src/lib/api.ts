import { Course, UserProgress, StudyRecord, GenerateCourseResponse, GenerateLevelResponse, ParseMaterialResponse } from '@/types';

// 后端服务地址 (FastAPI 运行在 8000 端口)
// 开发环境指向本地后端，生产环境可通过环境变量配置
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

// AI 相关接口使用后端
const AI_API_BASE = `${BACKEND_URL}`;

// 其他接口暂时保留使用前端 API (后续可迁移到后端)
const API_BASE = '/api';

export async function fetchUserData(userId: string = 'user-1') {
  const response = await fetch(`${API_BASE}/user?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
}

export async function fetchCourses() {
  const response = await fetch(`${AI_API_BASE}/api/courses`);
  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
}

export async function fetchCourseDetails(courseId: string, userId: string = 'user-1') {
  const response = await fetch(`${AI_API_BASE}/api/courses/${courseId}`);
  if (!response.ok) throw new Error('Failed to fetch course details');
  return response.json();
}

export async function saveCourseApi(
  course: any, 
  chapters: any[], 
  levels: any[],
  material: string
) {
  const response = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ course, chapters, levels, material }),
  });
  if (!response.ok) throw new Error('Failed to save course');
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

export interface GenerateCourseParams {
  material: string;
  title?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  subject?: string;
  priorKnowledge?: 'beginner' | 'intermediate' | 'advanced';
  learningGoal?: 'professional' | 'exam' | 'hobby';
  learningPacing?: 'fast' | 'balanced' | 'thorough';
  materialSourceType?: 'paste' | 'pdf' | 'url';
}

// AI 相关接口 - 使用后端服务
export async function generateCourse(params: GenerateCourseParams): Promise<GenerateCourseResponse> {
  const response = await fetch(`${AI_API_BASE}/ai/generate-course`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate course');
  }
  return response.json();
}

/**
 * 生成关卡内容
 */
export async function generateLevel(params: {
  courseId?: string;
  levelId: string;
  levelTitle: string;
  levelDescription: string;
  chapterTitle?: string;
  difficulty?: string;
  depth?: string;
  material?: string;
  userFeedback?: string;
  previousAnswers?: Array<{ stepId: string; answer: string; isCorrect: boolean }>;
}): Promise<GenerateLevelResponse> {
  const response = await fetch(`${AI_API_BASE}/ai/generate-level`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate level');
  }
  return response.json();
}

/**
 * 流式生成关卡内容 (SSE EventSource)
 * 
 * 后端返回以下事件类型:
 * - step: 包含 { step, message, progress }
 * - content: 包含 { steps } - 最终生成的关卡内容
 * - error: 包含 { message } - 错误信息
 */
export function generateLevelStream(
  courseId: string,
  levelId: string,
  depth: string = 'concept',
  onEvent: (event: { type: string; data: any }) => void
): EventSource {
  const url = `${AI_API_BASE}/ai/generate-level/stream/${encodeURIComponent(courseId)}/${encodeURIComponent(levelId)}?depth=${depth}`;
  
  const eventSource = new EventSource(url);
  
  eventSource.addEventListener('step', (event: Event) => {
    try {
      const messageEvent = event as MessageEvent<string>;
      const data = JSON.parse(messageEvent.data);
      onEvent({ type: 'step', data });
    } catch (e) {
      console.error('Failed to parse step event:', e);
    }
  });
  
  eventSource.addEventListener('content', (event: Event) => {
    try {
      const messageEvent = event as MessageEvent<string>;
      const data = JSON.parse(messageEvent.data);
      onEvent({ type: 'content', data });
    } catch (e) {
      console.error('Failed to parse content event:', e);
    }
  });
  
  eventSource.addEventListener('error', (event: Event) => {
    if (event instanceof Event && !(event instanceof MessageEvent)) {
      onEvent({ type: 'error', data: { message: 'SSE connection error' } });
    } else {
      try {
        const messageEvent = event as MessageEvent<string>;
        const data = JSON.parse(messageEvent.data);
        onEvent({ type: 'error', data });
      } catch (e) {
        console.error('Failed to parse error event:', e);
      }
    }
  });
  
  eventSource.onerror = () => {
    onEvent({ type: 'error', data: { message: 'SSE connection lost' } });
    eventSource.close();
  };
  
  return eventSource;
}

/**
 * PDF 解析（后端 Python + OCR 引擎）
 */
export async function parseMaterialFromPDF(file: File): Promise<ParseMaterialResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${AI_API_BASE}/ai/parse-material`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'PDF 解析失败');
  }
  
  const result = await response.json();
  // 后端返回 { success: true, data: { content, filename } }
  return {
    text: result.data?.content || '',
    title: result.data?.filename
  };
}

export async function parseMaterialFromURL(url: string): Promise<ParseMaterialResponse> {
  const response = await fetch(`${AI_API_BASE}/ai/parse-material`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '网页内容提取失败');
  }
  const result = await response.json();
  // 后端返回 { success: true, data: { content, url } }
  return {
    text: result.data?.content || ''
  };
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

export async function clearGeneratedLevelContent(): Promise<{ levelsCleared: number; cacheEntriesCleared: number }> {
  const response = await fetch(`${AI_API_BASE}/api/admin/clear-level-content`, {
    method: 'POST',
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to clear generated level content');
  }

  return {
    levelsCleared: result.data?.levelsCleared || 0,
    cacheEntriesCleared: result.data?.cacheEntriesCleared || 0,
  };
}

export async function deleteCourseApi(courseId: string): Promise<void> {
  const response = await fetch(`${AI_API_BASE}/api/courses/${courseId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete course');
  }
}
