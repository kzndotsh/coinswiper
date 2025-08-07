// Solana DEX Configuration
export const SOLANA_DEXES = [
  "raydium",
  "orca",
  "meteora",
  "jupiter",
  "openbook",
  "serum",
  "aldrin",
  "cropper",
  "lifinity",
  "mercurial",
  "saber",
  "stepn",
  "whirlpool"
] as string[];

// Validation Thresholds - simplified for top 50 approach
export const VALIDATION_THRESHOLDS = {
  // Liquidity thresholds (in USD)
  LIQUIDITY: {
    MINIMAL: 10,  // Minimum $10 liquidity for inclusion (very low)
  },
  
  // Infrastructure tokens to filter out (only basics)
  INFRASTRUCTURE_TOKENS: [
    'usdc', 'usdt', 'dai', 'busd',
    'weth', 'wbtc', 'eth', 'btc'
  ],
  
  // Suspicious token detection
  SUSPICIOUS_KEYWORDS: [
    'trump',
    'scam', 
    'test',
    'fake'
  ],
  
  // Cache settings (in seconds)
  CACHE: {
    MAX_AGE: 300,
    STALE_WHILE_REVALIDATE: 600,
  },
} as const;

// Helper functions
export function isSuspiciousToken(symbol: string, quoteSymbol: string): boolean {
  const baseSymbol = symbol.toLowerCase();
  return VALIDATION_THRESHOLDS.SUSPICIOUS_KEYWORDS.some(keyword => 
    baseSymbol.includes(keyword)
  ) || baseSymbol === quoteSymbol.toLowerCase();
}

export function isInfrastructureToken(symbol: string, name: string): boolean {
  const lowerSymbol = symbol.toLowerCase();
  const lowerName = name.toLowerCase();
  
  return VALIDATION_THRESHOLDS.INFRASTRUCTURE_TOKENS.some(token => 
    lowerSymbol === token || lowerName.includes(token)
  );
} 
