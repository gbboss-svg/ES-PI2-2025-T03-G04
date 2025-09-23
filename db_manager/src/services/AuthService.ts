import { getConnection } from '../database/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import EmailService from '../email/EmailService';
import oracledb from 'oracledb';

class AuthService {
  async register(nome: string, email: string, cpf: string, celular: string, senha: string) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT * FROM PROFESSORES WHERE EMAIL = :email`,
        { email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows && result.rows.length > 0) {
        throw new Error('E-mail já cadastrado');
      }

      const hashedPassword = await bcrypt.hash(senha, 10);
      const verificationCode = EmailService.generateVerificationCode();

      await conn.execute(
        `INSERT INTO PROFESSORES (NOME, EMAIL, CPF, CELULAR, SENHA, VERIFICATION_CODE) VALUES (:nome, :email, :cpf, :celular, :senha, :verificationCode)`,
        { nome, email, cpf, celular, senha: hashedPassword, verificationCode },
        { autoCommit: true }
      );

      // Dispara o envio de e-mail sem esperar pela conclusão
      EmailService.sendVerificationEmail(email, verificationCode).catch(error => {
        // Log do erro para análise posterior, sem travar a aplicação
        console.error(`Falha ao enviar e-mail de verificação para ${email} em segundo plano:`, error);
      });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  async verifyEmail(email: string, code: string) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT * FROM PROFESSORES WHERE EMAIL = :email`,
        { email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const rows = result.rows as any[];
      if (!rows || rows.length === 0) {
        // Mesmo que o usuário não seja encontrado, retornamos uma mensagem genérica
        // para não revelar se um e-mail está ou não cadastrado.
        throw new Error('Código de verificação inválido.');
      }

      const user = rows[0];

      // Se o código estiver correto, verificamos o usuário e terminamos.
      if (user.VERIFICATION_CODE === code) {
        await conn.execute(
          `UPDATE PROFESSORES SET IS_VERIFIED = 1, VERIFICATION_CODE = NULL, VERIFICATION_ATTEMPTS = 0 WHERE EMAIL = :email`,
          { email },
          { autoCommit: true }
        );
        return; // Sucesso
      }

      // Se o código estiver incorreto, incrementamos a tentativa.
      const newAttempts = user.VERIFICATION_ATTEMPTS + 1;

      // Se o novo número de tentativas for 3 ou mais, bloqueamos.
      if (newAttempts >= 3) {
        // Para um novo cadastro, deletamos. Para um reset, apenas bloqueamos.
        const userIsVerified = user.IS_VERIFIED === 1;
        if (!userIsVerified) {
            await conn.execute(`DELETE FROM PROFESSORES WHERE EMAIL = :email`, { email }, { autoCommit: true });
        }
        // Lançamos um erro especial que o frontend pode identificar.
        throw new Error('MAX_ATTEMPTS_REACHED');
      } else {
        // Se não, apenas atualizamos o contador.
        await conn.execute(
          `UPDATE PROFESSORES SET VERIFICATION_ATTEMPTS = :newAttempts WHERE EMAIL = :email`,
          { newAttempts, email },
          { autoCommit: true }
        );
        throw new Error('Código de verificação inválido.');
      }
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  async resendVerificationEmail(email: string) {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT * FROM PROFESSORES WHERE EMAIL = :email AND IS_VERIFIED = 0`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const rows = result.rows as any[];
        if (!rows || rows.length === 0) {
            // Don't reveal if user exists, just do nothing.
            return;
        }

        const user = rows[0];

        if (user.RESEND_ATTEMPTS >= 2) { // This is the 3rd attempt
            await conn.execute(`DELETE FROM PROFESSORES WHERE EMAIL = :email`, { email }, { autoCommit: true });
            throw new Error('MAX_ATTEMPTS_REACHED');
        }

        const newVerificationCode = EmailService.generateVerificationCode();
        await conn.execute(
            `UPDATE PROFESSORES SET VERIFICATION_CODE = :newVerificationCode, RESEND_ATTEMPTS = RESEND_ATTEMPTS + 1 WHERE EMAIL = :email`,
            { newVerificationCode, email },
            { autoCommit: true }
        );

        await EmailService.sendVerificationEmail(email, newVerificationCode);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
  }

  async cancelRegistration(email: string) {
    let conn;
    try {
      conn = await getConnection();
      // Only delete if the user is not yet verified
      await conn.execute(
        `DELETE FROM PROFESSORES WHERE EMAIL = :email AND IS_VERIFIED = 0`,
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
        `SELECT * FROM PROFESSORES WHERE EMAIL = :email`,
        { email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = result.rows as any[];

      if (!rows || rows.length === 0) {
        throw new Error('Usuário não cadastrado');
      }

      const user = rows[0];
      if (user.IS_VERIFIED !== 1) {
        throw new Error('Por favor, verifique seu e-mail antes de fazer login.');
      }
      
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

  async forgotPassword(identifier: string) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT * FROM PROFESSORES WHERE EMAIL = :identifier OR CPF = :identifier OR CELULAR = :identifier`,
        { identifier },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = result.rows as any[];

      if (!rows || rows.length === 0) {
        // To prevent user enumeration, we don't throw an error here.
        // We can log this attempt and pretend the email was sent.
        console.log(`Password reset attempt for non-existent user: ${identifier}`);
        return;
      }

      const user = rows[0];
      const userEmail = user.EMAIL;

      const verificationCode = EmailService.generateVerificationCode();

      await conn.execute(
        `UPDATE PROFESSORES 
         SET VERIFICATION_CODE = :verificationCode, 
             VERIFICATION_ATTEMPTS = 0, 
             RESEND_ATTEMPTS = 0 
         WHERE ID = :id`,
        { verificationCode, id: user.ID },
        { autoCommit: true }
      );

      // Envia o e-mail de recuperação de senha
      await EmailService.sendPasswordResetEmail(userEmail, verificationCode);
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  async resetPassword(email: string, novaSenha: string) {
    let conn;
    try {
      conn = await getConnection();
      const hashedPassword = await bcrypt.hash(novaSenha, 10);

      await conn.execute(
        `UPDATE PROFESSORES 
         SET SENHA = :hashedPassword, 
             VERIFICATION_CODE = NULL 
         WHERE EMAIL = :email`,
        { hashedPassword, email },
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
