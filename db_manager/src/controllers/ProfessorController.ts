import { Request, Response } from 'express';
import ProfessorService from '../services/ProfessorService';
import oracledb from 'oracledb';

class ProfessorController {
  private getDbConnection(req: Request): oracledb.Connection {
    if (!req.dbConnection) {
      throw new Error('Database connection not found in request. Ensure connectionMiddleware is applied.');
    }
    return req.dbConnection;
  }

  async getInstituicoes(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = (req as any).user.id;
      const instituicoes = await ProfessorService.getInstituicoes(connection, professorId);
      return res.status(200).json(instituicoes);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getCursos(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = (req as any).user.id;
      const cursos = await ProfessorService.getCursos(connection, professorId);
      return res.status(200).json(cursos);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createInstitution(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const { nome } = req.body;
      const professorId = (req as any).user.id; // Assuming professorId is needed for institution creation
      const institutionId = await ProfessorService.createInstitution(connection, nome, professorId);
      return res.status(201).json({ id: institutionId, message: 'Instituição criada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createCourse(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const { nome, idInstituicao } = req.body;
      const courseId = await ProfessorService.createCourse(connection, nome, idInstituicao);
      return res.status(201).json({ id: courseId, message: 'Curso criado com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new ProfessorController();
