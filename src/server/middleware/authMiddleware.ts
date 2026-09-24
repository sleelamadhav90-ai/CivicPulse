import type { Request, Response, NextFunction } from 'express';
import { verifyFirebaseIdToken, isFirebaseAdminConfigured } from '../firebaseAdmin.js';
import { getServerConfig } from '../config.js';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication Middleware for CivicPulse API.
 * Verifies Firebase ID token from Authorization header (Bearer <token>).
 * Strictly derives the authoritative user ID from the verified token.
 * Never trusts client-supplied userIds.
 *
 * In local JSON development without Firebase credentials, gracefully permits local operation
 * unless REQUIRE_AUTH=true is explicitly set.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  const config = getServerConfig();
  const authRequired = 
    process.env.REQUIRE_AUTH === 'true' || 
    config.persistenceType === 'firestore' || 
    isFirebaseAdminConfigured();

  if (!token) {
    if (authRequired) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Please sign in before submitting feedback.',
        },
        requestId: (req as any).id,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    // Local development mode without Firebase configured: allow pass-through
    return next();
  }

  try {
    const decoded = await verifyFirebaseIdToken(token);
    req.user = decoded;
    return next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Authentication token is invalid or expired. Please sign in again.',
      },
      requestId: (req as any).id,
      timestamp: new Date().toISOString(),
    });
    return;
  }
}

/**
 * Optional Auth middleware: attaches user if valid token present,
 * but does not reject request if token is absent.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (token) {
    try {
      const decoded = await verifyFirebaseIdToken(token);
      req.user = decoded;
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}
