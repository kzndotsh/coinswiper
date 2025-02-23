import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CryptoCurrency } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function transformToken(token: any): CryptoCurrency {
  const { priceChange24h, ...rest } = token;
  
  // More strict logo URL validation
  let logoUrl = "/placeholder.svg";
  if (token.imageUrl && 
      typeof token.imageUrl === 'string' && 
      token.imageUrl.trim() !== '' &&
      (token.imageUrl.startsWith('http://') || token.imageUrl.startsWith('https://'))) {
    logoUrl = token.imageUrl;
  } else if (token.logo && 
      typeof token.logo === 'string' && 
      token.logo.trim() !== '' &&
      (token.logo.startsWith('http://') || token.logo.startsWith('https://'))) {
    logoUrl = token.logo;
  }

  // Calculate bullish percentage and round to whole number
  const totalVotes = (token.bullishVotes || 0) + (token.bearishVotes || 0);
  const bullishPercentage = totalVotes === 0 
    ? 50 
    : Math.round((token.bullishVotes / totalVotes) * 100);

  return {
    ...rest,
    // Use token name/symbol from base token
    name: token.baseTokenName || 'Unknown Token',
    symbol: token.baseTokenSymbol || 'UNKNOWN',
    // Format numbers for display
    marketCap: formatCurrency(token.marketCap || 0),
    volume24h: formatCurrency(token.volume24h || 0),
    change24h: formatPercentage(priceChange24h || 0),
    // Use validated logo URL
    logo: logoUrl,
    tradingViewSymbol: `DEXSCREENER:${token.baseTokenSymbol}${token.quoteTokenSymbol}`,
    // Preserve pairAddress
    pairAddress: token.pairAddress,
    // Use rounded bullish percentage
    bullishPercentage,
    bullishVotes: token.bullishVotes || 0,
    bearishVotes: token.bearishVotes || 0,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(1)}`;
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}
