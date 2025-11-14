





import { Request, Response } from 'express';
import DisciplineService from '../services/DisciplineService';
import AuthService from '../services/AuthService';
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
      const professorId = req.user!.id;
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
      const professorId = req.user!.id;
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

  async updateDiscipline(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const disciplineId = parseInt(req.params.id, 10);
      const { password, ...disciplineData } = req.body;

      if (!password) {
        return res.status(400).json({ message: 'A senha é obrigatória para esta ação.' });
      }

      const isPasswordValid = await AuthService.verifyPassword(connection, professorId, password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: 'Senha incorreta.' });
      }

      await DisciplineService.updateDiscipline(connection, disciplineId, disciplineData, professorId);
      return res.status(200).json({ message: 'Disciplina atualizada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteDiscipline(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const disciplineId = parseInt(req.params.id, 10);
      
      await DisciplineService.deleteDiscipline(connection, disciplineId, professorId);
      return res.status(200).json({ message: 'Disciplina excluída com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new DisciplineController();
