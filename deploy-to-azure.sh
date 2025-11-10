#!/bin/bash

# Azure Functions Deployment Script for Hitster
# This script helps deploy the Hitster function app to Azure

echo "🚀 Hitster Azure Functions Deployment"
echo "====================================="

# Check if Azure CLI is available
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install Azure CLI first."
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔑 Please login to Azure CLI first:"
    echo "   az login"
    exit 1
fi

# Get deployment parameters
read -p "📝 Enter Resource Group name: " RESOURCE_GROUP
read -p "📝 Enter Function App name: " FUNCTION_APP_NAME
read -p "📝 Enter Azure region (e.g., westeurope): " LOCATION
read -p "📝 Enter Storage Account name: " STORAGE_ACCOUNT_NAME

echo ""
echo "📋 Deployment Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Function App: $FUNCTION_APP_NAME"
echo "   Location: $LOCATION"
echo "   Storage Account: $STORAGE_ACCOUNT_NAME"
echo ""

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🏗️  Creating Azure resources..."

# Create resource group
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create storage account
echo "💾 Creating storage account..."
az storage account create \
    --name $STORAGE_ACCOUNT_NAME \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP \
    --sku Standard_LRS \
    --kind StorageV2

# Create Application Insights
echo "📊 Creating Application Insights..."
az monitor app-insights component create \
    --app $FUNCTION_APP_NAME \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP

# Create Function App
echo "⚡ Creating Function App..."
az functionapp create \
    --resource-group $RESOURCE_GROUP \
    --consumption-plan-location $LOCATION \
    --runtime dotnet-isolated \
    --runtime-version 8 \
    --functions-version 4 \
    --name $FUNCTION_APP_NAME \
    --storage-account $STORAGE_ACCOUNT_NAME \
    --app-insights $FUNCTION_APP_NAME

echo ""
echo "🔧 Configuring Function App settings..."

# Get storage connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
    --name $STORAGE_ACCOUNT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query connectionString \
    --output tsv)

# Get Application Insights connection string
APPINSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show \
    --app $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query connectionString \
    --output tsv)

# Configure app settings
az functionapp config appsettings set \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        "AzureWebJobsStorage=$STORAGE_CONNECTION_STRING" \
        "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING=$STORAGE_CONNECTION_STRING" \
        "WEBSITE_CONTENTSHARE=${FUNCTION_APP_NAME,,}" \
        "FUNCTIONS_WORKER_RUNTIME=dotnet-isolated" \
        "APPLICATIONINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONNECTION_STRING"

echo ""
echo "📦 Building and deploying function..."

# Build the project
echo "🧹 Cleaning build artifacts..."
rm -rf obj bin publish

echo "📦 Restoring packages..."
dotnet restore hitster.sln

echo "🏗️  Publishing project..."
dotnet publish HitsterFunction.csproj --configuration Release --output ./publish

# Deploy to Azure
func azure functionapp publish $FUNCTION_APP_NAME --force

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Your Function App is available at:"
echo "   https://$FUNCTION_APP_NAME.azurewebsites.net"
echo ""
echo "📊 Monitor your app:"
echo "   https://portal.azure.com/#resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$FUNCTION_APP_NAME"
echo ""
echo "🎵 Test your functions:"
echo "   Music Player: https://$FUNCTION_APP_NAME.azurewebsites.net/api/MusicPlayer"
echo "   Audio API: https://$FUNCTION_APP_NAME.azurewebsites.net/api/audio/sample.mp3"