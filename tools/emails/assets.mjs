// Images des e-mails (PNG / JPG : les e-mails ne lisent ni le SVG ni le WebP partout)
// Écrit images/email/*. Usage : node tools/emails/assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sharp = createRequire(path.join(SITE_DIR, 'tools/brochures/x.js'))('sharp');
const OUT = path.join(SITE_DIR, 'images/email');
fs.mkdirSync(OUT, { recursive: true });

const GOLD = '#e6cf8a';
// Icônes 24x24 dessinées au trait
const ICONS = {
  web: `<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.5 9h17M3.5 15h17"/>`,
  instagram: `<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="${GOLD}" stroke="none"/>`,
  whatsapp: `<path d="M4.6 19.4l1.1-3.9A8.4 8.4 0 1 1 8.8 18.6z"/><path d="M9.3 8.2c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.4.8 1 1.5 1.7 2 .5.4 1 .6 1.4.8.2.1.4 0 .5-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.2.3.4 0 .5-.2 1.1-.6 1.4-.5.4-1.2.6-1.9.5-1.1-.2-2.6-.8-3.9-2-1.2-1.1-2-2.4-2.3-3.4-.3-.9-.2-1.7.4-2.3z" fill="${GOLD}" stroke="none"/>`,
  link: `<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>`,
};
for (const [name, body] of Object.entries(ICONS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
<circle cx="48" cy="48" r="46.5" fill="#151412" stroke="#c9a84c" stroke-opacity=".55" stroke-width="2"/>
<g transform="translate(26 26) scale(1.8333)" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, `ic-${name}.png`));
}

// Logo Yacht Club Academy (blanc) en PNG
await sharp(fs.readFileSync(path.join(SITE_DIR, 'images/brand/yca-logo-white.svg')), { density: 150 })
  .resize({ width: 264 }).png().toFile(path.join(OUT, 'yca-logo.png'));

// Photo des expériences (celle de la carte « Experiences » de l'accueil) en JPG
await sharp(fs.readFileSync(path.join(SITE_DIR, 'images/experiences/superyacht-experience/01.webp')))
  .resize({ width: 560, height: 360, fit: 'cover' }).jpeg({ quality: 74, mozjpeg: true }).toFile(path.join(OUT, 'experiences.jpg'));

console.log('✓ images/email :', fs.readdirSync(OUT).join(', '));
