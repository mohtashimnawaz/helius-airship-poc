import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const privateKey = '2upKAXaTKSCYxiBQkJ3kkmjaRx3rCxa4jvGFCxd5ofaofqguiW2MS6QDfsok5fXGVjvPGKD3BxdzBHeUCSZEdVAx';
const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

console.log('\n💳 Your Wallet Address:');
console.log(keypair.publicKey.toString());
console.log('\n💰 Fund this wallet with devnet SOL:');
console.log(`solana airdrop 2 ${keypair.publicKey.toString()} --url devnet`);
console.log('\nOr use the web faucet: https://faucet.solana.com/\n');
