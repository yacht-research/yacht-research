// ============================================================
// YACHT RESEARCH — Build (Cloudflare Pages : commande "node build.js")
// Génère content/yachts/index.json : UN seul fichier avec le résumé de
// tous les yachts publiés. Les pages d'accueil / listings / charter le
// lisent en une requête au lieu d'interroger GitHub puis chaque fiche.
// Sans dépendance : tourne aussi bien en local que sur Cloudflare.
// ============================================================
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'content', 'yachts');
const optMapFile = path.join(__dirname, 'images', 'opt', 'map.json');
const optMap = fs.existsSync(optMapFile) ? JSON.parse(fs.readFileSync(optMapFile, 'utf8')) : {};

function toEur(p) {
  if (!p) return null;
  const s = String(p).toUpperCase();
  // premier montant seulement : "AED 3,000 for 4 hours" → 3000 ; "€ 150 000" → 150000
  const m = s.replace(/\(.*?\)/g, '').match(/\d{1,3}(?:[ ,  ]\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/);
  const n = m ? parseFloat(m[0].replace(/[ ,  ]/g, '')) : 0;
  if (!n) return null;
  if (s.includes('AED') || s.includes('DH')) return Math.round(n * 0.25);
  if (s.includes('£') || s.includes('GBP')) return Math.round(n * 1.17);
  if (s.includes('$') || s.includes('USD')) return Math.round(n * 0.92);
  return n;
}
function pick(specs, re) {
  if (!specs) return '';
  const k = Object.keys(specs).find(k => re.test(k));
  return k ? String(specs[k]) : '';
}

const yachts = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json').sort()) {
  let y;
  try { y = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { console.warn('JSON invalide :', f); continue; }
  if (y.published === false) continue;
  const slug = f.replace(/\.json$/, '');
  const badge = y.badge || '';
  const type = y.listing_type || (/charter/i.test(badge) ? 'charter' : 'sale');
  const opt = optMap[y.image] || {};
  // Photos des cartes à faire défiler (vignettes 800 px quand elles existent) : yachts à vendre
  const small = u => { const t = String(u || '').replace(/\.webp$/, '-800.webp'); return t !== u && fs.existsSync(path.join(__dirname, t)) ? t : u; };
  const photos = [y.thumb || y.image, ...(y.gallery || []).map(small)].filter((u, i, a) => u && a.indexOf(u) === i).slice(0, 10);
  const guests = pick(y.specs, /guest/i);
  const cabinsField = pick(y.specs, /^cabins?$/i);
  yachts.push({
    slug, type,
    title: y.title || slug,
    builder: y.builder || '',
    model: y.model || '',
    badge,
    image: opt.full || y.image || '',
    thumb: y.thumb || opt.thumb || y.image || '',
    ...(photos.length > 1 ? { photos } : {}),
    length: y.length || '',
    year: y.year || '',
    location: y.location || '',
    price: y.price || '',
    original_price: y.original_price || '',
    direct_price: directPrice(y),
    price_eur: toEur(y.price),
    guests: (guests.match(/\d+/) || [''])[0],
    cabins: (guests.match(/(\d+)\s*cabin/i) || [])[1] || (cabinsField.match(/\d+/) || [''])[0],
    updated: y.updated || '',
    // fiche française écrite (content/i18n/yachts/<slug>.json) : la page /fr/yacht/<slug> existe
    ...(fs.existsSync(path.join(__dirname, 'content', 'i18n', 'yachts', slug + '.json')) ? { fr: true } : {})
  });
}
// Charters de la flotte partenaire (tarif B2B) : notre prix = net + 15 %, et le net = prix public −20 %
// → prix public en direct = notre prix ÷ 1,15 ÷ 0,8, affiché barré (sans nommer l'opérateur). Même calcul dans lib/yacht-page.js
function directPrice(y) {
  if (y.listing_type !== 'charter' || !/B2B/.test(y.price_note || '')) return '';
  const m = String(y.price || '').match(/^From AED ([\d,]+) per hour$/);
  if (!m) return '';
  const n = Math.round(Number(m[1].replace(/,/g, '')) / 1.15 / 0.8 / 10) * 10;
  return 'AED ' + n.toLocaleString('en-US') + ' per hour';
}
const noFr = yachts.filter(y => !y.fr).map(y => y.slug);
if (noFr.length) console.warn('⚠ Sans version française (la page FR renvoie vers l’anglais) : ' + noFr.join(', '));
// Les plus récents d'abord, puis du plus cher au moins cher
yachts.sort((a, b) => (b.updated || '').localeCompare(a.updated || '') || (b.price_eur || 0) - (a.price_eur || 0));

fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ generated: new Date().toISOString(), count: yachts.length, yachts }, null, 1));
console.log('✅ content/yachts/index.json : ' + yachts.length + ' yacht(s) publiés');
