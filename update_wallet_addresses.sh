#!/bin/bash

# 💰 Wallet Address Configuration Script
# This script helps you update payment wallet addresses in AiFriend

echo "🚀 AiFriend Payment Configuration"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "app.js" ]; then
    echo "❌ Error: Please run this script from the AiFriend directory"
    echo "   cd /Users/wujianpeng/Documents/webapp/AiFriend"
    exit 1
fi

echo "📝 Please enter your wallet addresses:"
echo ""

# Get TON address
read -p "💎 TON Wallet Address (starts with UQ or EQ): " TON_ADDRESS
if [ -z "$TON_ADDRESS" ]; then
    echo "❌ TON address cannot be empty"
    exit 1
fi

# Get TRON address
read -p "🔺 TRON Wallet Address (starts with T): " TRON_ADDRESS
if [ -z "$TRON_ADDRESS" ]; then
    echo "❌ TRON address cannot be empty"
    exit 1
fi

echo ""
echo "📋 Configuration Summary:"
echo "  TON:  $TON_ADDRESS"
echo "  TRON: $TRON_ADDRESS"
echo ""

read -p "✅ Confirm and update? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "🔄 Updating wallet addresses..."

# Backup original files
echo "📦 Creating backups..."
cp app.js app.js.backup
cp public/app.js public/app.js.backup

# Update app.js
echo "📝 Updating app.js..."
sed -i '' "s/const tonAddress = 'YOUR_TON_WALLET_ADDRESS';/const tonAddress = '$TON_ADDRESS';/" app.js
sed -i '' "s/const tronAddress = 'YOUR_TRON_WALLET_ADDRESS';/const tronAddress = '$TRON_ADDRESS';/" app.js

# Update public/app.js
echo "📝 Updating public/app.js..."
sed -i '' "s/const tonAddress = 'YOUR_TON_WALLET_ADDRESS';/const tonAddress = '$TON_ADDRESS';/" public/app.js
sed -i '' "s/const tronAddress = 'YOUR_TRON_WALLET_ADDRESS';/const tronAddress = '$TRON_ADDRESS';/" public/app.js

echo ""
echo "✅ Wallet addresses updated successfully!"
echo ""
echo "📋 Backup files created:"
echo "  - app.js.backup"
echo "  - public/app.js.backup"
echo ""
echo "🚀 Next steps:"
echo "  1. Test locally: open public/index.html in browser"
echo "  2. Push to GitHub:"
echo "     git add ."
echo "     git commit -m 'Configure payment wallet addresses'"
echo "     git push"
echo "  3. Wait 1-2 minutes for deployment"
echo "  4. Test at: https://wujp123.github.io/AiFriend/"
echo ""
echo "🎉 Done! Your payment system is ready to test."
