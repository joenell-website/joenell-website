// Joenell Photography — bookings sheet + automatic emails (Google Apps Script, bound to the "Joenell Bookings" sheet).
// Cloudflare's /api/stripe-webhook forwards each paid Stripe Checkout here (SHEET_WEBHOOK_URL = this web app's /exec URL).
// On each new payment: log a row in "Payments", email the client a receipt, notify the owner, and (first payment for a
// booking ref only) send the day-plan questionnaire. Run setup() once from the editor to create the tabs + questionnaire.

const OWNER = 'joenellphotography@gmail.com';
const REPLY_TO = 'wedding@joenellphotography.ca';
const BRAND = 'Joenell Photography';
const HEAD = ['Paid at', 'Booking ref', 'Kind', 'Amount', 'Currency', 'Client name', 'Client email',
  'Stripe session', 'Payment intent', 'Mode', 'Receipt sent', 'Questionnaire sent'];

function setup() {
  const ss = SpreadsheetApp.getActive();
  ss.rename('Joenell Bookings');
  let sh = ss.getSheetByName('Payments');
  if (!sh) sh = ss.insertSheet('Payments', 0);
  sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight('bold');
  sh.setFrozenRows(1);
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('FORM_URL')) {
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
  return props.getProperty('FORM_URL');
}

function doPost(e) {
  let r;
  try { r = JSON.parse(e.postData.contents); } catch (err) { return out('bad json'); }
  if (!r || r.source !== 'stripe' || !/^cs_(test|live)_/.test(r.session || '')) return out('ignored');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName('Payments') || (setup(), SpreadsheetApp.getActive().getSheetByName('Payments'));
    const data = sh.getDataRange().getValues();
    if (data.some(row => row[7] === r.session)) return out('duplicate'); // Stripe can resend the same event
    const firstForRef = !!r.ref && !data.some(row => row[1] === r.ref && row[11]);
    const test = r.livemode ? '' : '[TEST] ';
    const amount = Number(r.amount || 0).toFixed(2), cur = r.currency || 'CAD';
    const kindLabel = r.kind === 'deposit' ? 'deposit' : (r.kind === 'balance' ? 'balance payment' : 'payment');
    const first = (r.name || '').split(' ')[0] || 'there';
    let receipt = '', quest = '';
    if (r.email) {
      GmailApp.sendEmail(r.email, `${test}Payment received — ${BRAND}`,
        `Hi ${first},\n\nThank you — I've received your ${kindLabel} of $${amount} ${cur}` +
        (r.ref ? ` for booking ${r.ref}` : '') + `.\n\nStripe will also email you an official receipt. ` +
        `If anything looks wrong, just reply to this email.\n\nJoenell\n${BRAND}\nwww.joenellphotography.ca`,
        { name: BRAND, replyTo: REPLY_TO });
      receipt = new Date();
      const formUrl = PropertiesService.getScriptProperties().getProperty('FORM_URL');
      if (firstForRef && formUrl) {
        GmailApp.sendEmail(r.email, `${test}Let's plan your day — ${BRAND}`,
          `Hi ${first},\n\nNow that your date is booked, here's a short questionnaire so I can plan everything ` +
          `around you — locations, timeline, family photos and the moments that matter most:\n\n${formUrl}\n\n` +
          `It takes about 10 minutes and you can edit your answers anytime before the day.\n\n` +
          `Can't wait!\nJoenell\n${BRAND}`, { name: BRAND, replyTo: REPLY_TO });
        quest = new Date();
      }
    }
    sh.appendRow([r.paid_at ? new Date(r.paid_at) : new Date(), r.ref || '', r.kind || '', Number(amount), cur,
      r.name || '', r.email || '', r.session, r.payment_intent || '', r.livemode ? 'live' : 'test', receipt, quest]);
    GmailApp.sendEmail(OWNER, `${test}New payment: ${r.name || 'Client'} paid $${amount} ${cur} (${kindLabel}${r.ref ? ', ' + r.ref : ''})`,
      `New card payment\n\nClient: ${r.name || '-'} <${r.email || '-'}>\nBooking ref: ${r.ref || '-'}\nKind: ${kindLabel}\n` +
      `Amount: $${amount} ${cur}\nReceipt sent: ${receipt ? 'yes' : 'no'}\nQuestionnaire sent: ${quest ? 'yes' : 'no'}\n\n` +
      `Sheet: ${SpreadsheetApp.getActive().getUrl()}`, { name: BRAND + ' bookings' });
    return out('ok');
  } finally { lock.releaseLock(); }
}

function out(s) { return ContentService.createTextOutput(s); }
