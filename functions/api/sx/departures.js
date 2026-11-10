// GET /api/sx/departures?date=YYYY-MM-DD → sorties partagées du jour (Dubai), avec un prix public « à partir de » par produit.
// Le tarif B2B ne quitte jamais le serveur : seul le prix public (B2B + marge) est renvoyé.
import { json, xc, retailMinor, dubaiToday } from '../../_sx.js';

const CACHE_HOST = 'https://sx-cache.yachtresearchgroup.com';
// Le portail autorise 60 appels par minute et par clé : le prix « à partir de » (1 adulte) de chaque produit
// est gardé 12 h dans UNE entrée de cache commune à toutes les dates, et on ne demande que les produits manquants
// (8 devis au plus par appel, le reste est complété aux appels suivants).
const PRICES_KEY = CACHE_HOST + '/prices/v2';
const MAX_QUOTES = 8, PRICE_TTL = 12 * 3600e3;

export async function onRequestGet(ctx) {
  const { env, request } = ctx;
  const url = new URL(request.url);
  const date = url.searchParams.get('date') || dubaiToday();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'invalid_date' }, 400);
  if (!env.XCLUSIVE_API_KEY) return json({ enabled: false, departures: [] });

  // Liste du jour mise en cache 60 s (le portail met lui-même les disponibilités en cache 30 s)
  const cache = caches.default;
  const listKey = new Request(CACHE_HOST + '/list/' + date);
  let list;
  const hit = await cache.match(listKey);
  if (hit) list = await hit.json();
  else {
    const r = await xc(env, '/departures?date=' + date);
    if (!r.ok) return json({ error: r.code }, r.status === 400 ? 400 : 502);
    list = r.data.departures || [];
    ctx.waitUntil(cache.put(listKey, new Response(JSON.stringify(list), { headers: { 'Cache-Control': 'max-age=60' } })));
  }

  const pReq = new Request(PRICES_KEY);
  const pHit = await cache.match(pReq);
  const prices = pHit ? await pHit.json() : {}; // { product_id: { m: minor, t: horodatage } }
  const now = Date.now();
  const open = list.filter(d => d.availability !== 'None');
  const todo = [];
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

  const departures = list.map(d => ({
    id: d.id, product_id: d.product_id, product: d.product, date: d.date, time: d.time,
    availability: d.availability, categories: d.categories,
    from_aed: prices[d.product_id] ? prices[d.product_id].m / 100 : null
  })).sort((a, b) => a.time.localeCompare(b.time));

  return json({ enabled: true, bookings: env.SX_BOOKINGS === 'on' && !!env.STRIPE_SECRET_KEY, date, departures });
}
