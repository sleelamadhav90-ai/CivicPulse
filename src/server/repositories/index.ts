import type { CitizenRequestRepository } from './CitizenRequestRepository';
import { JsonCitizenRequestRepository } from './JsonCitizenRequestRepository';
import { PostgresCitizenRequestRepository } from './PostgresCitizenRequestRepository';

export * from './CitizenRequestRepository';
export * from './JsonCitizenRequestRepository';
export * from './PostgresCitizenRequestRepository';

let repositoryInstance: CitizenRequestRepository | null = null;

/**
 * Factory providing the active repository implementation.
 * Defaults to `JsonCitizenRequestRepository` for local file persistence,
 * with zero-downtime switch to `PostgresCitizenRequestRepository` when configured.
 */
export function getCitizenRequestRepository(): CitizenRequestRepository {
  if (!repositoryInstance) {
    const persistenceType = process.env.PERSISTENCE_TYPE?.toLowerCase();
    if (persistenceType === 'postgres' || persistenceType === 'postgresql') {
      repositoryInstance = new PostgresCitizenRequestRepository();
    } else {
      repositoryInstance = new JsonCitizenRequestRepository();
    }
  }
  return repositoryInstance;
}

/**
 * For testing and dependency injection.
 */
export function setCitizenRequestRepository(repo: CitizenRequestRepository | null): void {
  repositoryInstance = repo;
}
