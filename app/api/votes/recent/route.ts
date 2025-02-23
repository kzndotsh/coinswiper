import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VALIDATION_THRESHOLDS } from "@/lib/config/filters";

// Cache for 1 minute
const CACHE_MAX_AGE = 60;
const CACHE_STALE = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    // Get recent votes with their associated crypto data
    const recentVotes = await db.cryptoCurrency.findMany({
      where: {
        OR: [
          { bullishVotes: { gt: 0 } },
          { bearishVotes: { gt: 0 } }
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        baseTokenName: true,
        baseTokenSymbol: true,
        imageUrl: true,
        bullishVotes: true,
        bearishVotes: true,
        bullishPercentage: true,
        updatedAt: true,
      }
    });

    // Add cache headers
    const headers = new Headers({
      'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE}`,
    });

    return NextResponse.json({
      status: "success",
      data: recentVotes,
    }, { headers });
  } catch (error) {
    console.error("Error fetching recent votes:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 