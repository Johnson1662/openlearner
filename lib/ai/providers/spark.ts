import { AIProvider, AIMessage, AIRequestOptions, AIResponse } from '../types';

export class SparkProvider implements AIProvider {
  name = 'Xunfei Spark';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.SPARK_API_KEY || '';
    this.baseUrl = process.env.SPARK_BASE_URL || 'https://maas-api.cn-huabei-1.xf-yun.com/v2';
    this.defaultModel = process.env.SPARK_MODEL || 'xopkimik25';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateCompletion(
    messages: AIMessage[],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error('Spark API key is not configured. Set SPARK_API_KEY in your environment.');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Spark API error: ${error}`);
    }

    const data = await response.json();
    
    let content = data.choices[0]?.message?.content || '';

    if (options.responseFormat === 'json' && content) {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/{[\s\S]*}/);
      if (jsonMatch) {
        content = jsonMatch[1] || jsonMatch[0];
      }
    }
    
    return {
      content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }
}
