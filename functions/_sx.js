// ============================================================
// Shared experiences Xclusive : outils communs aux routes /api/sx/*
// Secrets (variables d'environnement Cloudflare, jamais dans le code) :
//   XCLUSIVE_API_KEY        clé du portail partenaire (lecture, puis « Allow bookings » pour réserver)
//   ZIINA_API_KEY           clé API Ziina (paiement par défaut dès qu'elle est présente)
//   ZIINA_WEBHOOK_SECRET    secret de signature du webhook Ziina (facultatif mais conseillé)
//   STRIPE_SECRET_KEY       clé secrète Stripe (sk_test_… pour les essais, sk_live_… en production)
//   STRIPE_WEBHOOK_SECRET   secret du webhook Stripe (whsec_…)
//   XCLUSIVE_WEBHOOK_SECRET secret de signature des webhooks Xclusive (facultatif)
// Réglages (variables simples) :
//   SX_MARKUP        marge MINIMALE sur le tarif B2B, défaut 0.15 (15 %)
//   SX_DISCOUNT      remise sur le prix public Xclusive de l'horaire, frais de carte compris, défaut 0.10 (10 %)
//   SX_BOOKINGS      "on" pour accepter les paiements ; sinon le bloc reste en consultation seule
//   SX_PAYMENT       "ziina" (défaut si ZIINA_API_KEY existe) ou "stripe"
//   ZIINA_TEST       mode test Ziina ACTIF PAR DÉFAUT : aucun débit, et aucune vraie réservation Xclusive
//                    (contrôle à blanc seulement). Mettre "off" UNIQUEMENT en production, le jour de l'ouverture.
//   SX_NOTIFY_URL    URL qui reçoit une copie de chaque réservation (Apps Script des formulaires)
//   SX_GUEST_EMAIL   si rempli, l'e-mail transmis à Xclusive est celui-ci (le vôtre) au lieu de celui du client
// Tests locaux uniquement : XCLUSIVE_API_BASE / STRIPE_API_BASE pointent vers un faux serveur.
// ============================================================
export const API = 'https://partners.xclusiveyachts.com/api/v1';
export const DEFAULT_NOTIFY = 'https://script.google.com/macros/s/AKfycbwT-6-C2qRtUhX4MXVhFzNUd5t1By9PDNdHfZ3krMiW8LIVgnC6ry-Qyon7Fam2B0gd/exec';

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
}

export function markup(env) {
  const m = parseFloat(env.SX_MARKUP);
  return isFinite(m) && m >= 0 && m < 2 ? m : 0.15;
}

// Prix public = tarif B2B + marge, arrondi à l'AED supérieur (montants en fils : 100 = 1 AED)
export function cardFeeMinor(retailMinorAmount, env) {
  const p = env.SX_CARD_FEE_PCT === undefined || env.SX_CARD_FEE_PCT === '' ? 3 : Number(env.SX_CARD_FEE_PCT);
  return p > 0 && p < 10 ? Math.ceil((retailMinorAmount * p) / 100 / 100) * 100 : 0;
}
export function cardFeePct(env) { const p = env.SX_CARD_FEE_PCT === undefined || env.SX_CARD_FEE_PCT === '' ? 3 : Number(env.SX_CARD_FEE_PCT); return p > 0 && p < 10 ? p : 0; }

export function retailMinor(b2bMinor, env) {
  return Math.ceil((b2bMinor * (1 + markup(env))) / 100) * 100;
}

// ------------------------------------------------------------
// Prix calé sur le site public Xclusive (réglages : SX_DISCOUNT, défaut 0.10 ; SX_PUBLIC_FEED pour les tests)
// Le client paie (frais de carte compris) le prix public de l'horaire moins 10 %, mais jamais moins que
// B2B + SX_MARKUP. Sans prix public connu (flux indisponible, catégorie sans prix) : B2B + SX_MARKUP.
// ------------------------------------------------------------
export const PUBLIC_FEED = 'https://xclusiveyachts.com/tours-data/tours.json';
const PUBLIC_KEY = 'https://sx-cache.yachtresearchgroup.com/public/v1';
export function discount(env) {
  const d = parseFloat(env.SX_DISCOUNT);
  return isFinite(d) && d >= 0 && d < 0.5 ? d : 0.1;
}
// { departure_id : [prix adulte, prix enfant|null, places restantes, niveau Plenty/Limited/Few, complet] }, gardé 5 min
export async function publicSlots(env, ctx) {
  const cache = caches.default, key = new Request(PUBLIC_KEY);
  const hit = await cache.match(key);
  if (hit) return hit.json();
  let tours;
  try {
    const r = await fetch(env.SX_PUBLIC_FEED || PUBLIC_FEED, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
    if (!r.ok) return {};
    tours = await r.json();
  } catch (e) { return {}; }
  const map = {};
  (Array.isArray(tours) ? tours : []).forEach(t => (t.timeSlots || []).forEach(s => {
    if (s && s.cruise_id) map[s.cruise_id] = [Number(s.price) || null, s.child_price == null ? null : Number(s.child_price), typeof s.seats_left === 'number' ? s.seats_left : null, s.tier || '', !!s.sold_out];
  }));
  const p = cache.put(key, new Response(JSON.stringify(map), { headers: { 'Cache-Control': 'max-age=300' } }));
  if (ctx && ctx.waitUntil) ctx.waitUntil(p); else await p;
  return map;
}
// Prix public total d'une sélection, en fils (null si une catégorie n'a pas de prix public)
export function publicMinor(slot, adults, children) {
  if (!slot || !slot[0]) return null;
  if (children > 0 && !(slot[1] > 0)) return null;
  return (adults * slot[0] + children * (slot[1] || 0)) * 100;
}
// → { retail, fee } en fils : retail + fee ≤ prix public × (1 − remise), retail ≥ B2B + marge
export function sellMinor(env, b2bMinor, pubMinor) {
  const floor = retailMinor(b2bMinor, env);
  let retail = floor;
  if (pubMinor > 0) {
    const target = Math.floor((pubMinor * (1 - discount(env))) / 100) * 100;
    let r = Math.floor(target / (1 + cardFeePct(env) / 100) / 100) * 100;
    while (r > floor && r + cardFeeMinor(r, env) > target) r -= 100;
    retail = Math.max(r, floor);
  }
  return { retail, fee: cardFeeMinor(retail, env) };
}
// Places restantes affichables : seulement quand il en reste peu (comme le site public : Limited / Few)
export function seatsShown(slot) {
  return slot && (slot[3] === 'Limited' || slot[3] === 'Few') && slot[2] > 0 ? slot[2] : null;
}

// Tarif B2B 1 adulte par produit et horaire, cache commun 12 h ; complète au plus `max` devis par appel
const B2B_KEY = 'https://sx-cache.yachtresearchgroup.com/b2b/v1';
export async function b2bPrices(env, ctx, deps, max) {
  const cache = caches.default, req = new Request(B2B_KEY);
  const hit = await cache.match(req);
  const prices = hit ? await hit.json() : {}; // { "product_id|time": { m: fils B2B, t: horodatage } }
  const now = Date.now(), todo = [];
  deps.forEach(d => {
    const k = d.product_id + '|' + d.time, p = prices[k];
    if ((!p || now - p.t > 12 * 3600e3) && !todo.some(t => t.product_id + '|' + t.time === k)) todo.push(d);
  });
  if (todo.length) {
    const queue = todo.slice(0, max);
    let changed = false;
    const worker = async () => {
      for (let d; (d = queue.shift());) {
        const q = await xc(env, '/quote', { method: 'POST', body: { departure_id: d.id, adults: 1, children: 0, featured: false } });
        if (q.ok) { prices[d.product_id + '|' + d.time] = { m: q.data.total_minor, t: now }; changed = true; }
      }
    };
    await Promise.all([worker(), worker()]);
    if (changed) ctx.waitUntil(cache.put(req, new Response(JSON.stringify(prices), { headers: { 'Cache-Control': 'max-age=86400' } })));
  }
  return d => { const p = prices[d.product_id + '|' + d.time]; return p ? p.m : null; };
}

export async function xc(env, path, { method = 'GET', body, idem } = {}) {
  if (!env.XCLUSIVE_API_KEY) return { ok: false, status: 503, code: 'not_configured' };
  const headers = { Authorization: 'Bearer ' + env.XCLUSIVE_API_KEY, Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (idem) headers['Idempotency-Key'] = idem;
  let r;
  try { r = await fetch((env.XCLUSIVE_API_BASE || API) + path, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { return { ok: false, status: 503, code: 'network_error' }; }
  let data = null;
  try { data = await r.json(); } catch (e) {}
  if (r.ok && data && data.data) return { ok: true, status: r.status, data: data.data };
  return { ok: false, status: r.status, code: (data && data.error && data.error.code) || 'http_' + r.status, retryAfter: r.headers.get('Retry-After') };
}

// Stripe (API REST en x-www-form-urlencoded, sans SDK)
export async function stripe(env, path, params, method = 'POST', idem) {
  const headers = { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY, 'Content-Type': 'application/x-www-form-urlencoded' };
  if (idem) headers['Idempotency-Key'] = idem;
  const r = await fetch((env.STRIPE_API_BASE || 'https://api.stripe.com/v1') + path, {
    method,
    headers,
    body: method === 'GET' ? undefined : new URLSearchParams(params).toString()
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

// Moyen de paiement actif et ouverture des réservations
export function payProvider(env) {
  if (env.SX_PAYMENT === 'stripe') return env.STRIPE_SECRET_KEY ? 'stripe' : null;
  if (env.ZIINA_API_KEY) return 'ziina';
  return env.STRIPE_SECRET_KEY ? 'stripe' : null;
}
export function bookingsOpen(env) { return env.SX_BOOKINGS === 'on' && !!env.XCLUSIVE_API_KEY && !!payProvider(env); }
export function ziinaTest(env) { return env.ZIINA_TEST !== 'off'; }

// Ziina (API REST JSON, https://docs.ziina.com) : montants en fils (100 = 1 AED)
export const ZIINA_API = 'https://api-v2.ziina.com/api';
export async function ziina(env, path, body, method = body ? 'POST' : 'GET') {
  if (!env.ZIINA_API_KEY) return { ok: false, status: 503, code: 'not_configured', data: {} };
  let r;
  try {
    r = await fetch((env.ZIINA_API_BASE || ZIINA_API) + path, {
      method, headers: { Authorization: 'Bearer ' + env.ZIINA_API_KEY, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) { return { ok: false, status: 503, code: 'network_error', data: {} }; }
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, code: r.ok ? '' : 'http_' + r.status, data };
}

// Les détails de la réservation voyagent chiffrés dans l'adresse de retour Ziina (AES-GCM, clé dérivée de la clé API) :
// rien à stocker côté site, et ni le client ni personne d'autre ne peut les lire ou les modifier.
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
async function tokenKey(env) {
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode((env.SX_TOKEN_SECRET || env.ZIINA_API_KEY || '') + '|sx-booking-v1'));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function sealToken(env, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await tokenKey(env), new TextEncoder().encode(JSON.stringify(obj)));
  const out = new Uint8Array(12 + ct.byteLength); out.set(iv); out.set(new Uint8Array(ct), 12);
  return b64u(out);
}
export async function openToken(env, tok) {
  try {
    const b = unb64u(String(tok || ''));
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, await tokenKey(env), b.slice(12));
    return JSON.parse(new TextDecoder().decode(pt));
  } catch (e) { return null; }
}
// UUID stable tiré d'un texte (pour que la même demande donne toujours le même identifiant de remboursement)
export async function stableUuid(text) {
  const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(b => b.toString(16).padStart(2, '0')).join('');
  return h.slice(0, 8) + '-' + h.slice(8, 12) + '-4' + h.slice(13, 16) + '-' + ((parseInt(h[16], 16) & 3) | 8).toString(16) + h.slice(17, 20) + '-' + h.slice(20, 32);
}

const enc = new TextEncoder();
export async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// Copie de la réservation à Yacht Research (même canal que les formulaires du site).
// L'adresse du client part dans « client_email » (jamais « email ») : l'Apps Script n'écrit au client
// qu'une fois la réservation confirmée, avec sa propre confirmation Yacht Research.
export async function notify(env, fields) {
  try {
    const fd = new URLSearchParams({ form_name: 'Shared Experience Booking', submitted_at: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }), ...fields });
    await fetch(env.SX_NOTIFY_URL || DEFAULT_NOTIFY, { method: 'POST', body: fd });
  } catch (e) {}
}

export function cleanPhone(p) {
  let s = String(p || '').replace(/[^\d+]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  return /^\+[1-9][0-9]{9,13}$/.test(s) ? s : '';
}
export function int(v, min, max) {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}
export function dubaiToday() {
  return new Date(Date.now() + 4 * 3600e3).toISOString().slice(0, 10);
}
