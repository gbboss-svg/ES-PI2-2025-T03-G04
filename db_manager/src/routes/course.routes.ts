
import express, { Request, Response } from 'express';
import CourseService from '../services/CourseService';
import { authMiddleware } from '../middlewares/auth';
import CourseController from '../controllers/CourseController';

const router = express.Router();


router.get('/instituicao/:id/cursos', authMiddleware, async (req: Request, res: Response) => {
  try {
    const courses = await CourseService.getCoursesByInstitution(req.dbConnection!, Number(req.params.id));
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/cursos/:id', authMiddleware, CourseController.deleteCourse);

export default router;
