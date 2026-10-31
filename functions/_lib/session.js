// Session + Google sign-in helpers for the private bookings app (/app).
import { hmacHex, safeEqual, b64urlDecode } from './crypto.js';

export const cleanEnv = raw => Object.fromEntries(Object.entries(raw || {}).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
export const ownerEmail = env => (env.OWNER_EMAIL || 'joenellphotography@gmail.com').toLowerCase();
export const json = (o, status = 200, headers = {}) =>
  new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });

const b64u = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const bytes = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
const COOKIE = 'jp_app';

// Verify a Google Identity Services ID token (RS256) for our client ID.
export async function verifyGoogleToken(token, clientId) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('malformed');
  const header = JSON.parse(b64urlDecode(parts[0])), p = JSON.parse(b64urlDecode(parts[1]));
  if (header.alg !== 'RS256') throw new Error('alg');
  const certs = await (await fetch('https://www.googleapis.com/oauth2/v3/certs', { cf: { cacheTtl: 3600 } })).json();
  const jwk = (certs.keys || []).find(k => k.kid === header.kid);
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, bytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]))) throw new Error('signature');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(p.iss)) throw new Error('iss');
  if (!clientId || p.aud !== clientId) throw new Error('aud');
  if (!p.exp || p.exp < Date.now() / 1000 - 60) throw new Error('expired');
  return p;
}

export async function sessionCookie(env, email, days = 30) {
  const p = b64u(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + days * 86400 }));
  const s = await hmacHex(env.LINK_SECRET, 'app-session:' + p);
  return `${COOKIE}=${p}.${s}; Path=/; Max-Age=${days * 86400}; HttpOnly; Secure; SameSite=Lax`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

export async function readSession(request, env) {
  const m = (request.headers.get('Cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m || !env.LINK_SECRET) return null;
  const [p, s] = m[1].split('.');
  if (!p || !s || !safeEqual(await hmacHex(env.LINK_SECRET, 'app-session:' + p), s)) return null;
  try {
    const o = JSON.parse(b64urlDecode(p));
    return o.x > Date.now() / 1000 && o.e === ownerEmail(env) ? o : null;
  } catch { return null; }
}
