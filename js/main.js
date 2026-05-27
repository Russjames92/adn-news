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

// ── DYNAMIC TICKER ─────────────────────────────────────────────────────────
(function () {
  const tickerEl = document.querySelector('.ticker-items');
  if (!tickerEl) return;
  fetch('ticker.json?v=' + Date.now())
    .then(r => r.json())
    .then(data => {
      if (!data.items || !data.items.length) return;
      const oneSet = data.items.map(item =>
        '<span class="ticker-item"><span class="ticker-label">' + item.label + '</span> ' + item.text + '</span><span class="ticker-sep" aria-hidden="true">&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>'
      ).join('');
      // Triple the content so the loop is always seamless
      tickerEl.innerHTML = oneSet + oneSet + oneSet;
      // Kill CSS animation — drive with rAF for buttery smoothness
      tickerEl.style.animation = 'none';
      tickerEl.style.willChange = 'transform';
      var speed = 0.45; // px per frame at 60fps
      var pos = 0;
      var oneWidth = 0;
      function measure() {
        oneWidth = tickerEl.scrollWidth / 3;
        if (oneWidth > 0) requestAnimationFrame(tick);
      }
      function tick() {
        pos += speed;
        if (pos >= oneWidth) pos -= oneWidth;
        tickerEl.style.transform = 'translateX(-' + pos + 'px)';
        requestAnimationFrame(tick);
      }
      // setTimeout 0 guarantees browser has fully laid out the new innerHTML
      setTimeout(measure, 50);
    })
    .catch(function() {});
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

// articleImg — renders real photo when img_url exists, otherwise SVG placeholder
// size: 'hero' | 'card' | 'thumb' | 'list'
function articleImg(a, size) {
  const heights = { hero: '460px', card: '220px', thumb: '110px', list: '150px' };
  const h = heights[size] || '220px';
  if (a.img_url) {
    const attr = a.img_attribution ? `<span class="img-attribution">${a.img_attribution}</span>` : '';
    // For hero size: let the CSS grid cell control height (position:absolute fill)
    // For other sizes: use fixed-height wrapper as before
    if (size === 'hero') {
      return `<div class="article-photo-wrap article-photo-wrap--hero" style="position:absolute;inset:0;overflow:hidden;background:#111;">
        <img src="${a.img_url}" alt="${a.headline}" style="width:100%;height:100%;object-fit:cover;display:block;" loading="eager" />
        ${attr}
      </div>`;
    }
    return `<div class="article-photo-wrap" style="position:relative;width:100%;height:${h};overflow:hidden;background:#111;">
      <img src="${a.img_url}" alt="${a.headline}" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy" />
      ${attr}
    </div>`;
  }
  const ic = svgIcons[a.img_class] || svgIcons['img-hero'];
  return `<div class="${a.img_class}" style="width:100%;height:${h};display:flex;align-items:center;justify-content:center;">${ic}</div>`;
}

// ── SAFE TEXT HELPERS ───────────────────────────────────────────────────────
// Prevents $ signs and backticks in article text from breaking template literals
function safe(str) {
  return (str || '').replace(/`/g, '\u0060').replace(/\$/g, '&#36;');
}
// Encodes a slug for safe use in data-attributes and href values
function safeSlug(slug) {
  return encodeURIComponent(slug || '');
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

  // --- SEO: Dynamic meta, Open Graph, Twitter Card, Article Schema ---
  const SITE_BASE_SEO = 'https://www.adn-news.net';
  const articlePageUrl = SITE_BASE_SEO + '/article.html?slug=' + a.slug;
  const articleImg_url = a.img_url ? (SITE_BASE_SEO + '/' + a.img_url) : (SITE_BASE_SEO + '/images/logo.png');
  const descText = a.deck || 'Eschatology reporting for the discerning believer.';

  // Meta description
  const metaDesc = document.getElementById('meta-description');
  if (metaDesc) metaDesc.setAttribute('content', descText);

  // Open Graph
  const ogTitle = document.getElementById('og-title');
  const ogDesc  = document.getElementById('og-description');
  const ogUrl   = document.getElementById('og-url');
  const ogImg   = document.getElementById('og-image');
  if (ogTitle) ogTitle.setAttribute('content', a.headline + ' — ADN News');
  if (ogDesc)  ogDesc.setAttribute('content', descText);
  if (ogUrl)   ogUrl.setAttribute('content', articlePageUrl);
  if (ogImg)   ogImg.setAttribute('content', articleImg_url);

  // Twitter Card
  const twTitle = document.getElementById('tw-title');
  const twDesc  = document.getElementById('tw-description');
  const twImg   = document.getElementById('tw-image');
  if (twTitle) twTitle.setAttribute('content', a.headline + ' — ADN News');
  if (twDesc)  twDesc.setAttribute('content', descText);
  if (twImg)   twImg.setAttribute('content', articleImg_url);

  // Article Schema (JSON-LD)
  const existingSchema = document.getElementById('article-schema');
  if (existingSchema) existingSchema.remove();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': a.headline,
    'description': descText,
    'datePublished': a.date,
    'dateModified': a.date,
    'author': { '@type': 'Person', 'name': a.author },
    'publisher': {
      '@type': 'Organization',
      'name': 'ADN News',
      'url': SITE_BASE_SEO,
      'logo': { '@type': 'ImageObject', 'url': SITE_BASE_SEO + '/images/logo.png' }
    },
    'image': articleImg_url,
    'url': articlePageUrl,
    'mainEntityOfPage': { '@type': 'WebPage', '@id': articlePageUrl }
  };
  const schemaTag = document.createElement('script');
  schemaTag.id = 'article-schema';
  schemaTag.type = 'application/ld+json';
  schemaTag.textContent = JSON.stringify(schema);
  document.head.appendChild(schemaTag);
  // --- End SEO ---

  const bodyHtml = a.body.map(p => `<p>${safe(p)}</p>`).join('');
  // Always use the permanent public site URL for share links so Facebook/Twitter get a valid URL.
  const SITE_BASE = 'https://www.adn-news.net';
  const rawUrl = SITE_BASE + '/article.html?slug=' + a.slug;
  const articleUrl = encodeURIComponent(rawUrl);
  const articleTitle = encodeURIComponent(a.headline);
  const shareBar = `
    <div class="share-bar">
      <span class="share-label">Share</span>
      <a class="share-btn share-btn--facebook" href="https://www.facebook.com/sharer/sharer.php?u=${articleUrl}" target="_blank" rel="noopener" aria-label="Share on Facebook">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        Facebook
      </a>
      <a class="share-btn share-btn--twitter" href="https://twitter.com/intent/tweet?url=${articleUrl}&text=${articleTitle}" target="_blank" rel="noopener" aria-label="Share on X (Twitter)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X / Twitter
      </a>
      <a class="share-btn share-btn--email" href="mailto:?subject=${articleTitle}&body=Check%20out%20this%20story%20from%20ADN%20News%3A%20${articleUrl}" aria-label="Share via Email">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
        Email
      </a>
      <button class="share-btn share-btn--copy" onclick="(function(btn){navigator.clipboard.writeText('${rawUrl}' || window.location.href).then(function(){var orig=btn.innerHTML;btn.innerHTML='<svg width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\'><polyline points=\'20 6 9 17 4 12\'/></svg> Copied!';btn.classList.add(\'share-btn--copied\');setTimeout(function(){btn.innerHTML=orig;btn.classList.remove(\'share-btn--copied\');},2000);})})(this)" aria-label="Copy link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy Link
      </button>
    </div>
  `;
  document.getElementById('article-root').innerHTML = `
    <div class="article-hero-wrap">${articleImg(a, 'hero')}</div>
    <div class="article-wrap">
      <span class="category-badge ${badgeClass(a.category)}" style="margin-bottom:var(--space-4);display:inline-flex;">${safe(a.category_label)}</span>
      <h1 class="article-page-headline">${safe(a.headline)}</h1>
      <p class="article-page-deck">${safe(a.deck)}</p>
      <div class="article-byline">
        <span class="author">${safe(a.author)}</span>
        <span class="divider">·</span><span>${safe(a.date_label)}</span>
        <span class="divider">·</span><span>${safe(a.read_time)}</span>
        <span class="satire-tag-inline">Satire <span class="sarcasm-tag">100%</span></span>
      </div>
      ${shareBar}
      <div class="article-body-text">
        ${bodyHtml}
        <div class="pull-quote-article">
          "${safe(a.pull_quote)}"
          <br><span style="font-size:var(--text-sm);font-style:normal;font-family:var(--font-sans);font-weight:600;color:var(--color-text-faint);">— ${safe(a.pull_quote_attribution)}</span>
        </div>
        <div class="postmill-note">
          <strong>ADN Editorial Note:</strong> ${safe(a.postmill_note)}
        </div>
        <p style="color:var(--color-text-faint);font-size:var(--text-sm);font-style:italic;margin-top:var(--space-8);border-top:1px solid var(--color-border);padding-top:var(--space-4);">
          This story is entirely fictional. All persons, events, and institutes named are satirical inventions. Offered in Christian love.
        </p>
      </div>
      <div class="related-stories">
        <h2 style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">More From ADN News</h2>
        <div class="related-grid">
          ${articles.filter(x => x.slug !== slug).slice(0, 3).map(r => `
            <div class="related-card" data-slug="${safeSlug(r.slug)}" style="cursor:pointer;">
              ${articleImg(r, 'thumb')}
              <span class="cat" style="font-family:var(--font-sans);font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-text-faint);">${safe(r.category_label)}</span>
              <h3 style="font-family:var(--font-display);font-size:var(--text-base);font-weight:700;line-height:1.3;transition:color var(--transition-interactive);">
                <a href="article.html?slug=${safeSlug(r.slug)}">${safe(r.headline)}</a>
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
  // ── FRONT PAGE 3-COLUMN ABOVE-THE-FOLD ──────────────────────────────────────
  const hero = articles[0];
  const remaining = articles.filter(a => a.slug !== hero.slug);

  // LEFT column — 2 stories (articles[1] and articles[2]), text-only
  const fpLeft = document.getElementById('fp-left');
  if (fpLeft && hero) {
    const leftStories = remaining.slice(0, 2);
    fpLeft.innerHTML = leftStories.map((a, i) => `
      <article class="fp-secondary${i === 0 ? ' fp-secondary--border-top' : ''}" data-slug="${safeSlug(a.slug)}">
        <span class="category-badge ${badgeClass(a.category)} fp-badge">${safe(a.category_label)}</span>
        <h2 class="fp-secondary-headline"><a href="article.html?slug=${safeSlug(a.slug)}">${safe(a.headline)}</a></h2>
        <p class="fp-secondary-deck">${safe(a.deck)}</p>
        <span class="fp-secondary-meta">${safe(a.author)} · ${safe(a.date_label)}</span>
      </article>
    `).join('<hr class="fp-divider" />');
  }

  // CENTER column — hero with full image
  const fpCenter = document.getElementById('fp-center');
  if (fpCenter && hero) {
    const imgHtml = hero.img_url
      ? `<img src="${hero.img_url}" alt="${safe(hero.headline)}" loading="eager" />`
      : `<div class="${hero.img_class || 'img-hero'}" style="width:100%;height:100%;"></div>`;
    fpCenter.innerHTML = `
      <a href="article.html?slug=${safeSlug(hero.slug)}" class="fp-hero-link">
        <div class="fp-hero-image">${imgHtml}</div>
        <div class="fp-hero-content">
          <span class="category-badge ${badgeClass(hero.category)} fp-badge">${safe(hero.category_label)}</span>
          <h1 class="fp-hero-headline">${safe(hero.headline)}</h1>
          <p class="fp-hero-deck">${safe(hero.deck)}</p>
          <div class="fp-hero-meta">
            <span>By ${safe(hero.author)}</span>
            <span class="fp-hero-meta-sep">·</span>
            <span>${safe(hero.date_label)}</span>
            <span class="fp-hero-meta-sep">·</span>
            <span>${safe(hero.read_time)}</span>
          </div>
        </div>
      </a>
    `;
  }

  // RIGHT column — "Latest" list (articles 3–6)
  const fpRight = document.getElementById('fp-right');
  if (fpRight && hero) {
    const latestStories = remaining.slice(2, 7);
    fpRight.innerHTML = `
      <div class="fp-latest-header">Latest</div>
      <ol class="fp-latest-list">
        ${latestStories.map(a => `
          <li class="fp-latest-item" data-slug="${safeSlug(a.slug)}">
            <span class="category-badge ${badgeClass(a.category)} fp-badge">${safe(a.category_label)}</span>
            <h3 class="fp-latest-headline"><a href="article.html?slug=${safeSlug(a.slug)}">${safe(a.headline)}</a></h3>
            <span class="fp-latest-meta">${safe(a.date_label)}</span>
          </li>
        `).join('')}
      </ol>
      <div class="fp-editorial-note">
        <strong>Note:</strong> ADN News is satirical. All stories are fictional. We poke fun at end-times sensationalism with love.
      </div>
    `;
  }

  // TOP STORIES — next 3 after the above-fold articles (overlap is fine, serves as content reinforcement)
  const topStories = remaining.slice(2, 5);
  const topGrid = document.getElementById('top-stories-grid');
  if (topGrid) {
    topGrid.innerHTML = topStories.map(a => `
      <article class="story-card" data-slug="${safeSlug(a.slug)}" style="cursor:pointer;">
        <div class="story-card-image">${articleImg(a, 'card')}</div>
        <span class="category-badge ${badgeClass(a.category)}">${safe(a.category_label)}</span>
        <h2 class="story-card-headline"><a href="article.html?slug=${safeSlug(a.slug)}">${safe(a.headline)}</a></h2>
        <p class="story-card-deck">${safe(a.deck)}</p>
        <div class="story-card-meta"><span>${safe(a.date_label)}</span> · <span>${safe(a.read_time)}</span></div>
      </article>
    `).join('');
  }

  // MOST PROPHESIED SIDEBAR LIST
  const sidebarList = document.getElementById('most-prophesied-list');
  if (sidebarList) {
    sidebarList.innerHTML = articles.slice(0, 5).map((a, i) => `
      <li class="story-list-item" data-slug="${safeSlug(a.slug)}" style="cursor:pointer;">
        <span class="story-list-num">${i + 1}</span>
        <div class="story-list-content">
          <a href="article.html?slug=${safeSlug(a.slug)}" class="story-list-headline">${safe(a.headline)}</a>
          <span class="story-list-meta">${safe(a.category_label)} · ${safe(a.date_label.split(' ').slice(0, 2).join(' '))}</span>
        </div>
      </li>
    `).join('');
  }

  // PROPHECY WATCH SECTION
  const pwGrid = document.getElementById('prophecy-watch-grid');
  if (pwGrid) {
    const pw = articles.filter(a => a.category === 'prophecy').slice(0, 3);
    pwGrid.innerHTML = pw.map(a => `
      <article class="story-card" data-slug="${safeSlug(a.slug)}" style="cursor:pointer;">
        <div class="story-card-image">${articleImg(a, 'card')}</div>
        <span class="category-badge badge-prophecy">${safe(a.category_label)}</span>
        <h2 class="story-card-headline"><a href="article.html?slug=${safeSlug(a.slug)}">${safe(a.headline)}</a></h2>
        <p class="story-card-deck">${safe(a.deck)}</p>
        <div class="story-card-meta"><span>${safe(a.date_label)}</span> · <span>${safe(a.read_time)}</span></div>
      </article>
    `).join('');
  }

  // OPINION SECTION — dedicated opinion category articles
  const opinionCards = document.getElementById('opinion-cards');
  if (opinionCards) {
    const authorMeta = {
      'Chester T. Rapture':   { initials: 'CT', color: 'var(--color-primary)',  title: 'Senior Eschatology Correspondent' },
      'Donna Prebulation':    { initials: 'DP', color: '#7a4f9b',               title: 'Tribulation Desk Reporter' },
      'Norman Dispensation':  { initials: 'ND', color: 'var(--color-gold)',     title: 'Prophetic Timeline Specialist' },
      'Priscilla Millstone':  { initials: 'PM', color: 'var(--color-blue)',     title: 'Kingdom Advancement Reporter' },
    };
    const opinionPool = articles.filter(a => a.category === 'opinion');
    opinionCards.innerHTML = opinionPool.slice(0, 3).map(a => {
      const m = authorMeta[a.author] || { initials: a.author.split(' ').map(w=>w[0]).join('').slice(0,2), color: 'var(--color-primary)', title: 'Correspondent' };
      return `
        <div class="opinion-card" data-slug="${safeSlug(a.slug)}" style="cursor:pointer;">
          <div class="opinion-author-line">
            <div class="avatar-initials" style="background:${m.color};">${m.initials}</div>
            <div>
              <div class="opinion-author-name">${safe(a.author)}</div>
              <div class="opinion-author-title">${m.title}</div>
            </div>
          </div>
          <h3 class="opinion-card-headline"><a href="article.html?slug=${safeSlug(a.slug)}">${safe(a.headline)}</a></h3>
          <p class="opinion-card-excerpt">${safe(a.deck)}</p>
        </div>
      `;
    }).join('');
  }

  // ISRAEL SECTION
  const israelGrid = document.getElementById('israel-grid');
  if (israelGrid) {
    const il = articles.filter(a => a.category === 'israel').slice(0, 3);
    israelGrid.innerHTML = il.map(a => `
      <article class="story-card" data-slug="${safeSlug(a.slug)}" style="cursor:pointer;">
        <div class="story-card-image">${articleImg(a, 'card')}</div>
        <span class="category-badge badge-israel">${safe(a.category_label)}</span>
        <h2 class="story-card-headline"><a href="article.html?slug=${safeSlug(a.slug)}">${safe(a.headline)}</a></h2>
        <p class="story-card-deck">${safe(a.deck)}</p>
        <div class="story-card-meta"><span>${safe(a.date_label)}</span></div>
      </article>
    `).join('');
  }

  // Delegated click handler for all data-slug cards
  document.addEventListener('click', function (e) {
    const card = e.target.closest('[data-slug]');
    if (!card) return;
    // Don't intercept if they clicked an <a> link directly
    if (e.target.closest('a')) return;
    const slug = card.dataset.slug;
    if (slug) location.href = 'article.html?slug=' + slug;
  });

  initFadeIn();
}

// ── CATEGORY PAGE RENDERER ───────────────────────────────────────────────────
function renderCategoryPage(articles, catFilter) {
  const listEl = document.getElementById('category-article-list');
  if (!listEl) return;
  const filtered = catFilter === 'all' ? articles : articles.filter(a => a.category === catFilter);
  listEl.innerHTML = filtered.map(a => `
    <div class="article-list-item" data-slug="${safeSlug(a.slug)}" style="cursor:pointer;">
      <div class="ali-image">${articleImg(a, 'list')}</div>
      <div class="ali-content">
        <span class="category-badge ${badgeClass(a.category)}" style="font-size:10px;padding:1px 6px;width:fit-content;">${safe(a.category_label)}</span>
        <h2 class="ali-headline"><a href="article.html?slug=${safeSlug(a.slug)}">${safe(a.headline)}</a></h2>
        <p class="ali-deck">${safe(a.deck)}</p>
        <span class="ali-meta">${safe(a.author)} · ${safe(a.date_label)} · ${safe(a.read_time)}</span>
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
