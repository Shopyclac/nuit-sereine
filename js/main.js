/* Lunéa Literie — interactions légères, sans dépendance */
(function () {
  "use strict";

  /* Menu mobile */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* Année dynamique dans le footer */
  var y = document.querySelectorAll("[data-year]");
  var now = new Date().getFullYear();
  y.forEach(function (el) { el.textContent = now; });

  /* Révélation au scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Tri du tableau comparatif au clic d'en-tête (data-sort) */
  document.querySelectorAll("table.compare th[data-sort]").forEach(function (th) {
    th.style.cursor = "pointer";
    th.title = "Cliquer pour trier";
    th.addEventListener("click", function () {
      var table = th.closest("table");
      var tbody = table.querySelector("tbody");
      var idx = Array.prototype.indexOf.call(th.parentNode.children, th);
      var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
      var asc = th.getAttribute("data-dir") !== "asc";
      rows.sort(function (a, b) {
        var av = parseFloat(a.children[idx].getAttribute("data-val") || a.children[idx].textContent);
        var bv = parseFloat(b.children[idx].getAttribute("data-val") || b.children[idx].textContent);
        if (isNaN(av) || isNaN(bv)) {
          av = a.children[idx].textContent.trim().toLowerCase();
          bv = b.children[idx].textContent.trim().toLowerCase();
        }
        return asc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
      th.setAttribute("data-dir", asc ? "asc" : "desc");
      rows.forEach(function (r) { tbody.appendChild(r); });
    });
  });
})();

/* ---- Consentement cookies + Google Analytics (GA4) ---- */
/* GA n'est chargé qu'APRÈS acceptation (conforme CNIL : aucun dépôt de cookie avant consentement). */
(function () {
  "use strict";
  var GA_ID = "G-Y8SDP65EVG";
  var KEY = "lunea_consent"; // "granted" | "denied"

  function loadGA() {
    if (window.__luneaGA) return;
    window.__luneaGA = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  }

  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    if (v === "granted") loadGA();
  }

  function closeBanner() {
    var b = document.getElementById("cookie-banner");
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  function openBanner() {
    if (document.getElementById("cookie-banner")) return;
    var bar = document.createElement("div");
    bar.id = "cookie-banner";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Consentement aux cookies");
    bar.innerHTML =
      '<div class="cookie-inner">' +
        '<p class="cookie-text">Nous utilisons des cookies de mesure d\'audience (Google Analytics) pour améliorer le site. Vous pouvez les accepter ou les refuser. <a href="/politique-confidentialite">En savoir plus</a>.</p>' +
        '<div class="cookie-actions">' +
          '<button type="button" class="cookie-btn cookie-btn--refuse" id="cookie-refuse">Refuser</button>' +
          '<button type="button" class="cookie-btn cookie-btn--accept" id="cookie-accept">Accepter</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    document.getElementById("cookie-accept").addEventListener("click", function () { save("granted"); closeBanner(); });
    document.getElementById("cookie-refuse").addEventListener("click", function () { save("denied"); closeBanner(); });
  }

  // Rouvre le choix (bouton dans la politique de confidentialité).
  window.luneaOpenCookieSettings = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    openBanner();
  };

  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice === "granted") loadGA();
  else if (choice !== "denied") openBanner();
})();

/* ---- Cloudflare Web Analytics (cookieless, exempté de consentement) ---- */
(function () {
  "use strict";
  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", '{"token": "e25629fa41454c1fa9fe896458017716"}');
  document.head.appendChild(s);
})();
