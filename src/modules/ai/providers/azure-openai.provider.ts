import { Injectable } from '@nestjs/common';
import { AzureOpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AppConfigService } from '@config/app-config.service';
import {
  IAIProvider,
  IChatCompletionOptions,
  IChatCompletionResult,
  IEmbeddingsOptions,
  IEmbeddingsResult,
  IStreamChunk,
} from '../interfaces/ai-provider.interface';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';

/**
 * Azure OpenAI Provider
 *
 * Implementation of AI provider using Azure OpenAI Service.
 */
@Injectable()
export class AzureOpenAIProvider implements IAIProvider {
  private client: AzureOpenAI | null = null;
  private deploymentName: string;
  private defaultMaxTokens: number;

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('AzureOpenAIProvider');
    this.initialize();
  }

  private initialize(): void {
    const config = this.configService.azureOpenAIConfig;

    if (!config.endpoint || !config.apiKey) {
      this.logger.warn('Azure OpenAI not configured');
      return;
    }

    this.client = new AzureOpenAI({
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      apiVersion: config.apiVersion,
    });

    this.deploymentName = config.deploymentName || 'gpt-4';
    this.defaultMaxTokens = this.configService.openAIConfig.maxTokens;

    this.logger.log('Azure OpenAI provider initialized');
  }

  async chatCompletion(options: IChatCompletionOptions): Promise<IChatCompletionResult> {
    if (!this.client) {
      throw new Error('Azure OpenAI not configured');
    }

    const response = await this.client.chat.completions.create({
      model: options.model || this.deploymentName,
      messages: options.messages as ChatCompletionMessageParam[],
      max_tokens: options.maxTokens || this.defaultMaxTokens,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP,
      stop: options.stop,
      presence_penalty: options.presencePenalty,
      frequency_penalty: options.frequencyPenalty,
      user: options.user,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      finishReason: choice.finish_reason as IChatCompletionResult['finishReason'],
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: response.model,
    };
  }

  async embeddings(options: IEmbeddingsOptions): Promise<IEmbeddingsResult> {
    if (!this.client) {
      throw new Error('Azure OpenAI not configured');
    }

    const input = Array.isArray(options.input) ? options.input : [options.input];

    const response = await this.client.embeddings.create({
      model: options.model || 'text-embedding-ada-002',
      input,
      user: options.user,
    });

    return {
      embeddings: response.data.map(d => d.embedding),
      usage: {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
      model: response.model,
    };
  }

  async *streamChatCompletion(options: IChatCompletionOptions): AsyncIterable<IStreamChunk> {
    if (!this.client) {
      throw new Error('Azure OpenAI not configured');
    }

    const stream = await this.client.chat.completions.create({
      model: options.model || this.deploymentName,
      messages: options.messages as ChatCompletionMessageParam[],
      max_tokens: options.maxTokens || this.defaultMaxTokens,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP,
      stop: options.stop,
      presence_penalty: options.presencePenalty,
      frequency_penalty: options.frequencyPenalty,
      user: options.user,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      const finishReason = chunk.choices[0]?.finish_reason;

      yield {
        content: delta?.content || '',
        done: finishReason !== null,
        finishReason: finishReason || undefined,
      };
    }
  }
}
