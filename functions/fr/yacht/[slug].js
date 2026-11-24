// ============================================================
// Cloudflare Pages Function : page d'un yacht en français  /fr/yacht/<slug>
// Textes du bateau : content/i18n/yachts/<slug>.json (sans ce fichier, renvoi vers la page anglaise).
// ============================================================
import { serveYacht } from '../../../lib/yacht-page.js';

export function onRequest(context) {
  return serveYacht(context, 'fr');
}
