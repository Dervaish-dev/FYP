import nodemailer from 'nodemailer';

class MailerConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MailerConfigError';
    this.code = 'MAILER_NOT_CONFIGURED';
  }
}

// Reuse the same transport instance instead of creating a new one each time
let cachedTransport = null;

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

  // Return cached transport if it exists
  if (cachedTransport) {
    return cachedTransport;
  }

  // Create new transport with proper timeout and pooling settings
  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true, // Use connection pooling
    maxConnections: 5, // Maximum number of simultaneous connections
    maxMessages: 100, // Maximum number of messages per connection
    rateDelta: 1000, // Minimum time between messages (1 second)
    rateLimit: 5, // Maximum messages per rateDelta
    connectionTimeout: 10000, // 10 seconds connection timeout
    greetingTimeout: 5000, // 5 seconds greeting timeout
    socketTimeout: 15000, // 15 seconds socket timeout
  });

  // Handle transport errors
  cachedTransport.on('error', (err) => {
    console.error('SMTP Transport Error:', err);
    // Reset cached transport on error
    cachedTransport = null;
  });

  return cachedTransport;
};

export const sendOtpEmail = async ({ to, otp, expiresMinutes }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new MailerConfigError('SMTP is not configured. Missing: SMTP_FROM (or SMTP_USER)');
  }

  const transport = getTransport();

  const subject = 'Your NeuroCompanion verification code';
  const text = `Your verification code is: ${otp}\n\nThis code expires in ${expiresMinutes} minutes. If you did not request this, you can ignore this email.`;

  try {
    // Send email with timeout wrapper
    const sendPromise = transport.sendMail({
      from,
      to,
      subject,
      text
    });

    // Add overall timeout of 20 seconds for the entire send operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email send timeout - operation took longer than 20 seconds')), 20000);
    });

    await Promise.race([sendPromise, timeoutPromise]);
    
    console.log(`✓ OTP email sent successfully to ${to}`);
  } catch (error) {
    console.error('Failed to send OTP email:', error.message);
    
    // Reset transport on error so next attempt creates fresh connection
    cachedTransport = null;
    
    // Re-throw with more descriptive message
    if (error.message.includes('timeout')) {
      throw new Error('Email server timeout - please try again in a moment');
    }
    throw error;
  }
};

export const sendEmail = async ({ to, subject, text, attachments }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new MailerConfigError('SMTP is not configured. Missing: SMTP_FROM (or SMTP_USER)');
  }

  const transport = getTransport();

  try {
    const sendPromise = transport.sendMail({
      from,
      to,
      subject,
      text,
      attachments
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email send timeout')), 20000);
    });

    await Promise.race([sendPromise, timeoutPromise]);
    console.log(`✓ Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error.message);
    cachedTransport = null;
    throw error;
  }
};

export const isMailerConfigError = (error) => {
  return Boolean(error && (error.code === 'MAILER_NOT_CONFIGURED' || error.name === 'MailerConfigError'));
};

