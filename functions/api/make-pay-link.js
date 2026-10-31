// POST /api/make-pay-link — used by the "Joenell Bookings" Google Sheet (Apps Script) to create a signed card-payment link.
// Auth: Authorization: Bearer <Google OpenID token from ScriptApp.getIdentityToken()> for the owner's Google account.
// We verify the token's RS256 signature against Google's public keys, the issuer, expiry and that the email is the owner's,
// so no extra shared secret has to be pasted anywhere. Body JSON: {ref, kind:"deposit"|"balance", amt (CAD cents), desc, email, days}.
// Env: LINK_SECRET (required), OWNER_EMAIL (optional, default joenellphotography@gmail.com).
import { hmacHex } from '../_lib/crypto.js';

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const b64urlToBytes = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
const b64urlEncode = str => btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function verifyGoogleIdToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('malformed');
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  if (header.alg !== 'RS256') throw new Error('alg');
  const certs = await (await fetch('https://www.googleapis.com/oauth2/v3/certs', { cf: { cacheTtl: 3600 } })).json();
  const jwk = (certs.keys || []).find(k => k.kid === header.kid);
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('signature');
  const now = Math.floor(Date.now() / 1000);
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) throw new Error('iss');
  if (!payload.exp || payload.exp < now - 60) throw new Error('expired');
  return payload;
}

export async function onRequestPost({ request, env: rawEnv }) {
  const env = Object.fromEntries(Object.entries(rawEnv || {}).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
  if (!env.LINK_SECRET) return json({ error: 'not configured' }, 503);
  const owner = (env.OWNER_EMAIL || 'joenellphotography@gmail.com').toLowerCase();
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  let who;
  try { who = await verifyGoogleIdToken(token); } catch (e) { return json({ error: 'unauthorized' }, 401); }
  if (!who.email_verified || String(who.email).toLowerCase() !== owner) return json({ error: 'forbidden' }, 403);

  let b; try { b = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const amt = Math.round(Number(b.amt));
  if (!b.ref || !['deposit', 'balance'].includes(b.kind) || !Number.isInteger(amt) || amt < 100 || amt > 1000000) return json({ error: 'bad input' }, 400);
  const days = Math.min(Math.max(parseInt(b.days || 14, 10) || 14, 1), 60);
  const d = b64urlEncode(JSON.stringify({ ref: String(b.ref).slice(0, 60), kind: b.kind, amt, desc: String(b.desc || '').slice(0, 250),
    email: String(b.email || '').slice(0, 200), exp: Math.floor(Date.now() / 1000) + days * 86400 }));
  const s = await hmacHex(env.LINK_SECRET, d);
  return json({ url: `${new URL(request.url).origin}/api/pay?d=${d}&s=${s}` });
}
