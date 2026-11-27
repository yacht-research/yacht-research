// Traductions françaises du site, écrites à la main (anglais → français).
// Clé = le texte anglais exact (avec ses balises), valeur = le texte français (mêmes balises).
// Noms de yachts, marques et noms officiels des salons restent en anglais.
import accueil from './fr-accueil.mjs';
import pages from './fr-pages.mjs';
import experiences from './fr-experiences.mjs';
import legal from './fr-legal.mjs';
export default Object.assign({}, accueil, pages, experiences, legal);
