import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VALIDATION_THRESHOLDS } from "@/lib/config/filters";

// Cache for 5 minutes
const CACHE_MAX_AGE = VALIDATION_THRESHOLDS.CACHE.MAX_AGE;
const CACHE_STALE = VALIDATION_THRESHOLDS.CACHE.STALE_WHILE_REVALIDATE;

export async function GET(request: Request) {
  console.log("[DEBUG] /api/tokens/trending called")
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "volume24h";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const offset = (page - 1) * limit;
    console.log(`[DEBUG] Query params: sortBy=${sortBy}, sortOrder=${sortOrder}, limit=${limit}, page=${page}`);

    // Get total count and data in parallel
    console.log(`[DEBUG] Querying DB with min liquidity: ${VALIDATION_THRESHOLDS.LIQUIDITY.MINIMAL}`)
    const [total, tokens] = await Promise.all([
      db.cryptoCurrency.count({
        where: {
          liquidity: { gte: VALIDATION_THRESHOLDS.LIQUIDITY.MINIMAL }
        }
      }),
      db.cryptoCurrency.findMany({
        where: {
          liquidity: { gte: VALIDATION_THRESHOLDS.LIQUIDITY.MINIMAL }
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit,
        skip: offset,
        select: {
          id: true,
          baseTokenName: true,
          baseTokenSymbol: true,
          baseTokenAddress: true,
          quoteTokenAddress: true,
          pairAddress: true,
          dexId: true,
          priceUsd: true,
          priceSOL: true,
          liquidity: true,
          volume24h: true,
          marketCap: true,
          fdv: true,
          priceChange24h: true,
          txnCount24h: true,
          tradingViewUrl: true,
          dexScreenerUrl: true,
          imageUrl: true,
          bullishVotes: true,
          bearishVotes: true,
          bullishPercentage: true,
          createdAt: true,
        }
      })
    ]);

    console.log(`[DEBUG] DB query results: total=${total}, tokens fetched=${tokens.length}`)
    const totalPages = Math.ceil(total / limit);

    // Add cache headers
    const headers = new Headers({
      'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE}`,
    });

    return NextResponse.json({
      status: "success",
      data: tokens,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      debug: {
        filteredTokens: tokens.length,
      }
    }, { headers });
  } catch (error) {
    console.error("[DEBUG] Error fetching trending tokens:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 