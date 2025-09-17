import { app } from './app';
import { initialize, close } from './database/db';
import { setupDatabase } from './database/setup';

const port = process.env.PORT || 3333;

async function startServer() {
  try {
    console.log('Iniciando o pool de conexões do banco de dados...');
    await initialize();
    
    console.log('Configurando o banco de dados (verificando/criando tabelas)...');
    await setupDatabase();
    
    app.listen(port, () => {
      console.log(`Servidor está rodando na porta ${port}`);
      console.log('Aplicação pronta para receber requisições.');
    });

  } catch (err) {
    console.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
}

startServer();

// Garante que o pool de conexões seja fechado corretamente ao encerrar o processo
process.on('SIGTERM', async () => {
  console.log('Recebido sinal SIGTERM. Fechando o pool de conexões...');
  await close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Recebido sinal SIGINT (Ctrl+C). Fechando o pool de conexões...');
  await close();
  process.exit(0);
});
