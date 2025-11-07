import { Router } from 'express';
import DisciplineService from '../services/DisciplineService';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/curso/:id/disciplinas', authMiddleware, async (req, res) => {
  try {
    const disciplines = await DisciplineService.getDisciplinesByCourse(Number(req.params.id));
    res.json(disciplines);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
