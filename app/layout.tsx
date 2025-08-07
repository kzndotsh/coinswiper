import "./globals.css";
import { db } from "@/lib/db";
import { inter, helvetica } from './fonts'

export const metadata = {
  title: "CoinSwiper - Vote on Top Crypto Tokens",
  description: "Discover and vote on the top 50 trending cryptocurrency tokens by volume. Real-time charts, community sentiment, and live voting on Solana tokens.",
  keywords: "cryptocurrency, crypto voting, solana tokens, trending crypto, dex tokens, crypto sentiment",
  authors: [{ name: "CoinSwiper" }],
  robots: "index, follow",
  openGraph: {
    title: "CoinSwiper - Vote on Top Crypto Tokens",
    description: "Discover and vote on the top 50 trending cryptocurrency tokens by volume",
    type: "website",
    siteName: "CoinSwiper",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoinSwiper - Vote on Top Crypto Tokens",
    description: "Discover and vote on the top 50 trending cryptocurrency tokens by volume",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

async function initializeIfNeeded() {
  console.log("[DEBUG] initializeIfNeeded called")
  try {
    const count = await db.cryptoCurrency.count();
    console.log(`[DEBUG] DB has ${count} crypto currencies`)
    
    // Get the timestamp of the most recent token
    const lastUpdated = await db.cryptoCurrency.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });
    
    const shouldSync = count < 30 || // Always sync if we have fewer than 30 tokens
      !lastUpdated || 
      Date.now() - lastUpdated.updatedAt.getTime() > 15 * 60 * 1000; // 15 minutes
    
    if (shouldSync) {
      console.log("[DEBUG] Triggering background sync...");
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      
      // Don't await - let it run in background
      fetch(`${baseUrl}/api/sync/trending`, {
        method: "POST",
        cache: "no-store",
      }).then(response => {
        if (response.ok) {
          console.log("[DEBUG] Background sync completed successfully")
        } else {
          console.error("[DEBUG] Background sync failed")
        }
      }).catch(error => {
        console.error("[DEBUG] Background sync error:", error)
      });
    } else {
      console.log("[DEBUG] Data is recent, skipping sync")
    }
  } catch (error) {
    console.error("[DEBUG] Error in initializeIfNeeded:", error)
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("[DEBUG] RootLayout rendering")
  await initializeIfNeeded();
  console.log("[DEBUG] RootLayout initialization complete")

  return (
    <html lang="en" className={`${inter.variable} ${helvetica.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

import './globals.css'