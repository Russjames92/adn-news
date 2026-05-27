#!/usr/bin/env python3
"""
ADN News — Auto-Tweet on New Article Publish
Triggered by GitHub Actions when articles.json is updated.
Reads the newest article (index 0) and posts to X/Twitter.
"""

import os
import json
import base64
import urllib.request
import urllib.parse
import hmac
import hashlib
import time
import random
import string
import sys

# ── Credentials from environment (GitHub Secrets) ──────────────────────────
API_KEY         = os.environ["TWITTER_API_KEY"]
API_SECRET      = os.environ["TWITTER_API_SECRET"]
ACCESS_TOKEN    = os.environ["TWITTER_ACCESS_TOKEN"]
ACCESS_SECRET   = os.environ["TWITTER_ACCESS_SECRET"]

# ── Load articles.json ───────────────────────────────────────────────────────
with open("articles.json", "r") as f:
    data = json.load(f)

articles = data.get("articles", [])
if not articles:
    print("No articles found — nothing to tweet.")
    sys.exit(0)

article = articles[0]  # newest article is always index 0

headline  = article.get("headline", "")
deck      = article.get("deck", "")
slug      = article.get("slug", "")
category  = article.get("category", "")
label     = article.get("category_label", "ADN News")

# ── Build tweet text ─────────────────────────────────────────────────────────
url = f"https://www.adn-news.net/article.html?slug={slug}"

# Category emoji mapping
emoji_map = {
    "breaking":  "🚨",
    "prophecy":  "📖",
    "israel":    "🕍",
    "opinion":   "✍️",
}
emoji = emoji_map.get(category, "📰")

# Format: emoji LABEL | Headline — deck (truncated) | URL
# Twitter limit: 280 chars. URL counts as 23 chars.
tag_line = f"{emoji} {label.upper()}"
body = f"{headline}"

# Add deck if it fits
full = f"{tag_line}\n\n{body}\n\n{deck}\n\n{url} #ADNNews #Eschatology"
if len(full) > 280:
    # Try without deck
    full = f"{tag_line}\n\n{body}\n\n{url} #ADNNews #Eschatology"
if len(full) > 280:
    # Truncate headline
    max_headline = 280 - len(f"{tag_line}\n\n...\n\n{url} #ADNNews #Eschatology")
    full = f"{tag_line}\n\n{body[:max_headline]}...\n\n{url} #ADNNews #Eschatology"

tweet_text = full
print(f"Tweet ({len(tweet_text)} chars):\n{tweet_text}\n")

# ── OAuth 1.0a signing ───────────────────────────────────────────────────────
def percent_encode(s):
    return urllib.parse.quote(str(s), safe="")

def generate_nonce(length=32):
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))

def sign_request(method, url, params, consumer_key, consumer_secret, token, token_secret):
    oauth_params = {
        "oauth_consumer_key":     consumer_key,
        "oauth_nonce":            generate_nonce(),
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp":        str(int(time.time())),
        "oauth_token":            token,
        "oauth_version":          "1.0",
    }
    all_params = {**params, **oauth_params}
    sorted_params = "&".join(
        f"{percent_encode(k)}={percent_encode(v)}"
        for k, v in sorted(all_params.items())
    )
    base_string = "&".join([
        percent_encode(method.upper()),
        percent_encode(url),
        percent_encode(sorted_params),
    ])
    signing_key = f"{percent_encode(consumer_secret)}&{percent_encode(token_secret)}"
    signature = base64.b64encode(
        hmac.new(signing_key.encode(), base_string.encode(), hashlib.sha1).digest()
    ).decode()
    oauth_params["oauth_signature"] = signature
    auth_header = "OAuth " + ", ".join(
        f'{percent_encode(k)}="{percent_encode(v)}"'
        for k, v in sorted(oauth_params.items())
    )
    return auth_header

# ── Post to X API v2 ─────────────────────────────────────────────────────────
TWEET_URL = "https://api.twitter.com/2/tweets"
payload   = json.dumps({"text": tweet_text}).encode("utf-8")

auth_header = sign_request(
    method="POST",
    url=TWEET_URL,
    params={},
    consumer_key=API_KEY,
    consumer_secret=API_SECRET,
    token=ACCESS_TOKEN,
    token_secret=ACCESS_SECRET,
)

req = urllib.request.Request(
    TWEET_URL,
    data=payload,
    headers={
        "Authorization":  auth_header,
        "Content-Type":   "application/json",
        "User-Agent":     "ADNNews-TwitterBot/1.0",
    },
    method="POST",
)

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode())
        tweet_id = result.get("data", {}).get("id", "unknown")
        print(f"✅ Tweet posted! ID: {tweet_id}")
        print(f"   https://x.com/officialADNnews/status/{tweet_id}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"❌ HTTP {e.code}: {body}")
    sys.exit(1)
