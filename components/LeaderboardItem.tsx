import { ArrowUpRight, ArrowDown } from "lucide-react";
import type { CryptoCurrency } from "@/types";
import { useState } from "react";
import Image from "next/image";

interface LeaderboardItemProps {
  crypto: CryptoCurrency;
  index: number;
  isSelected: boolean;
  lastVotedId: string | null;
  onSelect: (crypto: CryptoCurrency) => void;
  view: "bullish" | "bearish";
}

export function LeaderboardItem({
  crypto,
  index,
  isSelected,
  lastVotedId,
  onSelect,
  view,
}: LeaderboardItemProps) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = !imageError && crypto.logo ? crypto.logo : "/placeholder.svg";
  const isDataUrl = imageUrl.startsWith('data:');

  return (
    <div
      className={`bg-[#131314] rounded-lg h-[52px] flex items-center border border-[#2A272E] bullish-vote-animation cursor-pointer hover:bg-[#1A181C] transition-colors ${
        lastVotedId === crypto.id ? "active" : ""
      } ${isSelected ? "border-[#D9FF00]" : ""}`}
      onClick={() => onSelect(crypto)}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 pl-2 w-[240px] shrink-0">
        {/* Rank */}
        <div className="text-gray-500 font-medium w-[28px] text-center shrink-0">{`#${index + 1}`}</div>

        {/* Profile Picture */}
        <div className="w-8 h-8 bg-[#1A181C] rounded-lg overflow-hidden relative shrink-0">
          <Image
            src={imageUrl}
            alt={`${crypto.name || 'Token'} logo`}
            width={32}
            height={32}
            className="object-cover object-center"
            priority={index < 5}
            onError={() => setImageError(true)}
            unoptimized={isDataUrl}
            loading={index < 10 ? "eager" : "lazy"}
            sizes="32px"
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Token Info */}
        <div className="min-w-0 flex flex-col justify-center grow">
          <div className="text-[#F5F5F5] font-medium truncate text-sm">{crypto.name}</div>
          <div className="text-gray-500 text-xs truncate">{crypto.symbol}</div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 ml-auto pr-2">
        {/* Vote Statistics */}
        <div className="flex items-center gap-1 font-helvetica-bold">
          <span className="text-[#D9FF00]">{crypto.bullishVotes}</span>
          <span className="text-gray-500 mx-1">/</span>
          <span className="text-[#FF1654]">{crypto.bearishVotes}</span>
        </div>

        {/* Percentage Badge */}
        <div
          className={`inline-flex items-center gap-0.5 ${
            view === "bullish" ? "bg-[#D9FF00] text-black" : "bg-[#FF1654] text-white"
          } font-helvetica-bold text-sm px-2 py-1 rounded-full`}
        >
          {view === "bullish" ? crypto.bullishPercentage : 100 - crypto.bullishPercentage}%
          {view === "bullish" ? (
            <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.3} />
          ) : (
            <ArrowDown className="h-4 w-4 shrink-0" strokeWidth={2.3} />
          )}
        </div>
      </div>
    </div>
  );
} 