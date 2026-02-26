import { AIProvider } from '../types';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { AzureOpenAIProvider } from './azure';
import { GenericOpenAIProvider } from './generic';
import { SparkProvider } from './spark';

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();

  static getProvider(): AIProvider {
    const providerType = process.env.AI_PROVIDER?.toLowerCase() || 'openai';

    if (this.providers.has(providerType)) {
      return this.providers.get(providerType)!;
    }

    let provider: AIProvider;

    switch (providerType) {
      case 'anthropic':
      case 'claude':
        provider = new AnthropicProvider();
        break;

      case 'azure':
      case 'azure-openai':
        provider = new AzureOpenAIProvider();
        break;

      case 'spark':
      case 'xunfei':
      case 'xfyun':
        provider = new SparkProvider();
        break;

      case 'generic':
      case 'custom':
        provider = new GenericOpenAIProvider();
        break;

      case 'openai':
      default:
        provider = new OpenAIProvider();
        break;
    }

    this.providers.set(providerType, provider);
    return provider;
  }

  static getAvailableProviders(): string[] {
    const providers = [
      { name: 'OpenAI', available: new OpenAIProvider().isAvailable() },
      { name: 'Anthropic (Claude)', available: new AnthropicProvider().isAvailable() },
      { name: 'Azure OpenAI', available: new AzureOpenAIProvider().isAvailable() },
      { name: 'Xunfei Spark', available: new SparkProvider().isAvailable() },
      { name: 'Generic OpenAI-compatible', available: new GenericOpenAIProvider().isAvailable() },
    ];

    return providers
      .filter(p => p.available)
      .map(p => p.name);
  }
}
