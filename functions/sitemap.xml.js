// ============================================================
// Cloudflare Pages Function — Dynamic Sitemap
// File location in your repo: functions/sitemap.xml.js
// Accessible at: yachtresearchgroup.com/sitemap.xml
// ============================================================

export async function onRequest(context) {
  const baseUrl = 'https://yachtresearchgroup.com';
  const today = new Date().toISOString().split('T')[0];

  // Static pages
  var staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/listings', priority: '0.9', changefreq: 'weekly' },
    { url: '/charter', priority: '0.9', changefreq: 'weekly' },
    { url: '/why-us', priority: '0.8', changefreq: 'monthly' },
    { url: '/bespoke', priority: '0.8', changefreq: 'monthly' },
    { url: '/partnerships', priority: '0.7', changefreq: 'monthly' },
    { url: '/recruitment', priority: '0.6', changefreq: 'monthly' },
    { url: '/yacht-research-form', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  ];

  // Fetch yacht slugs from GitHub API
  var yachtSlugs = [];
  try {
    var apiRes = await fetch(
      'https://api.github.com/repos/yacht-research/yacht-research/contents/content/yachts?ref=main',
      { headers: { 'User-Agent': 'YachtResearch-Sitemap/1.0' } }
    );
    if (apiRes.ok) {
      var files = await apiRes.json();
      if (Array.isArray(files)) {
        for (var i = 0; i < files.length; i++) {
          var f = files[i];
          if (f.name && f.name.endsWith('.json')) {
            var slug = f.name.replace('.json', '');
            // Only include published yachts
            try {
              var yachtRes = await fetch(baseUrl + '/content/yachts/' + f.name);
              if (yachtRes.ok) {
                var yacht = await yachtRes.json();
                if (yacht && yacht.published !== false) {
                  yachtSlugs.push(slug);
                }
              }
            } catch (e) {
              yachtSlugs.push(slug);
            }
          }
        }
      }
    }
  } catch (e) {
    // GitHub API unavailable — sitemap will still include static pages
  }

  // Build XML
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

  // Static pages
  for (var j = 0; j < staticPages.length; j++) {
    var page = staticPages[j];
    xml += '  <url>\n';
    xml += '    <loc>' + baseUrl + page.url + '</loc>\n';
    xml += '    <lastmod>' + today + '</lastmod>\n';
    xml += '    <changefreq>' + page.changefreq + '</changefreq>\n';
    xml += '    <priority>' + page.priority + '</priority>\n';
    xml += '  </url>\n\n';
  }

  // Yacht pages
  for (var k = 0; k < yachtSlugs.length; k++) {
    xml += '  <url>\n';
    xml += '    <loc>' + baseUrl + '/yacht/' + yachtSlugs[k] + '</loc>\n';
    xml += '    <lastmod>' + today + '</lastmod>\n';
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n\n';
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
