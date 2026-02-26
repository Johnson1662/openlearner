import { AIProviderFactory } from './providers';
import {
  CourseGenerationInput,
  GeneratedChapter,
  GeneratedLevel,
  GeneratedCourse,
  AIMessage
} from './types';

async function generateCourseOutline(
  material: string,
  title?: string,
  difficulty: string = 'intermediate'
): Promise<GeneratedCourse> {
  const provider = AIProviderFactory.getProvider();

  if (!provider.isAvailable()) {
    throw new Error(`AI provider ${provider.name} is not configured`);
  }

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: '你是一个课程设计专家。快速生成课程大纲，只输出章节和关卡标题。输出必须是有效的JSON格式。',
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
3. 每个关卡只需要title、description和xpReward
4. 不需要生成详细内容

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
      "order": 1
    }
  ],
  "levels": [
    {
      "title": "关卡标题",
      "description": "关卡描述",
      "order": 1,
      "chapterIndex": 0,
      "xpReward": 100,
      "quiz": []
    }
  ]
}`,
    },
  ];

  const response = await provider.generateCompletion(messages, {
    temperature: 0.7,
    maxTokens: 2000,
    responseFormat: 'json',
  });

  const content = response.content;
  if (!content) {
    throw new Error('Failed to generate course structure');
  }

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
    return {
      title: result.title || title || '未命名课程',
      description: result.description || '由AI生成的个性化课程',
      icon: result.icon || '📚',
      thumbnail: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop`,
      coverImage: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop`,
      chapters: result.chapters || [],
      levels: result.levels || [],
      estimatedLessons: result.levels?.length || 0,
      estimatedExercises: result.levels?.length * 2 || 0,
    };
  } catch (parseError: any) {
    let fixedContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
    try {
      const result = JSON.parse(fixedContent);
      return {
        title: result.title || title || '未命名课程',
        description: result.description || '由AI生成的个性化课程',
        icon: result.icon || '📚',
        thumbnail: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop`,
        coverImage: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop`,
        chapters: result.chapters || [],
        levels: result.levels || [],
        estimatedLessons: result.levels?.length || 0,
        estimatedExercises: result.levels?.length * 2 || 0,
      };
    } catch (fixError) {
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  }
}

export async function generateCourse(input: CourseGenerationInput): Promise<GeneratedCourse> {
  const provider = AIProviderFactory.getProvider();

  if (!provider.isAvailable()) {
    throw new Error(`AI provider ${provider.name} is not configured`);
  }

  try {
    return await generateCourseOutline(input.material, input.title, input.difficulty);
  } catch (error) {
    console.error('Error generating course:', error);
    throw error;
  }
}

export async function generateHint(question: string, userAttempt?: string): Promise<string> {
  const provider = AIProviderFactory.getProvider();

  if (!provider.isAvailable()) {
    return 'AI助手暂时不可用，请稍后重试。';
  }

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: '你是一个耐心的学习助手，擅长给出启发性的提示。',
    },
    {
      role: 'user',
      content: `
问题: ${question}
${userAttempt ? `用户的尝试: ${userAttempt}` : ''}

请提供一个简短的提示(2-3句话)，帮助用户理解如何解决这个问题，但不要直接给出答案。`,
    },
  ];

  const response = await provider.generateCompletion(messages, {
    temperature: 0.7,
    maxTokens: 150,
  });

  return response.content || '暂无提示可用。';
}

export async function generateExplanation(content: string): Promise<string> {
  const provider = AIProviderFactory.getProvider();

  if (!provider.isAvailable()) {
    return 'AI助手暂时不可用，请稍后重试。';
  }

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: '你是一个知识渊博的教育专家，擅长用简单易懂的方式解释复杂概念。',
    },
    {
      role: 'user',
      content: `请解释以下概念，使用通俗易懂的语言，并举例说明:

${content}`,
    },
  ];

  const response = await provider.generateCompletion(messages, {
    temperature: 0.7,
    maxTokens: 500,
  });

  return response.content || '暂无解释可用。';
}

export * from './types';
export { AIProviderFactory } from './providers';
