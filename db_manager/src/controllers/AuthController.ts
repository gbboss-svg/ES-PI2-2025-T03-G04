import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

class AuthController {
  async register(req: Request, res: Response) {
    const { nome, email, cpf, celular, senha } = req.body;
    await AuthService.register(nome, email, cpf, celular, senha);
    return res.status(201).send();
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body;
    const token = await AuthService.login(email, senha);
    return res.json({ token });
  }

  async forgotPassword(req: Request, res: Response) {
    const { identifier } = req.body;
    await AuthService.forgotPassword(identifier);
    return res.send();
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
