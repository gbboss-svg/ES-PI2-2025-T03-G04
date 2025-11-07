import { getConnection } from './db';
import fs from 'fs';
import path from 'path';
import oracledb from 'oracledb';

async function executeSqlFile(connection: oracledb.Connection, filePath: string) {
  const sql = fs.readFileSync(filePath, 'utf8');
  // Splits statements by semicolon at the end of a line
  const commands = sql.split(/;\s*$/m)
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);

  for (const command of commands) {
    try {
      await connection.execute(command);
    } catch (err) {
      console.error(`Erro executando comando: ${command}`, err);
      throw err;
    }
  }
}

async function executeSqlBlock(connection: oracledb.Connection, filePath: string) {
  const sql = fs.readFileSync(filePath, 'utf8').trim();
  if (sql.length === 0) {
    return;
  }
  try {
    await connection.execute(sql);
  } catch (err) {
    console.error(`Erro executando bloco SQL do arquivo: ${filePath}`, err);
    throw err;
  }
}

export async function setupDatabase() {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute<{ TABLE_NAME: string }>(
      `SELECT table_name FROM user_tables WHERE table_name = 'PROFESSORES'`
    );

    if (result.rows && result.rows.length > 0) {
      console.log('Tabelas já existem. Nenhuma ação necessária.');
      return;
    }

    console.log('Criando tabelas do banco...');
    const tablesFilePath = path.join(__dirname, '../../BD_MANAGER_ALL.sql');
    await executeSqlFile(connection, tablesFilePath);
    console.log('Tabelas criadas com sucesso.');

    console.log('Criando triggers...');
    const triggersFilePath = path.join(__dirname, '../../triggers.sql');
    await executeSqlBlock(connection, triggersFilePath);
    console.log('Triggers criados com sucesso.');

    await connection.commit();

  } catch (err) {
    console.error('Erro durante a configuração do banco de dados:', err);
    if (connection) {
      await connection.rollback();
    }
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar a conexão:', err);
      }
    }
  }
}
