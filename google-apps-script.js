// ============================================================
// YACHT RESEARCH : formulaires du site → Google Sheets + e-mails (Brevo, depuis contact@) + listes Brevo
// Base : ton script du 9 mars 2026, avec en plus :
//   - la clé Brevo lue dans Paramètres du projet → Propriétés du script → BREVO_API_KEY (plus dans le code)
//   - écriture sur la 1re ligne vide en gardant les colonnes de chaque feuille (tes colonnes « phone clean »,
//     « Whatsapp »… ne sont jamais touchées), et une colonne ajoutée si une nouvelle info arrive
//   - formulaires « Shared Experience Booking » (réservations payées) et « Bank Transfer Request » (virement)
//   - robots ignorés (champ caché « website » rempli)
//   - deleteTestRows() : à lancer à la main pour supprimer les lignes de test
// ============================================================
const ADMIN_EMAIL    = 'contact@yachtresearchgroup.com';

const FROM_EMAIL     = 'contact@yachtresearchgroup.com';
const FROM_NAME      = 'Yacht Research';
const SHEET_NAME     = 'Yacht Research — Form Submissions';
// Clé Brevo : Paramètres du projet (roue dentée) → Propriétés du script → BREVO_API_KEY = ta clé
const BREVO_API_KEY  = PropertiesService.getScriptProperties().getProperty('BREVO_API_KEY') || '';

// IDs listes Brevo : Brevo > Contacts > Lists > clique liste > regarde URL
const BREVO_LIST_IDS = {
  'Newsletter':        8,
  'Contact Enquiry':   3,
  'Yacht Enquiry':     5,
  'Partnership Inquiry': 4,
};

// ─── FOOTER SOCIAL ───────────────────────────────────────────
function getSocialFooter() {
  return '<div style="background:#0a0f1e;padding:24px 32px;text-align:center;">'
    + '<div style="text-align:center;margin-bottom:16px;">'
    + '<a href="https://yachtresearchgroup.com" style="text-decoration:none;display:inline-block;margin:3px;"><span style="background:#1a2540;padding:8px 10px;font-family:Arial,sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;display:inline-block;">&#127760; Website</span></a>'
    + '<a href="https://www.instagram.com/yacht_research/" style="text-decoration:none;display:inline-block;margin:3px;"><span style="background:#1a2540;padding:8px 10px;font-family:Arial,sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;display:inline-block;">&#128247; Instagram</span></a>'
    + '<a href="https://wa.me/qr/5NK5SR22CXGNC1" style="text-decoration:none;display:inline-block;margin:3px;"><span style="background:#1a2540;padding:8px 10px;font-family:Arial,sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;display:inline-block;">&#128172; WhatsApp UAE</span></a>'
    + '<a href="https://wa.me/message/CVQVHBO3GXLZP1" style="text-decoration:none;display:inline-block;margin:3px;"><span style="background:#1a2540;padding:8px 10px;font-family:Arial,sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;display:inline-block;">&#128172; WhatsApp FR</span></a>'
    + '<a href="https://linktr.ee/yacht_research" style="text-decoration:none;display:inline-block;margin:3px;"><span style="background:#1a2540;padding:8px 10px;font-family:Arial,sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;display:inline-block;">&#128279; Linktree</span></a>'
    + '</div>'
    + '<div style="width:40px;height:1px;background:rgba(201,168,76,0.3);margin:0 auto 12px;"></div>'
    + '<p style="color:rgba(255,255,255,0.3);font-size:10px;margin:0 0 6px;font-family:Arial,sans-serif;">&#169; ' + new Date().getFullYear() + ' Yacht Research &middot; <a href="https://yachtresearchgroup.com" style="color:#c9a84c;text-decoration:none;">yachtresearchgroup.com</a></p>'
    + '<p style="color:rgba(255,255,255,0.15);font-size:9px;margin:0;font-family:Arial,sans-serif;">You received this email because you contacted Yacht Research.</p>'
    + '</div>';
}

// Résultats des appels Brevo de la requête en cours (renvoyés dans la réponse si debug=1, pour les tests)
var BREVO_TRACE = [];

// ─── ENVOI BREVO ────────────────────────────────────────────
// replyTo : contact@ par défaut ; pour tes notifications, c'est l'e-mail du client (tu cliques « Répondre » et tu lui écris)
function sendBrevoEmail(toEmail, toName, subject, htmlContent, replyTo) {
  if (!BREVO_API_KEY) { Logger.log('BREVO_API_KEY manquante (Propriétés du script)'); return; }
  var r = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    contentType: 'application/json',
    headers: { 'api-key': BREVO_API_KEY },
    payload: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: toEmail, name: toName || toEmail }],
      replyTo: { email: replyTo || ADMIN_EMAIL },
      subject: subject,
      htmlContent: htmlContent
    }),
    muteHttpExceptions: true
  });
  BREVO_TRACE.push('email ' + toEmail + ' → ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 200));
  if (r.getResponseCode() >= 300) Logger.log('Brevo email ' + r.getResponseCode() + ': ' + r.getContentText());
}

// ─── AJOUT CONTACT BREVO ────────────────────────────────────
function addToBrevo(formName, data) {
  try {
    var listId = BREVO_LIST_IDS[formName];
    if (!listId) { Logger.log('No Brevo list for: ' + formName); return; }
    // Handle Newsletter (sends firstname/lastname) vs other forms (sends name)
    var firstName, lastName;
    if (data.firstname) {
      firstName = data.firstname;
      lastName  = data.lastname || '';
    } else {
      var nameParts = (data.name || '').split(' ');
      firstName = nameParts[0] || '';
      lastName  = nameParts.slice(1).join(' ') || '';
    }
    var response = UrlFetchApp.fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      contentType: 'application/json',
      headers: { 'api-key': BREVO_API_KEY },
      payload: JSON.stringify({
        email: data.email,
        attributes: {
          PRENOM: firstName,
          NOM:    lastName,
          COUNTRY:   data.country || '',
          PROJECT_TYPE: data.type || formName
        },
        listIds: [listId],
        updateEnabled: true
      }),
      muteHttpExceptions: true
    });
    BREVO_TRACE.push('contact list ' + listId + ' → ' + response.getResponseCode() + ' ' + response.getContentText().slice(0, 200));
    Logger.log('Brevo status: ' + response.getResponseCode());
    Logger.log('Brevo response: ' + response.getContentText());
  } catch(e) {
    Logger.log('Brevo error: ' + e);
  }
}

// ─── POINT D'ENTREE ──────────────────────────────────────────
function doPost(e) {
  try {
    // Parse data: try JSON body first, then URL-encoded form params
    var data = {};
    if (e.postData && e.postData.contents) {
      var ct = e.postData.type || '';
      if (ct.indexOf('application/json') >= 0) {
        try { data = JSON.parse(e.postData.contents); } catch(ex) { data = e.parameter || {}; }
      } else {
        // URL-encoded: use e.parameter but also try manual parse as backup
        data = e.parameter || {};
        if (!data.form_name) {
          try {
            var pairs = e.postData.contents.split('&');
            for (var i = 0; i < pairs.length; i++) {
              var kv = pairs[i].split('=');
              if (kv.length === 2) data[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1].replace(/\+/g,' '));
            }
          } catch(ex2) {}
        }
      }
    } else if (e.parameter) {
      data = e.parameter;
    }
    // Robot : le champ caché « website » est rempli → on ne garde rien
    if (String(data.website || '').trim()) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }
    Logger.log('form_name received: ' + data.form_name);
    Logger.log('email received: ' + data.email);
    var formName = data.form_name || 'Contact Enquiry';
    // For Newsletter, build name from firstname+lastname
    if (formName === 'Newsletter' && data.firstname) {
      data.name = (data.firstname + ' ' + (data.lastname || '')).trim();
    }
    saveToSheet(formName, data);
    sendAdminEmail(formName, data);
    if (formName === 'Shared Experience Booking') {
      // Réservation payée sur le site : confirmation au client seulement si Xclusive l'a confirmée
      if (data.client_email && String(data.status || '').indexOf('CONFIRMED') === 0) sendBookingConfirmation(data);
    } else {
      if (data.email) sendConfirmationEmail(formName, data);
      if (data.email) addToBrevo(formName, data);
    }
    var out = { status: 'success' };
    if (data.debug === '1') { out.form = formName; out.key = !!BREVO_API_KEY; out.brevo = BREVO_TRACE; }
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString(), brevo: BREVO_TRACE })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── EMAIL CONFIRMATION VISITEUR ────────────────────────────
function sendConfirmationEmail(formName, data) {
  var firstName = (data.name || 'there').split(' ')[0];

  var messages = {
    'Contact Enquiry': {
      emoji: '⛵', subject: '📬 Your Enquiry | Yacht Research',
      intro: 'Thank you for reaching out to Yacht Research. We have received your enquiry and a member of our team will personally review it.',
      body: 'You can expect to hear from us within <strong style="font-family:Arial,sans-serif;font-size:14px;">24 hours</strong>.<br><br>At Yacht Research, we work selectively with serious buyers, sellers, and charterers, providing discreet, expert guidance across Dubai, the French Riviera, and the Mediterranean.<br><br>In the meantime, feel free to explore our current listings and services at <a href="https://yachtresearchgroup.com" style="color:#c9a84c;font-family:Arial,sans-serif;font-size:14px;text-decoration:none;">yachtresearchgroup.com</a>, or reach out to us directly via WhatsApp for a faster response.',
      closing: 'We look forward to assisting you in finding the perfect yacht.'
    },
    'Yacht Enquiry': {
      emoji: '⛵', subject: '⛵ Your Yacht Enquiry | Yacht Research',
      intro: 'Thank you for submitting your enquiry to Yacht Research. We have received all the details of your project.',
      body: 'A dedicated member of our team will carefully review your requirements and reach out to you personally within <strong>24 hours</strong>.<br><br>Yacht Research operates at the intersection of discretion and expertise. Whether you are looking to buy, sell, or charter, we leverage our international network across <strong>Dubai, the French Riviera, and the Mediterranean</strong> to find the right match for your project.<br><br>For an immediate response, you are welcome to contact us directly via WhatsApp. Our team is available across time zones.',
      closing: 'We look forward to making your yachting experience effortless.'
    },
    'Partnership Inquiry': {
      emoji: '🤝', subject: '🤝 Partnership Enquiry Received | Yacht Research',
      intro: 'Thank you for your interest in collaborating with Yacht Research. We have received your partnership enquiry.',
      body: 'Our team will review your profile and the details of your proposal carefully. You can expect to hear from us within <strong>48 hours</strong>.<br><br>At Yacht Research, we build long-term B2B relationships with brokers, concierge services, real estate professionals, and other industry players who share our commitment to quality and discretion.<br><br>We believe the best partnerships are built on <strong>trust, transparency, and aligned values,</strong> and we look forward to exploring how we can grow together across our international markets.',
      closing: 'We appreciate your interest and will be in touch shortly.'
    },
    'Recruitment Application': {
      emoji: '💼', subject: '💼 Application Received — Yacht Research',
      intro: 'Thank you for your interest in joining the Yacht Research team. We have received your application.',
      body: 'Our team will carefully review your profile and experience. If your background aligns with our current openings, we will reach out within <strong>5 business days</strong>.<br><br>Yacht Research is building an exceptional international team of motivated, client-focused professionals who thrive in a fast-paced, high-end environment. We operate across Dubai, the French Riviera, and the broader Mediterranean market.',
      closing: 'Thank you again for your interest in Yacht Research.'
    },
    'Newsletter': {
      emoji: '📩', subject: '📩 Welcome to the Yacht Research Newsletter',
      intro: 'Thank you for subscribing to the Yacht Research newsletter.',
      body: 'You will now receive our exclusive listings, off-market opportunities, and market insights directly in your inbox.<br><br>At Yacht Research, we operate at the highest level of the international yacht market, with an active presence in <strong>Dubai, the French Riviera, and the Mediterranean</strong>. Our newsletter is reserved for a carefully curated audience of serious buyers, sellers, and yachting enthusiasts.',
      closing: 'We look forward to keeping you informed.'
    },
    'Bank Transfer Request': {
      emoji: '🏦', subject: '🏦 Your Bank Transfer Request | Yacht Research',
      intro: 'Thank you for choosing to pay your experience by bank transfer. We have received your request.',
      body: 'A member of our team will send you our bank details shortly. Your seats are confirmed once the transfer is received.<br><br>For any question, you can reply to this email or contact us directly via WhatsApp.',
      closing: 'We look forward to welcoming you on board.'
    }
  };

  var msg = messages[formName] || {
    emoji: '📬', subject: '📬 Message Received — Yacht Research',
    intro: 'Thank you for contacting Yacht Research.',
    body: 'We have received your message and will get back to you shortly.',
    closing: 'Visit us at <a href="https://yachtresearchgroup.com" style="color:#c9a84c;">yachtresearchgroup.com</a>.'
  };

  var html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;">'
    + '<div style="background:#0a0f1e;padding:40px 32px;text-align:center;">'
    + '<p style="color:#c9a84c;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 12px;">Yacht Research</p>'
    + '<h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:300;font-family:Georgia,serif;">The Art of Effortless Yachting</h1>'
    + '<div style="width:40px;height:1px;background:#c9a84c;margin:20px auto 0;"></div>'
    + '</div>'
    + '<div style="background:#ffffff;padding:40px 32px;">'
    + '<p style="color:#0a0f1e;font-size:16px;margin:0 0 16px;">Dear ' + firstName + ',</p>'
    + '<p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 16px;">' + msg.intro + '</p>'
    + '<p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 16px;">' + msg.body + '</p>'
    + '<div style="width:40px;height:1px;background:#c9a84c;margin:28px 0;"></div>'
    + '<p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 32px;">' + msg.closing + '</p>'
    + '<div style="text-align:center;"><a href="https://yachtresearchgroup.com" style="background:#c9a84c;color:#0a0f1e;padding:14px 36px;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;display:inline-block;">Visit Our Website</a></div>'
    + '</div>'
    + '<div style="background:#f8f6f1;padding:28px 32px;border-top:1px solid #e0e0e0;">'
    + '<p style="color:#0a0f1e;font-size:14px;margin:0 0 4px;">Warm regards,</p>'
    + '<p style="color:#0a0f1e;font-size:15px;margin:0 0 2px;font-family:Georgia,serif;">The Yacht Research Team</p>'
    + '<p style="color:#c9a84c;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;">Dubai · French Riviera · Mediterranean</p>'
    + '</div>'
    + getSocialFooter()
    + '</div>';

  sendBrevoEmail(data.email, data.name || '', msg.subject, html);
}

// ─── CONFIRMATION DE RÉSERVATION (sorties partagées payées sur le site) ────
// Aux couleurs de Yacht Research, sans mention de l'opérateur
function sendBookingConfirmation(data) {
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var firstName = esc((data.name || 'there').split(' ')[0]);
  var paid = Number(data.paid_aed || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  var row = function (k, v) { return '<tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #eee;">' + k + '</td><td style="padding:10px 0;color:#0a0f1e;font-size:14px;text-align:right;border-bottom:1px solid #eee;">' + v + '</td></tr>'; };
  var html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;">'
    + '<div style="background:#0a0f1e;padding:40px 32px;text-align:center;">'
    + '<p style="color:#c9a84c;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 12px;">Yacht Research</p>'
    + '<h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:300;font-family:Georgia,serif;">Your booking is confirmed</h1>'
    + '<div style="width:40px;height:1px;background:#c9a84c;margin:20px auto 0;"></div>'
    + '</div>'
    + '<div style="background:#ffffff;padding:40px 32px;">'
    + '<p style="color:#0a0f1e;font-size:16px;margin:0 0 16px;">Dear ' + firstName + ',</p>'
    + '<p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 24px;">Thank you for booking with Yacht Research. Your experience is confirmed. Here are the details:</p>'
    + '<table style="width:100%;border-collapse:collapse;margin:0 0 28px;">'
    + row('Experience', esc(data.product))
    + row('Date', esc(data.date) + ' at ' + esc(data.time) + ' (Dubai time)')
    + row('Guests', esc(data.guests))
    + row('Total paid', 'AED ' + esc(paid))
    + '</table>'
    + '<p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 16px;">Our team will send you the meeting point and final details before your experience. Please bring a valid ID for each guest.</p>'
    + '<p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 32px;">For any question or change, simply reply to this email.</p>'
    + '<div style="text-align:center;"><a href="https://yachtresearchgroup.com/charter" style="background:#c9a84c;color:#0a0f1e;padding:14px 36px;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;display:inline-block;">Discover our charters</a></div>'
    + '</div>'
    + '<div style="background:#f8f6f1;padding:28px 32px;border-top:1px solid #e0e0e0;">'
    + '<p style="color:#0a0f1e;font-size:14px;margin:0 0 4px;">Warm regards,</p>'
    + '<p style="color:#0a0f1e;font-size:15px;margin:0 0 2px;font-family:Georgia,serif;">The Yacht Research Team</p>'
    + '</div>'
    + getSocialFooter()
    + '</div>';
  sendBrevoEmail(data.client_email, data.name || '', '⛵ Booking confirmed | ' + (data.product || 'Yacht Research'), html);
}

// ─── GOOGLE SHEETS ───────────────────────────────────────────
function saveToSheet(formName, data) {
  var files = DriveApp.getFilesByName(SHEET_NAME);
  var ss = files.hasNext() ? SpreadsheetApp.open(files.next()) : SpreadsheetApp.create(SHEET_NAME);
  var sheet = ss.getSheetByName(formName) || ss.insertSheet(formName);

  var headersMap = {
    'Contact Enquiry':         ['Date','name','phone','email','type','message'],
    'Newsletter':              ['Date','firstname','lastname','email'],
    'Yacht Enquiry':           ['Date','name','phone','email','type','budget','yacht_type','market','country','message'],
    'Partnership Inquiry':     ['Date','name','company','role','country','email','phone','message'],
    'Recruitment Application': ['Date','name','position','email','experience'],
    'Bank Transfer Request':   ['Date','name','phone','email','type','message'],
    'Shared Experience Booking': ['Date','status','product','date','time','guests','name','phone','client_email','paid_aed','card_fee_aed','b2b_aed','margin_aed','stripe_session'],
  };
  var norm = function (h) { return String(h).trim().toLowerCase().replace(/ /g, '_'); };

  var colA = sheet.getRange('A:A').getValues();
  var realLastRow = 0;
  for (var i = colA.length - 1; i >= 0; i--) {
    if (colA[i][0] !== '') { realLastRow = i + 1; break; }
  }

  // Colonnes : celles déjà dans la feuille (on garde tes colonnes à toi), sinon la liste prévue
  var headers;
  if (realLastRow === 0) {
    headers = (headersMap[formName] || ['Date','name','email','message']).slice();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#0a0f1e').setFontColor('#c9a84c').setFontWeight('bold');
    sheet.setFrozenRows(1);
    realLastRow = 1;
  } else {
    headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(String);
  }
  // Une info reçue qui n'a pas encore de colonne en ajoute une à la fin
  var known = headers.map(norm);
  Object.keys(data).forEach(function (k) {
    if (['form_name', 'submitted_at', 'website'].indexOf(k) > -1 || !String(data[k] || '').trim()) return;
    if (k === 'name' && formName === 'Newsletter') return; // déjà dans firstname / lastname
    if (known.indexOf(norm(k)) < 0) {
      headers.push(k); known.push(norm(k));
      sheet.getRange(1, headers.length).setValue(k).setBackground('#0a0f1e').setFontColor('#c9a84c').setFontWeight('bold');
    }
  });

  var target = realLastRow + 1;
  if (target > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 1);
  // On n'écrit que la date et les infos reçues : les autres colonnes (tes formules) ne sont jamais touchées
  sheet.getRange(target, 1).setValue(new Date().toLocaleString('fr-FR'));
  for (var c = 1; c < headers.length; c++) {
    var h = headers[c];
    var v = data[norm(h)] !== undefined ? data[norm(h)] : data[h];
    if (v === undefined || v === '') continue;
    var cell = sheet.getRange(target, c + 1);
    if (norm(h) === 'phone') cell.setNumberFormat('@STRING@');
    cell.setValue(v);
  }
  if (target % 2 === 0) {
    sheet.getRange(target, 1, 1, (headersMap[formName] || headers).length).setBackground('#f8f8f8');
  }
}

// ─── EMAIL ADMIN ─────────────────────────────────────────────
function sendAdminEmail(formName, data) {
  var emojis = {'Contact Enquiry':'📬','Yacht Enquiry':'⛵','Partnership Inquiry':'🤝','Recruitment Application':'💼','Newsletter':'📩','Bank Transfer Request':'🏦','Shared Experience Booking':'🎟️'};
  var tag = emojis[formName] || '📬';
  var rows = '';
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key === 'form_name' || key === 'submitted_at' || key === 'website') continue;
    rows += '<tr><td style="padding:10px 16px;font-weight:600;color:#c9a84c;background:#0a0f1e;font-size:13px;border-bottom:1px solid #1a2540;">' + key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g,' ') + '</td><td style="padding:10px 16px;color:#333;background:#fff;font-size:13px;border-bottom:1px solid #eee;">' + (data[key] || '—') + '</td></tr>';
  }
  var html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;">'
    + '<div style="background:#0a0f1e;padding:30px 24px;text-align:center;">'
    + '<p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">Yacht Research</p>'
    + '<h1 style="color:#fff;font-size:22px;margin:0;font-weight:300;">' + tag + ' ' + formName + '</h1>'
    + '<p style="color:rgba(255,255,255,0.4);font-size:11px;margin:10px 0 0;">' + new Date().toLocaleString('fr-FR') + '</p>'
    + '</div>'
    + '<table style="width:100%;border-collapse:collapse;">' + rows + '</table>'
    + '<div style="background:#f5f5f5;padding:16px 24px;text-align:center;"><p style="color:#999;font-size:11px;margin:0;">Soumis via yachtresearchgroup.com</p></div>'
    + '</div>';
  var subject = formName === 'Shared Experience Booking'
    ? tag + ' Yacht Research — ' + (data.status || 'Réservation') + ' · ' + (data.product || '')
    : tag + ' Yacht Research — Nouveau ' + formName;
  sendBrevoEmail(ADMIN_EMAIL, 'Mathis', subject, html, data.email || data.client_email || ADMIN_EMAIL);
}

// ─── NETTOYAGE DES LIGNES DE TEST (à lancer à la main : choisir deleteTestRows puis Exécuter) ───
function deleteTestRows() {
  var files = DriveApp.getFilesByName(SHEET_NAME);
  if (!files.hasNext()) return;
  var ss = SpreadsheetApp.open(files.next());
  var n = 0;
  ss.getSheets().forEach(function (sh) {
    var v = sh.getDataRange().getValues();
    for (var r = v.length - 1; r >= 1; r--) {
      if (v[r].some(function (c) { return /TEST Claude|ROBOT TEST/.test(String(c)); })) { sh.deleteRow(r + 1); n++; }
    }
  });
  Logger.log(n + ' ligne(s) de test supprimée(s)');
}

// ─── TEST ────────────────────────────────────────────────────
function testScript() {
  var fakePost = { parameter: {
    form_name: 'Yacht Enquiry',
    name: 'Jean-Paul Dupont',
    email: 'mathis.yachtbroker+test@outlook.com',
    type: 'Yacht Acquisition',
    budget: '1M - 3M',
    yacht_type: 'Motor Yacht',
    market: 'Dubai / UAE',
    country: 'France',
    message: 'Interested in a 40m+ motor yacht based in Dubai.'
  }};
  doPost(fakePost);
  Logger.log('Test executed. Check email + Sheets + Brevo!');
}
