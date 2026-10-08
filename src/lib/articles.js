import fs from 'node:fs';
import path from 'node:path';

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'data', 'articles');

export function getAllArticleSlugs() {
  try {
    const files = fs.readdirSync(ARTICLES_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch { return []; }
}

export function getAllTravelArticles() {
  return getAllArticleSlugs().map(slug => getTravelArticle(slug)).filter(Boolean);
}

export function getTravelArticle(slug) {
  try {
    const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch { return null; }
}

export function getRelatedTravelArticles(slug, limit = 4) {
  const article = getTravelArticle(slug);
  if (!article) return [];
  const all = getAllTravelArticles();
  return all
    .filter(a => a.slug !== slug)
    .filter(a => a.category === article.category || (a.tags || []).some(t => (article.tags || []).includes(t)))
    .slice(0, limit);
}
