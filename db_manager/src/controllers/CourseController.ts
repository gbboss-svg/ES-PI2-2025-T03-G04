  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   */


import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import CourseService from '../services/CourseService';

export default class CourseController {
  
  static async deleteCourse(req: ExpressRequest, res: ExpressResponse) {
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