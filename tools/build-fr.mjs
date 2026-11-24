// ============================================================
// YACHT RESEARCH : version française du site (/fr/...)
// Lit chaque page anglaise déjà construite, remplace chaque bloc de texte par sa traduction
// (tools/i18n/fr.json), fait pointer les liens internes vers /fr/... et écrit fr/<page>.html.
// Aucune traduction automatique : si un texte n'a pas de traduction, la construction s'arrête
// et la liste des textes manquants est écrite dans tools/i18n/missing-fr.json.
// Usage : node tools/build-fr.mjs   (après node build.js et node tools/build-pages.mjs)
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from './i18n/node_modules/linkedom/esm/index.js';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DICT_FILE = path.join(SITE, 'tools/i18n/fr.json');
const MISSING_FILE = path.join(SITE, 'tools/i18n/missing-fr.json');
const ORIGIN = 'https://yachtresearchgroup.com';

// pages traduites (les pages de test/démo restent en anglais seulement)
const PAGES = ['index.html', 'listings.html', 'charter.html', 'shared-experiences.html', 'private-jet.html', 'bespoke.html',
  'why-us.html', 'yacht-club-academy.html', 'partnerships.html', 'recruitment.html', 'contact.html', 'yacht-research-form.html',
  'privacy-policy.html', '404.html']
  .concat(fs.readdirSync(path.join(SITE, 'shared-experiences')).filter(f => f.endsWith('.html')).map(f => 'shared-experiences/' + f));

const dict = (await import('./i18n/fr.mjs')).default;
const missing = {}, used = new Set();

// ---- règles pour les textes répétitifs ou issus des données (pas de traduction mot à mot)
const PLACES = [['United Kingdom', 'Royaume-Uni'], ['Turkey', 'Turquie'], ['Greece', 'Grèce'], ['Italy', 'Italie'], ['Thailand', 'Thaïlande'], ['Florida', 'Floride'],
  ['Spain', 'Espagne'], ['Croatia', 'Croatie'], ['Netherlands', 'Pays-Bas'], ['Germany', 'Allemagne'], ['Montenegro', 'Monténégro'], ['Portugal', 'Portugal'],
  ['UAE', 'EAU'], ['Dubai', 'Dubaï'], ['(new)', '(neuf)'], ['Mallorca', 'Majorque'], ['Corsica', 'Corse'], ['Seychelles', 'Seychelles'], ['Aegean Sea', 'mer Égée'], ['South of France', 'Sud de la France'], ['Mediterranean', 'Méditerranée'], ['French Riviera', 'Côte d’Azur']];
const place = s => PLACES.reduce((a, [e, f]) => a.split(e).join(f), s);
const price = s => String(s || '')
    .replace(/(HK\$|AED|USD|€|£|\$)\s?(\d[\d,]*(?:\.\d+)?)/g, function(m, c, n){ return n.replace(/,/g, '\u00a0') + '\u00a0' + c; })
    .replace(/^From (.+?) per hour/, 'À partir de $1 / heure').replace(/^From (.+?) per day/, 'À partir de $1 / jour').replace(/^From (.+?) per week/, 'À partir de $1 / semaine')
    .replace(/^From /, 'À partir de ').replace(/ for (\d+) hours/, ' pour $1 heures').replace(/ per hour/, ' / heure').replace(/ per week/, ' / semaine')
    .replace(/VAT Included/i, 'TVA incluse').replace(/VAT Excluded/i, 'hors TVA').replace(/\(Landed Exc\. Taxes\)/, '(livré, hors taxes)').replace(/\(Exc\. Taxes\)/, '(hors taxes)')
    .replace(/Price on request/, 'Prix sur demande').replace(/\bSold\b/, 'Vendu');
function t(s) { const k = norm(s); return Object.prototype.hasOwnProperty.call(dict, k) && dict[k] !== '' ? (used.add(k), dict[k]) : null; }
// phrases construites sur un même modèle (pages d'expériences, légendes de photos…)
const PATTERNS = [
  [/^(.+) in Dubai photo (\d+)$/, (m, a, n) => t(a) && `${t(a)} à Dubaï, photo ${n}`],
  [/^(.+) photo (\d+)$/, (m, a, n) => t(a) && `${t(a)}, photo ${n}`],
  [/^(.+): details$/, (m, a) => t(a) && `${t(a)} : détails`],
  [/^(.+) in Dubai$/, (m, a) => t(a) && `${t(a)} à Dubaï`],
  [/^(.+) in Dubai from AED (\d+) \| Yacht Research$/, (m, a, n) => t(a) && `${t(a)} à Dubaï dès ${n} AED | Yacht Research`],
  [/^Seats start from AED (\d+) per guest\. Live prices for each departure are shown on this page\.$/, (m, n) => `À partir de ${n} AED par personne. Les prix de chaque départ s’affichent en direct sur cette page.`],
  [/^(.+?), departing from (.+)\.$/, (m, d, p) => t(d) && `${t(d)}, au départ de ${place(p)}.`],
  [/^(.+?) · (Dubai Marina|Dubai Harbour|Dubai Harbour Yacht Club)$/, (m, d, p) => t(d) && `${t(d)} · ${p}`],
  [/^From AED <span data-live-from="">(\d+)<\/span> <small style="font-size:\.5em;color:var\(--mute\)">\/ guest<\/small>$/, (m, n) => `Dès <span data-live-from="">${n}</span> AED <small style="font-size:.5em;color:var(--mute)">/ pers.</small>`],
  [/^From AED (\d+)$/, (m, n) => `Dès ${n} AED`],
  [/^AED (\d+)$/, (m, n) => `${n} AED`],
  [/^All (\d+) photos$/, (m, n) => `Les ${n} photos`],
  [/^How much does the (.+) cost\?$/, (m, a) => { const k = Object.keys(dict).find(x => x.toLowerCase() === a); return k && `Quel est le prix de cette expérience ?`; }],
  [/^<a href="\/">Home<\/a> · <a href="\/shared-experiences">Shared experiences<\/a> · <span>(.+)<\/span>$/, (m, a) => t(a) && `<a href="/">Accueil</a> · <a href="/shared-experiences">Expériences partagées</a> · <span>${t(a)}</span>`],
  [/^(.+) in Dubai: (.+?) from (.+?), from AED (\d+) per guest\. (.+)$/s, (m, a, d, p, n, s) => t(a) && t(d) && t(s) && `${t(a)} à Dubaï : ${t(d)} au départ de ${p}, dès ${n} AED par personne. ${t(s)}`.slice(0, 300)],
  [/^◷ (.+)$/, (m, a) => t(a) && `◷ ${t(a)}`],
  [/^⚲ (Dubai Marina|Dubai Harbour|Dubai Harbour Yacht Club)$/, (m, a) => `⚲ ${a}`],
  [/^⚲ (.+), Dubai · Shared yacht, by the seat$/, (m, a) => `⚲ ${a}, Dubaï · Yacht partagé, à la place`],
  [/^(.+) (yacht charter)$/, (m, a) => `${a} en location`],
  [/^(.+) for sale$/, (m, a) => `${a} à vendre`],
];
function byPattern(key) {
  for (const [re, fn] of PATTERNS) { const m = key.match(re); if (m) { const r = fn(...m); if (r) return r; } }
  return null;
}
// cartes de bateaux (données : nom, chantier, lieu) : seuls les libellés sont traduits
const CARD = { Length: 'Longueur', Guests: 'Invités', Cabins: 'Cabines', Year: 'Année', Location: 'Lieu' };
function cardFr(card) {
  card.querySelectorAll('.specs span').forEach(s => { if (CARD[s.textContent.trim()]) s.textContent = CARD[s.textContent.trim()]; });
  card.querySelectorAll('.bd small').forEach(s => { s.textContent = place(s.textContent); });
  card.querySelectorAll('.specs b').forEach(s => { s.textContent = place(s.textContent); });
  card.querySelectorAll('.tag').forEach(s => { const f = tr(norm(s.textContent), 'cartes'); if (f) s.innerHTML = f; });
  card.querySelectorAll('.price').forEach(p => { const sp = p.querySelector('span'); const tgt = sp || p.firstChild; if (tgt && tgt.nodeType === 3) tgt.nodeValue = price(tgt.nodeValue); else if (sp) sp.innerHTML = price(sp.innerHTML); });
  card.querySelectorAll('img[alt]').forEach(i => { i.setAttribute('alt', byPattern(i.getAttribute('alt')) || i.getAttribute('alt')); i.setAttribute('data-alt-done', ''); });
  card.querySelectorAll('[aria-label]').forEach(b => { const f = tr(b.getAttribute('aria-label'), 'cartes'); if (f) b.setAttribute('aria-label', f); });
  card.setAttribute('data-i18n-done', '');
}

// balises « en ligne » : un bloc qui ne contient que celles-ci se traduit d'un seul tenant (phrase entière)
const INLINE = new Set(['A', 'ABBR', 'B', 'BR', 'EM', 'I', 'S', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'U', 'TIME', 'MARK', 'CODE', 'BDI', 'Q']);
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'TEMPLATE', 'CODE']);
const norm = s => s.replace(/\s+/g, ' ').trim();
const hasWords = s => /[A-Za-z]{2,}/.test(s);
const keep = el => el.getAttribute && (el.getAttribute('translate') === 'no' || /\bnotranslate\b/.test(el.getAttribute('class') || ''));

function tr(key, where) {
  if (Object.prototype.hasOwnProperty.call(dict, key) && dict[key] !== '') { used.add(key); return dict[key]; }
  const p = byPattern(key); if (p) return p;
  (missing[key] = missing[key] || []).includes(where) || missing[key].push(where);
  return null;
}
function inlineOnly(el) {
  for (const c of el.children) { if (!INLINE.has(c.tagName) || keep(c) && false) return false; if (!inlineOnly(c)) return false; }
  return true;
}
function visit(el, where) {
  if (SKIP.has(el.tagName) || keep(el)) return;
  if (el.hasAttribute('data-i18n-done')) { el.removeAttribute('data-i18n-done'); return; }
  if (el.hasAttribute('data-fr')) { el.innerHTML = el.getAttribute('data-fr'); el.removeAttribute('data-fr'); return; }
  el.removeAttribute('data-tr-plain');
  if (el !== el.ownerDocument.body && inlineOnly(el) && hasWords(el.textContent) && [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) {
    const html = el.innerHTML, key = norm(html), fr = tr(key, where);
    if (fr != null) { const lead = html.match(/^\s*/)[0], tail = html.match(/\s*$/)[0]; el.innerHTML = lead + fr + tail; }
    return;
  }
  for (const n of [...el.childNodes]) {
    if (n.nodeType === 3) {
      if (!hasWords(n.nodeValue)) continue;
      const fr = tr(norm(n.nodeValue), where);
      if (fr != null) n.nodeValue = n.nodeValue.match(/^\s*/)[0] + fr + n.nodeValue.match(/\s*$/)[0];
    } else if (n.nodeType === 1) visit(n, where);
  }
}
// liens internes vers la version française (les fichiers, l'API et les pages non traduites restent tels quels)
function frHref(h) {
  if (!h || !h.startsWith('/') || h.startsWith('//')) return h;
  const p = h.split(/[?#]/)[0];
  if (/^\/(images|assets|brochures|videos|api|content|tools|lib|functions|fr)(\/|$)/.test(p) || /\.[a-z0-9]{2,5}$/i.test(p) || /^\/booking-confirmed/.test(p)) return h;
  return '/fr' + (h === '/' ? '/' : h);
}
const enPath = file => '/' + file.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');

let pagesDone = 0;
for (const file of PAGES) {
  let src = fs.readFileSync(path.join(SITE, file), 'utf8');
  const where = file;
  const p = enPath(file), fp = p === '/' ? '/fr/' : '/fr' + p;
  // page anglaise : liens hreflang vers les deux versions (sans toucher au reste du fichier)
  const alt = `<link rel="alternate" hreflang="en" href="${ORIGIN}${p}"><link rel="alternate" hreflang="fr" href="${ORIGIN}${fp}"><link rel="alternate" hreflang="x-default" href="${ORIGIN}${p}">`;
  const src2 = src.replace(/(<link rel="alternate" hreflang="[^"]+" href="[^"]*">)+\n?/g, '').replace('</head>', alt + '\n</head>');
  if (file !== '404.html' && src2 !== src) { fs.writeFileSync(path.join(SITE, file), src2); src = src2; }
  const { document } = parseHTML(src);
  document.documentElement.setAttribute('lang', 'fr');
  // en-tête : titre, descriptions, adresses
  const t = document.querySelector('title'); if (t) { const fr = tr(norm(t.textContent), where); if (fr) t.textContent = fr; }
  document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"],meta[property="og:image:alt"]').forEach(m => {
    const fr = tr(norm(m.getAttribute('content') || ''), where); if (fr) m.setAttribute('content', fr);
  });
  document.querySelectorAll('link[rel="canonical"],meta[property="og:url"]').forEach(m => {
    const a = m.hasAttribute('href') ? 'href' : 'content'; m.setAttribute(a, ORIGIN + fp);
  });
  document.querySelectorAll('meta[property="og:locale"]').forEach(m => m.setAttribute('content', 'fr_FR'));
  // corps de page
  document.querySelectorAll('a.card, .card').forEach(cardFr);
  visit(document.body, where);
  // textes dans les attributs
  document.querySelectorAll('[alt],[placeholder],[aria-label],[title]').forEach(el => {
    if (el.hasAttribute('data-alt-done')) { el.removeAttribute('data-alt-done'); return; }
    if (el.closest('[translate="no"],.notranslate') && !el.matches('img')) return;
    for (const a of ['alt', 'placeholder', 'aria-label', 'title']) {
      const v = el.getAttribute(a); if (!v || !hasWords(v) || el.tagName === 'TITLE') continue;
      const fr = tr(norm(v), where); if (fr) el.setAttribute(a, fr);
    }
  });
  document.querySelectorAll('a[href],form[action]').forEach(a => { const at = a.tagName === 'FORM' ? 'action' : 'href'; a.setAttribute(at, frHref(a.getAttribute(at))); });
  // sélecteur de langue : sur la page FR il ramène vers la page anglaise
  document.querySelectorAll('.lang-sw').forEach(a => { a.setAttribute('href', p); a.setAttribute('hreflang', 'en'); a.setAttribute('lang', 'en');
    if (a.classList.contains('menu-lang')) a.innerHTML = 'English <em>version</em>'; else { a.textContent = 'EN'; a.setAttribute('aria-label', 'English version'); } });
  // les deux versions se signalent l'une l'autre à Google
  const head = document.querySelector('head');
  head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(l => l.remove());
  head.insertAdjacentHTML('beforeend', `<link rel="alternate" hreflang="en" href="${ORIGIN}${p}"><link rel="alternate" hreflang="fr" href="${ORIGIN}${fp}"><link rel="alternate" hreflang="x-default" href="${ORIGIN}${p}">`);
  fs.mkdirSync(path.dirname(path.join(SITE, 'fr', file)), { recursive: true });
  fs.writeFileSync(path.join(SITE, 'fr', file), '<!DOCTYPE html>\n' + document.documentElement.outerHTML + '\n');
  pagesDone++;
}

// en-tête et pied de page français pour les fiches yachts (functions/fr/yacht/[slug].js)
{
  const shell = await import('file:///' + path.join(SITE, 'lib/shell.js').replace(/\\/g, '/') + '?v=' + Date.now());
  const part = html => {
    const { document } = parseHTML('<!DOCTYPE html><html lang="fr"><head></head><body>' + html + '</body></html>');
    visit(document.body, 'lib/shell.js');
    document.querySelectorAll('[alt],[aria-label]').forEach(el => { for (const a of ['alt', 'aria-label']) { const v = el.getAttribute(a); if (v && hasWords(v)) { const f = tr(norm(v), 'lib/shell.js'); if (f) el.setAttribute(a, f); } } });
    document.querySelectorAll('a[href]').forEach(a => a.setAttribute('href', frHref(a.getAttribute('href'))));
    document.querySelectorAll('.lang-sw').forEach(a => { a.setAttribute('hreflang', 'en'); a.setAttribute('lang', 'en'); if (a.classList.contains('menu-lang')) a.innerHTML = 'English <em>version</em>'; else { a.textContent = 'EN'; a.setAttribute('aria-label', 'English version'); } });
    return document.body.innerHTML;
  };
  fs.writeFileSync(path.join(SITE, 'lib/shell-fr.js'), '// En-tête et pied de page en français (généré par tools/build-fr.mjs : ne pas modifier à la main)\n' +
    'export const NAV_FR = ' + JSON.stringify(part(shell.NAV)) + ';\nexport const FOOTER_FR = ' + JSON.stringify(part(shell.FOOTER)) + ';\n');
}

const nMissing = Object.keys(missing).length;
fs.writeFileSync(MISSING_FILE, JSON.stringify(Object.fromEntries(Object.entries(missing).map(([k, w]) => [k, { fr: '', pages: w }])), null, 1) + '\n');
const unused = Object.keys(dict).filter(k => !used.has(k) && !k.startsWith('@'));
console.log(`✓ ${pagesDone} pages FR · ${Object.keys(dict).length} traductions · ${nMissing} manquante(s)` + (unused.length ? ` · ${unused.length} inutilisée(s)` : ''));
if (nMissing) { console.error(`✗ Textes sans traduction : voir tools/i18n/missing-fr.json`); process.exitCode = 1; }
