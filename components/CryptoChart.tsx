"use client"

import { useEffect, useRef } from "react"

interface CryptoChartProps {
  symbol: string
}

declare global {
  interface Window {
    TradingView: any
  }
}

export default function CryptoChart({ symbol }: CryptoChartProps) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    script.onload = () => {
      if (container.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0D0D0D",
          enable_publishing: false,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          container_id: container.current.id,
          hide_volume: true,
          backgroundColor: "#0D0D0D",
          gridColor: "#1E1E1E",
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [symbol])

  return <div id={`tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, "")}`} ref={container} className="h-full w-full" />
}

