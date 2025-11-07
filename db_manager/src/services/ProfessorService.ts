import oracledb from 'oracledb';
import { getConnection } from '../database/db';

export default class ProfessorService {
  //  Verifica se é o primeiro acesso
  static async isFirstAccess(professorId: number): Promise<boolean> {
    let connection;

    try {
      connection = await getConnection();

      const result = await connection.execute(
        `SELECT COUNT(*) AS total 
         FROM Instituicao 
         WHERE Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const count = (result.rows?.[0] as any)?.TOTAL || 0;
      return count === 0;

    } catch (error: any) {
      console.error('Erro ao verificar primeiro acesso:', error);
      throw new Error('Erro ao verificar primeiro acesso do professor.');
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Método para listar instituições do professor
  static async getInstituicoes(professorId: number) {
    let connection;

    try {
      connection = await getConnection();

      const result = await connection.execute(
        `SELECT Id_Instituicao, Nome 
         FROM Instituicao 
         WHERE Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows || [];
    } catch (error: any) {
      console.error('Erro ao listar instituições:', error);
      throw new Error('Erro ao buscar instituições do professor.');
    } finally {
      if (connection) await connection.close();
    }
  }
}
