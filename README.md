# Utility #1 — Business Day Calculator (US)

Static business day calculator:
- Add or subtract business days from a start date
- Excludes weekends
- Excludes **US federal holidays (observed)** using rule-based calculations (no APIs)

## Files
- index.html
- styles.css
- script.js

## Locked rules
- Static only (no backend)
- Vanilla HTML/CSS/JS (no frameworks, no build tools)
- Deterministic outputs only
- Includes **inactive** Google AdSense placeholders (safe by default)

## Cloudflare Pages deploy
1) Push files to GitHub repo root
2) Cloudflare Pages → Create project → Connect repo
3) Build settings:
   - Framework preset: **None**
   - Build command: **(leave blank)**
   - Output directory: **/** (root)
4) Deploy
5) Deliverable: live `.pages.dev` link

## Notes
- Holiday logic is computed from federal rules (nth weekday / last weekday / observed fixed-date shifts)
- Precomputes years (current year − 10) to (current year + 20) and auto-adds years on demand

