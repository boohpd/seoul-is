#!/usr/bin/env node
/**
 * seoul.is WhatsApp post generator
 * Picks next article in rotation and formats as A / B / C style
 * State file tracks last used index and style
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '../src/data/articles');
const STATE_FILE = path.join(__dirname, '../.whatsapp-state.json');

// Load articles
const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));
const articles = files.map(f => {
  const a = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8'));
  return {
    slug: a.slug,
    title: a.title,
    description: a.description,
    emoji: a.emoji || '🗺️',
    content: (a.content || '').replace(/<[^>]+>/g, '').trim(),
    category: a.category,
  };
}).filter(a => a.title && a.slug);

// Load state
let state = { index: 0, style: 0 };
if (fs.existsSync(STATE_FILE)) {
  try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')); } catch(e) {}
}

const article = articles[state.index % articles.length];
const styleNum = state.style % 3; // 0=A, 1=B, 2=C

// Extract a short tip from content (first 2 sentences)
const sentences = article.content.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/);
const tip = sentences.slice(0, 2).join(' ').slice(0, 180).trim();

const url = `https://seoul.is/article/${article.slug}`;

let post = '';

if (styleNum === 0) {
  // Style A: Link-focused, clean
  post = `${article.emoji} *${article.title}*

${article.description || tip}

👉 ${url}

_Follow Seoul.IS for daily Seoul travel tips_ 🇰🇷`;

} else if (styleNum === 1) {
  // Style B: Tip + link
  const tipShort = sentences[0]?.slice(0, 160).trim() || article.description;
  post = `💡 *Seoul Tip*

${tipShort}

📖 Full guide → ${url}

_Seoul.IS — Your guide to the real Seoul_ 🗺️`;

} else {
  // Style C: SNS style, short & punchy
  const punch = article.title.split(':')[0].trim();
  post = `📍 *${punch}*

${article.emoji} ${article.description?.slice(0, 120) || tip.slice(0, 120)}

🔗 ${url}

#Seoul #Korea #Travel #KTravel #SeoulGuide`;
}

// Save updated state
state.index = (state.index + 1) % articles.length;
state.style = state.style + 1;
state.lastRun = new Date().toISOString();
state.lastSlug = article.slug;
state.lastStyle = ['A','B','C'][styleNum];
fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

// Output
console.log(post);
console.log('\n---META---');
console.log(JSON.stringify({ slug: article.slug, style: ['A','B','C'][styleNum], url, title: article.title, emoji: article.emoji, description: article.description }));
