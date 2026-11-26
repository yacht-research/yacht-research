// GET /api/sx/departures?date=YYYY-MM-DD → sorties partagées du jour (Dubai), avec pour chaque horaire :
//   from_aed  prix client 1 adulte, HORS frais de carte (prix public −10 % frais compris, jamais sous B2B + marge)
//   slug      produit du site public (pour la liste des add-ons sur demande)
//   was_aed   prix public de référence de l'horaire (affiché barré, sans nommer l'opérateur)
//   seats     places restantes, seulement quand il en reste peu (sinon null)
// Le tarif B2B ne quitte jamais le serveur.
import { json, xc, dubaiToday, bookingsOpen, payProvider, ziinaTest, publicSlots, publicMinor, sellMinor, seatsShown, b2bPrices } from '../../_sx.js';

const CACHE_HOST = 'https://sx-cache.yachtresearchgroup.com';
// Le portail autorise 60 appels par minute et par clé : le tarif B2B 1 adulte de chaque produit × horaire est gardé 12 h
// (cache commun à toutes les dates), 10 devis au plus par appel, le reste est complété aux appels suivants.
const MAX_QUOTES = 10;

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

  const [pub, b2b] = await Promise.all([publicSlots(env, ctx), b2bPrices(env, ctx, list.filter(d => d.availability !== 'None'), MAX_QUOTES)]);

  const departures = list.map(d => {
    const slot = pub[d.id], m = b2b(d), was = publicMinor(slot, 1, 0);
    const s = m ? sellMinor(env, m, was, slot && slot[5]) : null;
    const shown = s ? s.retail : null; // prix affiché hors frais de carte (ajoutés au moment de payer par carte, pas par virement)
    return {
      id: d.id, product_id: d.product_id, product: d.product, date: d.date, time: d.time,
      availability: d.availability, categories: d.categories,
      from_aed: shown ? shown / 100 : null,
      was_aed: shown && was > shown ? was / 100 : null,
      seats: d.availability === 'None' ? null : seatsShown(slot),
      slug: (slot && slot[5]) || ''
    };
  }).sort((a, b) => a.time.localeCompare(b.time));

  // add-ons sur demande des expériences du jour (prix publics)
  const addons = {};
  departures.forEach(d => { if (d.slug && pub._a && pub._a[d.slug]) addons[d.slug] = pub._a[d.slug]; });
  const bookable = bookingsOpen(env);
  return json({ enabled: true, bookings: bookable, test: bookable && payProvider(env) === 'ziina' && ziinaTest(env), date, departures, addons });
}
