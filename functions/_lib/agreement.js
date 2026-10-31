// Booking agreement text (approved by Joenell, Oct 31 2026) + signed-link helpers for /sign.
import { hmacHex, safeEqual, b64urlDecode } from './crypto.js';

export const AGREEMENT_VERSION = '2026-10-31';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fdate = d => { if (!d) return '—'; const x = new Date(d + 'T12:00:00'); return isNaN(x) ? esc(d) : x.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Vancouver' }); };
const b64u = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function makeSignLink(origin, secret, f, days = 30) {
  const d = b64u(JSON.stringify({ ...f, v: AGREEMENT_VERSION, exp: Math.floor(Date.now() / 1000) + days * 86400 }));
  return `${origin}/sign?d=${d}&s=${await hmacHex(secret, 'sign:' + d)}`;
}
export async function readSignLink(url, secret) {
  const d = url.searchParams.get('d') || '', s = url.searchParams.get('s') || '';
  if (!d || !s || !secret || !safeEqual(await hmacHex(secret, 'sign:' + d), s)) return null;
  try { const f = JSON.parse(b64urlDecode(d)); return f.exp > Date.now() / 1000 ? f : null; } catch { return null; }
}

// Agreement body as HTML, filled with the booking's details.
export function agreementHtml(f) {
  const wedding = /wedding|elope/i.test(f.service || '');
  const rows = [['Booking reference', f.ref], ['Service', `${f.service || ''}${f.pkg ? ' — ' + f.pkg : ''}`],
    ['Date', fdate(f.date) + (f.time ? ', starting ' + esc(f.time) : '')], ['Location', f.location || 'To be confirmed'],
    ['Total fee', money(f.total) + ' CAD'], ['Deposit (20%, due now)', money(f.deposit) + ' CAD'],
    ['Balance', `${money(f.balance)} CAD, due by ${fdate(f.balanceDue)}`]];
  return `<h1>Photography Services Agreement</h1>
<p>This agreement is between <b>Joenell Photography</b> ("the Photographer") and <b>${esc(f.name)}</b> ("the Client") for the photography booking below.</p>
<table class="t">${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${k === 'Date' ? v : esc(v)}</td></tr>`).join('')}</table>
<h2>1. Coverage</h2>
<p>1.1 The Photographer will provide the coverage included in the package above. Image counts are minimums.</p>
<p>1.2 Coverage time starts at the agreed start time. Delays caused by the schedule of the day may reduce coverage time; this does not reduce the fee.</p>
<p>1.3 Extra coverage may be added on the day if the Photographer is available, at <b>$75 CAD per additional hour</b>, billed after the event and due within 7 days.</p>
<h2>2. Payments</h2>
<p>2.1 A <b>20% non-refundable deposit</b> reserves the date. The date is not held until the deposit is paid. The deposit counts toward the total fee.</p>
<p>2.2 The <b>balance is due ${wedding ? '2 weeks' : '1 week'} before</b> the date. The Photographer will email the balance invoice about a week before it is due.</p>
<p>2.3 Payment can be made by credit/debit card (secure checkout by Stripe) or Interac e-Transfer, using the booking reference in the message.</p>
<p>2.4 If the balance is not paid by the due date and remains unpaid <b>3 days</b> after a reminder, the Photographer may treat the booking as cancelled by the Client (section 3).</p>
<h2>3. Cancellation and rescheduling</h2>
<p>3.1 <b>By the Client:</b> the deposit is non-refundable. If the Client cancels after paying the balance, the balance is refunded if cancelled more than 30 days before the date; it is non-refundable within 30 days.</p>
<p>3.2 <b>Rescheduling:</b> the Client may move the booking once, at no charge, to a new date within 12 months, subject to the Photographer's availability. Payments already made transfer to the new date. Later changes are treated as a cancellation and new booking.</p>
<p>3.3 <b>By the Photographer:</b> if the Photographer cannot attend because of illness, injury, emergency or events beyond their control, the Photographer will try to arrange a qualified replacement photographer, with the Client's approval. If no replacement is agreed, the Photographer will refund all payments made, including the deposit. The Photographer's responsibility is limited to this refund.</p>
<h2>4. Delivery</h2>
<p>4.1 A sneak peek is delivered within 24 hours (proposals), 48 hours (engagement sessions) or 72 hours (weddings and elopements).</p>
<p>4.2 The full gallery is delivered within 1 week (proposals), 2 weeks (engagement sessions), 3 weeks (Intimate Elopement), 4 weeks (Adventure Elopement and The Vow), 6 weeks (The Story) or 8 weeks (The Complete Story). June–September weddings may take up to 2 extra weeks. Rush delivery in half the time is available for +$150.</p>
<p>4.3 Images are delivered as high-resolution files in a private online gallery, available to download for 12 months. The Client should download and keep their own copies.</p>
<h2>5. Editing and style</h2>
<p>5.1 The Photographer selects and edits images in their own artistic style. Every delivered photo is hand-edited; near-identical duplicates and unflattering frames are left out.</p>
<p>5.2 Unedited or RAW files are not provided. Heavy retouching (for example, body reshaping or removing objects) is not included unless agreed in writing.</p>
<h2>6. Copyright and use of photos</h2>
<p>6.1 The Photographer owns the copyright in all images.</p>
<p>6.2 The Client receives a licence to use the delivered images for <b>personal use</b>: printing, sharing with family and friends, and posting on personal social media (credit to @joenellphotography is appreciated). Selling the images or using them for advertising requires the Photographer's written permission.</p>
<p>6.3 The Photographer may use images on their website and social media only as the Client chooses in the "Plan of the day" questionnaire (any images, only images the Client approves, or none). The Client can change this choice at any time by email.</p>
<h2>7. The Client's part</h2>
<p>7.1 The Client will share the timeline, locations and key people in advance (the "Plan of the day" questionnaire), and arrange any venue or park permissions and permit fees.</p>
<p>7.2 The Photographer is not responsible for missed photos caused by venue rules, weather, guests or other photographers blocking the view, late changes to the schedule, or moments the Photographer was not told about.</p>
<p>7.3 The Photographer may stop working if conditions are unsafe or if they are treated with harassment or abuse; in that case no refund is owed for the remaining coverage.</p>
<h2>8. Travel</h2>
<p>Travel within Metro Vancouver is included. Travel beyond Metro Vancouver (for example Whistler, Squamish, the Okanagan or Vancouver Island) is quoted with the date and added to the total fee, including any ferries, accommodation or parking.</p>
<h2>9. Limitation of liability</h2>
<p>The Photographer uses professional equipment and backup practices. In the rare case that images are lost, damaged or not taken because of equipment failure, accident or events beyond the Photographer's control, the Photographer's total responsibility is limited to a refund of the payments made for this booking.</p>
<h2>10. Privacy</h2>
<p>The Client's personal information is used only to deliver this booking (invoices, planning and delivery) and is never sold or shared for marketing.</p>
<h2>11. General</h2>
<p>11.1 This agreement is governed by the laws of British Columbia, Canada.</p>
<p>11.2 This is the whole agreement; changes must be agreed in writing (email is fine).</p>
<p>11.3 Signing electronically has the same effect as signing on paper.</p>`;
}

export async function sha256Hex(s) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
}
