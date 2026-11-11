// ============================================================
// YACHT RESEARCH : e-mails des séquences Brevo, au design du site (noir et or)
// Écrit email-preview/<id>.html (HTML à coller dans Brevo : « Coder votre propre e-mail »)
// et email-preview/index.html (aperçu de tous les e-mails, ordinateur et téléphone).
// Usage : node tools/emails/build.mjs
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EMAILS, AUTOMATIONS } from './content.mjs';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(SITE_DIR, 'email-preview');
const SITE = 'https://yachtresearchgroup.com';
const LOGO = SITE + '/images/uploads/yacht-research-logo.png'; // logo doré sur fond noir, déjà en ligne
const WA_UAE = 'https://wa.me/qr/5NK5SR22CXGNC1', WA_FR = 'https://wa.me/message/CVQVHBO3GXLZP1';

// Couleurs du site
const C = { bg: '#000000', card: '#0f0f0f', card2: '#151412', gold: '#c9a84c', goldL: '#e6cf8a', cream: '#f3eee4', text: '#cfc8bb', mute: '#8f897e', line: '#2a2519' };
const SANS = "'Jost',Arial,Helvetica,sans-serif";
const SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif";

const goldBtn = (label, url) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:6px auto 0"><tr>
<td align="center" bgcolor="${C.gold}" style="border-radius:999px;background:${C.gold};background-image:linear-gradient(120deg,#9c7f32 0%,#e6cf8a 45%,#c9a84c 70%,#9c7f32 100%)">
<a href="${url}" target="_blank" style="display:inline-block;padding:17px 36px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#070707;text-decoration:none;border-radius:999px">${label} &rarr;</a></td></tr></table>`;

const ghostBtn = (label, url) => `<td align="center" style="padding:0 5px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" style="border:1px solid ${C.gold};border-radius:999px"><a href="${url}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.goldL};text-decoration:none;white-space:nowrap">${label}</a></td></tr></table></td>`;

const social = (label, url) => `<td align="center" style="padding:4px"><a href="${url}" target="_blank" style="display:inline-block;padding:9px 14px;border:1px solid ${C.line};border-radius:999px;background:${C.card2};font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:${C.goldL};text-decoration:none;white-space:nowrap">${label}</a></td>`;

function render(id, e) {
  const sections = (e.sections || []).map(([label, text]) => `
<tr><td class="px" style="padding:0 48px 22px">
<p style="margin:0 0 8px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold}">${label}</p>
<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.75;color:${C.text}">${text}</p></td></tr>`).join('');
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<meta name="robots" content="noindex">
<title>${e.subject.replace(/^\S+\s/, '')}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
body{margin:0;padding:0;background:${C.bg}}
a{color:${C.goldL}}
b,strong{color:${C.cream};font-weight:600}
@media (max-width:620px){
  .wrap{width:100%!important}
  .px{padding-left:26px!important;padding-right:26px!important}
  .h1{font-size:30px!important;line-height:1.12!important}
  .h1 em{font-size:34px!important}
  .wa td{display:block!important;padding:5px 0!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg}">${e.preheader}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" style="background:${C.bg}">
<tr><td align="center" style="padding:28px 12px 40px">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px">

<!-- Logo -->
<tr><td align="center" style="padding:6px 0 22px"><a href="${SITE}" target="_blank"><img src="${LOGO}" width="110" height="110" alt="Yacht Research" style="display:block;width:110px;height:110px;border:0"></a></td></tr>

<!-- Carte -->
<tr><td bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.line};border-radius:18px;overflow:hidden">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${e.hero ? `<tr><td style="padding:0;line-height:0"><img src="${e.hero}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:18px 18px 0 0"></td></tr>` : ''}
<tr><td class="px" style="padding:40px 48px 8px">
<p style="margin:0 0 16px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${C.gold}">${e.eyebrow}</p>
<h1 class="h1" style="margin:0 0 26px;font-family:${SANS};font-size:36px;line-height:1.08;font-weight:300;letter-spacing:.5px;text-transform:uppercase;color:${C.cream}">${e.title[0]} <em style="font-family:${SERIF};font-style:italic;font-weight:500;font-size:40px;text-transform:none;letter-spacing:0;color:${C.goldL}">${e.title[1]}</em></h1>
<p style="margin:0 0 18px;font-family:${SANS};font-size:16px;color:${C.cream}">Dear {{contact.PRENOM}},</p>
${e.paras.map(p => `<p style="margin:0 0 18px;font-family:${SANS};font-size:15px;line-height:1.75;color:${C.text}">${p}</p>`).join('\n')}
</td></tr>
${e.sections && e.sections.length ? `<tr><td class="px" style="padding:6px 48px 24px"><div style="width:44px;height:1px;background:${C.gold};font-size:0;line-height:0">&nbsp;</div></td></tr>` : ''}
${sections}
<tr><td align="center" class="px" style="padding:14px 48px ${e.whatsapp ? '18px' : '44px'}">${goldBtn(e.cta[0], e.cta[1])}</td></tr>
${e.whatsapp ? `<tr><td align="center" style="padding:0 24px 44px"><table role="presentation" class="wa" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${ghostBtn('WhatsApp UAE', WA_UAE)}${ghostBtn('WhatsApp France', WA_FR)}</tr></table></td></tr>` : ''}

<!-- Signature -->
<tr><td class="px" bgcolor="${C.card2}" style="background:${C.card2};border-top:1px solid ${C.line};padding:28px 48px;border-radius:0 0 18px 18px">
<p style="margin:0 0 4px;font-family:${SANS};font-size:14px;color:${C.text}">Warm regards,</p>
<p style="margin:0 0 6px;font-family:${SERIF};font-style:italic;font-size:22px;color:${C.goldL}">The Yacht Research Team</p>
<p style="margin:0;font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold}">Dubai &middot; French Riviera &middot; Mediterranean</p>
</td></tr>
</table>
</td></tr>

<!-- Réseaux -->
<tr><td align="center" style="padding:30px 0 6px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
${social('Website', SITE)}${social('Instagram', 'https://www.instagram.com/yacht_research/')}${social('Linktree', 'https://linktr.ee/yacht_research')}
</tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
${social('WhatsApp UAE', WA_UAE)}${social('WhatsApp France', WA_FR)}
</tr></table>
</td></tr>
<tr><td align="center" style="padding:18px 20px 0">
<p style="margin:0 0 6px;font-family:${SANS};font-size:11px;color:${C.mute}">&copy; 2026 Yacht Research Group &middot; <a href="${SITE}" style="color:${C.gold};text-decoration:none">yachtresearchgroup.com</a></p>
<p style="margin:0;font-family:${SANS};font-size:10px;color:#5f5a52">You received this email because you contacted Yacht Research. <a href="{{ unsubscribe }}" style="color:#8f897e">Unsubscribe</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const [id, e] of Object.entries(EMAILS)) fs.writeFileSync(path.join(OUT, id + '.html'), render(id, e), 'utf8');

// Page d'aperçu
const cards = AUTOMATIONS.map(a => `<section><h2>${a.name}</h2><p class="m">Déclenchée par l'ajout à la liste ${a.list}</p><div class="row">` +
  a.emails.map((id, i) => `<div class="mail"><p class="k">${i === 0 ? 'Tout de suite' : 'Après ' + a.waits[i].replace('days', 'jours')}</p><p class="s">${EMAILS[id].subject}</p>
<iframe src="${id}.html" loading="lazy" title="${id}"></iframe><p class="l"><a href="${id}.html" target="_blank">Ouvrir seul</a> · fichier <code>email-preview/${id}.html</code></p></div>`).join('') + `</div></section>`).join('');
fs.writeFileSync(path.join(OUT, 'index.html'), `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>E-mails Brevo · aperçu</title>
<style>body{margin:0;background:#1b1a18;color:#f3eee4;font:15px/1.5 system-ui,Segoe UI,sans-serif;padding:24px}h1{font-weight:400;margin:0 0 6px}h2{color:#e6cf8a;font-weight:500;margin:34px 0 2px}.m{color:#9b958a;margin:0 0 14px}.row{display:flex;gap:18px;overflow-x:auto;padding-bottom:12px}.mail{flex:0 0 400px}.k{color:#c9a84c;font-size:12px;letter-spacing:.15em;text-transform:uppercase;margin:0}.s{margin:2px 0 8px;font-weight:600}iframe{width:400px;height:760px;border:1px solid #333;border-radius:12px;background:#070707}.l{font-size:12px;color:#9b958a}.l a{color:#e6cf8a}code{color:#cfc8bb}@media(max-width:600px){.mail{flex-basis:92vw}iframe{width:92vw}}</style></head>
<body><h1>E-mails des séquences Brevo</h1><p class="m">Aperçu au design du site. Les textes sont ceux de tes automatisations actuelles. Faire défiler chaque ligne de gauche à droite.</p>${cards}</body></html>`, 'utf8');
console.log('✓ email-preview : ' + Object.keys(EMAILS).length + ' e-mails + index.html');
