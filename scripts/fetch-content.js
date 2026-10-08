/**
 * Content Fetcher for seoul.is
 * Fetches content + thumbnails from various sources.
 * Usage: node scripts/fetch-content.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ============ HELPERS ============

async function fetchText(url, timeout = 10000) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; seoul.is/1.0; +https://seoul.is)' },
      signal: AbortSignal.timeout(timeout),
      redirect: 'follow',
    });
    return await res.text();
  } catch (e) {
    return '';
  }
}

// Extract OG image from a page's HTML
function extractOGImage(html) {
  // Try og:image first
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch) return ogMatch[1];

  // Try twitter:image
  const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
  if (twMatch) return twMatch[1];

  // Try first large image in article
  const imgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(jpg|jpeg|png|webp)[^"']*)["'][^>]*width=["']?(\d+)/i);
  if (imgMatch && parseInt(imgMatch[3]) >= 200) return imgMatch[1];

  return '';
}

// Fetch OG image for a URL (with caching to be polite)
const imageCache = new Map();
async function getArticleImage(url) {
  if (!url || url.includes('news.google.com')) {
    // Google News URLs redirect — try to get the actual URL
    return '';
  }
  if (imageCache.has(url)) return imageCache.get(url);

  const html = await fetchText(url, 8000);
  const img = extractOGImage(html);
  imageCache.set(url, img);
  return img;
}

// Resolve Google News redirect URL to actual article URL
async function resolveGoogleNewsUrl(gnUrl) {
  try {
    const res = await fetch(gnUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; seoul.is/1.0)' },
      signal: AbortSignal.timeout(8000),
      redirect: 'manual',
    });
    const location = res.headers.get('location');
    if (location && !location.includes('google.com')) return location;
    // If no redirect, try extracting from HTML
    const html = await res.text();
    const match = html.match(/data-url="([^"]+)"/i) || html.match(/href="(https?:\/\/(?!news\.google)[^"]+)"/i);
    if (match) return match[1];
    return gnUrl;
  } catch {
    return gnUrl;
  }
}

async function fetchRSS(url) {
  const text = await fetchText(url);
  if (!text) return [];
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(text)) !== null) {
    const xml = match[1];
    const getTag = (tag) => {
      const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? (m[1] || m[2] || '').trim() : '';
    };
    let image = '';
    const mediaMatch = xml.match(/url="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
    if (mediaMatch) image = mediaMatch[1];
    if (!image) {
      const imgMatch = xml.match(/<img[^>]+src="(https?:\/\/[^"]+)"/i);
      if (imgMatch) image = imgMatch[1];
    }
    const sourceMatch = xml.match(/<source[^>]*>([^<]+)<\/source>/i);
    items.push({
      title: getTag('title'),
      link: getTag('link'),
      description: getTag('description').replace(/<[^>]+>/g, '').substring(0, 200),
      pubDate: getTag('pubDate'),
      image,
      source: sourceMatch ? sourceMatch[1].trim() : new URL(url).hostname.replace('news.google.com', 'Google News'),
    });
  }
  return items;
}

// ============ CATEGORY FETCHERS ============

async function fetchCategory(label, emoji, query, category, limit = 12) {
  console.log(`${emoji} Fetching ${label}...`);
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const rssItems = await fetchRSS(rssUrl);
  const items = [];

  for (const item of rssItems.slice(0, limit)) {
    let image = item.image;

    // Try to get article thumbnail if RSS didn't provide one
    if (!image) {
      try {
        const realUrl = await resolveGoogleNewsUrl(item.link);
        image = await getArticleImage(realUrl);
        // Small delay to be polite
        await new Promise(r => setTimeout(r, 300));
      } catch {}
    }

    items.push({
      id: Buffer.from(item.link).toString('base64url').substring(0, 24),
      title: item.title,
      description: item.description,
      url: item.link,
      image: image || '',
      source: item.source,
      category,
      date: item.pubDate || new Date().toISOString(),
      sponsored: false,
    });
  }

  return items;
}

// ============ MAIN ============

async function main() {
  console.log('🚀 seoul.is content fetcher starting...');
  console.log(`📅 ${new Date().toISOString()}\n`);

  const categories = [
    { label: 'K-POP', emoji: '🎵', query: 'kpop korea music chart 2026', id: 'kpop' },
    { label: 'K-DRAMA', emoji: '🎬', query: 'korean drama kdrama netflix 2026', id: 'kdrama' },
    { label: 'FOOD', emoji: '🍜', query: 'seoul restaurant michelin korean food best', id: 'food' },
    { label: 'HOT PLACES', emoji: '📍', query: 'seoul cafe bar hotplace trending travel', id: 'places' },
    { label: 'RANKING', emoji: '🏆', query: 'korea chart top ranking box office kpop', id: 'ranking' },
    { label: 'LIFESTYLE', emoji: '✨', query: 'korea beauty fashion lifestyle seoul trend', id: 'lifestyle' },
  ];

  const results = {};
  for (const cat of categories) {
    results[cat.id] = await fetchCategory(cat.label, cat.emoji, cat.query, cat.id);
    console.log(`  ✅ ${cat.id}: ${results[cat.id].length} items (${results[cat.id].filter(i => i.image).length} with images)`);
  }

  // Write files
  for (const [cat, items] of Object.entries(results)) {
    fs.writeFileSync(path.join(DATA_DIR, `${cat}.json`), JSON.stringify(items, null, 2));
  }

  // Write empty featured.json if not exists
  const featuredPath = path.join(DATA_DIR, 'featured.json');
  if (!fs.existsSync(featuredPath)) {
    fs.writeFileSync(featuredPath, JSON.stringify([], null, 2));
  }

  // Write meta
  fs.writeFileSync(path.join(DATA_DIR, 'meta.json'), JSON.stringify({
    lastUpdated: new Date().toISOString(),
    counts: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.length])),
    withImages: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.filter(i => i.image).length])),
  }, null, 2));

  const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  const withImg = Object.values(results).reduce((sum, arr) => sum + arr.filter(i => i.image).length, 0);
  console.log(`\n🎉 Done! ${total} items fetched, ${withImg} with thumbnails.`);
}

main().catch(console.error);
