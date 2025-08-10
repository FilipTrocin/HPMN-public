import { EmbeddingService } from '../interfaces';

export class ExampleEmbeddingService implements EmbeddingService {
  constructor(private config: { url: string; token?: string }) {}

  async generateEmbedding(text: string): Promise<number[]> {
    // Replace with real service call; returns a dummy fixed-size vector for now
    const size = 8;
    const vec = new Array(size).fill(0).map((_, i) => ((i + text.length) % size) / size);
    return vec;
  }
}
