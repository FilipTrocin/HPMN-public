import { VectorDatabaseClient, VectorSearchResult } from '../interfaces';

export class ExampleVectorClient implements VectorDatabaseClient {
  constructor(private config: { url: string; apiKey?: string }) {}

  async createCollection(name: string, vectorSize: number): Promise<void> {
    // Create collection/index
  }

  async deleteCollection(name: string): Promise<void> {
    // Delete collection/index
  }

  async upsert(collection: string, id: string, vector: number[], payload?: any): Promise<void> {
    // Upsert a vector with payload
  }

  async search(collection: string, query: { vector: number[]; limit: number; with_payload?: boolean }): Promise<VectorSearchResult[]> {
    // Return dummy results
    return [];
  }

  async delete(collection: string, id: string): Promise<void> {
    // Delete a vector by id
  }
}
