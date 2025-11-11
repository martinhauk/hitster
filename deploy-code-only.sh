#!/bin/bash

# Azure Functions Code Deployment Script for Hitster
# This script deploys code to an existing Azure Function App
# (does not create Azure resources)

echo "🚀 Hitster Azure Functions - Code Deployment Only"
echo "================================================="

# Check if Azure CLI is available
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install Azure CLI first."
    exit 1
fi

# Check if Azure Functions Core Tools is available
if ! command -v func &> /dev/null; then
    echo "❌ Azure Functions Core Tools not found. Please install func CLI first."
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔑 Please login to Azure CLI first:"
    echo "   az login"
    exit 1
fi

echo ""
echo "📋 This script will deploy code to an EXISTING Azure Function App."
echo "   If you need to create resources first, run: ./deploy-to-azure.sh"
echo ""

# Get deployment parameters
read -p "📝 Enter existing Function App name: " FUNCTION_APP_NAME
read -p "📝 Enter Resource Group name: " RESOURCE_GROUP

echo ""
echo "🔍 Verifying Function App exists..."

# Check if function app exists
if ! az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    echo "❌ Function App '$FUNCTION_APP_NAME' not found in resource group '$RESOURCE_GROUP'"
    echo "💡 Please check the names or run './deploy-to-azure.sh' to create resources first"
    exit 1
fi

echo "✅ Function App '$FUNCTION_APP_NAME' found"

# Get current subscription info
SUBSCRIPTION_NAME=$(az account show --query name --output tsv)
echo "📊 Current subscription: $SUBSCRIPTION_NAME"

echo ""
echo "📋 Deployment Summary:"
echo "   Function App: $FUNCTION_APP_NAME"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Subscription: $SUBSCRIPTION_NAME"
echo ""

read -p "Continue with code deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🏗️  Building application..."

# Clean and build
echo "🧹 Cleaning build artifacts..."
rm -rf obj bin publish

echo "📦 Restoring packages..."
if ! dotnet restore hitster.sln; then
    echo "❌ Package restore failed"
    exit 1
fi

echo "🔨 Publishing project..."
if ! dotnet publish HitsterFunction.csproj --configuration Release --output ./publish; then
    echo "❌ Publish failed"
    exit 1
fi

echo "✅ Build completed successfully"

echo ""
echo "📤 Deploying to Azure Function App..."

# Deploy using Azure Functions Core Tools from the publish directory
cd publish
if func azure functionapp publish "$FUNCTION_APP_NAME" --force; then
    # Return to root directory
    cd ..
    
    echo ""
    echo "✅ Code deployment completed successfully!"
    
    # Get function app URL
    FUNCTION_APP_URL="https://$FUNCTION_APP_NAME.azurewebsites.net"
    
    echo ""
    echo "🌐 Your updated Function App is available at:"
    echo "   $FUNCTION_APP_URL"
    echo ""
    echo "🎵 Test your functions:"
    echo "   Music Player: $FUNCTION_APP_URL/api/MusicPlayer"
    echo "   Audio API: $FUNCTION_APP_URL/api/audio/sample.mp3"
    echo ""
    echo "📊 Monitor deployment:"
    echo "   Azure Portal: https://portal.azure.com/#resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$FUNCTION_APP_NAME"
    echo ""
    echo "📋 View logs:"
    echo "   az webapp log tail --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP"
    
else
    echo ""
    echo "❌ Code deployment failed"
    echo ""
    echo "🛠️  Troubleshooting tips:"
    echo "   1. Verify function app name and resource group"
    echo "   2. Check Azure permissions"
    echo "   3. Ensure function app is running"
    echo "   4. Try: az functionapp restart --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP"
    exit 1
fi

# Clean up build artifacts
echo ""
echo "🧹 Cleaning up build artifacts..."
rm -rf publish

echo ""
echo "🎉 Code deployment completed!"