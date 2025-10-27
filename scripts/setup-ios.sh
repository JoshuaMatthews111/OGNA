#!/bin/bash

# OGNA iOS Setup Script
# This script prepares the iOS project for Xcode build

echo "🚀 OGNA iOS Setup Script"
echo "========================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Step 1: Installing Node dependencies..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

echo "🏗️  Step 2: Generating iOS native project..."
npx expo prebuild --platform ios --clean
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate iOS project"
    exit 1
fi
echo "✅ iOS project generated"
echo ""

echo "🍎 Step 3: Installing CocoaPods dependencies..."
cd ios
pod install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install CocoaPods"
    cd ..
    exit 1
fi
cd ..
echo "✅ CocoaPods installed"
echo ""

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: open ios/overcomers-global-network.xcworkspace"
echo "2. Select your development team in Signing & Capabilities"
echo "3. Build and run (Cmd+R)"
echo ""
echo "Or run in simulator: npm run ios"
