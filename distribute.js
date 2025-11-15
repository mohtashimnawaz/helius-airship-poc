import dotenv from 'dotenv';
import generateAirshipCSV from './generate-airship-csv.js';

dotenv.config();

/**
 * Simplified distribution entrypoint
 * This repository no longer performs direct manual SPL transfers.
 * Instead we generate an AirShip-compatible CSV and recommend using
 * the official Helius AirShip CLI or web app to execute the compressed airdrop.
 */
async function distributeTokens() {
  console.log('🎯 SKY0 Token Distribution (AirShip CSV generator only)');
  console.log('═'.repeat(60));

  try {
    await generateAirshipCSV();

    console.log('\nNext steps:');
    console.log(' - Run `npm run distribute-airship` to launch the Helius AirShip CLI (interactive)');
    console.log(' - Or upload the generated `airship-distribution.csv` to https://airship.helius.dev/');
    console.log('\nNote: direct/manual SPL transfer code has been removed. Use AirShip for ZK-compressed distributions.');

  } catch (error) {
    console.error('\n❌ Distribution (CSV generation) failed:', error.message || error);
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

export default distributeTokens;
