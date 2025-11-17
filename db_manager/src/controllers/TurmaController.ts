import express from 'express';
import TurmaService from '../services/TurmaService';
import StudentService from '../services/StudentService';
import AuthService from '../services/AuthService';
import GradeService from '../services/GradeService';
import oracledb from 'oracledb';

class TurmaController {
  /**
   * Obtém a conexão de banco de dados anexada ao objeto de requisição.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  private getDbConnection(req: express.Request): oracledb.Connection {
    if (!req.dbConnection) {
      throw new Error('Database connection not found in request. Ensure connectionMiddleware is applied.');
    }
    return req.dbConnection;
  }

  /**
   * Lida com a requisição para buscar as turmas ativas do professor logado.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async getActiveTurmas(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const turmas = await TurmaService.getActiveTurmasByProfessor(connection, professorId);
      return res.status(200).json(turmas);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para criar uma nova turma.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async createTurma(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const turma = await TurmaService.createTurma(connection, req.body);
      return res.status(201).json(turma);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para buscar as turmas de uma disciplina específica.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async getTurmasByDiscipline(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      const turmas = await TurmaService.getTurmasByDiscipline(connection, Number(id));
      return res.status(200).json(turmas);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para buscar os detalhes completos de uma turma.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async getTurmaDetail(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      const turma = await TurmaService.getTurmaDetailById(connection, Number(id));
      return res.status(200).json(turma);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para adicionar um único aluno a uma turma.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async addStudentToTurma(req: express.Request, res: express.Response) {
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

  /**
   * Lida com a requisição para adicionar múltiplos alunos a uma turma em lote.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async batchAddStudentsToTurma(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      const { students } = req.body;
      if (!Array.isArray(students)) {
          return res.status(400).json({ message: 'O corpo da requisição deve conter um array de "students".' });
      }
      await StudentService.batchAddStudentsToTurma(connection, Number(id), students);
      return res.status(201).json({ message: 'Alunos importados com sucesso.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para atualizar as notas de um aluno.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async updateStudentGrades(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const { turmaId, studentId } = req.params;
      const { grades } = req.body;
      await GradeService.updateStudentGrades(connection, Number(turmaId), Number(studentId), grades, professorId);
      return res.status(200).json({ message: 'Notas atualizadas com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para excluir uma turma.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async deleteTurma(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      await TurmaService.deleteTurma(connection, Number(id));
      return res.status(200).json({ message: 'Turma excluída com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para remover um aluno de uma turma.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async removeStudentFromTurma(req: express.Request, res: express.Response) {
    try {
        const connection = this.getDbConnection(req);
        const { turmaId, studentId } = req.params;
        await StudentService.removeStudentFromTurma(connection, Number(turmaId), Number(studentId));
        return res.status(200).json({ message: 'Aluno removido da turma com sucesso!' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para finalizar o semestre de uma turma.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async finalizeTurma(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      await TurmaService.finalizeTurma(connection, Number(id));
      return res.status(200).json({ message: 'Turma finalizada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para reabrir uma turma finalizada.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async reopenTurma(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const { id } = req.params;
      const { password } = req.body;
      
      const isPasswordValid = await AuthService.verifyPassword(connection, professorId, password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Senha incorreta.' });
      }

      await TurmaService.reopenTurma(connection, Number(id));
      return res.status(200).json({ message: 'Turma reaberta com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lida com a requisição para atualizar os dados de uma turma.
   */
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async updateTurma(req: express.Request, res: express.Response) {
    try {
        const connection = this.getDbConnection(req);
        const professorId = req.user!.id;
        const turmaId = parseInt(req.params.id, 10);
        const { nome, semestre, periodo, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória para esta ação.' });
        }
        const isPasswordValid = await AuthService.verifyPassword(connection, professorId, password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        await TurmaService.updateTurma(connection, turmaId, { nome, semestre, periodo }, professorId);
        return res.status(200).json({ message: 'Turma atualizada com sucesso!' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }
}

export default new TurmaController();