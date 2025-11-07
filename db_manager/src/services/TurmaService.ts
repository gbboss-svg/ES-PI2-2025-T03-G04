import oracledb from 'oracledb';
import { getConnection } from '../database/db';

export default class TurmaService {
  // Método para listar turmas de uma disciplina
  static async getTurmasByDiscipline(disciplineId: number) {
    let connection;

    try {
      connection = await getConnection();

      const result = await connection.execute(
        `SELECT Id_Turma 
         FROM Turma 
         WHERE Id_Disciplina = :id`,
        [disciplineId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows || [];
    } catch (error: any) {
      console.error('Erro ao listar turmas:', error);
      throw new Error('Erro ao buscar turmas da disciplina.');
    } finally {
      if (connection) await connection.close();
    }
  }
}
