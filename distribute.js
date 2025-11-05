import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
} from '@solana/spl-token';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const TOKENS_PER_PERIOD = parseInt(process.env.TOKENS_PER_PERIOD) || 100_000_000;
const DECIMALS = parseInt(process.env.DECIMALS) || 9;

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
 * Calculate token distribution based on points
 */
function calculateDistribution(leaderboard, tokensPerPeriod) {
  // Calculate total points
  const totalPoints = leaderboard.reduce(
    (sum, entry) => sum + parseFloat(entry.token_amount || 0),
    0
  );

  console.log(`\n📊 Distribution Calculation:`);
  console.log(`   Total Points: ${totalPoints.toLocaleString()}`);
  console.log(`   Tokens Available: ${tokensPerPeriod.toLocaleString()}`);
  console.log(`   Rate: ${(tokensPerPeriod / totalPoints).toFixed(4)} tokens per point\n`);

  // Calculate distribution for each user
  const distribution = leaderboard.map((entry) => {
    const points = parseFloat(entry.token_amount || 0);
    const tokenAmount = Math.floor((points / totalPoints) * tokensPerPeriod);
    
    return {
      walletAddress: entry.wallet_address.trim(),
      points: points,
      tokenAmount: tokenAmount,
      percentage: ((points / totalPoints) * 100).toFixed(2),
    };
  });

  return {
    distribution,
    totalPoints,
    tokensToDistribute: distribution.reduce((sum, d) => sum + d.tokenAmount, 0),
  };
}

/**
 * Create distribution payload for Helius Airship
 */
function createAirshipPayload(distribution, mintAddress, decimals) {
  // Helius Airship expects recipients in this format
  const recipients = distribution.map((d) => ({
    recipientAddress: d.walletAddress,
    amount: d.tokenAmount * Math.pow(10, decimals), // Convert to smallest unit
  }));

  return {
    mint: mintAddress,
    recipients: recipients,
    priorityFee: 'medium', // Options: 'none', 'low', 'medium', 'high'
    createAtaIfMissing: true, // Automatically create associated token accounts
  };
}

/**
 * Distribute tokens using Helius Airship API
 */
async function distributeWithAirship(distribution, mintAddress) {
  console.log('\n🚢 Distributing tokens with Helius Airship...\n');

  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    console.error('❌ HELIUS_API_KEY not set in .env file');
    process.exit(1);
  }

  const payload = createAirshipPayload(distribution, mintAddress, DECIMALS);
  
  console.log('📦 Payload prepared:');
  console.log(`   Recipients: ${payload.recipients.length}`);
  console.log(`   Token Mint: ${mintAddress}`);
  console.log(`   Priority Fee: ${payload.priorityFee}\n`);

  try {
    // Note: This is a simulated call. Replace with actual Helius Airship endpoint
    const airshipUrl = `${process.env.HELIUS_AIRSHIP_URL || 'https://airship.helius.xyz'}/v1/distribute`;
    
    console.log('🔗 Calling Helius Airship API...');
    console.log(`   Endpoint: ${airshipUrl}\n`);

    // Uncomment this when using real API
    /*
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

    console.log('✅ Distribution initiated!');
    console.log('📝 Response:', response.data);
    return response.data;
    */

    // For POC demonstration, we'll show what would be sent
    console.log('📋 Distribution Details:');
    distribution.forEach((d, index) => {
      console.log(`   ${index + 1}. ${d.walletAddress}`);
      console.log(`      Points: ${d.points.toLocaleString()}`);
      console.log(`      Tokens: ${d.tokenAmount.toLocaleString()} SKY0 (${d.percentage}%)`);
    });

    // Save distribution record
    const record = {
      timestamp: new Date().toISOString(),
      period: new Date().toISOString().substring(0, 7), // YYYY-MM format
      mintAddress: mintAddress,
      distribution: distribution,
      totalDistributed: distribution.reduce((sum, d) => sum + d.tokenAmount, 0),
      payload: payload,
    };

    const recordFile = `distribution-${Date.now()}.json`;
    fs.writeFileSync(recordFile, JSON.stringify(record, null, 2));
    console.log(`\n💾 Distribution record saved to ${recordFile}`);

    return record;

  } catch (error) {
    console.error('❌ Error distributing tokens:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Alternative: Manual distribution without Airship (for testing)
 */
async function distributeManually(distribution, mintAddress) {
  console.log('\n🔧 Manual Distribution (Direct SPL Token Transfers)...\n');

  const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );

  const privateKeyArray = JSON.parse(process.env.WALLET_PRIVATE_KEY || '[]');
  const payer = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));

  console.log('📍 Distributor Address:', payer.publicKey.toString());

  const mint = new PublicKey(mintAddress);
  const sourceTokenAccount = await getAssociatedTokenAddress(
    mint,
    payer.publicKey
  );

  console.log('🏦 Source Token Account:', sourceTokenAccount.toString());

  // Get source account info
  const sourceAccount = await getAccount(connection, sourceTokenAccount);
  const availableBalance = Number(sourceAccount.amount) / Math.pow(10, DECIMALS);
  console.log(`💰 Available Balance: ${availableBalance.toLocaleString()} SKY0\n`);

  let successCount = 0;
  let failCount = 0;

  for (const recipient of distribution) {
    try {
      const recipientPubkey = new PublicKey(recipient.walletAddress);
      const recipientTokenAccount = await getAssociatedTokenAddress(
        mint,
        recipientPubkey
      );

      const transaction = new Transaction();

      // Check if recipient token account exists
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        // Account doesn't exist, create it
        console.log(`   Creating token account for ${recipient.walletAddress}...`);
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
      const amount = recipient.tokenAmount * Math.pow(10, DECIMALS);
      transaction.add(
        createTransferInstruction(
          sourceTokenAccount,
          recipientTokenAccount,
          payer.publicKey,
          amount
        )
      );

      // Send transaction
      console.log(`📤 Sending ${recipient.tokenAmount.toLocaleString()} SKY0 to ${recipient.walletAddress}...`);
      const signature = await connection.sendTransaction(transaction, [payer]);
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`   ✅ Success! Signature: ${signature}\n`);
      successCount++;

    } catch (error) {
      console.error(`   ❌ Failed for ${recipient.walletAddress}:`, error.message);
      failCount++;
    }
  }

  console.log('\n📊 Distribution Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Total: ${distribution.length}\n`);

  return { successCount, failCount };
}

/**
 * Main distribution function
 */
async function distributeTokens() {
  console.log('🎯 SKY0 Token Distribution System');
  console.log('═'.repeat(50));

  try {
    // Read leaderboard
    console.log('\n📖 Reading leaderboard...');
    const leaderboard = await readLeaderboard();
    console.log(`✅ Loaded ${leaderboard.length} entries`);

    // Calculate distribution
    const { distribution, totalPoints, tokensToDistribute } = calculateDistribution(
      leaderboard,
      TOKENS_PER_PERIOD
    );

    console.log('📊 Distribution Summary:');
    console.log(`   Total Tokens to Distribute: ${tokensToDistribute.toLocaleString()} SKY0`);
    console.log(`   Recipients: ${distribution.length}`);

    // Get token mint address
    const mintAddress = process.env.TOKEN_MINT_ADDRESS;
    if (!mintAddress) {
      console.error('\n❌ TOKEN_MINT_ADDRESS not set in .env file');
      console.log('💡 Run: npm run create-token');
      process.exit(1);
    }

    console.log(`\n🪙 Token Mint: ${mintAddress}`);

    // Choose distribution method
    const useAirship = process.env.USE_AIRSHIP !== 'false';
    
    if (useAirship) {
      // Use Helius Airship (recommended for production)
      await distributeWithAirship(distribution, mintAddress);
      
      console.log('\n💡 To perform actual distribution:');
      console.log('   1. Ensure HELIUS_API_KEY is set in .env');
      console.log('   2. Uncomment the actual API call in distribute.js');
      console.log('   3. Run: npm run distribute');
    } else {
      // Manual distribution (for testing)
      await distributeManually(distribution, mintAddress);
    }

    console.log('\n✨ Distribution process complete!');

  } catch (error) {
    console.error('\n❌ Distribution failed:', error);
    throw error;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  distributeTokens()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { distributeTokens, calculateDistribution, readLeaderboard };
