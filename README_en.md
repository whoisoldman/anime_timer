# Timer — diploma mini‑project (Frontend)

This README explains **methods, decisions and how to run** the project for the diploma defense.

---

## 🎯 Goals & Features
- Circular timer with progress visualization (SVG, stroke‑dashoffset).
- Buttons: **Start/Pause/Resume**, **Restart**.
- Duration input (1–99 minutes), numeric‑only.
- Alerts: *1 minute left*, *N minutes left*, *last 15 seconds* (visual highlight).
- **Preloader** with breathing logo and smooth fade‑out.
- **Bilingual UI (RU/EN)** with language toggle and `localStorage` persistence.
- **Neumorphic UI** using Tailwind + custom CSS.
- Accessibility: aria roles, readable message area.

## 🧰 Tech Stack
- **HTML5**, **CSS3** (+ TailwindCDN), **JavaScript (ES6+)**
- No bundlers required. Just open `index.html` in a browser.

## 📂 Structure
```
project-root/
├── index.html
├── style.css
├── script.js
└── mroldman_logo.png   # logo for .logo-link in card & #preloader effects
```

## 🚀 Run locally
Option 1 — directly:
1) Open `index.html` (Chrome/Edge/Safari).
2) If `file://` access is restricted, use a simple HTTP server.

Option 2 — via simple HTTP server (recommended):
```bash
# Python 3
python3 -m http.server 8000

# Node.js (if installed)
npx http-server -p 8000
```
Open `http://localhost:8000` in the browser.

## 🧩 Key decisions & methods
- **SVG progress ring**: circle with `R=45`, circumference `C=2πR`. Progress controlled via `stroke-dashoffset`.
- **Smooth timing**: remaining time derived from real wall‑clock deltas (`Date.now()`), pause tracked by `pausedAccumMs`.
- **Visual zones**: green (normal), orange (last quarter), red (≤ 15s). Red zone adds stroke blinking and overlay flash.
- **Message system**: sticky vs non‑sticky messages, localization, singular vs plural forms.
- **I18n**: `dict.ru`/`dict.en`, language toggle, button labels synced with timer state.
- **UX details**: prevent wheel changing input value on focus, filter non‑digits, autofocus minutes input.
- **Preloader**: minimal show time (3.1s), hard timeout (10s), overflow unlock, node removal after animation.
- **Neumorphism**: soft shadows, embossed logo via CSS mask + inner shadows.

## 🔒 Limitations
- Timer depends on active tab timing; background throttling may affect tick frequency.
- No Web Worker on purpose (simplicity for the defense).
- Only language preference is stored (`localStorage`).

## ✅ Defense checklist
- [ ] Start for 2 minutes; show color/animation changes; pause/resume.
- [ ] Show “N min left” and “last 15 seconds” alerts.
- [ ] Switch RU/EN; confirm persistence.
- [ ] Restart with same and new values.
- [ ] Show preloader and embossed logo.

## 🧪 Quick test
1) Enter `2` → **Start**.
2) **Pause** → **Resume**.
3) Switch language RU/EN.
4) **Restart** with same & new value.
5) Wait for red zone (≤ 15s).

## 👤 Author & License
MIT License

Copyright ©2025, [Aleksei N. Andeev (Mr.OLDMAN)](https://github.com/whoisoldman)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
