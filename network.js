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

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const containers = document.querySelectorAll(".network-links");
    if (!containers.length) return;
    const currentDomain = window.location.hostname.replace("www.", "");
    containers.forEach(function (container) {
      const sites = window.CALC_HQ_NETWORK.filter(function (site) {
        try {
          const u = new URL(site.url);
          const host = u.hostname.replace("www.", "");
          if (host === "calc-hq.com") return false;
          return site.live && host !== currentDomain;
        } catch (e) {
          return false;
        }
      });
      if (!sites.length) return;
      let html = "<strong>Related Tools:</strong> ";
      html += sites.map(function (site) {
        return '<a href="' + site.url + '" target="_blank" rel="noopener">' + site.name + '</a>';
      }).join(" &nbsp;•&nbsp; ");
      container.innerHTML = html;
    });
  });
})();
