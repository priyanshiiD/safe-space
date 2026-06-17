import sgMail from '@sendgrid/mail';

const getSendGridApiKey = () => {
  return process.env.SENDGRID_API_KEY;
};

const getFromEmail = () => {
  return process.env.SENDGRID_FROM || process.env.SMTP_FROM || 'no-reply@safespace.app';
};

export const sendEmergencyAlertEmail = async ({ to, subject, text, html }) => {
  const apiKey = getSendGridApiKey();

  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not set');
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to,
    from: getFromEmail(),
    subject,
    text,
    html
  };

  await sgMail.send(msg);
};
