import { Injectable } from '@nestjs/common';
import { IChatMessage } from '../interfaces/ai-provider.interface';

/**
 * Prompt definition
 */
interface PromptDefinition {
  system?: string;
  user: string;
  examples?: Array<{
    user: string;
    assistant: string;
  }>;
}

/**
 * Prompt Service
 *
 * Manages prompt templates for AI interactions.
 * Provides:
 * - Template storage and retrieval
 * - Variable interpolation
 * - Few-shot learning examples
 */
@Injectable()
export class PromptService {
  private prompts: Map<string, PromptDefinition> = new Map();

  constructor() {
    this.registerDefaultPrompts();
  }

  /**
   * Register default prompts
   */
  private registerDefaultPrompts(): void {
    // Summarization prompt
    this.register('summarize', {
      system: 'You are a helpful assistant that creates concise summaries.',
      user: 'Summarize the following text in {{maxLength}} words or less:\n\n{{text}}',
    });

    // Code review prompt
    this.register('code-review', {
      system:
        'You are an expert code reviewer. Provide constructive feedback on code quality, potential bugs, and improvements.',
      user: 'Review the following {{language}} code:\n\n```{{language}}\n{{code}}\n```',
    });

    // Data extraction prompt
    this.register('extract-data', {
      system:
        'You are a data extraction assistant. Extract structured data from text and respond in JSON format.',
      user: 'Extract the following fields from the text: {{fields}}\n\nText:\n{{text}}',
    });

    // Classification prompt
    this.register('classify', {
      system: 'You are a text classification assistant.',
      user: 'Classify the following text into one of these categories: {{categories}}\n\nText: {{text}}\n\nRespond with only the category name.',
    });

    // Question answering prompt
    this.register('qa', {
      system:
        'You are a helpful assistant that answers questions based on provided context. If the answer is not in the context, say "I don\'t have enough information to answer that."',
      user: 'Context:\n{{context}}\n\nQuestion: {{question}}',
    });

    // Email generation prompt
    this.register('generate-email', {
      system: 'You are a professional email writer. Write clear, concise, and appropriate emails.',
      user: 'Write a {{tone}} email about: {{subject}}\n\nKey points to include:\n{{points}}',
    });
  }

  /**
   * Register a new prompt template
   */
  register(name: string, definition: PromptDefinition): void {
    this.prompts.set(name, definition);
  }

  /**
   * Get a prompt template
   */
  get(name: string): PromptDefinition | undefined {
    return this.prompts.get(name);
  }

  /**
   * Get prompt as chat messages with variable interpolation
   */
  getPromptMessages(name: string, variables: Record<string, string> = {}): IChatMessage[] {
    const prompt = this.prompts.get(name);
    if (!prompt) {
      throw new Error(`Prompt '${name}' not found`);
    }

    const messages: IChatMessage[] = [];

    // Add system message
    if (prompt.system) {
      messages.push({
        role: 'system',
        content: this.interpolate(prompt.system, variables),
      });
    }

    // Add few-shot examples
    if (prompt.examples) {
      for (const example of prompt.examples) {
        messages.push({
          role: 'user',
          content: this.interpolate(example.user, variables),
        });
        messages.push({
          role: 'assistant',
          content: this.interpolate(example.assistant, variables),
        });
      }
    }

    // Add user message
    messages.push({
      role: 'user',
      content: this.interpolate(prompt.user, variables),
    });

    return messages;
  }

  /**
   * Render a prompt to a single string
   */
  render(name: string, variables: Record<string, string> = {}): string {
    const prompt = this.prompts.get(name);
    if (!prompt) {
      throw new Error(`Prompt '${name}' not found`);
    }

    const parts: string[] = [];

    if (prompt.system) {
      parts.push(`System: ${this.interpolate(prompt.system, variables)}`);
    }

    parts.push(`User: ${this.interpolate(prompt.user, variables)}`);

    return parts.join('\n\n');
  }

  /**
   * Interpolate variables in a template
   */
  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] ?? match;
    });
  }

  /**
   * List all registered prompt names
   */
  listPrompts(): string[] {
    return Array.from(this.prompts.keys());
  }
}
