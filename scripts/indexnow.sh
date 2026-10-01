#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# IndexNow Submit Script for markdown.srys.me
# Run this after every deploy to instantly notify Bing, Yandex, and DuckDuckGo
#
# Usage:  bash scripts/indexnow.sh
# ─────────────────────────────────────────────────────────────────────────────

KEY="4f3c5c498f13e15428d5c6d58fb98064"
HOST="markdown.srys.me"

URLS=$(cat <<EOF
[
  "https://markdown.srys.me/"
]
EOF
)

echo "🔔 Submitting URLs to IndexNow..."

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{
    \"host\": \"$HOST\",
    \"key\": \"$KEY\",
    \"keyLocation\": \"https://$HOST/$KEY.txt\",
    \"urlList\": [\"https://$HOST/\"]
  }")

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "202" ]; then
  echo "✅ IndexNow accepted (HTTP $RESPONSE) — Bing/Yandex/DDG will crawl shortly."
else
  echo "⚠️  IndexNow responded with HTTP $RESPONSE"
fi

# Also ping Bing directly as a fallback
echo "🔔 Pinging Bing directly..."
BING=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://www.bing.com/indexnow?url=https://$HOST/&key=$KEY")
echo "   Bing: HTTP $BING"
