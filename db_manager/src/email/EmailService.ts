import sgMail = require('@sendgrid/mail');

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
      from: 'alex.soares.gabriel111@gmail.com', // Seu e-mail verificado no SendGrid
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
}

export default new EmailService();
