// assets/network.js — single source of truth for footer interlinks (ZERO-TOLERANCE)
// Loads /assets/forbidden-domains.json and excludes those domains from related tools cluster.
// Related tools must be rendered ONLY from this file. Current site excluded. Hub excluded.
(function () {
  "use strict";

  window.CALC_HQ_NETWORK = [
    { name: "Calc-HQ",                     url: "https://calc-hq.com",              live: true },
    { name: "BizDayChecker.com",           url: "https://bizdaychecker.com",        live: true },
    { name: "BankCutoffChecker.com",       url: "https://bankcutoffchecker.com",    live: true },
    { name: "SalaryVsInflation.com",       url: "https://salaryvsinflation.com",    live: true },
    { name: "Hourly2SalaryCalc.com",       url: "https://hourly2salarycalc.com",    live: true },
    { name: "PayrollDateChecker.com",      url: "https://payrolldatechecker.com",   live: true },
    { name: "1099vsW2Calc.com",            url: "https://1099vsw2calc.com",         live: true },
    { name: "FreelanceIncomeCalc.com",     url: "https://freelanceincomecalc.com",  live: true },
    { name: "QuarterlyTaxCalc.com",        url: "https://quarterlytaxcalc.com",     live: true },
    { name: "TotalCompCalc.com",           url: "https://totalcompcalc.com",        live: true },
    { name: "OvertimePayCalc.com",         url: "https://overtimepaycalc.com",      live: true },
    { name: "AfterTaxSalaryCalc.com",      url: "https://aftertaxsalarycalc.com",   live: true }
  ];

  var FORBIDDEN = [];

  function getCurrentDomain() {
    return window.location.hostname.replace(/^www\./, "").toLowerCase();
  }

  function renderRelatedTools() {
    var containers = document.querySelectorAll(".network-links");
    if (!containers.length) return;
    var currentDomain = getCurrentDomain();

    var sites = window.CALC_HQ_NETWORK.filter(function (site) {
      if (!site || site.live !== true) return false;
      try {
        var host = new URL(site.url).hostname.replace(/^www\./, "").toLowerCase();
        if (host === "calc-hq.com") return false;
        if (host === currentDomain) return false;
        if (FORBIDDEN.indexOf(host) !== -1) return false;
        return true;
      } catch (e) {
        return false;
      }
    });

    containers.forEach(function (container) {
      if (!sites.length) { container.innerHTML = ""; return; }
      var html = "<strong>Related Tools:</strong> ";
      html += sites.map(function (site) {
        return '<a href="' + site.url + '" target="_blank" rel="noopener">' + site.name + '</a>';
      }).join(" &nbsp;&bull;&nbsp; ");
      container.innerHTML = html;
    });
  }

  function loadForbiddenThenRender() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/assets/forbidden-domains.json", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var parsed = JSON.parse(xhr.responseText);
            if (Array.isArray(parsed)) {
              FORBIDDEN = parsed.map(function (d) { return String(d).toLowerCase().replace(/^www\./, ""); });
            }
          } catch (e) { /* proceed with empty list */ }
        }
        renderRelatedTools();
      }
    };
    xhr.onerror = function () { renderRelatedTools(); };
    xhr.send();
  }

  window.renderRelatedTools = renderRelatedTools;

  document.addEventListener("DOMContentLoaded", function () {
    loadForbiddenThenRender();
  });
})();
