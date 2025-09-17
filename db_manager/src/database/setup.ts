import { getConnection } from './db';
import fs from 'fs';
import path from 'path';

export async function setupDatabase() {
  let connection;
  try {
    connection = await getConnection();
    console.log('Verificando a existência da tabela "professores"...');

    // 1. Verificar se a tabela 'professores' existe
    try {
      await connection.execute(`SELECT 1 FROM professores WHERE 1 = 0`);
      console.log('Tabela "professores" já existe.');
    } catch (error: any) {
      // O erro ORA-00942 significa que a tabela não existe, o que é esperado.
      if (error.errorNum === 942) {
        console.log('Tabela "professores" não encontrada. Criando...');
        
        const sqlFilePath = path.join(__dirname, '../../BD_MANAGER_ALL.sql');
        const createTableSQL = fs.readFileSync(sqlFilePath, 'utf8');
        const sqlCommands = createTableSQL.split(';').filter(cmd => cmd.trim() !== '' && !cmd.trim().toUpperCase().startsWith('COMMIT'));

        for (const command of sqlCommands) {
          if (command.trim()) {
            await connection.execute(command);
          }
        }
        
        console.log('Tabela "professores" criada com sucesso.');
        await connection.commit();
      } else {
        throw error;
      }
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
