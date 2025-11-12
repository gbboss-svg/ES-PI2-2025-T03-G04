
import oracledb from 'oracledb';

export default class ProfessorService {
  static async isFirstAccess(connection: oracledb.Connection, professorId: number): Promise<boolean> {
    try {
      const result = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM Instituicao
         WHERE Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const count = (result.rows?.[0] as any)?.TOTAL || 0;
      return count === 0;

    } catch (error: any) {
      console.error('Erro ao verificar primeiro acesso:', error);
      throw new Error('Erro ao verificar primeiro acesso do professor.');
    }
  }

  static async getInstituicoes(connection: oracledb.Connection, professorId: number) {
    try {
      const result = await connection.execute(
        `SELECT
            i.Id_Instituicao,
            i.Nome,
            MAX(pc.ULTIMO_ACESSO) as LastAccess
        FROM Instituicao i
        LEFT JOIN Curso c ON i.Id_Instituicao = c.Id_Instituicao
        LEFT JOIN Professor_Curso pc ON c.Id_Curso = pc.Id_Curso AND pc.Id_Professor = :id
        WHERE
            i.Id_Professor = :id OR
            i.Id_Instituicao IN (
                -- Instituições via associação com Curso
                SELECT c_sub.Id_Instituicao
                FROM Curso c_sub
                JOIN Professor_Curso pc_sub ON c_sub.Id_Curso = pc_sub.Id_Curso
                WHERE pc_sub.Id_Professor = :id
                UNION
                -- Instituições via associação com Disciplina
                SELECT c2.Id_Instituicao
                FROM Disciplina d
                JOIN Professor_Disciplina pd ON d.Id_Disciplina = pd.Id_Disciplina
                JOIN Curso c2 ON d.Id_Curso = c2.Id_Curso
                WHERE pd.Id_Professor = :id
            )
        GROUP BY i.Id_Instituicao, i.Nome
        ORDER BY LastAccess DESC NULLS LAST`,
        { id: professorId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows) {
        return [];
      }

      const mappedResult = (result.rows as any[]).map(row => ({
        id: row.ID_INSTITUICAO,
        name: row.NOME,
        courses: [] 
      }));

      return mappedResult;
      
    } catch (error: any) {
      console.error('Erro ao listar instituições:', error);
      throw new Error('Erro ao buscar instituições do professor.');
    }
  }

  static async getCursos(connection: oracledb.Connection, professorId: number) {
    try {
      const result = await connection.execute(
        `SELECT
            c.Id_Curso, c.Nome AS NomeCurso, c.Sigla, c.Semestres,
            i.Id_Instituicao, i.Nome AS NomeInstituicao,
            pc.ULTIMO_ACESSO
        FROM Curso c
        JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
        LEFT JOIN Professor_Curso pc ON c.Id_Curso = pc.Id_Curso AND pc.Id_Professor = :id
        WHERE
            i.Id_Professor = :id
            OR c.Id_Curso IN (
                -- Cursos via associação direta
                SELECT Id_Curso FROM Professor_Curso WHERE Id_Professor = :id
                UNION
                -- Cursos via associação com Disciplina
                SELECT d.Id_Curso 
                FROM Disciplina d
                JOIN Professor_Disciplina pd ON d.Id_Disciplina = pd.Id_Disciplina
                WHERE pd.Id_Professor = :id
            )
        GROUP BY c.Id_Curso, c.Nome, c.Sigla, c.Semestres, i.Id_Instituicao, i.Nome, pc.ULTIMO_ACESSO
        ORDER BY pc.ULTIMO_ACESSO DESC NULLS LAST`,
        { id: professorId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows) {
        return [];
      }

      const mappedResult = (result.rows as any[]).map(row => ({
        id: row.ID_CURSO,
        name: row.NOMECURSO,
        sigla: row.SIGLA,
        semestres: row.SEMESTRES,
        institutionId: row.ID_INSTITUICAO,
        institutionName: row.NOMEINSTITUICAO
      }));

      return mappedResult;
      
    } catch (error: any) {
      console.error('Erro ao listar cursos:', error);
      throw new Error('Erro ao buscar cursos do professor.');
    }
  }

  static async createInstitution(connection: oracledb.Connection, nome: string, professorId: number): Promise<number> {
    try {
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO Instituicao (Nome, Id_Professor) VALUES (:nome, :professorId) RETURNING Id_Instituicao INTO :id`,
        { nome, professorId, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: true }
      );
      const institutionId = (result.outBinds as any).id[0];
      return institutionId;
    } catch (error: any) {
      console.error('[ProfessorService] Erro detalhado ao criar instituição:', error);
      throw new Error('Erro ao criar instituição.');
    }
  }

  static async createCourse(connection: oracledb.Connection, courseData: { nome: string, sigla: string, semestres: number, idInstituicao: number }, professorId: number): Promise<number> {
    const { nome, sigla, semestres, idInstituicao } = courseData;
    try {
        const result = await connection.execute<{ id: number[] }>(
            `INSERT INTO Curso (Nome, Sigla, Semestres, Id_Instituicao) VALUES (:nome, :sigla, :semestres, :idInstituicao) RETURNING Id_Curso INTO :id`,
            { nome, sigla, semestres, idInstituicao, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } }
        );

        const courseId = result.outBinds!.id[0];

        await connection.execute(
            `INSERT INTO Professor_Curso (Id_Professor, Id_Curso, ULTIMO_ACESSO) VALUES (:professorId, :courseId, SYSTIMESTAMP)`,
            { professorId, courseId }
        );

        await connection.commit();
        return courseId;
    } catch (error: any) {
        await connection.rollback();
        console.error('Erro ao criar curso e associar professor:', error);
        throw new Error('Erro ao criar curso.');
    }
  }


  static async associateProfessorToCourse(connection: oracledb.Connection, professorId: number, courseId: number): Promise<void> {
    try {
      await connection.execute(
        `INSERT INTO Professor_Curso (Id_Professor, Id_Curso) VALUES (:professorId, :courseId)`,
        { professorId, courseId },
        { autoCommit: true }
      );
    } catch (error: any) {
      if (error.errorNum === 1) {
        console.log(`Associação entre Professor ID ${professorId} e Curso ID ${courseId} já existe.`);
        return;
      }
      console.error('Erro ao associar professor ao curso:', error);
      throw new Error('Erro ao associar professor ao curso.');
    }
  }

  static async getProfessorById(connection: oracledb.Connection, professorId: number): Promise<any | null> {
    try {
      const result = await connection.execute(
        `SELECT Nome, Cpf, Email, Celular FROM professores WHERE Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      if (!result.rows || result.rows.length === 0) {
        return null;
      }
  
      const professorData: any = result.rows[0];
      
      const professor = {
        name: professorData.NOME,
        cpf: professorData.CPF,
        email: professorData.EMAIL,
        telefone: professorData.CELULAR
      };
  
      return professor;
  
    } catch (error: any) {
      console.error('Erro ao buscar dados do professor:', error);
      throw new Error('Erro ao buscar dados do professor.');
    }
  }

  static async updateCourseAccessTimestamp(connection: oracledb.Connection, professorId: number, courseId: number): Promise<void> {
    try {
      await connection.execute(
        `MERGE INTO Professor_Curso pc
         USING (SELECT :professorId AS Id_Professor, :courseId AS Id_Curso FROM dual) src
         ON (pc.Id_Professor = src.Id_Professor AND pc.Id_Curso = src.Id_Curso)
         WHEN MATCHED THEN
           UPDATE SET pc.ULTIMO_ACESSO = SYSTIMESTAMP
         WHEN NOT MATCHED THEN
           INSERT (Id_Professor, Id_Curso, ULTIMO_ACESSO)
           VALUES (src.Id_Professor, src.Id_Curso, SYSTIMESTAMP)`,
        { professorId, courseId },
        { autoCommit: true }
      );
    } catch (error: any) {
      console.error('Erro ao atualizar o timestamp de acesso ao curso:', error);
      throw new Error('Erro ao registrar acesso ao curso.');
    }
  }

  static async updateInstitution(connection: oracledb.Connection, institutionId: number, nome: string, professorId: number) {
    try {
        const result = await connection.execute(
            `UPDATE Instituicao SET Nome = :nome WHERE Id_Instituicao = :id AND Id_Professor = :professorId`,
            { nome, id: institutionId, professorId },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
            throw new Error("Instituição não encontrada ou permissão negada.");
        }
    } catch (error: any) {
        console.error('Erro ao atualizar instituição:', error);
        throw new Error('Erro ao atualizar instituição.');
    }
  }

  static async deleteInstitution(connection: oracledb.Connection, institutionId: number, professorId: number) {
      try {
          const result = await connection.execute(
              `DELETE FROM Instituicao WHERE Id_Instituicao = :id AND Id_Professor = :professorId`,
              { id: institutionId, professorId },
              { autoCommit: true }
          );
          if (result.rowsAffected === 0) {
              throw new Error("Instituição não encontrada ou permissão negada.");
          }
      } catch (error: any) {
          console.error('Erro ao excluir instituição:', error);
          throw new Error('Erro ao excluir instituição.');
      }
  }

  static async updateCourse(connection: oracledb.Connection, courseId: number, data: { nome: string, sigla: string, semestres: number }, professorId: number) {
    try {
        const { nome, sigla, semestres } = data;
        const result = await connection.execute(
            `UPDATE Curso SET Nome = :nome, Sigla = :sigla, Semestres = :semestres 
             WHERE Id_Curso = :id AND Id_Instituicao IN (SELECT Id_Instituicao FROM Instituicao WHERE Id_Professor = :professorId)`,
            { nome, sigla, semestres, id: courseId, professorId },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
            throw new Error("Curso não encontrado ou permissão negada.");
        }
    } catch (error: any) {
        console.error('Erro ao atualizar curso:', error);
        throw new Error('Erro ao atualizar curso.');
    }
  }

  static async deleteCourse(connection: oracledb.Connection, courseId: number, professorId: number) {
      try {
          const result = await connection.execute(
              `DELETE FROM Curso WHERE Id_Curso = :id AND Id_Instituicao IN (SELECT Id_Instituicao FROM Instituicao WHERE Id_Professor = :professorId)`,
              { id: courseId, professorId },
              { autoCommit: true }
          );
          if (result.rowsAffected === 0) {
              throw new Error("Curso não encontrado ou permissão negada.");
          }
      } catch (error: any) {
          console.error('Erro ao excluir curso:', error);
          throw new Error('Erro ao excluir curso.');
      }
  }
}