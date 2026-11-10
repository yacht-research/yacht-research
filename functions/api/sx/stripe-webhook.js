// POST /api/sx/stripe-webhook : appelé par Stripe quand le client a payé.
// → réserve chez Xclusive (POST /bookings, clé d'idempotence = id de la session Stripe, donc jamais deux réservations pour un paiement)
// → si la réservation est refusée (plus de place, prix changé…), rembourse le client automatiquement et prévient Yacht Research.
import { json, xc, stripe, hmacHex, safeEqual, notify } from '../../_sx.js';

const RETRY = new Set(['network_error', 'rate_limited', 'request_in_progress', 'temporarily_unavailable', 'http_500', 'http_502', 'http_503', 'http_504', 'not_configured']);

async function verify(env, raw, header) {
  if (!env.STRIPE_WEBHOOK_SECRET || !header) return false;
  const parts = Object.fromEntries(header.split(',').map(kv => kv.split('=')).filter(a => a.length === 2 && a[0] === 't'));
  const t = parts.t; const sigs = header.split(',').filter(s => s.startsWith('v1=')).map(s => s.slice(3));
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = await hmacHex(env.STRIPE_WEBHOOK_SECRET, t + '.' + raw);
  return sigs.some(s => safeEqual(s, expected));
}

export async function onRequestPost({ env, request }) {
  const raw = await request.text();
  if (!(await verify(env, raw, request.headers.get('Stripe-Signature')))) return json({ error: 'bad_signature' }, 400);
  const event = JSON.parse(raw);
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) return json({ ignored: event.type });
  const s = event.data.object;
  if (s.payment_status !== 'paid' || !s.metadata || !s.metadata.departure_id) return json({ ignored: 'not_paid' });
  const m = s.metadata;
  const guests = Number(m.adults) + Number(m.children);
  const summary = {
    product: m.product, date: m.date, time: m.time, guests: String(guests), name: m.name, phone: m.phone, client_email: m.email,
    paid_aed: (Number(m.retail_minor) / 100).toFixed(2), b2b_aed: (Number(m.b2b_minor) / 100).toFixed(2),
    margin_aed: ((Number(m.retail_minor) - Number(m.b2b_minor)) / 100).toFixed(2), stripe_session: s.id
  };

  const r = await xc(env, '/bookings', {
    method: 'POST', idem: s.id,
    body: { departure_id: Number(m.departure_id), adults: Number(m.adults), children: Number(m.children), featured: false, name: m.name, phone: m.phone, email: env.SX_GUEST_EMAIL || m.email, reference: s.id, expected_total_minor: Number(m.b2b_minor) }
  });

  if (r.ok) {
    if (!r.data.replayed) {
      await stripe(env, '/payment_intents/' + s.payment_intent, { 'metadata[xclusive_booking_id]': String(r.data.id), 'metadata[xclusive_status]': r.data.status });
      await notify(env, { status: 'CONFIRMED · Xclusive booking #' + r.data.id + ' (' + r.data.status + ')', ...summary });
    }
    return json({ booked: r.data.id });
  }

  // Erreur passagère : Stripe renverra l'événement plus tard, avec la même clé d'idempotence.
  const ageH = (Date.now() / 1000 - event.created) / 3600;
  if (RETRY.has(r.code)) return json({ retry: r.code }, 500);
  if (r.code === 'payment_required' && ageH < 6) {
    await notify(env, { status: 'ACTION NEEDED · wallet Xclusive insuffisant : rechargez-le, la réservation sera retentée automatiquement', ...summary });
    return json({ retry: 'payment_required' }, 500);
  }

  // Refus définitif : remboursement intégral du client.
  const refund = await stripe(env, '/refunds', { payment_intent: s.payment_intent, reason: 'requested_by_customer', 'metadata[cause]': r.code }, 'POST', 'refund-' + s.id);
  await notify(env, { status: 'NOT BOOKED (' + r.code + ') · client ' + (refund.ok ? 'remboursé automatiquement' : 'À REMBOURSER MANUELLEMENT'), ...summary });
  return json({ refunded: refund.ok, cause: r.code });
}
