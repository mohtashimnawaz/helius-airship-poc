#!/usr/bin/env node

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc, bn, Rpc } from '@lightprotocol/stateless.js';
import { 
  CompressedTokenProgram
} from '@lightprotocol/compressed-token';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import fs from 'fs';
import csv from 'csv-parser';

dotenv.config();

const DECIMALS = parseInt(process.env.DECIMALS) || 9;

/**
 * Read CSV file with distribution amounts
 */
async function readDistributionCSV(filePath = './airship-distribution.csv') {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/**
 * Distribute compressed tokens programmatically
 */
async function distributeCompressedTokens() {
  console.log('🚀 Programmatic Compressed Token Distribution');
  console.log('═'.repeat(60));

  // Load configuration
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  const apiKey = process.env.HELIUS_API_KEY;
  const mintAddress = process.env.COMPRESSED_TOKEN_MINT;

  if (!privateKey || !apiKey || !mintAddress) {
    console.error('❌ Missing configuration in .env file');
    console.log('   Required: WALLET_PRIVATE_KEY, HELIUS_API_KEY, COMPRESSED_TOKEN_MINT');
    process.exit(1);
  }

  // Load keypair
  let payer;
  try {
    payer = Keypair.fromSecretKey(bs58.decode(privateKey));
  } catch (e) {
    try {
      const privateKeyArray = JSON.parse(privateKey);
      payer = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
    } catch (e2) {
      console.error('❌ Invalid WALLET_PRIVATE_KEY format');
      process.exit(1);
    }
  }

  console.log('\n📍 Wallet:', payer.publicKey.toString());
  console.log('🪙 Token Mint:', mintAddress);

  // Create RPC connection
  const rpcEndpoint = `https://devnet.helius-rpc.com/?api-key=${apiKey}`;
  const connection = createRpc(rpcEndpoint, rpcEndpoint);

  console.log('🔗 Connected to Helius RPC with ZK Compression\n');

  // Read distribution CSV
  console.log('📖 Reading distribution CSV...');
  const distribution = await readDistributionCSV();
  console.log(`✅ Loaded ${distribution.length} recipients\n`);

  // Display distribution plan
  console.log('📊 Distribution Plan:');
  let totalAmount = 0;
  distribution.forEach((entry, index) => {
    const amount = parseFloat(entry.amount);
    totalAmount += amount;
    const tokens = amount / Math.pow(10, DECIMALS);
    console.log(`   ${index + 1}. ${entry.address}`);
    console.log(`      Amount: ${tokens.toLocaleString()} tokens`);
  });
  console.log(`\n   Total: ${(totalAmount / Math.pow(10, DECIMALS)).toLocaleString()} tokens`);

  console.log('\n⚠️  This will execute compressed token transfers using ZK compression.');
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const mint = new PublicKey(mintAddress);
  let successCount = 0;
  let failCount = 0;
  const results = [];

  console.log('📦 Starting compressed transfers...\n');

  // Process each recipient
  for (const entry of distribution) {
    const recipient = entry.address;
    const amount = entry.amount;

    try {
      console.log(`📤 Sending ${(amount / Math.pow(10, DECIMALS)).toLocaleString()} tokens to ${recipient}...`);

      const recipientPubkey = new PublicKey(recipient);

      // Fetch compressed token accounts for the owner
      console.log('   🔍 Fetching compressed token accounts...');
      const compressedTokenAccounts = await connection.getCompressedTokenAccountsByOwner(payer.publicKey, {
        mint,
      });

      if (!compressedTokenAccounts || compressedTokenAccounts.items.length === 0) {
        throw new Error('No compressed token accounts found for this wallet');
      }

      console.log(`   📦 Found ${compressedTokenAccounts.items.length} compressed token account(s)`);

      // Get total balance from accounts
      let totalBalance = 0;
      const accountsWithBalance = compressedTokenAccounts.items.map(acc => {
        const balance = acc.parsed?.amount ? parseInt(acc.parsed.amount) : 0;
        totalBalance += balance;
        return { ...acc, balance };
      });

      console.log(`   💰 Total balance: ${totalBalance / Math.pow(10, DECIMALS)} tokens`);

      if (totalBalance < amount) {
        throw new Error(`Insufficient balance: have ${totalBalance / Math.pow(10, DECIMALS)}, need ${amount / Math.pow(10, DECIMALS)}`);
      }

      console.log(`   🔨 Executing compressed transfer...`);

      // Use the high-level transfer method - connection should be passed as an option
      const transferResult = await CompressedTokenProgram.transfer({
        payer: payer.publicKey,
        owner: payer.publicKey,
        mint: mint,
        toAddress: recipientPubkey,
        amount: bn(amount),
      }, payer, { connection });

      const signature = transferResult.signature || transferResult;

      console.log(`   ✅ Success! Signature: ${signature}\n`);
      successCount++;
      results.push({ recipient, amount, signature, status: 'success' });

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`);
      console.error('   Debug:', error);
      failCount++;
      results.push({ recipient, amount, error: error.message, status: 'failed' });
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n📊 Distribution Complete:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Total: ${distribution.length}\n`);

  // Save results
  const record = {
    timestamp: new Date().toISOString(),
    mintAddress: mintAddress,
    wallet: payer.publicKey.toString(),
    totalRecipients: distribution.length,
    successCount,
    failCount,
    results,
    method: 'programmatic-compressed-transfer'
  };

  const recordFile = `distribution-compressed-${Date.now()}.json`;
  fs.writeFileSync(recordFile, JSON.stringify(record, null, 2));
  console.log(`💾 Results saved: ${recordFile}\n`);
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  distributeCompressedTokens()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\n❌ Error:', error.message || error);
      process.exit(1);
    });
}

export default distributeCompressedTokens;
