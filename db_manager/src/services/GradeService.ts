  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   *Desevolvido por:Victória Beatriz Nobre Andrade - R.A:25016398
   */

import oracledb from 'oracledb';

export default class GradeService {
  /**
   * Atualiza as notas de um aluno em uma turma específica.
   */
  static async updateStudentGrades(connection: oracledb.Connection, turmaId: number, studentId: number, grades: any, professorId: number) {
    try {
      const permissionResult = await connection.execute(
        `SELECT COUNT(*) AS count
         FROM Turma t
         JOIN Professor_Disciplina pd ON t.Id_Disciplina = pd.Id_Disciplina
         WHERE t.Id_Turma = :turmaId AND pd.Id_Professor = :professorId`,
        { turmaId, professorId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const permissionRow = permissionResult.rows?.[0] as any;
      if (!permissionRow || permissionRow.COUNT === 0) {
        throw new Error('O professor não tem permissão para modificar esta turma.');
      }

      for (const acronym in grades) {
        const gradeValue = grades[acronym];
        const componentResult = await connection.execute(
          `SELECT Id_Comp FROM Componente_Nota WHERE Sigla = :acronym AND Id_Disciplina = (SELECT Id_Disciplina FROM Turma WHERE Id_Turma = :turmaId)`,
          { acronym, turmaId },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const componentRow = componentResult.rows?.[0] as any;
        if (componentRow) {
          const componentId = componentRow.ID_COMP;
          
          const existingGradeResult = await connection.execute(
            `SELECT COUNT(*) AS count FROM NOTAS WHERE Matricula = :studentId AND Id_Comp = :componentId AND Id_Turma = :turmaId`,
            { studentId, componentId, turmaId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );

          const existingGradeRow = existingGradeResult.rows?.[0] as any;
          if (existingGradeRow && existingGradeRow.COUNT > 0) {
            await connection.execute(
              `UPDATE NOTAS SET Pontuacao = :gradeValue WHERE Matricula = :studentId AND Id_Comp = :componentId AND Id_Turma = :turmaId`,
              { gradeValue, studentId, componentId, turmaId }
            );
          } else {
            await connection.execute(
              `INSERT INTO NOTAS (Id_Turma, Matricula, Id_Comp, Pontuacao) VALUES (:turmaId, :studentId, :componentId, :gradeValue)`,
              { turmaId, studentId, componentId, gradeValue }
            );
          }
        }
      }
      await connection.commit();
    } catch (error: any) {
      await connection.rollback();
      console.error('Erro ao atualizar notas do aluno:', error);
      throw new Error('Erro ao atualizar notas do aluno.');
    }
  }
}