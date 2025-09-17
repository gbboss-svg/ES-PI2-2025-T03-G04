import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

class AuthController {
  async register(req: Request, res: Response) {
    const { nome, email, celular, senha } = req.body;

    try {
      await AuthService.register(nome, email, celular, senha);
      return res.status(201).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    try {
      const token = await AuthService.login(email, senha);
      return res.json({ token });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
      await AuthService.forgotPassword(email);
      return res.send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { token, senha } = req.body;

    try {
      await AuthService.resetPassword(token, senha);
      return res.send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    const { email, code } = req.body;

    try {
      await AuthService.verifyEmail(email, code);
      return res.status(200).send({ message: 'E-mail verificado com sucesso!' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new AuthController();
