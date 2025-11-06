const twilio = require('twilio');

class SmsService {
  private client;
  private twilioPhoneNumber: string;

  constructor(accountSid: string, authToken: string, twilioPhoneNumber: string) {
    this.client = twilio(accountSid, authToken);
    this.twilioPhoneNumber = twilioPhoneNumber;
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationSms(to: string, code: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: `Seu código de verificação é: ${code}`,
        from: this.twilioPhoneNumber,
        to: to
      });
      console.log(`SMS de verificação enviado para ${to}`);
    } catch (error) {
      console.error(`Erro ao enviar SMS de verificação para ${to}:`, error);
      throw new Error('Não foi possível enviar o SMS de verificação.');
    }
  }
}

export default SmsService;
