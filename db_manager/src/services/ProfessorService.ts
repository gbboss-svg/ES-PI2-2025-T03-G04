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

  static async createCourse(connection: oracledb.Connection, nome: string, sigla: string, semestres: number, idInstituicao: number): Promise<number> {
    try {
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO Curso (Nome, Sigla, Semestres, Id_Instituicao) VALUES (:nome, :sigla, :semestres, :idInstituicao) RETURNING Id_Curso INTO :id`,
        { nome, sigla, semestres, idInstituicao, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: true }
      );
      return (result.outBinds as any).id[0];
    } catch (error: any) {
      console.error('Erro ao criar curso:', error);
      throw new Error('Erro ao criar curso.');
    }
  }

  static async associateProfessorToCourse(connection: oracledb.Connection, professorId: number, courseId: number): Promise<void> {
    try {
      await connection.execute(
        `INSERT INTO Professor_Curso (Id_Professor, Id_Curso) VALUES (:professorId, :courseId)`,
        { professorId, courseId },
        { autoCommit: true }
      );
    } catch (error: any) {
      // Ignora o erro de chave única duplicada (caso a associação já exista)
      if (error.errorNum === 1) {
        console.log(`Associação entre Professor ID ${professorId} e Curso ID ${courseId} já existe.`);
        return;
      }
      console.error('Erro ao associar professor ao curso:', error);
      throw new Error('Erro ao associar professor ao curso.');
    }
  }

  static async getProfessorById(connection: oracledb.Connection, professorId: number): Promise<{ NOME: string } | null> {
    try {
      const result = await connection.execute<{ NOME: string }>(
        `SELECT Nome FROM professores WHERE Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows?.[0] || null;
    } catch (error: any) {
      console.error('Erro ao buscar dados do professor:', error);
      throw new Error('Erro ao buscar dados do professor.');
    }
  }
}
