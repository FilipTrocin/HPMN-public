/**
 * Database Interfaces
 * 
 * This file defines the abstract interfaces for database operations.
 * Implement these interfaces with your preferred database providers.
 */

// ============= Types =============

export interface Message {
    id?: string;
    conversation_id: string;
    question: string;
    answer: string;
    name: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface Action {
    id: string;
    name: string;
    content: string;  // JSON string of schema
    url: string;
    tags: string[];
    active: boolean;
    category: string;
}

export interface Memory {
    id: string;
    title: string;
    content: string;
    tags: string[];
    active: boolean;
    created_at?: Date;
}

export interface VectorSearchResult {
    id: string;
    score: number;
    payload?: any;
}

// ============= Relational Database Interface =============

export interface RelationalDatabaseClient {
    // Message operations
    getMessages(conversationId: string, limit?: number): Promise<Message[]>;
    getFirstMessage(conversationId: string): Promise<Message | null>;
    createMessage(message: Partial<Message>): Promise<Message>;
    deleteInactiveConversations(daysInactive: number): Promise<void>;
    
    // Action operations
    getActions(): Promise<Action[]>;
    getAction(id: string): Promise<Action | null>;
    createAction(action: Partial<Action>): Promise<Action>;
    
    // Memory operations
    getMemories(): Promise<Memory[]>;
    createMemory(memory: Partial<Memory>): Promise<Memory>;
}

// ============= Vector Database Interface =============

export interface VectorDatabaseClient {
    // Collection management
    createCollection(name: string, vectorSize: number): Promise<void>;
    deleteCollection(name: string): Promise<void>;
    
    // Vector operations
    upsert(collection: string, id: string, vector: number[], payload?: any): Promise<void>;
    search(collection: string, query: { vector: number[]; limit: number; with_payload?: boolean }): Promise<VectorSearchResult[]>;
    delete(collection: string, id: string): Promise<void>;
}

// ============= Embedding Service Interface =============

export interface EmbeddingService {
    generateEmbedding(text: string): Promise<number[]>;
}

// ============= Factory Functions =============

let dbClient: RelationalDatabaseClient | null = null;
let vectorStore: VectorDatabaseClient | null = null;
let embeddingService: EmbeddingService | null = null;

/**
 * Initialize the database client
 * Call this during application startup
 */
export function initDatabaseClient(client: RelationalDatabaseClient): void {
    dbClient = client;
}

/**
 * Initialize the vector store
 * Call this during application startup
 */
export function initVectorStore(store: VectorDatabaseClient): void {
    vectorStore = store;
}

/**
 * Initialize the embedding service
 * Call this during application startup
 */
export function initEmbeddingService(service: EmbeddingService): void {
    embeddingService = service;
}

/**
 * Get the database client
 * @throws Error if client not initialized
 */
export function getDatabaseClient(): RelationalDatabaseClient {
    if (!dbClient) {
        throw new Error('Database client not initialized. Call initDatabaseClient first.');
    }
    return dbClient;
}

/**
 * Get the vector store
 * @throws Error if store not initialized
 */
export function getVectorStore(): VectorDatabaseClient {
    if (!vectorStore) {
        throw new Error('Vector store not initialized. Call initVectorStore first.');
    }
    return vectorStore;
}

/**
 * Get the embedding service
 * @throws Error if service not initialized
 */
export function getEmbeddingService(): EmbeddingService {
    if (!embeddingService) {
        throw new Error('Embedding service not initialized. Call initEmbeddingService first.');
    }
    return embeddingService;
}

// ============= Helper Functions =============

/**
 * Upsert a vector with metadata
 */
export async function upsertVector(
    collection: string,
    id: string,
    text: string,
    title: string,
    metadata?: any
): Promise<void> {
    const embedding = await getEmbeddingService().generateEmbedding(text);
    await getVectorStore().upsert(collection, id, embedding, {
        content: text,
        title,
        ...metadata
    });
}

/**
 * Get default actions for system initialization
 */
export function getDefaultActions(): any[] {
    // This would be loaded from configuration or defined by the implementer
    return [
        {
            id: "default-memorise",
            title: "memorise",
            description: "Store information in long-term memory",
            tags: ["memorise", "memory", "remember", "skill"],
            webhook: "/api/memorise",
            schema: {} // Define schema based on your needs
        }
        // Add more default actions as needed
    ];
}
