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

      return result.rows || [];
    } catch (error: any) {
      console.error('Erro ao listar cursos:', error);
      throw new Error('Erro ao buscar cursos da instituição.');
    }
  }
}
