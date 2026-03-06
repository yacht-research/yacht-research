// ============================================================
// YACHT RESEARCH — Google Apps Script
// Ce script reçoit les soumissions de formulaires du site,
// les enregistre dans Google Sheets et envoie un email de notification.
//
// INSTRUCTIONS D'INSTALLATION :
// 1. Va sur script.google.com
// 2. Crée un nouveau projet, nomme-le "Yacht Research Forms"
// 3. Colle tout ce code dans l'éditeur
// 4. Remplace YOUR_EMAIL_HERE par ton adresse email
// 5. Clique sur "Déployer" > "Nouveau déploiement"
// 6. Type : Application Web
//    - Exécuter en tant que : Moi
//    - Qui a accès : Tout le monde
// 7. Copie l'URL générée et colle-la dans ton fichier HTML
//    à la ligne : const APPS_SCRIPT_URL = 'COLLE_ICI';
// ============================================================

const NOTIFICATION_EMAIL = 'mathis.yachtbroker@outlook.com'; // ← Remplace par ton email
const SPREADSHEET_NAME   = 'Yacht Research — Form Submissions';

// ─── POINT D'ENTRÉE PRINCIPAL ───────────────────────────────
function doPost(e) {
  try {
    const data = e.parameter;
    const formName = data.form_name || 'Unknown Form';

    // 1. Enregistre dans Google Sheets
    saveToSheet(formName, data);

    // 2. Envoie un email de notification
    sendNotificationEmail(formName, data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── ENREGISTREMENT GOOGLE SHEETS ───────────────────────────
function saveToSheet(formName, data) {
  let ss;

  // Cherche le fichier existant ou en crée un nouveau
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  }

  // Cherche ou crée un onglet pour ce formulaire
  let sheet = ss.getSheetByName(formName);
  if (!sheet) {
    sheet = ss.insertSheet(formName);
  }

  // Définit les colonnes selon le formulaire
  const headers = getHeaders(formName);

  // Ajoute les en-têtes si l'onglet est vide
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#0a0f1e')
      .setFontColor('#c9a84c')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  // Ajoute la ligne de données
  const row = headers.map(h => data[h.toLowerCase().replace(/ /g, '_')] || data[h] || '');
  row[0] = data.submitted_at || new Date().toLocaleString('fr-FR'); // Toujours la date en premier
  sheet.appendRow(row);

  // Mise en forme légère des nouvelles lignes
  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, headers.length).setBackground('#f8f8f8');
  }
}

// ─── EN-TÊTES PAR FORMULAIRE ────────────────────────────────
function getHeaders(formName) {
  const map = {
    'Contact Enquiry':        ['Date', 'name', 'phone', 'email', 'type', 'message'],
    'Partnership Inquiry':    ['Date', 'name', 'company', 'role', 'country', 'email', 'message'],
    'Recruitment Application':['Date', 'name', 'position', 'email', 'experience'],
  };
  return map[formName] || ['Date', ...Object.keys({}), 'message'];
}

// ─── EMAIL DE NOTIFICATION ───────────────────────────────────
function sendNotificationEmail(formName, data) {
  const emoji = {
    'Contact Enquiry':         '⛵',
    'Partnership Inquiry':     '🤝',
    'Recruitment Application': '💼',
  }[formName] || '📬';

  const subject = `${emoji} Yacht Research — Nouveau ${formName}`;

  // Construit le corps HTML de l'email
  let rows = '';
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'form_name' || key === 'submitted_at') return;
    rows += `
      <tr>
        <td style="padding:10px 16px;font-weight:600;color:#c9a84c;background:#0a0f1e;white-space:nowrap;font-family:Arial,sans-serif;font-size:13px;border-bottom:1px solid #1a2540;">
          ${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g,' ')}
        </td>
        <td style="padding:10px 16px;color:#333;background:#fff;font-family:Arial,sans-serif;font-size:13px;border-bottom:1px solid #eee;">
          ${value || '—'}
        </td>
      </tr>`;
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;">
      
      <!-- HEADER -->
      <div style="background:#0a0f1e;padding:30px 24px;text-align:center;">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">
          Yacht Research
        </p>
        <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:300;letter-spacing:1px;">
          ${emoji} ${formName}
        </h1>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:10px 0 0;">
          ${data.submitted_at || new Date().toLocaleString('fr-FR')}
        </p>
      </div>

      <!-- TABLE DES DONNÉES -->
      <table style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>

      <!-- FOOTER -->
      <div style="background:#f5f5f5;padding:16px 24px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;">
          Soumis via le site Yacht Research · The Art of Effortless Yachting 🛥
        </p>
      </div>
    </div>`;

  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: html,
  });
}

// ─── TEST MANUEL (exécute depuis l'éditeur pour tester) ──────
function testScript() {
  const fakePost = {
    parameter: {
      form_name:    'Contact Enquiry',
      submitted_at: new Date().toLocaleString('fr-FR'),
      name:         'Jean-Paul Dupont',
      phone:        '+33 6 12 34 56 78',
      email:        'jp.dupont@example.com',
      type:         'Buy a Yacht',
      message:      'Interested in a 40m+ motor yacht based in Dubai.',
    }
  };
  doPost(fakePost);
  Logger.log('Test executed. Check your email and Google Sheets.');
}
