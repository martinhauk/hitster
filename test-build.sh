#!/bin/bash

# Test build process for Azure deployment
echo "🧪 Testing build process for Azure deployment..."

# Clean
echo "🧹 Cleaning..."
rm -rf obj bin publish

# Restore
echo "📦 Restoring packages..."
if dotnet restore hitster.sln; then
    echo "✅ Restore successful"
else
    echo "❌ Restore failed"
    exit 1
fi

# Publish
echo "🏗️  Publishing..."
if dotnet publish HitsterFunction.csproj --configuration Release --output ./publish; then
    echo "✅ Publish successful"
else
    echo "❌ Publish failed"
    exit 1
fi

# Verify publish output
echo "🔍 Verifying publish output..."
if [[ -f "publish/HitsterFunction.dll" && -f "publish/host.json" && -d "publish/wwwroot" ]]; then
    echo "✅ All required files present"
    echo "   📁 HitsterFunction.dll: $(ls -lh publish/HitsterFunction.dll | awk '{print $5}')"
    echo "   📁 host.json: Found"
    echo "   📁 wwwroot: $(ls -1 publish/wwwroot/ | wc -l) files"
else
    echo "❌ Missing required files"
    exit 1
fi

echo ""
echo "✅ Build test completed successfully!"
echo "💡 The deployment script should now work without errors."

# Clean up test files
rm -rf publish