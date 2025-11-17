
import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import DisciplineController from '../controllers/DisciplineController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/disciplinas', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => DisciplineController.createDiscipline(req, res));
router.get('/professor/disciplinas', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => DisciplineController.getDisciplinesByProfessor(req, res));
router.get('/curso/:courseId/disciplinas', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => DisciplineController.getDisciplinesByCourse(req, res));
router.put('/disciplinas/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => DisciplineController.updateDiscipline(req, res));
router.delete('/disciplinas/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => DisciplineController.deleteDiscipline(req, res));


export default router;