import oracledb from 'oracledb';

export default class TurmaService {
  static async getTurmasByDiscipline(connection: oracledb.Connection, disciplineId: number) {
    try {
      const result = await connection.execute(
        `SELECT Id_Turma
         FROM Turma
         WHERE Id_Disciplina = :id`,
        [disciplineId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows || [];
    } catch (error: any) {
      console.error('Erro ao listar turmas:', error);
      throw new Error('Erro ao buscar turmas da disciplina.');
    }
  }
}
