import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
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
 * OpenAI Provider
 *
 * Implementation of AI provider using OpenAI API.
 */
@Injectable()
export class OpenAIProvider implements IAIProvider {
  private client: OpenAI | null = null;
  private defaultModel: string;
  private defaultMaxTokens: number;

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('OpenAIProvider');
    this.initialize();
  }

  private initialize(): void {
    const config = this.configService.openAIConfig;

    if (!config.apiKey) {
      this.logger.warn('OpenAI API key not configured');
      return;
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
    });

    this.defaultModel = config.model;
    this.defaultMaxTokens = config.maxTokens;

    this.logger.log('OpenAI provider initialized');
  }

  async chatCompletion(options: IChatCompletionOptions): Promise<IChatCompletionResult> {
    if (!this.client) {
      throw new Error('OpenAI not configured');
    }

    const response = await this.client.chat.completions.create({
      model: options.model || this.defaultModel,
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
      throw new Error('OpenAI not configured');
    }

    const input = Array.isArray(options.input) ? options.input : [options.input];

    const response = await this.client.embeddings.create({
      model: options.model || 'text-embedding-3-small',
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
      throw new Error('OpenAI not configured');
    }

    const stream = await this.client.chat.completions.create({
      model: options.model || this.defaultModel,
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
