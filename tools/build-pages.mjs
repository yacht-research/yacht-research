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
const V = '8'; // à incrémenter quand yr.css / yr.js changent (cache navigateur)
const U = (id, w = 1800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
const WA_UAE = 'https://wa.me/qr/5NK5SR22CXGNC1', WA_FR = 'https://wa.me/message/CVQVHBO3GXLZP1';
const WA_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.6 14.1c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1a16 16 0 0 1-1.6-.6c-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.2.5.2.5.4.1.1.1.8-.2 1.5z"/></svg>';

// ---------------------------------------------------------- en-tête
const NAV = `<nav id="nav">
  <a href="/" class="logo" translate="no"><img src="/images/brand/emblem.webp" alt="Yacht Research" width="74" height="40"><span>Yacht Research<small>Group</small></span></a>
  <ul class="nav-links">
    <li><a href="/listings">Buy</a></li>
    <li><a href="/charter">Charter</a></li>
    <li><a href="/bespoke">Services</a></li>
    <li><a href="/why-us">Why Us</a></li>
    <li><a href="/partnerships">Partners</a></li>
    <li><a href="/recruitment">Careers</a></li>
    <li><a href="/#newsletter" class="gold-link">Newsletter</a></li>
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
  <a href="/yacht-research-form">Sell <em>your yacht</em></a>
  <a href="/bespoke">Services</a>
  <a href="/why-us">Why us</a>
  <a href="/partnerships">Partners <em>&amp; referrals</em></a>
  <a href="/recruitment">Careers</a>
  <a href="/#newsletter"><em>Newsletter</em></a>
  <a href="/#contact">Contact</a>
  <a href="/yacht-research-form" class="btn btn-gold menu-cta">Enquire now <i>→</i></a>
</div>`;

// ---------------------------------------------------------- pied de page
const FOOTER = `<footer class="foot">
  <div class="foot-top">
    <div class="foot-brand"><a href="/" class="logo-full"><img class="foot-logo" src="/images/brand/logo-full.webp" alt="Yacht Research" width="220" height="182" loading="lazy"></a><p>The art of effortless yachting. Yacht sales, charter and bespoke services, worldwide.</p></div>
    <div><h5>Explore</h5><a href="/listings">Yachts for sale</a><a href="/charter">Charter</a><a href="/bespoke">Bespoke services</a><a href="/yacht-research-form">Sell your yacht</a></div>
    <div><h5>Company</h5><a href="/why-us">Why us</a><a href="/partnerships">Partnerships</a><a href="/partnerships#referral">Referral programme</a><a href="/recruitment">Recruitment</a><a href="/#newsletter">Newsletter</a></div>
    <div><h5>Contact</h5><a href="mailto:contact@yachtresearchgroup.com">contact@yachtresearchgroup.com</a><a href="${WA_UAE}">WhatsApp UAE</a><a href="${WA_FR}">WhatsApp France</a><a href="https://www.instagram.com/yacht_research/">Instagram</a><a href="https://linktr.ee/yacht_research">Linktree</a></div>
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
const SCRIPTS = `<script src="/assets/yr.js?v=${V}" defer></script>`;

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
function hero({ img, eyebrow, title, lead, ctas = '' }) {
  return `<header class="phero">
  ${img ? `<div class="hero-media" data-par="0.2"><img src="${U(img)}" alt="" fetchpriority="high"></div>` : ''}
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

// Les fondateurs (accueil + Why Us)
const LI_SVG = '<svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/></svg>';
const TEAM = `<section class="team" id="team">
  <div class="team-wrap">
    <div class="team-ph clip"><img src="/images/team/founders.webp" alt="Mathis Y. and Antoine E., founders of Yacht Research" width="1000" height="1250" loading="lazy"></div>
    <div class="team-txt">
      <p class="eyebrow rv">The founders</p>
      <h2 class="t-l split-words" style="margin-top:22px">The people <span class="acc">behind the search</span></h2>
      <div class="team-cards">
        ${[
          ['Mathis Y.', 'Founder &amp; Yacht Broker', 'Raised between Brittany and Paris, Mathis built a close bond with yachting through summers and first connections on the French Riviera: Cannes, Antibes, Monaco and Saint-Tropez.', 'Off-market, events and charter', 'https://www.linkedin.com/in/mathis-ybs-bb20483b7'],
          ['Antoine E.', 'Co-Founder &amp; Yacht Broker', 'Raised in the South of France, Antoine grew up close to the world of luxury, with regular time in Switzerland and Monaco. He built his network inside the industry and became a yacht broker backed by relationships formed over several years.', 'Closing and booking', 'https://www.linkedin.com/in/antoine-elie-163583383']
        ].map(([n, r, bio, sp, li], i) => `<article class="tcard rv${i ? ' d1' : ''}">
          <div class="tcard-h"><div><h4>${n}</h4><p class="trole">${r}</p></div><a class="tli" href="${li}" target="_blank" rel="noopener" aria-label="${n} on LinkedIn">${LI_SVG}</a></div>
          <p>${bio}</p>
          <dl><div><dt>Based</dt><dd>France &amp; UAE</dd></div><div><dt>Languages</dt><dd>French, English, Spanish</dd></div><div><dt>Speciality</dt><dd>${sp}</dd></div></dl>
        </article>`).join('')}
      </div>
      <p class="team-yca rv">Mathis and Antoine are also the founders of <a href="https://yachtclubacademy.com" target="_blank" rel="noopener">Yacht Club Academy <i>→</i></a></p>
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
  body: hero({ img: 'photo-1672939113905-b02ef5db7203', eyebrow: 'Charter', title: 'Yachts <span class="acc">for charter</span>', lead: 'Weekly and day charters with hand-picked crews, at preferential rates. We select the yacht, the crew and the itinerary around you.' })
    + OFFMARKET('photo-1528154291023-a6525fabe5b4', true) + catalogue('charter')
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
idx = idx.replace(/<footer class="foot">[\s\S]*?<\/footer>\n<div class="wa-stack">[\s\S]*?<\/div>\n<div class="cookie" id="cookie"[\s\S]*?<\/div>\n<\/div>/, FOOTER);
idx = idx.replace(/<!-- (?:WHY|TEAM) -->\n<section class="(?:why|team)" id="(?:why|team)">[\s\S]*?\n<\/section>/, '<!-- TEAM -->\n' + TEAM);
idx = idx.replace('Access by appointment, under confidentiality.', 'Every request is handled in full confidentiality.');
idx = idx.replace(/yr\.css\?v=\d+/, 'yr.css?v=' + V).replace(/yr\.js\?v=\d+/, 'yr.js?v=' + V);

// Cartes yachts pré-remplies depuis content/yachts/index.json (lancer « node build.js » avant).
// Le script de la page les rafraîchit ensuite ; Google et les visiteurs voient tout de suite les vraies annonces.
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function badgeLabel(b, type) { b = (b || '').toLowerCase(); if (type === 'charter') return 'Charter'; if (b.includes('reduc') || b.includes('price')) return 'Price reduced'; if (b.includes('off')) return 'Off market'; if (b.includes('new')) return 'New listing'; return 'For sale'; }
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
