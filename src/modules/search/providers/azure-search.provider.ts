import { Injectable } from '@nestjs/common';
import {
  SearchClient,
  SearchIndexClient,
  AzureKeyCredential,
  SearchIndex,
  SearchFieldDataType,
  SearchOptions,
  SearchDocumentsResult,
} from '@azure/search-documents';
import { AppConfigService } from '@config/app-config.service';
import {
  ISearchProvider,
  ISearchDocument,
  IIndexSchema,
  IIndexOptions,
  IIndexResult,
  ISearchOptions,
  ISearchResult,
  ISearchHit,
  IIndexStats,
} from '../interfaces/search-provider.interface';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';

/**
 * Search client wrapper to handle generic typing
 */
interface SearchClientWrapper {
  client: SearchClient<ISearchDocument>;
}

/**
 * Azure AI Search Provider
 *
 * Implementation of search provider using Azure AI Search.
 * Provides full-text search, semantic search, and faceted navigation.
 */
@Injectable()
export class AzureSearchProvider implements ISearchProvider {
  private indexClient: SearchIndexClient | null = null;
  private searchClients: Map<string, SearchClientWrapper> = new Map();

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('AzureSearchProvider');
    this.initialize();
  }

  private initialize(): void {
    const config = this.configService.azureSearchConfig;

    if (!config.endpoint || !config.apiKey) {
      this.logger.warn('Azure Search not configured - search functionality will be unavailable');
      return;
    }

    try {
      const credential = new AzureKeyCredential(config.apiKey);
      this.indexClient = new SearchIndexClient(config.endpoint, credential);
      this.logger.log('Azure Search provider initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize Azure Search: ${(error as Error).message}`);
    }
  }

  private getSearchClient<T extends ISearchDocument>(indexName: string): SearchClient<T> {
    if (!this.searchClients.has(indexName)) {
      const config = this.configService.azureSearchConfig;
      const credential = new AzureKeyCredential(config.apiKey!);
      const client = new SearchClient<ISearchDocument>(config.endpoint!, indexName, credential);
      this.searchClients.set(indexName, { client });
    }
    const wrapper = this.searchClients.get(indexName)!;
    return wrapper.client as unknown as SearchClient<T>;
  }

  async createOrUpdateIndex(indexName: string, schema: IIndexSchema): Promise<void> {
    if (!this.indexClient) {
      throw new Error('Azure Search not configured');
    }

    const index: SearchIndex = {
      name: indexName,
      fields: schema.fields.map(field => ({
        name: field.name,
        type: this.mapFieldType(field.type),
        searchable: field.searchable ?? true,
        filterable: field.filterable ?? false,
        sortable: field.sortable ?? false,
        facetable: field.facetable ?? false,
        key: field.key ?? false,
        analyzer: field.analyzer,
      })),
      suggesters: schema.suggesters?.map(s => ({
        name: s.name,
        sourceFields: s.sourceFields,
        searchMode: 'analyzingInfixMatching' as const,
      })),
      scoringProfiles: schema.scoringProfiles?.map(p => ({
        name: p.name,
        textWeights: p.textWeights ? { weights: p.textWeights } : undefined,
        functions: p.functions?.map(f => ({
          type: f.type,
          fieldName: f.fieldName,
          boost: f.boost,
        })),
      })) as SearchIndex['scoringProfiles'],
    };

    await this.indexClient.createOrUpdateIndex(index);
    this.logger.log(`Index '${indexName}' created/updated successfully`);
  }

  async deleteIndex(indexName: string): Promise<void> {
    if (!this.indexClient) {
      throw new Error('Azure Search not configured');
    }

    await this.indexClient.deleteIndex(indexName);
    this.searchClients.delete(indexName);
    this.logger.log(`Index '${indexName}' deleted`);
  }

  async indexDocuments<T extends ISearchDocument>(
    indexName: string,
    documents: T[],
    options?: IIndexOptions,
  ): Promise<IIndexResult> {
    const client = this.getSearchClient<T>(indexName);
    const batchSize = options?.batchSize || 1000;
    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ documentId: string; error: string }> = [];

    // Process in batches
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      try {
        const result = options?.mergeOrUpload
          ? await client.mergeOrUploadDocuments(batch)
          : await client.uploadDocuments(batch);

        for (const r of result.results) {
          if (r.succeeded) {
            succeeded++;
          } else {
            failed++;
            errors.push({
              documentId: r.key,
              error: r.errorMessage || 'Unknown error',
            });
          }
        }
      } catch (error) {
        this.logger.error(`Batch indexing error: ${(error as Error).message}`);
        failed += batch.length;
      }
    }

    return { succeeded, failed, errors: errors.length > 0 ? errors : undefined };
  }

  async deleteDocuments(indexName: string, documentIds: string[]): Promise<void> {
    const client = this.getSearchClient<ISearchDocument>(indexName);
    const documents = documentIds.map(id => ({ id }));
    await client.deleteDocuments(documents);
    this.logger.log(`Deleted ${documentIds.length} documents from '${indexName}'`);
  }

  async search<T extends ISearchDocument>(
    indexName: string,
    query: string,
    options?: ISearchOptions,
  ): Promise<ISearchResult<T>> {
    const client = this.getSearchClient<T>(indexName);

    const searchOptions = this.buildSearchOptions<T>(options);
    const searchResults: SearchDocumentsResult<T> = await client.search(query, searchOptions);

    const results: ISearchHit<T>[] = [];
    for await (const result of searchResults.results) {
      results.push({
        document: result.document,
        score: result.score || 0,
        highlights: result.highlights as Record<string, string[]> | undefined,
      });
    }

    return {
      results,
      totalCount: searchResults.count,
      facets: this.processFacets(searchResults.facets as Record<string, unknown[]> | undefined),
    };
  }

  /**
   * Build base search options (common to all query types)
   */
  private buildBaseSearchOptions<T extends ISearchDocument>(
    options?: ISearchOptions,
  ): Omit<SearchOptions<T>, 'queryType' | 'semanticSearchOptions'> {
    const searchOptions: Omit<SearchOptions<T>, 'queryType' | 'semanticSearchOptions'> = {};

    if (options?.filter) {
      searchOptions.filter = options.filter;
    }

    if (options?.orderBy) {
      searchOptions.orderBy = options.orderBy;
    }

    if (options?.top !== undefined) {
      searchOptions.top = options.top;
    }

    if (options?.skip !== undefined) {
      searchOptions.skip = options.skip;
    }

    if (options?.includeTotalCount !== undefined) {
      searchOptions.includeTotalCount = options.includeTotalCount;
    }

    if (options?.facets) {
      searchOptions.facets = options.facets;
    }

    if (options?.highlightFields) {
      searchOptions.highlightFields = options.highlightFields.join(',');
    }

    if (options?.searchMode) {
      searchOptions.searchMode = options.searchMode;
    }

    return searchOptions;
  }

  /**
   * Build search options with proper typing based on query type
   */
  private buildSearchOptions<T extends ISearchDocument>(
    options?: ISearchOptions,
  ): SearchOptions<T> {
    const baseOptions = this.buildBaseSearchOptions<T>(options);

    // Handle semantic search separately (requires different type structure)
    if (options?.queryType === 'semantic' && options?.semanticConfiguration) {
      return {
        ...baseOptions,
        queryType: 'semantic',
        semanticSearchOptions: {
          configurationName: options.semanticConfiguration,
        },
      } as SearchOptions<T>;
    }

    // Handle simple and full query types
    if (options?.queryType && (options.queryType === 'simple' || options.queryType === 'full')) {
      return {
        ...baseOptions,
        queryType: options.queryType,
      };
    }

    return baseOptions;
  }

  async getDocument<T extends ISearchDocument>(
    indexName: string,
    documentId: string,
  ): Promise<T | null> {
    const client = this.getSearchClient<T>(indexName);

    try {
      const document = await client.getDocument(documentId);
      return document as T;
    } catch (error) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async getIndexStats(indexName: string): Promise<IIndexStats> {
    if (!this.indexClient) {
      throw new Error('Azure Search not configured');
    }

    const stats = await this.indexClient.getIndexStatistics(indexName);
    return {
      documentCount: stats.documentCount || 0,
      storageSize: stats.storageSize || 0,
    };
  }

  private mapFieldType(type: string): SearchFieldDataType {
    const typeMap: Record<string, SearchFieldDataType> = {
      string: 'Edm.String',
      number: 'Edm.Double',
      boolean: 'Edm.Boolean',
      date: 'Edm.DateTimeOffset',
      array: 'Collection(Edm.String)',
      geo: 'Edm.GeographyPoint',
    };
    return typeMap[type] || 'Edm.String';
  }

  private processFacets(
    facets: Record<string, unknown[]> | undefined,
  ): Record<string, { value: string | number; count: number }[]> | undefined {
    if (!facets) return undefined;

    const result: Record<string, { value: string | number; count: number }[]> = {};

    for (const [field, values] of Object.entries(facets)) {
      result[field] = (values as Array<{ value: string | number; count: number }>).map(v => ({
        value: v.value,
        count: v.count,
      }));
    }

    return result;
  }
}
