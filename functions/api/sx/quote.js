// POST /api/sx/quote {departure_id, date, adults, children} → prix client total (AED), frais de carte compris,
// et le prix public de référence (barré sur le site, sans nommer l'opérateur)
import { json, xc, sellMinor, publicSlots, publicMinor, cardFeePct, int } from '../../_sx.js';

export async function onRequestPost(ctx) {
  const { env, request } = ctx;
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'invalid_body' }, 400); }
  const departure_id = int(b.departure_id, 1, 2147483647), adults = int(b.adults, 0, 20), children = int(b.children, 0, 20);
  if (!departure_id || adults === null || children === null || adults + children < 1 || adults + children > 20) return json({ error: 'invalid_guests' }, 400);
  const [q, pub] = await Promise.all([
    xc(env, '/quote', { method: 'POST', body: { departure_id, adults, children, featured: false } }),
    publicSlots(env, ctx)
  ]);
  if (!q.ok) return json({ error: q.code }, q.status >= 500 ? 502 : 409);
  const was = publicMinor(pub[departure_id], adults, children);
  const slot = pub[departure_id];
  const { retail, fee } = sellMinor(env, q.data.total_minor, was, slot && slot[5]);
  return json({
    departure_id, adults, children, total_aed: retail / 100, card_fee_aed: fee / 100, card_fee_pct: cardFeePct(env), pay_aed: (retail + fee) / 100,
    was_aed: was && was > retail + fee ? was / 100 : null, currency: 'AED'
  });
}
