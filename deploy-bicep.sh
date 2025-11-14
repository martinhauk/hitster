#!/bin/bash

# Hitster Azure Functions - Bicep Deployment Script
# This script deploys the infrastructure and container-based Azure Function using Bicep

set -e  # Exit on error

echo "🚀 Hitster Azure Functions - Bicep Deployment"
echo "=============================================="
echo ""

# Check if Azure CLI is available
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install Azure CLI first."
    echo "   Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔑 Please login to Azure CLI first:"
    echo "   az login"
    exit 1
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Load parameters from JSON file
PARAMS_FILE="infra/main.parameters.json"
if [ ! -f "$PARAMS_FILE" ]; then
    echo "❌ Parameters file not found: $PARAMS_FILE"
    exit 1
fi

# Parse parameters using jq (install if needed)
if ! command -v jq &> /dev/null; then
    echo "📦 Installing jq for JSON parsing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command -v brew &> /dev/null; then
        brew install jq
    else
        echo "❌ Please install jq manually: https://stedolan.github.io/jq/download/"
        exit 1
    fi
fi

echo "📖 Reading deployment parameters..."
FUNCTION_APP_NAME=$(jq -r '.parameters.functionAppName.value' $PARAMS_FILE)
LOCATION=$(jq -r '.parameters.location.value' $PARAMS_FILE)
STORAGE_ACCOUNT_NAME=$(jq -r '.parameters.storageAccountName.value' $PARAMS_FILE)
APP_SERVICE_PLAN=$(jq -r '.parameters.appServicePlanName.value' $PARAMS_FILE)
CONTAINER_REGISTRY=$(jq -r '.parameters.containerRegistryName.value' $PARAMS_FILE)
DOCKER_IMAGE_TAG=$(jq -r '.parameters.dockerImageTag.value' $PARAMS_FILE)

# Resource group name
RESOURCE_GROUP="hitster-rg"

echo ""
echo "📋 Deployment Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Location: $LOCATION"
echo "   Function App: $FUNCTION_APP_NAME"
echo "   Storage Account: $STORAGE_ACCOUNT_NAME"
echo "   App Service Plan: $APP_SERVICE_PLAN"
echo "   Container Registry: $CONTAINER_REGISTRY"
echo "   Docker Image Tag: $DOCKER_IMAGE_TAG"
echo ""

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🏗️  Step 1: Creating Resource Group..."
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION

echo ""
echo "🏗️  Step 2: Deploying Infrastructure with Bicep..."
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file infra/main.bicep \
    --parameters @$PARAMS_FILE \
    --query properties.outputs \
    --output json)

echo "✅ Infrastructure deployed successfully!"

# Extract outputs
CONTAINER_REGISTRY_LOGIN_SERVER=$(echo $DEPLOYMENT_OUTPUT | jq -r '.containerRegistryLoginServer.value')
FUNCTION_APP_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.functionAppUrl.value')

echo ""
echo "📦 Step 3: Building and Pushing Docker Image..."
echo "   Building Docker image..."
docker build -t hitster-function:$DOCKER_IMAGE_TAG .

echo "   Logging into Azure Container Registry..."
az acr login --name $CONTAINER_REGISTRY

echo "   Tagging image for ACR..."
docker tag hitster-function:$DOCKER_IMAGE_TAG $CONTAINER_REGISTRY_LOGIN_SERVER/hitster-function:$DOCKER_IMAGE_TAG

echo "   Pushing image to ACR..."
docker push $CONTAINER_REGISTRY_LOGIN_SERVER/hitster-function:$DOCKER_IMAGE_TAG

echo ""
echo "🔄 Step 4: Restarting Function App to pull new container..."
az functionapp restart \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your Function App is available at:"
echo "   $FUNCTION_APP_URL"
echo ""
echo "📊 Monitor your app in Azure Portal:"
echo "   https://portal.azure.com/#resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$FUNCTION_APP_NAME"
echo ""
echo "🎵 Test your music player:"
echo "   ${FUNCTION_APP_URL}/api/MusicPlayer"
echo ""
echo "🐳 Container Registry:"
echo "   $CONTAINER_REGISTRY_LOGIN_SERVER"
echo ""
