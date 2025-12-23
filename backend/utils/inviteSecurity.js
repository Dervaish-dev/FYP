import crypto from 'crypto';

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const maskEmail = (email) => {
  const normalized = normalizeEmail(email);
  const [local, domain] = normalized.split('@');
  if (!local || !domain) return '***';

  const maskedLocal = local.length <= 2 ? `${local[0] || '*'}*` : `${local[0]}***${local[local.length - 1]}`;

  const domainParts = domain.split('.');
  const domainName = domainParts[0] || '';
  const domainTld = domainParts.slice(1).join('.') || '';

  const maskedDomainName = domainName.length <= 2
    ? `${domainName[0] || '*'}*`
    : `${domainName[0]}***${domainName[domainName.length - 1]}`;

  const maskedDomain = domainTld ? `${maskedDomainName}.${domainTld}` : maskedDomainName;
  return `${maskedLocal}@${maskedDomain}`;
};

const requireSecret = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

export const hmac = (value, secretEnvName) => {
  const secret = requireSecret(secretEnvName);
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
};

const deriveAes256Key = (secretEnvName) => {
  const secret = requireSecret(secretEnvName);
  return crypto.createHash('sha256').update(secret).digest(); // 32 bytes
};

export const encryptWithSecret = (plaintext, secretEnvName) => {
  const key = deriveAes256Key(secretEnvName);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
};

export const decryptWithSecret = (encrypted, secretEnvName) => {
  if (!encrypted) return null;
  const parts = String(encrypted).split('.');
  if (parts.length !== 3) return null;
  const [ivB64u, tagB64u, ctB64u] = parts;
  const key = deriveAes256Key(secretEnvName);
  const iv = Buffer.from(ivB64u, 'base64url');
  const tag = Buffer.from(tagB64u, 'base64url');
  const ciphertext = Buffer.from(ctB64u, 'base64url');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
};

export const generateInviteCode = (length = 8) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    const idx = crypto.randomInt(0, INVITE_ALPHABET.length);
    code += INVITE_ALPHABET[idx];
  }
  return code;
};

export const generateOtp = () => {
  const n = crypto.randomInt(0, 1000000);
  return String(n).padStart(6, '0');
};

export const generateClaimToken = () => {
  return crypto.randomBytes(32).toString('base64url');
};
