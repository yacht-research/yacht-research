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
  if (b.includes('sold')) return 'Sold';
  if (b.includes('exclusive')) return 'Exclusive price';
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
  const sold = !isCharter && /sold/i.test(y.badge || ''); // vendu : étiquette « Sold » et « Contact us if you want the same »

  // Données structurées (Google)
  const digits = (y.price || '').replace(/\(.*?\)/g, '').replace(/[^0-9]/g, '');
  const offer = { '@type': 'Offer', priceCurrency: currency(y.price), availability: sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', url: canonical, seller: { '@type': 'Organization', name: 'Yacht Research', url: base } };
  if (digits && !isCharter) offer.price = Number(digits);
  const props = y.specs && typeof y.specs === 'object'
    ? Object.keys(y.specs).map(k => ({ '@type': 'PropertyValue', name: k, value: String(y.specs[k]) }))
    : [{ '@type': 'PropertyValue', name: 'Length', value: y.length || '' }, { '@type': 'PropertyValue', name: 'Year Built', value: y.year || '' }];
  props.push({ '@type': 'PropertyValue', name: 'Location', value: location });
  let schema = () => JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name: title, description: metaDesc, url: canonical,
    image: [image].concat(gallery.map(g => abs(g, base))),
    brand: { '@type': 'Brand', name: y.builder || 'Yacht Research' }, offers: offer, additionalProperty: props
  }).replace(/</g, '\\u003c');
  const city = location.split(',')[0].trim();
  const hourly = isCharter && /per hour/i.test(y.price || '') && digits;
  if (hourly) { offer.price = Number(digits); offer.priceSpecification = { '@type': 'UnitPriceSpecification', price: Number(digits), priceCurrency: currency(y.price), unitText: 'HOUR' }; }
  const faq = isCharter ? charterFaq(y, title, city, guests) : [];
  const faqLD = faq.length ? '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }).replace(/</g, '\\u003c') + '</script>' : '';
  const crumbs = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' },
      { '@type': 'ListItem', position: 2, name: isCharter ? 'Charter' : 'Yachts for sale', item: base + (isCharter ? '/charter' : '/listings') },
      ...(isCharter && city ? [{ '@type': 'ListItem', position: 3, name: city, item: base + '/charter?location=' + encodeURIComponent(city) }] : []),
      { '@type': 'ListItem', position: isCharter && city ? 4 : 3, name: title, item: canonical }]
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
      '<div class="rail yp-gal">' + [y.image].concat(gallery).map((g, i) => '<button class="yp-shot" data-full="' + esc(g) + '"><img src="' + esc(/^\/images\/.*\.webp$/.test(g) ? g.replace(/\.webp$/, '-800.webp') : g) + '" decoding="async" alt="' + esc(title) + ' photo ' + (i + 1) + '" loading="lazy"></button>').join('') + '</div><div class="progress" style="margin-right:var(--pad)"><i></i></div></section>'
    : '';
  // Vidéo courte (muette, en boucle, lancée seulement quand elle arrive à l'écran ; rien n'est chargé avant)
  const videoHTML = y.video
    ? '<section class="yp-sec yp-film"><p class="eyebrow rv">The film</p><h2 class="t-l split-words yp-h2">Step <span class="acc">aboard</span></h2>' +
      '<div class="yp-film-box rv' + (y.video_vertical ? ' yp-film-v' : '') + '"><video src="' + esc(y.video) + '"' + (y.video_poster ? ' poster="' + esc(y.video_poster) + '"' : '') + ' muted loop playsinline preload="none" controls aria-label="' + esc(title) + ' video tour"></video></div>' +
      '<script>(function(){var v=document.currentScript.previousElementSibling.querySelector("video");if(!("IntersectionObserver"in window))return;new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){var p=v.play();p&&p.catch(function(){})}else v.pause()})},{threshold:.35}).observe(v)})()</script></section>'
    : '';
  // Encart mis en avant juste sous les chiffres clés (argument principal de l'annonce)
  const c = y.callout;
  const calloutHTML = c && c.title
    ? '<section class="yp-callout rv"><div class="yp-callout-in">' + (c.eyebrow ? '<p class="eyebrow">' + esc(c.eyebrow) + '</p>' : '') +
      '<h2 class="yp-callout-t">' + esc(c.title) + '</h2>' + (c.text ? '<p class="yp-callout-p">' + esc(c.text) + '</p>' : '') +
      (Array.isArray(c.points) && c.points.length ? '<ul class="yp-callout-pts">' + c.points.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' : '') +
      '</div></section>'
    : '';
  const brochure = y.brochure ? '<a href="' + esc(y.brochure) + '" class="btn btn-ghost" target="_blank" rel="noopener">Brochure <i>↓</i></a>' : '';
  const enquire = '/yacht-research-form?' + (isCharter ? 'project=charter&' : '') + 'yacht=' + encodeURIComponent(title);

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' + esc(pageTitle) + '</title><meta name="description" content="' + esc(metaDesc) + '"><meta name="robots" content="index, follow"><meta name="theme-color" content="#070707">' +
    '<link rel="canonical" href="' + canonical + '"><link rel="icon" type="image/x-icon" href="/favicon.ico"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">' +
    '<meta property="og:type" content="product"><meta property="og:url" content="' + canonical + '"><meta property="og:title" content="' + esc(pageTitle) + '"><meta property="og:description" content="' + esc(metaDesc) + '"><meta property="og:image" content="' + esc(image) + '"><meta property="og:site_name" content="Yacht Research">' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="' + esc(image) + '">' +
    '<script type="application/ld+json">' + schema() + '</script>' + faqLD + '<script type="application/ld+json">' + crumbs + '</script>' +
    '<link rel="preload" as="image" href="' + esc(y.image || image) + '" fetchpriority="high">' + HEAD_ASSETS + '</head><body class="yp">' +
    NAV +
    (isCharter ? charterBody({ y, slug, title, location, city, gallery, price, guests, description, calloutHTML, hlHTML, specsHTML, videoHTML, galHTML, brochure, enquire, faq }) : (
    // Fiche à vendre : même disposition que les fiches charter (titre, chiffres clés, mosaïque de photos)
    '<main class="lx lx-sale">' +
    '<p class="lx-crumb yp-crumb"><a href="/">Home</a> · <a href="/listings">Yachts for sale</a> · <span>' + esc(title) + '</span></p>' +
    '<div class="lx-top"><div><span class="tag yp-tag' + (sold ? ' is-sold' : '') + '">' + badgeLabel(y.badge, isCharter) + '</span><h1 class="lx-h1">' + titleHTML(title) + '</h1>' +
    '<p class="lx-loc">' + [y.year, y.length, location].filter(Boolean).map(esc).join(' · ') + '</p></div>' +
    '<div class="lx-chips">' + keySpecs.map(s => '<div><b>' + esc(s[1]) + '</b><span>' + esc(s[0]) + '</span></div>').join('') + '</div></div>' +
    mosaic([y.image || image].concat(gallery), title + ' ' + (y.year || '') + ' for sale') +
    '</main>' + calloutHTML +
    '<section class="yp-main"><div class="yp-text"><p class="eyebrow rv">About this yacht</p><div class="yp-desc rv">' + esc(description).split(/\n\s*\n/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('') + '</div>' + hlHTML + specsHTML.replace('<section class="yp-sec">', '<section class="yp-sec yp-specs-in">') + '</div>' +
    (sold
      ? '<aside class="yp-card yp-sold rv"><p class="eyebrow">Sold by Yacht Research</p><p class="yp-price">Sold</p><p class="yp-note">This yacht has found its new owner.</p>' +
        '<p class="yp-same">Contact us if you want the same: we search on-market and off-market for a similar yacht, in confidence.</p>' +
        '<a href="/yacht-research-form?project=buy&yacht=' + encodeURIComponent('Looking for the same as ' + title) + '" class="btn btn-gold">Find me the same <i>→</i></a>' +
        '<div class="yp-wa"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-ghost">WhatsApp UAE</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" class="btn btn-ghost">WhatsApp FR</a></div>' +
        '<p class="yp-disc">Reply within 24 hours, in English or French.</p></aside></section>'
      : '<aside class="yp-card rv"><p class="eyebrow">' + (isCharter ? 'Charter rate' : 'Asking price') + '</p>' +
    (y.original_price ? '<p class="yp-was">' + esc(y.original_price) + '</p>' : '') +
    '<p class="yp-price">' + esc(price) + '</p>' + (y.price_note ? '<p class="yp-note">' + esc(y.price_note) + '</p>' : '<p class="yp-note">Taxes excluded unless stated · Subject to availability</p>') +
    '<a href="' + enquire + '" class="btn btn-gold">' + (isCharter ? 'Enquire about this charter' : 'Enquire about this yacht') + ' <i>→</i></a>' +
    '<div class="yp-wa"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-ghost">WhatsApp UAE</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" class="btn btn-ghost">WhatsApp FR</a></div>' + brochure +
    '<p class="yp-disc">All enquiries handled with discretion. Reply within 24 hours, in English or French.</p></aside></section>') +
    videoHTML + galHTML +
    '<section class="yp-sec"><div class="head"><div><p class="eyebrow rv">' + (isCharter ? 'More charters' : 'More yachts') + '</p><h2 class="t-l split-words yp-h2">You may <span class="acc">also like</span></h2></div><a href="' + (isCharter ? '/charter' : '/listings') + '" class="arrow-link rv">View all <span>→</span></a></div>' +
    '<div class="rail" data-yachts="' + (isCharter ? 'charter' : 'sale') + '" data-limit="9" data-exclude="' + esc(slug) + '"></div></section>'
    )) +
    '<div class="lightbox" id="lb" hidden><button aria-label="Close">×</button><img alt=""></div>' +
    FOOTER + SCRIPTS + '</body></html>';
}

// Mosaïque de 5 photos max + bouton « All N photos » (ouvre la galerie plein écran)
function mosaic(list, alt) {
  const imgs = list.filter(Boolean).filter((g, i, a) => a.indexOf(g) === i);
  const t800 = g => /^\/images\/.*\.webp$/.test(g) ? g.replace(/\.webp$/, '-800.webp') : g;
  return '<div class="lx-mosaic lx-n' + Math.min(imgs.length, 5) + '">' + imgs.slice(0, 5).map((g, i) => '<button class="yp-shot" data-full="' + esc(g) + '"><img src="' + esc(i ? t800(g) : g) + '" alt="' + esc(alt) + ' photo ' + (i + 1) + '"' + (i ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"') + '></button>').join('') +
    (imgs.length > 1 ? '<button class="lx-all" type="button" onclick="this.parentNode.querySelector(\'.yp-shot\').click()">All ' + imgs.length + ' photos</button>' : '') + '</div>';
}

// ---------- Fiche charter ----------
function num(v) { const m = String(v || '').match(/^\s*(\d[\d,.]*)/); return m ? m[1] : ''; }
function charterFaq(y, title, city, guests) {
  const q = [];
  if (y.price) q.push(['How much does it cost to charter ' + title + (city ? ' in ' + city : '') + '?', title + ' is available ' + y.price.replace(/^From/, 'from') + '.' + (y.price_note ? ' ' + y.price_note.replace(/\s*·\s*/g, '. ') + '.' : '')]);
  if (guests) q.push(['How many guests can ' + title + ' take?', guests.replace(/^(\d+)/, 'Up to $1') + '.']);
  if (y.location) q.push(['Where is ' + title + ' based?', title + ' is based in ' + y.location + '.']);
  q.push(['How do I book ' + title + '?', 'Send us an enquiry or a WhatsApp message with your date, timing and number of guests. We reply within 24 hours, in English or French, with availability and a tailored quote.']);
  return q;
}
function charterBody(o) {
  const { y, slug, title, location, city, gallery, price, guests, description, calloutHTML, hlHTML, specsHTML, videoHTML, galHTML, brochure, enquire, faq } = o;
  const imgs = [y.image].concat(gallery).filter(Boolean);
  const t800 = g => /^\/images\/.*\.webp$/.test(g) ? g.replace(/\.webp$/, '-800.webp') : g;
  const ft = (String(y.length || '').match(/(\d+)\s*ft/i) || [])[1];
  const chips = [[num(guests), 'guests'], [ft, 'ft'], [num(pick(y.specs, /cabin/i)), 'cabins'], [num(pick(y.specs, /crew/i)), 'crew']].filter(c => c[0]);
  const model = y.model || (title.indexOf(' - ') > -1 ? title.split(' - ')[1] : '');
  const name = title.indexOf(' - ') > -1 ? title.split(' - ')[0].toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()) : title;
  const paras = esc(description).split(/\n\s*\n/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
  const priceShort = price.replace(/^From\s+/i, '');
  return '<main class="lx">' +
    '<p class="lx-crumb"><a href="/">Home</a> · <a href="/charter">Charter</a>' + (city ? ' · <a href="/charter?location=' + encodeURIComponent(city) + '">' + esc(city) + '</a>' : '') + ' · <span>' + esc(name) + '</span></p>' +
    '<div class="lx-top"><div><span class="tag yp-tag">Charter</span><h1 class="lx-h1">' + esc(name) + (model ? ' <em>' + esc(model) + '</em>' : '') + '</h1>' +
    (location ? '<p class="lx-loc">⚲ ' + esc(location) + '</p>' : '') + '</div>' +
    (chips.length ? '<div class="lx-chips">' + chips.map(c => '<div><b>' + esc(c[0]) + '</b><span>' + c[1] + '</span></div>').join('') + '</div>' : '') + '</div>' +
    '<div class="lx-mosaic lx-n' + Math.min(imgs.length, 5) + '">' + imgs.slice(0, 5).map((g, i) => '<button class="yp-shot" data-full="' + esc(g) + '"><img src="' + esc(i ? t800(g) : g) + '" alt="' + esc(name) + ' yacht charter' + (city ? ' ' + esc(city) : '') + ' photo ' + (i + 1) + '"' + (i ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"') + '></button>').join('') +
    (imgs.length > 1 ? '<button class="lx-all" type="button" onclick="this.parentNode.querySelector(\'.yp-shot\').click()">All ' + imgs.length + ' photos</button>' : '') + '</div>' +
    '<div class="lx-body"><div class="lx-main">' +
    '<section class="lx-sec"><h2>About ' + esc(name) + '</h2><div class="yp-desc">' + paras + '</div></section>' +
    (calloutHTML ? '<div class="lx-callout">' + calloutHTML + '</div>' : '') +
    (hlHTML ? '<section class="lx-sec lx-hl">' + hlHTML + '</section>' : '') +
    '<section class="lx-sec"><h2>Rate</h2><div class="lx-grid"><div><span>From</span><b>' + esc(priceShort) + '</b></div>' + (city ? '<div><span>Departs from</span><b>' + esc(location) + '</b></div>' : '') + '<div><span>Rate type</span><b>Preferential B2B rate</b></div></div>' +
    (y.price_note ? '<p class="lx-small">' + esc(y.price_note) + '</p>' : '') + '</section>' +
    '<section class="lx-sec lx-faq"><h2>Questions</h2>' + faq.map(([q, a]) => '<details><summary>' + esc(q) + '</summary><p>' + esc(a) + '</p></details>').join('') + '</section>' +
    '</div>' +
    '<aside class="lx-book"><p class="eyebrow">Charter rate</p>' + (y.original_price ? '<p class="yp-was">' + esc(y.original_price) + '</p>' : '') +
    '<p class="lx-price">' + esc(price) + '</p>' + (y.price_note ? '<p class="yp-note">' + esc(y.price_note) + '</p>' : '<p class="yp-note">Subject to availability</p>') +
    '<a href="' + enquire + '" class="btn btn-gold">Check availability <i>→</i></a>' +
    '<div class="yp-wa"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-ghost">WhatsApp UAE</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" class="btn btn-ghost">WhatsApp FR</a></div>' + brochure +
    '<ul class="lx-pts"><li>Reply within 24 hours, in English or French</li><li>Payment by bank transfer or card</li><li>No payment to request a quote</li><li>All enquiries handled with discretion</li></ul></aside>' +
    '</div></main>' +
    videoHTML + specsHTML + galHTML +
    '<section class="yp-sec"><div class="head"><div><p class="eyebrow rv">More charters</p><h2 class="t-l split-words yp-h2">Similar <span class="acc">yachts</span></h2></div><a href="/charter" class="arrow-link rv">View all <span>→</span></a></div>' +
    '<div class="rail" data-yachts="charter" data-limit="9" data-exclude="' + esc(slug) + '"></div></section>';
}

function notFound() {
  return new Response('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Yacht not found | Yacht Research</title><meta name="robots" content="noindex">' + HEAD_ASSETS + '</head><body>' + NAV +
    '<section style="min-height:80vh;display:grid;place-items:center;text-align:center"><div><p class="eyebrow">404</p><h1 class="t-l" style="margin:22px 0">This listing is <span class="acc">no longer available</span></h1><a href="/listings" class="btn btn-gold">View all yachts <i>→</i></a></div></section>' +
    FOOTER + SCRIPTS + '</body></html>', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
