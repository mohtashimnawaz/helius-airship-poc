import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  mintTo,
  setAuthority,
  AuthorityType,
  getMint,
} from '@solana/spl-token';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const TOTAL_SUPPLY = parseInt(process.env.TOTAL_SUPPLY) || 1_000_000_000;
const DECIMALS = parseInt(process.env.DECIMALS) || 9;

async function createSKY0Token() {
  console.log('🚀 Creating SKY0 Token...\n');

  // Setup connection
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );

  // Load payer wallet
  const privateKeyArray = JSON.parse(process.env.WALLET_PRIVATE_KEY || '[]');
  if (privateKeyArray.length === 0) {
    console.error('❌ Please set WALLET_PRIVATE_KEY in .env file');
    console.log('💡 Generate a keypair using: node generate-keypair.js');
    process.exit(1);
  }

  const payer = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
  console.log('📍 Payer Address:', payer.publicKey.toString());

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`💰 Payer Balance: ${balance / 1e9} SOL\n`);

  if (balance < 0.1 * 1e9) {
    console.warn('⚠️  Low balance! You may need more SOL for transactions.');
  }

  try {
    // Create the token mint
    console.log('🔨 Creating token mint...');
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey, // mint authority
      null, // freeze authority (set to null as we don't need it)
      DECIMALS
    );

    console.log('✅ Token Mint Created:', mint.toString());

    // Create a token account to hold the initial supply
    console.log('\n🏦 Creating token account for minting...');
    const { createAccount, getAccount } = await import('@solana/spl-token');
    
    const tokenAccount = await createAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );

    console.log('✅ Token Account Created:', tokenAccount.toString());

    // Mint the total supply
    console.log(`\n⚡ Minting ${TOTAL_SUPPLY.toLocaleString()} tokens...`);
    const mintAmount = TOTAL_SUPPLY * Math.pow(10, DECIMALS);
    
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount,
      payer.publicKey,
      mintAmount
    );

    console.log(`✅ Minted ${TOTAL_SUPPLY.toLocaleString()} SKY0 tokens`);

    // Freeze mint authority
    console.log('\n🔒 Freezing mint authority...');
    await setAuthority(
      connection,
      payer,
      mint,
      payer.publicKey,
      AuthorityType.MintTokens,
      null // Setting to null permanently removes mint authority
    );

    console.log('✅ Mint authority frozen! No more tokens can be minted.');

    // Verify the mint
    const mintInfo = await getMint(connection, mint);
    console.log('\n📊 Token Details:');
    console.log('   Mint Address:', mint.toString());
    console.log('   Supply:', (Number(mintInfo.supply) / Math.pow(10, DECIMALS)).toLocaleString());
    console.log('   Decimals:', mintInfo.decimals);
    console.log('   Mint Authority:', mintInfo.mintAuthority);
    console.log('   Freeze Authority:', mintInfo.freezeAuthority);

    // Save token info to .env
    const envContent = fs.readFileSync('.env', 'utf8');
    const updatedEnv = envContent.replace(
      /TOKEN_MINT_ADDRESS=.*/,
      `TOKEN_MINT_ADDRESS=${mint.toString()}`
    );
    fs.writeFileSync('.env', updatedEnv);
    
    // Save detailed info to a JSON file
    const tokenInfo = {
      mintAddress: mint.toString(),
      tokenAccount: tokenAccount.toString(),
      totalSupply: TOTAL_SUPPLY,
      decimals: DECIMALS,
      mintAuthority: null,
      createdAt: new Date().toISOString(),
      network: process.env.SOLANA_NETWORK || 'devnet'
    };

    fs.writeFileSync('token-info.json', JSON.stringify(tokenInfo, null, 2));
    console.log('\n💾 Token info saved to token-info.json');
    console.log('💾 .env updated with TOKEN_MINT_ADDRESS');

    console.log('\n✨ SKY0 Token creation complete!');
    console.log('\n🔗 View on Solana Explorer:');
    const explorerUrl = process.env.SOLANA_NETWORK === 'mainnet-beta' 
      ? `https://explorer.solana.com/address/${mint.toString()}`
      : `https://explorer.solana.com/address/${mint.toString()}?cluster=${process.env.SOLANA_NETWORK || 'devnet'}`;
    console.log(`   ${explorerUrl}`);

    return mint;

  } catch (error) {
    console.error('❌ Error creating token:', error);
    throw error;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createSKY0Token()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default createSKY0Token;
