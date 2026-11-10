// POST /api/sx/xclusive-webhook : notifications signées du portail Xclusive (changement de statut d'une réservation).
// URL à saisir dans le portail : https://yachtresearchgroup.com/api/sx/xclusive-webhook
import { json, hmacHex, safeEqual, notify } from '../../_sx.js';

export async function onRequestPost({ env, request, waitUntil }) {
  const raw = await request.text();
  const ts = request.headers.get('X-Xclusive-Timestamp') || '';
  const sig = request.headers.get('X-Xclusive-Signature') || '';
  if (!env.XCLUSIVE_WEBHOOK_SECRET || !ts || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return json({ error: 'rejected' }, 401);
  const expected = 'v1=' + await hmacHex(env.XCLUSIVE_WEBHOOK_SECRET, ts + '.' + raw);
  if (!safeEqual(sig, expected)) return json({ error: 'rejected' }, 401);
  let ev; try { ev = JSON.parse(raw); } catch (e) { return json({ error: 'invalid' }, 400); }
  // Seuls les changements de réservation intéressent Yacht Research (les disponibilités sont relues en direct)
  if (ev.type === 'booking.updated' && ev.data) {
    waitUntil(notify(env, { status: 'Xclusive update · booking #' + ev.data.booking_id + ' → ' + ev.data.status, event_id: String(ev.id), departure_id: String(ev.data.departure_id) }));
  }
  return json({ ok: true });
}
