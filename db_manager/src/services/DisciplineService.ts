import oracledb from 'oracledb';

export default class DisciplineService {
  static async getDisciplinesByCourse(connection: oracledb.Connection, courseId: number) {
    try {
      const result = await connection.execute(
        `SELECT Id_Disciplina, Nome, Sigla, Periodo
         FROM Disciplina
         WHERE Id_Curso = :id`,
        [courseId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows || [];
    } catch (error: any) {
      console.error('Erro ao listar disciplinas:', error);
      throw new Error('Erro ao buscar disciplinas do curso.');
    }
  }
}
