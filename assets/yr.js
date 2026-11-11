/* Yacht Research : animations et interactions communes à toutes les pages */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var nav = $('#nav');
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwT-6-C2qRtUhX4MXVhFzNUd5t1By9PDNdHfZ3krMiW8LIVgnC6ry-Qyon7Fam2B0gd/exec';

  // ---------- Vitesse : une fois la page affichée, les images plus bas se chargent en fond ----------
  // (sinon elles ne partent qu'au moment où on fait défiler, et arrivent en retard)
  window.addEventListener('load', function(){
    var go = function(){ $$('img[loading="lazy"]').forEach(function(im){ im.loading = 'eager'; }); };
    if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 800);
  });

  var swoosh = $('#heroSwoosh');
  if (swoosh) setTimeout(function(){ swoosh.classList.add('is-in'); }, 60);

  // ---------- Menu mobile ----------
  var burger = $('#burger');
  if (burger) burger.addEventListener('click', function(){ document.body.classList.toggle('menu-open'); });
  $$('#menu a').forEach(function(a){ a.addEventListener('click', function(){ document.body.classList.remove('menu-open'); }); });

  // ---------- Titres : découpe mot par mot ----------
  function splitWords(h){
    var i = 0;
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(part){
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'wd';
            var s = document.createElement('span'); s.textContent = part; s.style.transitionDelay = (i++ * 0.07) + 's';
            w.appendChild(s); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(h);
  }
  $$('.split-words').forEach(splitWords);

  // ---------- Manifeste : mots qui s'allument au scroll ----------
  var man = $('#manifesto'), words = [];
  if (man) {
    (function wrap(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(part){
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'w' + (node.classList && node.classList.contains('acc') ? ' acc' : ''); s.textContent = part; words.push(s); frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) wrap(n);
      });
    })(man);
    $$('span.acc', man).forEach(function(a){ a.style.opacity = 1; });
  }

  // ---------- Apparitions ----------
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.dataset.count) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  function observe(root){
    $$('.rv,.split-words,.clip,.step,[data-count]', root).forEach(function(el){ if (io) io.observe(el); else el.classList.add('is-in'); });
  }
  observe(document);

  function countUp(el){
    var end = +el.dataset.count, sup = el.querySelector('sup'), t0 = null;
    if (sup) { el.innerHTML = '0'; el.appendChild(sup); }
    if (reduce) { el.firstChild.nodeValue = end; return; }
    function f(t){ if (!t0) t0 = t; var p = Math.min((t - t0) / 1600, 1);
      el.firstChild.nodeValue = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }

  // ---------- Services : image qui suit la ligne active ----------
  var svcItems = $$('#svc li'), svcImgs = $$('#svcClip img');
  function setSvc(i){ svcItems.forEach(function(li){ li.classList.toggle('on', li.dataset.i == i); }); svcImgs.forEach(function(im){ im.classList.toggle('on', im.dataset.i == i); }); }
  svcItems.forEach(function(li){ li.addEventListener('mouseenter', function(){ setSvc(li.dataset.i); }); li.addEventListener('click', function(){ setSvc(li.dataset.i); }); });

  // ---------- Lueur qui suit la souris ----------
  $$('.pillar').forEach(function(p){ p.addEventListener('pointermove', function(e){ var r = p.getBoundingClientRect(); p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------- Cartes yachts (alimentées par /content/yachts/index.json) ----------
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function badgeLabel(b, type){
    b = (b || '').toLowerCase();
    if (type === 'charter') return 'Charter';
    if (b.indexOf('exclusive') > -1) return 'Exclusive price';
    if (b.indexOf('reduc') > -1 || b.indexOf('price') > -1) return 'Price reduced';
    if (b.indexOf('off') > -1) return 'Off market';
    if (b.indexOf('new') > -1) return 'New listing';
    return 'For sale';
  }
  function splitTitle(y){
    // "Sunseeker 88 Yacht" -> "Sunseeker <em>88 Yacht</em>" ; "AGAPA - Sunseeker Predator 84" -> "<em>Agapa</em>"
    var t = y.title || '';
    if (t.indexOf(' - ') > -1) t = t.split(' - ')[0].toLowerCase().replace(/(^|\s)\S/g, function(c){ return c.toUpperCase(); });
    var parts = t.split(' ');
    if (parts.length === 1) return '<em>' + esc(t) + '</em>';
    if (parts.length < 2) return esc(t);
    return esc(parts[0]) + ' <em>' + esc(parts.slice(1).join(' ')) + '</em>';
  }
  function shortLen(l){ var m = String(l || '').match(/[\d.,]+\s*m\b/i); return m ? m[0].replace(/\s+/g, ' ').replace(/(\.\d)\d+/, '$1') : (l || ''); }
  function card(y, i){
    var sub = [y.builder || '', y.year, y.location].filter(Boolean).join(' · ');
    if (y.type === 'charter' && y.title.indexOf(' - ') > -1) sub = y.title.split(' - ').slice(1).join(' - ') + (y.location ? ' · ' + y.location : '');
    var specs = y.type === 'charter' ? '' :
      '<div class="specs"><div><b>' + esc(shortLen(y.length) || '—') + '</b><span>Length</span></div>' +
      (y.guests ? '<div><b>' + esc(y.guests) + '</b><span>Guests</span></div>' : '<div><b>' + esc(y.year || '—') + '</b><span>Year</span></div>') +
      (y.cabins ? '<div><b>' + esc(y.cabins) + '</b><span>Cabins</span></div>' : '<div><b>' + esc((y.location || '—').split(',')[0]) + '</b><span>Location</span></div>') + '</div>';
    var price = y.original_price ? '<span><s>' + esc(y.original_price) + '</s> ' + esc(y.price) + '</span>' : esc(y.price || 'Price on request');
    return '<a class="card rv' + (i % 4 ? ' d' + (i % 4) : '') + '" href="/yacht/' + esc(y.slug) + '">' +
      '<div class="ph"><img src="' + esc(y.thumb || y.image) + '" alt="' + esc(y.title) + (y.type === 'charter' ? ' yacht charter' : ' for sale') + '" loading="lazy"><span class="tag">' + badgeLabel(y.badge, y.type) + '</span></div>' +
      '<div class="bd"><small>' + esc(sub) + '</small><h4>' + splitTitle(y) + '</h4>' + specs +
      '<div class="price">' + price + ' <i>→</i></div></div></a>';
  }
  window.YR = { card: card, observe: observe, esc: esc };

  var targets = $$('[data-yachts]');
  if (targets.length) {
    fetch('/content/yachts/index.json').then(function(r){ return r.ok ? r.json() : null; }).then(function(data){
      if (!data || !data.yachts) return;
      targets.forEach(function(el){
        var ex = el.dataset.exclude || '';
        var list = data.yachts.filter(function(y){ return y.type === el.dataset.yachts && y.slug !== ex; });
        var lim = +el.dataset.limit || list.length;
        if (!list.length) return;
        el.innerHTML = list.slice(0, lim).map(card).join('');
        observe(el);
        el.dispatchEvent(new Event('scroll'));
      });
    }).catch(function(){});
  }

  // ---------- Carrousels : flèches, glisser à la souris, progression ----------
  $$('.rail').forEach(function(rail){
    var wrap = rail.parentNode, prog = $('.progress i', wrap);
    var prev = $('[data-prev]', wrap), next = $('[data-next]', wrap);
    function step(d){ var c = $('.card', rail); rail.scrollBy({ left: d * ((c ? c.offsetWidth : 300) + 20), behavior: 'smooth' }); }
    if (prev) prev.onclick = function(){ step(-1); };
    if (next) next.onclick = function(){ step(1); };
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function(e){ if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add('drag'); });
    window.addEventListener('pointerup', function(){ down = false; rail.classList.remove('drag'); });
    rail.addEventListener('pointermove', function(e){ if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; rail.scrollLeft = sl - dx; });
    rail.addEventListener('click', function(e){ if (moved) { e.preventDefault(); moved = false; } }, true);
    rail.addEventListener('dragstart', function(e){ e.preventDefault(); });
    function railProg(){ if (!prog) return; var max = rail.scrollWidth - rail.clientWidth, w = rail.clientWidth / rail.scrollWidth; prog.style.width = (w * 100) + '%'; prog.style.transform = 'translateX(' + (max ? rail.scrollLeft / max * (1 / w - 1) * 100 : 0) + '%)'; }
    rail.addEventListener('scroll', railProg, { passive: true }); window.addEventListener('resize', railProg); railProg();
  });

  // ---------- Galerie plein écran : toutes les photos, flèches, clavier, glisser au doigt ----------
  var lb = $('#lb');
  if (lb) {
    var lbImg = $('img', lb), shots = $$('.yp-shot'), urls = [], cur = 0;
    shots.forEach(function(b){ if (urls.indexOf(b.dataset.full) < 0) urls.push(b.dataset.full); });
    lb.insertAdjacentHTML('beforeend', '<button type="button" class="lb-nav lb-prev" aria-label="Previous photo">‹</button><button type="button" class="lb-nav lb-next" aria-label="Next photo">›</button><span class="lb-count"></span>');
    var cnt = $('.lb-count', lb), multi = urls.length > 1;
    if (!multi) lb.classList.add('lb-one');
    function show(i){ cur = (i + urls.length) % urls.length; lbImg.src = urls[cur]; cnt.textContent = (cur + 1) + ' / ' + urls.length;
      var n = new Image(); n.src = urls[(cur + 1) % urls.length]; }
    function openLb(u){ show(Math.max(0, urls.indexOf(u))); lb.hidden = false; document.body.style.overflow = 'hidden'; }
    function closeLb(){ lb.hidden = true; lbImg.src = ''; document.body.style.overflow = ''; }
    shots.forEach(function(b){ b.addEventListener('click', function(){ openLb(b.dataset.full); }); });
    $('.lb-prev', lb).addEventListener('click', function(e){ e.stopPropagation(); show(cur - 1); });
    $('.lb-next', lb).addEventListener('click', function(e){ e.stopPropagation(); show(cur + 1); });
    lbImg.addEventListener('click', function(e){ e.stopPropagation(); if (multi) show(cur + 1); });
    lb.addEventListener('click', closeLb);
    document.addEventListener('keydown', function(e){ if (lb.hidden) return; if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowRight') show(cur + 1); else if (e.key === 'ArrowLeft') show(cur - 1); });
    var tx = null;
    lb.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function(e){ if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
  }

  // ---------- Newsletter (même Google Apps Script que l'ancien site) ----------
  $$('.news-form').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var fn = f.querySelector('[name=firstname]'), em = f.querySelector('[name=email]');
      if (!fn.value.trim() || !em.value.trim()) return;
      var params = new URLSearchParams({ form_name: 'Newsletter', firstname: fn.value.trim(), lastname: '', email: em.value.trim() });
      fetch(APPS_SCRIPT_URL, { method: 'POST', body: params, mode: 'no-cors' }).catch(function(){});
      f.classList.add('done');
    });
  });

  // ---------- Lien actif dans le menu ----------
  var here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  var crumb = $('.yp-crumb a + a, .lx-crumb a + a');
  if (/^\/yacht\//.test(here) && crumb) here = crumb.getAttribute('href');
  $$('.nav-links a, #menu a').forEach(function(a){ var p = a.getAttribute('href') || ''; if (p.charAt(0) === '/' && p.indexOf('#') < 0 && p.length > 1 && (p === here || here.indexOf(p + '/') === 0) || (p === '/' && here === '/')) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); } });

  // ---------- Catalogues (Listings / Charter) : filtres, tri, ?location= ----------
  var cat = $('#cat');
  if (cat) {
    var grid = $('[data-grid]', cat), countOut = $('[data-count-out]', cat), type = cat.dataset.cat, all = [];
    var st = { q: '', min: '', max: '', len: '', year: '', sort: 'price-desc', tag: '', loc: '' };
    var LOC = {
      'Mediterranean': /mediterr|france|monaco|ital|greece|croatia|spain|cannes|antibes|riviera|corsica|ibiza|mallorca|turkey|istanbul|saint-tropez/i,
      'Dubai': /dubai|uae|abu dhabi|oman|bahrain|qatar|gulf/i,
      'Caribbean': /caribb|bahamas|barth|bvi|virgin|antigua/i,
      'Indian Ocean': /maldives|seychelles|indian ocean|mauritius|thailand|phuket/i
    };
    var lenM = function(l){ var s = String(l || ''), m = s.match(/([\d.,]+)\s*m\b/i); if (m) return parseFloat(m[1].replace(',', '.')); var f = s.match(/([\d.]+)\s*ft/i); return f ? parseFloat(f[1]) * 0.3048 : 0; };
    var yearN = function(y){ var m = String(y || '').match(/(19|20)\d\d/); return m ? +m[0] : 0; };
    var tagOf = function(b){ b = (b || '').toLowerCase(); return b.indexOf('reduc') > -1 || b.indexOf('price') > -1 ? 'reduced' : b.indexOf('off') > -1 ? 'offmarket' : b.indexOf('new') > -1 ? 'new' : 'sale'; };
    var qloc = new URLSearchParams(location.search).get('location');
    if (qloc) { st.loc = /indian/i.test(qloc) ? 'Indian Ocean' : /dubai|gulf/i.test(qloc) ? 'Dubai' : /carib/i.test(qloc) ? 'Caribbean' : /med/i.test(qloc) ? 'Mediterranean' : ''; }
    function render(){
      var list = all.filter(function(y){
        if (st.q && (y.title + ' ' + y.builder + ' ' + y.location + ' ' + y.year).toLowerCase().indexOf(st.q.toLowerCase()) < 0) return false;
        if (st.min && (y.price_eur || 0) < +st.min) return false;
        if (st.max && y.price_eur && y.price_eur > +st.max) return false;
        if (st.len && lenM(y.length) < +st.len) return false;
        if (st.year && yearN(y.year) < +st.year) return false;
        if (st.tag && tagOf(y.badge) !== st.tag) return false;
        if (st.loc && !(LOC[st.loc] || /x^/).test(y.location + ' ' + y.title)) return false;
        return true;
      });
      var k = st.sort;
      list.sort(function(a, b){
        if (k === 'price-asc') return (a.price_eur || 9e15) - (b.price_eur || 9e15);
        if (k === 'year-desc') return yearN(b.year) - yearN(a.year);
        if (k === 'length-desc') return lenM(b.length) - lenM(a.length);
        return (b.price_eur || 0) - (a.price_eur || 0);
      });
      countOut.textContent = list.length;
      grid.innerHTML = list.length ? list.map(card).join('') : '<p class="cat-empty">No yacht matches these filters yet. <a href="/yacht-research-form">Tell us what you are looking for</a> and we will search the off-market for you.</p>';
      $$('.card', grid).forEach(function(c){ c.classList.add('is-in'); });
    }
    $$('[data-f]', cat).forEach(function(el){
      if (el.classList.contains('chips')) {
        $$('button', el).forEach(function(b){
          if (st[el.dataset.f] && b.dataset.v === st[el.dataset.f]) { $$('button', el).forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on'); }
          b.addEventListener('click', function(){ $$('button', el).forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on'); st[el.dataset.f] = b.dataset.v; render(); });
        });
      } else {
        el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', function(){ st[el.dataset.f] = el.value; render(); });
      }
    });
    $('.cat-reset', cat).addEventListener('click', function(){
      for (var key in st) st[key] = key === 'sort' ? 'price-desc' : '';
      $$('input[data-f],select[data-f]', cat).forEach(function(el){ el.value = el.dataset.f === 'sort' ? 'price-desc' : ''; });
      $$('.chips button', cat).forEach(function(b){ b.classList.toggle('on', b.dataset.v === ''); });
      render();
    });
    fetch('/content/yachts/index.json').then(function(r){ return r.json(); }).then(function(d){
      all = (d.yachts || []).filter(function(y){ return y.type === type; }); render();
    }).catch(function(){ grid.innerHTML = '<p class="cat-empty">Listings are temporarily unavailable. Please <a href="/yacht-research-form">contact us</a>.</p>'; });
  }

  // ---------- Formulaires génériques (ex. Partnership Inquiry) : mêmes champs, même Apps Script ----------
  $$('form[data-yr-form]').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var msg = $('.cform-msg', f), btn = $('button[type=submit]', f), el = function(n){ return f.elements[n]; };
      function say(t, ok){ msg.textContent = t; msg.className = 'cform-msg ' + (ok ? 'ok' : 'err'); }
      if (!el('name').value.trim() || !el('email').value.trim()) return say('Please fill in your name and email.');
      if (el('gdpr') && !el('gdpr').checked) return say('Please accept the Privacy Policy.');
      if (f.hasAttribute('data-hp-abort') && el('website') && el('website').value) return;
      var fd = new FormData();
      $$('input[name],select[name],textarea[name]', f).forEach(function(i){ if (i.name !== 'gdpr') fd.append(i.name, i.value); });
      fd.append('form_name', f.dataset.yrForm);
      fd.append('submitted_at', new Date().toLocaleString('fr-FR'));
      btn.disabled = true;
      fetch(APPS_SCRIPT_URL, { method: 'POST', body: new URLSearchParams(fd), mode: 'no-cors' }).catch(function(){});
      f.reset(); btn.disabled = false;
      say('Thank you. Your message has been sent, we will be in touch shortly.', true);
    });
  });

  // ---------- Formulaire de contact de l'accueil (même envoi que l'ancien site : « Contact Enquiry ») ----------
  var cf = $('#contactForm');
  if (cf) cf.addEventListener('submit', function(e){
    e.preventDefault();
    var msg = $('.cform-msg', cf), btn = $('button[type=submit]', cf), el = function(n){ return cf.elements[n]; };
    function say(t, ok){ msg.textContent = t; msg.className = 'cform-msg ' + (ok ? 'ok' : 'err'); }
    if (!el('name').value.trim() || !el('email').value.trim()) return say('Please fill in your name and email.');
    if (!el('gdpr').checked) return say('Please accept the Privacy Policy.');
    var fd = new FormData();
    fd.append('name', el('name').value.trim());
    fd.append('phone', el('phone').value.trim());
    fd.append('email', el('email').value.trim());
    fd.append('type', el('type').value);
    fd.append('message', el('message').value.trim());
    fd.append('website', el('website').value);
    fd.append('form_name', 'Contact Enquiry');
    fd.append('submitted_at', new Date().toLocaleString('fr-FR'));
    btn.disabled = true;
    fetch(APPS_SCRIPT_URL, { method: 'POST', body: new URLSearchParams(fd), mode: 'no-cors' }).catch(function(){});
    cf.reset(); btn.disabled = false;
    say('Thank you. Your message has been sent, we will reply within 24 hours.', true);
  });

  // ---------- Bandeau cookies (même cookie que l'ancien site) ----------
  var cb = $('#cookie');
  if (cb) {
    if (!/(?:^|; )yr_cookie_consent=/.test(document.cookie)) setTimeout(function(){ cb.classList.add('show'); }, 900);
    $$('[data-consent]', cb).forEach(function(b){ b.addEventListener('click', function(){
      var d = new Date(); d.setTime(d.getTime() + 365 * 864e5);
      document.cookie = 'yr_cookie_consent=' + b.dataset.consent + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
      cb.classList.remove('show');
    }); });
  }

  // ---------- Boucle de scroll : nav, parallaxe, manifeste, off-market ----------
  var pars = $$('[data-par]'), offm = $('#offm'), offImg = $('#offmImg'), offPic = offImg ? $('img', offImg) : null;
  var ticking = false;
  function frame(){
    ticking = false;
    var vh = window.innerHeight, y = window.scrollY;
    if (nav) nav.classList.toggle('solid', y > 40);
    if (reduce) { words.forEach(function(w){ w.classList.add('on'); }); return; }
    pars.forEach(function(el){
      var r = el.parentNode.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return;
      var c = (r.top + r.height / 2 - vh / 2); el.style.transform = 'translate3d(0,' + (-c * (+el.dataset.par)) + 'px,0)';
    });
    if (man) {
      var mr = man.getBoundingClientRect(), p = Math.min(Math.max((vh * 0.85 - mr.top) / (mr.height + vh * 0.35), 0), 1), n = Math.round(p * words.length);
      words.forEach(function(w, i){ w.classList.toggle('on', i < n); });
    }
    if (offm && offImg) {
      var or = offm.getBoundingClientRect(), op = Math.min(Math.max(-or.top / (or.height - vh), 0), 1), k = 1 - Math.min(op * 1.8, 1);
      offImg.style.clipPath = 'inset(' + (12 * k) + '% ' + (14 * k) + '% round ' + (24 * k) + 'px)';
      offPic.style.transform = 'scale(' + (1.2 - op * 0.2) + ')';
    }
  }
  window.addEventListener('scroll', function(){ if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame); frame();
})();
