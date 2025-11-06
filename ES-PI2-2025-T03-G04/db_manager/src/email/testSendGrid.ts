import EmailService from './EmailService';

async function testSendVerificationEmail() {
  const targetEmail = 'soparajogartf2@gmail.com';
  const verificationCode = EmailService.generateVerificationCode();

  console.log(`Attempting to send verification email to ${targetEmail} with code: ${verificationCode}`);

  try {
    await EmailService.sendVerificationEmail(targetEmail, verificationCode);
    console.log('Verification email sent successfully!');
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
}

testSendVerificationEmail();
