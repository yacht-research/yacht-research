// ============================================================
// YACHT RESEARCH — Build Script
// Scanne automatiquement content/yachts/ et génère index.json
// S'exécute à chaque déploiement Netlify — ne pas modifier
// ============================================================

const fs   = require('fs');
const path = require('path');

const yachtsDir = path.join(__dirname, 'content', 'yachts');
const indexFile = path.join(yachtsDir, 'index.json');

// Crée le dossier s'il n'existe pas
if (!fs.existsSync(yachtsDir)) {
  fs.mkdirSync(yachtsDir, { recursive: true });
  console.log('📁 Created content/yachts/');
}

// Liste tous les .json sauf index.json, sauf les .md (créés par erreur)
const yachtFiles = fs.readdirSync(yachtsDir)
  .filter(f => f.endsWith('.json') && f !== 'index.json')
  .sort();

// Génère index.json
fs.writeFileSync(indexFile, JSON.stringify({ yachts: yachtFiles }, null, 2));

console.log('✅ Yacht index generated — ' + yachtFiles.length + ' yacht(s):');
yachtFiles.forEach(f => console.log('   • ' + f));
