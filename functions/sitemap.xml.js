// ============================================================
// Cloudflare Pages Function — Dynamic Sitemap
// File location in your repo: functions/sitemap.xml.js
// ============================================================

export async function onRequest(context) {
  const baseUrl = 'https://yachtresearchgroup.com';
  const today = new Date().toISOString().split('T')[0];

  var staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/listings', priority: '0.9', changefreq: 'weekly' },
    { url: '/charter', priority: '0.9', changefreq: 'weekly' },
    { url: '/why-us', priority: '0.8', changefreq: 'monthly' },
    { url: '/bespoke', priority: '0.8', changefreq: 'monthly' },
    { url: '/partnerships', priority: '0.7', changefreq: 'monthly' },
    { url: '/recruitment', priority: '0.6', changefreq: 'monthly' },
    { url: '/yacht-research-form', priority: '0.9', changefreq: 'weekly' },
    { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  ];

  // 1) Index généré au build (seulement les yachts publiés, avec date de mise à jour)
  var yachtSlugs = [], lastmods = {};
  try {
    var idx = await context.env.ASSETS.fetch(new URL('/content/yachts/index.json', context.request.url));
    if (idx.ok) {
      var data = await idx.json();
      (data.yachts || []).forEach(function (y) { yachtSlugs.push(y.slug); if (y.updated) lastmods[y.slug] = y.updated; });
    }
  } catch (e) {}

  // 2) Secours : ancienne méthode (API GitHub) si l'index n'existe pas encore
  if (!yachtSlugs.length) try {
    var apiRes = await fetch(
      'https://api.github.com/repos/yacht-research/yacht-research/contents/content/yachts?ref=main',
      {
        headers: {
          'User-Agent': 'YachtResearch-Sitemap/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    if (apiRes.ok) {
      var files = await apiRes.json();
      if (Array.isArray(files)) {
        for (var i = 0; i < files.length; i++) {
          if (files[i].name && files[i].name.endsWith('.json')) {
            if (files[i].name !== 'index.json') yachtSlugs.push(files[i].name.replace('.json', ''));
          }
        }
      }
    }
  } catch (e) {
    // GitHub API unavailable — sitemap still includes static pages
  }

  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

  for (var j = 0; j < staticPages.length; j++) {
    var page = staticPages[j];
    xml += '  <url>\n';
    xml += '    <loc>' + baseUrl + page.url + '</loc>\n';
    xml += '    <lastmod>' + today + '</lastmod>\n';
    xml += '    <changefreq>' + page.changefreq + '</changefreq>\n';
    xml += '    <priority>' + page.priority + '</priority>\n';
    xml += '  </url>\n\n';
  }

  for (var k = 0; k < yachtSlugs.length; k++) {
    xml += '  <url>\n';
    xml += '    <loc>' + baseUrl + '/yacht/' + yachtSlugs[k] + '</loc>\n';
    xml += '    <lastmod>' + (lastmods[yachtSlugs[k]] || today) + '</lastmod>\n';
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n\n';
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache 10 minutes only — new yachts appear quickly
      'Cache-Control': 'public, max-age=600'
    }
  });
}
