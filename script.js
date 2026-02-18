document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const modeSelect = document.getElementById("mode");
  const addMode = document.getElementById("addMode");
  const betweenMode = document.getElementById("betweenMode");
  
  const startDate = document.getElementById("startDate");
  const daysCount = document.getElementById("daysCount");
  const direction = document.getElementById("direction");
  
  const betweenStart = document.getElementById("betweenStart");
  const betweenEnd = document.getElementById("betweenEnd");
  
  const includeStart = document.getElementById("includeStart");
  
  const result = document.getElementById("result");
  const btnCalc = document.getElementById("calculate");
  const btnCopy = document.getElementById("copyBtn");

  // --- HELPER FUNCTIONS ---

  function toISO(date){
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseISO(iso){
    if(!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(date, n){
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  function isWeekend(date){
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  // Holiday Logic (Observed)
  function observedFixedHoliday(date){
    const dow = date.getDay();
    if (dow === 6) return addDays(date, -1); // Sat -> Fri
    if (dow === 0) return addDays(date, 1);  // Sun -> Mon
    return date;
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

  function federalHolidaysObserved(year){
    const holidays = [];
    holidays.push(observedFixedHoliday(new Date(year, 0, 1))); // New Year's
    holidays.push(nthWeekdayOfMonth(year, 0, 1, 3)); // MLK
    holidays.push(nthWeekdayOfMonth(year, 1, 1, 3)); // Washington
    holidays.push(lastWeekdayOfMonth(year, 4, 1)); // Memorial
    holidays.push(observedFixedHoliday(new Date(year, 5, 19))); // Juneteenth
    holidays.push(observedFixedHoliday(new Date(year, 6, 4))); // Independence
    holidays.push(nthWeekdayOfMonth(year, 8, 1, 1)); // Labor
    holidays.push(nthWeekdayOfMonth(year, 9, 1, 2)); // Columbus
    holidays.push(observedFixedHoliday(new Date(year, 10, 11))); // Veterans
    holidays.push(nthWeekdayOfMonth(year, 10, 4, 4)); // Thanksgiving
    holidays.push(observedFixedHoliday(new Date(year, 11, 25))); // Christmas
    return holidays;
  }

  // Precompute holidays
  const hmap = new Set();
  const baseYear = new Date().getFullYear();
  // Compute wide range
  for(let y = baseYear - 10; y <= baseYear + 20; y++){
    federalHolidaysObserved(y).forEach(d => hmap.add(toISO(d)));
  }

  function isBusinessDay(date){
    if (isWeekend(date)) return false;
    return !hmap.has(toISO(date));
  }

  // --- CORE LOGIC ---

  function runCalculation(){
    const mode = modeSelect.value;
    const include = includeStart.checked;
    
    if (mode === 'add') {
      const s = parseISO(startDate.value);
      const n = parseInt(daysCount.value, 10);
      const dir = direction.value; // "add" or "subtract"
      
      if(!s || isNaN(n)) {
        result.textContent = "Please enter valid dates.";
        return;
      }

      let cur = new Date(s);
      let count = 0;
      let step = (dir === 'subtract') ? -1 : 1;
      
      // If "include start date" is ON and start date itself IS a business day, count starts at 1
      if(include && isBusinessDay(cur)){
        count = 1;
      } else {
        // Otherwise, move to next day immediately effectively
        cur = addDays(cur, step);
      }

      while (count < n) {
        if (isBusinessDay(cur)) {
          count++;
        }
        if (count < n) {
          cur = addDays(cur, step);
        }
      }

      // If we landed on a non-business day (e.g. going backwards), adjust to nearest biz day?
      // Actually standard logic usually lands ON a business day.
      // But let's safe-guard: if result is weekend/holiday, logic usually implies we stepped INTO it.
      // However, the loop `while(count < n)` stops exactly when `count == n` on a biz day.
      // The only edge case is Start Date itself.
      
      // Ensure we don't end on a weekend if n=0 or weird edge case
      while(!isBusinessDay(cur) && n > 0){
         cur = addDays(cur, step);
      }

      result.textContent = `${toISO(cur)} (${cur.toLocaleDateString('en-US', {weekday:'long'})})`;
      
    } else {
      // BETWEEN mode
      let a = parseISO(betweenStart.value);
      let b = parseISO(betweenEnd.value);
      
      if(!a || !b){
        result.textContent = "Select both dates.";
        return;
      }
      
      // Swap if needed
      if(b < a) { const t = a; a = b; b = t; }

      let cur = new Date(a);
      let cnt = 0;
      
      // If NOT including start date, jump ahead 1
      if(!include){
        cur = addDays(cur, 1);
      }

      while(cur <= b){
        if(isBusinessDay(cur)){
          cnt++;
        }
        cur = addDays(cur, 1);
      }

      result.textContent = `${cnt} business days`;
    }
  }

  // --- EVENTS ---

  // Mode Switching
  modeSelect.addEventListener("change", () => {
    if(modeSelect.value === 'add'){
      addMode.style.display = 'block';
      betweenMode.style.display = 'none';
    } else {
      addMode.style.display = 'none';
      betweenMode.style.display = 'block';
    }
  });

  // Calculate
  btnCalc.addEventListener("click", runCalculation);

  // Copy
  btnCopy.addEventListener("click", () => {
    const text = result.textContent;
    if(text && text !== "—" && text !== "Select both dates." && text !== "Please enter valid dates."){
      navigator.clipboard.writeText(text).then(() => {
        const original = btnCopy.textContent;
        btnCopy.textContent = "Copied!";
        setTimeout(() => btnCopy.textContent = original, 1500);
      });
    }
  });

  // Init Defaults
  const now = new Date();
  startDate.value = toISO(now);
  betweenStart.value = toISO(now);
  betweenEnd.value = toISO(addDays(now, 7));

});
