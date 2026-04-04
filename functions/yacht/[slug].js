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
      'X-Robots-Tag': 'index, follow',
      'Cache-Control': 'public, max-age=60, must-revalidate'
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
    return '<span style="text-decoration:line-through;color:rgba(255,255,255,0.35);font-size:14px;margin-right:12px;">'
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
  var cells = '';
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

function buildGallery(gallery) {
  if (!gallery || !Array.isArray(gallery) || gallery.length === 0) return '';

  var imgs = '';
  for (var i = 0; i < gallery.length; i++) {
    var url = typeof gallery[i] === 'string' ? gallery[i] : (gallery[i].url || '');
    if (url) {
      imgs += '<div class="gallery-item"><img src="' + url + '" alt="Photo ' + (i + 1) + '" loading="lazy" onclick="openLightbox(this.src)" /></div>';
    }
  }

  if (!imgs) return '';

  return '<div class="gallery-section">'
    + '<p class="section-label">Gallery</p>'
    + '<div class="gallery-grid">' + imgs + '</div>'
    + '</div>'
    + '<div class="lightbox" id="lightbox" onclick="closeLightbox()">'
    + '<img id="lightbox-img" src="" alt="Photo" />'
    + '</div>';
}

function renderYachtPage(y, slug, baseUrl) {
  var title = y.title || 'Yacht for Sale';
  var location = y.location || 'Mediterranean';
  var isCharter = y.badge && y.badge.toLowerCase().includes('charter');
  var description = y.description
    ? y.description
    : title + ' is a ' + (y.year ? y.year + ' ' : '') + (y.length ? y.length + ' ' : '') + 'yacht available for ' + (isCharter ? 'charter' : 'sale') + ' through Yacht Research. Located in ' + location + ', this vessel is available for immediate viewing. Contact our team for full specifications and survey reports.';
  var pageTitle = y.seo_title || (title + ' for ' + (isCharter ? 'Charter' : 'Sale') + ' | Yacht Research');
  var metaDesc = y.seo_description || (title + ' for ' + (isCharter ? 'charter' : 'sale')
    + (y.year ? ' · ' + y.year : '')
    + (y.length ? ' · ' + y.length : '')
    + ' · ' + location
    + '. Listed by Yacht Research, international luxury yacht brokerage.'
    + (y.price ? ' Asking price : ' + y.price + '.' : ' Price on Request.'));

  var canonical = baseUrl + '/yacht/' + slug;
  // Encode image URL to handle spaces and special chars
  var rawImage = y.image || (baseUrl + '/images/uploads/hero-yacht-BzzzVtkx.jpg');
  var image = rawImage.startsWith('http') ? rawImage : baseUrl + encodeURI(rawImage.startsWith('/') ? rawImage : '/' + rawImage);
  image = image.replace(/ /g, '%20');
  var badge = getBadgeLabel(y.badge);
  var badgeCls = getBadgeClass(y.badge);
  var subtitle = [y.year, y.length, y.location].filter(Boolean).join(' &nbsp;&middot;&nbsp; ');
  var currency = getPriceCurrency(y.price);

  // Extract numeric price for Schema.org (Google requires a plain number)
  var numericPrice = null;
  if (y.price) {
    var priceDigits = y.price.replace(/[^0-9]/g, '');
    if (priceDigits) numericPrice = parseFloat(priceDigits);
  }

  var offersObj = {
    "@type": "Offer",
    "priceCurrency": currency,
    "availability": "https://schema.org/InStock",
    "url": canonical,
    "priceValidUntil": "2027-12-31",
    "seller": { "@type": "Organization", "name": "Yacht Research", "url": baseUrl },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "FR",
      "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": currency },
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "AE" },
      "deliveryTime": { "@type": "ShippingDeliveryTime", "businessDays": { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"] } }
    }
  };
  if (numericPrice !== null) {
    offersObj["price"] = numericPrice;
  }

  var schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": title,
    "description": metaDesc,
    "url": canonical,
    "image": image,
    "brand": { "@type": "Brand", "name": "Yacht Research" },
    "offers": offersObj,
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Length", "value": y.length || '' },
      { "@type": "PropertyValue", "name": "Year Built", "value": y.year || '' },
      { "@type": "PropertyValue", "name": "Location", "value": y.location || '' }
    ]
  });

  var heroImg = image
    ? '<img class="hero-img" src="' + image + '" alt="' + title + '" />'
    : '<div style="height:62px;"></div>';

  var brochureBtn = y.brochure
    ? '<a href="' + y.brochure + '" target="_blank" class="btn-brochure">Download Brochure</a>'
    : '';

  var gallery = buildGallery(y.gallery);

  var enquireLabel = isCharter ? 'Enquire About Charter' : 'Enquire About This Yacht';
  var priceLabel = isCharter ? 'Charter Rate' : 'Asking Price';
  var listingsActive = isCharter ? '">' : '" class="active">';
  var charterActive = isCharter ? '" class="active">' : '">';

  return '<!DOCTYPE html>\n'
    + '<html lang="en">\n'
    + '<head>\n'
    + '<meta charset="UTF-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '<meta name="robots" content="index, follow">\n'
    + '<title>' + pageTitle + '</title>\n'
    + '<meta name="description" content="' + metaDesc + '">\n'
    + '<meta name="keywords" content="' + title + ' for sale, buy ' + title + ', ' + location + ' yacht for sale, luxury yacht broker, Yacht Research">\n'
    + '<meta name="author" content="Yacht Research">\n'
    + '<link rel="canonical" href="' + canonical + '">\n'
    + '<meta property="og:type" content="website">\n'
    + '<meta property="og:url" content="' + canonical + '">\n'
    + '<meta property="og:title" content="' + pageTitle + '">\n'
    + '<meta property="og:description" content="' + metaDesc + '">\n'
    + '<meta property="og:image" content="' + image + '">\n'
    + '<meta property="og:site_name" content="Yacht Research">\n'
    + '<meta name="twitter:card" content="summary_large_image">\n'
    + '<meta name="twitter:title" content="' + pageTitle + '">\n'
    + '<meta name="twitter:description" content="' + metaDesc + '">\n'
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
    + '.nav-center{display:flex;align-items:center;gap:0;max-width:min(620px,calc(100vw - 380px));overflow:hidden;}\n'
    + '.nav-scroll-btn{background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;padding:0 8px;line-height:1;transition:color 0.2s,opacity 0.35s ease;flex-shrink:0;opacity:0;pointer-events:none;}\n'
    + '.nav-scroll-btn.shown{opacity:1;pointer-events:auto;}\n'
    + '#navRight{opacity:1;pointer-events:auto;}\n'
    + '.nav-scroll-btn:hover{color:#c9a84c;}\n'
    + '.nav-links{display:flex;gap:28px;list-style:none;overflow-x:auto;white-space:nowrap;scrollbar-width:none;flex:1;min-width:0;}\n'
    + '.nav-links::-webkit-scrollbar{display:none;}\n'
    + '.nav-links a{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.7);text-decoration:none;transition:color 0.3s;}\n'
    + '.nav-links a:hover,.nav-links a.active{color:#c9a84c;}\n'
    + '.hero-enquire-btn{position:relative;display:inline-block;background:#c9a84c;color:#0a0f1e;font-family:\'Montserrat\',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:700;padding:12px 28px;text-decoration:none;overflow:hidden;box-shadow:0 0 20px rgba(201,168,76,0.45),0 0 40px rgba(201,168,76,0.15);transition:box-shadow 0.3s,transform 0.3s;}\n'
    + '.hero-enquire-btn:hover{box-shadow:0 0 32px rgba(201,168,76,0.8),0 0 64px rgba(201,168,76,0.35);transform:translateY(-2px);}\n'
    + '.hero-enquire-shine{position:absolute;top:0;left:-75%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent);transform:skewX(-20deg);animation:shine 2.8s infinite;}\n'
    + '@keyframes shine{0%{left:-75%;}60%,100%{left:130%;}}\n'
    + '.nav-cta{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);border:1px solid var(--gold);padding:10px 22px;text-decoration:none;transition:all 0.3s;}\n'
    + '.nav-cta:hover{background:var(--gold);color:var(--navy);}\n'
    + 'body.menu-open{overflow:hidden;position:fixed;width:100%;}\n'
    + '@media(max-width:1024px){nav{padding:16px 20px;}.nav-center{display:none;}.hero-enquire-btn{display:inline-block;font-size:8px;padding:8px 12px;letter-spacing:2px;}}\n'
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
    + '.contact-block{background:#0d1428;border:1px solid rgba(201,168,76,0.15);padding:32px 40px;margin-bottom:40px;}\n'
    + '@media(max-width:600px){.contact-block{padding:24px 20px;}}\n'
    + '.contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:24px;}\n'
    + '@media(max-width:600px){.contact-grid{grid-template-columns:1fr;}}\n'
    + '.contact-item{display:flex;flex-direction:column;gap:8px;}\n'
    + '.contact-label{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35);font-family:\'Montserrat\',sans-serif;}\n'
    + '.contact-value a{color:var(--gold);text-decoration:none;font-size:13px;font-family:\'Montserrat\',sans-serif;transition:opacity 0.2s;}\n'
    + '.contact-value a:hover{opacity:0.75;}\n'
    + '.gallery-section{margin-bottom:40px;}\n'
    + '.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;}\n'
    + '@media(max-width:600px){.gallery-grid{grid-template-columns:repeat(2,1fr);}}\n'
    + '.gallery-item img{width:100%;height:220px;object-fit:cover;cursor:pointer;transition:opacity 0.2s;display:block;}\n'
    + '.gallery-item img:hover{opacity:0.85;}\n'
    + '.lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;align-items:center;justify-content:center;cursor:zoom-out;}\n'
    + '.lightbox.open{display:flex;}\n'
    + '.lightbox img{max-width:90vw;max-height:90vh;object-fit:contain;}\n'
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
    + '  <a href="/" class="nav-logo" translate="no">Yacht <span>Research</span></a>\n'
    + '  <div class="nav-center">\n'
    + '    <button class="nav-scroll-btn" id="navLeft" onclick="scrollNav(-1)">&#8592;</button>\n'
    + '    <ul class="nav-links" id="navLinks">\n'
    + '      <li><a href="/#yachts">Buy</a></li>\n'
    + '      <li><a href="/listings.html' + listingsActive + 'Listings</a></li>\n'
    + '      <li><a href="/charter.html' + charterActive + 'Charter</a></li>\n'
    + '      <li><a href="/why-us.html">Why Us</a></li>\n'
    + '      <li><a href="/bespoke.html">Services</a></li>\n'
    + '      <li><a href="/partnerships.html">Partnerships</a></li>\n'
    + '      <li><a href="/recruitment.html">Recruitment</a></li>\n'
    + '      <li><a href="/#contact">Contact</a></li>\n'
    + '      <li><a href="/#newsletter-section" style="color:#c9a84c;">Newsletter</a></li>\n'
    + '    </ul>\n'
    + '    <button class="nav-scroll-btn" id="navRight" onclick="scrollNav(1)">&#8594;</button>\n'
    + '  </div>\n'
    + '  <a href="/yacht-research-form.html" class="hero-enquire-btn"><span class="hero-enquire-shine"></span>Enquire Now</a>\n'
    + '</nav>\n'
    + heroImg + '\n'
    + '<div class="badge-strip"><span class="badge ' + badgeCls + '">' + badge + '</span></div>\n'
    + '<div class="title-band">\n'
    + '  <h1 class="yacht-title">' + title + '</h1>\n'
    + '  <p class="yacht-subtitle">' + subtitle + '</p>\n'
    + '</div>\n'
    + '<div class="gold-bar"></div>\n'
    + '<div class="specs-bar"><table><tr>' + buildSpecsRow(y) + '</tr></table></div>\n'
    + '<div class="main">\n'
    + '  <p class="section-label">About this Vessel</p>\n'
    + '  <div class="desc" style="white-space:pre-line;">' + description + '</div>\n'
    + gallery + '\n'
    + '  <div class="price-block">\n'
    + '    <div><p class="section-label">' + priceLabel + '</p><div>' + priceDisplay(y) + '</div></div>\n'
    + '    <div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:1px;">Taxes excluded &nbsp;&middot;&nbsp; All enquiries treated with discretion</div>\n'
    + '  </div>\n'
    + '  <div class="contact-block">\n'
    + '    <p class="section-label">Contact Us</p>\n'
    + '    <p style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.8;">Our team is available to answer any question about this vessel and arrange a viewing.</p>\n'
    + '    <div class="contact-grid">\n'
    + '      <div class="contact-item"><span class="contact-label">Email</span><span class="contact-value"><a href="mailto:contact@yachtresearchgroup.com">contact@yachtresearchgroup.com</a></span></div>\n'
    + '      <div class="contact-item"><span class="contact-label">WhatsApp UAE</span><span class="contact-value"><a href="https://wa.me/qr/5NK5SR22CXGNC1" target="_blank">Message on WhatsApp</a></span></div>\n'
    + '      <div class="contact-item"><span class="contact-label">WhatsApp France</span><span class="contact-value"><a href="https://wa.me/message/CVQVHBO3GXLZP1" target="_blank">Message on WhatsApp</a></span></div>\n'
    + '    </div>\n'
    + '  </div>\n'
    + '  <div class="cta-row">\n'
    + '    <a href="/yacht-research-form.html" class="btn-enquire">' + enquireLabel + '</a>\n'
    + '    ' + brochureBtn + '\n'
    + '    <a href="' + (isCharter ? '/charter.html' : '/listings.html') + '" class="btn-back">&#8592; ' + (isCharter ? 'All Charters' : 'All Listings') + '</a>\n'
    + '  </div>\n'
    + '</div>\n'
    + '<footer>\n'
    + '  <p style="margin-bottom:8px;"><a href="https://yachtresearchgroup.com">Yacht Research</a> &nbsp;&middot;&nbsp; Dubai &middot; French Riviera &middot; Mediterranean</p>\n'
    + '  <p>&copy; 2026 Yacht Research &nbsp;&middot;&nbsp; <a href="/privacy-policy.html">Privacy Policy</a></p>\n'
    + '</footer>\n'
    + '<script>\n'
    + 'var cur=document.getElementById("cursor"),ring=document.getElementById("cursorRing"),mx=0,my=0,rx=0,ry=0;\n'
    + 'if(cur&&ring){document.addEventListener("mousemove",function(e){mx=e.clientX;my=e.clientY;cur.style.left=mx-4+"px";cur.style.top=my-4+"px";});(function anim(){rx+=(mx-rx-16)*0.15;ry+=(my-ry-16)*0.15;ring.style.left=rx+"px";ring.style.top=ry+"px";requestAnimationFrame(anim);})();}\n'
    + 'function scrollNav(d){var n=document.getElementById("navLinks");if(n)n.scrollTo({left:n.scrollLeft+d*200,behavior:"smooth"});setTimeout(syncArrows,300);}\n'
    + 'function syncArrows(){var n=document.getElementById("navLinks"),l=document.getElementById("navLeft"),r=document.getElementById("navRight");if(!n)return;if(l)l.classList.toggle("shown",n.scrollLeft>2);if(r)r.classList.toggle("shown",n.scrollLeft<n.scrollWidth-n.clientWidth-2);}\n'
    + 'function initNav(){var n=document.getElementById("navLinks"),r=document.getElementById("navRight");if(!n||!r)return;n.addEventListener("scroll",syncArrows);syncArrows();}\n'
    + 'window.addEventListener("load",function(){initNav();[200,500,1000].forEach(function(t){setTimeout(syncArrows,t);});});\n'
    + 'if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){initNav();setTimeout(syncArrows,200);});\n'
    + 'window.addEventListener("resize",function(){var n=document.getElementById("navLinks"),r=document.getElementById("navRight");if(n&&r){r.classList.toggle("shown",n.scrollWidth>n.clientWidth+2);}syncArrows();});\n'
    + 'function openLightbox(src){var lb=document.getElementById("lightbox");var img=document.getElementById("lightbox-img");if(lb&&img){img.src=src;lb.classList.add("open");}}\n'
    + 'function closeLightbox(){var lb=document.getElementById("lightbox");if(lb)lb.classList.remove("open");}\n'
    + 'document.addEventListener("keydown",function(e){if(e.key==="Escape")closeLightbox();});\n'
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
