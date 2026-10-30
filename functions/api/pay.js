// GET /api/pay?d=<base64url JSON>&s=<HMAC-SHA256 hex of d with LINK_SECRET>
// d = {ref, kind:"deposit"|"balance", amt (CAD cents), desc, email, exp (unix seconds)}
// Verifies the signed link, then creates a Stripe Checkout Session and redirects the couple to it.
// Env (Cloudflare Pages > Settings > Variables, encrypted): STRIPE_SECRET_KEY, LINK_SECRET
import { hmacHex, safeEqual, b64urlDecode } from '../_lib/crypto.js';

const page = (title, msg, status = 400) => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>` +
  `<body style="font:17px/1.6 -apple-system,system-ui,sans-serif;max-width:560px;margin:12vh auto;padding:0 24px;color:#2b2a27;background:#f8f6f2">` +
  `<h1 style="font-weight:500">${title}</h1><p>${msg}</p><p><a href="https://www.joenellphotography.ca/contact" style="color:#3f4a3c">Contact Joenell</a> · <a href="https://wa.me/12362341041" style="color:#3f4a3c">WhatsApp</a></p></body>`,
  { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function onRequestGet({ request, env }) {
  if (!env.STRIPE_SECRET_KEY || !env.LINK_SECRET) return page('Payments are not set up yet', 'Card payments aren’t switched on yet. Please contact Joenell to pay by Interac e-Transfer.', 503);
  const url = new URL(request.url);
  const d = url.searchParams.get('d') || '', s = url.searchParams.get('s') || '';
  if (!d || !safeEqual(await hmacHex(env.LINK_SECRET, d), s)) return page('This payment link isn’t valid', 'Please use the exact link from your invoice email, or ask Joenell for a new one.');
  let p; try { p = JSON.parse(b64urlDecode(d)); } catch { return page('This payment link isn’t valid', 'Please ask Joenell for a new link.'); }
  if (!p.exp || Date.now() / 1000 > p.exp) return page('This payment link has expired', 'Please ask Joenell for a new link.', 410);
  const amt = Math.round(Number(p.amt));
  if (!Number.isInteger(amt) || amt < 100 || amt > 1000000) return page('This payment link isn’t valid', 'Please ask Joenell for a new link.');
  const origin = url.origin;
  const f = new URLSearchParams({
    mode: 'payment',
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'cad',
    'line_items[0][price_data][unit_amount]': String(amt),
    'line_items[0][price_data][product_data][name]': String(p.desc || 'Joenell Photography').slice(0, 250),
    client_reference_id: String(p.ref || '').slice(0, 200),
    'metadata[ref]': String(p.ref || ''), 'metadata[kind]': String(p.kind || ''),
    'payment_intent_data[metadata][ref]': String(p.ref || ''), 'payment_intent_data[metadata][kind]': String(p.kind || ''),
    'payment_intent_data[description]': String(p.desc || '').slice(0, 250),
    success_url: `${origin}/payment-success?ref=${encodeURIComponent(p.ref || '')}`,
    cancel_url: `${origin}/payment-cancelled`,
    // No payment_method_types: Stripe shows the best methods automatically (dynamic payment methods + Link).
    expires_at: String(Math.floor(Date.now() / 1000) + 60 * 60 * 2),
  });
  if (p.email) f.set('customer_email', String(p.email));
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Stripe-Version': '2024-06-20' },
    body: f,
  });
  const j = await r.json();
  if (!r.ok || !j.url) return page('Something went wrong', 'We couldn’t open the payment page. Please try again in a minute, or contact Joenell.', 502);
  return Response.redirect(j.url, 303);
}
