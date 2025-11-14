#!/bin/bash

# Dev container setup script for Hitster Azure Functions
echo "🚀 Setting up Hitster Azure Functions development environment..."

# Restore .NET packages
echo "📦 Restoring .NET packages..."
dotnet restore hitster.sln

# Install Azure Functions Core Tools and Azurite
echo "🔧 Installing Azure Functions Core Tools and Azurite..."
npm install -g azure-functions-core-tools@4 azurite --unsafe-perm true

# Create Azurite data directory
echo "📁 Setting up Azurite storage..."
mkdir -p /tmp/azurite

# Start Azurite in the background
echo "🗄️  Starting Azurite (Azure Storage Emulator)..."
azurite --silent --location /tmp/azurite --debug /tmp/azurite/debug.log > /tmp/azurite/azurite.log 2>&1 &

# Wait a moment for Azurite to start
sleep 3

# Build the project
echo "🔨 Building the project..."
dotnet build HitsterFunction.csproj

echo "✅ Setup complete!"
echo ""
echo "📋 To start the Azure Functions:"
echo "   cd /workspaces/hitster"
echo "   dotnet build HitsterFunction.csproj"
echo "   cd bin/Debug/net8.0"
echo "   func start"
echo ""
echo "🌐 Services will be available at:"
echo "   - Azure Functions: http://localhost:7071"
echo "   - Azurite Blob: http://localhost:10000"
echo "   - Azurite Queue: http://localhost:10001" 
echo "   - Azurite Table: http://localhost:10002"