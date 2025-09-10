import * as nodemailer from 'nodemailer';

class EmailService {
  private transporter;

  constructor() {
    // Configuração do Nodemailer com Gmail (substitua com suas credenciais)
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use TLS
      auth: {
        user: 'soparajogartf2@gmail.com', // Seu email do Gmail
        pass: 'XIenowoal78481!!3!4!2!2!3!??xkan!!!rffXcsDfz1355555KSNZBNAnK121kxndkflmNCJKE' // Sua senha do Gmail ou senha de app
      },
      tls: {
        rejectUnauthorized: false
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
      from: '"Seu App" <soparajogartf2@gmail.com>', // Seu email do Gmail
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
