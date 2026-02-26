import { AIProvider } from '../types';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { AzureOpenAIProvider } from './azure';
import { GenericOpenAIProvider } from './generic';
import { SparkProvider } from './spark';
import { VercelGatewayProvider } from './vercel-gateway';

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();

  static getProvider(): AIProvider {
    // Default to 'vercel' so it works zero-config in the sandbox.
    // Set AI_PROVIDER env var to override (openai, anthropic, azure, spark, generic).
    const providerType = process.env.AI_PROVIDER?.toLowerCase() || 'vercel';

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
        provider = new OpenAIProvider();
        break;

      case 'vercel':
      default:
        provider = new VercelGatewayProvider();
        break;
    }

    this.providers.set(providerType, provider);
    return provider;
  }

  static getAvailableProviders(): string[] {
    const providers = [
      { name: 'Vercel AI Gateway (default)', available: new VercelGatewayProvider().isAvailable() },
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
