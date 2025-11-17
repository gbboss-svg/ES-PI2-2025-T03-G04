import { getConnection } from './db';
import oracledb from 'oracledb';

/**
 * Verifica se uma tabela existe no banco de dados e, se não existir, a cria.
 */
async function checkAndCreateTable(connection: oracledb.Connection, tableName: string, createSql: string) {
  try {
    const result = await connection.execute(
      `SELECT table_name FROM user_tables WHERE table_name = :tableName`,
      { tableName: tableName.toUpperCase() }
    );
    if (result.rows && result.rows.length === 0) {
      console.log(`Tabela ${tableName} não encontrada, criando...`);
      await connection.execute(createSql);
      console.log(`Tabela ${tableName} criada com sucesso.`);
    }
  } catch (err) {
    console.error(`Erro ao verificar/criar tabela ${tableName}:`, err);
    throw err;
  }
}

/**
 * Executa o processo de configuração do schema do banco de dados.
 */
export async function setupDatabase() {
  let connection;
  try {
    connection = await getConnection();
    console.log('Iniciando verificação e configuração do schema do banco de dados...');

    await checkAndCreateTable(connection, 'PROFESSORES', `
      CREATE TABLE PROFESSORES (
          Id_Professor NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          Nome VARCHAR2(255) NOT NULL,
          Email VARCHAR2(255) UNIQUE NOT NULL,
          Cpf VARCHAR2(20) UNIQUE NOT NULL,
          Celular VARCHAR2(20) UNIQUE NOT NULL,
          Senha VARCHAR2(255) NOT NULL,
          Verification_Code VARCHAR2(10),
          Verification_Attempts NUMBER DEFAULT 0,
          Resend_Attempts NUMBER DEFAULT 0,
          Is_Verified NUMBER(1) DEFAULT 0,
          Primeiro_Acesso NUMBER(1) DEFAULT 1
      )
    `);

    await checkAndCreateTable(connection, 'INSTITUICAO', `
      CREATE TABLE INSTITUICAO (
          Id_Instituicao NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          Nome VARCHAR2(255) NOT NULL,
          Id_Professor NUMBER NOT NULL,
          CONSTRAINT fk_instituicao_professor FOREIGN KEY (Id_Professor) REFERENCES PROFESSORES(Id_Professor) ON DELETE CASCADE
      )
    `);

    await checkAndCreateTable(connection, 'CURSO', `
      CREATE TABLE CURSO (
          Id_Curso NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          Nome VARCHAR2(255) NOT NULL,
          Sigla VARCHAR2(50),
          Semestres NUMBER,
          Id_Instituicao NUMBER NOT NULL,
          CONSTRAINT fk_curso_instituicao FOREIGN KEY (Id_Instituicao) REFERENCES INSTITUICAO(Id_Instituicao) ON DELETE CASCADE
      )
    `);
    
    await checkAndCreateTable(connection, 'DISCIPLINA', `
      CREATE TABLE DISCIPLINA (
          Id_Disciplina NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          Nome VARCHAR2(255) NOT NULL,
          Sigla VARCHAR2(50),
          Periodo VARCHAR2(100),
          Formula_Calculo VARCHAR2(1024),
          Nota_Maxima NUMBER DEFAULT 10,
          Id_Curso NUMBER NOT NULL,
          CONSTRAINT fk_disciplina_curso FOREIGN KEY (Id_Curso) REFERENCES CURSO(Id_Curso) ON DELETE CASCADE
      )
    `);

    await checkAndCreateTable(connection, 'TURMA', `
      CREATE TABLE TURMA (
          Id_Turma NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          Nome VARCHAR2(255) NOT NULL,
          Semestre VARCHAR2(100),
          Periodo VARCHAR2(100),
          Finalizado NUMBER(1) DEFAULT 0,
          Id_Disciplina NUMBER NOT NULL,
          CONSTRAINT fk_turma_disciplina FOREIGN KEY (Id_Disciplina) REFERENCES DISCIPLINA(Id_Disciplina) ON DELETE CASCADE
      )
    `);

    await checkAndCreateTable(connection, 'ALUNO', `
      CREATE TABLE ALUNO (
          Matricula NUMBER PRIMARY KEY,
          Nome VARCHAR2(255) NOT NULL
      )
    `);

    await checkAndCreateTable(connection, 'PROFESSOR_CURSO', `
      CREATE TABLE PROFESSOR_CURSO (
          Id_Professor NUMBER NOT NULL,
          Id_Curso NUMBER NOT NULL,
          ULTIMO_ACESSO TIMESTAMP,
          CONSTRAINT pk_professor_curso PRIMARY KEY (Id_Professor, Id_Curso),
          CONSTRAINT fk_pc_professor FOREIGN KEY (Id_Professor) REFERENCES PROFESSORES(Id_Professor) ON DELETE CASCADE,
          CONSTRAINT fk_pc_curso FOREIGN KEY (Id_Curso) REFERENCES CURSO(Id_Curso) ON DELETE CASCADE
      )
    `);

    await checkAndCreateTable(connection, 'PROFESSOR_DISCIPLINA', `
      CREATE TABLE PROFESSOR_DISCIPLINA (
          Id_Professor NUMBER NOT NULL,
          Id_Disciplina NUMBER NOT NULL,
          CONSTRAINT pk_professor_disciplina PRIMARY KEY (Id_Professor, Id_Disciplina),
          CONSTRAINT fk_pd_professor FOREIGN KEY (Id_Professor) REFERENCES PROFESSORES(Id_Professor) ON DELETE CASCADE,
          CONSTRAINT fk_pd_disciplina FOREIGN KEY (Id_Disciplina) REFERENCES DISCIPLINA(Id_Disciplina) ON DELETE CASCADE
      )
    `);

    await checkAndCreateTable(connection, 'ALUNO_TURMA', `
      CREATE TABLE ALUNO_TURMA (
          Id_Turma NUMBER NOT NULL,
          Matricula NUMBER NOT NULL,
          CONSTRAINT pk_aluno_turma PRIMARY KEY (Id_Turma, Matricula),
          CONSTRAINT fk_at_turma FOREIGN KEY (Id_Turma) REFERENCES TURMA(Id_Turma) ON DELETE CASCADE,
          CONSTRAINT fk_at_aluno FOREIGN KEY (Matricula) REFERENCES ALUNO(Matricula) ON DELETE CASCADE
      )
    `);

    await checkAndCreateTable(connection, 'COMPONENTE_NOTA', `
      CREATE TABLE COMPONENTE_NOTA (
          Id_Comp NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          Nome VARCHAR2(255) NOT NULL,
          Sigla VARCHAR2(20) NOT NULL,
          Descricao VARCHAR2(1024),
          Id_Disciplina NUMBER NOT NULL,
          CONSTRAINT fk_comp_disciplina FOREIGN KEY (Id_Disciplina) REFERENCES DISCIPLINA(Id_Disciplina) ON DELETE CASCADE
      )
    `);

    await checkAndCreateTable(connection, 'NOTAS', `
      CREATE TABLE NOTAS (
          Id_Turma NUMBER NOT NULL,
          Matricula NUMBER NOT NULL,
          Id_Comp NUMBER NOT NULL,
          Pontuacao NUMBER,
          CONSTRAINT pk_notas PRIMARY KEY (Id_Turma, Matricula, Id_Comp),
          CONSTRAINT fk_notas_turma FOREIGN KEY (Id_Turma) REFERENCES TURMA(Id_Turma) ON DELETE CASCADE,
          CONSTRAINT fk_notas_aluno FOREIGN KEY (Matricula) REFERENCES ALUNO(Matricula) ON DELETE CASCADE,
          CONSTRAINT fk_notas_comp FOREIGN KEY (Id_Comp) REFERENCES COMPONENTE_NOTA(Id_Comp) ON DELETE CASCADE
      )
    `);
    
    await checkAndCreateTable(connection, 'AUDITORIA', `
      CREATE TABLE AUDITORIA (
          Id_Auditoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          Id_Turma NUMBER NOT NULL,
          Timestamp TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
          Mensagem VARCHAR2(1024) NOT NULL,
          Snapshot_Dados CLOB,
          CONSTRAINT fk_auditoria_turma FOREIGN KEY (Id_Turma) REFERENCES Turma(Id_Turma) ON DELETE CASCADE
      )
    `);

    console.log('Verificação do schema concluída. Todas as tabelas necessárias existem.');
    await connection.commit();

  } catch (err) {
    console.error('Erro crítico durante a configuração do banco de dados:', err);
    if (connection) {
      await connection.rollback();
    }
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar a conexão de setup:', err);
      }
    }
  }
}