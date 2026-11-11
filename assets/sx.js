// Shared experiences in Dubai (/shared-experiences) : une carte par expérience (contenu fixe dans la page),
// horaires du jour en boutons, disponibilité et prix « à partir de » en direct, puis demande ou paiement.
(function () {
  var root = document.getElementById('sx'); if (!root) return;
  var dateIn = root.querySelector('[data-sx-date]'), daysEl = root.querySelector('[data-sx-days]'), note = root.querySelector('[data-sx-note]');
  var cards = [].slice.call(root.querySelectorAll('.xp-card'));
  var more = root.querySelector('[data-sx-more]'), moreGrid = root.querySelector('[data-sx-more-grid]');
  var modal = document.getElementById('sx-modal'), form = modal.querySelector('form'), err = modal.querySelector('.sx-err');
  var state = { bookings: false, dep: null, date: '' };
  var aed = function (n) { return 'AED ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 }); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ERR = { departure_unavailable: 'This departure is now full. Please choose another time.', booking_unavailable: 'This departure is now full. Please choose another time.', price_changed: 'The price has just changed. Please check the new total.', invalid_phone: 'Please enter your phone number with the country code, e.g. +971 50 123 4567.', invalid_email: 'Please enter a valid email address.', invalid_name: 'Please enter your full name.', invalid_guests: 'Choose between 1 and 20 guests.', bookings_closed: 'Online booking is not open yet. Send us an enquiry instead.' };

  // Galerie de chaque carte
  cards.forEach(function (c) {
    var m = c.querySelector('.xp-media'), imgs = JSON.parse(m.dataset.imgs || '[]'), img = m.querySelector('img'), cnt = m.querySelector('.xp-count b'), i = 0;
    function show(k) { i = (k + imgs.length) % imgs.length; img.srcset = imgs[i] + '-800.webp 800w, ' + imgs[i] + '.webp 1600w'; img.src = imgs[i] + '-800.webp'; if (cnt) cnt.textContent = i + 1; }
    m.querySelectorAll('.xp-nav').forEach(function (b) { b.onclick = function () { show(i + (b.classList.contains('next') ? 1 : -1)); }; });
  });

  function dubaiDate(add) { return new Date(Date.now() + 4 * 3600e3 + (add || 0) * 864e5).toISOString().slice(0, 10); }
  function label(iso, k) {
    if (k === 0) return 'Today'; if (k === 1) return 'Tomorrow';
    var d = new Date(iso + 'T12:00:00Z');
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  }
  dateIn.min = dubaiDate(0); dateIn.max = dubaiDate(89);
  daysEl.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (k) { var d = dubaiDate(k); return '<button type="button" data-d="' + d + '">' + label(d, k) + '</button>'; }).join('');
  daysEl.querySelectorAll('button').forEach(function (b) { b.onclick = function () { dateIn.value = b.dataset.d; load(); }; });

  function enquireHref(title, dep) { return '/yacht-research-form?project=charter&yacht=' + encodeURIComponent(title + ' · ' + dep.date + ' ' + dep.time); }

  // Remplit une carte avec ses départs du jour
  function fill(card, title, deps) {
    var slots = card.querySelector('[data-slots]'), price = card.querySelector('[data-price]'), cta = card.querySelector('[data-cta]');
    var fromEl = card.querySelector('.xp-from');
    card.classList.toggle('xp-off', !deps.length);
    card.style.order = deps.length ? '0' : '1'; // les expériences disponibles ce jour-là d'abord
    if (fromEl) fromEl.hidden = !!deps.length; // le prix du jour remplace le prix indicatif
    if (!deps.length) { slots.innerHTML = '<span class="xp-wait">No departure on this date. Try another day.</span>'; price.innerHTML = ''; cta.innerHTML = ''; return; }
    var low = deps.map(function (d) { return d.from_aed; }).filter(Boolean);
    if (!low.length && card.dataset.from) low = [+card.dataset.from]; // prix indicatif si le devis du jour n'est pas encore arrivé
    price.innerHTML = low.length ? '<small>From</small> ' + aed(Math.min.apply(null, low)) + ' <small>per guest</small>' : '<small>Price on request</small>';
    slots.innerHTML = deps.map(function (d, i) {
      return '<button type="button" class="xp-slot' + (d.availability === 'Low availability' ? ' low' : '') + '" data-i="' + i + '" title="' + (d.availability === 'Low availability' ? 'Few places left' : 'Available') + '">' + esc(d.time) + (d.availability === 'Low availability' ? '<small>Few left</small>' : '') + '</button>';
    }).join('');
    var pick = function (i) {
      slots.querySelectorAll('.xp-slot').forEach(function (b) { b.classList.toggle('on', +b.dataset.i === i); });
      var d = deps[i];
      cta.innerHTML = state.bookings
        ? '<button type="button" class="btn btn-gold">Book ' + esc(d.time) + ' <i>→</i></button>'
        : '<a class="btn btn-gold" href="' + enquireHref(title, d) + '">Enquire for ' + esc(d.time) + ' <i>→</i></a>';
      var b = cta.querySelector('button'); if (b) b.onclick = function () { open(d, title); };
    };
    slots.querySelectorAll('.xp-slot').forEach(function (b) { b.onclick = function () { pick(+b.dataset.i); }; });
    pick(0);
  }

  function load() {
    state.date = dateIn.value;
    daysEl.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.d === state.date); });
    cards.forEach(function (c) { c.querySelector('[data-slots]').innerHTML = '<span class="xp-wait">Loading times…</span>'; });
    fetch('/api/sx/departures?date=' + encodeURIComponent(state.date)).then(function (r) { return r.json(); }).then(function (d) {
      if (!d.enabled) throw new Error('off');
      state.bookings = !!d.bookings;
      note.textContent = /sx=cancelled/.test(location.search) ? 'Payment cancelled: nothing has been charged.' : state.bookings
        ? 'Live availability, instant confirmation and secure card payment.'
        : 'Live times and prices. Choose a time and send your request: we confirm your seats with you directly by WhatsApp or email.';
      var deps = (d.departures || []).filter(function (x) { return x.availability !== 'None'; });
      var used = {};
      cards.forEach(function (c) {
        var names = JSON.parse(c.dataset.names || '[]');
        var mine = deps.filter(function (x) { return names.indexOf(x.product) > -1; });
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
      note.textContent = 'Live times are unavailable right now. Send us your request and we will confirm availability for you.';
      cards.forEach(function (c) {
        c.querySelector('[data-slots]').innerHTML = '';
        c.querySelector('[data-price]').innerHTML = c.dataset.from ? '<small>From</small> ' + aed(c.dataset.from) + ' <small>per guest</small>' : '';
        c.querySelector('[data-cta]').innerHTML = '<a class="btn btn-gold" href="/yacht-research-form?project=charter&yacht=' + encodeURIComponent(c.dataset.title) + '">Enquire <i>→</i></a>';
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
        .then(function (r) { return r.json(); }).then(function (q) { tot.textContent = q.total_aed ? aed(q.pay_aed || q.total_aed) : '—'; var fe = modal.querySelector('[data-sx-fee]'); if (fe) fe.textContent = q.card_fee_aed ? 'Includes ' + aed(q.card_fee_aed) + ' card processing fee (' + q.card_fee_pct + '%). No fee by bank transfer.' : ''; err.textContent = q.error ? (ERR[q.error] || 'Price unavailable for this selection.') : ''; });
    }, 250);
  }

  function open(dep, title) {
    state.dep = dep; err.textContent = '';
    modal.querySelector('[data-sx-title]').textContent = title || dep.product;
    modal.querySelector('[data-sx-when]').textContent = dep.date + ' at ' + dep.time + ' (Dubai time)';
    modal.querySelector('[data-sx-a]').textContent = (dep.categories && dep.categories.adults) || 'Adults';
    modal.querySelector('[data-sx-c]').textContent = (dep.categories && dep.categories.children) || 'Children';
    form.adults.value = '2'; form.children.value = '0';
    modal.hidden = false; document.body.style.overflow = 'hidden'; quote();
  }
  function close() { modal.hidden = true; document.body.style.overflow = ''; }
  modal.querySelector('.sx-x').onclick = close;
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  form.adults.onchange = form.children.onchange = quote;

  form.onsubmit = function (e) {
    e.preventDefault(); err.textContent = '';
    var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.firstChild.textContent = 'Redirecting to payment… ';
    fetch('/api/sx/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      departure_id: state.dep.id, date: state.dep.date, adults: +form.adults.value, children: +form.children.value,
      name: form.name.value, email: form.email.value, phone: form.phone.value }) })
      .then(function (r) { return r.json(); }).then(function (d) {
        if (d.url) { location.href = d.url; return; }
        err.textContent = ERR[d.error] || 'Something went wrong. Please try again or contact us on WhatsApp.';
        btn.disabled = false; btn.firstChild.textContent = 'Pay securely ';
        if (d.error === 'departure_unavailable' || d.error === 'booking_unavailable') load();
      }).catch(function () { err.textContent = 'Connection problem. Please try again.'; btn.disabled = false; btn.firstChild.textContent = 'Pay securely '; });
  };

  // Virement bancaire : demande envoyée à Yacht Research, qui répond avec les coordonnées bancaires et confirme la place à réception
  var bank = modal.querySelector('[data-sx-bank]');
  if (bank) bank.onclick = function () {
    err.textContent = '';
    if (form.name.value.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()) || form.phone.value.trim().length < 6) { err.textContent = 'Please fill in your name, email and phone first.'; return; }
    var a = +form.adults.value, c = +form.children.value;
    var p = new URLSearchParams({ form_name: 'Bank Transfer Request', name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(),
      type: 'Shared experience (bank transfer)', message: (modal.querySelector('[data-sx-title]').textContent) + ' · ' + state.dep.date + ' ' + state.dep.time + ' · ' + a + ' adult(s), ' + c + ' child(ren) · departure #' + state.dep.id + ' · quoted ' + modal.querySelector('[data-sx-total]').textContent + ' (card total)', website: '', submitted_at: new Date().toLocaleString('fr-FR') });
    fetch('https://script.google.com/macros/s/AKfycbwT-6-C2qRtUhX4MXVhFzNUd5t1By9PDNdHfZ3krMiW8LIVgnC6ry-Qyon7Fam2B0gd/exec', { method: 'POST', body: p, mode: 'no-cors' }).catch(function () {});
    bank.disabled = true;
    err.textContent = 'Thank you. We will send you our bank details shortly; your seats are confirmed once the transfer is received.';
  };

  dateIn.onchange = load;
  dateIn.value = dubaiDate(1);
  load();
})();
