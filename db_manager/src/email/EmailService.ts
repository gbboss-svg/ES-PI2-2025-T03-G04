import * as nodemailer from 'nodemailer';

class EmailService {
  private transporter;

  constructor() {
    // --- CÓDIGO ATUALIZADO ---
    // A configuração foi simplificada para usar apenas a opção 'service'.
    // O Nodemailer já conhece todas as configurações corretas (host, port, secure) para o Gmail.
    // --- CÓDIGO ATUALIZADO PARA CORRIGIR O ERRO DE REDE ---
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Host explícito para guiar a conexão
      port: 587,              // Porta recomendada para SMTP
      secure: false,          // 'false' para a porta 587, pois usa STARTTLS
      auth: {
        user: 'soparajogartf2@gmail.com',
        pass: 'xcrorebcqwkcvrru' // Sua Senha de App
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
      from: '"NotaDez <soparajogartf2@gmail.com>"', // Nome do Remetente e seu email
      to: to,
      subject: 'Código de Verificação',
      html: `
        <h1>Seu código de verificação</h1>
        <p>Olá,</p>
        <p>Obrigado por se registrar. Use o código abaixo para verificar seu e-mail:</p>
        <h2><strong>${code}</strong></h2>
        <p>Se você não solicitou este código, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe NotaDez</p>
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