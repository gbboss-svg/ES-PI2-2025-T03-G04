import oracledb from 'oracledb';

export default class TurmaService {
  /**
   * Busca todas as turmas de uma disciplina específica.
   */
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

      if (!result.rows) return [];

      return (result.rows as any[]).map(row => ({
        id: row.ID_TURMA, name: row.NOMETURMA, semestre: row.SEMESTRE, periodo: row.PERIODO,
        isFinalized: row.FINALIZADO === 1,
        discipline: { id: row.ID_DISCIPLINA, name: row.NOMEDISCIPLINA },
        course: { id: row.ID_CURSO, name: row.NOMECURSO },
        institution: { id: row.ID_INSTITUICAO, name: row.NOMEINSTITUICAO }
      }));
    } catch (error: any) {
      console.error('Erro ao listar turmas:', error);
      throw new Error('Erro ao buscar turmas da disciplina.');
    }
  }

  /**
   * Busca todas as turmas ativas (não finalizadas) de um professor.
   */
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

      if (!result.rows) return [];

      return (result.rows as any[]).map(row => ({
        id: row.ID_TURMA, name: row.NOMETURMA, isFinalized: row.FINALIZADO === 1,
        discipline: { id: row.ID_DISCIPLINA, name: row.NOMEDISCIPLINA },
        course: { id: row.ID_CURSO, name: row.NOMECURSO },
        institution: { id: row.ID_INSTITUICAO, name: row.NOMEINSTITUICAO }
      }));
    } catch (error: any) {
      console.error('Erro ao listar turmas ativas:', error);
      throw new Error('Erro ao buscar turmas ativas do professor.');
    }
  }

  /**
   * Cria uma nova turma no banco de dados.
   */
  static async createTurma(connection: oracledb.Connection, turma: { nome: string, idDisciplina: number, semestre: string, periodo: string }) {
    try {
      const result = await connection.execute(
        `INSERT INTO Turma (Nome, Id_Disciplina, Semestre, Periodo, Finalizado)
         VALUES (:nome, :idDisciplina, :semestre, :periodo, 0)
         RETURNING Id_Turma INTO :id`,
        { ...turma, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: true }
      );

      const outBinds = result.outBinds as { id: number[] };
      if (outBinds?.id) {
        return { id: outBinds.id[0], ...turma };
      } else {
        throw new Error('Falha ao obter o ID da turma criada.');
      }
    } catch (error: any) {
      console.error('Erro ao criar turma:', error);
      throw new Error('Erro ao criar nova turma.');
    }
  }

  /**
   * Busca os detalhes completos de uma turma.
   */
  static async getTurmaDetailById(connection: oracledb.Connection, turmaId: number) {
    try {
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

      if (!turmaInfoResult.rows || turmaInfoResult.rows.length === 0) throw new Error('Turma não encontrada.');
      const turmaInfo = (turmaInfoResult.rows as any[])[0];

      const componentsResult = await connection.execute(
        `SELECT Id_Comp, Nome, Sigla, Descricao FROM Componente_Nota WHERE Id_Disciplina = :id`,
        [turmaInfo.ID_DISCIPLINA], { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const gradeComponents = (componentsResult.rows as any[]).map(r => ({
        id: r.ID_COMP, name: r.NOME, acronym: r.SIGLA, description: r.DESCRICAO
      }));

      const studentsResult = await connection.execute(
        `SELECT a.Matricula, a.Nome AS NomeAluno FROM Aluno a JOIN Aluno_Turma atv ON a.Matricula = atv.Matricula WHERE atv.Id_Turma = :id ORDER BY a.Nome`,
        [turmaId], { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const studentMap = new Map();
      (studentsResult.rows as any[]).forEach(row => {
        studentMap.set(row.MATRICULA, { id: row.MATRICULA, name: row.NOMEALUNO, grades: {} });
      });

      const gradesResult = await connection.execute(
        `SELECT n.Matricula, n.Pontuacao, cn.Sigla AS ComponenteSigla FROM NOTAS n JOIN Componente_Nota cn ON n.Id_Comp = cn.Id_Comp WHERE n.Id_Turma = :id`,
        [turmaId], { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      (gradesResult.rows as any[]).forEach(row => {
        const student = studentMap.get(row.MATRICULA);
        if (student && row.COMPONENTESIGLA) {
          student.grades[row.COMPONENTESIGLA] = row.PONTUACAO;
        }
      });

      return {
        id: turmaInfo.ID_TURMA, name: turmaInfo.NOMETURMA, semestre: turmaInfo.SEMESTRE, periodo: turmaInfo.PERIODO,
        isFinalized: turmaInfo.FINALIZADO === 1,
        discipline: { id: turmaInfo.ID_DISCIPLINA, name: turmaInfo.NOMEDISCIPLINA, finalGradeFormula: turmaInfo.FORMULA_CALCULO, maxGrade: turmaInfo.NOTA_MAXIMA, gradeComponents },
        course: { id: turmaInfo.ID_CURSO, name: turmaInfo.NOMECURSO },
        institution: { id: turmaInfo.ID_INSTITUICAO, name: turmaInfo.NOMEINSTITUICAO },
        students: Array.from(studentMap.values())
      };
    } catch (error: any) {
      console.error('Erro ao buscar detalhes da turma:', error);
      throw new Error('Erro ao buscar detalhes da turma.');
    }
  }

  /**
   * Finaliza o semestre de uma turma.
   */
  static async finalizeTurma(connection: oracledb.Connection, turmaId: number): Promise<void> {
    try {
      await connection.execute(`UPDATE Turma SET Finalizado = 1 WHERE Id_Turma = :id`, { id: turmaId }, { autoCommit: true });
    } catch (error: any) {
      console.error('Erro ao finalizar turma:', error);
      throw new Error('Erro ao finalizar a turma.');
    }
  }

  /**
   * Reabre uma turma finalizada.
   */
  static async reopenTurma(connection: oracledb.Connection, turmaId: number): Promise<void> {
    try {
      await connection.execute(`UPDATE Turma SET Finalizado = 0 WHERE Id_Turma = :id`, { id: turmaId }, { autoCommit: true });
    } catch (error: any) {
      console.error('Erro ao reabrir turma:', error);
      throw new Error('Erro ao reabrir a turma.');
    }
  }

  /**
   * Exclui uma turma do banco de dados.
   */
  static async deleteTurma(connection: oracledb.Connection, turmaId: number): Promise<void> {
    try {
      await connection.execute(`DELETE FROM Turma WHERE Id_Turma = :id`, { id: turmaId }, { autoCommit: true });
    } catch (error: any) {
      console.error('Erro ao excluir turma:', error);
      throw new Error('Erro ao excluir a turma.');
    }
  }
  
  /**
   * Atualiza os dados de uma turma.
   */
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
}