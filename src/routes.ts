import { Router } from "express";
import AuthService from "./services/AuthService";

const router = Router();

router.post("/register", async (req, res) => {
  const { nome, email, celular, senha } = req.body;
  try {
    await AuthService.register(nome, email, celular, senha);
    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const token = await AuthService.login(email, senha);
    res.json({ token });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

export default router;