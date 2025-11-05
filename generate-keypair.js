import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔑 Generating new Solana keypair...\n');

const keypair = Keypair.generate();

console.log('✅ Keypair generated!');
console.log('\n📍 Public Key (Wallet Address):');
console.log(`   ${keypair.publicKey.toString()}`);

console.log('\n🔐 Private Key (Secret Key Array):');
const secretKeyArray = Array.from(keypair.secretKey);
console.log(`   ${JSON.stringify(secretKeyArray)}`);

console.log('\n⚠️  IMPORTANT: Keep your private key secure and never share it!');

// Offer to save to .env
console.log('\n💡 To use this keypair:');
console.log('   1. Copy the private key array above');
console.log('   2. Add to your .env file as:');
console.log(`      WALLET_PRIVATE_KEY='${JSON.stringify(secretKeyArray)}'`);
console.log('   3. Fund the wallet with SOL on your chosen network');

if (process.env.SOLANA_NETWORK === 'devnet') {
  console.log('\n💰 Get devnet SOL from:');
  console.log('   https://faucet.solana.com/');
  console.log(`   or run: solana airdrop 2 ${keypair.publicKey.toString()} --url devnet`);
}

// Save to a file (optional)
const walletFile = 'wallet.json';
fs.writeFileSync(walletFile, JSON.stringify(secretKeyArray));
console.log(`\n💾 Keypair saved to ${walletFile} (keep this file secure!)`);

console.log('\n✨ Done!');
