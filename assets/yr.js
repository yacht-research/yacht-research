/* Yacht Research : animations et interactions communes à toutes les pages */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var nav = $('#nav');
  // ---------- Hauteur d'écran figée au chargement (--vh, utilisée par yr.css) ----------
  // Le navigateur intégré de Facebook redimensionne la page quand ses barres se cachent pendant le défilement :
  // les blocs à hauteur « écran » changeaient de taille et la page sautait. On ne remet à jour qu'en cas de
  // changement de largeur (rotation du téléphone, fenêtre redimensionnée sur ordinateur).
  var VH = 0, VW = 0;
  function setVh(){
    if (window.innerWidth === VW && VH) return;
    VW = window.innerWidth; VH = window.innerHeight;
    var s = document.documentElement.style;
    s.setProperty('--vh', (VH / 100) + 'px'); s.setProperty('--vh100', VH + 'px');
  }
  setVh(); window.addEventListener('resize', setVh);
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
  // la page derrière ne défile plus pendant que le menu est ouvert (iPhone : body overflow:hidden ne suffit pas)
  var menuEl = $('#menu');
  function setMenu(open){
    if (open && menuEl && nav) menuEl.style.setProperty('--menutop', (nav.offsetHeight + 10) + 'px');
    document.body.classList.toggle('menu-open', open); document.documentElement.classList.toggle('menu-lock', open); }
  if (burger) burger.addEventListener('click', function(){ setMenu(!document.body.classList.contains('menu-open')); });
  $$('#menu a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  if (menuEl) menuEl.addEventListener('touchmove', function(e){ if (menuEl.scrollHeight <= menuEl.clientHeight + 1) e.preventDefault(); }, { passive: false });

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
  // ---------- Traduction automatique (Google / Chrome) ----------
  // 1) noms de marque jamais traduits ; 2) mots isolés mal traduits (« Charter » → « Charte ») remplacés par
  // notre propre libellé ; 3) titres découpés mot par mot remis en phrase entière avant traduction ;
  // 4) si le menu traduit ne tient plus sur une ligne, on passe au menu déroulant (burger).
  var BRAND = /(Yacht Research Group|Yacht Research|Yacht Club Academy|Xclusive Yachts?|Yacht Broker)/;
  var TR = {
    charter: { fr: 'Location', es: 'Alquiler', it: 'Noleggio', pt: 'Aluguel', de: 'Charter', nl: 'Charter', ru: 'Аренда', ar: 'تأجير' },
    'charter fleet': { fr: 'Flotte en location', es: 'Flota de alquiler', it: 'Flotta a noleggio', pt: 'Frota para aluguel' },
    home: { fr: 'Accueil', es: 'Inicio', it: 'Home', pt: 'Início', de: 'Startseite', ru: 'Главная', ar: 'الرئيسية' },
    newsletter: {}, academy: {}
  };
  function noTr(el){ el.setAttribute('translate', 'no'); el.classList.add('notranslate'); }
  (function protect(root){
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function(n){
      var p = n.parentNode; if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION|TITLE)$/.test(p.nodeName) || p.closest('[translate="no"]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT; } });
    var list = []; while (tw.nextNode()) list.push(tw.currentNode);
    list.forEach(function(n){
      var t = n.nodeValue, key = t.trim().toLowerCase();
      if (TR[key]) { var s = document.createElement('span'); noTr(s); s.setAttribute('data-tr', key); s.setAttribute('data-en', t.trim()); s.textContent = t.trim();
        var parts = t.split(t.trim()); var f = document.createDocumentFragment(); if (parts[0]) f.appendChild(document.createTextNode(parts[0])); f.appendChild(s); if (parts[1]) f.appendChild(document.createTextNode(parts[1])); n.parentNode.replaceChild(f, n); return; }
      if (!BRAND.test(t)) return;
      var frag = document.createDocumentFragment();
      t.split(BRAND).forEach(function(part, i){ if (!part) return; if (i % 2) { var b = document.createElement('span'); noTr(b); b.textContent = part; frag.appendChild(b); } else frag.appendChild(document.createTextNode(part)); });
      n.parentNode.replaceChild(frag, n);
    });
  })(document.body);
  $$('.yca-link,.logo,.foot-logo').forEach(noTr);
  var plainHTML = [];
  $$('.split-words,#manifesto,[data-tr-plain]').forEach(function(el){ plainHTML.push([el, el.getAttribute('data-tr-plain') || el.innerHTML]); });

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

  // ---------- Page traduite : phrases entières, libellés maison, menu qui tient ----------
  var html = document.documentElement, trDone = false, trLang = '';
  function trApply(){
    var on = /translated-/.test(html.className), lang = (html.lang || '').slice(0, 2).toLowerCase();
    if (on && !trDone) {
      trDone = true;
      plainHTML.forEach(function(p){ p[0].innerHTML = p[1]; p[0].classList.add('tr-plain', 'is-in'); });
      if (man) man.classList.add('tr-plain');
    }
    if (on && lang !== trLang) {
      trLang = lang;
      $$('[data-tr]').forEach(function(s){ var d = TR[s.getAttribute('data-tr')] || {}; s.textContent = d[lang] || s.getAttribute('data-en'); });
    }
    if (!on && trLang) { trLang = ''; $$('[data-tr]').forEach(function(s){ s.textContent = s.getAttribute('data-en'); }); }
    navFit();
  }
  // menu du haut : si les libellés (traduits, plus longs) chevauchent le logo ou le bouton, on passe au burger
  var links = $('.nav-links'), logo = $('#nav .logo'), navR = $('.nav-r'), fitT;
  function navFit(){
    clearTimeout(fitT);
    fitT = setTimeout(function(){
      if (!links || !nav || nav.classList.contains('compact')) return;
      html.classList.remove('nav-tight');
      if (getComputedStyle(links).display === 'none') return;
      var L = links.getBoundingClientRect(), lg = logo ? logo.getBoundingClientRect() : null, r = navR ? navR.getBoundingClientRect() : null;
      var tight = links.scrollWidth > links.clientWidth + 2 || (lg && lg.right > L.left - 16) || (r && L.right > r.left - 16);
      if (!tight) $$('li', links).forEach(function(li){ if (li.getBoundingClientRect().height > 40) tight = true; });
      html.classList.toggle('nav-tight', !!tight);
    }, 120);
  }
  if ('MutationObserver' in window) {
    new MutationObserver(trApply).observe(html, { attributes: true, attributeFilter: ['class', 'lang'] });
    if (links) new MutationObserver(navFit).observe(links, { childList: true, characterData: true, subtree: true });
    if (nav) new MutationObserver(function(){ if (!nav.classList.contains('compact')) navFit(); }).observe(nav, { attributes: true, attributeFilter: ['class'] });
  }
  window.addEventListener('resize', navFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(navFit);
  trApply();

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
    if (b.indexOf('sold') > -1) return 'Sold';
    if (b.indexOf('exclusive') > -1) return 'Exclusive price';
    if (b.indexOf('reduc') > -1 || b.indexOf('price') > -1) return 'Price reduced';
    if (b.indexOf('off') > -1) return 'Off market';
    if (b.indexOf('new') > -1) return 'New listing';
    return 'For sale';
  }
  function splitTitle(y){
    // "Sunseeker 88 Yacht" -> "Sunseeker <em>88 Yacht</em>" ; "AGAPA - Sunseeker Predator 84" -> "<em>Agapa</em>"
    var t = y.title || '';
    if (t.indexOf(' - ') > -1) t = t.split(' - ')[0].toLowerCase().replace(/(^|\s)\S/g, function(c){ return c.toUpperCase(); }).replace(/\b(Ii|Iii|Iv|Vi|Vii|Viii|Ix)\b/g, function(r){ return r.toUpperCase(); });
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
      (y.cabins ? '<div><b>' + esc(y.cabins) + '</b><span>Cabins</span></div>' : (function(l){ return '<div><b' + (l.length > 10 ? ' class="sm"' : '') + '>' + esc(l) + '</b><span>Location</span></div>'; })((y.location || '—').split(',')[0].trim())) + '</div>';
    var sold = y.type !== 'charter' && /sold/i.test(y.badge || '');
    var price = sold ? '<span>' + (y.price ? '<s>' + esc(y.price) + '</s> ' : '') + 'Sold</span>' : y.original_price ? '<span><s>' + esc(y.original_price) + '</s> ' + esc(y.price) + '</span>' : esc(y.price || 'Price on request');
    return '<a class="card rv' + (sold ? ' card-sold' : '') + (i % 4 ? ' d' + (i % 4) : '') + '" href="/yacht/' + esc(y.slug) + '">' +
      '<div class="ph"' + (y.photos ? ' data-imgs="' + esc(JSON.stringify(y.photos)) + '" data-i="0"' : '') + '><img src="' + esc(y.thumb || y.image) + '" alt="' + esc(y.title) + (y.type === 'charter' ? ' yacht charter' : sold ? ' sold' : ' for sale') + '" loading="lazy"><span class="tag">' + badgeLabel(y.badge, y.type) + '</span>' +
      (y.photos ? '<button type="button" class="ph-nav prev" aria-label="Previous photo">‹</button><button type="button" class="ph-nav next" aria-label="Next photo">›</button><span class="ph-count"><b>1</b>/' + y.photos.length + '</span>' : '') + '</div>' +
      '<div class="bd"><small>' + esc(sub) + '</small><h4>' + splitTitle(y) + '</h4>' + specs +
      '<div class="price">' + price + ' <i>→</i></div></div></a>';
  }
  window.YR = { card: card, observe: observe, esc: esc };

  // Recherche : chaque mot tapé doit se retrouver dans la fiche (nom, chantier, modèle, lieu, année, taille)
  function norm(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function yMatch(y, q){
    var hay = norm([y.title, y.builder, y.model, y.location, y.year, y.length, (y.names || []).join(' '), y.base, y.extra].join(' '));
    return norm(q).split(/\s+/).filter(Boolean).every(function(w){ return hay.indexOf(w) > -1; });
  }

  // Shared experiences : tags, durée et budget tirés de la fiche (titre, horaires, résumé, points forts)
  var XP_TAGS = [
    ['superyacht', 'Superyacht', /superyacht/i],
    ['food', 'Food & BBQ', /bbq|dinner|breakfast|sushi|brunch|buffet|lunch/i],
    ['sunset', 'Sunset', /sunset|sundowner/i],
    ['night', 'Night & party', /night|party|moonlight|twilight|\bdj\b/i],
    ['sightseeing', 'Sightseeing', /sightseeing|atlantis|burj al arab|ain dubai|\bjbr\b|palm/i],
    ['speedboat', 'Speedboat', /speedboat|\brib\b/i]
  ];
  function xpInfo(x){
    var txt = [x.title, (x.names || []).join(' '), x.summary, (x.highlights || []).join(' ')].join(' ');
    var tags = XP_TAGS.filter(function(t){ return t[2].test(txt); });
    var d = String(x.duration || ''), h = d.match(/(\d+(?:[.,]\d+)?)\s*(?:h|hour)/i), m = d.match(/h\s*(\d{2})\b/i);
    return {
      tags: tags.map(function(t){ return t[0]; }),
      min: h ? Math.round(parseFloat(h[1].replace(',', '.')) * 60) + (m ? +m[1] : 0) : 0,
      from: x.from || 0,
      base: /harbour/i.test(x.base || '') ? 'harbour' : /marina/i.test(x.base || '') ? 'marina' : '',
      extra: [x.summary, (x.highlights || []).join(' '), tags.map(function(t){ return t[1]; }).join(' ')].join(' ')
    };
  }

  // Arrivée sur la page des résultats : on descend jusqu'à la liste (compteur + bateaux), pas en haut de page
  function goResults(smooth){
    var navH = (nav ? nav.offsetHeight : 70) + 12, xf = $('[data-xf]'), none = $('[data-xf-empty]');
    // Experiences sans résultat : on arrive sur les filtres et le message WhatsApp (pas plus bas, sur les dates)
    if (xf && none && !none.hidden) {
      var top = xf.getBoundingClientRect().top + window.scrollY - navH, r = none.getBoundingClientRect();
      var need = r.bottom + window.scrollY - window.innerHeight + 24; // le message doit être visible en bas de l'écran
      window.scrollTo({ top: Math.max(top, Math.min(need, r.top + window.scrollY - navH)), behavior: smooth && !reduce ? 'smooth' : 'instant' });
      return;
    }
    // Buy / Charter : le compteur, juste au-dessus des bateaux ; Experiences : les cartes (le choix de date est entre les deux)
    var bar = $('#cat .cat-bar') || ($('[data-xf]') && $('[data-sx-grid]')); if (!bar) return;
    window.scrollTo({ top: bar.getBoundingClientRect().top + window.scrollY - ((nav ? nav.offsetHeight : 70) + 12), behavior: smooth && !reduce ? 'smooth' : 'instant' });
  }

  // ---------- Barres de recherche (fiches + barre compacte du menu sur Buy / Charter / Experiences) ----------
  // Section de la page : 'sale' (Buy), 'charter', 'xp' (shared experiences), ou '' ailleurs
  var qsPath = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  var qsKind = /^\/shared-experiences(\/|$)/.test(qsPath) ? 'xp' : qsPath === '/listings' ? 'sale' : qsPath === '/charter' ? 'charter'
    : /^\/yacht\//.test(qsPath) ? ($('main.lx-sale') ? 'sale' : 'charter') : '';
  var qsData = {};
  function qsLoad(kind){
    if (qsData[kind]) return Promise.resolve(qsData[kind]);
    var url = kind === 'xp' ? '/content/experiences.json' : '/content/yachts/index.json';
    // shared experiences : prix « à partir de » en direct (Xclusive, 14 prochains jours) quand il est disponible
    var live = kind === 'xp' ? fetch('/api/sx/from').then(function(r){ return r.json(); }).then(function(d){ return (d && d.from) || {}; }).catch(function(){ return {}; }) : Promise.resolve({});
    return Promise.all([fetch(url).then(function(r){ return r.json(); }), live]).then(function(res){
      var d = res[0], lf = res[1];
      return qsData[kind] = kind === 'xp' ? (d || []).map(function(x){
        var v = (x.names || []).map(function(n){ return lf[n]; }).filter(function(p){ return p > 0; });
        if (v.length) x.from = Math.round(Math.min.apply(null, v));
        var i = xpInfo(x); return { slug: x.id, title: x.title, names: x.names, base: x.base, extra: i.extra, info: i, location: 'Dubai', thumb: (x.images || [])[0] ? x.images[0] + '-800.webp' : '', price: x.from ? 'From AED ' + x.from : '', href: '/shared-experiences/' + x.id }; })
        : (d.yachts || []).filter(function(y){ return y.type === kind; }).map(function(y){ y.href = '/yacht/' + y.slug; return y; });
    }).catch(function(){ return qsData[kind] = []; });
  }
  function qsBuild(kind, form, onAll){
    var CFG = {
      sale: { list: '/listings', all: 'See all yachts for sale' },
      charter: { list: '/charter', all: 'See all charter yachts' },
      xp: { list: '/shared-experiences', all: 'See all shared experiences' }
    }[kind];
    var inp = $('input', form), box = $('.qs-list', form);
    var load = function(){ return qsLoad(kind); };
    var find = function(list, q){ return list.filter(function(y){ return yMatch(y, q); }).sort(function(a, b){ return (/sold/i.test(a.badge || '') ? 1 : 0) - (/sold/i.test(b.badge || '') ? 1 : 0); }); };
    function show(){
      var q = inp.value.trim();
      if (!q) { box.hidden = true; return; }
      load().then(function(list){
        if (inp.value.trim() !== q) return;
        var hits = find(list, q);
        var sold = function(y){ return kind === 'sale' && /sold/i.test(y.badge || ''); };
        box.innerHTML = (hits.length ? '<p class="qs-n">' + hits.length + (hits.length > 1 ? ' results' : ' result') + '</p><div class="qs-sc">' + hits.map(function(y){
          var sub = [y.builder, y.year, y.location].filter(Boolean).join(' · ');
          return '<a href="' + esc(y.href) + '">' + (y.thumb || y.image ? '<img src="' + esc(y.thumb || y.image) + '" alt="" loading="lazy">' : '<span></span>') +
            '<span class="qs-t"><b>' + esc(y.title) + '</b><small>' + esc(sub) + '</small></span><span class="qs-p">' + (sold(y) ? 'Sold' : esc(y.price || '')) + '</span></a>';
        }).join('') + '</div>' : '<p class="qs-none">No match for “' + esc(q) + '”. <a href="/yacht-research-form">Tell us what you are looking for</a>.</p>') +
          '<div class="qs-foot">' + (hits.length > 1 ? '<a class="qs-all" data-qs-all href="' + CFG.list + '?q=' + encodeURIComponent(q) + '">See all ' + hits.length + ' results <i>→</i></a>' : '') +
          '<a class="qs-all" href="' + CFG.list + '">' + CFG.all + ' <i>→</i></a></div>';
        box.hidden = false;
        // barre du menu : la liste s'arrête au-dessus du clavier du téléphone
        var vv = window.visualViewport;
        if (vv && form.classList.contains('nav-qs')) box.style.maxHeight = Math.max(170, vv.height + vv.offsetTop - form.getBoundingClientRect().bottom - 14) + 'px';
      });
    }
    inp.addEventListener('input', show);
    inp.addEventListener('focus', function(){ load(); if (inp.value.trim()) show(); });
    // Entrée / loupe : un seul résultat → sa fiche ; sinon → la liste de la page, déjà filtrée, à hauteur des résultats
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var q = inp.value.trim(); box.hidden = true; inp.blur();
      load().then(function(list){
        var hits = q ? find(list, q) : [];
        if (hits.length === 1) { location.href = hits[0].href; return; }
        if (onAll) { onAll(q); return; }
        location.href = CFG.list + (q ? '?q=' + encodeURIComponent(q) : '');
      });
    });
    // déjà sur la page de la liste : « See all N results » filtre la liste de la page au lieu de la recharger
    box.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('[data-qs-all]');
      if (a && onAll) { e.preventDefault(); box.hidden = true; onAll(inp.value.trim()); }
    });
    document.addEventListener('click', function(e){ if (!form.contains(e.target)) box.hidden = true; });
    inp.addEventListener('keydown', function(e){ if (e.key === 'Escape') { box.hidden = true; inp.blur(); } });
    return form;
  }
  function qsHTML(cls, ph){
    return '<form class="' + cls + '" role="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
      '<input type="search" name="q" autocomplete="off" enterkeyhint="search" placeholder="' + ph + '" aria-label="' + ph + '"><button type="submit">Search</button><div class="qs-list" hidden></div></form>';
  }

  // Barre compacte : en défilant, le nom « Yacht Research Group » et les liens glissent vers la gauche et la recherche prend leur place
  var navQS = null, pageQS = null;
  if (nav && qsKind) {
    var NAVPH = { sale: 'Search yachts for sale…', charter: 'Search charter yachts…', xp: 'Search shared experiences…' }[qsKind];
    var logoEl = $('.logo', nav);
    (logoEl || nav.firstChild).insertAdjacentHTML('afterend', qsHTML('qs nav-qs', NAVPH));
    navQS = $('.nav-qs', nav);
    navQS.setAttribute('action', { sale: '/listings', charter: '/charter', xp: '/shared-experiences' }[qsKind]);
    // sur la page de la liste (Buy, Charter, Experiences) : la recherche remplit le filtre de la page et descend aux résultats
    var catQ = $('#cat input[data-f="q"]') || $('[data-xf] input[data-xf="q"]');
    qsBuild(qsKind, navQS, catQ ? function(q){
      catQ.value = q; catQ.dispatchEvent(new Event('input', { bubbles: true }));
      goResults(true);
    } : null);
    nav.classList.add('has-qs');
    // iPhone : toucher un champ dans un en-tête fixe fait remonter la page tout en haut → focus sans défilement
    var navIn = $('input', navQS);
    navIn.addEventListener('touchend', function(e){
      if (document.activeElement === navIn) return;
      e.preventDefault();
      try { navIn.focus({ preventScroll: true }); } catch (err) { navIn.focus(); }
    });
  }
  // iPhone : quand le clavier se ferme, Safari laisse parfois le menu fixe décalé (il disparaît jusqu'à ce qu'on remonte).
  // On redonne sa place à la page d'un pixel, sans animation, pour qu'il se recale.
  if (window.matchMedia('(hover:none),(pointer:coarse)').matches) {
    var kbd = false; // seulement après la fermeture d'un clavier, jamais pendant un simple défilement
    document.addEventListener('focusin', function(e){ if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) kbd = true; });
    var vvFix = function(){
      setTimeout(function(){
        var el = document.activeElement;
        if (!kbd || (el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName))) return; // clavier encore ouvert
        kbd = false;
        var y = window.scrollY;
        window.scrollTo({ top: y + 1, behavior: 'instant' }); window.scrollTo({ top: y, behavior: 'instant' });
      }, 150);
    };
    document.addEventListener('focusout', vvFix);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', vvFix);
  }
  // Une seule liste de résultats ouverte à la fois, et la même recherche dans les deux barres
  function qsPair(a, b){
    var ia = $('input', a), ib = $('input', b);
    [[a, ia, b, ib], [b, ib, a, ia]].forEach(function(p){
      p[1].addEventListener('focus', function(){ $('.qs-list', p[2]).hidden = true; });
      p[1].addEventListener('input', function(){ p[3].value = p[1].value; });
    });
  }

  // Barre de recherche sur les fiches (achat, charter, shared experiences)
  (function(){
    var crumb = $('main.lx > .lx-crumb'); if (!crumb) return;
    var p = location.pathname, kind = /^\/shared-experiences\//.test(p) ? 'xp' : /^\/yacht\//.test(p) ? ($('main.lx-sale') ? 'sale' : 'charter') : '';
    if (!kind) return;
    var PH = { sale: 'Search yachts for sale: builder, model, location…', charter: 'Search charter yachts: name, builder, location…', xp: 'Search shared experiences…' }[kind];
    var row = document.createElement('div'); row.className = 'qs-row';
    crumb.parentNode.insertBefore(row, crumb); row.appendChild(crumb);
    row.insertAdjacentHTML('beforeend', qsHTML('qs', PH));
    $('.qs', row).setAttribute('action', { sale: '/listings', charter: '/charter', xp: '/shared-experiences' }[kind]);
    pageQS = qsBuild(kind, $('.qs', row));
    if (navQS) qsPair(navQS, pageQS);
  })();

  // ---------- Shared experiences : filtres (recherche, budget, durée, départ, tags) et tri ----------
  (function(){
    var root = $('[data-xf]'); if (!root) return;
    var grid = $('[data-sx-grid]'), cards = $$('.xp-card[data-xp]', grid), chips = $('[data-xf="tag"]', root), cnt = $('[data-xf-count]', root), lbl = $('[data-xf-label]', root), empty = $('[data-xf-empty]', root);
    var st = { q: new URLSearchParams(location.search).get('q') || '', max: '', dur: '', base: '', tag: '', sort: 'price-desc' }, info = {};
    var qIn = $('input[data-xf="q"]', root);
    // retour arrière : le navigateur remet les choix des menus, on repart de ce qui est affiché
    $$('select[data-xf]', root).forEach(function(el){ if (el.value) st[el.dataset.xf] = el.value; });
    if (!st.q && qIn.value) st.q = qIn.value; else qIn.value = st.q;
    // prix pour le tri : celui de la carte (mis à jour en direct par sx.js), sinon celui de la fiche
    var price = function(c){ return +c.dataset.from || (info[c.dataset.xp] && info[c.dataset.xp].info.from) || 0; };
    var mins = function(c){ return (info[c.dataset.xp] && info[c.dataset.xp].info.min) || 0; };
    function render(){
      var n = 0, shown = [];
      cards.forEach(function(c){
        var x = info[c.dataset.xp], ok = !!x;
        if (x) {
          var i = x.info;
          if (st.q && !yMatch(x, st.q)) ok = false;
          if (st.max && !(price(c) && price(c) <= +st.max)) ok = false;
          if (st.dur === 'short' && !(i.min && i.min <= 90)) ok = false;
          if (st.dur === 'long' && !(i.min >= 120)) ok = false;
          if (st.base && i.base !== st.base) ok = false;
          if (st.tag && i.tags.indexOf(st.tag) < 0) ok = false;
        }
        c.classList.toggle('xf-hide', !ok); if (ok) { n++; shown.push(c); }
      });
      // Tri (comme Buy et Charter) ; la nouveauté reste en tête quand elle fait partie des résultats ; sans prix = à la fin
      var k = st.sort;
      shown.sort(function(a, b){
        if (k === 'dur-desc' || k === 'dur-asc') { var d = mins(a) - mins(b); return k === 'dur-desc' ? -d : d; }
        var pa = price(a), pb = price(b);
        if (!pa || !pb) return (pa ? 0 : 1) - (pb ? 0 : 1);
        return k === 'price-asc' ? pa - pb : pb - pa;
      });
      shown.forEach(function(c, i){ c.style.order = c.classList.contains('xp-feat') ? -1 : i; });
      cnt.textContent = n; lbl.textContent = n === 1 ? 'experience' : 'experiences'; empty.hidden = !!n;
    }
    qsLoad('xp').then(function(list){
      list.forEach(function(x){ info[x.slug] = x; });
      // tags : seulement ceux qui correspondent à au moins une expérience
      XP_TAGS.forEach(function(t){
        var k = list.filter(function(x){ return x.info.tags.indexOf(t[0]) > -1; }).length;
        if (k) chips.insertAdjacentHTML('beforeend', '<button type="button" data-v="' + t[0] + '">' + esc(t[1]) + '</button>');
      });
      $$('button', chips).forEach(function(b){
        b.addEventListener('click', function(){ $$('button', chips).forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on'); st.tag = b.dataset.v; render(); });
      });
      render();
      if (st.q) setTimeout(function(){ goResults(false); }, 80);
    });
    document.addEventListener('sx:from', render); // prix en direct arrivés : on retrie
    $$('input[data-xf],select[data-xf]', root).forEach(function(el){
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', function(){ st[el.dataset.xf] = el.value; render(); });
    });
    // Entrée / loupe dans la recherche de la page : on ferme le clavier et on descend aux expériences (ou au message)
    qIn.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); qIn.blur(); goResults(true); } });
    $('.cat-reset', root).addEventListener('click', function(){
      for (var k in st) st[k] = k === 'sort' ? 'price-desc' : '';
      $$('input[data-xf],select[data-xf]', root).forEach(function(el){ el.value = el.dataset.xf === 'sort' ? 'price-desc' : ''; });
      $$('button', chips).forEach(function(b){ b.classList.toggle('on', b.dataset.v === ''); });
      render();
    });
  })();

  // ---------- Photos des cartes : flèches et glisser au doigt, sans ouvrir la fiche ----------
  function phStep(ph, d){
    var imgs; try { imgs = JSON.parse(ph.dataset.imgs); } catch (e) { return; }
    var i = ((+ph.dataset.i || 0) + d + imgs.length) % imgs.length;
    ph.dataset.i = i; $('img', ph).src = imgs[i];
    var b = $('.ph-count b', ph); if (b) b.textContent = i + 1;
    var n = new Image(); n.src = imgs[(i + 1) % imgs.length];
  }
  document.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('.ph-nav');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    phStep(btn.parentNode, btn.classList.contains('next') ? 1 : -1);
  }, true);
  var phX = null, phY = 0, phEl = null;
  document.addEventListener('touchstart', function(e){ var ph = e.target.closest && e.target.closest('.ph[data-imgs]'); phEl = ph; if (ph) { phX = e.touches[0].clientX; phY = e.touches[0].clientY; } }, { passive: true });
  // Glissement horizontal sur les photos d'une carte : la page ne défile pas en même temps
  document.addEventListener('touchmove', function(e){
    if (!phEl || phX === null || phEl.closest('.rail')) return;
    var dx = e.touches[0].clientX - phX, dy = e.touches[0].clientY - phY;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchend', function(e){
    if (!phEl || phX === null) return;
    var dx = e.changedTouches[0].clientX - phX, dy = e.changedTouches[0].clientY - phY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5 && !phEl.closest('.rail')) phStep(phEl, dx < 0 ? 1 : -1);
    phX = null; phEl = null;
  }, { passive: true });

  var targets = $$('[data-yachts]');
  if (targets.length) {
    fetch('/content/yachts/index.json').then(function(r){ return r.ok ? r.json() : null; }).then(function(data){
      if (!data || !data.yachts) return;
      targets.forEach(function(el){
        var ex = el.dataset.exclude || '';
        var list = data.yachts.filter(function(y){ return y.type === el.dataset.yachts && y.slug !== ex; });
        list.sort(function(a, b){ return (/sold/i.test(a.badge || '') ? 1 : 0) - (/sold/i.test(b.badge || '') ? 1 : 0); }); // vendus à la fin
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
    function openLb(u){ show(Math.max(0, urls.indexOf(u))); lb.hidden = false; document.documentElement.classList.add('lb-lock'); }
    function closeLb(){ lb.hidden = true; lbImg.src = ''; document.documentElement.classList.remove('lb-lock'); }
    // Pas de défilement de la page derrière (doigt, molette)
    lb.addEventListener('touchmove', function(e){ e.preventDefault(); }, { passive: false });
    lb.addEventListener('wheel', function(e){ e.preventDefault(); }, { passive: false });
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

  // ---------- Lien vers une section d'une autre page (ex. /contact#newsletter) : on y descend bien à l'arrivée ----------
  if (location.hash.length > 1) {
    var hashGo = function(){ var t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView({ behavior: 'auto', block: 'start' }); };
    setTimeout(hashGo, 60); // tout de suite, puis encore une fois quand les images ont fini de charger
    if (document.readyState !== 'complete') window.addEventListener('load', function(){ setTimeout(hashGo, 60); });
  }

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
    var tagOf = function(b){ b = (b || '').toLowerCase(); return b.indexOf('sold') > -1 ? 'sold' : b.indexOf('reduc') > -1 || b.indexOf('price') > -1 ? 'reduced' : b.indexOf('off') > -1 ? 'offmarket' : b.indexOf('new') > -1 ? 'new' : 'sale'; };
    var qloc = new URLSearchParams(location.search).get('location');
    if (qloc) { st.loc = /indian/i.test(qloc) ? 'Indian Ocean' : /dubai|gulf/i.test(qloc) ? 'Dubai' : /carib/i.test(qloc) ? 'Caribbean' : /med/i.test(qloc) ? 'Mediterranean' : ''; }
    st.q = new URLSearchParams(location.search).get('q') || ''; // recherche lancée depuis une fiche (barre de recherche)
    function render(){
      var list = all.filter(function(y){
        if (st.q && !yMatch(y, st.q)) return false;
        if (st.min && (y.price_eur || 0) < +st.min) return false;
        if (st.max && y.price_eur && y.price_eur > +st.max) return false;
        if (st.len && lenM(y.length) < +st.len) return false;
        if (st.year && yearN(y.year) < +st.year) return false;
        if (st.tag && !(tagOf(y.badge) === st.tag || (st.tag === 'reduced' && y.original_price && !/sold/i.test(y.badge || '')) || (st.tag === 'exclusive' && /exclusive/i.test(y.badge || '')))) return false;
        if (st.loc && !(LOC[st.loc] || /x^/).test(y.location + ' ' + y.title)) return false;
        return true;
      });
      var k = st.sort;
      var isSold = function(y){ return /sold/i.test(y.badge || '') ? 1 : 0; };
      list.sort(function(a, b){
        if (isSold(a) !== isSold(b)) return isSold(a) - isSold(b); // les bateaux vendus toujours à la fin
        if (k === 'price-asc') return (a.price_eur || 9e15) - (b.price_eur || 9e15);
        if (k === 'year-desc') return yearN(b.year) - yearN(a.year);
        if (k === 'length-desc') return lenM(b.length) - lenM(a.length);
        return (b.price_eur || 0) - (a.price_eur || 0);
      });
      // les vendus ne comptent pas dans « yachts for sale » : « 12 yachts for sale · 1 sold », ou « 1 sold » avec le filtre Sold
      var nSold = list.filter(isSold).length, nSale = list.length - nSold, soldOut = $('[data-sold-out]', cat), label = $('[data-count-label]', cat);
      countOut.textContent = nSale || !nSold ? nSale : nSold;
      if (label) label.textContent = nSale || !nSold ? 'yachts for sale' : 'sold';
      if (soldOut) soldOut.textContent = nSale && nSold ? ' · ' + nSold + ' sold' : '';
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
        if (el.tagName === 'INPUT' && st[el.dataset.f]) el.value = st[el.dataset.f];
        else if (el.value) st[el.dataset.f] = el.value; // retour arrière : le navigateur remet le tri / les filtres choisis, la liste les suit
        if (el.tagName === 'INPUT') el.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); el.blur(); goResults(true); } });
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
      if (st.q) setTimeout(function(){ goResults(false); }, 80); // arrivée depuis une autre barre de recherche : directement aux résultats
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
  var ticking = false, offBox = null;
  // Private portfolio : le cadre ne coupe jamais le contenu (cadenas sous le menu fixe)
  function offMeasure(){
    if (!offm) return;
    document.documentElement.style.setProperty('--navh', (nav ? nav.offsetHeight : 80) + 'px');
    var offIn = $('.in', offm), vh = VH || window.innerHeight, vw = window.innerWidth;
    offBox = {
      ty: Math.max(0, Math.min(vh * 0.12, offIn ? offIn.offsetTop - 24 : vh * 0.12)),
      tx: Math.min(vw * 0.14, Math.max(12, (vw - (offIn ? offIn.offsetWidth : vw)) / 2))
    };
  }
  function frame(){
    ticking = false;
    var vh = VH || window.innerHeight, y = window.scrollY;
    // barre compacte avec recherche dès qu'on commence à défiler ; elle reste tant qu'on tape dedans
    // sur les fiches, elle n'arrive qu'une fois la barre de la page passée sous le menu (jamais deux barres l'une sur l'autre)
    var compact = false;
    if (navQS) {
      var pageOn = pageQS && (pageQS.contains(document.activeElement) || pageQS.getBoundingClientRect().bottom > nav.offsetHeight);
      compact = navQS.contains(document.activeElement) || (y > 40 && !pageOn);
      if (compact !== nav.classList.contains('compact')) {
        nav.classList.toggle('compact', compact);
        if (pageQS) $('.qs-list', compact ? pageQS : navQS).hidden = true;
      }
    }
    if (nav) nav.classList.toggle('solid', y > 40 || compact);
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
      // le cadre ne coupe jamais le contenu (cadenas en haut) : marge verticale limitée à la place libre autour du texte
      // mesures faites une seule fois (et au redimensionnement) : le scroll reste fluide
      if (!offBox) offMeasure();
      // valeurs entières : évite les fines lignes claires sur les bords gauche et droit
      offImg.style.clipPath = 'inset(' + Math.round(offBox.ty * k) + 'px ' + Math.round(offBox.tx * k) + 'px round ' + Math.round(24 * k) + 'px)';
      offPic.style.transform = 'scale(' + (1.2 - op * 0.2) + ')';
    }
  }
  window.addEventListener('scroll', function(){ if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  if (navQS) navQS.addEventListener('focusout', function(){ setTimeout(frame, 200); });
  window.addEventListener('resize', function(){ offBox = null; frame(); }); frame();
})();
