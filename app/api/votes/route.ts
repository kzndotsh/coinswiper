import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const voteSchema = z.object({
  cryptoCurrencyId: z.string().uuid(),
  voteType: z.enum(["BULLISH", "BEARISH"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cryptoCurrencyId, voteType } = voteSchema.parse(body);

    const updatedCrypto = await db.cryptoCurrency.update({
      where: {
        id: cryptoCurrencyId,
      },
      data: {
        [voteType === "BULLISH" ? "bullishVotes" : "bearishVotes"]: {
          increment: 1,
        },
      },
    });

    // Calculate new bullish percentage
    const totalVotes = updatedCrypto.bullishVotes + updatedCrypto.bearishVotes;
    const bullishPercentage = totalVotes > 0 
      ? (updatedCrypto.bullishVotes / totalVotes) * 100 
      : 50;

    // Update bullish percentage
    const finalCrypto = await db.cryptoCurrency.update({
      where: {
        id: cryptoCurrencyId,
      },
      data: {
        bullishPercentage,
      },
    });

    return NextResponse.json(finalCrypto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }
    
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cryptoCurrencyId = searchParams.get("cryptoCurrencyId");

    if (!cryptoCurrencyId) {
      return new NextResponse("Missing cryptoCurrencyId", { status: 400 });
    }

    const crypto = await db.cryptoCurrency.findUnique({
      where: {
        id: cryptoCurrencyId,
      },
      select: {
        bullishVotes: true,
        bearishVotes: true,
        bullishPercentage: true,
      },
    });

    return NextResponse.json(crypto);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
} 