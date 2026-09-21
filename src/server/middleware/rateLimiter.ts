import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  name?: string;
  forceEnable?: boolean;
}

/**
 * In-memory sliding window rate limiter.
 * Protects prototype endpoints against accidental request flooding and high-cost AI abuse.
 * Disabled by default (RATE_LIMIT_ENABLED=false) to keep prototype access friction-free.
 * 
 * Production Note: In production, distributed rate limiting is handled by an API Gateway
 * (e.g., Google Cloud Armor, Envoy, or Redis-backed token bucket) to scale across horizontal instances.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests, message = 'Too many requests, please slow down.', name = 'default', forceEnable = false } = options;
  const store = new Map<string, RateLimitEntry>();

  // Periodically sweep expired clients every 2 minutes to prevent memory leaks
  const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 120000);

  // Allow Node.js to exit gracefully without keeping timer active
  if (sweepInterval.unref) {
    sweepInterval.unref();
  }

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Rate limiting is disabled by default (RATE_LIMIT_ENABLED=false).
    // Only active when explicitly enabled via environment variable or forceEnable flag.
    const isEnabled = forceEnable || process.env.RATE_LIMIT_ENABLED === 'true';
    if (!isEnabled) {
      return next();
    }

    const now = Date.now();
    // Resolve client IP (supporting standard reverse proxy headers)
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const key = `${name}:${clientIp}`;

    let entry = store.get(key);

    // Safeguard store memory: if store reaches 10,000 unique client IPs, purge expired
    if (!entry && store.size >= 10000) {
      for (const [k, e] of store.entries()) {
        if (now > e.resetTime) {
          store.delete(k);
        }
      }
      // If still above threshold, drop the oldest key
      if (store.size >= 10000) {
        const oldestKey = store.keys().next().value;
        if (oldestKey) store.delete(oldestKey);
      }
    }

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(key, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, maxRequests - entry.count);
    const resetSeconds = Math.max(1, Math.ceil((entry.resetTime - now) / 1000));

    // Set standard and legacy rate limit headers
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: `${message} (Limit: ${maxRequests} req / ${windowMs / 1000}s. Try again in ${resetSeconds}s)`,
        },
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Standard rate limiter for general REST API endpoints:
 * 120 requests per minute per IP.
 */
export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'API rate limit exceeded.',
  name: 'general-api',
});

/**
 * Targeted rate limiter for expensive AI & LLM processing endpoints:
 * 30 requests per minute per IP.
 */
export const expensiveAiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'AI inference rate limit exceeded. Please wait before submitting more diagnostic requests.',
  name: 'ai-endpoints',
});
