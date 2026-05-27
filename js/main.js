// ADN News — main.js
// Fetches articles.json from GitHub (raw) and renders the site dynamically.

// ── CONFIG ──────────────────────────────────────────────────────────────────
const ARTICLES_URL = 'articles.json';

// ── THEME TOGGLE ────────────────────────────────────────────────────────────
(function () {
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function updateLogos() {
    const logos = document.querySelectorAll('.site-logo-img');
    logos.forEach(img => {
      const base = img.src.split('?')[0];
      if (theme === 'dark') {
        img.src = base.replace('images/logo.png', 'images/logo-dark.png').replace(/logo(?!-dark)\.png/, 'logo-dark.png');
      } else {
        img.src = base.replace('images/logo-dark.png', 'images/logo.png');
      }
    });
  }

  function updateToggles() {
    toggles.forEach(t => {
      t.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
      t.innerHTML = theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    });
  }

  // Set correct logo on initial load
  window.addEventListener('DOMContentLoaded', updateLogos);
  // Also run immediately in case DOM is already ready
  updateLogos();

  updateToggles();
  toggles.forEach(t => t.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateToggles();
    updateLogos();
  }));
})();

// ── LIVE DATE ────────────────────────────────────────────────────────────────
(function () {
  document.querySelectorAll('.masthead-live-date').forEach(el => {
    el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  });
})();

// ── PROPHECY METER ───────────────────────────────────────────────────────────
(function () {
  const fill = document.querySelector('.meter-bar-fill');
  if (!fill) return;
  const target = fill.dataset.percent || '87';
  setTimeout(() => { fill.style.width = target + '%'; }, 400);
})();

// ── SCROLL FADE-IN ───────────────────────────────────────────────────────────
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
}

// ── STICKY HEADER ────────────────────────────────────────────────────────────
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 8), { passive: true });
})();

// ── BADGE HTML HELPERS ───────────────────────────────────────────────────────
function badgeClass(cat) {
  const map = { breaking: 'badge-breaking', prophecy: 'badge-prophecy', israel: 'badge-israel', opinion: 'badge-opinion' };
  return map[cat] || 'badge-breaking';
}

function imgClass(cls) {
  return cls || 'img-hero';
}

const svgIcons = {
  'img-hero':     `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="0.8" opacity="0.18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  'img-prophecy': `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="0.8" opacity="0.18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  'img-israel':   `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="0.8" opacity="0.18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  'img-breaking': `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="0.8" opacity="0.18"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  'img-kingdom':  `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="0.8" opacity="0.18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
};

function placeholderImg(cls, minH) {
  const ic = svgIcons[cls] || svgIcons['img-hero'];
  return `<div class="${cls}" style="width:100%;height:100%;min-height:${minH || 180}px;display:flex;align-items:center;justify-content:center;">${ic}</div>`;
}

// ── ARTICLE PAGE RENDERER ────────────────────────────────────────────────────
function renderArticlePage(articles) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) return;
  const a = articles.find(x => x.slug === slug);
  if (!a) {
    document.getElementById('article-root').innerHTML = '<p style="padding:4rem 2rem;text-align:center;color:var(--color-text-muted);">Article not found.</p>';
    return;
  }
  document.title = a.headline + ' — ADN News';
  const bodyHtml = a.body.map(p => `<p>${p}</p>`).join('');
  document.getElementById('article-root').innerHTML = `
    <div class="${a.img_class}" style="width:100%;height:380px;display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-10);">
      ${svgIcons[a.img_class] || svgIcons['img-hero']}
    </div>
    <div class="article-wrap">
      <span class="category-badge ${badgeClass(a.category)}" style="margin-bottom:var(--space-4);display:inline-flex;">${a.category_label}</span>
      <h1 style="font-family:var(--font-display);font-size:var(--text-2xl);font-weight:900;line-height:1.1;margin-bottom:var(--space-4);">${a.headline}</h1>
      <p style="font-size:var(--text-lg);color:var(--color-text-muted);font-style:italic;line-height:1.55;margin-bottom:var(--space-4);max-width:60ch;">${a.deck}</p>
      <div class="article-byline">
        <span class="author">${a.author}</span>
        <span>·</span><span>${a.date_label}</span>
        <span>·</span><span>${a.read_time}</span>
        <span style="margin-left:auto;font-style:italic;font-size:var(--text-xs);">Satire <span class="sarcasm-tag">100%</span></span>
      </div>
      <div class="article-body-text">
        ${bodyHtml}
        <div class="pull-quote-article">
          "${a.pull_quote}"
          <br><span style="font-size:var(--text-sm);font-style:normal;font-family:var(--font-sans);font-weight:600;color:var(--color-text-faint);">— ${a.pull_quote_attribution}</span>
        </div>
        <div class="postmill-note">
          <strong>ADN Editorial Note:</strong> ${a.postmill_note}
        </div>
        <p style="color:var(--color-text-faint);font-size:var(--text-sm);font-style:italic;margin-top:var(--space-8);border-top:1px solid var(--color-border);padding-top:var(--space-4);">
          This story is entirely fictional. All persons, events, and institutes named are satirical inventions. Offered in Christian love.
        </p>
      </div>
      <div class="related-stories">
        <h2 style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">More From ADN News</h2>
        <div class="related-grid">
          ${articles.filter(x => x.slug !== slug).slice(0, 3).map(r => `
            <div class="related-card">
              <div class="${r.img_class}" style="height:100px;display:flex;align-items:center;justify-content:center;">${svgIcons[r.img_class] || ''}</div>
              <span class="cat" style="font-family:var(--font-sans);font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-text-faint);">${r.category_label}</span>
              <h3 style="font-family:var(--font-display);font-size:var(--text-base);font-weight:700;line-height:1.3;transition:color var(--transition-interactive);">
                <a href="article.html?slug=${r.slug}" style="transition:color var(--transition-interactive);" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color=''">${r.headline}</a>
              </h3>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── HOMEPAGE RENDERER ────────────────────────────────────────────────────────
function renderHomepage(articles) {
  // HERO — most recent featured, or just most recent
  const hero = articles.find(a => a.featured) || articles[0];
  const heroEl = document.getElementById('hero-story');
  if (heroEl && hero) {
    heroEl.innerHTML = `
      <div class="hero-story-image ${hero.img_class}">
        <div style="width:100%;height:100%;min-height:440px;display:flex;align-items:center;justify-content:center;">
          ${svgIcons[hero.img_class] || svgIcons['img-hero']}
        </div>
      </div>
      <div class="hero-story-content">
        <span class="category-badge ${badgeClass(hero.category)}">${hero.category_label}</span>
        <h1 class="hero-headline"><a href="article.html?slug=${hero.slug}">${hero.headline}</a></h1>
        <p class="hero-deck">${hero.deck}</p>
        <div class="story-meta">
          <span class="author">By ${hero.author}</span>
          <span class="divider">|</span>
          <span>${hero.date_label}</span>
          <span class="divider">|</span>
          <span>${hero.read_time}</span>
        </div>
        <a href="article.html?slug=${hero.slug}" class="read-more-btn">Read Full Story <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      </div>
    `;
  }

  // TOP STORIES — next 3 after hero
  const topStories = articles.filter(a => a.slug !== hero.slug).slice(0, 3);
  const topGrid = document.getElementById('top-stories-grid');
  if (topGrid) {
    topGrid.innerHTML = topStories.map(a => `
      <article class="story-card" onclick="location.href='article.html?slug=${a.slug}'">
        <div class="story-card-image ${a.img_class}">
          <div style="width:100%;height:100%;min-height:200px;display:flex;align-items:center;justify-content:center;">
            ${svgIcons[a.img_class] || svgIcons['img-hero']}
          </div>
        </div>
        <span class="category-badge ${badgeClass(a.category)}">${a.category_label}</span>
        <h2 class="story-card-headline"><a href="article.html?slug=${a.slug}">${a.headline}</a></h2>
        <p class="story-card-deck">${a.deck}</p>
        <div class="story-card-meta"><span>${a.date_label}</span> · <span>${a.read_time}</span></div>
      </article>
    `).join('');
  }

  // MOST PROPHESIED SIDEBAR LIST
  const sidebarList = document.getElementById('most-prophesied-list');
  if (sidebarList) {
    sidebarList.innerHTML = articles.slice(0, 5).map((a, i) => `
      <li class="story-list-item" onclick="location.href='article.html?slug=${a.slug}'" style="cursor:pointer;">
        <span class="story-list-num">${i + 1}</span>
        <div class="story-list-content">
          <a href="article.html?slug=${a.slug}" class="story-list-headline">${a.headline}</a>
          <span class="story-list-meta">${a.category_label} · ${a.date_label.split(' ').slice(0, 2).join(' ')}</span>
        </div>
      </li>
    `).join('');
  }

  // PROPHECY WATCH SECTION
  const pwGrid = document.getElementById('prophecy-watch-grid');
  if (pwGrid) {
    const pw = articles.filter(a => a.category === 'prophecy').slice(0, 3);
    pwGrid.innerHTML = pw.map(a => `
      <article class="story-card" onclick="location.href='article.html?slug=${a.slug}'">
        <div class="story-card-image ${a.img_class}">
          <div style="width:100%;height:100%;min-height:200px;display:flex;align-items:center;justify-content:center;">
            ${svgIcons[a.img_class] || svgIcons['img-hero']}
          </div>
        </div>
        <span class="category-badge badge-prophecy">${a.category_label}</span>
        <h2 class="story-card-headline"><a href="article.html?slug=${a.slug}">${a.headline}</a></h2>
        <p class="story-card-deck">${a.deck}</p>
        <div class="story-card-meta"><span>${a.date_label}</span> · <span>${a.read_time}</span></div>
      </article>
    `).join('');
  }

  // OPINION SECTION — 3 most recent articles displayed as opinion cards
  const opinionCards = document.getElementById('opinion-cards');
  if (opinionCards) {
    const authorMeta = {
      'Chester T. Rapture':   { initials: 'CT', color: 'var(--color-primary)',  title: 'Senior Eschatology Correspondent' },
      'Donna Prebulation':    { initials: 'DP', color: '#7a4f9b',               title: 'Tribulation Desk Reporter' },
      'Norman Dispensation':  { initials: 'ND', color: 'var(--color-gold)',     title: 'Prophetic Timeline Specialist' },
      'Priscilla Millstone':  { initials: 'PM', color: 'var(--color-blue)',     title: 'Kingdom Advancement Reporter' },
    };
    const opinionPool = articles.slice(0, 6); // use 3 of the most recent
    opinionCards.innerHTML = opinionPool.slice(0, 3).map(a => {
      const m = authorMeta[a.author] || { initials: a.author.split(' ').map(w=>w[0]).join('').slice(0,2), color: 'var(--color-primary)', title: 'Correspondent' };
      return `
        <div class="opinion-card" onclick="location.href='article.html?slug=${a.slug}'" style="cursor:pointer;">
          <div class="opinion-author-line">
            <div class="avatar-initials" style="background:${m.color};">${m.initials}</div>
            <div>
              <div class="opinion-author-name">${a.author}</div>
              <div class="opinion-author-title">${m.title}</div>
            </div>
          </div>
          <h3 class="opinion-card-headline"><a href="article.html?slug=${a.slug}">${a.headline}</a></h3>
          <p class="opinion-card-excerpt">${a.deck}</p>
        </div>
      `;
    }).join('');
  }

  // ISRAEL SECTION
  const israelGrid = document.getElementById('israel-grid');
  if (israelGrid) {
    const il = articles.filter(a => a.category === 'israel').slice(0, 3);
    israelGrid.innerHTML = il.map(a => `
      <article class="story-card" onclick="location.href='article.html?slug=${a.slug}'">
        <div class="story-card-image ${a.img_class}">
          <div style="width:100%;height:100%;min-height:200px;display:flex;align-items:center;justify-content:center;">
            ${svgIcons[a.img_class] || svgIcons['img-hero']}
          </div>
        </div>
        <span class="category-badge badge-israel">${a.category_label}</span>
        <h2 class="story-card-headline"><a href="article.html?slug=${a.slug}">${a.headline}</a></h2>
        <p class="story-card-deck">${a.deck}</p>
        <div class="story-card-meta"><span>${a.date_label}</span></div>
      </article>
    `).join('');
  }

  initFadeIn();
}

// ── CATEGORY PAGE RENDERER ───────────────────────────────────────────────────
function renderCategoryPage(articles, catFilter) {
  const listEl = document.getElementById('category-article-list');
  if (!listEl) return;
  const filtered = catFilter === 'all' ? articles : articles.filter(a => a.category === catFilter);
  listEl.innerHTML = filtered.map(a => `
    <div class="article-list-item" onclick="location.href='article.html?slug=${a.slug}'">
      <div class="ali-image ${a.img_class}">
        <div style="width:100%;height:140px;display:flex;align-items:center;justify-content:center;">
          ${svgIcons[a.img_class] || svgIcons['img-hero']}
        </div>
      </div>
      <div class="ali-content">
        <span class="category-badge ${badgeClass(a.category)}" style="font-size:10px;padding:1px 6px;width:fit-content;">${a.category_label}</span>
        <h2 class="ali-headline"><a href="article.html?slug=${a.slug}">${a.headline}</a></h2>
        <p class="ali-deck">${a.deck}</p>
        <span class="ali-meta">${a.author} · ${a.date_label} · ${a.read_time}</span>
      </div>
    </div>
  `).join('');
}

// ── BOOTSTRAP ────────────────────────────────────────────────────────────────
fetch(ARTICLES_URL + '?v=' + Date.now())
  .then(r => r.json())
  .then(data => {
    const articles = data.articles || [];
    const page = document.body.dataset.page;

    if (page === 'home')       renderHomepage(articles);
    if (page === 'article')    renderArticlePage(articles);
    if (page === 'breaking')   renderCategoryPage(articles, 'breaking');
    if (page === 'prophecy')   renderCategoryPage(articles, 'prophecy');
    if (page === 'israel')     renderCategoryPage(articles, 'israel');
    if (page === 'all')        renderCategoryPage(articles, 'all');
  })
  .catch(err => console.warn('ADN: Could not load articles.json', err));
