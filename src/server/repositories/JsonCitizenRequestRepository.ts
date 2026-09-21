import fs from 'fs';
import path from 'path';
import type { CitizenRequest } from '../../types';
import type {
  CitizenRequestRepository,
  PaginationOptions,
  PaginatedResult,
  RepositoryStatistics,
  RepositoryHealth,
} from './CitizenRequestRepository';

/**
 * JSON File-based persistence adapter for Citizen Requests.
 * Used during hackathon development and single-container deployments.
 * Stores records in `civicpulse_citizen_requests.json`.
 */
export class JsonCitizenRequestRepository implements CitizenRequestRepository {
  private filePath: string;
  private memoryCache: CitizenRequest[] = [];
  private isLoaded = false;
  private lastSyncTime: string = new Date().toISOString();

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'civicpulse_citizen_requests.json');
    this.initStore();
  }

  private initStore(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          let modified = false;
          // Sanitize demo IDs so user inputs never overwrite canonical benchmark seeds
          this.memoryCache = parsed.map((item: any) => {
            if (item && item.id === 'CP-2026-004821') {
              modified = true;
              return { ...item, id: 'CP-2026-USER-004821', request_id: 'CP-2026-USER-004821' };
            }
            return item;
          });
          if (modified) {
            this.persistToDisk();
          }
        } else {
          this.memoryCache = [];
        }
      } else {
        this.memoryCache = [];
        this.persistToDisk();
      }
      this.isLoaded = true;
      this.lastSyncTime = new Date().toISOString();
    } catch (err) {
      console.warn(`[JsonCitizenRequestRepository] Error initializing JSON store at ${this.filePath}:`, err);
      this.memoryCache = [];
      this.isLoaded = true;
    }
  }

  private persistToDisk(): void {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.memoryCache, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
      this.lastSyncTime = new Date().toISOString();
    } catch (err) {
      console.error(`[JsonCitizenRequestRepository] Failed to write store to ${this.filePath}:`, err);
    }
  }

  public async create(request: CitizenRequest): Promise<CitizenRequest> {
    if (!this.isLoaded) this.initStore();

    const sanitizedRequest: CitizenRequest = {
      ...request,
      timestamp: request.timestamp || new Date().toISOString(),
      status: request.status || 'Received',
    };

    const existingIndex = this.memoryCache.findIndex((r) => r.id === sanitizedRequest.id);
    if (existingIndex >= 0) {
      this.memoryCache[existingIndex] = { ...this.memoryCache[existingIndex], ...sanitizedRequest };
    } else {
      this.memoryCache.unshift(sanitizedRequest);
    }

    this.persistToDisk();
    return sanitizedRequest;
  }

  public async getById(id: string): Promise<CitizenRequest | null> {
    if (!this.isLoaded) this.initStore();
    const found = this.memoryCache.find((r) => r.id === id);
    return found ? { ...found } : null;
  }

  public async list(options: PaginationOptions = {}): Promise<PaginatedResult<CitizenRequest>> {
    if (!this.isLoaded) this.initStore();

    let filtered = [...this.memoryCache];

    if (options.category) {
      const catLower = options.category.toLowerCase();
      filtered = filtered.filter((r) => r.category?.toLowerCase() === catLower);
    }

    if (options.district) {
      const distLower = options.district.toLowerCase();
      filtered = filtered.filter(
        (r) => r.district?.toLowerCase() === distLower || r.location?.toLowerCase().includes(distLower)
      );
    }

    if (options.state) {
      const stateLower = options.state.toLowerCase();
      filtered = filtered.filter((r) => r.state?.toLowerCase() === stateLower);
    }

    if (options.urgency) {
      const urgUpper = options.urgency.toUpperCase();
      filtered = filtered.filter((r) => r.urgency?.toUpperCase() === urgUpper);
    }

    if (options.status) {
      const statusLower = options.status.toLowerCase();
      filtered = filtered.filter((r) => r.status?.toLowerCase() === statusLower);
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.original_text?.toLowerCase().includes(q) ||
          r.summary_en?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    // Default page 1, default limit 50, maximum limit 100
    const page = Math.max(1, Number(options.page) || 1);
    const rawLimit = Number(options.limit);
    // If limit is explicitly -1 or 0, return all items (backward compatibility)
    const limit = rawLimit <= 0 ? (total > 0 ? total : 50) : Math.min(100, rawLimit || 50);

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async update(id: string, updates: Partial<CitizenRequest>): Promise<CitizenRequest | null> {
    if (!this.isLoaded) this.initStore();
    const index = this.memoryCache.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated = { ...this.memoryCache[index], ...updates };
    this.memoryCache[index] = updated;
    this.persistToDisk();
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    if (!this.isLoaded) this.initStore();
    const index = this.memoryCache.findIndex((r) => r.id === id);
    if (index === -1) return false;

    this.memoryCache.splice(index, 1);
    this.persistToDisk();
    return true;
  }

  public async count(filter?: { category?: string; district?: string; state?: string }): Promise<number> {
    if (!this.isLoaded) this.initStore();
    if (!filter) return this.memoryCache.length;

    let items = this.memoryCache;
    if (filter.category) {
      const c = filter.category.toLowerCase();
      items = items.filter((r) => r.category?.toLowerCase() === c);
    }
    if (filter.district) {
      const d = filter.district.toLowerCase();
      items = items.filter((r) => r.district?.toLowerCase() === d || r.location?.toLowerCase().includes(d));
    }
    if (filter.state) {
      const s = filter.state.toLowerCase();
      items = items.filter((r) => r.state?.toLowerCase() === s);
    }
    return items.length;
  }

  public async getStatistics(): Promise<RepositoryStatistics> {
    if (!this.isLoaded) this.initStore();

    const stats: RepositoryStatistics = {
      totalRequests: this.memoryCache.length,
      byCategory: {},
      byUrgency: {},
      byStatus: {},
    };

    for (const req of this.memoryCache) {
      const cat = req.category || 'Other';
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

      const urg = req.urgency || 'MEDIUM';
      stats.byUrgency[urg] = (stats.byUrgency[urg] || 0) + 1;

      const st = req.status || 'Received';
      stats.byStatus[st] = (stats.byStatus[st] || 0) + 1;
    }

    return stats;
  }

  public async healthCheck(): Promise<RepositoryHealth> {
    try {
      const exists = fs.existsSync(this.filePath);
      return {
        status: exists ? 'healthy' : 'degraded',
        type: 'json-file',
        recordCount: this.memoryCache.length,
        lastSync: this.lastSyncTime,
        message: exists ? 'JSON store accessible and synchronized' : 'JSON store file missing, running in-memory',
      };
    } catch (err: any) {
      return {
        status: 'down',
        type: 'json-file',
        recordCount: this.memoryCache.length,
        message: err?.message || 'File system error',
      };
    }
  }

  /**
   * Directly read internal memory cache for synchronous compatibility if needed.
   */
  public getAllSync(): CitizenRequest[] {
    if (!this.isLoaded) this.initStore();
    return [...this.memoryCache];
  }
}
