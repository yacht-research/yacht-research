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
    ask: 'A question? WhatsApp us, we reply quickly in English or French.', more: 'More experiences', page: 'Booking',
    manual: 'Your payment is safe. Our team is finalising your booking with the operator and will confirm your seats to you personally very shortly, by WhatsApp or email. You can keep this page open: it updates by itself. For anything, contact us:'
  },
  fr: {
    paid: 'Paiement reçu', thanks: 'Merci,', test: 'PAIEMENT TEST · rien n’a été débité et aucune place n’a été réservée.',
    booked: 'Vos places sont confirmées. Vous recevez votre confirmation par e-mail d’ici quelques minutes.',
    processing: 'Votre expérience est en cours de confirmation auprès de l’opérateur. Vous recevez votre confirmation par e-mail d’ici quelques minutes.',
    pendingT: 'Paiement', pendingH: 'Votre paiement est <span class="acc">en cours de traitement</span>', pendingL: 'Cela peut prendre une minute. Actualisez cette page dans un instant ; si vous avez été débité sans confirmation, contactez-nous.',
    refundT: 'Réservation', refundH: 'Ce départ n’est <span class="acc">plus disponible</span>', refundL: 'Votre paiement a été intégralement remboursé. Contactez-nous, nous vous trouvons un autre horaire ou une autre expérience.',
    failT: 'Réservation', failH: 'Nous ne retrouvons pas <span class="acc">ce paiement</span>', failL: 'Si vous avez été débité, contactez-nous et nous réglons cela tout de suite.',
    exp: 'Expérience', date: 'Date', at: 'à', dubai: '(heure de Dubaï)', guests: 'Personnes', total: 'Total payé',
    ask: 'Une question ? Écrivez-nous sur WhatsApp, nous répondons vite en français ou en anglais.', more: 'Autres expériences', page: 'Réservation',
    manual: 'Votre paiement est bien reçu. Notre équipe finalise votre réservation auprès de l’opérateur et vous confirme vos places personnellement très rapidement, par WhatsApp ou par e-mail. Vous pouvez garder cette page ouverte : elle se met à jour toute seule. Pour toute question, contactez-nous :'
  }
};

// La langue suit l'adresse (/booking-confirmed ou /fr/booking-confirmed), pour que le bouton FR/EN fonctionne
export async function onRequestGet(ctx) { return render(ctx, 'en'); }

export async function render({ env, request }, pageLang) {
  const q = new URL(request.url).searchParams;
  let v = { kind: 'fail', lang: pageLang };

  // Aperçu des différents écrans (site de prévisualisation seulement, jamais en production) : ?demo=paid|manual|processing|refund|pending|fail
  const demo = q.get('demo'), host = new URL(request.url).hostname;
  if (demo && !host.endsWith('yachtresearchgroup.com')) {
    v = { lang: pageLang, name: 'Sarah Martin', product: 'Sunseeker Superyacht Experience', date: '2026-12-02', time: '19:00', guests: 2, totalMinor: 133500,
      kind: demo === 'paid' || demo === 'manual' || demo === 'processing' ? (demo === 'paid' ? 'paid' : 'paid_processing') : demo, booked: demo === 'paid', manual: demo === 'manual' };
  } else if (q.get('pi')) {
    const r = await confirmZiina(env, q.get('pi'), q.get('t'));
    const m = r.meta;
    if (m) {
      v = { lang: pageLang, name: m.n, product: m.pr, date: m.d, time: m.t, guests: Number(m.a) + Number(m.c), totalMinor: Number(m.retail) + Number(m.fee), test: r.test };
      v.kind = r.state === 'paid_booked' || r.state === 'paid_test' ? 'paid' : r.state === 'retry' ? 'paid_processing'
        : r.state === 'pending' ? 'pending' : r.state === 'refunded' ? 'refund' : r.state === 'refund_failed' ? 'paid_processing' : 'fail';
      v.booked = r.state === 'paid_booked';
      v.manual = r.state === 'retry' && r.code === 'payment_required';
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
      <p class="lead">${v.booked ? t.booked : v.manual ? t.manual : t.processing}</p>
      <div class="yp-specs" style="text-align:left;margin:36px 0"><div><span>${t.exp}</span><b>${esc(v.product)}</b></div><div><span>${t.date}</span><b>${esc(v.date)} ${t.at} ${esc(v.time)} ${t.dubai}</b></div><div><span>${t.guests}</span><b>${v.guests}</b></div><div><span>${t.total}</span><b>${aedTxt(v.totalMinor, fr)}</b></div></div>
      <p>${t.ask}</p>`;
  } else {
    const k = v.kind === 'pending' ? 'pending' : v.kind === 'refund' ? 'refund' : 'fail';
    body = `<p class="eyebrow">${t[k + 'T']}</p><h1 class="t-l" style="margin:22px 0">${t[k + 'H']}</h1><p class="lead">${t[k + 'L']}</p>`;
  }
  const html = `<!DOCTYPE html><html lang="${v.lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t.page} | Yacht Research</title><meta name="robots" content="noindex">` + HEAD_ASSETS + '</head><body>' + (fr ? NAV_FR : NAV) +
    '<section class="sx-ok" style="min-height:80vh;display:grid;align-content:center;max-width:980px;box-sizing:border-box;padding:140px var(--pad) 60px">' + body +
    // Contacts : trois boutons de même taille sur une ligne (empilés sur mobile), puis « Autres expériences » à part, plus bas
    `<style>.sx-ok .lead{margin-left:auto;margin-right:auto}.sx-ok-cta{display:grid;grid-template-columns:repeat(3,250px);gap:14px;justify-content:center;margin-top:30px}.sx-ok-cta .btn{width:100%;justify-content:center;white-space:nowrap;padding-left:16px;padding-right:16px}` +
    `.sx-ok-more{margin-top:56px;padding-top:30px;border-top:1px solid rgba(201,168,76,.18);text-align:center}.sx-ok-more a{color:var(--gold-l);font-size:13px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none}.sx-ok-more a:hover{color:var(--gold)}` +
    `@media(max-width:860px){.sx-ok-cta{grid-template-columns:1fr;max-width:320px;margin-left:auto;margin-right:auto}}</style>` +
    `<div class="sx-ok-cta"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-gold" target="_blank" rel="noopener">WhatsApp ${fr ? 'EAU' : 'UAE'}</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" class="btn btn-gold" target="_blank" rel="noopener">WhatsApp FR</a><a href="mailto:contact@yachtresearchgroup.com" class="btn btn-ghost">${fr ? 'Nous écrire' : 'Write to us'}</a></div>` +
    `<div class="sx-ok-more"><a href="${fr ? '/fr' : ''}/shared-experiences">${t.more} →</a></div></section>` +
    // Réservation pas encore faite (paiement en cours, ou finalisation) : la page se recharge toute seule (max 20 fois),
    // ce qui relance la réservation dès que c'est possible (par exemple après la recharge du wallet)
    (!demo && (v.kind === 'paid_processing' || v.kind === 'pending') ? `<script>(function(){try{var k='yr_rl_${(q.get('pi') || '').replace(/[^A-Za-z0-9_-]/g, '')}',n=+(sessionStorage.getItem(k)||0);if(n<20){sessionStorage.setItem(k,n+1);setTimeout(function(){location.reload();},${v.kind === 'pending' ? 10000 : 60000});}}catch(e){}})();</script>` : '') +
    (fr ? FOOTER_FR : FOOTER) + SCRIPTS + '</body></html>';
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' } });
}
