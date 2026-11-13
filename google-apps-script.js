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
  // Demandes d'expériences partagées (horaire choisi sur /shared-experiences) : liste « Shared Experience Enquiry »
  'Shared Experience Enquiry': 12,
};

// Formulaires qui ont une séquence Brevo : le 1er e-mail de la séquence remplace la confirmation du script.
// Le script n'envoie sa confirmation qu'en SECOURS (Brevo n'a pas répondu, ou le contact était déjà dans la liste
// et la séquence ne repartira pas).
const SEQUENCE_FORMS = ['Contact Enquiry', 'Yacht Enquiry', 'Partnership Inquiry', 'Shared Experience Enquiry'];

// ─── GABARIT DES E-MAILS (noir et or, comme le site) ─────────
// <EMAIL-TEMPLATE> (généré par tools/emails/build.mjs : ne pas modifier à la main)
var EMAIL_TEMPLATE = "<!DOCTYPE html>\n<html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<meta name=\"x-apple-disable-message-reformatting\">\n<meta name=\"color-scheme\" content=\"dark light\">\n<meta name=\"supported-color-schemes\" content=\"dark light\">\n<title>%%SUBJECT%%</title>\n<link href=\"https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Jost:wght@300;400;500;600&display=swap\" rel=\"stylesheet\">\n<style>\nbody{margin:0;padding:0;background:#000000}\na{color:#e6cf8a}\nb,strong{color:#f3eee4;font-weight:600}\n@media (max-width:620px){\n  .wrap{width:100%!important}\n  .px{padding-left:22px!important;padding-right:22px!important}\n  .h1{font-size:30px!important;line-height:1.12!important}\n  .h1 em{font-size:34px!important}\n  .wa td{display:block!important;padding:5px 0!important}\n  .tiles td.tile{display:block!important;width:100%!important;padding:0 0 22px!important}\n  .yca-l,.yca-r{display:block!important;width:auto!important}\n  .yca-l{padding:22px 22px 0!important}\n  .soc{padding:0 2px!important;width:60px!important}\n  .soc a{font-size:8px!important;letter-spacing:.6px!important}\n}\n</style>\n</head>\n<body style=\"margin:0;padding:0;background:#000000;-webkit-text-size-adjust:100%\">\n<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:#000000\">%%PRE%%&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>\n<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#000000\" style=\"background:#000000\">\n<tr><td align=\"center\" style=\"padding:28px 12px 40px\">\n<table role=\"presentation\" class=\"wrap\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:600px;max-width:600px\">\n\n<!-- Logo -->\n<tr><td align=\"center\" style=\"padding:6px 0 22px\"><a href=\"https://yachtresearchgroup.com\" target=\"_blank\"><img src=\"https://yachtresearchgroup.com/images/email/logo-yr.png\" width=\"120\" height=\"100\" alt=\"Yacht Research\" style=\"display:block;width:120px;height:100px;border:0\"></a></td></tr>\n\n<!-- Carte -->\n<tr><td bgcolor=\"#0f0f0f\" style=\"background:#0f0f0f;border:1px solid #2a2519;border-radius:18px;overflow:hidden\">\n<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n<tr><td style=\"padding:0;line-height:0\"><img src=\"%%HERO%%\" width=\"600\" alt=\"\" style=\"display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:18px 18px 0 0\"></td></tr>\n<tr><td class=\"px\" style=\"padding:40px 48px 8px\">\n<p style=\"margin:0 0 16px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#c9a84c\">%%EYEBROW%%</p>\n<h1 class=\"h1\" style=\"margin:0 0 26px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:36px;line-height:1.08;font-weight:300;letter-spacing:.5px;text-transform:uppercase;color:#f3eee4\">%%T1%% <em style=\"font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-weight:500;font-size:40px;text-transform:none;letter-spacing:0;color:#e6cf8a\">%%T2%%</em></h1>\n<p style=\"margin:0 0 18px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:16px;color:#f3eee4\">Dear %%NAME%%,</p>\n%%BODY%%\n</td></tr>\n\n\n\n\n\n\n\n<tr><td align=\"center\" class=\"px\" style=\"padding:14px 48px 18px\"><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" align=\"center\" style=\"margin:6px auto 0\"><tr>\n<td align=\"center\" bgcolor=\"#c9a84c\" style=\"border-radius:999px;background:#c9a84c;background-image:linear-gradient(120deg,#9c7f32 0%,#e6cf8a 45%,#c9a84c 70%,#9c7f32 100%)\">\n<a href=\"%%CTA_URL%%\" target=\"_blank\" style=\"display:inline-block;padding:17px 36px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#070707;text-decoration:none;border-radius:999px\">%%CTA_LABEL%% &rarr;</a></td></tr></table></td></tr>\n<tr><td align=\"center\" style=\"padding:0 24px 40px\"><table role=\"presentation\" class=\"wa\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" align=\"center\"><tr><td align=\"center\" style=\"padding:0 5px\"><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>\n<td align=\"center\" style=\"border:1px solid #c9a84c;border-radius:999px\"><a href=\"https://wa.me/qr/5NK5SR22CXGNC1\" target=\"_blank\" style=\"display:inline-block;padding:12px 22px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#e6cf8a;text-decoration:none;white-space:nowrap\">WhatsApp UAE</a></td></tr></table></td><td align=\"center\" style=\"padding:0 5px\"><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>\n<td align=\"center\" style=\"border:1px solid #c9a84c;border-radius:999px\"><a href=\"https://wa.me/message/CVQVHBO3GXLZP1\" target=\"_blank\" style=\"display:inline-block;padding:12px 22px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#e6cf8a;text-decoration:none;white-space:nowrap\">WhatsApp France</a></td></tr></table></td></tr></table></td></tr>\n\n<!-- Discover -->\n<tr><td class=\"px\" style=\"padding:8px 40px 6px;border-top:1px solid #2a2519\">\n<p style=\"margin:30px 0 6px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;text-align:center\">Discover Yacht Research</p>\n<p style=\"margin:0 0 22px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:24px;font-weight:300;letter-spacing:.5px;text-transform:uppercase;color:#f3eee4;text-align:center\">More than <em style=\"font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-weight:500;font-size:28px;text-transform:none;color:#e6cf8a\">brokerage</em></p>\n<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" class=\"tiles\"><tr><td class=\"tile\" valign=\"top\" width=\"50%\" style=\"width:50%;padding:0 8px 16px\">\n<a href=\"https://yachtresearchgroup.com/shared-experiences\" target=\"_blank\" style=\"text-decoration:none;display:block\">\n<img src=\"https://yachtresearchgroup.com/images/email/experiences.jpg\" width=\"244\" alt=\"Shared experiences\" style=\"display:block;width:100%;height:auto;border:0;border-radius:12px\">\n<p style=\"margin:12px 0 4px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c\">Dubai · By the seat</p>\n<p style=\"margin:0 0 6px;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-weight:500;font-size:22px;line-height:1.15;color:#f3eee4\">Shared experiences</p>\n<p style=\"margin:0 0 6px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#cfc8bb\">Superyacht days, yacht tours with BBQ, sunset dinner cruises and boat parties. Book your seats, no need to charter a whole yacht.</p>\n<p style=\"margin:0;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#e6cf8a\">See the experiences &rarr;</p></a></td><td class=\"tile\" valign=\"top\" width=\"50%\" style=\"width:50%;padding:0 8px 16px\">\n<a href=\"https://yachtresearchgroup.com/charter\" target=\"_blank\" style=\"text-decoration:none;display:block\">\n<img src=\"https://images.unsplash.com/photo-1672939113905-b02ef5db7203?auto=format&fit=crop&w=560&h=360&q=70&fm=jpg\" width=\"244\" alt=\"Charter\" style=\"display:block;width:100%;height:auto;border:0;border-radius:12px\">\n<p style=\"margin:12px 0 4px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c\">Charter</p>\n<p style=\"margin:0 0 6px;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-weight:500;font-size:22px;line-height:1.15;color:#f3eee4\">Charter</p>\n<p style=\"margin:0 0 6px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#cfc8bb\">Day, weekly and hourly charters with hand-picked crews, at B2B rates.</p>\n<p style=\"margin:0;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#e6cf8a\">Plan a charter &rarr;</p></a></td></tr><tr><td class=\"tile\" valign=\"top\" width=\"50%\" style=\"width:50%;padding:0 8px 16px\">\n<a href=\"https://yachtresearchgroup.com/private-jet\" target=\"_blank\" style=\"text-decoration:none;display:block\">\n<img src=\"https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=560&h=360&q=70&fm=jpg\" width=\"244\" alt=\"Private Jet\" style=\"display:block;width:100%;height:auto;border:0;border-radius:12px\">\n<p style=\"margin:12px 0 4px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c\">Worldwide · Private aviation</p>\n<p style=\"margin:0 0 6px;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-weight:500;font-size:22px;line-height:1.15;color:#f3eee4\">Private Jet</p>\n<p style=\"margin:0 0 6px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#cfc8bb\">Private jets, empty legs and private flights anywhere in the world, booked through our global network.</p>\n<p style=\"margin:0;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#e6cf8a\">Fly private &rarr;</p></a></td><td class=\"tile\" valign=\"top\" width=\"50%\" style=\"width:50%;padding:0 8px 16px\">\n<a href=\"https://yachtresearchgroup.com/listings\" target=\"_blank\" style=\"text-decoration:none;display:block\">\n<img src=\"https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=560&h=360&q=70&fm=jpg\" width=\"244\" alt=\"Yachts for sale\" style=\"display:block;width:100%;height:auto;border:0;border-radius:12px\">\n<p style=\"margin:12px 0 4px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c\">Buy · Sell</p>\n<p style=\"margin:0 0 6px;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-weight:500;font-size:22px;line-height:1.15;color:#f3eee4\">Yachts for sale</p>\n<p style=\"margin:0 0 6px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#cfc8bb\">Off-market search, survey, sea trial and negotiation. We find the right yacht, not simply the first one available.</p>\n<p style=\"margin:0;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#e6cf8a\">See the yachts &rarr;</p></a></td></tr></table>\n</td></tr>\n<!-- Yacht Club Academy -->\n<tr><td class=\"px\" style=\"padding:0 48px 36px\">\n<a href=\"https://yachtclubacademy.com/en/?utm_source=yacht-research&utm_medium=email&utm_campaign=yca-card\" target=\"_blank\" style=\"text-decoration:none;display:block\">\n<!-- Carte YCA en image (rendue depuis la carte de l'accueil) : Gmail en mode nuit inverse les couleurs du texte mais jamais les images -->\n<img src=\"https://yachtresearchgroup.com/images/email/yca-card.png\" width=\"400\" alt=\"Yacht Club Academy, also founded by Mathis &amp; Antoine. Our academy for those who want to become Yacht Brokers. Discover the academy\" style=\"display:block;width:100%;max-width:400px;height:auto;border:0;margin:0 auto\"></a>\n</td></tr>\n\n<!-- Signature -->\n<tr><td class=\"px\" bgcolor=\"#151412\" style=\"background:#151412;border-top:1px solid #2a2519;padding:28px 48px;border-radius:0 0 18px 18px\">\n<p style=\"margin:0 0 4px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:14px;color:#cfc8bb\">Warm regards,</p>\n<p style=\"margin:0 0 6px;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-size:22px;color:#e6cf8a\">The Yacht Research Team</p>\n<p style=\"margin:0;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#c9a84c\">Dubai &middot; French Riviera &middot; Mediterranean</p>\n</td></tr>\n</table>\n</td></tr>\n\n<!-- Réseaux -->\n<tr><td align=\"center\" style=\"padding:34px 0 4px\">\n<p style=\"margin:0 0 16px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#c9a84c\">Follow us &amp; talk to us</p>\n<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" align=\"center\"><tr>\n<td align=\"center\" valign=\"top\" class=\"soc\" style=\"padding:0 7px;width:72px\">\n<a href=\"https://www.instagram.com/yacht_research/\" target=\"_blank\" style=\"text-decoration:none\"><img src=\"https://yachtresearchgroup.com/images/email/ic-instagram.png\" width=\"44\" height=\"44\" alt=\"Instagram\" style=\"display:block;width:44px;height:44px;border:0;margin:0 auto\"></a>\n<a href=\"https://www.instagram.com/yacht_research/\" target=\"_blank\" style=\"display:block;margin-top:8px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#8f897e;text-decoration:none;white-space:nowrap\">Instagram</a></td><td align=\"center\" valign=\"top\" class=\"soc\" style=\"padding:0 7px;width:72px\">\n<a href=\"https://wa.me/qr/5NK5SR22CXGNC1\" target=\"_blank\" style=\"text-decoration:none\"><img src=\"https://yachtresearchgroup.com/images/email/ic-whatsapp.png\" width=\"44\" height=\"44\" alt=\"WhatsApp UAE\" style=\"display:block;width:44px;height:44px;border:0;margin:0 auto\"></a>\n<a href=\"https://wa.me/qr/5NK5SR22CXGNC1\" target=\"_blank\" style=\"display:block;margin-top:8px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#8f897e;text-decoration:none;white-space:nowrap\">WhatsApp UAE</a></td><td align=\"center\" valign=\"top\" class=\"soc\" style=\"padding:0 7px;width:72px\">\n<a href=\"https://wa.me/message/CVQVHBO3GXLZP1\" target=\"_blank\" style=\"text-decoration:none\"><img src=\"https://yachtresearchgroup.com/images/email/ic-whatsapp.png\" width=\"44\" height=\"44\" alt=\"WhatsApp FR\" style=\"display:block;width:44px;height:44px;border:0;margin:0 auto\"></a>\n<a href=\"https://wa.me/message/CVQVHBO3GXLZP1\" target=\"_blank\" style=\"display:block;margin-top:8px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#8f897e;text-decoration:none;white-space:nowrap\">WhatsApp FR</a></td><td align=\"center\" valign=\"top\" class=\"soc\" style=\"padding:0 7px;width:72px\">\n<a href=\"https://yachtresearchgroup.com\" target=\"_blank\" style=\"text-decoration:none\"><img src=\"https://yachtresearchgroup.com/images/email/ic-web.png\" width=\"44\" height=\"44\" alt=\"Website\" style=\"display:block;width:44px;height:44px;border:0;margin:0 auto\"></a>\n<a href=\"https://yachtresearchgroup.com\" target=\"_blank\" style=\"display:block;margin-top:8px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#8f897e;text-decoration:none;white-space:nowrap\">Website</a></td><td align=\"center\" valign=\"top\" class=\"soc\" style=\"padding:0 7px;width:72px\">\n<a href=\"https://linktr.ee/yacht_research\" target=\"_blank\" style=\"text-decoration:none\"><img src=\"https://yachtresearchgroup.com/images/email/ic-link.png\" width=\"44\" height=\"44\" alt=\"Linktree\" style=\"display:block;width:44px;height:44px;border:0;margin:0 auto\"></a>\n<a href=\"https://linktr.ee/yacht_research\" target=\"_blank\" style=\"display:block;margin-top:8px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#8f897e;text-decoration:none;white-space:nowrap\">Linktree</a></td>\n</tr></table>\n</td></tr>\n<tr><td align=\"center\" style=\"padding:24px 20px 0\">\n<p style=\"margin:0 0 6px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:11px;color:#8f897e\">&copy; Yacht Research Group &middot; <a href=\"https://yachtresearchgroup.com\" style=\"color:#c9a84c;text-decoration:none\">yachtresearchgroup.com</a></p>\n<p style=\"margin:0;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:10px;color:#5f5a52\">You received this email because you contacted Yacht Research.</p>\n</td></tr>\n\n</table>\n</td></tr>\n</table>\n</body>\n</html>\n";
var EMAIL_P_STYLE = "margin:0 0 18px;font-family:'Jost',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#cfc8bb";
// </EMAIL-TEMPLATE>

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function emailP(html) { return '<p style="' + EMAIL_P_STYLE + '">' + html + '</p>'; }
// o : subject, pre, eyebrow, t1, t2, hero, name, body (HTML), ctaLabel, ctaUrl
function emailHtml(o) {
  var v = { SUBJECT: o.subject, PRE: o.pre, EYEBROW: o.eyebrow, T1: o.t1, T2: o.t2, HERO: o.hero, NAME: o.name, BODY: o.body, CTA_LABEL: o.ctaLabel, CTA_URL: o.ctaUrl };
  return EMAIL_TEMPLATE.replace(/%%(\w+)%%/g, function (m, k) { return v[k] != null ? v[k] : ''; });
}
function heroUrl(id) { return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=1200&h=560&q=70&fm=jpg'; }

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
// Renvoie 'new' (ajouté à la liste maintenant : la séquence Brevo part), 'already' (déjà dans la liste),
// 'none' (pas de liste pour ce formulaire) ou 'error'
function addToBrevo(formName, data) {
  try {
    var listId = BREVO_LIST_IDS[formName];
    if (!listId) { Logger.log('No Brevo list for: ' + formName); return 'none'; }
    if (!BREVO_API_KEY) return 'error';
    // Déjà dans la liste ? (alors Brevo ne relance pas la séquence)
    var g = UrlFetchApp.fetch('https://api.brevo.com/v3/contacts/' + encodeURIComponent(data.email), {
      headers: { 'api-key': BREVO_API_KEY }, muteHttpExceptions: true
    });
    var already = false;
    if (g.getResponseCode() === 200) {
      try { already = (JSON.parse(g.getContentText()).listIds || []).indexOf(listId) > -1; } catch (ex) {}
    }
    BREVO_TRACE.push('contact check → ' + g.getResponseCode() + (already ? ' (already in list ' + listId + ')' : ''));
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
    if (response.getResponseCode() >= 300) return 'error';
    return already ? 'already' : 'new';
  } catch(e) {
    Logger.log('Brevo error: ' + e);
    BREVO_TRACE.push('contact error ' + e);
    return 'error';
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
    } else if (data.email) {
      var brevo = addToBrevo(formName, data);
      // Séquence Brevo partie : son 1er e-mail suffit. Sinon (Newsletter, virement, ou Brevo en panne) : e-mail du script.
      if (SEQUENCE_FORMS.indexOf(formName) < 0 || brevo !== 'new') sendConfirmationEmail(formName, data);
      BREVO_TRACE.push('list: ' + brevo + ' / script confirmation: ' + (SEQUENCE_FORMS.indexOf(formName) < 0 || brevo !== 'new' ? 'sent' : 'skipped'));
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
      body: 'You can expect to hear from us within <strong>24 hours</strong>.<br><br>At Yacht Research, we work selectively with serious buyers, sellers, and charterers, providing discreet, expert guidance across Dubai, the French Riviera, and the Mediterranean.<br><br>In the meantime, feel free to explore our current listings and services at <a href="https://yachtresearchgroup.com" style="color:#e6cf8a;text-decoration:none;">yachtresearchgroup.com</a>, or reach out to us directly via WhatsApp for a faster response.',
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
    },
    'Shared Experience Enquiry': {
      emoji: '🛥️', subject: '🛥️ Your Experience Request | Yacht Research',
      intro: 'Thank you for your request for <strong>' + esc(data.experience || 'a shared yacht experience in Dubai') + '</strong>. We have received it.',
      body: 'A member of our team will check availability for you and confirm your seats directly by WhatsApp or email within <strong>24 hours</strong>.<br><br>For a faster answer, you can also message us on WhatsApp.',
      closing: 'We look forward to welcoming you on board in Dubai.'
    }
  };

  var msg = messages[formName] || {
    emoji: '📬', subject: '📬 Message Received — Yacht Research',
    intro: 'Thank you for contacting Yacht Research.',
    body: 'We have received your message and will get back to you shortly.',
    closing: 'Visit us at <a href="https://yachtresearchgroup.com" style="color:#e6cf8a;">yachtresearchgroup.com</a>.'
  };

  // Présentation de chaque e-mail : rubrique, titre (normal / italique doré), photo, bouton
  var SITE = 'https://yachtresearchgroup.com';
  var looks = {
    'Contact Enquiry':         ['Your enquiry', 'We have received', 'your enquiry', 'photo-1562281302-809108fd533c', 'Explore our yachts', SITE + '/listings'],
    'Yacht Enquiry':           ['Your yacht enquiry', 'Thank you for', 'your enquiry', 'photo-1562281302-809108fd533c', 'Explore our yachts', SITE + '/listings'],
    'Partnership Inquiry':     ['Partnership enquiry', 'Thank you for', 'your interest', 'photo-1752884991178-c767ae83fb6b', 'Discover our partnerships', SITE + '/partnerships'],
    'Recruitment Application': ['Your application', 'Application', 'received', 'photo-1722502831572-2d12e8f30c59', 'Visit our website', SITE],
    'Newsletter':              ['Newsletter', 'Welcome to', 'our newsletter', 'photo-1567899378494-47b22a2ae96a', 'Explore our yachts', SITE + '/listings'],
    'Bank Transfer Request':   ['Bank transfer', 'Request', 'received', 'photo-1722502831572-2d12e8f30c59', 'See our experiences', SITE + '/shared-experiences'],
    'Shared Experience Enquiry': ['Shared experience', 'Request', 'received', 'photo-1722502831572-2d12e8f30c59', 'See all experiences', SITE + '/shared-experiences']
  };
  var l = looks[formName] || ['Your message', 'Message', 'received', 'photo-1562281302-809108fd533c', 'Visit our website', SITE];

  var body = [msg.intro].concat(msg.body.split('<br><br>')).concat([msg.closing]).map(emailP).join('');
  var html = emailHtml({
    subject: msg.subject.replace(/^\S+\s/, ''), pre: msg.intro, eyebrow: l[0], t1: l[1], t2: l[2], hero: heroUrl(l[3]),
    name: esc((data.name || 'there').split(' ')[0]), body: body, ctaLabel: l[4], ctaUrl: l[5]
  });
  sendBrevoEmail(data.email, data.name || '', msg.subject, html);
}

// ─── CONFIRMATION DE RÉSERVATION (sorties partagées payées sur le site) ────
// Aux couleurs de Yacht Research, sans mention de l'opérateur
function sendBookingConfirmation(data) {
  var paid = Number(data.paid_aed || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  var row = function (k, v) { return '<tr><td style="padding:12px 0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;border-bottom:1px solid #2a2519;">' + k + '</td><td style="padding:12px 0;font-family:Arial,sans-serif;font-size:14px;color:#f3eee4;text-align:right;border-bottom:1px solid #2a2519;">' + v + '</td></tr>'; };
  var body = emailP('Thank you for booking with Yacht Research. Your experience is confirmed. Here are the details:')
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-top:1px solid #2a2519;">'
    + row('Experience', esc(data.product))
    + row('Date', esc(data.date) + ' at ' + esc(data.time) + ' (Dubai time)')
    + row('Guests', esc(data.guests))
    + row('Total paid', 'AED ' + esc(paid))
    + '</table>'
    + emailP('Our team will send you the meeting point and final details before your experience. Please bring a valid ID for each guest.')
    + emailP('For any question or change, simply reply to this email.');
  var html = emailHtml({
    subject: 'Booking confirmed', pre: 'Your experience is confirmed: ' + esc(data.product) + ', ' + esc(data.date) + '.',
    eyebrow: 'Booking confirmed', t1: 'Your booking', t2: 'is confirmed', hero: heroUrl('photo-1722502831572-2d12e8f30c59'),
    name: esc((data.name || 'there').split(' ')[0]), body: body, ctaLabel: 'Discover our charters', ctaUrl: 'https://yachtresearchgroup.com/charter'
  });
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
    'Shared Experience Enquiry': ['Date','name','phone','email','experience','country','message'],
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
  var emojis = {'Contact Enquiry':'📬','Yacht Enquiry':'⛵','Partnership Inquiry':'🤝','Recruitment Application':'💼','Newsletter':'📩','Bank Transfer Request':'🏦','Shared Experience Enquiry':'🛥️','Shared Experience Booking':'🎟️'};
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
