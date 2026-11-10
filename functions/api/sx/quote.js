// POST /api/sx/quote {departure_id, adults, children} → prix public total (AED)
import { json, xc, retailMinor, int } from '../../_sx.js';

export async function onRequestPost({ env, request }) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'invalid_body' }, 400); }
  const departure_id = int(b.departure_id, 1, 2147483647), adults = int(b.adults, 0, 20), children = int(b.children, 0, 20);
  if (!departure_id || adults === null || children === null || adults + children < 1 || adults + children > 20) return json({ error: 'invalid_guests' }, 400);
  const q = await xc(env, '/quote', { method: 'POST', body: { departure_id, adults, children, featured: false } });
  if (!q.ok) return json({ error: q.code }, q.status >= 500 ? 502 : 409);
  return json({ departure_id, adults, children, total_aed: retailMinor(q.data.total_minor, env) / 100, currency: 'AED' });
}
