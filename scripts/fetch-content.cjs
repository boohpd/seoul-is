/**
 * Content Fetcher for seoul.is v3
 * Fetches content + auto-generates thumbnail URLs from Unsplash/Pexels
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ============ IMAGE STRATEGY ============

// Category-specific curated Unsplash images (free, no API key needed)
// Using Unsplash Source which auto-serves relevant images by keyword
function getImageForItem(item, index) {
  const categoryImages = {
    kpop: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop', // concert
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop', // music
      'https://images.unsplash.com/photo-1501386761578-0a55f5b2adc7?w=600&h=400&fit=crop', // stage
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop', // dj/music
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop', // headphones
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop', // concert lights
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop', // crowd concert
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop', // festival
      'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop', // kpop vibe
      'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600&h=400&fit=crop', // neon lights
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop', // concert
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&h=400&fit=crop', // stage lights
    ],
    kdrama: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=400&fit=crop', // cinema
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop', // movie theater
      'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&h=400&fit=crop', // tv
      'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&h=400&fit=crop', // popcorn
      'https://images.unsplash.com/photo-1585951237313-1979e4df7385?w=600&h=400&fit=crop', // korean street
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=400&fit=crop', // cinema
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=400&fit=crop', // film
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop', // film reel
      'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=600&h=400&fit=crop', // seoul night
      'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&h=400&fit=crop', // streaming
      'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=600&h=400&fit=crop', // korean alley
      'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&h=400&fit=crop', // movie
    ],
    food: [
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop', // korean food
      'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop', // bibimbap
      'https://images.unsplash.com/photo-1583224994076-0a3f4b1011d3?w=600&h=400&fit=crop', // korean bbq
      'https://images.unsplash.com/photo-1567533708067-5b62456a9406?w=600&h=400&fit=crop', // ramen
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop', // plated food
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', // fine dining
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop', // restaurant
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop', // restaurant interior
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop', // food plate
      'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop', // street food
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop', // restaurant
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop', // food
    ],
    places: [
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&h=400&fit=crop', // seoul tower
      'https://images.unsplash.com/photo-1546874177-9e664107314e?w=600&h=400&fit=crop', // seoul street
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&h=400&fit=crop', // cafe
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&h=400&fit=crop', // cafe interior
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop', // cafe window
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop', // bar
      'https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=600&h=400&fit=crop', // seoul neon
      'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=600&h=400&fit=crop', // korean temple
      'https://images.unsplash.com/photo-1506816561089-5cc37b3aa9b0?w=600&h=400&fit=crop', // rooftop
      'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop', // neon alley
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop', // travel
      'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=600&h=400&fit=crop', // seoul
    ],
    ranking: [
      'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=600&h=400&fit=crop', // trophy
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop', // city skyline
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop', // chart
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop', // data dashboard
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', // analytics
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop', // screens
      'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=600&h=400&fit=crop', // numbers
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=400&fit=crop', // cinema
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop', // film
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&h=400&fit=crop', // seoul skyline
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop', // streaming
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop', // podcast
    ],
    lifestyle: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop', // beauty
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', // skincare
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop', // fashion
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop', // fashion show
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=400&fit=crop', // lifestyle
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=400&fit=crop', // beauty products
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop', // makeup
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', // shopping
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop', // fashion
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop', // perfume
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop', // tech lifestyle
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop', // shopping bags
    ],
  };

  const images = categoryImages[item.category] || categoryImages.kpop;
  return images[index % images.length];
}

// ============ RSS FETCHER ============

async function fetchText(url, timeout = 10000) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; seoul.is/1.0)' },
      signal: AbortSignal.timeout(timeout),
    });
    return await res.text();
  } catch { return ''; }
}

async function fetchRSS(url) {
  const text = await fetchText(url);
  if (!text) return [];
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const xml = match[1];
    const getTag = (tag) => {
      const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? (m[1] || m[2] || '').trim() : '';
    };
    const sourceMatch = xml.match(/<source[^>]*>([^<]+)<\/source>/i);
    items.push({
      title: getTag('title'),
      link: getTag('link'),
      description: getTag('description').replace(/<[^>]+>/g, '').substring(0, 200),
      pubDate: getTag('pubDate'),
      source: sourceMatch ? sourceMatch[1].trim() : '',
    });
  }
  return items;
}

// ============ MAIN ============

async function main() {
  console.log('🚀 seoul.is content fetcher v3');
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
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cat.query)}&hl=en-US&gl=US&ceid=US:en`;
    const rssItems = await fetchRSS(rssUrl);
    console.log(`${cat.emoji} ${cat.label}: ${rssItems.length} articles from RSS`);

    results[cat.id] = rssItems.slice(0, 12).map((item, i) => ({
      id: Buffer.from(item.link).toString('base64url').substring(0, 24),
      title: item.title,
      description: item.description,
      url: item.link,
      image: getImageForItem({ category: cat.id }, i),
      source: item.source || 'Google News',
      category: cat.id,
      date: item.pubDate || new Date().toISOString(),
      sponsored: false,
    }));
    console.log(`  ✅ ${results[cat.id].length} items with curated images`);
  }

  // Write files
  for (const [cat, items] of Object.entries(results)) {
    fs.writeFileSync(path.join(DATA_DIR, `${cat}.json`), JSON.stringify(items, null, 2));
  }

  const featuredPath = path.join(DATA_DIR, 'featured.json');
  if (!fs.existsSync(featuredPath)) {
    fs.writeFileSync(featuredPath, JSON.stringify([], null, 2));
  }

  fs.writeFileSync(path.join(DATA_DIR, 'meta.json'), JSON.stringify({
    lastUpdated: new Date().toISOString(),
    counts: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.length])),
  }, null, 2));

  const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`\n🎉 Done! ${total} items, all with curated category images.`);
}

main().catch(console.error);
