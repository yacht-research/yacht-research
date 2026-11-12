// Planche-contact des photos extraites d'un bateau : _travail/<slug>/planche.jpg
// Usage : node contact-sheet.mjs <dossier _travail/slug>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = process.argv[2];
const photos = fs.readdirSync(path.join(dir, 'photos')).filter(f => f.endsWith('.jpg'));
const T = 260, cols = 4, rows = Math.ceil(photos.length / cols);
const tiles = await Promise.all(photos.map(async (f, i) => {
  const img = await sharp(path.join(dir, 'photos', f)).resize(T, T, { fit: 'contain', background: '#222' }).toBuffer();
  const label = Buffer.from(`<svg width="${T}" height="22"><rect width="100%" height="100%" fill="#000" opacity=".7"/><text x="6" y="16" font-size="14" fill="#fff" font-family="Arial">${f}</text></svg>`);
  return [{ input: img, left: (i % cols) * T, top: Math.floor(i / cols) * T }, { input: label, left: (i % cols) * T, top: Math.floor(i / cols) * T }];
}));
await sharp({ create: { width: cols * T, height: Math.max(rows, 1) * T, channels: 3, background: '#111' } })
  .composite(tiles.flat()).jpeg({ quality: 80 }).toFile(path.join(dir, 'planche.jpg'));
console.log('planche.jpg →', dir);
