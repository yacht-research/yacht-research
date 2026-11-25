// ============================================================
// Page d'un yacht (anglais /yacht/<slug> et français /fr/yacht/<slug>)
// Utilisé par functions/yacht/[slug].js et functions/fr/yacht/[slug].js.
// Version française : textes de la page traduits ici ; textes propres au bateau (description, points forts…)
// lus dans content/i18n/yachts/<slug>.json (écrits à la main, jamais de traduction automatique).
// ============================================================
import { NAV, FOOTER, HEAD_ASSETS, SCRIPTS } from './shell.js';
import { NAV_FR, FOOTER_FR } from './shell-fr.js';

const BASE = 'https://yachtresearchgroup.com';

export async function serveYacht(context, lang) {
  const fr = lang === 'fr';
  const slug = context.params.slug;
  const url = new URL(context.request.url);
  const origin = url.origin;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return notFound(fr);
  // Anciennes adresses de fiches renommées : redirection permanente (Google remplace l'ancienne adresse par la nouvelle)
  const MOVED = { 'behike-150ft-tri-deck-dubai': 'behike-141ft-tri-deck-dubai' };
  if (MOVED[slug]) return Response.redirect(origin + (fr ? '/fr' : '') + '/yacht/' + MOVED[slug] + url.search, 301);

  let y = null, tr = null;
  try {
    const res = await context.env.ASSETS.fetch(new URL('/content/yachts/' + slug + '.json', context.request.url));
    if (res.ok) y = await res.json();
  } catch (e) {}
  if (!y || y.published === false) return notFound(fr);
  if (fr) {
    try {
      const r2 = await context.env.ASSETS.fetch(new URL('/content/i18n/yachts/' + slug + '.json', context.request.url));
      if (r2.ok) tr = await r2.json();
    } catch (e) {}
    // pas encore de texte français pour ce bateau : on garde la page anglaise (jamais une page à moitié traduite)
    if (!tr) return Response.redirect(origin + '/yacht/' + slug + url.search, 302);
  }

  return new Response(renderYachtPage(y, slug, BASE, origin, fr ? tr : null), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'index, follow',
      // 5 min dans le navigateur, 1 h dans le cache Cloudflare
      'Cache-Control': 'public, max-age=300, s-maxage=3600'
    }
  });
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function abs(u, base) {
  if (!u) return '';
  return /^https?:/.test(u) ? u : base + encodeURI(u.startsWith('/') ? u : '/' + u);
}
function currency(p) {
  if (!p) return 'EUR';
  if (/£|GBP/.test(p)) return 'GBP';
  if (/AED/.test(p)) return 'AED';
  if (/\$|USD/.test(p)) return 'USD';
  return 'EUR';
}
function titleHTML(t) {
  if (t.indexOf(' - ') > -1) {
    const [name, model] = t.split(' - ');
    const n = name.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()).replace(/\b(Ii|Iii|Iv|Vi|Vii|Viii|Ix)\b/g, r => r.toUpperCase());
    return '<span class="acc">' + esc(n) + '</span><small class="yt-model">' + esc(model) + '</small>';
  }
  const p = t.split(' ');
  return p.length < 2 ? esc(t) : esc(p[0]) + ' <span class="acc">' + esc(p.slice(1).join(' ')) + '</span>';
}
function pick(specs, re) {
  if (!specs) return '';
  const k = Object.keys(specs).find(k => re.test(k));
  return k ? String(specs[k]) : '';
}

// ---------- textes de la page en français
const FR = {
  'Price on request': 'Prix sur demande', 'Charter': 'Location', 'Sold': 'Vendu', 'Exclusive price': 'Prix exclusif', 'Price reduced': 'Prix baissé', 'Off market': 'Hors marché', 'New listing': 'Nouveauté', 'For sale': 'À vendre',
  'Home': 'Accueil', 'Yachts for sale': 'Yachts à vendre', 'Length': 'Longueur', 'Year': 'Année', 'Guests': 'Invités', 'Builder': 'Chantier', 'Location': 'Lieu',
  'Specifications': 'Caractéristiques', 'Technical <span class="acc">details</span>': 'Détails <span class="acc">techniques</span>', 'Highlights': 'Points forts',
  'Gallery': 'Galerie', 'On <span class="acc">board</span>': 'À <span class="acc">bord</span>', 'Previous': 'Précédent', 'Next': 'Suivant', 'photo': 'photo',
  'The film': 'Le film', 'Step <span class="acc">aboard</span>': 'Montez <span class="acc">à bord</span>', 'video tour': 'visite en vidéo',
  'Brochure': 'Brochure', 'About this yacht': 'À propos de ce yacht', 'Asking price': 'Prix demandé', 'This yacht has been sold.': 'Ce yacht a été vendu.',
  'Contact us if you want the same: we search on-market and off-market for a similar yacht, in confidence.': 'Contactez-nous si vous voulez le même : nous cherchons un yacht similaire sur le marché et hors marché, en toute confidentialité.',
  'Find me the same': 'Trouvez-moi le même', 'Reply within 24 hours, in English or French.': 'Réponse sous 24 heures, en français ou en anglais.',
  'Charter rate': 'Tarif de location', 'Taxes excluded unless stated · Subject to availability': 'Hors taxes sauf mention contraire · Sous réserve de disponibilité',
  'Enquire about this charter': 'Demander cette location', 'Enquire about this yacht': 'Ce yacht m’intéresse',
  'All enquiries handled with discretion. Reply within 24 hours, in English or French.': 'Toutes les demandes sont traitées avec discrétion. Réponse sous 24 heures, en français ou en anglais.',
  'More charters': 'Plus de locations', 'More yachts': 'Plus de yachts', 'You may <span class="acc">also like</span>': 'Vous aimerez <span class="acc">aussi</span>',
  'All charter yachts': 'Tous les yachts en location', 'All yachts for sale': 'Tous les yachts à vendre', 'Close': 'Fermer', 'All': 'Les', 'photos': 'photos',
  'guests': 'invités', 'ft': 'pieds', 'cabins': 'cabines', 'crew': 'équipage', 'yacht charter': 'en location', 'for sale': 'à vendre',
  'About': 'À propos de', 'Rate': 'Tarif', 'From': 'À partir de', 'Departs from': 'Départ de', 'Rate type': 'Type de tarif', 'Preferential B2B rate': 'Tarif B2B préférentiel',
  'Questions': 'Questions', 'Subject to availability': 'Sous réserve de disponibilité', 'Check availability': 'Vérifier les disponibilités',
  'Payment by bank transfer or card': 'Paiement par virement ou par carte', 'No payment to request a quote': 'Aucun paiement pour demander un devis',
  'All enquiries handled with discretion': 'Toutes les demandes sont traitées avec discrétion', 'Reply within 24 hours, in English or French': 'Réponse sous 24 heures, en français ou en anglais',
  'Similar <span class="acc">yachts</span>': 'Yachts <span class="acc">similaires</span>',
  'This listing is <span class="acc">no longer available</span>': 'Cette annonce <span class="acc">n’est plus disponible</span>', 'View all yachts': 'Voir tous les yachts'
};
// noms des caractéristiques techniques
const SPEC_FR = {
  'Builder': 'Chantier', 'Year built': 'Année de construction', 'Flag': 'Pavillon', 'Length': 'Longueur', 'Beam': 'Largeur', 'Draft': 'Tirant d’eau', 'Engines': 'Moteurs',
  'Cruising speed': 'Vitesse de croisière', 'Max speed': 'Vitesse max.', 'Stabiliser': 'Stabilisateur', 'Cabins': 'Cabines', 'Guests (sleeping)': 'Invités (nuit)',
  'Guests (cruising)': 'Invités (navigation)', 'Guests (licensed)': 'Passagers autorisés', 'Electronics': 'Électronique', 'Licence': 'Licence', 'Crew': 'Équipage', 'Tender': 'Annexe', 'Type': 'Type', 'Length overall': 'Longueur hors tout', 'Guests': 'Invités', 'Base': 'Port d’attache',
  'Condition': 'État', 'Waterline length': 'Longueur à la flottaison', 'Draft (full load)': 'Tirant d’eau (pleine charge)', 'Height above waterline': 'Tirant d’air',
  'Displacement': 'Déplacement', 'Hull': 'Coque', 'Generators': 'Générateurs', 'Air conditioning': 'Climatisation', 'Fuel capacity': 'Capacité carburant', 'Fresh water': 'Eau douce',
  'Berths': 'Couchages', 'Generator': 'Générateur', 'Model': 'Modèle', 'Year': 'Année', 'Power': 'Puissance', 'Engine hours': 'Heures moteur', 'Origin': 'Origine',
  'Stabilisers': 'Stabilisateurs', 'Location': 'Lieu', 'Designer': 'Designer', 'Model year': 'Année modèle', 'Construction': 'Construction', 'Exterior design': 'Design extérieur',
  'Interior design': 'Design intérieur', 'Heads': 'Salles d’eau', 'Water capacity': 'Capacité eau', 'Shipyard': 'Chantier', 'Design': 'Design', 'Rig': 'Gréement',
  'Transmission': 'Transmission', 'Bathrooms': 'Salles de bain', 'Energy': 'Énergie', 'Watermaker': 'Dessalinisateur', 'Gross tonnage': 'Jauge brute', 'Classification': 'Classification',
  'Range': 'Autonomie', 'Extras': 'Équipements', 'Minimum booking': 'Réservation minimum', 'Refit': 'Refit', 'Length (LOA)': 'Longueur (LOA)', 'Speed': 'Vitesse', 'Fuel tank': 'Réservoir carburant',
  'Water tank': 'Réservoir d’eau', 'Guest cabins': 'Cabines invités', 'Crew berths': 'Couchages équipage', 'VAT': 'TVA', 'Thrusters': 'Propulseurs', 'Bathing platform': 'Plateforme de bain',
  'Builder / model': 'Chantier / modèle', 'Delivered': 'Livré', 'Interior': 'Intérieur', 'Chase boat': 'Bateau suiveur', 'Hull number': 'Numéro de coque', 'Delivery': 'Livraison',
  'CE category': 'Catégorie CE', 'Warranty': 'Garantie', 'Low season rate': 'Tarif basse saison', 'High season rate': 'Tarif haute saison', 'Stabilisation': 'Stabilisation',
  'Navigation': 'Navigation', 'Registered': 'Immatriculation', 'Generator hours': 'Heures générateur', 'Batteries': 'Batteries', 'Hulls': 'Coques', 'Total living space': 'Surface habitable',
  'Propulsion': 'Propulsion', 'Additional engines': 'Moteurs supplémentaires', 'Battery bank': 'Parc de batteries', 'Solar panels': 'Panneaux solaires', 'Sails': 'Voiles',
  'Energy at sea': 'Énergie en mer', 'Bow thrusters': 'Propulseurs d’étrave', 'Passerelle': 'Passerelle', 'Decks': 'Ponts', 'Tax status': 'Statut fiscal', 'Weight': 'Poids',
  'Drive': 'Transmission', 'Compliance': 'Conformité', 'Max / cruising speed': 'Vitesse max. / croisière', 'Black water': 'Eaux noires'
};
// valeurs de caractéristiques qui reviennent d'un bateau à l'autre (quand la fiche n'a pas sa propre traduction)
const SPECVAL_FR = {
  'Flybridge motor yacht': 'Yacht à moteur avec flybridge', 'Tri-deck motor yacht': 'Yacht à moteur sur trois ponts', 'Two-deck party yacht': 'Yacht festif sur deux ponts',
  'Super-wide party yacht': 'Yacht festif extra-large', 'Crossover motor yacht': 'Yacht à moteur crossover', 'Event yacht': 'Yacht événementiel',
  'CMC electric fins': 'Ailerons électriques CMC', 'CMC hydraulic fins': 'Ailerons hydrauliques CMC', 'TRAC zero-speed fins': 'Ailerons TRAC à l’arrêt',
  'Zero-speed fins': 'Ailerons à l’arrêt', 'Zero-speed': 'À l’arrêt', 'CMC zero-speed fins': 'Ailerons CMC à l’arrêt', 'Hydraulic': 'Hydraulique',
  '1 cabin': '1 cabine', '1 cabin, 4 berths': '1 cabine, 4 couchages', '4, including a full-beam master': '4, dont une cabine propriétaire sur toute la largeur',
  '260 NM at cruising speed': '260 milles à vitesse de croisière', '8 upgraded lithium batteries': '8 batteries au lithium renforcées',
  'Hydrogeneration under sail': 'Hydrogénération sous voiles', 'Full MCA': 'Conformité MCA complète', 'Yes': 'Oui', 'No': 'Non', 'New': 'Neuf'
};
const PLACES = [['United Kingdom', 'Royaume-Uni'], ['Turkey', 'Turquie'], ['Greece', 'Grèce'], ['Italy', 'Italie'], ['Thailand', 'Thaïlande'], ['Florida', 'Floride'], ['Spain', 'Espagne'],
  ['Croatia', 'Croatie'], ['Netherlands', 'Pays-Bas'], ['Germany', 'Allemagne'], ['Montenegro', 'Monténégro'], ['UAE', 'EAU'], ['Dubai', 'Dubaï'], ['(new)', '(neuf)'], ['Mallorca', 'Majorque'],
  ['Corsica', 'Corse'], ['Aegean Sea', 'mer Égée'], ['South of France', 'Sud de la France'], ['Mediterranean', 'Méditerranée'], ['French Riviera', 'Côte d’Azur'], ['Portugal', 'Portugal'], ['China', 'Chine'], ['Hong Kong', 'Hong Kong'], ['Taiwan', 'Taïwan'], ['Cyprus', 'Chypre'], ['Malta', 'Malte']];
// valeurs entières reprises telles quelles des annonces : versions françaises exactes
Object.assign(SPECVAL_FR, {
  'Shaft drive': 'Ligne d’arbre', 'Shaft drive, 3-blade Flexofold folding propellers': 'Ligne d’arbre, hélices repliables Flexofold tripales',
  'Onan 7 kVA generator, 1,200 Wp solar panels, OPZV 1,220 Ah battery bank': 'Générateur Onan 7 kVA, panneaux solaires 1 200 Wc, parc de batteries OPZV 1 220 Ah',
  'Gyro stabiliser': 'Stabilisateur gyroscopique', 'Fin stabiliser': 'Stabilisateurs à ailerons', 'Humphree fin stabilisers': 'Stabilisateurs à ailerons Humphree',
  'Trac digital fin stabilisers': 'Stabilisateurs à ailerons Trac (numériques)', 'Satin walnut': 'Noyer satiné', 'Walnut satin finish': 'Noyer finition satinée',
  'High-gloss walnut': 'Noyer laqué brillant', 'Princess Design Studio, gloss Silver Oak, Walnut floors': 'Princess Design Studio, chêne Silver Oak brillant, sols en noyer',
  'Williams jet tender': 'Annexe Williams à jet', 'Williams 325 jet tender': 'Annexe Williams 325 à jet', 'Chilled water system, 24 tons': 'Système à eau glacée, 24 tonnes',
  'Chilled water system, 201,000 BTU': 'Système à eau glacée, 201 000 BTU', 'Tropical spec, 204,000 BTU': 'Version tropicale, 204 000 BTU',
  'Tender launching system, hardtop, CCTV, wine cooler': 'Système de mise à l’eau de l’annexe, hard top, vidéosurveillance, cave à vin', 'V-drive': 'V-drive',
  'Sleipner SPS90 / VF1350 fins': 'Ailerons Sleipner SPS90 / VF1350', 'CMC fins': 'Ailerons CMC', 'ABT TRAC fins': 'Ailerons ABT TRAC',
  'Sleipner SPS92/VF1350 vector fins': 'Ailerons vectoriels Sleipner SPS92/VF1350', 'Fins + Seakeeper gyro': 'Ailerons + gyroscope Seakeeper',
  'Seakeeper 1 NG18 gyro': 'Gyroscope Seakeeper 1 NG18', 'Gyro': 'Gyroscopique', 'GRP / carbon fibre': 'Polyester (GRP) / fibre de carbone',
  'Epoxy-laminated strip-planked red cedar': 'Cèdre rouge en lattes, stratifié époxy'
});
// mots et unités anglais restants dans les valeurs (berths, kn, HP, 1,100…) → français
const specValFr = v => String(v)
  .replace(/(\d),(\d{3})\b/g, '$1 $2').replace(/(\d),(\d{3})\b/g, '$1 $2')
  .replace(/\b(\d+) berths\b/g, '$1 couchages').replace(/\b1 berth\b/g, '1 couchage')
  .replace(/^up to /i, 'Jusqu’à ').replace(/\b(\d[\d .–-]*) ?nm at (\d+) kn\b/i, '$1 milles à $2 nœuds')
  .replace(/(\d) ?kn\b/g, '$1 nœuds').replace(/(\d) ?hp\b/gi, '$1 ch').replace(/\b(\d+) years\b/, '$1 ans').replace(/\b(\d+) tons\b/, '$1 tonnes')
  .replace(/^Cyprus$/, 'Chypre');
function fr(s) { return Object.prototype.hasOwnProperty.call(FR, s) ? FR[s] : s; }
const place = s => PLACES.reduce((a, [e, f]) => a.split(e).join(f), String(s || ''));
const priceFr = s => String(s || '')
    .replace(/(HK\$|AED|USD|€|£|\$)\s?(\d[\d,]*(?:\.\d+)?)/g, function(m, c, n){ return n.replace(/,/g, '\u00a0') + '\u00a0' + c; })
    .replace(/^From (.+?) per hour/, 'À partir de $1 / heure').replace(/^From (.+?) per day/, 'À partir de $1 / jour').replace(/^From (.+?) per week/, 'À partir de $1 / semaine')
    .replace(/^From /, 'À partir de ').replace(/ for (\d+) hours/, ' pour $1 heures').replace(/ per hour/, ' / heure').replace(/ per week/, ' / semaine')
    .replace(/VAT Included/i, 'TVA incluse').replace(/VAT Excluded/i, 'hors TVA').replace(/\(Landed Exc\. Taxes\)/, '(livré, hors taxes)').replace(/\(Exc\. Taxes\)/, '(hors taxes)')
    .replace(/Price on request/, 'Prix sur demande').replace(/\bSold\b/, 'Vendu');

export function renderYachtPage(y, slug, base, origin, tr) {
  const isFr = !!tr;
  const t = s => isFr ? fr(s) : s;
  const L = p => isFr ? '/fr' + p : p; // liens internes
  // textes propres au bateau : version française si fournie, sinon l'anglais
  const T = (k) => isFr && tr[k] != null ? tr[k] : y[k];
  const title = y.title || 'Yacht';
  const isCharter = (y.listing_type === 'charter') || /charter/i.test(y.badge || '');
  const what = isCharter ? 'Charter' : 'Sale';
  const location = isFr ? place(y.location || '') : (y.location || '');
  const canonical = base + L('/yacht/' + slug);
  const image = abs(y.image, base) || base + '/images/uploads/hero-yacht-BzzzVtkx.jpg';
  const gallery = (Array.isArray(y.gallery) ? y.gallery : []).map(g => typeof g === 'string' ? g : (g && g.url) || '').filter(Boolean);
  const yPrice = isFr ? priceFr(y.price) : y.price;
  const yYear = isFr ? String(y.year || '').replace(/^New$/i, 'Neuf').replace(/\(new\)/i, '(neuf)').replace(/\(refit /i, '(refit ').replace(/\(model year\)/i, '(année modèle)').replace(/\(delivered (\w+ )?(\d{4})\)/i, (m, mo, yr) => '(livré en ' + yr + ')').replace(/ model\)/i, ')').replace(/\((\d{4}) model\)/i, '(modèle )') : y.year;
  const pageTitle = isFr
    ? (tr.seo_title || (title + (isCharter ? ' en location' : /sold/i.test(y.badge || '') ? ' vendu' : ' à vendre') + (location.split(',')[0].trim() ? ' · ' + location.split(',')[0].trim() : '') + ' | Yacht Research'))
    : (y.seo_title || (title + ' for ' + what + (location ? ' in ' + location.split(',')[0] : '') + ' | Yacht Research'));
  const metaDesc = isFr
    ? (tr.seo_description || (title + (isCharter ? ' en location' : /sold/i.test(y.badge || '') ? ' vendu' : ' à vendre') + [yYear, y.length, location].filter(Boolean).map(s => ' · ' + s).join('') + '. ' + (y.price ? (isCharter ? 'Tarif : ' : 'Prix demandé : ') + yPrice + '. ' : '') + 'Yacht Research, courtage de yachts international.'))
    : (y.seo_description || (title + ' for ' + what.toLowerCase() + [y.year, y.length, location].filter(Boolean).map(s => ' · ' + s).join('') + '. ' + (y.price ? (isCharter ? 'Rate: ' : 'Asking price: ') + y.price + '. ' : '') + 'Yacht Research, international yacht brokerage.'));
  const description = T('description') || (title + ' is ' + (y.year ? 'a ' + y.year + ' ' : 'a ') + 'yacht' + (y.length ? ' of ' + y.length : '') + ' available for ' + what.toLowerCase() + ' through Yacht Research' + (location ? ', located in ' + location : '') + '. Contact our team for the full specification and viewing arrangements.');
  const specs = isFr && y.specs ? Object.fromEntries(Object.keys(y.specs).map(k => [SPEC_FR[k] || k, (tr.specs && tr.specs[k] != null) ? tr.specs[k] : specValFr(SPECVAL_FR[String(y.specs[k])] || (/location|lying|base|flag|origin/i.test(k) ? place(y.specs[k]) : y.specs[k]))])) : y.specs;
  const guests = pick(y.specs, /guest/i);
  // chiffre « invités » affiché : valeur traduite de la même ligne de caractéristiques
  const gKey = y.specs ? Object.keys(y.specs).find(k => /guest/i.test(k)) : null;
  // « 8 couchages » sous « Invités » → « 8 », comme sur les cartes de la page Acheter
  const guestsShown = isFr && gKey ? String(specs[SPEC_FR[gKey] || gKey]).replace(/^(\d+) couchages?$/, '$1') : guests;
  const price = yPrice || t('Price on request') || 'Price on request';
  const priceNote = T('price_note');
  const sold = !isCharter && /sold/i.test(y.badge || ''); // vendu : étiquette « Sold » et « Contact us if you want the same »

  // Données structurées (Google)
  const digits = (y.price || '').replace(/\(.*?\)/g, '').replace(/[^0-9]/g, '');
  const offer = { '@type': 'Offer', priceCurrency: currency(y.price), availability: sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', url: canonical, seller: { '@type': 'Organization', name: 'Yacht Research', url: base } };
  if (digits && !isCharter) offer.price = Number(digits);
  const props = specs && typeof specs === 'object'
    ? Object.keys(specs).map(k => ({ '@type': 'PropertyValue', name: k, value: String(specs[k]) }))
    : [{ '@type': 'PropertyValue', name: t('Length'), value: y.length || '' }, { '@type': 'PropertyValue', name: isFr ? 'Année de construction' : 'Year Built', value: y.year || '' }];
  props.push({ '@type': 'PropertyValue', name: t('Location'), value: location });
  let schema = () => JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name: title, description: metaDesc, url: canonical,
    image: [image].concat(gallery.map(g => abs(g, base))),
    brand: { '@type': 'Brand', name: y.builder || 'Yacht Research' }, offers: offer, additionalProperty: props
  }).replace(/</g, '\\u003c');
  const city = location.split(',')[0].trim();
  const hourly = isCharter && /per hour/i.test(y.price || '') && digits;
  if (hourly) { offer.price = Number(digits); offer.priceSpecification = { '@type': 'UnitPriceSpecification', price: Number(digits), priceCurrency: currency(y.price), unitText: 'HOUR' }; }
  const faq = isCharter ? (isFr ? charterFaqFr(y, title, city, guests, yPrice, priceNote) : charterFaq(y, title, city, guests)) : [];
  const faqLD = faq.length ? '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }).replace(/</g, '\\u003c') + '</script>' : '';
  const crumbs = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('Home'), item: base + L('/') },
      { '@type': 'ListItem', position: 2, name: isCharter ? t('Charter') : t('Yachts for sale'), item: base + L(isCharter ? '/charter' : '/listings') },
      ...(isCharter && city ? [{ '@type': 'ListItem', position: 3, name: city, item: base + L('/charter') + '?location=' + encodeURIComponent((y.location || '').split(',')[0].trim()) }] : []),
      { '@type': 'ListItem', position: isCharter && city ? 4 : 3, name: title, item: canonical }]
  });

  const keySpecs = [
    [t('Length'), (y.length || '').split('/')[0].trim()],
    [t('Year'), yYear],
    guests ? [t('Guests'), guestsShown] : [t('Builder'), y.builder],
    [t('Location'), location.split(',')[0]]
  ].filter(s => s[1]);

  const specsHTML = specs && typeof specs === 'object' && Object.keys(specs).length
    ? '<section class="yp-sec"><p class="eyebrow rv">' + t('Specifications') + '</p><h2 class="t-l split-words yp-h2">' + t('Technical <span class="acc">details</span>') + '</h2><div class="yp-specs rv">' +
      Object.keys(specs).filter(k => specs[k]).map(k => '<div><span>' + esc(k) + '</span><b>' + esc(specs[k]) + '</b></div>').join('') + '</div></section>'
    : '';
  const highlights = T('highlights');
  const hlHTML = Array.isArray(highlights) && highlights.length
    ? '<div class="yp-hl rv"><p class="eyebrow">' + t('Highlights') + '</p><ul>' + highlights.map(h => '<li>' + esc(h) + '</li>').join('') + '</ul></div>' : '';
  const galHTML = gallery.length
    ? '<section class="yp-sec" style="padding-right:0"><div class="head" style="padding-right:var(--pad)"><div><p class="eyebrow rv">' + t('Gallery') + '</p><h2 class="t-l split-words yp-h2">' + t('On <span class="acc">board</span>') + '</h2></div><div class="rail-ui"><button data-prev aria-label="' + t('Previous') + '">←</button><button data-next aria-label="' + t('Next') + '">→</button></div></div>' +
      '<div class="rail yp-gal">' + [y.image].concat(gallery).map((g, i) => '<button class="yp-shot" data-full="' + esc(g) + '"><img src="' + esc(/^\/images\/.*\.webp$/.test(g) ? g.replace(/\.webp$/, '-800.webp') : g) + '" decoding="async" alt="' + esc(title) + ' ' + t('photo') + ' ' + (i + 1) + '" loading="lazy"></button>').join('') + '</div><div class="progress" style="margin-right:var(--pad)"><i></i></div></section>'
    : '';
  // Vidéo courte (muette, en boucle, lancée seulement quand elle arrive à l'écran ; rien n'est chargé avant)
  const videoHTML = y.video
    ? '<section class="yp-sec yp-film"><p class="eyebrow rv">' + t('The film') + '</p><h2 class="t-l split-words yp-h2">' + t('Step <span class="acc">aboard</span>') + '</h2>' +
      '<div class="yp-film-box rv' + (y.video_vertical ? ' yp-film-v' : '') + '"><video src="' + esc(y.video) + '"' + (y.video_poster ? ' poster="' + esc(y.video_poster) + '"' : '') + ' muted loop playsinline preload="none" controls aria-label="' + esc(title) + ' ' + t('video tour') + '"></video></div>' +
      '<script>(function(){var v=document.currentScript.previousElementSibling.querySelector("video");if(!("IntersectionObserver"in window))return;new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){var p=v.play();p&&p.catch(function(){})}else v.pause()})},{threshold:.35}).observe(v)})()</script></section>'
    : '';
  // Encart mis en avant juste sous les chiffres clés (argument principal de l'annonce)
  const c = T('callout');
  const calloutHTML = c && c.title
    ? '<section class="yp-callout rv"><div class="yp-callout-in">' + (c.eyebrow ? '<p class="eyebrow">' + esc(c.eyebrow) + '</p>' : '') +
      '<h2 class="yp-callout-t">' + esc(c.title) + '</h2>' + (c.text ? '<p class="yp-callout-p">' + esc(c.text) + '</p>' : '') +
      (Array.isArray(c.points) && c.points.length ? '<ul class="yp-callout-pts">' + c.points.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' : '') +
      '</div></section>'
    : '';
  const brochure = y.brochure ? '<a href="' + esc(y.brochure) + '" class="btn btn-ghost" target="_blank" rel="noopener">' + t('Brochure') + ' <i>↓</i></a>' : '';
  const enquire = L('/yacht-research-form') + '?' + (isCharter ? 'project=charter&' : '') + 'yacht=' + encodeURIComponent(title);
  const alt = '<link rel="alternate" hreflang="en" href="' + base + '/yacht/' + slug + '"><link rel="alternate" hreflang="fr" href="' + base + '/fr/yacht/' + slug + '"><link rel="alternate" hreflang="x-default" href="' + base + '/yacht/' + slug + '">';
  const badge = t(badgeKey(y.badge, isCharter));

  return '<!DOCTYPE html><html lang="' + (isFr ? 'fr' : 'en') + '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' + esc(pageTitle) + '</title><meta name="description" content="' + esc(metaDesc) + '"><meta name="robots" content="index, follow"><meta name="theme-color" content="#070707">' +
    '<link rel="canonical" href="' + canonical + '"><link rel="icon" type="image/x-icon" href="/favicon.ico"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">' +
    '<meta property="og:type" content="product"><meta property="og:url" content="' + canonical + '"><meta property="og:title" content="' + esc(pageTitle) + '"><meta property="og:description" content="' + esc(metaDesc) + '"><meta property="og:image" content="' + esc(image) + '"><meta property="og:site_name" content="Yacht Research">' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="' + esc(image) + '">' + alt +
    '<script type="application/ld+json">' + schema() + '</script>' + faqLD + '<script type="application/ld+json">' + crumbs + '</script>' +
    '<link rel="preload" as="image" href="' + esc(y.image || image) + '" fetchpriority="high">' + HEAD_ASSETS + '</head><body class="yp">' +
    (isFr ? NAV_FR : NAV) +
    (isCharter ? charterBody({ y, slug, title, location, city, gallery, price, guests, description, calloutHTML, hlHTML, specsHTML, videoHTML, galHTML, brochure, enquire, faq, t, L, isFr, priceNote }) : (
    // Fiche à vendre : même disposition que les fiches charter (titre, chiffres clés, mosaïque de photos)
    '<main class="lx lx-sale">' +
    '<p class="lx-crumb yp-crumb"><a href="' + L('/') + '">' + t('Home') + '</a> · <a href="' + L('/listings') + '">' + t('Yachts for sale') + '</a> · <span class="notranslate" translate="no">' + esc(title) + '</span></p>' +
    '<div class="lx-top"><div><span class="tag yp-tag' + (sold ? ' is-sold' : '') + '">' + badge + '</span><h1 class="lx-h1 notranslate" translate="no">' + titleHTML(title) + '</h1>' +
    '<p class="lx-loc">' + [yYear, y.length, location].filter(Boolean).map(esc).join(' · ') + '</p></div>' +
    '<div class="lx-chips">' + keySpecs.map(s => '<div><b>' + esc(s[1]) + '</b><span>' + esc(s[0]) + '</span></div>').join('') + '</div></div>' +
    mosaic([y.image || image].concat(gallery), title + ' ' + (y.year || '') + ' ' + t('for sale'), t) +
    '</main>' + calloutHTML +
    '<section class="yp-main"><div class="yp-text"><p class="eyebrow rv">' + t('About this yacht') + '</p><div class="yp-desc rv">' + esc(description).split(/\n\s*\n/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('') + '</div>' + hlHTML + specsHTML.replace('<section class="yp-sec">', '<section class="yp-sec yp-specs-in">') + '</div>' +
    (sold
      ? '<aside class="yp-card yp-sold rv"><p class="eyebrow">' + t('Asking price') + '</p>' + (y.price ? '<p class="yp-was">' + esc(yPrice) + '</p>' : '') + '<p class="yp-price">' + t('Sold') + '</p><p class="yp-note">' + t('This yacht has been sold.') + '</p>' +
        '<p class="yp-same">' + t('Contact us if you want the same: we search on-market and off-market for a similar yacht, in confidence.') + '</p>' +
        '<a href="' + L('/yacht-research-form') + '?project=buy&yacht=' + encodeURIComponent('Looking for the same as ' + title) + '" class="btn btn-gold">' + t('Find me the same') + ' <i>→</i></a>' +
        '<div class="yp-wa"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-ghost">WhatsApp ' + (isFr ? 'EAU' : 'UAE') + '</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" class="btn btn-ghost">WhatsApp FR</a></div>' +
        '<p class="yp-disc">' + t('Reply within 24 hours, in English or French.') + '</p></aside></section>'
      : '<aside class="yp-card rv"><p class="eyebrow">' + (isCharter ? t('Charter rate') : t('Asking price')) + '</p>' +
    (y.original_price ? '<p class="yp-was">' + esc(isFr ? priceFr(y.original_price) : y.original_price) + '</p>' : '') +
    '<p class="yp-price">' + esc(price) + '</p>' + (priceNote ? '<p class="yp-note">' + esc(priceNote) + '</p>' : '<p class="yp-note">' + (/vat|tax/i.test(y.price || '') ? t('Subject to availability') : t('Taxes excluded unless stated · Subject to availability')) + '</p>') +
    '<a href="' + enquire + '" class="btn btn-gold">' + (isCharter ? t('Enquire about this charter') : t('Enquire about this yacht')) + ' <i>→</i></a>' +
    '<div class="yp-wa"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-ghost">WhatsApp ' + (isFr ? 'EAU' : 'UAE') + '</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" class="btn btn-ghost">WhatsApp FR</a></div>' + brochure +
    '<p class="yp-disc">' + t('All enquiries handled with discretion. Reply within 24 hours, in English or French.') + '</p></aside></section>') +
    videoHTML + galHTML +
    '<section class="yp-sec"><div class="head"><div><p class="eyebrow rv">' + (isCharter ? t('More charters') : t('More yachts')) + '</p><h2 class="t-l split-words yp-h2">' + t('You may <span class="acc">also like</span>') + '</h2></div><a href="' + L(isCharter ? '/charter' : '/listings') + '" class="btn-all rv">' + (isCharter ? t('All charter yachts') : t('All yachts for sale')) + ' <span>→</span></a></div>' +
    '<div class="rail" data-yachts="' + (isCharter ? 'charter' : 'sale') + '" data-limit="9" data-exclude="' + esc(slug) + '"></div></section>'
    )) +
    '<div class="lightbox" id="lb" hidden><button aria-label="' + t('Close') + '">×</button><img alt=""></div>' +
    (isFr ? FOOTER_FR : FOOTER) + SCRIPTS + '</body></html>';
}
function badgeKey(b, isCharter) {
  b = (b || '').toLowerCase();
  if (isCharter) return 'Charter';
  if (b.includes('sold')) return 'Sold';
  if (b.includes('exclusive')) return 'Exclusive price';
  if (b.includes('reduc') || b.includes('price')) return 'Price reduced';
  if (b.includes('off')) return 'Off market';
  if (b.includes('new')) return 'New listing';
  return 'For sale';
}

// Mosaïque de 5 photos max + bouton « All N photos » (ouvre la galerie plein écran)
function mosaic(list, alt, t) {
  const imgs = list.filter(Boolean).filter((g, i, a) => a.indexOf(g) === i);
  const t800 = g => /^\/images\/.*\.webp$/.test(g) ? g.replace(/\.webp$/, '-800.webp') : g;
  return '<div class="lx-mosaic lx-n' + Math.min(imgs.length, 5) + '">' + imgs.slice(0, 5).map((g, i) => '<button class="yp-shot" data-full="' + esc(g) + '"><img src="' + esc(i ? t800(g) : g) + '" alt="' + esc(alt) + ' ' + t('photo') + ' ' + (i + 1) + '"' + (i ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"') + '></button>').join('') +
    (imgs.length > 1 ? '<button class="lx-all" type="button" onclick="this.parentNode.querySelector(\'.yp-shot\').click()">' + t('All') + ' ' + imgs.length + ' ' + t('photos') + '</button>' : '') + '</div>';
}

// ---------- Fiche charter ----------
function num(v) { const m = String(v || '').match(/^\s*(\d[\d,.]*)/); return m ? m[1] : ''; }
function charterFaq(y, title, city, guests) {
  const q = [];
  if (y.price) q.push(['How much does it cost to charter ' + title + (city ? ' in ' + city : '') + '?', title + ' is available ' + y.price.replace(/^From/, 'from') + '.' + (y.price_note ? ' ' + y.price_note.replace(/\s*·\s*/g, '. ') + '.' : '')]);
  if (guests) q.push(['How many guests can ' + title + ' take?', guests.replace(/^(\d+)/, 'Up to $1') + '.']);
  if (y.location) q.push(['Where is ' + title + ' based?', title + ' is based in ' + y.location + '.']);
  q.push(['How do I book ' + title + '?', 'Send us an enquiry or a WhatsApp message with your date, timing and number of guests. We reply within 24 hours, in English or French, with availability and a tailored quote.']);
  return q;
}
function charterFaqFr(y, title, city, guests, yPrice, priceNote) {
  const q = [];
  const n = num(guests);
  if (y.price) q.push(['Quel est le prix de la location de ' + title + (city ? ' à ' + city : '') + ' ?', title + ' est disponible ' + yPrice.replace(/^À partir de/, 'à partir de') + '.' + (priceNote ? ' ' + priceNote.replace(/\s*·\s*/g, '. ') + '.' : '')]);
  if (n) q.push(['Combien de personnes ' + title + ' peut-il accueillir ?', 'Jusqu’à ' + n + ' invités.']);
  if (y.location) q.push(['Où ' + title + ' est-il basé ?', title + ' est basé à ' + place(y.location) + '.']);
  q.push(['Comment réserver ' + title + ' ?', 'Envoyez-nous une demande ou un message WhatsApp avec la date, l’horaire et le nombre d’invités. Nous répondons sous 24 heures, en français ou en anglais, avec les disponibilités et un devis sur mesure.']);
  return q;
}
function charterBody(o) {
  const { y, slug, title, location, city, gallery, price, guests, description, calloutHTML, hlHTML, specsHTML, videoHTML, galHTML, brochure, enquire, faq, t, L, isFr, priceNote } = o;
  const imgs = [y.image].concat(gallery).filter(Boolean);
  const t800 = g => /^\/images\/.*\.webp$/.test(g) ? g.replace(/\.webp$/, '-800.webp') : g;
  const ft = (String(y.length || '').match(/(\d+)\s*ft/i) || [])[1];
  const chips = [[num(guests), t('guests')], [ft, t('ft')], [num(pick(y.specs, /cabin/i)), t('cabins')], [num(pick(y.specs, /crew/i)), t('crew')]].filter(c => c[0]);
  const model = y.model || (title.indexOf(' - ') > -1 ? title.split(' - ')[1] : '');
  const name = title.indexOf(' - ') > -1 ? title.split(' - ')[0].toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()).replace(/\b(Ii|Iii|Iv|Vi|Vii|Viii|Ix)\b/g, r => r.toUpperCase()) : title;
  const paras = esc(description).split(/\n\s*\n/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
  const priceShort = price.replace(/^From\s+/i, '').replace(/^À partir de\s+/, '');
  const cityEn = (y.location || '').split(',')[0].trim();
  return '<main class="lx">' +
    '<p class="lx-crumb"><a href="' + L('/') + '">' + t('Home') + '</a> · <a href="' + L('/charter') + '">' + t('Charter') + '</a>' + (city ? ' · <a href="' + L('/charter') + '?location=' + encodeURIComponent(cityEn) + '">' + esc(city) + '</a>' : '') + ' · <span class="notranslate" translate="no">' + esc(name) + '</span></p>' +
    '<div class="lx-top"><div><span class="tag yp-tag">' + t('Charter') + '</span><h1 class="lx-h1 notranslate" translate="no">' + esc(name) + (model ? ' <em>' + esc(model) + '</em>' : '') + '</h1>' +
    (location ? '<p class="lx-loc">⚲ ' + esc(location) + '</p>' : '') + '</div>' +
    (chips.length ? '<div class="lx-chips">' + chips.map(c => '<div><b>' + esc(c[0]) + '</b><span>' + c[1] + '</span></div>').join('') + '</div>' : '') + '</div>' +
    '<div class="lx-mosaic lx-n' + Math.min(imgs.length, 5) + '">' + imgs.slice(0, 5).map((g, i) => '<button class="yp-shot" data-full="' + esc(g) + '"><img src="' + esc(i ? t800(g) : g) + '" alt="' + esc(name) + ' ' + t('yacht charter') + (city ? ' ' + esc(city) : '') + ' ' + t('photo') + ' ' + (i + 1) + '"' + (i ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"') + '></button>').join('') +
    (imgs.length > 1 ? '<button class="lx-all" type="button" onclick="this.parentNode.querySelector(\'.yp-shot\').click()">' + t('All') + ' ' + imgs.length + ' ' + t('photos') + '</button>' : '') + '</div>' +
    '<div class="lx-body"><div class="lx-main">' +
    '<section class="lx-sec"><h2>' + t('About') + ' <span class="notranslate" translate="no">' + esc(name) + '</span></h2><div class="yp-desc">' + paras + '</div></section>' +
    (calloutHTML ? '<div class="lx-callout">' + calloutHTML + '</div>' : '') +
    (hlHTML ? '<section class="lx-sec lx-hl">' + hlHTML + '</section>' : '') +
    '<section class="lx-sec"><h2>' + t('Rate') + '</h2><div class="lx-grid"><div><span>' + t('From') + '</span><b>' + esc(priceShort) + '</b></div>' + (city ? '<div><span>' + t('Departs from') + '</span><b>' + esc(location) + '</b></div>' : '') + '<div><span>' + t('Rate type') + '</span><b>' + t('Preferential B2B rate') + '</b></div></div>' +
    (priceNote ? '<p class="lx-small">' + esc(priceNote) + '</p>' : '') + '</section>' +
    '<section class="lx-sec lx-faq"><h2>' + t('Questions') + '</h2>' + faq.map(([q, a]) => '<details><summary>' + esc(q) + '</summary><p>' + esc(a) + '</p></details>').join('') + '</section>' +
    '</div>' +
    '<aside class="lx-book"><p class="eyebrow">' + t('Charter rate') + '</p>' + (y.original_price ? '<p class="yp-was">' + esc(isFr ? priceFr(y.original_price) : y.original_price) + '</p>' : '') +
    '<p class="lx-price">' + esc(price) + '</p>' + (priceNote ? '<p class="yp-note">' + esc(priceNote) + '</p>' : '<p class="yp-note">' + t('Subject to availability') + '</p>') +
    '<a href="' + enquire + '" class="btn btn-gold">' + t('Check availability') + ' <i>→</i></a>' +
    '<div class="yp-wa"><a href="https://wa.me/qr/5NK5SR22CXGNC1" class="btn btn-ghost">WhatsApp ' + (isFr ? 'EAU' : 'UAE') + '</a><a href="https://wa.me/message/CVQVHBO3GXLZP1" class="btn btn-ghost">WhatsApp FR</a></div>' + brochure +
    '<ul class="lx-pts"><li>' + t('Reply within 24 hours, in English or French') + '</li><li>' + t('Payment by bank transfer or card') + '</li><li>' + t('No payment to request a quote') + '</li><li>' + t('All enquiries handled with discretion') + '</li></ul></aside>' +
    '</div></main>' +
    videoHTML + specsHTML + galHTML +
    '<section class="yp-sec"><div class="head"><div><p class="eyebrow rv">' + t('More charters') + '</p><h2 class="t-l split-words yp-h2">' + t('Similar <span class="acc">yachts</span>') + '</h2></div><a href="' + L('/charter') + '" class="btn-all rv">' + t('All charter yachts') + ' <span>→</span></a></div>' +
    '<div class="rail" data-yachts="charter" data-limit="9" data-exclude="' + esc(slug) + '"></div></section>';
}

function notFound(isFr) {
  const t = s => isFr ? fr(s) : s;
  return new Response('<!DOCTYPE html><html lang="' + (isFr ? 'fr' : 'en') + '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + (isFr ? 'Yacht introuvable' : 'Yacht not found') + ' | Yacht Research</title><meta name="robots" content="noindex">' + HEAD_ASSETS + '</head><body>' + (isFr ? NAV_FR : NAV) +
    '<section style="min-height:80vh;display:grid;place-items:center;text-align:center"><div><p class="eyebrow">404</p><h1 class="t-l" style="margin:22px 0">' + t('This listing is <span class="acc">no longer available</span>') + '</h1><a href="' + (isFr ? '/fr/listings' : '/listings') + '" class="btn btn-gold">' + t('View all yachts') + ' <i>→</i></a></div></section>' +
    (isFr ? FOOTER_FR : FOOTER) + SCRIPTS + '</body></html>', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
