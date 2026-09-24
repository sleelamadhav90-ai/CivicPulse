import type { CitizenRequestRepository } from './CitizenRequestRepository.js';
import { JsonCitizenRequestRepository } from './JsonCitizenRequestRepository.js';
import { PostgresCitizenRequestRepository } from './PostgresCitizenRequestRepository.js';
import { FirestoreCitizenRequestRepository } from './FirestoreCitizenRequestRepository.js';
import { getServerConfig } from '../config.js';

export * from './CitizenRequestRepository.js';
export * from './JsonCitizenRequestRepository.js';
export * from './PostgresCitizenRequestRepository.js';
export * from './FirestoreCitizenRequestRepository.js';

let repositoryInstance: CitizenRequestRepository | null = null;

/**
 * Factory providing the active repository implementation.
 * Defaults to `JsonCitizenRequestRepository` for local file persistence,
 * with zero-downtime switch to `FirestoreCitizenRequestRepository` or `PostgresCitizenRequestRepository`.
 * Cloud credentials are NOT required when using default JSON persistence.
 */
export function getCitizenRequestRepository(): CitizenRequestRepository {
  if (!repositoryInstance) {
    const config = getServerConfig();
    if (config.persistenceType === 'postgres') {
      repositoryInstance = new PostgresCitizenRequestRepository(config.databaseUrl);
    } else if (config.persistenceType === 'firestore') {
      repositoryInstance = new FirestoreCitizenRequestRepository();
    } else {
      // Default: Local JSON file persistence. Cloud credentials are NOT required.
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
