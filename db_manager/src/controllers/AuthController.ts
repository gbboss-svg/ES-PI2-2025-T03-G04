import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import ProfessorService from '../services/ProfessorService';

class AuthController {
  // ✅ Registro de professor
  async register(req: Request, res: Response) {
    try {
      const { nome, email, cpf, celular, senha } = req.body;
      await AuthService.register(nome, email, cpf, celular, senha);
      return res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    } catch (error: any) {
      console.error('Erro no register:', error);
      return res.status(500).json({ message: error.message || 'Erro ao registrar usuário.' });
    }
  }

  // ✅ Login com verificação de primeiro acesso
  async login(req: Request, res: Response) {
    try {
      const { identifier, senha } = req.body;

      // AuthService retorna token JWT
      const token = await AuthService.login(identifier, senha);

      // Decodifica o token (sem verificar assinatura)
      const [, payloadBase64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      const professorId = payload.id;

      // Verifica se é o primeiro acesso (sem instituição vinculada)
      const isFirstAccess = await ProfessorService.isFirstAccess(professorId);

      // Define rota inicial para o front-end redirecionar
      const initialRoute = isFirstAccess
        ? '/dashboard-instituicao'
        : '/main';

      // Retorna resposta para o frontend
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

  // ✅ Esqueci minha senha
  async forgotPassword(req: Request, res: Response) {
    try {
      const { identifier } = req.body;
      const email = await AuthService.forgotPassword(identifier);
      return res.json({ email });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // ✅ Redefinir senha
  async resetPassword(req: Request, res: Response) {
    try {
      const { email, novaSenha } = req.body;
      await AuthService.resetPassword(email, novaSenha);
      return res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // ✅ Verificar e-mail
  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      await AuthService.verifyEmail(email, code);
      return res.status(200).json({ message: 'E-mail verificado com sucesso!' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // ✅ Reenviar verificação
  async resendVerificationEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.resendVerificationEmail(email);
      return res.status(200).json({ message: 'E-mail de verificação reenviado.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // ✅ Cancelar registro
  async cancelRegistration(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.cancelRegistration(email);
      return res.status(200).json({ message: 'Cadastro cancelado.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new AuthController();
