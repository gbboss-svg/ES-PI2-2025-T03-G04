
import { Router } from 'express';
import DisciplineController from '../controllers/DisciplineController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/disciplinas', authMiddleware, (req, res) => DisciplineController.createDiscipline(req, res));
router.get('/professor/disciplinas', authMiddleware, (req, res) => DisciplineController.getDisciplinesByProfessor(req, res));
router.get('/curso/:courseId/disciplinas', authMiddleware, (req, res) => DisciplineController.getDisciplinesByCourse(req, res));
router.put('/disciplinas/:id', authMiddleware, (req, res) => DisciplineController.updateDiscipline(req, res));
router.delete('/disciplinas/:id', authMiddleware, (req, res) => DisciplineController.deleteDiscipline(req, res));


export default router;