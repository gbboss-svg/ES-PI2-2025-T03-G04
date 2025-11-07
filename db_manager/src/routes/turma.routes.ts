import { Router } from 'express';
import TurmaService from '../services/TurmaService';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/disciplina/:id/turmas', authMiddleware, async (req, res) => {
  try {
    const turmas = await TurmaService.getTurmasByDiscipline(Number(req.params.id));
    res.json(turmas);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
