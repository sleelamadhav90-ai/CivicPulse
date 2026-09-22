import type { CitizenRequestRepository } from './CitizenRequestRepository.js';
import { JsonCitizenRequestRepository } from './JsonCitizenRequestRepository.js';
import { PostgresCitizenRequestRepository } from './PostgresCitizenRequestRepository.js';
import { getServerConfig } from '../config.js';

export * from './CitizenRequestRepository.js';
export * from './JsonCitizenRequestRepository.js';
export * from './PostgresCitizenRequestRepository.js';

let repositoryInstance: CitizenRequestRepository | null = null;

/**
 * Factory providing the active repository implementation.
 * Defaults to `JsonCitizenRequestRepository` for local file persistence,
 * with zero-downtime switch to `PostgresCitizenRequestRepository` when explicitly configured.
 * DATABASE_URL is completely optional when using default JSON persistence.
 */
export function getCitizenRequestRepository(): CitizenRequestRepository {
  if (!repositoryInstance) {
    const config = getServerConfig();
    if (config.persistenceType === 'postgres') {
      repositoryInstance = new PostgresCitizenRequestRepository(config.databaseUrl);
    } else {
      // Default: Local JSON file persistence. DATABASE_URL is NOT required.
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
