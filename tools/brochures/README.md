# Ajouter des bateaux au site (brochure → fiche)

## Ce que Mathis fournit
Dans `Documents\Yacht Research - Brochures\1-A traiter\` :
- la **brochure PDF** (ex. `Riva 76 Perseo 2021.pdf`) ;
- de préférence, un **dossier du même nom** avec les **photos HD** (ex. dossier `Riva 76 Perseo 2021\`), au moins 1 400 px de large ;
- ou, à la place, le lien d'un dossier Google Drive partagé : on télécharge les photos dans ce dossier.

Puis il dit à Claude : « traite les nouvelles brochures ».

## Règle qualité
Une photo de moins de **1 400 px** de large ne va jamais sur le site. Les photos HD du dossier passent en premier ; celles de la brochure ne servent qu'en secours, si elles sont assez grandes. Sans aucune photo HD, la fiche est préparée mais **non publiée** (`published: false`).

## Étapes (Claude)
1. `node extract.mjs` : texte, aperçus de pages, photos de la brochure et copie des photos HD dans `_travail/<bateau>/hd/`.
2. Claude lit `texte.txt` et rédige `_travail/<bateau>/fiche.json` : description en anglais, specs, points forts, SEO, ordre des photos.
3. `node publish.mjs <dossier>` : photos converties en WebP (1600 px + vignette 800 px) dans `images/yachts/<slug>/` et fiche `content/yachts/<slug>.json`. La brochure passe dans `2-Traitees`.
4. À la racine du site : `node build.js` (index des yachts), puis `node tools/build-pages.mjs` (cartes de l'accueil).
5. Aperçu local avec `preview.cmd` ; envoi sur la branche GitHub après l'OK de Mathis ; Cloudflare publie, le sitemap se met à jour tout seul, et on demande l'indexation dans la Search Console.

## Format d'une fiche (`content/yachts/<slug>.json`)
Champs lus par le site : title, builder, model, listing_type (sale|charter), badge, image, thumb, gallery, length, year, location, price, price_note, original_price, specs { … }, highlights [ … ], description, seo_title, seo_description, brochure, published, updated.
Slug : `<chantier>-<modèle>-<année>-<lieu>`, par exemple `sunseeker-88-yacht-2022-thailand`.
