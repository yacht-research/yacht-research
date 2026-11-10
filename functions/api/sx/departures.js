// GET /api/sx/departures?date=YYYY-MM-DD → sorties partagées du jour (Dubai), avec un prix public « à partir de » par produit.
// Le tarif B2B ne quitte jamais le serveur : seul le prix public (B2B + marge) est renvoyé.
import { json, xc, retailMinor, dubaiToday } from '../../_sx.js';

const CACHE_HOST = 'https://sx-cache.yachtresearchgroup.com';

async function fromPrice(env, ctx, dep) {
  const cache = caches.default;
  const key = new Request(CACHE_HOST + '/from/' + dep.product_id + '/' + dep.date);
  const hit = await cache.match(key);
  if (hit) return (await hit.json()).minor;
  const q = await xc(env, '/quote', { method: 'POST', body: { departure_id: dep.id, adults: 1, children: 0, featured: false } });
  if (!q.ok) return null;
  const minor = retailMinor(q.data.total_minor, env);
  ctx.waitUntil(cache.put(key, new Response(JSON.stringify({ minor }), { headers: { 'Cache-Control': 'max-age=21600' } })));
  return minor;
}

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

  const open = list.filter(d => d.availability !== 'None');
  const firstByProduct = new Map();
  open.forEach(d => { if (!firstByProduct.has(d.product_id)) firstByProduct.set(d.product_id, d); });
  const prices = new Map();
  // Devis « à partir de » : 3 à la fois au plus (le portail limite les rafales), un nouvel essai si besoin
  const queue = [...firstByProduct.values()].slice(0, 25);
  const worker = async () => {
    for (let d; (d = queue.shift());) {
      let p = await fromPrice(env, ctx, d);
      if (p === null) { await new Promise(r => setTimeout(r, 400)); p = await fromPrice(env, ctx, d); }
      prices.set(d.product_id, p);
    }
  };
  await Promise.all([worker(), worker(), worker()]);

  const departures = list.map(d => ({
    id: d.id, product_id: d.product_id, product: d.product, date: d.date, time: d.time,
    availability: d.availability, categories: d.categories,
    from_aed: prices.has(d.product_id) && prices.get(d.product_id) ? prices.get(d.product_id) / 100 : null
  })).sort((a, b) => a.time.localeCompare(b.time));

  return json({ enabled: true, bookings: env.SX_BOOKINGS === 'on' && !!env.STRIPE_SECRET_KEY, date, departures });
}
