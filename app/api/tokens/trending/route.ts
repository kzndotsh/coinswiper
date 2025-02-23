import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VALIDATION_THRESHOLDS } from "@/lib/config/filters";

// Cache for 5 minutes
const CACHE_MAX_AGE = VALIDATION_THRESHOLDS.CACHE.MAX_AGE;
const CACHE_STALE = VALIDATION_THRESHOLDS.CACHE.STALE_WHILE_REVALIDATE;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "volume24h";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const offset = (page - 1) * limit;

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get total count and data in parallel
    const [total, tokens] = await Promise.all([
      db.cryptoCurrency.count({
        where: {
          createdAt: { gte: twentyFourHoursAgo },
          liquidity: { gte: VALIDATION_THRESHOLDS.LIQUIDITY.MINIMAL }
        }
      }),
      db.cryptoCurrency.findMany({
        where: {
          createdAt: { gte: twentyFourHoursAgo },
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
        cutoffTime: twentyFourHoursAgo.toISOString(),
        filteredTokens: tokens.length,
      }
    }, { headers });
  } catch (error) {
    console.error("Error fetching trending tokens:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 