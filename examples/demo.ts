import { initHPMN } from '../src/app';
import { ExampleSQLClient } from '../src/database/implementations/example-sql';
import { ExampleVectorClient } from '../src/database/implementations/example-vector';
import { ExampleEmbeddingService } from '../src/database/implementations/example-embeddings';

async function main() {
  const db = new ExampleSQLClient({ url: 'postgres://user:pass@host:5432/db' });
  const vec = new ExampleVectorClient({ url: 'http://localhost:6333' });
  const emb = new ExampleEmbeddingService({ url: 'http://localhost:8000/embeddings' });

  initHPMN({
    databaseClient: db,
    vectorClient: vec,
    embeddingService: emb
  });

}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
