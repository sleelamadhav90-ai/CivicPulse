import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
    }
  }
}

/**
 * Attaches a unique request ID (tracing ID) to every incoming request.
 * Propagates existing client X-Request-Id or generates a new trace ID.
 * Sets the X-Request-Id response header and logs request start/completion metrics.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.headers['x-request-id'];
  const reqId =
    typeof existingId === 'string' && existingId.trim()
      ? existingId.trim().slice(0, 64)
      : `cp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

  req.id = reqId;
  req.startTime = Date.now();

  res.setHeader('X-Request-Id', reqId);

  res.on('finish', () => {
    const durationMs = req.startTime ? Date.now() - req.startTime : 0;
    // Log safe telemetry (method, route, status, duration, trace ID) — strictly omitting citizen PII / body text
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction || res.statusCode >= 400) {
      console.log(
        `[Trace ${req.id}] ${req.method} ${req.path} -> ${res.statusCode} (${durationMs}ms)`
      );
    }
  });

  next();
}
