# PortfolioForge ✦

> **AI-Powered Resume-to-Portfolio Generator** — Transform your resume into a production-ready, 3D-enhanced portfolio website instantly.

![PortfolioForge](https://img.shields.io/badge/AI-Powered-00bcd4?style=for-the-badge&logo=openai)
![License](https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🚀 Features

- **5-Step Form Wizard** — Input your resume data in a guided, structured flow
- **OpenRouter AI Enhancement** — Automatically improves your tagline, bio, project descriptions, and stats using DeepSeek / LLaMA models
- **Smart Template Fallback** — Works even without an API key via the built-in generation engine
- **Cyber Dark Navy Portfolio** — Generated portfolios match a premium dark aesthetic with:
  - `01 / SECTION NAME` numbered headers
  - Project cards with `SAAS` / category badges and `>_` terminal icons
  - CORE_MODULES grids inside project cards
  - Horizontal education timeline with circle nodes
  - `ISSUED` badge certification cards
  - "Transmission Portal" contact section
  - `CMD + K` command palette with keyboard navigation
  - Stats bar in the hero section
- **Three.js Animated Background** — Particle network with mouse-reactive camera
- **Live Preview** — Desktop / Tablet / Mobile device switcher
- **One-Click Download** — Downloads `index.html`, `styles.css`, `app.js`
- **Syntax Highlighted Code Output** — Copy any file with one click
- **Deployment Guide** — Local, GitHub Pages, Netlify, Vercel tabs

---

## 🛠️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/saisrikiran25-ctrl/portfolio.git
cd portfolio
```

### 2. Configure your API key

```bash
# Copy the example config
cp config.example.js config.js
```

Edit `config.js` and replace `YOUR_OPENROUTER_API_KEY_HERE` with your key from [openrouter.ai](https://openrouter.ai).

> **Note:** `config.js` is gitignored and will never be committed. The app works without a key using the built-in template fallback.

### 3. Open in browser

Open `index.html` with VS Code Live Server, or run:

```bash
python -m http.server 8000
# → http://localhost:8000
```

---

## 📁 File Structure

```
portfolio/
├── index.html          # Main app UI + 5-step form wizard
├── styles.css          # Cyber-Luxury design system
├── app.js              # State machine + form wizard logic
├── generator.js        # AI + portfolio code generation engine
├── scene.js            # Three.js particle background
├── config.js           # 🔒 Private API config (gitignored)
├── config.example.js   # Template — copy this to config.js
├── .gitignore
└── README.md
```

---

## ⚡ Usage

1. Open the app
2. Click **Load Demo** to pre-fill with example data, or fill in your own
3. Step through the 5-section wizard
4. Click **Forge Portfolio** on step 5
5. The AI calls OpenRouter to enhance your content
6. Review the live preview, copy files, or download all 3 files
7. Deploy using the built-in deployment guide

---

## 🌐 Deploy Your Generated Portfolio

| Platform | Speed | Cost |
|----------|-------|------|
| [Netlify](https://netlify.com) — drag & drop | ~10s | Free |
| [GitHub Pages](https://pages.github.com) | ~2 min | Free |
| [Vercel](https://vercel.com) | ~60s | Free |

---

## 🤖 AI Models Used

| Priority | Model | Provider |
|----------|-------|----------|
| Primary | `deepseek/deepseek-chat` | DeepSeek via OpenRouter |
| Fallback | `meta-llama/llama-3.1-8b-instruct:free` | Meta via OpenRouter |
| No-API | Built-in template engine | Local |

---

## 📄 License

MIT © 2026 Sai Srikiran J.
