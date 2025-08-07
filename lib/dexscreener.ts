import type { ExtendedPair, TokenProfile } from "@/types/dexscreener";
import {
  getLatestTokenProfiles,
  getPairById,
  searchPairs,
  getTokenPools,
  getPairsByTokenAddresses,
  type Pair,
  type PairsResponse
} from "dexscreener-sdk";

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
      console.log('Fetching top tokens by volume from Solana...');
      
      const allPairs: any[] = [];
      
      // Strategy 1: Get trending tokens 
      try {
        console.log('Strategy 1: Trending tokens...');
        const response = await fetch('https://api.dexscreener.com/latest/dex/search/?q=trending', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CoinSwiper/1.0)',
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.pairs && Array.isArray(data.pairs)) {
            const solanaPairs = data.pairs.filter((pair: any) => pair.chainId === 'solana');
            console.log(`Found ${solanaPairs.length} trending Solana pairs`);
            allPairs.push(...solanaPairs);
          }
        }
      } catch (error) {
        console.log('Trending search failed:', error);
      }

      // Strategy 2: Get pairs for major Solana tokens
      const majorTokens = [
        'So11111111111111111111111111111111111111112', // SOL
      ];
      
      console.log('Strategy 2: Major token pairs...');
      for (const tokenAddress of majorTokens) {
        try {
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CoinSwiper/1.0)',
              'Accept': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.pairs && Array.isArray(data.pairs)) {
              const solanaPairs = data.pairs.filter((pair: any) => pair.chainId === 'solana');
              console.log(`Found ${solanaPairs.length} pairs for ${tokenAddress.slice(0, 8)}...`);
              allPairs.push(...solanaPairs);
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.log(`Failed to fetch pairs for ${tokenAddress.slice(0, 8)}...:`, error);
        }
      }
      
      // Strategy 3: Search by popular terms
      const searchTerms = ['USDC', 'SOL', 'RAY', 'ORCA', 'BONK', 'JUP'];
      console.log('Strategy 3: Search terms...');
      for (const term of searchTerms) {
        try {
          const response = await fetch(`https://api.dexscreener.com/latest/dex/search/?q=${term}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CoinSwiper/1.0)',
              'Accept': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.pairs && Array.isArray(data.pairs)) {
              const solanaPairs = data.pairs.filter((pair: any) => pair.chainId === 'solana');
              console.log(`Found ${solanaPairs.length} pairs for search "${term}"`);
              allPairs.push(...solanaPairs);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.log(`Failed to search for "${term}":`, error);
        }
      }

      console.log(`Total pairs found: ${allPairs.length}`);

      // Deduplicate by pairAddress
      const uniquePairs = Array.from(
        new Map(allPairs.map(pair => [pair.pairAddress, pair])).values()
      );
      
      console.log(`Unique pairs after deduplication: ${uniquePairs.length}`);

      // Filter and sort by volume - more permissive now
      const filteredPairs = uniquePairs
        .filter((pair: any) => {
          const hasValidChain = pair.chainId === 'solana';
          const hasMinLiquidity = Number(pair.liquidity?.usd || 0) >= 50; // Lower threshold
          const hasValidTokens = pair.baseToken?.address && pair.quoteToken?.address;
          
          if (!hasValidChain) console.log(`Filtered out ${pair.baseToken?.symbol}: wrong chain ${pair.chainId}`);
          if (!hasMinLiquidity) console.log(`Filtered out ${pair.baseToken?.symbol}: low liquidity $${pair.liquidity?.usd}`);
          if (!hasValidTokens) console.log(`Filtered out ${pair.baseToken?.symbol}: missing token addresses`);
          
          return hasValidChain && hasMinLiquidity && hasValidTokens;
        })
        .sort((a: any, b: any) => Number(b.volume?.h48 || b.volume?.h24 || 0) - Number(a.volume?.h48 || a.volume?.h24 || 0))
        .slice(0, 200) // Take top 200 to have plenty
        .map(pair => this.extendPair(pair as Pair));

      console.log(`Filtered to top ${filteredPairs.length} pairs by volume`);
      
      return filteredPairs;
    } catch (error) {
      console.error(`Failed to get trending pairs:`, error);
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


  getTradingViewChartUrl(pairAddress: string, chainId: string): string {
    return `https://dexscreener.com/chart/${chainId}/${pairAddress}`;
  }
}

export const dexscreener = new DexScreenerClient(); 
