// ============================================================
// Ziina : confirmation d'un paiement puis réservation chez Xclusive.
// Appelée par la page de retour (/booking-confirmed?pi=…&t=…) ET par le webhook Ziina :
// le premier qui arrive réserve, le second retrouve le résultat (clé d'idempotence Xclusive + mémo en cache).
// Le statut du paiement est TOUJOURS relu chez Ziina (on ne croit jamais l'adresse ni le message reçu).
// En mode test (ZIINA_TEST, actif par défaut) : aucun débit et AUCUNE vraie réservation, seulement un contrôle à blanc.
// ============================================================
import { xc, ziina, ziinaTest, openToken, stableUuid, notify } from './_sx.js';

const DONE = 'https://sx-cache.yachtresearchgroup.com/ziina-done/';
const RETRY = new Set(['network_error', 'rate_limited', 'request_in_progress', 'temporarily_unavailable', 'http_500', 'http_502', 'http_503', 'http_504', 'not_configured']);

const aed = m => (Number(m || 0) / 100).toFixed(2);

// Lit le paiement chez Ziina et, s'il est payé, réserve. Renvoie { state, meta, test }
//   state : paid_booked | paid_test | refunded | refund_failed | pending | failed | retry | unknown
export async function confirmZiina(env, piId, token) {
  if (!/^[A-Za-z0-9_-]{6,80}$/.test(String(piId || ''))) return { state: 'unknown' };
  const test = ziinaTest(env);
  const cache = caches.default;
  const memo = new Request(DONE + encodeURIComponent(piId));
  const seen = await cache.match(memo);
  if (seen) return seen.json();

  const g = await ziina(env, '/payment_intent/' + encodeURIComponent(piId));
  if (!g.ok) return { state: g.status === 404 ? 'unknown' : 'retry' };
  const pi = g.data || {};
  // Les détails de la réservation : jeton reçu, sinon celui de l'adresse de retour enregistrée chez Ziina
  let tok = token;
  if (!tok && pi.success_url) { try { tok = new URL(pi.success_url).searchParams.get('t'); } catch (e) {} }
  const meta = await openToken(env, tok);
  if (!meta) return { state: 'unknown' };
  if (pi.status !== 'completed') {
    return { state: ['failed', 'canceled'].includes(pi.status) ? 'failed' : 'pending', meta, test };
  }
  // Le montant payé doit être exactement celui calculé au moment du paiement
  if (Number(pi.amount) !== Number(meta.retail) + Number(meta.fee) || String(pi.currency_code).toUpperCase() !== 'AED') {
    await notify(env, { status: 'ACTION NEEDED · montant Ziina inattendu, rien réservé', ...summary(meta, piId, test, pi, env) });
    return remember(cache, memo, { state: 'failed', meta, test });
  }

  const sum = summary(meta, piId, test, pi, env);
  const booking = { departure_id: meta.dep, adults: meta.a, children: meta.c, featured: false, name: meta.n, phone: meta.p, email: env.SX_GUEST_EMAIL || meta.e, expected_total_minor: meta.b2b };

  if (test) {
    // Mode test : on vérifie seulement que la réservation serait acceptée (rien n'est bloqué ni payé chez Xclusive)
    // Nom « REFUND TEST » : refus simulé, pour tester le remboursement automatique Ziina (mode test seulement)
    const dry = meta.n === 'REFUND TEST' ? { ok: false, code: 'forced_test_refusal' } : await xc(env, '/validate-booking', { method: 'POST', body: booking });
    if (!dry.ok && RETRY.has(dry.code)) return { state: 'retry', meta, test };
    let rf = null;
    if (!dry.ok) rf = await ziina(env, '/refund', { id: await stableUuid('refund|' + piId), payment_intent_id: piId, amount: Number(pi.amount), currency_code: 'AED', test: true });
    await notify(env, { status: 'TEST · paiement Ziina test reçu · ' + (dry.ok ? 'réservation acceptable (non réservée)' : 'réservation refusée : ' + dry.code + ' · remboursement test ' + (rf && rf.ok ? 'OK' : 'ÉCHEC ' + (rf && rf.status))), ...sum });
    return remember(cache, memo, { state: dry.ok ? 'paid_test' : (rf && rf.ok ? 'refunded' : 'refund_failed'), meta, test, code: dry.ok ? '' : dry.code });
  }

  const r = await xc(env, '/bookings', { method: 'POST', idem: 'zi-' + piId, body: { ...booking, reference: 'ziina-' + piId } });
  if (r.ok) {
    if (!r.data.replayed) await notify(env, { status: 'CONFIRMED · Xclusive booking #' + r.data.id + ' (' + r.data.status + ')', ...sum });
    return remember(cache, memo, { state: 'paid_booked', meta, test, booking_id: r.data.id });
  }
  if (RETRY.has(r.code)) return { state: 'retry', meta, test };
  if (r.code === 'payment_required' || r.status === 402) {
    // Une seule alerte par paiement (la page du client se recharge toute seule et le webhook Ziina réessaie)
    const once = new Request(DONE + 'wallet-alert/' + encodeURIComponent(piId));
    if (!(await cache.match(once))) {
      await notify(env, { status: 'ACTION NEEDED · wallet Xclusive insuffisant · le client a PAYÉ ' + aed(Number(meta.retail) + Number(meta.fee)) + ' AED · rechargez au moins ' + aed(meta.b2b) + ' AED (prix B2B de cette réservation) : elle est retentée tant que le client garde sa page ouverte ; sinon réservez-la vous-même dans le portail', ...sum });
      await cache.put(once, new Response('1', { headers: { 'Cache-Control': 'max-age=86400' } }));
    }
    return { state: 'retry', meta, test, code: 'payment_required' };
  }
  // Refus définitif : remboursement intégral, identifiant stable pour ne jamais rembourser deux fois
  const rf = await ziina(env, '/refund', { id: await stableUuid('refund|' + piId), payment_intent_id: piId, amount: Number(pi.amount), currency_code: 'AED' });
  await notify(env, { status: 'NOT BOOKED (' + r.code + ') · client ' + (rf.ok ? 'remboursé automatiquement' : 'À REMBOURSER MANUELLEMENT dans Ziina'), ...sum });
  return remember(cache, memo, { state: rf.ok ? 'refunded' : 'refund_failed', meta, test, code: r.code });
}

// Frais prélevés par Ziina sur un paiement (en fils). Si Ziina les donne dans le paiement, on les prend ;
// sinon estimation avec ZIINA_FEE_PCT (défaut 4,584 % : 17,28 AED retenus sur 377 AED, réservation du 28/11/2026).
function ziinaFeeMinor(pi, paidMinor, env) {
  for (const k of ['fee_amount', 'fees_amount', 'fee', 'processing_fee']) {
    const v = pi && (typeof pi[k] === 'object' && pi[k] ? pi[k].amount : pi[k]);
    if (v !== undefined && v !== null && v !== '' && isFinite(Number(v))) return { minor: Number(v), est: false };
  }
  const p = env && env.ZIINA_FEE_PCT !== undefined && env.ZIINA_FEE_PCT !== '' ? Number(env.ZIINA_FEE_PCT) : 4.584;
  return { minor: Math.round(paidMinor * (isFinite(p) && p >= 0 && p < 15 ? p : 4.584) / 100), est: true };
}

function summary(m, piId, test, pi, env) {
  const paid = Number(m.retail) + Number(m.fee);
  const zf = ziinaFeeMinor(pi, paid, env);
  return {
    product: m.pr, date: m.d, time: m.t, guests: String(Number(m.a) + Number(m.c)), name: m.n, phone: m.p, client_email: m.e,
    paid_aed: aed(paid), card_fee_aed: aed(m.fee),
    // Ce que Ziina verse réellement, puis la marge nette = versé par Ziina − prix B2B Xclusive
    ziina_fee_aed: (zf.est ? '≈ ' : '') + aed(zf.minor), received_aed: (zf.est ? '≈ ' : '') + aed(paid - zf.minor),
    b2b_aed: aed(m.b2b), margin_aed: (zf.est ? '≈ ' : '') + aed(paid - zf.minor - Number(m.b2b)),
    payment: 'Ziina ' + piId + (test ? ' (TEST)' : ''),
    // la colonne du Sheet s'appelle encore « stripe_session » : on y range la référence du paiement Ziina
    stripe_session: 'Ziina ' + piId + (test ? ' (TEST)' : '')
  };
}

async function remember(cache, req, result) {
  await cache.put(req, new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=2592000' } }));
  return result;
}
