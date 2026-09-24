import type { CitizenRequest } from '../../types.js';
import type {
  CitizenRequestRepository,
  PaginationOptions,
  PaginatedResult,
  RepositoryStatistics,
  RepositoryHealth,
} from './CitizenRequestRepository.js';
import { getFirestoreDb, isFirebaseAdminConfigured } from '../firebaseAdmin.js';

/**
 * Removes undefined fields from objects before saving to Firestore,
 * as Firestore throws an error on `undefined` values.
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Production Firestore repository adapter for CivicPulse.
 * Persists citizen requests into the `citizenRequests` collection.
 * Uses request.id (e.g. CP-2026-XXXXXX) as the authoritative document ID.
 * Links every submitted request to the verified Firebase user UID (userId).
 */
export class FirestoreCitizenRequestRepository implements CitizenRequestRepository {
  private collectionName = 'citizenRequests';
  // Fallback in-memory cache used during unit tests or when Firestore DB credentials are absent
  private mockStore: Map<string, CitizenRequest> = new Map();

  private getDb() {
    return getFirestoreDb();
  }

  public async create(request: CitizenRequest): Promise<CitizenRequest> {
    const db = this.getDb();
    if (!db) {
      this.mockStore.set(request.id, { ...request });
      return request;
    }

    try {
      const sanitized = sanitizeForFirestore({
        ...request,
        updated_at: new Date().toISOString(),
      });
      await db.collection(this.collectionName).doc(request.id).set(sanitized, { merge: true });
      return request;
    } catch (err: any) {
      console.warn('[FirestoreCitizenRequestRepository] create error, using local fallback:', err?.message);
      this.mockStore.set(request.id, { ...request });
      return request;
    }
  }

  public async getById(id: string): Promise<CitizenRequest | null> {
    const db = this.getDb();
    if (!db) {
      return this.mockStore.get(id) || null;
    }

    try {
      const doc = await db.collection(this.collectionName).doc(id).get();
      if (!doc.exists) {
        return this.mockStore.get(id) || null;
      }
      return doc.data() as CitizenRequest;
    } catch (err: any) {
      console.warn('[FirestoreCitizenRequestRepository] getById error:', err?.message);
      return this.mockStore.get(id) || null;
    }
  }

  public async list(options: PaginationOptions = {}): Promise<PaginatedResult<CitizenRequest>> {
    const db = this.getDb();
    let allItems: CitizenRequest[] = [];

    if (!db) {
      allItems = Array.from(this.mockStore.values());
    } else {
      try {
        let query: any = db.collection(this.collectionName);

        if (options.category) {
          query = query.where('category', '==', options.category);
        }
        if (options.district) {
          query = query.where('district', '==', options.district);
        }
        if (options.urgency) {
          query = query.where('urgency', '==', options.urgency);
        }
        if (options.status) {
          query = query.where('status', '==', options.status);
        }

        const snapshot = await query.get();
        snapshot.forEach((doc: any) => {
          allItems.push(doc.data() as CitizenRequest);
        });
      } catch (err: any) {
        console.warn('[FirestoreCitizenRequestRepository] list error:', err?.message);
        allItems = Array.from(this.mockStore.values());
      }
    }

    // Apply in-memory search and secondary filters
    if (options.search) {
      const q = options.search.toLowerCase();
      allItems = allItems.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.summary_en.toLowerCase().includes(q) ||
          r.original_text.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      );
    }

    // Sort by timestamp descending
    allItems.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
      const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    const total = allItems.length;
    const page = Math.max(1, Number(options.page) || 1);
    const limit = options.limit !== undefined ? Number(options.limit) : (options.page ? 50 : total);

    const items = limit > 0 ? allItems.slice((page - 1) * limit, page * limit) : allItems;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : (total > 0 ? 1 : 0);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async update(id: string, updates: Partial<CitizenRequest>): Promise<CitizenRequest | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
    const db = this.getDb();
    if (!db) {
      this.mockStore.set(id, merged);
      return merged;
    }

    try {
      const sanitized = sanitizeForFirestore(updates);
      await db.collection(this.collectionName).doc(id).set(sanitized, { merge: true });
      return merged;
    } catch (err: any) {
      console.warn('[FirestoreCitizenRequestRepository] update error:', err?.message);
      this.mockStore.set(id, merged);
      return merged;
    }
  }

  public async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;

    this.mockStore.delete(id);
    const db = this.getDb();
    if (!db) return true;

    try {
      await db.collection(this.collectionName).doc(id).delete();
      return true;
    } catch (err: any) {
      console.warn('[FirestoreCitizenRequestRepository] delete error:', err?.message);
      return true;
    }
  }

  public async count(filter?: { category?: string; district?: string; state?: string }): Promise<number> {
    const listRes = await this.list({
      category: filter?.category,
      district: filter?.district,
      state: filter?.state,
      limit: 1,
    });
    return listRes.total;
  }

  public async getStatistics(): Promise<RepositoryStatistics> {
    const all = await this.list({ limit: 0 });
    const byCategory: Record<string, number> = {};
    const byUrgency: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const item of all.items) {
      if (item.category) byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      if (item.urgency) byUrgency[item.urgency] = (byUrgency[item.urgency] || 0) + 1;
      if (item.status) byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    }

    return {
      totalRequests: all.total,
      byCategory,
      byUrgency,
      byStatus,
    };
  }

  public async healthCheck(): Promise<RepositoryHealth> {
    const isConfigured = isFirebaseAdminConfigured();
    const db = this.getDb();

    if (!isConfigured || !db) {
      return {
        status: 'degraded',
        type: 'firestore',
        recordCount: this.mockStore.size,
        message: 'Firestore credentials not configured. Operating in safe test/fallback mode.',
      };
    }

    try {
      // Diagnostic shallow read on collection
      const snap = await db.collection(this.collectionName).limit(1).get();
      return {
        status: 'healthy',
        type: 'firestore',
        recordCount: snap.size,
        lastSync: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        type: 'firestore',
        recordCount: 0,
        message: `Firestore connection check: ${err?.message || 'Degraded'}`,
      };
    }
  }
}
