# Helius AirShip Integration Guide

## What is Helius AirShip?

Helius AirShip is an **open-source tool** that uses **ZK Compression** to drastically reduce the cost of token airdrops on Solana. It can reduce costs by up to **5000x** compared to traditional SPL token transfers.

## Key Features

- **ZK Compression**: Uses Zero-Knowledge compression technology from Light Protocol
- **Cost Reduction**: Up to 5000x cheaper than regular SPL token transfers
- **Open Source**: Available at https://github.com/helius-labs/airship
- **Batch Processing**: Queue and send multiple transfers efficiently

## Important Limitations

### ⚠️ Current POC Implementation

The current POC uses **regular SPL tokens** (`@solana/spl-token`), which are:
- ✅ Standard Solana tokens
- ✅ Compatible with all wallets and DEXs
- ✅ Already created and distributed in this POC
- ❌ **NOT compatible with ZK compression**

### 🔄 To Use AirShip with ZK Compression

You would need to:

1. **Create Compressed Tokens** from the start using `@lightprotocol/compressed-token`
2. **Recipients must have compressed token accounts** (different from regular SPL token accounts)
3. **Use Light Protocol's state tree** for compression
4. **Recipients need to decompress** to use with regular wallets/DEXs

## Two Approaches

### Approach 1: Regular SPL Tokens (Current Implementation ✅)

**Pros:**
- Works with all wallets immediately
- No compression/decompression needed
- Standard Solana ecosystem compatibility
- Already implemented in this POC

**Cons:**
- Higher transaction costs (~0.00001 SOL per transfer + rent)
- Less efficient for large-scale airdrops

**Best for:**
- Small to medium airdrops (<10,000 recipients)
- Tokens that need immediate wallet compatibility
- Mainnet deployments where compatibility is critical

### Approach 2: Compressed Tokens with AirShip (Future Enhancement 🚀)

**Pros:**
- Up to 5000x cheaper
- Perfect for massive airdrops (100K+ recipients)
- Minimal transaction fees

**Cons:**
- Recipients need to decompress tokens to use
- Not all wallets support compressed tokens yet
- Requires different token creation process
- Additional complexity

**Best for:**
- Massive airdrops (>10,000 recipients)
- Cost-sensitive projects
- Users who can handle decompression step

## Implementation Options

### Option A: Keep Current Approach (Recommended for POC)

The current implementation using regular SPL tokens is:
- ✅ **Production-ready**
- ✅ **Tested and working**
- ✅ **Compatible with all wallets**
- ✅ **Cost: ~0.000005 SOL per transfer on devnet**

For a 400-user airdrop: ~0.002 SOL total cost (negligible)

### Option B: Migrate to Compressed Tokens

Would require:

1. **Install AirShip dependencies** (already done):
   ```bash
   npm install @lightprotocol/stateless.js @lightprotocol/compressed-token helius-airship-core
   ```

2. **Create compressed token mint** (new script needed):
   ```javascript
   import { createMint } from '@lightprotocol/compressed-token';
   
   const mint = await createMint(
     connection,
     payer,
     mintAuthority,
     decimals
   );
   ```

3. **Distribute using compressed transfers**:
   ```javascript
   import { CompressedTokenProgram } from '@lightprotocol/compressed-token';
   
   await CompressedTokenProgram.transfer({
     payer: payer.publicKey,
     owner: payer.publicKey,
     mint: mint,
     toAddress: recipientPubkey,
     amount: BigInt(amount),
     connection,
   }, payer);
   ```

4. **Add decompression instructions** for recipients

## Cost Comparison

### Regular SPL Token (Current):
- Create token account: ~0.00203928 SOL (rent)
- Transfer: ~0.000005 SOL
- **Per recipient: ~0.002 SOL**

### Compressed Token (AirShip):
- No token account creation needed
- Transfer: ~0.0000001 SOL (99.5% cheaper)
- **Per recipient: ~0.0000001 SOL**

### Example: 100,000 Recipients
- Regular SPL: ~200 SOL ($20,000 at $100/SOL)
- Compressed: ~0.01 SOL ($1 at $100/SOL)
- **Savings: 99.995%**

## Recommendations

### For Your POC (3 recipients):
✅ **Keep the current implementation**
- Total cost: 0.006 SOL (~$0.60)
- Works immediately with all wallets
- No additional complexity

### For Production Scale (100M+ token distribution):
🚀 **Consider migrating to AirShip** if:
- You have >10,000 recipients
- Cost savings matter significantly
- Recipients can handle decompression
- You're willing to handle additional complexity

## How to Test AirShip (If Desired)

1. Set `USE_AIRSHIP=true` in `.env`
2. Run `npm run distribute`
3. The script will attempt compressed transfers
4. Note: May require compressed token mint (not regular SPL)

## Current Status

✅ **Regular SPL token distribution working perfectly**
✅ **Successfully distributed to 3 recipients**
✅ **Transaction costs: <0.01 SOL total**

🎯 **Recommendation**: Keep current approach unless scaling to 10K+ recipients

## References

- [Helius AirShip GitHub](https://github.com/helius-labs/airship)
- [Light Protocol Docs](https://docs.lightprotocol.com/)
- [ZK Compression Overview](https://www.lightprotocol.com/post/what-is-zk-compression)
