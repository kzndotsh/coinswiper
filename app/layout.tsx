import type React from "react"
import { Fragment_Mono } from "next/font/google"
import "./globals.css"

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fragment-mono",
})

export const metadata = {
  title: "Coinswiper",
  description: "Cryptocurrency rating platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fragmentMono.className}>
      <body>{children}</body>
    </html>
  )
}



import './globals.css'