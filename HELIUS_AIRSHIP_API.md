# Helius Airship API Reference

Complete reference for integrating Helius Airship token distribution into your application.

## 🚢 What is Helius Airship?

Helius Airship is a powerful API for bulk SPL token distribution on Solana. It handles:
- Bulk token transfers in a single transaction
- Automatic associated token account (ATA) creation
- Priority fee management
- Transaction optimization
- Retry logic and error handling

## 📡 API Endpoint

```
POST https://airship.helius.xyz/v1/distribute
```

## 🔐 Authentication

All requests require an API key in the Authorization header:

```
Authorization: Bearer YOUR_HELIUS_API_KEY
```

Get your API key at: https://helius.xyz

## 📝 Request Format

### Headers

```http
POST /v1/distribute HTTP/1.1
Host: airship.helius.xyz
Authorization: Bearer YOUR_HELIUS_API_KEY
Content-Type: application/json
```

### Request Body

```json
{
  "mint": "string",
  "recipients": [
    {
      "recipientAddress": "string",
      "amount": "number"
    }
  ],
  "priorityFee": "none" | "low" | "medium" | "high",
  "createAtaIfMissing": boolean,
  "skipPreflight": boolean,
  "commitment": "processed" | "confirmed" | "finalized"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mint` | string | Yes | SPL token mint address |
| `recipients` | array | Yes | Array of recipient objects (max 100 per request) |
| `recipients[].recipientAddress` | string | Yes | Solana wallet address of recipient |
| `recipients[].amount` | number | Yes | Token amount in smallest unit (with decimals) |
| `priorityFee` | string | No | Priority fee level (default: "medium") |
| `createAtaIfMissing` | boolean | No | Auto-create token accounts (default: true) |
| `skipPreflight` | boolean | No | Skip transaction simulation (default: false) |
| `commitment` | string | No | Confirmation level (default: "confirmed") |

### Example Request

```bash
curl -X POST https://airship.helius.xyz/v1/distribute \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "mint": "HeLiUSAirShipTok3nM1ntAddr3ssExamp13",
    "recipients": [
      {
        "recipientAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        "amount": 17647058000000000
      },
      {
        "recipientAddress": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
        "amount": 35294117000000000
      }
    ],
    "priorityFee": "medium",
    "createAtaIfMissing": true
  }'
```

## 📤 Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "transactionSignature": "5J7k8m9n...",
  "recipients": 2,
  "totalAmount": "52941175000000000",
  "status": "confirmed",
  "timestamp": "2025-11-05T10:30:00.000Z",
  "blockHeight": 123456789
}
```

### Error Response (400/500)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_RECIPIENT",
    "message": "Invalid wallet address at index 0",
    "details": {}
  }
}
```

## 🔢 Amount Calculation

Helius Airship expects amounts in the smallest unit (accounting for decimals).

**Formula:**
```
API Amount = Token Amount × 10^decimals
```

**Example:**
- Token: 17,647,058 SKY0
- Decimals: 9
- API Amount: 17647058 × 10^9 = 17,647,058,000,000,000

### JavaScript Helper

```javascript
function toSmallestUnit(amount, decimals) {
  return Math.floor(amount * Math.pow(10, decimals));
}

// Usage
const tokenAmount = 17647058; // SKY0 tokens
const decimals = 9;
const apiAmount = toSmallestUnit(tokenAmount, decimals);
// Result: 17647058000000000
```

## ⚡ Priority Fees

Priority fees help your transaction get processed faster during network congestion.

| Level | Description | Use Case |
|-------|-------------|----------|
| `none` | No priority fee | Low urgency, save costs |
| `low` | Small priority fee (~0.00001 SOL) | Normal operations |
| `medium` | Moderate priority fee (~0.0001 SOL) | **Recommended for distributions** |
| `high` | High priority fee (~0.001 SOL) | Urgent, time-sensitive |

## 📊 Rate Limits

| Plan | Requests/Second | Recipients/Request | Monthly Quota |
|------|----------------|-------------------|---------------|
| Free | 1 | 10 | 1,000 recipients |
| Starter | 5 | 50 | 50,000 recipients |
| Pro | 10 | 100 | 500,000 recipients |
| Enterprise | Custom | Custom | Unlimited |

## 🔄 Batch Processing

For large distributions (>100 recipients), split into batches:

```javascript
async function distributeLarge(recipients, mintAddress, batchSize = 100) {
  const batches = [];
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize));
  }
  
  const results = [];
  
  for (const batch of batches) {
    const response = await fetch('https://airship.helius.xyz/v1/distribute', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mint: mintAddress,
        recipients: batch,
        priorityFee: 'medium',
        createAtaIfMissing: true
      })
    });
    
    results.push(await response.json());
    
    // Rate limiting: wait 1 second between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}
```

## 🛡️ Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_MINT` | Invalid token mint address | Verify mint address |
| `INVALID_RECIPIENT` | Invalid wallet address | Check address format |
| `INSUFFICIENT_BALANCE` | Not enough tokens in source | Fund the source account |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Implement rate limiting |
| `TRANSACTION_FAILED` | On-chain transaction failed | Check logs, retry |

### Retry Logic

```javascript
async function distributeWithRetry(payload, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        'https://airship.helius.xyz/v1/distribute',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      return response.data;
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## 📋 Integration Checklist

- [ ] Get Helius API key
- [ ] Set up authentication
- [ ] Calculate amounts correctly (with decimals)
- [ ] Handle ATA creation
- [ ] Implement error handling
- [ ] Add retry logic
- [ ] Batch large distributions
- [ ] Respect rate limits
- [ ] Log all transactions
- [ ] Monitor distribution success

## 🎯 Complete Integration Example

```javascript
import axios from 'axios';

class HeliusAirship {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://airship.helius.xyz';
  }
  
  /**
   * Distribute tokens to multiple recipients
   */
  async distribute(mintAddress, recipients, options = {}) {
    const {
      priorityFee = 'medium',
      createAtaIfMissing = true,
      commitment = 'confirmed',
      batchSize = 100
    } = options;
    
    // Validate inputs
    this.validateMintAddress(mintAddress);
    this.validateRecipients(recipients);
    
    // Split into batches if needed
    const batches = this.createBatches(recipients, batchSize);
    const results = [];
    
    for (let i = 0; i < batches.length; i++) {
      console.log(`Processing batch ${i + 1}/${batches.length}...`);
      
      const payload = {
        mint: mintAddress,
        recipients: batches[i],
        priorityFee,
        createAtaIfMissing,
        commitment
      };
      
      const result = await this.sendDistribution(payload);
      results.push(result);
      
      // Rate limiting
      if (i < batches.length - 1) {
        await this.delay(1000);
      }
    }
    
    return this.aggregateResults(results);
  }
  
  /**
   * Send distribution request
   */
  async sendDistribution(payload, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/v1/distribute`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );
        
        return response.data;
        
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Distribution failed after ${retries} attempts: ${error.message}`);
        }
        
        const delay = Math.pow(2, attempt) * 1000;
        await this.delay(delay);
      }
    }
  }
  
  /**
   * Convert token amount to smallest unit
   */
  toSmallestUnit(amount, decimals) {
    return Math.floor(amount * Math.pow(10, decimals));
  }
  
  /**
   * Validate mint address
   */
  validateMintAddress(address) {
    if (!address || typeof address !== 'string' || address.length < 32) {
      throw new Error('Invalid mint address');
    }
  }
  
  /**
   * Validate recipients array
   */
  validateRecipients(recipients) {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Recipients must be a non-empty array');
    }
    
    for (const recipient of recipients) {
      if (!recipient.recipientAddress || !recipient.amount) {
        throw new Error('Each recipient must have recipientAddress and amount');
      }
    }
  }
  
  /**
   * Create batches from recipients
   */
  createBatches(recipients, batchSize) {
    const batches = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }
    return batches;
  }
  
  /**
   * Aggregate results from multiple batches
   */
  aggregateResults(results) {
    return {
      success: results.every(r => r.success),
      batches: results.length,
      totalRecipients: results.reduce((sum, r) => sum + r.recipients, 0),
      transactions: results.map(r => r.transactionSignature)
    };
  }
  
  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const airship = new HeliusAirship('your_api_key');

const recipients = [
  {
    recipientAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    amount: airship.toSmallestUnit(17647058, 9)
  },
  // ... more recipients
];

const result = await airship.distribute(
  'HeLiUSAirShipTok3nM1ntAddr3ssExamp13',
  recipients,
  {
    priorityFee: 'medium',
    batchSize: 100
  }
);

console.log('Distribution complete:', result);
```

## 📚 Additional Resources

- **Helius Documentation:** https://docs.helius.xyz
- **Helius Dashboard:** https://helius.xyz/dashboard
- **Airship API Reference:** https://docs.helius.xyz/airship
- **Support:** support@helius.xyz

## 💡 Best Practices

1. **Always test on devnet first**
2. **Implement comprehensive error handling**
3. **Use retry logic with exponential backoff**
4. **Respect rate limits**
5. **Batch large distributions**
6. **Log all transactions for auditing**
7. **Monitor transaction confirmations**
8. **Keep API keys secure**
9. **Use appropriate priority fees**
10. **Validate all inputs before API calls**

---

**Ready to distribute tokens at scale with Helius Airship!** 🚢
