// ============================================================
// YACHT RESEARCH : générateur des pages du site (design noir et or)
// Une seule source pour l'en-tête, le pied de page et le style.
// Écrit : lib/shell.js (utilisé par /yacht/<slug>), les pages .html,
// et met à jour l'en-tête / le pied de page de index.html.
// Usage : node tools/build-pages.mjs
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const V = '28'; // à incrémenter quand yr.css / yr.js changent (cache navigateur)
const U = (id, w = 1800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
const WA_UAE = 'https://wa.me/qr/5NK5SR22CXGNC1', WA_FR = 'https://wa.me/message/CVQVHBO3GXLZP1';
const WA_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.6 14.1c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1a16 16 0 0 1-1.6-.6c-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.2.5.2.5.4.1.1.1.8-.2 1.5z"/></svg>';

// ---------------------------------------------------------- en-tête
const NAV = `<nav id="nav">
  <a href="/" class="logo" translate="no"><img src="/images/brand/emblem.webp" alt="Yacht Research" width="74" height="40"><span>Yacht Research<small>Group</small></span></a>
  <ul class="nav-links">
    <li><a href="/listings">Buy</a></li>
    <li><a href="/charter">Charter</a></li>
    <li><a href="/shared-experiences">Experiences</a></li>
    <li><a href="/private-jet">Private Jet</a></li>
    <li><a href="/bespoke">Services</a></li>
    <li><a href="/why-us">Why Us</a></li>
    <li><a href="/yacht-club-academy" class="yca-link">Academy</a></li>
    <li><a href="/partnerships">Partners</a></li>
    <li><a href="/recruitment">Careers</a></li>
    <li><a href="/contact" class="gold-link">Contact</a></li>
  </ul>
  <div class="nav-r">
    <a href="/yacht-research-form" class="btn btn-gold">Enquire <i>→</i></a>
    <button class="burger" aria-label="Menu" id="burger"><i></i><i></i><i></i></button>
  </div>
</nav>
<div class="menu" id="menu">
  <a href="/">Home</a>
  <a href="/listings">Yachts <em>for sale</em></a>
  <a href="/charter">Charter</a>
  <a href="/shared-experiences">Shared <em>experiences</em></a>
  <a href="/yacht-research-form">Sell <em>your yacht</em></a>
  <a href="/private-jet">Private <em>jet</em></a>
  <a href="/bespoke">Services</a>
  <a href="/why-us">Why us</a>
  <a href="/yacht-club-academy" class="yca-link">Yacht Club <em>Academy</em></a>
  <a href="/partnerships">Partners <em>&amp; referrals</em></a>
  <a href="/recruitment">Careers</a>
  <a href="/contact">Contact</a>
  <a href="/contact#newsletter"><em>Newsletter</em></a>
  <a href="/yacht-research-form" class="btn btn-gold menu-cta">Enquire now <i>→</i></a>
</div>`;

// ---------------------------------------------------------- pied de page
const FOOTER = `<footer class="foot">
  <div class="foot-top">
    <div class="foot-brand"><a href="/" class="logo-full"><img class="foot-logo" src="/images/brand/logo-full.webp" alt="Yacht Research" width="220" height="182" loading="lazy"></a><p>The art of effortless yachting. Yacht sales, charter and bespoke services, worldwide.</p></div>
    <div><h5>Explore</h5><a href="/listings">Yachts for sale</a><a href="/charter">Charter</a><a href="/shared-experiences">Shared experiences</a><a href="/private-jet">Private jet</a><a href="/bespoke">Bespoke services</a><a href="/yacht-research-form">Sell your yacht</a></div>
    <div><h5>Company</h5><a href="/why-us">Why us</a><a href="/yacht-club-academy">Yacht Club Academy</a><a href="/partnerships">Partnerships</a><a href="/partnerships#referral">Referral programme</a><a href="/recruitment">Recruitment</a><a href="/#newsletter">Newsletter</a></div>
    <div><h5>Contact</h5><a href="mailto:contact@yachtresearchgroup.com">contact@yachtresearchgroup.com</a><a href="${WA_UAE}">WhatsApp UAE</a><a href="${WA_FR}">WhatsApp France</a><a href="https://www.instagram.com/yacht_research/">Instagram</a><a href="https://linktr.ee/yacht_research">Linktree</a><a href="https://www.linkedin.com/in/mathis-ybs-bb20483b7" target="_blank" rel="noopener">Connect with Mathis on LinkedIn</a><a href="https://www.linkedin.com/in/antoine-elie-163583383" target="_blank" rel="noopener">Connect with Antoine on LinkedIn</a></div>
  </div>
  <div class="foot-bot"><span>© 2026 Yacht Research Group · Worldwide</span><span><a href="/privacy-policy">Privacy policy</a> · Photography: Unsplash</span></div>
</footer>
<div class="wa-stack">
  <a class="wa" href="${WA_UAE}" aria-label="WhatsApp UAE">${WA_SVG}<span>WhatsApp</span><b>UAE</b></a>
  <a class="wa" href="${WA_FR}" aria-label="WhatsApp France">${WA_SVG}<span>WhatsApp</span><b>FR</b></a>
</div>
<div class="cookie" id="cookie" role="dialog" aria-label="Cookies">
  <p>We use cookies for basic site functionality and to improve your experience. See our <a href="/privacy-policy">Privacy Policy</a>.</p>
  <div><button data-consent="declined">Decline</button><button class="ok" data-consent="accepted">Accept</button></div>
</div>`;

const HEAD_ASSETS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/yr.css?v=${V}">`;
// Pages préparées dès le survol d'un lien (navigateurs Chrome/Edge) : le changement de page devient quasi instantané
const SPECULATION = `<script type="speculationrules">{"prerender":[{"source":"document","where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/api/*"}},{"not":{"selector_matches":"[target=_blank]"}}]},"eagerness":"moderate"}]}</script>`;
const SCRIPTS = `<script src="/assets/yr.js?v=${V}" defer></script>${SPECULATION}`;

function page({ file, title, desc, canonical, ogImage, body, script = '', preload = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#070707">
<link rel="canonical" href="https://yachtresearchgroup.com${canonical}">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:url" content="https://yachtresearchgroup.com${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${ogImage || 'https://yachtresearchgroup.com/images/uploads/hero-yacht-BzzzVtkx.jpg'}">
<meta property="og:site_name" content="Yacht Research">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://images.unsplash.com">
${preload ? `<link rel="preload" as="image" href="${preload}" fetchpriority="high">\n` : ''}${HEAD_ASSETS}
</head>
<body>
${NAV}
${body}
${FOOTER}
${SCRIPTS}${script ? '\n' + script : ''}
</body>
</html>
`;
}

// Bandeau de titre commun aux pages intérieures
function hero({ img, src, eyebrow, title, lead, ctas = '' }) {
  return `<header class="phero">
  ${img || src ? `<div class="hero-media" data-par="0.2"><img src="${src || U(img)}" alt="" fetchpriority="high"></div>` : ''}
  <div class="phero-in">
    <p class="eyebrow">${eyebrow}</p>
    <h1 class="t-xl phero-title">${title}</h1>
    ${lead ? `<p class="lead phero-lead">${lead}</p>` : ''}
    ${ctas ? `<div class="ctas phero-ctas">${ctas}</div>` : ''}
  </div>
</header>`;
}

// ---------------------------------------------------------- catalogues
function catalogue(type) {
  const sale = type === 'sale';
  const priceOpts = sale
    ? [['', 'Any'], ['250000', '€250k'], ['500000', '€500k'], ['1000000', '€1M'], ['2000000', '€2M'], ['5000000', '€5M'], ['10000000', '€10M']]
    : [['', 'Any'], ['10000', '€10k / wk'], ['20000', '€20k / wk'], ['50000', '€50k / wk'], ['100000', '€100k / wk'], ['200000', '€200k / wk'], ['500000', '€500k / wk']];
  const opts = a => a.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  const chips = sale
    ? `<div class="chips" data-f="tag"><button data-v="" class="on">All</button><button data-v="new">New listing</button><button data-v="reduced">Price reduced</button><button data-v="offmarket">Off market</button></div>`
    : `<div class="chips" data-f="loc"><button data-v="" class="on">All destinations</button><button data-v="Mediterranean">Mediterranean</button><button data-v="Dubai">Dubai &amp; Gulf</button><button data-v="Caribbean">Caribbean</button><button data-v="Indian Ocean">Indian Ocean</button></div>`;
  return `<section class="cat" id="cat" data-cat="${type}">
  <div class="filters rv">
    <label class="field fsearch"><span>Search</span><input data-f="q" type="search" placeholder="Builder, model, location…"></label>
    <label class="field"><span>Min price</span><select data-f="min">${opts(priceOpts)}</select></label>
    <label class="field"><span>Max price</span><select data-f="max">${opts(priceOpts)}</select></label>
    <label class="field"><span>Min length</span><select data-f="len">${opts([['', 'Any'], ['15', '15 m+'], ['20', '20 m+'], ['25', '25 m+'], ['30', '30 m+'], ['40', '40 m+'], ['50', '50 m+']])}</select></label>
    ${sale ? `<label class="field"><span>Min year</span><select data-f="year">${opts([['', 'Any'], ['2020', '2020+'], ['2015', '2015+'], ['2010', '2010+'], ['2005', '2005+']])}</select></label>` : ''}
    <label class="field"><span>Sort</span><select data-f="sort">${opts(sale
      ? [['price-desc', 'Price: high to low'], ['price-asc', 'Price: low to high'], ['year-desc', 'Newest first'], ['length-desc', 'Largest first']]
      : [['price-desc', 'Rate: high to low'], ['price-asc', 'Rate: low to high'], ['length-desc', 'Largest first']])}</select></label>
  </div>
  <div class="cat-bar rv">${chips}<p class="cat-count"><b data-count-out>…</b> ${sale ? 'yachts for sale' : 'charter yachts'} <button class="cat-reset" type="button">Reset</button></p></div>
  <div class="cat-grid" data-grid><p class="cat-empty">Loading…</p></div>
</section>`;
}

// Bandeau « off-market » placé juste sous le titre de Buy et Charter (comme sur l'ancien site)
const OFFMARKET = (img, charter) => `<section class="offm offm-s offm-top">
  <div class="stick">
    <div class="bgimg"><img src="${U(img)}" alt="" loading="lazy"></div>
    <div class="in">
      <p class="eyebrow rv">Exclusive access</p>
      <h2 class="t-l split-words">Off-market yachts <span class="acc">worldwide</span></h2>
      <p class="lead rv">Thousands of vessels, one message. ${charter ? 'Beyond the yachts listed below, we can access charter yachts that are never publicly advertised, in every destination.' : 'Beyond the yachts listed below, we have access to discreet listings and private sales that are never publicly advertised. Tell us what you are looking for.'}</p>
      <div class="ctas rv" style="justify-content:center"><a href="/yacht-research-form?project=${charter ? 'charter' : 'buy'}" class="btn btn-gold">Send us a request <i>→</i></a><a href="${WA_FR}" class="btn btn-ghost">WhatsApp</a></div>
    </div>
  </div>
</section>`;

// Charter : nos tarifs sont des tarifs professionnels (B2B)
const B2B_NOTE = `<div class="b2b-wrap"><div class="b2b-note rv"><span class="ic">◆</span><p><b>B2B rates.</b> As a yacht brokerage, we book directly with owners and operators at professional (B2B) rates. The prices shown on our site are usually lower than those advertised for the same yachts on other websites.</p></div></div>`;

// Sorties partagées à Dubaï (portail partenaire) : contenu fixe dans content/experiences.json,
// horaires, disponibilités et prix remplis en direct par assets/sx.js.
const XP = JSON.parse(fs.readFileSync(path.join(SITE, 'content/experiences.json'), 'utf8'));
const yachtName = slug => { try { return JSON.parse(fs.readFileSync(path.join(SITE, 'content/yachts', slug + '.json'), 'utf8')).title; } catch (e) { return ''; } };
const xesc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const xpCard = (x, detail) => {
  const ys = x.yachts.map(s => [s, yachtName(s)]).filter(([, n]) => n);
  return `<article class="xp-card rv${detail ? ' xp-solo' : ''}${x.featured && !detail ? ' xp-feat' : ''}" data-xp="${x.id}" data-names="${xesc(JSON.stringify(x.names))}" data-title="${xesc(x.title)}"${x.from ? ` data-from="${x.from}"` : ''}>
    <div class="xp-media" data-imgs="${xesc(JSON.stringify(x.images))}">
      <img src="${x.images[0]}-800.webp" srcset="${x.images[0]}-800.webp 800w, ${x.images[0]}.webp 1600w" sizes="(max-width:760px) 100vw, 560px" alt="${xesc(x.title)} in Dubai" width="800" height="533" loading="lazy">
      ${detail ? '' : `<a class="xp-hit" href="/shared-experiences/${x.id}" aria-label="${xesc(x.title)}: details"></a>`}
      <span class="xp-tag">${x.tag}</span>
      ${x.images.length > 1 ? `<button type="button" class="xp-nav prev" aria-label="Previous photo">‹</button><button type="button" class="xp-nav next" aria-label="Next photo">›</button><span class="xp-count"><b>1</b>/${x.images.length}</span>` : ''}
    </div>
    <div class="xp-body">
      ${x.featured && !detail ? `<p class="xp-new">New experience</p>` : ''}
      <h3>${detail ? x.title : `<a href="/shared-experiences/${x.id}">${x.title}</a>`}</h3>
      <p class="xp-meta"><span>◷ ${x.duration}</span><span>⚲ ${x.base}</span>${x.note ? `<span>${x.note}</span>` : ''}</p>
      ${x.from ? `<p class="xp-from"><small>Starting from</small> <b>AED ${x.from}</b> <small>per guest</small></p>` : ''}
      ${detail ? '' : `<p class="xp-sum">${x.summary}</p>`}
      <ul class="xp-hl">${x.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
      ${ys.length ? `<p class="xp-yacht">On board: ${ys.map(([s, n]) => `<a href="/yacht/${s}">${n}</a>`).join(' or ')}</p>` : ''}
      <div class="xp-slots" data-slots><span class="xp-wait">Loading times…</span></div>
      <div class="xp-foot"><p class="xp-price" data-price></p><span data-cta></span></div>
      <div class="xp-links">${detail ? '' : `<a href="/shared-experiences/${x.id}" class="xp-more-link">Details, meeting point and policy <i>→</i></a>`}<a class="xp-wa" href="${WA_UAE}" target="_blank" rel="noopener">${WA_SVG}WhatsApp UAE</a><a class="xp-wa" href="${WA_FR}" target="_blank" rel="noopener">${WA_SVG}WhatsApp FR</a></div>
    </div>
  </article>`;
};
const XP_CARDS = XP.map(x => xpCard(x, false)).join('\n  ');

// Charter : encart en haut de page vers les sorties partagées
const SX_TEASER = `<section class="sxt rv">
  <a class="sxt-card" href="/shared-experiences">
    <div class="sxt-img">${XP.slice(0, 3).map(x => `<img src="${x.images[0]}-800.webp" alt="" width="800" height="533" loading="lazy">`).join('')}</div>
    <div class="sxt-txt">
      <p class="eyebrow">New · Dubai</p>
      <h2 class="t-m">Shared experiences, <span class="acc">by the seat</span></h2>
      <p>Not chartering a whole yacht? Join a superyacht day, a yacht tour with BBQ, a sunset dinner cruise or a boat party. ${XP.length} experiences, live times and prices.</p>
      <span class="btn btn-gold">See the experiences <i>→</i></span>
    </div>
  </a>
</section>`;

const SX_POLICY = 'Free cancellation up to 48 hours before departure. Later cancellations and no-shows are not refunded. If the sailing is cancelled for weather or safety reasons, you choose between another date and a full refund.';
const sxSection = (cards, more = true) => `<section class="sx" id="sx">
  <div class="sx-bar">
    <div class="sx-days" data-sx-days role="group" aria-label="Choose a date"></div>
    <label class="field sx-date"><span>Other date</span><input type="date" data-sx-date></label>
  </div>
  <p class="sx-msg" data-sx-note></p>
  <div class="xp-grid${more ? '' : ' xp-grid-solo'}" data-sx-grid>
  ${cards}
  </div>
  <div class="xp-more" data-sx-more hidden${more ? '' : ' data-off'}><h3 class="xp-more-h">Also available on this date</h3><div class="sx-grid" data-sx-more-grid></div></div>
</section>`;
const SX_MODAL = `<div class="sx-modal" id="sx-modal" hidden role="dialog" aria-modal="true" aria-labelledby="sx-t">
  <form class="sx-form" novalidate>
    <button type="button" class="sx-x" aria-label="Close">×</button>
    <h3 id="sx-t" data-sx-title></h3>
    <p class="sx-meta" data-sx-when style="margin:0"></p>
    <div class="sx-row">
      <label class="field"><span data-sx-a>Adults</span><select name="adults">${Array.from({ length: 21 }, (_, i) => `<option${i === 2 ? ' selected' : ''}>${i}</option>`).join('')}</select></label>
      <label class="field"><span data-sx-c>Children</span><select name="children">${Array.from({ length: 21 }, (_, i) => `<option>${i}</option>`).join('')}</select></label>
    </div>
    <label class="field"><span>Full name</span><input name="name" autocomplete="name" maxlength="32" required></label>
    <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" maxlength="64" required></label>
    <label class="field"><span>Phone (with country code)</span><input name="phone" type="tel" autocomplete="tel" placeholder="+971 50 123 4567" required></label>
    <div class="sx-total"><span>Total</span><b data-sx-total>—</b></div>
    <p class="sx-fee" data-sx-fee></p>
    <p class="sx-err" aria-live="polite"></p>
    <button type="submit" class="btn btn-gold">Pay securely <i>→</i></button>
    <button type="button" class="sx-bank" data-sx-bank>Prefer a bank transfer? Request our bank details</button>
    <p class="yp-disc" style="margin:0">Secure card payment by Stripe. Your details are only used to arrange this experience. ${SX_POLICY}</p>
  </form>
</div>`;
const SHARED_EXP = sxSection(XP_CARDS) + '\n' + SX_MODAL;

// Fiche détaillée d'une expérience : /shared-experiences/<id>
const xpDetail = x => {
  const imgs = x.images.map((im, i) => `<button class="yp-shot" data-full="${im}.webp"><img src="${im}-800.webp" alt="${xesc(x.title)} photo ${i + 1}" width="800" height="533" loading="lazy"></button>`).join('');
  const others = XP.filter(o => o.id !== x.id).slice(0, 6);
  const ys = x.yachts.map(s => [s, yachtName(s)]).filter(([, n]) => n);
  const dur = x.duration.replace(/ to /, '–').replace(/ hours?$/, '').replace(/^(\d+) h (\d+)$/, '$1h$2');
  const durU = /hours?$/.test(x.duration) ? (x.duration.startsWith('1 hour') ? 'hour' : 'hours') : 'duration';
  const chips = [[x.from ? x.from : '', 'AED / guest'], [dur, durU]].filter(c => c[0]);
  const faq = [
    x.from ? [`How much does the ${x.title.toLowerCase()} cost?`, `Seats start from AED ${x.from} per guest. Live prices for each departure are shown on this page.`] : null,
    [`How long does it last?`, `${x.duration}, departing from ${x.base}.`],
    [`Where do we board?`, x.meet],
    [`Can I cancel?`, SX_POLICY]
  ].filter(Boolean);
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  return `<main class="lx">
  <p class="lx-crumb"><a href="/">Home</a> · <a href="/shared-experiences">Shared experiences</a> · <span>${x.title}</span></p>
  <div class="lx-top"><div><span class="tag yp-tag">${x.tag}</span><h1 class="lx-h1">${x.title}</h1><p class="lx-loc">⚲ ${x.base}, Dubai · Shared yacht, by the seat</p></div>
    <div class="lx-chips">${chips.map(([v, k]) => `<div><b>${v}</b><span>${k}</span></div>`).join('')}</div></div>
  <div class="lx-mosaic lx-n${Math.min(x.images.length, 5)}">${x.images.slice(0, 5).map((im, i) => `<button class="yp-shot" data-full="${im}.webp"><img src="${i ? im + '-800' : im}.webp" alt="${xesc(x.title)} in Dubai photo ${i + 1}"${i ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}></button>`).join('')}${x.images.length > 1 ? `<button class="lx-all" type="button" onclick="this.parentNode.querySelector('.yp-shot').click()">All ${x.images.length} photos</button>` : ''}</div>
  <div class="lx-body"><div class="lx-main">
    <section class="lx-sec"><h2>The experience</h2><div class="yp-desc"><p>${x.summary}</p><p>${x.about}</p></div>${ys.length ? `<p class="lx-small">On board: ${ys.map(([s, n]) => `<a href="/yacht/${s}">${n}</a>`).join(' or ')}</p>` : ''}</section>
    <section class="lx-sec lx-hl"><div class="yp-hl"><p class="eyebrow">Included</p><ul>${x.highlights.map(h => `<li>${h}</li>`).join('')}</ul></div></section>
    <section class="lx-sec"><h2>Good to know</h2><div class="lx-grid"><div><span>Meeting point</span><b>${x.meet}</b></div><div><span>Duration</span><b>${x.duration}</b></div>${x.note ? `<div><span>Please note</span><b>${x.note}</b></div>` : ''}<div><span>Shared yacht</span><b>Other guests join you on board. For the yacht to yourself, see our <a href="/charter">private charters</a>.</b></div></div>
      <ul class="lx-pts" style="margin-top:18px">${x.info.map(i => `<li>${i}</li>`).join('')}</ul></section>
    <section class="lx-sec"><h2>Cancellation</h2><p class="lx-small" style="margin:0;font-size:15px;color:rgba(243,238,228,.82)">${SX_POLICY}</p></section>
    <section class="lx-sec lx-faq"><h2>Questions</h2>${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>
  </div>
  <aside class="lx-book"><p class="eyebrow">Shared experience</p><p class="lx-price">${x.from ? `From AED ${x.from} <small style="font-size:.5em;color:var(--mute)">/ guest</small>` : 'Price on request'}</p><p class="yp-note">Live times and prices below · Secure card payment</p>
    <a href="#sx" class="btn btn-gold">Times and prices <i>→</i></a>
    <div class="yp-wa"><a href="${WA_UAE}" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp UAE</a><a href="${WA_FR}" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp FR</a></div>
    <ul class="lx-pts"><li>${x.duration} · ${x.base}</li><li>Free cancellation up to 48 hours before</li><li>Reply within 24 hours, in English or French</li></ul></aside>
  </div></main>
<div class="xpd-book" id="times"><p class="eyebrow rv">Live availability</p><h2 class="t-l yp-h2">Choose your <span class="acc">time</span></h2></div>
${sxSection(xpCard(x, true), false)}
${SX_MODAL}
${x.images.length > 2 ? `<section class="yp-sec" style="padding-right:0"><div class="head" style="padding-right:var(--pad)"><div><p class="eyebrow rv">Gallery</p><h2 class="t-l yp-h2">On <span class="acc">board</span></h2></div><div class="rail-ui"><button data-prev aria-label="Previous">←</button><button data-next aria-label="Next">→</button></div></div><div class="rail yp-gal">${imgs}</div></section>` : ''}
<section class="yp-sec"><div class="head"><div><p class="eyebrow rv">More experiences</p><h2 class="t-l yp-h2">You may <span class="acc">also like</span></h2></div><a href="/shared-experiences" class="arrow-link rv">View all <span>→</span></a></div>
<div class="xpd-more">${others.map(o => `<a class="xpd-mini rv" href="/shared-experiences/${o.id}"><img src="${o.images[0]}-800.webp" alt="" width="800" height="533" loading="lazy"><span>${o.tag}</span><b>${o.title}</b>${o.from ? `<small>From AED ${o.from}</small>` : ''}</a>`).join('')}</div></section>
<div class="lightbox" id="lb" hidden><button aria-label="Close">×</button><img alt=""></div>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
};

// Les fondateurs (accueil + Why Us)
const LI_SVG = '<svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/></svg>';
const TEAM = `<section class="team" id="team">
  <div class="team-wrap">
    <div class="team-media">
      <div class="team-ph clip"><img src="/images/team/founders.webp" alt="Mathis Y. and Antoine E., founders of Yacht Research" width="1000" height="1250" loading="lazy"></div>
      <div class="team-duo">
        <div class="team-ph2 rv"><img src="/images/team/dubai.webp" alt="Mathis and Antoine overlooking Dubai Marina" width="1200" height="553" loading="lazy"></div>
        <div class="team-ph2 rv d1"><img src="/images/team/night.webp" alt="Mathis and Antoine on a yacht at night" width="1000" height="750" loading="lazy"></div>
      </div>
    </div>
    <div class="team-txt">
      <p class="eyebrow rv">The founders</p>
      <h2 class="t-l split-words" style="margin-top:22px">The people <span class="acc">behind the search</span></h2>
      <div class="team-cards">
        ${[
          ['Mathis Y.', 'Founder &amp; Yacht Broker', 'Raised between Brittany and Paris, Mathis built a close bond with yachting through summers and first connections on the French Riviera: Cannes, Antibes, Monaco and Saint-Tropez.', 'Off-market, events and charter', 'https://www.linkedin.com/in/mathis-ybs-bb20483b7'],
          ['Antoine E.', 'Co-Founder &amp; Yacht Broker', 'Raised in the South of France, Antoine grew up close to the world of luxury, with regular time in Switzerland and Monaco. He built his network inside the industry and became a yacht broker backed by relationships formed over several years.', 'Closing and booking', 'https://www.linkedin.com/in/antoine-elie-163583383']
        ].map(([n, r, bio, sp, li], i) => `<article class="tcard rv${i ? ' d1' : ''}">
          <div class="tcard-h"><h4>${n}</h4><p class="trole">${r}</p></div>
          <p>${bio}</p>
          <dl><div><dt>Based</dt><dd>France &amp; UAE</dd></div><div><dt>Languages</dt><dd>French, English, Spanish</dd></div><div><dt>Speciality</dt><dd>${sp}</dd></div></dl>
          <a class="tli" href="${li}" target="_blank" rel="noopener">${LI_SVG}<span>View ${n.split(' ')[0]}'s LinkedIn profile</span><i>↗</i></a>
        </article>`).join('')}
      </div>
      <a class="yca-card rv" href="/yacht-club-academy">
        <img class="yca-logo" src="/images/brand/yca-logo-white.svg" alt="Yacht Club Academy" width="88" height="60" loading="lazy">
        <span class="yca-k">Also founded by Mathis &amp; Antoine</span>
        <b>Yacht Club <em>Academy</em></b>
        <span class="yca-p">Our academy for those who want to become Yacht Brokers: the off-market world, the method professionals use, a dedicated platform and much more.</span>
        <span class="yca-go">Discover the academy <i>→</i></span>
      </a>
    </div>
  </div>
</section>`;

// ---------------------------------------------------------- pages
const pages = [];

pages.push({
  file: 'listings.html', canonical: '/listings',
  title: 'Luxury Yachts for Sale | Yacht Research',
  desc: 'Browse luxury motor and sailing yachts for sale, personally vetted by Yacht Research. Off-market opportunities and buyer representation worldwide.',
  preload: U('photo-1569263979104-865ab7cd8d13'),
  body: hero({ img: 'photo-1569263979104-865ab7cd8d13', eyebrow: 'Listings', title: 'Yachts <span class="acc">for sale</span>', lead: 'A curated selection of motor and sailing yachts. Every listing is personally vetted by our brokers, with off-market opportunities available on request.' })
    + OFFMARKET('photo-1592285081254-0440a6601fea') + catalogue('sale')
});

pages.push({
  file: 'charter.html', canonical: '/charter',
  title: 'Luxury Yacht Charter | Mediterranean, Dubai, Caribbean | Yacht Research',
  desc: 'Crewed luxury yacht charters in the Mediterranean, Dubai and the Gulf, the Caribbean and the Indian Ocean, at preferential rates. Yacht Research.',
  preload: U('photo-1672939113905-b02ef5db7203'),
  body: hero({ img: 'photo-1672939113905-b02ef5db7203', eyebrow: 'Charter', title: 'Yachts <span class="acc">for charter</span>', lead: 'Weekly, day and hourly charters with hand-picked crews, at B2B rates. We select the yacht, the crew and the itinerary around you.' })
    + B2B_NOTE + SX_TEASER + OFFMARKET('photo-1528154291023-a6525fabe5b4', true) + catalogue('charter')
});

pages.push({
  file: 'shared-experiences.html', canonical: '/shared-experiences',
  title: 'Shared Yacht Experiences in Dubai | Yacht Tours, Dinner Cruises, Parties | Yacht Research',
  desc: 'Book a seat on a yacht in Dubai: superyacht days, Dubai Marina yacht tours with BBQ, sunset and dinner cruises, boat parties and speedboat tours. Live times and prices.',
  ogImage: 'https://yachtresearchgroup.com/images/experiences/superyacht-experience/01.webp',
  preload: '/images/experiences/superyacht-experience/01.webp',
  body: hero({ src: '/images/experiences/superyacht-experience/01.webp', eyebrow: 'Dubai · By the seat', title: 'Shared experiences <span class="acc">in Dubai</span>', lead: 'Superyacht days, yacht tours with BBQ, sunset dinner cruises and boat parties. No need to charter a whole yacht: book your seats, from a one-hour marina tour to an afternoon on a superyacht.', ctas: '<a href="#sx" class="btn btn-gold">See times and prices <i>→</i></a><a href="/charter" class="btn btn-ghost">Private charter</a>' })
    + SHARED_EXP,
  script: `<script src="/assets/sx.js?v=${V}" defer></script>`
});

pages.push({
  file: 'why-us.html', canonical: '/why-us',
  title: 'Why Choose Yacht Research | Strategic Access, Stronger Results',
  desc: 'Off-market access, preferential charter rates and discreet, personal service. Why clients choose Yacht Research for yacht sales and charter worldwide.',
  preload: U('photo-1621277224630-81d9af65e40c'),
  body: hero({ img: 'photo-1621277224630-81d9af65e40c', eyebrow: 'Why clients choose us', title: 'Strategic access. <span class="acc">Stronger results.</span>', lead: 'In yachting, access defines opportunity. That is our advantage.' })
  + `<section class="manifesto" style="padding-top:clamp(70px,9vw,130px)">
  <p class="big" id="manifesto">Through direct B2B partnerships, we secure <span class="acc">preferential charter rates</span> and off-market listings not available to the public, giving our clients a decisive edge in every transaction.</p>
  <div class="two" style="margin-top:clamp(50px,6vw,90px)">
    <p class="lead rv">For yacht acquisitions, we provide access to private listings and off-market opportunities, ensuring discreet transactions and strategic negotiations.</p>
    <p class="lead rv d1">For sellers, we connect yachts with qualified international buyers through targeted exposure and private channels. Strategic access, stronger pricing and trusted guidance, worldwide.</p>
  </div>
</section>
<section class="why" id="why" style="padding-top:clamp(70px,9vw,130px)">
  <p class="eyebrow rv">Our expertise</p>
  <h2 class="t-l split-words" style="margin-top:22px;max-width:1100px">A complete suite of <span class="acc">yachting services</span></h2>
  <p class="lead rv" style="margin-top:22px">From acquisition to charter, from off-market sourcing to bespoke services: Yacht Research accompanies you at every stage of your yachting journey.</p>
  <div class="pillars six">
    ${[
      ['01', 'Luxury yacht sales', 'Access to an international portfolio of yachts for sale, including exclusive off-market opportunities secured through our global brokerage network.'],
      ['02', 'Charter placements', 'Worldwide charter opportunities with preferential rates: Mediterranean, Gulf, Caribbean and beyond, curated for UHNW clients.'],
      ['03', 'Buyer representation', 'Dedicated representation for buyers navigating the global market. We identify, negotiate and secure the right yacht at the right value.'],
      ['04', 'Off-market sourcing', 'Discreet access to private listings not publicly available. Discover opportunities before they reach the open market.'],
      ['05', 'Broker collaboration', 'Strategic co-brokerage arrangements with international partners. Shared listings, qualified buyers and transparent collaboration.'],
      ['06', 'Bespoke services', 'Refit, insurance, marina solutions and yacht management. A white-glove approach to every aspect of yacht ownership.']
    ].map(([n, t, p], i) => `<div class="pillar rv${i % 3 ? ' d' + (i % 3) : ''}"><b class="pnum">${n}</b><h4>${t}</h4><p>${p}</p></div>`).join('')}
  </div>
  <div class="ctas rv" style="margin-top:50px"><a href="/yacht-research-form" class="btn btn-gold">Enquire now <i>→</i></a><a href="/listings" class="btn btn-ghost">View yachts</a></div>
</section>` + TEAM
});

// Yacht Club Academy : résumé de l'académie, aux couleurs de YCA (bleu marine, bleu ciel, nacré)
const YCA_URL = 'https://yachtclubacademy.com/en/';
pages.push({
  file: 'yacht-club-academy.html', canonical: '/yacht-club-academy',
  title: 'Yacht Club Academy | Become a Yacht Broker | By the founders of Yacht Research',
  desc: 'Yacht Club Academy, founded by Mathis and Antoine of Yacht Research: the method, the network and a 30-day plan to start your career as a Yacht Broker.',
  body: `<div class="ya">
<header class="ya-hero">
  <div class="ya-in">
    <img class="ya-logo" src="/images/brand/yca-logo-white.svg" alt="Yacht Club Academy" width="132" height="90">
    <p class="ya-k">By the founders of Yacht Research</p>
    <h1 class="ya-h1">Want to become<br>a Yacht <em>Broker?</em></h1>
    <p class="ya-lead">We created Yacht Club Academy to open the doors of our profession. No theory from the outside: the method we use every day at Yacht Research, shared step by step, wherever you are in the world.</p>
    <div class="ya-ctas"><a href="${YCA_URL}" target="_blank" rel="noopener" class="ya-btn">Discover the academy <i>→</i></a><a href="#ya-plan" class="ya-btn ya-ghost">See the 30-day plan</a></div>
  </div>
</header>

<section class="ya-sec">
  <p class="ya-k rv">Where it starts</p>
  <h2 class="ya-h2 ya-pain rv">No method. No network. <span class="ya-strike">No first clients.</span></h2>
  <div class="ya-grid3">
    ${[
      ['No method', 'Where do you start? Understand the market, master the method, find your clients: the steps are laid out in order.'],
      ['No network', 'How do you find your place in yachting? Practical ways to reach owners, captains, buyers and partners, wherever you live.'],
      ['No first clients', 'What if you reached out to your first clients this season? A dedicated guide with message, email and call templates ready to adapt.']
    ].map(([t, p], i) => `<div class="ya-card rv${i ? ' d' + i : ''}"><b>0${i + 1}</b><h3>${t}</h3><p>${p}</p></div>`).join('')}
  </div>
</section>

<section class="ya-sec">
  <p class="ya-k rv">What you get</p>
  <h2 class="ya-h2 split-words">The ebook is the first step. <em>Our coaching takes you all the way.</em></h2>
  <p class="ya-p rv">Start with the ebook to discover the profession at your own pace. When you are ready to make it your career, we work with you directly, from your first steps to your first deals.</p>
  <div class="ya-grid2 ya-offer">
    <div class="ya-card rv"><div class="ya-ebook"><img src="/images/yca/ebook-cover-760.webp" alt="Ebook: An introduction to the Yacht Broker profession" width="760" height="1180" loading="lazy"><div><p class="ya-k">Step 1 · The ebook</p><h3>Discover the profession</h3><p>An introduction to the Yacht Broker profession, in English and French.</p></div></div>
      <ul class="ya-list">
        <li>The yacht brokerage market and how off-market really works</li>
        <li>Outreach templates: messages, emails and call scripts</li>
        <li>The guide “How to find your first clients”</li>
        <li>A video masterclass and 5 bonus resources</li>
      </ul></div>
    <div class="ya-card ya-hl rv d1"><p class="ya-k">Step 2 · Our coaching</p><h3>Become a Yacht Broker, with us</h3><p>Everything in the ebook, and much more: we guide you to close your first deals.</p>
      <ul class="ya-list">
        <li>The complete path: sales, charter, prospecting, negotiation and closing</li>
        <li>24/7 support on our private numbers</li>
        <li>One-to-one sessions, role-plays and reviews of your messages</li>
        <li>Your first prospect list and introductions to our network</li>
        <li>Access to selected events: Monaco, Dubai, Cannes and more</li>
      </ul></div>
  </div>
</section>

<section class="ya-sec" id="ya-plan">
  <p class="ya-k rv">Your 30-day plan</p>
  <h2 class="ya-h2 split-words">From zero to your <em>first conversations</em></h2>
  <div class="ya-weeks">
    ${[
      ['Week 1', 'Positioning and credibility', 'Choose your niche, write a three-sentence introduction and set up your mini CRM.'],
      ['Week 2', 'Network and targeting', 'Build your first list of owners, buyers, captains and partners.'],
      ['Week 3', 'Quality outreach', 'Reach out to a few prospects every day with genuinely personal messages.'],
      ['Week 4', 'Conversion and follow-up', 'Qualify needs, send a summary after each conversation and follow up with tact.']
    ].map(([w, t, p], i) => `<div class="ya-week rv${i ? ' d' + i : ''}"><span>${w}</span><h3>${t}</h3><p>${p}</p></div>`).join('')}
  </div>
</section>

<section class="ya-sec">
  <p class="ya-k rv">Go further</p>
  <h2 class="ya-h2 split-words">Learn with us, <em>one to one</em></h2>
  <div class="ya-grid2">
    <div class="ya-card rv"><h3>Yacht Broker Elite Pack</h3><p>The complete path to learn the profession step by step: the market, sales and charter, high-end prospecting, qualifying, negotiation, closing and client follow-up, with 24/7 support on our private numbers.</p></div>
    <div class="ya-card ya-hl rv d1"><h3>Private Coaching</h3><p>Everything in the Elite Pack, plus five hours a week working directly with us: your action plan, call and negotiation role-plays, a review of your messages, your first prospect list and introductions to our network.</p></div>
  </div>
  <p class="ya-p rv" style="margin-top:22px">We are ready to guide you, and a dedicated platform will bring everything together in one place: learning the profession, working on your first deals, a community of future brokers and sessions with industry experts. Payment in instalments is available, and a free 30-minute discovery call helps you choose the right path.</p>
</section>

<section class="ya-sec">
  <div class="ya-split">
    <div>
      <p class="ya-k rv">In the field</p>
      <h2 class="ya-h2 split-words">Built close to the boats <em>and the people</em></h2>
      <p class="ya-p rv">Our journey started in Antibes, Cannes and Monaco, then continued in Dubai. We meet the industry where it happens: at the shows, on board and with the people who shape it.</p>
    </div>
    <div class="ya-tags rv"><span>Qatar Boat Show 2026</span><span>Dubai International Boat Show</span><span>Monaco Yacht Show</span><span>Cannes Yachting Festival</span><span>Abu Dhabi International Boat Show</span></div>
  </div>
  <div class="ya-gal">
    ${[
      ['qatar', 'Qatar Boat Show 2026'],
      ['monaco', 'Monaco'],
      ['deck', 'Cannes Yachting Festival'],
      ['dubai', 'Dubai Marina'],
      ['sunset', 'On board at sunset']
    ].map(([f, c], i) => `<figure class="rv${i % 4 ? ' d' + (i % 4) : ''}"><img src="/images/yca/${f}-800.webp" alt="${c}" width="800" height="1000" loading="lazy"><figcaption>${c}</figcaption></figure>`).join('')}
  </div>
  <div class="ya-split ya-int">
    <div>
      <p class="ya-k rv">Our interviews</p>
      <h3 class="ya-h3 split-words">They opened <em>their doors</em> to us</h3>
      <p class="ya-p rv">We have been interviewed by well-known figures of entrepreneurship and online business, sharing our vision of yachting and of the Yacht Broker profession with their audiences.</p>
    </div>
    <div class="ya-int-ph">
      <figure class="rv"><img src="/images/yca/interview-paris-800.webp" alt="Mathis and Antoine with Loïc Bourget in Paris" width="800" height="1000" loading="lazy"><figcaption><b>Paris</b> With Loïc Bourget, on his YouTube channel</figcaption></figure>
      <figure class="rv d1"><img src="/images/yca/interview-dubai-800.webp" alt="Interview with Marvin Ndiaye in Dubai" width="800" height="1000" loading="lazy"><figcaption><b>Dubai</b> With Marvin Ndiaye, on YouTube and Instagram</figcaption></figure>
    </div>
  </div>
</section>

<section class="ya-cta">
  <h2 class="ya-h2">Your yachting career <em>starts here</em></h2>
  <p class="ya-p">Join Yacht Club Academy and learn the profession from two brokers who do it every day.</p>
  <div class="ya-ctas" style="justify-content:center"><a href="${YCA_URL}" target="_blank" rel="noopener" class="ya-btn">Visit yachtclubacademy.com <i>→</i></a><a href="https://www.instagram.com/yachtclubacademy/" target="_blank" rel="noopener" class="ya-btn ya-ghost">@yachtclubacademy</a></div>
</section>
</div>`
});

pages.push({
  file: 'bespoke.html', canonical: '/bespoke',
  title: 'Bespoke Yacht Services | Refit, Insurance, Marina, Management | Yacht Research',
  desc: 'Yacht refit and customisation, marine insurance, marina and berthing, yacht management. Bespoke services by Yacht Research, anywhere in the world.',
  preload: U('photo-1697124510322-27ef594f67fd'),
  body: hero({ img: 'photo-1697124510322-27ef594f67fd', eyebrow: 'Bespoke services', title: 'Beyond <span class="acc">brokerage</span>', lead: 'A fully bespoke approach for clients seeking excellence, discretion and peace of mind.' })
  + `<section class="manifesto" style="padding-top:clamp(70px,9vw,130px)">
  <p class="big" id="manifesto">Our philosophy is simple: <span class="acc">you enjoy your yacht,</span> we take care of everything else.</p>
  <p class="lead rv" style="margin-top:40px;max-width:760px">Whether you wish to refit your current yacht or customise a yacht you are about to acquire, we collaborate with leading yacht designers, naval architects and specialised shipyards to enhance both interior and exterior spaces, anywhere in the world.</p>
</section>
<section style="padding-top:0">
  <div class="bes-grid">
    ${[
      ['photo-1616207133639-cd5e4db9859f', 'Refit &amp; customisation', 'Leading designers and shipyards to elevate interior and exterior spaces, worldwide.'],
      ['photo-1569263979104-865ab7cd8d13', 'Marine insurance', 'Comprehensive coverage tailored to your yacht, cruising area and ownership structure.'],
      ['photo-1752884991178-c767ae83fb6b', 'Marina &amp; berthing', 'Securing optimal berths while handling every administrative and logistical aspect for you.'],
      ['photo-1604737637145-48cc31d160eb', 'Yacht management', 'Trusted partners for full-service management, crew placement and operational support.']
    ].map(([img, t, p], i) => `<div class="bes"><div class="clip"><img data-par="0.08" src="${U(img, 900)}" alt="" loading="lazy"></div><div class="txt rv"><span class="num">0${i + 1}</span><h3>${t}</h3><p>${p}</p></div></div>`).join('')}
  </div>
  <div class="ctas rv" style="margin-top:50px;justify-content:center"><a href="/yacht-research-form" class="btn btn-gold">Discuss your needs <i>→</i></a></div>
</section>`
});

pages.push({
  file: 'private-jet.html', canonical: '/private-jet',
  title: 'Private Jet Charter, Empty Legs & Private Flights Worldwide | Yacht Research',
  desc: 'Private jet charter, empty-leg flights and private flights anywhere in the world, booked through the Yacht Research network. Contact us on WhatsApp UAE or France.',
  preload: U('photo-1474302770737-173ee21bab63'),
  body: hero({ img: 'photo-1474302770737-173ee21bab63', eyebrow: 'Private aviation', title: 'Fly <span class="acc">private</span>', lead: 'Private jets, empty legs and private flights, anywhere in the world, booked through our global network.', ctas: `<a href="${WA_UAE}" class="btn btn-gold" target="_blank" rel="noopener">WhatsApp UAE <i>→</i></a><a href="${WA_FR}" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp France</a>` })
  + `<section class="manifesto" style="padding-top:clamp(70px,9vw,130px)">
  <p class="big" id="manifesto">From one yacht to the next, <span class="acc">the journey matters too.</span> Thanks to our worldwide network, we book your private flight wherever you need to be.</p>
  <p class="lead rv" style="margin-top:40px;max-width:760px">Tell us your route, dates and number of passengers. We look for the right aircraft, including empty-leg return flights when one fits your plans, and come back to you with options.</p>
</section>
<section style="padding-top:0">
  <div class="bes-grid">
    ${[
      ['photo-1684838200815-36eef38f353c', 'Private jet charter', 'A private aircraft for your route and your schedule, for business or leisure.'],
      ['photo-1770334618960-d246fc142297', 'Empty legs', 'Return and repositioning flights that can match your dates, when one is available.'],
      ['photo-1768346564233-d71f37bd19b6', 'Private flights worldwide', 'Departures and destinations anywhere in the world, arranged through our network.'],
      ['photo-1567899378494-47b22a2ae96a', 'Jet and yacht', 'Fly in and step aboard: one team to arrange your flight and your yacht charter.']
    ].map(([img, t, p], i) => `<div class="bes"><div class="clip"><img data-par="0.08" src="${U(img, 900)}" alt="" loading="lazy"></div><div class="txt rv"><span class="num">0${i + 1}</span><h3>${t}</h3><p>${p}</p></div></div>`).join('')}
  </div>
</section>
<section style="padding-top:0">
  <div class="news rv">
    <div class="news-bg"><img src="${U('photo-1474302770737-173ee21bab63', 1600)}" alt="" loading="lazy"></div>
    <div class="news-in">
      <div><p class="eyebrow">More information</p><h2 class="t-l" style="font-size:clamp(32px,4.6vw,64px);margin-top:18px">Where do you <span class="acc">want to fly?</span></h2></div>
      <div><p class="lead">Send us your route, dates and number of passengers on WhatsApp. We reply in English and French.</p><div class="ctas" style="margin-top:24px"><a href="${WA_UAE}" class="btn btn-gold" target="_blank" rel="noopener">WhatsApp UAE <i>→</i></a><a href="${WA_FR}" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp France</a></div></div>
    </div>
  </div>
</section>`
});

pages.push({
  file: 'recruitment.html', canonical: '/recruitment',
  title: 'Careers | Join Yacht Research | Yacht Broker Recruitment',
  desc: 'Yacht Research is expanding its international brokerage network: yacht brokers, charter brokers, sales consultants and business development partners.',
  preload: U('photo-1616207133639-cd5e4db9859f'),
  body: hero({ img: 'photo-1616207133639-cd5e4db9859f', eyebrow: 'Recruitment', title: 'Grow <span class="acc">with Yacht Research</span>', lead: 'We are expanding our international brokerage network and seeking experienced professionals who share our commitment to excellence, discretion and client-centred service.', ctas: '<a href="https://forms.office.com/r/NfLLLGTrEJ" class="btn btn-gold" target="_blank" rel="noopener">Apply now <i>→</i></a>' })
  + `<section id="recruitment">
  <div class="head"><div><p class="eyebrow rv">Join the network</p><h2 class="t-l split-words" style="margin-top:22px">Open <span class="acc">positions</span></h2></div><a href="https://linktr.ee/yacht_research" class="arrow-link rv" target="_blank" rel="noopener">Visit our Linktree <span>→</span></a></div>
  <ul class="roles">
    ${[['Yacht Broker', 'Sales · Worldwide'], ['Charter Broker', 'Charter · Worldwide'], ['Sales Consultant', 'Sales · Remote'], ['Business Development Partner', 'Partnership · Worldwide']]
      .map(([t, m], i) => `<li class="rv"><a href="https://forms.office.com/r/NfLLLGTrEJ" target="_blank" rel="noopener"><span class="n">0${i + 1}</span><h4>${t}</h4><em>${m}</em><i>→</i></a></li>`).join('')}
  </ul>
</section>
<section style="padding-top:0">
  <div class="news rv">
    <div class="news-bg"><img src="${U('photo-1592285081254-0440a6601fea', 1600)}" alt="" loading="lazy"></div>
    <div class="news-in">
      <div><p class="eyebrow">Application</p><h2 class="t-l" style="font-size:clamp(32px,4.6vw,64px);margin-top:18px">Ready to <span class="acc">join us?</span></h2></div>
      <div><p class="lead">Complete our recruitment form and a member of our team will review your application and be in touch.</p><div class="ctas" style="margin-top:24px"><a href="https://forms.office.com/r/NfLLLGTrEJ" class="btn btn-gold" target="_blank" rel="noopener">Apply now <i>→</i></a></div><p class="cform-sub" style="margin-top:14px">Secure form · Opens in a new tab</p></div>
    </div>
  </div>
</section>`
});

pages.push({
  file: 'partnerships.html', canonical: '/partnerships',
  title: 'Yacht Broker Partnerships & Referral Programme | Yacht Research',
  desc: 'Partner with Yacht Research: co-brokerage agreements, referral commissions and B2B network access for yacht brokers and professionals worldwide.',
  preload: U('photo-1752884991178-c767ae83fb6b'),
  body: hero({ img: 'photo-1752884991178-c767ae83fb6b', eyebrow: 'International network', title: 'Built on <span class="acc">trusted partnerships</span>', lead: 'We work with international brokers, shipyards and luxury service providers to exchange buyer requirements, share exclusive listings, co-broker transactions and develop opportunities worldwide.', ctas: '<a href="#pform" class="btn btn-gold">Partnership enquiry <i>→</i></a><a href="#referral" class="btn btn-ghost">Referral programme</a>' })
  + `<section>
  <p class="eyebrow rv">Who we work with</p>
  <h2 class="t-l split-words" style="margin-top:22px">Your network, <span class="acc">our fleet</span></h2>
  <div class="pillars six">
    ${[
      ['Yacht brokerages', 'Co-brokerage agreements with established firms. Share listings, exchange buyer mandates, close more deals together.'],
      ['Independent brokers', 'A reliable international partner for your clients\u2019 requirements.'],
      ['Shipyards &amp; builders', 'New build projects, connected with our network of qualified buyers and investors.'],
      ['Family offices', 'Discreet advisory for family offices and wealth managers seeking yacht acquisition guidance.'],
      ['Luxury concierge', 'Preferred partnership arrangements with leading concierge and lifestyle management firms.'],
      ['Charter managers', 'Strategic alliances to expand fleet availability and client access.']
    ].map(([t, p], i) => `<div class="pillar rv${i % 3 ? ' d' + (i % 3) : ''}"><b class="pnum">0${i + 1}</b><h4>${t}</h4><p>${p}</p></div>`).join('')}
  </div>
</section>
<section id="pform" style="padding-top:0">
  <form class="cform rv" data-yr-form="Partnership Inquiry" data-hp-abort novalidate>
    <p class="eyebrow">Partnership enquiry</p>
    <p class="cform-sub">Interested in collaborating with Yacht Research? Submit your details and we will be in touch.</p>
    <div class="cgrid">
      <label class="field"><span>Name</span><input name="name" type="text" placeholder="Your full name" autocomplete="name" required></label>
      <label class="field"><span>Company</span><input name="company" type="text" placeholder="Company name" autocomplete="organization"></label>
      <label class="field"><span>Role</span><input name="role" type="text" placeholder="Your role"></label>
      <label class="field"><span>Country</span><input name="country" type="text" placeholder="Country of operation" autocomplete="country-name"></label>
      <label class="field"><span>Email</span><input name="email" type="email" placeholder="your@email.com" autocomplete="email" required></label>
      <label class="field"><span>Phone / WhatsApp</span><input name="phone" type="tel" placeholder="+971 50 000 0000" autocomplete="tel"></label>
      <label class="field full"><span>Message</span><textarea name="message" rows="4" placeholder="Describe your business and how you would like to collaborate..."></textarea></label>
    </div>
    <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <label class="consent"><input type="checkbox" name="gdpr" required><span>I accept the <a href="/privacy-policy">Privacy Policy</a> and consent to Yacht Research processing my personal data.</span></label>
    <button class="btn btn-gold" type="submit">Submit partnership enquiry <i>→</i></button>
    <p class="cform-msg" aria-live="polite"></p>
  </form>
</section>
<section id="referral" style="background:var(--black-2)">
  <div class="two">
    <div>
      <p class="eyebrow rv">Referral programme</p>
      <h2 class="t-l split-words" style="margin-top:22px">Earn a commission <span class="acc">with your network</span></h2>
      <p class="lead rv" style="margin-top:24px">Introduce a client who completes a transaction with us and earn an exclusive commission. Seamless, transparent and secure.</p>
      <div class="ctas rv" style="margin-top:34px"><a href="/yacht-research-form?project=referral" class="btn btn-gold">Register your referral <i>→</i></a></div>
    </div>
    <div class="referral rv">
      <ol class="ref-steps" style="margin-top:0">
        <li><b>01</b><div><h4>Introduce</h4><p>Connect us with a client seeking to buy, sell or charter a yacht.</p></div></li>
        <li><b>02</b><div><h4>We handle everything</h4><p>Yacht Research manages the entire process with discretion and expertise.</p></div></li>
        <li><b>03</b><div><h4>Receive your reward</h4><p>Upon completion of the transaction, your commission is paid. Seamless and secure.</p></div></li>
      </ol>
    </div>
  </div>
</section>`
});

// Formulaire en 3 étapes : même logique d'envoi que l'ancienne page (champs identiques)
pages.push({
  file: 'yacht-research-form.html', canonical: '/yacht-research-form',
  title: 'Enquiry | Buy, Sell or Charter a Yacht | Yacht Research',
  desc: 'Tell us about your yacht project: purchase, sale, charter, partnership or bespoke services. Personally handled by Yacht Research within 24 hours.',
  body: hero({ eyebrow: 'Yacht Research', title: 'Your enquiry, <span class="acc">personally handled</span>', lead: 'Available worldwide. A member of our team replies within 24 hours, in English or French.' })
  + `<section class="wiz-wrap" style="padding-top:0">
  <div class="wiz rv">
    <div class="wiz-prog"><span class="on" data-pl="1">01 Project</span><span data-pl="2">02 Details</span><span data-pl="3">03 Contact</span><i><b id="progressFill" style="width:33%"></b></i></div>
    <div class="wstep active" id="step-1">
      <h2 class="wiz-title">What is your <span class="acc">project?</span></h2>
      <p class="cform-sub">Select one option</p>
      <div class="pgrid">
        ${[
          ['Yacht Acquisition', 'Buy a yacht', 'Private acquisition, new or pre-owned', '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L20 3M16.5 6.5l3 3M14 9l2.2 2.2"/>'],
          ['Sell Your Yacht', 'Sell your yacht', 'On-market or discreet off-market sale', '<path d="M3 11.5V4.2A1.2 1.2 0 0 1 4.2 3h7.3l9.2 9.2a1.2 1.2 0 0 1 0 1.7l-6.8 6.8a1.2 1.2 0 0 1-1.7 0z"/><circle cx="7.8" cy="7.8" r="1.6"/>'],
          ['Charter', 'Charter', 'Find or place a charter vessel', '<circle cx="12" cy="9" r="3.6"/><path d="M12 2.2v1.6M5.2 9H3.6M20.4 9h-1.6M7.2 4.2l1.1 1.1M16.8 4.2l-1.1 1.1M2.5 16.5c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.1-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.1 1.2M2.5 20.5c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.1-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.1 1.2"/>'],
          ['Partnership', 'Partnership', 'Broker collaboration or B2B network', '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20c0-3 2-5 5-5s5 2 5 5M11 20c0-3 2-5 5-5s5 2 5 5"/>'],
          ['Referral Programme', 'Referral programme', 'Earn commission on introductions', '<circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="5.5" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4"/>'],
          ['Bespoke Services', 'Bespoke services', 'Crew, refit, management and more', '<path d="M6.5 3.5h11l3.5 5.5-9 12-9-12z"/><path d="M3 9h18M12 21L8.6 9l1.6-5.5M12 21l3.4-12-1.6-5.5"/>']
        ].map(([v, t, d, ic]) => `<button type="button" class="pcard" data-value="${v}"><span class="ic"><svg viewBox="0 0 24 24">${ic}</svg></span><b>${t}</b><small>${d}</small></button>`).join('')}
      </div>
      <p class="cform-msg" id="msg-1"></p>
      <div class="wiz-nav"><button type="button" class="btn btn-gold" data-next="1">Continue <i>→</i></button></div>
    </div>
    <div class="wstep" id="step-2">
      <h2 class="wiz-title">Tell us <span class="acc">more</span></h2>
      <p class="cform-sub">Help us understand your requirements</p>
      <div id="dynamic-fields" class="cgrid"></div>
      <div class="wiz-nav"><button type="button" class="btn btn-ghost" data-prev="2">← Back</button><button type="button" class="btn btn-gold" data-next="2">Continue <i>→</i></button></div>
    </div>
    <input type="text" id="honeypot" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="wstep" id="step-3">
      <h2 class="wiz-title">Your contact <span class="acc">details</span></h2>
      <p class="cform-sub">We will reach out within 24 hours</p>
      <div class="cgrid">
        <label class="field"><span>First name *</span><input type="text" id="fname" placeholder="Jean-Paul" autocomplete="given-name"></label>
        <label class="field"><span>Last name *</span><input type="text" id="lname" placeholder="Dupont" autocomplete="family-name"></label>
        <label class="field"><span>Email address *</span><input type="email" id="email" placeholder="your@email.com" autocomplete="email"></label>
        <label class="field"><span>Phone / WhatsApp</span><input type="tel" id="phone" placeholder="+971 50 000 0000" autocomplete="tel"></label>
        <label class="field full"><span>Country</span><input type="text" id="country" placeholder="UAE, France, Monaco..." autocomplete="country-name"></label>
      </div>
      <label class="consent"><input type="checkbox" id="gdprConsent" required><span>I accept the <a href="/privacy-policy">Privacy Policy</a> and consent to Yacht Research processing my personal data to respond to my enquiry.</span></label>
      <p class="cform-msg" id="msg-3"></p>
      <div class="wiz-nav"><button type="button" class="btn btn-ghost" data-prev="3">← Back</button><button type="button" class="btn btn-gold" id="submitBtn">Send enquiry <i>→</i></button></div>
    </div>
    <div class="wstep" id="success">
      <div class="wiz-done"><img src="/images/brand/emblem.webp" alt="" width="148" height="80"><h2 class="wiz-title">Enquiry <span class="acc">received</span></h2><p class="lead">Thank you for reaching out to Yacht Research. A member of our team will contact you personally within 24 hours.</p><div class="ctas" style="justify-content:center;margin-top:28px"><a href="/listings" class="btn btn-gold">Explore our yachts <i>→</i></a></div></div>
    </div>
  </div>
</section>`,
  script: `<script>
(function(){
  // Même adresse et mêmes champs que l'ancienne page (Google Apps Script : Sheets, mails, Brevo)
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwT-6-C2qRtUhX4MXVhFzNUd5t1By9PDNdHfZ3krMiW8LIVgnC6ry-Qyon7Fam2B0gd/exec';
  var selected = '', formData = {};
  var qs = new URLSearchParams(location.search), preYacht = qs.get('yacht') || '', preProject = (qs.get('project') || '').toLowerCase();
  var cards = document.querySelectorAll('.pcard');
  function pick(c){ cards.forEach(function(x){ x.classList.remove('on'); }); c.classList.add('on'); selected = c.dataset.value; document.getElementById('msg-1').textContent = ''; }
  cards.forEach(function(c){ c.addEventListener('click', function(){ pick(c); }); });
  var map = { buy: 'Yacht Acquisition', sell: 'Sell Your Yacht', charter: 'Charter', partnership: 'Partnership', referral: 'Referral Programme', bespoke: 'Bespoke Services' };
  if (map[preProject]) cards.forEach(function(c){ if (c.dataset.value === map[preProject]) pick(c); });
  if (preYacht && !selected) cards.forEach(function(c){ if (c.dataset.value === 'Yacht Acquisition') pick(c); });

  function sel(id, label, opts){ return '<label class="field"><span>' + label + '</span><select id="' + id + '">' + opts.map(function(o, i){ return '<option' + (i ? '' : ' value=""') + '>' + o + '</option>'; }).join('') + '</select></label>'; }
  function buildDynamicFields(){
    var p = selected, html = '';
    var isYacht = ['Yacht Acquisition', 'Sell Your Yacht', 'Charter', '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L20 3M16.5 6.5l3 3M14 9l2.2 2.2"/>'].indexOf(p) > -1;
    var isPartner = ['Partnership', 'Referral Programme'].indexOf(p) > -1;
    if (isYacht) {
      html += sel('budget', 'Budget range', ['Select a range', 'Under €500K', '€500K – €1M', '€1M – €3M', '€3M – €10M', '€10M+', 'Price on Request']).replace('class="field"', 'class="field full"');
      html += sel('yacht_type', 'Yacht type', ['Any', 'Motor Yacht', 'Sailing Yacht', 'Catamaran', 'Superyacht (30m+)', 'Open / Sport']);
      html += sel('market', 'Preferred market', ['Any', 'Dubai / UAE', 'French Riviera', 'Mediterranean', 'Atlantic', 'Worldwide']);
    }
    if (isPartner) {
      html += '<label class="field"><span>Company / brokerage</span><input type="text" id="company" placeholder="Your company name"></label>';
      html += '<label class="field"><span>Role</span><input type="text" id="role" placeholder="Yacht broker, concierge, real estate..."></label>';
    }
    html += '<label class="field full"><span>Message</span><textarea id="message" rows="5" placeholder="Tell us more about your project, timeline, or any specific requirements..."></textarea></label>';
    var box = document.getElementById('dynamic-fields'), keep = formData.message;
    box.innerHTML = html;
    var m = document.getElementById('message');
    if (keep) m.value = keep; else if (preYacht) m.value = 'Regarding: ' + preYacht + '\\n';
  }
  function v(id){ var e = document.getElementById(id); return e ? e.value : ''; }
  function go(from, to, pct){
    document.getElementById(from).classList.remove('active');
    document.getElementById(to).classList.add('active');
    document.getElementById('progressFill').style.width = pct;
    var n = parseInt(to.replace('step-', ''), 10) || 3;
    document.querySelectorAll('[data-pl]').forEach(function(s){ s.classList.toggle('on', +s.dataset.pl <= n); });
    var w = document.querySelector('.wiz'); var top = w.getBoundingClientRect().top + scrollY - 90; if (scrollY > top) scrollTo({ top: top, behavior: 'smooth' });
  }
  document.querySelectorAll('[data-next]').forEach(function(b){ b.addEventListener('click', function(){
    var f = +b.dataset.next;
    if (f === 1) { if (!selected) { document.getElementById('msg-1').textContent = 'Please select one option.'; document.getElementById('msg-1').className = 'cform-msg err'; return; } buildDynamicFields(); }
    if (f === 2) { formData = { message: v('message'), budget: v('budget'), yacht_type: v('yacht_type'), market: v('market'), company: v('company'), role: v('role') }; }
    go('step-' + f, 'step-' + (f + 1), f === 1 ? '66%' : '100%');
  }); });
  document.querySelectorAll('[data-prev]').forEach(function(b){ b.addEventListener('click', function(){
    var f = +b.dataset.prev; go('step-' + f, 'step-' + (f - 1), f === 2 ? '33%' : '66%');
  }); });
  document.getElementById('submitBtn').addEventListener('click', function(){
    var msg = document.getElementById('msg-3'); msg.className = 'cform-msg err';
    if (!document.getElementById('gdprConsent').checked) { msg.textContent = 'Please accept the Privacy Policy to continue.'; return; }
    var fname = v('fname').trim(), lname = v('lname').trim(), email = v('email').trim();
    if (!fname || !email) { msg.textContent = 'Please fill in your name and email address.'; return; }
    var formName = (selected === 'Partnership' || selected === 'Referral Programme') ? 'Partnership Inquiry' : 'Yacht Enquiry';
    var params = new URLSearchParams({
      website: v('honeypot'), form_name: formName,
      name: fname + ' ' + lname, email: email, phone: v('phone').trim(), country: v('country').trim(),
      type: selected, budget: formData.budget || '', yacht_type: formData.yacht_type || '', market: formData.market || '',
      company: formData.company || '', role: formData.role || '', message: formData.message || '',
      submitted_at: new Date().toLocaleString('fr-FR')
    });
    fetch(APPS_SCRIPT_URL, { method: 'POST', body: params, mode: 'no-cors' }).catch(function(){});
    document.querySelector('.wiz-prog').style.visibility = 'hidden';
    go('step-3', 'success', '100%');
  });
})();
</script>`
});

pages.push({
  file: 'privacy-policy.html', canonical: '/privacy-policy',
  title: 'Privacy Policy | Yacht Research',
  desc: 'How Yacht Research collects, uses and protects your personal data, and your rights under the GDPR and the UAE PDPL.',
  body: hero({ eyebrow: 'Legal', title: 'Privacy <span class="acc">policy</span>', lead: 'Last updated: November 2026' })
  + `<section class="legal" style="padding-top:0"><div class="legal-in">
  <h2>1. Who we are</h2>
  <p>Yacht Research is an international luxury yacht brokerage operating worldwide. Our website is located at yachtresearchgroup.com. For any privacy-related enquiries, you may contact us at <a class="mail" href="#">contact [at] yachtresearchgroup.com</a>.</p>
  <h2>2. Data we collect</h2>
  <p>When you interact with our website, we may collect the following personal data:</p>
  <ul><li>Full name and first name</li><li>Email address</li><li>Phone or WhatsApp number</li><li>Country of residence</li><li>Information about your yacht project (type, budget, preferences)</li><li>Company name and professional role (for partnership enquiries)</li><li>Any additional information you choose to include in your message</li></ul>
  <h2>3. How we use your data</h2>
  <p>Your data is used exclusively for the following purposes:</p>
  <ul><li>Responding to your enquiry and providing the service you requested</li><li>Sending you relevant information about yacht listings and market opportunities</li><li>Sending our newsletter if you have subscribed</li><li>Managing our business relationship with you</li></ul>
  <p>We do not use your data for automated decision-making or profiling, and we do not sell your personal data to third parties.</p>
  <h2>4. Legal basis for processing</h2>
  <p>We process your data on the basis of your explicit consent, given when you submit a form on our website. You may withdraw your consent at any time by contacting us at <a class="mail" href="#">contact [at] yachtresearchgroup.com</a>.</p>
  <h2>5. Data storage and security</h2>
  <p>Your data is stored securely using Google Sheets (Google LLC) and Brevo (Sendinblue SAS), both of which are GDPR-compliant platforms. Our website is hosted via Cloudflare Pages, which provides industry-standard security including SSL/TLS encryption and DDoS protection.</p>
  <p>We retain your data for as long as necessary to fulfil the purpose for which it was collected, or until you request its deletion.</p>
  <h2>6. Third-party services</h2>
  <p>To operate our services, we use the following third-party processors:</p>
  <ul><li>Google Apps Script / Google Sheets: form data storage (Google LLC, USA)</li><li>Brevo (formerly Sendinblue): email marketing and contact management (France / EU)</li><li>Cloudflare Pages: website hosting, image delivery, CDN and security (USA)</li><li>Cloudflare Web Analytics: privacy-friendly, cookieless audience analytics. No personal data or cross-site tracking. EU visitor data excluded from analytics in compliance with GDPR.</li><li>Unsplash: supplementary website imagery (Canada)</li><li>Google Fonts: web typography loaded from fonts.googleapis.com (Google LLC, USA)</li></ul>
  <p>Each of these providers maintains their own privacy policies and GDPR compliance frameworks. Where applicable, data processing agreements are in place.</p>
  <h2>7. Your rights</h2>
  <p>Under the GDPR (for EU residents) and the PDPL (for UAE residents), you have the following rights:</p>
  <ul><li>The right to access the personal data we hold about you</li><li>The right to request correction of inaccurate data</li><li>The right to request deletion of your data ("right to be forgotten")</li><li>The right to withdraw consent at any time</li><li>The right to object to processing of your data</li><li>The right to data portability</li><li>The right to lodge a complaint with a supervisory authority</li></ul>
  <p>To exercise any of these rights, please contact us at <a class="mail" href="#">contact [at] yachtresearchgroup.com</a>. We will respond within 30 days.</p>
  <h2>8. Cookies</h2>
  <p>Our website uses strictly necessary cookies to ensure basic functionality. We do not use advertising or cross-site tracking cookies. A cookie consent banner is displayed on your first visit to allow you to manage your preferences.</p>
  <p>We use Cloudflare Web Analytics, a cookieless and privacy-preserving analytics tool that does not track individual visitors, does not set cookies, and does not share data with third parties. EU visitor data is excluded from analytics reports in accordance with GDPR requirements.</p>
  <h2>9. Newsletter</h2>
  <p>If you subscribe to our newsletter, your email address and name will be stored in our mailing list managed by Brevo. You may unsubscribe at any time by clicking the unsubscribe link in any email we send, or by contacting us directly.</p>
  <h2>10. Changes to this policy</h2>
  <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. We encourage you to review this page periodically.</p>
  <div class="referral" style="margin-top:50px"><p class="eyebrow">Contact for privacy matters</p><p style="margin-top:14px;color:var(--mute)">Yacht Research · Worldwide<br><a class="mail" href="#">contact [at] yachtresearchgroup.com</a></p></div>
</div></section>`,
  script: `<script>(function(){var e='contact'+'\\u0040'+'yachtresearchgroup.com';document.querySelectorAll('a.mail').forEach(function(a){a.textContent=e;a.href='mailto:'+e;});})();</script>`
});

// Fiches des expériences partagées
fs.mkdirSync(path.join(SITE, 'shared-experiences'), { recursive: true });
XP.forEach(x => pages.push({
  file: 'shared-experiences/' + x.id + '.html', canonical: '/shared-experiences/' + x.id,
  title: `${x.title} in Dubai${x.from ? ' from AED ' + x.from : ''} | Yacht Research`,
  desc: xesc(`${x.title} in Dubai: ${x.duration} from ${x.base}${x.from ? ', from AED ' + x.from + ' per guest' : ''}. ${x.summary}`).slice(0, 300),
  ogImage: 'https://yachtresearchgroup.com' + x.images[0] + '.webp',
  preload: x.images[0] + '.webp',
  body: xpDetail(x),
  script: `<script src="/assets/sx.js?v=${V}" defer></script>`
}));

// Page Contact : les fondateurs à gauche, le formulaire à droite, la newsletter en bas
const IG_SVG = '<svg viewBox="0 0 24 24" class="st"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>';
const MAIL_SVG = '<svg viewBox="0 0 24 24" class="st"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
const CONTACT_FORM = `<form class="cform" id="contactForm" novalidate>
    <img class="ctp-logo" src="/images/brand/logo-full.webp" alt="Yacht Research" width="220" height="182">
    <p class="eyebrow">Send an enquiry</p>
    <p class="cform-sub">All enquiries are handled with the utmost discretion. Reply within 24 hours, in English or French.</p>
    <div class="cgrid">
      <label class="field"><span>Name</span><input name="name" type="text" placeholder="Your name" autocomplete="name" required></label>
      <label class="field"><span>Phone</span><input name="phone" type="tel" placeholder="+971 50 000 0000" autocomplete="tel"></label>
      <label class="field"><span>Email</span><input name="email" type="email" placeholder="your@email.com" autocomplete="email" required></label>
      <label class="field"><span>Enquiry type</span><select name="type">
        <option value="">Select enquiry type</option>
        <option>Buy a Yacht</option><option>Sell My Yacht</option><option>Charter a Yacht</option>
        <option>Bespoke Services</option><option>Partnership</option><option>Referral</option><option>Other</option>
      </select></label>
      <label class="field full"><span>Message</span><textarea name="message" rows="5" placeholder="Tell us about your requirements..."></textarea></label>
    </div>
    <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <label class="consent"><input type="checkbox" name="gdpr" required><span>I accept the <a href="/privacy-policy">Privacy Policy</a> and consent to Yacht Research processing my personal data.</span></label>
    <button class="btn btn-gold" type="submit">Send enquiry <i>→</i></button>
    <p class="cform-msg" aria-live="polite"></p>
  </form>`;
const NEWSLETTER = `<section id="newsletter">
  <div class="news rv">
    <div class="news-bg"><img src="${U('photo-1604737637145-48cc31d160eb', 1600)}" alt="" loading="lazy"></div>
    <div class="news-in">
      <div>
        <p class="eyebrow">Newsletter</p>
        <h2 class="t-l" style="font-size:clamp(32px,4.6vw,64px);margin-top:18px">Stay <span class="acc">informed</span></h2>
        <p class="lead" style="margin-top:16px">Exclusive listings, market insights and off-market opportunities, straight to your inbox.</p>
      </div>
      <form class="news-form">
        <input type="text" name="firstname" placeholder="First name" aria-label="First name" autocomplete="given-name" required>
        <input type="email" name="email" placeholder="Email address" aria-label="Email address" autocomplete="email" required>
        <button class="btn btn-gold" type="submit">Subscribe <i>→</i></button>
        <p class="ok">✓ You are on the list. Welcome to Yacht Research.</p>
      </form>
    </div>
  </div>
</section>`;
const FOUNDERS = [
  ['Mathis Y.', 'Founder &amp; Yacht Broker', 'Raised between Brittany and Paris, Mathis built a close bond with yachting through summers and first connections on the French Riviera: Cannes, Antibes, Monaco and Saint-Tropez.', 'Off-market, events and charter', 'https://www.linkedin.com/in/mathis-ybs-bb20483b7'],
  ['Antoine E.', 'Co-Founder &amp; Yacht Broker', 'Raised in the South of France, Antoine grew up close to the world of luxury, with regular time in Switzerland and Monaco. He built his network inside the industry and became a yacht broker backed by relationships formed over several years.', 'Closing and booking', 'https://www.linkedin.com/in/antoine-elie-163583383']
];
pages.push({
  file: 'contact.html', canonical: '/contact',
  title: 'Contact Yacht Research | Yacht Brokers in Dubai &amp; France',
  desc: 'Contact Mathis and Antoine, founders of Yacht Research: yacht sales, charter, off-market search and partnerships. WhatsApp UAE and France, reply within 24 hours in English or French.',
  body: `<main class="ctp">
  <div class="ctp-grid">
    <div class="ctp-l">
      <div class="ctp-card rv">
        <div class="ctp-ph"><img src="/images/team/founders.webp" alt="Mathis Y. and Antoine E., founders of Yacht Research" width="1000" height="1250" fetchpriority="high"></div>
        <div class="ctp-id">
          <p class="eyebrow">Contact</p>
          <h1 class="ctp-h1">Mathis Y. <span class="acc">&amp;</span> Antoine E.</h1>
          <p class="ctp-role">Founders &amp; Yacht Brokers</p>
          <p class="ctp-loc">⚲ France &amp; UAE · Available worldwide, 7 days a week</p>
          <div class="ctp-soc">
            <a href="${WA_UAE}" target="_blank" rel="noopener" aria-label="WhatsApp UAE">${WA_SVG}</a>
            <a href="${WA_FR}" target="_blank" rel="noopener" aria-label="WhatsApp France">${WA_SVG}<small>FR</small></a>
            <a href="https://www.instagram.com/yacht_research/" target="_blank" rel="noopener" aria-label="Instagram">${IG_SVG}</a>
            <a href="${FOUNDERS[0][4]}" target="_blank" rel="noopener" aria-label="Mathis on LinkedIn">${LI_SVG}</a>
            <a href="${FOUNDERS[1][4]}" target="_blank" rel="noopener" aria-label="Antoine on LinkedIn">${LI_SVG}</a>
            <a href="mailto:contact@yachtresearchgroup.com" aria-label="Email">${MAIL_SVG}</a>
          </div>
        </div>
      </div>
      <div class="ctp-about rv">
        <h2>About us</h2>
        <p class="lead">Buying, selling or chartering a yacht should be simple. Send us <span class="acc">one message:</span> we search the whole market, including yachts never advertised, and guide you personally until the deal is done.</p>
        <div class="ctp-team">${FOUNDERS.map(([n, r, bio, sp, li]) => `<article class="tcard">
          <div class="tcard-h"><h4>${n}</h4><p class="trole">${r}</p></div>
          <p>${bio}</p>
          <dl><div><dt>Based</dt><dd>France &amp; UAE</dd></div><div><dt>Languages</dt><dd>FR, EN, ES</dd></div><div><dt>Speciality</dt><dd>${sp}</dd></div></dl>
          <a class="tli" href="${li}" target="_blank" rel="noopener">${LI_SVG}<span>View ${n.split(' ')[0]}'s LinkedIn profile</span><i>↗</i></a>
        </article>`).join('')}</div>
      </div>
      <div class="channels ctp-ch rv">
        <a href="${WA_UAE}"><b>WhatsApp <em>UAE</em></b>+971 52 430 2425</a>
        <a href="${WA_FR}"><b>WhatsApp <em>France</em></b>+33 7 45 53 28 09</a>
        <a href="mailto:contact@yachtresearchgroup.com"><b>Email</b>contact@yachtresearchgroup.com</a>
      </div>
    </div>
    <aside class="ctp-r">${CONTACT_FORM}</aside>
  </div>
</main>
${NEWSLETTER}`
});

// ---------------------------------------------------------- écriture
for (const p of pages) {
  fs.writeFileSync(path.join(SITE, p.file), page(p), 'utf8');
  console.log('✓ ' + p.file);
}

// lib/shell.js pour la fonction /yacht/<slug>
fs.writeFileSync(path.join(SITE, 'lib', 'shell.js'),
  '// En-tête, pied de page et ressources communs (généré par tools/build-pages.mjs : ne pas modifier à la main)\n' +
  'export const NAV = ' + JSON.stringify(NAV) + ';\n' +
  'export const FOOTER = ' + JSON.stringify(FOOTER) + ';\n' +
  'export const HEAD_ASSETS = ' + JSON.stringify(HEAD_ASSETS) + ';\n' +
  'export const SCRIPTS = ' + JSON.stringify(SCRIPTS) + ';\n', 'utf8');
console.log('✓ lib/shell.js');

// index.html : même en-tête / pied de page, version des ressources
let idx = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
idx = idx.replace(/<nav id="nav">[\s\S]*?<\/nav>\n<div class="menu" id="menu">[\s\S]*?<\/div>/, NAV);
idx = idx.replace(/<footer class="foot">[\s\S]*?<\/footer>\s*<div class="wa-stack">[\s\S]*?<\/div>\s*<div class="cookie" id="cookie"[\s\S]*?<\/div>\s*<\/div>/, FOOTER);
idx = idx.replace(/<!-- (?:WHY|TEAM) -->\n<section class="(?:why|team)" id="(?:why|team)">[\s\S]*?\n<\/section>/, '<!-- TEAM -->\n' + TEAM);
idx = idx.replace('Access by appointment, under confidentiality.', 'Every request is handled in full confidentiality.');
idx = idx.replace(/yr\.css\?v=\d+/, 'yr.css?v=' + V).replace(/yr\.js\?v=\d+/, 'yr.js?v=' + V);

// Cartes yachts pré-remplies depuis content/yachts/index.json (lancer « node build.js » avant).
// Le script de la page les rafraîchit ensuite ; Google et les visiteurs voient tout de suite les vraies annonces.
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function badgeLabel(b, type) { b = (b || '').toLowerCase(); if (type === 'charter') return 'Charter'; if (b.includes('exclusive')) return 'Exclusive price'; if (b.includes('reduc') || b.includes('price')) return 'Price reduced'; if (b.includes('off')) return 'Off market'; if (b.includes('new')) return 'New listing'; return 'For sale'; }
function splitTitle(t) { if (t.includes(' - ')) t = t.split(' - ')[0].toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()); const p = t.split(' '); return p.length === 1 ? '<em>' + esc(t) + '</em>' : esc(p[0]) + ' <em>' + esc(p.slice(1).join(' ')) + '</em>'; }
function shortLen(l) { const m = String(l || '').match(/[\d.,]+\s*m\b/i); return m ? m[0].replace(/\s+/g, ' ').replace(/(\.\d)\d+/, '$1') : (l || ''); }
function card(y, i) {
  let sub = [y.builder || '', y.year, y.location].filter(Boolean).join(' · ');
  if (y.type === 'charter' && y.title.includes(' - ')) sub = y.title.split(' - ').slice(1).join(' - ') + (y.location ? ' · ' + y.location : '');
  const specs = y.type === 'charter' ? '' : '<div class="specs"><div><b>' + esc(shortLen(y.length) || '—') + '</b><span>Length</span></div>' +
    (y.guests ? '<div><b>' + esc(y.guests) + '</b><span>Guests</span></div>' : '<div><b>' + esc(y.year || '—') + '</b><span>Year</span></div>') +
    (y.cabins ? '<div><b>' + esc(y.cabins) + '</b><span>Cabins</span></div>' : '<div><b>' + esc((y.location || '—').split(',')[0]) + '</b><span>Location</span></div>') + '</div>';
  const price = y.original_price ? '<span><s>' + esc(y.original_price) + '</s> ' + esc(y.price) + '</span>' : esc(y.price || 'Price on request');
  return '\n    <a class="card rv' + (i % 4 ? ' d' + (i % 4) : '') + '" href="/yacht/' + esc(y.slug) + '"><div class="ph"><img src="' + esc(y.thumb || y.image) + '" alt="' + esc(y.title) + (y.type === 'charter' ? ' yacht charter' : ' for sale') + '" loading="lazy"><span class="tag">' + badgeLabel(y.badge, y.type) + '</span></div>' +
    '<div class="bd"><small>' + esc(sub) + '</small><h4>' + splitTitle(y.title) + '</h4>' + specs + '<div class="price">' + price + ' <i>→</i></div></div></a>';
}
const yIndex = JSON.parse(fs.readFileSync(path.join(SITE, 'content', 'yachts', 'index.json'), 'utf8')).yachts;
const cardsFor = (type, lim) => yIndex.filter(y => y.type === type).slice(0, lim).map(card).join('');
idx = idx.replace(/(<div class="rail" data-yachts="sale"[^>]*>)[\s\S]*?(\n  <\/div>\n  <div class="progress">)/, (m, a, b) => a + cardsFor('sale', 10) + b);
idx = idx.replace(/(<div class="rail" data-yachts="charter"[^>]*>)[\s\S]*?(\n  <\/div>\n<\/section>)/, (m, a, b) => a + cardsFor('charter', 8) + b);
fs.writeFileSync(path.join(SITE, 'index.html'), idx, 'utf8');
console.log('✓ index.html (en-tête et pied de page)');
