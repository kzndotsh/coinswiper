import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Cache for 5 minutes
const CACHE_MAX_AGE = 300;
const CACHE_STALE = 600;

export async function GET(request: Request) {
  console.log("[DEBUG] /api/tokens/trending called")
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate and sanitize query parameters
    const rawLimit = searchParams.get("limit");
    const rawPage = searchParams.get("page");
    
    const limit = rawLimit 
      ? Math.min(Math.max(parseInt(rawLimit, 10), 1), 50) // Min 1, max 50
      : 50;
      
    const page = rawPage 
      ? Math.max(parseInt(rawPage, 10), 1) // Min 1
      : 1;
    
    if (isNaN(limit) || isNaN(page)) {
      return new NextResponse("Invalid query parameters", { status: 400 });
    }
    
    const offset = (page - 1) * limit;
    console.log(`[DEBUG] Query params: limit=${limit}, page=${page}`);

    // Simplified: just get tokens ordered by volume (top performing)
    console.log(`[DEBUG] Querying DB for top tokens by volume`)
    const [total, tokens] = await Promise.all([
      db.cryptoCurrency.count({
        where: {
          liquidity: { gte: 1000 } // Minimum $1000 liquidity
        }
      }),
      db.cryptoCurrency.findMany({
        where: {
          liquidity: { gte: 1000 } // Minimum $1000 liquidity
        },
        orderBy: {
          volume24h: 'desc', // Always sort by volume descending
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
        sortedBy: "volume24h_desc"
      }
    }, { headers });
  } catch (error: any) {
    console.error("[DEBUG] Error fetching trending tokens:", error);
    
    // Handle specific database errors
    if (error?.code === 'P2002') {
      return new NextResponse("Database constraint error", { status: 409 });
    }
    
    if (error?.code === 'P2025') {
      return new NextResponse("Record not found", { status: 404 });
    }
    
    // Generic server error
    return new NextResponse("Failed to fetch tokens", { status: 500 });
  }
} 