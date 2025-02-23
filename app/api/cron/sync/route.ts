import { NextResponse } from "next/server";
import { headers } from "next/headers";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  try {
    // Verify cron secret if set
    if (CRON_SECRET) {
      const headersList = headers();
      const authHeader = (await headersList).get("authorization");
      if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // Trigger sync
    const response = await fetch(new URL("/api/sync/trending", req.url), {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron sync error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Set headers for Vercel Cron
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes timeout 