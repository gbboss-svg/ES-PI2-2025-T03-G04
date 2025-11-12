
import oracledb from 'oracledb';

export default class TurmaService {
  static async getTurmasByDiscipline(connection: oracledb.Connection, disciplineId: number) {
    try {
      const result = await connection.execute(
        `SELECT 
            t.Id_Turma, t.Nome AS NomeTurma, t.Finalizado, t.Semestre, t.Periodo,
            d.Id_Disciplina, d.Nome AS NomeDisciplina,
            c.Id_Curso, c.Nome AS NomeCurso,
            i.Id_Instituicao, i.Nome AS NomeInstituicao
         FROM Turma t
         JOIN Disciplina d ON t.Id_Disciplina = d.Id_Disciplina
         JOIN Curso c ON d.Id_Curso = c.Id_Curso
         JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
         WHERE t.Id_Disciplina = :id`,
        [disciplineId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows) {
        return [];
      }

      return (result.rows as any[]).map(row => ({
        id: row.ID_TURMA,
        name: row.NOMETURMA,
        semestre: row.SEMESTRE,
        periodo: row.PERIODO,
        isFinalized: row.FINALIZADO === 1,
        discipline: {
          id: row.ID_DISCIPLINA,
          name: row.NOMEDISCIPLINA,
        },
        course: {
          id: row.ID_CURSO,
          name: row.NOMECURSO,
        },
        institution: {
          id: row.ID_INSTITUICAO,
          name: row.NOMEINSTITUICAO,
        }
      }));
    } catch (error: any) {
      console.error('Erro ao listar turmas:', error);
      throw new Error('Erro ao buscar turmas da disciplina.');
    }
  }

  static async getActiveTurmasByProfessor(connection: oracledb.Connection, professorId: number) {
    try {
      const result = await connection.execute(
        `SELECT 
            t.Id_Turma, t.Nome AS NomeTurma, t.Finalizado,
            d.Id_Disciplina, d.Nome AS NomeDisciplina,
            c.Id_Curso, c.Nome AS NomeCurso,
            i.Id_Instituicao, i.Nome AS NomeInstituicao
         FROM Turma t
         JOIN Disciplina d ON t.Id_Disciplina = d.Id_Disciplina
         JOIN Curso c ON d.Id_Curso = c.Id_Curso
         JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
         WHERE t.Finalizado = 0 AND i.Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows) {
        return [];
      }

      return (result.rows as any[]).map(row => ({
        id: row.ID_TURMA,
        name: row.NOMETURMA,
        isFinalized: row.FINALIZADO === 1,
        discipline: {
          id: row.ID_DISCIPLINA,
          name: row.NOMEDISCIPLINA,
        },
        course: {
          id: row.ID_CURSO,
          name: row.NOMECURSO,
        },
        institution: {
          id: row.ID_INSTITUICAO,
          name: row.NOMEINSTITUICAO,
        }
      }));
    } catch (error: any) {
      console.error('Erro ao listar turmas ativas:', error);
      throw new Error('Erro ao buscar turmas ativas do professor.');
    }
  }

  static async createTurma(connection: oracledb.Connection, turma: { nome: string, idDisciplina: number, semestre: string, periodo: string }) {
    try {
      const result = await connection.execute(
        `INSERT INTO Turma (Nome, Id_Disciplina, Semestre, Periodo, Finalizado)
         VALUES (:nome, :idDisciplina, :semestre, :periodo, 0)
         RETURNING Id_Turma INTO :id`,
        {
          nome: turma.nome,
          idDisciplina: turma.idDisciplina,
          semestre: turma.semestre,
          periodo: turma.periodo,
          id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );

      const outBinds = result.outBinds as { id: number[] };
      if (outBinds && outBinds.id) {
        return { id: outBinds.id[0], ...turma };
      } else {
        throw new Error('Falha ao obter o ID da turma criada.');
      }
    } catch (error: any) {
      console.error('Erro ao criar turma:', error);
      throw new Error('Erro ao criar nova turma.');
    }
  }

  static async getTurmaDetailById(connection: oracledb.Connection, turmaId: number) {
    try {
      const result = await connection.execute(
        `SELECT 
            t.Id_Turma, t.Nome AS NomeTurma, t.Finalizado, t.Semestre, t.Periodo,
            d.Id_Disciplina, d.Nome AS NomeDisciplina, d.Formula_Calculo, d.Nota_Maxima,
            c.Id_Curso, c.Nome AS NomeCurso,
            i.Id_Instituicao, i.Nome AS NomeInstituicao,
            a.Matricula, a.Nome AS NomeAluno,
            n.Pontuacao,
            cn.Sigla AS ComponenteSigla
         FROM Turma t
         JOIN Disciplina d ON t.Id_Disciplina = d.Id_Disciplina
         JOIN Curso c ON d.Id_Curso = c.Id_Curso
         JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
         LEFT JOIN Aluno_Turma atv ON t.Id_Turma = atv.Id_Turma
         LEFT JOIN Aluno a ON atv.Matricula = a.Matricula
         LEFT JOIN Notas n ON a.Matricula = n.Matricula AND t.Id_Turma = n.Id_Turma
         LEFT JOIN Componente_Nota cn ON n.Id_Comp = cn.Id_Comp
         WHERE t.Id_Turma = :id`,
        [turmaId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
       
      const componentsResult = await connection.execute(
        `SELECT Id_Comp, Nome, Sigla, Descricao FROM Componente_Nota WHERE Id_Disciplina = (SELECT Id_Disciplina FROM Turma WHERE Id_Turma = :id)`,
        [turmaId], { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const gradeComponents = (componentsResult.rows as any[]).map(r => ({
          id: r.ID_COMP, name: r.NOME, acronym: r.SIGLA, description: r.DESCRICAO
      }));


      if (!result.rows || result.rows.length === 0) {
        const turmaInfoResult = await connection.execute(
            `SELECT 
                t.Id_Turma, t.Nome AS NomeTurma, t.Finalizado, t.Semestre, t.Periodo,
                d.Id_Disciplina, d.Nome AS NomeDisciplina, d.Formula_Calculo, d.Nota_Maxima,
                c.Id_Curso, c.Nome AS NomeCurso,
                i.Id_Instituicao, i.Nome AS NomeInstituicao
            FROM Turma t
            JOIN Disciplina d ON t.Id_Disciplina = d.Id_Disciplina
            JOIN Curso c ON d.Id_Curso = c.Id_Curso
            JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
            WHERE t.Id_Turma = :id`,
            [turmaId], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if(!turmaInfoResult.rows || turmaInfoResult.rows.length === 0) {
            throw new Error('Turma não encontrada.');
        }
        const firstRow = (turmaInfoResult.rows as any[])[0];
         return {
            id: firstRow.ID_TURMA, name: firstRow.NOMETURMA, semestre: firstRow.SEMESTRE, periodo: firstRow.PERIODO, isFinalized: firstRow.FINALIZADO === 1,
            discipline: { id: firstRow.ID_DISCIPLINA, name: firstRow.NOMEDISCIPLINA, finalGradeFormula: firstRow.FORMULA_CALCULO, maxGrade: firstRow.NOTA_MAXIMA, gradeComponents },
            course: { id: firstRow.ID_CURSO, name: firstRow.NOMECURSO },
            institution: { id: firstRow.ID_INSTITUICAO, name: firstRow.NOMEINSTITUICAO },
            students: []
        };
      }

      const rows = result.rows as any[];
      const studentsMap = new Map();

      rows.forEach(row => {
        if (row.MATRICULA) {
          let student = studentsMap.get(row.MATRICULA);
          if (!student) {
            student = {
              id: row.MATRICULA,
              name: row.NOMEALUNO,
              grades: {}
            };
            studentsMap.set(row.MATRICULA, student);
          }
          if (row.COMPONENTESIGLA && row.PONTUACAO !== null) {
            student.grades[row.COMPONENTESIGLA] = row.PONTUACAO;
          }
        }
      });

      const firstRow = rows[0];
      const turmaDetail = {
        id: firstRow.ID_TURMA,
        name: firstRow.NOMETURMA,
        semestre: firstRow.SEMESTRE,
        periodo: firstRow.PERIODO,
        isFinalized: firstRow.FINALIZADO === 1,
        discipline: {
          id: firstRow.ID_DISCIPLINA,
          name: firstRow.NOMEDISCIPLINA,
          finalGradeFormula: firstRow.FORMULA_CALCULO,
          maxGrade: firstRow.NOTA_MAXIMA,
          gradeComponents
        },
        course: {
          id: firstRow.ID_CURSO,
          name: firstRow.NOMECURSO,
        },
        institution: {
          id: firstRow.ID_INSTITUICAO,
          name: firstRow.NOMEINSTITUICAO,
        },
        students: Array.from(studentsMap.values())
      };

      return turmaDetail;
    } catch (error: any) {
      console.error('Erro ao buscar detalhes da turma:', error);
      throw new Error('Erro ao buscar detalhes da turma.');
    }
  }
  
  static async updateStudentGrades(connection: oracledb.Connection, turmaId: number, studentId: number, grades: { [key: string]: number }) {
    try {
      const disciplineIdResult = await connection.execute(
        `SELECT Id_Disciplina FROM Turma WHERE Id_Turma = :turmaId`,
        { turmaId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const disciplineId = (disciplineIdResult.rows as any[])[0]?.ID_DISCIPLINA;
      if (!disciplineId) throw new Error("Disciplina da turma não encontrada.");

      for (const sigla in grades) {
        const score = grades[sigla];

        const compResult = await connection.execute(
          `SELECT Id_Comp FROM Componente_Nota WHERE Sigla = :sigla AND Id_Disciplina = :disciplineId`,
          { sigla, disciplineId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const componentId = (compResult.rows as any[])[0]?.ID_COMP;

        if (componentId) {
          await connection.execute(
            `MERGE INTO Notas n
             USING (SELECT :turmaId AS Id_Turma, :studentId AS Matricula, :componentId AS Id_Comp FROM dual) src
             ON (n.Id_Turma = src.Id_Turma AND n.Matricula = src.Matricula AND n.Id_Comp = src.Id_Comp)
             WHEN MATCHED THEN
               UPDATE SET n.Pontuacao = :score
             WHEN NOT MATCHED THEN
               INSERT (Id_Turma, Matricula, Id_Comp, Pontuacao)
               VALUES (:turmaId, :studentId, :componentId, :score)`,
            { turmaId, studentId, componentId, score }
          );
        }
      }
      await connection.commit();
    } catch (error: any) {
      await connection.rollback();
      console.error('Erro ao atualizar notas do aluno:', error);
      throw new Error('Erro ao atualizar notas do aluno.');
    }
  }

  static async finalizeTurma(connection: oracledb.Connection, turmaId: number): Promise<void> {
    try {
      await connection.execute(
        `UPDATE Turma SET Finalizado = 1 WHERE Id_Turma = :id`,
        { id: turmaId },
        { autoCommit: true }
      );
    } catch (error: any) {
      console.error('Erro ao finalizar turma:', error);
      throw new Error('Erro ao finalizar a turma.');
    }
  }

  static async reopenTurma(connection: oracledb.Connection, turmaId: number): Promise<void> {
    try {
      await connection.execute(
        `UPDATE Turma SET Finalizado = 0 WHERE Id_Turma = :id`,
        { id: turmaId },
        { autoCommit: true }
      );
    } catch (error: any) {
      console.error('Erro ao reabrir turma:', error);
      throw new Error('Erro ao reabrir a turma.');
    }
  }

  static async deleteTurma(connection: oracledb.Connection, turmaId: number): Promise<void> {
    try {
      await connection.execute(
        `DELETE FROM Turma WHERE Id_Turma = :id`,
        { id: turmaId },
        { autoCommit: true }
      );
    } catch (error: any) {
      console.error('Erro ao excluir turma:', error);
      throw new Error('Erro ao excluir a turma.');
    }
  }
  
  static async updateTurma(connection: oracledb.Connection, turmaId: number, data: { nome: string, semestre: string, periodo: string }, professorId: number) {
    try {
        const { nome, semestre, periodo } = data;
        const result = await connection.execute(
            `UPDATE Turma SET Nome = :nome, Semestre = :semestre, Periodo = :periodo 
             WHERE Id_Turma = :id AND Id_Disciplina IN (
                SELECT d.Id_Disciplina FROM Disciplina d
                JOIN Curso c ON d.Id_Curso = c.Id_Curso
                JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
                WHERE i.Id_Professor = :professorId
             )`,
            { nome, semestre, periodo, id: turmaId, professorId },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
            throw new Error("Turma não encontrada ou permissão negada.");
        }
    } catch (error: any) {
        console.error('Erro ao atualizar turma:', error);
        throw new Error('Erro ao atualizar turma.');
    }
  }


  // FIX: The methods below are placeholders to satisfy compilation for an unused route file (services/turmas.ts)
  // and are not part of the active application logic.
  static async getAll(): Promise<any[]> { return []; }
  static async getById(id: number): Promise<any> { return null; }
  static async create(data: any): Promise<number> { return 0; }
  static async update(id: number, data: any): Promise<void> { return; }
  static async delete(id: number): Promise<void> { return; }
  static async finalize(id: number): Promise<void> { return; }
  static async getStudents(turmaId: number): Promise<any[]> { return []; }
  static async addStudent(turmaId: number, studentId: number): Promise<void> { return; }
  static async removeStudent(turmaId: number, studentId: number): Promise<void> { return; }
  static async updateGrade(turmaId: number, studentId: number, gradeComponentId: number, score: number): Promise<void> { return; }
}