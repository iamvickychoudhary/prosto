/**
 * Search Provider Interface
 *
 * Defines the contract for search provider implementations.
 * Supports Azure AI Search and can be extended for other providers.
 */
export interface ISearchProvider {
  /**
   * Create or update an index
   */
  createOrUpdateIndex(indexName: string, schema: IIndexSchema): Promise<void>;

  /**
   * Delete an index
   */
  deleteIndex(indexName: string): Promise<void>;

  /**
   * Index documents
   */
  indexDocuments<T extends ISearchDocument>(
    indexName: string,
    documents: T[],
    options?: IIndexOptions,
  ): Promise<IIndexResult>;

  /**
   * Delete documents from index
   */
  deleteDocuments(indexName: string, documentIds: string[]): Promise<void>;

  /**
   * Search documents
   */
  search<T extends ISearchDocument>(
    indexName: string,
    query: string,
    options?: ISearchOptions,
  ): Promise<ISearchResult<T>>;

  /**
   * Get document by ID
   */
  getDocument<T extends ISearchDocument>(indexName: string, documentId: string): Promise<T | null>;

  /**
   * Get index statistics
   */
  getIndexStats(indexName: string): Promise<IIndexStats>;
}

/**
 * Base search document interface
 */
export interface ISearchDocument {
  id: string;
  [key: string]: unknown;
}

/**
 * Index schema definition
 */
export interface IIndexSchema {
  fields: IIndexField[];
  suggesters?: ISuggester[];
  scoringProfiles?: IScoringProfile[];
}

/**
 * Index field definition
 */
export interface IIndexField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'geo';
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  facetable?: boolean;
  key?: boolean;
  analyzer?: string;
}

/**
 * Suggester definition
 */
export interface ISuggester {
  name: string;
  sourceFields: string[];
}

/**
 * Scoring profile
 */
export interface IScoringProfile {
  name: string;
  textWeights?: Record<string, number>;
  functions?: IScoringFunction[];
}

/**
 * Scoring function
 */
export interface IScoringFunction {
  type: 'freshness' | 'magnitude' | 'distance' | 'tag';
  fieldName: string;
  boost: number;
}

/**
 * Index options
 */
export interface IIndexOptions {
  batchSize?: number;
  mergeOrUpload?: boolean;
}

/**
 * Index result
 */
export interface IIndexResult {
  succeeded: number;
  failed: number;
  errors?: Array<{
    documentId: string;
    error: string;
  }>;
}

/**
 * Search options
 */
export interface ISearchOptions {
  filter?: string;
  orderBy?: string[];
  select?: string[];
  top?: number;
  skip?: number;
  includeTotalCount?: boolean;
  facets?: string[];
  highlightFields?: string[];
  searchMode?: 'any' | 'all';
  queryType?: 'simple' | 'full' | 'semantic';
  semanticConfiguration?: string;
}

/**
 * Search result
 */
export interface ISearchResult<T> {
  results: ISearchHit<T>[];
  totalCount?: number;
  facets?: Record<string, IFacetValue[]>;
}

/**
 * Individual search hit
 */
export interface ISearchHit<T> {
  document: T;
  score: number;
  highlights?: Record<string, string[]>;
}

/**
 * Facet value
 */
export interface IFacetValue {
  value: string | number;
  count: number;
}

/**
 * Index statistics
 */
export interface IIndexStats {
  documentCount: number;
  storageSize: number;
}

/**
 * Injection token for search provider
 */
export const SEARCH_PROVIDER = Symbol('SEARCH_PROVIDER');
