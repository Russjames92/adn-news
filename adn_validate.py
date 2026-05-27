#!/usr/bin/env python3
"""
ADN News Article Validator
Run before every commit to catch broken articles before they go live.
Usage: python3 /home/user/workspace/adn_validate.py
"""

import json, base64, subprocess, sys, re

REQUIRED_FIELDS = [
    'id', 'slug', 'headline', 'deck', 'category', 'category_label',
    'author', 'date', 'date_label', 'read_time', 'featured',
    'img_url', 'img_attribution', 'body', 'pull_quote',
    'pull_quote_attribution', 'postmill_note', 'img_class'
]

VALID_CATEGORIES = {'breaking', 'prophecy', 'israel', 'opinion'}

VALID_AUTHORS = {
    'Chester T. Rapture', 'Donna Prebulation',
    'Norman Dispensation', 'Priscilla Millstone'
}

ERRORS = []
WARNINGS = []

def err(slug, field, msg):
    ERRORS.append(f"  ✗ [{slug}] {field}: {msg}")

def warn(slug, field, msg):
    WARNINGS.append(f"  ⚠ [{slug}] {field}: {msg}")

def validate_article(a, index):
    slug = a.get('slug', f'article-{index}')

    # 1. Required fields present
    for field in REQUIRED_FIELDS:
        if field not in a:
            err(slug, field, 'MISSING field')

    # 2. body must be a LIST of strings, not a bare string or HTML blob
    body = a.get('body')
    if isinstance(body, str):
        err(slug, 'body', f'body is a STRING — must be a list of paragraph strings. Got: {body[:60]}...')
    elif isinstance(body, list):
        if len(body) == 0:
            err(slug, 'body', 'body list is EMPTY')
        elif len(body) < 3:
            warn(slug, 'body', f'only {len(body)} paragraphs — articles should have 3-5')
        for i, p in enumerate(body):
            if not isinstance(p, str):
                err(slug, f'body[{i}]', f'paragraph is not a string: {type(p).__name__}')
            elif '<p>' in p or '</p>' in p:
                err(slug, f'body[{i}]', 'paragraph contains raw <p> tags — strip them, body items are plain text/inline HTML only')
    else:
        err(slug, 'body', f'body is {type(body).__name__} — must be a list')

    # 3. category must be valid
    cat = a.get('category', '')
    if cat not in VALID_CATEGORIES:
        err(slug, 'category', f'"{cat}" is not valid — must be one of: {VALID_CATEGORIES}')

    # 4. author must be a known byline
    author = a.get('author', '')
    if author not in VALID_AUTHORS:
        warn(slug, 'author', f'"{author}" is not a recognized byline — expected one of: {VALID_AUTHORS}')

    # 5. postmill_note must open with a Scripture reference
    pm = a.get('postmill_note', '')
    # Accept straight quotes, curly quotes, or a Scripture reference pattern
    if pm and not any(c in pm for c in ['"', '\u201c', "'"]):
        warn(slug, 'postmill_note', 'does not appear to open with a quoted Scripture verse')

    # 6. img_url must point to images/ directory
    img = a.get('img_url', '')
    if img and not img.startswith('images/'):
        err(slug, 'img_url', f'"{img}" should start with images/')

    # 7. slug must be kebab-case, no spaces
    s = a.get('slug', '')
    if s and ' ' in s:
        err(slug, 'slug', 'slug contains spaces — use hyphens only')

    # 8. featured must be bool
    featured = a.get('featured')
    if not isinstance(featured, bool):
        warn(slug, 'featured', f'should be boolean true/false, got: {repr(featured)}')

    # 9. pull_quote must not be empty
    pq = a.get('pull_quote', '')
    if not pq or len(pq.strip()) < 10:
        warn(slug, 'pull_quote', 'pull_quote is missing or too short')

    # 10. date format
    date = a.get('date', '')
    if date and not re.match(r'^\d{4}-\d{2}-\d{2}$', date):
        err(slug, 'date', f'"{date}" should be YYYY-MM-DD format')

# --- MAIN ---
print("ADN News — Article Validator")
print("=" * 50)

result = subprocess.run(
    ['gh', 'api', 'repos/Russjames92/adn-news/contents/articles.json'],
    capture_output=True, text=True
)
data = json.loads(result.stdout)
content = base64.b64decode(data['content']).decode('utf-8')
articles = json.loads(content)['articles']

print(f"Checking {len(articles)} articles...\n")

for i, a in enumerate(articles):
    validate_article(a, i)

print(f"ERRORS ({len(ERRORS)}):")
if ERRORS:
    for e in ERRORS:
        print(e)
else:
    print("  None — all clear")

print(f"\nWARNINGS ({len(WARNINGS)}):")
if WARNINGS:
    for w in WARNINGS:
        print(w)
else:
    print("  None")

print("\n" + "=" * 50)
if ERRORS:
    print(f"RESULT: FAIL — {len(ERRORS)} error(s) must be fixed before deploying.")
    sys.exit(1)
else:
    print(f"RESULT: PASS — articles.json is valid.")
    sys.exit(0)
