#!/bin/bash

echo "🔍 Checking Hitster services status..."
echo ""

# Check Azurite
if pgrep -f "azurite" > /dev/null; then
    echo "✅ Azurite (Azure Storage Emulator) is running"
    echo "   📊 Blob service: http://localhost:10000"
    echo "   📊 Queue service: http://localhost:10001"
    echo "   📊 Table service: http://localhost:10002"
else
    echo "❌ Azurite is not running"
    echo "   💡 Run './start-functions.sh' or 'azurite --location /tmp/azurite &'"
fi

echo ""

# Check Azure Functions
if pgrep -f "func" > /dev/null; then
    echo "✅ Azure Functions Core Tools is running"
    echo "   🎵 Functions available at: http://localhost:7071"
else
    echo "❌ Azure Functions is not running"
    echo "   💡 Run './start-functions.sh' to start"
fi

echo ""

# Check if ports are listening
if netstat -tln 2>/dev/null | grep -q ":7071 "; then
    echo "✅ Port 7071 (Azure Functions) is listening"
else
    echo "❌ Port 7071 (Azure Functions) is not listening"
fi

if netstat -tln 2>/dev/null | grep -q ":10000 "; then
    echo "✅ Port 10000 (Azurite Blob) is listening"
else
    echo "❌ Port 10000 (Azurite Blob) is not listening"
fi