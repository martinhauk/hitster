#!/bin/bash

# Start Azure Functions for Hitster project
echo "🚀 Starting Hitster Azure Functions..."

# Check if Azurite is running
if ! pgrep -f "azurite" > /dev/null; then
    echo "🗄️  Starting Azurite (Azure Storage Emulator)..."
    mkdir -p /tmp/azurite
    azurite --silent --location /tmp/azurite --debug /tmp/azurite/debug.log > /tmp/azurite/azurite.log 2>&1 &
    sleep 3
fi

# Build the project
echo "🔨 Building project..."
# Clean obj directory to avoid multiple project file conflicts
rm -rf obj/Debug/net8.0/WorkerExtensions 2>/dev/null || true
dotnet build HitsterFunction.csproj

# Navigate to output directory and start functions
echo "▶️  Starting Azure Functions..."
cd bin/Debug/net8.0
func start