/**
 * generator.js — AI-Powered Portfolio Code Generation Engine
 * PortfolioForge
 *
 * Pipeline:
 *   1. Call OpenRouter API to AI-enhance the resume data
 *   2. If API fails → fall back to direct template generation
 *   3. Generate production-ready HTML + CSS + JS in the
 *      "Cyber Dark Navy" aesthetic (as seen in reference screenshots)
 */

(function GeneratorModule() {
  'use strict';

  /* ══════════════════════════════════════════════════════
     OPENROUTER CONFIG
  ══════════════════════════════════════════════════════ */
  // API key is loaded from config.js (see config.js — NOT committed to git)
  // Set window.OPENROUTER_API_KEY in config.js before this script loads.
  const OR_CONFIG = {
    endpoint : 'https://openrouter.ai/api/v1/chat/completions',
    apiKey   : (typeof window !== 'undefined' && window.OPENROUTER_API_KEY) || '',
    model    : 'deepseek/deepseek-chat',           // free-tier friendly
    fallback : 'meta-llama/llama-3.1-8b-instruct:free',
    maxTokens: 2048,
    referer  : 'https://portfolioforge.dev',
    title    : 'PortfolioForge',
  };

  /* ══════════════════════════════════════════════════════
     MAIN ENTRY — called by app.js
  ══════════════════════════════════════════════════════ */
  async function generatePortfolio(rawData, onProgress) {
    onProgress && onProgress('ai', 'Calling AI enhancement engine...');

    let enhanced = rawData;

    try {
      enhanced = await enhanceWithAI(rawData, onProgress);
      onProgress && onProgress('ai_done', 'AI enhancement complete ✓');
    } catch (err) {
      console.warn('[PortfolioForge] OpenRouter API error — falling back to template generation:', err.message);
      onProgress && onProgress('ai_fallback', 'AI unavailable — using smart template fallback ✓');
    }

    onProgress && onProgress('html', 'Generating HTML structure...');
    const html = generateHTML(enhanced);

    onProgress && onProgress('css', 'Crafting CSS design system...');
    const css  = generateCSS(enhanced);

    onProgress && onProgress('js', 'Building interactive JS...');
    const js   = generateJS(enhanced);

    onProgress && onProgress('done', 'Portfolio ready!');

    return { html, css, js, aiUsed: enhanced !== rawData };
  }

  /* ══════════════════════════════════════════════════════
     OPENROUTER AI ENHANCEMENT
  ══════════════════════════════════════════════════════ */
  async function enhanceWithAI(data, onProgress) {
    const prompt = buildAIPrompt(data);

    const tryModel = async (model) => {
      const res = await fetch(OR_CONFIG.endpoint, {
        method : 'POST',
        headers: {
          'Authorization': `Bearer ${OR_CONFIG.apiKey}`,
          'Content-Type' : 'application/json',
          'HTTP-Referer' : OR_CONFIG.referer,
          'X-Title'      : OR_CONFIG.title,
        },
        body: JSON.stringify({
          model,
          max_tokens      : OR_CONFIG.maxTokens,
          temperature     : 0.7,
          messages: [
            {
              role   : 'system',
              content: 'You are an elite portfolio copywriter for tech professionals. Return ONLY valid JSON, no markdown, no explanation.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 200)}`);
      }
      return res.json();
    };

    // Try primary model, then fallback model
    let response;
    try {
      response = await tryModel(OR_CONFIG.model);
    } catch (primaryErr) {
      console.warn('[PortfolioForge] Primary model failed, trying fallback:', primaryErr.message);
      onProgress && onProgress('ai_retry', 'Retrying with fallback model...');
      response = await tryModel(OR_CONFIG.fallback);
    }

    const raw = response?.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty AI response');

    // Extract JSON safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in AI response');

    const aiData = JSON.parse(jsonMatch[0]);
    return mergeAIData(data, aiData);
  }

  function buildAIPrompt(data) {
    const expSummary = (data.experience || [])
      .map(e => `${e.role} at ${e.company} (${e.dates}): ${e.description || ''}`)
      .join('\n');
    const projSummary = (data.projects || [])
      .map(p => `${p.name}: ${p.desc || ''}`)
      .join('\n');

    return `You are enhancing a portfolio for a professional. Based on the raw data below, produce IMPROVED versions of each field. Return ONLY a JSON object with these exact keys.

RAW DATA:
Name: ${data.name}
Title: ${data.title}
Tagline: ${data.tagline || ''}
Bio: ${data.bio || ''}
Skills Languages: ${data.skillsLanguages || ''}
Skills Frameworks: ${data.skillsFrameworks || ''}
Skills Tools: ${data.skillsTools || ''}
Experience:
${expSummary}
Projects:
${projSummary}

Return this JSON structure (all fields are strings or arrays of strings):
{
  "enhancedTagline": "a punchy, memorable 1-sentence professional tagline",
  "enhancedBio": "a 2-3 sentence compelling professional summary",
  "heroStats": [
    {"label": "short stat label", "value": "stat number or text"},
    {"label": "short stat label", "value": "stat number or text"},
    {"label": "short stat label", "value": "stat number or text"},
    {"label": "short stat label", "value": "stat number or text"}
  ],
  "enhancedProjectDescs": ["improved description for project 1", "improved description for project 2"],
  "keySkillTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "professionalSummary": "one punchy sentence for the contact section"
}`;
  }

  function mergeAIData(original, ai) {
    const merged = { ...original };
    if (ai.enhancedTagline)    merged.tagline        = ai.enhancedTagline;
    if (ai.enhancedBio)        merged.bio            = ai.enhancedBio;
    if (ai.heroStats)          merged.heroStats      = ai.heroStats;
    if (ai.keySkillTags)       merged.keySkillTags   = ai.keySkillTags;
    if (ai.professionalSummary)merged.proSummary     = ai.professionalSummary;

    if (ai.enhancedProjectDescs && merged.projects) {
      merged.projects = merged.projects.map((p, i) => ({
        ...p,
        desc: ai.enhancedProjectDescs[i] || p.desc,
      }));
    }
    return merged;
  }

  /* ══════════════════════════════════════════════════════
     HTML GENERATION  (Cyber Dark Navy style)
  ══════════════════════════════════════════════════════ */
  function generateHTML(d) {
    const initials = getInitials(d.name);
    const skillTags = getSkillTags(d);
    const stats     = getHeroStats(d);
    const sectionIndex = { exp: 1, proj: 1, skills: 2, edu: 4, certs: 5, contact: 6 };

    // Build section numbers dynamically
    let secNum = 0;
    const nextSec = () => String(++secNum).padStart(2, '0');

    const projNum  = nextSec();
    const skillNum = nextSec();
    const expNum   = d.experience && d.experience.length > 0 ? nextSec() : null;
    const eduNum   = (d.eduDegree || d.eduSchool) ? nextSec() : null;
    const certNum  = d.certifications && d.certifications.length > 0 ? nextSec() : null;
    const conNum   = nextSec();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${xe(d.bio ? d.bio.substring(0,155) : d.name + ' — Professional Portfolio')}" />
  <meta name="author" content="${xe(d.name)}" />
  <meta property="og:title" content="${xe(d.name)} — ${xe(d.title)}" />
  <title>${xe(d.name)} — ${xe(d.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

  <!-- ░░ NAVIGATION ░░ -->
  <nav class="nav" id="nav" role="navigation" aria-label="Primary navigation">
    <div class="nav-inner">
      <a href="#hero" class="nav-logo" aria-label="Home">${initials}<span class="nav-logo-dot">.</span></a>
      <ul class="nav-links" id="nav-links" role="list">
        ${d.projects   && d.projects.length   > 0 ? `<li><a href="#projects"   class="nav-link">Projects</a></li>` : ''}
        ${d.experience && d.experience.length > 0 ? `<li><a href="#experience" class="nav-link">Experience</a></li>` : ''}
        ${d.skillsLanguages || d.skillsFrameworks ? `<li><a href="#skills"     class="nav-link">Skills</a></li>` : ''}
        ${d.eduDegree || d.eduSchool              ? `<li><a href="#education"  class="nav-link">Education</a></li>` : ''}
        <li><a href="#contact" class="nav-link">Contact</a></li>
      </ul>
      <a href="#contact" class="nav-cta" aria-label="Contact ${xe(d.name)}">CONTACT</a>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <main id="main">

    <!-- ░░ HERO ░░ -->
    <section class="hero" id="hero" aria-labelledby="hero-name">
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-eyebrow" aria-label="Professional role">${xe(d.title || 'Software Engineer')}</div>
          <h1 class="hero-name" id="hero-name">
            ${xe(d.name)}<span class="hero-dot" aria-hidden="true">.</span>
          </h1>
          ${d.tagline ? `<p class="hero-tagline">${xe(d.tagline)}</p>` : ''}
          <div class="hero-actions">
            <a href="#projects" class="btn btn-primary">NAVIGATE <span aria-hidden="true">›</span></a>
            <a href="#contact"  class="btn btn-ghost">CONTACT</a>
          </div>
          ${skillTags.length > 0 ? `
          <div class="hero-tags" role="list" aria-label="Key technologies">
            ${skillTags.slice(0,8).map(t => `<span class="hero-tag" role="listitem">${xe(t)}</span>`).join('\n            ')}
          </div>` : ''}
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="hero-avatar">
            <div class="hero-avatar-ring"></div>
            <div class="hero-avatar-inner">
              <span class="hero-avatar-initials">${xe(initials)}</span>
            </div>
          </div>
        </div>
      </div>
      ${stats.length > 0 ? `
      <div class="hero-stats" role="list" aria-label="Key statistics">
        ${stats.map(s => `
        <div class="hero-stat" role="listitem">
          <span class="hero-stat-icon" aria-hidden="true">${s.icon}</span>
          <span class="hero-stat-label">${xe(s.label)}</span>
          <span class="hero-stat-value">${xe(s.value)}</span>
        </div>`).join('')}
      </div>` : ''}
    </section>

    ${buildProjectsSection(d, projNum)}
    ${buildSkillsSection(d, skillNum)}
    ${d.experience && d.experience.length > 0 ? buildExperienceSection(d, expNum) : ''}
    ${d.eduDegree  || d.eduSchool            ? buildEducationSection(d, eduNum)   : ''}
    ${d.certifications && d.certifications.length > 0 ? buildCertsSection(d, certNum) : ''}
    ${buildContactSection(d, conNum)}

  </main>

  <!-- ░░ FOOTER ░░ -->
  <footer class="footer" role="contentinfo">
    <div class="footer-inner">
      <p>© ${new Date().getFullYear()} ${xe(d.name).toUpperCase()}. ALL RIGHTS RESERVED.</p>
    </div>
  </footer>

  <!-- ░░ CMD+K WIDGET ░░ -->
  <div class="cmdk-widget" id="cmdk-widget" role="complementary" aria-label="Keyboard shortcut">
    <span aria-hidden="true">&gt;_</span> CMD + K
  </div>

  <!-- ░░ CMD+K PALETTE ░░ -->
  <div class="cmdk-palette hidden" id="cmdk-palette" role="dialog" aria-modal="true" aria-label="Command palette">
    <div class="cmdk-inner">
      <input type="text" class="cmdk-input" id="cmdk-input" placeholder="Type a command..." aria-label="Search commands" />
      <ul class="cmdk-list" id="cmdk-list" role="listbox"></ul>
    </div>
  </div>

  <script src="app.js"><\/script>
</body>
</html>`;
  }

  /* ── Projects ─────────────────────────────────────────────────── */
  function buildProjectsSection(d, num) {
    if (!d.projects || d.projects.length === 0) return '';
    const cards = d.projects.map((p, i) => `
        <article class="proj-card reveal" style="animation-delay:${i*0.08}s" aria-labelledby="proj-${i}-name">
          <header class="proj-card-header">
            <div class="proj-badge">${p.category || 'PROJECT'}</div>
            <span class="proj-terminal" aria-hidden="true">&gt;_</span>
          </header>
          <h3 class="proj-name" id="proj-${i}-name">${xe(p.name)}</h3>
          <p class="proj-desc">${xe(p.desc || '')}</p>
          ${p.modules && p.modules.length > 0 ? `
          <div class="proj-modules" aria-label="Core modules">
            <div class="proj-modules-header">
              <span class="proj-modules-icon" aria-hidden="true">✦</span>
              <span class="proj-modules-title">CORE_MODULES</span>
            </div>
            <div class="proj-modules-grid">
              ${p.modules.map(m => `<div class="proj-module-item">■ ${xe(m)}</div>`).join('')}
            </div>
          </div>` : ''}
          ${p.tech ? `
          <div class="proj-tech" aria-label="Technologies">
            ${p.tech.split(',').map(t=>t.trim()).filter(Boolean).map(t=>`<span class="proj-tech-tag">${xe(t)}</span>`).join('')}
          </div>` : ''}
          ${p.url || p.github ? `
          <a href="${xe(p.url || p.github)}" target="_blank" rel="noopener noreferrer" class="proj-visit-btn" aria-label="Visit ${xe(p.name)}">
            VISIT <span aria-hidden="true">↗</span>
          </a>` : ''}
        </article>`).join('');

    return `
    <!-- ░░ PROJECTS ░░ -->
    <section class="section projects" id="projects" aria-labelledby="projects-title">
      <div class="container">
        <h2 class="section-title" id="projects-title">
          <span class="section-num">${num}</span> / PROJECTS
        </h2>
        <div class="proj-grid" role="list">
          ${cards}
        </div>
      </div>
    </section>`;
  }

  /* ── Skills ───────────────────────────────────────────────────── */
  function buildSkillsSection(d, num) {
    const groups = [
      { label: 'Languages',             items: parseList(d.skillsLanguages) },
      { label: 'Frameworks & Libraries',items: parseList(d.skillsFrameworks) },
      { label: 'Tools & Platforms',     items: parseList(d.skillsTools) },
      { label: 'Other',                 items: parseList(d.skillsOther) },
    ].filter(g => g.items.length > 0);

    if (groups.length === 0) return '';

    return `
    <!-- ░░ SKILLS ░░ -->
    <section class="section skills" id="skills" aria-labelledby="skills-title">
      <div class="container">
        <h2 class="section-title" id="skills-title">
          <span class="section-num">${num}</span> / SKILLS &amp; TOOLS
        </h2>
        <div class="skills-grid">
          ${groups.map(g => `
          <div class="skill-group reveal">
            <h3 class="skill-group-label">${xe(g.label)}</h3>
            <div class="skill-chips" role="list" aria-label="${xe(g.label)}">
              ${g.items.map(item => `<span class="skill-chip" role="listitem">${xe(item)}</span>`).join('')}
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  /* ── Experience ───────────────────────────────────────────────── */
  function buildExperienceSection(d, num) {
    const items = d.experience.map((e, i) => `
          <article class="exp-item reveal" style="animation-delay:${i*0.1}s" aria-labelledby="exp-${i}-role">
            <header class="exp-header">
              <div>
                <h3 class="exp-role" id="exp-${i}-role">${xe(e.role || '')}</h3>
                <div class="exp-company-row">
                  <span class="exp-company">${xe(e.company || '')}</span>
                  ${e.location ? `<span class="exp-sep" aria-hidden="true">·</span><span class="exp-location">${xe(e.location)}</span>` : ''}
                </div>
              </div>
              ${e.dates ? `<time class="exp-dates">${xe(e.dates)}</time>` : ''}
            </header>
            ${e.description ? `<p class="exp-desc">${xe(e.description)}</p>` : ''}
            ${e.highlights && e.highlights.filter(Boolean).length > 0 ? `
            <ul class="exp-highlights" role="list">
              ${e.highlights.filter(Boolean).map(h => `<li>${xe(h)}</li>`).join('')}
            </ul>` : ''}
            ${e.tech ? `
            <div class="exp-tech">
              ${e.tech.split(',').map(t=>t.trim()).filter(Boolean).map(t=>`<span class="proj-tech-tag">${xe(t)}</span>`).join('')}
            </div>` : ''}
          </article>`).join('');

    return `
    <!-- ░░ EXPERIENCE ░░ -->
    <section class="section experience" id="experience" aria-labelledby="exp-title">
      <div class="container">
        <h2 class="section-title" id="exp-title">
          <span class="section-num">${num}</span> / EXPERIENCE
        </h2>
        <div class="exp-list">
          ${items}
        </div>
      </div>
    </section>`;
  }

  /* ── Education (horizontal timeline) ─────────────────────────── */
  function buildEducationSection(d, num) {
    const eduItems = d.educationItems && d.educationItems.length > 0
      ? d.educationItems
      : [{
          school   : d.eduSchool  || '',
          degree   : d.eduDegree  || '',
          dates    : d.eduYear    || '',
          highlights: d.eduGpa ? [d.eduGpa] : [],
        }];

    const cards = eduItems.map((item, i) => `
          <div class="edu-card reveal" style="animation-delay:${i*0.1}s" role="listitem" aria-label="${xe(item.school || item.degree)}">
            ${item.dates ? `<div class="edu-dates">${xe(item.dates)}</div>` : ''}
            <h3 class="edu-school">${xe(item.school || '')}</h3>
            ${item.degree ? `<p class="edu-degree">${xe(item.degree)}</p>` : ''}
            ${item.highlights && item.highlights.filter(Boolean).length > 0 ? `
            <ul class="edu-highlights">
              ${item.highlights.filter(Boolean).map(h => `<li>› ${xe(h)}</li>`).join('')}
            </ul>` : ''}
          </div>`).join('');

    return `
    <!-- ░░ EDUCATION ░░ -->
    <section class="section education" id="education" aria-labelledby="edu-title">
      <div class="container">
        <h2 class="section-title" id="edu-title">
          <span class="section-num">${num}</span> / EDUCATION &amp; ORIGINS
        </h2>
        <div class="edu-timeline" role="list" aria-label="Education timeline">
          <div class="edu-timeline-line" aria-hidden="true">
            ${eduItems.map(() => `<div class="edu-timeline-node" aria-hidden="true"></div>`).join('')}
          </div>
          <div class="edu-cards">
            ${cards}
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ── Certifications ───────────────────────────────────────────── */
  function buildCertsSection(d, num) {
    if (!d.certifications || d.certifications.length === 0) return '';
    const cards = d.certifications.map((c, i) => `
          <article class="cert-card reveal" style="animation-delay:${i*0.1}s" aria-labelledby="cert-${i}-name">
            <header class="cert-header">
              ${c.issued ? `<span class="cert-issued">ISSUED ${xe(c.issued).toUpperCase()}</span>` : ''}
              <span class="cert-icon" aria-hidden="true">🏅</span>
            </header>
            <h3 class="cert-name" id="cert-${i}-name">${xe(c.name)}</h3>
            ${c.issuer ? `<p class="cert-issuer">${xe(c.issuer)}</p>` : ''}
            ${c.url ? `
            <a href="${xe(c.url)}" target="_blank" rel="noopener noreferrer" class="proj-visit-btn" aria-label="View ${xe(c.name)} certificate">
              VISIT <span aria-hidden="true">↗</span>
            </a>` : ''}
          </article>`).join('');

    return `
    <!-- ░░ CERTIFICATIONS ░░ -->
    <section class="section certs" id="certifications" aria-labelledby="certs-title">
      <div class="container">
        <h2 class="section-title" id="certs-title">
          <span class="section-num">${num}</span> / CERTIFICATIONS
        </h2>
        <div class="certs-grid" role="list">
          ${cards}
        </div>
      </div>
    </section>`;
  }

  /* ── Contact ──────────────────────────────────────────────────── */
  function buildContactSection(d, num) {
    const summary = d.proSummary || `Ready to deploy high-performance solutions? Connect with me via the channels below.`;

    return `
    <!-- ░░ CONTACT ░░ -->
    <section class="section contact" id="contact" aria-labelledby="contact-title">
      <div class="container">
        <div class="contact-box reveal">
          <div class="contact-icon-wrap" aria-hidden="true">
            <span class="contact-icon">✉</span>
          </div>
          <h2 class="contact-title" id="contact-title">Transmission Portal</h2>
          <p class="contact-sub">${xe(summary)}</p>
          <div class="contact-actions">
            ${d.email    ? `<a href="mailto:${xe(d.email)}"    class="contact-btn contact-btn-white"  aria-label="Send email"><span aria-hidden="true">✉</span> Email</a>` : ''}
            ${d.linkedin ? `<a href="${xe(d.linkedin)}" target="_blank" rel="noopener noreferrer" class="contact-btn contact-btn-cyan"  aria-label="LinkedIn"><span aria-hidden="true">in</span> LinkedIn</a>` : ''}
            ${d.github   ? `<a href="${xe(d.github)}"   target="_blank" rel="noopener noreferrer" class="contact-btn contact-btn-dark"  aria-label="GitHub"><span aria-hidden="true">⌥</span> GitHub</a>` : ''}
            ${d.twitter  ? `<a href="${xe(d.twitter)}"  target="_blank" rel="noopener noreferrer" class="contact-btn contact-btn-dark"  aria-label="Twitter/X"><span aria-hidden="true">𝕏</span> Twitter</a>` : ''}
          </div>
          ${d.phone ? `<p class="contact-phone">PHONE: ${xe(d.phone)}</p>` : ''}
        </div>
      </div>
    </section>`;
  }

  /* ══════════════════════════════════════════════════════
     CSS GENERATION  (Cyber Dark Navy)
  ══════════════════════════════════════════════════════ */
  function generateCSS(d) {
    const accent    = d.accentColor || '#00bcd4';
    const accentRgb = hexToRgb(accent) || { r: 0, g: 188, b: 212 };

    return `/* ============================================================
   ${xe(d.name)} — Portfolio Stylesheet
   Generated by PortfolioForge · Theme: Cyber Dark Navy
   ============================================================ */

/* ── Variables ───────────────────────────────── */
:root {
  --bg:       #0a1628;
  --bg-alt:   #0d1e35;
  --surface:  #0f2040;
  --card:     #0b1a2e;
  --card-alt: #0e2138;
  --border:   rgba(0,188,212,0.12);
  --border-md:rgba(0,188,212,0.2);
  --text:     #e8f0fe;
  --text-sub: #7a9bbf;
  --text-dim: #3a5a7a;
  --accent:   ${accent};
  --accent-r: ${accentRgb.r};
  --accent-g: ${accentRgb.g};
  --accent-b: ${accentRgb.b};
  --accent-dim:rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.1);
  --accent-glow:rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.25);
  --font-body: 'Inter',    system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --nav-h:     68px;
  --max-w:     1180px;
  --ease:      cubic-bezier(0.16,1,0.3,1);
}

/* ── Reset ───────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:var(--font-body);background:var(--bg);color:var(--text);overflow-x:hidden;line-height:1.6}
a{color:inherit;text-decoration:none}
ul{list-style:none}
img{max-width:100%;display:block}
button{cursor:pointer;font-family:inherit;border:none;background:none}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.3);border-radius:3px}
::selection{background:rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.25)}

/* ── Layout ──────────────────────────────────── */
.container{max-width:var(--max-w);margin:0 auto;padding:0 2rem}
.section{padding:6rem 0;border-top:1px solid var(--border)}

/* ── Section Titles ──────────────────────────── */
.section-title{
  font-family:var(--font-mono);
  font-size:clamp(0.85rem,2vw,1rem);
  font-weight:700;
  letter-spacing:0.15em;
  text-transform:uppercase;
  color:var(--accent);
  margin-bottom:3.5rem;
  display:flex;
  align-items:center;
  gap:1rem;
}
.section-title::after{
  content:'';
  flex:1;
  height:1px;
  background:var(--border);
}
.section-num{opacity:0.6}

/* ── Navigation ──────────────────────────────── */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  height:var(--nav-h);
  background:rgba(10,22,40,0.9);
  backdrop-filter:blur(20px) saturate(160%);
  border-bottom:1px solid var(--border);
  transition:background .3s;
}
.nav.scrolled{background:rgba(10,22,40,0.98)}
.nav-inner{
  max-width:var(--max-w);margin:0 auto;
  height:100%;padding:0 2rem;
  display:flex;align-items:center;justify-content:space-between;
  gap:2rem;
}
.nav-logo{
  font-family:var(--font-mono);font-size:1.2rem;font-weight:700;
  color:var(--text);letter-spacing:-0.03em;
}
.nav-logo-dot{color:var(--accent)}
.nav-links{display:flex;align-items:center;gap:0.25rem}
.nav-link{
  padding:6px 14px;border-radius:6px;
  font-family:var(--font-mono);font-size:0.75rem;font-weight:500;
  letter-spacing:0.06em;text-transform:uppercase;
  color:var(--text-sub);
  transition:all .2s;
}
.nav-link:hover,.nav-link.active{color:var(--accent);background:var(--accent-dim)}
.nav-cta{
  font-family:var(--font-mono);font-size:0.72rem;font-weight:700;
  letter-spacing:0.12em;text-transform:uppercase;
  color:var(--text-sub);
  padding:8px 16px;border-radius:6px;border:1px solid var(--border-md);
  transition:all .25s;
}
.nav-cta:hover{color:var(--accent);border-color:var(--accent)}
.nav-hamburger{display:none;flex-direction:column;gap:5px;width:26px;padding:4px}
.nav-hamburger span{display:block;width:100%;height:2px;background:var(--text);border-radius:2px;transition:all .3s}
.nav-hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
.nav-hamburger.open span:nth-child(2){opacity:0}
.nav-hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}

/* ── Buttons ─────────────────────────────────── */
.btn{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--font-mono);font-size:0.78rem;font-weight:700;
  letter-spacing:0.12em;text-transform:uppercase;
  padding:11px 24px;border-radius:6px;
  cursor:pointer;border:none;
  transition:all .25s var(--ease);
  white-space:nowrap;
}
.btn-primary{
  background:var(--accent);color:#0a1628;
  box-shadow:0 4px 20px rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.3);
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.5)}
.btn-ghost{
  background:transparent;color:var(--text);
  border:1px solid rgba(255,255,255,0.15);
}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}

/* ── Reveal Animation ────────────────────────── */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .65s var(--ease),transform .65s var(--ease)}
.reveal.visible{opacity:1;transform:translateY(0)}

/* ── HERO ─────────────────────────────────────── */
.hero{
  min-height:100vh;display:flex;flex-direction:column;
  padding:calc(var(--nav-h) + 5rem) 0 0;
  position:relative;overflow:hidden;
}
.hero::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 80% 50% at 60% 30%, rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.06) 0%, transparent 70%);
  pointer-events:none;
}
.hero-inner{
  max-width:var(--max-w);margin:0 auto;width:100%;padding:0 2rem;
  display:grid;grid-template-columns:1fr auto;
  align-items:center;gap:4rem;flex:1;
  padding-bottom:3rem;
}
.hero-eyebrow{
  font-family:var(--font-mono);font-size:0.82rem;
  color:var(--text-sub);letter-spacing:0.06em;
  margin-bottom:1.25rem;
}
.hero-name{
  font-size:clamp(3rem,8vw,6.5rem);font-weight:900;
  letter-spacing:-0.04em;line-height:0.92;
  color:var(--text);margin-bottom:1.25rem;
  font-family:'Inter',sans-serif;
}
.hero-dot{color:var(--accent)}
.hero-tagline{
  font-size:clamp(1rem,2vw,1.2rem);color:var(--text-sub);
  max-width:500px;line-height:1.65;margin-bottom:2.5rem;font-weight:400;
}
.hero-actions{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:2.5rem}
.hero-tags{display:flex;flex-wrap:wrap;gap:8px}
.hero-tag{
  font-family:var(--font-mono);font-size:0.68rem;font-weight:600;
  letter-spacing:0.1em;text-transform:uppercase;
  padding:5px 12px;border-radius:4px;
  border:1px solid var(--border-md);
  color:var(--text-sub);
  transition:all .2s;
}
.hero-tag:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}

/* Hero Avatar */
.hero-visual{display:flex;align-items:center;justify-content:center}
.hero-avatar{position:relative;width:200px;height:200px}
.hero-avatar-ring{
  position:absolute;inset:-8px;border-radius:50%;
  border:2px solid var(--accent);
  box-shadow:0 0 30px rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.25);
  animation:ring-spin 8s linear infinite;
}
@keyframes ring-spin{to{transform:rotate(360deg)}}
.hero-avatar-inner{
  width:100%;height:100%;border-radius:50%;
  background:var(--surface);
  display:flex;align-items:center;justify-content:center;
  border:1px solid var(--border-md);
  overflow:hidden;
}
.hero-avatar-initials{
  font-size:3rem;font-weight:900;
  background:linear-gradient(135deg,var(--accent),rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.5));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  letter-spacing:-0.05em;
}

/* Hero Stats Bar */
.hero-stats{
  max-width:var(--max-w);margin:0 auto;width:100%;
  padding:1.75rem 2rem;
  display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
  border-top:1px solid var(--border);
  gap:1px;
  background:var(--border);
}
.hero-stat{
  background:var(--bg);
  padding:1.25rem 1.75rem;
  display:flex;flex-direction:column;gap:4px;
}
.hero-stat-icon{
  font-size:0.8rem;color:var(--text-dim);
  font-family:var(--font-mono);margin-bottom:2px;
}
.hero-stat-label{
  font-family:var(--font-mono);font-size:0.62rem;
  letter-spacing:0.12em;text-transform:uppercase;
  color:var(--text-dim);
}
.hero-stat-value{
  font-size:2rem;font-weight:900;color:var(--text);
  letter-spacing:-0.04em;line-height:1;
}

/* ── PROJECTS ─────────────────────────────────── */
.proj-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(380px,1fr));
  gap:1.5rem;
}
.proj-card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:10px;padding:1.75rem;
  transition:all .3s var(--ease);
  display:flex;flex-direction:column;gap:1rem;
}
.proj-card:hover{
  border-color:var(--border-md);
  transform:translateY(-4px);
  box-shadow:0 16px 40px rgba(0,0,0,0.4),0 0 40px rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.05);
}
.proj-card-header{display:flex;justify-content:space-between;align-items:center}
.proj-badge{
  font-family:var(--font-mono);font-size:0.62rem;font-weight:700;
  letter-spacing:0.15em;text-transform:uppercase;
  color:var(--accent);background:var(--accent-dim);
  padding:3px 10px;border-radius:4px;
  border:1px solid rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.2);
}
.proj-terminal{
  font-family:var(--font-mono);font-size:0.78rem;
  color:var(--text-dim);
}
.proj-name{font-size:1.3rem;font-weight:700;color:var(--text);letter-spacing:-0.02em}
.proj-desc{font-size:0.875rem;color:var(--text-sub);line-height:1.7}
.proj-modules{
  background:var(--bg);border:1px solid var(--border);
  border-radius:6px;padding:1rem;
}
.proj-modules-header{
  display:flex;align-items:center;gap:8px;
  font-family:var(--font-mono);font-size:0.62rem;
  color:var(--text-dim);letter-spacing:0.12em;
  text-transform:uppercase;margin-bottom:0.75rem;
}
.proj-modules-icon{color:var(--accent);font-size:0.7rem}
.proj-modules-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.proj-module-item{
  font-family:var(--font-mono);font-size:0.72rem;
  color:var(--accent);
}
.proj-module-item::before{content:'■ ';opacity:0.6}
.proj-tech{display:flex;flex-wrap:wrap;gap:6px}
.proj-tech-tag{
  font-family:var(--font-mono);font-size:0.68rem;font-weight:500;
  padding:3px 10px;border-radius:4px;
  border:1px solid var(--border-md);color:var(--text-sub);
}
.proj-visit-btn{
  display:flex;align-items:center;justify-content:center;gap:8px;
  padding:10px;border-radius:6px;
  border:1px solid var(--border-md);
  font-family:var(--font-mono);font-size:0.72rem;
  font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
  color:var(--text-sub);
  transition:all .25s;margin-top:auto;
}
.proj-visit-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}

/* ── SKILLS ───────────────────────────────────── */
.skills-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:2rem}
.skill-group{
  background:var(--card);border:1px solid var(--border);
  border-radius:10px;padding:1.5rem;
}
.skill-group-label{
  font-family:var(--font-mono);font-size:0.65rem;font-weight:700;
  letter-spacing:0.15em;text-transform:uppercase;
  color:var(--text-dim);margin-bottom:1rem;
}
.skill-chips{display:flex;flex-wrap:wrap;gap:8px}
.skill-chip{
  font-family:var(--font-mono);font-size:0.72rem;font-weight:500;
  padding:5px 12px;border-radius:4px;
  border:1px solid var(--border);color:var(--text-sub);
  background:var(--bg);
  transition:all .2s;cursor:default;
}
.skill-chip:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}

/* ── EXPERIENCE ───────────────────────────────── */
.exp-list{display:flex;flex-direction:column;gap:2rem}
.exp-item{
  background:var(--card);border:1px solid var(--border);
  border-radius:10px;padding:2rem;
  transition:border-color .3s;
}
.exp-item:hover{border-color:var(--border-md)}
.exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.75rem}
.exp-role{font-size:1.2rem;font-weight:700;color:var(--text);margin-bottom:4px;letter-spacing:-0.02em}
.exp-company-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.exp-company{font-size:0.9rem;font-weight:600;color:var(--accent)}
.exp-sep{color:var(--text-dim)}
.exp-location{font-size:0.82rem;color:var(--text-sub)}
.exp-dates{
  font-family:var(--font-mono);font-size:0.72rem;
  color:var(--text-dim);background:var(--bg);
  border:1px solid var(--border);padding:4px 12px;border-radius:4px;
  white-space:nowrap;
}
.exp-desc{font-size:0.9rem;color:var(--text-sub);line-height:1.7;margin-bottom:1rem}
.exp-highlights{padding-left:1rem;margin-bottom:1rem}
.exp-highlights li{
  font-size:0.875rem;color:var(--text-sub);line-height:1.7;
  margin-bottom:4px;list-style:disc;
}
.exp-highlights li::marker{color:var(--accent)}
.exp-tech{display:flex;flex-wrap:wrap;gap:6px}

/* ── EDUCATION ────────────────────────────────── */
.edu-timeline{position:relative}
.edu-timeline-line{
  display:flex;align-items:center;
  padding:0 1rem;margin-bottom:2rem;
  position:relative;
}
.edu-timeline-line::before{
  content:'';position:absolute;left:0;right:0;top:50%;
  height:1px;background:var(--border-md);
}
.edu-timeline-node{
  width:12px;height:12px;border-radius:50%;
  background:var(--bg);border:2px solid var(--accent);
  box-shadow:0 0 12px rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.4);
  flex:1;position:relative;z-index:1;
  margin:0 auto;
}
.edu-cards{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
  gap:1.25rem;
}
.edu-card{
  background:var(--card);border:1px solid var(--border);
  border-radius:8px;padding:1.5rem;
  transition:border-color .3s;
}
.edu-card:hover{border-color:var(--border-md)}
.edu-dates{
  font-family:var(--font-mono);font-size:0.65rem;font-weight:700;
  color:var(--accent);letter-spacing:0.1em;
  background:var(--accent-dim);border:1px solid rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.2);
  padding:3px 8px;border-radius:4px;
  display:inline-block;margin-bottom:.85rem;
}
.edu-school{font-size:1rem;font-weight:700;color:var(--text);margin-bottom:.35rem;letter-spacing:-0.01em}
.edu-degree{font-size:0.8rem;color:var(--text-sub);margin-bottom:.75rem}
.edu-highlights{padding-left:.75rem}
.edu-highlights li{
  font-family:var(--font-mono);font-size:0.7rem;
  color:var(--text-dim);line-height:1.6;margin-bottom:3px;
}

/* ── CERTIFICATIONS ───────────────────────────── */
.certs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.5rem}
.cert-card{
  background:var(--card);border:1px solid var(--border);
  border-radius:10px;padding:1.75rem;
  display:flex;flex-direction:column;gap:.85rem;
  transition:all .3s;
}
.cert-card:hover{border-color:var(--border-md);transform:translateY(-3px)}
.cert-header{display:flex;justify-content:space-between;align-items:center}
.cert-issued{
  font-family:var(--font-mono);font-size:0.62rem;font-weight:700;
  color:var(--accent);background:var(--accent-dim);
  border:1px solid rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.2);
  padding:3px 10px;border-radius:4px;letter-spacing:0.08em;
}
.cert-icon{font-size:1.4rem}
.cert-name{font-size:1.15rem;font-weight:700;color:var(--text);letter-spacing:-0.02em}
.cert-issuer{font-size:0.82rem;color:var(--text-sub)}

/* ── CONTACT ──────────────────────────────────── */
.contact{border-top:1px solid var(--border)}
.contact-box{
  max-width:680px;margin:0 auto;
  background:var(--card);border:1px solid var(--border-md);
  border-radius:16px;padding:4rem 3rem;
  text-align:center;
}
.contact-icon-wrap{
  width:56px;height:56px;border-radius:50%;
  background:var(--accent-dim);border:1px solid var(--border-md);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 1.75rem;font-size:1.3rem;
}
.contact-icon{color:var(--accent)}
.contact-title{
  font-size:2rem;font-weight:800;color:var(--text);
  letter-spacing:-0.03em;margin-bottom:1rem;
}
.contact-sub{font-size:0.95rem;color:var(--text-sub);line-height:1.7;margin-bottom:2rem}
.contact-actions{display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem}
.contact-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:11px 24px;border-radius:8px;
  font-family:var(--font-body);font-size:0.875rem;font-weight:600;
  cursor:pointer;transition:all .25s;white-space:nowrap;
}
.contact-btn-white{background:#fff;color:#0a1628}
.contact-btn-white:hover{background:#e8f0fe;transform:translateY(-2px)}
.contact-btn-cyan{background:var(--accent);color:#0a1628}
.contact-btn-cyan:hover{box-shadow:0 8px 24px rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.4);transform:translateY(-2px)}
.contact-btn-dark{background:var(--surface);color:var(--text);border:1px solid var(--border-md)}
.contact-btn-dark:hover{border-color:var(--accent);color:var(--accent);transform:translateY(-2px)}
.contact-phone{
  font-family:var(--font-mono);font-size:0.72rem;
  color:var(--text-dim);letter-spacing:0.1em;
}

/* ── FOOTER ───────────────────────────────────── */
.footer{
  padding:1.75rem 2rem;
  border-top:1px solid var(--border);
  text-align:center;
}
.footer-inner p{
  font-family:var(--font-mono);font-size:0.62rem;
  letter-spacing:0.12em;color:var(--text-dim);
  text-transform:uppercase;
}

/* ── CMD+K Widget ─────────────────────────────── */
.cmdk-widget{
  position:fixed;bottom:1.5rem;right:1.5rem;z-index:200;
  font-family:var(--font-mono);font-size:0.68rem;font-weight:600;
  letter-spacing:0.08em;
  background:var(--card);border:1px solid var(--border-md);
  border-radius:6px;padding:7px 14px;
  color:var(--text-sub);cursor:pointer;
  transition:all .2s;
  display:flex;align-items:center;gap:8px;
  user-select:none;
}
.cmdk-widget:hover{border-color:var(--accent);color:var(--accent)}

/* CMD+K Palette */
.cmdk-palette{
  position:fixed;inset:0;z-index:300;
  background:rgba(10,22,40,0.85);backdrop-filter:blur(12px);
  display:flex;align-items:flex-start;justify-content:center;
  padding-top:15vh;
}
.cmdk-palette.hidden{display:none}
.cmdk-inner{
  background:var(--card);border:1px solid var(--border-md);
  border-radius:12px;width:100%;max-width:560px;
  margin:0 1rem;overflow:hidden;
  box-shadow:0 40px 80px rgba(0,0,0,0.6);
}
.cmdk-input{
  width:100%;padding:1.1rem 1.5rem;
  background:transparent;border:none;border-bottom:1px solid var(--border);
  color:var(--text);font-family:var(--font-mono);font-size:0.9rem;
  outline:none;
}
.cmdk-input::placeholder{color:var(--text-dim)}
.cmdk-list{max-height:320px;overflow-y:auto;padding:.5rem}
.cmdk-item{
  padding:.75rem 1rem;border-radius:6px;cursor:pointer;
  font-family:var(--font-mono);font-size:0.8rem;
  color:var(--text-sub);display:flex;align-items:center;gap:.75rem;
  transition:all .15s;
}
.cmdk-item:hover,.cmdk-item.selected{
  background:var(--accent-dim);color:var(--accent);
}
.cmdk-item-icon{font-size:0.9rem;width:20px;text-align:center}

/* ── Responsive ───────────────────────────────── */
@media (max-width:900px){
  .hero-inner{grid-template-columns:1fr}
  .hero-visual{display:none}
  .proj-grid{grid-template-columns:1fr}
  .edu-cards{grid-template-columns:1fr 1fr}
}
@media (max-width:640px){
  .nav-links,.nav-cta{display:none}
  .nav-hamburger{display:flex}
  .nav-links.open{
    display:flex;flex-direction:column;align-items:flex-start;
    position:fixed;inset:var(--nav-h) 0 0 0;
    background:var(--bg);padding:2rem;gap:.5rem;z-index:99;
  }
  .nav-links.open .nav-cta-mob{display:block;margin-top:1rem}
  .hero-name{font-size:2.8rem}
  .hero-stats{grid-template-columns:1fr 1fr}
  .certs-grid{grid-template-columns:1fr}
  .edu-cards{grid-template-columns:1fr}
  .contact-box{padding:2.5rem 1.5rem}
  .section{padding:4rem 0}
}`;
  }

  /* ══════════════════════════════════════════════════════
     JS GENERATION
  ══════════════════════════════════════════════════════ */
  function generateJS(d) {
    const sections = ['hero', 'projects', 'skills', 'experience', 'education', 'certifications', 'contact'];
    const name = d.name || 'Portfolio';

    return `/**
 * app.js — Portfolio Interactive Layer
 * Generated for: ${xe(name)}
 * PortfolioForge
 */
(function Portfolio(){
  'use strict';

  /* ── Scroll-aware nav ── */
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], .hero[id]');

  window.addEventListener('scroll', () => {
    nav && nav.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  }, {passive:true});

  function updateActiveLink(){
    let cur = '';
    sections.forEach(s => {
      if(window.scrollY >= s.offsetTop - 120) cur = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#'+cur));
  }

  /* ── Scroll reveal ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  },{threshold:0.08, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* ── Smooth scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if(t){ e.preventDefault(); window.scrollTo({top: t.offsetTop - 75, behavior:'smooth'}); }
    });
  });

  /* ── Mobile menu ── */
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');
  hamburger && hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks && navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger && hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── CMD+K palette ── */
  const widget  = document.getElementById('cmdk-widget');
  const palette = document.getElementById('cmdk-palette');
  const input   = document.getElementById('cmdk-input');
  const list    = document.getElementById('cmdk-list');

  const commands = [
    {icon:'↑', label:'Go to Top',        action:() => window.scrollTo({top:0,behavior:'smooth'})},
    {icon:'⚡', label:'View Projects',    action:() => scrollTo('projects')},
    {icon:'🛠', label:'View Skills',      action:() => scrollTo('skills')},
    {icon:'💼', label:'View Experience',  action:() => scrollTo('experience')},
    {icon:'🎓', label:'View Education',   action:() => scrollTo('education')},
    {icon:'✉', label:'Contact Me',        action:() => scrollTo('contact')},
    ${d.github   ? `{icon:'⌥', label:'GitHub',  action:() => window.open('${xe(d.github)}','_blank')},` : ''}
    ${d.linkedin ? `{icon:'in',label:'LinkedIn', action:() => window.open('${xe(d.linkedin)}','_blank')},` : ''}
    ${d.email    ? `{icon:'@', label:'Send Email',action:() => window.location.href='mailto:${xe(d.email)}'},` : ''}
  ];

  function scrollTo(id){
    const el = document.getElementById(id);
    if(el) window.scrollTo({top:el.offsetTop-75, behavior:'smooth'});
  }

  let selected = 0;
  let filtered = [...commands];

  function renderList(items){
    list.innerHTML = items.map((c,i) =>
      \`<li class="cmdk-item\${i===selected?' selected':''}" data-i="\${i}">
        <span class="cmdk-item-icon">\${c.icon}</span>\${c.label}
      </li>\`).join('');
    list.querySelectorAll('.cmdk-item').forEach((el,i) => {
      el.addEventListener('click', () => { items[i].action(); closePalette(); });
    });
  }

  function openPalette(){
    palette.classList.remove('hidden');
    input.value = '';
    selected = 0;
    filtered = [...commands];
    renderList(filtered);
    input.focus();
  }
  function closePalette(){
    palette.classList.add('hidden');
    input.value = '';
  }

  widget && widget.addEventListener('click', openPalette);
  palette && palette.addEventListener('click', e => { if(e.target===palette) closePalette(); });

  input && input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    filtered = commands.filter(c => c.label.toLowerCase().includes(q));
    selected = 0;
    renderList(filtered);
  });

  document.addEventListener('keydown', e => {
    if((e.metaKey||e.ctrlKey) && e.key==='k'){ e.preventDefault(); palette.classList.contains('hidden') ? openPalette() : closePalette(); return; }
    if(palette && !palette.classList.contains('hidden')){
      if(e.key==='Escape') closePalette();
      if(e.key==='ArrowDown'){ selected=Math.min(selected+1,filtered.length-1); renderList(filtered); }
      if(e.key==='ArrowUp'){   selected=Math.max(selected-1,0);                  renderList(filtered); }
      if(e.key==='Enter' && filtered[selected]){ filtered[selected].action(); closePalette(); }
    }
  });

  /* ── Skill chip hover ── */
  document.querySelectorAll('.skill-chip, .hero-tag').forEach(el => {
    el.addEventListener('mouseenter', () => el.style.transform='translateY(-2px) scale(1.04)');
    el.addEventListener('mouseleave', () => el.style.transform='');
  });

  /* ── Reduced motion ── */
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    document.querySelectorAll('.reveal').forEach(el => {el.style.opacity='1';el.style.transform='none';});
  }

  console.log('%c ${xe(name)} ✦', 'font-size:16px;font-weight:900;color:#00bcd4');
  console.log('%cGenerated by PortfolioForge', 'color:#3a5a7a;font-size:11px');

})();`;
  }

  /* ══════════════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════════════ */
  function getInitials(name) {
    if (!name) return 'PF';
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function getSkillTags(d) {
    if (d.keySkillTags && d.keySkillTags.length > 0) return d.keySkillTags;
    return parseList([d.skillsLanguages, d.skillsFrameworks, d.skillsTools].filter(Boolean).join(','));
  }

  function getHeroStats(d) {
    if (d.heroStats && d.heroStats.length > 0) {
      return d.heroStats.map(s => ({
        icon : '✦',
        label: s.label,
        value: s.value,
      }));
    }
    const stats = [];
    if (d.experience && d.experience.length > 0) {
      stats.push({ icon: '💼', label: 'ROLES', value: d.experience.length + '+' });
    }
    if (d.projects && d.projects.length > 0) {
      stats.push({ icon: '⚡', label: 'PROJECTS', value: d.projects.length });
    }
    const skillCount = getSkillTags(d).length;
    if (skillCount > 0) {
      stats.push({ icon: '🛠', label: 'SKILLS', value: skillCount + '+' });
    }
    if (d.eduSchool || d.eduDegree) {
      stats.push({ icon: '🎓', label: 'EDUCATION', value: '1+' });
    }
    return stats;
  }

  function parseList(str) {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }

  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null;
  }

  function xe(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
  }

  /* ══════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════ */
  window.PortfolioGenerator = {
    generatePortfolio,
    generateHTML,
    generateCSS,
    generateJS,
  };

})();
