import { Router } from 'express';
import DisciplineController from '../controllers/DisciplineController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/disciplinas', authMiddleware, (req, res) => DisciplineController.createDiscipline(req, res));
router.get('/professor/disciplinas', authMiddleware, (req, res) => DisciplineController.getDisciplinesByProfessor(req, res));
router.get('/curso/:courseId/disciplinas', authMiddleware, (req, res) => DisciplineController.getDisciplinesByCourse(req, res));

export default router;
