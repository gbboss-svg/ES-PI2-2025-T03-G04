import SmsService from './SmsService';

async function testSendVerificationSms() {
  const accountSid = 'ACe358b9380187e683d085d715379f04da'; // Seu Account SID do Twilio
  const authToken = '37577b75239f225673675aac6dfc1f14';   // Seu Auth Token do Twilio
  const twilioPhoneNumber = '+18043761685'; // Seu número de telefone Twilio

  const smsService = new SmsService(accountSid, authToken, twilioPhoneNumber);

  const targetPhoneNumber = '+5511944421944'; // Número de telefone verificado para o qual deseja enviar o SMS
  const verificationCode = smsService.generateVerificationCode();

  console.log(`Attempting to send verification SMS to ${targetPhoneNumber} with code: ${verificationCode}`);

  try {
    await smsService.sendVerificationSms(targetPhoneNumber, verificationCode);
    console.log('Verification SMS sent successfully!');
  } catch (error) {
    console.error('Failed to send verification SMS:', error);
  }
}

testSendVerificationSms();
