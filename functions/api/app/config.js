// GET /api/app/config — public: the Google sign-in client ID for the /app login page (not a secret).
import { cleanEnv, json } from '../../_lib/session.js';
export async function onRequestGet({ env }) {
  return json({ clientId: cleanEnv(env).GOOGLE_CLIENT_ID || '' });
}
