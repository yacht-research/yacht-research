// /api/sx/ziina-setup : inscrit chez Ziina l'adresse du webhook de CE site (une seule adresse par compte Ziina).
// À ouvrir une fois sur le site de production (yachtresearchgroup.com), après avoir réglé ZIINA_API_KEY et ZIINA_WEBHOOK_SECRET.
// Protégé : il faut saisir le secret du webhook (rien n'apparaît dans l'adresse).
import { json, ziina, safeEqual } from '../../_sx.js';

const page = (msg = '') => new Response(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width">
<title>Ziina webhook</title><body style="font:16px system-ui;max-width:520px;margin:60px auto;padding:0 16px">
<h1 style="font-size:22px">Inscription du webhook Ziina</h1>
<p>Adresse inscrite : <code>/api/sx/ziina-webhook</code> de ce site.</p>
<form method="post"><label>Secret du webhook (ZIINA_WEBHOOK_SECRET)<br><input type="password" name="key" style="width:100%;padding:8px;margin:8px 0" autocomplete="off"></label>
<button style="padding:10px 18px">Inscrire</button></form><p>${msg}</p></body>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

export async function onRequestGet() { return page(); }

export async function onRequestPost({ env, request }) {
  if (!env.ZIINA_API_KEY || !env.ZIINA_WEBHOOK_SECRET) return page('Réglez d’abord ZIINA_API_KEY et ZIINA_WEBHOOK_SECRET dans Cloudflare.');
  const key = String((await request.formData()).get('key') || '');
  if (!safeEqual(key, env.ZIINA_WEBHOOK_SECRET)) return page('Secret incorrect.');
  const url = new URL(request.url).origin + '/api/sx/ziina-webhook';
  const r = await ziina(env, '/webhook', { url, secret: env.ZIINA_WEBHOOK_SECRET });
  return page(r.ok ? '✅ Webhook inscrit : ' + url : '❌ Ziina a refusé (' + r.status + ').');
}
