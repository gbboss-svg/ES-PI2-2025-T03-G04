

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import ProfessorService from '../services/ProfessorService';
import AuthService from '../services/AuthService';
import InstitutionService from '../services/InstitutionService';
import CourseService from '../services/CourseService';
import oracledb from 'oracledb';

class ProfessorController {
  /**
   * Obtém a conexão de banco de dados anexada ao objeto de requisição.
   */
  
  private getDbConnection(req: ExpressRequest): oracledb.Connection {
    if (!req.dbConnection) {
      throw new Error('Database connection not found in request. Ensure connectionMiddleware is applied.');
    }
    return req.dbConnection;
  }

  /**
   * Lida com a requisição para buscar as instituições associadas ao professor logado.
   */
  
  async getInstituicoes(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const instituicoes = await ProfessorService.getInstituicoes(connection, professorId);
      return res.status(200).json(instituicoes);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para buscar os cursos associados ao professor logado.
   */
  
  async getCursos(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const cursos = await ProfessorService.getCursos(connection, professorId);
      return res.status(200).json(cursos);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para criar uma nova instituição para o professor logado.
   */
  
  async createInstitution(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const { nome } = req.body;
      const professorId = req.user!.id;

      if (!nome || !professorId) {
        return res.status(400).json({ message: 'Nome da instituição e ID do professor são obrigatórios.' });
      }

      const institutionId = await InstitutionService.createInstitution(connection, nome, professorId);
      return res.status(201).json({ id: institutionId, message: 'Instituição criada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para criar um novo curso para o professor logado.
   */
  
  async createCourse(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const { nome, sigla, semestres, idInstituicao } = req.body;
      const professorId = req.user!.id;

      const courseId = await CourseService.createCourse(connection, { nome, sigla, semestres, idInstituicao }, professorId);
      return res.status(201).json({ id: courseId, message: 'Curso criado com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para associar o professor logado a um curso existente.
   */
  
  async associateProfessorToCourse(req: ExpressRequest, res: ExpressResponse) {
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

  /**
   * Lida com a requisição para buscar as informações de perfil do professor logado.
   */
  
  async getProfessorInfo(req: ExpressRequest, res: ExpressResponse) {
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

  /**
   * Lida com a requisição para verificar a senha atual do professor.
   */
  
  async verifyPassword(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const { password } = req.body;
      const isValid = await AuthService.verifyPassword(connection, professorId, password);
      if (!isValid) {
        return res.status(401).json({ message: 'Senha incorreta.' });
      }
      return res.status(200).json({ message: 'Senha verificada com sucesso.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para atualizar o timestamp de último acesso a um curso.
   */
  
  async updateCourseAccess(req: ExpressRequest, res: ExpressResponse) {
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

  /**
   * Lida com a requisição para atualizar os dados de uma instituição.
   */
  
  async updateInstitution(req: ExpressRequest, res: ExpressResponse) {
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

        await InstitutionService.updateInstitution(connection, institutionId, nome, professorId);
        return res.status(200).json({ message: 'Instituição atualizada com sucesso!' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para excluir uma instituição.
   */
  
  async deleteInstitution(req: ExpressRequest, res: ExpressResponse) {
      try {
          const connection = this.getDbConnection(req);
          const professorId = req.user!.id;
          const institutionId = parseInt(req.params.id, 10);
          
          await InstitutionService.deleteInstitution(connection, institutionId, professorId);
          return res.status(200).json({ message: 'Instituição excluída com sucesso!' });
      } catch (error: any) {
          return res.status(500).json({ message: error.message });
      }
  }

  /**
   * Lida com a requisição para atualizar os dados de um curso.
   */
  
  async updateCourse(req: ExpressRequest, res: ExpressResponse) {
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

        await CourseService.updateCourse(connection, courseId, { nome, sigla, semestres }, professorId);
        return res.status(200).json({ message: 'Curso atualizado com sucesso!' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para excluir um curso.
   */
  
  async deleteCourse(req: ExpressRequest, res: ExpressResponse) {
      try {
          const connection = this.getDbConnection(req);
          const professorId = req.user!.id;
          const courseId = parseInt(req.params.id, 10);
          await CourseService.deleteCourse(connection, courseId, professorId);
          return res.status(200).json({ message: 'Curso excluído com sucesso!' });
      } catch (error: any) {
          return res.status(500).json({ message: error.message });
      }
  }
}

export default new ProfessorController();