import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import professorRoutes from './routes/professor.routes';
import courseRoutes from './routes/course.routes';
import disciplineRoutes from './routes/discipline.routes';
import turmaRoutes from './routes/turma.routes';
import auditRoutes from './routes/audit.routes';
import gradeRoutes from './routes/grade.routes';
import studentRoutes from './routes/student.routes'; // Importa as novas rotas de aluno
import { connectionMiddleware } from './middlewares/database';
import oracledb from 'oracledb';

declare const __dirname: string;

declare global {
  namespace Express {
    export interface Request {
      dbConnection?: oracledb.Connection;
      user?: { id: number; iat: number; exp: number };
    }
  }
}

const app = express();

app.use(cors());
app.use(express.json());
// FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
app.use(connectionMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api', courseRoutes);
app.use('/api', disciplineRoutes);
app.use('/api', turmaRoutes);
app.use('/api', auditRoutes);
app.use('/api', gradeRoutes);
app.use('/api', studentRoutes); // Adiciona as novas rotas de aluno

const basePath = path.resolve(__dirname, '..', '..', 'Telas');

const loginCadastroPath = path.join(basePath, 'Telas-Area-de-Login-Cadastro');
app.use('/login', express.static(path.join(loginCadastroPath, 'Tela-Login')));
app.use('/esqueci-senha', express.static(path.join(loginCadastroPath, 'Tela-Esqueci-Minha-Senha')));
app.use('/novo-cadastro', express.static(path.join(loginCadastroPath, 'Tela-Novo-Cadastro')));
app.use('/cadastrar-nova-senha', express.static(path.join(loginCadastroPath, 'Tela-Cadastrar-Nova-Senha')));
app.use('/verificar-codigo', express.static(path.join(loginCadastroPath, 'Tela-Verificar-Código')));
app.use('/verificacao-codigo-registro', express.static(path.join(loginCadastroPath, 'Tela-Verificação-Código-Para-Registro')));

const trabalhoPath = path.join(basePath, 'Telas-de-Trabalho');
app.use('/dashboard-instituicao', express.static(path.join(trabalhoPath, 'Dashboard-instituição')));
app.use('/main', express.static(path.join(trabalhoPath, 'Main-Screen')));

// FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
app.get('/', (req: express.Request, res: express.Response) => {
  res.redirect('/login');
});

// FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
app.get('/login', (req: express.Request, res: express.Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Login', 'tela.html')));
app.get('/esqueci-senha', (req: express.Request, res: express.Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Esqueci-Minha-Senha', 'tela.html')));
app.get('/novo-cadastro', (req: express.Request, res: express.Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Novo-Cadastro', 'tela-registro.html')));
app.get('/cadastrar-nova-senha', (req: express.Request, res: express.Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Cadastrar-Nova-Senha', 'tela.html')));
app.get('/verificar-codigo', (req: express.Request, res: express.Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Verificar-Código', 'tela.html')));
app.get('/verificacao-codigo-registro', (req: express.Request, res: express.Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Verificação-Código-Para-Registro', 'tela.html')));
app.get('/dashboard-instituicao', (req: express.Request, res: express.Response) => res.sendFile(path.join(trabalhoPath, 'Dashboard-instituição', 'tela-dashboard-instituicao.html')));
app.get('/main', (req: express.Request, res: express.Response) => res.sendFile(path.join(trabalhoPath, 'Main-Screen', 'index.html')));

// FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({ message: err.message || 'Erro interno' });
});

export { app };