import { AIProviderFactory } from './providers';
import { AIMessage } from './types';
import { LessonStep } from '@/types';

export interface LevelContentInput {
  levelTitle: string;
  levelDescription: string;
  chapterTitle: string;
  material: string;
  difficulty: string;
  userFeedback?: {
    difficulty: 'too_hard' | 'just_right' | 'too_easy' | null;
    feedbackText: string;
  };
  previousAnswers?: {
    stepId: string;
    answer: string;
    isCorrect: boolean;
  }[];
}

function adjustDifficulty(baseDifficulty: string, feedback?: { difficulty: 'too_hard' | 'just_right' | 'too_easy' | null }): string {
  if (!feedback || !feedback.difficulty) return baseDifficulty === 'beginner' ? '初级' : baseDifficulty === 'advanced' ? '高级' : '中级';
  
  const diff = feedback.difficulty;
  if (diff === 'too_hard') {
    return baseDifficulty === 'advanced' ? '中级' : '初级';
  } else if (diff === 'too_easy') {
    return baseDifficulty === 'beginner' ? '中级' : '高级';
  }
  return baseDifficulty === 'beginner' ? '初级' : baseDifficulty === 'advanced' ? '高级' : '中级';
}

export async function generateLevelContent(input: LevelContentInput): Promise<LessonStep[]> {
  const provider = AIProviderFactory.getProvider();

  if (!provider.isAvailable()) {
    throw new Error(`AI provider ${provider.name} is not configured`);
  }

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: '你根据材料生成学习关卡内容。输出必须是有效的JSON格式。支持HTML、LaTeX公式和SVG动画。',
    },
    {
      role: 'user',
      content: `
根据以下材料生成一个学习关卡的详细内容。

关卡标题: ${input.levelTitle}
关卡描述: ${input.levelDescription}
章节: ${input.chapterTitle}
${input.userFeedback ? `
用户反馈:
- 难度评价: ${input.userFeedback.difficulty === 'too_hard' ? '太难了' : input.userFeedback.difficulty === 'too_easy' ? '太简单了' : '刚刚好'}
- 详细反馈: ${input.userFeedback.feedbackText || '无'}
` : ''}
${input.previousAnswers && input.previousAnswers.length > 0 ? `
用户上一关答题情况:
${input.previousAnswers.map(a => `- ${a.stepId}: ${a.answer} (${a.isCorrect ? '正确' : '错误'})`).join('\n')}
` : ''}
难度: ${adjustDifficulty(input.difficulty, input.userFeedback)}

相关材料:
${input.material}

生成内容要求:
1. 2-4个学习步骤(steps)
2. 第一步通常是 info 类型介绍概念
3. 中间步骤可以是 info 或 multiple_choice
4. 最后一步建议是 multiple_choice 用于检验学习
5. content 字段支持HTML、LaTeX公式和SVG动画
6. 使用 $formula$ 表示行内公式，$$formula$$ 表示行间公式
7. 可以嵌入SVG动画来解释概念
8. 可以使用HTML表格来展示信息

示例：
{
  "steps": [
    {
      "id": "step-1",
      "type": "info",
      "title": "梯度下降原理",
      "content": "梯度下降优化公式：$$\\theta_{new} = \\theta_{old} - \\alpha \\nabla J(\\theta)$$\\n\\n其中 $\\alpha$ 是学习率，$\\nabla J(\\theta)$ 是目标函数的梯度。"
    },
    {
      "id": "step-2",
      "type": "info",
      "title": "神经网络结构",
      "content": "<table>\\n<tr><th>层</th><th>神经元数</th></tr>\\n<tr><td>输入层</td><td>784</td></tr>\\n<tr><td>隐藏层</td><td>128</td></tr>\\n<tr><td>输出层</td><td>10</td></tr>\\n</table>"
    },
    {
      "id": "step-3",
      "type": "multiple_choice",
      "title": "梯度下降检验",
      "content": "根据以下SVG动画回答问题：<svg width=\\"200\\" height=\\"100\\" data-animated>\\n<circle cx=\\"50\\" cy=\\"50\\" r=\\"30\\" fill=\\"blue\\">\\n<animate attributeName=\\"cx\\" from=\\"50\\" to=\\"150\\" dur=\\"2s\\" repeatCount=\\"indefinite\\"/>\\n</circle>\\n</svg>",
      "question": "图中圆圈在做什么运动？",
      "options": [
        {"id": "a", "text": "上下运动", "isCorrect": false},
        {"id": "b", "text": "左右运动", "isCorrect": true},
        {"id": "c", "text": "圆形旋转", "isCorrect": false},
        {"id": "d", "text": "静止不动", "isCorrect": false}
      ],
      "hint": "观察 cx 属性的变化"
    }
  ]
}

禁止:
- 不要使用比喻和类比
- 直接陈述知识点
- 使用材料中的实际内容

输出格式:
{
  "steps": [
    {
      "id": "step-1",
      "type": "info",
      "title": "步骤标题",
      "content": "步骤内容（支持HTML、LaTeX、SVG）"
    },
    {
      "id": "step-2",
      "type": "multiple_choice",
      "title": "问题标题",
      "content": "问题描述",
      "question": "问题",
      "options": [
        {"id": "a", "text": "选项A", "isCorrect": false},
        {"id": "b", "text": "选项B", "isCorrect": true}
      ],
      "hint": "提示"
    }
  ]
}
`,
    },
  ];

  const response = await provider.generateCompletion(messages, {
    temperature: 0.7,
    maxTokens: 4000,
    responseFormat: 'json',
  });

  const content = response.content;
  if (!content) {
    throw new Error('Failed to generate level content');
  }

  let jsonContent = content;

  const jsonMatch = content.match(/\`\`\`json\n?([\s\S]*?)\n?\`\`\`/);
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
    return result.steps;
  } catch (parseError: any) {
    let fixedContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
    try {
      const result = JSON.parse(fixedContent);
      return result.steps;
    } catch (fixError) {
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  }
}
