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

  // Método para listar instituições do professor
  static async getInstituicoes(professorId: number) {
    let connection;

    try {
      connection = await getConnection();

      const result = await connection.execute(
        `SELECT i.id, i.nome, i.cnpj, i.endereco, i.data_criacao 
         FROM instituicoes i
         JOIN professor_instituicao_curso pic ON i.id = pic.instituicao_id
         WHERE pic.professor_id = :id`,
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

  // Método para listar cursos do professor
  static async getCursos(professorId: number) {
    let connection;

    try {
      connection = await getConnection();

      const result = await connection.execute(
        `SELECT c.id, c.nome, c.data_criacao 
         FROM cursos c
         JOIN professor_instituicao_curso pic ON c.id = pic.curso_id
         WHERE pic.professor_id = :id`,
        [professorId],
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

  // Método para criar uma nova instituição
  static async createInstitution(nome: string, cnpj: string, endereco: string, professorId: number): Promise<number> {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO instituicoes (nome, cnpj, endereco) VALUES (:nome, :cnpj, :endereco) RETURNING id INTO :id`,
        { nome, cnpj, endereco, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: false } // Desativa o autoCommit para a transação
      );
      const institutionId = (result.outBinds as any).id[0];

      // Associa a nova instituição ao professor
      await connection.execute(
        `INSERT INTO professor_instituicao_curso (professor_id, instituicao_id) VALUES (:professorId, :institutionId)`,
        { professorId, institutionId },
        { autoCommit: true } // Comita a transação
      );

      return institutionId;
    } catch (error: any) {
      if (connection) await connection.rollback(); // Rollback em caso de erro
      console.error('Erro ao criar instituição:', error);
      throw new Error('Erro ao criar instituição.');
    } finally {
      if (connection) await connection.close();
    }
  }

  // Método para criar um novo curso
  static async createCourse(nome: string): Promise<number> {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO cursos (nome) VALUES (:nome) RETURNING id INTO :id`,
        { nome, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
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

  // Método para associar professor, instituição e curso
  static async associateProfessorToInstitutionCourse(professorId: number, institutionId: number, courseId: number): Promise<void> {
    let connection;
    try {
      connection = await getConnection();
      await connection.execute(
        `INSERT INTO professor_instituicao_curso (professor_id, instituicao_id, curso_id) VALUES (:professorId, :institutionId, :courseId)`,
        { professorId, institutionId, courseId },
        { autoCommit: true }
      );
    } catch (error: any) {
      console.error('Erro ao associar professor, instituição e curso:', error);
      throw new Error('Erro ao associar professor, instituição e curso.');
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
