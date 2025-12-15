#!/bin/bash

# iOS Build Fix Script for Joshua's Laptop
# This script cleans and rebuilds the iOS project

set -e  # Exit on any error

echo "🧹 Cleaning iOS build environment..."

# Navigate to project root (in case script is run from elsewhere)
cd "$(dirname "$0")"

echo "📦 Cleaning React Native caches..."
npx react-native clean

echo "🗑️  Removing iOS build artifacts..."
cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "📲 Reinstalling CocoaPods dependencies..."
pod deintegrate || true
pod install

cd ..

echo "🔄 Cleaning node modules and reinstalling..."
rm -rf node_modules
npm install

echo "✅ Cleanup complete!"
echo ""
echo "🚀 Now you can run one of these commands:"
echo "   Option 1: npx react-native run-ios --device \"Joshua\""
echo "   Option 2: open ios/OBDDiagnosticApp.xcworkspace (then build in Xcode)"
echo ""
