import { Router, type Request, type Response, type NextFunction } from 'express';
import type { CitizenRequestRepository } from '../repositories/CitizenRequestRepository.js';
import { requireVerifiedAuth } from '../middleware/authMiddleware.js';
import { validateCitizenRequest } from '../validation/requestValidator.js';
import { hasTrustedOwner } from '../repositories/citizenRecordOwnership.js';

/** Private read/delete routes for citizen records. All access is scoped to token UID. */
export function createCitizenRequestRouter(repository: CitizenRequestRepository): Router {
  const router = Router();

  router.post('/', requireVerifiedAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateCitizenRequest(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Citizen request payload validation failed.',
            details: validation.errors,
          },
          requestId: req.id,
          timestamp: new Date().toISOString(),
        });
      }

      const ownerUid = req.user!.uid;
      const saved = await repository.createOwned({ ...req.body, userId: ownerUid, ownerUid }, ownerUid);
      if (!saved) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Citizen request was not found.' },
          requestId: req.id,
          timestamp: new Date().toISOString(),
        });
      }

      const stats = await repository.getStatistics();
      return res.json({ success: true, request: saved, totalStored: stats.totalRequests });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/', requireVerifiedAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit !== undefined ? Number(req.query.limit) : (req.query.page ? 50 : 0);
      const result = await repository.list({
        page,
        limit,
        category: req.query.category as string | undefined,
        district: req.query.district as string | undefined,
        state: req.query.state as string | undefined,
        urgency: req.query.urgency as string | undefined,
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
        ownerUid: req.user!.uid,
      });

      res.json({
        success: true,
        count: result.items.length,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        requests: result.items,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', requireVerifiedAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await repository.getById(req.params.id);
      if (!hasTrustedOwner(item, req.user!.uid)) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Citizen request was not found.' },
          requestId: req.id,
          timestamp: new Date().toISOString(),
        });
      }
      return res.json({ success: true, request: item });
    } catch (err) {
      return next(err);
    }
  });

  router.delete('/:id', requireVerifiedAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await repository.deleteOwned(req.params.id, req.user!.uid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Citizen request was not found.' },
          requestId: req.id,
          timestamp: new Date().toISOString(),
        });
      }
      return res.json({ success: true, deleted: true, id: req.params.id });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
