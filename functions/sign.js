// /sign?d=…&s=… — public page where a client reads and e-signs the booking agreement (link emailed from the app).
import { cleanEnv } from './_lib/session.js';
import { readSignLink, agreementHtml, sha256Hex, AGREEMENT_VERSION } from './_lib/agreement.js';

const page = (title, body) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>${title} · Joenell Photography</title><link rel="icon" href="/assets/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500&family=Jost:wght@400;500;600&display=swap" rel="stylesheet">
<style>:root{--ink:#2B2926;--muted:#6b6a65;--brand:#3f4a3c;--bg:#f8f6f2;--line:#e8e4dc}*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 'Jost',system-ui,sans-serif}
.top{background:var(--brand);color:#fff;padding:18px 20px;font:500 20px 'Bodoni Moda',Georgia,serif}
main{max-width:760px;margin:0 auto;padding:20px 16px 60px}.doc{background:#fff;border-radius:14px;padding:22px 20px}
h1{font:500 28px/1.2 'Bodoni Moda',Georgia,serif;margin:0 0 12px}h2{font-size:17px;margin:24px 0 6px}
.t{width:100%;border-collapse:collapse;margin:14px 0}.t th,.t td{text-align:left;padding:8px 0;border-bottom:1px solid var(--line);vertical-align:top}.t th{color:var(--muted);font-weight:500;width:42%;padding-right:10px}
form{background:#fff;border-radius:14px;padding:20px;margin-top:16px}label{display:block;margin:10px 0 4px;color:var(--muted);font-size:14px}
input[type=text]{width:100%;font:18px 'Jost',sans-serif;padding:12px;border:1.5px solid var(--line);border-radius:10px}
.chk{display:flex;gap:10px;align-items:flex-start;margin:14px 0;color:var(--ink);font-size:16px}.chk input{width:22px;height:22px;margin-top:2px}
button,.b{display:inline-block;width:100%;text-align:center;border:0;border-radius:11px;padding:14px;font:600 17px 'Jost',sans-serif;background:var(--brand);color:#fff;text-decoration:none;cursor:pointer}
button:disabled{opacity:.5}.note{color:var(--muted);font-size:14px}.ok{font-size:44px;text-align:center}</style></head>
<body><div class="top">Joenell Photography</div><main>${body}</main></body></html>`,
  { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

const bad = () => page('Link not valid', `<div class="doc"><h1>This link isn't valid</h1><p>It may have expired. Please reply to the email from Joenell, or message wedding@joenellphotography.ca for a new link.</p></div>`);

export async function onRequestGet({ request, env: raw }) {
  const env = cleanEnv(raw), url = new URL(request.url);
  const f = await readSignLink(url, env.LINK_SECRET);
  if (!f) return bad();
  return page('Booking agreement', `<div class="doc">${agreementHtml(f)}</div>
<form method="post" action="${url.pathname}${url.search}" onsubmit="this.querySelector('button').disabled=true;this.querySelector('button').textContent='Signing…'">
<label for="n">Type your full name(s) to sign</label><input id="n" name="name" type="text" required autocomplete="name" placeholder="${String(f.name || '').replace(/[<>&"]/g, '')}">
<label class="chk"><input type="checkbox" name="agree" value="yes" required> I have read and agree to this Photography Services Agreement.</label>
<button type="submit">Sign agreement</button>
<p class="note">After you sign, your deposit invoice is emailed to you right away, and you'll both get a copy of this agreement.</p></form>`);
}

export async function onRequestPost({ request, env: raw }) {
  const env = cleanEnv(raw), url = new URL(request.url);
  const f = await readSignLink(url, env.LINK_SECRET);
  if (!f) return bad();
  const form = await request.formData(), name = String(form.get('name') || '').trim().slice(0, 120);
  if (!name || form.get('agree') !== 'yes') return page('Please try again', `<div class="doc"><h1>Almost there</h1><p>Please type your name and tick "I agree". <a href="${url.pathname}${url.search}">Go back</a></p></div>`);
  const html = agreementHtml(f), hash = await sha256Hex(html);
  const r = await fetch(env.SHEET_WEBHOOK_URL, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'sign', key: env.APP_KEY, ref: f.ref, signedName: name, agreementHtml: html, hash, version: AGREEMENT_VERSION,
      ip: request.headers.get('CF-Connecting-IP') || '', ua: (request.headers.get('User-Agent') || '').slice(0, 200), at: new Date().toISOString() }) });
  let o = {}; try { o = JSON.parse(await r.text()); } catch {}
  if (!o.ok) return page('Something went wrong', `<div class="doc"><h1>We couldn't save your signature</h1><p>${o.error ? 'Reason: ' + String(o.error).replace(/</g, '&lt;') + '. ' : ''}Please try again in a minute, or reply to Joenell's email.</p></div>`);
  return page('Signed', `<div class="doc"><div class="ok">✓</div><h1 style="text-align:center">Thank you, ${name.split(/\s+/)[0].replace(/</g, '&lt;')}!</h1>
<p>Your booking agreement is signed. A copy is on its way to your inbox${o.payUrl ? ', along with your deposit invoice' : ''}.</p>
${o.payUrl ? `<p><a class="b" href="${o.payUrl}">Pay the deposit now</a></p><p class="note">Prefer Interac e-Transfer? The instructions are in the invoice email.</p>` : ''}</div>`);
}
