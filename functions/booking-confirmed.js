// /booking-confirmed?session_id=… : page affichée au client après le paiement Stripe.
import { NAV, FOOTER, HEAD_ASSETS, SCRIPTS } from '../lib/shell.js';
import { stripe } from './_sx.js';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function onRequestGet({ env, request }) {
  const id = new URL(request.url).searchParams.get('session_id') || '';
  let s = null;
  if (/^cs_[A-Za-z0-9_]+$/.test(id) && env.STRIPE_SECRET_KEY) {
    const r = await stripe(env, '/checkout/sessions/' + id, null, 'GET');
    if (r.ok) s = r.data;
  }
  const m = (s && s.metadata) || {};
  const paid = s && s.payment_status === 'paid';
  const guests = Number(m.adults || 0) + Number(m.children || 0);
  const body = paid
    ? `<p class="eyebrow">Payment received</p><h1 class="t-l" style="margin:22px 0">Thank you, <span class="acc">${esc((m.name || '').split(' ')[0])}</span></h1>
       <p class="lead">Your experience is being confirmed with the operator. You will receive your confirmation by email within a few minutes.</p>
       <div class="yp-specs" style="text-align:left;margin:36px 0"><div><span>Experience</span><b>${esc(m.product)}</b></div><div><span>Date</span><b>${esc(m.date)} at ${esc(m.time)} (Dubai)</b></div><div><span>Guests</span><b>${guests}</b></div><div><span>Total paid</span><b>AED ${(Number(m.retail_minor) / 100).toLocaleString('en-US')}</b></div></div>
       <p>A question? WhatsApp us, we reply quickly in English or French.</p>`
    : `<p class="eyebrow">Booking</p><h1 class="t-l" style="margin:22px 0">We could not <span class="acc">find this payment</span></h1>
       <p class="lead">If you have been charged, contact us and we will sort it out right away.</p>`;
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Booking | Yacht Research</title><meta name="robots" content="noindex">' + HEAD_ASSETS + '</head><body>' + NAV +
    '<section class="sx-ok" style="min-height:80vh;display:grid;align-content:center;padding:140px var(--pad) 60px">' + body +
    '<div class="ctas" style="justify-content:center;margin-top:26px"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-gold">WhatsApp <i>→</i></a><a href="/charter" class="btn btn-ghost">Back to charter</a></div></section>' +
    FOOTER + SCRIPTS + '</body></html>';
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}
