import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: Request) {
  try {
    // Verify cron secret
    if (CRON_SECRET) {
      const headersList = headers();
      const authHeader = (await headersList).get("authorization");
      if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // Clear all records
    const deletedCount = await db.cryptoCurrency.deleteMany({});
    
    console.log(`Cleared database. Deleted ${deletedCount.count} records.`);

    return NextResponse.json({
      status: "success",
      deletedCount: deletedCount.count
    });
  } catch (error) {
    console.error("Database clear error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 