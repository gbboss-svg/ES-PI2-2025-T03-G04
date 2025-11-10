import { Router } from 'express';
import TurmaController from '../controllers/TurmaController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/turmas/ativas', authMiddleware, (req, res) => TurmaController.getActiveTurmas(req, res));

router.get('/disciplina/:id/turmas', authMiddleware, (req, res) => TurmaController.getTurmasByDiscipline(req, res));

router.post('/turmas', authMiddleware, (req, res) => TurmaController.createTurma(req, res));

router.get('/turmas/:id', authMiddleware, (req, res) => TurmaController.getTurmaDetail(req, res));

export default router;
