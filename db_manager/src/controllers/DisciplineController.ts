import { Request, Response } from 'express';
import DisciplineService from '../services/DisciplineService';
import oracledb from 'oracledb';

class DisciplineController {
  private getDbConnection(req: Request): oracledb.Connection {
    if (!req.dbConnection) {
      throw new Error('Database connection not found in request. Ensure connectionMiddleware is applied.');
    }
    return req.dbConnection;
  }

  async createDiscipline(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = (req as any).user.id;
      const disciplineData = req.body;
      const disciplineId = await DisciplineService.createDiscipline(connection, disciplineData, professorId);
      return res.status(201).json({ id: disciplineId, message: 'Disciplina criada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getDisciplinesByProfessor(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = (req as any).user.id;
      const disciplines = await DisciplineService.getDisciplinesByProfessor(connection, professorId);
      return res.status(200).json(disciplines);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getDisciplinesByCourse(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const courseId = parseInt(req.params.courseId, 10);
      const disciplines = await DisciplineService.getDisciplinesByCourse(connection, courseId);
      return res.status(200).json(disciplines);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new DisciplineController();
