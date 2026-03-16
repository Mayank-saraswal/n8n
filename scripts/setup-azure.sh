#!/bin/bash
set -e

# Configuration
RESOURCE_GROUP="nodebase-prod-rg"
LOCATION="eastasia"  # Closest to India with good pricing
REGISTRY_NAME="nodebaseacr"
ENVIRONMENT_NAME="nodebase-env"
APP_NAME="nodebase-app"
LOG_WORKSPACE_NAME="nodebase-logs"

echo "==> Creating Resource Group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

echo "==> Creating Log Analytics Workspace (required for Container Apps)..."
az monitor log-analytics workspace create \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_WORKSPACE_NAME \
  --location $LOCATION

LOG_WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_WORKSPACE_NAME \
  --query customerId \
  --output tsv)

LOG_WORKSPACE_KEY=$(az monitor log-analytics workspace get-shared-keys \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_WORKSPACE_NAME \
  --query primarySharedKey \
  --output tsv)

echo "==> Creating Container Registry (Basic tier ~\$5/month)..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME \
  --sku Basic \
  --admin-enabled true

# Get ACR credentials for GitHub Secrets
ACR_USERNAME=$(az acr credential show \
  --name $REGISTRY_NAME \
  --query username \
  --output tsv)

ACR_PASSWORD=$(az acr credential show \
  --name $REGISTRY_NAME \
  --query "passwords[0].value" \
  --output tsv)

echo "ACR_USERNAME: $ACR_USERNAME"
echo "ACR_PASSWORD: $ACR_PASSWORD"
echo ""
echo "WARNING: Copy these credentials now and add them as GitHub Secrets."
echo "Do NOT run this script in CI/CD — it is meant for one-time local use only."
echo "==> SAVE THESE AS GITHUB SECRETS: ACR_USERNAME and ACR_PASSWORD"

echo "==> Creating Container Apps Environment..."
az containerapp env create \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --logs-workspace-id $LOG_WORKSPACE_ID \
  --logs-workspace-key $LOG_WORKSPACE_KEY

echo "==> Creating Container App (placeholder — CI will update the image)..."
az containerapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 3000 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 10 \
  --cpu 0.5 \
  --memory 1.0Gi

# Get the app URL
APP_URL=$(az containerapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

echo ""
echo "=== SETUP COMPLETE ==="
echo "App URL: https://$APP_URL"
echo ""
echo "=== NEXT STEPS ==="
echo "1. Add these GitHub Secrets in your repo Settings → Secrets → Actions:"
echo "   ACR_USERNAME = $ACR_USERNAME"
echo "   ACR_PASSWORD = $ACR_PASSWORD"
echo ""
echo "2. Create AZURE_CREDENTIALS secret:"
echo "   Run: az ad sp create-for-rbac --name nodebase-deploy --sdk-auth --role contributor --scopes /subscriptions/<YOUR_SUB_ID>/resourceGroups/$RESOURCE_GROUP"
echo "   Copy the entire JSON output as AZURE_CREDENTIALS secret"
echo ""
echo "3. Set environment variables in Container App:"
echo "   Run: bash scripts/set-azure-env-vars.sh"
echo ""
echo "4. Update Inngest dashboard:"
echo "   App URL: https://$APP_URL"
echo "   Event key endpoint: https://$APP_URL/api/inngest"
