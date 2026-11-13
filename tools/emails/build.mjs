// ============================================================
// YACHT RESEARCH : e-mails au design du site (noir et or)
// - email-preview/<id>.html + index.html : aperçu sur le site (noindex)
// - google-apps-script.js : le gabarit des e-mails envoyés par le script (entre les repères EMAIL-TEMPLATE)
// - avec --pc "<dossier>" : un dossier sur le PC avec le code à coller dans chaque e-mail Brevo
// Usage : node tools/emails/build.mjs [--pc "C:\...\Yacht Research - E-mails Brevo"]
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EMAILS, AUTOMATIONS, EXPLORE, YCA, CAMPAIGNS } from './content.mjs';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(SITE_DIR, 'email-preview');
const SITE = 'https://yachtresearchgroup.com';
const LOGO = SITE + '/images/uploads/yacht-research-logo.png'; // logo doré sur fond noir, déjà en ligne
const WA_UAE = 'https://wa.me/qr/5NK5SR22CXGNC1', WA_FR = 'https://wa.me/message/CVQVHBO3GXLZP1';
const IG = 'https://www.instagram.com/yacht_research/', LINKTREE = 'https://linktr.ee/yacht_research';

// Couleurs du site
const C = { bg: '#000000', card: '#0f0f0f', card2: '#151412', gold: '#c9a84c', goldL: '#e6cf8a', cream: '#f3eee4', text: '#cfc8bb', mute: '#8f897e', line: '#2a2519' };
const SANS = "'Jost',Arial,Helvetica,sans-serif";
const SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
const P_STYLE = `margin:0 0 18px;font-family:${SANS};font-size:15px;line-height:1.75;color:${C.text}`;

const goldBtn = (label, url) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:6px auto 0"><tr>
<td align="center" bgcolor="${C.gold}" style="border-radius:999px;background:${C.gold};background-image:linear-gradient(120deg,#9c7f32 0%,#e6cf8a 45%,#c9a84c 70%,#9c7f32 100%)">
<a href="${url}" target="_blank" style="display:inline-block;padding:17px 36px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#070707;text-decoration:none;border-radius:999px">${label} &rarr;</a></td></tr></table>`;

const ghostBtn = (label, url) => `<td align="center" style="padding:0 5px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" style="border:1px solid ${C.gold};border-radius:999px"><a href="${url}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.goldL};text-decoration:none;white-space:nowrap">${label}</a></td></tr></table></td>`;

// Icône ronde dorée + petit nom dessous
const social = (img, label, url, base) => `<td align="center" valign="top" class="soc" style="padding:0 7px;width:72px">
<a href="${url}" target="_blank" style="text-decoration:none"><img src="${base}/images/email/ic-${img}.png" width="44" height="44" alt="${label}" style="display:block;width:44px;height:44px;border:0;margin:0 auto"></a>
<a href="${url}" target="_blank" style="display:block;margin-top:8px;font-family:${SANS};font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${C.mute};text-decoration:none;white-space:nowrap">${label}</a></td>`;

// Une vignette « Discover » (photo, rubrique, titre, phrase, lien)
const tile = (t, base) => {
  const img = t.img.startsWith('/') ? base + t.img : t.img;
  return `<td class="tile" valign="top" width="50%" style="width:50%;padding:0 8px 16px">
<a href="${SITE}${t.url}" target="_blank" style="text-decoration:none;display:block">
<img src="${img}" width="244" alt="${t.title}" style="display:block;width:100%;height:auto;border:0;border-radius:12px">
<p style="margin:12px 0 4px;font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${C.gold}">${t.eyebrow}</p>
<p style="margin:0 0 6px;font-family:${SERIF};font-style:italic;font-weight:500;font-size:22px;line-height:1.15;color:${C.cream}">${t.title}</p>
<p style="margin:0 0 6px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.text}">${t.text}</p>
<p style="margin:0;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.goldL}">${t.link} &rarr;</p></a></td>`;
};

function explore(base) {
  const rows = [];
  for (let i = 0; i < EXPLORE.length; i += 2) rows.push(`<tr>${tile(EXPLORE[i], base)}${EXPLORE[i + 1] ? tile(EXPLORE[i + 1], base) : '<td></td>'}</tr>`);
  return `
<!-- Discover -->
<tr><td class="px" style="padding:8px 40px 6px;border-top:1px solid ${C.line}">
<p style="margin:30px 0 6px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${C.gold};text-align:center">Discover Yacht Research</p>
<p style="margin:0 0 22px;font-family:${SANS};font-size:24px;font-weight:300;letter-spacing:.5px;text-transform:uppercase;color:${C.cream};text-align:center">More than <em style="font-family:${SERIF};font-style:italic;font-weight:500;font-size:28px;text-transform:none;color:${C.goldL}">brokerage</em></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="tiles">${rows.join('')}</table>
</td></tr>
<!-- Yacht Club Academy -->
<tr><td class="px" style="padding:0 48px 36px">
<a href="${SITE}${YCA.url}" target="_blank" style="text-decoration:none;display:block">
<!-- Couleurs de la carte YCA de l'accueil (bleu nuit, bleu clair, bouton blanc) -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B2D6B" style="border:1px solid #3a5a8f;border-radius:14px;background:#0B2D6B;background-image:radial-gradient(ellipse at 80% 0%,#1E4D96 0%,#0B2D6B 38%,#01163C 78%)"><tr>
<td style="padding:28px 28px 30px">
<img src="${base}/images/email/yca-logo.png" width="88" alt="Yacht Club Academy" style="display:block;width:88px;height:auto;border:0;margin:0 0 18px">
<p style="margin:0 0 12px;font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:2.6px;text-transform:uppercase;color:#A9C1EA">${YCA.kicker}</p>
<p style="margin:0 0 12px;font-family:${SANS};font-size:28px;line-height:1.05;font-weight:800;text-transform:uppercase;color:#F8F9FA">Yacht Club <em style="font-family:${SERIF};font-style:italic;font-weight:500;font-size:31px;text-transform:none;color:#A9C1EA">Academy</em></p>
<p style="margin:0 0 20px;font-family:${SANS};font-size:14px;line-height:1.7;color:#d9dee7">${YCA.text}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#F8F9FA" style="border-radius:999px;background:#F8F9FA;padding:13px 22px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#01163C">${YCA.link} &rarr;</td></tr></table>
</td></tr></table></a>
</td></tr>`;
}

// opts.base : adresse des images du site (vide = même site, pour l'aperçu) ; opts.greet ; opts.unsubscribe
function render(e, opts) {
  const base = opts.base;
  const sections = (e.sections || []).map(([label, text]) => `
<tr><td class="px" style="padding:0 48px 22px">
<p style="margin:0 0 8px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold}">${label}</p>
<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.75;color:${C.text}">${text}</p></td></tr>`).join('');
  const body = e.bodyHtml != null ? e.bodyHtml : e.paras.map(p => `<p style="${P_STYLE}">${p}</p>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${e.subject.replace(/^\S+\s/, '')}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
body{margin:0;padding:0;background:${C.bg}}
a{color:${C.goldL}}
b,strong{color:${C.cream};font-weight:600}
@media (max-width:620px){
  .wrap{width:100%!important}
  .px{padding-left:22px!important;padding-right:22px!important}
  .h1{font-size:30px!important;line-height:1.12!important}
  .h1 em{font-size:34px!important}
  .wa td{display:block!important;padding:5px 0!important}
  .tiles td.tile{display:block!important;width:100%!important;padding:0 0 22px!important}
  .yca-l,.yca-r{display:block!important;width:auto!important}
  .yca-l{padding:22px 22px 0!important}
  .soc{padding:0 2px!important;width:60px!important}
  .soc a{font-size:8px!important;letter-spacing:.6px!important}
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
${e.hero ? `<tr><td style="padding:0;line-height:0"><img src="${e.hero.startsWith('/') ? base + e.hero : e.hero}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:18px 18px 0 0"></td></tr>` : ''}
<tr><td class="px" style="padding:40px 48px 8px">
<p style="margin:0 0 16px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${C.gold}">${e.eyebrow}</p>
<h1 class="h1" style="margin:0 0 26px;font-family:${SANS};font-size:36px;line-height:1.08;font-weight:300;letter-spacing:.5px;text-transform:uppercase;color:${C.cream}">${e.title[0]} <em style="font-family:${SERIF};font-style:italic;font-weight:500;font-size:40px;text-transform:none;letter-spacing:0;color:${C.goldL}">${e.title[1]}</em></h1>
<p style="margin:0 0 18px;font-family:${SANS};font-size:16px;color:${C.cream}">${e.greet || opts.greet},</p>
${body}
</td></tr>
${e.sections && e.sections.length ? `<tr><td class="px" style="padding:6px 48px 24px"><div style="width:44px;height:1px;background:${C.gold};font-size:0;line-height:0">&nbsp;</div></td></tr>` : ''}
${sections}
<tr><td align="center" class="px" style="padding:14px 48px ${e.whatsapp ? '18px' : '40px'}">${goldBtn(e.cta[0], e.cta[1])}</td></tr>
${e.whatsapp ? `<tr><td align="center" style="padding:0 24px 40px"><table role="presentation" class="wa" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${ghostBtn('WhatsApp UAE', WA_UAE)}${ghostBtn('WhatsApp France', WA_FR)}</tr></table></td></tr>` : ''}
${explore(base)}

<!-- Signature -->
<tr><td class="px" bgcolor="${C.card2}" style="background:${C.card2};border-top:1px solid ${C.line};padding:28px 48px;border-radius:0 0 18px 18px">
<p style="margin:0 0 4px;font-family:${SANS};font-size:14px;color:${C.text}">Warm regards,</p>
<p style="margin:0 0 6px;font-family:${SERIF};font-style:italic;font-size:22px;color:${C.goldL}">The Yacht Research Team</p>
<p style="margin:0;font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold}">Dubai &middot; French Riviera &middot; Mediterranean</p>
</td></tr>
</table>
</td></tr>

<!-- Réseaux -->
<tr><td align="center" style="padding:34px 0 4px">
<p style="margin:0 0 16px;font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold}">Follow us &amp; talk to us</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
${social('instagram', 'Instagram', IG, base)}${social('whatsapp', 'WhatsApp UAE', WA_UAE, base)}${social('whatsapp', 'WhatsApp FR', WA_FR, base)}${social('web', 'Website', SITE, base)}${social('link', 'Linktree', LINKTREE, base)}
</tr></table>
</td></tr>
<tr><td align="center" style="padding:24px 20px 0">
<p style="margin:0 0 6px;font-family:${SANS};font-size:11px;color:${C.mute}">&copy; Yacht Research Group &middot; <a href="${SITE}" style="color:${C.gold};text-decoration:none">yachtresearchgroup.com</a></p>
<p style="margin:0;font-family:${SANS};font-size:10px;color:#5f5a52">You received this email because you contacted Yacht Research.${opts.unsubscribe ? ' <a href="{{ unsubscribe }}" style="color:#8f897e">Unsubscribe</a>' : ''}</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`;
}

const BREVO = { greet: 'Dear {{contact.PRENOM}}', unsubscribe: true };

// 1) Aperçu sur le site (images en chemin relatif : visibles sur l'aperçu avant la mise en ligne)
fs.mkdirSync(OUT, { recursive: true });
const noindex = h => h.replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n<meta name="viewport"');
for (const [id, e] of Object.entries(EMAILS)) fs.writeFileSync(path.join(OUT, id + '.html'), noindex(render(e, { ...BREVO, base: '' })), 'utf8');
for (const [id, e] of Object.entries(CAMPAIGNS)) fs.writeFileSync(path.join(OUT, 'campaign-' + id + '.html'), noindex(render(e, { ...BREVO, base: '' })), 'utf8');

const cards = AUTOMATIONS.map(a => `<section><h2>${a.name}</h2><p class="m">Déclenchée par l'ajout à la liste ${a.list}</p><div class="row">` +
  a.emails.map((id, i) => `<div class="mail"><p class="k">${i === 0 ? 'Tout de suite' : 'Après ' + a.waits[i].replace('days', 'jours')}</p><p class="s">${EMAILS[id].subject}</p>
<iframe src="${id}.html" loading="lazy" title="${id}"></iframe><p class="l"><a href="${id}.html" target="_blank">Ouvrir seul</a></p></div>`).join('') + `</div></section>`).join('');
fs.writeFileSync(path.join(OUT, 'index.html'), `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>E-mails Brevo · aperçu</title>
<style>body{margin:0;background:#1b1a18;color:#f3eee4;font:15px/1.5 system-ui,Segoe UI,sans-serif;padding:24px}h1{font-weight:400;margin:0 0 6px}h2{color:#e6cf8a;font-weight:500;margin:34px 0 2px}.m{color:#9b958a;margin:0 0 14px}.row{display:flex;gap:18px;overflow-x:auto;padding-bottom:12px}.mail{flex:0 0 400px}.k{color:#c9a84c;font-size:12px;letter-spacing:.15em;text-transform:uppercase;margin:0}.s{margin:2px 0 8px;font-weight:600}iframe{width:400px;height:760px;border:1px solid #333;border-radius:12px;background:#070707}.l{font-size:12px;color:#9b958a}.l a{color:#e6cf8a}@media(max-width:600px){.mail{flex-basis:92vw}iframe{width:92vw}}</style></head>
<body><h1>E-mails des séquences Brevo</h1><p class="m">Aperçu au design du site. Les textes sont ceux de tes automatisations actuelles. Faire défiler chaque ligne de gauche à droite.</p>${cards}
<h2>Campagnes</h2><p class="m">À envoyer une seule fois depuis Brevo &gt; Campagnes.</p><div class="row">${Object.entries(CAMPAIGNS).map(([id, e]) => `<div class="mail"><p class="k">Campagne</p><p class="s">${e.subject}</p><iframe src="campaign-${id}.html" loading="lazy" title="${id}"></iframe></div>`).join('')}</div>
<h2>E-mails envoyés par le script</h2><p class="m">Newsletter, virement, réservation, et secours si Brevo ne répond pas.</p><div class="row"><div class="mail"><p class="k">Exemple</p><p class="s">📩 Welcome to the Yacht Research Newsletter</p><iframe src="script-newsletter.html" loading="lazy" title="script"></iframe></div><div class="mail"><p class="k">Réservation payée (exemple)</p><p class="s">⛵ Booking confirmed</p><iframe src="script-booking.html" loading="lazy" title="booking"></iframe></div></div></body></html>`, 'utf8');

// 2) Gabarit des e-mails du script (images en adresse complète du site)
const TPL = render({ subject: 'x %%SUBJECT%%', preheader: '%%PRE%%', eyebrow: '%%EYEBROW%%', title: ['%%T1%%', '%%T2%%'], hero: '%%HERO%%', bodyHtml: '%%BODY%%', sections: [], cta: ['%%CTA_LABEL%%', '%%CTA_URL%%'], whatsapp: true },
  { greet: 'Dear %%NAME%%', unsubscribe: false, base: SITE });
const block = `// <EMAIL-TEMPLATE> (généré par tools/emails/build.mjs : ne pas modifier à la main)
var EMAIL_TEMPLATE = ${JSON.stringify(TPL)};
var EMAIL_P_STYLE = ${JSON.stringify(P_STYLE)};
// </EMAIL-TEMPLATE>`;
const GAS = path.join(SITE_DIR, 'google-apps-script.js');
const gas = fs.readFileSync(GAS, 'utf8');
const re = /\/\/ <EMAIL-TEMPLATE>[\s\S]*?\/\/ <\/EMAIL-TEMPLATE>/;
if (re.test(gas)) fs.writeFileSync(GAS, gas.replace(re, () => block), 'utf8');
else console.warn('! repères EMAIL-TEMPLATE absents de google-apps-script.js');
// Exemple du script dans l'aperçu
const sample = noindex(TPL).replace(/%%(\w+)%%/g, (m, k) => ({ SUBJECT: 'Welcome to the Yacht Research Newsletter', PRE: 'Thank you for subscribing.', EYEBROW: 'Newsletter', T1: 'Welcome to', T2: 'our newsletter', HERO: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&h=560&q=70&fm=jpg', NAME: 'Jean-Paul', CTA_LABEL: 'Explore our yachts', CTA_URL: SITE + '/listings',
  BODY: `<p style="${P_STYLE}">Thank you for subscribing to the Yacht Research newsletter.</p><p style="${P_STYLE}">You will now receive our exclusive listings, off-market opportunities, and market insights directly in your inbox.</p>` })[k]).replaceAll(SITE + '/images/email/', '/images/email/');
fs.writeFileSync(path.join(OUT, 'script-newsletter.html'), sample, 'utf8');

// 3) Dossier sur le PC : le code à coller dans chaque e-mail Brevo
const pcIdx = process.argv.indexOf('--pc');
if (pcIdx > -1) {
  const PC = process.argv[pcIdx + 1];
  const clean = s => s.replace(/\s*\|.*$/, '').replace(/[\\/:*?"<>|]/g, '').replace(/^\S+\s/, '').trim();
  fs.rmSync(path.join(PC, 'Codes à coller'), { recursive: true, force: true });
  let guide = `E-MAILS BREVO : YACHT RESEARCH (design du nouveau site)\r\n=========================================================\r\n\r\n` +
    `Quand ? Juste APRÈS la mise en production du nouveau site (les boutons et les images pointent vers yachtresearchgroup.com).\r\n\r\n` +
    `Pour chaque e-mail :\r\n 1. Ouvre le fichier .html du dossier « Codes à coller » avec le Bloc-notes (clic droit > Ouvrir avec > Bloc-notes).\r\n` +
    ` 2. Ctrl+A puis Ctrl+C.\r\n 3. Dans Brevo : Automatisations > ouvre l'automatisation > clique l'e-mail > Modifier le contenu > « Coder votre propre e-mail » (ou ouvre l'éditeur HTML).\r\n` +
    ` 4. Efface l'ancien code, Ctrl+V, enregistre. Garde l'objet de l'e-mail ci-dessous.\r\n 5. Envoie-toi un e-mail de test depuis Brevo.\r\n\r\n` +
    `Pour voir un e-mail : double-clic sur le fichier (il s'ouvre dans le navigateur ; les icônes s'affichent une fois le nouveau site en ligne).\r\n` +
    `Tu peux modifier le texte directement dans le code : il est entre les balises <p> ... </p>.\r\n\r\n`;
  for (const a of AUTOMATIONS) {
    const dir = path.join(PC, 'Codes à coller', a.name);
    fs.mkdirSync(dir, { recursive: true });
    guide += `${a.name}  (liste ${a.list})\r\n`;
    a.emails.forEach((id, i) => {
      const e = EMAILS[id];
      fs.writeFileSync(path.join(dir, `E-mail ${i + 1} - ${clean(e.subject)}.html`), render(e, { ...BREVO, base: SITE }), 'utf8');
      guide += `  E-mail ${i + 1} (${i === 0 ? 'tout de suite' : 'après ' + a.waits[i].replace('days', 'jours')})  objet : ${e.subject}\r\n`;
    });
    guide += '\r\n';
  }
  const cdir = path.join(PC, 'Campagnes');
  fs.rmSync(cdir, { recursive: true, force: true }); fs.mkdirSync(cdir, { recursive: true });
  guide += `CAMPAGNES (\u00e0 envoyer une fois : Brevo > Campagnes > Cr\u00e9er > \u00ab Coder votre propre e-mail \u00bb)\r\n`;
  for (const [id, e] of Object.entries(CAMPAIGNS)) {
    fs.writeFileSync(path.join(cdir, `${clean(e.subject)}.html`), render(e, { ...BREVO, base: SITE }), 'utf8');
    guide += `  ${clean(e.subject)}  objet : ${e.subject}\r\n`;
  }
  fs.writeFileSync(path.join(PC, 'LISEZ-MOI.txt'), '\ufeff' + guide, 'utf8');
  console.log('✓ dossier PC : ' + PC);
}
console.log('✓ email-preview : ' + Object.keys(EMAILS).length + ' e-mails + index.html ; gabarit du script mis à jour');
