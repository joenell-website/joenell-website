// POST /api/app/<action> — owner session required; forwards to the Apps Script web app (bookings sheet) with APP_KEY.
import { cleanEnv, json, readSession } from '../../_lib/session.js';

const ACTIONS = new Set(['dashboard', 'bookings', 'booking', 'saveBooking', 'sendInvoice', 'recordPayment', 'payments', 'clients']);

export async function onRequestPost({ request, env: raw, params }) {
  const env = cleanEnv(raw);
  if (!await readSession(request, env)) return json({ error: 'signed out' }, 401);
  if (request.headers.get('X-Requested-With') !== 'app') return json({ error: 'bad request' }, 400); // CSRF guard
  const action = params.action;
  if (!ACTIONS.has(action)) return json({ error: 'unknown action' }, 404);
  if (!env.APP_KEY || !env.SHEET_WEBHOOK_URL) return json({ error: 'not configured' }, 503);
  let data = {}; try { data = await request.json(); } catch {}
  const r = await fetch(env.SHEET_WEBHOOK_URL, {
    method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'app', key: env.APP_KEY, action, data }),
  });
  const text = await r.text();
  try { const o = JSON.parse(text); return json(o, o.error ? 400 : 200); }
  catch { return json({ error: 'Sheet did not answer (' + r.status + ')' }, 502); }
}
