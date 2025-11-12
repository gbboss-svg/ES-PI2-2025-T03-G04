import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import EmailService from '../email/EmailService';
import oracledb from 'oracledb';

class AuthService {
  async register(connection: oracledb.Connection, nome: string, email: string, cpf: string, celular: string, senha: string) {
    try {
      // Validação de entrada
      if (!nome || nome.trim().length === 0) {
        throw new Error('O nome é obrigatório.');
      }
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('O e-mail é inválido.');
      }
      if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
        throw new Error('O CPF é inválido.');
      }
      if (!celular || celular.replace(/\D/g, '').length < 10) { // Assuming minimum 10 digits for phone
        throw new Error('O número de celular é inválido.');
      }
      if (!senha || senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }

      // Verificação unificada para credenciais existentes
      const existingUserResult = await connection.execute(
        `SELECT Id_Professor, Is_Verified, Email, Cpf, Celular 
         FROM professores 
         WHERE Email = :email OR Cpf = :cpf OR Celular = :celular`,
        { email, cpf, celular },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (existingUserResult.rows && existingUserResult.rows.length > 0) {
        const existingUser = (existingUserResult.rows as any)[0];

        // Se o usuário já estiver verificado, bloqueia um novo cadastro
        if (existingUser.IS_VERIFIED === 1) {
          if (existingUser.EMAIL === email) {
            throw new Error('E-mail já cadastrado.');
          }
          if (existingUser.CPF === cpf) {
            throw new Error('CPF já cadastrado.');
          }
          if (existingUser.CELULAR === celular) {
            throw new Error('Celular já cadastrado.');
          }
        } else {
          // Se o usuário não for verificado, é um cadastro antigo/incompleto.
          // Removemos para permitir que o usuário tente se cadastrar novamente.
          await connection.execute(
            `DELETE FROM professores WHERE Id_Professor = :id`,
            { id: existingUser.ID_PROFESSOR },
            { autoCommit: true }
          );
        }
      }

      const hashedPassword = await bcrypt.hash(senha, 10);
      const verificationCode = EmailService.generateVerificationCode();

      await connection.execute(
        `INSERT INTO professores (Nome, Email, Cpf, Celular, Senha, Verification_Code, Primeiro_Acesso) VALUES (:nome, :email, :cpf, :celular, :hashedPassword, :verificationCode, 1)`,
        { nome, email, cpf, celular, hashedPassword, verificationCode },
        { autoCommit: true }
      );

      EmailService.sendVerificationEmail(email, verificationCode).catch(error => {
        console.error(`Falha ao enviar e-mail de verificação para ${email} em segundo plano:`, error);
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  async verifyEmail(connection: oracledb.Connection, email: string, code: string) {
    try {
      const result = await connection.execute(
        `SELECT * FROM professores WHERE Email = :email`,
        { email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const rows = result.rows as any[];
      if (!rows || rows.length === 0) {
        throw new Error('Código de verificação inválido.');
      }

      const user = rows[0];

      if (user.VERIFICATION_CODE === code) {
        await connection.execute(
          `UPDATE professores SET Is_Verified = 1, Verification_Code = NULL, Verification_Attempts = 0 WHERE Email = :email`,
          { email },
          { autoCommit: true }
        );
        return;
      }

      const newAttempts = user.VERIFICATION_ATTEMPTS + 1;

      if (newAttempts >= 3) {
        const userIsVerified = user.IS_VERIFIED === 1;
        if (!userIsVerified) {
            await connection.execute(`DELETE FROM professores WHERE Email = :email`, { email }, { autoCommit: true });
        }
        throw new Error('MAX_ATTEMPTS_REACHED');
      } else {
        await connection.execute(
          `UPDATE professores SET Verification_Attempts = :newAttempts WHERE Email = :email`,
          { newAttempts, email },
          { autoCommit: true }
        );
        throw new Error('Código de verificação inválido.');
      }
    } catch (error: any) {
      console.error('Erro na verificação de e-mail:', error);
      throw error;
    }
  }

  async resendVerificationEmail(connection: oracledb.Connection, email: string) {
    try {
        const result = await connection.execute(
            `SELECT * FROM professores WHERE Email = :email AND Is_Verified = 0`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const rows = result.rows as any[];
        if (!rows || rows.length === 0) {
            return;
        }

        const user = rows[0];

        if (user.RESEND_ATTEMPTS >= 3) { // Changed from 2 to 3 to match frontend
            await connection.execute(`DELETE FROM professores WHERE Email = :email`, { email }, { autoCommit: true });
            throw new Error('MAX_ATTEMPTS_REACHED');
        }

        const newVerificationCode = EmailService.generateVerificationCode();
        await connection.execute(
            `UPDATE professores SET Verification_Code = :newVerificationCode, Resend_Attempts = Resend_Attempts + 1 WHERE Email = :email`,
            { newVerificationCode, email },
            { autoCommit: true }
        );

        await EmailService.sendVerificationEmail(email, newVerificationCode);
    } catch (error: any) {
      console.error('Erro ao reenviar e-mail de verificação:', error);
      throw error;
    }
  }

  async cancelRegistration(connection: oracledb.Connection, email: string) {
    try {
      await connection.execute(
        `DELETE FROM professores WHERE Email = :email AND Is_Verified = 0`,
        { email },
        { autoCommit: true }
      );
    } catch (error: any) {
      console.error('Erro ao cancelar registro:', error);
      throw error;
    }
  }

  async login(connection: oracledb.Connection, identifier: string, senha: string) {
    try {
      const isEmail = identifier.includes('@');
      let result;

      if (isEmail) {
        result = await connection.execute(
          `SELECT * FROM professores WHERE Email = :identifier`,
          { identifier },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
      } else {
        const cleanedIdentifier = identifier.replace(/\D/g, '');
        result = await connection.execute(
          `SELECT * FROM professores WHERE REGEXP_REPLACE(Cpf, '[^0-9]', '') = :cleanedIdentifier OR REGEXP_REPLACE(Celular, '[^0-9]', '') = :cleanedIdentifier`,
          { cleanedIdentifier },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
      }

      const rows = result.rows as any[];

      if (!rows || rows.length === 0) {
        throw new Error('Credenciais inválidas');
      }

      const user = rows[0];
      if (user.IS_VERIFIED !== 1) {
        throw new Error('Por favor, verifique seu e-mail antes de fazer login.');
      }
      
      const isPasswordValid = await bcrypt.compare(senha, user.SENHA);

      if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não está definido nas variáveis de ambiente.');
      }
      return jwt.sign({ id: user.ID_PROFESSOR }, jwtSecret, { expiresIn: '1h' });
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async forgotPassword(connection: oracledb.Connection, identifier: string) {
    try {
      const result = await connection.execute(
        `SELECT * FROM professores WHERE Email = :identifier OR Cpf = :identifier OR Celular = :identifier`,
        { identifier },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = result.rows as any[];

      if (!rows || rows.length === 0) {
        console.log(`Password reset attempt for non-existent user: ${identifier}`);
        return;
      }

      const user = rows[0];
      const userEmail = user.EMAIL;

      const verificationCode = EmailService.generateVerificationCode();

      await connection.execute(
        `UPDATE professores
         SET Verification_Code = :verificationCode,
             Verification_Attempts = 0,
             Resend_Attempts = 0
         WHERE Id_Professor = :id`,
        { verificationCode, id: user.ID_PROFESSOR },
        { autoCommit: true }
      );

      await EmailService.sendPasswordResetEmail(userEmail, verificationCode);

      return userEmail;
    } catch (error: any) {
      console.error('Erro em forgotPassword:', error);
      throw error;
    }
  }

  async resetPassword(connection: oracledb.Connection, email: string, novaSenha: string) {
    try {
      const result = await connection.execute(
        `SELECT Senha FROM professores WHERE Email = :email`,
        { email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = result.rows as any[];
      if (!rows || rows.length === 0) {
        throw new Error('Usuário não encontrado.');
      }
      const user = rows[0];

      const isSamePassword = await bcrypt.compare(novaSenha, user.SENHA);
      if (isSamePassword) {
        throw new Error('A nova senha não pode ser igual à senha anterior.');
      }

      if (novaSenha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }

      const hashedPassword = await bcrypt.hash(novaSenha, 10);

      await connection.execute(
        `UPDATE professores
         SET Senha = :hashedPassword,
             Verification_Code = NULL
         WHERE Email = :email`,
        { hashedPassword, email },
        { autoCommit: true }
      );
    } catch (error: any) {
      console.error('Erro em resetPassword:', error);
      throw error;
    }
  }

  async verifyPassword(connection: oracledb.Connection, professorId: number, senha: string) {
    try {
      const result = await connection.execute(
        `SELECT Senha FROM professores WHERE Id_Professor = :id`,
        [professorId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = result.rows as any[];
      if (!rows || rows.length === 0) {
        throw new Error('Usuário não encontrado.');
      }

      const user = rows[0];
      return await bcrypt.compare(senha, user.SENHA);
    } catch (error: any) {
      console.error('Erro na verificação de senha:', error);
      throw error;
    }
  }
}

export default new AuthService();