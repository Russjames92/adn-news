/**
 * ADN News — OG meta tag server
 * Intercepts article.html?slug=X requests and injects correct
 * Open Graph meta tags so social share cards show the article image.
 * All other files are served statically from the same directory.
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 8000;
const DIR  = __dirname;

// Base URL for absolute OG image URLs — social crawlers need absolute URLs
// __PORT_8000__ is replaced at deploy time by deploy_website
const BASE = '__PORT_8000__'.startsWith('__')
  ? `http://localhost:${PORT}`
  : '__PORT_8000__';

// Load articles.json once at startup; reload on each request so cron updates are picked up
function getArticles() {
  try {
    const raw = fs.readFileSync(path.join(DIR, 'articles.json'), 'utf8');
    return JSON.parse(raw).articles || [];
  } catch (e) {
    return [];
  }
}

// Serve article.html with injected OG tags
app.get('/article.html', (req, res) => {
  const slug     = req.query.slug || '';
  const articles = getArticles();
  const article  = articles.find(a => a.slug === slug);

  let html = fs.readFileSync(path.join(DIR, 'article.html'), 'utf8');

  if (article) {
    const title       = article.headline.replace(/"/g, '&quot;');
    const description = (article.deck || '').replace(/"/g, '&quot;');
    const imgPath     = article.img_url || 'images/logo.png';
    // img_url is relative (e.g. "images/adn_img_foo.png") — make it absolute
    const imgAbsolute = `${BASE}/${imgPath}`;
    const pageUrl     = `${BASE}/article.html?slug=${encodeURIComponent(slug)}`;

    const ogTags = `
  <!-- Open Graph / Social Share -->
  <meta property="og:type"        content="article" />
  <meta property="og:url"         content="${pageUrl}" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image"       content="${imgAbsolute}" />
  <meta property="og:image:width" content="1600" />
  <meta property="og:image:height" content="900" />
  <meta property="og:site_name"   content="ADN News" />
  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image"       content="${imgAbsolute}" />`;

    // Inject right before </head>
    html = html.replace('</head>', ogTags + '\n</head>');

    // Also update the <title> tag
    html = html.replace(
      /<title>[^<]*<\/title>/,
      `<title>${title} — ADN News</title>`
    );
  }

  res.set('Content-Type', 'text/html');
  res.send(html);
});

// Serve everything else statically (images, css, js, other html pages)
app.use(express.static(DIR));

// Fallback: serve index.html for bare /
app.get('/', (req, res) => {
  res.sendFile(path.join(DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ADN News OG server running on port ${PORT}`);
});
