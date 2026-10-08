#!/bin/bash
# Enrich articles with summaries using gsk search + summarize
# Usage: bash scripts/enrich-articles.sh

cd "$(dirname "$0")/.."
DATA_DIR="data"

echo "=== Enriching articles with AI summaries ==="

python3 << 'PYEOF'
import json, subprocess, os, time, sys

DATA_DIR = "data"
CATS = ["kpop", "kdrama", "food", "places", "ranking", "lifestyle", "kproperty"]

def search_and_summarize(title, source):
    """Use gsk search to find article content, then return a summary."""
    # Clean title for search
    clean = title.replace("&amp;", "&").replace("&lt;", "").replace("&gt;", "")
    # Remove source from title if present
    for sep in [" - ", " | ", " — "]:
        if sep in clean:
            clean = clean.split(sep)[0]
    
    query = f"{clean} {source}"
    
    try:
        result = subprocess.run(
            ["gsk", "search", query],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0 and result.stdout.strip():
            # Extract useful text from search results
            lines = result.stdout.strip().split('\n')
            # Collect description/snippet lines
            snippets = []
            for line in lines:
                line = line.strip()
                if len(line) > 60 and not line.startswith('http') and not line.startswith('['):
                    snippets.append(line)
            if snippets:
                return ' '.join(snippets[:3])[:600]
    except Exception as e:
        print(f"  Search error: {e}", file=sys.stderr)
    
    return None

total = 0
enriched = 0

for cat in CATS:
    fpath = os.path.join(DATA_DIR, f"{cat}.json")
    if not os.path.exists(fpath):
        continue
    
    with open(fpath) as f:
        items = json.load(f)
    
    changed = False
    for item in items:
        total += 1
        # Skip if already has good summary
        if item.get("summary") and len(item["summary"]) > 100:
            continue
        
        title = item.get("title", "")
        source = item.get("source", "")
        print(f"[{cat}] Enriching: {title[:60]}...")
        
        summary = search_and_summarize(title, source)
        if summary:
            item["summary"] = summary
            enriched += 1
            changed = True
            print(f"  ✅ Got {len(summary)} chars")
        else:
            # Fallback: generate a contextual summary from title
            clean_title = title.replace("&amp;", "&")
            item["summary"] = f"This article from {source} covers: {clean_title}. Read the full story for detailed insights and analysis on the latest developments in Korean {cat} culture and trends."
            changed = True
            print(f"  ⚠️ Using fallback summary")
        
        time.sleep(0.5)  # Rate limit
    
    if changed:
        with open(fpath, 'w') as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        print(f"  💾 Saved {cat}.json")

print(f"\n=== Done: {enriched}/{total} articles enriched ===")
PYEOF
