import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  // Pagination
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  
  // Sorting
  sortBy: z.enum([
    "liquidity",
    "volume24h",
    "priceChange24h",
    "marketCap",
    "fdv",
    "txnCount24h",
    "bullishPercentage",
    "priceUsd"
  ]).default("liquidity"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  
  // Filtering
  search: z.string().optional(),
  minLiquidity: z.coerce.number().optional(),
  minVolume: z.coerce.number().optional(),
  dex: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    // Build where clause
    const where: any = {};

    // Add search filter
    if (params.search) {
      where.OR = [
        { baseTokenName: { contains: params.search, mode: "insensitive" } },
        { baseTokenSymbol: { contains: params.search, mode: "insensitive" } },
      ];
    }

    // Add liquidity filter
    if (params.minLiquidity) {
      where.liquidity = { gte: params.minLiquidity };
    }

    // Add volume filter
    if (params.minVolume) {
      where.volume24h = { gte: params.minVolume };
    }

    // Add DEX filter
    if (params.dex) {
      where.dexId = params.dex;
    }

    // Calculate pagination
    const skip = (params.page - 1) * params.limit;

    // Get total count for pagination
    const total = await db.cryptoCurrency.count({ where });

    // Get paginated and sorted data
    const tokens = await db.cryptoCurrency.findMany({
      where,
      orderBy: {
        [params.sortBy]: params.sortOrder,
      },
      skip,
      take: params.limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / params.limit);
    const hasNextPage = params.page < totalPages;
    const hasPrevPage = params.page > 1;

    return NextResponse.json({
      status: "success",
      data: tokens,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search: params.search,
        minLiquidity: params.minLiquidity,
        minVolume: params.minVolume,
        dex: params.dex,
      },
      sorting: {
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        status: "error",
        message: "Invalid query parameters",
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      status: "error",
      message: "Internal server error",
    }, { status: 500 });
  }
} 