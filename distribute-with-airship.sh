#!/bin/bash

echo "🚀 Helius AirShip Token Distribution"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if helius-airship CLI is installed
if ! command -v helius-airship &> /dev/null; then
    echo "📦 Installing Helius AirShip CLI..."
    npm install -g helius-airship
    echo ""
fi

# Check for required files and env variables
if [ ! -f "airship-distribution.csv" ]; then
    echo "❌ airship-distribution.csv not found!"
    echo "💡 Run: npm run airship"
    exit 1
fi

if [ -z "$TOKEN_MINT_ADDRESS" ]; then
    echo "⚠️  Loading environment variables..."
    source .env
fi

if [ -z "$TOKEN_MINT_ADDRESS" ]; then
    echo "❌ TOKEN_MINT_ADDRESS not set in .env"
    exit 1
fi

if [ -z "$HELIUS_API_KEY" ]; then
    echo "❌ HELIUS_API_KEY not set in .env"
    exit 1
fi

echo "📋 Distribution Details:"
echo "   Token Mint: $TOKEN_MINT_ADDRESS"
echo "   CSV File: airship-distribution.csv"
echo "   Recipients: $(tail -n +2 airship-distribution.csv | wc -l | xargs)"
echo ""

# Show CSV preview
echo "📄 CSV Preview:"
head -4 airship-distribution.csv
echo ""

echo "🎯 Starting Helius AirShip distribution..."
echo ""

# Create temporary wallet JSON from .env WALLET_PRIVATE_KEY
if [ -z "$WALLET_PRIVATE_KEY" ]; then
    echo "❌ WALLET_PRIVATE_KEY not set in .env"
    exit 1
fi

echo "🔑 Creating temporary wallet file from .env..."
WALLET_PATH="./temp-airship-wallet.json"

# Convert base58 private key to wallet JSON using Node.js
node -e "
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pk = process.env.WALLET_PRIVATE_KEY;
let keypair;

try {
  keypair = Keypair.fromSecretKey(bs58.decode(pk));
} catch (e) {
  try {
    const pkArray = JSON.parse(pk);
    keypair = Keypair.fromSecretKey(Uint8Array.from(pkArray));
  } catch (e2) {
    console.error('❌ Invalid WALLET_PRIVATE_KEY format');
    process.exit(1);
  }
}

fs.writeFileSync('$WALLET_PATH', JSON.stringify(Array.from(keypair.secretKey)));
console.log('✅ Wallet file created:', keypair.publicKey.toString());
"

if [ ! -f "$WALLET_PATH" ]; then
    echo "❌ Failed to create wallet file"
    exit 1
fi

echo "🔑 Using project wallet from .env"
echo ""

echo "📝 Helius AirShip CLI Command:"
echo ""
echo "   helius-airship \\"
echo "     --keypair $WALLET_PATH \\"
echo "     --url https://devnet.helius-rpc.com/?api-key=$HELIUS_API_KEY"
echo ""
echo "⚠️  Note: AirShip CLI is interactive. It will:"
echo "   1. Ask for your CSV file (use: airship-distribution.csv)"
echo "   2. Ask for token mint (use: $TOKEN_MINT_ADDRESS)"
echo "   3. Process the distribution with ZK compression"
echo ""
read -p "Press Enter to start Helius AirShip CLI..."

# Execute AirShip - it's interactive
helius-airship \
  --keypair "$WALLET_PATH" \
  --url "https://devnet.helius-rpc.com/?api-key=$HELIUS_API_KEY"

# Cleanup temporary wallet
echo ""
echo "🧹 Cleaning up temporary files..."
rm -f "$WALLET_PATH"

echo ""
echo "✨ Distribution complete!"
echo ""
echo "🔗 View your transactions:"
echo "   Token: https://explorer.solana.com/address/$TOKEN_MINT_ADDRESS?cluster=devnet"
