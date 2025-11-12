
// ES-PI2-2025-T03-G04-main/db_manager/src/routes/turma.routes.ts
import { Router } from 'express';
import TurmaController from '../controllers/TurmaController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/turmas/ativas', authMiddleware, (req, res) => TurmaController.getActiveTurmas(req, res));

router.get('/disciplina/:id/turmas', authMiddleware, (req, res) => TurmaController.getTurmasByDiscipline(req, res));

router.post('/turmas', authMiddleware, (req, res) => TurmaController.createTurma(req, res));

router.get('/turmas/:id', authMiddleware, (req, res) => TurmaController.getTurmaDetail(req, res));

router.put('/turmas/:id', authMiddleware, (req, res) => TurmaController.updateTurma(req, res));

router.delete('/turmas/:id', authMiddleware, (req, res) => TurmaController.deleteTurma(req, res));

router.post('/turmas/:id/students', authMiddleware, (req, res) => TurmaController.addStudentToTurma(req, res));

router.post('/turmas/:id/students/batch', authMiddleware, (req, res) => TurmaController.batchAddStudentsToTurma(req, res));

router.put('/turmas/:turmaId/students/:studentId/grades', authMiddleware, (req, res) => TurmaController.updateStudentGrades(req, res));

router.delete('/turmas/:turmaId/students/:studentId', authMiddleware, (req, res) => TurmaController.removeStudentFromTurma(req, res));

router.post('/turmas/:id/finalize', authMiddleware, (req, res) => TurmaController.finalizeTurma(req, res));

router.post('/turmas/:id/reopen', authMiddleware, (req, res) => TurmaController.reopenTurma(req, res));

export default router;