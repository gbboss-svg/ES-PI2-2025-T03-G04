import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import { router } from './routes/auth.routes';

const app = express();

app.use(cors()); // Habilita o CORS para todas as origens
app.use(express.json());
app.use(router);

// Middleware de tratamento de erros global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log do erro para depuração no servidor

  // Define um status de erro padrão
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    message: err.message || 'Ocorreu um erro interno no servidor.'
  });
});

export { app };
