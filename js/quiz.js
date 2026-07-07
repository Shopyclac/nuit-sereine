/* Lunéa Literie — Quiz "Trouver mon matelas"
   Calcule la recommandation côté client (affichage instantané) et envoie
   les données à la fonction serverless /api/quiz (contact + email via Brevo). */
(function () {
  "use strict";

  var PRODUCTS = {
    emma: {
      name: "Emma Hybride",
      type: "Matelas hybride mousse + ressorts ensachés",
      price: "dès 549 €",
      accent: "#C7A25C",
      url: "matelas.html",
      why: "Le plus polyvalent de notre sélection : il convient à presque toutes les positions et régule très bien la chaleur grâce à ses ressorts ensachés.",
      feats: ["Soutien équilibré toutes positions", "Excellente régulation thermique", "100 nuits d'essai"]
    },
    tediber: {
      name: "Tediber L'Incroyable",
      type: "Matelas mousse 3 couches, fabriqué en Europe",
      price: "dès 590 €",
      accent: "#2E4A73",
      url: "matelas.html",
      why: "Son accueil moelleux et enveloppant soulage les points de pression : idéal si vous dormez sur le côté ou aimez un couchage cosy.",
      feats: ["Accueil moelleux enveloppant", "Parfait pour le sommeil sur le côté", "Prix unique, 100 nuits d'essai"]
    },
    hypnia: {
      name: "Hypnia Bien-être Suprême",
      type: "Matelas ferme, très bon rapport qualité-prix",
      price: "dès 399 €",
      accent: "#4f9d77",
      url: "matelas.html",
      why: "Un soutien ferme et tonique au meilleur prix : le bon choix pour un dos bien maintenu sans exploser le budget.",
      feats: ["Soutien ferme, dos bien maintenu", "Meilleur rapport qualité-prix", "Essai longue durée"]
    }
  };

  function recommander(a) {
    var s = { emma: 0, tediber: 0, hypnia: 0 };
    var add = function (k, n) { s[k] += n; };
    switch (a.position) {
      case "dos": add("emma", 1); add("hypnia", 1); break;
      case "cote": add("tediber", 2); add("emma", 1); break;
      case "ventre": add("hypnia", 2); break;
      case "mixte": add("emma", 2); break;
    }
    switch (a.ressenti) {
      case "ferme": add("hypnia", 2); break;
      case "equilibre": add("emma", 2); add("tediber", 1); break;
      case "moelleux": add("tediber", 2); break;
    }
    switch (a.priorite) {
      case "dos": add("hypnia", 1); add("emma", 1); break;
      case "chaleur": add("emma", 2); break;
      case "budget": add("hypnia", 2); break;
    }
    var order = ["emma", "tediber", "hypnia"], best = order[0];
    order.forEach(function (k) { if (s[k] > s[best]) best = k; });
    return best;
  }

  function bedSVG(accent) {
    return '<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="82" cy="99" rx="66" ry="5" fill="#14233F" opacity="0.07"/>' +
      '<g transform="translate(139,19) rotate(-20)"><path d="M2.08 7.72 A8 8 0 1 0 2.08 -7.72 A8 8 0 0 1 2.08 7.72 Z" fill="#C7A25C"/></g>' +
      '<path d="M121 12 l1.1 2.8 2.8 1.1 -2.8 1.1 -1.1 2.8 -1.1 -2.8 -2.8 -1.1 2.8 -1.1 z" fill="#E3CE93"/>' +
      '<rect x="22" y="30" width="15" height="52" rx="7" fill="#14233F"/>' +
      '<rect x="22" y="72" width="118" height="13" rx="4" fill="#24365A"/>' +
      '<rect x="30" y="84" width="7" height="13" rx="2" fill="#14233F"/><rect x="126" y="84" width="7" height="13" rx="2" fill="#14233F"/>' +
      '<rect x="32" y="56" width="104" height="18" rx="8" fill="#E6DFD2"/>' +
      '<rect x="32" y="50" width="104" height="12" rx="6" fill="#FBF8F2" stroke="#E4D9C4" stroke-width="1.5"/>' +
      '<g fill="#C7A25C" opacity="0.7"><circle cx="52" cy="56" r="1.2"/><circle cx="72" cy="56" r="1.2"/><circle cx="92" cy="56" r="1.2"/><circle cx="112" cy="56" r="1.2"/></g>' +
      '<rect x="40" y="40" width="32" height="16" rx="8" fill="' + accent + '"/>' +
      '<rect x="48" y="44" width="28" height="13" rx="6" fill="#F5F0E7" stroke="#E4D9C4" stroke-width="1.5"/>' +
      '<rect x="108" y="58" width="28" height="17" rx="4" fill="#B98C43"/>' +
      '<path d="M108 66 h28" stroke="#8f6a2f" stroke-width="1.2" opacity="0.6"/></svg>';
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  var state = { position: null, ressenti: null, priorite: null };
  var stepIndex = 1;
  var steps = document.querySelectorAll(".quiz-step");
  var bar = document.getElementById("qbar");
  var count = document.getElementById("qcount");

  function show(step) {
    steps.forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-step") === String(step));
    });
    if (typeof step === "number" && step <= 4) {
      bar.style.width = (step / 4 * 100) + "%";
      count.textContent = step <= 3 ? ("Question " + step + " sur 3") : "Dernière étape";
      count.style.display = "";
    } else {
      count.style.display = "none";
      bar.style.width = "100%";
    }
    var q = document.querySelector('.quiz-step.is-active');
    if (q) { var top = q.getBoundingClientRect().top + window.pageYOffset - 90; window.scrollTo({ top: top, behavior: "smooth" }); }
  }

  // Sélection d'une option -> avance automatiquement
  document.querySelectorAll(".opt-grid").forEach(function (grid) {
    var key = grid.getAttribute("data-key");
    grid.querySelectorAll(".opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        grid.querySelectorAll(".opt").forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        state[key] = btn.getAttribute("data-val");
        stepIndex = Math.min(stepIndex + 1, 4);
        setTimeout(function () { show(stepIndex); }, 180);
      });
    });
  });

  function renderResult(key, prenom, emailOk) {
    var p = PRODUCTS[key];
    var feats = p.feats.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    var note = emailOk
      ? '<p class="result-mail">📩 On vient de vous envoyer cette recommandation par email' + (prenom ? ", " + esc(prenom) : "") + ".</p>"
      : '<p class="result-mail result-mail--warn">Votre recommandation s\'affiche ci-dessus. L\'envoi par email n\'a pas pu aboutir, réessayez plus tard.</p>';
    return '' +
      '<p class="eyebrow" style="color:var(--gold)">Votre recommandation</p>' +
      '<div class="result-card" style="--accent:' + p.accent + '">' +
        '<div class="result-illus">' + bedSVG(p.accent) + '</div>' +
        '<div class="result-body">' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<div class="pc-type">' + esc(p.type) + '</div>' +
          '<p class="result-why">' + esc(p.why) + '</p>' +
          '<ul class="pc-feat result-feat">' + feats + '</ul>' +
          '<div class="result-foot">' +
            '<div class="pc-price">' + esc(p.price) + '</div>' +
            '<a href="' + p.url + '" rel="sponsored nofollow" class="btn btn--gold">Voir ce matelas</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      note +
      '<p class="result-again"><a href="quiz.html">↺ Refaire le test</a></p>';
  }

  var form = document.getElementById("leadForm");
  var err = document.getElementById("formError");
  var submitBtn = document.getElementById("submitBtn");

  function showError(msg) { err.textContent = msg; err.hidden = false; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    var prenom = document.getElementById("prenom").value.trim();
    var email = document.getElementById("email").value.trim();
    var consent = document.getElementById("consent").checked;
    var hp = document.getElementById("website").value;

    if (hp) { return; } // bot
    if (prenom.length < 2) { return showError("Merci d'indiquer votre prénom."); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { return showError("Merci d'indiquer un email valide."); }
    if (!consent) { return showError("Merci de cocher la case de consentement pour continuer."); }
    if (!state.position || !state.ressenti || !state.priorite) { return showError("Veuillez répondre aux 3 questions."); }

    var key = recommander(state);
    var payload = {
      prenom: prenom, email: email, consent: true,
      answers: state,
      reco: { key: key, name: PRODUCTS[key].name }
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi…";

    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.ok; }).catch(function () { return false; })
      .then(function (ok) {
        document.getElementById("quizResult").innerHTML = renderResult(key, prenom, ok);
        show("result");
      });
  });
})();
