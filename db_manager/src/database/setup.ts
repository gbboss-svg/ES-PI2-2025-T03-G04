import { getConnection } from './db';
import fs from 'fs';
import path from 'path';

export async function setupDatabase() {
  let connection;
  try {
    connection = await getConnection();
    console.log('Conectado ao Oracle DB com sucesso.');

    // 1. Verificar se a tabela 'professores' existe
    try {
      await connection.execute(`SELECT 1 FROM professores WHERE 1 = 0`);
      console.log('Tabela "professores" já existe.');
      return; // Se não der erro, a tabela existe, então podemos parar aqui.
    } catch (error: any) {
      // O erro ORA-00942 significa que a tabela não existe, o que é esperado.
      if (error.errorNum === 942) {
        console.log('Tabela "professores" não encontrada. Criando...');
        
        // 2. Ler o script SQL do arquivo
        const sqlFilePath = path.join(__dirname, '../../BD_MANAGER_ALL.sql');
        const createTableSQL = fs.readFileSync(sqlFilePath, 'utf8');

        // O script pode conter múltiplos comandos separados por ';'. 
        // O driver do Oracle pode não gostar de executar o 'COMMIT' junto.
        const sqlCommands = createTableSQL.split(';').filter(cmd => cmd.trim() !== '' && !cmd.trim().toUpperCase().startsWith('COMMIT'));

        // 3. Executar os comandos de criação
        for (const command of sqlCommands) {
          if (command.trim()) {
            await connection.execute(command);
          }
        }
        
        console.log('Tabela "professores" criada com sucesso.');
        await connection.commit(); // Commit explícito após a criação
      } else {
        // Se for outro erro, nós o lançamos
        throw error;
      }
    }
  } catch (err) {
    console.error('Erro durante a configuração do banco de dados:', err);
    process.exit(1); // Sai do processo se não conseguir configurar o DB
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Conexão com o Oracle DB fechada.');
      } catch (err) {
        console.error('Erro ao fechar a conexão:', err);
      }
    }
  }
}
