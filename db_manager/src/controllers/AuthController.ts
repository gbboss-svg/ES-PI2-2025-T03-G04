import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

class AuthController {
  async register(req: Request, res: Response) {
    const { nome, email, cpf, celular, senha } = req.body;
    await AuthService.register(nome, email, cpf, celular, senha);
    return res.status(201).send();
  }

  async login(req: Request, res: Response) {
    try {
      const { identifier, senha } = req.body;
      const token = await AuthService.login(identifier, senha);
      return res.json({ token });
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    const { identifier } = req.body;
    const email = await AuthService.forgotPassword(identifier);
    return res.json({ email });
  }

  async resetPassword(req: Request, res: Response) {
    const { email, novaSenha } = req.body;
    await AuthService.resetPassword(email, novaSenha);
    return res.send();
  }

  async verifyEmail(req: Request, res: Response) {
    const { email, code } = req.body;
    await AuthService.verifyEmail(email, code);
    return res.status(200).send({ message: 'E-mail verificado com sucesso!' });
  }

  async resendVerificationEmail(req: Request, res: Response) {
    const { email } = req.body;
    await AuthService.resendVerificationEmail(email);
    return res.status(200).send({ message: 'E-mail de verificação reenviado.' });
  }

  async cancelRegistration(req: Request, res: Response) {
    const { email } = req.body;
    await AuthService.cancelRegistration(email);
    return res.status(200).send({ message: 'Cadastro cancelado.' });
  }
}

export default new AuthController();
