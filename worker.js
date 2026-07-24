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
  // Emma via Awin (awinmid 19336, awinaffid 2978923) : deep-link vers la fiche produit exacte
  "emma-original-pro": "https://www.awin1.com/cread.php?awinmid=19336&awinaffid=2978923&clickref=lunealit&ued=https%3A%2F%2Fwww.emma.fr%2Fmatelas%2Fmatelas-emma-original-pro%2F",
  "emma-original": "https://www.awin1.com/cread.php?awinmid=19336&awinaffid=2978923&clickref=lunealit&ued=https%3A%2F%2Fwww.emma.fr%2Fmatelas%2Fmatelas-emma-original%2F",
  // Deep-links fiches produits exactes (règle projet : jamais une page d'accueil).
  // Tediber : le matelas mousse « L'Incroyable » a été retiré ; on pointe le matelas Hybride actuel (fabriqué en France).
  tediber: "https://www.tediber.com/products/matelas-hybride",
  // Hypnia est devenu Slome en 2026 : deep-links pointés en direct sur slome.fr (on ne dépend plus de la redirection hypnia.fr).
  hypnia: "https://slome.fr/products/matelas-bienetre-supreme",
  kipli: "https://kipli.com/fr/product/kipli-le-matelas-100-latex-naturel",
  // Matelas latex naturel : Dunlopillo (référence Talalay) et Naturalex Blue Latex (entrée de gamme) via Amazon tagué.
  "amazon-dunlopillo": "https://www.amazon.fr/s?k=Dunlopillo+matelas+latex+naturel+7+zones&tag=lunealit-21",
  "amazon-naturalex-latex": "https://www.amazon.fr/s?k=Naturalex+Blue+Latex+matelas&tag=lunealit-21",
  // Deep-links fiches produits exactes (dormeur sur le côté). À convertir en liens Awin/programme dès adhésion.
  "hypnia-confort-premium": "https://slome.fr/products/matelas-premium",
  "tediber-hybride-premium": "https://www.tediber.com/products/matelas-hybride-premium",

  // Oreillers
  "tediber-oreiller": "https://www.tediber.com/products/oreiller",
  "emma-oreiller": "https://www.awin1.com/cread.php?awinmid=19336&awinaffid=2978923&clickref=lunealit&ued=https%3A%2F%2Fwww.emma.fr%2Foreillers%2Foreiller-emma-original-adapt-elite%2F",

  // Sommiers
  "tediber-sommier": "https://www.tediber.com/collections/sommier",
  "tediber-tapissier": "https://www.tediber.com/products/sommier",
  "emma-sommier": "https://www.awin1.com/cread.php?awinmid=19336&awinaffid=2978923&clickref=lunealit&ued=https%3A%2F%2Fwww.emma.fr%2Fsommier%2F",

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
  // Flocons de mousse mémoire de forme + gel (structure aérée, hauteur réglable) pour /oreiller-memoire-de-forme
  "or-linenspa": "https://www.amazon.fr/s?k=Linenspa+oreiller+flocons+memoire+de+forme+gel&tag=lunealit-21",
  // Oreillers cervicaux : formes de référence (papillon Elviros, vague Tempur) pour /oreiller-cervicales
  "or-elviros": "https://www.amazon.fr/s?k=Elviros+oreiller+cervical+memoire+de+forme&tag=lunealit-21",
  "or-tempur": "https://www.amazon.fr/s?k=Tempur+Original+oreiller+cervical&tag=lunealit-21",

  // Matelas pas cher : Emma Lite via Awin (deep-link fiche), matelas budget via Amazon tagué
  "emma-lite": "https://www.awin1.com/cread.php?awinmid=19336&awinaffid=2978923&clickref=lunealit&ued=https%3A%2F%2Fwww.emma.fr%2Fmatelas%2Fmatelas-emma-original-lite%2F",
  "amazon-zinus": "https://www.amazon.fr/s?k=Zinus+Green+Tea+matelas&tag=lunealit-21",
  "amazon-marckonfort": "https://www.amazon.fr/s?k=Marckonfort+Ergo+Therapy+matelas&tag=lunealit-21",
  "amazon-naturalex": "https://www.amazon.fr/s?k=Naturalex+PerfectSleep+matelas&tag=lunealit-21",
};

// Quiz « Trouver mon matelas » : mapping reco -> produit + page du site à mettre en avant.
// Les clés (emma / tediber / hypnia) correspondent à la sortie de js/quiz.js.
const QUIZ_PRODUCTS = {
  emma: { name: "Emma Original Pro", budget: "€€", slug: "emma-original-pro", page: "/matelas",
    why: "Le plus polyvalent de notre sélection : il convient à presque toutes les positions et régule bien la chaleur grâce à ses ressorts. La valeur sûre quand on hésite." },
  tediber: { name: "Tediber Hybride", budget: "€€€", slug: "tediber", page: "/matelas-dormeur-sur-le-cote",
    why: "Un accueil enveloppant posé sur un cœur de ressorts qui soulage les points de pression : idéal si vous dormez sur le côté ou aimez un couchage à la fois cosy et bien ventilé, fabriqué en France." },
  hypnia: { name: "Slome Bien-être Suprême (ex-Hypnia)", budget: "€€", slug: "hypnia", page: "/matelas-pas-cher",
    why: "Un soutien ferme et un très bon rapport qualité-prix : le bon choix pour un dos bien maintenu sans faire exploser le budget." },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 0. .well-known (security.txt…) servi directement, y compris sur l'apex,
    //    pour que la découverte de sécurité aboutisse sans passer par une redirection.
    if (url.pathname.startsWith("/.well-known/")) {
      return env.ASSETS.fetch(request);
    }

    // 1. Redirection permanente apex -> www (avec HSTS sur la réponse elle-même)
    if (url.hostname === "lunea-literie.fr") {
      url.hostname = "www.lunea-literie.fr";
      return new Response(null, {
        status: 301,
        headers: {
          "Location": url.toString(),
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        },
      });
    }

    // 2. Quiz -> Brevo (contact + email de recommandation). Clé API côté serveur uniquement.
    if (url.pathname === "/api/quiz") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      return handleQuiz(request, env);
    }

    // 3. Liens d'affiliation : /go/<slug> -> lien marchand (redirection temporaire 302)
    if (url.pathname.startsWith("/go/")) {
      const slug = url.pathname.slice(4).replace(/\/+$/, "").toLowerCase();
      const target = AFFILIATE_LINKS[slug];
      if (target) {
        ctx.waitUntil(recordClick(env, slug, request)); // comptage asynchrone, ne bloque pas la redirection
        // no-store : empêche la mise en cache edge du 302, sinon les clics répétés
        // ne repasseraient pas par le Worker et ne seraient pas comptés.
        return new Response(null, {
          status: 302,
          headers: { "Location": target, "Cache-Control": "no-store, no-cache, must-revalidate" },
        });
      }
      return new Response("Lien introuvable.", { status: 404 });
    }

    // 4. Tout le reste : service normal des fichiers statiques
    return env.ASSETS.fetch(request);
  },
};

// Enregistre un clic /go/ dans D1 (comptage affiliation, cookieless).
// Ne doit jamais faire échouer la redirection : toute erreur est avalée.
async function recordClick(env, slug, request) {
  if (!env.DB) return;
  try {
    const ref = (request.headers.get("Referer") || "").slice(0, 300) || null;
    await env.DB.prepare("INSERT INTO clicks (slug, ts, ref) VALUES (?, ?, ?)")
      .bind(slug, Date.now(), ref).run();
  } catch (e) { /* silencieux */ }
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Reçoit le résultat du quiz, ajoute/actualise le contact dans Brevo,
// puis envoie la recommandation par email transactionnel.
async function handleQuiz(request, env) {
  let body;
  try { body = await request.json(); } catch (_) { return jsonResponse({ ok: false, error: "bad_json" }, 400); }

  const prenom = (body.prenom || "").toString().trim().slice(0, 40);
  const email = (body.email || "").toString().trim().slice(0, 120);
  const consent = body.consent === true;
  const recoKey = body.reco && body.reco.key;
  const product = QUIZ_PRODUCTS[recoKey];

  // Validation stricte côté serveur
  if (prenom.length < 2) return jsonResponse({ ok: false, error: "prenom" }, 422);
  if (!EMAIL_RE.test(email)) return jsonResponse({ ok: false, error: "email" }, 422);
  if (!consent) return jsonResponse({ ok: false, error: "consent" }, 422);
  if (!product) return jsonResponse({ ok: false, error: "reco" }, 422);

  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) {
    return jsonResponse({ ok: false, error: "server_not_configured" }, 500);
  }

  const senderName = env.BREVO_SENDER_NAME || "Lunéa Literie";
  const siteUrl = (env.SITE_URL || "https://www.lunea-literie.fr").replace(/\/$/, "");
  const brevoHeaders = {
    "api-key": env.BREVO_API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  // 1) Créer / mettre à jour le contact + l'ajouter à la liste
  try {
    const contactPayload = {
      email: email,
      attributes: { PRENOM: prenom, MATELAS_RECO: product.name },
      updateEnabled: true,
    };
    if (env.BREVO_LIST_ID) contactPayload.listIds = [Number(env.BREVO_LIST_ID)];

    await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify(contactPayload),
    });
  } catch (_) { /* on continue : l'email reste prioritaire */ }

  // 2) Envoyer la recommandation par email (transactionnel)
  const goUrl = `${siteUrl}/go/${product.slug}`;   // lien d'affiliation (redirection /go/)
  const pageUrl = `${siteUrl}${product.page}`;     // page comparatif du site (contexte)
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#14233F">
      <p style="font-size:12px;letter-spacing:2px;color:#C7A25C;text-transform:uppercase;margin:0 0 6px">Lunéa Literie</p>
      <h1 style="font-size:22px;margin:0 0 12px">Votre recommandation, ${escapeHtml(prenom)}</h1>
      <p style="font-size:15px;line-height:1.6">D'après vos réponses, voici le matelas qui correspond le mieux à votre profil :</p>
      <div style="border:1px solid #E6DFD2;border-radius:12px;padding:20px;background:#FBF8F2;margin:16px 0">
        <h2 style="margin:0 0 4px;font-size:20px">${escapeHtml(product.name)}</h2>
        <p style="margin:0 0 12px;color:#6b7280;font-size:13px">Budget indicatif : ${escapeHtml(product.budget)}</p>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6">${escapeHtml(product.why)}</p>
        <a href="${goUrl}" style="display:inline-block;background:#C7A25C;color:#14233F;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:8px">Découvrir ce matelas &rarr;</a>
        <p style="margin:12px 0 0;font-size:12px;color:#6b7280">Le prix réel s'affiche en direct chez le marchand. Vous pouvez aussi <a href="${pageUrl}" style="color:#8f6a2f">comparer avec les autres modèles</a>.</p>
      </div>
      <div style="border-left:3px solid #C7A25C;padding:6px 0 6px 16px;margin:22px 0">
        <p style="margin:0;font-size:14px;line-height:1.7;font-style:italic">Un mot de la rédaction : on ne prétend pas tester chaque matelas en laboratoire. On compare les caractéristiques réelles et on croise des milliers d'avis d'acheteurs, pour vous conseiller ce qu'on suggérerait à un proche avec votre profil. Et surtout, profitez de la période d'essai : c'est votre vraie garantie.</p>
        <p style="margin:10px 0 0;font-size:13px;color:#6b7280">Bien à vous, l'équipe Lunéa Literie</p>
      </div>
      <p style="font-size:12px;color:#9ca3af;line-height:1.6">Transparence : le bouton ci-dessus est un lien affilié. Si vous achetez via ce lien, nous touchons une commission sans aucun surcoût pour vous, et cela n'influence pas nos recommandations. Vous recevez cet email car vous avez rempli le test « Trouver mon matelas » sur ${siteUrl}. Pour ne plus recevoir nos emails, <a href="mailto:${env.BREVO_SENDER_EMAIL}" style="color:#9ca3af">désinscrivez-vous ici</a>.</p>
    </div>`;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify({
        sender: { name: senderName, email: env.BREVO_SENDER_EMAIL },
        to: [{ email: email, name: prenom }],
        subject: `${prenom}, votre matelas idéal : ${product.name}`,
        htmlContent: html,
        headers: { "List-Unsubscribe": `<mailto:${env.BREVO_SENDER_EMAIL}>` },
      }),
    });
    if (!res.ok) return jsonResponse({ ok: false, error: "email_failed" }, 502);
  } catch (_) {
    return jsonResponse({ ok: false, error: "email_exception" }, 502);
  }

  return jsonResponse({ ok: true });
}
