// ============================================================
// Shared experiences Xclusive : outils communs aux routes /api/sx/*
// Secrets (variables d'environnement Cloudflare, jamais dans le code) :
//   XCLUSIVE_API_KEY        clé du portail partenaire (lecture, puis « Allow bookings » pour réserver)
//   STRIPE_SECRET_KEY       clé secrète Stripe (sk_test_… pour les essais, sk_live_… en production)
//   STRIPE_WEBHOOK_SECRET   secret du webhook Stripe (whsec_…)
//   XCLUSIVE_WEBHOOK_SECRET secret de signature des webhooks Xclusive (facultatif)
// Réglages (variables simples) :
//   SX_MARKUP        marge sur le tarif B2B, défaut 0.15 (15 %)
//   SX_BOOKINGS      "on" pour accepter les paiements ; sinon le bloc reste en consultation seule
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
