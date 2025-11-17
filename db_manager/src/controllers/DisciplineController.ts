

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import DisciplineService from '../services/DisciplineService';
import AuthService from '../services/AuthService';
import oracledb from 'oracledb';

class DisciplineController {
  
  private getDbConnection(req: ExpressRequest): oracledb.Connection {
    if (!req.dbConnection) {
      throw new Error('Database connection not found in request. Ensure connectionMiddleware is applied.');
    }
    return req.dbConnection;
  }

  
  async createDiscipline(req: ExpressRequest, res: ExpressResponse) {
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

  
  async getDisciplinesByProfessor(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const disciplines = await DisciplineService.getDisciplinesByProfessor(connection, professorId);
      return res.status(200).json(disciplines);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  
  async getDisciplinesByCourse(req: ExpressRequest, res: ExpressResponse) {
    try {
        const connection = this.getDbConnection(req);
        const { courseId } = req.params;
        const disciplines = await DisciplineService.getDisciplinesByCourse(connection, Number(courseId));
        return res.status(200).json(disciplines);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
  }

  
  async updateDiscipline(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const disciplineId = Number(req.params.id);
      const { password, ...disciplineData } = req.body;

      // A senha agora só é exigida para alterar dados estruturais, não para fórmulas ou componentes.
      const structuralFields = ['nome', 'sigla', 'periodo', 'idCurso'];
      const isStructuralUpdate = structuralFields.some(field => field in disciplineData);

      if (isStructuralUpdate) {
          if (!password) {
              return res.status(400).json({ message: 'A senha é obrigatória para alterar dados da disciplina.' });
          }
          const isPasswordValid = await AuthService.verifyPassword(connection, professorId, password);
          if (!isPasswordValid) {
              return res.status(401).json({ message: 'Senha incorreta.' });
          }
      }

      await DisciplineService.updateDiscipline(connection, disciplineId, disciplineData, professorId);
      return res.status(200).json({ message: 'Disciplina atualizada com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  
  async deleteDiscipline(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const professorId = req.user!.id;
      const disciplineId = Number(req.params.id);
      await DisciplineService.deleteDiscipline(connection, disciplineId, professorId);
      return res.status(200).json({ message: 'Disciplina excluída com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new DisciplineController();