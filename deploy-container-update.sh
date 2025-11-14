#!/bin/bash

# Hitster Azure Functions - Update Container Script
# This script rebuilds and pushes the container image, then restarts the function app

set -e  # Exit on error

echo "🐳 Hitster - Update Container Image"
echo "===================================="
echo ""

# Check prerequisites
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found."
    exit 1
fi

if ! az account show &> /dev/null; then
    echo "❌ Not logged into Azure. Run: az login"
    exit 1
fi

# Load parameters
PARAMS_FILE="infra/main.parameters.json"
if [ ! -f "$PARAMS_FILE" ]; then
    echo "❌ Parameters file not found: $PARAMS_FILE"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq not found. Please install jq."
    exit 1
fi

RESOURCE_GROUP=$(jq -r '.parameters.resourceGroup.value' $PARAMS_FILE)
FUNCTION_APP_NAME=$(jq -r '.parameters.functionAppName.value' $PARAMS_FILE)
CONTAINER_REGISTRY=$(jq -r '.parameters.containerRegistryName.value' $PARAMS_FILE)
DOCKER_IMAGE_TAG=$(jq -r '.parameters.dockerImageTag.value' $PARAMS_FILE)

echo "📋 Configuration:"
echo "   Function App: $FUNCTION_APP_NAME"
echo "   Container Registry: $CONTAINER_REGISTRY"
echo "   Image Tag: $DOCKER_IMAGE_TAG"
echo ""

# Get registry login server
CONTAINER_REGISTRY_LOGIN_SERVER=$(az acr show --name $CONTAINER_REGISTRY --resource-group $RESOURCE_GROUP --query loginServer -o tsv)

echo "🔨 Building Docker image..."
docker build -t hitster-function:$DOCKER_IMAGE_TAG .

echo "🔐 Logging into Azure Container Registry..."
az acr login --name $CONTAINER_REGISTRY

echo "🏷️  Tagging image..."
docker tag hitster-function:$DOCKER_IMAGE_TAG $CONTAINER_REGISTRY_LOGIN_SERVER/hitster-function:$DOCKER_IMAGE_TAG

echo "📤 Pushing image to ACR..."
docker push $CONTAINER_REGISTRY_LOGIN_SERVER/hitster-function:$DOCKER_IMAGE_TAG

echo "🔄 Restarting Function App..."
az functionapp restart \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP

echo ""
echo "✅ Container updated successfully!"
echo "🌐 Function App: https://${FUNCTION_APP_NAME}.azurewebsites.net"
echo "🎵 Music Player: https://${FUNCTION_APP_NAME}.azurewebsites.net/api/MusicPlayer"
echo ""
