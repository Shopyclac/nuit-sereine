/**
 * Worker Lunéa Literie.
 * 1. Redirige le domaine apex (lunea-literie.fr) vers la version www en 301.
 * 2. Gère les liens d'affiliation via /go/<slug> (table centrale ci-dessous).
 * 3. Sert les fichiers statiques pour tout le reste.
 *
 * Pour changer un lien affilié : modifier AFFILIATE_LINKS puis `npx wrangler deploy`.
 * Toutes les pages pointant vers /go/<slug> sont mises à jour d'un coup.
 * Voir la doc : Affiliation/Programmes_Affiliation.md
 */

const AFFILIATE_LINKS = {
  // Matelas : destinations = sites officiels des marques (prix réel visible en direct).
  // À remplacer par les liens affiliés une fois les programmes marques rejoints.
  emma: "https://www.emma.fr/matelas/",
  tediber: "https://www.tediber.com/",
  hypnia: "https://www.hypnia.fr/",
  kipli: "https://kipli.com/fr/product-category/matelas/",

  // Oreillers
  wopilo: "https://wopilo.com/products/wopilo-plus",
  "tediber-oreiller": "https://www.tediber.com/products/oreiller",
  "emma-oreiller": "https://www.emma.fr/",

  // Sommiers
  "tediber-sommier": "https://www.tediber.com/collections/sommier",
  "tediber-tapissier": "https://www.tediber.com/products/sommier",
  "emma-sommier": "https://www.emma.fr/",

  // Amazon Partenaires (tag lunealit-21) : pour les produits réellement vendus sur Amazon.
  amazon: "https://www.amazon.fr?&linkCode=ll2&tag=lunealit-21&linkId=c775bbf627eab067b84c13f5b2ee81c9&ref_=as_li_ss_tl",

  // Accessoires literie : recherches Amazon ciblées avec le tag (créditent la commission).
  "amazon-surmatelas": "https://www.amazon.fr/s?k=surmatelas+memoire+de+forme&tag=lunealit-21",
  "amazon-protege-matelas": "https://www.amazon.fr/s?k=protege+matelas+impermeable+respirant&tag=lunealit-21",
  "amazon-alese": "https://www.amazon.fr/s?k=alese+impermeable+matelas&tag=lunealit-21",
  "amazon-couette": "https://www.amazon.fr/s?k=couette+4+saisons&tag=lunealit-21",
  "amazon-oreiller": "https://www.amazon.fr/s?k=oreiller+memoire+de+forme&tag=lunealit-21",

  // --- Accessoires : produits Amazon ciblés par marque + modèle (recherches taguées, remplaçables par liens SiteStripe exacts) ---
  // Surmatelas
  "sm-bedstory": "https://www.amazon.fr/s?k=BedStory+surmatelas+memoire+de+forme&tag=lunealit-21",
  "sm-novilla": "https://www.amazon.fr/s?k=Novilla+surmatelas+memoire+de+forme&tag=lunealit-21",
  "sm-dailydream": "https://www.amazon.fr/s?k=Dailydream+surmatelas&tag=lunealit-21",
  // Protège-matelas
  "pm-utopia": "https://www.amazon.fr/s?k=Utopia+Bedding+protege+matelas+impermeable&tag=lunealit-21",
  "pm-dodo": "https://www.amazon.fr/s?k=Dodo+protege+matelas+impermeable+tencel&tag=lunealit-21",
  "pm-blumtal": "https://www.amazon.fr/s?k=Blumtal+protege+matelas+impermeable&tag=lunealit-21",
  // Alèse imperméable
  "al-dodo": "https://www.amazon.fr/s?k=Dodo+alese+impermeable&tag=lunealit-21",
  "al-utopia": "https://www.amazon.fr/s?k=Utopia+Bedding+alese+impermeable&tag=lunealit-21",
  "al-bambou": "https://www.amazon.fr/s?k=alese+bambou+impermeable&tag=lunealit-21",
  // Couette
  "co-dodo": "https://www.amazon.fr/s?k=Dodo+couette+4+saisons&tag=lunealit-21",
  "co-abeil": "https://www.amazon.fr/s?k=Abeil+couette+4+saisons&tag=lunealit-21",
  "co-amazonbasics": "https://www.amazon.fr/s?k=Amazon+Basics+couette&tag=lunealit-21",
  // Oreiller mémoire de forme
  "or-zenpur": "https://www.amazon.fr/s?k=ZenPur+oreiller+memoire+de+forme&tag=lunealit-21",
  "or-newentor": "https://www.amazon.fr/s?k=Newentor+oreiller+ergonomique+memoire+de+forme&tag=lunealit-21",
  "or-recci": "https://www.amazon.fr/s?k=Recci+oreiller+memoire+de+forme&tag=lunealit-21",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Redirection permanente apex -> www (préserve chemin et query string)
    if (url.hostname === "lunea-literie.fr") {
      url.hostname = "www.lunea-literie.fr";
      return Response.redirect(url.toString(), 301);
    }

    // 2. Liens d'affiliation : /go/<slug> -> lien marchand (redirection temporaire 302)
    if (url.pathname.startsWith("/go/")) {
      const slug = url.pathname.slice(4).replace(/\/+$/, "").toLowerCase();
      const target = AFFILIATE_LINKS[slug];
      if (target) {
        return Response.redirect(target, 302);
      }
      return new Response("Lien introuvable.", { status: 404 });
    }

    // 3. Tout le reste : service normal des fichiers statiques
    return env.ASSETS.fetch(request);
  },
};
