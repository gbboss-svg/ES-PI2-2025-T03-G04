

import 'dotenv/config';
import { app } from './app';
import { initialize, close } from './database/db';
import { setupDatabase } from './database/setup';

const port = process.env.PORT || 3333;

async function startServer() {
  try {
    console.log('Iniciando o pool de conexões do banco de dados...');
    
    const dbInitialization = initialize();
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('A inicialização do banco de dados demorou muito (timeout).')), 10000) // 10 segundos
    );

    await Promise.race([dbInitialization, timeout]);
    
    console.log('Configurando o banco de dados (verificando/criando tabelas)...');
    await setupDatabase();
    
    app.listen(port, () => {
      console.log(`Servidor está rodando na porta ${port}`);
      console.log('Aplicação pronta para receber requisições.');
    });

  } catch (err: any) {
    console.error('Falha ao iniciar o servidor:', err.message);
    if (err.message.includes('timeout')) {
        console.error('\n--- DICA DE DIAGNÓSTICO ---');
        console.error('Este erro de timeout geralmente ocorre quando o driver Node.js para Oracle (oracledb) não consegue encontrar as bibliotecas do Oracle Instant Client.');
        console.error('Por favor, verifique se o Oracle Instant Client está instalado e se o caminho para suas bibliotecas foi adicionado à variável de ambiente PATH do sistema.');
        console.error('---------------------------\n');
    }
    // FIX: Cast process to any to access exit method when types are not correctly loaded.
    (process as any).exit(1);
  }
}

startServer();

// Garante que o pool de conexões seja fechado corretamente ao encerrar o processo
// FIX: Cast process to any to access on method when types are not correctly loaded.
(process as any).on('SIGTERM', async () => {
  console.log('Recebido sinal SIGTERM. Fechando o pool de conexões...');
  await close();
  // FIX: Cast process to any to access exit method when types are not correctly loaded.
  (process as any).exit(0);
});

// FIX: Cast process to any to access on method when types are not correctly loaded.
(process as any).on('SIGINT', async () => {
  console.log('Recebido sinal SIGINT (Ctrl+C). Fechando o pool de conexões...');
  await close();
  // FIX: Cast process to any to access exit method when types are not correctly loaded.
  (process as any).exit(0);
});