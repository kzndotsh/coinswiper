import type { DexScreenerResponse, DexScreenerPair, ExtendedPair, TokenProfile, TokenBoost } from "@/types/dexscreener";
import {
  getLatestTokenProfiles,
  getLatestTokenBoosts,
  getTopTokenBoosts,
  getPairById,
  searchPairs,
  getTokenPools,
  getPairsByTokenAddresses,
  type Pair,
  type PairsResponse
} from "dexscreener-sdk";

import { VALIDATION_THRESHOLDS, SOLANA_DEXES } from "@/lib/config/filters";

const DEXSCREENER_API_BASE = "https://api.dexscreener.com/latest/dex";

export class DexScreenerClient {
  private extendPair(pair: Pair): ExtendedPair {
    const extended = {
      ...pair,
      tradingViewUrl: `https://dexscreener.com/chart/${pair.chainId}/${pair.pairAddress}`,
      dexScreenerUrl: `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`,
      imageUrl: pair.info?.imageUrl,
      toJSON: () => ({
        ...pair.toJSON(),
        tradingViewUrl: `https://dexscreener.com/chart/${pair.chainId}/${pair.pairAddress}`,
        dexScreenerUrl: `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`,
        imageUrl: pair.info?.imageUrl
      })
    };
    return extended;
  }

  async getTrendingPairs(chainId: string = 'solana'): Promise<ExtendedPair[]> {
    try {
      console.log('Fetching trending pairs from Solana...');
      // Search for trending pairs on Solana with minimum liquidity
      const response = await searchPairs(`chain:${chainId} liquidity:${VALIDATION_THRESHOLDS.LIQUIDITY.TRENDING_PAIRS}`);
      const pairs = response.pairs || [];
      console.log(`Found ${pairs.length} trending pairs`);

      // Filter for valid pairs and sort by volume
      const filteredPairs = pairs
        .filter((pair: Pair) => {
          const isValidChain = pair.chainId === chainId;
          const hasMinLiquidity = Number(pair.liquidity?.usd || 0) >= VALIDATION_THRESHOLDS.LIQUIDITY.TRENDING_PAIRS;
          const isValidDex = SOLANA_DEXES.includes(pair.dexId.toLowerCase());
          
          if (!isValidChain) console.log(`Skipping pair ${pair.baseToken?.symbol}: wrong chain`);
          if (!hasMinLiquidity) console.log(`Skipping pair ${pair.baseToken?.symbol}: insufficient liquidity`);
          if (!isValidDex) console.log(`Skipping pair ${pair.baseToken?.symbol}: invalid DEX`);
          
          return isValidChain && hasMinLiquidity && isValidDex;
        })
        .sort((a, b) => Number(b.volume?.h24 || 0) - Number(a.volume?.h24 || 0))
        .map(pair => this.extendPair(pair));

      console.log(`Filtered to ${filteredPairs.length} valid trending pairs`);
      filteredPairs.forEach((pair: ExtendedPair) => {
        console.log(`- ${pair.baseToken?.symbol} (${pair.dexId}): $${pair.liquidity?.usd || 0} liquidity, $${pair.volume?.h24 || 0} 24h volume`);
      });

      return filteredPairs;
    } catch (error) {
      console.error(`Failed to get trending pairs:`, error);
      return [];
    }
  }

  async getNewPairs(chainId: string = 'solana'): Promise<ExtendedPair[]> {
    try {
      console.log('Fetching new pairs from Solana...');
      // Search for new pairs on Solana with minimum liquidity
      const response = await searchPairs(`chain:${chainId} new liquidity:${VALIDATION_THRESHOLDS.LIQUIDITY.NEW_PAIRS}`);
      const pairs = response.pairs || [];
      console.log(`Found ${pairs.length} new pairs`);

      // Filter for valid pairs and sort by creation date
      const filteredPairs = pairs
        .filter((pair: Pair) => {
          const isValidChain = pair.chainId === chainId;
          const hasMinLiquidity = Number(pair.liquidity?.usd || 0) >= VALIDATION_THRESHOLDS.LIQUIDITY.NEW_PAIRS;
          const isValidDex = SOLANA_DEXES.includes(pair.dexId.toLowerCase());
          
          if (!isValidChain) console.log(`Skipping pair ${pair.baseToken?.symbol}: wrong chain`);
          if (!hasMinLiquidity) console.log(`Skipping pair ${pair.baseToken?.symbol}: insufficient liquidity`);
          if (!isValidDex) console.log(`Skipping pair ${pair.baseToken?.symbol}: invalid DEX`);
          
          return isValidChain && hasMinLiquidity && isValidDex;
        })
        .sort((a, b) => new Date(b.pairCreatedAt).getTime() - new Date(a.pairCreatedAt).getTime())
        .map(pair => this.extendPair(pair));

      console.log(`Filtered to ${filteredPairs.length} valid new pairs`);
      filteredPairs.forEach((pair: ExtendedPair) => {
        console.log(`- ${pair.baseToken?.symbol} (${pair.dexId}): $${pair.liquidity?.usd || 0} liquidity, created ${new Date(pair.pairCreatedAt).toISOString()}`);
      });

      return filteredPairs;
    } catch (error) {
      console.error(`Failed to get new pairs:`, error);
      return [];
    }
  }

  async searchPairs(dex: string): Promise<ExtendedPair[]> {
    try {
      // Try alternative DEX identifiers for PumpFun
      const dexId = dex.toLowerCase() === 'pumpfun' ? 'pump' : dex.toLowerCase();
      
      console.log(`\nSearching pairs for ${dex}...`);
      // Search for pairs with minimum liquidity
      const searchQuery = `chain:solana dex:${dexId} liquidity:${VALIDATION_THRESHOLDS.LIQUIDITY.DEX_PAIRS}`;
      console.log(`Search query: "${searchQuery}"`);
      
      const response = await searchPairs(searchQuery);
      
      // Log raw response
      const pairs = response.pairs || [];
      console.log(`Raw results: ${pairs.length} pairs`);
      
      if (pairs.length === 0) {
        // Log the full response for debugging
        console.log('Full response:', JSON.stringify(response, null, 2));
      }
      
      // Log all unique DEX IDs found
      const uniqueDexIds = new Set(pairs.map(p => p.dexId.toLowerCase()));
      console.log('Found DEX IDs:', Array.from(uniqueDexIds));
      
      // Filter for Solana pairs and log details
      const solanaPairs = pairs
        .filter((pair: Pair) => {
          const isDexMatch = pair.dexId.toLowerCase() === dexId;
          if (isDexMatch) {
            console.log(`Found matching DEX ID: ${pair.dexId} (looking for ${dexId})`);
          }
          return pair.chainId === 'solana' && isDexMatch;
        })
        .map(pair => this.extendPair(pair));

      console.log(`Filtered to ${solanaPairs.length} Solana pairs on ${dex}:`);
      solanaPairs.forEach((pair: ExtendedPair) => {
        console.log(`- ${pair.baseToken?.symbol} (${pair.dexId}): $${pair.liquidity?.usd || 0} liquidity, created ${new Date(pair.pairCreatedAt).toISOString()}`);
      });
      
      return solanaPairs;
    } catch (error) {
      console.error(`Failed to search pairs for "${dex}":`, error);
      return [];
    }
  }

  async searchTokens(query: string): Promise<ExtendedPair[]> {
    try {
      const response = await searchPairs(query);
      const pairs = response.pairs || [];
      // Filter for Solana pairs only
      return pairs
        .filter((pair: Pair) => pair.chainId === 'solana')
        .map(pair => this.extendPair(pair));
    } catch (error) {
      console.error(`Failed to search tokens for query "${query}":`, error);
      return [];
    }
  }

  async getPairsByTokenAddress(tokenAddress: string, chainId: string = 'solana'): Promise<ExtendedPair[]> {
    try {
      const response = await getPairsByTokenAddresses(chainId, tokenAddress);
      return response.map(pair => this.extendPair(pair));
    } catch (error) {
      console.error(`Failed to get pairs for token "${tokenAddress}":`, error);
      return [];
    }
  }

  async getPairsByTokenAddresses(tokenAddresses: string[], chainId: string = 'solana'): Promise<ExtendedPair[]> {
    try {
      // Dexscreener SDK's getPairsByTokenAddresses actually takes a single token address or a comma separated string of addresses
      const response = await getPairsByTokenAddresses(chainId, tokenAddresses.join(','));
      return response.map(pair => this.extendPair(pair));
    } catch (error) {
      console.error(`Failed to get pairs for tokens "${tokenAddresses.join(', ')}":`, error);
      return [];
    }
  }

  async getPairsByPairAddress(pairAddress: string, chainId: string = 'solana'): Promise<ExtendedPair[]> {
    try {
      const response = await getPairById(chainId, pairAddress);
      return (response.pairs || []).map(pair => this.extendPair(pair));
    } catch (error) {
      console.error(`Failed to get pair "${pairAddress}":`, error);
      return [];
    }
  }

  async getTokenHistory(pairAddress: string, chainId: string = 'solana'): Promise<PairsResponse> {
    try {
      // Use DexScreener's chart endpoint through the SDK
      const response = await getPairById(chainId, pairAddress);
      return {
        schemaVersion: response.schemaVersion,
        pairs: (response.pairs || []).map(pair => this.extendPair(pair))
      };
    } catch (error) {
      console.error(`Failed to get chart data for "${pairAddress}":`, error);
      return {
        schemaVersion: "1.0.0",
        pairs: []
      };
    }
  }

  async getTokenPairs(tokenAddress: string, chainId: string = 'solana'): Promise<ExtendedPair[]> {
    try {
      const response = await getTokenPools(chainId, tokenAddress);
      return response.map(pair => this.extendPair(pair));
    } catch (error) {
      console.error(`Failed to get token pairs for "${tokenAddress}":`, error);
      return [];
    }
  }

  // New method to get token profiles
  async getTokenProfile(tokenAddress: string, chainId: string = 'solana'): Promise<TokenProfile | null> {
    try {
      const profiles = await getLatestTokenProfiles();
      return profiles.find(profile => 
        profile.chainId === chainId && profile.tokenAddress === tokenAddress
      ) || null;
    } catch (error) {
      console.error(`Failed to get token profile for "${tokenAddress}":`, error);
      return null;
    }
  }

  // New method to get token boosts
  async getTokenBoosts(chainId: string = 'solana'): Promise<TokenBoost[]> {
    try {
      const [latestBoosts, topBoosts] = await Promise.all([
        getLatestTokenBoosts(),
        getTopTokenBoosts()
      ]);
      
      // Combine and filter for Solana tokens
      const allBoosts = [...latestBoosts, ...topBoosts];
      return allBoosts.filter(boost => boost.chainId === chainId);
    } catch (error) {
      console.error(`Failed to get token boosts:`, error);
      return [];
    }
  }

  getTradingViewChartUrl(pairAddress: string, chainId: string): string {
    return `https://dexscreener.com/chart/${chainId}/${pairAddress}`;
  }
}

export const dexscreener = new DexScreenerClient(); 