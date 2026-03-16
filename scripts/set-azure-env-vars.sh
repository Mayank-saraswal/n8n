#!/bin/bash
# Run this after setup-azure.sh
# Fill in your actual values before running
# WARNING: Replace ALL placeholder values (YOUR_*) before executing this script

set -e

RESOURCE_GROUP="nodebase-prod-rg"
APP_NAME="nodebase-app"

# Safety check — ensure placeholders have been replaced
if grep -q "YOUR_" "$0" | grep -v "^#" | grep -v "grep" > /dev/null 2>&1; then
  echo "ERROR: Replace all YOUR_* placeholder values in this script before running."
  echo "Get your actual values from the Vercel dashboard: Settings → Environment Variables"
  exit 1
fi

# Get your current Vercel env vars from the Vercel dashboard
# Settings → Environment Variables → copy all values

az containerapp update \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    "DATABASE_URL=postgresql://USER:PASS@nodebase-db-prod.postgres.database.azure.com:6432/nodebase?pgbouncer=true&connection_limit=1&pool_timeout=20" \
    "DIRECT_DATABASE_URL=postgresql://USER:PASS@nodebase-db-prod.postgres.database.azure.com:5432/nodebase" \
    "BETTER_AUTH_SECRET=YOUR_SECRET" \
    "BETTER_AUTH_URL=https://YOUR_APP.azurecontainerapps.io" \
    "NEXT_PUBLIC_BETTER_AUTH_URL=https://YOUR_APP.azurecontainerapps.io" \
    "NEXT_PUBLIC_APP_URL=https://YOUR_APP.azurecontainerapps.io" \
    "GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID" \
    "GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET" \
    "GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID" \
    "GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET" \
    "GOOGLE_SHEETS_CLIENT_ID=YOUR_GOOGLE_SHEETS_CLIENT_ID" \
    "GOOGLE_SHEETS_CLIENT_SECRET=YOUR_GOOGLE_SHEETS_CLIENT_SECRET" \
    "GOOGLE_DRIVE_CLIENT_ID=YOUR_GOOGLE_DRIVE_CLIENT_ID" \
    "GOOGLE_DRIVE_CLIENT_SECRET=YOUR_GOOGLE_DRIVE_CLIENT_SECRET" \
    "INNGEST_SIGNING_KEY=YOUR_INNGEST_SIGNING_KEY" \
    "INNGEST_EVENT_KEY=YOUR_INNGEST_EVENT_KEY" \
    "ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY" \
    "SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN" \
    "POLAR_ACCESS_TOKEN=YOUR_POLAR_ACCESS_TOKEN" \
    "POLAR_SUCCESS_URL=YOUR_POLAR_SUCCESS_URL" \
    "GOOGLE_GENERATIVE_AI_API_KEY=YOUR_KEY" \
    "OPENAI_API_KEY=YOUR_KEY" \
    "ANTHROPIC_API_KEY=YOUR_KEY" \
    "GROQ_API_KEY=YOUR_KEY" \
    "XAI_API_KEY=YOUR_KEY" \
    "DEEPSEEK_API_KEY=YOUR_KEY" \
    "PERPLEXITY_API_KEY=YOUR_KEY"

echo "Environment variables set."
echo "Restart the app: az containerapp revision restart --name $APP_NAME --resource-group $RESOURCE_GROUP --revision latest"
