import nodemailer from 'nodemailer';

class MailerConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MailerConfigError';
    this.code = 'MAILER_NOT_CONFIGURED';
  }
}

const getTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const missing = [];
  if (!host) missing.push('SMTP_HOST');
  if (!process.env.SMTP_PORT) missing.push('SMTP_PORT');
  if (!user) missing.push('SMTP_USER');
  if (!pass) missing.push('SMTP_PASS');
  if (!Number.isFinite(port)) missing.push('SMTP_PORT (must be a number)');

  if (missing.length) {
    throw new MailerConfigError(`SMTP is not configured. Missing/invalid: ${missing.join(', ')}`);
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

export const sendOtpEmail = async ({ to, otp, expiresMinutes }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new MailerConfigError('SMTP is not configured. Missing: SMTP_FROM (or SMTP_USER)');
  }

  const transport = getTransport();

  const subject = 'Your NeuroCompanion verification code';
  const text = `Your verification code is: ${otp}\n\nThis code expires in ${expiresMinutes} minutes. If you did not request this, you can ignore this email.`;

  await transport.sendMail({
    from,
    to,
    subject,
    text
  });
};

export const isMailerConfigError = (error) => {
  return Boolean(error && (error.code === 'MAILER_NOT_CONFIGURED' || error.name === 'MailerConfigError'));
};
