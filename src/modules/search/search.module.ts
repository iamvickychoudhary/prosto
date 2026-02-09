import { Module } from '@nestjs/common';
import { SearchService } from './services/search.service';
import { AzureSearchProvider } from './providers/azure-search.provider';
import { SEARCH_PROVIDER } from './interfaces/search-provider.interface';

/**
 * Search Module
 *
 * Provides search capabilities with Azure AI Search.
 * Uses the Strategy pattern for easy provider switching.
 *
 * Features:
 * - Index management
 * - Document indexing
 * - Full-text search
 * - Faceted search
 * - Semantic search (Azure AI)
 */
@Module({
  providers: [
    SearchService,
    AzureSearchProvider,
    {
      provide: SEARCH_PROVIDER,
      useClass: AzureSearchProvider,
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
