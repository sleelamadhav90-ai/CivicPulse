import type { Request, Response, NextFunction } from 'express';

export interface ApiErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  requestId?: string;
  timestamp: string;
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Sanitizes error messages so internal credentials, filesystem paths,
 * or API keys are NEVER leaked in HTTP response bodies.
 */
function sanitizeErrorMessage(msg: string): string {
  if (!msg) return 'An unexpected server error occurred.';
  // Strip potential Google/Gemini API keys (AIza...)
  let clean = msg.replace(/AIza[0-9A-Za-z_\-]{20,}/g, '[REDACTED_KEY]');
  // Strip bearer tokens or generic secrets
  clean = clean.replace(/(?:key|token|secret|password)[=:\s]+[A-Za-z0-9_\-\.]{8,}/gi, '$1=[REDACTED_SECRET]');
  // Strip Unix / Windows filesystem paths
  clean = clean.replace(/(?:\/[a-zA-Z0-9_.-]+){2,}/g, '[INTERNAL_PATH]');
  clean = clean.replace(/[A-Z]:\\[^ \n\r]+/g, '[INTERNAL_PATH]');
  return clean;
}

/**
 * Centralized Express Error Handling Middleware.
 * Emits uniform JSON error structures with trace IDs.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
    ? err.statusCode
    : 500;

  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const isProduction = process.env.NODE_ENV === 'production';

  // Server-side trace log with request ID
  console.error(`[Error Trace ${req.id || 'N/A'}] Status: ${statusCode} Code: ${code} -`, err.message || err);

  const clientMessage = isProduction && statusCode >= 500
    ? 'An unexpected error occurred while processing your request. Please try again or contact system administrators.'
    : sanitizeErrorMessage(err.message || 'Internal server error');

  const responseBody: ApiErrorPayload = {
    success: false,
    error: {
      code,
      message: clientMessage,
      ...(err.details ? { details: err.details } : {}),
    },
    requestId: req.id,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(responseBody);
}
