





import { Request, Response } from 'express';
import ProfessorService from '../services/ProfessorService';
import AuthService from '../services/AuthService';
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
      const professorId = req.user!.id;
      const instituicoes = await ProfessorService.getInstituicoes(connection, professorId);
      return res.status(200).json(instituicoes);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getCursos(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
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
      const professorId = req.user!.id;

      if (!nome || !professorId) {
        return res.status(400).json({ message: 'Nome da instituição e ID do professor são obrigatórios.' });
      }

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
      const professorId = req.user!.id;

      const courseId = await ProfessorService.createCourse(connection, { nome, sigla, semestres, idInstituicao }, professorId);
      return res.status(201).json({ id: courseId, message: 'Curso criado com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async associateProfessorToCourse(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const { courseId } = req.body; 
      await ProfessorService.associateProfessorToCourse(connection, professorId, courseId);
      return res.status(200).json({ message: 'Professor associado ao curso com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getProfessorInfo(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const professor = await ProfessorService.getProfessorById(connection, professorId);
      if (!professor) {
        return res.status(404).json({ message: 'Professor não encontrado.' });
      }
      return res.status(200).json(professor);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async verifyPassword(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const { password } = req.body;
      const isValid = await (AuthService as any).verifyPassword(connection, professorId, password);
      if (!isValid) {
        return res.status(401).json({ message: 'Senha incorreta.' });
      }
      return res.status(200).json({ message: 'Senha verificada com sucesso.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateCourseAccess(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const courseId = parseInt(req.params.id, 10);
      await ProfessorService.updateCourseAccessTimestamp(connection, professorId, courseId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateInstitution(req: Request, res: Response) {
    try {
        const connection = this.getDbConnection(req);
        const professorId = req.user!.id;
        const institutionId = parseInt(req.params.id, 10);
        const { nome, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória para esta ação.' });
        }
        const isPasswordValid = await AuthService.verifyPassword(connection, professorId, password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        await ProfessorService.updateInstitution(connection, institutionId, nome, professorId);
        return res.status(200).json({ message: 'Instituição atualizada com sucesso!' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }

  async deleteInstitution(req: Request, res: Response) {
      try {
          const connection = this.getDbConnection(req);
          const professorId = req.user!.id;
          const institutionId = parseInt(req.params.id, 10);
          
          await ProfessorService.deleteInstitution(connection, institutionId, professorId);
          return res.status(200).json({ message: 'Instituição excluída com sucesso!' });
      } catch (error: any) {
          return res.status(500).json({ message: error.message });
      }
  }

  async updateCourse(req: Request, res: Response) {
    try {
        const connection = this.getDbConnection(req);
        const professorId = req.user!.id;
        const courseId = parseInt(req.params.id, 10);
        const { nome, sigla, semestres, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória para esta ação.' });
        }
        const isPasswordValid = await AuthService.verifyPassword(connection, professorId, password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        await ProfessorService.updateCourse(connection, courseId, { nome, sigla, semestres }, professorId);
        return res.status(200).json({ message: 'Curso atualizado com sucesso!' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }

  async deleteCourse(req: Request, res: Response) {
      try {
          const connection = this.getDbConnection(req);
          const professorId = req.user!.id;
          const courseId = parseInt(req.params.id, 10);
          
          await ProfessorService.deleteCourse(connection, courseId, professorId);
          return res.status(200).json({ message: 'Curso excluído com sucesso!' });
      } catch (error: any) {
          return res.status(500).json({ message: error.message });
      }
  }
}

export default new ProfessorController();