# Brochures → fiches bateaux (Yacht Research)

## Dossiers
```
Documents\Yacht Research - Brochures\
├── 1-A traiter\   ← déposer ici les PDF (ou images : riva-76_1.jpg, riva-76_2.jpg…)
├── 2-Traitees\    ← la brochure y est déplacée une fois la fiche créée
└── _travail\<bateau>\  texte.txt, pages\, photos\, planche.jpg, fiche.json (brouillon)
```

## Étapes
1. `node extract.mjs` : texte + aperçu des pages + photos HD, avec une planche-contact via `node contact-sheet.mjs <dossier>`.
2. Claude lit `texte.txt` et la planche, puis rédige `fiche.json` (format ci-dessous) : description en anglais, specs, points forts, SEO, choix et ordre des photos.
3. `node publish.mjs <dossier>` : photos en WebP 1600 px + 800 px dans `images/yachts/<slug>/` et fiche dans `content/yachts/<slug>.json`.
4. `preview.cmd` : aperçu local sur http://127.0.0.1:8790/yacht/<slug>
5. Après validation de Mathis : commit et push sur GitHub. Cloudflare Pages déploie, le sitemap se met à jour tout seul, puis on demande l'indexation dans la Search Console.

## Format d'une fiche (`content/yachts/<slug>.json`)
Champs historiques (toujours lus par le site) : title, badge, image, gallery, length, year, location, price, original_price, description, brochure, published.
Nouveaux champs (optionnels) : slug, builder, model, listing_type (sale|charter), price_note, thumb,
specs { "Beam": "6.48 m", … } (affiché en tableau + Schema.org), highlights [ … ], seo_title, seo_description, updated.
Slug : `<chantier>-<modèle>-<année>-<lieu>`, par exemple `sunseeker-88-yacht-2022-thailand`.
