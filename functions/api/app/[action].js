// POST /api/app/<action> — owner session required; forwards to the Apps Script web app (bookings sheet) with APP_KEY.
import { cleanEnv, json, readSession } from '../../_lib/session.js';
import { makeSignLink } from '../../_lib/agreement.js';

const ACTIONS = new Set(['dashboard', 'bookings', 'booking', 'saveBooking', 'sendInvoice', 'recordPayment', 'payments', 'clients', 'enquiries', 'setEnquiry', 'convertEnquiry', 'syncCalendar', 'sendContract']);

export async function onRequestPost({ request, env: raw, params }) {
  const env = cleanEnv(raw);
  if (!await readSession(request, env)) return json({ error: 'signed out' }, 401);
  if (request.headers.get('X-Requested-With') !== 'app') return json({ error: 'bad request' }, 400); // CSRF guard
  const action = params.action;
  if (!ACTIONS.has(action)) return json({ error: 'unknown action' }, 404);
  if (!env.APP_KEY || !env.SHEET_WEBHOOK_URL) return json({ error: 'not configured' }, 503);
  let data = {}; try { data = await request.json(); } catch {}
  const sheet = async (a, d) => (await fetch(env.SHEET_WEBHOOK_URL, {
    method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'app', key: env.APP_KEY, action: a, data: d }),
  })).text();
  if (action === 'sendContract') { // build the client's signed agreement link here (LINK_SECRET lives in Cloudflare)
    let bk; try { bk = JSON.parse(await sheet('booking', { ref: data.ref })).booking; } catch {}
    if (!bk) return json({ error: 'booking not found' }, 400);
    if (!bk.email || !bk.service || !bk.date || !bk.total) return json({ error: 'Add email, service, date and total first (Edit).' }, 400);
    data.url = await makeSignLink('https://www.joenellphotography.ca', env.LINK_SECRET, { ref: bk.ref, name: bk.name, service: bk.service, pkg: bk.pkg,
      date: bk.date, time: bk.time, location: bk.location, total: bk.total, deposit: bk.deposit, balance: bk.balance, balanceDue: bk.balanceDue });
  }
  const text = await sheet(action, data); const r = { status: 200 };
  try { const o = JSON.parse(text); return json(o, o.error ? 400 : 200); }
  catch { return json({ error: 'Sheet did not answer (' + r.status + ')' }, 502); }
}
