import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import path from 'path';
import { router } from './routes/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

// --- Configuração de Rotas Estáticas ---

const basePath = 'C:/Users/24013653/Desktop/ES-PI2-2025-T03-G04/Telas';

// Área de Login e Cadastro
const loginCadastroPath = path.join(basePath, 'Telas-Area-de-Login-Cadastro');
app.use('/login', express.static(path.join(loginCadastroPath, 'Tela-Login')));
app.use('/esqueci-senha', express.static(path.join(loginCadastroPath, 'Tela-Esqueci-Minha-Senha')));
app.use('/novo-cadastro', express.static(path.join(loginCadastroPath, 'Tela-Novo-Cadastro')));
app.use('/cadastrar-nova-senha', express.static(path.join(loginCadastroPath, 'Tela-Cadastrar-Nova-Senha')));
app.use('/verificar-codigo', express.static(path.join(loginCadastroPath, 'Tela-Verificar-Código')));
app.use('/verificacao-codigo-registro', express.static(path.join(loginCadastroPath, 'Tela-Verificação-Código-Para-Registro')));


// Telas de Trabalho
const trabalhoPath = path.join(basePath, 'Telas-de-Trabalho');
app.use('/dashboard-instituicao', express.static(path.join(trabalhoPath, 'DashBoard-instituicao')));
app.use('/main', express.static(path.join(trabalhoPath, 'Main-Screen')));


// --- Redirecionamentos e Rotas Padrão ---

// Rota principal redireciona para /login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Servir o HTML principal para cada rota
app.get('/login', (req, res) => res.sendFile(path.join(loginCadastroPath, 'Tela-Login', 'tela.html')));
app.get('/esqueci-senha', (req, res) => res.sendFile(path.join(loginCadastroPath, 'Tela-Esqueci-Minha-Senha', 'tela.html')));
app.get('/novo-cadastro', (req, res) => res.sendFile(path.join(loginCadastroPath, 'Tela-Novo-Cadastro', 'tela-registro.html')));
app.get('/cadastrar-nova-senha', (req, res) => res.sendFile(path.join(loginCadastroPath, 'Tela-Cadastrar-Nova-Senha', 'tela.html')));
app.get('/verificar-codigo', (req, res) => res.sendFile(path.join(loginCadastroPath, 'Tela-Verificar-Código', 'tela.html')));
app.get('/verificacao-codigo-registro', (req, res) => res.sendFile(path.join(loginCadastroPath, 'Tela-Verificação-Código-Para-Registro', 'tela.html')));

// Servir HTML das telas de trabalho
app.get('/dashboard-instituicao', (req, res) => res.sendFile(path.join(trabalhoPath, 'DashBoard-instituicao', 'tela-dashboard-instituicao.html')));
app.get('/main', (req, res) => res.sendFile(path.join(trabalhoPath, 'Main-Screen', 'index.html')));

// Middleware global de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({ message: err.message || 'Erro interno' });
});

export { app };
