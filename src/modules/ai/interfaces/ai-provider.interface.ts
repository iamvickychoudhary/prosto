/**
 * AI Provider Interface
 *
 * Defines the contract for AI provider implementations.
 * Supports both OpenAI and Azure OpenAI.
 */
export interface IAIProvider {
  /**
   * Generate a chat completion
   */
  chatCompletion(options: IChatCompletionOptions): Promise<IChatCompletionResult>;

  /**
   * Generate text embeddings
   */
  embeddings(options: IEmbeddingsOptions): Promise<IEmbeddingsResult>;

  /**
   * Stream a chat completion
   */
  streamChatCompletion(options: IChatCompletionOptions): AsyncIterable<IStreamChunk>;
}

/**
 * Chat message role
 */
export type ChatRole = 'system' | 'user' | 'assistant' | 'function';

/**
 * Chat message
 */
export interface IChatMessage {
  role: ChatRole;
  content: string;
  name?: string;
}

/**
 * Chat completion options
 */
export interface IChatCompletionOptions {
  /** Array of messages for the conversation */
  messages: IChatMessage[];

  /** Model to use (e.g., 'gpt-4', 'gpt-3.5-turbo') */
  model?: string;

  /** Maximum tokens in the response */
  maxTokens?: number;

  /** Temperature for randomness (0-2) */
  temperature?: number;

  /** Top P for nucleus sampling */
  topP?: number;

  /** Stop sequences */
  stop?: string[];

  /** Presence penalty (-2 to 2) */
  presencePenalty?: number;

  /** Frequency penalty (-2 to 2) */
  frequencyPenalty?: number;

  /** User identifier for abuse monitoring */
  user?: string;

  /** Response format */
  responseFormat?: 'text' | 'json';
}

/**
 * Chat completion result
 */
export interface IChatCompletionResult {
  /** Generated message content */
  content: string;

  /** Completion finish reason */
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call';

  /** Token usage */
  usage: ITokenUsage;

  /** Model used */
  model: string;
}

/**
 * Token usage statistics
 */
export interface ITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Embeddings options
 */
export interface IEmbeddingsOptions {
  /** Text to embed */
  input: string | string[];

  /** Model to use */
  model?: string;

  /** User identifier */
  user?: string;
}

/**
 * Embeddings result
 */
export interface IEmbeddingsResult {
  /** Array of embedding vectors */
  embeddings: number[][];

  /** Token usage */
  usage: {
    promptTokens: number;
    totalTokens: number;
  };

  /** Model used */
  model: string;
}

/**
 * Stream chunk for streaming responses
 */
export interface IStreamChunk {
  /** Partial content */
  content: string;

  /** Whether this is the final chunk */
  done: boolean;

  /** Finish reason (only on final chunk) */
  finishReason?: string;
}

/**
 * Injection token for AI provider
 */
export const AI_PROVIDER = Symbol('AI_PROVIDER');
