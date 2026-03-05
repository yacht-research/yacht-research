# 🛥 Yacht Research — Guide de mise en ligne complet

## Structure du projet

```
yacht-research/
├── index.html              ← Ton site web
├── admin/
│   ├── index.html          ← Panneau d'administration CMS
│   └── config.yml          ← Configuration CMS (champs éditables)
├── content/
│   ├── hero.json           ← Textes de la page d'accueil
│   ├── why.json            ← Section "Pourquoi nous"
│   ├── about.json          ← Section À propos
│   ├── contact.json        ← Coordonnées
│   └── yachts/
│       └── *.json          ← Un fichier par yacht à vendre
├── images/uploads/         ← Tes photos (uploadées via le CMS)
├── build.js                ← Script de build automatique
├── netlify.toml            ← Configuration Netlify
└── package.json
```

---

## ÉTAPE 1 — Créer un compte GitHub (gratuit)

1. Va sur **github.com** → Sign up
2. Crée un nouveau repository nommé `yacht-research`
3. Upload tous les fichiers de ce dossier dans le repository

---

## ÉTAPE 2 — Déployer sur Netlify (gratuit)

1. Va sur **netlify.com** → Sign up avec ton compte GitHub
2. Clique **"Add new site"** → **"Import an existing project"**
3. Connecte ton repository GitHub `yacht-research`
4. Paramètres de build :
   - **Build command** : `node build.js`
   - **Publish directory** : `.`
5. Clique **"Deploy site"**
6. Ton site sera en ligne sur une URL type `random-name.netlify.app`

---

## ÉTAPE 3 — Connecter ton domaine (yachtresearch.com)

### Acheter le domaine sur Cloudflare (~9€/an)
1. Va sur **cloudflare.com/products/registrar**
2. Recherche `yachtresearch.com`
3. Achète-le (SSL, protection WHOIS et DDoS inclus gratuitement)

### Connecter à Netlify
1. Dans Netlify → **Domain settings** → **Add custom domain**
2. Entre `yachtresearch.com`
3. Netlify te donnera des **nameservers** à copier
4. Dans Cloudflare → ton domaine → **DNS** → colle les nameservers Netlify
5. Attends 5-10 min → ton site est en ligne sur ton domaine ! ✅

---

## ÉTAPE 4 — Activer le panneau admin CMS

1. Dans Netlify → **Integrations** → **Netlify Identity** → **Enable**
2. Puis **Git Gateway** → **Enable**
3. Va sur `ton-site.com/admin`
4. Crée ton compte administrateur
5. Tu peux maintenant modifier tout le site visuellement ! ✅

---

## ÉTAPE 5 — Connecter les formulaires à Google Sheets

1. Va sur **script.google.com**
2. Nouveau projet → nomme-le "Yacht Research Forms"
3. Colle le contenu du fichier `google-apps-script.js`
4. Remplace `YOUR_EMAIL_HERE` par ton adresse email
5. **Déployer** → Nouveau déploiement :
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
6. Copie l'URL (format : `https://script.google.com/macros/s/.../exec`)
7. Dans `index.html`, ligne ~1748, remplace :
   ```
   const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
   par ton URL copiée
8. Push les changements sur GitHub → Netlify redéploie automatiquement ✅

---

## UTILISER LE PANNEAU ADMIN

Accède à `ton-site.com/admin` pour :

| Section | Ce que tu peux modifier |
|---------|------------------------|
| 🏠 Hero | Titre, sous-titre, image de fond, boutons |
| ⭐ Pourquoi nous | Textes, photo, statistique |
| ⛵ Yachts | Ajouter/supprimer/modifier des annonces |
| 🏢 À propos | Textes, photo, présences internationales |
| 💎 Bespoke | Textes et 4 services |
| 💰 Referral | Textes et 3 étapes |
| 📞 Contact | Email, téléphone, adresses |
| 🔍 SEO | Titre et description Google |

### Ajouter un nouveau yacht à vendre :
1. Admin → "Yachts à vendre" → "New Yacht"
2. Remplis : nom, badge, photo, longueur, année, lieu, prix
3. **Publish** → le yacht apparaît automatiquement sur le site

---

## COÛTS TOTAUX

| Service | Coût |
|---------|------|
| Domaine Cloudflare (.com) | ~9€/an |
| Hébergement Netlify | **Gratuit** |
| CMS Netlify | **Gratuit** |
| Google Sheets + Apps Script | **Gratuit** |
| SSL / Sécurité | **Gratuit** |
| **TOTAL** | **~9€/an** |

---

*Yacht Research | The Art of Effortless Yachting 🛥*
