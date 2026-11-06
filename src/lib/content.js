import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// src/lib/ 기준으로 경로 계산 → src/data/articles/
const ARTICLES_DIR = path.join(__dirname, '..', 'data', 'articles');
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const CATS = ['kpop', 'kdrama', 'food', 'places', 'travel', 'ranking', 'lifestyle', 'kproperty'];

export function getAllArticlesFromDir() {
  try {
    if (!fs.existsSync(ARTICLES_DIR)) return [];
    return fs.readdirSync(ARTICLES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8')); }
        catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => (b.publishedAt || b.date || '').localeCompare(a.publishedAt || a.date || ''));
  } catch { return []; }
}

export function getContent(category) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${category}.json`), 'utf-8')); }
  catch { return []; }
}

export function getAllContent() {
  return Object.fromEntries(CATS.map(c => [c, getContent(c)]));
}

export function getFeatured() {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'featured.json'), 'utf-8');
    const featured = JSON.parse(raw);
    if (featured && featured.length > 0) return featured;
  } catch {}
  return getAllArticlesFromDir().slice(0, 12);
}

export function getMeta() {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'meta.json'), 'utf-8')); }
  catch { return { lastUpdated: null }; }
}

export function getAllArticles() {
  const fromDir = getAllArticlesFromDir();
  if (fromDir.length > 0) return fromDir;
  return CATS.flatMap(cat => getContent(cat));
}

export function getArticleBySlug(slug) {
  const found = getAllArticlesFromDir().find(item => item.slug === slug);
  if (found) return found;
  for (const cat of CATS) {
    const f = getContent(cat).find(item => item.slug === slug);
    if (f) return f;
  }
  return null;
}

export function getRelatedArticles(slug, limit = 6) {
  const article = getArticleBySlug(slug);
  if (!article) return [];
  return getAllArticles().filter(i => i.slug !== slug && i.category === article.category).slice(0, limit);
}

export function getAllSlugs() {
  return getAllArticles().filter(item => item.slug).map(item => item.slug);
}
