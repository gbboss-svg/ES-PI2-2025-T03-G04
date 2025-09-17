import { getConnection } from '../database/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import EmailService from '../email/EmailService';
import oracledb from 'oracledb';

class AuthService {
  async register(nome: string, email: string, celular: string, senha: string) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT * FROM professores WHERE email = :email`,
        { email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows && result.rows.length > 0) {
        throw new Error('E-mail já cadastrado');
      }

      const hashedPassword = await bcrypt.hash(senha, 10);
      const verificationCode = EmailService.generateVerificationCode();

      await conn.execute(
        `INSERT INTO professores (nome, email, celular, senha, verification_code) VALUES (:nome, :email, :celular, :senha, :verificationCode)`,
        { nome, email, celular, senha: hashedPassword, verificationCode },
        { autoCommit: true }
      );

      await EmailService.sendVerificationEmail(email, verificationCode);
    } finally {
      if (conn) {
        await conn.close(); // Libera a conexão
      }
    }
  }

  async verifyEmail(email: string, code: string) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT * FROM professores WHERE email = :email AND verification_code = :code`,
        { email, code },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Código de verificação inválido.');
      }

      await conn.execute(
        `UPDATE professores SET is_verified = 1, verification_code = NULL WHERE email = :email`,
        { email },
        { autoCommit: true }
      );
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  async login(email: string, senha: string) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT * FROM professores WHERE email = :email`,
        { email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = result.rows as any[];

      if (!rows || rows.length === 0) {
        throw new Error('Usuário não cadastrado');
      }

      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(senha, user.SENHA);

      if (!isPasswordValid) {
        throw new Error('E-mail ou senha inválidos');
      }

      return jwt.sign({ id: user.ID }, 'your-secret-key', { expiresIn: '1h' });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  async forgotPassword(email: string) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT * FROM professores WHERE email = :email`,
        { email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const token = crypto.randomBytes(20).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      await conn.execute(
        `UPDATE professores SET reset_password_token = :token, reset_password_expires = :expires WHERE email = :email`,
        { token, expires, email },
        { autoCommit: true }
      );

      console.log(`Link para redefinição de senha: http://localhost:3000/reset-password/${token}`);
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  async resetPassword(token: string, senha: string) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT * FROM professores WHERE reset_password_token = :token AND reset_password_expires > :currentDate`,
        { token, currentDate: new Date() },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Token inválido ou expirado');
      }

      const hashedPassword = await bcrypt.hash(senha, 10);

      await conn.execute(
        `UPDATE professores SET senha = :senha, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = :token`,
        { senha: hashedPassword, token },
        { autoCommit: true }
      );
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }
}

export default new AuthService();
