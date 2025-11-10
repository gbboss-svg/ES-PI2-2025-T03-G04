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
      console.log(`[getInstituicoes] Buscando instituições para o professor ID: ${professorId}`);
      
      const result = await connection.execute(
        `SELECT Id_Instituicao, Nome
         FROM Instituicao
         WHERE Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      console.log('[getInstituicoes] Resultado bruto da consulta:', result.rows);

      if (!result.rows) {
        console.log('[getInstituicoes] Nenhuma instituição encontrada.');
        return [];
      }

      // Mapeia as chaves para camelCase para padronizar com o frontend
      const mappedResult = (result.rows as any[]).map(row => ({
        id: row.ID_INSTITUICAO,
        name: row.NOME,
        courses: [] // Adiciona um array vazio para cursos, esperado pela view
      }));

      console.log('[getInstituicoes] Resultado mapeado:', mappedResult);
      return mappedResult;
      
    } catch (error: any) {
      console.error('Erro ao listar instituições:', error);
      throw new Error('Erro ao buscar instituições do professor.');
    }
  }

  static async getCursos(connection: oracledb.Connection, professorId: number) {
    try {
      console.log(`[getCursos] Buscando cursos para o professor ID: ${professorId}`);

      const result = await connection.execute(
        `SELECT c.Id_Curso, c.Nome AS NomeCurso, i.Id_Instituicao, i.Nome AS NomeInstituicao
         FROM Curso c
         JOIN Instituicao i ON c.Id_Instituicao = i.Id_Instituicao
         WHERE i.Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      console.log('[getCursos] Resultado bruto da consulta:', result.rows);

      if (!result.rows) {
        console.log('[getCursos] Nenhum curso encontrado.');
        return [];
      }

      // Mapeia as chaves para camelCase para padronizar com o frontend
      const mappedResult = (result.rows as any[]).map(row => ({
        id: row.ID_CURSO,
        name: row.NOMECURSO,
        institutionId: row.ID_INSTITUICAO,
        institutionName: row.NOMEINSTITUICAO
      }));

      console.log('[getCursos] Resultado mapeado:', mappedResult);
      return mappedResult;
      
    } catch (error: any) {
      console.error('Erro ao listar cursos:', error);
      throw new Error('Erro ao buscar cursos do professor.');
    }
  }

  static async createInstitution(connection: oracledb.Connection, nome: string, professorId: number): Promise<number> {
    console.log(`[ProfessorService] Tentando criar instituição com nome: ${nome}, professorId: ${professorId}`);
    try {
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO Instituicao (Nome, Id_Professor) VALUES (:nome, :professorId) RETURNING Id_Instituicao INTO :id`,
        { nome, professorId, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: true }
      );
      const institutionId = (result.outBinds as any).id[0];
      console.log(`[ProfessorService] Instituição criada com sucesso. ID: ${institutionId}`);
      return institutionId;
    } catch (error: any) {
      console.error('[ProfessorService] Erro detalhado ao criar instituição:', error);
      throw new Error('Erro ao criar instituição.');
    }
  }

  static async createCourse(connection: oracledb.Connection, nome: string, sigla: string, semestres: number, idInstituicao: number): Promise<number> {
    try {
      const result = await connection.execute<{ id: number }>(
        `INSERT INTO Curso (Nome, Sigla, Semestres, Id_Instituicao) VALUES (:nome, :sigla, :semestres, :idInstituicao) RETURNING Id_Curso INTO :id`,
        { nome, sigla, semestres, idInstituicao, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: true }
      );
      return (result.outBinds as any).id[0];
    } catch (error: any) {
      console.error('Erro ao criar curso:', error);
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
      // Ignora o erro de chave única duplicada (caso a associação já exista)
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
        `SELECT 
            Nome, 
            Cpf, 
            Email, 
            Celular
         FROM professores 
         WHERE Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      if (!result.rows || result.rows.length === 0) {
        return null;
      }
  
      const professorData: any = result.rows[0];
      
      // Transforma as chaves do objeto para minúsculas
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
}
