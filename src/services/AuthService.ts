import { getConnection } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import oracledb from "oracledb";

class AuthService {
  async register(nome: string, email: string, celular: string, senha: string) {
    const conn = await getConnection();

    const result = await conn.execute(
      `SELECT * FROM professores WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows && result.rows.length > 0) {
      throw new Error("E-mail já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await conn.execute(
      `INSERT INTO professores (nome, email, celular, senha) 
       VALUES (:nome, :email, :celular, :senha)`,
      { nome, email, celular, senha: hashedPassword },
      { autoCommit: true }
    );

    await conn.close();
  }

  async login(email: string, senha: string) {
    const conn = await getConnection();

    const result = await conn.execute(
      `SELECT id, senha FROM professores WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows as any[];

    if (!rows || rows.length === 0) {
      throw new Error("E-mail ou senha inválidos");
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(senha, user.SENHA);

    if (!isPasswordValid) {
      throw new Error("E-mail ou senha inválidos");
    }

    const token = jwt.sign({ id: user.ID }, "your-super-secret-key", {
      expiresIn: "1h",
    });

    await conn.close();
    return token;
  }
}

export default new AuthService();
