export interface AIResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  name: string;
  generateCompletion(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse>;
  isAvailable(): boolean;
}

export interface CourseGenerationInput {
  title?: string;
  material: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface GeneratedChapter {
  title: string;
  description: string;
  order: number;
}

export interface GeneratedLevel {
  title: string;
  description: string;
  order: number;
  chapterIndex: number;
  example: {
    title: string;
    scenario: string;
    content: string;
    latex?: string;
  };
  knowledgePoint: {
    title: string;
    content: string;
    latex?: string;
    imagePrompt?: string;
  };
  quiz: {
    type: 'multiple_choice' | 'fill_blank' | 'short_answer';
    question: string;
    latex?: string;
    hint?: string;
    options?: { id: string; text: string; isCorrect: boolean }[];
    correctAnswer?: string;
  }[];
  xpReward: number;
}

export interface GeneratedCourse {
  title: string;
  description: string;
  icon: string;
  thumbnail: string;
  coverImage: string;
  chapters: GeneratedChapter[];
  levels: GeneratedLevel[];
  estimatedLessons: number;
  estimatedExercises: number;
}
