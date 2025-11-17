import oracledb from 'oracledb';

export default class CourseService {
  /**
   * Busca todos os cursos pertencentes a uma instituição específica.
   */
  static async getCoursesByInstitution(connection: oracledb.Connection, institutionId: number) {
    try {
      const result = await connection.execute(
        `SELECT Id_Curso, Nome
         FROM Curso
         WHERE Id_Instituicao = :id`,
        [institutionId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (!result.rows) {
          return [];
      }

      return (result.rows as any[]).map(row => ({
          id: row.ID_CURSO,
          name: row.NOME
      }));

    } catch (error: any) {
      console.error('Erro ao listar cursos:', error);
      throw new Error('Erro ao buscar cursos da instituição.');
    }
  }

  /**
   * Cria um novo curso e o associa ao professor que o criou.
   */
  static async createCourse(connection: oracledb.Connection, courseData: { nome: string, sigla: string, semestres: number, idInstituicao: number }, professorId: number): Promise<number> {
    const { nome, sigla, semestres, idInstituicao } = courseData;
    try {
        const result = await connection.execute<{ id: number[] }>(
            `INSERT INTO Curso (Nome, Sigla, Semestres, Id_Instituicao) VALUES (:nome, :sigla, :semestres, :idInstituicao) RETURNING Id_Curso INTO :id`,
            { nome, sigla, semestres, idInstituicao, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } }
        );

        const courseId = result.outBinds!.id[0];

        await connection.execute(
            `INSERT INTO Professor_Curso (Id_Professor, Id_Curso, ULTIMO_ACESSO) VALUES (:professorId, :courseId, SYSTIMESTAMP)`,
            { professorId, courseId }
        );

        await connection.commit();
        return courseId;
    } catch (error: any) {
        await connection.rollback();
        console.error('Erro ao criar curso e associar professor:', error);
        throw new Error('Erro ao criar curso.');
    }
  }

  /**
   * Atualiza os dados de um curso existente.
   */
  static async updateCourse(connection: oracledb.Connection, courseId: number, data: { nome: string, sigla: string, semestres: number }, professorId: number) {
    try {
        const { nome, sigla, semestres } = data;
        const result = await connection.execute(
            `UPDATE Curso SET Nome = :nome, Sigla = :sigla, Semestres = :semestres 
             WHERE Id_Curso = :id AND Id_Instituicao IN (SELECT Id_Instituicao FROM Instituicao WHERE Id_Professor = :professorId)`,
            { nome, sigla, semestres, id: courseId, professorId },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
            throw new Error("Curso não encontrado ou permissão negada.");
        }
    } catch (error: any) {
        console.error('Erro ao atualizar curso:', error);
        throw new Error('Erro ao atualizar curso.');
    }
  }

  /**
   * Exclui um curso e todas as suas disciplinas associadas.
   */
  static async deleteCourse(connection: oracledb.Connection, courseId: number, professorId: number) {
    try {
      const checkResult = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM Instituicao i
         JOIN Curso c ON i.Id_Instituicao = c.Id_Instituicao
         WHERE i.Id_Professor = :professorId AND c.Id_Curso = :courseId`,
        { professorId, courseId }
      );

      const checkRows = checkResult.rows as [number][];
      if (checkRows[0][0] === 0) {
        throw new Error("Permissão negada para excluir este curso.");
      }

      await connection.execute(
        `DELETE FROM Disciplina WHERE Id_Curso = :id`,
        { id: courseId }
      );

      await connection.execute(
        `DELETE FROM Curso WHERE Id_Curso = :id`,
        { id: courseId }
      );

      await connection.commit();
    } catch (error: any) {
      await connection.rollback();
      console.error('Erro ao excluir curso:', error);
      throw error;
    }
  }
}