// Cloudflare Pages Function — handles /article.html requests
// Injects per-article Open Graph meta tags so Facebook/Twitter/iMessage
// share cards show the actual article image and headline instead of a generic preview.

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  // Fetch the base article.html static asset
  const htmlResponse = await context.env.ASSETS.fetch(
    new Request(url.origin + '/article.html')
  );
  let html = await htmlResponse.text();

  if (!slug) {
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }

  // Fetch articles.json to find this article
  let article = null;
  try {
    const articlesResp = await context.env.ASSETS.fetch(
      new Request(url.origin + '/articles.json')
    );
    const data = await articlesResp.json();
    article = (data.articles || []).find(a => a.slug === slug);
  } catch (e) {
    // If fetch fails, serve the page without OG injection
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }

  if (!article) {
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }

  const siteBase = 'https://www.adn-news.net';
  const articleUrl = `${siteBase}/article.html?slug=${encodeURIComponent(article.slug)}`;
  const imgUrl = article.img_url
    ? `${siteBase}/${article.img_url}`
    : `${siteBase}/images/logo.png`;
  const title = article.headline;
  const description = article.deck;

  // Build the OG tags block
  const ogTags = `
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="ADN News" />
  <meta property="og:url" content="${articleUrl}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${imgUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="675" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${imgUrl}" />
  <meta name="description" content="${escapeHtml(description)}" />`;

  // Replace the generic title and inject OG tags before </head>
  html = html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)} — ADN News</title>`)
    .replace('</head>', ogTags + '\n</head>');

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
