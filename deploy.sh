#!/bin/bash

# Hitster Deployment Helper
# Interactive script to choose deployment method

echo "🚀 Hitster Azure Functions - Deployment Helper"
echo "=============================================="
echo ""

echo "Choose your deployment method:"
echo ""
echo "1️⃣  Full Deployment (Creates resources + deploys code)"
echo "   📝 Use for: First-time deployment, new Function Apps"
echo "   ⏱️  Time: ~5-10 minutes"
echo ""
echo "2️⃣  Code-Only Deployment (Deploys to existing Function App)"
echo "   📝 Use for: Code updates, existing Function Apps"
echo "   ⏱️  Time: ~2-3 minutes"
echo ""
echo "3️⃣  Quick ZIP Deployment (Fastest deployment)"
echo "   📝 Use for: Rapid iterations, development"
echo "   ⏱️  Time: ~30-60 seconds"
echo ""
echo "4️⃣  Test Build (Verify build process only)"
echo "   📝 Use for: Testing before deployment"
echo "   ⏱️  Time: ~30 seconds"
echo ""

read -p "Enter your choice (1-4): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo "🏗️  Starting full deployment..."
        ./deploy-to-azure.sh
        ;;
    2)
        echo ""
        echo "📤 Starting code-only deployment..."
        ./deploy-code-only.sh
        ;;
    3)
        echo ""
        echo "⚡ Starting quick ZIP deployment..."
        ./deploy-quick.sh
        ;;
    4)
        echo ""
        echo "🧪 Testing build process..."
        ./test-build.sh
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please run the script again and choose 1-4."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment helper completed!"