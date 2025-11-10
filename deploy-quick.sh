#!/bin/bash

# Quick ZIP Deployment Script for Hitster Azure Functions
# Fast deployment using ZIP package to existing Function App

echo "⚡ Hitster Azure Functions - Quick ZIP Deployment"
echo "================================================"

# Check prerequisites
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found"
    exit 1
fi

if ! az account show &> /dev/null; then
    echo "🔑 Please login to Azure CLI: az login"
    exit 1
fi

# Get parameters
read -p "📝 Function App name: " FUNCTION_APP_NAME
read -p "📝 Resource Group name: " RESOURCE_GROUP

# Verify function app exists
if ! az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    echo "❌ Function App '$FUNCTION_APP_NAME' not found"
    exit 1
fi

echo "✅ Function App verified"

echo ""
echo "🏗️  Building and packaging..."

# Build
rm -rf obj bin publish deployment.zip
dotnet restore hitster.sln
dotnet publish HitsterFunction.csproj --configuration Release --output ./publish

# Create deployment package
cd publish
zip -r ../deployment.zip . > /dev/null
cd ..

echo "📦 Package created: $(ls -lh deployment.zip | awk '{print $5}')"

echo ""
echo "📤 Deploying via ZIP..."

# Deploy using ZIP
az functionapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$FUNCTION_APP_NAME" \
    --src deployment.zip

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Quick deployment completed!"
    echo "🌐 Function App: https://$FUNCTION_APP_NAME.azurewebsites.net"
    echo "🎵 Music Player: https://$FUNCTION_APP_NAME.azurewebsites.net/api/MusicPlayer"
    
    # Restart function app to ensure changes take effect
    echo ""
    echo "🔄 Restarting function app..."
    az functionapp restart --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP"
    echo "✅ Function app restarted"
else
    echo "❌ ZIP deployment failed"
    exit 1
fi

# Cleanup
rm -rf publish deployment.zip

echo ""
echo "⚡ Quick deployment completed!"