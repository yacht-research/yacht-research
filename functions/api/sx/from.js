// GET /api/sx/from → prix public « à partir de » (1 adulte) de chaque produit Xclusive sur les 14 prochains jours,
// pour afficher un prix même les jours sans départ. Résultat gardé 6 h (1 h s'il manque des prix).
// Le tarif B2B ne quitte jamais le serveur : seul le prix public (B2B + marge) est renvoyé.
import { json, xc, retailMinor, dubaiToday } from '../../_sx.js';

const CACHE_HOST = 'https://sx-cache.yachtresearchgroup.com';
const FROM_KEY = CACHE_HOST + '/from/v1';
const PRICES_KEY = CACHE_HOST + '/prices/v2'; // même cache de prix que /api/sx/departures
const DAYS = 14, MAX_QUOTES = 20, PRICE_TTL = 12 * 3600e3;

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

  // Prix par produit (cache commun 12 h) ; on ne demande que les produits manquants
  const pReq = new Request(PRICES_KEY);
  const pHit = await cache.match(pReq);
  const prices = pHit ? await pHit.json() : {};
  const now = Date.now(), todo = [];
  open.forEach(d => {
    const p = prices[d.product_id];
    if ((!p || now - p.t > PRICE_TTL) && !todo.some(t => t.product_id === d.product_id)) todo.push(d);
  });
  if (todo.length) {
    const queue = todo.slice(0, MAX_QUOTES);
    let changed = false;
    const worker = async () => {
      for (let d; (d = queue.shift());) {
        const q = await xc(env, '/quote', { method: 'POST', body: { departure_id: d.id, adults: 1, children: 0, featured: false } });
        if (q.ok) { prices[d.product_id] = { m: retailMinor(q.data.total_minor, env), t: now }; changed = true; }
      }
    };
    await Promise.all([worker(), worker()]);
    if (changed) ctx.waitUntil(cache.put(pReq, new Response(JSON.stringify(prices), { headers: { 'Cache-Control': 'max-age=86400' } })));
  }

  // { nom du produit : prix public le plus bas en AED }
  const from = {};
  let missing = false;
  open.forEach(d => {
    const p = prices[d.product_id];
    if (!p) { missing = true; return; }
    const aed = p.m / 100;
    if (!(d.product in from) || aed < from[d.product]) from[d.product] = aed;
  });
  const out = { enabled: true, days: DAYS, from };
  ctx.waitUntil(cache.put(fReq, new Response(JSON.stringify(out), { headers: { 'Cache-Control': 'max-age=' + (missing ? 3600 : 6 * 3600) } })));
  return json(out);
}
