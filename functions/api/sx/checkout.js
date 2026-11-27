// POST /api/sx/checkout → vérifie la sortie, le prix et les données client, puis crée le paiement (Ziina par défaut, ou Stripe).
// La réservation chez Xclusive n'est faite QU'APRÈS le paiement, avec le même prix B2B vérifié.
import { json, xc, stripe, ziina, ziinaTest, sealToken, payProvider, bookingsOpen, notify, sellMinor, publicSlots, publicMinor, cardFeePct, int, cleanPhone } from '../../_sx.js';

// Ziina refuse certains caractères dans le libellé (le « & » de « Palm Jumeirah, Burj Al Arab & Marina » faisait échouer le paiement)
function zMsg(s, fr) {
  return String(s || '').replace(/&/g, fr ? ' et ' : ' and ').replace(/[<>"'`\\{}|^~[\]#%:;=+$@*]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export async function onRequestPost({ env, request }) {
  if (!bookingsOpen(env)) return json({ error: 'bookings_closed' }, 503);
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'invalid_body' }, 400); }

  const departure_id = int(b.departure_id, 1, 2147483647), adults = int(b.adults, 0, 20), children = int(b.children, 0, 20);
  const date = String(b.date || '');
  const name = String(b.name || '').trim().replace(/\s+/g, ' ').slice(0, 32);
  const email = String(b.email || '').trim().toLowerCase();
  const phone = cleanPhone(b.phone);
  if (!departure_id || adults === null || children === null || adults + children < 1 || adults + children > 20) return json({ error: 'invalid_guests' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'invalid_date' }, 400);
  if (name.length < 2) return json({ error: 'invalid_name' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 64) return json({ error: 'invalid_email' }, 400);
  if (!phone) return json({ error: 'invalid_phone' }, 400);

  // 1) la sortie existe toujours et a encore des places
  const list = await xc(env, '/departures?date=' + date);
  if (!list.ok) return json({ error: list.code }, 424);
  const dep = (list.data.departures || []).find(d => d.id === departure_id);
  if (!dep || dep.availability === 'None') return json({ error: 'departure_unavailable' }, 409);

  // 2) prix B2B actuel, puis 3) contrôle à blanc de la réservation (format + prix, sans rien bloquer)
  const q = await xc(env, '/quote', { method: 'POST', body: { departure_id, adults, children, featured: false } });
  if (!q.ok) return json({ error: q.code }, 409);
  const b2b = q.data.total_minor;
  const booking = { departure_id, adults, children, featured: false, name, phone, email: env.SX_GUEST_EMAIL || email, expected_total_minor: b2b };
  const dry = await xc(env, '/validate-booking', { method: 'POST', body: booking });
  if (!dry.ok && (dry.code === 'payment_required' || dry.status === 402)) {
    // Wallet Xclusive insuffisant : le client ne paie pas, il est invité à nous contacter (sans mention du wallet)
    await notify(env, { status: 'ACTION NEEDED · wallet Xclusive insuffisant · un client voulait réserver (NON payé) · rechargez au moins ' + (b2b / 100).toFixed(2) + ' AED (prix B2B)', product: dep.product, date: dep.date, time: dep.time, guests: String(adults + children), name, phone, client_email: email, b2b_aed: (b2b / 100).toFixed(2) });
    return json({ error: 'contact_us' }, 409);
  }
  if (!dry.ok) return json({ error: dry.code }, 409);

  // 4) paiement au prix client (prix public de l'horaire −10 %, jamais sous B2B + marge), même calcul que /api/sx/quote
  const pub = await publicSlots(env);
  const slot = pub[departure_id];
  const { retail, fee } = sellMinor(env, b2b, publicMinor(slot, adults, children), slot && slot[5]);
  const origin = new URL(request.url).origin;
  const guests = adults + children;
  const fr = b.lang === 'fr';

  if (payProvider(env) === 'ziina') {
    const token = await sealToken(env, { dep: departure_id, a: adults, c: children, b2b, retail, fee, n: name, p: phone, e: email, pr: dep.product.slice(0, 120), d: dep.date, t: dep.time, l: fr ? 'fr' : 'en' });
    const back = origin + (fr ? '/fr' : '') + '/shared-experiences';
    const when = dep.date + ' ' + dep.time + ' · ' + guests + (fr ? ' pers.' : guests > 1 ? ' guests' : ' guest');
    // Ziina refuse certains libellés : on retente avec un libellé plus court, puis minimal, plutôt que de bloquer le paiement
    const labels = [zMsg(dep.product, fr) + ' · ' + when, 'Yacht Research · ' + when, 'Yacht Research'];
    let z, detail = '';
    for (const message of labels) {
      z = await ziina(env, '/payment_intent', {
        amount: retail + fee,
        currency_code: 'AED',
        message,
        success_url: origin + (fr ? '/fr' : '') + '/booking-confirmed?pi={PAYMENT_INTENT_ID}&t=' + token,
        cancel_url: back + '?sx=cancelled#sx',
        failure_url: back + '?sx=failed#sx',
        expiry: String(Date.now() + 30 * 60 * 1000),
        test: ziinaTest(env)
      });
      if (z.ok && z.data.redirect_url) return json({ url: z.data.redirect_url, ...(detail ? { note: detail } : {}) });
      const d = z.data || {};
      detail += (detail ? ' | ' : '') + z.status + ' ' + String(d.message || d.error || d.code || '').slice(0, 160);
      if (z.status >= 500 || z.status === 401 || z.status === 503) break;
    }
    return json({ error: 'payment_unavailable', detail }, 424);
  }

  const meta = { departure_id, adults, children, b2b_minor: b2b, retail_minor: retail, card_fee_minor: fee, name, phone, email, product: dep.product.slice(0, 200), date: dep.date, time: dep.time };
  const p = {
    mode: 'payment',
    customer_email: email,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'aed',
    'line_items[0][price_data][unit_amount]': String(retail),
    'line_items[0][price_data][product_data][name]': dep.product.slice(0, 200),
    'line_items[0][price_data][product_data][description]': `${dep.date} at ${dep.time} (Dubai time) · ${guests} guest${guests > 1 ? 's' : ''}`,
    ...(fee ? {
      'line_items[1][quantity]': '1',
      'line_items[1][price_data][currency]': 'aed',
      'line_items[1][price_data][unit_amount]': String(fee),
      'line_items[1][price_data][product_data][name]': 'Card processing fee (' + cardFeePct(env) + '%)',
      'line_items[1][price_data][product_data][description]': 'Charged by the card payment provider. No fee when paying by bank transfer.'
    } : {}),
    success_url: origin + '/booking-confirmed?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: origin + '/shared-experiences?sx=cancelled#sx',
    expires_at: String(Math.floor(Date.now() / 1000) + 30 * 60),
    'payment_intent_data[description]': 'Yacht Research · ' + dep.product.slice(0, 150) + ' · ' + dep.date + ' ' + dep.time
  };
  for (const [k, v] of Object.entries(meta)) { p['metadata[' + k + ']'] = String(v); p['payment_intent_data[metadata][' + k + ']'] = String(v); }
  const s = await stripe(env, '/checkout/sessions', p);
  if (!s.ok || !s.data.url) return json({ error: 'payment_unavailable' }, 424);
  return json({ url: s.data.url });
}
