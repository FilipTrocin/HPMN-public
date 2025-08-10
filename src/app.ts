import { initDatabaseClient, initVectorStore, initEmbeddingService, RelationalDatabaseClient, VectorDatabaseClient, EmbeddingService } from './database/interfaces';
import { getLogger } from './utils/logger';
import { loadConfig, Config } from './utils/config';

const log = getLogger('INIT');

export interface InitOptions {
  config?: Config;
  databaseClient: RelationalDatabaseClient;
  vectorClient: VectorDatabaseClient;
  embeddingService: EmbeddingService;
}

/**
 * Initialise HPMN public by wiring provided adapters and configuration.
 */
export function initHPMN(options: InitOptions): void {
  const cfg = options.config ?? loadConfig();
  log.info('Initialising database client...');
  initDatabaseClient(options.databaseClient);

  log.info('Initialising vector store...');
  initVectorStore(options.vectorClient);

  log.info('Initialising embedding service...');
  initEmbeddingService(options.embeddingService);

  log.info('HPMN initialisation complete.');
}
