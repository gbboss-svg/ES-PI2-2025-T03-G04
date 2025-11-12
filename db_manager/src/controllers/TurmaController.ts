





import { Request, Response } from 'express';
import TurmaService from '../services/TurmaService';
import StudentService from '../services/StudentService';
import AuthService from '../services/AuthService';
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
      const professorId = req.user!.id;
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

  async batchAddStudentsToTurma(req: Request, res: Response) {
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

  async updateStudentGrades(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const { turmaId, studentId } = req.params;
      const { grades } = req.body;
      await TurmaService.updateStudentGrades(connection, Number(turmaId), Number(studentId), grades);
      return res.status(200).json({ message: 'Notas atualizadas com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteTurma(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      await TurmaService.deleteTurma(connection, Number(id));
      return res.status(200).json({ message: 'Turma excluída com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async removeStudentFromTurma(req: Request, res: Response) {
    try {
        const connection = this.getDbConnection(req);
        const { turmaId, studentId } = req.params;
        await StudentService.removeStudentFromTurma(connection, Number(turmaId), Number(studentId));
        return res.status(200).json({ message: 'Aluno removido da turma com sucesso!' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }

  async finalizeTurma(req: Request, res: Response) {
    try {
      const connection = this.getDbConnection(req);
      const { id } = req.params;
      await TurmaService.finalizeTurma(connection, Number(id));
      return res.status(200).json({ message: 'Turma finalizada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async reopenTurma(req: Request, res: Response) {
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

  async updateTurma(req: Request, res: Response) {
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