#!/usr/bin/env node
/**
 * Seoul.is Article Auto-Crawler v2
 * Real pipeline: gsk search → crawl top URLs → AI summarize → HTML article
 *
 * Usage:
 *   node scripts/crawl-articles.mjs              # new articles only
 *   node scripts/crawl-articles.mjs --force       # regenerate all
 *   node scripts/crawl-articles.mjs --slug itaewon-guide  # single article
 *   node scripts/crawl-articles.mjs --stale 30    # regenerate articles older than 30 days
 */

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '../src/data/articles');
const IMAGES_DIR   = path.join(__dirname, '../public/images/articles');
const DATA_DIR     = path.join(__dirname, '../data');
const GSK = '/Users/mattkim/Library/Application Support/Genspark Claw/bundled-resources/openclaw/node_modules/.bin/gsk';

// Ensure image output directory exists
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// ── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FORCE      = args.includes('--force');
const STALE_DAYS = args.includes('--stale') ? parseInt(args[args.indexOf('--stale') + 1], 10) : null;
const SLUG_ONLY  = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;

// ── Affiliate cards (injected per category) ──────────────────────────────────
const AFFILIATE = {
  flights: `<div class="affiliate-card"><span class="aff-emoji">✈️</span><h4>Find Cheap Flights to Seoul</h4><p>Compare prices across hundreds of airlines to find the best deal on your flight to Incheon.</p><a href="https://aviasales.tpo.li/empItUCk" target="_blank" rel="noopener sponsored" class="aff-btn">Search Flights →</a></div>`,
  hotels:  `<div class="affiliate-card"><span class="aff-emoji">🏨</span><h4>Book Hotels in Seoul</h4><p>Find the best hotels, guesthouses and apartments across Seoul's top neighborhoods.</p><a href="https://www.agoda.com/city/seoul-kr.html?cid=1973066" target="_blank" rel="noopener sponsored" class="aff-btn">Browse Hotels →</a></div>`,
  tours:   `<div class="affiliate-card"><span class="aff-emoji">🗺️</span><h4>Book Tours & Experiences in Seoul</h4><p>Discover guided tours, day trips and unique local experiences in Seoul.</p><a href="https://www.klook.com/en-US/city/34-seoul-things-to-do/?aff_adid=1392094&aff_pid=131769" target="_blank" rel="noopener sponsored" class="aff-btn">Browse Tours →</a></div>`,
  klook:   `<div class="affiliate-card"><span class="aff-emoji">🎫</span><h4>Seoul Activities on Klook</h4><p>Book tickets, passes and experiences — often cheaper than at the door.</p><a href="https://www.klook.com/en-US/city/34-seoul-things-to-do/?aff_adid=1392094&aff_pid=131769" target="_blank" rel="noopener sponsored" class="aff-btn">Browse Klook →</a></div>`,
  sim:     `<div class="affiliate-card"><span class="aff-emoji">📱</span><h4>Get a Korea eSIM Before You Fly</h4><p>Stay connected from the moment you land with an affordable Korea eSIM or SIM card.</p><a href="https://airalo.tpo.li/rmpJe6nd" target="_blank" rel="noopener sponsored" class="aff-btn">Buy eSIM →</a></div>`,
};

const CATEGORY_AFFILIATES = {
  'Food':          [AFFILIATE.tours, AFFILIATE.klook],
  'Nightlife':     [AFFILIATE.hotels, AFFILIATE.tours],
  'Transport':     [AFFILIATE.flights, AFFILIATE.sim],
  'Tech':          [AFFILIATE.sim, AFFILIATE.flights],
  'Shopping':      [AFFILIATE.klook, AFFILIATE.hotels],
  'Planning':      [AFFILIATE.flights, AFFILIATE.hotels],
  'Tips':          [AFFILIATE.flights, AFFILIATE.hotels],
  'Culture':       [AFFILIATE.tours, AFFILIATE.klook],
  'Attractions':   [AFFILIATE.klook, AFFILIATE.tours],
  'Neighborhoods': [AFFILIATE.hotels, AFFILIATE.tours],
  'Tours':         [AFFILIATE.tours, AFFILIATE.klook],
  'Outdoors':      [AFFILIATE.tours, AFFILIATE.hotels],
  'Visa':          [AFFILIATE.flights, AFFILIATE.sim],
  'default':       [AFFILIATE.hotels, AFFILIATE.tours],
};

// ── Topic definitions ─────────────────────────────────────────────────────────
const TOPICS = [
  // Original 10
  { query: 'seoul korea travel tips 2026 tourists',        slug: 'seoul-travel-tips-2026',       title: 'Seoul Travel Tips 2026: Everything You Need to Know Before You Go', category: 'Tips',          emoji: '✈️' },
  { query: 'best restaurants seoul 2026 local food',       slug: 'best-restaurants-seoul-2026',  title: 'Best Restaurants in Seoul 2026: Where to Eat Like a Local',           category: 'Food',          emoji: '🍜' },
  { query: 'seoul nightlife guide bars clubs 2026',        slug: 'seoul-nightlife-guide',         title: 'Seoul Nightlife Guide: Best Bars, Clubs & Night Markets',              category: 'Nightlife',     emoji: '🌃' },
  { query: 'korea dmz tour guide from seoul 2026',         slug: 'korea-dmz-tour-guide',          title: 'DMZ Tour from Seoul: Complete Guide to the Demilitarized Zone',        category: 'Tours',         emoji: '🪖' },
  { query: 'seoul subway guide foreigners english 2026',   slug: 'seoul-subway-guide',            title: 'Seoul Subway Guide for Foreigners: Navigate Like a Pro',               category: 'Transport',     emoji: '🚇' },
  { query: 'korea sim card esim tourists 2026',            slug: 'korea-sim-card-esim-guide',     title: 'Korea SIM Card & eSIM Guide 2026: Stay Connected in Seoul',            category: 'Tech',          emoji: '📱' },
  { query: 'seoul han river parks activities picnic',      slug: 'seoul-han-river-activities',    title: 'Han River Seoul: Best Activities, Parks & Things to Do',               category: 'Outdoors',      emoji: '🌊' },
  { query: 'korea visa free countries entry requirements 2026', slug: 'korea-visa-free-countries-2026', title: 'Korea Visa-Free Countries 2026: Do You Need a Visa?',           category: 'Visa',          emoji: '🛂' },
  { query: 'myeongdong shopping guide seoul cosmetics 2026',   slug: 'myeongdong-shopping-guide', title: 'Myeongdong Shopping Guide: K-Beauty, Street Food & More',             category: 'Shopping',      emoji: '🛍️' },
  { query: 'seoul weather best time to visit 2026',        slug: 'seoul-best-time-to-visit',      title: 'Best Time to Visit Seoul: Month-by-Month Weather Guide',              category: 'Planning',      emoji: '🌸' },
  // Additional 10
  { query: 'best cafes seoul specialty coffee 2026',       slug: 'best-cafes-seoul-2026',         title: 'Best Cafes in Seoul 2026: Specialty Coffee & Unique Spots',           category: 'Food',          emoji: '☕', forceUrl: 'https://knowaboutkorea.com/food/cafe/seoul-specialty-coffee' },
  { query: 'bukchon hanok village guide visit tips',       slug: 'bukchon-hanok-village-guide',   title: 'Bukchon Hanok Village Guide: Tips for Visiting Seoul\'s Heritage Gem', category: 'Culture',       emoji: '🏯' },
  { query: 'gangnam district guide things to do seoul',    slug: 'gangnam-guide',                 title: 'Gangnam Guide: Shopping, Nightlife & More in Seoul\'s Glitziest District', category: 'Neighborhoods', emoji: '💎' },
  { query: 'gyeongbokgung palace guide visit tips',        slug: 'gyeongbokgung-palace-guide',    title: 'Gyeongbokgung Palace Guide: Seoul\'s Most Iconic Royal Site',          category: 'Attractions',   emoji: '🏛️' },
  { query: 'hongdae things to do street art nightlife',    slug: 'hongdae-things-to-do',          title: 'Hongdae Guide: Art, Music & Nightlife in Seoul\'s Youth District',     category: 'Neighborhoods', emoji: '🎨' },
  { query: 'incheon airport guide transit layover tips',   slug: 'incheon-airport-guide',         title: 'Incheon Airport Guide: Layovers, Transit & Getting to Seoul',          category: 'Transport',     emoji: '🛫' },
  { query: 'korean spa jjimjilbang guide tourist',         slug: 'korean-spa-jimjilbang',         title: 'Korean Spa Guide: How to Experience a Jjimjilbang Like a Local',       category: 'Culture',       emoji: '♨️' },
  { query: 'seoul day trips from city Nami Island DMZ',    slug: 'seoul-day-trips',               title: 'Best Day Trips from Seoul: Nami Island, DMZ, Suwon & More',           category: 'Tours',         emoji: '🚌' },
  { query: 'seoul 4 days itinerary first time visitors',   slug: 'seoul-in-4-days',               title: 'Seoul in 4 Days: The Perfect First-Timer\'s Itinerary',               category: 'Planning',      emoji: '📅' },
  { query: 'seoul shopping guide malls markets souvenirs', slug: 'seoul-shopping-guide',          title: 'Seoul Shopping Guide: Malls, Markets & Where to Buy Souvenirs',       category: 'Shopping',      emoji: '🛒' },
  // Newest 5
  { query: 'itaewon seoul guide 2026 restaurants bars',    slug: 'itaewon-guide',                 title: 'Itaewon Guide 2026: Seoul\'s International District Reimagined',      category: 'Neighborhoods', emoji: '🌍' },
  { query: 'gwangjang market seoul street food guide 2026', slug: 'seoul-street-food-guide',       title: 'Seoul Street Food Guide: 20 Must-Try Snacks & Where to Find Them',    category: 'Food',          emoji: '🥢', forceUrl: 'https://museumofwander.com/gwangjang-market-seoul/' },
  { query: 'seoul kpop guide fan cafes entertainment 2026',slug: 'seoul-kpop-guide',              title: 'Seoul K-Pop Guide: Fan Cafes, Entertainment Districts & Idol Spots',  category: 'Culture',       emoji: '🎤' },
  { query: 'lotte world everland theme park seoul guide',  slug: 'seoul-theme-parks-guide',       title: 'Seoul Theme Parks: Lotte World vs Everland — Complete Visitor Guide',  category: 'Attractions',   emoji: '🎢' },
  { query: 'seoul budget travel cheap tips 2026',          slug: 'seoul-budget-travel-guide',     title: 'Seoul on a Budget: How to Travel Korea Cheap in 2026',                category: 'Tips',          emoji: '💰' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: opts.timeout || 60000, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    return e.stdout || '';
  }
}

function extractUrls(text) {
  const urlRegex = /https?:\/\/[^\s"'<>)\]]+/g;
  const found = [...new Set(text.match(urlRegex) || [])];
  // Filter out tracking/ad URLs, prefer travel/guide content
  return found
    .filter(u => !u.includes('google.com/search') && !u.includes('bing.com') && !u.includes('genspark.ai'))
    .slice(0, 4);
}

// ── Image generation ──────────────────────────────────────────────────────────
// Unsplash fallbacks by category (used if gsk img fails)
const UNSPLASH_FALLBACKS = {
  'Food':          'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=500&fit=crop',
  'Nightlife':     'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=500&fit=crop',
  'Transport':     'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=800&h=500&fit=crop',
  'Tech':          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop',
  'Shopping':      'https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=800&h=500&fit=crop',
  'Planning':      'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&h=500&fit=crop',
  'Tips':          'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=500&fit=crop',
  'Culture':       'https://images.unsplash.com/photo-1549241520-425e3dfc01cb?w=800&h=500&fit=crop',
  'Attractions':   'https://images.unsplash.com/photo-1601621915196-2621bfb0cd6e?w=800&h=500&fit=crop',
  'Neighborhoods': 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=800&h=500&fit=crop',
  'Tours':         'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=800&h=500&fit=crop',
  'Outdoors':      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&h=500&fit=crop',
  'Visa':          'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=500&fit=crop',
  'default':       'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=500&fit=crop',
};

async function generateHeroImage(topic) {
  const imgPath = path.join(IMAGES_DIR, `${topic.slug}.jpg`);
  const webPath = `/images/articles/${topic.slug}.jpg`;

  // Return existing image if fresh (< 30 days old)
  if (fs.existsSync(imgPath)) {
    const age = Date.now() - fs.statSync(imgPath).mtimeMs;
    if (age < 30 * 24 * 60 * 60 * 1000) {
      console.log(`   🖼  Using cached image: ${topic.slug}.jpg`);
      return webPath;
    }
  }

  console.log(`   🎨 Generating hero image: ${topic.slug}...`);

  // Category-specific visual styles for diversity
  const categoryVisuals = {
    'Food':          `close-up food photography, Korean cuisine, steam rising, vibrant colors, restaurant setting, warm orange tones`,
    'Nightlife':     `Seoul nightlife, neon lights, purple and blue tones, crowded streets, night photography`,
    'Transport':     `Seoul subway station, commuters, bright fluorescent lighting, blue and white tones`,
    'Tech':          `smartphone close-up, hands holding phone, Seoul city background, cool blue tones`,
    'Shopping':      `Korean shopping mall, colorful storefronts, busy shoppers, bright daylight, pink and yellow tones`,
    'Planning':      `aerial view Seoul city, sunrise golden hour, warm orange tones, wide landscape`,
    'Tips':          `solo traveler exploring Seoul alley, backpack, discovery mood, warm afternoon light`,
    'Culture':       `traditional Korean architecture, hanok roof tiles, cherry blossoms, soft pastel tones`,
    'Attractions':   `Seoul landmark, blue sky, wide angle, vibrant colors, tourist attraction`,
    'Neighborhoods': `Seoul neighborhood street, local cafes, pedestrians, green trees, summer afternoon`,
    'Tours':         `tour group in Seoul, guide pointing at landmark, bright daylight, energetic mood`,
    'Outdoors':      `Han River park, cyclists, picnic, green grass, sunny day, blue sky`,
    'Visa':          `passport and boarding pass, airplane window, travel documents, natural light`,
    'default':       `Seoul South Korea cityscape, modern skyline, blue hour, cinematic`,
  };
  const visualStyle = categoryVisuals[topic.category] || categoryVisuals['default'];
  const imgPrompt = `photorealistic travel photography, ${topic.title}, Seoul South Korea, ${visualStyle}, magazine cover quality, 16:9 aspect ratio`;

  try {
    const out = run(`"${GSK}" img ${JSON.stringify(imgPrompt)} -r "16:9" -s "1k" -o ${JSON.stringify(imgPath)}`, { timeout: 90000 });
    if (fs.existsSync(imgPath) && fs.statSync(imgPath).size > 5000) {
      console.log(`   ✅ Image saved: ${webPath}`);
      return webPath;
    }
  } catch (e) {
    console.log(`   ⚠️  Image generation failed, using fallback`);
  }

  // Fallback to Unsplash
  return UNSPLASH_FALLBACKS[topic.category] || UNSPLASH_FALLBACKS['default'];
}

// ── travel.json builder ───────────────────────────────────────────────────────
function rebuildTravelJson() {
  const articleFiles = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));
  const items = articleFiles
    .map(f => {
      try {
        const a = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8'));
        return {
          id: a.slug,
          slug: a.slug,
          title: a.title,
          description: a.description || a.title,
          url: `/article/${a.slug}`,
          image: a.heroImage || UNSPLASH_FALLBACKS[a.category] || UNSPLASH_FALLBACKS['default'],
          source: 'Seoul.is Guide',
          category: 'travel',
          articleCategory: a.category,
          emoji: a.emoji || '✈️',
          date: new Date(a.date || a.generatedAt || Date.now()).toISOString(),
          readTime: a.readTime || '5 min read',
          sponsored: false,
          summary: a.description || '',
        };
      } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

  const travelPath = path.join(DATA_DIR, 'travel.json');
  fs.writeFileSync(travelPath, JSON.stringify(items, null, 2));
  console.log(`\n📋 Rebuilt travel.json → ${items.length} articles`);
  return items.length;
}

function extractAnswerText(raw) {
  let text = (raw || '').trim();
  // Try to parse JSON envelope from gsk summarize
  try {
    const parsed = JSON.parse(text);
    // gsk summarize puts the real answer inside data.result after "answer: "
    const result = parsed?.data?.result || parsed?.data?.answer || parsed?.answer || parsed?.result || text;
    if (typeof result === 'string') text = result;
  } catch (_) { /* plain text */ }
  if (typeof text !== 'string') text = String(text);

  // gsk summarize result format:
  // ## [url]\n### Document Overview\n...\n### Question: ...\nverbatim: ...\nanswer: <ACTUAL HTML>
  // Extract everything after "answer: "
  const answerMatch = text.match(/\nanswer:\s*([\s\S]+)$/);
  if (answerMatch) {
    text = answerMatch[1].trim();
    // Strip trailing "Source: [...]" line
    text = text.replace(/\n*Source:\s*\[.*?\]\(.*?\)\s*$/s, '').trim();
  }

  // Detect insufficient/failed content — return empty so caller falls back
  const FAILURE_SIGNALS = [
    'Content not found or crawler failed',
    'does not contain the information required',
    'lacks substantive content',
    'placeholder or minimal',
    'short promotional advertisement',
    'The page does not provide',
    'no relevant information',
  ];
  if (FAILURE_SIGNALS.some(s => text.includes(s))) {
    return '';
  }

  return text.trim();
}

function isStale(filePath, days) {
  if (!fs.existsSync(filePath)) return true;
  const article = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!article.date) return true;
  const articleDate = new Date(article.date);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return articleDate < cutoff;
}

function writeTmp(content) {
  const f = path.join(os.tmpdir(), `seoul-crawl-${Date.now()}.txt`);
  fs.writeFileSync(f, content);
  return f;
}

function getAffiliateCards(category) {
  const cards = CATEGORY_AFFILIATES[category] || CATEGORY_AFFILIATES['default'];
  return cards.join('\n\n');
}

// ── Core pipeline ─────────────────────────────────────────────────────────────
async function crawlAndGenerate(topic) {
  console.log(`\n🔍 [1/4] Searching: ${topic.query}`);
  const searchOut = run(`"${GSK}" search "${topic.query}"`, { timeout: 30000 });

  const urls = extractUrls(searchOut);
  console.log(`   Found ${urls.length} URLs: ${urls.slice(0, 3).join(', ')}`);

  const affiliateCards = getAffiliateCards(topic.category);

  // Step 2: Extract key info from each URL via gsk summarize (URL mode — most reliable)
  console.log(`📄 [2/4] Extracting info from sources...`);
  const extractQ = `Extract all key facts, recommendations, places, prices, and practical tips about "${topic.title}". Be thorough and include specific names, addresses, prices in Korean Won, and actionable advice.`;

  let researchChunks = [];
  let usedUrls = [];

  for (const url of urls.slice(0, 3)) {
    console.log(`   ↳ ${url.slice(0, 70)}...`);
    const out = run(`"${GSK}" summarize ${JSON.stringify(url)} --question ${JSON.stringify(extractQ)}`, { timeout: 60000 });
    const text = extractAnswerText(out);
    if (text && text.length > 100) {
      researchChunks.push(`=== SOURCE: ${url} ===\n${text}`);
      usedUrls.push(url);
    }
    if (usedUrls.length >= 2) break;
  }

  const researchData = researchChunks.join('\n\n') || `Topic: ${topic.title}\nQuery: ${topic.query}`;

  // Step 3: Generate HTML article from research via gsk summarize (URL mode only)
  console.log(`🤖 [3/4] Generating HTML article: ${topic.title}`);

  // Use forceUrl if specified in topic definition
  if (topic.forceUrl && !usedUrls.includes(topic.forceUrl)) {
    usedUrls.unshift(topic.forceUrl);
  }

  // Use the first successfully crawled URL as document
  // If none available, use a reliable travel site based on category
  const FALLBACK_URLS = {
    'Food':          'https://museumofwander.com/gwangjang-market-seoul/',
    'Shopping':      'https://www.theseoulguide.com/myeongdong/',
    'Nightlife':     'https://www.theseoulguide.com/hongdae/',
    'Culture':       'https://www.theseoulguide.com/bukchon-hanok-village/',
    'Neighborhoods': 'https://www.theseoulguide.com/itaewon/',
    'Transport':     'https://www.theseoulguide.com/seoul-subway/',
    'Attractions':   'https://www.theseoulguide.com/gyeongbokgung-palace/',
    'Tours':         'https://www.theseoulguide.com/dmz-tours/',
    'default':       'https://www.theseoulguide.com/',
  };
  const primaryUrl = usedUrls[0] || urls[0] || FALLBACK_URLS[topic.category] || FALLBACK_URLS['default'];

  const articleQ = [
    `You are a senior travel editor at a major English-language travel magazine covering Seoul and South Korea.`,
    `Write a comprehensive, editorial-quality travel article (1400 to 1700 words) about: "${topic.title}".`,
    `Use facts from the source document AND your deep knowledge of Seoul travel.`,
    ``,
    `CONTENT REQUIREMENTS (all mandatory):`,
    `- Minimum 6 detailed sections, each with 3+ paragraphs of substantive content`,
    `- Include at least 5 specific venue/place names with brief descriptions`,
    `- Include real price ranges in Korean Won (₩) and USD ($) equivalents`,
    `- Include practical logistics: hours, how to get there (subway line/exit), booking tips`,
    `- Include 2 insider tip boxes with genuinely useful, non-obvious advice`,
    `- Include a "Quick Facts" or "Essential Info" section with bullet points`,
    `- Write in an engaging, authoritative voice — like Lonely Planet or Condé Nast Traveler`,
    `- Every paragraph must add real value — no filler, no repetition`,
    ``,
    `OUTPUT FORMAT (follow exactly, no exceptions):`,
    `1. Output ONLY raw HTML — no markdown, no code fences, no preamble, no explanation`,
    `2. First character must be < (opening of first <h2> tag)`,
    `3. Allowed tags: <h2> <h3> <p> <ul> <li> <strong> <em>`,
    `4. Tip boxes: <div class="tip-box">💡 <strong>Pro Tip:</strong> tip text here</div>`,
    `5. End with exactly this token on its own line: AFFILIATE_PLACEHOLDER`,
    `6. Do NOT include these instructions, any preamble, or "here is the article" text`,
  ].join('\n');

  const aiOut = run(`"${GSK}" summarize ${JSON.stringify(primaryUrl)} --question ${JSON.stringify(articleQ)}`, { timeout: 120000 });

  let rawText = extractAnswerText(aiOut);

  // Strip gsk summarize preamble (Document Overview / Question echo)
  // gsk summarize echoes the question — find end of question block first
  const questionEndMarkers = [
    'Start your response with <h2> immediately',
    'Start your response with <h2>',
    '- Start with <h2>',
    'AFFILIATE_PLACEHOLDER\n',
    'Do NOT include markdown',
  ];
  for (const marker of questionEndMarkers) {
    const idx = rawText.indexOf(marker);
    if (idx !== -1) {
      rawText = rawText.slice(idx + marker.length).trim();
      break;
    }
  }

  // Now find the actual <h2> start — skip preamble <h2> tags that contain URLs
  let h2idx = rawText.indexOf('<h2>');
  // Skip <h2>[http...] preamble patterns
  while (h2idx !== -1) {
    const h2content = rawText.slice(h2idx, h2idx + 60);
    if (h2content.includes('[http') || h2content.includes('](http')) {
      const nextH2 = rawText.indexOf('<h2>', h2idx + 4);
      h2idx = nextH2;
    } else break;
  }
  if (h2idx > 0) {
    rawText = rawText.slice(h2idx);
  } else if (h2idx === -1) {
    // No HTML at all — try markdown
    const mdH2 = rawText.indexOf('\n## ');
    if (mdH2 > 0) rawText = rawText.slice(mdH2 + 1);
  }

  // Strip any markdown code fences
  rawText = rawText
    .replace(/^```html\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();

  // If markdown came back instead of HTML, convert the main structures
  if (!rawText.includes('<h2>') && rawText.includes('## ')) {
    rawText = rawText
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\* (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
      .split('\n\n')
      .map(p => p.startsWith('<') ? p : `<p>${p}</p>`)
      .join('\n');
  }

  // Replace placeholder with affiliate cards
  let content = rawText
    .replace(/AFFILIATE_PLACEHOLDER/g, affiliateCards)
    .replace(/INSERT_AFFILIATE_CARDS/g, affiliateCards)
    .trim();

  // Always ensure affiliate cards appear
  if (!content.includes('affiliate-card')) {
    content += `\n\n${affiliateCards}`;
  }

  // If AI didn't include affiliate cards placeholder, append them
  if (!content.includes('affiliate-card')) {
    content += `\n\n${affiliateCards}`;
  }

  console.log(`🖼  [4/5] Generating hero image...`);
  const heroImage = await generateHeroImage(topic);

  console.log(`💾 [5/5] Saving article...`);

  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(4, Math.ceil(wordCount / 220))} min read`;

  const article = {
    slug: topic.slug,
    title: topic.title,
    description: topic.title.replace(/^[^:]+:\s*/, ''),
    category: topic.category,
    emoji: topic.emoji,
    tags: topic.query.split(' ').filter(w => w.length > 3).slice(0, 6),
    date: new Date().toISOString().split('T')[0],
    readTime,
    heroImage,
    content,
    affiliateLinks: [],
    generatedAt: new Date().toISOString(),
    generatedFrom: urls.slice(0, 3),
  };

  const filePath = path.join(ARTICLES_DIR, `${topic.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(article, null, 2));

  // Validate JSON
  JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  console.log(`✅ Created: ${topic.slug} (${wordCount} words, ${readTime}, ${usedUrls.length} sources)`);
  return { slug: topic.slug, title: topic.title, wordCount, sources: usedUrls.length };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🗺️  Seoul.is Article Crawler v2');
  console.log(`   Mode: ${FORCE ? 'FORCE (regenerate all)' : STALE_DAYS ? `STALE (>${STALE_DAYS} days)` : SLUG_ONLY ? `SINGLE (${SLUG_ONLY})` : 'NEW only'}`);
  console.log(`   Topics: ${TOPICS.length} total\n`);

  let topics = TOPICS;
  if (SLUG_ONLY) {
    topics = TOPICS.filter(t => t.slug === SLUG_ONLY);
    if (!topics.length) { console.error(`❌ Unknown slug: ${SLUG_ONLY}`); process.exit(1); }
  }

  const created = [];
  const skipped = [];

  for (const topic of topics) {
    const filePath = path.join(ARTICLES_DIR, `${topic.slug}.json`);

    if (!FORCE && !SLUG_ONLY) {
      if (STALE_DAYS) {
        if (!isStale(filePath, STALE_DAYS)) {
          console.log(`⏭  Skipping (fresh): ${topic.slug}`);
          skipped.push(topic.slug);
          continue;
        }
      } else {
        if (fs.existsSync(filePath)) {
          console.log(`⏭  Skipping (exists): ${topic.slug}`);
          skipped.push(topic.slug);
          continue;
        }
      }
    }

    try {
      const result = await crawlAndGenerate(topic);
      created.push(result);
      // Small delay between articles to be polite to APIs
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`❌ Failed: ${topic.slug} — ${err.message}`);
    }
  }

  // Always rebuild travel.json (even if no new articles, stale check may have updated images)
  const totalTravel = rebuildTravelJson();

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Created/Updated: ${created.length} articles`);
  console.log(`⏭  Skipped:         ${skipped.length} articles`);
  console.log(`📚 Total on disk:   ${fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json')).length} articles`);
  console.log(`🗂  travel.json:     ${totalTravel} items`);

  if (created.length > 0) {
    console.log('\nNew/Updated articles:');
    created.forEach(a => console.log(`  • ${a.slug} (${a.wordCount} words, ${a.sources} sources)`));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
