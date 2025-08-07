#!/bin/bash
# Cron job script to sync trending tokens every 15 minutes

# Set the base URL (adjust for production)
BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

# Log the sync attempt
echo "$(date): Starting token sync..."

# Call the sync API
curl -X POST "$BASE_URL/api/sync/trending" \
  -H "Content-Type: application/json" \
  -m 60 \
  --silent \
  --show-error

echo "$(date): Token sync completed"