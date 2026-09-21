import type { InfrastructureCategory } from '../../types';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

const VALID_CATEGORIES: Set<string> = new Set([
  'Water',
  'Roads',
  'Health',
  'Healthcare',
  'Electricity',
  'Education',
  'Drainage',
  'Sanitation',
  'Other',
]);

const VALID_URGENCIES: Set<string> = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const VALID_SOURCE_TYPES: Set<string> = new Set([
  'voice',
  'text',
  'photo',
  'voice+photo',
  'text+photo',
  'sample',
  'whatsapp',
]);

/**
 * Validates incoming CitizenRequest payloads at the API boundary before persistence.
 */
export function validateCitizenRequest(payload: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'root', message: 'Request payload must be a non-null object.', code: 'INVALID_PAYLOAD' }],
    };
  }

  // 1. ID check
  if (!payload.id || typeof payload.id !== 'string' || payload.id.trim().length === 0) {
    errors.push({ field: 'id', message: 'A non-empty string identifier (id) is required.', code: 'REQUIRED_FIELD' });
  } else if (payload.id.length > 128) {
    errors.push({ field: 'id', message: 'Identifier exceeds maximum length of 128 characters.', code: 'MAX_LENGTH_EXCEEDED' });
  }

  // 2. Category check
  if (!payload.category || typeof payload.category !== 'string') {
    errors.push({ field: 'category', message: 'Infrastructure category is required.', code: 'REQUIRED_FIELD' });
  } else if (!VALID_CATEGORIES.has(payload.category)) {
    errors.push({
      field: 'category',
      message: `Invalid category '${payload.category}'. Must be one of: ${Array.from(VALID_CATEGORIES).join(', ')}.`,
      code: 'INVALID_ENUM',
    });
  }

  // 3. Severity check (1-10)
  if (payload.severity !== undefined && payload.severity !== null) {
    const sev = Number(payload.severity);
    if (isNaN(sev) || sev < 1 || sev > 10) {
      errors.push({
        field: 'severity',
        message: 'Severity must be a numeric score between 1 and 10.',
        code: 'OUT_OF_RANGE',
      });
    }
  }

  // 4. Urgency check
  if (payload.urgency !== undefined && payload.urgency !== null) {
    const urg = String(payload.urgency).toUpperCase();
    if (!VALID_URGENCIES.has(urg)) {
      errors.push({
        field: 'urgency',
        message: `Urgency must be one of: ${Array.from(VALID_URGENCIES).join(', ')}.`,
        code: 'INVALID_ENUM',
      });
    }
  }

  // 5. Location checks
  if (payload.location !== undefined && typeof payload.location !== 'string') {
    errors.push({ field: 'location', message: 'Location must be a string.', code: 'INVALID_TYPE' });
  } else if (payload.location && payload.location.length > 300) {
    errors.push({ field: 'location', message: 'Location string exceeds maximum length of 300 characters.', code: 'MAX_LENGTH_EXCEEDED' });
  }

  // 6. Coordinates check
  if (payload.latitude !== undefined && payload.latitude !== null) {
    const lat = Number(payload.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push({ field: 'latitude', message: 'Latitude must be a valid number between -90 and 90.', code: 'OUT_OF_RANGE' });
    }
  }

  if (payload.longitude !== undefined && payload.longitude !== null) {
    const lon = Number(payload.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      errors.push({ field: 'longitude', message: 'Longitude must be a valid number between -180 and 180.', code: 'OUT_OF_RANGE' });
    }
  }

  // 7. Source type check
  if (payload.source_type !== undefined && payload.source_type !== null) {
    if (!VALID_SOURCE_TYPES.has(String(payload.source_type).toLowerCase())) {
      errors.push({
        field: 'source_type',
        message: `source_type must be one of: ${Array.from(VALID_SOURCE_TYPES).join(', ')}.`,
        code: 'INVALID_ENUM',
      });
    }
  }

  // 8. Text length safety
  if (payload.original_text && typeof payload.original_text === 'string' && payload.original_text.length > 10000) {
    errors.push({ field: 'original_text', message: 'Original text exceeds safety limit of 10,000 characters.', code: 'MAX_LENGTH_EXCEEDED' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates feedback processing requests (audio/text diagnostic input).
 */
export function validateProcessFeedback(payload: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'root', message: 'Payload must be a non-null JSON object.', code: 'INVALID_PAYLOAD' }],
    };
  }

  const { text, audioBase64, language } = payload;

  if (!text && !audioBase64) {
    errors.push({
      field: 'input',
      message: 'Either text or audioBase64 input must be provided.',
      code: 'REQUIRED_FIELD',
    });
  }

  if (text && typeof text === 'string' && text.length > 10000) {
    errors.push({
      field: 'text',
      message: 'Text input exceeds 10,000 character limit.',
      code: 'MAX_LENGTH_EXCEEDED',
    });
  }

  if (audioBase64 && typeof audioBase64 !== 'string') {
    errors.push({
      field: 'audioBase64',
      message: 'audioBase64 must be a base64 encoded string.',
      code: 'INVALID_TYPE',
    });
  }

  if (language && typeof language === 'string' && language.length > 50) {
    errors.push({
      field: 'language',
      message: 'Language parameter is too long.',
      code: 'MAX_LENGTH_EXCEEDED',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
