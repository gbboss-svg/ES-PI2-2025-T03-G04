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

      if (!result.rows) {
        return [];
      }

      // Mapeia as chaves para camelCase para padronizar com o frontend
      return (result.rows as any[]).map(row => ({
        id: row.ID_DISCIPLINA,
        name: row.NOME,
        sigla: row.SIGLA,
        periodo: row.PERIODO
      }));
    } catch (error: any) {
      console.error('Erro ao listar disciplinas:', error);
      throw new Error('Erro ao buscar disciplinas do curso.');
    }
  }

  static async createDiscipline(connection: oracledb.Connection, disciplineData: any, professorId: number) {
    const { nome, sigla, periodo, idCurso } = disciplineData;
    try {
      const result = await connection.execute(
        `INSERT INTO Disciplina (Nome, Sigla, Periodo, Id_Curso)
         VALUES (:nome, :sigla, :periodo, :idCurso)
         RETURNING Id_Disciplina INTO :id`,
        { nome, sigla, periodo, idCurso, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } }
      );

      const disciplineId = (result.outBinds as any).id[0];

      await connection.execute(
        `INSERT INTO Professor_Disciplina (Id_Professor, Id_Disciplina)
         VALUES (:professorId, :disciplineId)`,
        { professorId, disciplineId }
      );
      
      await connection.commit();

      return disciplineId;
    } catch (error: any) {
      await connection.rollback();
      console.error('Erro ao criar disciplina:', error);
      throw new Error('Erro ao criar disciplina.');
    }
  }

  static async getDisciplinesByProfessor(connection: oracledb.Connection, professorId: number) {
    try {
      const result = await connection.execute(
        `SELECT d.Id_Disciplina, d.Nome, d.Sigla, d.Periodo, c.Id_Curso, c.Nome AS Curso
         FROM Disciplina d
         JOIN Curso c ON d.Id_Curso = c.Id_Curso
         JOIN Professor_Disciplina pd ON d.Id_Disciplina = pd.Id_Disciplina
         WHERE pd.Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows) {
        return [];
      }

      return (result.rows as any[]).map(row => ({
        id: row.ID_DISCIPLINA,
        name: row.NOME,
        sigla: row.SIGLA,
        periodo: row.PERIODO,
        cursoId: row.ID_CURSO,
        curso: row.CURSO
      }));
    } catch (error: any) {
      console.error('Erro ao listar disciplinas do professor:', error);
      throw new Error('Erro ao buscar disciplinas do professor.');
    }
  }
}
