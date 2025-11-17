import express from 'express';
import CourseService from '../services/CourseService';

export default class CourseController {
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  static async deleteCourse(req: express.Request, res: express.Response) {
    try {
      const professorId = req.user!.id;
      await CourseService.deleteCourse(req.dbConnection!, Number(req.params.id), professorId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Erro ao excluir curso:', error);
      res.status(500).json({ message: error.message });
    }
  }
}