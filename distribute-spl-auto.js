#!/usr/bin/env node

import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
} from '@solana/spl-token';
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
 * Distribute regular SPL tokens programmatically
 */
async function distributeSPLTokens() {
  console.log('🚀 SPL Token Distribution (Regular, Non-Compressed)');
  console.log('═'.repeat(60));

  // Load configuration
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  const mintAddress = process.env.TOKEN_MINT_ADDRESS;
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

  if (!privateKey || !mintAddress) {
    console.error('❌ Missing configuration in .env file');
    console.log('   Required: WALLET_PRIVATE_KEY, TOKEN_MINT_ADDRESS');
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

  // Create connection
  const connection = new Connection(rpcUrl, 'confirmed');
  console.log('🔗 Connected to Solana RPC\n');

  const mint = new PublicKey(mintAddress);
  const sourceTokenAccount = await getAssociatedTokenAddress(mint, payer.publicKey);

  // Check balance
  try {
    const sourceAccount = await getAccount(connection, sourceTokenAccount);
    const balance = Number(sourceAccount.amount) / Math.pow(10, DECIMALS);
    console.log(`💰 Source Balance: ${balance.toLocaleString()} tokens\n`);
  } catch (error) {
    console.error('❌ Could not fetch source token account. Do you have tokens?');
    process.exit(1);
  }

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

  console.log('\n⚠️  This will execute regular SPL token transfers.');
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  let successCount = 0;
  let failCount = 0;
  const results = [];

  console.log('📦 Starting transfers...\n');

  // Process each recipient
  for (const entry of distribution) {
    const recipient = entry.address;
    const amount = entry.amount;

    try {
      console.log(`📤 Sending ${(amount / Math.pow(10, DECIMALS)).toLocaleString()} tokens to ${recipient}...`);

      const recipientPubkey = new PublicKey(recipient);
      const recipientTokenAccount = await getAssociatedTokenAddress(mint, recipientPubkey);

      const transaction = new Transaction();

      // Check if recipient token account exists
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        // Account doesn't exist, create it
        console.log(`   Creating token account...`);
        transaction.add(
          createAssociatedTokenAccountInstruction(
            payer.publicKey,
            recipientTokenAccount,
            recipientPubkey,
            mint
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          sourceTokenAccount,
          recipientTokenAccount,
          payer.publicKey,
          amount
        )
      );

      // Send transaction
      const signature = await connection.sendTransaction(transaction, [payer]);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log(`   ✅ Success! Signature: ${signature}\n`);
      successCount++;
      results.push({ recipient, amount, signature, status: 'success' });

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`);
      failCount++;
      results.push({ recipient, amount, error: error.message, status: 'failed' });
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
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
    method: 'spl-token-transfer'
  };

  const recordFile = `distribution-spl-${Date.now()}.json`;
  fs.writeFileSync(recordFile, JSON.stringify(record, null, 2));
  console.log(`💾 Results saved: ${recordFile}\n`);
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  distributeSPLTokens()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\n❌ Error:', error.message || error);
      process.exit(1);
    });
}

export default distributeSPLTokens;
