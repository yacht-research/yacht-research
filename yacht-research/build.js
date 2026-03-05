// ============================================================
// YACHT RESEARCH — CMS Content Loader
// Ce script lit les fichiers JSON du CMS et met à jour le HTML
// Il s'exécute automatiquement à chaque déploiement Netlify
// ============================================================

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

// ─── LIT UN JSON ────────────────────────────────────────────
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'content', file), 'utf8'));
  } catch (e) {
    console.warn(`⚠️  Could not read ${file}:`, e.message);
    return {};
  }
}

// ─── LIT TOUS LES YACHTS ────────────────────────────────────
function readYachts() {
  const dir = path.join(ROOT, 'content', 'yachts');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    .filter(y => y.published !== false);
}

// ─── GÉNÈRE LES CARTES YACHT ────────────────────────────────
function generateYachtCards(yachts) {
  return yachts.map(y => `
    <div class="yacht-card reveal">
      <div class="yacht-img">
        <img src="${y.image}" alt="${y.title}">
        <div class="yacht-badge">${y.badge}</div>
      </div>
      <div class="yacht-info">
        <h3 class="yacht-name">${y.title}</h3>
        <div class="yacht-specs">
          <div class="yacht-spec"><span class="val">${y.length}</span><span class="key">Length</span></div>
          <div class="yacht-spec"><span class="val">${y.year}</span><span class="key">Built</span></div>
          <div class="yacht-spec"><span class="val">${y.location}</span><span class="key">Location</span></div>
        </div>
        <div class="yacht-price">
          <span>${y.price}</span>
          <a href="#contact">Enquire →</a>
        </div>
      </div>
    </div>`).join('\n');
}

// ─── GÉNÈRE LES PRÉSENCES ABOUT ─────────────────────────────
function generatePresences(presences) {
  return (presences || []).map(p => `
    <div class="presence-item">
      <div class="city">${p.city}</div>
      <div class="region">${p.region}</div>
    </div>`).join('\n');
}

// ─── MAIN ────────────────────────────────────────────────────
function build() {
  console.log('🔨 Building Yacht Research site from CMS content...');

  // Charge tous les contenus
  const hero    = readJSON('hero.json');
  const why     = readJSON('why.json');
  const about   = readJSON('about.json');
  const contact = readJSON('contact.json');
  const seo     = readJSON('seo.json');
  const yachts  = readYachts();

  // Lit l'HTML source
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  // ── SEO ──
  if (seo.title)       html = html.replace(/<title>.*?<\/title>/, `<title>${seo.title}</title>`);
  if (seo.description) html = html.replace(/(<meta name="description" content=")([^"]*)(")/, `$1${seo.description}$3`);

  // ── HERO ──
  if (hero.eyebrow)    html = html.replace(/Dubai · Paris · Mediterranean · Middle East · USA/, hero.eyebrow);
  if (hero.title_line1 && hero.title_line2) {
    html = html.replace(
      /The Art of<br><em>Effortless Yachting<\/em>/,
      `${hero.title_line1}<br><em>${hero.title_line2}</em>`
    );
  }
  if (hero.subtitle) {
    html = html.replace(
      /International yacht brokerage specializing in luxury yacht sales, charters, and private acquisitions/,
      hero.subtitle
    );
  }
  if (hero.hero_image) {
    html = html.replace(
      /url\('https:\/\/images\.unsplash\.com\/photo-1567899378494[^']+'\)/,
      `url('${hero.hero_image}')`
    );
  }

  // ── ABOUT QUOTE ──
  if (about.quote) {
    html = html.replace(
      /"You enjoy your yacht — we take care of everything else\."/,
      `"${about.quote}"`
    );
  }

  // ── CONTACT ──
  if (contact.city_main) {
    html = html.replace(/<div class="val">Dubai, UAE<\/div>/, `<div class="val">${contact.city_main}</div>`);
  }
  if (contact.city_eu) {
    html = html.replace(/<div class="val">Paris, France<\/div>/, `<div class="val">${contact.city_eu}</div>`);
  }
  if (contact.linktree) {
    html = html.replace(/linktr\.ee\/yacht_research/g, contact.linktree.replace('https://', ''));
    html = html.replace(/href="https:\/\/linktr\.ee\/yacht_research"/g, `href="${contact.linktree}"`);
  }

  // ── YACHTS FOR SALE ──
  if (yachts.length > 0) {
    const cards = generateYachtCards(yachts);
    html = html.replace(
      /(<div class="yachts-grid">)([\s\S]*?)(<\/div>\s*<!-- SUBMIT YACHT)/,
      `$1\n${cards}\n  </div>\n  <!-- SUBMIT YACHT`
    );
  }

  // ── ABOUT PRESENCES ──
  if (about.presences && about.presences.length > 0) {
    const presHTML = generatePresences(about.presences);
    html = html.replace(
      /(<div class="about-presence">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="about-visual">)/,
      `$1\n${presHTML}\n      </div>\n    </div>\n    <div class="about-visual">`
    );
  }

  // Écrit le fichier final
  fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
  console.log(`✅ Build complete! ${yachts.length} yacht(s) loaded.`);
}

build();
