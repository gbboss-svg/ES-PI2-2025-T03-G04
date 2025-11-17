import express from 'express';
import AuthService from '../services/AuthService';
import ProfessorService from '../services/ProfessorService';
import oracledb from 'oracledb';
import { Buffer } from 'buffer';

class AuthController {
  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  private getDbConnection(req: express.Request): oracledb.Connection {
    if (!req.dbConnection) {
      throw new Error('Database connection not found in request. Ensure connectionMiddleware is applied.');
    }
    return req.dbConnection;
  }

  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async register(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { nome, email, cpf, celular, senha } = req.body;
      await AuthService.register(connection, nome, email, cpf, celular, senha);
      return res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    } catch (error: any) {
      console.error('Erro no register:', error);
      return res.status(500).json({ message: error.message || 'Erro ao registrar usuário.' });
    }
  }

  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async login(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { identifier, senha } = req.body;

      const token = await AuthService.login(connection, identifier, senha);

      const [, payloadBase64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      const professorId = payload.id;

      const isFirstAccess = await ProfessorService.isFirstAccess(connection, professorId);

      const initialRoute = isFirstAccess
        ? '/dashboard-instituicao'
        : '/main';

      return res.status(200).json({
        success: true,
        token,
        firstAccess: isFirstAccess,
        redirectTo: initialRoute,
        message: isFirstAccess
          ? 'Primeiro acesso detectado. Redirecionando para o cadastro de instituição.'
          : 'Login realizado com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      return res.status(401).json({ message: error.message || 'Falha ao realizar login.' });
    }
  }

  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async forgotPassword(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { identifier } = req.body;
      const email = await AuthService.forgotPassword(connection, identifier);
      return res.json({ email });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async resetPassword(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { email, novaSenha } = req.body;
      await AuthService.resetPassword(connection, email, novaSenha);
      return res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async verifyEmail(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { email, code } = req.body;
      await AuthService.verifyEmail(connection, email, code);
      return res.status(200).json({ message: 'E-mail verificado com sucesso!' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async resendVerificationEmail(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { email } = req.body;
      await AuthService.resendVerificationEmail(connection, email);
      return res.status(200).json({ message: 'E-mail de verificação reenviado.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  
  // FIX: Padronizado para usar o namespace do express para tipos (ex: express.Request) para resolver erros de tipo.
  async cancelRegistration(req: express.Request, res: express.Response) {
    try {
      const connection = this.getDbConnection(req);
      const { email } = req.body;
      await AuthService.cancelRegistration(connection, email);
      return res.status(200).json({ message: 'Cadastro cancelado.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new AuthController();