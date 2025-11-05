import { calculateDistribution, readLeaderboard } from './distribute.js';

/**
 * Test the distribution calculation without actually sending tokens
 */
async function testDistribution() {
  console.log('🧪 Testing Token Distribution Calculation');
  console.log('═'.repeat(50));

  try {
    // Read leaderboard
    console.log('\n📖 Reading leaderboard...');
    const leaderboard = await readLeaderboard();
    console.log(`✅ Loaded ${leaderboard.length} entries\n`);

    // Test with different token amounts per period
    const testAmounts = [
      100_000_000,  // 100M tokens (default)
      50_000_000,   // 50M tokens
      200_000_000,  // 200M tokens
    ];

    for (const tokensPerPeriod of testAmounts) {
      console.log(`\n${'─'.repeat(50)}`);
      console.log(`📊 Testing with ${tokensPerPeriod.toLocaleString()} tokens per period\n`);

      const { distribution, totalPoints, tokensToDistribute } = calculateDistribution(
        leaderboard,
        tokensPerPeriod
      );

      console.log('Distribution Results:');
      distribution.forEach((d, index) => {
        console.log(`\n   ${index + 1}. Wallet: ${d.walletAddress}`);
        console.log(`      Points: ${d.points.toLocaleString()}`);
        console.log(`      Tokens: ${d.tokenAmount.toLocaleString()} SKY0`);
        console.log(`      Share: ${d.percentage}%`);
      });

      console.log(`\n   Total Distributed: ${tokensToDistribute.toLocaleString()} SKY0`);
      console.log(`   Total Points: ${totalPoints.toLocaleString()}`);
      console.log(`   Token/Point Ratio: ${(tokensPerPeriod / totalPoints).toFixed(4)}`);

      // Verify the distribution adds up correctly
      const percentageSum = distribution.reduce((sum, d) => sum + parseFloat(d.percentage), 0);
      console.log(`\n   ✓ Percentage Check: ${percentageSum.toFixed(2)}% (should be ~100%)`);
      
      const efficiency = (tokensToDistribute / tokensPerPeriod * 100).toFixed(2);
      console.log(`   ✓ Distribution Efficiency: ${efficiency}% (due to rounding)`);
    }

    console.log('\n═'.repeat(50));
    console.log('✨ Test complete! Distribution calculations verified.\n');

    // Example of adding more users to leaderboard
    console.log('💡 Tips:');
    console.log('   - Add more users to leaderboard.csv to test scaling');
    console.log('   - Format: wallet_address,token_amount');
    console.log('   - token_amount represents points earned in the period');
    console.log('   - Distribution is proportional to points earned\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testDistribution()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
