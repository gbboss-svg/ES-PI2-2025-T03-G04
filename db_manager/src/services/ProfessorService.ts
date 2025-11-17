import oracledb from 'oracledb';

export default class ProfessorService {
  /**
   * Verifica se é o primeiro acesso de um professor.
   */
  static async isFirstAccess(connection: oracledb.Connection, professorId: number): Promise<boolean> {
    try {
      const result = await connection.execute(
        `SELECT COUNT(*) AS total FROM Instituicao WHERE Id_Professor = :id`,
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

  /**
   * Busca todas as instituições associadas a um professor.
   */
  static async getInstituicoes(connection: oracledb.Connection, professorId: number) {
    try {
      // A consulta foi reescrita para ser mais robusta, garantindo que todas as
      // instituições relacionadas (propriedade direta, associação por curso ou disciplina)
      // sejam corretamente buscadas.
      const result = await connection.execute(
        `SELECT
            i.Id_Instituicao,
            i.Nome,
            MAX(pc.ULTIMO_ACESSO) as LastAccess
        FROM
            Instituicao i
        LEFT JOIN
            Curso c ON i.Id_Instituicao = c.Id_Instituicao
        LEFT JOIN
            Professor_Curso pc ON c.Id_Curso = pc.Id_Curso AND pc.Id_Professor = :id
        WHERE i.Id_Instituicao IN (
            SELECT Id_Instituicao FROM INSTITUICAO WHERE Id_Professor = :id
            UNION
            SELECT c_sub.Id_Instituicao FROM Curso c_sub JOIN Professor_Curso pc_sub ON c_sub.Id_Curso = pc_sub.Id_Curso WHERE pc_sub.Id_Professor = :id
            UNION
            SELECT c2.Id_Instituicao FROM Disciplina d JOIN Professor_Disciplina pd ON d.Id_Disciplina = pd.Id_Disciplina JOIN Curso c2 ON d.Id_Curso = c2.Id_Curso WHERE pd.Id_Professor = :id
        )
        GROUP BY
            i.Id_Instituicao, i.Nome
        ORDER BY
            LastAccess DESC NULLS LAST`,
        { id: professorId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows) return [];

      return (result.rows as any[]).map(row => ({ id: row.ID_INSTITUICAO, name: row.NOME, courses: [] }));
    } catch (error: any) {
      console.error('Erro ao listar instituições:', error);
      throw new Error('Erro ao buscar instituições do professor.');
    }
  }

  /**
   * Busca todos os cursos associados a um professor.
   */
  static async getCursos(connection: oracledb.Connection, professorId: number) {
    try {
      const result = await connection.execute(
        `SELECT
            c.Id_Curso, c.Nome AS NomeCurso, c.Sigla, c.Semestres,
            i.Id_Instituicao, i.Nome AS NomeInstituicao,
            pc.ULTIMO_ACESSO
        FROM Curso c
        JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
        LEFT JOIN Professor_Curso pc ON c.Id_Curso = pc.Id_Curso AND pc.Id_Professor = :id
        WHERE i.Id_Professor = :id OR c.Id_Curso IN (
            SELECT Id_Curso FROM Professor_Curso WHERE Id_Professor = :id
            UNION
            SELECT d.Id_Curso FROM Disciplina d JOIN Professor_Disciplina pd ON d.Id_Disciplina = pd.Id_Disciplina WHERE pd.Id_Professor = :id
        )
        GROUP BY c.Id_Curso, c.Nome, c.Sigla, c.Semestres, i.Id_Instituicao, i.Nome, pc.ULTIMO_ACESSO
        ORDER BY pc.ULTIMO_ACESSO DESC NULLS LAST`,
        { id: professorId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows) return [];

      return (result.rows as any[]).map(row => ({
        id: row.ID_CURSO, name: row.NOMECURSO, sigla: row.SIGLA, semestres: row.SEMESTRES,
        institutionId: row.ID_INSTITUICAO, institutionName: row.NOMEINSTITUICAO
      }));
    } catch (error: any) {
      console.error('Erro ao listar cursos:', error);
      throw new Error('Erro ao buscar cursos do professor.');
    }
  }

  /**
   * Cria uma associação entre um professor e um curso.
   */
  static async associateProfessorToCourse(connection: oracledb.Connection, professorId: number, courseId: number): Promise<void> {
    try {
      await connection.execute(
        `INSERT INTO Professor_Curso (Id_Professor, Id_Curso) VALUES (:professorId, :courseId)`,
        { professorId, courseId },
        { autoCommit: true }
      );
    } catch (error: any) {
      if (error.errorNum === 1) {
        console.log(`Associação entre Professor ID ${professorId} e Curso ID ${courseId} já existe.`);
        return;
      }
      console.error('Erro ao associar professor ao curso:', error);
      throw new Error('Erro ao associar professor ao curso.');
    }
  }

  /**
   * Busca os dados de perfil de um professor pelo seu ID.
   */
  static async getProfessorById(connection: oracledb.Connection, professorId: number): Promise<any | null> {
    try {
      const result = await connection.execute(
        `SELECT Nome, Cpf, Email, Celular FROM professores WHERE Id_Professor = :id`,
        [professorId], { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      if (!result.rows || result.rows.length === 0) return null;
  
      const professorData: any = result.rows[0];
      return { name: professorData.NOME, cpf: professorData.CPF, email: professorData.EMAIL, telefone: professorData.CELULAR };
    } catch (error: any) {
      console.error('Erro ao buscar dados do professor:', error);
      throw new Error('Erro ao buscar dados do professor.');
    }
  }

  /**
   * Atualiza o timestamp de último acesso de um professor a um curso.
   */
  static async updateCourseAccessTimestamp(connection: oracledb.Connection, professorId: number, courseId: number): Promise<void> {
    try {
      await connection.execute(
        `MERGE INTO Professor_Curso pc
         USING (SELECT :professorId AS Id_Professor, :courseId AS Id_Curso FROM dual) src
         ON (pc.Id_Professor = src.Id_Professor AND pc.Id_Curso = src.Id_Curso)
         WHEN MATCHED THEN UPDATE SET pc.ULTIMO_ACESSO = SYSTIMESTAMP
         WHEN NOT MATCHED THEN INSERT (Id_Professor, Id_Curso, ULTIMO_ACESSO) VALUES (src.Id_Professor, src.Id_Curso, SYSTIMESTAMP)`,
        { professorId, courseId },
        { autoCommit: true }
      );
    } catch (error: any) {
      console.error('Erro ao atualizar o timestamp de acesso ao curso:', error);
      throw new Error('Erro ao registrar acesso ao curso.');
    }
  }
}