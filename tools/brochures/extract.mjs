// ============================================================
// YACHT RESEARCH — Étape 1 : extraction des brochures
// Lit chaque PDF / image de "1-A traiter", et produit dans "_travail/<slug>/" :
//   - texte.txt   : tout le texte de la brochure, page par page
//   - pages/      : aperçu de chaque page (pour vérifier les plans, tableaux)
//   - photos/     : les photos haute définition contenues dans le PDF
// Usage : node extract.mjs ["C:\chemin\vers\Yacht Research - Brochures"]
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as mupdf from 'mupdf';
import sharp from 'sharp';

const ROOT = process.argv[2] || path.join(process.env.USERPROFILE, 'Documents', 'Yacht Research - Brochures');
const INBOX = path.join(ROOT, '1-A traiter');
const WORK = path.join(ROOT, '_travail');
const MIN_PHOTO_WIDTH = 400;     // ignore logos, icônes, petites vignettes
const MIN_PHOTO_BYTES = 40_000;

export function slugify(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\.(pdf|jpe?g|png|webp)$/i, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function extractPdf(file, outDir) {
  const doc = mupdf.Document.openDocument(fs.readFileSync(file), 'application/pdf');
  const pages = doc.countPages();
  let text = '';
  const seen = new Set();
  let photoCount = 0;
  fs.mkdirSync(path.join(outDir, 'pages'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'photos'), { recursive: true });

  for (let i = 0; i < pages; i++) {
    const page = doc.loadPage(i);
    const st = page.toStructuredText('preserve-whitespace,preserve-images');
    text += `\n===== PAGE ${i + 1} =====\n` + st.asText();

    // Aperçu de page (léger) pour relecture
    const prev = page.toPixmap(mupdf.Matrix.scale(1, 1), mupdf.ColorSpace.DeviceRGB, false, true);
    await sharp(Buffer.from(prev.asPNG())).jpeg({ quality: 70 })
      .toFile(path.join(outDir, 'pages', `page-${String(i + 1).padStart(2, '0')}.jpg`));

    // Photos embarquées
    const images = [];
    st.walk({ onImageBlock(bbox, matrix, image) { images.push(image); } });
    for (const image of images) {
      const w = image.getWidth(), h = image.getHeight();
      if (w < MIN_PHOTO_WIDTH || h < 250) continue;
      const ratio = w / h;
      if (ratio > 3 || ratio < 0.4) continue;               // bandeaux, frises de vignettes
      const png = Buffer.from(image.toPixmap().asPNG());
      // aplats de couleur (fonds de page du gabarit) : très peu de variation
      const stats = await sharp(png).stats();
      if (stats.entropy < 5.5) continue;
      const hash = crypto.createHash('md5').update(png).digest('hex');
      if (seen.has(hash)) continue;
      seen.add(hash);
      const name = `p${String(i + 1).padStart(2, '0')}-${String(++photoCount).padStart(2, '0')}.jpg`;
      const out = path.join(outDir, 'photos', name);
      await sharp(png).flatten({ background: '#ffffff' }).jpeg({ quality: 88 }).toFile(out);
      if (fs.statSync(out).size < MIN_PHOTO_BYTES) fs.unlinkSync(out);
    }
  }
  fs.writeFileSync(path.join(outDir, 'texte.txt'), text, 'utf8');
  return { pages, photos: fs.readdirSync(path.join(outDir, 'photos')).length };
}

async function main() {
  if (!fs.existsSync(INBOX)) throw new Error('Dossier introuvable : ' + INBOX);
  const files = fs.readdirSync(INBOX).filter(f => /\.(pdf|jpe?g|png|webp)$/i.test(f));
  if (!files.length) { console.log('Aucune brochure dans', INBOX); return; }

  // Les images seules (pas de PDF) sont regroupées par préfixe de nom : "riva-76_1.jpg", "riva-76_2.jpg"…
  for (const f of files) {
    const src = path.join(INBOX, f);
    const isPdf = /\.pdf$/i.test(f);
    const slug = isPdf ? slugify(f) : slugify(f.replace(/[_ -]?\d+\.(jpe?g|png|webp)$/i, ''));
    const outDir = path.join(WORK, slug);
    fs.mkdirSync(outDir, { recursive: true });
    if (isPdf) {
      const r = await extractPdf(src, outDir);
      console.log(`✓ ${f} → _travail/${slug}  (${r.pages} pages, ${r.photos} photos)`);
    } else {
      fs.mkdirSync(path.join(outDir, 'photos'), { recursive: true });
      await sharp(src).jpeg({ quality: 88 }).toFile(path.join(outDir, 'photos', slugify(f) + '.jpg'));
      console.log(`✓ ${f} → _travail/${slug}/photos`);
    }
    fs.writeFileSync(path.join(outDir, 'source.txt'), f, 'utf8');
    // Photos HD fournies à part : dossier du même nom que le PDF (ex. "Riva 76.pdf" + dossier "Riva 76")
    const hdSrc = path.join(INBOX, f.replace(/\.pdf$/i, ''));
    if (isPdf && fs.existsSync(hdSrc) && fs.statSync(hdSrc).isDirectory()) {
      const hdDst = path.join(outDir, 'hd');
      fs.mkdirSync(hdDst, { recursive: true });
      let n = 0;
      for (const p of fs.readdirSync(hdSrc).filter(p => /\.(jpe?g|png|webp|tiff?)$/i.test(p)).sort()) { fs.copyFileSync(path.join(hdSrc, p), path.join(hdDst, p)); n++; }
      console.log(`  + ${n} photo(s) HD depuis le dossier « ${path.basename(hdSrc)} »`);
    }
  }
}

// Ne s'exécute que lancé directement (pas quand un autre script importe slugify)
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
  main().catch(e => { console.error('Erreur :', e.message); process.exit(1); });
}
