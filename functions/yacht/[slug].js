// ============================================================
// Cloudflare Pages Function : page d'un yacht  /yacht/<slug>
// Lit content/yachts/<slug>.json et rend la page au design du site.
// ============================================================
import { NAV, FOOTER, HEAD_ASSETS, SCRIPTS } from '../../lib/shell.js';

export async function onRequest(context) {
  const slug = context.params.slug;
  const origin = new URL(context.request.url).origin;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return notFound();

  let y = null;
  try {
    const res = await context.env.ASSETS.fetch(new URL('/content/yachts/' + slug + '.json', context.request.url));
    if (res.ok) y = await res.json();
  } catch (e) {}
  if (!y || y.published === false) return notFound();

  return new Response(renderYachtPage(y, slug, 'https://yachtresearchgroup.com', origin), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'index, follow',
      // 5 min dans le navigateur, 1 h dans le cache Cloudflare
      'Cache-Control': 'public, max-age=300, s-maxage=3600'
    }
  });
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function abs(u, base) {
  if (!u) return '';
  return /^https?:/.test(u) ? u : base + encodeURI(u.startsWith('/') ? u : '/' + u);
}
function badgeLabel(b, isCharter) {
  b = (b || '').toLowerCase();
  if (isCharter) return 'Charter';
  if (b.includes('reduc') || b.includes('price')) return 'Price reduced';
  if (b.includes('off')) return 'Off market';
  if (b.includes('new')) return 'New listing';
  return 'For sale';
}
function currency(p) {
  if (!p) return 'EUR';
  if (/£|GBP/.test(p)) return 'GBP';
  if (/AED/.test(p)) return 'AED';
  if (/\$|USD/.test(p)) return 'USD';
  return 'EUR';
}
function titleHTML(t) {
  if (t.indexOf(' - ') > -1) {
    const [name, model] = t.split(' - ');
    const n = name.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());
    return '<span class="acc">' + esc(n) + '</span><small class="yt-model">' + esc(model) + '</small>';
  }
  const p = t.split(' ');
  return p.length < 2 ? esc(t) : esc(p[0]) + ' <span class="acc">' + esc(p.slice(1).join(' ')) + '</span>';
}
function pick(specs, re) {
  if (!specs) return '';
  const k = Object.keys(specs).find(k => re.test(k));
  return k ? String(specs[k]) : '';
}

function renderYachtPage(y, slug, base, origin) {
  const title = y.title || 'Yacht';
  const isCharter = (y.listing_type === 'charter') || /charter/i.test(y.badge || '');
  const what = isCharter ? 'Charter' : 'Sale';
  const location = y.location || '';
  const canonical = base + '/yacht/' + slug;
  const image = abs(y.image, base) || base + '/images/uploads/hero-yacht-BzzzVtkx.jpg';
  const gallery = (Array.isArray(y.gallery) ? y.gallery : []).map(g => typeof g === 'string' ? g : (g && g.url) || '').filter(Boolean);
  const pageTitle = y.seo_title || (title + ' for ' + what + (location ? ' in ' + location.split(',')[0] : '') + ' | Yacht Research');
  const metaDesc = y.seo_description || (title + ' for ' + what.toLowerCase() + [y.year, y.length, location].filter(Boolean).map(s => ' · ' + s).join('') + '. ' + (y.price ? (isCharter ? 'Rate: ' : 'Asking price: ') + y.price + '. ' : '') + 'Yacht Research, international yacht brokerage.');
  const description = y.description || (title + ' is ' + (y.year ? 'a ' + y.year + ' ' : 'a ') + 'yacht' + (y.length ? ' of ' + y.length : '') + ' available for ' + what.toLowerCase() + ' through Yacht Research' + (location ? ', located in ' + location : '') + '. Contact our team for the full specification and viewing arrangements.');
  const guests = pick(y.specs, /guest/i);
  const price = y.price || 'Price on request';

  // Données structurées (Google)
  const digits = (y.price || '').replace(/\(.*?\)/g, '').replace(/[^0-9]/g, '');
  const offer = { '@type': 'Offer', priceCurrency: currency(y.price), availability: 'https://schema.org/InStock', url: canonical, seller: { '@type': 'Organization', name: 'Yacht Research', url: base } };
  if (digits && !isCharter) offer.price = Number(digits);
  const props = y.specs && typeof y.specs === 'object'
    ? Object.keys(y.specs).map(k => ({ '@type': 'PropertyValue', name: k, value: String(y.specs[k]) }))
    : [{ '@type': 'PropertyValue', name: 'Length', value: y.length || '' }, { '@type': 'PropertyValue', name: 'Year Built', value: y.year || '' }];
  props.push({ '@type': 'PropertyValue', name: 'Location', value: location });
  const schema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name: title, description: metaDesc, url: canonical,
    image: [image].concat(gallery.map(g => abs(g, base))),
    brand: { '@type': 'Brand', name: y.builder || 'Yacht Research' }, offers: offer, additionalProperty: props
  }).replace(/</g, '\\u003c');
  const crumbs = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' },
      { '@type': 'ListItem', position: 2, name: isCharter ? 'Charter' : 'Yachts for sale', item: base + (isCharter ? '/charter' : '/listings') },
      { '@type': 'ListItem', position: 3, name: title, item: canonical }]
  });

  const keySpecs = [
    ['Length', (y.length || '').split('/')[0].trim()],
    ['Year', y.year],
    guests ? ['Guests', guests] : ['Builder', y.builder],
    ['Location', location.split(',')[0]]
  ].filter(s => s[1]);

  const specsHTML = y.specs && typeof y.specs === 'object' && Object.keys(y.specs).length
    ? '<section class="yp-sec"><p class="eyebrow rv">Specifications</p><h2 class="t-l split-words yp-h2">Technical <span class="acc">details</span></h2><div class="yp-specs rv">' +
      Object.keys(y.specs).filter(k => y.specs[k]).map(k => '<div><span>' + esc(k) + '</span><b>' + esc(y.specs[k]) + '</b></div>').join('') + '</div></section>'
    : '';
  const hlHTML = Array.isArray(y.highlights) && y.highlights.length
    ? '<div class="yp-hl rv"><p class="eyebrow">Highlights</p><ul>' + y.highlights.map(h => '<li>' + esc(h) + '</li>').join('') + '</ul></div>' : '';
  const galHTML = gallery.length
    ? '<section class="yp-sec" style="padding-right:0"><div class="head" style="padding-right:var(--pad)"><div><p class="eyebrow rv">Gallery</p><h2 class="t-l split-words yp-h2">On <span class="acc">board</span></h2></div><div class="rail-ui"><button data-prev aria-label="Previous">←</button><button data-next aria-label="Next">→</button></div></div>' +
      '<div class="rail yp-gal">' + [y.image].concat(gallery).map((g, i) => '<button class="yp-shot" data-full="' + esc(g) + '"><img src="' + esc(g) + '" alt="' + esc(title) + ' photo ' + (i + 1) + '" loading="lazy"></button>').join('') + '</div><div class="progress" style="margin-right:var(--pad)"><i></i></div></section>'
    : '';
  const brochure = y.brochure ? '<a href="' + esc(y.brochure) + '" class="btn btn-ghost" target="_blank" rel="noopener">Brochure <i>↓</i></a>' : '';
  const enquire = '/yacht-research-form?yacht=' + encodeURIComponent(title);

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' + esc(pageTitle) + '</title><meta name="description" content="' + esc(metaDesc) + '"><meta name="robots" content="index, follow"><meta name="theme-color" content="#070707">' +
    '<link rel="canonical" href="' + canonical + '"><link rel="icon" type="image/x-icon" href="/favicon.ico"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">' +
    '<meta property="og:type" content="product"><meta property="og:url" content="' + canonical + '"><meta property="og:title" content="' + esc(pageTitle) + '"><meta property="og:description" content="' + esc(metaDesc) + '"><meta property="og:image" content="' + esc(image) + '"><meta property="og:site_name" content="Yacht Research">' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="' + esc(image) + '">' +
    '<script type="application/ld+json">' + schema + '</script><script type="application/ld+json">' + crumbs + '</script>' +
    '<link rel="preload" as="image" href="' + esc(y.image || image) + '" fetchpriority="high">' + HEAD_ASSETS + '</head><body class="yp">' +
    NAV +
    '<header class="yp-hero"><div class="hero-media" data-par="0.2"><img src="' + esc(y.image || image) + '" alt="' + esc(title) + ' ' + esc(y.year || '') + ' for ' + what.toLowerCase() + '" fetchpriority="high"></div>' +
    '<div class="yp-hero-in"><p class="yp-crumb rv"><a href="/">Home</a> · <a href="' + (isCharter ? '/charter' : '/listings') + '">' + (isCharter ? 'Charter' : 'Yachts for sale') + '</a></p>' +
    '<span class="tag yp-tag">' + badgeLabel(y.badge, isCharter) + '</span>' +
    '<h1 class="t-l yp-title">' + titleHTML(title) + '</h1>' +
    '<p class="yp-sub rv">' + [y.year, y.length, location].filter(Boolean).map(esc).join(' · ') + '</p></div></header>' +
    '<div class="yp-keys">' + keySpecs.map(s => '<div class="rv"><span>' + esc(s[0]) + '</span><b>' + esc(s[1]) + '</b></div>').join('') + '</div>' +
    '<section class="yp-main"><div class="yp-text"><p class="eyebrow rv">About this yacht</p><div class="yp-desc rv">' + esc(description).split(/\n\s*\n/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('') + '</div>' + hlHTML + '</div>' +
    '<aside class="yp-card rv"><p class="eyebrow">' + (isCharter ? 'Charter rate' : 'Asking price') + '</p>' +
    (y.original_price ? '<p class="yp-was">' + esc(y.original_price) + '</p>' : '') +
    '<p class="yp-price">' + esc(price) + '</p>' + (y.price_note ? '<p class="yp-note">' + esc(y.price_note) + '</p>' : '<p class="yp-note">Taxes excluded unless stated · Subject to availability</p>') +
    '<a href="' + enquire + '" class="btn btn-gold">' + (isCharter ? 'Enquire about this charter' : 'Enquire about this yacht') + ' <i>→</i></a>' +
    '<div class="yp-wa"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-ghost">WhatsApp UAE</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" class="btn btn-ghost">WhatsApp FR</a></div>' + brochure +
    '<p class="yp-disc">All enquiries handled with discretion. Reply within 24 hours, in English or French.</p></aside></section>' +
    specsHTML + galHTML +
    '<section class="yp-sec"><div class="head"><div><p class="eyebrow rv">' + (isCharter ? 'More charters' : 'More yachts') + '</p><h2 class="t-l split-words yp-h2">You may <span class="acc">also like</span></h2></div><a href="' + (isCharter ? '/charter' : '/listings') + '" class="arrow-link rv">View all <span>→</span></a></div>' +
    '<div class="rail" data-yachts="' + (isCharter ? 'charter' : 'sale') + '" data-limit="9" data-exclude="' + esc(slug) + '"></div></section>' +
    '<div class="lightbox" id="lb" hidden><button aria-label="Close">×</button><img alt=""></div>' +
    FOOTER + SCRIPTS + '</body></html>';
}

function notFound() {
  return new Response('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Yacht not found | Yacht Research</title><meta name="robots" content="noindex">' + HEAD_ASSETS + '</head><body>' + NAV +
    '<section style="min-height:80vh;display:grid;place-items:center;text-align:center"><div><p class="eyebrow">404</p><h1 class="t-l" style="margin:22px 0">This listing is <span class="acc">no longer available</span></h1><a href="/listings" class="btn btn-gold">View all yachts <i>→</i></a></div></section>' +
    FOOTER + SCRIPTS + '</body></html>', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
