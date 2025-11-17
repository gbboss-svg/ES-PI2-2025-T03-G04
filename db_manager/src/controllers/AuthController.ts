  /**
   *Desevolvido por:Alex Gabriel Soares Sousa R.A:24802449
   */


import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import AuthService from '../services/AuthService';
import ProfessorService from '../services/ProfessorService';
import oracledb from 'oracledb';
import { Buffer } from 'buffer';

class AuthController {
  
  private getDbConnection(req: ExpressRequest): oracledb.Connection {
    if (!req.dbConnection) {
      throw new Error('Database connection not found in request. Ensure connectionMiddleware is applied.');
    }
    return req.dbConnection;
  }

  
  async register(req: ExpressRequest, res: ExpressResponse) {
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

  
  async login(req: ExpressRequest, res: ExpressResponse) {
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

  
  async forgotPassword(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const { identifier } = req.body;
      const email = await AuthService.forgotPassword(connection, identifier);
      return res.json({ email });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  
  async resetPassword(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const { email, novaSenha } = req.body;
      await AuthService.resetPassword(connection, email, novaSenha);
      return res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  
  async verifyEmail(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const { email, code } = req.body;
      await AuthService.verifyEmail(connection, email, code);
      return res.status(200).json({ message: 'E-mail verificado com sucesso!' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  
  async resendVerificationEmail(req: ExpressRequest, res: ExpressResponse) {
    try {
      const connection = this.getDbConnection(req);
      const { email } = req.body;
      await AuthService.resendVerificationEmail(connection, email);
      return res.status(200).json({ message: 'E-mail de verificação reenviado.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  
  async cancelRegistration(req: ExpressRequest, res: ExpressResponse) {
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