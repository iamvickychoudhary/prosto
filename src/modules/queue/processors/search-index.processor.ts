import { Injectable, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../services/queue.service';
import { IJobData } from '../interfaces/queue.interface';
import { SearchService } from '@modules/search/services/search.service';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';
import { QUEUE_NAMES } from '@common/constants/app.constants';

/**
 * Search Index Job Data
 */
interface SearchIndexJobData {
  indexName: string;
  action: 'index' | 'update' | 'delete';
  documents: Array<{ id: string; [key: string]: unknown }>;
}

/**
 * Search Index Processor
 *
 * Processes search indexing jobs from the queue.
 */
@Injectable()
export class SearchIndexProcessor implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly searchService: SearchService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('SearchIndexProcessor');
  }

  async onModuleInit(): Promise<void> {
    // Register processor when module initializes
    try {
      await this.queueService.registerProcessor<SearchIndexJobData>(
        QUEUE_NAMES.SEARCH_INDEXING,
        this.process.bind(this),
      );
      this.logger.log('Search index processor registered');
    } catch (error) {
      this.logger.warn(`Failed to register search index processor: ${error.message}`);
    }
  }

  /**
   * Process search indexing job
   */
  async process(job: IJobData<SearchIndexJobData>): Promise<void> {
    const { indexName, action, documents } = job.data;

    this.logger.debug(
      `Processing search index job ${job.id}: ${action} ${documents.length} documents in ${indexName}`,
    );

    switch (action) {
      case 'index':
      case 'update':
        const result = await this.searchService.indexDocuments(indexName, documents, {
          mergeOrUpload: action === 'update',
        });
        this.logger.log(
          `Indexed ${result.succeeded} documents in ${indexName} (${result.failed} failed)`,
        );
        break;

      case 'delete':
        const ids = documents.map(d => d.id);
        await this.searchService.deleteDocuments(indexName, ids);
        this.logger.log(`Deleted ${ids.length} documents from ${indexName}`);
        break;
    }
  }
}
