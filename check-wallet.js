#!/usr/bin/env node

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking Project Wallet Configuration');
console.log('═'.repeat(60));

const privateKey = process.env.WALLET_PRIVATE_KEY;

if (!privateKey) {
  console.error('\n❌ WALLET_PRIVATE_KEY not set in .env file');
  console.log('💡 Run: npm run generate-keypair\n');
  process.exit(1);
}

let keypair;

try {
  keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
} catch (e) {
  try {
    const privateKeyArray = JSON.parse(privateKey);
    keypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
  } catch (e2) {
    console.error('\n❌ Invalid WALLET_PRIVATE_KEY format');
    process.exit(1);
  }
}

console.log('\n✅ Project Wallet Found:');
console.log(`   Public Key: ${keypair.publicKey.toString()}`);

console.log('\n📋 Token Mints:');
console.log(`   Regular SPL: ${process.env.TOKEN_MINT_ADDRESS || 'Not created yet'}`);
console.log(`   Compressed: ${process.env.COMPRESSED_TOKEN_MINT || 'Not created yet'}`);

console.log('\n🔗 Network Configuration:');
console.log(`   Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
console.log(`   Helius API: ${process.env.HELIUS_API_KEY ? '✅ Configured' : '❌ Not set'}`);

console.log('\n💡 Workflow:');
console.log('   1. npm run create-token              → Create regular SPL tokens');
console.log('   2. npm run distribute                → Generate CSV for recipients');
console.log('   3. npm run distribute-spl            → Distribute tokens (recommended)');
console.log('   OR');
console.log('   3. npm run distribute-airship        → Use AirShip CLI (if network allows)');

console.log('\n📊 Distribution Recipients (from leaderboard.csv):');
console.log('   - FWKcvRkDJHHvP2s5Sege6NA6vdRmBzcPinRRAxwh1zwc');
console.log('   - BYmeAV9N3EXoij7BfYjGSVfmAn2aHXLt2HWKnxn99po8');
console.log('   - 6xX9G1jy4quapnew9CpHd1rz3pWKgysM2Q4MMBkmQMxN');

console.log('\n✨ This wallet will be used for creating and distributing tokens!\n');
