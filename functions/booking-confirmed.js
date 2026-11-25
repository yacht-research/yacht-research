// /booking-confirmed : page affichée au client après le paiement.
//   Ziina  : ?pi=<id du paiement>&t=<détails chiffrés> → le paiement est relu chez Ziina puis la place réservée (confirmZiina)
//   Stripe : ?session_id=cs_… (ancien chemin, toujours accepté)
import { NAV, FOOTER, HEAD_ASSETS, SCRIPTS } from '../lib/shell.js';
import { NAV_FR, FOOTER_FR } from '../lib/shell-fr.js';
import { stripe } from './_sx.js';
import { confirmZiina } from './_ziina.js';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const aedTxt = (m, fr) => fr ? (Number(m) / 100).toLocaleString('fr-FR').replace(/ /g, ' ') + ' AED' : 'AED ' + (Number(m) / 100).toLocaleString('en-US');

const T = {
  en: {
    paid: 'Payment received', thanks: 'Thank you,', test: 'TEST PAYMENT · nothing was charged and no seat was booked.',
    booked: 'Your seats are confirmed. You will receive your confirmation by email within a few minutes.',
    processing: 'Your experience is being confirmed with the operator. You will receive your confirmation by email within a few minutes.',
    pendingT: 'Payment', pendingH: 'Your payment is <span class="acc">being processed</span>', pendingL: 'This can take a minute. Refresh this page shortly; if you have been charged and see no confirmation, contact us.',
    refundT: 'Booking', refundH: 'This departure is <span class="acc">no longer available</span>', refundL: 'Your payment has been refunded in full. Contact us and we will find you another time or experience.',
    failT: 'Booking', failH: 'We could not <span class="acc">find this payment</span>', failL: 'If you have been charged, contact us and we will sort it out right away.',
    exp: 'Experience', date: 'Date', at: 'at', dubai: '(Dubai)', guests: 'Guests', total: 'Total paid',
    ask: 'A question? WhatsApp us, we reply quickly in English or French.', more: 'More experiences', page: 'Booking'
  },
  fr: {
    paid: 'Paiement reçu', thanks: 'Merci,', test: 'PAIEMENT TEST · rien n’a été débité et aucune place n’a été réservée.',
    booked: 'Vos places sont confirmées. Vous recevez votre confirmation par e-mail d’ici quelques minutes.',
    processing: 'Votre expérience est en cours de confirmation auprès de l’opérateur. Vous recevez votre confirmation par e-mail d’ici quelques minutes.',
    pendingT: 'Paiement', pendingH: 'Votre paiement est <span class="acc">en cours de traitement</span>', pendingL: 'Cela peut prendre une minute. Actualisez cette page dans un instant ; si vous avez été débité sans confirmation, contactez-nous.',
    refundT: 'Réservation', refundH: 'Ce départ n’est <span class="acc">plus disponible</span>', refundL: 'Votre paiement a été intégralement remboursé. Contactez-nous, nous vous trouvons un autre horaire ou une autre expérience.',
    failT: 'Réservation', failH: 'Nous ne retrouvons pas <span class="acc">ce paiement</span>', failL: 'Si vous avez été débité, contactez-nous et nous réglons cela tout de suite.',
    exp: 'Expérience', date: 'Date', at: 'à', dubai: '(heure de Dubaï)', guests: 'Personnes', total: 'Total payé',
    ask: 'Une question ? Écrivez-nous sur WhatsApp, nous répondons vite en français ou en anglais.', more: 'Autres expériences', page: 'Réservation'
  }
};

// La langue suit l'adresse (/booking-confirmed ou /fr/booking-confirmed), pour que le bouton FR/EN fonctionne
export async function onRequestGet(ctx) { return render(ctx, 'en'); }

export async function render({ env, request }, pageLang) {
  const q = new URL(request.url).searchParams;
  let v = { kind: 'fail', lang: pageLang };

  if (q.get('pi')) {
    const r = await confirmZiina(env, q.get('pi'), q.get('t'));
    const m = r.meta;
    if (m) {
      v = { lang: pageLang, name: m.n, product: m.pr, date: m.d, time: m.t, guests: Number(m.a) + Number(m.c), totalMinor: Number(m.retail) + Number(m.fee), test: r.test };
      v.kind = r.state === 'paid_booked' || r.state === 'paid_test' ? 'paid' : r.state === 'retry' ? 'paid_processing'
        : r.state === 'pending' ? 'pending' : r.state === 'refunded' ? 'refund' : r.state === 'refund_failed' ? 'paid_processing' : 'fail';
      v.booked = r.state === 'paid_booked';
    }
  } else {
    const id = q.get('session_id') || '';
    if (/^cs_[A-Za-z0-9_]+$/.test(id) && env.STRIPE_SECRET_KEY) {
      const r = await stripe(env, '/checkout/sessions/' + id, null, 'GET');
      if (r.ok && r.data.payment_status === 'paid') {
        const m = r.data.metadata || {};
        v = { kind: 'paid_processing', lang: pageLang, name: m.name, product: m.product, date: m.date, time: m.time, guests: Number(m.adults || 0) + Number(m.children || 0), totalMinor: Number(m.retail_minor) + Number(m.card_fee_minor || 0) };
      }
    }
  }

  const fr = v.lang === 'fr', t = T[v.lang];
  let body;
  if (v.kind === 'paid' || v.kind === 'paid_processing') {
    body = `<p class="eyebrow">${t.paid}</p><h1 class="t-l" style="margin:22px 0">${t.thanks} <span class="acc">${esc((v.name || '').split(' ')[0])}</span></h1>
      ${v.test ? `<p class="lead" style="color:#e0b85c">${t.test}</p>` : ''}
      <p class="lead">${v.booked ? t.booked : t.processing}</p>
      <div class="yp-specs" style="text-align:left;margin:36px 0"><div><span>${t.exp}</span><b>${esc(v.product)}</b></div><div><span>${t.date}</span><b>${esc(v.date)} ${t.at} ${esc(v.time)} ${t.dubai}</b></div><div><span>${t.guests}</span><b>${v.guests}</b></div><div><span>${t.total}</span><b>${aedTxt(v.totalMinor, fr)}</b></div></div>
      <p>${t.ask}</p>`;
  } else {
    const k = v.kind === 'pending' ? 'pending' : v.kind === 'refund' ? 'refund' : 'fail';
    body = `<p class="eyebrow">${t[k + 'T']}</p><h1 class="t-l" style="margin:22px 0">${t[k + 'H']}</h1><p class="lead">${t[k + 'L']}</p>`;
  }
  const html = `<!DOCTYPE html><html lang="${v.lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t.page} | Yacht Research</title><meta name="robots" content="noindex">` + HEAD_ASSETS + '</head><body>' + (fr ? NAV_FR : NAV) +
    '<section class="sx-ok" style="min-height:80vh;display:grid;align-content:center;padding:140px var(--pad) 60px">' + body +
    `<div class="ctas" style="justify-content:center;margin-top:26px"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-gold">WhatsApp <i>→</i></a><a href="${fr ? '/fr' : ''}/shared-experiences" class="btn btn-ghost">${t.more}</a></div></section>` +
    (fr ? FOOTER_FR : FOOTER) + SCRIPTS + '</body></html>';
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' } });
}
