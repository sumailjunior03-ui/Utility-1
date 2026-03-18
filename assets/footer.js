"use strict";
/* footer.js — framework footer renderer (framework requirement).
   Depends on: assets/network.js (window.renderRelatedTools).
   Related Tools cluster driven dynamically — no hardcoded links in HTML.
   calc-hq.com hub link is rendered in the footer Resources area, outside the Related Tools cluster. */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // renderRelatedTools is called by network.js after forbidden domains load.
    // footer.js initialises any additional footer state here if needed.
    var yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  });
})();
