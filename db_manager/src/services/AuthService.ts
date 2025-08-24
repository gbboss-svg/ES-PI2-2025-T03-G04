import pool from '../database/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class AuthService {
  async register(nome: string, email: string, celular: string, senha: string) {
    const [rows]: any = await pool.execute('SELECT * FROM professores WHERE email = ?', [email]);

    if (rows.length > 0) {
      throw new Error('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await pool.execute(
      'INSERT INTO professores (nome, email, celular, senha) VALUES (?, ?, ?, ?)',
      [nome, email, celular, hashedPassword]
    );
  }

  async login(email: string, senha: string) {
    const [rows]: any = await pool.execute('SELECT * FROM professores WHERE email = ?', [email]);

    if (rows.length === 0) {
      throw new Error('E-mail ou senha inválidos');
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      throw new Error('E-mail ou senha inválidos');
    }

    const token = jwt.sign({ id: user.id }, 'your-secret-key', { expiresIn: '1h' });

    return token;
  }

  async forgotPassword(email: string) {
    const [rows]: any = await pool.execute('SELECT * FROM professores WHERE email = ?', [email]);

    if (rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await pool.execute(
      'UPDATE professores SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
      [token, expires, email]
    );

    console.log(`Link para redefinição de senha: http://localhost:3000/reset-password/${token}`);
  }

  async resetPassword(token: string, senha: string) {
    const [rows]: any = await pool.execute(
      'SELECT * FROM professores WHERE reset_password_token = ? AND reset_password_expires > ?',
      [token, new Date()]
    );

    if (rows.length === 0) {
      throw new Error('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await pool.execute(
      'UPDATE professores SET senha = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ?',
      [hashedPassword, token]
    );
  }
}

export default new AuthService();
