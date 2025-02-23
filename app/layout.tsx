import "./globals.css";
import { db } from "@/lib/db";
import { inter, helvetica } from './fonts'

export const metadata = {
  title: "CoinSwiper",
  description: "Vote on your favorite cryptocurrencies",
};

async function initializeIfNeeded() {
  const count = await db.cryptoCurrency.count();
  
  if (count === 0) {
    console.log("No data found, triggering initial sync...");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/sync/trending`, {
      method: "POST",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to sync:", await response.text());
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initializeIfNeeded();

  return (
    <html lang="en" className={`${inter.variable} ${helvetica.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

import './globals.css'