document.addEventListener("DOMContentLoaded", () => {
  const startDate = document.getElementById("startDate");
  const daysCount = document.getElementById("daysCount");
  const direction = document.getElementById("direction");
  const result = document.getElementById("result");
  const button = document.getElementById("calculate");

  function isWeekend(date){
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  function toISO(date){
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
 function parseISO(iso){
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(date, n){
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  function nthWeekdayOfMonth(year, monthIndex, weekday, n){
    const first = new Date(year, monthIndex, 1);
    const offset = (weekday - first.getDay() + 7) % 7;
    const day = 1 + offset + (n - 1) * 7;
    return new Date(year, monthIndex, day);
  }

  function lastWeekdayOfMonth(year, monthIndex, weekday){
    const last = new Date(year, monthIndex + 1, 0);
    const offset = (last.getDay() - weekday + 7) % 7;
    return new Date(year, monthIndex, last.getDate() - offset);
  }
 function observedFixedHoliday(date){
    const dow = date.getDay();
    if (dow === 6) return addDays(date, -1); // Sat -> Fri
    if (dow === 0) return addDays(date, 1);  // Sun -> Mon
    return date;
  }

  function federalHolidaysObserved(year){
    const holidays = [];

    holidays.push({ name: "New Year's Day", date: observedFixedHoliday(new Date(year, 0, 1)) });
    holidays.push({ name: "Martin Luther King Jr. Day", date: nthWeekdayOfMonth(year, 0, 1, 3) }); // 3rd Mon Jan
    holidays.push({ name: "Washington's Birthday", date: nthWeekdayOfMonth(year, 1, 1, 3) }); // 3rd Mon Feb
    holidays.push({ name: "Memorial Day", date: lastWeekdayOfMonth(year, 4, 1) }); // last Mon May
    holidays.push({ name: "Juneteenth", date: observedFixedHoliday(new Date(year, 5, 19)) });
    holidays.push({ name: "Independence Day", date: observedFixedHoliday(new Date(year, 6, 4)) });
    holidays.push({ name: "Labor Day", date: nthWeekdayOfMonth(year, 8, 1, 1) }); // 1st Mon Sep
    holidays.push({ name: "Columbus Day", date: nthWeekdayOfMonth(year, 9, 1, 2) }); // 2nd Mon Oct
    holidays.push({ name: "Veterans Day", date: observedFixedHoliday(new Date(year, 10, 11)) });
    holidays.push({ name: "Thanksgiving Day", date: nthWeekdayOfMonth(year, 10, 4, 4) }); // 4th Thu Nov
    holidays.push({ name: "Christmas Day", date: observedFixedHoliday(new Date(year, 11, 25)) });

    return holidays;
  }
 function holidayMapForYearRange(startYear, endYear){
    const map = new Map();
    for (let y = startYear; y <= endYear; y++){
      const list = federalHolidaysObserved(y);
      for (const h of list){
        map.set(toISO(h.date), h.name);
      }
    }
    return map;
  }

  function isBusinessDay(date, hmap){
    if (isWeekend(date)) return { ok:false, reason:"Weekend" };
    const iso = toISO(date);
    const name = hmap.get(iso);
    if (name) return { ok:false, reason:`Holiday: ${name}` };
    return { ok:true, reason:"Weekday (non-holiday)" };
  }

  function ensureYearCoverage(hmap, year){
    // Hands-off: if user picks a far year, we generate it on demand.
    const jan1Observed = toISO(observedFixedHoliday(new Date(year, 0, 1)));
    if (!hmap.has(jan1Observed)){
      const list = federalHolidaysObserved(year);
      for (const h of list){
        hmap.set(toISO(h.date), h.name);
      }
    }
  }

  function addBusinessDays(start, count, dir, hmap){
    let remaining = Math.abs(count);
    const step = (dir === "subtract") ? -1 : 1;

    let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    while (remaining > 0){
      current = addDays(current, step);
      const check = isBusinessDay(current, hmap);
      if (check.ok) remaining -= 1;
    }
    return current;
  }

  // Default dates
  const today = new Date();
  startDate.value = toISO(today);

  // Precompute wide range: year-10 to year+20 (hands-off)
  const baseYear = today.getFullYear();
  const hmap = holidayMapForYearRange(baseYear - 10, baseYear + 20);

  button.addEventListener("click", () => {
    const iso = startDate.value;
    const n = Number(daysCount.value);
    const dir = direction.value;

    if (!iso){
      result.textContent = "Pick a start date.";
      return;
    }
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0){
      result.textContent = "Business days must be a whole number (0 or more).";
      return;
    }

    const start = parseISO(iso);
    ensureYearCoverage(hmap, start.getFullYear());

    const out = addBusinessDays(start, n, dir, hmap);
    ensureYearCoverage(hmap, out.getFullYear());

    const check = isBusinessDay(out, hmap);
    result.textContent = `${toISO(out)} (${check.ok ? "business day" : check.reason})`;
  });
});
