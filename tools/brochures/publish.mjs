// ============================================================
// YACHT RESEARCH — Étape 3 : création de la fiche sur le site (en local)
// Prend _travail/<slug>/fiche.json (rempli par Claude à partir de texte.txt,
// relu par toi), optimise les photos choisies et écrit :
//   - images/yachts/<slug>/<n>.webp     (1600 px, ~150-250 Ko)
//   - images/yachts/<slug>/<n>-800.webp (vignette pour les listes)
//   - content/yachts/<slug>.json         (la fiche lue par /yacht/<slug>)
// Puis déplace la brochure dans "2-Traitees".
// Usage : node publish.mjs <slug> [--keep]   (--keep = laisse la brochure en place)
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HERE, '..', '..');
const ROOT = process.env.YR_BROCHURES || path.join(process.env.USERPROFILE, 'Documents', 'Yacht Research - Brochures');
const slugArg = process.argv[2];
const keep = process.argv.includes('--keep');
if (!slugArg) { console.error('Usage : node publish.mjs <dossier-dans-_travail>'); process.exit(1); }

const workDir = path.join(ROOT, '_travail', slugArg);
const fiche = JSON.parse(fs.readFileSync(path.join(workDir, 'fiche.json'), 'utf8'));
const slug = fiche.slug;
if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('slug invalide : ' + slug);

const imgDir = path.join(SITE, 'images', 'yachts', slug);
fs.mkdirSync(imgDir, { recursive: true });

// Règle qualité : une photo de moins de 1400 px de large ne va JAMAIS sur le site.
// Les photos HD fournies à part (dossier "<brochure>/" à côté du PDF, ou _travail/<slug>/hd/) passent en premier.
const MIN_WIDTH = 1400;
const hdDir = path.join(workDir, 'hd');
const candidates = [
  ...(fs.existsSync(hdDir) ? fs.readdirSync(hdDir).filter(f => /\.(jpe?g|png|webp|heic|tiff?)$/i.test(f)).map(f => path.join(hdDir, f)) : []),
  ...(fiche._photos || []).map(f => path.join(workDir, 'photos', f))   // ordre choisi : la 1re = photo principale
];
const photos = [];
for (const p of candidates) {
  const m = await sharp(p).metadata();
  if ((m.width || 0) >= MIN_WIDTH) photos.push(p);
  else console.log(`  ✗ écartée (trop petite, ${m.width}px) : ${path.basename(p)}`);
}
if (!photos.length) {
  fiche.published = false;
  console.log('  ⚠ Aucune photo HD : la fiche est enregistrée mais NON publiée (published: false). Fournir des photos HD.');
}
const urls = [];
for (let i = 0; i < photos.length; i++) {
  const src = photos[i];
  const n = String(i + 1).padStart(2, '0');
  await sharp(src).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(imgDir, `${n}.webp`));
  await sharp(src).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(imgDir, `${n}-800.webp`));
  urls.push(`/images/yachts/${slug}/${n}.webp`);
}

const out = { ...fiche };
delete out._photos; delete out._notes;
out.image = urls[0] || fiche.image || '';
out.thumb = urls[0] ? urls[0].replace('.webp', '-800.webp') : '';
out.gallery = urls.slice(1);
out.updated = new Date().toISOString().slice(0, 10);

fs.writeFileSync(path.join(SITE, 'content', 'yachts', slug + '.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
const kb = fs.readdirSync(imgDir).reduce((a, f) => a + fs.statSync(path.join(imgDir, f)).size, 0) / 1024;
console.log(`✓ content/yachts/${slug}.json — ${urls.length} photos (${Math.round(kb)} Ko au total)`);

if (!keep) {
  const srcName = fs.readFileSync(path.join(workDir, 'source.txt'), 'utf8').trim();
  const from = path.join(ROOT, '1-A traiter', srcName);
  if (fs.existsSync(from)) fs.renameSync(from, path.join(ROOT, '2-Traitees', srcName));
}
