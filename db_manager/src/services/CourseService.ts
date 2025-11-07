import oracledb from 'oracledb';
import { getConnection } from '../database/db';

export default class CourseService {
  // Método para listar cursos de uma instituição
  static async getCoursesByInstitution(institutionId: number) {
    let connection;

    try {
      connection = await getConnection();

      const result = await connection.execute(
        `SELECT Id_Curso, Nome 
         FROM Curso 
         WHERE Id_Instituicao = :id`,
        [institutionId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows || [];
    } catch (error: any) {
      console.error('Erro ao listar cursos:', error);
      throw new Error('Erro ao buscar cursos da instituição.');
    } finally {
      if (connection) await connection.close();
    }
  }
}
