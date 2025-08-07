import { db } from '../lib/db';

// Popular Solana token data for immediate testing
const sampleTokens = [
  {
    pairAddress: 'So11111111111111111111111111111111111111112',
    baseTokenAddress: 'So11111111111111111111111111111111111111112',
    baseTokenName: 'Wrapped SOL',
    baseTokenSymbol: 'SOL',
    quoteTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    quoteTokenName: 'USD Coin',
    quoteTokenSymbol: 'USDC',
    dexId: 'raydium',
    priceUsd: '215.50',
    priceSOL: '1.00',
    liquidity: 15000000,
    volume24h: 45000000,
    marketCap: 102000000000,
    fdv: 102000000000,
    priceChange24h: 2.5,
    txnCount24h: 12500,
    tradingViewUrl: 'https://dexscreener.com/solana/So11111111111111111111111111111111111111112',
    dexScreenerUrl: 'https://dexscreener.com/solana/So11111111111111111111111111111111111111112',
    imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    bullishVotes: 150,
    bearishVotes: 50,
    bullishPercentage: 75,
    score: 45000000
  },
  {
    pairAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    baseTokenAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    baseTokenName: 'Raydium',
    baseTokenSymbol: 'RAY',
    quoteTokenAddress: 'So11111111111111111111111111111111111111112',
    quoteTokenName: 'Wrapped SOL',
    quoteTokenSymbol: 'SOL',
    dexId: 'raydium',
    priceUsd: '4.25',
    priceSOL: '0.0197',
    liquidity: 8500000,
    volume24h: 12000000,
    marketCap: 2100000000,
    fdv: 2100000000,
    priceChange24h: 5.8,
    txnCount24h: 8200,
    tradingViewUrl: 'https://dexscreener.com/solana/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    dexScreenerUrl: 'https://dexscreener.com/solana/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
    bullishVotes: 120,
    bearishVotes: 80,
    bullishPercentage: 60,
    score: 12000000
  },
  {
    pairAddress: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    baseTokenAddress: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    baseTokenName: 'Orca',
    baseTokenSymbol: 'ORCA',
    quoteTokenAddress: 'So11111111111111111111111111111111111111112',
    quoteTokenName: 'Wrapped SOL',
    quoteTokenSymbol: 'SOL',
    dexId: 'orca',
    priceUsd: '3.42',
    priceSOL: '0.0159',
    liquidity: 6200000,
    volume24h: 8500000,
    marketCap: 342000000,
    fdv: 342000000,
    priceChange24h: -1.2,
    txnCount24h: 5500,
    tradingViewUrl: 'https://dexscreener.com/solana/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    dexScreenerUrl: 'https://dexscreener.com/solana/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
    bullishVotes: 90,
    bearishVotes: 110,
    bullishPercentage: 45,
    score: 8500000
  },
  // Add more sample tokens
  {
    pairAddress: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    baseTokenAddress: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    baseTokenName: 'Marinade staked SOL',
    baseTokenSymbol: 'mSOL',
    quoteTokenAddress: 'So11111111111111111111111111111111111111112',
    quoteTokenName: 'Wrapped SOL',
    quoteTokenSymbol: 'SOL',
    dexId: 'raydium',
    priceUsd: '231.20',
    priceSOL: '1.073',
    liquidity: 12000000,
    volume24h: 6800000,
    marketCap: 850000000,
    fdv: 850000000,
    priceChange24h: 1.8,
    txnCount24h: 3200,
    tradingViewUrl: 'https://dexscreener.com/solana/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    dexScreenerUrl: 'https://dexscreener.com/solana/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
    bullishVotes: 85,
    bearishVotes: 65,
    bullishPercentage: 57,
    score: 6800000
  }
];

async function populateSampleData() {
  try {
    console.log('Populating sample token data...');
    
    for (const token of sampleTokens) {
      await db.cryptoCurrency.upsert({
        where: { pairAddress: token.pairAddress },
        create: token,
        update: token
      });
      console.log(`Added/updated ${token.baseTokenSymbol}`);
    }
    
    console.log(`Successfully populated ${sampleTokens.length} sample tokens`);
    
    const count = await db.cryptoCurrency.count();
    console.log(`Total tokens in database: ${count}`);
    
  } catch (error) {
    console.error('Error populating sample data:', error);
  } finally {
    await db.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  populateSampleData();
}

export { populateSampleData };