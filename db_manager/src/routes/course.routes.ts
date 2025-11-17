import express from 'express';
import CourseService from '../services/CourseService';
import { authMiddleware } from '../middlewares/auth';
import CourseController from '../controllers/CourseController';

const router = express.Router();


// FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
router.get('/instituicao/:id/cursos', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const courses = await CourseService.getCoursesByInstitution(req.dbConnection!, Number(req.params.id));
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/cursos/:id', authMiddleware, CourseController.deleteCourse);

export default router;