// ============================================================
// Cloudflare Pages Function : page d'un yacht  /yacht/<slug>
// Lit content/yachts/<slug>.json et rend la page au design du site (rendu commun : lib/yacht-page.js).
// ============================================================
import { serveYacht } from '../../lib/yacht-page.js';

export function onRequest(context) {
  return serveYacht(context, 'en');
}
