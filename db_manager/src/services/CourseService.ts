import oracledb from 'oracledb';

export default class CourseService {
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

      // Mapeia as chaves para camelCase para padronizar com o frontend
      return (result.rows as any[]).map(row => ({
          id: row.ID_CURSO,
          name: row.NOME
      }));

    } catch (error: any) {
      console.error('Erro ao listar cursos:', error);
      throw new Error('Erro ao buscar cursos da instituição.');
    }
  }

  static async deleteCourse(connection: oracledb.Connection, courseId: number, professorId: number) {
    try {
      const checkResult = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM professores p
         JOIN Instituicao i ON p.Id_Professor = i.Id_Professor
         JOIN Curso c ON i.Id_Instituicao = c.Id_Instituicao
         WHERE p.Id_Professor = :professorId AND c.Id_Curso = :courseId`,
        { professorId, courseId }
      );

      if ((checkResult.rows as any)[0][0] === 0) {
        throw new Error("Permissão negada para excluir este curso.");
      }

      // Primeiro, excluir as disciplinas associadas ao curso
      await connection.execute(
        `DELETE FROM Disciplina WHERE Id_Curso = :id`,
        { id: courseId }
      );

      // Depois, excluir o curso
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
