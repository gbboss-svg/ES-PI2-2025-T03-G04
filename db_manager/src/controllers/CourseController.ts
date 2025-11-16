import { Request, Response } from 'express';
import CourseService from '../services/CourseService';

export default class CourseController {
  static async deleteCourse(req: Request, res: Response) {
    try {
      const professorId = (req as any).user.id;
      await CourseService.deleteCourse(req.dbConnection!, Number(req.params.id), professorId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Erro ao excluir curso:', error);
      res.status(500).json({ message: error.message });
    }
  }
}
