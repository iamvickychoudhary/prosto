import { Injectable, Inject } from '@nestjs/common';
import {
  ISearchProvider,
  SEARCH_PROVIDER,
  ISearchDocument,
  IIndexSchema,
  ISearchOptions,
  ISearchResult,
  IIndexOptions,
  IIndexResult,
} from '../interfaces/search-provider.interface';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';

/**
 * Search Service
 *
 * High-level search service that uses the injected provider.
 * Provides additional features like:
 * - Query building
 * - Result transformation
 * - Caching (future)
 * - Search analytics (future)
 */
@Injectable()
export class SearchService {
  constructor(
    @Inject(SEARCH_PROVIDER)
    private readonly searchProvider: ISearchProvider,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('SearchService');
  }

  /**
   * Create or update a search index
   */
  async createOrUpdateIndex(indexName: string, schema: IIndexSchema): Promise<void> {
    this.logger.log(`Creating/updating index: ${indexName}`);
    await this.searchProvider.createOrUpdateIndex(indexName, schema);
  }

  /**
   * Delete a search index
   */
  async deleteIndex(indexName: string): Promise<void> {
    this.logger.log(`Deleting index: ${indexName}`);
    await this.searchProvider.deleteIndex(indexName);
  }

  /**
   * Index documents
   */
  async indexDocuments<T extends ISearchDocument>(
    indexName: string,
    documents: T[],
    options?: IIndexOptions,
  ): Promise<IIndexResult> {
    this.logger.log(`Indexing ${documents.length} documents to ${indexName}`);
    return this.searchProvider.indexDocuments(indexName, documents, options);
  }

  /**
   * Index a single document
   */
  async indexDocument<T extends ISearchDocument>(
    indexName: string,
    document: T,
  ): Promise<IIndexResult> {
    return this.indexDocuments(indexName, [document], { mergeOrUpload: true });
  }

  /**
   * Delete documents from index
   */
  async deleteDocuments(indexName: string, documentIds: string[]): Promise<void> {
    this.logger.log(`Deleting ${documentIds.length} documents from ${indexName}`);
    await this.searchProvider.deleteDocuments(indexName, documentIds);
  }

  /**
   * Perform a search
   */
  async search<T extends ISearchDocument>(
    indexName: string,
    query: string,
    options?: ISearchOptions,
  ): Promise<ISearchResult<T>> {
    this.logger.debug(`Searching '${indexName}' for: ${query}`);
    return this.searchProvider.search<T>(indexName, query, options);
  }

  /**
   * Perform a semantic search (requires Azure AI Search semantic configuration)
   */
  async semanticSearch<T extends ISearchDocument>(
    indexName: string,
    query: string,
    semanticConfiguration: string,
    options?: Omit<ISearchOptions, 'queryType' | 'semanticConfiguration'>,
  ): Promise<ISearchResult<T>> {
    return this.search<T>(indexName, query, {
      ...options,
      queryType: 'semantic',
      semanticConfiguration,
    });
  }

  /**
   * Get document by ID
   */
  async getDocument<T extends ISearchDocument>(
    indexName: string,
    documentId: string,
  ): Promise<T | null> {
    return this.searchProvider.getDocument<T>(indexName, documentId);
  }

  /**
   * Get index statistics
   */
  async getIndexStats(indexName: string) {
    return this.searchProvider.getIndexStats(indexName);
  }

  /**
   * Build a filter string for common scenarios
   */
  buildFilter(filters: Record<string, unknown>): string {
    const conditions: string[] = [];

    for (const [field, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        // Array filter (any match)
        const orConditions = value.map(v =>
          typeof v === 'string' ? `${field} eq '${v}'` : `${field} eq ${v}`,
        );
        conditions.push(`(${orConditions.join(' or ')})`);
      } else if (typeof value === 'object') {
        // Range filter
        const range = value as { gte?: number; lte?: number; gt?: number; lt?: number };
        if (range.gte !== undefined) conditions.push(`${field} ge ${range.gte}`);
        if (range.lte !== undefined) conditions.push(`${field} le ${range.lte}`);
        if (range.gt !== undefined) conditions.push(`${field} gt ${range.gt}`);
        if (range.lt !== undefined) conditions.push(`${field} lt ${range.lt}`);
      } else if (typeof value === 'string') {
        conditions.push(`${field} eq '${value}'`);
      } else {
        conditions.push(`${field} eq ${value}`);
      }
    }

    return conditions.join(' and ');
  }
}
