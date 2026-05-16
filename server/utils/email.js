import nodemailer from 'nodemailer';

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration is missing');
  }

  return { host, port, user, pass };
};

const createTransporter = () => {
  const { host, port, user, pass } = getSmtpConfig();
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || 'no-reply@safespace.app';
  const subject = 'Reset your SafeSpace password';
  const text = `You requested a password reset. Use the link below to set a new password.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <p>You requested a password reset. Use the link below to set a new password.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  try {
    await transporter.verify();
  } catch (error) {
    console.error('SMTP verification failed:', error);
    throw error;
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  return info;
};
