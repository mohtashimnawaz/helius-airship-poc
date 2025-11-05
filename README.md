# SKY0 Token Distribution POC

A complete proof of concept for distributing SKY0 tokens based on leaderboard points using Helius Airship.

## 🎯 Overview

This POC demonstrates:
- Creating and minting 1 billion SKY0 tokens with frozen mint authority
- Reading leaderboard data from CSV
- Calculating proportional token distribution based on points
- Distributing ~100M tokens per period using Helius Airship
- Automatic creation of associated token accounts

## 🏗️ Architecture

```
┌─────────────────┐
│  Leaderboard    │
│  (CSV File)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Calculate      │
│  Distribution   │
│  (Proportional) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Helius         │
│  Airship API    │
│  (Bulk Send)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Token Transfer │
│  to Users       │
└─────────────────┘
```

## 📋 Prerequisites

- Node.js v16 or higher
- A Solana wallet with SOL for transaction fees
- Helius API key (get from https://helius.xyz)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Get your Helius RPC URL from https://helius.xyz
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY

# Generate using: node generate-keypair.js
WALLET_PRIVATE_KEY=[your,private,key,array]

# Your Helius API key
HELIUS_API_KEY=your_helius_api_key

# Network (devnet for testing, mainnet-beta for production)
SOLANA_NETWORK=devnet

# Distribution parameters
TOKENS_PER_PERIOD=100000000
TOTAL_SUPPLY=1000000000
DECIMALS=9
```

### 3. Generate a Keypair (if needed)

```bash
node generate-keypair.js
```

This will:
- Generate a new Solana keypair
- Display the public key and private key
- Save the keypair to `wallet.json`

**Important:** Fund this wallet with SOL on your chosen network!

For devnet:
```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

### 4. Prepare Your Leaderboard

Edit `leaderboard.csv` with your user data:

```csv
wallet_address,token_amount
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100
9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin,250
5ZiE1aEK4xs6BYw8pTKn4RvZxZKB5qfxQzKpjKYMB4qp,50
```

- `wallet_address`: Solana wallet address
- `token_amount`: Points earned in the period (used for proportional calculation)

### 5. Test Distribution Calculation

```bash
npm test
```

This will:
- Read the leaderboard
- Calculate token distribution
- Show results without sending any tokens
- Test multiple scenarios

### 6. Create the SKY0 Token

```bash
npm run create-token
```

This will:
- Create a new SPL token mint
- Mint 1 billion tokens
- Freeze the mint authority (no more tokens can be minted)
- Save token info to `token-info.json`
- Update `.env` with the mint address

### 7. Distribute Tokens

```bash
npm run distribute
```

This will:
- Read the leaderboard
- Calculate proportional distribution
- Create the Helius Airship payload
- Save distribution records

## 📊 Distribution Logic

The distribution follows this formula:

```
User's Token Amount = (User's Points / Total Points) × Tokens Per Period
```

**Example:**
- Total Points: 400 (100 + 250 + 50)
- Tokens Per Period: 100,000,000

User distributions:
- User A (100 points): 25,000,000 tokens (25%)
- User B (250 points): 62,500,000 tokens (62.5%)
- User C (50 points): 12,500,000 tokens (12.5%)

## 🚢 Helius Airship Integration

### API Payload Format

```json
{
  "mint": "TOKEN_MINT_ADDRESS",
  "recipients": [
    {
      "recipientAddress": "USER_WALLET_ADDRESS",
      "amount": 25000000000000000
    }
  ],
  "priorityFee": "medium",
  "createAtaIfMissing": true
}
```

### API Endpoint

```
POST https://airship.helius.xyz/v1/distribute
Authorization: Bearer YOUR_HELIUS_API_KEY
Content-Type: application/json
```

### Enabling Real Distribution

In `distribute.js`, uncomment the API call section:

```javascript
const response = await axios.post(
  airshipUrl,
  payload,
  {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  }
);
```

## 📁 Project Structure

```
.
├── package.json              # Dependencies and scripts
├── .env                      # Configuration (not in git)
├── .env.example             # Example configuration
├── README.md                 # This file
│
├── generate-keypair.js      # Generate Solana wallet
├── create-token.js          # Create and mint SKY0 token
├── distribute.js            # Main distribution logic
├── test-distribution.js     # Test distribution calculations
│
├── leaderboard.csv          # User points data
├── token-info.json          # Token details (generated)
└── distribution-*.json      # Distribution records (generated)
```

## 🔐 Security Best Practices

1. **Never commit private keys**: `.env` and `wallet.json` are in `.gitignore`
2. **Use environment variables**: Store sensitive data in `.env`
3. **Test on devnet first**: Always test on devnet before mainnet
4. **Verify recipients**: Double-check wallet addresses in leaderboard
5. **Monitor transactions**: Keep distribution records for auditing
6. **Rate limiting**: Be aware of RPC rate limits for bulk operations

## 🧪 Testing Scenarios

### Scenario 1: Small Leaderboard (Current)
- 3 users
- 400 total points
- 100M tokens distributed

### Scenario 2: Large Leaderboard
Add more users to `leaderboard.csv`:
```csv
wallet_address,token_amount
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,1000
9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin,2500
5ZiE1aEK4xs6BYw8pTKn4RvZxZKB5qfxQzKpjKYMB4qp,500
...
```

### Scenario 3: Multiple Periods
Run distribution monthly:
```bash
# Period 1 (January)
npm run distribute

# Period 2 (February)
# Update leaderboard.csv with new points
npm run distribute

# ... and so on
```

## 📈 Monitoring & Analytics

Each distribution creates a record file with:
- Timestamp
- Period identifier
- Complete distribution details
- Transaction signatures (when using real API)
- Total tokens distributed

Example `distribution-1699123456789.json`:
```json
{
  "timestamp": "2025-11-05T10:30:00.000Z",
  "period": "2025-11",
  "mintAddress": "...",
  "distribution": [...],
  "totalDistributed": 100000000
}
```

## 🛠️ Troubleshooting

### Error: "Insufficient balance"
- Fund your wallet with more SOL
- Devnet: Use Solana faucet
- Mainnet: Transfer SOL to your wallet

### Error: "Invalid wallet address"
- Check leaderboard.csv for correct Solana addresses
- Addresses should be 32-44 characters
- Use Solana Explorer to verify addresses

### Error: "TOKEN_MINT_ADDRESS not set"
- Run `npm run create-token` first
- Check `.env` file has the mint address

### Error: "HELIUS_API_KEY not set"
- Get API key from https://helius.xyz
- Add to `.env` file

## 📚 Additional Resources

- [Helius Documentation](https://docs.helius.xyz)
- [Helius Airship API](https://docs.helius.xyz/airship)
- [Solana SPL Token](https://spl.solana.com/token)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Helius documentation
3. Open an issue in the repository

## 📝 License

MIT License - feel free to use this POC for your project!

---

**Built with ❤️ using Helius Airship**
