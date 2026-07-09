/**
 * Worker Lunéa Literie.
 * Rôle unique : rediriger le domaine apex (lunea-literie.fr) vers la version
 * canonique www (www.lunea-literie.fr) en 301, puis servir les fichiers statiques.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Redirection permanente apex -> www (préserve chemin et query string)
    if (url.hostname === "lunea-literie.fr") {
      url.hostname = "www.lunea-literie.fr";
      return Response.redirect(url.toString(), 301);
    }

    // Tout le reste : service normal des fichiers statiques
    return env.ASSETS.fetch(request);
  },
};
