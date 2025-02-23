// Solana DEX Configuration
export const SOLANA_DEXES = [
  "raydium",
  "orca",
  "meteora",
  "phoenix",
  "jupiter",
  "tensor",
] as string[];

export type SolanaDex = typeof SOLANA_DEXES[number];

// DEX-specific configurations
export const DEX_CONFIG = {
  // DEXes that only show new pairs (24h)
  NEW_PAIRS_ONLY: ["raydium"] as string[],
  // Time thresholds in hours
  TIME_THRESHOLDS: {
    NEW_PAIRS: 168,        // 7 days for new-pairs-only DEXes
    ESTABLISHED: 720,     // 30 days for other DEXes
  }
} as const;

// Validation Thresholds
export const VALIDATION_THRESHOLDS = {
  // Liquidity thresholds (in USD)
  LIQUIDITY: {
    TRENDING_PAIRS: 5000,  // Reduced from 10k to 5k
    NEW_PAIRS: 1000,       // Reduced from 5k to 1k
    DEX_PAIRS: 1000,       // Reduced from 5k to 1k
    MINIMAL: 100,          // Increased slightly for quality
  },
  
  // Time thresholds - align with DEX_CONFIG
  TIME: {
    NEW_PAIRS: 168,        // 7 days, matches DEX_CONFIG
    ESTABLISHED: 720,      // 30 days, matches DEX_CONFIG
    MIN_DATE: '2020-01-01', // Keep minimum date
  },
  
  // Suspicious token detection
  SUSPICIOUS_KEYWORDS: [
    'trump',
    'scam',
    'test',
    'fake'
  ],
  
  // Scoring weights - increase volume importance
  SCORING: {
    VOLUME_WEIGHT: 0.5,       // Increased from 0.4
    LIQUIDITY_WEIGHT: 0.3,    // Increased from 0.2
    TX_COUNT_MULTIPLIER: 200, // Increased from 100
    
    // Bonuses - adjusted to give more weight to active pairs
    RECENT_ACTIVITY_BONUS: 10000,  // Doubled
    PRICE_CHANGE_MULTIPLIER: 3000, // Increased
    BOOST_BONUS: 15000,           // Increased
    SMALL_TOKEN_BONUS: 5000,      // Increased
    SMALL_TOKEN_THRESHOLD: 100000, // Increased threshold
  },
  
  // Result limits - keep high to get more pairs
  LIMITS: {
    MAX_PAIRS: 1000,
  },
  
  // Cache settings (in seconds)
  CACHE: {
    MAX_AGE: 300,
    STALE_WHILE_REVALIDATE: 600,
  },
} as const;

// Validation type definitions
export interface ValidationResult {
  isOnSolana: boolean;
  isValidDex: boolean;
  hasValidTokens: boolean;
  hasMinimalLiquidity: boolean;
  isSuspicious: boolean;
  isNew: boolean;
  isTokenBoosted: boolean;
  isValid: boolean;
  liquidity: number;
  createdAt: number;
}

// Helper functions
export function isSuspiciousToken(symbol: string, quoteSymbol: string): boolean {
  const baseSymbol = symbol.toLowerCase();
  return VALIDATION_THRESHOLDS.SUSPICIOUS_KEYWORDS.some(keyword => 
    baseSymbol.includes(keyword)
  ) || baseSymbol === quoteSymbol.toLowerCase();
}

export function calculatePairScore({
  volume24h,
  liquidityUsd,
  txCount24h,
  priceChange24h,
  isBoosted,
}: {
  volume24h: number;
  liquidityUsd: number;
  txCount24h: number;
  priceChange24h: number;
  isBoosted: boolean;
}): number {
  const {
    VOLUME_WEIGHT,
    LIQUIDITY_WEIGHT,
    TX_COUNT_MULTIPLIER,
    RECENT_ACTIVITY_BONUS,
    PRICE_CHANGE_MULTIPLIER,
    BOOST_BONUS,
    SMALL_TOKEN_BONUS,
    SMALL_TOKEN_THRESHOLD,
  } = VALIDATION_THRESHOLDS.SCORING;

  // Base scores
  const volumeScore = volume24h * VOLUME_WEIGHT;
  const liquidityScore = liquidityUsd * LIQUIDITY_WEIGHT;
  const txCountScore = txCount24h * TX_COUNT_MULTIPLIER;
  
  // Bonuses
  const hasRecentActivity = txCount24h > 0 ? RECENT_ACTIVITY_BONUS : 0;
  const priceChangeBonus = Math.abs(priceChange24h) * PRICE_CHANGE_MULTIPLIER;
  const boostBonus = isBoosted ? BOOST_BONUS : 0;
  const smallTokenBonus = liquidityUsd < SMALL_TOKEN_THRESHOLD ? SMALL_TOKEN_BONUS : 0;
  
  return volumeScore + liquidityScore + txCountScore + hasRecentActivity + 
         priceChangeBonus + smallTokenBonus + boostBonus;
}

// Helper function to determine if a pair is new enough based on its DEX
export function isNewEnough(creationDate: Date | number, dex: string): boolean {
  const now = new Date();
  const hoursThreshold = DEX_CONFIG.NEW_PAIRS_ONLY.includes(dex.toLowerCase()) 
    ? DEX_CONFIG.TIME_THRESHOLDS.NEW_PAIRS 
    : DEX_CONFIG.TIME_THRESHOLDS.ESTABLISHED;
  
  const cutoffTime = new Date(now.getTime() - (hoursThreshold * 60 * 60 * 1000));
  
  // Handle both Date objects and Unix timestamps
  const pairDate = creationDate instanceof Date 
    ? creationDate 
    : new Date(typeof creationDate === 'string' ? Date.parse(creationDate) : creationDate);

  // Validate the date
  if (isNaN(pairDate.getTime())) {
    console.error(`Invalid creation date: ${creationDate}`);
    return false;
  }

  // Check if date is too old (before 2020)
  const minDate = new Date(VALIDATION_THRESHOLDS.TIME.MIN_DATE);
  if (pairDate < minDate) {
    console.error(`Creation date too old: ${pairDate.toISOString()}`);
    return false;
  }

  return pairDate >= cutoffTime;
} 