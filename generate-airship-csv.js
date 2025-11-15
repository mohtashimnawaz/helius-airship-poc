import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const TOKENS_PER_PERIOD = parseInt(process.env.TOKENS_PER_PERIOD) || 100_000_000;
const DECIMALS = parseInt(process.env.DECIMALS) || 9;

/**
 * Generate CSV file for Helius AirShip web app
 * Upload the generated CSV to https://airship.helius.dev/
 */
async function generateAirshipCSV() {
  console.log('🎯 Generate Helius AirShip CSV');
  console.log('═'.repeat(50));

  // Read leaderboard
  console.log('\n📖 Reading leaderboard...');
  const leaderboard = await new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream('./leaderboard.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
  
  console.log(`✅ Loaded ${leaderboard.length} entries`);

  // Calculate distribution
  const totalPoints = leaderboard.reduce(
    (sum, entry) => sum + parseFloat(entry.token_amount || 0),
    0
  );

  console.log('\n📊 Distribution Calculation:');
  console.log(`   Total Points: ${totalPoints.toLocaleString()}`);
  console.log(`   Tokens Available: ${TOKENS_PER_PERIOD.toLocaleString()}`);
  console.log(`   Rate: ${(TOKENS_PER_PERIOD / totalPoints).toFixed(4)} tokens per point\n`);

  const distribution = leaderboard.map((entry) => {
    const points = parseFloat(entry.token_amount || 0);
    const tokenAmount = Math.floor((points / totalPoints) * TOKENS_PER_PERIOD);
    
    return {
      walletAddress: entry.wallet_address.trim(),
      points: points,
      tokenAmount: tokenAmount,
      tokenAmountWithDecimals: tokenAmount * Math.pow(10, DECIMALS),
      percentage: ((points / totalPoints) * 100).toFixed(2),
    };
  });

  // Generate AirShip CSV format
  // Format: address,amount (AirShip expects 'address' not 'recipient')
  const airshipCSV = [
    'address,amount', // Header
    ...distribution.map(d => `${d.walletAddress},${d.tokenAmountWithDecimals}`)
  ].join('\n');

  const outputFile = 'airship-distribution.csv';
  fs.writeFileSync(outputFile, airshipCSV);

  console.log('✅ AirShip CSV generated!');
  console.log(`   File: ${outputFile}\n`);

  console.log('📋 Distribution Details:');
  distribution.forEach((d, index) => {
    console.log(`   ${index + 1}. ${d.walletAddress}`);
    console.log(`      Points: ${d.points} | Tokens: ${d.tokenAmount.toLocaleString()} SKY0 (${d.percentage}%)`);
  });

  console.log('\n📊 Summary:');
  console.log(`   Total Recipients: ${distribution.length}`);
  console.log(`   Total Tokens: ${distribution.reduce((sum, d) => sum + d.tokenAmount, 0).toLocaleString()} SKY0`);
  console.log(`   Token Mint: ${process.env.TOKEN_MINT_ADDRESS || 'Not set'}`);

  console.log('\n🚀 Next Steps:');
  console.log('   1. Go to: https://airship.helius.dev/');
  console.log('   2. Connect your wallet');
  console.log(`   3. Upload: ${outputFile}`);
  console.log(`   4. Set Token Mint: ${process.env.TOKEN_MINT_ADDRESS}`);
  console.log('   5. Review and confirm distribution');
  console.log('   6. AirShip will handle everything with ZK compression! 🎉\n');

  console.log('💰 Cost Estimate:');
  console.log(`   Regular SPL: ~${(distribution.length * 0.002).toFixed(4)} SOL`);
  console.log(`   With AirShip: ~${(distribution.length * 0.0000001).toFixed(8)} SOL`);
  console.log(`   Savings: ${((1 - (distribution.length * 0.0000001) / (distribution.length * 0.002)) * 100).toFixed(2)}%\n`);

  // Also save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    tokenMint: process.env.TOKEN_MINT_ADDRESS,
    tokensPerPeriod: TOKENS_PER_PERIOD,
    distribution: distribution,
    summary: {
      totalRecipients: distribution.length,
      totalPoints: totalPoints,
      totalTokens: distribution.reduce((sum, d) => sum + d.tokenAmount, 0),
    }
  };

  const reportFile = `airship-report-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`💾 Detailed report saved: ${reportFile}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAirshipCSV()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export default generateAirshipCSV;
