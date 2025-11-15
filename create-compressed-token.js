import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { 
  createMint, 
  mintTo,
  CompressedTokenProgram 
} from '@lightprotocol/compressed-token';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * Create a compressed SPL token using ZK Compression
 * This enables significantly cheaper airdrops via Helius AirShip
 */
async function createCompressedToken() {
  console.log('🚀 Creating Compressed SKY0 Token with ZK Compression');
  console.log('═'.repeat(60));

  // Parse private key
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ WALLET_PRIVATE_KEY not set in .env file');
    process.exit(1);
  }

  let payer;
  try {
    payer = Keypair.fromSecretKey(bs58.decode(privateKey));
  } catch (e) {
    try {
      const privateKeyArray = JSON.parse(privateKey);
      payer = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
    } catch (e2) {
      console.error('❌ Invalid WALLET_PRIVATE_KEY format');
      console.error('   Expected: base58 string or JSON array');
      process.exit(1);
    }
  }

  console.log('\n📍 Wallet Address:', payer.publicKey.toString());

  // Connect to Helius RPC with ZK Compression support
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    console.error('❌ HELIUS_API_KEY not set in .env file');
    process.exit(1);
  }

  const rpcEndpoint = `https://devnet.helius-rpc.com/?api-key=${apiKey}`;
  const connection = createRpc(rpcEndpoint, rpcEndpoint);

  console.log('🔗 Connected to Helius RPC (ZK Compression enabled)');

  try {
    // Step 1: Create compressed token mint
    console.log('\n📝 Step 1: Creating compressed token mint...');
    
    const decimals = parseInt(process.env.DECIMALS) || 9;
    const mintKeypair = Keypair.generate();
    
    const { mint, transactionSignature } = await createMint(
      connection,
      payer,
      payer.publicKey, // mint authority
      decimals,
      mintKeypair
    );

    console.log('✅ Compressed token mint created!');
    console.log('   Mint Address:', mint.toString());
    console.log('   Transaction:', transactionSignature);
    console.log('   Decimals:', decimals);

    // Step 2: Mint compressed tokens
    console.log('\n💰 Step 2: Minting compressed tokens...');
    
    const totalSupply = parseInt(process.env.TOTAL_SUPPLY) || 1_000_000_000;
    const amountToMint = BigInt(totalSupply) * BigInt(Math.pow(10, decimals));

    console.log(`   Minting ${totalSupply.toLocaleString()} SKY0 tokens...`);

    const mintResult = await mintTo(
      connection,
      payer,
      mint,
      payer.publicKey, // recipient (compressed account)
      payer, // authority
      amountToMint
    );

    console.log('✅ Tokens minted successfully!');
    console.log('   Amount:', totalSupply.toLocaleString(), 'SKY0');
    console.log('   Transaction:', mintResult.transactionSignature);

    // Step 3: Freeze mint authority (optional but recommended)
    console.log('\n🔒 Step 3: Freezing mint authority...');
    console.log('⚠️  Note: Compressed tokens use a different authority model');
    console.log('   Mint authority is controlled by the program');
    console.log('   To prevent future minting, transfer authority to null');

    // For compressed tokens, we'd need to use setAuthority from compressed-token
    // This is more complex and may require additional setup
    console.log('⏭️  Skipping authority freeze for compressed tokens');
    console.log('   (Can be implemented with custom logic if needed)');

    // Save token info
    const tokenInfo = {
      type: 'compressed',
      mint: mint.toString(),
      decimals: decimals,
      totalSupply: totalSupply,
      mintAuthority: payer.publicKey.toString(),
      createdAt: new Date().toISOString(),
      network: process.env.SOLANA_NETWORK || 'devnet',
      compression: 'zk-compression-enabled',
      transactions: {
        creation: transactionSignature,
        minting: mintResult.transactionSignature,
      },
    };

    fs.writeFileSync(
      'compressed-token-info.json',
      JSON.stringify(tokenInfo, null, 2)
    );

    console.log('\n✨ Success! Compressed token is ready!');
    console.log('═'.repeat(60));
    console.log('\n📊 Token Summary:');
    console.log(`   Type: Compressed Token (ZK)`);
    console.log(`   Mint: ${mint.toString()}`);
    console.log(`   Supply: ${totalSupply.toLocaleString()} SKY0`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
    
    console.log('\n💾 Token info saved to: compressed-token-info.json');
    
    console.log('\n📝 Update your .env file:');
    console.log(`   COMPRESSED_TOKEN_MINT=${mint.toString()}`);

    console.log('\n🎯 Next Steps:');
    console.log('   1. Update .env with COMPRESSED_TOKEN_MINT address');
    console.log('   2. Run: npm run distribute-compressed');
    console.log('   3. Enjoy 5000x cheaper airdrops! 🚀');

    console.log('\n🔗 View on Explorer:');
    const explorerUrl = process.env.SOLANA_NETWORK === 'mainnet-beta'
      ? `https://explorer.solana.com/address/${mint.toString()}`
      : `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`;
    console.log(`   ${explorerUrl}`);

  } catch (error) {
    console.error('\n❌ Error creating compressed token:', error);
    console.error('\nCommon issues:');
    console.error('1. Insufficient SOL balance (need ~0.05 SOL)');
    console.error('2. Network connection issues');
    console.error('3. Invalid Helius API key');
    console.error('4. RPC endpoint not supporting compression');
    console.error('\n💡 Solution: Ensure you have SOL and valid Helius API key');
    throw error;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createCompressedToken()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default createCompressedToken;
