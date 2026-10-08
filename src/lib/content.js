import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CATS = ['kpop', 'kdrama', 'food', 'places', 'travel', 'ranking', 'lifestyle', 'kproperty'];

export function getContent(category) {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, `${category}.json`), 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

export function getAllContent() {
  return Object.fromEntries(CATS.map(c => [c, getContent(c)]));
}

export function getFeatured() {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'featured.json'), 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

export function getMeta() {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'meta.json'), 'utf-8');
    return JSON.parse(raw);
  } catch { return { lastUpdated: null }; }
}

/** Get all articles across all categories as a flat array */
export function getAllArticles() {
  return CATS.flatMap(cat => getContent(cat));
}

/** Find a single article by its slug */
export function getArticleBySlug(slug) {
  for (const cat of CATS) {
    const items = getContent(cat);
    const found = items.find(item => item.slug === slug);
    if (found) return found;
  }
  return null;
}

/** Get related articles (same category, excluding current) */
export function getRelatedArticles(slug, limit = 6) {
  const article = getArticleBySlug(slug);
  if (!article) return [];
  const items = getContent(article.category);
  return items.filter(i => i.slug !== slug).slice(0, limit);
}

/** Get all unique slugs for static path generation */
export function getAllSlugs() {
  return CATS.flatMap(cat =>
    getContent(cat)
      .filter(item => item.slug)
      .map(item => item.slug)
  );
}
