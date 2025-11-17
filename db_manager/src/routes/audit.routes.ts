
import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import AuditController from '../controllers/AuditController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/audit', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => AuditController.create(req, res));
router.get('/audit/:turmaId', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => AuditController.getByTurma(req, res));

export default router;