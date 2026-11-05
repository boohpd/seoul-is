import fs from 'node:fs';
import path from 'node:path';

// n8n이 아티클을 src/data/articles/*.json 에 저장
const ARTICLES_DIR = path.join(process.cwd(), 'src', 'data', 'articles');
// 기존 카테고리별 data/ 경로 (하위 호환)
const DATA_DIR = path.join(process.cwd(), 'data');
const CATS = ['kpop', 'kdrama', 'food', 'places', 'travel', 'ranking', 'lifestyle', 'kproperty'];

/** src/data/articles/*.json 에서 모든 아티클 로드 */
export function getAllArticlesFromDir() {
  try {
    if (!fs.existsSync(ARTICLES_DIR)) return [];
    return fs.readdirSync(ARTICLES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8');
          return JSON.parse(raw);
        } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => (b.publishedAt || b.date || '').localeCompare(a.publishedAt || a.date || ''));
  } catch { return []; }
}

export function getContent(category) {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, `${category}.json`), 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

export function getAllContent() {
  return Object.fromEntries(CATS.map(c => [c, getContent(c)]));
}

/** featured.json 없으면 articles 디렉토리에서 최신 12개 반환 */
export function getFeatured() {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'featured.json'), 'utf-8');
    const featured = JSON.parse(raw);
    if (featured && featured.length > 0) return featured;
  } catch {}
  // fallback: src/data/articles/ 에서 최신 12개
  return getAllArticlesFromDir().slice(0, 12);
}

export function getMeta() {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'meta.json'), 'utf-8');
    return JSON.parse(raw);
  } catch { return { lastUpdated: null }; }
}

export function getAllArticles() {
  const fromDir = getAllArticlesFromDir();
  if (fromDir.length > 0) return fromDir;
  return CATS.flatMap(cat => getContent(cat));
}

export function getArticleBySlug(slug) {
  // src/data/articles/ 먼저 검색
  const all = getAllArticlesFromDir();
  const found = all.find(item => item.slug === slug);
  if (found) return found;
  // 기존 data/ 카테고리 검색
  for (const cat of CATS) {
    const items = getContent(cat);
    const f = items.find(item => item.slug === slug);
    if (f) return f;
  }
  return null;
}

export function getRelatedArticles(slug, limit = 6) {
  const article = getArticleBySlug(slug);
  if (!article) return [];
  return getAllArticles()
    .filter(i => i.slug !== slug && i.category === article.category)
    .slice(0, limit);
}

export function getAllSlugs() {
  return getAllArticles()
    .filter(item => item.slug)
    .map(item => item.slug);
}
