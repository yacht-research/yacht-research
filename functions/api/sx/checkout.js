// POST /api/sx/checkout → vérifie la sortie, le prix et les données client, puis crée un paiement Stripe Checkout.
// La réservation chez Xclusive n'est faite QU'APRÈS le paiement (webhook Stripe), avec le même prix B2B vérifié.
import { json, xc, stripe, retailMinor, cardFeeMinor, cardFeePct, int, cleanPhone } from '../../_sx.js';

export async function onRequestPost({ env, request }) {
  if (env.SX_BOOKINGS !== 'on' || !env.STRIPE_SECRET_KEY || !env.XCLUSIVE_API_KEY) return json({ error: 'bookings_closed' }, 503);
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
  if (!list.ok) return json({ error: list.code }, 502);
  const dep = (list.data.departures || []).find(d => d.id === departure_id);
  if (!dep || dep.availability === 'None') return json({ error: 'departure_unavailable' }, 409);

  // 2) prix B2B actuel, puis 3) contrôle à blanc de la réservation (format + prix, sans rien bloquer)
  const q = await xc(env, '/quote', { method: 'POST', body: { departure_id, adults, children, featured: false } });
  if (!q.ok) return json({ error: q.code }, 409);
  const b2b = q.data.total_minor;
  const booking = { departure_id, adults, children, featured: false, name, phone, email: env.SX_GUEST_EMAIL || email, expected_total_minor: b2b };
  const dry = await xc(env, '/validate-booking', { method: 'POST', body: booking });
  if (!dry.ok) return json({ error: dry.code }, 409);

  // 4) paiement Stripe au prix public
  const retail = retailMinor(b2b, env), fee = cardFeeMinor(retail, env);
  const origin = new URL(request.url).origin;
  const guests = adults + children;
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
  if (!s.ok || !s.data.url) return json({ error: 'payment_unavailable' }, 502);
  return json({ url: s.data.url });
}
