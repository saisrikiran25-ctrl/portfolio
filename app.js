/**
 * app.js — Application State, Logic & Orchestration
 * PortfolioForge
 *
 * Updated: OpenRouter AI integration + async generation pipeline
 * Fallback: direct template generation when API unavailable
 */

(function AppModule() {
  'use strict';

  /* ══════════════════════════════════════════════
     CONSTANTS
  ══════════════════════════════════════════════ */
  const TOTAL_STEPS = 5;

  const SECTION_LABELS = [
    'Personal Info',
    'About & Skills',
    'Work Experience',
    'Projects',
    'Education & Contact',
  ];

  /* ── Demo data matching the screenshot aesthetic ── */
  const DEMO_DATA = {
    name:          'Sai Srikiran J.',
    title:         'Prompt Engineer & AI Architect',
    tagline:       'Leveraging AI to build solutions for real world problems.',
    location:      'India',
    accentColor:   '#00bcd4',
    theme:         'dark',
    bio:           "Prompt Engineer & AI Architect specializing in LLMOps, autonomous agents, and SaaS products powered by generative AI. I bridge the gap between cutting-edge AI research and real-world business applications.\n\nFounder of multiple AI-native SaaS products. I architect intelligent systems that scale — from solo-founder MVPs to enterprise-grade platforms.",
    skillsLanguages:   'Python, JavaScript, TypeScript',
    skillsFrameworks:  'React, Next.js, Node.js, LangChain, LlamaIndex',
    skillsTools:       'Azure, Google Cloud, Docker, OpenAI API, Pinecone, Supabase',
    skillsOther:       'LLM Ops, Prompt Engineering, RAG Pipelines, AI Agents, System Design',
    experience: [
      {
        role:        'Prompt Engineer & AI Architect',
        company:     'Self-Directed / Freelance',
        location:    'Remote',
        dates:       '2023 — Present',
        description: 'Designing and deploying AI-powered SaaS products and prompt engineering systems for global clients.',
        highlights:  [
          'Built 40+ monetizable prompt packages sold on PromptBase',
          'Engineered 450+ business prompts across verticals',
          'Deployed 10+ SaaS products reaching international markets',
          'Ranked #500 on PromptBase globally',
        ],
        tech: 'Python, OpenAI, LangChain, React, Next.js, Azure',
      },
    ],
    projects: [
      {
        name:     'Synthetix',
        category: 'SAAS',
        desc:     'Elite browser-native Visual Logic Engine with an "Obsidian Midnight" aesthetic. Orchestrates complex data flows via kinetic, type-aware connections on an infinite canvas with zero-latency reactive propagation.',
        modules:  ['Infinite Canvas', 'Kinetic Flows', 'Reactive Engine', 'Auto-Persistence'],
        tech:     'React, Canvas API, DAG Logic, Local Storage',
        url:      '',
        github:   '',
      },
      {
        name:     'ContentAccel',
        category: 'SAAS',
        desc:     'AI-powered SEO content generator for agencies. Features a specialized "Three-Step Process" (Setup, Brief, Generate) to create high-converting, vertical-specific content.',
        modules:  ['Auto-Brief Gen', 'SEO Optimization', 'Vertical Tuning', 'Rapid Publish'],
        tech:     'React, OpenAI, SEO Engine, Tailwind',
        url:      '',
        github:   '',
      },
      {
        name:     'Prompt Foundry',
        category: 'SAAS',
        desc:     'Premium e-commerce platform for expert-grade AI prompts. A Silicon Valley-style marketplace with curated collections, category filtering, and one-click deployment to major LLM platforms.',
        modules:  ['Prompt Marketplace', 'Instant Deploy', 'Version Control', 'Revenue Share'],
        tech:     'Next.js, Stripe, Supabase, OpenAI',
        url:      '',
        github:   '',
      },
      {
        name:     'Aletheia',
        category: 'SAAS',
        desc:     'The "Zero-to-One" Intelligence Terminal for founders. Features "Consensus Map" with AI-powered market research, competitive analysis, and business strategy synthesis.',
        modules:  ['Consensus Map', 'Market Intel', 'Strategy Synth', 'Founder Mode'],
        tech:     'React, GPT-4, LangChain, PostgreSQL',
        url:      '',
        github:   '',
      },
    ],
    educationItems: [
      {
        school:     'Atomic Energy Central School',
        degree:     'Secondary Education',
        dates:      '2023',
        highlights: ['Class 10 Score: 97%', 'Subjects: English, Hindi, Mathematics, Science, Social Science & AI'],
      },
      {
        school:     'Somaiya School (CBSE)',
        degree:     'Higher Secondary (Science)',
        dates:      '2023 - 2025',
        highlights: ['Class 12 Score: 90.4%', 'Subjects: English, Chemistry, Physics, Math & Economics'],
      },
      {
        school:     'IIFT',
        degree:     'Integrated BBA (Business Analytics) + MBA (IB)',
        dates:      '2025 - 2030',
        highlights: ['Business Analytics Specialization', 'International Trade'],
      },
      {
        school:     'IIM Bangalore',
        degree:     'DBA in Digital Business and Entrepreneurship',
        dates:      '2025 - 2028',
        highlights: ['Focus on AI Strategy', 'Digital Product Management'],
      },
    ],
    certifications: [
      { name: 'Generative AI Mastermind',                         issuer: 'Outskill', issued: 'Aug 2025' },
      { name: 'Integrating Generative AI into Business Strategy', issuer: 'Society of Human Resource Management', issued: 'Oct 2025' },
    ],
    heroStats: [
      { label: 'PROMPT PACKAGES',  value: '40+' },
      { label: 'BUSINESS PROMPTS', value: '450+' },
      { label: 'SAAS DEPLOYED',    value: '10+' },
      { label: 'CUSTOM GEMS',      value: '6+' },
      { label: 'PROMPTBASE RANKING', value: '#500' },
    ],
    eduDegree: 'Integrated BBA + MBA (IB)',
    eduSchool: 'IIFT',
    eduYear:   '2025 - 2030',
    eduGpa:    'Business Analytics Specialization',
    email:     'saikiran@example.com',
    github:    'https://github.com/saikiran',
    linkedin:  'https://linkedin.com/in/saikiran',
    website:   '',
    twitter:   '',
    phone:     '9987403394',
  };

  /* ══════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════ */
  const state = {
    currentStep:     0,
    experienceCount: 0,
    projectCount:    0,
    generated:       null,
    generating:      false,
  };

  /* ══════════════════════════════════════════════
     DOM CACHE
  ══════════════════════════════════════════════ */
  let dom = {};

  function cacheDom() {
    dom = {
      preloader:        document.getElementById('preloader'),
      preloaderFill:    document.getElementById('preloader-fill'),
      app:              document.getElementById('app'),
      header:           document.getElementById('app-header'),
      resumeForm:       document.getElementById('resume-form'),
      progressFill:     document.getElementById('form-progress-fill'),
      progressLabel:    document.getElementById('progress-label'),
      progressSect:     document.getElementById('progress-section-label'),
      progressSteps:    document.querySelectorAll('.progress-step'),
      outputSection:    document.getElementById('output-section'),
      toastContainer:   document.getElementById('toast-container'),
      heroDemoBtn:      document.getElementById('hero-demo-btn'),
      generateBtn:      document.getElementById('generate-btn'),
      downloadAllBtn:   document.getElementById('download-all-btn'),
      regenerateBtn:    document.getElementById('regenerate-btn'),
      statPortfolios:   document.getElementById('stat-portfolios'),
      bioField:         document.getElementById('field-bio'),
      bioCount:         document.getElementById('bio-count'),
      colorField:       document.getElementById('field-accent'),
      colorPreview:     document.getElementById('color-preview-text'),
      outputHtml:       document.getElementById('output-html'),
      outputCss:        document.getElementById('output-css'),
      outputJs:         document.getElementById('output-js'),
      copyHtml:         document.getElementById('copy-html'),
      copyCss:          document.getElementById('copy-css'),
      copyJs:           document.getElementById('copy-js'),
      portfolioPreview: document.getElementById('portfolio-preview'),
      previewFrameWrap: document.getElementById('preview-frame-wrap'),
      expEntries:       document.getElementById('experience-entries'),
      projEntries:      document.getElementById('project-entries'),
    };
  }

  /* ══════════════════════════════════════════════
     PRELOADER
  ══════════════════════════════════════════════ */
  function runPreloader() {
    const msgs = [
      'Loading Three.js engine...',
      'Initializing AI pipeline...',
      'Connecting to OpenRouter...',
      'PortfolioForge ready.',
    ];
    let pct = 0, msgIdx = 0;
    const msgEl = document.querySelector('.preloader-text');

    const iv = setInterval(() => {
      pct = Math.min(pct + rInt(8, 18), 100);
      if (dom.preloaderFill) dom.preloaderFill.style.width = pct + '%';
      const ni = Math.floor((pct / 100) * msgs.length);
      if (ni !== msgIdx && ni < msgs.length) { msgIdx = ni; if (msgEl) msgEl.textContent = msgs[msgIdx]; }
      if (pct >= 100) { clearInterval(iv); setTimeout(showApp, 300); }
    }, 80);
  }

  function showApp() {
    if (dom.preloader) {
      dom.preloader.classList.add('fade-out');
      setTimeout(() => dom.preloader.style.display = 'none', 600);
    }
    if (dom.app) dom.app.classList.remove('hidden');
    animateStatCounter();
  }

  function animateStatCounter() {
    if (!dom.statPortfolios) return;
    const target = 12847, dur = 2000, start = performance.now();
    const run = (now) => {
      const p = Math.min((now - start) / dur, 1);
      dom.statPortfolios.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(run);
    };
    setTimeout(() => requestAnimationFrame(run), 800);
  }

  /* ══════════════════════════════════════════════
     FORM WIZARD
  ══════════════════════════════════════════════ */
  function goToStep(idx) {
    if (idx < 0 || idx >= TOTAL_STEPS) return;
    document.getElementById('step-' + state.currentStep)?.classList.remove('active');
    state.currentStep = idx;
    document.getElementById('step-' + idx)?.classList.add('active');
    updateProgress();
    scrollToGenerator();
  }

  function nextStep() { if (validateStep()) goToStep(state.currentStep + 1); }
  function prevStep() { goToStep(state.currentStep - 1); }

  function validateStep() {
    const stepEl = document.getElementById('step-' + state.currentStep);
    let valid = true;
    stepEl?.querySelectorAll('[required]').forEach(f => {
      f.classList.remove('error');
      if (!f.value.trim()) { f.classList.add('error'); valid = false; if (valid) f.focus(); }
    });
    if (!valid) showToast('Please fill in all required fields.', 'error');
    return valid;
  }

  function updateProgress() {
    const pct = Math.round((state.currentStep / (TOTAL_STEPS - 1)) * 100);
    if (dom.progressFill) dom.progressFill.style.width = pct + '%';
    if (dom.progressLabel) dom.progressLabel.textContent = pct + '% Complete';
    if (dom.progressSect) dom.progressSect.textContent = 'Section: ' + SECTION_LABELS[state.currentStep];
    dom.progressSteps.forEach((btn, i) => {
      btn.classList.toggle('active', i === state.currentStep);
      btn.classList.toggle('completed', i < state.currentStep);
    });
  }

  function scrollToGenerator() {
    document.getElementById('generator-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ══════════════════════════════════════════════
     DYNAMIC ENTRY CARDS
  ══════════════════════════════════════════════ */
  function addExperience() {
    const idx = state.experienceCount++;
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.id = 'exp-card-' + idx;
    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-card-title">Role ${idx + 1}</span>
        <button class="entry-remove-btn" onclick="appState.removeEntry('exp-card-${idx}')" type="button" aria-label="Remove role">×</button>
      </div>
      <div class="fields-grid fields-2">
        <div class="field-group">
          <label for="exp-role-${idx}" class="field-label">Job Title</label>
          <input type="text" id="exp-role-${idx}" class="field-input" placeholder="Senior Engineer" />
        </div>
        <div class="field-group">
          <label for="exp-company-${idx}" class="field-label">Company</label>
          <input type="text" id="exp-company-${idx}" class="field-input" placeholder="Acme Corp" />
        </div>
        <div class="field-group">
          <label for="exp-location-${idx}" class="field-label">Location</label>
          <input type="text" id="exp-location-${idx}" class="field-input" placeholder="New York, NY" />
        </div>
        <div class="field-group">
          <label for="exp-dates-${idx}" class="field-label">Dates</label>
          <input type="text" id="exp-dates-${idx}" class="field-input" placeholder="Jan 2022 — Present" />
        </div>
        <div class="field-group" style="grid-column:1/-1">
          <label for="exp-desc-${idx}" class="field-label">Description</label>
          <textarea id="exp-desc-${idx}" class="field-textarea" rows="3" placeholder="Briefly describe your role and impact..."></textarea>
        </div>
        <div class="field-group" style="grid-column:1/-1">
          <label for="exp-hl-${idx}" class="field-label">Key Achievements (one per line)</label>
          <textarea id="exp-hl-${idx}" class="field-textarea" rows="3" placeholder="• Built X that increased Y by Z%"></textarea>
        </div>
        <div class="field-group" style="grid-column:1/-1">
          <label for="exp-tech-${idx}" class="field-label">Technologies</label>
          <input type="text" id="exp-tech-${idx}" class="field-input" placeholder="React, Node.js, PostgreSQL" />
        </div>
      </div>`;
    dom.expEntries.appendChild(card);
  }

  function addProject() {
    const idx = state.projectCount++;
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.id = 'proj-card-' + idx;
    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-card-title">Project ${idx + 1}</span>
        <button class="entry-remove-btn" onclick="appState.removeEntry('proj-card-${idx}')" type="button" aria-label="Remove project">×</button>
      </div>
      <div class="fields-grid fields-2">
        <div class="field-group">
          <label for="proj-name-${idx}" class="field-label">Project Name</label>
          <input type="text" id="proj-name-${idx}" class="field-input" placeholder="My Project" />
        </div>
        <div class="field-group">
          <label for="proj-cat-${idx}" class="field-label">Category Badge</label>
          <input type="text" id="proj-cat-${idx}" class="field-input" placeholder="SAAS / OPEN SOURCE / WEB3" />
        </div>
        <div class="field-group" style="grid-column:1/-1">
          <label for="proj-desc-${idx}" class="field-label">Description</label>
          <textarea id="proj-desc-${idx}" class="field-textarea" rows="3" placeholder="What does it do? What's your impact?"></textarea>
        </div>
        <div class="field-group" style="grid-column:1/-1">
          <label for="proj-modules-${idx}" class="field-label">Core Modules (comma-separated)</label>
          <input type="text" id="proj-modules-${idx}" class="field-input" placeholder="Auth Engine, Dashboard, API Layer, Analytics" />
        </div>
        <div class="field-group" style="grid-column:1/-1">
          <label for="proj-tech-${idx}" class="field-label">Tech Stack</label>
          <input type="text" id="proj-tech-${idx}" class="field-input" placeholder="React, Node.js, MongoDB" />
        </div>
        <div class="field-group">
          <label for="proj-url-${idx}" class="field-label">Live URL</label>
          <input type="url" id="proj-url-${idx}" class="field-input" placeholder="https://..." />
        </div>
        <div class="field-group">
          <label for="proj-github-${idx}" class="field-label">GitHub URL</label>
          <input type="url" id="proj-github-${idx}" class="field-input" placeholder="https://github.com/..." />
        </div>
      </div>`;
    dom.projEntries.appendChild(card);
  }

  function removeEntry(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.cssText = 'opacity:0;transform:scale(0.95);transition:all .3s';
    setTimeout(() => el.remove(), 300);
  }

  /* ══════════════════════════════════════════════
     DATA COLLECTION
  ══════════════════════════════════════════════ */
  function collectData() {
    const get = id => document.getElementById(id)?.value.trim() || '';

    const experience = [];
    dom.expEntries?.querySelectorAll('.entry-card').forEach(card => {
      const id = card.id.replace('exp-card-', '');
      const highlights = (document.getElementById('exp-hl-' + id)?.value || '')
        .split('\n').map(l => l.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean);
      const e = {
        role:        get('exp-role-' + id),
        company:     get('exp-company-' + id),
        location:    get('exp-location-' + id),
        dates:       get('exp-dates-' + id),
        description: get('exp-desc-' + id),
        highlights,
        tech:        get('exp-tech-' + id),
      };
      if (e.role || e.company) experience.push(e);
    });

    const projects = [];
    dom.projEntries?.querySelectorAll('.entry-card').forEach(card => {
      const id = card.id.replace('proj-card-', '');
      const mods = (get('proj-modules-' + id)).split(',').map(s=>s.trim()).filter(Boolean);
      const p = {
        name:     get('proj-name-' + id),
        category: get('proj-cat-' + id) || 'PROJECT',
        desc:     get('proj-desc-' + id),
        modules:  mods,
        tech:     get('proj-tech-' + id),
        url:      get('proj-url-' + id),
        github:   get('proj-github-' + id),
      };
      if (p.name) projects.push(p);
    });

    return {
      name:             get('field-name'),
      title:            get('field-title'),
      tagline:          get('field-tagline'),
      location:         get('field-location'),
      accentColor:      get('field-accent') || '#00bcd4',
      theme:            get('field-theme'),
      bio:              get('field-bio'),
      skillsLanguages:  get('skills-languages'),
      skillsFrameworks: get('skills-frameworks'),
      skillsTools:      get('skills-tools'),
      skillsOther:      get('skills-other'),
      experience,
      projects,
      eduDegree:  get('field-edu-degree'),
      eduSchool:  get('field-edu-school'),
      eduYear:    get('field-edu-year'),
      eduGpa:     get('field-edu-gpa'),
      email:      get('field-email'),
      github:     get('field-github'),
      linkedin:   get('field-linkedin'),
      website:    get('field-website'),
      twitter:    get('field-twitter'),
      phone:      get('field-phone'),
    };
  }

  /* ══════════════════════════════════════════════
     GENERATION PIPELINE (async, AI-powered)
  ══════════════════════════════════════════════ */
  async function handleGenerate(e) {
    if (e) e.preventDefault();
    if (state.generating) return;
    if (!validateStep()) return;
    if (!window.PortfolioGenerator) { showToast('Generator not loaded. Refresh the page.', 'error'); return; }

    const data = collectData();
    if (!data.name) { showToast('Please enter your name.', 'error'); return; }

    state.generating = true;
    const overlay = showGeneratingOverlay();

    const progressSteps = [
      { key: 'ai',       text: 'Calling AI (OpenRouter)...' },
      { key: 'ai_done',  text: 'AI Enhancement complete ✓' },
      { key: 'ai_fallback', text: 'Template fallback active ✓' },
      { key: 'ai_retry', text: 'Retrying fallback model...' },
      { key: 'html',     text: 'Generating HTML...' },
      { key: 'css',      text: 'Crafting CSS design system...' },
      { key: 'js',       text: 'Building interactive JS...' },
      { key: 'done',     text: 'Portfolio ready!' },
    ];

    const overlaySteps = overlay.querySelectorAll('.gen-step');
    const stepMap = { ai: 0, ai_done: 0, ai_fallback: 0, ai_retry: 0, html: 1, css: 2, js: 3, done: 4 };

    function onProgress(key, msg) {
      const idx = stepMap[key] ?? 0;
      overlaySteps.forEach((s, i) => {
        if (i < idx)  { s.classList.remove('active'); s.classList.add('done');   s.querySelector('.gen-step-icon').textContent = '✓'; }
        if (i === idx){ s.classList.add('active'); s.querySelector('.gen-step-label').textContent = msg; }
      });

      // Show AI badge update
      const aiStatus = overlay.querySelector('.gen-ai-status');
      if (aiStatus) {
        if (key === 'ai')          aiStatus.textContent = '⚡ AI Enhancement: Connecting...';
        if (key === 'ai_done')     aiStatus.textContent = '✓ AI Enhancement: Success';
        if (key === 'ai_fallback') aiStatus.textContent = '◎ AI Enhancement: Template Fallback';
        if (key === 'ai_retry')    aiStatus.textContent = '↺ AI Enhancement: Retrying...';
      }
    }

    try {
      const result = await window.PortfolioGenerator.generatePortfolio(data, onProgress);
      state.generated = result;

      setTimeout(() => {
        overlay.remove();
        state.generating = false;
        renderOutput(result);
        const badge = result.aiUsed ? '✦ AI-Enhanced' : '◎ Template Generated';
        showToast(`Portfolio generated! ${badge}`, 'success');
      }, 500);

    } catch (err) {
      overlay.remove();
      state.generating = false;
      console.error('[PortfolioForge] Generation error:', err);
      showToast('Generation error. Please try again.', 'error');
    }
  }

  /* ── Loading Overlay ──────────────────────────────────────────── */
  function showGeneratingOverlay() {
    const div = document.createElement('div');
    div.className = 'generating-overlay active';
    div.setAttribute('role', 'status');
    div.setAttribute('aria-label', 'Generating portfolio...');
    div.innerHTML = `
      <div class="generating-inner">
        <div class="gen-orbs" aria-hidden="true">
          <div class="gen-orb gen-orb-1"></div>
          <div class="gen-orb gen-orb-2"></div>
          <div class="gen-orb gen-orb-3"></div>
          <div class="gen-orb-core"></div>
        </div>
        <p class="gen-title">Forging Your Portfolio</p>
        <p class="gen-ai-status" style="font-size:.78rem;color:var(--cyan);font-family:'JetBrains Mono',monospace;margin-bottom:.5rem">⚡ AI Enhancement: Initializing...</p>
        <div class="gen-steps-list">
          <div class="gen-step"><span class="gen-step-icon">○</span> <span class="gen-step-label">Connecting to OpenRouter AI...</span></div>
          <div class="gen-step"><span class="gen-step-icon">○</span> <span class="gen-step-label">Generating HTML structure</span></div>
          <div class="gen-step"><span class="gen-step-icon">○</span> <span class="gen-step-label">Crafting CSS design system</span></div>
          <div class="gen-step"><span class="gen-step-icon">○</span> <span class="gen-step-label">Building interactive JS</span></div>
          <div class="gen-step"><span class="gen-step-icon">○</span> <span class="gen-step-label">Rendering live preview</span></div>
        </div>
      </div>`;
    document.body.appendChild(div);
    return div;
  }

  /* ══════════════════════════════════════════════
     OUTPUT RENDERING
  ══════════════════════════════════════════════ */
  function renderOutput(result) {
    dom.outputSection?.classList.remove('hidden');
    setTimeout(() => dom.outputSection?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    if (dom.outputHtml) dom.outputHtml.querySelector('code').innerHTML = hlHTML(result.html);
    if (dom.outputCss)  dom.outputCss.querySelector('code').innerHTML  = hlCSS(result.css);
    if (dom.outputJs)   dom.outputJs.querySelector('code').innerHTML   = hlJS(result.js);

    renderPreview(result);

    // Show AI badge in output header
    const successBadge = dom.outputSection?.querySelector('.output-success-badge');
    if (successBadge && result.aiUsed) {
      successBadge.innerHTML = '<span aria-hidden="true">✦</span> AI-Enhanced Portfolio Generated';
      successBadge.style.borderColor = 'rgba(0,212,255,0.4)';
      successBadge.style.color = 'var(--cyan)';
      successBadge.style.background = 'rgba(0,212,255,0.08)';
    }
  }

  function renderPreview(result) {
    if (!dom.portfolioPreview) return;
    const doc = `${result.html}\n<style>${result.css}</style>\n<script>${result.js}<\/script>`;
    try {
      dom.portfolioPreview.srcdoc = doc;
    } catch {
      dom.portfolioPreview.src = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
    }
  }

  /* ── Syntax highlighting ─────────────────────────────────────── */
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function hlHTML(code) {
    return esc(code)
      .replace(/(&lt;\/?)([\w-]+)/g, '<span class="tok-tag">$1$2</span>')
      .replace(/([\w-]+)=(&quot;[^&]*&quot;)/g, '<span class="tok-attr">$1</span>=<span class="tok-str">$2</span>')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-cmnt">$1</span>');
  }

  function hlCSS(code) {
    return esc(code)
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-cmnt">$1</span>')
      .replace(/([\w-]+)(\s*:)(?!\s*\/\/)/g, '<span class="tok-prop">$1</span>$2')
      .replace(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g, '<span class="tok-val">$1</span>');
  }

  function hlJS(code) {
    const kws = ['function','const','let','var','return','if','else','for','forEach',
                 'new','this','true','false','null','undefined','async','await',
                 'document','window','addEventListener','querySelectorAll','setTimeout'];
    let r = esc(code)
      .replace(/(\/\*[\s\S]*?\*\/)/g,  '<span class="tok-cmnt">$1</span>')
      .replace(/(\/\/[^\n]*)/g,         '<span class="tok-cmnt">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, '<span class="tok-str">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g,      '<span class="tok-num">$1</span>');
    kws.forEach(kw => { r = r.replace(new RegExp('\\b(' + kw + ')\\b', 'g'), '<span class="tok-key">$1</span>'); });
    return r;
  }

  /* ══════════════════════════════════════════════
     CODE TABS
  ══════════════════════════════════════════════ */
  function initCodeTabs() {
    document.querySelectorAll('.code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.code-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        document.querySelectorAll('.code-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        const map = { html:'tab-panel-html', css:'tab-panel-css', js:'tab-panel-js' };
        document.getElementById(map[tab.dataset.file])?.classList.add('active');
      });
    });
  }

  /* ══════════════════════════════════════════════
     DEPLOY TABS
  ══════════════════════════════════════════════ */
  function initDeployTabs() {
    document.querySelectorAll('.deploy-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.deploy-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        document.querySelectorAll('.deploy-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        document.getElementById('dpanel-' + tab.dataset.deploy)?.classList.add('active');
      });
    });
  }

  /* ══════════════════════════════════════════════
     PREVIEW DEVICE SWITCHER
  ══════════════════════════════════════════════ */
  function initPreviewDevices() {
    document.querySelectorAll('.preview-device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.preview-device-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (dom.previewFrameWrap) {
          dom.previewFrameWrap.className = 'preview-frame-wrap';
          if (btn.dataset.device !== 'desktop') dom.previewFrameWrap.classList.add('device-' + btn.dataset.device);
        }
      });
    });
  }

  /* ══════════════════════════════════════════════
     COPY BUTTONS
  ══════════════════════════════════════════════ */
  function initCopyButtons() {
    [
      { btn: dom.copyHtml, src: () => state.generated?.html || '' },
      { btn: dom.copyCss,  src: () => state.generated?.css  || '' },
      { btn: dom.copyJs,   src: () => state.generated?.js   || '' },
    ].forEach(({ btn, src }) => {
      if (!btn) return;
      btn.addEventListener('click', async () => {
        const text = src();
        if (!text) { showToast('Generate a portfolio first!', 'error'); return; }
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = '✓ Copied!';
          btn.classList.add('copied');
          showToast('Copied to clipboard!', 'success');
          setTimeout(() => { btn.textContent = 'Copy Code'; btn.classList.remove('copied'); }, 2000);
        } catch {
          showToast('Please select & copy manually.', 'error');
        }
      });
    });
  }

  /* ══════════════════════════════════════════════
     FILE DOWNLOADS
  ══════════════════════════════════════════════ */
  function downloadAllFiles() {
    if (!state.generated) { showToast('Generate a portfolio first!', 'error'); return; }
    [
      { name:'index.html', content:state.generated.html, type:'text/html' },
      { name:'styles.css', content:state.generated.css,  type:'text/css'  },
      { name:'app.js',     content:state.generated.js,   type:'application/javascript' },
    ].forEach((f, i) => {
      setTimeout(() => {
        const a = Object.assign(document.createElement('a'), {
          href:     URL.createObjectURL(new Blob([f.content], { type: f.type })),
          download: f.name,
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 350);
    });
    showToast('Downloading 3 portfolio files...', 'success');
  }

  /* ══════════════════════════════════════════════
     DEMO DATA LOADER
  ══════════════════════════════════════════════ */
  function loadDemoData() {
    const fields = {
      'field-name': DEMO_DATA.name, 'field-title': DEMO_DATA.title,
      'field-tagline': DEMO_DATA.tagline, 'field-location': DEMO_DATA.location,
      'field-accent': DEMO_DATA.accentColor, 'field-theme': DEMO_DATA.theme,
      'field-bio': DEMO_DATA.bio,
      'skills-languages': DEMO_DATA.skillsLanguages, 'skills-frameworks': DEMO_DATA.skillsFrameworks,
      'skills-tools': DEMO_DATA.skillsTools, 'skills-other': DEMO_DATA.skillsOther,
      'field-edu-degree': DEMO_DATA.eduDegree, 'field-edu-school': DEMO_DATA.eduSchool,
      'field-edu-year': DEMO_DATA.eduYear, 'field-edu-gpa': DEMO_DATA.eduGpa,
      'field-email': DEMO_DATA.email, 'field-github': DEMO_DATA.github,
      'field-linkedin': DEMO_DATA.linkedin, 'field-phone': DEMO_DATA.phone,
    };
    Object.entries(fields).forEach(([id, val]) => { const el = document.getElementById(id); if (el && val) el.value = val; });
    if (dom.bioField && dom.bioCount) dom.bioCount.textContent = dom.bioField.value.length;
    if (dom.colorPreview) dom.colorPreview.textContent = DEMO_DATA.accentColor + ' — Cyber Cyan';

    // Experience
    if (dom.expEntries) {
      dom.expEntries.innerHTML = '';
      state.experienceCount = 0;
      DEMO_DATA.experience.forEach((exp, i) => {
        addExperience();
        setV('exp-role-' + i,    exp.role);
        setV('exp-company-' + i, exp.company);
        setV('exp-location-' + i,exp.location);
        setV('exp-dates-' + i,   exp.dates);
        setV('exp-desc-' + i,    exp.description);
        setV('exp-hl-' + i,      exp.highlights.map(h=>'• '+h).join('\n'));
        setV('exp-tech-' + i,    exp.tech);
      });
    }

    // Projects
    if (dom.projEntries) {
      dom.projEntries.innerHTML = '';
      state.projectCount = 0;
      DEMO_DATA.projects.forEach((p, i) => {
        addProject();
        setV('proj-name-' + i,    p.name);
        setV('proj-cat-' + i,     p.category || 'SAAS');
        setV('proj-desc-' + i,    p.desc);
        setV('proj-modules-' + i, (p.modules || []).join(', '));
        setV('proj-tech-' + i,    p.tech);
        setV('proj-url-' + i,     p.url || '');
        setV('proj-github-' + i,  p.github || '');
      });
    }

    goToStep(0);
    showToast('Demo data (Sai Srikiran) loaded! ✦ Hit Forge Portfolio on step 5.', 'success');
  }

  function setV(id, val) { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; }

  /* ══════════════════════════════════════════════
     RESET
  ══════════════════════════════════════════════ */
  function resetApp() {
    dom.outputSection?.classList.add('hidden');
    state.generated = null;
    goToStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ══════════════════════════════════════════════
     TOASTS
  ══════════════════════════════════════════════ */
  function showToast(msg, type = 'success') {
    const icons = { success: '✦', error: '✕', info: 'ℹ' };
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.setAttribute('role', 'alert');
    t.innerHTML = `<span aria-hidden="true">${icons[type]||'✦'}</span> ${msg}`;
    dom.toastContainer?.appendChild(t);
    setTimeout(() => { t.classList.add('hiding'); setTimeout(() => t.remove(), 300); }, 3800);
  }

  /* ══════════════════════════════════════════════
     MISC BINDINGS
  ══════════════════════════════════════════════ */
  function initBindings() {
    window.addEventListener('scroll', () => {
      dom.header?.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    dom.bioField?.addEventListener('input', () => { if (dom.bioCount) dom.bioCount.textContent = dom.bioField.value.length; });
    dom.colorField?.addEventListener('input', () => { if (dom.colorPreview) dom.colorPreview.textContent = dom.colorField.value + ' — Custom'; });

    dom.progressSteps.forEach((btn, i) => {
      btn.addEventListener('click', () => { if (i < state.currentStep || btn.classList.contains('completed')) goToStep(i); });
    });

    dom.resumeForm?.addEventListener('submit', handleGenerate);
    dom.generateBtn?.addEventListener('click',  handleGenerate);
    dom.heroDemoBtn?.addEventListener('click',  () => { loadDemoData(); document.getElementById('generator-section')?.scrollIntoView({ behavior:'smooth' }); });
    dom.downloadAllBtn?.addEventListener('click', downloadAllFiles);
    dom.regenerateBtn?.addEventListener('click',  resetApp);
    document.getElementById('hero-start-btn')?.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('generator-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ══════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════ */
  function rInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  function init() {
    cacheDom();
    runPreloader();
    initBindings();
    initCodeTabs();
    initDeployTabs();
    initPreviewDevices();
    initCopyButtons();

    setTimeout(() => { addExperience(); addProject(); }, 150);

    // Public API for inline handlers
    window.appState = { nextStep, prevStep, addExperience, addProject, removeEntry, goToStep };

    console.log('%cPortfolioForge ✦', 'font-size:16px;font-weight:bold;color:#00bcd4');
    console.log('%cOpenRouter AI Integration Active', 'color:#3a5a7a;font-size:11px');
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
