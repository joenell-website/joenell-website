// POST /api/app/auth {credential} → Google ID token check → owner-only session cookie.  DELETE → sign out.
import { cleanEnv, json, ownerEmail, verifyGoogleToken, sessionCookie, clearCookie } from '../../_lib/session.js';

export async function onRequestPost({ request, env: raw }) {
  const env = cleanEnv(raw);
  if (!env.LINK_SECRET || !env.GOOGLE_CLIENT_ID) return json({ error: 'not configured' }, 503);
  let b; try { b = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  let who;
  try { who = await verifyGoogleToken(b.credential, env.GOOGLE_CLIENT_ID); } catch { return json({ error: 'sign-in failed' }, 401); }
  if (!who.email_verified || String(who.email).toLowerCase() !== ownerEmail(env)) return json({ error: 'This account is not allowed.' }, 403);
  return json({ ok: true }, 200, { 'Set-Cookie': await sessionCookie(env, ownerEmail(env)) });
}

export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
}
