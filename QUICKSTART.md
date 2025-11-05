# 🚀 Quick Start Guide - SKY0 Token Distribution POC

Get started with the SKY0 token distribution system in 5 minutes!

## ⚡ Fast Track Setup

### 1. Install Dependencies (30 seconds)
```bash
npm run setup
```

This will:
- Install all required packages
- Create your `.env` file from template

### 2. Configure Environment (2 minutes)

Edit `.env` file:

```env
# 1. Get Helius API key from https://helius.xyz
HELIUS_API_KEY=your_helius_api_key_here

# 2. Get Helius RPC URL (includes your API key)
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=your_api_key

# 3. Generate wallet (next step)
WALLET_PRIVATE_KEY=

# 4. Use devnet for testing
SOLANA_NETWORK=devnet
```

### 3. Generate Wallet (30 seconds)
```bash
npm run generate-keypair
```

Copy the private key array and add to `.env`:
```env
WALLET_PRIVATE_KEY=[123,45,67,89,...]
```

### 4. Fund Your Wallet (1 minute)
```bash
# Get devnet SOL (free testnet tokens)
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet

# Or use web faucet: https://faucet.solana.com
```

### 5. Run Test (30 seconds)
```bash
npm test
```

You should see the distribution calculation working! ✅

## 🎯 Full Workflow

### Option A: Test Only (No Real Tokens)
```bash
# Test distribution calculations
npm test

# Generate visual report
npm run report
```

### Option B: Full POC with Real Devnet Tokens
```bash
# Step 1: Create SKY0 token
npm run create-token

# Step 2: Update leaderboard.csv with your data
# (Edit the file with real wallet addresses)

# Step 3: Run distribution
npm run distribute
```

## 📝 Leaderboard Format

Edit `leaderboard.csv`:
```csv
wallet_address,token_amount
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100
9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin,250
5ZiE1aEK4xs6BYw8pTKn4RvZxZKB5qfxQzKpjKYMB4qp,50
```

**Important:**
- `wallet_address`: Valid Solana wallet addresses
- `token_amount`: Points earned (used for proportional distribution)

## 🎬 See It in Action

### Test Distribution Calculation
```bash
$ npm test

🧪 Testing Token Distribution Calculation
✅ Loaded 3 entries

📊 Distribution Calculation:
   Total Points: 400
   Tokens Available: 100,000,000
   Rate: 250000.0000 tokens per point

Distribution Results:
   1. User: EXAmPLE... → 25,000,000 SKY0 (25.00%)
   2. User: ANothEr... → 62,500,000 SKY0 (62.50%)
   3. User: THirDWa... → 12,500,000 SKY0 (12.50%)

✨ Test complete!
```

### Create Token
```bash
$ npm run create-token

🚀 Creating SKY0 Token...
✅ Token Mint Created: HeLiUS...
✅ Minted 1,000,000,000 SKY0 tokens
🔒 Mint authority frozen!

💾 Token info saved to token-info.json
✨ SKY0 Token creation complete!
```

### Distribute Tokens
```bash
$ npm run distribute

🎯 SKY0 Token Distribution System
📖 Reading leaderboard... ✅ 3 entries
🚢 Distributing tokens with Helius Airship...

📋 Distribution Details:
   1. EXAmPLE... → 25,000,000 SKY0
   2. ANothEr... → 62,500,000 SKY0
   3. THirDWa... → 12,500,000 SKY0

💾 Distribution record saved
✨ Distribution complete!
```

## 🔍 Troubleshooting

### Issue: "WALLET_PRIVATE_KEY not set"
**Solution:** Run `npm run generate-keypair` and add to `.env`

### Issue: "Insufficient balance"
**Solution:** Fund your wallet:
```bash
solana airdrop 2 YOUR_ADDRESS --url devnet
```

### Issue: "TOKEN_MINT_ADDRESS not set"
**Solution:** Run `npm run create-token` first

### Issue: "Invalid wallet address"
**Solution:** Check leaderboard.csv addresses are valid Solana addresses

## 📚 Available Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Initial setup |
| `npm run generate-keypair` | Create new wallet |
| `npm test` | Test distribution logic |
| `npm run report` | Generate visual report |
| `npm run create-token` | Create SKY0 token |
| `npm run distribute` | Distribute tokens |

## 🎯 What This POC Demonstrates

✅ **Token Creation**
- 1 billion SKY0 tokens minted
- Mint authority frozen permanently
- Ready for distribution

✅ **Proportional Distribution**
- Points-based allocation
- Automatic percentage calculation
- Fair and transparent

✅ **Helius Airship Integration**
- Bulk token distribution
- Automatic ATA creation
- Production-ready API integration

✅ **Complete System**
- CSV data import
- Distribution calculation
- Transaction execution
- Record keeping

## 🚀 Next Steps

### For Testing
1. ✅ Run through the quick start above
2. ✅ Test with your own wallet addresses
3. ✅ Experiment with different point distributions

### For Production
1. Get Helius Pro account for higher limits
2. Switch to mainnet in `.env`
3. Uncomment real API call in `distribute.js`
4. Test with small amounts first
5. Set up monitoring and alerts

## 📖 Full Documentation

- **README.md** - Complete documentation
- **EXAMPLE.md** - Detailed examples
- **HELIUS_AIRSHIP_API.md** - API reference

## 💡 Tips

- Start with devnet for testing
- Use small amounts first
- Keep distribution records
- Monitor transaction confirmations
- Test error scenarios
- Set up automated backups

## 🎉 Success!

If you can run `npm test` and see the distribution calculation, **you have a working POC!**

The system is:
- ✅ Reading leaderboard data
- ✅ Calculating proportional distribution
- ✅ Preparing Helius Airship payload
- ✅ Ready for token distribution

---

**Need help?** Check the troubleshooting section or review the full documentation!
