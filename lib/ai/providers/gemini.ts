import { AIProvider, AIMessage, AIRequestOptions, AIResponse } from '../types';
import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Agent, EnvHttpProxyAgent, Dispatcher } from 'undici';
import { parseAiJson } from '../json-response';

interface DispatcherRequestInit extends RequestInit {
  dispatcher?: Dispatcher;
}

type GeminiThinkingLevel = 'minimal' | 'low' | 'medium' | 'high';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private static dispatcher: Dispatcher | null = null;
  private static fetchFn: typeof fetch | null = null;

  async generateCompletion(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    const maxRetries = options?.maxRetries ?? this.getMaxRetries();
    const stepTimeoutMs = options?.timeout?.stepMs ?? this.getStepTimeoutMs();
    const totalTimeoutMs = options?.timeout?.totalMs ?? this.getTotalTimeoutMs(stepTimeoutMs, maxRetries);

    try {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        baseURL: this.getBaseUrl(),
        fetch: this.getFetchFn(),
      });

      const modelId = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = google(modelId);
      const isJson = options?.responseFormat === 'json';
      const thinkingConfig = this.getSafeThinkingConfig(modelId, isJson);
      const system = messages.find(m => m.role === 'system')?.content;
      const modelMessages = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }));

      if (isJson) {
        try {
          const { object, usage } = await generateObject({
            model,
            system,
            messages: modelMessages,
            output: 'no-schema',
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens ?? 2000,
            maxRetries,
            timeout: {
              totalMs: totalTimeoutMs,
              stepMs: stepTimeoutMs,
            },
            providerOptions: {
              google: {
                structuredOutputs: true,
                thinkingConfig,
              },
            },
            abortSignal: options?.abortSignal,
          });

          return {
            content: JSON.stringify(object),
            usage: {
              totalTokens: usage.totalTokens,
              promptTokens: usage.inputTokens,
              completionTokens: usage.outputTokens,
            },
          };
        } catch (jsonError) {
          if (!this.isJsonGenerationFailure(jsonError)) {
            throw jsonError;
          }

          const { text, usage } = await generateText({
            model,
            system,
            messages: modelMessages,
            temperature: options?.temperature ?? 0.6,
            maxOutputTokens: Math.max(options?.maxTokens ?? 1200, 1200),
            maxRetries: 0,
            timeout: {
              totalMs: totalTimeoutMs,
              stepMs: stepTimeoutMs,
            },
            providerOptions: {
              google: {
                structuredOutputs: true,
                thinkingConfig,
              },
            },
            abortSignal: options?.abortSignal,
          });

          const repairedObject = parseAiJson<unknown>(text || '{}');
          return {
            content: JSON.stringify(repairedObject),
            usage: {
              totalTokens: usage.totalTokens,
              promptTokens: usage.inputTokens,
              completionTokens: usage.outputTokens,
            },
          };
        }
      }

      const { text, usage } = await generateText({
        model,
        system,
        messages: modelMessages,
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2000,
        maxRetries,
        timeout: {
          totalMs: totalTimeoutMs,
          stepMs: stepTimeoutMs,
        },
        providerOptions: {
          google: {
            thinkingConfig,
          },
        },
        abortSignal: options?.abortSignal,
      });

      return {
        content: text,
        usage: {
          totalTokens: usage.totalTokens,
          promptTokens: usage.inputTokens,
          completionTokens: usage.outputTokens,
        },
      };
    } catch (error: unknown) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini failed: ${this.getErrorMessage(error)}`);
    }
  }

  isAvailable(): boolean {
    return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  }

  private getSafeThinkingConfig(modelId: string, isJson: boolean): {
    includeThoughts: boolean;
    thinkingBudget?: number;
    thinkingLevel?: GeminiThinkingLevel;
  } {
    const includeThoughts = process.env.GEMINI_INCLUDE_THOUGHTS === 'true';
    const budgetFromEnv = this.getThinkingBudgetFromEnv();
    const levelFromEnv = this.getThinkingLevelFromEnv();
    const isGemini3 = modelId.toLowerCase().startsWith('gemini-3');

    if (budgetFromEnv !== undefined) {
      return {
        includeThoughts,
        thinkingBudget: budgetFromEnv,
      };
    }

    if (levelFromEnv && isGemini3) {
      return {
        includeThoughts,
        thinkingLevel: levelFromEnv,
      };
    }

    if (isJson) {
      return {
        includeThoughts: false,
        thinkingBudget: 0,
      };
    }

    return {
      includeThoughts,
      thinkingBudget: 0,
    };
  }

  private getThinkingBudgetFromEnv(): number | undefined {
    const raw = process.env.GEMINI_THINKING_BUDGET;
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      return undefined;
    }

    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }

    return 0;
  }

  private getThinkingLevelFromEnv(): GeminiThinkingLevel | undefined {
    const raw = process.env.GEMINI_THINKING_LEVEL?.trim().toLowerCase();
    if (raw === 'minimal' || raw === 'low' || raw === 'medium' || raw === 'high') {
      return raw;
    }

    return undefined;
  }

  private getStepTimeoutMs(): number {
    const stepParsed = Number(process.env.GEMINI_STEP_TIMEOUT_MS);
    if (Number.isFinite(stepParsed) && stepParsed > 0) {
      return stepParsed;
    }

    const legacyParsed = Number(process.env.GEMINI_TIMEOUT_MS);
    if (Number.isFinite(legacyParsed) && legacyParsed > 0) {
      return legacyParsed;
    }

    return 120000;
  }

  private getBaseUrl(): string | undefined {
    const value = process.env.GEMINI_BASE_URL?.trim();
    return value ? value : undefined;
  }

  private getConnectTimeoutMs(): number {
    const parsed = Number(process.env.GEMINI_CONNECT_TIMEOUT_MS);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30000;
  }

  private getFetchFn(): typeof fetch {
    if (GeminiProvider.fetchFn) {
      return GeminiProvider.fetchFn;
    }

    const dispatcher = this.getDispatcher();
    GeminiProvider.fetchFn = (input: RequestInfo | URL, init?: RequestInit) => {
      const requestInit: DispatcherRequestInit = {
        ...init,
        dispatcher,
      };

      return fetch(input, requestInit);
    };

    return GeminiProvider.fetchFn;
  }

  private getDispatcher(): Dispatcher {
    if (GeminiProvider.dispatcher) {
      return GeminiProvider.dispatcher;
    }

    const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;

    if (httpProxy || httpsProxy) {
      GeminiProvider.dispatcher = new EnvHttpProxyAgent({
        httpProxy,
        httpsProxy,
        noProxy,
        connectTimeout: this.getConnectTimeoutMs(),
        autoSelectFamily: true,
      });
      return GeminiProvider.dispatcher;
    }

    GeminiProvider.dispatcher = new Agent({
      connectTimeout: this.getConnectTimeoutMs(),
      autoSelectFamily: true,
    });

    return GeminiProvider.dispatcher;
  }

  private getTotalTimeoutMs(stepTimeoutMs: number, maxRetries: number): number {
    const parsed = Number(process.env.GEMINI_TOTAL_TIMEOUT_MS);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }

    return stepTimeoutMs * Math.max(1, maxRetries + 1) + 5000;
  }

  private getMaxRetries(): number {
    const parsed = Number(process.env.GEMINI_MAX_RETRIES);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 2;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return String(error);
  }

  private isJsonGenerationFailure(error: unknown): boolean {
    const message = this.getErrorMessage(error).toLowerCase();
    return message.includes('no object generated')
      || message.includes('json parsing failed')
      || message.includes('expected double-quoted property name')
      || message.includes('unterminated string')
      || message.includes('finishreason')
      || message.includes('could not parse the response');
  }
}
