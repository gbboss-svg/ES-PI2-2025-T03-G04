import { Router } from 'express';
import CourseService from '../services/CourseService';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/instituicao/:id/cursos', authMiddleware, async (req: any, res: any) => {
  try {
    const courses = await CourseService.getCoursesByInstitution(req.dbConnection, Number(req.params.id));
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
