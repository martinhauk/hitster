#!/bin/bash

# Azure Functions Deployment Script for Hitster
# This script reads configuration from deployment.config.json and deploys to Azure

set -e  # Exit on error

echo "🚀 Hitster Azure Functions Deployment"
echo "====================================="

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
    echo "❌ jq not found. Installing jq..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command -v brew &> /dev/null; then
        brew install jq
    else
        echo "❌ Please install jq manually: https://stedolan.github.io/jq/download/"
        exit 1
    fi
fi

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

# Check if config file exists
CONFIG_FILE="deployment.config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration file $CONFIG_FILE not found!"
    echo "   Please create it from the template or manually enter values."
    exit 1
fi

# Read configuration
echo "📖 Reading configuration from $CONFIG_FILE..."
RESOURCE_GROUP=$(jq -r '.azure.resourceGroup' $CONFIG_FILE)
LOCATION=$(jq -r '.azure.location' $CONFIG_FILE)
STORAGE_ACCOUNT_NAME=$(jq -r '.azure.storageAccountName' $CONFIG_FILE)
FUNCTION_APP_NAME=$(jq -r '.azure.functionAppName' $CONFIG_FILE)
RUNTIME=$(jq -r '.deployment.runtime' $CONFIG_FILE)
RUNTIME_VERSION=$(jq -r '.deployment.runtimeVersion' $CONFIG_FILE)
FUNCTIONS_VERSION=$(jq -r '.deployment.functionsVersion' $CONFIG_FILE)

# Validate required fields
if [ -z "$RESOURCE_GROUP" ] || [ "$RESOURCE_GROUP" = "null" ]; then
    read -p "📝 Enter Resource Group name: " RESOURCE_GROUP
fi
if [ -z "$FUNCTION_APP_NAME" ] || [ "$FUNCTION_APP_NAME" = "null" ]; then
    read -p "📝 Enter Function App name: " FUNCTION_APP_NAME
fi
if [ -z "$LOCATION" ] || [ "$LOCATION" = "null" ]; then
    LOCATION="eastus"
fi
if [ -z "$STORAGE_ACCOUNT_NAME" ] || [ "$STORAGE_ACCOUNT_NAME" = "null" ]; then
    STORAGE_ACCOUNT_NAME="${FUNCTION_APP_NAME}storage"
fi

echo ""
echo "📋 Deployment Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Function App: $FUNCTION_APP_NAME"
echo "   Location: $LOCATION"
echo "   Storage Account: $STORAGE_ACCOUNT_NAME"
echo "   Runtime: $RUNTIME $RUNTIME_VERSION"
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
APPINSIGHTS_NAME="${FUNCTION_APP_NAME}-insights"
az monitor app-insights component create \
    --app $APPINSIGHTS_NAME \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP \
    --application-type web

# Create Function App
echo "⚡ Creating Function App..."
az functionapp create \
    --resource-group $RESOURCE_GROUP \
    --consumption-plan-location $LOCATION \
    --runtime $RUNTIME \
    --runtime-version $RUNTIME_VERSION \
    --functions-version $FUNCTIONS_VERSION \
    --name $FUNCTION_APP_NAME \
    --storage-account $STORAGE_ACCOUNT_NAME

# Get connection strings
echo "🔌 Retrieving connection strings..."
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
    --name $STORAGE_ACCOUNT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query connectionString -o tsv)

APPINSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show \
    --app $APPINSIGHTS_NAME \
    --resource-group $RESOURCE_GROUP \
    --query connectionString -o tsv)

# Configure Function App settings
echo "⚙️  Configuring Function App settings..."
az functionapp config appsettings set \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        "AzureWebJobsStorage=$STORAGE_CONNECTION_STRING" \
        "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING=$STORAGE_CONNECTION_STRING" \
        "WEBSITE_CONTENTSHARE=${FUNCTION_APP_NAME,,}" \
        "FUNCTIONS_WORKER_RUNTIME=$RUNTIME" \
        "WEBSITE_HOSTNAME=${FUNCTION_APP_NAME}.azurewebsites.net" \
        "APPLICATIONINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONNECTION_STRING"

echo ""
echo "📦 Building and deploying function..."

# Build the project
echo "🧹 Cleaning build artifacts..."
rm -rf obj bin publish

echo "📦 Restoring packages..."
dotnet restore

echo "🏗️  Publishing project..."
dotnet publish HitsterFunction.csproj --configuration Release --output ./publish

# Deploy to Azure from publish directory
echo "🚀 Deploying to Azure..."
cd publish
func azure functionapp publish $FUNCTION_APP_NAME --force
cd ..

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
echo ""
echo "💡 Configuration saved in $CONFIG_FILE for future deployments"
