import nodemailer from 'nodemailer';

class EmailService {
  private transporter;

  constructor() {
    // Configuração do Nodemailer com Mailtrap (substitua com suas credenciais)
    this.transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "99354df86cb37a", // TROQUE PELO SEU USUÁRIO
        pass: "d4e0688e4906d7"    // TROQUE PELA SUA SENHA
      }
    });
  }

  // Gera um código de verificação de 6 dígitos
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Envia o e-mail de verificação
  async sendVerificationEmail(to: string, code: string) {
    const mailOptions = {
      from: '"Seu App" <nao-responda@seuapp.com>',
      to: to,
      subject: 'Código de Verificação',
      html: `
        <h1>Seu código de verificação</h1>
        <p>Olá,</p>
        <p>Obrigado por se registrar. Use o código abaixo para verificar seu e-mail:</p>
        <h2><strong>${code}</strong></h2>
        <p>Se você não solicitou este código, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe do Seu App</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`E-mail de verificação enviado para ${to}`);
    } catch (error) {
      console.error(`Erro ao enviar e-mail de verificação para ${to}:`, error);
      throw new Error('Não foi possível enviar o e-mail de verificação.');
    }
  }
}

export default new EmailService();
