// Joenell Photography — bookings, invoices and payment emails (Google Apps Script bound to the "Joenell Bookings" sheet).
//
// How it works
//  • Bookings tab: one row per booking. Tick "Send deposit invoice" (works from the Sheets phone app too) → the client gets
//    an invoice email with a "Pay by card" button (Stripe, via the website) and Interac e-Transfer instructions.
//  • Card payments: Cloudflare's /api/stripe-webhook forwards each paid Stripe Checkout to doPost() (SHEET_WEBHOOK_URL).
//  • Interac e-Transfers: checkInterac() (hourly) reads the auto-deposit emails and matches the message to a booking ref.
//  • Every payment: logged in Payments, receipt to the client, notice to the owner, booking row updated; the day-plan
//    questionnaire goes out after the first payment for a booking.
//  • dailyCheck(): sends the balance invoice 7 days before it's due, and one reminder on the due date if still unpaid.
// Booking terms: 20% non-refundable deposit; balance due 14 days before weddings/elopements, 7 days before
// engagement sessions and surprise proposals. Run setup() once (menu Joenell › Install / update) after changing code.

const OWNER = 'joenellphotography@gmail.com';           // also the Interac e-Transfer (auto-deposit) address
const REPLY_TO = 'wedding@joenellphotography.ca';
const BRAND = 'Joenell Photography';
const SITE = 'https://www.joenellphotography.ca';
const DEFAULT_PAY_API = 'https://stripe-test.joenell-website.pages.dev'; // switch to SITE when card payments go live
const DEPOSIT_RATE = 0.2;

const PAY_HEAD = ['Paid at', 'Booking ref', 'Kind', 'Amount', 'Currency', 'Client name', 'Client email',
  'Stripe session', 'Payment intent', 'Mode', 'Receipt sent', 'Questionnaire sent', 'Method'];
const BK_HEAD = ['Booking ref', 'Client name', 'Client email', 'Service', 'Event date', 'Package', 'Total (CAD)',
  'Deposit (CAD)', 'Balance (CAD)', 'Balance due', 'Status', 'Send deposit invoice', 'Deposit invoice sent',
  'Deposit paid', 'Balance invoice sent', 'Balance reminder sent', 'Balance paid', 'Notes'];
const SERVICES = ['Wedding', 'Elopement', 'Engagement session', 'Surprise proposal'];
const PACKAGES = ['The Vow — $1,000', 'The Story — $1,450', 'The Complete Story — $1,950', 'Intimate Elopement — $850',
  'Adventure Elopement — $1,250', 'Surprise proposal — $250', 'Engagement session — $225', 'Custom'];

// ---------- setup ----------
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Joenell')
    .addItem('Send deposit invoice (selected row)', 'menuSendDeposit')
    .addItem('Send balance invoice now (selected row)', 'menuSendBalance')
    .addSeparator().addItem('Check Interac e-Transfers now', 'checkInterac')
    .addItem('Install / update automations', 'setup').addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActive();
  ss.rename('Joenell Bookings');
  ss.setSpreadsheetTimeZone('America/Vancouver');
  const pay = sheet_('Payments', PAY_HEAD, 1);
  const bk = sheet_('Bookings', BK_HEAD, 0);
  const n = Math.max(bk.getMaxRows() - 1, 200);
  const col = c => bk.getRange(2, BK_HEAD.indexOf(c) + 1, n, 1);
  col('Service').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(SERVICES, true).build());
  col('Package').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(PACKAGES, true).setAllowInvalid(true).build());
  col('Event date').setNumberFormat('ddd, mmm d, yyyy');
  col('Balance due').setNumberFormat('ddd, mmm d, yyyy');
  ['Total (CAD)', 'Deposit (CAD)', 'Balance (CAD)'].forEach(c => col(c).setNumberFormat('$#,##0.00'));
  col('Send deposit invoice').insertCheckboxes();
  bk.getRange(1, 1, 1, BK_HEAD.length).setBackground('#3f4a3c').setFontColor('#ffffff');
  bk.getRange(1, BK_HEAD.indexOf('Send deposit invoice') + 1).setNote('Tick to email the client the deposit invoice (card + Interac). Fill name, email, service, date and total first.');
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0) ss.deleteSheet(blank);

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PAY_API')) props.setProperty('PAY_API', DEFAULT_PAY_API);
  if (!props.getProperty('FORM_URL')) makeForm_(ss, props);

  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('handleEdit').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('dailyCheck').timeBased().everyDays(1).atHour(9).inTimezone('America/Vancouver').create();
  ScriptApp.newTrigger('checkInterac').timeBased().everyHours(1).create();
  return 'ok';
}

function sheet_(name, head, pos) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name, pos);
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  sh.setFrozenRows(1);
  return sh;
}

function makeForm_(ss, props) {
  const f = FormApp.create('Joenell Photography — Plan of the day');
  f.setDescription('Thank you for booking! This helps me plan your day so nothing important is missed. ' +
    'It takes about 10 minutes — you can come back and edit your answers anytime before the day.');
  f.setCollectEmail(true).setAllowResponseEdits(true).setLimitOneResponsePerUser(false);
  f.addTextItem().setTitle('Your names').setRequired(true);
  f.addTextItem().setTitle('Booking reference (from your invoice)');
  f.addDateItem().setTitle('Date of your session / wedding').setRequired(true);
  f.addTextItem().setTitle('Best phone number on the day').setRequired(true);
  f.addParagraphTextItem().setTitle('Locations & addresses (getting ready, ceremony, portraits, reception)').setRequired(true);
  f.addParagraphTextItem().setTitle('Timeline — rough times for each part of the day');
  f.addParagraphTextItem().setTitle('Family & group photos you want (list the groups and names)');
  f.addParagraphTextItem().setTitle('Must-have moments or shots');
  f.addParagraphTextItem().setTitle('Important people I should know (VIPs, who to ask for help)');
  f.addParagraphTextItem().setTitle('Other vendors — planner, DJ, florist, venue coordinator (names + phone/Instagram)');
  f.addParagraphTextItem().setTitle('Anything to avoid or be careful with (family sensitivities, photos not to take)');
  f.addMultipleChoiceItem().setTitle('May I share some of your photos on my website and social media?')
    .setChoiceValues(['Yes, any', 'Yes, but only ones you check with us first', 'No, please keep them private']).setRequired(true);
  f.addParagraphTextItem().setTitle('Anything else you would like me to know?');
  f.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  props.setProperty('FORM_URL', f.getPublishedUrl());
  props.setProperty('FORM_EDIT_URL', f.getEditUrl());
}

// ---------- bookings helpers ----------
function bk_() { return SpreadsheetApp.getActive().getSheetByName('Bookings'); }
function C_(name) { return BK_HEAD.indexOf(name) + 1; }
function rowObj_(sh, r) {
  const v = sh.getRange(r, 1, 1, BK_HEAD.length).getValues()[0], o = { row: r };
  BK_HEAD.forEach((h, i) => o[h] = v[i]);
  return o;
}
function setCell_(sh, r, name, val) { sh.getRange(r, C_(name)).setValue(val); }
function money_(n) { return '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function dateStr_(d) { return d instanceof Date ? Utilities.formatDate(d, 'America/Vancouver', 'EEEE, MMMM d, yyyy') : String(d || ''); }
function isWedding_(svc) { return /wedding|elopement/i.test(String(svc)); }
function findRowByRef_(ref) {
  const sh = bk_(); if (!sh || !ref) return 0;
  const refs = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
  for (let i = 0; i < refs.length; i++) if (String(refs[i][0]).trim() === String(ref).trim()) return i + 2;
  return 0;
}

// Fill ref, deposit, balance and due date from the row's service / date / total.
function fillRow_(sh, r) {
  const o = rowObj_(sh, r);
  if (!o['Booking ref'] && o['Client name']) {
    const last = String(o['Client name']).trim().split(/\s+|&/).filter(Boolean).pop() || 'client';
    const d = o['Event date'] instanceof Date ? Utilities.formatDate(o['Event date'], 'America/Vancouver', 'yyyyMMdd') : Utilities.formatDate(new Date(), 'America/Vancouver', 'yyyyMMdd');
    setCell_(sh, r, 'Booking ref', ('JP-' + d + '-' + last.replace(/[^A-Za-z]/g, '').slice(0, 10)).toUpperCase());
  }
  let total = Number(o['Total (CAD)']);
  if (!total && o['Package']) { const m = String(o['Package']).match(/\$([\d,]+)/); if (m) { total = Number(m[1].replace(/,/g, '')); setCell_(sh, r, 'Total (CAD)', total); } }
  if (total) {
    const dep = Math.round(total * DEPOSIT_RATE * 100) / 100;
    setCell_(sh, r, 'Deposit (CAD)', dep);
    setCell_(sh, r, 'Balance (CAD)', Math.round((total - dep) * 100) / 100);
  }
  if (o['Event date'] instanceof Date && o['Service']) {
    const due = new Date(o['Event date']); due.setDate(due.getDate() - (isWedding_(o['Service']) ? 14 : 7));
    setCell_(sh, r, 'Balance due', due);
  }
  if (!o['Status']) setCell_(sh, r, 'Status', 'Draft');
}

// Installable onEdit trigger (needs Gmail + network access, so it isn't the simple onEdit).
function handleEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== 'Bookings' || e.range.getRow() < 2) return;
  const r = e.range.getRow(), c = e.range.getColumn();
  if (c === C_('Send deposit invoice')) {
    if (e.range.getValue() === true) {
      try { sendInvoice_(r, 'deposit'); }
      catch (err) { setCell_(sh, r, 'Status', 'Error: ' + err.message); sh.getRange(r, c).setValue(false); }
    }
    return;
  }
  if ([C_('Client name'), C_('Service'), C_('Event date'), C_('Package'), C_('Total (CAD)')].includes(c)) fillRow_(sh, r);
}

function menuSendDeposit() { sendFromSelection_('deposit'); }
function menuSendBalance() { sendFromSelection_('balance'); }
function sendFromSelection_(kind) {
  const sh = SpreadsheetApp.getActive().getActiveSheet(), r = sh.getActiveRange().getRow();
  if (sh.getName() !== 'Bookings' || r < 2) { SpreadsheetApp.getUi().alert('Select a booking row in the Bookings tab first.'); return; }
  sendInvoice_(r, kind);
  SpreadsheetApp.getActive().toast(`${kind === 'deposit' ? 'Deposit' : 'Balance'} invoice sent.`, BRAND);
}

// ---------- invoices ----------
function payLink_(o, kind, amount, days) {
  const api = PropertiesService.getScriptProperties().getProperty('PAY_API') || DEFAULT_PAY_API;
  const desc = `${kind === 'deposit' ? 'Deposit (20%)' : 'Balance'} — ${o['Package'] || o['Service']} — ${dateStr_(o['Event date'])}`;
  const res = UrlFetchApp.fetch(api + '/api/make-pay-link', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getIdentityToken() },
    payload: JSON.stringify({ ref: o['Booking ref'], kind, amt: Math.round(amount * 100), desc, email: o['Client email'], days }),
  });
  if (res.getResponseCode() !== 200) throw new Error('pay link ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 80));
  return JSON.parse(res.getContentText()).url;
}

function sendInvoice_(r, kind, reminder) {
  const sh = bk_();
  fillRow_(sh, r);
  const o = rowObj_(sh, r);
  ['Client name', 'Client email', 'Service', 'Event date', 'Total (CAD)'].forEach(k => { if (!o[k]) throw new Error('missing ' + k); });
  const amount = Number(kind === 'deposit' ? o['Deposit (CAD)'] : o['Balance (CAD)']);
  const due = kind === 'deposit' ? null : o['Balance due'];
  const days = kind === 'deposit' ? 7 : Math.max(3, Math.ceil(((due instanceof Date ? due : new Date()) - new Date()) / 864e5) + 3);
  const url = payLink_(o, kind, amount, days);
  const first = String(o['Client name']).split(/\s+/)[0];
  const subject = reminder ? `Friendly reminder: balance due today — ${BRAND}` :
    (kind === 'deposit' ? `Your booking invoice — ${o['Service']} on ${dateStr_(o['Event date'])}` : `Balance invoice — ${o['Service']} on ${dateStr_(o['Event date'])}`);
  const intro = reminder ? `Just a friendly reminder that the balance for your ${String(o['Service']).toLowerCase()} is due today.` :
    kind === 'deposit' ? `Thank you so much for choosing me! Here's your invoice. A 20% non-refundable deposit reserves your date — once it's paid, your date is officially yours.` :
      `Your day is getting close — I can't wait! Here's the invoice for the remaining balance, due by ${dateStr_(due)}.`;
  const rows = [['Booking reference', o['Booking ref']], ['Service', o['Service']], ['Date', dateStr_(o['Event date'])],
    ['Package', o['Package'] || '—'], ['Total', money_(o['Total (CAD)'])]];
  if (kind === 'balance') rows.push(['Deposit paid', money_(o['Deposit (CAD)'])]);
  rows.push([kind === 'deposit' ? 'Deposit due now (20%)' : 'Balance due', `<b>${money_(amount)} CAD</b>`]);
  const html = `<div style="background:#f8f6f2;padding:28px 12px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#2b2a27">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden">
<div style="background:#3f4a3c;color:#fff;padding:22px 28px;font-size:20px;letter-spacing:.5px">${BRAND}</div>
<div style="padding:26px 28px;font-size:16px;line-height:1.6">
<p>Hi ${first},</p><p>${intro}</p>
<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:15px">${rows.map(([k, v]) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#6b6a65">${k}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${v}</td></tr>`).join('')}</table>
<p style="margin:24px 0 8px;font-weight:600">Two easy ways to pay</p>
<p style="margin:0 0 6px"><b>1. Credit or debit card</b> (secure checkout by Stripe)</p>
<p style="margin:12px 0 22px"><a href="${url}" style="background:#3f4a3c;color:#fff;text-decoration:none;padding:13px 26px;border-radius:6px;display:inline-block">Pay ${money_(amount)} by card</a></p>
<p style="margin:0 0 6px"><b>2. Interac e-Transfer</b> (no fees)</p>
<p style="margin:0 0 18px">Send ${money_(amount)} to <b>${OWNER}</b> and put <b>${o['Booking ref']}</b> in the message. Auto-deposit is on, so there's no security question.</p>
<p style="font-size:14px;color:#6b6a65">The card link works for ${days} days. Booking terms: 20% non-refundable deposit to reserve your date; balance due ${isWedding_(o['Service']) ? '2 weeks' : '1 week'} before the day.</p>
<p>Any questions at all, just reply to this email.</p><p>Joenell</p></div>
<div style="padding:14px 28px;background:#f1eee8;font-size:13px;color:#6b6a65">${BRAND} · <a href="${SITE}" style="color:#3f4a3c">joenellphotography.ca</a> · ${REPLY_TO}</div></div></div>`;
  const text = `Hi ${first},\n\n${intro}\n\n` + rows.map(([k, v]) => `${k}: ${String(v).replace(/<[^>]+>/g, '')}`).join('\n') +
    `\n\nPay by card: ${url}\nOr Interac e-Transfer ${money_(amount)} to ${OWNER} with message ${o['Booking ref']} (auto-deposit, no question).\n\nJoenell\n${BRAND}`;
  GmailApp.sendEmail(o['Client email'], subject, text, { htmlBody: html, name: BRAND, replyTo: REPLY_TO });
  const now = new Date();
  if (kind === 'deposit') { setCell_(sh, r, 'Deposit invoice sent', now); setCell_(sh, r, 'Status', 'Deposit invoice sent'); }
  else if (reminder) setCell_(sh, r, 'Balance reminder sent', now);
  else { setCell_(sh, r, 'Balance invoice sent', now); setCell_(sh, r, 'Status', 'Balance invoice sent'); }
}

function dailyCheck() {
  const sh = bk_(); if (!sh || sh.getLastRow() < 2) return;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let r = 2; r <= sh.getLastRow(); r++) {
    const o = rowObj_(sh, r);
    if (!o['Booking ref'] || !o['Deposit paid'] || o['Balance paid'] || !(o['Balance due'] instanceof Date) || !(Number(o['Balance (CAD)']) > 0)) continue;
    const due = new Date(o['Balance due']); due.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((due - today) / 864e5);
    try {
      if (!o['Balance invoice sent'] && daysLeft <= 7) sendInvoice_(r, 'balance');
      else if (o['Balance invoice sent'] && !o['Balance reminder sent'] && daysLeft <= 0) sendInvoice_(r, 'balance', true);
    } catch (err) {
      GmailApp.sendEmail(OWNER, `Bookings: couldn't send balance invoice for ${o['Booking ref']}`, String(err), { name: BRAND + ' bookings' });
    }
  }
}

// ---------- payments ----------
function doPost(e) {
  let r;
  try { r = JSON.parse(e.postData.contents); } catch (err) { return out_('bad json'); }
  if (!r || r.source !== 'stripe' || !/^cs_(test|live)_/.test(r.session || '')) return out_('ignored');
  return out_(recordPayment_({ id: r.session, method: 'card', ref: r.ref, kind: r.kind, amount: Number(r.amount || 0),
    currency: r.currency || 'CAD', name: r.name, email: r.email, paid_at: r.paid_at, pi: r.payment_intent, live: !!r.livemode }));
}

// Interac auto-deposit emails → match "Message: <ref>" to a booking. Runs hourly.
function checkInterac() {
  const props = PropertiesService.getScriptProperties();
  const seen = JSON.parse(props.getProperty('INTERAC_SEEN') || '[]');
  const threads = GmailApp.search('from:(payments.interac.ca) newer_than:3d', 0, 30);
  threads.forEach(t => t.getMessages().forEach(m => {
    const id = m.getId(); if (seen.includes(id)) return;
    const body = m.getPlainBody(), subj = m.getSubject();
    const amt = (subj.match(/\$([\d,]+\.\d{2})/) || body.match(/\$([\d,]+\.\d{2})/) || [])[1];
    const ref = (body.match(/\bJP-[A-Z0-9-]+/i) || [])[0];
    const who = (subj.match(/:\s*(.+?)\s+sent you/i) || [])[1] || '';
    seen.push(id);
    if (!amt || !ref) return;
    const row = findRowByRef_(ref.toUpperCase());
    const o = row ? rowObj_(bk_(), row) : {};
    const amount = Number(amt.replace(/,/g, ''));
    const kind = o['Deposit paid'] ? 'balance' : 'deposit';
    recordPayment_({ id: 'interac:' + id, method: 'interac', ref: ref.toUpperCase(), kind, amount, currency: 'CAD',
      name: o['Client name'] || who, email: o['Client email'] || '', paid_at: m.getDate().toISOString(), live: true });
  }));
  props.setProperty('INTERAC_SEEN', JSON.stringify(seen.slice(-300)));
}

function recordPayment_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName('Payments');
    const data = sh.getDataRange().getValues();
    if (data.some(row => row[7] === p.id)) return 'duplicate'; // Stripe can resend the same event
    const firstForRef = !!p.ref && !data.some(row => row[1] === p.ref && row[11]);
    const test = p.live ? '' : '[TEST] ';
    const amount = Number(p.amount || 0).toFixed(2), cur = p.currency || 'CAD';
    const kindLabel = p.kind === 'deposit' ? 'deposit' : (p.kind === 'balance' ? 'balance payment' : 'payment');
    const first = (p.name || '').split(' ')[0] || 'there';
    let receipt = '', quest = '';
    if (p.email) {
      GmailApp.sendEmail(p.email, `${test}Payment received — ${BRAND}`,
        `Hi ${first},\n\nThank you — I've received your ${kindLabel} of $${amount} ${cur}` + (p.ref ? ` for booking ${p.ref}` : '') +
        (p.kind === 'deposit' ? `. Your date is officially reserved!` : '.') +
        (p.method === 'card' ? `\n\nStripe will also email you an official receipt.` : '') +
        `\n\nIf anything looks wrong, just reply to this email.\n\nJoenell\n${BRAND}\nwww.joenellphotography.ca`,
        { name: BRAND, replyTo: REPLY_TO });
      receipt = new Date();
      const formUrl = PropertiesService.getScriptProperties().getProperty('FORM_URL');
      if (firstForRef && formUrl) {
        GmailApp.sendEmail(p.email, `${test}Let's plan your day — ${BRAND}`,
          `Hi ${first},\n\nNow that your date is booked, here's a short questionnaire so I can plan everything ` +
          `around you — locations, timeline, family photos and the moments that matter most:\n\n${formUrl}\n\n` +
          `It takes about 10 minutes and you can edit your answers anytime before the day.\n\nCan't wait!\nJoenell\n${BRAND}`,
          { name: BRAND, replyTo: REPLY_TO });
        quest = new Date();
      }
    }
    sh.appendRow([p.paid_at ? new Date(p.paid_at) : new Date(), p.ref || '', p.kind || '', Number(amount), cur, p.name || '',
      p.email || '', p.id, p.pi || '', p.live ? 'live' : 'test', receipt, quest, p.method]);
    let rowNote = 'no matching booking row';
    const br = findRowByRef_(p.ref);
    if (br) {
      const b = bk_();
      if (p.kind === 'deposit') { setCell_(b, br, 'Deposit paid', new Date()); setCell_(b, br, 'Status', 'Deposit paid — date reserved'); }
      else { setCell_(b, br, 'Balance paid', new Date()); setCell_(b, br, 'Status', 'Paid in full'); }
      rowNote = 'booking row updated';
    }
    GmailApp.sendEmail(OWNER, `${test}New payment: ${p.name || 'Client'} paid $${amount} ${cur} (${kindLabel}${p.ref ? ', ' + p.ref : ''})`,
      `New ${p.method === 'card' ? 'card' : 'Interac'} payment\n\nClient: ${p.name || '-'} <${p.email || '-'}>\nBooking ref: ${p.ref || '-'}\n` +
      `Kind: ${kindLabel}\nAmount: $${amount} ${cur}\nReceipt sent: ${receipt ? 'yes' : 'no'}\nQuestionnaire sent: ${quest ? 'yes' : 'no'}\n` +
      `Bookings sheet: ${rowNote}\n\n${ss.getUrl()}`, { name: BRAND + ' bookings' });
    return 'ok';
  } finally { lock.releaseLock(); }
}

function out_(s) { return ContentService.createTextOutput(s); }
