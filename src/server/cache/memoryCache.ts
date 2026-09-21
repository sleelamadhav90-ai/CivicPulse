interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export interface CacheStats {
  size: number;
  maxEntries: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRatio: number;
}

/**
 * Bounded In-Memory LRU & TTL Cache.
 * 
 * Prototype Role:
 * Prevents redundant calls to the Gemini API for identical inputs, identical policy briefs,
 * and identical conversational queries without requiring external infrastructure.
 * 
 * Production Migration Path:
 * In a multi-instance production deployment, this in-memory cache is replaced by a distributed
 * Redis (e.g. Google Cloud Memorystore) cluster using the same key schema.
 */
export class MemoryCache<T = any> {
  private store = new Map<string, CacheItem<T>>();
  private maxEntries: number;
  private defaultTtlMs: number;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(options: { maxEntries?: number; defaultTtlMs?: number } = {}) {
    this.maxEntries = options.maxEntries || 300;
    this.defaultTtlMs = options.defaultTtlMs || 30 * 60 * 1000; // 30 minutes
  }

  public get(key: string): T | undefined {
    const item = this.store.get(key);
    const now = Date.now();

    if (!item) {
      this.misses++;
      return undefined;
    }

    if (now > item.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }

    // Refresh LRU order (delete & re-insert)
    this.store.delete(key);
    this.store.set(key, item);

    this.hits++;
    return item.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs || this.defaultTtlMs);

    // Evict oldest if reaching capacity
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) {
        this.store.delete(firstKey);
        this.evictions++;
      }
    }

    this.store.set(key, { value, expiresAt });
  }

  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  public delete(key: string): boolean {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }

  public getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.store.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRatio: total > 0 ? Number((this.hits / total).toFixed(3)) : 0,
    };
  }
}

// Global cached instances
export const policyBriefCache = new MemoryCache<string>({
  maxEntries: 200,
  defaultTtlMs: 60 * 60 * 1000, // 1 hour TTL
});

export const feedbackDiagnosticCache = new MemoryCache<any>({
  maxEntries: 300,
  defaultTtlMs: 30 * 60 * 1000, // 30 min TTL
});

export const searchIntentCache = new MemoryCache<any>({
  maxEntries: 300,
  defaultTtlMs: 15 * 60 * 1000, // 15 min TTL
});

export const searchSummaryCache = new MemoryCache<string>({
  maxEntries: 300,
  defaultTtlMs: 15 * 60 * 1000, // 15 min TTL
});

export const conversationalCache = new MemoryCache<any>({
  maxEntries: 300,
  defaultTtlMs: 15 * 60 * 1000, // 15 min TTL
});

