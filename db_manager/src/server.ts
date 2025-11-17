  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   *Desevolvido por:Alex Gabriel Soares Sousa R.A:24802449
   */

import 'dotenv/config';
import { app } from './app';
import { initialize, close } from './database/db';
import { setupDatabase } from './database/setup';
import crypto from 'crypto';

declare const process: any;

if (!process.env.JWT_SECRET) {
  console.warn('ATENÇÃO: JWT_SECRET não definido. Gerando chave temporária.');
  process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
}

const port = process.env.PORT || 3333;

/**
 * Função principal que inicia o servidor.
 */
async function startServer() {
  try {
    console.log('Iniciando o pool de conexões do banco de dados...');
    
    const dbInitialization = initialize();
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('A inicialização do banco de dados demorou muito (timeout).')), 10000)
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
        console.error('DICA: Este erro de timeout geralmente ocorre se o Oracle Instant Client não for encontrado. Verifique sua instalação e a variável de ambiente PATH.');
    }
    process.exit(1);
  }
}

startServer();

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