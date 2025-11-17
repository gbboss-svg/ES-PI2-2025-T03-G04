

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import GradeService from '../services/GradeService';
import oracledb from 'oracledb';

class GradeController {
  /**
   * Obtém a conexão de banco de dados anexada ao objeto de requisição pelo middleware.
   */
  
  private getDbConnection(req: ExpressRequest): oracledb.Connection {
    if (!req.dbConnection) {
      throw new Error('Database connection not found in request. Ensure connectionMiddleware is applied.');
    }
    return req.dbConnection;
  }

  /**
   * Lida com a requisição para atualizar (ou inserir) as notas de um aluno específico em uma turma.
   */
  
  async updateStudentGrades(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const { turmaId, studentId } = req.params;
      const { grades } = req.body;

      await GradeService.updateStudentGrades(connection, parseInt(turmaId, 10), parseInt(studentId, 10), grades, professorId);
      return res.status(200).json({ message: 'Notas do aluno atualizadas com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new GradeController();