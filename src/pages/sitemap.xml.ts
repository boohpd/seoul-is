export async function GET() {
  const pages = [
    { url: 'https://seoul.is/', priority: '1.0', changefreq: 'daily' },
    { url: 'https://seoul.is/explore/', priority: '0.9', changefreq: 'daily' },
    { url: 'https://seoul.is/flights/', priority: '0.9', changefreq: 'daily' },
    { url: 'https://seoul.is/stays/', priority: '0.9', changefreq: 'daily' },
    { url: 'https://seoul.is/guide/', priority: '0.9', changefreq: 'weekly' },
    { url: 'https://seoul.is/guide/tmoney-card-guide/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/guide/seoul-subway-guide/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/guide/korea-esim-guide/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/guide/best-neighborhoods-seoul/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/guide/myeongdong-shopping-guide/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/guide/korean-food-guide/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/guide/dmz-tour-guide/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/guide/han-river-activities/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/guide/seoul-nightlife-guide/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/guide/tax-refund-korea/', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://seoul.is/about/', priority: '0.5', changefreq: 'monthly' },
    { url: 'https://seoul.is/contact/', priority: '0.5', changefreq: 'monthly' },
    { url: 'https://seoul.is/advertise/', priority: '0.6', changefreq: 'monthly' },
    { url: 'https://seoul.is/privacy/', priority: '0.3', changefreq: 'yearly' },
  ];

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
