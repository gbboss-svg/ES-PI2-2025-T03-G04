import oracledb from 'oracledb';

export default class TurmaService {
  static async getTurmasByDiscipline(connection: oracledb.Connection, disciplineId: number) {
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
         JOIN Professor_Disciplina pd ON d.Id_Disciplina = pd.Id_Disciplina
         JOIN Curso c ON d.Id_Curso = c.Id_Curso
         JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
         WHERE pd.Id_Professor = :id AND t.Finalizado = 0`,
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
            t.Id_Turma, t.Nome AS NomeTurma, t.Finalizado,
            d.Id_Disciplina, d.Nome AS NomeDisciplina,
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

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Turma não encontrada.');
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
        isFinalized: firstRow.FINALIZADO === 1,
        discipline: {
          id: firstRow.ID_DISCIPLINA,
          name: firstRow.NOMEDISCIPLINA,
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
}
