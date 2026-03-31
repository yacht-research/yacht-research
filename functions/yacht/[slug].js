export async function onRequest(context) {
  const slug = context.params.slug;

  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  const baseUrl = new URL(context.request.url).origin;
  let yacht = null;

  try {
    const res = await fetch(baseUrl + '/content/yachts/' + slug + '.json');
    if (!res.ok) {
      return new Response(notFoundHTML(), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    yacht = await res.json();
  } catch (e) {
    return new Response(notFoundHTML(), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (!yacht || yacht.published === false) {
    return new Response(notFoundHTML(), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  const html = renderYachtPage(yacht, slug, baseUrl);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

function getBadgeLabel(badge) {
  if (!badge) return 'For Sale';
  const b = badge.toLowerCase();
  if (b.includes('new')) return 'New Listing';
  if (b.includes('reduced') || b.includes('price')) return 'Price Reduced';
  if (b.includes('off') || b.includes('market')) return 'Off Market';
  if (b.includes('charter')) return 'Charter Ready';
  return badge;
}

function getBadgeClass(badge) {
  if (!badge) return 'badge-sale';
  const b = badge.toLowerCase();
  if (b.includes('new')) return 'badge-new';
  if (b.includes('reduced') || b.includes('price')) return 'badge-reduced';
  if (b.includes('off') || b.includes('market')) return 'badge-offmarket';
  if (b.includes('charter')) return 'badge-charter';
  return 'badge-sale';
}

function getPriceCurrency(price) {
  if (!price) return 'EUR';
  if (price.includes('£') || price.includes('GBP')) return 'GBP';
  if (price.includes('AED')) return 'AED';
  return 'EUR';
}

function priceDisplay(yacht) {
  if (yacht.original_price && yacht.price) {
    return '<span style="text-decoration:line-through;color:rgba(255,255,255,0.35);font-size:14px;margin-right:10px;">'
      + yacht.original_price
      + '</span><span style="color:#c9a84c;font-size:22px;font-weight:300;">'
      + yacht.price
      + '</span>';
  }
  if (!yacht.price || yacht.price === '') {
    return '<span style="color:#c9a84c;font-size:22px;font-weight:300;">Price on Request</span>';
  }
  return '<span style="color:#c9a84c;font-size:22px;font-weight:300;">' + yacht.price + '</span>';
}

function buildSpecsRow(yacht) {
  let cells = '';
  if (yacht.length) {
    cells += '<td><p class="spec-val">' + yacht.length + '</p><p class="spec-key">Length</p></td>';
  }
  if (yacht.year) {
    cells += '<td><p class="spec-val">' + yacht.year + '</p><p class="spec-key">Year Built</p></td>';
  }
  if (yacht.location) {
    cells += '<td><p class="spec-val">' + yacht.location + '</p><p class="spec-key">Location</p></td>';
  }
  cells += '<td><p class="spec-val">Yacht Research</p><p class="spec-key">Listed By</p></td>';
  return cells;
}

function renderYachtPage(y, slug, baseUrl) {
  const title = y.title || 'Yacht for Sale';
  const location = y.location || 'Mediterranean';
  const desc = title + ' for sale — '
    + (y.year ? y.year + ' · ' : '')
    + (y.length ? y.length + ' · ' : '')
    + location
    + '. Listed by Yacht Research, international luxury yacht brokerage.'
    + (y.price ? ' Asking price : ' + y.price + '.' : ' Price on Request.');
  const canonical = baseUrl + '/yacht/' + slug;
  const image = y.image || (baseUrl + '/images/uploads/hero-yacht-BzzzVtkx.jpg');
  const badge = getBadgeLabel(y.badge);
  const badgeCls = getBadgeClass(y.badge);
  const subtitle = [y.year, y.length, y.location].filter(Boolean).join(' &middot; ');
  const currency = getPriceCurrency(y.price);

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
      "priceCurrency": currency,
      "price": y.price || 'Price on Request',
      "availability": "https://schema.org/InStock",
      "url": canonical,
      "seller": { "@type": "Organization", "name": "Yacht Research", "url": baseUrl }
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Length", "value": y.length || '' },
      { "@type": "PropertyValue", "name": "Year Built", "value": y.year || '' },
      { "@type": "PropertyValue", "name": "Location", "value": y.location || '' }
    ]
  });

  const heroImg = y.image
    ? '<img class="hero-img" src="' + y.image + '" alt="' + title + '" />'
    : '<div style="height:62px;"></div>';

  const brochureBtn = y.brochure
    ? '<a href="' + y.brochure + '" target="_blank" class="btn-brochure">Download Brochure</a>'
    : '';

  return '<!DOCTYPE html>\n'
    + '<html lang="en">\n'
    + '<head>\n'
    + '<meta charset="UTF-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '<meta name="robots" content="index, follow">\n'
    + '<title>' + title + ' for Sale | Yacht Research</title>\n'
    + '<meta name="description" content="' + desc + '">\n'
    + '<meta name="keywords" content="' + title + ' for sale, buy ' + title + ', ' + location + ' yacht for sale, luxury yacht broker, Yacht Research">\n'
    + '<meta name="author" content="Yacht Research">\n'
    + '<link rel="canonical" href="' + canonical + '">\n'
    + '<meta property="og:type" content="website">\n'
    + '<meta property="og:url" content="' + canonical + '">\n'
    + '<meta property="og:title" content="' + title + ' for Sale | Yacht Research">\n'
    + '<meta property="og:description" content="' + desc + '">\n'
    + '<meta property="og:image" content="' + image + '">\n'
    + '<meta property="og:site_name" content="Yacht Research">\n'
    + '<meta name="twitter:card" content="summary_large_image">\n'
    + '<meta name="twitter:title" content="' + title + ' for Sale | Yacht Research">\n'
    + '<meta name="twitter:description" content="' + desc + '">\n'
    + '<meta name="twitter:image" content="' + image + '">\n'
    + '<script type="application/ld+json">' + schema + '</script>\n'
    + '<link rel="icon" type="image/x-icon" href="/favicon.ico">\n'
    + '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    + '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@200;300;400;500&display=swap" rel="stylesheet">\n'
    + '<style>\n'
    + '*{margin:0;padding:0;box-sizing:border-box;}\n'
    + ':root{--navy:#0a0f1e;--navy-mid:#111827;--gold:#c9a84c;--gold-light:#e2c97e;}\n'
    + 'body{background:var(--navy);color:#fff;font-family:\'Montserrat\',sans-serif;cursor:none;}\n'
    + '.cursor{position:fixed;width:8px;height:8px;background:var(--gold);border-radius:50%;pointer-events:none;z-index:9999;}\n'
    + '.cursor-ring{position:fixed;width:32px;height:32px;border:1px solid rgba(201,168,76,0.5);border-radius:50%;pointer-events:none;z-index:9998;transition:all 0.15s ease;}\n'
    + 'nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:20px 60px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,15,30,0.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(201,168,76,0.15);}\n'
    + '.nav-logo{font-family:\'Cormorant Garamond\',serif;font-size:22px;font-weight:400;letter-spacing:3px;color:#fff;text-decoration:none;text-transform:uppercase;}\n'
    + '.nav-logo span{color:var(--gold);}\n'
    + '.nav-links-simple{display:flex;gap:28px;list-style:none;}\n'
    + '.nav-links-simple a{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.7);text-decoration:none;transition:color 0.3s;}\n'
    + '.nav-links-simple a:hover{color:var(--gold);}\n'
    + '.nav-cta{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);border:1px solid var(--gold);padding:10px 22px;text-decoration:none;transition:all 0.3s;}\n'
    + '.nav-cta:hover{background:var(--gold);color:var(--navy);}\n'
    + '@media(max-width:900px){.nav-links-simple{display:none;}nav{padding:16px 24px;}}\n'
    + '.hero-img{width:100%;height:520px;object-fit:cover;display:block;margin-top:62px;}\n'
    + '@media(max-width:600px){.hero-img{height:260px;}}\n'
    + '.badge-strip{background:var(--navy);padding:16px 60px;}\n'
    + '@media(max-width:600px){.badge-strip{padding:14px 24px;}}\n'
    + '.badge{font-size:8px;letter-spacing:3px;text-transform:uppercase;padding:6px 14px;font-weight:600;font-family:\'Montserrat\',sans-serif;}\n'
    + '.badge-sale{background:var(--gold);color:var(--navy);}\n'
    + '.badge-new{background:#1a6b3a;color:#fff;}\n'
    + '.badge-reduced{background:#8b1a1a;color:#fff;}\n'
    + '.badge-offmarket{background:#1a3a6b;color:#fff;}\n'
    + '.badge-charter{background:#4a1a6b;color:#fff;}\n'
    + '.title-band{background:var(--navy);padding:8px 60px 32px;}\n'
    + '@media(max-width:600px){.title-band{padding:8px 24px 28px;}}\n'
    + '.yacht-title{font-family:\'Cormorant Garamond\',serif;font-size:clamp(36px,6vw,64px);font-weight:300;letter-spacing:1px;margin-bottom:8px;}\n'
    + '.yacht-subtitle{color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1.5px;}\n'
    + '.gold-bar{height:3px;background:linear-gradient(90deg,var(--gold),var(--gold-light),var(--gold));}\n'
    + '.specs-bar{background:var(--navy);}\n'
    + '.specs-bar table{width:100%;border-collapse:collapse;}\n'
    + '.specs-bar td{padding:20px;text-align:center;border-right:1px solid rgba(201,168,76,0.12);}\n'
    + '.specs-bar td:last-child{border-right:none;}\n'
    + '.spec-val{color:var(--gold);font-size:17px;font-weight:600;font-family:\'Montserrat\',sans-serif;}\n'
    + '.spec-key{color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;font-family:\'Montserrat\',sans-serif;}\n'
    + '@media(max-width:600px){.specs-bar td{padding:14px 8px;}.spec-val{font-size:13px;}.spec-key{font-size:7px;}}\n'
    + '.main{max-width:900px;margin:0 auto;padding:60px 40px;}\n'
    + '@media(max-width:600px){.main{padding:40px 20px;}}\n'
    + '.section-label{color:var(--gold);font-size:9px;letter-spacing:4px;text-transform:uppercase;margin-bottom:16px;font-family:\'Montserrat\',sans-serif;}\n'
    + '.desc{color:rgba(255,255,255,0.65);font-size:14px;line-height:2;margin-bottom:40px;}\n'
    + '.price-block{background:#111827;border:1px solid rgba(201,168,76,0.2);padding:32px 40px;margin-bottom:40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;}\n'
    + '@media(max-width:600px){.price-block{padding:24px 20px;flex-direction:column;align-items:flex-start;}}\n'
    + '.cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:60px;}\n'
    + '.btn-enquire{background:var(--gold);color:var(--navy);padding:16px 40px;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:600;text-decoration:none;transition:all 0.3s;font-family:\'Montserrat\',sans-serif;display:inline-block;}\n'
    + '.btn-enquire:hover{background:var(--gold-light);}\n'
    + '.btn-brochure{background:transparent;color:var(--gold);border:1px solid var(--gold);padding:15px 40px;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:600;text-decoration:none;transition:all 0.3s;font-family:\'Montserrat\',sans-serif;display:inline-block;}\n'
    + '.btn-brochure:hover{background:var(--gold);color:var(--navy);}\n'
    + '.btn-back{background:transparent;color:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.15);padding:15px 40px;font-size:10px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;transition:all 0.3s;font-family:\'Montserrat\',sans-serif;display:inline-block;}\n'
    + '.btn-back:hover{color:#fff;border-color:rgba(255,255,255,0.4);}\n'
    + 'footer{background:#060a14;padding:40px 60px;border-top:1px solid rgba(201,168,76,0.15);text-align:center;}\n'
    + 'footer p{color:rgba(255,255,255,0.25);font-size:10px;letter-spacing:1px;}\n'
    + 'footer a{color:var(--gold);text-decoration:none;}\n'
    + '</style>\n'
    + '</head>\n'
    + '<body>\n'
    + '<div class="cursor" id="cursor"></div>\n'
    + '<div class="cursor-ring" id="cursorRing"></div>\n'
    + '<nav>\n'
    + '  <a href="/" class="nav-logo">Yacht <span>Research</span></a>\n'
    + '  <ul class="nav-links-simple">\n'
    + '    <li><a href="/#yachts">Buy</a></li>\n'
    + '    <li><a href="/listings.html" style="color:var(--gold);">Listings</a></li>\n'
    + '    <li><a href="/#charter">Charter</a></li>\n'
    + '    <li><a href="/why-us.html">Why Us</a></li>\n'
    + '    <li><a href="/partnerships.html">Partnerships</a></li>\n'
    + '    <li><a href="/#contact">Contact</a></li>\n'
    + '  </ul>\n'
    + '  <a href="/yacht-research-form.html" class="nav-cta">Enquire Now</a>\n'
    + '</nav>\n'
    + heroImg + '\n'
    + '<div class="badge-strip">\n'
    + '  <span class="badge ' + badgeCls + '">' + badge + '</span>\n'
    + '</div>\n'
    + '<div class="title-band">\n'
    + '  <h1 class="yacht-title">' + title + '</h1>\n'
    + '  <p class="yacht-subtitle">' + subtitle + '</p>\n'
    + '</div>\n'
    + '<div class="gold-bar"></div>\n'
    + '<div class="specs-bar"><table><tr>' + buildSpecsRow(y) + '</tr></table></div>\n'
    + '<div class="main">\n'
    + '  <p class="section-label">About this Listing</p>\n'
    + '  <p class="desc">' + title + ' is presented for sale by Yacht Research, international luxury yacht brokerage specialising in sales, off-market acquisitions and buyer representation in Dubai, the French Riviera and the Mediterranean. All enquiries are handled with complete discretion.</p>\n'
    + '  <div class="price-block">\n'
    + '    <div>\n'
    + '      <p class="section-label">Asking Price</p>\n'
    + '      <div>' + priceDisplay(y) + '</div>\n'
    + '    </div>\n'
    + '    <div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:1px;">Taxes excluded &nbsp;&middot;&nbsp; All enquiries treated with discretion</div>\n'
    + '  </div>\n'
    + '  <div class="cta-row">\n'
    + '    <a href="/yacht-research-form.html" class="btn-enquire">Enquire About This Yacht</a>\n'
    + '    ' + brochureBtn + '\n'
    + '    <a href="/listings.html" class="btn-back">&#8592; All Listings</a>\n'
    + '  </div>\n'
    + '</div>\n'
    + '<footer>\n'
    + '  <p style="margin-bottom:8px;"><a href="https://yachtresearchgroup.com">Yacht Research</a> &nbsp;&middot;&nbsp; Dubai &middot; French Riviera &middot; Mediterranean</p>\n'
    + '  <p>&copy; 2026 Yacht Research &nbsp;&middot;&nbsp; <a href="/privacy-policy.html">Privacy Policy</a></p>\n'
    + '</footer>\n'
    + '<script>\n'
    + 'var cur=document.getElementById("cursor"),ring=document.getElementById("cursorRing"),mx=0,my=0,rx=0,ry=0;\n'
    + 'if(cur&&ring){document.addEventListener("mousemove",function(e){mx=e.clientX;my=e.clientY;cur.style.left=mx-4+"px";cur.style.top=my-4+"px";});(function anim(){rx+=(mx-rx-16)*0.15;ry+=(my-ry-16)*0.15;ring.style.left=rx+"px";ring.style.top=ry+"px";requestAnimationFrame(anim);})();}\n'
    + '</script>\n'
    + '</body>\n'
    + '</html>';
}

function notFoundHTML() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Yacht Not Found | Yacht Research</title>'
    + '<meta name="robots" content="noindex"></head>'
    + '<body style="background:#0a0f1e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;">'
    + '<div><h1 style="color:#c9a84c;font-size:48px;font-weight:300;">404</h1>'
    + '<p style="margin:16px 0;">This listing is no longer available.</p>'
    + '<a href="/listings.html" style="color:#c9a84c;">View All Listings &#8594;</a></div></body></html>';
}
