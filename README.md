# Nuit Sereine — site d'affiliation literie

Site statique (HTML / CSS / JS, sans dépendance ni build) prêt à héberger.
Marque de démonstration : **Nuit Sereine**, comparateur literie indépendant.

## Structure

```
Nuit_Sereine_Literie/
├── index.html                       Accueil
├── matelas.html                     Catégorie pilier + tableau comparatif triable
├── oreillers.html                   Catégorie
├── sommiers.html                    Catégorie
├── a-propos.html                    Page confiance + transparence affiliation
├── mentions-legales.html            (à compléter avant mise en ligne)
├── politique-confidentialite.html   (à compléter avant mise en ligne)
├── articles/
│   ├── meilleurs-matelas-2026.html  Guide pilier
│   └── matelas-mal-de-dos.html      Guide longue traîne
├── css/style.css                    Design system complet
├── js/main.js                       Menu mobile + tri du comparatif
├── robots.txt
└── sitemap.xml
```

## Aperçu en local

Aucune installation nécessaire : ouvrez `index.html` dans un navigateur.
Pour un rendu identique à la production (chemins propres) :

```bash
# Python (déjà présent sur la plupart des machines)
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

---

## Mise en ligne : 3 options (de la plus simple à la plus pro)

### Option A — Netlify (recommandée, gratuit, en 5 min)
1. Créer un compte sur netlify.com.
2. Glisser-déposer le dossier `Nuit_Sereine_Literie` dans la zone "Deploy".
3. Le site est en ligne sur une URL `xxx.netlify.app`.
4. Brancher le domaine : Domain settings → Add custom domain → suivre les DNS.
   HTTPS (Let's Encrypt) est automatique et gratuit.

### Option B — Hostinger (cohérent avec ta stack actuelle)
1. Hébergement mutualisé + domaine chez Hostinger.
2. Gestionnaire de fichiers → dossier `public_html` → envoyer tous les fichiers.
3. Activer le SSL gratuit depuis le panneau.

### Option C — OVH / o2switch (hébergeur FR)
1. Envoyer les fichiers par FTP (FileZilla) dans `www/`.
2. Activer Let's Encrypt depuis l'espace client.

> Le site étant 100 % statique, l'hébergement coûte de 0 à quelques euros par mois et la vitesse est excellente (atout SEO).

### Avant de publier (checklist)
- [ ] Remplacer le domaine `www.nuit-sereine.fr` dans : balises `canonical`, `og:`, `sitemap.xml`, `robots.txt`.
- [ ] Compléter `mentions-legales.html` et `politique-confidentialite.html` (champs entre crochets).
- [ ] Remplacer les liens `href="#"` des boutons "Voir le prix" par les vrais liens affiliés.
- [ ] Ajouter un bandeau de consentement cookies (ex. tarteaucitron.js, gratuit et FR).
- [ ] Soumettre le `sitemap.xml` dans Google Search Console.
- [ ] Remplacer les emojis produits par de vraies photos (format WebP) pour la crédibilité.

---

## Stratégie d'affiliation literie (recommandations)

Aucun programme imposé pour l'instant : voici les plus pertinents pour ce site.

### 1. Programmes de marques DTC (les plus rentables)
Commissions généralement entre 5 et 12 % sur des paniers de 400 à 900 €.
- **Emma Matelas** — leader, panier élevé, bons supports marketing.
- **Tediber** — marque premium française, forte notoriété.
- **Hypnia** — bon taux de conversion, prix attractifs.
- **Eve, Kipli, Simba** — pour diversifier le catalogue.
Inscription via leurs régies : souvent **Awin**, **Effiliation/Kwanko** ou **TimeOne**.

### 2. Plateformes / régies (pour gérer plusieurs marques)
- **Awin** : la plus complète sur la literie en France.
- **Effiliation (Kwanko)** : nombreux annonceurs FR.
- **TimeOne** : alternative solide.
> Avantage : un seul compte, suivi unifié, paiements regroupés.

### 3. Amazon Partenaires (complément, pas socle)
- Catalogue immense (oreillers, surmatelas, accessoires).
- Cookie court (24 h) et commissions faibles (3 à 4 % sur la maison).
- Idéal pour monétiser les petits produits et les pages annexes.

### Recommandation de départ
1. Ouvrir **Awin** + **Amazon Partenaires** dès le lancement.
2. Candidater en direct chez **Emma**, **Tediber** et **Hypnia** (les 3 déjà mis en avant sur le site).
3. Mettre la priorité éditoriale sur les **matelas** (panier le plus élevé), puis sommiers, puis oreillers/accessoires.

> Note conformité : les liens affiliés sont déjà balisés `rel="sponsored nofollow"` et la transparence est affichée (bandeau + page À propos + mention dans chaque comparatif). C'est exigé par la DGCCRF et par la plupart des régies.

---

## Pistes d'évolution
- Mini-quiz interactif "Trouver mon matelas" (3 questions → reco).
- Comparateur de prix dynamique (flux marchands).
- Newsletter sommeil pour capter l'email et relancer.
- Pages longue traîne supplémentaires (matelas 160x200, matelas bébé, surmatelas, etc.).
- Passage possible sous WordPress + Flatsome si tu veux gérer le contenu sans toucher au code.
