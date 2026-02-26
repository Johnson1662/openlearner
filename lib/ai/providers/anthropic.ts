import { AIProvider, AIMessage, AIRequestOptions, AIResponse } from '../types';

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
    this.defaultModel = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateCompletion(
    messages: AIMessage[],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error('Anthropic API key is not configured');
    }

    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        system: systemMessage?.content,
        messages: userMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    
    let content = '';
    if (Array.isArray(data.content)) {
      content = data.content.map((c: any) => c.text || '').join('');
    } else {
      content = data.content?.text || '';
    }

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
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
      } : undefined,
    };
  }
}
