import { Router } from 'express';
import AuditController from '../controllers/AuditController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/audit', authMiddleware, (req, res) => AuditController.create(req, res));
router.get('/audit/:turmaId', authMiddleware, (req, res) => AuditController.getByTurma(req, res));

export default router;
