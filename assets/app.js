"use strict";
function toISO(d) {
                return d.toISOString().slice(0, 10);
            }
            function addDays(d, n) {
                let x = new Date(d);
                x.setDate(x.getDate() + n);
                return x;
            }
            function isWeekend(d) {
                return d.getDay() == 0 || d.getDay() == 6;
            }

            function usHolidays(year) {
                function obs(d) {
                    let x = new Date(d.getTime());
                    if (x.getDay() == 6) x = addDays(x, -1);
                    if (x.getDay() == 0) x = addDays(x, 1);
                    return x;
                }
                let h = [];
                // New Year's Day - also check if Jan 1 falls on Saturday (observed Dec 31 prev year)
                let ny = obs(new Date(year, 0, 1));
                h.push(ny);
                // If Jan 1 is Saturday, observed is Dec 31 of previous year - add that too
                if (new Date(year, 0, 1).getDay() == 6)
                    h.push(new Date(year - 1, 11, 31));
                h.push(
                    new Date(
                        year,
                        0,
                        15 + ((1 - new Date(year, 0, 15).getDay() + 7) % 7),
                    ),
                ); // MLK Day
                h.push(
                    new Date(
                        year,
                        1,
                        15 + ((1 - new Date(year, 1, 15).getDay() + 7) % 7),
                    ),
                ); // Presidents Day
                h.push(
                    new Date(
                        year,
                        4,
                        31 - ((new Date(year, 4, 31).getDay() + 6) % 7),
                    ),
                ); // Memorial Day (last Mon May)
                if (year >= 2021) h.push(obs(new Date(year, 5, 19))); // Juneteenth
                h.push(obs(new Date(year, 6, 4))); // Independence Day
                h.push(
                    new Date(
                        year,
                        8,
                        1 + ((1 - new Date(year, 8, 1).getDay() + 7) % 7),
                    ),
                ); // Labor Day
                h.push(
                    new Date(
                        year,
                        9,
                        8 + ((1 - new Date(year, 9, 8).getDay() + 7) % 7),
                    ),
                ); // Columbus Day (2nd Mon Oct)
                h.push(obs(new Date(year, 10, 11))); // Veterans Day
                h.push(
                    new Date(
                        year,
                        10,
                        22 + ((4 - new Date(year, 10, 22).getDay() + 7) % 7),
                    ),
                ); // Thanksgiving
                h.push(obs(new Date(year, 11, 25))); // Christmas
                return h.map(toISO);
            }

            function buildHolidaySet(startDate, endDate) {
                // Generate holidays for every year in the range + buffer years
                let hol = new Set();
                let startYear = startDate.getFullYear() - 1;
                let endYear = endDate.getFullYear() + 1;
                for (let y = startYear; y <= endYear; y++) {
                    usHolidays(y).forEach((d) => hol.add(d));
                }
                return hol;
            }

            function calculate() {
                let include = document.getElementById("includeStart").checked;
                let custom = new Set(
                    document
                        .getElementById("customHolidays")
                        .value.split("\n")
                        .map((x) => x.trim())
                        .filter((x) => x),
                );

                // Determine date range for holiday generation
                let mode = document.getElementById("mode").value;
                let rangeStart, rangeEnd;
                if (mode == "add") {
                    rangeStart = new Date(
                        document.getElementById("startDate").value,
                    );
                    let n =
                        parseInt(
                            document.getElementById("daysToAdd").value,
                            10,
                        ) || 0;
                    rangeEnd = addDays(rangeStart, Math.max(n * 2, 365)); // buffer
                } else {
                    rangeStart = new Date(
                        document.getElementById("betweenStart").value,
                    );
                    rangeEnd = new Date(
                        document.getElementById("betweenEnd").value,
                    );
                }

                let hol = buildHolidaySet(rangeStart, rangeEnd);
                function isBiz(d) {
                    return (
                        !isWeekend(d) &&
                        !hol.has(toISO(d)) &&
                        !custom.has(toISO(d))
                    );
                }
                let out = "";
                if (mode === "add") {
                    let s = new Date(
                        document.getElementById("startDate").value,
                    );
                    let n = parseInt(
                        document.getElementById("daysToAdd").value,
                        10,
                    );
                    let cur = new Date(s);
                    let count = 0;
                    if (include && isBiz(cur)) count = 1;
                    else cur = addDays(cur, 1);
                    while (count < n) {
                        if (isBiz(cur)) count++;
                        if (count < n) cur = addDays(cur, 1);
                    }
                    while (!isBiz(cur)) cur = addDays(cur, 1);
                    out = "Result date: " + toISO(cur);
                } else {
                    let a = new Date(
                        document.getElementById("betweenStart").value,
                    );
                    let b = new Date(
                        document.getElementById("betweenEnd").value,
                    );
                    if (b < a) {
                        let t = a;
                        a = b;
                        b = t;
                    }
                    let cur = new Date(a);
                    if (!include) cur = addDays(cur, 1);
                    let cnt = 0;
                    while (cur <= b) {
                        if (isBiz(cur)) cnt++;
                        cur = addDays(cur, 1);
                    }
                    out = "Business days between: " + cnt;
                }
                document.getElementById("result").innerText = out;
            }

            function copyResult() {
                navigator.clipboard.writeText(
                    document.getElementById("result").innerText,
                );
            }

            document.getElementById("mode").addEventListener("change", (e) => {
                document.getElementById("addMode").style.display =
                    e.target.value == "add" ? "block" : "none";
                document.getElementById("betweenMode").style.display =
                    e.target.value == "between" ? "block" : "none";
            });

            document.getElementById("year").textContent =
                new Date().getFullYear();
