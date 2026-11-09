// ============================================================
// YACHT RESEARCH — Optimisation des images déjà en ligne
// Pour chaque image de images/uploads (PNG/JPG lourds), crée :
//   images/opt/<nom>.webp      (1600 px max)
//   images/opt/<nom>-800.webp  (vignette)
// puis remplace dans content/yachts/*.json les chemins /images/uploads/...
// par leur version optimisée. Les originaux restent en place (le CMS s'en sert).
// Usage : node optimize-uploads.mjs
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { slugify } from './extract.mjs';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const UP = path.join(SITE, 'images', 'uploads');
const OPT = path.join(SITE, 'images', 'opt');
fs.mkdirSync(OPT, { recursive: true });

const map = {};
let before = 0, after = 0;
for (const f of fs.readdirSync(UP)) {
  if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
  const src = path.join(UP, f);
  const base = slugify(f);
  const full = path.join(OPT, base + '.webp'), thumb = path.join(OPT, base + '-800.webp');
  if (!fs.existsSync(full)) await sharp(src).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 76 }).toFile(full);
  if (!fs.existsSync(thumb)) await sharp(src).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 70 }).toFile(thumb);
  before += fs.statSync(src).size; after += fs.statSync(full).size;
  map['/images/uploads/' + f] = { full: '/images/opt/' + base + '.webp', thumb: '/images/opt/' + base + '-800.webp' };
}
fs.writeFileSync(path.join(OPT, 'map.json'), JSON.stringify(map, null, 2));

// Réécrit les fiches
const YD = path.join(SITE, 'content', 'yachts');
for (const f of fs.readdirSync(YD).filter(f => f.endsWith('.json') && f !== 'index.json')) {
  const p = path.join(YD, f), y = JSON.parse(fs.readFileSync(p, 'utf8'));
  let changed = false;
  const swap = u => { const m = map[u] || map[decodeURI(u || '')]; if (m) { changed = true; return m.full; } return u; };
  if (y.image) { const m = map[y.image]; if (m) { y.image = m.full; y.thumb = y.thumb || m.thumb; changed = true; } }
  if (Array.isArray(y.gallery)) y.gallery = y.gallery.map(g => typeof g === 'string' ? swap(g) : g);
  if (changed) fs.writeFileSync(p, JSON.stringify(y, null, 2) + '\n', 'utf8');
}
console.log(`✓ ${Object.keys(map).length} images : ${Math.round(before / 1024)} Ko → ${Math.round(after / 1024)} Ko`);
