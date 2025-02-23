import type { Pair, PairsResponse, TokenProfile, TokenBoost } from 'dexscreener-sdk';

export type { Pair as DexScreenerPair, PairsResponse as DexScreenerResponse };

// Re-export additional types that might be useful
export type { TokenProfile, TokenBoost };

// Additional type for our specific use case
export type ExtendedPair = Pair & {
  imageUrl?: string;
  tradingViewUrl?: string;
  dexScreenerUrl?: string;
} 