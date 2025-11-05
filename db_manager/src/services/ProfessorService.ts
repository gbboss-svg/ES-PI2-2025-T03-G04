import oracledb from 'oracledb';
import { getConnection } from '../database/db';

export default class ProfessorService {
  //  Verifica se é o primeiro acesso
  static async isFirstAccess(professorId: number): Promise<boolean> {
    let connection;

    try {
      connection = await getConnection();

      const result = await connection.execute(
        `SELECT PRIMEIRO_ACESSO FROM professores WHERE id = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const primeiroAcesso = (result.rows?.[0] as any)?.PRIMEIRO_ACESSO ?? 0;
      return primeiroAcesso === 1; // true = primeiro acesso

    } catch (error: any) {
      console.error('Erro ao verificar primeiro acesso:', error.message);
      console.error('Stack completa:', error);
      throw new Error('Erro ao verificar primeiro acesso do professor.');
    }
     finally {
      if (connection) {
        await connection.close();
      }
    }
  }


  // Método para listar instituições do professor (ajustado para novo modelo SQL)
  static async getInstituicoes(professorId: number) {
    let connection;
    try {
      connection = await getConnection();
      // Exemplo: busca todas Instituicoes (ajuste conforme modelo relacional)
      const result = await connection.execute(
        `SELECT Id_Instituicao, Nome FROM Instituicao`,
        [],
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

  // Método para listar cursos do professor (ajustado para novo modelo SQL)
  static async getCursos(professorId: number) {
    let connection;
    try {
      connection = await getConnection();
      // Busca todos Cursos (agora sem Sigla/Semestres)
      const result = await connection.execute(
        `SELECT Id_Curso, Nome, Id_Instituicao FROM Curso`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows || [];
    } catch (error: any) {
      console.error('Erro ao listar cursos:', error);
      throw new Error('Erro ao buscar cursos do professor.');
    } finally {
      if (connection) await connection.close();
    }
  }


  // Método para criar uma nova instituição (ajustado para novo modelo SQL)
  static async createInstitution(nome: string): Promise<number> {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO Instituicao (Nome) VALUES (:nome) RETURNING Id_Instituicao INTO :id`,
        { nome, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: true }
      );
      return (result.outBinds as any).id[0];
    } catch (error: any) {
      console.error('Erro ao criar instituição:', error);
      throw new Error('Erro ao criar instituição.');
    } finally {
      if (connection) await connection.close();
    }
  }

  // Método para criar um novo curso (ajustado para novo modelo SQL)
  static async createCourse(nome: string, idInstituicao: number): Promise<number> {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO Curso (Nome, Id_Instituicao) VALUES (:nome, :idInstituicao) RETURNING Id_Curso INTO :id`,
        { nome, idInstituicao, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: true }
      );
      return (result.outBinds as any).id[0];
    } catch (error: any) {
      console.error('Erro ao criar curso:', error);
      throw new Error('Erro ao criar curso.');
    } finally {
      if (connection) await connection.close();
    }
  }

  // Método para atualizar o status de primeiro acesso do professor
  static async updateProfessorFirstAccess(professorId: number, isFirstAccess: boolean): Promise<void> {
    let connection;
    try {
      connection = await getConnection();
      await connection.execute(
        `UPDATE professores SET primeiro_acesso = :primeiroAcesso WHERE id = :professorId`,
        { primeiroAcesso: isFirstAccess ? 1 : 0, professorId },
        { autoCommit: true }
      );
    } catch (error: any) {
      console.error('Erro ao atualizar status de primeiro acesso do professor:', error);
      throw new Error('Erro ao atualizar status de primeiro acesso do professor.');
    } finally {
      if (connection) await connection.close();
    }
  }
}
