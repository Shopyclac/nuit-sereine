/* Nuit Sereine — interactions légères, sans dépendance */
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
