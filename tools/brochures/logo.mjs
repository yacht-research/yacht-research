// Logo Yacht Research : fond noir → transparent, versions emblème et complète
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = path.join(SITE, 'images', 'uploads', 'yacht-research-logo.png');
const OUT = path.join(SITE, 'images', 'brand');
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });

async function transparent(region) {
  let img = sharp(SRC).removeAlpha();
  if (region) img = img.extract(region);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const m = Math.max(r, g, b);
    const a = Math.max(0, Math.min(255, (m - 28) * 2.2));       // le noir devient transparent
    // on remonte la couleur pour compenser le fond noir pré-multiplié
    const k = a ? Math.min(255 / m, 1.6) : 0;
    out[j] = Math.min(255, r * k); out[j + 1] = Math.min(255, g * k); out[j + 2] = Math.min(255, b * k); out[j + 3] = a;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 1 });
}

// Emblème (arc + bateau + vagues), sans le texte
const emblem = await transparent({ left: 160, top: 210, width: 740, height: 400 });
await emblem.clone().resize({ height: 160 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'emblem.png'));
await emblem.clone().resize({ height: 160 }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, 'emblem.webp'));
// Logo complet
const full = await transparent({ left: 150, top: 200, width: 760, height: 630 });
await full.clone().resize({ width: 520 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'logo-full.png'));
await full.clone().resize({ width: 520 }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, 'logo-full.webp'));
for (const f of fs.readdirSync(OUT)) console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024) + ' Ko');
