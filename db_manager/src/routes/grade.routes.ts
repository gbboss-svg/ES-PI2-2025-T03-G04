import { Router } from 'express';
import GradeController from '../controllers/GradeController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.put('/turmas/:turmaId/students/:studentId/grades', authMiddleware, (req, res) => GradeController.updateStudentGrades(req, res));

export default router;
