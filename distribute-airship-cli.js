#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import csv from 'csv-parser';

dotenv.config();

const execAsync = promisify(exec);

/**
 * Read and parse the leaderboard CSV file
 */
async function readLeaderboard(filePath = './leaderboard.csv') {
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
 * Convert leaderboard to AirShip-compatible CSV format
 */
function convertToAirshipCSV(leaderboard, tokensPerPeriod) {
  // Calculate total points
  const totalPoints = leaderboard.reduce(
    (sum, entry) => sum + parseFloat(entry.token_amount || 0),
    0
  );

  // Create CSV content with wallet addresses and token amounts
  const csvLines = ['wallet_address,amount'];
  
  leaderboard.forEach((entry) => {
    const points = parseFloat(entry.token_amount || 0);
    const tokenAmount = Math.floor((points / totalPoints) * tokensPerPeriod);
    csvLines.push(`${entry.wallet_address.trim()},${tokenAmount}`);
  });

  return csvLines.join('\n');
}

/**
 * Create temporary wallet JSON file from private key
 */
function createWalletFile(privateKey) {
  let keypair;
  
  try {
    keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
  } catch (e) {
    try {
      const privateKeyArray = JSON.parse(privateKey);
      keypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
    } catch (e2) {
      throw new Error('Invalid WALLET_PRIVATE_KEY format');
    }
  }

  const walletPath = './temp-airship-wallet.json';
  fs.writeFileSync(walletPath, JSON.stringify(Array.from(keypair.secretKey)));
  
  return {
    path: walletPath,
    publicKey: keypair.publicKey.toString(),
  };
}

/**
 * Check if helius-airship CLI is installed
 */
async function checkAirshipCLI() {
  try {
    await execAsync('helius-airship --version');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Distribute tokens using Helius AirShip CLI
 */
async function distributeWithAirshipCLI() {
  console.log('🚀 SKY0 Token Distribution via Helius AirShip CLI');
  console.log('═'.repeat(60));
  console.log('💡 Using official Helius AirShip for 95% cost savings!\n');

  // Check if AirShip CLI is installed
  const cliInstalled = await checkAirshipCLI();
  if (!cliInstalled) {
    console.error('❌ Helius AirShip CLI not installed\n');
    console.log('📦 Install it with:');
    console.log('   npm install -g helius-airship\n');
    console.log('🌐 Or use the web version:');
    console.log('   https://airship.helius.dev/\n');
    process.exit(1);
  }

  console.log('✅ Helius AirShip CLI detected\n');

  // Get configuration
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  const apiKey = process.env.HELIUS_API_KEY;
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const tokensPerPeriod = parseInt(process.env.TOKENS_PER_PERIOD) || 100_000_000;

  if (!privateKey) {
    console.error('❌ WALLET_PRIVATE_KEY not set in .env file');
    process.exit(1);
  }

  if (!apiKey) {
    console.error('❌ HELIUS_API_KEY not set in .env file');
    process.exit(1);
  }

  // Create temporary wallet file
  console.log('📝 Preparing wallet...');
  const wallet = createWalletFile(privateKey);
  console.log(`✅ Wallet: ${wallet.publicKey}\n`);

  // Read leaderboard
  console.log('📖 Reading leaderboard...');
  const leaderboard = await readLeaderboard();
  console.log(`✅ Loaded ${leaderboard.length} entries\n`);

  // Convert to AirShip CSV format
  console.log('🔄 Converting to AirShip format...');
  const airshipCSV = convertToAirshipCSV(leaderboard, tokensPerPeriod);
  const csvPath = './airship-recipients.csv';
  fs.writeFileSync(csvPath, airshipCSV);
  console.log(`✅ Created: ${csvPath}\n`);

  // Display distribution preview
  console.log('📊 Distribution Preview:');
  const lines = airshipCSV.split('\n');
  lines.slice(1, Math.min(4, lines.length)).forEach(line => {
    const [address, amount] = line.split(',');
    console.log(`   ${address}: ${parseInt(amount).toLocaleString()} SKY0`);
  });
  if (lines.length > 4) {
    console.log(`   ... and ${lines.length - 4} more\n`);
  }

  // Construct RPC URL
  const rpcUrl = network === 'mainnet-beta'
    ? `https://mainnet.helius-rpc.com/?api-key=${apiKey}`
    : `https://devnet.helius-rpc.com/?api-key=${apiKey}`;

  console.log('🚢 Launching Helius AirShip...\n');
  console.log('═'.repeat(60));
  console.log('📋 Configuration:');
  console.log(`   Wallet: ${wallet.publicKey}`);
  console.log(`   Network: ${network}`);
  console.log(`   RPC: ${rpcUrl.substring(0, 40)}...`);
  console.log(`   Recipients CSV: ${csvPath}`);
  console.log(`   Total Recipients: ${leaderboard.length}`);
  console.log('═'.repeat(60));
  console.log('\n🎯 Starting AirShip CLI...\n');

  // Run AirShip CLI
  const command = `helius-airship --keypair "${wallet.path}" --url "${rpcUrl}"`;
  
  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('\n❌ AirShip CLI error:', error.message);
    console.log('\n💡 Manual Steps:');
    console.log(`   1. Run: helius-airship --keypair ${wallet.path} --url "${rpcUrl}"`);
    console.log(`   2. Select "CSV Upload"`);
    console.log(`   3. Upload: ${csvPath}`);
    console.log(`   4. Confirm and execute\n`);
  }

  // Cleanup
  console.log('\n🧹 Cleaning up temporary files...');
  try {
    fs.unlinkSync(wallet.path);
    // Keep airship-recipients.csv for reference
    console.log('✅ Cleanup complete');
    console.log(`📁 Recipients CSV saved: ${csvPath}`);
  } catch (error) {
    console.warn('⚠️  Could not delete temporary wallet file');
  }

  console.log('\n✨ AirShip distribution process complete!\n');
  console.log('💡 Alternative: Use the web version at https://airship.helius.dev/');
  console.log(`   Upload: ${csvPath}\n`);
}

/**
 * Main function
 */
async function main() {
  try {
    await distributeWithAirshipCLI();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📚 Help:');
    console.log('   1. Install AirShip CLI: npm install -g helius-airship');
    console.log('   2. Or use web version: https://airship.helius.dev/');
    console.log('   3. Documentation: https://www.helius.dev/docs/airship/getting-started');
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default distributeWithAirshipCLI;
