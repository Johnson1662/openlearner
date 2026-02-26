import { generateText } from 'ai';
import { AIProvider, AIMessage, AIRequestOptions, AIResponse } from '../types';

/**
 * Vercel AI Gateway provider — uses the AI SDK's built-in gateway.
 * No API key required; just set AI_GATEWAY_API_KEY in the environment.
 * Supports any model string like "openai/gpt-4o", "anthropic/claude-opus-4.6", etc.
 */
export class VercelGatewayProvider implements AIProvider {
  name = 'Vercel AI Gateway';
  private model: string;

  constructor() {
    this.model =
      process.env.AI_GATEWAY_MODEL ||
      process.env.OPENAI_MODEL ||
      'openai/gpt-4o-mini';
  }

  isAvailable(): boolean {
    // The Vercel AI Gateway works in v0 preview without a key;
    // in production it requires AI_GATEWAY_API_KEY.
    return true;
  }

  async generateCompletion(
    messages: AIMessage[],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    const modelId = options.model || this.model;

    const result = await generateText({
      model: modelId as any,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens,
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
