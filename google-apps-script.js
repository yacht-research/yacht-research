const NOTIFICATION_EMAIL = 'mathis.yachtbroker@outlook.com';
const SPREADSHEET_NAME   = 'Yacht Research — Form Submissions';
const FROM_NAME          = 'Yacht Research';

function doPost(e) {
  try {
    const data = e.parameter;
    const formName = data.form_name || 'Unknown Form';
    saveToSheet(formName, data);
    sendNotificationEmail(formName, data);
    if (data.email) sendConfirmationEmail(formName, data);
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

function saveToSheet(formName, data) {
  let ss;
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) { ss = SpreadsheetApp.open(files.next()); } else { ss = SpreadsheetApp.create(SPREADSHEET_NAME); }
  let sheet = ss.getSheetByName(formName);
  if (!sheet) { sheet = ss.insertSheet(formName); }
  const headers = getHeaders(formName);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1,1,1,headers.length).setBackground('#0a0f1e').setFontColor('#c9a84c').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  const row = headers.map(h => data[h.toLowerCase().replace(/ /g,'_')] || data[h] || '');
  row[0] = data.submitted_at || new Date().toLocaleString('fr-FR');
  sheet.appendRow(row);
  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) sheet.getRange(lastRow,1,1,headers.length).setBackground('#f8f8f8');
}

function getHeaders(formName) {
  const map = {
    'Contact Enquiry':         ['Date','name','phone','email','type','message'],
    'Partnership Inquiry':     ['Date','name','company','role','country','email','message'],
    'Recruitment Application': ['Date','name','position','email','experience'],
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
