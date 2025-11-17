  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   */
import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import TurmaController from '../controllers/TurmaController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/turmas/ativas', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.getActiveTurmas(req, res));

router.get('/disciplina/:id/turmas', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.getTurmasByDiscipline(req, res));

router.post('/turmas', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.createTurma(req, res));

router.get('/turmas/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.getTurmaDetail(req, res));

router.put('/turmas/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.updateTurma(req, res));

router.delete('/turmas/:id', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.deleteTurma(req, res));

router.post('/turmas/:id/students', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.addStudentToTurma(req, res));

router.post('/turmas/:id/students/batch', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.batchAddStudentsToTurma(req, res));

router.delete('/turmas/:turmaId/students/:studentId', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.removeStudentFromTurma(req, res));

router.post('/turmas/:id/finalize', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.finalizeTurma(req, res));

router.post('/turmas/:id/reopen', authMiddleware, (req: ExpressRequest, res: ExpressResponse) => TurmaController.reopenTurma(req, res));

export default router;