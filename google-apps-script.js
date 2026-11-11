const NOTIFICATION_EMAIL = 'mathis.yachtbroker@outlook.com';
const SPREADSHEET_NAME   = 'Yacht Research — Form Submissions';
const FROM_NAME          = 'Yacht Research';

function doPost(e) {
  try {
    const data = e.parameter;
    const formName = data.form_name || 'Unknown Form';
    if (String(data.website || '').trim()) return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON); // robot (champ caché rempli)
    saveToSheet(formName, data);
    sendNotificationEmail(formName, data);
    if (formName === 'Shared Experience Booking') {
      if (data.client_email && String(data.status || '').indexOf('CONFIRMED') === 0) sendBookingConfirmation(data);
    } else if (data.email) sendConfirmationEmail(formName, data);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendConfirmationEmail(formName, data) {
  const firstName = (data.name || 'there').split(' ')[0];
  const messages = {
    'Contact Enquiry': {
      emoji: '⛵', subject: 'Your Enquiry — Yacht Research',
      intro: 'Thank you for reaching out to Yacht Research.',
      body: 'We have received your enquiry and a member of our team will review it carefully. You can expect to hear from us within <strong>24 hours</strong>.',
      closing: 'In the meantime, feel free to explore our current yacht selection at <a href="https://yachtresearchgroup.com" style="color:#c9a84c;">yachtresearchgroup.com</a>.'
    },
    'Partnership Inquiry': {
      emoji: '🤝', subject: 'Partnership Enquiry Received — Yacht Research',
      intro: 'Thank you for your interest in partnering with Yacht Research.',
      body: 'We have received your partnership enquiry and will review your details carefully. A member of our team will be in touch within <strong>48 hours</strong>.',
      closing: 'We look forward to exploring how we can grow together in the international yacht market.'
    },
    'Recruitment Application': {
      emoji: '💼', subject: 'Application Received — Yacht Research',
      intro: 'Thank you for your interest in joining Yacht Research.',
      body: 'We have received your application and our team will review your profile. If your background aligns with our current openings, we will reach out within <strong>5 business days</strong>.',
      closing: 'We are building an exceptional international team and appreciate you taking the time to apply.'
    }
  };
  const msg = messages[formName] || {
    emoji: '📬', subject: 'Message Received — Yacht Research',
    intro: 'Thank you for contacting Yacht Research.',
    body: 'We have received your message and will get back to you shortly.',
    closing: 'Visit us at <a href="https://yachtresearchgroup.com" style="color:#c9a84c;">yachtresearchgroup.com</a>.'
  };

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;">
    <div style="background:#0a0f1e;padding:40px 32px;text-align:center;">
      <p style="color:#c9a84c;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 12px;">Yacht Research</p>
      <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:300;font-family:Georgia,serif;">The Art of Effortless Yachting</h1>
      <div style="width:40px;height:1px;background:#c9a84c;margin:20px auto 0;"></div>
    </div>
    <div style="background:#ffffff;padding:40px 32px;">
      <p style="color:#0a0f1e;font-size:16px;margin:0 0 16px;">Dear ${firstName},</p>
      <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 16px;">${msg.intro}</p>
      <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 16px;">${msg.body}</p>
      <div style="width:40px;height:1px;background:#c9a84c;margin:28px 0;"></div>
      <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 32px;">${msg.closing}</p>
      <div style="text-align:center;">
        <a href="https://yachtresearchgroup.com" style="background:#c9a84c;color:#0a0f1e;padding:14px 36px;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;display:inline-block;">Visit Our Website</a>
      </div>
    </div>
    <div style="background:#f8f6f1;padding:28px 32px;border-top:1px solid #e0e0e0;">
      <p style="color:#0a0f1e;font-size:14px;margin:0 0 4px;">Warm regards,</p>
      <p style="color:#0a0f1e;font-size:15px;margin:0 0 2px;font-family:Georgia,serif;">The Yacht Research Team</p>
      <p style="color:#c9a84c;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;">Dubai · Paris · Mediterranean</p>
    </div>
    <div style="background:#0a0f1e;padding:16px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.3);font-size:10px;margin:0;">${new Date().getFullYear()} Yacht Research · <a href="https://yachtresearchgroup.com" style="color:#c9a84c;text-decoration:none;">yachtresearchgroup.com</a></p>
    </div>
  </div>`;

  MailApp.sendEmail({ to: data.email, subject: msg.emoji + ' ' + msg.subject, htmlBody: html, name: FROM_NAME, replyTo: NOTIFICATION_EMAIL });
}

// Confirmation de réservation envoyée au client, aux couleurs de Yacht Research (aucune mention de l'opérateur)
function sendBookingConfirmation(data) {
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const firstName = esc((data.name || 'there').split(' ')[0]);
  const paid = Number(data.paid_aed || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const row = (k, v) => `<tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #eee;">${k}</td><td style="padding:10px 0;color:#0a0f1e;font-size:14px;text-align:right;border-bottom:1px solid #eee;">${v}</td></tr>`;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;">
    <div style="background:#0a0f1e;padding:40px 32px;text-align:center;">
      <p style="color:#c9a84c;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 12px;">Yacht Research</p>
      <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:300;font-family:Georgia,serif;">Your booking is confirmed</h1>
      <div style="width:40px;height:1px;background:#c9a84c;margin:20px auto 0;"></div>
    </div>
    <div style="background:#ffffff;padding:40px 32px;">
      <p style="color:#0a0f1e;font-size:16px;margin:0 0 16px;">Dear ${firstName},</p>
      <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 24px;">Thank you for booking with Yacht Research. Your experience is confirmed. Here are the details:</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 28px;">
        ${row('Experience', esc(data.product))}
        ${row('Date', esc(data.date) + ' at ' + esc(data.time) + ' (Dubai time)')}
        ${row('Guests', esc(data.guests))}
        ${row('Total paid', 'AED ' + esc(paid))}
      </table>
      <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 16px;">Our team will send you the meeting point and final details before your experience. Please bring a valid ID for each guest.</p>
      <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 32px;">For any question or change, simply reply to this email.</p>
      <div style="text-align:center;">
        <a href="https://yachtresearchgroup.com/charter" style="background:#c9a84c;color:#0a0f1e;padding:14px 36px;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;display:inline-block;">Discover our charters</a>
      </div>
    </div>
    <div style="background:#f8f6f1;padding:28px 32px;border-top:1px solid #e0e0e0;">
      <p style="color:#0a0f1e;font-size:14px;margin:0 0 4px;">Warm regards,</p>
      <p style="color:#0a0f1e;font-size:15px;margin:0 0 2px;font-family:Georgia,serif;">The Yacht Research Team</p>
    </div>
  </div>`;
  MailApp.sendEmail({ to: data.client_email, subject: '⛵ Booking confirmed — ' + (data.product || 'Yacht Research'), htmlBody: html, name: FROM_NAME, replyTo: NOTIFICATION_EMAIL });
}

function saveToSheet(formName, data) {
  let ss;
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) { ss = SpreadsheetApp.open(files.next()); } else { ss = SpreadsheetApp.create(SPREADSHEET_NAME); }
  let sheet = ss.getSheetByName(formName);
  if (!sheet) { sheet = ss.insertSheet(formName); }
  // En-têtes : ceux déjà dans la feuille (on garde tes colonnes à toi, ex. « phone clean », « Whatsapp »),
  // sinon la liste prévue. Une info reçue sans colonne ajoute la sienne à la fin.
  const norm = h => String(h).trim().toLowerCase().replace(/ /g, '_');
  const isNew = sheet.getLastRow() === 0;
  const headers = isNew ? getHeaders(formName).slice()
    : sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(String);
  if (isNew) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground('#0a0f1e').setFontColor('#c9a84c').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  const known = headers.map(norm);
  Object.keys(data).forEach(k => {
    if (['form_name', 'submitted_at', 'website'].indexOf(k) > -1 || !String(data[k] || '').trim()) return;
    if (known.indexOf(norm(k)) < 0) {
      headers.push(k); known.push(norm(k));
      sheet.getRange(1, headers.length).setValue(k).setBackground('#0a0f1e').setFontColor('#c9a84c').setFontWeight('bold');
    }
  });
  // Première ligne vide de la colonne A (et non après les lignes vides pré-formatées de la feuille)
  const colA = sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 1), 1).getValues();
  let lastRow = colA.length;
  while (lastRow > 1 && String(colA[lastRow - 1][0]).trim() === '') lastRow--;
  const target = lastRow + 1;
  if (target > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 1);
  // On n'écrit que la date et les colonnes reçues : tes colonnes calculées (formules) ne sont jamais touchées
  sheet.getRange(target, 1).setValue(data.submitted_at || new Date().toLocaleString('fr-FR'));
  headers.forEach((h, i) => {
    if (i === 0) return;
    const v = data[norm(h)] !== undefined ? data[norm(h)] : data[h];
    if (v !== undefined && v !== '') sheet.getRange(target, i + 1).setValue(v);
  });
}

function getHeaders(formName) {
  const map = {
    'Contact Enquiry':         ['Date','name','phone','email','type','message'],
    'Partnership Inquiry':     ['Date','name','company','role','country','email','message'],
    'Recruitment Application': ['Date','name','position','email','experience'],
    'Yacht Enquiry':           ['Date','name','email','phone','country','type','budget','yacht_type','market','message'],
    'Newsletter':              ['Date','firstname','lastname','email'],
    'Bank Transfer Request':   ['Date','name','email','phone','type','message'],
    'Shared Experience Booking': ['Date','status','product','date','time','guests','name','phone','client_email','paid_aed','b2b_aed','margin_aed','stripe_session'],
  };
  return map[formName] || ['Date','message'];
}

function sendNotificationEmail(formName, data) {
  const emoji = {'Contact Enquiry':'⛵','Partnership Inquiry':'🤝','Recruitment Application':'💼'}[formName] || '📬';
  let rows = '';
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'form_name' || key === 'submitted_at') return;
    rows += `<tr><td style="padding:10px 16px;font-weight:600;color:#c9a84c;background:#0a0f1e;font-family:Arial,sans-serif;font-size:13px;border-bottom:1px solid #1a2540;">${key.charAt(0).toUpperCase()+key.slice(1).replace(/_/g,' ')}</td><td style="padding:10px 16px;color:#333;background:#fff;font-family:Arial,sans-serif;font-size:13px;border-bottom:1px solid #eee;">${value||'—'}</td></tr>`;
  });
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;"><div style="background:#0a0f1e;padding:30px 24px;text-align:center;"><p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">Yacht Research</p><h1 style="color:#fff;font-size:22px;margin:0;font-weight:300;">${emoji} ${formName}</h1><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:10px 0 0;">${data.submitted_at||new Date().toLocaleString('fr-FR')}</p></div><table style="width:100%;border-collapse:collapse;">${rows}</table><div style="background:#f5f5f5;padding:16px 24px;text-align:center;"><p style="color:#999;font-size:11px;margin:0;">Soumis via yachtresearchgroup.com</p></div></div>`;
  MailApp.sendEmail({ to: NOTIFICATION_EMAIL, subject: `${emoji} Yacht Research — Nouveau ${formName}`, htmlBody: html });
}

function testScript() {
  const fakePost = { parameter: { form_name:'Contact Enquiry', submitted_at: new Date().toLocaleString('fr-FR'), name:'Jean-Paul Dupont', phone:'+33 6 12 34 56 78', email:'mathis.yachtbroker@outlook.com', type:'Buy a Yacht', message:'Interested in a 40m+ motor yacht based in Dubai.' }};
  doPost(fakePost);
  Logger.log('Test executed. Check your email!');
}
