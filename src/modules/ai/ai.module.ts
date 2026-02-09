import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { OpenAIProvider } from './providers/openai.provider';
import { AzureOpenAIProvider } from './providers/azure-openai.provider';
import { AI_PROVIDER } from './interfaces/ai-provider.interface';
import { AppConfigService } from '@config/app-config.service';
import { PromptService } from './services/prompt.service';

/**
 * AI Module
 *
 * Provides AI capabilities with multiple provider support.
 * Uses the Strategy pattern for easy provider switching.
 *
 * Supported providers:
 * - OpenAI (GPT-4, GPT-3.5)
 * - Azure OpenAI
 *
 * Features:
 * - Text completion
 * - Chat completion
 * - Embeddings
 * - Prompt management
 */
@Module({
  providers: [
    AiService,
    PromptService,
    OpenAIProvider,
    AzureOpenAIProvider,
    {
      provide: AI_PROVIDER,
      useFactory: (
        configService: AppConfigService,
        openai: OpenAIProvider,
        azureOpenai: AzureOpenAIProvider,
      ) => {
        // Select provider based on configuration
        const provider = configService.aiProvider;
        if (provider === 'azure') {
          return azureOpenai;
        }
        return openai;
      },
      inject: [AppConfigService, OpenAIProvider, AzureOpenAIProvider],
    },
  ],
  exports: [AiService, PromptService],
})
export class AiModule {}
