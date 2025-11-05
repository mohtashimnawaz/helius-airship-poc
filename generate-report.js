import fs from 'fs';

/**
 * Generate a visual report of the distribution
 */
function generateDistributionReport() {
  console.log('\n📊 SKY0 Token Distribution - Visual Report\n');
  console.log('═'.repeat(70));
  
  // Token Economics
  console.log('\n💰 TOKEN ECONOMICS');
  console.log('─'.repeat(70));
  console.log('Token Name:      SKY0');
  console.log('Total Supply:    1,000,000,000 SKY0');
  console.log('Decimals:        9');
  console.log('Mint Authority:  Frozen (no more tokens can be minted)');
  console.log('Network:         Solana');
  
  // Distribution Schedule
  console.log('\n📅 DISTRIBUTION SCHEDULE');
  console.log('─'.repeat(70));
  console.log('Total Periods:        10 months');
  console.log('Tokens per Period:    ~100,000,000 SKY0');
  console.log('Distribution Method:  Helius Airship');
  console.log('Allocation:           Proportional to points earned');
  
  // Current Period Breakdown
  console.log('\n📊 CURRENT PERIOD BREAKDOWN (Example)');
  console.log('─'.repeat(70));
  
  const users = [
    { name: 'User A', points: 100, percentage: 25.0 },
    { name: 'User B', points: 250, percentage: 62.5 },
    { name: 'User C', points: 50, percentage: 12.5 },
  ];
  
  const totalPoints = users.reduce((sum, u) => sum + u.points, 0);
  const tokensPerPeriod = 100_000_000;
  
  console.log(`Total Points: ${totalPoints.toLocaleString()}`);
  console.log(`Available Tokens: ${tokensPerPeriod.toLocaleString()} SKY0\n`);
  
  users.forEach(user => {
    const tokens = Math.floor((user.points / totalPoints) * tokensPerPeriod);
    const bar = '█'.repeat(Math.floor(user.percentage / 2.5));
    
    console.log(`${user.name.padEnd(8)} ${user.points.toString().padStart(4)} pts ${bar.padEnd(25)} ${user.percentage.toFixed(1).padStart(5)}% → ${tokens.toLocaleString().padStart(12)} SKY0`);
  });
  
  // 10-Period Projection
  console.log('\n📈 10-PERIOD PROJECTION');
  console.log('─'.repeat(70));
  console.log('Period │ Tokens Distributed │ Cumulative      │ Remaining');
  console.log('───────┼────────────────────┼─────────────────┼──────────────');
  
  let cumulative = 0;
  for (let i = 1; i <= 10; i++) {
    const distributed = 100_000_000;
    cumulative += distributed;
    const remaining = 1_000_000_000 - cumulative;
    
    console.log(
      `  ${i.toString().padStart(2)}   │ ` +
      `${distributed.toLocaleString().padStart(16)} │ ` +
      `${cumulative.toLocaleString().padStart(15)} │ ` +
      `${remaining.toLocaleString().padStart(13)}`
    );
  }
  
  // Distribution Flow
  console.log('\n🔄 DISTRIBUTION FLOW');
  console.log('─'.repeat(70));
  console.log(`
  1. 📖 Read Leaderboard
     ↓
     └─→ Load CSV with wallet addresses and points
  
  2. 🧮 Calculate Distribution
     ↓
     └─→ User Tokens = (User Points / Total Points) × Period Tokens
  
  3. 🔨 Create Payload
     ↓
     └─→ Format for Helius Airship API
  
  4. 🚢 Send to Helius
     ↓
     └─→ POST /v1/distribute with recipients list
  
  5. ⚡ Helius Processes
     ↓
     ├─→ Create ATAs if missing
     ├─→ Batch transactions
     ├─→ Apply priority fees
     └─→ Confirm on-chain
  
  6. ✅ Distribution Complete
     ↓
     └─→ Save records and transaction signatures
  `);
  
  // Key Features
  console.log('\n✨ KEY FEATURES');
  console.log('─'.repeat(70));
  console.log('✓ Proportional Distribution  - Fair allocation based on points');
  console.log('✓ Bulk Processing            - Handle hundreds of recipients');
  console.log('✓ Auto ATA Creation          - No manual token account setup');
  console.log('✓ Priority Fees              - Faster transaction processing');
  console.log('✓ Error Handling             - Automatic retries on failure');
  console.log('✓ Distribution Records       - Complete audit trail');
  console.log('✓ Scalable Architecture      - Ready for production use');
  
  // Cost Estimation
  console.log('\n💵 ESTIMATED COSTS (Solana Mainnet)');
  console.log('─'.repeat(70));
  console.log('Token Creation:           ~0.002 SOL (one-time)');
  console.log('Per Distribution:         ~0.005 SOL base');
  console.log('Per Recipient:            ~0.0001 SOL');
  console.log('Priority Fee (medium):    ~0.0001 SOL per tx');
  console.log('');
  console.log('Example: 100 recipients');
  console.log('  Cost: 0.005 + (100 × 0.0001) + 0.0001 = ~0.025 SOL');
  console.log('  USD:  ~$5 @ $200/SOL');
  
  console.log('\n═'.repeat(70));
  console.log('✨ Report Generated Successfully!\n');
}

generateDistributionReport();
