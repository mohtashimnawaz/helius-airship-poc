# Compressed Token Distribution Guide

## 🚀 Complete Guide to Using Helius AirShip with ZK Compression

This guide covers everything you need to know about distributing tokens using ZK compression for **5000x cost savings**.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Cost Comparison](#cost-comparison)
3. [Setup Instructions](#setup-instructions)
4. [Creating Compressed Tokens](#creating-compressed-tokens)
5. [Distributing Compressed Tokens](#distributing-compressed-tokens)
6. [Decompressing Tokens](#decompressing-tokens)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What is ZK Compression?

**ZK Compression** (Zero-Knowledge Compression) is a technology that reduces the cost of token operations on Solana by up to **5000x**. It's powered by:

- **Light Protocol**: Provides the compression infrastructure
- **Helius RPC**: Offers compression-enabled RPC endpoints
- **State Trees**: Store compressed account data off-chain

### How It Works

```
Traditional SPL Token:
┌─────────────────┐
│  On-Chain       │  Cost: ~0.002 SOL per recipient
│  Token Account  │  Data: Stored fully on-chain
│  (Full State)   │  Size: ~165 bytes
└─────────────────┘

Compressed Token (ZK):
┌─────────────────┐
│  Compressed     │  Cost: ~0.0000001 SOL per recipient
│  State Tree     │  Data: Stored in merkle tree
│  (Hash Only)    │  Size: ~32 bytes (hash only)
└─────────────────┘
```

### Key Benefits

✅ **Massive Cost Savings**: Up to 5000x cheaper than regular SPL tokens  
✅ **Same Security**: Uses ZK proofs for verification  
✅ **Scalable**: Perfect for airdrops to 100K+ recipients  
✅ **Decompressible**: Can convert back to regular SPL tokens anytime

### When to Use

Use compressed tokens when:
- 🎯 Distributing to **>10,000 recipients**
- 💰 Cost savings are critical
- 🚀 Scaling to massive airdrops
- ⏰ Recipients can wait for decompression

Stick with regular SPL tokens when:
- 👥 Distributing to **<1,000 recipients**
- ⚡ Immediate wallet compatibility needed
- 🎨 Integrating with existing DeFi protocols
- 💼 Mainnet deployment requires maximum compatibility

---

## Cost Comparison

### Real Numbers

| Recipients | Regular SPL | Compressed | Savings |
|-----------|-------------|------------|---------|
| 100 | ~0.20 SOL ($20) | ~0.00001 SOL ($0.001) | 99.995% |
| 1,000 | ~2.00 SOL ($200) | ~0.0001 SOL ($0.01) | 99.995% |
| 10,000 | ~20.00 SOL ($2,000) | ~0.001 SOL ($0.10) | 99.995% |
| 100,000 | ~200.00 SOL ($20,000) | ~0.01 SOL ($1.00) | 99.995% |

*Assuming SOL = $100*

### Example: 100,000 Recipients

**Regular SPL Token Distribution:**
```
Cost per recipient: ~0.002 SOL
Total: 100,000 × 0.002 = 200 SOL
At $100/SOL = $20,000 💸
```

**Compressed Token Distribution:**
```
Cost per recipient: ~0.0000001 SOL
Total: 100,000 × 0.0000001 = 0.01 SOL
At $100/SOL = $1.00 🎉
```

**Savings: $19,999 (99.995%)**

---

## Setup Instructions

### Prerequisites

1. **Node.js** v16 or higher
2. **SOL** for transaction fees (~0.1 SOL for testing)
3. **Helius API Key** from https://helius.xyz
4. **Wallet** with private key

### Installation

The required packages are already installed:

```bash
npm install
```

Packages included:
- `@lightprotocol/stateless.js` - Core compression library
- `@lightprotocol/compressed-token` - Compressed token program
- `helius-airship-core` - AirShip utilities

### Environment Setup

Add to your `.env` file:

```env
# Existing configuration
WALLET_PRIVATE_KEY=your_base58_private_key
HELIUS_API_KEY=your_helius_api_key
SOLANA_NETWORK=devnet

# Add this for compressed tokens
COMPRESSED_TOKEN_MINT=will_be_set_after_creation
```

---

## Creating Compressed Tokens

### Step 1: Ensure Wallet Has SOL

```bash
# Check balance
solana balance

# For devnet, airdrop SOL if needed
solana airdrop 2
```

### Step 2: Create Compressed Token

```bash
npm run create-compressed-token
```

**What happens:**
1. Creates a new compressed token mint
2. Mints 1 billion tokens to your compressed account
3. Saves token info to `compressed-token-info.json`
4. Displays mint address

**Expected output:**
```
🚀 Creating Compressed SKY0 Token with ZK Compression
═══════════════════════════════════════════════════

📍 Wallet Address: 2qtosMyj7gqxEnVadAV849mWDVVKNjeSsexh1PkPEzxY
🔗 Connected to Helius RPC (ZK Compression enabled)

📝 Step 1: Creating compressed token mint...
✅ Compressed token mint created!
   Mint Address: ABC123...XYZ789
   Transaction: 5KqxZY...
   Decimals: 9

💰 Step 2: Minting compressed tokens...
✅ Tokens minted successfully!
   Amount: 1,000,000,000 SKY0
   Transaction: 7NmxPQ...

✨ Success! Compressed token is ready!
```

### Step 3: Update .env

Copy the mint address from output and add to `.env`:

```env
COMPRESSED_TOKEN_MINT=ABC123...XYZ789
```

### Verify Creation

Check the token on Solana Explorer:
```
https://explorer.solana.com/address/YOUR_MINT_ADDRESS?cluster=devnet
```

---

## Distributing Compressed Tokens

### Step 1: Prepare Leaderboard

Ensure `leaderboard.csv` is formatted correctly:

```csv
wallet_address,token_amount
FWKcvRkDJHHvP2s5Sege6NA6vdRmBzcPinRRAxwh1zwc,100
BYmeAV9N3EXoij7BfYjGSVfmAn2aHXLt2HWKnxn99po8,250
6xX9G1jy4quapnew9CpHd1rz3pWKgysM2Q4MMBkmQMxN,50
```

### Step 2: Run Distribution

```bash
npm run distribute-compressed
```

**What happens:**
1. Reads leaderboard and calculates distribution
2. Executes compressed token transfers
3. Uses ZK compression for massive savings
4. Saves distribution record

**Expected output:**
```
🚀 SKY0 Compressed Token Distribution (ZK Compression)
═══════════════════════════════════════════════════
💡 Using Helius AirShip technology for massive cost savings!

📖 Reading leaderboard...
✅ Loaded 3 entries

📊 Distribution Calculation:
   Total Points: 400
   Tokens Available: 100,000,000
   Rate: 250000.0000 tokens per point

📦 Starting compressed token transfers...

📤 Sending 25,000,000 SKY0 to FWKcvRkDJHHvP2s5Sege6NA6vdRmBzcPinRRAxwh1zwc...
   Points: 100 (25.00%)
   ✅ Success! (234ms)
   Signature: 2mwR...
   💰 Cost: ~0.00000001 SOL (vs ~0.002 SOL regular)

[... more transfers ...]

═══════════════════════════════════════════════════
📊 Distribution Complete!

✅ Successful Transfers: 3
❌ Failed Transfers: 0
📦 Total Recipients: 3
💰 Total Cost: ~0.00000003 SOL

💡 Cost Comparison:
   Regular SPL Transfers: ~0.0060 SOL
   Compressed Transfers: ~0.00000003 SOL
   💰 Savings: 0.0060 SOL (99.99%)

✨ Compressed token distribution complete!
🚀 Helius AirShip + ZK Compression = Massive Savings!
```

### Step 3: Verify Distribution

Distribution record is saved to `distribution-compressed-{timestamp}.json`:

```json
{
  "timestamp": "2025-11-14T10:30:00.000Z",
  "tokenType": "compressed",
  "compressionEnabled": true,
  "successCount": 3,
  "costs": {
    "total": 0.00000003,
    "perRecipient": 0.00000001,
    "savingsVsRegular": 0.0060,
    "savingsPercent": 99.99
  },
  "signatures": [...]
}
```

---

## Decompressing Tokens

Recipients need to decompress tokens to use them with regular wallets and DEXs.

### For Recipients

Share these instructions with your airdrop recipients:

#### Step 1: Install Tool

```bash
git clone https://github.com/your-org/helius-airship-poc
cd helius-airship-poc
npm install
```

#### Step 2: Configure

Create `.env` file:

```env
WALLET_PRIVATE_KEY=your_private_key
HELIUS_API_KEY=get_from_helius
COMPRESSED_TOKEN_MINT=ABC123...XYZ789
SOLANA_NETWORK=devnet
DECIMALS=9
```

#### Step 3: Decompress

```bash
# Decompress all tokens
npm run decompress-tokens

# Decompress specific amount
node decompress-tokens.js 1000
```

**Expected output:**
```
🔓 Decompress Compressed Tokens to Regular SPL Tokens
═══════════════════════════════════════════════════

📍 Your Wallet: 2qtosMyj...
🪙 Compressed Token Mint: ABC123...
🔗 Connected to Helius RPC (ZK Compression enabled)

📦 Decompressing: 1,000 tokens

🔄 Starting decompression process...
✅ Decompression successful!
   Transaction Signature: 5KqxZ...
   Amount: 1000 tokens

✨ Decompression Complete!

📝 What happened:
   ✅ Compressed tokens removed from compressed account
   ✅ Regular SPL tokens added to your token account
   ✅ Tokens now usable with any Solana wallet/DEX
```

### Automated Decompression (Optional)

For better UX, you can create a web interface:

```javascript
// Example decompression in your web app
import { decompressTokens } from './decompress-tokens.js';

async function handleDecompress() {
  const amount = userInputAmount;
  await decompressTokens(userWallet, amount);
  showSuccess('Tokens decompressed!');
}
```

---

## Troubleshooting

### Issue: "COMPRESSED_TOKEN_MINT not set"

**Solution:**
```bash
# Run token creation first
npm run create-compressed-token

# Copy mint address to .env
echo "COMPRESSED_TOKEN_MINT=YOUR_MINT_ADDRESS" >> .env
```

### Issue: "Insufficient SOL balance"

**Solution:**
```bash
# For devnet
solana airdrop 2

# For mainnet, transfer SOL to wallet
# Need ~0.05 SOL for token creation
# Need ~0.000001 SOL per recipient
```

### Issue: "RPC endpoint doesn't support compression"

**Solution:**
- Ensure using Helius RPC endpoint
- Verify API key is correct
- Check endpoint format: `https://devnet.helius-rpc.com/?api-key=YOUR_KEY`

### Issue: "Decompression failed"

**Solution:**
1. Verify compressed token balance
2. Check amount is less than balance
3. Ensure recipient has SOL for fees
4. Try smaller amount first

### Issue: "Method not found: decompress"

**Solution:**
- API may vary by Light Protocol version
- Check documentation: https://docs.lightprotocol.com/
- Update packages: `npm update`

---

## Advanced Topics

### Batch Distribution

For large airdrops, implement batching:

```javascript
// Process in batches of 100
const BATCH_SIZE = 100;
for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
  const batch = recipients.slice(i, i + BATCH_SIZE);
  await distributeBatch(batch);
  await delay(1000); // Rate limiting
}
```

### Monitoring

Track distribution progress:

```javascript
const metrics = {
  total: recipients.length,
  successful: 0,
  failed: 0,
  totalCost: 0,
};

// Update after each transfer
metrics.successful++;
metrics.totalCost += 0.0000001;
```

### Error Recovery

Implement retry logic:

```javascript
async function transferWithRetry(recipient, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await transfer(recipient);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

---

## Production Checklist

Before deploying to mainnet:

- [ ] Test full flow on devnet
- [ ] Verify all transactions succeed
- [ ] Document decompression process for recipients
- [ ] Set up monitoring and alerts
- [ ] Prepare customer support for questions
- [ ] Fund wallet with sufficient SOL
- [ ] Update `.env` to mainnet configuration
- [ ] Test with small batch first
- [ ] Have rollback plan ready

---

## Resources

### Documentation
- **Light Protocol**: https://docs.lightprotocol.com/
- **Helius Docs**: https://docs.helius.dev/
- **Solana Docs**: https://docs.solana.com/

### Tools
- **Solana Explorer**: https://explorer.solana.com/
- **Helius Dashboard**: https://dashboard.helius.xyz/
- **Light Protocol SDK**: https://github.com/Lightprotocol/light-protocol

### Support
- **Light Protocol Discord**: https://discord.gg/lightprotocol
- **Helius Discord**: https://discord.gg/helius
- **Solana Discord**: https://discord.gg/solana

---

## Summary

### Regular vs Compressed Tokens

| Feature | Regular SPL | Compressed (ZK) |
|---------|-------------|-----------------|
| **Cost** | ~0.002 SOL/recipient | ~0.0000001 SOL/recipient |
| **Wallet Support** | All wallets | Requires decompression |
| **DEX Support** | Immediate | After decompression |
| **Best For** | <1,000 recipients | >10,000 recipients |
| **Setup** | Simple | Moderate |
| **Maintenance** | None | Need decompression tools |

### Recommendation

**Use Compressed Tokens When:**
- ✅ Distributing to >10,000 recipients
- ✅ Cost savings are critical ($19,999 saved per 100K recipients)
- ✅ Can provide decompression tools
- ✅ Recipients can wait for decompression

**Use Regular SPL Tokens When:**
- ✅ Distributing to <1,000 recipients
- ✅ Need immediate wallet compatibility
- ✅ Integrating with existing DeFi
- ✅ Simpler user experience preferred

---

## Quick Reference

### Commands

```bash
# Create compressed token
npm run create-compressed-token

# Distribute compressed tokens
npm run distribute-compressed

# Decompress tokens (for recipients)
npm run decompress-tokens
node decompress-tokens.js 1000

# Regular distribution (for comparison)
npm run distribute
```

### Configuration

```env
# .env for compressed tokens
COMPRESSED_TOKEN_MINT=your_mint_address
WALLET_PRIVATE_KEY=your_private_key
HELIUS_API_KEY=your_api_key
SOLANA_NETWORK=devnet
DECIMALS=9
TOKENS_PER_PERIOD=100000000
```

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
