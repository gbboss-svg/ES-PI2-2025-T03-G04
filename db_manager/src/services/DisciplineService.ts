  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   */

import oracledb from 'oracledb';

export default class DisciplineService {
  /**
   * Busca todas as disciplinas de um curso específico, incluindo seus componentes de nota.
   */
  static async getDisciplinesByCourse(connection: oracledb.Connection, courseId: number) {
    try {
      const result = await connection.execute(
        `SELECT Id_Disciplina, Nome, Sigla, Periodo, Formula_Calculo, Nota_Maxima
         FROM Disciplina
         WHERE Id_Curso = :id`,
        [courseId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows) return [];

      const disciplines = (result.rows as any[]).map(row => ({
        id: row.ID_DISCIPLINA,
        name: row.NOME,
        sigla: row.SIGLA,
        periodo: row.PERIODO,
        finalGradeFormula: row.FORMULA_CALCULO,
        maxGrade: row.NOTA_MAXIMA,
        gradeComponents: [] as any[]
      }));

      for (const disc of disciplines) {
        const componentsResult = await connection.execute(
          `SELECT Id_Comp, Nome, Sigla, Descricao FROM Componente_Nota WHERE Id_Disciplina = :id`,
          [disc.id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        disc.gradeComponents = (componentsResult.rows as any[]).map(r => ({
          id: r.ID_COMP, name: r.NOME, acronym: r.SIGLA, description: r.DESCRICAO
        }));
      }

      return disciplines;
    } catch (error: any) {
      console.error('Erro ao listar disciplinas:', error);
      throw new Error('Erro ao buscar disciplinas do curso.');
    }
  }

  /**
   * Cria uma nova disciplina e a associa ao professor que a criou.
   */
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

  /**
   * Busca todas as disciplinas associadas a um professor.
   */
  static async getDisciplinesByProfessor(connection: oracledb.Connection, professorId: number) {
    try {
      const result = await connection.execute(
        `SELECT
            d.Id_Disciplina, d.Nome, d.Sigla, d.Periodo, d.Formula_Calculo, d.Nota_Maxima,
            c.Id_Curso, c.Nome AS Curso,
            i.Nome AS Instituicao
         FROM Disciplina d
         JOIN Professor_Disciplina pd ON d.Id_Disciplina = pd.Id_Disciplina
         JOIN Curso c ON d.Id_Curso = c.Id_Curso
         JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
         WHERE pd.Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows) return [];

      const disciplines = (result.rows as any[]).map(row => ({
        id: row.ID_DISCIPLINA,
        name: row.NOME,
        sigla: row.SIGLA,
        periodo: row.PERIODO,
        courseId: row.ID_CURSO,
        courseName: row.CURSO,
        institutionName: row.INSTITUICAO,
        finalGradeFormula: row.FORMULA_CALCULO,
        maxGrade: row.NOTA_MAXIMA,
        gradeComponents: [] as any[]
      }));

      for (const disc of disciplines) {
        const componentsResult = await connection.execute(
          `SELECT Id_Comp, Nome, Sigla, Descricao FROM Componente_Nota WHERE Id_Disciplina = :id`,
          [disc.id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        disc.gradeComponents = (componentsResult.rows as any[]).map(r => ({
          id: r.ID_COMP, name: r.NOME, acronym: r.SIGLA, description: r.DESCRICAO
        }));
      }

      return disciplines;
    } catch (error: any) {
      console.error('Erro ao listar disciplinas do professor:', error);
      throw new Error('Erro ao buscar disciplinas do professor.');
    }
  }

  /**
   * Atualiza os dados de uma disciplina, incluindo seus componentes de nota.
   */
  static async updateDiscipline(connection: oracledb.Connection, disciplineId: number, data: any, professorId: number) {
    try {
      const { nome, sigla, periodo, idCurso, finalGradeFormula, maxGrade, gradeComponents } = data;

      const checkResult = await connection.execute(
        `SELECT COUNT(*) AS total FROM Professor_Disciplina WHERE Id_Disciplina = :disciplineId AND Id_Professor = :professorId`,
        { disciplineId, professorId }
      );
      if ((checkResult.rows as any)[0][0] === 0) {
        throw new Error("Permissão negada para editar esta disciplina.");
      }

      const fieldsToUpdate = [];
      const bindParams: any = { id: disciplineId };
      if (nome !== undefined) { fieldsToUpdate.push("Nome = :nome"); bindParams.nome = nome; }
      if (sigla !== undefined) { fieldsToUpdate.push("Sigla = :sigla"); bindParams.sigla = sigla; }
      if (periodo !== undefined) { fieldsToUpdate.push("Periodo = :periodo"); bindParams.periodo = periodo; }
      if (idCurso !== undefined) { fieldsToUpdate.push("Id_Curso = :idCurso"); bindParams.idCurso = idCurso; }
      if (finalGradeFormula !== undefined) { fieldsToUpdate.push("Formula_Calculo = :finalGradeFormula"); bindParams.finalGradeFormula = finalGradeFormula; }
      if (maxGrade !== undefined) { fieldsToUpdate.push("Nota_Maxima = :maxGrade"); bindParams.maxGrade = maxGrade; }

      if (fieldsToUpdate.length > 0) {
        const sql = `UPDATE Disciplina SET ${fieldsToUpdate.join(', ')} WHERE Id_Disciplina = :id`;
        await connection.execute(sql, bindParams);
      }
      
      if (gradeComponents && Array.isArray(gradeComponents)) {
        await connection.execute(`DELETE FROM Componente_Nota WHERE Id_Disciplina = :id`, { id: disciplineId });
        for (const comp of gradeComponents) {
          await connection.execute(
            `INSERT INTO Componente_Nota (Id_Disciplina, Nome, Sigla, Descricao)
             VALUES (:discId, :name, :acronym, :description)`,
            { discId: disciplineId, name: comp.name, acronym: comp.acronym, description: comp.description || null }
          );
        }
      }

      await connection.commit();
    } catch (error: any) {
      await connection.rollback();
      console.error('Erro ao atualizar disciplina:', error);
      throw error;
    }
  }

  /**
   * Exclui uma disciplina.
   */
  static async deleteDiscipline(connection: oracledb.Connection, disciplineId: number, professorId: number) {
    try {
      const checkResult = await connection.execute(
        `SELECT COUNT(*) AS total FROM Professor_Disciplina WHERE Id_Disciplina = :disciplineId AND Id_Professor = :professorId`,
        { disciplineId, professorId }
      );
      if ((checkResult.rows as any)[0][0] === 0) {
        throw new Error("Permissão negada para excluir esta disciplina.");
      }

      await connection.execute(`DELETE FROM Disciplina WHERE Id_Disciplina = :id`, { id: disciplineId });
      
      await connection.commit();
    } catch (error: any) {
      await connection.rollback();
      console.error('Erro ao excluir disciplina:', error);
      throw error;
    }
  }
}