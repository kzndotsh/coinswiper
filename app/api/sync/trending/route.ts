import { NextResponse } from "next/server";
import { dexscreener } from "@/lib/dexscreener";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { ExtendedPair } from "@/types/dexscreener";
import {
  SOLANA_DEXES,
  VALIDATION_THRESHOLDS,
  ValidationResult,
  isSuspiciousToken,
  calculatePairScore,
  DEX_CONFIG,
  isNewEnough,
} from "@/lib/config/filters";

export async function POST() {
  try {
    console.log("Starting sync process...");
    
    // Test database connection
    let count = 0;
    try {
      count = await db.cryptoCurrency.count();
      console.log(`Current number of tokens in database: ${count}`);
    } catch (error) {
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

    // Search for trending pairs from each DEX
    console.log("Fetching trending pairs...");
    const allPairs: ExtendedPair[] = [];
    
    // Get trending pairs by volume
    console.log("Fetching trending pairs from Solana...");
    const trendingPairs = await dexscreener.getTrendingPairs();
    console.log(`Found ${trendingPairs.length} trending pairs`);
    allPairs.push(...trendingPairs);

    // Get new pairs by creation date
    console.log("Fetching new pairs from Solana...");
    const newPairs = await dexscreener.getNewPairs();
    console.log(`Found ${newPairs.length} new pairs`);
    allPairs.push(...newPairs);

    // Search for pairs from each DEX
    for (const dex of SOLANA_DEXES) {
      console.log(`\nFetching pairs from ${dex}...`);
      const dexPairs = await dexscreener.searchPairs(dex);
      console.log(`Found ${dexPairs.length} pairs on ${dex}`);
      allPairs.push(...dexPairs);
    }

    // Get token boosts to prioritize promoted tokens
    const boostedTokens = await dexscreener.getTokenBoosts();
    const boostedAddresses = new Set(boostedTokens.map(boost => boost.tokenAddress));
    
    // Deduplicate pairs by pairAddress
    const uniquePairs = Array.from(
      new Map(allPairs.map(pair => [pair.pairAddress, pair])).values()
    );
    
    console.log(`Found ${uniquePairs.length} total unique pairs before validation`);

    // First pass: Group pairs by baseToken symbol and dexId
    const pairsBySymbolAndDex = new Map<string, ExtendedPair[]>();
    uniquePairs.forEach(pair => {
      const key = `${pair.baseToken?.symbol}-${pair.dexId}`;
      const existing = pairsBySymbolAndDex.get(key) || [];
      existing.push(pair);
      pairsBySymbolAndDex.set(key, existing);
    });

    // Keep only the highest liquidity pair for each symbol-dex combination
    const dedupedPairs = Array.from(pairsBySymbolAndDex.values()).map(pairs => 
      pairs.reduce((highest, current) => 
        (current.liquidity?.usd || 0) > (highest.liquidity?.usd || 0) ? current : highest
      )
    );

    console.log(`Found ${dedupedPairs.length} pairs after deduplication`);

    // Validate pairs
    const pairValidations = dedupedPairs.map((pair) => {
      // Validate the pair
      const validation = {
        isOnSolana: pair.chainId === 'solana',
        isValidDex: SOLANA_DEXES.includes(pair.dexId.toLowerCase()),
        hasValidTokens: Boolean(pair.baseToken?.address && pair.quoteToken?.address),
        hasMinimalLiquidity: Number(pair.liquidity?.usd || 0) >= VALIDATION_THRESHOLDS.LIQUIDITY.MINIMAL,
        isNew: isNewEnough(new Date(Number(pair.pairCreatedAt)), pair.dexId),
        isSuspicious: isSuspiciousToken(pair.baseToken?.symbol || '', pair.quoteToken?.symbol || ''),
        isTokenBoosted: false, // Will be set later
        isValid: false, // Will be set after all checks
        liquidity: Number(pair.liquidity?.usd || 0),
        createdAt: Number(pair.pairCreatedAt)
      };

      // Log validation details
      console.log(`Validating pair ${pair.baseToken?.symbol}/${pair.quoteToken?.symbol} on ${pair.dexId}:`, {
        ...validation,
        createdAt: new Date(validation.createdAt).toISOString()
      });

      // Get token boost status
      const isTokenBoosted = boostedTokens.some(
        (token) => token.tokenAddress === pair.baseToken?.address
      );

      // A pair is valid if:
      // 1. It's on Solana
      // 2. It's from a valid DEX
      // 3. Has valid tokens
      // 4. Has minimal liquidity
      // 5. Is not suspicious
      // 6. Is either new OR boosted
      validation.isTokenBoosted = isTokenBoosted;
      validation.isValid = 
        validation.isOnSolana &&
        validation.isValidDex &&
        validation.hasValidTokens &&
        validation.hasMinimalLiquidity &&
        !validation.isSuspicious &&
        (validation.isNew || validation.isTokenBoosted);

      return {
        pair,
        isValid: validation.isValid,
        creationDate: new Date(validation.createdAt),
        score: calculatePairScore({
          volume24h: Number(pair.volume?.h24 || 0),
          liquidityUsd: Number(pair.liquidity?.usd || 0),
          txCount24h: Number((pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0)),
          priceChange24h: Number(pair.priceChange?.h24 || 0),
          isBoosted: validation.isTokenBoosted
        })
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

    // Filter valid pairs and sort by score
    const validPairs = pairValidations
      .filter((result) => result.isValid)
      .sort((a, b) => b.score - a.score)
      .slice(0, VALIDATION_THRESHOLDS.LIMITS.MAX_PAIRS)
      .map((result) => result.pair);

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
            volume24h: Number(pair.volume?.h24 || 0),
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
            bullishPercentage: 50,
          };

          return await db.cryptoCurrency.upsert({
            where: { pairAddress: pair.pairAddress },
            create: data,
            update: data,
          });
        } catch (error) {
          console.error(`Failed to upsert pair ${pair.pairAddress}:`, error);
          return null;
        }
      })
    );

    const successfulUpserts = upsertResults.filter(Boolean);
    console.log(`Successfully stored ${successfulUpserts.length} pairs in database`);

    // Sort pairs by volume for the response
    const sortedResponsePairs = [...validPairs].sort((a, b) => 
      Number(b.volume?.h24 || 0) - Number(a.volume?.h24 || 0)
    );

    // Add caching headers
    const headers = new Headers({
      'Cache-Control': `public, s-maxage=${VALIDATION_THRESHOLDS.CACHE.MAX_AGE}, stale-while-revalidate=${VALIDATION_THRESHOLDS.CACHE.STALE_WHILE_REVALIDATE}`,
    });

    return NextResponse.json({
      status: "success",
      databaseCount: await db.cryptoCurrency.count(),
      storedPairs: successfulUpserts.length,
      pairs: sortedResponsePairs.map(pair => ({
        dexId: pair.dexId,
        baseToken: pair.baseToken.symbol,
        quoteToken: pair.quoteToken.symbol,
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        priceUsd: pair.priceUsd || "0",
        priceChange24h: pair.priceChange?.h24 || 0,
        isBoosted: boostedAddresses.has(pair.baseToken.address)
      })),
    }, { headers });
  } catch (error) {
    console.error("Trending sync error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Known Prisma error:", {
        code: error.code,
        message: error.message,
        clientVersion: error.clientVersion,
      });
      return new NextResponse(`Prisma error: ${error.message}`, { status: 500 });
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      console.error("Validation error:", error.message);
      return new NextResponse(`Validation error: ${error.message}`, { status: 400 });
    } else if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
} 