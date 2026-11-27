// Shared experiences in Dubai (/shared-experiences) : une carte par expérience (contenu fixe dans la page),
// horaires du jour en boutons, disponibilité et prix « à partir de » en direct, puis demande ou paiement.
(function () {
  var root = document.getElementById('sx'); if (!root) return;
  var dateIn = root.querySelector('[data-sx-date]'), daysEl = root.querySelector('[data-sx-days]'), note = root.querySelector('[data-sx-note]');
  var cards = [].slice.call(root.querySelectorAll('.xp-card'));
  var more = root.querySelector('[data-sx-more]'), moreGrid = root.querySelector('[data-sx-more-grid]');
  var modal = document.getElementById('sx-modal'), form = modal.querySelector('form'), err = modal.querySelector('.sx-err');
  var state = { bookings: false, dep: null, date: '' };
  // version française (/fr/...) : textes et liens
  var FR = /^\/fr(\/|$)/.test(location.pathname);
  var TFR = {
    'This departure is now full. Please choose another time.': 'Ce départ est désormais complet. Choisissez un autre horaire.',
    'The price has just changed. Please check the new total.': 'Le prix vient de changer. Vérifiez le nouveau total.',
    'Please enter your phone number with the country code, e.g. +971 50 123 4567.': 'Indiquez votre numéro avec l’indicatif du pays, par ex. +33 6 12 34 56 78.',
    'Please enter a valid email address.': 'Indiquez une adresse e-mail valide.',
    'Please enter your full name.': 'Indiquez vos nom et prénom.',
    'Choose between 1 and 20 guests.': 'Choisissez entre 1 et 20 personnes.',
    'Online booking is not open yet. Send us an enquiry instead.': 'La réservation en ligne n’est pas encore ouverte. Envoyez-nous plutôt une demande.',
    'Starting from': 'À partir de', 'per guest': 'par personne', 'Today': 'Aujourd’hui', 'Tomorrow': 'Demain',
    'No departure on this date. Try another day.': 'Aucun départ à cette date. Essayez un autre jour.',
    'From': 'Dès', 'Price on request': 'Prix sur demande', 'Few places left': 'Dernières places', 'Available': 'Disponible', 'Few left': 'Dernières places',
    'Book': 'Réserver', 'Enquire for': 'Demander pour', 'Enquire': 'Demander', 'Loading times…': 'Chargement des horaires…',
    'Payment cancelled: nothing has been charged.': 'Paiement annulé : aucun montant n’a été débité.',
    'Payment declined: nothing has been charged. Please try again or use another card.': 'Paiement refusé : aucun montant n’a été débité. Réessayez ou utilisez une autre carte.',
    'TEST MODE · payments are simulated, nothing is charged and no seat is booked.': 'MODE TEST · les paiements sont simulés, rien n’est débité et aucune place n’est réservée.',
    'Live availability, instant confirmation and secure card payment.': 'Disponibilités en direct, confirmation immédiate et paiement sécurisé par carte.',
    'Live times and prices. Choose a time and send your request: we confirm your seats with you directly by WhatsApp or email.': 'Horaires et prix en direct. Choisissez un horaire et envoyez votre demande : nous vous confirmons vos places directement par WhatsApp ou par e-mail.',
    'Live times are unavailable right now. Send us your request and we will confirm availability for you.': 'Les horaires en direct sont momentanément indisponibles. Envoyez-nous votre demande et nous vérifierons les disponibilités pour vous.',
    'Price when booking direct': 'Prix en réservant en direct',
    'Add-ons on request': 'Add-ons sur demande',
    'Add-ons are arranged on request. To include them, message us on WhatsApp instead of paying here: we book your seats together with the add-ons and send you the payment details.': 'Les add-ons sont sur demande. Pour en ajouter, écrivez-nous sur WhatsApp au lieu de payer ici : nous réservons vos places avec les add-ons et vous envoyons les détails du paiement.',
    'Price unavailable for this selection.':'Prix indisponible pour cette sélection.',
    '(Dubai time)': '(heure de Dubaï)', 'at': 'à', 'Adults': 'Adultes', 'Children': 'Enfants',
    'Redirecting to payment… ': 'Redirection vers le paiement… ', 'Pay securely ': 'Payer en toute sécurité ',
    'Something went wrong. Please try again or contact us on WhatsApp.': 'Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.',
    'Connection problem. Please try again.': 'Problème de connexion. Réessayez.',
    'Please fill in your name, email and phone first.': 'Indiquez d’abord votre nom, votre e-mail et votre téléphone.',
    'Request sent. We will email you our bank details shortly.': 'Demande envoyée. Nous vous envoyons nos coordonnées bancaires par e-mail très vite.'
  };
  var L = function (s) { return FR && TFR[s] != null ? TFR[s] : s; };
  var U = function (p) { return FR ? '/fr' + p : p; };
  var aed = function (n) { var v = Number(n).toLocaleString(FR ? 'fr-FR' : 'en-US', { maximumFractionDigits: 0 }); return FR ? v + ' AED' : 'AED ' + v; };
  // Prix de référence barré (prix public en direct chez l'opérateur, jamais nommé)
  var was = function (w) { return w > 0 ? '<s class="sx-was" title="' + L('Price when booking direct') + '">' + aed(w) + '</s> ' : ''; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ERR = { departure_unavailable: L('This departure is now full. Please choose another time.'), booking_unavailable: L('This departure is now full. Please choose another time.'), price_changed: L('The price has just changed. Please check the new total.'), invalid_phone: L('Please enter your phone number with the country code, e.g. +971 50 123 4567.'), invalid_email: L('Please enter a valid email address.'), invalid_name: L('Please enter your full name.'), invalid_guests: L('Choose between 1 and 20 guests.'), bookings_closed: L('Online booking is not open yet. Send us an enquiry instead.') };

  // Galerie de chaque carte
  cards.forEach(function (c) {
    var m = c.querySelector('.xp-media'), imgs = JSON.parse(m.dataset.imgs || '[]'), img = m.querySelector('img'), cnt = m.querySelector('.xp-count b'), i = 0;
    function show(k) { i = (k + imgs.length) % imgs.length; img.srcset = imgs[i] + '-800.webp 800w, ' + imgs[i] + '.webp 1600w'; img.src = imgs[i] + '-800.webp'; if (cnt) cnt.textContent = i + 1; }
    m.querySelectorAll('.xp-nav').forEach(function (b) { b.onclick = function () { show(i + (b.classList.contains('next') ? 1 : -1)); }; });
  });

  // Prix « à partir de » en direct (le plus bas des 14 prochains jours chez Xclusive) : remplace le prix indicatif,
  // et reste affiché les jours sans départ ; sur la fiche d'une expérience, met aussi à jour le prix du haut et de la réservation
  fetch('/api/sx/from').then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.from) return;
    cards.forEach(function (c) {
      var best = null;
      JSON.parse(c.dataset.names || '[]').forEach(function (n) { var x = d.from[n]; if (x > 0 && (!best || x < best.v)) best = { v: x, w: d.was && d.was[n] }; });
      if (!best) return;
      var v = Math.round(best.v);
      c.dataset.from = v; c.dataset.was = best.w > v ? Math.round(best.w) : '';
      var f = c.querySelector('.xp-from');
      if (!f) { f = document.createElement('p'); f.className = 'xp-from'; f.hidden = !!c.querySelector('.xp-slot'); var meta = c.querySelector('.xp-meta'); meta.parentNode.insertBefore(f, meta.nextSibling); }
      f.innerHTML = was(c.dataset.was) + '<small>' + L('Starting from') + '</small> <b>' + aed(v) + '</b> <small>' + L('per guest') + '</small>';
      // fiche d'une expérience : prix direct barré sur sa propre ligne au-dessus du prix, comme pour les charters
      if (c.classList.contains('xp-solo') && c.dataset.was) document.querySelectorAll('.lx-price [data-live-from]').forEach(function (e) { var p = e.closest('.lx-price'), s = p.previousElementSibling; if (!s || !s.classList.contains('yp-was')) { s = document.createElement('p'); s.className = 'yp-was'; p.parentNode.insertBefore(s, p); } s.textContent = aed(c.dataset.was); s.title = L('Price when booking direct'); });
      if (c.classList.contains('xp-solo')) document.querySelectorAll('[data-live-from]').forEach(function (e) { e.textContent = Number(v).toLocaleString(FR ? 'fr-FR' : 'en-US'); });
    });
    document.dispatchEvent(new Event('sx:from')); // le tri de la page se refait avec les prix en direct
  }).catch(function () {});

  // Un clic n'importe où sur une carte (hors boutons et liens) ouvre la page de l'expérience
  root.addEventListener('click', function (e) {
    var c = e.target.closest('.xp-card');
    if (!c || c.classList.contains('xp-solo') || !c.dataset.xp) return;
    if (e.target.closest('a,button,input,select,textarea,label,summary')) return;
    if (String(window.getSelection && window.getSelection()).length) return; // texte sélectionné : on ne bouge pas
    location.href = U('/shared-experiences/' + c.dataset.xp);
  });

  function dubaiDate(add) { return new Date(Date.now() + 4 * 3600e3 + (add || 0) * 864e5).toISOString().slice(0, 10); }
  function label(iso, k) {
    if (k === 0) return L('Today'); if (k === 1) return L('Tomorrow');
    var d = new Date(iso + 'T12:00:00Z');
    return d.toLocaleDateString(FR ? 'fr-FR' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  }
  dateIn.min = dubaiDate(0); dateIn.max = dubaiDate(89);
  daysEl.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (k) { var d = dubaiDate(k); return '<button type="button" data-d="' + d + '">' + label(d, k) + '</button>'; }).join('');
  daysEl.querySelectorAll('button').forEach(function (b) { b.onclick = function () { dateIn.value = b.dataset.d; load(); }; });

  // project=experience : la demande part comme « Shared Experience Enquiry » (son onglet, sa liste Brevo, sa séquence)
  function enquireHref(title, dep) { return U('/yacht-research-form') + '?project=experience&yacht=' + encodeURIComponent(title + ' · ' + dep.date + ' ' + dep.time); }

  // Remplit une carte avec ses départs du jour
  function fill(card, title, deps) {
    var slots = card.querySelector('[data-slots]'), price = card.querySelector('[data-price]'), cta = card.querySelector('[data-cta]');
    var fromEl = card.querySelector('.xp-from');
    card.classList.toggle('xp-off', !deps.length);
    // l'ordre des cartes est donné par le tri de la page (yr.js) : plus cher d'abord par défaut, la nouveauté en tête
    if (fromEl) fromEl.hidden = !!deps.length; // le prix du jour remplace le prix indicatif
    if (!deps.length) { slots.innerHTML = '<span class="xp-wait">' + L('No departure on this date. Try another day.') + '</span>'; price.innerHTML = ''; cta.innerHTML = ''; return; }
    var best = null;
    deps.forEach(function (d) { if (d.from_aed && (!best || d.from_aed < best.v)) best = { v: d.from_aed, w: d.was_aed }; });
    if (!best && card.dataset.from) best = { v: +card.dataset.from, w: +card.dataset.was || 0 }; // prix indicatif si le devis du jour n'est pas encore arrivé
    price.innerHTML = best ? was(best.w) + '<small>' + L('From') + '</small> ' + aed(best.v) + ' <small>' + L('per guest') + '</small>' : '<small>' + L('Price on request') + '</small>';
    slots.innerHTML = deps.map(function (d, i) {
      // places restantes exactes quand il en reste peu, sinon « dernières places » si le portail l'indique
      var low = d.seats > 0 || d.availability === 'Low availability';
      var tag = d.seats > 0 ? (FR ? d.seats + (d.seats > 1 ? ' places' : ' place') : d.seats + (d.seats > 1 ? ' spots left' : ' spot left')) : low ? L('Few left') : '';
      return '<button type="button" class="xp-slot' + (low ? ' low' : '') + '" data-i="' + i + '" title="' + (low ? L('Few places left') : L('Available')) + '">' + esc(d.time) + (tag ? '<small>' + tag + '</small>' : '') + '</button>';
    }).join('');
    var pick = function (i) {
      slots.querySelectorAll('.xp-slot').forEach(function (b) { b.classList.toggle('on', +b.dataset.i === i); });
      var d = deps[i];
      cta.innerHTML = state.bookings
        ? '<button type="button" class="btn btn-gold">' + L('Book') + ' ' + esc(d.time) + ' <i>→</i></button>'
        : '<a class="btn btn-gold" href="' + enquireHref(title, d) + '">' + L('Enquire for') + ' ' + esc(d.time) + ' <i>→</i></a>';
      var b = cta.querySelector('button'); if (b) b.onclick = function () { open(d, title); };
    };
    slots.querySelectorAll('.xp-slot').forEach(function (b) { b.onclick = function () { pick(+b.dataset.i); }; });
    pick(0);
  }

  function load() {
    state.date = dateIn.value;
    daysEl.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.d === state.date); });
    cards.forEach(function (c) { c.querySelector('[data-slots]').innerHTML = '<span class="xp-wait">' + L('Loading times…') + '</span>'; });
    fetch('/api/sx/departures?date=' + encodeURIComponent(state.date)).then(function (r) { return r.json(); }).then(function (d) {
      if (!d.enabled) throw new Error('off');
      state.bookings = !!d.bookings; state.addons = d.addons || {};
      note.textContent = /sx=cancelled/.test(location.search) ? L('Payment cancelled: nothing has been charged.')
        : /sx=failed/.test(location.search) ? L('Payment declined: nothing has been charged. Please try again or use another card.')
        : d.test ? L('TEST MODE · payments are simulated, nothing is charged and no seat is booked.')
        : state.bookings
        ? L('Live availability, instant confirmation and secure card payment.')
        : L('Live times and prices. Choose a time and send your request: we confirm your seats with you directly by WhatsApp or email.');
      var deps = (d.departures || []).filter(function (x) { return x.availability !== 'None'; });
      var used = {};
      cards.forEach(function (c) {
        var names = JSON.parse(c.dataset.names || '[]');
        // reconnue par son nom, ou par l'identifiant Xclusive du produit (les noms changent parfois chez eux)
        var mine = deps.filter(function (x) { return !used[x.id] && (names.indexOf(x.product) > -1 || (c.dataset.xslug && x.slug === c.dataset.xslug)); });
        mine.forEach(function (x) { used[x.id] = 1; });
        fill(c, c.dataset.title, mine);
      });
      // Expériences pas encore décrites sur la page : une carte simple par produit
      var rest = deps.filter(function (x) { return !used[x.id]; }), groups = {};
      rest.forEach(function (x) { (groups[x.product] = groups[x.product] || []).push(x); });
      var keys = Object.keys(groups);
      if (more.hasAttribute('data-off')) keys = []; // fiche d'une seule expérience : pas de liste annexe
      more.hidden = !keys.length;
      moreGrid.innerHTML = keys.map(function (k) { return '<article class="sx-card xp-mini"><h4>' + esc(k) + '</h4><div class="xp-slots" data-slots></div><div class="xp-foot"><p class="xp-price" data-price></p><span data-cta></span></div></article>'; }).join('');
      [].slice.call(moreGrid.children).forEach(function (el, i) { fill(el, keys[i], groups[keys[i]]); });
    }).catch(function () {
      note.textContent = L('Live times are unavailable right now. Send us your request and we will confirm availability for you.');
      cards.forEach(function (c) {
        c.querySelector('[data-slots]').innerHTML = '';
        c.querySelector('[data-price]').innerHTML = c.dataset.from ? '<small>' + L('From') + '</small> ' + aed(c.dataset.from) + ' <small>' + L('per guest') + '</small>' : '';
        c.querySelector('[data-cta]').innerHTML = '<a class="btn btn-gold" href="' + U('/yacht-research-form') + '?project=experience&yacht=' + encodeURIComponent(c.dataset.title) + '">' + L('Enquire') + ' <i>→</i></a>';
      });
    });
  }

  var qTimer;
  function quote() {
    clearTimeout(qTimer);
    var tot = modal.querySelector('[data-sx-total]'); tot.textContent = '…';
    qTimer = setTimeout(function () {
      var a = +form.adults.value, c = +form.children.value;
      if (a + c < 1) { tot.textContent = '—'; return; }
      fetch('/api/sx/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ departure_id: state.dep.id, adults: a, children: c }) })
        .then(function (r) { return r.json(); }).then(function (q) { state.pay = q.total_aed ? aed(q.pay_aed || q.total_aed) : '—'; tot.innerHTML = q.total_aed ? was(q.was_aed) + state.pay : '—'; var fe = modal.querySelector('[data-sx-fee]'); if (fe) fe.textContent = q.card_fee_aed ? (FR ? 'Dont ' + aed(q.card_fee_aed) + ' de frais de paiement par carte (' + q.card_fee_pct + ' %). Aucun frais par virement.' : 'Includes ' + aed(q.card_fee_aed) + ' card processing fee (' + q.card_fee_pct + '%). No fee by bank transfer.') : ''; err.textContent = q.error ? (ERR[q.error] || L('Price unavailable for this selection.')) : ''; });
    }, 250);
  }

  // Add-ons de l'expérience : sur demande (l'API ne permet pas de les réserver), le client nous contacte sur WhatsApp
  function addonsBox(dep) {
    var box = modal.querySelector('[data-sx-addons]'); if (!box) return;
    var list = (state.addons && dep.slug && state.addons[dep.slug]) || [];
    box.hidden = !list.length; if (!list.length) { box.innerHTML = ''; return; }
    var AFR = { 'Birthday Celebrations': 'Anniversaire', 'Photographer (1hr)': 'Photographe (1 h)', 'Unlimited beers': 'Bières à volonté', 'Romantic Decorations': 'Décoration romantique', 'Butler Service': 'Service de majordome', 'Upper Deck Seat': 'Place sur le pont supérieur', 'Moët & Chandon': 'Moët & Chandon', 'MoÃ«t & Chandon': 'Moët & Chandon' };
    var unit = function (u) { return u === 'adult' ? (FR ? ' / adulte' : ' / adult') : u === 'guest' ? (FR ? ' / pers.' : ' / guest') : ''; };
    box.innerHTML = '<details class="xg sx-addons"><summary>' + L('Add-ons on request') + '<small>' + list.length + '</small><em></em></summary><div class="xl">' +
      list.map(function (a) { return '<div class="x" style="grid-template-columns:1fr auto;cursor:default"><span class="xn">' + esc(FR && AFR[a.n] ? AFR[a.n] : a.n.replace('MoÃ«t', 'Moët')) + '</span><span class="xp">' + aed(a.p) + '<small>' + unit(a.u) + '</small></span></div>'; }).join('') +
      '<p class="sx-addon-note">' + L('Add-ons are arranged on request. To include them, message us on WhatsApp instead of paying here: we book your seats together with the add-ons and send you the payment details.') + '</p>' +
      '<div class="yp-wa"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp ' + (FR ? 'EAU' : 'UAE') + '</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp FR</a></div></div></details>';
  }

  function open(dep, title) {
    state.dep = dep; err.textContent = ''; err.classList.remove('ok'); addonsBox(dep);
    modal.querySelector('[data-sx-title]').textContent = title || dep.product;
    var left = dep.seats > 0 ? dep.seats : 0;
    modal.querySelector('[data-sx-when]').textContent = dep.date + ' ' + L('at') + ' ' + dep.time + ' ' + L('(Dubai time)')
      + (left ? ' · ' + (FR ? left + (left > 1 ? ' places restantes' : ' place restante') : left + (left > 1 ? ' spots left' : ' spot left')) : '');
    modal.querySelector('[data-sx-a]').textContent = (dep.categories && dep.categories.adults) || L('Adults');
    modal.querySelector('[data-sx-c]').textContent = (dep.categories && dep.categories.children) || L('Children');
    form.adults.value = String(left && left < 2 ? left : 2); form.children.value = '0';
    capSeats();
    modal.hidden = false; document.body.style.overflow = 'hidden'; quote();
  }
  // Quand il reste peu de places (nombre connu), on ne peut pas choisir plus de participants qu'il n'en reste
  function capSeats() {
    var max = state.dep && state.dep.seats > 0 ? state.dep.seats : 0, a = +form.adults.value, c = +form.children.value;
    [[form.adults, c], [form.children, a]].forEach(function (p) {
      [].forEach.call(p[0].options, function (o) { o.disabled = !!max && +o.value + p[1] > max; });
    });
  }
  function close() { modal.hidden = true; document.body.style.overflow = ''; }
  modal.querySelector('.sx-x').onclick = close;
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  form.adults.onchange = form.children.onchange = function () { capSeats(); quote(); };
  // Retour arrière depuis la page de paiement : le navigateur restaure la page telle quelle (bouton bloqué), on la remet à zéro
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    var b = form.querySelector('button[type=submit]'); b.disabled = false; b.firstChild.textContent = L('Pay securely ');
    if (!modal.hidden && state.dep) quote();
  });

  form.onsubmit = function (e) {
    e.preventDefault(); err.textContent = ''; err.classList.remove('ok');
    var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.firstChild.textContent = L('Redirecting to payment… ');
    fetch('/api/sx/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      departure_id: state.dep.id, date: state.dep.date, adults: +form.adults.value, children: +form.children.value,
      name: form.name.value, email: form.email.value, phone: form.phone.value, lang: FR ? 'fr' : 'en' }) })
      .then(function (r) { return r.json(); }).then(function (d) {
        if (d.url) { location.href = d.url; return; }
        if (d.error === 'contact_us') {
          // réservation en ligne impossible pour ce départ en ce moment : on oriente vers WhatsApp / e-mail (rien n'a été payé)
          err.innerHTML = esc(FR ? 'La réservation en ligne n’est pas disponible pour ce départ en ce moment. Rien n’a été débité : contactez-nous, nous réservons vos places pour vous.'
            : 'Online booking is not available for this departure right now. Nothing has been charged: contact us and we will book your seats for you.') +
            '<span class="sx-contact"><a href="https://wa.me/qr/5NK5SR22CXGNC1" target="_blank" rel="noopener">WhatsApp ' + (FR ? 'EAU' : 'UAE') + '</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" target="_blank" rel="noopener">WhatsApp FR</a><a href="mailto:contact@yachtresearchgroup.com">contact@yachtresearchgroup.com</a></span>';
          btn.disabled = false; btn.firstChild.textContent = L('Pay securely ');
          return;
        }
        err.textContent = ERR[d.error] || L('Something went wrong. Please try again or contact us on WhatsApp.');
        btn.disabled = false; btn.firstChild.textContent = L('Pay securely ');
        if (d.error === 'departure_unavailable' || d.error === 'booking_unavailable') load();
      }).catch(function () { err.textContent = L('Connection problem. Please try again.'); btn.disabled = false; btn.firstChild.textContent = L('Pay securely '); });
  };

  // Virement bancaire : demande envoyée à Yacht Research, qui répond avec les coordonnées bancaires et confirme la place à réception
  var bank = modal.querySelector('[data-sx-bank]');
  if (bank) bank.onclick = function () {
    err.textContent = '';
    if (form.name.value.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()) || form.phone.value.trim().length < 6) { err.textContent = L('Please fill in your name, email and phone first.'); return; }
    var a = +form.adults.value, c = +form.children.value;
    var p = new URLSearchParams({ form_name: 'Bank Transfer Request', name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(),
      type: 'Shared experience (bank transfer)', message: (modal.querySelector('[data-sx-title]').textContent) + ' · ' + state.dep.date + ' ' + state.dep.time + ' · ' + a + ' adult(s), ' + c + ' child(ren) · departure #' + state.dep.id + ' · quoted ' + (state.pay || '—') + ' (card total)', website: '', submitted_at: new Date().toLocaleString('fr-FR') });
    fetch('https://script.google.com/macros/s/AKfycbwT-6-C2qRtUhX4MXVhFzNUd5t1By9PDNdHfZ3krMiW8LIVgnC6ry-Qyon7Fam2B0gd/exec', { method: 'POST', body: p, mode: 'no-cors' }).catch(function () {});
    bank.disabled = true;
    err.classList.add('ok'); err.textContent = L('Request sent. We will email you our bank details shortly.');
  };

  dateIn.onchange = load;
  dateIn.value = dubaiDate(1);
  load();
})();
