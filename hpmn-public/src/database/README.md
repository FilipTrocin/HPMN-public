# Database Module

This module provides abstract interfaces for database operations in HPMN. It uses a dual-database architecture combining relational and vector databases.

## Architecture

### Relational Database
Stores structured data:
- Conversation histories
- Action definitions
- User preferences
- System metadata

### Vector Database
Enables semantic search:
- Document embeddings
- Memory embeddings
- Action embeddings
- Similarity matching

## Interfaces

### RelationalDatabaseClient
Implement this interface with your preferred SQL database:
```typescript
interface RelationalDatabaseClient {
    // Message operations
    getMessages(conversationId: string, limit?: number): Promise<Message[]>;
    createMessage(message: Partial<Message>): Promise<Message>;
    
    // Action operations
    getActions(): Promise<Action[]>;
    createAction(action: Partial<Action>): Promise<Action>;
    
    // Memory operations
    getMemories(): Promise<Memory[]>;
    createMemory(memory: Partial<Memory>): Promise<Memory>;
}
```

### VectorDatabaseClient
Implement this interface with your preferred vector database:
```typescript
interface VectorDatabaseClient {
    createCollection(name: string, vectorSize: number): Promise<void>;
    upsert(collection: string, id: string, vector: number[], payload?: any): Promise<void>;
    search(collection: string, query: SearchQuery): Promise<VectorSearchResult[]>;
}
```

### EmbeddingService
Implement this interface to generate embeddings:
```typescript
interface EmbeddingService {
    generateEmbedding(text: string): Promise<number[]>;
}
```

## Implementation Example

### 1. Create Implementations

```typescript
// xata-client.ts
import { RelationalDatabaseClient } from './interfaces';

export class XataClient implements RelationalDatabaseClient {
    async getMessages(conversationId: string, limit?: number) {
        // Your Xata implementation
    }
    // ... other methods
}

// qdrant-client.ts
import { VectorDatabaseClient } from './interfaces';

export class QdrantClient implements VectorDatabaseClient {
    async search(collection: string, query: any) {
        // Your Qdrant implementation
    }
    // ... other methods
}
```

### 2. Initialize During Startup

```typescript
// app.ts
import { initDatabaseClient, initVectorStore } from './database/interfaces';
import { XataClient } from './implementations/xata-client';
import { QdrantClient } from './implementations/qdrant-client';

async function startup() {
    // Initialize databases
    initDatabaseClient(new XataClient(config));
    initVectorStore(new QdrantClient(config));
    
    // Now you can use getDatabaseClient() and getVectorStore() anywhere
}
```

## Usage

### Conversation Management
```typescript
import { currentConversation, saveMessage } from './database/conversation';

// Get conversation history
const messages = await currentConversation('conv-123', 10);

// Save new message
await saveMessage('conv-123', 'User question', 'AI response');
```

### Vector Operations
```typescript
import { upsertVector, getVectorStore } from './database/interfaces';

// Add document to vector store
await upsertVector(
    'memories',
    'mem-123',
    'Document content',
    'Document title',
    { tags: ['important'] }
);

// Search vectors
const results = await getVectorStore().search('memories', {
    vector: queryEmbedding,
    limit: 5
});
```

## Collections

The system uses two main collections:
- **actions_collection**: Stores action embeddings
- **memories_collection**: Stores memory/document embeddings

## Configuration

Required configuration in `config.json`:
```json
{
  "services": {
    "database": {
      "relational": {
        "url": "YOUR_DATABASE_URL",
        "apiKey": "YOUR_DATABASE_API_KEY"
      },
      "vector": {
        "url": "YOUR_VECTOR_DB_URL",
        "apiKey": "YOUR_VECTOR_DB_API_KEY"
      }
    },
    "embeddings": {
      "url": "YOUR_EMBEDDING_SERVICE_URL",
      "token": "YOUR_EMBEDDING_TOKEN"
    }
  }
}
```