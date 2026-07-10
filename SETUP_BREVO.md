# Configuration du quiz « Trouver mon matelas » + Brevo

Le quiz est composé de :
- `quiz.html` — la page (3 questions + formulaire prénom/email + résultat instantané)
- `js/quiz.js` — la logique (calcul de la reco + envoi au serveur)
- **`worker.js` → route `POST /api/quiz`** — le code serveur qui parle à Brevo (clé API côté serveur)

> **Architecture** : ce site est déployé comme **Worker Cloudflare** (`wrangler deploy`), pas comme Pages.
> La logique Brevo vit donc dans `worker.js` (fonction `handleQuiz`). L'ancien `functions/api/quiz.js`
> (convention Pages, jamais exécutée par un Worker) a été supprimé pour éviter toute confusion.

Le navigateur ne voit **jamais** la clé API : elle est stockée uniquement dans les variables
d'environnement du Worker. C'est ce qui rend l'ensemble sécurisé.

---

## 1. Récupérer les infos Brevo

Dans ton compte Brevo :
1. **Clé API** : *SMTP & API → API Keys → Create a new API key*. Copie la clé (commence par `xkeysib-`).
2. **Liste de contacts** : *Contacts → Lists*. Crée (ou choisis) une liste, note son **ID** (un nombre).
3. **Expéditeur vérifié** : *Senders, Domains & Dedicated IPs → Senders*. Vérifie l'adresse email
   qui enverra la reco (ex. `contact@lunea-literie.fr`).

> Astuce : pour une bonne délivrabilité, authentifie ton domaine (SPF/DKIM) dans Brevo.

---

## 2. Déclarer les variables dans le Worker Cloudflare

Dans le dashboard Cloudflare → **Workers & Pages → `projet-literie` → Settings → Variables and Secrets**,
ajoute :

| Variable | Type | Exemple |
|---|---|---|
| `BREVO_API_KEY` | **Secret** (Encrypt) | `xkeysib-…` |
| `BREVO_LIST_ID` | Texte | `3` |
| `BREVO_SENDER_EMAIL` | Texte | `contact@lunea-literie.fr` |
| `BREVO_SENDER_NAME` | Texte | `Lunéa Literie` |
| `SITE_URL` | Texte | `https://www.lunea-literie.fr` |

Puis **redéploie** le site pour que les variables soient prises en compte.

---

## 3. Ce que fait la fonction à chaque soumission

1. Valide les données (prénom, email, consentement obligatoire) côté serveur.
2. **Ajoute / met à jour le contact** dans Brevo avec les attributs :
   - `PRENOM` (le prénom saisi)
   - `MATELAS_RECO` (le matelas recommandé)
   - et l'ajoute à la liste `BREVO_LIST_ID`.
3. **Envoie un email transactionnel** avec la recommandation personnalisée.

> Pense à créer les attributs de contact `PRENOM` (déjà standard) et `MATELAS_RECO`
> dans Brevo (*Contacts → Settings → Contact attributes*) si tu veux les exploiter dans tes scénarios.

---

## 4. Tester en local (optionnel)

```bash
npm i -g wrangler
# créer un fichier .dev.vars (NE PAS le committer) avec les variables ci-dessus
wrangler pages dev .
# puis ouvrir http://localhost:8788/quiz.html
```

`.dev.vars` (exemple) :
```
BREVO_API_KEY=xkeysib-xxxxx
BREVO_LIST_ID=3
BREVO_SENDER_EMAIL=contact@lunea-literie.fr
BREVO_SENDER_NAME=Lunéa Literie
SITE_URL=https://www.lunea-literie.fr
```

> `.dev.vars` est déjà à ignorer dans Git (ajoute-le au `.gitignore` s'il n'y est pas).

---

## 5. Personnaliser

- **Les 3 questions et le mapping** : dans `js/quiz.js` (objet `PRODUCTS` + fonction `recommander`).
- **Le contenu de l'email** : dans `functions/api/quiz.js` (variable `html`).
- **Les liens « Voir ce matelas »** : remplace `url: "/matelas.html"` par tes **liens affiliés** réels
  (dans `js/quiz.js` pour l'affichage et `functions/api/quiz.js` pour l'email).
