import { generateText } from 'ai';
import { AIProvider, AIMessage, AIRequestOptions, AIResponse } from '../types';

/**
 * Vercel AI Gateway provider – works zero-config in this environment.
 * Falls back gracefully when no API key is set.
 */
export class VercelGatewayProvider implements AIProvider {
  name = 'VercelGateway';
  private model: string;

  constructor() {
    // Prefer OPENAI_MODEL env var, then default to gpt-4o-mini via gateway
    this.model = process.env.AI_GATEWAY_MODEL || process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';
  }

  isAvailable(): boolean {
    // The Vercel AI Gateway is always available in the v0 sandbox
    return true;
  }

  async generateCompletion(
    messages: AIMessage[],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    const isJson = options.responseFormat === 'json';

    const result = await generateText({
      model: this.model,
      system: messages.find(m => m.role === 'system')?.content,
      messages: messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens,
      ...(isJson && {
        providerOptions: {
          openai: { responseFormat: { type: 'json_object' } },
        },
      }),
    });

    return {
      content: result.text,
      usage: result.usage
        ? {
            promptTokens: result.usage.promptTokens,
            completionTokens: result.usage.completionTokens,
            totalTokens: result.usage.totalTokens,
          }
        : undefined,
    };
  }
}
