import { AIProviderFactory } from './providers';
import {
  CourseGenerationInput,
  GeneratedChapter,
  GeneratedLevel,
  GeneratedCourse,
  AIMessage
} from './types';
import { isLikelyNetworkTimeout } from './network-timeout';
import { parseAiJson } from './json-response';

function isLikelyJsonGenerationFailure(details: string): boolean {
  const normalized = details.toLowerCase();
  return normalized.includes('no object generated')
    || normalized.includes('json parsing failed')
    || normalized.includes('failed to parse ai response')
    || normalized.includes('expected double-quoted property name')
    || normalized.includes('unterminated string')
    || normalized.includes('could not parse the response');
}

function generateOfflineCourseOutline(material: string, title?: string): GeneratedCourse {
  const snippets = material
    .split(/[\n。！？.!?]/)
    .map(item => item.trim())
    .filter(item => item.length >= 6)
    .slice(0, 9);

  const pick = (index: number, fallback: string) => {
    const value = snippets[index] || fallback;
    return value.length > 24 ? `${value.slice(0, 24)}...` : value;
  };

  const chapterTitles = [
    pick(0, '基础概念'),
    pick(1, '核心方法'),
    pick(2, '实践应用'),
  ];

  const chapters: GeneratedChapter[] = chapterTitles.map((chapterTitle, idx) => ({
    title: `第${idx + 1}章：${chapterTitle}`,
    description: `围绕${chapterTitle}建立可执行的知识框架。`,
    order: idx + 1,
  }));

  const levels: GeneratedLevel[] = chapters.flatMap((chapter, chapterIndex) => {
    return [
      {
        title: `${chapter.title} - 核心要点`,
        description: '梳理关键概念与常见误区。',
        order: chapterIndex * 2 + 1,
        chapterIndex,
        xpReward: 90,
        example: { title: '', scenario: '', content: '' },
        knowledgePoint: { title: '', content: '' },
        quiz: [],
      },
      {
        title: `${chapter.title} - 实战练习`,
        description: '通过练习强化理解并形成输出。',
        order: chapterIndex * 2 + 2,
        chapterIndex,
        xpReward: 110,
        example: { title: '', scenario: '', content: '' },
        knowledgePoint: { title: '', content: '' },
        quiz: [],
      },
    ];
  });

  return {
    title: title || pick(0, '学习主题课程'),
    description: '当前网络不可达，已使用本地降级方案生成课程骨架。',
    icon: '📚',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
    chapters,
    levels,
    estimatedLessons: levels.length,
    estimatedExercises: levels.length * 2,
  };
}

function buildOutlineMessages(
  material: string,
  difficulty: string,
  userContext: string,
  title?: string,
  learningPacing?: string,
  priorKnowledge?: string,
  compactMode: boolean = false,
): AIMessage[] {
  const materialLimit = compactMode ? 700 : 1200;
  const chapterRule = compactMode ? '生成2-3个章节' : '生成3-4个章节';
  const levelRule = compactMode ? '每个章节包含2-3个关卡' : '每个章节包含2-4个关卡';

  return [
    {
      role: 'system',
      content: '你是一个课程设计专家。快速生成课程大纲，只输出章节和关卡标题。输出必须是有效的JSON格式，禁止使用```json代码块。',
    },
    {
      role: 'user',
      content: `
根据以下学习材料快速生成课程大纲（只生成章节和关卡标题，不生成详细内容）。

${title ? `指定标题: ${title}` : '请根据内容生成标题'}
难度: ${difficulty === 'beginner' ? '初级' : difficulty === 'advanced' ? '高级' : '中级'}

${userContext ? `学习者信息:\n${userContext}` : ''}

材料内容（前${materialLimit}字符）:
${material.slice(0, materialLimit)}

要求:
1. ${chapterRule}
2. ${levelRule}
3. 每个关卡只需要title、description和xpReward
4. 不需要生成详细内容
${learningPacing === 'slow' ? '5. 内容应更详细，步骤更细致' : ''}
${learningPacing === 'fast' ? '5. 内容应更精简，突出重点' : ''}
${priorKnowledge ? `6. 基于学习者的先前知识调整内容深度` : ''}

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
}

async function generateCourseOutline(
  material: string,
  title?: string,
  difficulty: string = 'intermediate',
  subject?: string,
  priorKnowledge?: string,
  learningGoal?: string,
  learningPacing?: string,
  abortSignal?: AbortSignal
): Promise<GeneratedCourse> {
  const provider = AIProviderFactory.getProvider();

  if (!provider.isAvailable()) {
    throw new Error(`AI provider ${provider.name} is not configured`);
  }

  // Build user context based on provided parameters
  let userContext = '';
  if (subject) {
    userContext += `学科/主题: ${subject}\n`;
  }
  if (priorKnowledge) {
    userContext += `学习者的先前知识: ${priorKnowledge}\n`;
  }
  if (learningGoal) {
    userContext += `学习目标: ${learningGoal}\n`;
  }
  if (learningPacing) {
    const pacingLabel = learningPacing === 'slow' ? '慢速' : learningPacing === 'fast' ? '快速' : '适中';
    userContext += `学习进度: ${pacingLabel}\n`;
  }

  const primaryMessages = buildOutlineMessages(
    material,
    difficulty,
    userContext,
    title,
    learningPacing,
    priorKnowledge,
    false,
  );

  let response;
  try {
    response = await provider.generateCompletion(primaryMessages, {
      temperature: 0.6,
      maxTokens: 900,
      responseFormat: 'json',
      abortSignal,
      maxRetries: 0,
      timeout: {
        stepMs: 28000,
        totalMs: 34000,
      },
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    if (!isLikelyNetworkTimeout(details) && !isLikelyJsonGenerationFailure(details)) {
      throw error;
    }

    const fallbackMessages = buildOutlineMessages(
      material,
      difficulty,
      userContext,
      title,
      learningPacing,
      priorKnowledge,
      true,
    );

    try {
      response = await provider.generateCompletion(fallbackMessages, {
        temperature: 0.4,
        maxTokens: 600,
        responseFormat: 'json',
        abortSignal,
        maxRetries: 0,
        timeout: {
          stepMs: 20000,
          totalMs: 24000,
        },
      });
    } catch (fallbackError) {
      const fallbackDetails = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      if (!isLikelyNetworkTimeout(fallbackDetails) && !isLikelyJsonGenerationFailure(fallbackDetails)) {
        throw fallbackError;
      }

      if ((process.env.AI_NETWORK_FALLBACK_PROVIDER || '').toLowerCase() === 'none') {
        throw fallbackError;
      }

      return generateOfflineCourseOutline(material, title);
    }
  }

  const content = response.content;
  if (!content) {
    throw new Error('Failed to generate course structure');
  }

  let result: Partial<GeneratedCourse>;
  try {
    result = parseAiJson<Partial<GeneratedCourse>>(content);
  } catch (error) {
    console.error('Failed to parse generated course outline JSON:', error);
    if ((process.env.AI_NETWORK_FALLBACK_PROVIDER || '').toLowerCase() === 'none') {
      throw error;
    }

    return generateOfflineCourseOutline(material, title);
  }

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
}

export async function generateCourse(input: CourseGenerationInput): Promise<GeneratedCourse> {
  const provider = AIProviderFactory.getProvider();

  if (!provider.isAvailable()) {
    throw new Error(`AI provider ${provider.name} is not configured`);
  }

  try {
    return await generateCourseOutline(
      input.material,
      input.title,
      input.difficulty,
      input.subject,
      input.priorKnowledge,
      input.learningGoal,
      input.learningPacing,
      input.abortSignal
    );
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
