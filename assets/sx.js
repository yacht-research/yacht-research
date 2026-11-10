// Shared experiences in Dubai : liste des sorties du jour, devis et paiement (page Charter)
(function () {
  var root = document.getElementById('sx'); if (!root) return;
  var grid = root.querySelector('[data-sx-grid]'), dateIn = root.querySelector('[data-sx-date]');
  var modal = document.getElementById('sx-modal'), form = modal.querySelector('form'), err = modal.querySelector('.sx-err');
  var state = { bookings: false, dep: null, date: '' };
  var aed = function (n) { return 'AED ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 }); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ERR = { departure_unavailable: 'This departure is now full. Please choose another time.', booking_unavailable: 'This departure is now full. Please choose another time.', price_changed: 'The price has just changed. Please check the new total.', invalid_phone: 'Please enter your phone number with the country code, e.g. +971 50 123 4567.', invalid_email: 'Please enter a valid email address.', invalid_name: 'Please enter your full name.', invalid_guests: 'Choose between 1 and 20 guests.', bookings_closed: 'Online booking is not open yet. Send us an enquiry instead.' };

  function dubaiDate(addDays) { return new Date(Date.now() + 4 * 3600e3 + (addDays || 0) * 864e5).toISOString().slice(0, 10); }
  dateIn.min = dubaiDate(0); dateIn.max = dubaiDate(89); dateIn.value = dubaiDate(1);

  function load() {
    state.date = dateIn.value;
    grid.innerHTML = '<p class="sx-msg">Loading departures…</p>';
    fetch('/api/sx/departures?date=' + encodeURIComponent(state.date)).then(function (r) { return r.json(); }).then(function (d) {
      if (!d.enabled) { root.hidden = true; return; }
      root.hidden = false; state.bookings = !!d.bookings;
      var deps = (d.departures || []).filter(function (x) { return x.availability !== 'None'; });
      if (!deps.length) { grid.innerHTML = '<p class="sx-msg">No departures left on this date. Try another day.</p>'; return; }
      grid.innerHTML = deps.map(function (x, i) {
        var av = x.availability === 'Low availability' ? '<span class="sx-av low">Few places left</span>' : '<span class="sx-av ok">Available</span>';
        return '<article class="sx-card"><h4>' + esc(x.product) + '</h4><div class="sx-meta"><span>' + esc(x.time) + ' · Dubai</span>' + av + '</div>' +
          '<p class="sx-price">' + (x.from_aed ? '<small>From </small>' + aed(x.from_aed) + ' <small>per guest</small>' : '<small>Price on selection</small>') + '</p>' +
          (state.bookings ? '<button class="btn btn-gold" data-i="' + i + '">Book now <i>→</i></button>' : '<a class="btn btn-ghost" href="/yacht-research-form?project=charter&yacht=' + encodeURIComponent(x.product + ' · ' + x.date + ' ' + x.time) + '">Enquire <i>→</i></a>') + '</article>';
      }).join('');
      grid.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { open(deps[+b.dataset.i]); }; });
    }).catch(function () { grid.innerHTML = '<p class="sx-msg">Departures are unavailable right now. Please try again in a moment.</p>'; });
  }

  var qTimer;
  function quote() {
    clearTimeout(qTimer);
    var tot = modal.querySelector('[data-sx-total]'); tot.textContent = '…';
    qTimer = setTimeout(function () {
      var a = +form.adults.value, c = +form.children.value;
      if (a + c < 1) { tot.textContent = '—'; return; }
      fetch('/api/sx/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ departure_id: state.dep.id, adults: a, children: c }) })
        .then(function (r) { return r.json(); }).then(function (q) { tot.textContent = q.total_aed ? aed(q.total_aed) : '—'; err.textContent = q.error ? (ERR[q.error] || 'Price unavailable for this selection.') : ''; });
    }, 250);
  }

  function open(dep) {
    state.dep = dep; err.textContent = '';
    modal.querySelector('[data-sx-title]').textContent = dep.product;
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

  dateIn.onchange = load;
  if (/sx=cancelled/.test(location.search)) root.querySelector('[data-sx-note]').textContent = 'Payment cancelled: nothing has been charged.';
  load();
})();
