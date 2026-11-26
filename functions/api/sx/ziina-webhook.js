// POST /api/sx/ziina-webhook : Ziina prévient le site quand le statut d'un paiement change.
// Sécurité : adresses IP d'envoi officielles de Ziina + signature X-Hmac-Signature (si ZIINA_WEBHOOK_SECRET est réglé),
// et de toute façon le statut est relu chez Ziina avant de réserver (confirmZiina).
// Inscription du webhook (une seule adresse par compte Ziina) : voir /api/sx/ziina-setup.
import { json, hmacHex, safeEqual } from '../../_sx.js';
import { confirmZiina } from '../../_ziina.js';

const ZIINA_IPS = new Set(['3.29.184.186', '3.29.190.95', '20.233.47.127', '13.202.161.181']);

export async function onRequestPost({ env, request }) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  if (!ZIINA_IPS.has(ip) && env.ZIINA_WEBHOOK_ANY_IP !== 'on') return json({ error: 'rejected' }, 403);
  const raw = await request.text();
  if (env.ZIINA_WEBHOOK_SECRET) {
    const sig = (request.headers.get('X-Hmac-Signature') || '').toLowerCase();
    if (!safeEqual(sig, await hmacHex(env.ZIINA_WEBHOOK_SECRET, raw))) return json({ error: 'bad_signature' }, 401);
  }
  let ev; try { ev = JSON.parse(raw); } catch (e) { return json({ error: 'invalid' }, 400); }
  if (ev.event !== 'payment_intent.status.updated' || !ev.data || ev.data.status !== 'completed') return json({ ignored: ev.event || 'unknown' });
  const r = await confirmZiina(env, ev.data.id, null);
  // Erreur passagère : réponse 500 pour que Ziina renvoie l'événement (3 essais)
  if (r.state === 'retry') return json({ retry: true }, 500);
  return json({ state: r.state });
}
