import bs58 from 'bs58';

// Your array from the .env file
const secretKeyArray = [95,144,51,224,11,44,247,40,102,83,173,43,32,162,24,206,97,60,160,40,3,85,110,3,239,158,203,158,232,10,231,111,27,98,37,52,226,243,173,239,114,144,173,210,156,230,75,105,59,239,208,165,147,106,154,19,117,165,174,64,46,159,106,97];

const base58PrivateKey = bs58.encode(Buffer.from(secretKeyArray));

console.log('\n✅ Base58 Private Key:');
console.log(base58PrivateKey);
console.log('\nUse this in your .env file!\n');
