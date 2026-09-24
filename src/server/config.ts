/**
 * CivicPulse Server Configuration & Validation Module
 * 
 * Manages runtime configuration for persistence, abuse protection, and cloud connectivity.
 * Guarantees that:
 * - PERSISTENCE_TYPE defaults to 'json' (using local JSON storage).
 * - DATABASE_URL is strictly optional when PERSISTENCE_TYPE='json'.
 * - DATABASE_URL is only required when PERSISTENCE_TYPE='postgres'.
 * - RATE_LIMIT_ENABLED defaults to false.
 */

export type PersistenceType = 'json' | 'postgres' | 'firestore';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  persistenceType: PersistenceType;
  databaseUrl?: string;
  firebaseProjectId?: string;
  rateLimitEnabled: boolean;
  geminiApiKey?: string;
  appUrl?: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  config: AppConfig;
}

/**
 * Validates runtime environment configuration.
 * When PERSISTENCE_TYPE is 'json' (default), DATABASE_URL and Firebase configs are completely optional.
 * When PERSISTENCE_TYPE is 'postgres', DATABASE_URL is strictly required.
 * When PERSISTENCE_TYPE is 'firestore', FIREBASE_PROJECT_ID (or service account) is expected.
 */
export function validateConfig(env: NodeJS.ProcessEnv = process.env): ConfigValidationResult {
  const errors: string[] = [];

  const rawPersistence = (env.PERSISTENCE_TYPE || 'json').toLowerCase().trim();
  let persistenceType: PersistenceType = 'json';

  if (rawPersistence === 'postgres' || rawPersistence === 'postgresql') {
    persistenceType = 'postgres';
    const dbUrl = env.DATABASE_URL?.trim();
    if (!dbUrl) {
      errors.push(
        "DATABASE_URL is required when PERSISTENCE_TYPE='postgres'. For prototype evaluation, use PERSISTENCE_TYPE='json' where DATABASE_URL is optional."
      );
    }
  } else if (rawPersistence === 'firestore' || rawPersistence === 'firebase') {
    persistenceType = 'firestore';
    const projId = env.FIREBASE_PROJECT_ID?.trim() || env.VITE_FIREBASE_PROJECT_ID?.trim();
    if (!projId && !env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim()) {
      errors.push(
        "FIREBASE_PROJECT_ID is required when PERSISTENCE_TYPE='firestore'. For local evaluation without cloud credentials, use PERSISTENCE_TYPE='json'."
      );
    }
  } else if (rawPersistence === 'json' || rawPersistence === '') {
    persistenceType = 'json';
    // DATABASE_URL and Firebase credentials are strictly optional when PERSISTENCE_TYPE='json'
  } else {
    errors.push(
      `Invalid PERSISTENCE_TYPE '${env.PERSISTENCE_TYPE}'. Supported values are 'json' (default), 'firestore', or 'postgres'.`
    );
  }

  // Rate limiting defaults to false unless explicitly set to 'true'
  const rateLimitEnabled = env.RATE_LIMIT_ENABLED === 'true';

  const port = Number(env.PORT) || 3000;
  const nodeEnv = env.NODE_ENV || 'development';
  const databaseUrl = env.DATABASE_URL?.trim() || undefined;
  const firebaseProjectId = env.FIREBASE_PROJECT_ID?.trim() || env.VITE_FIREBASE_PROJECT_ID?.trim() || undefined;
  const geminiApiKey = env.GEMINI_API_KEY?.trim() || undefined;
  const appUrl = env.APP_URL?.trim() || undefined;

  return {
    isValid: errors.length === 0,
    errors,
    config: {
      nodeEnv,
      port,
      persistenceType,
      databaseUrl,
      firebaseProjectId,
      rateLimitEnabled,
      geminiApiKey,
      appUrl,
    },
  };
}

let cachedConfig: AppConfig | null = null;

/**
 * Returns active validated server configuration.
 */
export function getServerConfig(): AppConfig {
  if (!cachedConfig) {
    const result = validateConfig();
    if (!result.isValid) {
      console.warn('[CivicPulse Configuration Warning]:', result.errors.join('; '));
    }
    cachedConfig = result.config;
  }
  return cachedConfig;
}

/**
 * Resets cached configuration (useful for unit testing with altered environment variables).
 */
export function resetServerConfig(): void {
  cachedConfig = null;
}
