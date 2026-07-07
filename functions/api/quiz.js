/**
 * Cloudflare Pages Function — POST /api/quiz
 * Reçoit le résultat du quiz, ajoute/actualise le contact dans Brevo
 * et envoie la recommandation par email (email transactionnel Brevo).
 *
 * La clé API Brevo n'est JAMAIS exposée au navigateur : elle vit uniquement
 * ici, côté serveur, via les variables d'environnement Cloudflare.
 *
 * Variables d'environnement à définir dans Cloudflare Pages :
 *   BREVO_API_KEY        (secret)   — clé API v3 Brevo
 *   BREVO_LIST_ID        (nombre)   — id de la liste Brevo où ajouter les contacts
 *   BREVO_SENDER_EMAIL   (texte)    — email expéditeur vérifié dans Brevo
 *   BREVO_SENDER_NAME    (texte)    — nom expéditeur (défaut : "Lunéa Literie")
 *   SITE_URL             (texte)    — ex : https://www.lunea-literie.fr
 */

const PRODUCTS = {
  emma: { name: "Emma Hybride", price: "dès 549 €", url: "/matelas.html",
    why: "Le plus polyvalent : il convient à presque toutes les positions et régule très bien la chaleur." },
  tediber: { name: "Tediber L'Incroyable", price: "dès 590 €", url: "/matelas.html",
    why: "Accueil moelleux et enveloppant : idéal pour le sommeil sur le côté et un couchage cosy." },
  hypnia: { name: "Hypnia Bien-être Suprême", price: "dès 399 €", url: "/matelas.html",
    why: "Soutien ferme au meilleur prix : parfait pour un dos bien maintenu sans exploser le budget." }
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json" }
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); } catch (_) { return json({ ok: false, error: "bad_json" }, 400); }

  const prenom = (body.prenom || "").toString().trim().slice(0, 40);
  const email = (body.email || "").toString().trim().slice(0, 120);
  const consent = body.consent === true;
  const recoKey = body.reco && body.reco.key;
  const product = PRODUCTS[recoKey];

  // Validation stricte côté serveur
  if (prenom.length < 2) return json({ ok: false, error: "prenom" }, 422);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "email" }, 422);
  if (!consent) return json({ ok: false, error: "consent" }, 422);
  if (!product) return json({ ok: false, error: "reco" }, 422);

  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) {
    return json({ ok: false, error: "server_not_configured" }, 500);
  }

  const senderName = env.BREVO_SENDER_NAME || "Lunéa Literie";
  const siteUrl = (env.SITE_URL || "https://www.lunea-literie.fr").replace(/\/$/, "");
  const brevoHeaders = {
    "api-key": env.BREVO_API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  // 1) Créer / mettre à jour le contact + l'ajouter à la liste
  try {
    const contactPayload = {
      email: email,
      attributes: { PRENOM: prenom, MATELAS_RECO: product.name },
      updateEnabled: true
    };
    if (env.BREVO_LIST_ID) contactPayload.listIds = [Number(env.BREVO_LIST_ID)];

    await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify(contactPayload)
    });
  } catch (_) { /* on continue : l'email reste prioritaire */ }

  // 2) Envoyer la recommandation par email (transactionnel)
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#14233F">
      <p style="font-size:12px;letter-spacing:2px;color:#C7A25C;text-transform:uppercase;margin:0 0 6px">Lunéa Literie</p>
      <h1 style="font-size:22px;margin:0 0 12px">Votre recommandation, ${escapeHtml(prenom)}</h1>
      <p style="font-size:15px;line-height:1.6">D'après vos réponses, le matelas le plus adapté à votre profil est :</p>
      <div style="border:1px solid #E6DFD2;border-radius:12px;padding:20px;background:#FBF8F2;margin:16px 0">
        <h2 style="margin:0 0 6px;font-size:20px">${escapeHtml(product.name)}</h2>
        <p style="margin:0 0 12px;color:#6b7280;font-size:14px">${escapeHtml(product.price)}</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">${escapeHtml(product.why)}</p>
        <a href="${siteUrl}${product.url}" style="display:inline-block;background:#C7A25C;color:#14233F;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:8px">Voir ce matelas</a>
      </div>
      <p style="font-size:13px;color:#6b7280;line-height:1.6">Vous recevez cet email car vous avez rempli le test « Trouver mon matelas » sur ${siteUrl}. Vous pouvez vous désinscrire à tout moment.</p>
    </div>`;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify({
        sender: { name: senderName, email: env.BREVO_SENDER_EMAIL },
        to: [{ email: email, name: prenom }],
        subject: `${prenom}, votre matelas idéal : ${product.name}`,
        htmlContent: html
      })
    });
    if (!res.ok) return json({ ok: false, error: "email_failed" }, 502);
  } catch (_) {
    return json({ ok: false, error: "email_exception" }, 502);
  }

  return json({ ok: true });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Bloque les autres méthodes
export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return new Response("Method Not Allowed", { status: 405 });
}
