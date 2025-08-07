import "./globals.css";
import { db } from "@/lib/db";
import { inter, helvetica } from './fonts'

export const metadata = {
  title: "CoinSwiper",
  description: "Vote on your favorite cryptocurrencies",
};

async function initializeIfNeeded() {
  console.log("[DEBUG] initializeIfNeeded called")
  try {
    const count = await db.cryptoCurrency.count();
    console.log(`[DEBUG] DB has ${count} crypto currencies`)
    
    if (count === 0) {
      console.log("[DEBUG] No data found, triggering initial sync...");
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      console.log(`[DEBUG] Calling sync API at: ${baseUrl}/api/sync/trending`)
      
      const response = await fetch(`${baseUrl}/api/sync/trending`, {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("[DEBUG] Failed to sync:", await response.text());
      } else {
        console.log("[DEBUG] Initial sync completed successfully")
      }
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