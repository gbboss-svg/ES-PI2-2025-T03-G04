





import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes';
import professorRoutes from './routes/professor.routes';
import courseRoutes from './routes/course.routes';
import disciplineRoutes from './routes/discipline.routes';
import turmaRoutes from './routes/turma.routes';
import auditRoutes from './routes/audit.routes'; // Importa a nova rota
import { connectionMiddleware } from './middlewares/database';

const app = express();

app.use(cors());
app.use(express.json());
app.use(connectionMiddleware);

// --- Configuração de Rotas da API ---
app.use('/api/auth', authRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api', courseRoutes);
app.use('/api', disciplineRoutes);
app.use('/api', turmaRoutes);
app.use('/api', auditRoutes); // Adiciona a nova rota de auditoria

// --- Configuração de Rotas Estáticas ---

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

// --- Redirecionamentos e Rotas Padrão ---

app.get('/', (req: Request, res: Response) => {
  res.redirect('/login');
});

app.get('/login', (req: Request, res: Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Login', 'tela.html')));
app.get('/esqueci-senha', (req: Request, res: Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Esqueci-Minha-Senha', 'tela.html')));
app.get('/novo-cadastro', (req: Request, res: Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Novo-Cadastro', 'tela-registro.html')));
app.get('/cadastrar-nova-senha', (req: Request, res: Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Cadastrar-Nova-Senha', 'tela.html')));
app.get('/verificar-codigo', (req: Request, res: Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Verificar-Código', 'tela.html')));
app.get('/verificacao-codigo-registro', (req: Request, res: Response) => res.sendFile(path.join(loginCadastroPath, 'Tela-Verificação-Código-Para-Registro', 'tela.html')));

app.get('/dashboard-instituicao', (req: Request, res: Response) => res.sendFile(path.join(trabalhoPath, 'Dashboard-instituição', 'tela-dashboard-instituicao.html')));
app.get('/main', (req: Request, res: Response) => res.sendFile(path.join(trabalhoPath, 'Main-Screen', 'index.html')));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({ message: err.message || 'Erro interno' });
});

export { app };