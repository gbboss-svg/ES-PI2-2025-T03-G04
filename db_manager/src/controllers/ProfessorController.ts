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
      const { nome, sigla, semestres, idInstituicao } = req.body;
      const courseId = await ProfessorService.createCourse(connection, nome, sigla, semestres, idInstituicao);
      return res.status(201).json({ id: courseId, message: 'Curso criado com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async associateProfessorToCourse(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = (req as any).user.id;
      const { courseId } = req.body; // O frontend enviará courseId
      await ProfessorService.associateProfessorToCourse(connection, professorId, courseId);
      return res.status(200).json({ message: 'Professor associado ao curso com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getProfessorInfo(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = (req as any).user.id;
      const professor = await ProfessorService.getProfessorById(connection, professorId);
      if (!professor) {
        return res.status(404).json({ message: 'Professor não encontrado.' });
      }
      return res.status(200).json(professor);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new ProfessorController();
