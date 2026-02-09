import { Injectable, Inject } from '@nestjs/common';
import {
  IAIProvider,
  AI_PROVIDER,
  IChatMessage,
  IChatCompletionOptions,
  IChatCompletionResult,
  IEmbeddingsResult,
  IStreamChunk,
} from '../interfaces/ai-provider.interface';
import { PromptService } from './prompt.service';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';

/**
 * AI Service
 *
 * High-level AI service that uses the injected provider.
 * Provides additional features like:
 * - Prompt management
 * - Response parsing
 * - Caching (future)
 * - Usage tracking (future)
 */
@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly aiProvider: IAIProvider,
    private readonly promptService: PromptService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('AiService');
  }

  /**
   * Generate a chat completion
   */
  async chat(
    messages: IChatMessage[],
    options?: Partial<IChatCompletionOptions>,
  ): Promise<IChatCompletionResult> {
    this.logger.debug(`Chat completion with ${messages.length} messages`);

    return this.aiProvider.chatCompletion({
      messages,
      ...options,
    });
  }

  /**
   * Generate a simple text completion
   */
  async complete(prompt: string, options?: Partial<IChatCompletionOptions>): Promise<string> {
    const result = await this.chat([{ role: 'user', content: prompt }], options);
    return result.content;
  }

  /**
   * Generate completion using a named prompt template
   */
  async completeWithPrompt(
    promptName: string,
    variables: Record<string, string>,
    options?: Partial<IChatCompletionOptions>,
  ): Promise<IChatCompletionResult> {
    const messages = this.promptService.getPromptMessages(promptName, variables);
    return this.chat(messages, options);
  }

  /**
   * Generate a JSON response
   */
  async completeJson<T>(prompt: string, options?: Partial<IChatCompletionOptions>): Promise<T> {
    const result = await this.chat(
      [
        {
          role: 'system',
          content: 'You are a helpful assistant that responds only in valid JSON format.',
        },
        { role: 'user', content: prompt },
      ],
      { ...options, responseFormat: 'json' },
    );

    try {
      return JSON.parse(result.content);
    } catch (error) {
      this.logger.error(`Failed to parse JSON response: ${error.message}`);
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * Generate text embeddings
   */
  async embed(text: string | string[]): Promise<IEmbeddingsResult> {
    this.logger.debug('Generating embeddings');
    return this.aiProvider.embeddings({ input: text });
  }

  /**
   * Stream a chat completion
   */
  streamChat(
    messages: IChatMessage[],
    options?: Partial<IChatCompletionOptions>,
  ): AsyncIterable<IStreamChunk> {
    this.logger.debug(`Streaming chat completion with ${messages.length} messages`);

    return this.aiProvider.streamChatCompletion({
      messages,
      ...options,
    });
  }

  /**
   * Summarize text
   */
  async summarize(text: string, maxLength?: number): Promise<string> {
    return this.completeWithPrompt('summarize', {
      text,
      maxLength: maxLength?.toString() || '100',
    }).then(r => r.content);
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(
    text: string,
  ): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number }> {
    return this.completeJson(
      'Analyze the sentiment of this text and respond with JSON containing "sentiment" (positive/negative/neutral) and "score" (0-1): ' +
        text,
    );
  }

  /**
   * Extract entities from text
   */
  async extractEntities(text: string): Promise<Array<{ type: string; value: string }>> {
    return this.completeJson(
      'Extract named entities from this text. Respond with a JSON array of objects with "type" and "value" fields: ' +
        text,
    );
  }

  /**
   * Translate text
   */
  async translate(text: string, targetLanguage: string): Promise<string> {
    return this.complete(
      `Translate the following text to ${targetLanguage}. Only respond with the translation, nothing else:\n\n${text}`,
    );
  }

  /**
   * Generate content based on a topic
   */
  async generateContent(
    topic: string,
    style: string = 'professional',
    length: 'short' | 'medium' | 'long' = 'medium',
  ): Promise<string> {
    const lengthGuide = {
      short: '1-2 paragraphs',
      medium: '3-5 paragraphs',
      long: '6-10 paragraphs',
    };

    return this.complete(`Write ${lengthGuide[length]} about "${topic}" in a ${style} style.`);
  }
}
