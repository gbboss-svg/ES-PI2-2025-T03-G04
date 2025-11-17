  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   *Desevolvido por:Victória Beatriz Nobre Andrade - R.A:25016398
   */
import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import GradeController from '../controllers/GradeController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.put('/turmas/:turmaId/students/:studentId/grades', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => GradeController.updateStudentGrades(req, res));

export default router;