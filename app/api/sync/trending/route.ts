import { NextResponse } from "next/server";
import { dexscreener } from "@/lib/dexscreener";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { ExtendedPair } from "@/types/dexscreener";
import {
  SOLANA_DEXES,
  VALIDATION_THRESHOLDS,
  isSuspiciousToken,
  isInfrastructureToken,
} from "@/lib/config/filters";

export async function POST() {
  try {
    console.log("[DEBUG] Starting simplified sync process for top 50 tokens...");
    
    // Remove hardcoded addresses - we'll fetch top tokens dynamically

    // Test database connection
    let count = 0;
    try {
      count = await db.cryptoCurrency.count();
      console.log(`Current number of tokens in database: ${count}`);
    } catch (error: any) {
      console.error("Database connection test failed:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Known Prisma error:", {
          code: error.code,
          message: error.message,
          clientVersion: error.clientVersion,
        });
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        console.error("Validation error:", error.message);
      } else if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }

    // Get top tokens by volume - much simpler approach
    console.log("Fetching top tokens by volume...");
    const allPairs: ExtendedPair[] = [];
    
    // Get trending pairs by volume (this is the main source)
    console.log("Fetching trending pairs from Solana...");
    const trendingPairs = await dexscreener.getTrendingPairs();
    console.log(`Found ${trendingPairs.length} trending pairs`);
    allPairs.push(...trendingPairs);

    // No need for token boosts in simplified version
    const boostedAddresses = new Set<string>();
    
    // Deduplicate pairs by pairAddress
    const uniquePairs = Array.from(
      new Map(allPairs.map(pair => [pair.pairAddress, pair])).values()
    );
    
    console.log(`Found ${uniquePairs.length} total unique pairs before validation`);

    // Sort by 48h volume (fallback to 24h if 48h not available)
    const sortedPairs = uniquePairs
      .sort((a, b) => Number(b.volume?.h48 || b.volume?.h24 || 0) - Number(a.volume?.h48 || a.volume?.h24 || 0))
      .slice(0, 50); // Take only top 50

    console.log(`Selected top ${sortedPairs.length} pairs by 48h volume`);

    // Simplified validation - just basic checks
    const pairValidations = sortedPairs.map((pair) => {
      const validation = {
        isOnSolana: pair.chainId === 'solana',
        isValidDex: SOLANA_DEXES.includes(pair.dexId.toLowerCase()),
        hasValidTokens: Boolean(pair.baseToken?.address && pair.quoteToken?.address),
        hasMinimalLiquidity: Number(pair.liquidity?.usd || 0) >= VALIDATION_THRESHOLDS.LIQUIDITY.MINIMAL,
        isSuspicious: isSuspiciousToken(pair.baseToken?.symbol || '', pair.quoteToken?.symbol || ''),
        isInfrastructure: isInfrastructureToken(pair.baseToken?.symbol || '', pair.baseToken?.name || ''),
        isValid: false
      };

      // Log why tokens are being filtered out
      if (!validation.isOnSolana) console.log(`❌ ${pair.baseToken?.symbol}: wrong chain`);
      if (!validation.isValidDex) console.log(`❌ ${pair.baseToken?.symbol}: invalid dex ${pair.dexId}`);
      if (!validation.hasValidTokens) console.log(`❌ ${pair.baseToken?.symbol}: missing token addresses`);
      if (!validation.hasMinimalLiquidity) console.log(`❌ ${pair.baseToken?.symbol}: low liquidity $${pair.liquidity?.usd}`);
      if (validation.isSuspicious) console.log(`❌ ${pair.baseToken?.symbol}: suspicious token`);
      if (validation.isInfrastructure) console.log(`❌ ${pair.baseToken?.symbol}: infrastructure token (${pair.baseToken?.name})`);

      // Allow all tokens except suspicious ones (no infrastructure filtering)
      validation.isValid = 
        validation.isOnSolana &&
        validation.isValidDex &&
        validation.hasValidTokens &&
        validation.hasMinimalLiquidity &&
        !validation.isSuspicious;

      if (validation.isValid) {
        const volume48h = Number(pair.volume?.h48 || 0);
        const volume24h = Number(pair.volume?.h24 || 0);
        const displayVolume = volume48h > 0 ? volume48h : volume24h;
        const timeframe = volume48h > 0 ? "48h" : "24h";
        console.log(`✅ ${pair.baseToken?.symbol}: VALID token (${timeframe} volume: $${displayVolume.toLocaleString()})`);
      }

      return {
        pair,
        isValid: validation.isValid,
        score: Number(pair.volume?.h48 || pair.volume?.h24 || 0) // Use 48h volume as score
      };
    });

    // Log validation summary
    const totalPairs = pairValidations.length;
    const validPairCount = pairValidations.filter(r => r.isValid).length;
    console.log(`\nValidation Summary:
      Total Pairs: ${totalPairs}
      Valid Pairs: ${validPairCount}
      Invalid Pairs: ${totalPairs - validPairCount}
    `);

    // Filter valid pairs and deduplicate by base token
    const validPairResults = pairValidations.filter((result) => result.isValid);
    
    // Deduplicate by base token address, keeping the highest volume pair for each token
    const uniqueTokenMap = new Map<string, any>();
    validPairResults.forEach((result) => {
      const tokenAddress = result.pair.baseToken.address;
      const existing = uniqueTokenMap.get(tokenAddress);
      
      if (!existing || result.score > existing.score) {
        uniqueTokenMap.set(tokenAddress, result);
      }
    });
    
    const validPairs = Array.from(uniqueTokenMap.values())
      .sort((a, b) => b.score - a.score) // Sort by volume
      .slice(0, 50) // Keep top 50 unique tokens
      .map((result) => result.pair);
    
    console.log(`After deduplication: ${validPairs.length} unique tokens`);

    // Log final results
    console.log(`\nFinal Results:
      Selected Pairs: ${validPairs.length}
      Top Score: ${pairValidations[0]?.score || 0}
      Bottom Score: ${pairValidations[pairValidations.length - 1]?.score || 0}
    `);

    // Store pairs in database
    console.log("Storing pairs in database...");
    const upsertResults = await Promise.all(
      validPairs.map(async (pair) => {
        try {
          // Get token profile if available
          const tokenProfile = await dexscreener.getTokenProfile(pair.baseToken.address);
          
          // Simplified scoring - just use volume
          const score = Number(pair.volume?.h24 || 0);

          // Convert numeric values to match database schema types
          const data = {
            pairAddress: pair.pairAddress,
            baseTokenAddress: pair.baseToken.address,
            baseTokenName: tokenProfile?.header || pair.baseToken.name || pair.baseToken.symbol,
            baseTokenSymbol: pair.baseToken.symbol,
            quoteTokenAddress: pair.quoteToken.address,
            quoteTokenName: pair.quoteToken.name || pair.quoteToken.symbol,
            quoteTokenSymbol: pair.quoteToken.symbol,
            dexId: pair.dexId,
            // Keep as strings for precision
            priceUsd: pair.priceUsd || "0",
            priceSOL: pair.priceNative || "0",
            // Convert to numbers for database
            liquidity: Number(pair.liquidity?.usd || 0),
            volume24h: Number(pair.volume?.h48 || pair.volume?.h24 || 0), // Use 48h volume
            marketCap: Number(pair.marketCap || 0),
            fdv: Number(pair.fdv || 0),
            priceChange24h: Number(pair.priceChange?.h24 || 0),
            txnCount24h: Number((pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0)),
            // URLs
            tradingViewUrl: pair.tradingViewUrl || `https://www.dexscreener.com/solana/${pair.pairAddress}`,
            dexScreenerUrl: pair.dexScreenerUrl || `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`,
            imageUrl: tokenProfile?.icon || pair.imageUrl || pair.info?.imageUrl,
            // Initialize vote counts
            bullishVotes: 0,
            bearishVotes: 0,
            bullishPercentage: 50
          };

          return await db.cryptoCurrency.upsert({
            where: { pairAddress: pair.pairAddress },
            create: data,
            update: data,
          });
        } catch (error: any) {
          // Log specific error details for Prisma errors
          if (error?.code && typeof error.code === 'string') {
            console.error(`Prisma error upserting pair ${pair.pairAddress}:`, {
              code: error.code,
              message: error.message,
              meta: error.meta,
              clientVersion: error.clientVersion,
            });
          } else {
            console.error(`Failed to upsert pair ${pair.pairAddress}:`, error);
          }
          return null;
        }
      })
    );

    const successfulUpserts = upsertResults.filter(Boolean);
    console.log(`[DEBUG] Successfully stored ${successfulUpserts.length} pairs in database`);

    // Sort pairs by volume for the response
    const sortedResponsePairs = [...validPairs].sort((a, b) => 
      Number(b.volume?.h24 || 0) - Number(a.volume?.h24 || 0)
    );

    // Add caching headers
    const headers = new Headers({
      'Cache-Control': `public, s-maxage=300, stale-while-revalidate=600`,
    });

    return NextResponse.json({
      status: "success",
      databaseCount: await db.cryptoCurrency.count(),
      storedPairs: successfulUpserts.length,
      pairs: sortedResponsePairs.map(pair => ({
        dexId: pair.dexId,
        baseToken: pair.baseToken.symbol,
        quoteToken: pair.quoteToken.symbol,
        volume24h: pair.volume?.h48 || pair.volume?.h24 || 0, // 48h volume
        liquidity: pair.liquidity?.usd || 0,
        priceUsd: pair.priceUsd || "0",
        priceChange24h: pair.priceChange?.h24 || 0,
        isBoosted: false,
        score: Number(pair.volume?.h48 || pair.volume?.h24 || 0)
      })),
    }, { headers });
  } catch (error: any) {
    console.error("Trending sync error:", error);
    if (error?.code && typeof error.code === 'string') {
      console.error("Known Prisma error:", {
        code: error.code,
        message: error.message,
        clientVersion: error.clientVersion,
      });
      return new NextResponse(`Prisma error: ${error.message}`, { status: 500 });
    } else if (error?.message && error.message.includes('validation')) {
      console.error("Validation error:", error.message);
      return new NextResponse(`Validation error: ${error.message}`, { status: 400 });
    } else if (error?.message) {
      console.error("General error:", error.message);
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
} 