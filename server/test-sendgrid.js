import 'dotenv/config';
import sgMail from '@sendgrid/mail';

async function testEmail() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error('No SENDGRID_API_KEY found in .env');
    process.exit(1);
  }

  sgMail.setApiKey(apiKey);
  
  const msg = {
    to: 'dawarpriyanshii@gmail.com',
    from: process.env.SENDGRID_FROM || 'no-reply@safespace.app',
    subject: 'Test SendGrid Integration',
    text: 'This is a test email from SafeSpace to see if SendGrid works.',
  };

  try {
    console.log('Attempting to send email...');
    await sgMail.send(msg);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('SendGrid Error details:');
    if (error.response) {
      console.error(JSON.stringify(error.response.body, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testEmail();
