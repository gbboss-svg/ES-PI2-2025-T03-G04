import oracledb from 'oracledb';

export default class ProfessorService {
  static async isFirstAccess(connection: oracledb.Connection, professorId: number): Promise<boolean> {
    try {
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
    }
  }

  static async getInstituicoes(connection: oracledb.Connection, professorId: number) {
    try {
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
    }
  }

  static async getCursos(connection: oracledb.Connection, professorId: number) {
    try {
      const result = await connection.execute(
        `SELECT c.Id_Curso, c.Nome AS NomeCurso, i.Nome AS NomeInstituicao
         FROM Curso c
         JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
         WHERE i.Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows || [];
    } catch (error: any) {
      console.error('Erro ao listar cursos:', error);
      throw new Error('Erro ao buscar cursos do professor.');
    }
  }

  static async createInstitution(connection: oracledb.Connection, nome: string, professorId: number): Promise<number> {
    try {
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO Instituicao (Nome, Id_Professor) VALUES (:nome, :professorId) RETURNING Id_Instituicao INTO :id`,
        { nome, professorId, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: true }
      );
      return (result.outBinds as any).id[0];
    } catch (error: any) {
      console.error('Erro ao criar instituição:', error);
      throw new Error('Erro ao criar instituição.');
    }
  }

  static async createCourse(connection: oracledb.Connection, nome: string, idInstituicao: number): Promise<number> {
    try {
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO Curso (Nome, Id_Instituicao) VALUES (:nome, :idInstituicao) RETURNING Id_Curso INTO :id`,
        { nome, idInstituicao, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: true }
      );
      return (result.outBinds as any).id[0];
    } catch (error: any) {
      console.error('Erro ao criar curso:', error);
      throw new Error('Erro ao criar curso.');
    }
  }
}
