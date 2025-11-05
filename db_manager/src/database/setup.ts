import { getConnection } from './db';
import fs from 'fs';
import path from 'path';

export async function setupDatabase() {
  let connection;
  try {
    connection = await getConnection();
    // Verifica/cria todas as tabelas do novo SQL
    const tabelas = [
      'professores', 'Instituicao', 'Curso', 'Disciplina', 'Turma', 'Aluno', 'Notas', 'Aluno_Turma'
    ];
    let todasExistem = true;
    for (const tabela of tabelas) {
      try {
        await connection.execute(`SELECT 1 FROM ${tabela} WHERE 1 = 0`);
        console.log(`Tabela "${tabela}" já existe.`);
      } catch (error: any) {
        if (error.errorNum === 942) {
          todasExistem = false;
          console.log(`Tabela "${tabela}" não encontrada.`);
        } else {
          throw error;
        }
      }
    }
    if (!todasExistem) {
      console.log('Criando todas as tabelas do banco...');
      const sqlFilePath = path.join(__dirname, '../../BD_MANAGER_ALL.sql');
      const createTableSQL = fs.readFileSync(sqlFilePath, 'utf8');
      const sqlCommands = createTableSQL.split(';').filter(cmd => cmd.trim() !== '' && !cmd.trim().toUpperCase().startsWith('COMMIT'));
      for (const command of sqlCommands) {
        if (command.trim()) {
          await connection.execute(command);
        }
      }
      console.log('Tabelas criadas com sucesso.');
      await connection.commit();
    }
  } catch (err) {
    console.error('Erro durante a configuração do banco de dados:', err);
    throw err; // Lança o erro para ser tratado pelo server.ts
  } finally {
    if (connection) {
      try {
        await connection.close(); // Liberar a conexão de volta para o pool
      } catch (err) {
        console.error('Erro ao liberar a conexão:', err);
      }
    }
  }
}
