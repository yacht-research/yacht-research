// GET /api/sx/from → prix client « à partir de » (1 adulte, frais de carte compris) de chaque produit Xclusive
// sur les 14 prochains jours, avec le prix public de référence du même horaire (affiché barré).
// Résultat gardé 1 h (15 min s'il manque des prix). Le tarif B2B ne quitte jamais le serveur.
import { json, xc, dubaiToday, publicSlots, publicMinor, sellMinor, b2bPrices } from '../../_sx.js';

const CACHE_HOST = 'https://sx-cache.yachtresearchgroup.com';
const FROM_KEY = CACHE_HOST + '/from/v2';
const DAYS = 14, MAX_QUOTES = 20;

function addDays(iso, k) { return new Date(Date.parse(iso + 'T12:00:00Z') + k * 864e5).toISOString().slice(0, 10); }

export async function onRequestGet(ctx) {
  const { env } = ctx;
  if (!env.XCLUSIVE_API_KEY) return json({ enabled: false, from: {} });
  const cache = caches.default;
  const fReq = new Request(FROM_KEY);
  const fHit = await cache.match(fReq);
  if (fHit) return json(await fHit.json());

  // Départs des 14 prochains jours (on réutilise la liste du jour déjà en cache 60 s quand elle existe)
  const today = dubaiToday(), open = [];
  for (let k = 0; k < DAYS; k++) {
    const date = addDays(today, k), lk = new Request(CACHE_HOST + '/list/' + date);
    let list;
    const h = await cache.match(lk);
    if (h) list = await h.json();
    else {
      const r = await xc(env, '/departures?date=' + date);
      if (!r.ok) continue;
      list = r.data.departures || [];
      ctx.waitUntil(cache.put(lk, new Response(JSON.stringify(list), { headers: { 'Cache-Control': 'max-age=60' } })));
    }
    list.forEach(d => { if (d.availability !== 'None') open.push(d); });
  }

  const [pub, b2b] = await Promise.all([publicSlots(env, ctx), b2bPrices(env, ctx, open, MAX_QUOTES)]);

  // { nom du produit : prix client le plus bas en AED }, et le prix public barré du même horaire
  const from = {}, was = {};
  let missing = false;
  open.forEach(d => {
    const m = b2b(d);
    if (!m) { missing = true; return; }
    const slot = pub[d.id], w = publicMinor(slot, 1, 0), s = sellMinor(env, m, w, slot && slot[5]), aed = (s.retail + s.fee) / 100;
    if (!(d.product in from) || aed < from[d.product]) { from[d.product] = aed; was[d.product] = w && w / 100 > aed ? w / 100 : null; }
  });
  const out = { enabled: true, days: DAYS, from, was };
  ctx.waitUntil(cache.put(fReq, new Response(JSON.stringify(out), { headers: { 'Cache-Control': 'max-age=' + (missing ? 900 : 3600) } })));
  return json(out);
}
