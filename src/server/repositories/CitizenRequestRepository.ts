import type { CitizenRequest } from '../../types.js';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  category?: string;
  district?: string;
  state?: string;
  urgency?: string;
  status?: string;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RepositoryStatistics {
  totalRequests: number;
  byCategory: Record<string, number>;
  byUrgency: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface RepositoryHealth {
  status: 'healthy' | 'degraded' | 'down';
  type: string;
  recordCount: number;
  lastSync?: string;
  message?: string;
}

/**
 * Persistence abstraction interface for Citizen Requests.
 * Decouples API handlers, business logic, and scoring modules
 * from the underlying physical storage mechanism (Local JSON, PostgreSQL, Spanner, etc.).
 */
export interface CitizenRequestRepository {
  /**
   * Persist a new or updated citizen request.
   */
  create(request: CitizenRequest): Promise<CitizenRequest>;

  /**
   * Retrieve a single citizen request by its unique identifier.
   */
  getById(id: string): Promise<CitizenRequest | null>;

  /**
   * List citizen requests with optional pagination and filtering.
   */
  list(options?: PaginationOptions): Promise<PaginatedResult<CitizenRequest>>;

  /**
   * Update fields on an existing citizen request.
   */
  update(id: string, updates: Partial<CitizenRequest>): Promise<CitizenRequest | null>;

  /**
   * Delete an existing citizen request by id.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Return the total count of requests matching an optional filter.
   */
  count(filter?: { category?: string; district?: string; state?: string }): Promise<number>;

  /**
   * Aggregate aggregate telemetry across categories, urgency, and statuses.
   */
  getStatistics(): Promise<RepositoryStatistics>;

  /**
   * Diagnostic health check for the persistence adapter.
   */
  healthCheck(): Promise<RepositoryHealth>;
}
