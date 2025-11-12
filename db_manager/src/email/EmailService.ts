


// FIX: Changed require to import for ES Module compatibility.
import sgMail from '@sendgrid/mail';

class EmailService {
  constructor() {
    // Configura a API Key do SendGrid
    sgMail.setApiKey('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');
  }
  
  // Gera um código de verificação de 6 dígitos
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Envia o e-mail de verificação usando SendGrid
  async sendVerificationEmail(to: string, code: string) {
    const msg = {
      to: to,
      from: 'staff.notadez@gmail.com', // Seu e-mail verificado no SendGrid
      subject: 'Código de Verificação',
      html: `
        <h1>Seu código de verificação</h1>
        <p>Olá,</p>
        <p>Obrigado por se registrar. Use o código abaixo para verificar seu e-mail:</p>
        <h2><strong>${code}</strong></h2>
        <p>Se você não solicitou este código, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe NotaDez</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`E-mail de verificação enviado para ${to}`);
    } catch (error: any) {
      console.error(`Erro ao enviar e-mail de verificação para ${to}:`, error);
      if (error.response) {
        console.error(error.response.body)
      }
      throw new Error('Não foi possível enviar o e-mail de verificação.');
    }
  }

  // Envia o e-mail de redefinição de senha
  async sendPasswordResetEmail(to: string, code: string) {
    const msg = {
      to: to,
      from: 'staff.notadez@gmail.com', // Seu e-mail verificado no SendGrid
      subject: 'Recuperação de Senha',
      html: `
        <h1>Código de Recuperação de Senha</h1>
        <p>Olá,</p>
        <p>Você solicitou a recuperação de senha. Use o código abaixo para redefinir sua senha:</p>
        <h2><strong>${code}</strong></h2>
        <p>Se você não solicitou esta recuperação, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe NotaDez</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`E-mail de recuperação de senha enviado para ${to}`);
    } catch (error: any) {
      console.error(`Erro ao enviar e-mail de recuperação para ${to}:`, error);
      if (error.response) {
        console.error(error.response.body)
      }
      throw new Error('Não foi possível enviar o e-mail de recuperação de senha.');
    }
  }
}

export default new EmailService();