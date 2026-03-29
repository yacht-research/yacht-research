// ============================================================ // Cloudflare Pages Function — Individual Yacht Pages // File location in your repo: functions/yacht/[slug].js // Handles: yachtresearchgroup.com/yacht/sunseeker-manhattan-68 // ============================================================
export async function onRequest(context) { const slug = context.params.slug;
if (!slug) return new Response('Not found', { status: 404 }); const baseUrl = new URL(context.request.url).origin;
// Fetch yacht JSON from the same Cloudflare Pages deployment let yacht; try {
const res = await fetch(`${baseUrl}/content/yachts/${slug}.json`); if (!res.ok) return new Response(notFoundHTML(), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }); yacht = await res.json(); } catch(e) {
return new Response(notFoundHTML(), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }
if (yacht.published === false) {
return new Response(notFoundHTML(), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }
const html = renderYachtPage(yacht, slug, baseUrl); return new Response(html, { headers: {
'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600'
} }); } // ── Helpers ────────────────────────────────────────────────────
function badgeLabel(badge) { if (!badge) return 'For Sale'; const b = badge.toLowerCase();
if (b.includes('new')) return 'New Listing'; if (b.includes('reduced') || b.includes('price')) return 'Price Reduced'; if (b.includes('off') || b.includes('market')) return 'Off Market'; if (b.includes('charter')) return 'Charter Ready'; return badge;
} function priceDisplay(yacht) {
if (yacht.original_price && yacht.price) { return `<span style="text-decoration:linethrough;color:rgba(255,255,255,0.35);font-size:14px;margin-right:10px;">$ {yacht.original_price}</span><span style="color:#c9a84c;font-size:22px;fontweight:300;">${yacht.price}</span>`; }
if (!yacht.price || yacht.price === '') return '<span style="color:#c9a84c;fontsize:22px;font-weight:300;">Price on Request</span>';return `<span style="color:#c9a84c;font-size:22px;font-weight:300;">$
{yacht.price}</span>`;
}
function schemaType(yacht) {
const t = (yacht.title || '').toLowerCase();
if (t.includes('catamaran') || t.includes('sail') || t.includes('ketch')) return
'Boat';
return 'Vehicle';
}
// ── Main HTML renderer ─────────────────────────────────────────
function renderYachtPage(y, slug, baseUrl) {
const title = y.title || 'Yacht for Sale';
const desc = `${title} for sale — ${y.year || ''} · ${y.length || ''} · $
{y.location || 'Mediterranean'}. Listed by Yacht Research, international luxury
yacht brokerage. ${y.price ? 'Asking price : ' + y.price + '.' : 'Price on
Request.'}`;
const canonical = `${baseUrl}/yacht/${slug}`;
const image = y.image || `${baseUrl}/images/uploads/hero-yacht-BzzzVtkx.jpg`;
const badge = badgeLabel(y.badge);
const schema = JSON.stringify({
"@context": "https://schema.org",
"@type": "Product",
"name": title,
"description": desc,
"url": canonical,
"image": image,
"brand": { "@type": "Brand", "name": "Yacht Research" },
"offers": {
"@type": "Offer",
"priceCurrency": y.price && y.price.includes('£') ? 'GBP' : y.price &&
y.price.includes('AED') ? 'AED' : 'EUR',
"price": y.price || 'Price on Request',
"availability": "https://schema.org/InStock",
"url": canonical,
"seller": { "@type": "Organization", "name": "Yacht Research", "url": baseUrl
}
},
"additionalProperty": [
{ "@type": "PropertyValue", "name": "Length", "value": y.length || '' },
{ "@type": "PropertyValue", "name": "Year Built", "value": y.year || '' },
{ "@type": "PropertyValue", "name": "Location", "value": y.location || '' }
]
});
return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index, follow">
<title>${title} for Sale | Yacht Research</title>
<meta name="description" content="${desc}">
<meta name="keywords" content="${title} for sale, ${title} yacht, buy ${title}, $
{y.location || ''} yacht for sale, luxury yacht broker, Yacht Research">
<meta name="author" content="Yacht Research"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${title} for Sale | Yacht Research">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">
<meta property="og:site_name" content="Yacht Research">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title} for Sale | Yacht Research">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${image}">
<script type="application/ld+json">${schema}</script>
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?
family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@
200;300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{--navy:#0a0f1e;--navy-mid:#111827;--gold:#c9a84c;--gold-light:#e2c97e;}
body{background:var(--navy);color:#fff;font-family:'Montserrat',sans-
serif;cursor:none;}
.cursor{position:fixed;width:8px;height:8px;background:var(--gold);border-
radius:50%;pointer-events:none;z-index:9999;}
.cursor-ring{position:fixed;width:32px;height:32px;border:1px solid
rgba(201,168,76,0.5);border-radius:50%;pointer-events:none;z-
index:9998;transition:all 0.15s ease;}
nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:20px
60px;display:flex;align-items:center;justify-content:space-
between;background:rgba(10,15,30,0.95);backdrop-filter:blur(20px);border-bottom:1px
solid rgba(201,168,76,0.15);}
.nav-logo{font-family:'Cormorant Garamond',serif;font-size:22px;font-
weight:400;letter-spacing:3px;color:#fff;text-decoration:none;text-
transform:uppercase;}
.nav-logo span{color:var(--gold);}
.nav-links-simple{display:flex;gap:28px;list-style:none;}
.nav-links-simple a{font-size:10px;letter-spacing:2.5px;text-
transform:uppercase;color:rgba(255,255,255,0.7);text-
decoration:none;transition:color 0.3s;}
.nav-links-simple a:hover{color:var(--gold);}
.nav-cta{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--
gold);border:1px solid var(--gold);padding:10px 22px;text-
decoration:none;transition:all 0.3s;}
.nav-cta:hover{background:var(--gold);color:var(--navy);}
@media(max-width:900px){.nav-links-simple{display:none;}nav{padding:16px 24px;}}
.hero-img{width:100%;height:520px;object-fit:cover;display:block;margin-top:62px;}
@media(max-width:600px){.hero-img{height:260px;}}
.badge-strip{background:var(--navy);padding:16px 60px;display:flex;align-
items:center;gap:16px;}
@media(max-width:600px){.badge-strip{padding:14px 24px;}}
.badge{font-size:8px;letter-spacing:3px;text-transform:uppercase;padding:6px
14px;font-weight:600;font-family:'Montserrat',sans-serif;}
.badge-sale{background:var(--gold);color:var(--navy);}
.badge-new{background:#1a6b3a;color:#fff;}
.badge-reduced{background:#8b1a1a;color:#fff;}
.badge-offmarket{background:#1a3a6b;color:#fff;}
.badge-charter{background:#4a1a6b;color:#fff;}.title-band{background:var(--navy);padding:8px 60px 32px;}
@media(max-width:600px){.title-band{padding:8px 24px 28px;}}
.yacht-title{font-family:'Cormorant Garamond',serif;font-
size:clamp(36px,6vw,64px);font-weight:300;letter-spacing:1px;margin-bottom:8px;}
.yacht-subtitle{color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1.5px;}
.gold-bar{height:3px;background:linear-gradient(90deg,var(--gold),var(--gold-
light),var(--gold));}
.specs-bar{background:var(--navy);}
.specs-bar table{width:100%;border-collapse:collapse;}
.specs-bar td{padding:20px;text-align:center;border-right:1px solid
rgba(201,168,76,0.12);}
.specs-bar td:last-child{border-right:none;}
.spec-val{color:var(--gold);font-size:17px;font-weight:600;font-
family:'Montserrat',sans-serif;}
.spec-key{color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:2px;text-
transform:uppercase;margin-top:4px;font-family:'Montserrat',sans-serif;}
@media(max-width:600px){.specs-bar td{padding:14px 8px;}.spec-val{font-
size:13px;}.spec-key{font-size:7px;}}
.main{max-width:900px;margin:0 auto;padding:60px 40px;}
@media(max-width:600px){.main{padding:40px 20px;}}
.section-label{color:var(--gold);font-size:9px;letter-spacing:4px;text-
transform:uppercase;margin-bottom:16px;font-family:'Montserrat',sans-serif;}
.desc{color:rgba(255,255,255,0.65);font-size:14px;line-height:2;margin-
bottom:40px;}
.price-block{background:#111827;border:1px solid rgba(201,168,76,0.2);padding:32px
40px;margin-bottom:40px;display:flex;align-items:center;justify-content:space-
between;flex-wrap:wrap;gap:20px;}
@media(max-width:600px){.price-block{padding:24px 20px;}}
.cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:60px;}
.btn-enquire{background:var(--gold);color:var(--navy);padding:16px 40px;font-
size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:600;text-
decoration:none;transition:all 0.3s;font-family:'Montserrat',sans-
serif;display:inline-block;}
.btn-enquire:hover{background:var(--gold-light);}
.btn-brochure{background:transparent;color:var(--gold);border:1px solid var(--
gold);padding:15px 40px;font-size:10px;letter-spacing:3px;text-
transform:uppercase;font-weight:600;text-decoration:none;transition:all 0.3s;font-
family:'Montserrat',sans-serif;display:inline-block;}
.btn-brochure:hover{background:var(--gold);color:var(--navy);}
.btn-back{background:transparent;color:rgba(255,255,255,0.4);border:1px solid
rgba(255,255,255,0.15);padding:15px 40px;font-size:10px;letter-spacing:3px;text-
transform:uppercase;text-decoration:none;transition:all 0.3s;font-
family:'Montserrat',sans-serif;display:inline-block;}
.btn-back:hover{color:#fff;border-color:rgba(255,255,255,0.4);}
footer{background:#060a14;padding:40px 60px;border-top:1px solid
rgba(201,168,76,0.15);text-align:center;}
footer p{color:rgba(255,255,255,0.25);font-size:10px;letter-spacing:1px;}
footer a{color:var(--gold);text-decoration:none;}
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>
<nav>
<a href="/" class="nav-logo">Yacht <span>Research</span></a>
<ul class="nav-links-simple">
<li><a href="/#yachts">Buy</a></li>
<li><a href="/listings.html" style="color:var(--gold);">Listings</a></li><li><a href="/#charter">Charter</a></li>
<li><a href="/why-us.html">Why Us</a></li>
<li><a href="/partnerships.html">Partnerships</a></li>
<li><a href="/#contact">Contact</a></li>
</ul>
<a href="/yacht-research-form.html" class="nav-cta">Enquire Now</a>
</nav>
${y.image ? `<img class="hero-img" src="${y.image}" alt="${title}" />` : `<div
style="height:62px;"></div>`}
<div class="badge-strip">
<span class="badge ${getBadgeClass(y.badge)}">${badge}</span>
</div>
<div class="title-band">
<h1 class="yacht-title">${title}</h1>
<p class="yacht-subtitle">${[y.year, y.length, y.location].filter(Boolean).join('
&nbsp;&middot;&nbsp; ')}</p>
</div>
<div class="gold-bar"></div>
<div class="specs-bar">
<table>
<tr>
${y.length ? `<td><p class="spec-val">${y.length}</p><p class="spec-
key">Length</p></td>` : ''}
${y.year ? `<td><p class="spec-val">${y.year}</p><p class="spec-key">Year
Built</p></td>` : ''}
${y.location ? `<td><p class="spec-val">${y.location}</p><p class="spec-
key">Location</p></td>` : ''}
<td><p class="spec-val">Yacht Research</p><p class="spec-key">Listed
By</p></td>
</tr>
</table>
</div>
<div class="main">
<p class="section-label">About this Listing</p>
<p class="desc">${title} is presented for sale by Yacht Research, international
luxury yacht brokerage specialising in sales, off-market acquisitions and buyer
representation in Dubai, the French Riviera and the Mediterranean. All enquiries
are handled with complete discretion.</p>
<div class="price-block">
<div>
<p class="section-label">Asking Price</p>
<div>${priceDisplay(y)}</div>
</div>
<div style="font-size:10px;color:rgba(255,255,255,0.3);letter-
spacing:1px;">Taxes excluded &nbsp;&middot;&nbsp; All enquiries treated with
discretion</div>
</div>
<div class="cta-row">
<a href="/yacht-research-form.html" class="btn-enquire">Enquire About This
Yacht</a>${y.brochure ? `<a href="${y.brochure}" target="_blank" class="btnbrochure">Download Brochure</a>` : ''} <a href="/listings.html" class="btn-back">← All Listings</a>
</div>
</div> <footer>
<p style="margin-bottom:8px;">
<a href="https://yachtresearchgroup.com">Yacht Research</a> &nbsp;&middot;&nbsp;
Dubai &middot; French Riviera &middot; Mediterranean </p>
<p>&copy; 2026 Yacht Research &nbsp;&middot;&nbsp; <a href="/privacypolicy.html">Privacy Policy</a></p> </footer>
<script> var
cur=document.getElementById('cursor'),ring=document.getElementById('cursorRing'),mx =0,my=0,rx=0,ry=0;
if(cur&&ring){document.addEventListener('mousemove',function(e) {mx=e.clientX;my=e.clientY;cur.style.left=mx-4+'px';cur.style.top=my-4+'px';}); (function anim(){rx+=(mx-rx-16)*0.15;ry+=(myry-16)*0.15;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(an im);})();} </script> </body> </html>`; }
function getBadgeClass(badge) { if (!badge) return 'badge-sale'; const b = badge.toLowerCase(); if (b.includes('new')) return 'badge-new'; if (b.includes('reduced') || b.includes('price')) return 'badge-reduced'; if (b.includes('off') || b.includes('market')) return 'badge-offmarket'; if (b.includes('charter')) return 'badge-charter'; return 'badge-sale';
} function notFoundHTML() {
return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Yacht Not Found | Yacht Research</title><meta name="robots" content="noindex"></head><body style="background:#0a0f1e;color:#fff;font-family:sans-serif;display:flex;alignitems:center;justify-content:center;height:100vh;text-align:center;"><div><h1 style="color:#c9a84c;font-size:48px;font-weight:300;">404</h1><p style="margin:16px 0;">This listing is no longer available.</p><a href="/listings.html" style="color:#c9a84c;">View All Listings →</a></div></body></html>`;
}
