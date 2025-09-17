import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

class AuthController {
  async register(req: Request, res: Response) {
    const { nome, email, celular, senha } = req.body;
    await AuthService.register(nome, email, celular, senha);
    return res.status(201).send();
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body;
    const token = await AuthService.login(email, senha);
    return res.json({ token });
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    await AuthService.forgotPassword(email);
    return res.send();
  }

  async resetPassword(req: Request, res: Response) {
    const { token, senha } = req.body;
    await AuthService.resetPassword(token, senha);
    return res.send();
  }

  async verifyEmail(req: Request, res: Response) {
    const { email, code } = req.body;
    await AuthService.verifyEmail(email, code);
    return res.status(200).send({ message: 'E-mail verificado com sucesso!' });
  }
}

export default new AuthController();
