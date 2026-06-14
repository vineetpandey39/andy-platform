import crypto from 'node:crypto';

const COOKIE_NAME = 'andy_session';
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret() {
  return process.env.ANDY_SESSION_SECRET || process.env.ANTHROPIC_API_KEY || process.env.ANDY_CODEWORD || 'andy-dev-secret';
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

function parseCookie(header = '') {
  return Object.fromEntries(
    String(header)
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const index = part.indexOf('=');
        return index === -1 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

export function createSessionCookie() {
  const payload = Buffer.from(JSON.stringify({ sub: 'vineet', iat: Date.now() })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export function isAuthed(request) {
  const token = parseCookie(request.headers.get('cookie') || '')[COOKIE_NAME];
  if (!token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Date.now() - Number(data.iat || 0) < MAX_AGE_SECONDS * 1000;
  } catch {
    return false;
  }
}

export function requiredCodeword() {
  return String(process.env.ANDY_CODEWORD || 'andy activate').trim().toLowerCase();
}
