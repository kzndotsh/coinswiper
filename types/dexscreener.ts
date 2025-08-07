import type { Pair, PairsResponse, TokenProfile } from 'dexscreener-sdk';

export type { Pair as DexScreenerPair, PairsResponse as DexScreenerResponse };

// Re-export additional types that might be useful
export type { TokenProfile };

// Additional type for our specific use case
export type ExtendedPair = Pair & {
  imageUrl?: string;
  tradingViewUrl?: string;
  dexScreenerUrl?: string;
} 