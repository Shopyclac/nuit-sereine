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

  // Amazon Partenaires (tag lunealit-21) : pour les produits réellement vendus sur Amazon.
  amazon: "https://www.amazon.fr?&linkCode=ll2&tag=lunealit-21&linkId=c775bbf627eab067b84c13f5b2ee81c9&ref_=as_li_ss_tl",
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
