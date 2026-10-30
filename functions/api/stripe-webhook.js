// POST /api/stripe-webhook — Stripe calls this when a payment completes.
// Verifies the Stripe-Signature header, then (if SHEET_WEBHOOK_URL is set) forwards a minimal record
// to the bookings sheet (Google Apps Script). Env: STRIPE_WEBHOOK_SECRET, optional SHEET_WEBHOOK_URL.
import { hmacHex, safeEqual } from '../_lib/crypto.js';

export async function onRequestPost({ request, env }) {
  const body = await request.text();
  const sig = request.headers.get('Stripe-Signature') || '';
  if (!env.STRIPE_WEBHOOK_SECRET) return new Response('not configured', { status: 503 });
  const parts = Object.fromEntries(sig.split(',').map(x => x.split('=')).filter(x => x.length === 2).map(([k, v]) => [k, v]));
  const v1s = sig.split(',').filter(x => x.startsWith('v1=')).map(x => x.slice(3));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return new Response('bad timestamp', { status: 400 });
  const expected = await hmacHex(env.STRIPE_WEBHOOK_SECRET, `${t}.${body}`);
  if (!v1s.some(v => safeEqual(v, expected))) return new Response('bad signature', { status: 400 });
  const evt = JSON.parse(body);
  if (evt.type === 'checkout.session.completed' && evt.data?.object?.payment_status === 'paid') {
    const o = evt.data.object;
    const rec = { source: 'stripe', livemode: !!evt.livemode, ref: o.metadata?.ref || o.client_reference_id || '', kind: o.metadata?.kind || '',
      amount: (o.amount_total || 0) / 100, currency: (o.currency || '').toUpperCase(), email: o.customer_details?.email || o.customer_email || '',
      name: o.customer_details?.name || '', session: o.id, payment_intent: o.payment_intent || '', paid_at: new Date((evt.created || t) * 1000).toISOString() };
    if (env.SHEET_WEBHOOK_URL) {
      await fetch(env.SHEET_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) }).catch(() => {});
    }
  }
  return new Response('ok');
}
