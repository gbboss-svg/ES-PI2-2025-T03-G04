import oracledb from 'oracledb';
import { getConnection } from '../database/db';

export default class DisciplineService {
  // Método para listar disciplinas de um curso
  static async getDisciplinesByCourse(courseId: number) {
    let connection;

    try {
      connection = await getConnection();

      const result = await connection.execute(
        `SELECT Id_Disciplina, Nome, Sigla, Periodo 
         FROM Disciplina 
         WHERE Id_Curso = :id`,
        [courseId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows || [];
    } catch (error: any) {
      console.error('Erro ao listar disciplinas:', error);
      throw new Error('Erro ao buscar disciplinas do curso.');
    } finally {
      if (connection) await connection.close();
    }
  }
}
