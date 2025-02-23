export interface CryptoCurrency {
  id: string;
  baseTokenName: string;
  baseTokenSymbol: string;
  baseTokenAddress: string;
  quoteTokenAddress: string;
  pairAddress: string;
  dexId: string;
  priceUsd: string;
  priceSOL: string;
  liquidity: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  priceChange24h: number;
  txnCount24h: number;
  tradingViewUrl: string;
  dexScreenerUrl: string;
  imageUrl?: string | null;
  bullishVotes: number;
  bearishVotes: number;
  bullishPercentage: number;
  
  // Derived fields for UI
  name: string;
  symbol: string;
  logo: string;
  change24h: string;
  tradingViewSymbol: string;
} 