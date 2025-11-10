import { Request, Response } from 'express';
import TurmaService from '../services/TurmaService';
import StudentService from '../services/StudentService';
import oracledb from 'oracledb';

class TurmaController {
  private getDbConnection(req: Request): oracledb.Connection {
    if (!req.dbConnection) {
      throw new Error('Database connection not found in request. Ensure connectionMiddleware is applied.');
    }
    return req.dbConnection;
  }

  async getActiveTurmas(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = (req as any).user.id;
      const turmas = await TurmaService.getActiveTurmasByProfessor(connection, professorId);
      return res.status(200).json(turmas);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createTurma(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const turma = await TurmaService.createTurma(connection, req.body);
      return res.status(201).json(turma);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getTurmasByDiscipline(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      const turmas = await TurmaService.getTurmasByDiscipline(connection, Number(id));
      return res.status(200).json(turmas);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getTurmaDetail(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      const turma = await TurmaService.getTurmaDetailById(connection, Number(id));
      return res.status(200).json(turma);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async addStudentToTurma(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      const studentData = req.body;
      const student = await StudentService.addStudentToTurma(connection, Number(id), studentData);
      return res.status(201).json(student);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new TurmaController();
