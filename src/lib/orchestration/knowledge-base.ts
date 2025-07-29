import { KnowledgeBase, SearchResult } from './types';

export class KnowledgeBaseImpl implements KnowledgeBase {
  private storage: Map<string, any> = new Map();
  private documents: Map<string, { content: string; metadata?: Record<string, any>; embedding?: number[] }> = new Map();
  private embeddings: Map<string, number[]> = new Map();

  async store(key: string, value: any, metadata?: Record<string, any>): Promise<void> {
    this.storage.set(key, {
      value,
      metadata,
      timestamp: new Date(),
      id: key
    });
  }

  async retrieve(key: string): Promise<any> {
    const item = this.storage.get(key);
    return item?.value;
  }

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Simple text-based search (in production, you'd use vector similarity)
    const queryLower = query.toLowerCase();
    
    // Search in stored documents
    for (const [id, doc] of this.documents.entries()) {
      const contentLower = doc.content.toLowerCase();
      if (contentLower.includes(queryLower)) {
        // Simple relevance scoring based on term frequency
        const matches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
        const score = matches / doc.content.length * 1000; // Normalize score
        
        results.push({
          id,
          content: doc.content,
          score,
          metadata: doc.metadata
        });
      }
    }

    // Search in general storage
    for (const [key, item] of this.storage.entries()) {
      if (typeof item.value === 'string') {
        const valueLower = item.value.toLowerCase();
        if (valueLower.includes(queryLower)) {
          const matches = (valueLower.match(new RegExp(queryLower, 'g')) || []).length;
          const score = matches / item.value.length * 1000;
          
          results.push({
            id: key,
            content: item.value,
            score,
            metadata: item.metadata
          });
        }
      } else if (typeof item.value === 'object') {
        const jsonString = JSON.stringify(item.value).toLowerCase();
        if (jsonString.includes(queryLower)) {
          results.push({
            id: key,
            content: JSON.stringify(item.value, null, 2),
            score: 0.5, // Lower score for JSON matches
            metadata: item.metadata
          });
        }
      }
    }

    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async embed(text: string): Promise<number[]> {
    // Simple mock embedding (in production, use OpenAI embeddings or similar)
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // Mock 384-dimensional embedding
    
    // Create a simple hash-based embedding
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const index = (charCode + i + j) % embedding.length;
        embedding[index] += 1;
      }
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }
    
    return embedding;
  }

  async addDocument(content: string, metadata?: Record<string, any>): Promise<string> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const embedding = await this.embed(content);
    
    this.documents.set(id, {
      content,
      metadata: {
        ...metadata,
        addedAt: new Date(),
        wordCount: content.split(/\s+/).length
      },
      embedding
    });
    
    this.embeddings.set(id, embedding);
    
    return id;
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
    this.embeddings.delete(id);
  }

  // Additional utility methods for the knowledge base
  async getDocumentCount(): Promise<number> {
    return this.documents.size;
  }

  async getStorageStats(): Promise<{
    documents: number;
    storage: number;
    totalSize: number;
  }> {
    let totalSize = 0;
    
    // Calculate document sizes
    for (const doc of this.documents.values()) {
      totalSize += doc.content.length;
    }
    
    // Calculate storage sizes
    for (const item of this.storage.values()) {
      totalSize += JSON.stringify(item).length;
    }
    
    return {
      documents: this.documents.size,
      storage: this.storage.size,
      totalSize
    };
  }

  async searchSimilar(text: string, limit: number = 5): Promise<SearchResult[]> {
    const queryEmbedding = await this.embed(text);
    const results: SearchResult[] = [];
    
    // Calculate cosine similarity with all document embeddings
    for (const [id, doc] of this.documents.entries()) {
      if (doc.embedding) {
        const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
        results.push({
          id,
          content: doc.content,
          score: similarity,
          metadata: doc.metadata
        });
      }
    }
    
    // Sort by similarity and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Batch operations
  async batchStore(items: Array<{ key: string; value: any; metadata?: Record<string, any> }>): Promise<void> {
    for (const item of items) {
      await this.store(item.key, item.value, item.metadata);
    }
  }

  async batchRetrieve(keys: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    for (const key of keys) {
      results[key] = await this.retrieve(key);
    }
    return results;
  }

  // Export/Import functionality
  async exportData(): Promise<{
    storage: Array<{ key: string; value: any; metadata?: Record<string, any> }>;
    documents: Array<{ id: string; content: string; metadata?: Record<string, any> }>;
  }> {
    const storage = Array.from(this.storage.entries()).map(([key, item]) => ({
      key,
      value: item.value,
      metadata: item.metadata
    }));
    
    const documents = Array.from(this.documents.entries()).map(([id, doc]) => ({
      id,
      content: doc.content,
      metadata: doc.metadata
    }));
    
    return { storage, documents };
  }

  async importData(data: {
    storage?: Array<{ key: string; value: any; metadata?: Record<string, any> }>;
    documents?: Array<{ id: string; content: string; metadata?: Record<string, any> }>;
  }): Promise<void> {
    if (data.storage) {
      for (const item of data.storage) {
        await this.store(item.key, item.value, item.metadata);
      }
    }
    
    if (data.documents) {
      for (const doc of data.documents) {
        const embedding = await this.embed(doc.content);
        this.documents.set(doc.id, {
          content: doc.content,
          metadata: doc.metadata,
          embedding
        });
        this.embeddings.set(doc.id, embedding);
      }
    }
  }
}