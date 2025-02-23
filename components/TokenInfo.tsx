import { Copy, Check, LineChart, Twitter } from "lucide-react";
import { useState } from "react";

// Fixed $SWIPE token data
const SWIPE_TOKEN = {
  name: "COINSWIPER",
  symbol: "SWIPE",
  address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  marketCap: "$48.2K",
  volume24h: "$2.5M",
  logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b8jKsRdpMrlGP6jNSXj0Dm5mUDI84z.png"
};

export function TokenInfo() {
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(SWIPE_TOKEN.address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  return (
    <div
      className="w-full bg-[#1A181C] border border-[#2A272E] p-2.5 flex-shrink-0 space-y-2.5"
      aria-label="Coin Information"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 bg-[#1A181C] rounded-full overflow-hidden flex-shrink-0">
          <img
            src={SWIPE_TOKEN.logo}
            alt="Coinswiper logo"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[#F5F5F5] font-bold">{SWIPE_TOKEN.name}</span>
            <span className="text-gray-400">${SWIPE_TOKEN.symbol}</span>
          </div>
          <div className="text-[#D9FF00] text-sm font-medium">{SWIPE_TOKEN.address.slice(0, 10)}...</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 bg-[#131314] border border-[#2A272E] rounded-lg p-3">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-xs">MARKET CAP</div>
          <div className="text-[#F5F5F5] font-medium">{SWIPE_TOKEN.marketCap}</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-xs">VOLUME (24H)</div>
          <div className="text-[#F5F5F5] font-medium">{SWIPE_TOKEN.volume24h}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3">
        <button
          onClick={onCopy}
          className={`flex items-center justify-center gap-2 bg-[#131314] hover:bg-[#1A181C] text-[#F5F5F5] py-2.5 rounded-lg text-sm border border-[#2A272E] transition-colors bullish-vote-animation ${
            isCopied ? "active" : ""
          }`}
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4 text-[#D9FF00]" />
              <span className="text-[#D9FF00]">COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              COPY CA
            </>
          )}
        </button>
        <a 
          href={`https://dexscreener.com/solana/${SWIPE_TOKEN.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#131314] hover:bg-[#1A181C] text-[#F5F5F5] py-2.5 rounded-lg text-sm border border-[#2A272E] transition-colors"
        >
          <LineChart className="h-4 w-4 text-[#4A484C]" />
          CHARTS
        </a>
        <a 
          href="https://twitter.com/coinswiper"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#131314] hover:bg-[#1A181C] text-[#F5F5F5] py-2.5 rounded-lg text-sm border border-[#2A272E] transition-colors"
        >
          <Twitter className="h-4 w-4 text-[#4A484C]" />
          TWITTER
        </a>
      </div>
    </div>
  );
} 