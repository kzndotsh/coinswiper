import type { CryptoCurrency } from "@/types";
import { LeaderboardItem } from "./LeaderboardItem";
import { useMemo } from 'react';

interface LeaderboardProps {
  tokens: CryptoCurrency[];
  currentCrypto: CryptoCurrency | null;
  lastVotedId: string | null;
  view: "bullish" | "bearish";
  onSelectCrypto: (crypto: CryptoCurrency) => void;
  onViewChange: (view: "bullish" | "bearish") => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  observerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export function Leaderboard({
  tokens,
  currentCrypto,
  lastVotedId,
  view,
  onSelectCrypto,
  onViewChange,
  isLoadingMore,
  hasMore,
  observerRef,
}: LeaderboardProps) {
  const sortedTokens = useMemo(() => 
    view === "bullish"
      ? [...tokens].sort((a, b) => b.bullishPercentage - a.bullishPercentage)
      : [...tokens].sort((a, b) => a.bullishPercentage - b.bullishPercentage),
    [tokens, view]
  );

  const bullishButtonClass = useMemo(() => 
    `py-3 text-sm font-medium transition-colors ${
      view === "bullish"
        ? "bg-[#1A181C] text-[#F5F5F5]"
        : "bg-[#2A272E] text-gray-500 hover:text-gray-400"
    }`,
    [view]
  );

  const bearishButtonClass = useMemo(() => 
    `py-3 text-sm font-medium transition-colors ${
      view === "bearish"
        ? "bg-[#1A181C] text-[#F5F5F5]"
        : "bg-[#131314] text-gray-500 hover:text-gray-400"
    }`,
    [view]
  );

  return (
    <div
      className="w-full bg-[#1A181C] border border-[#2A272E] overflow-hidden grow flex flex-col"
      aria-label="Leaderboard"
    >
      {/* Header Tabs */}
      <div className="grid grid-cols-2">
        <button
          className={bullishButtonClass}
          onClick={() => onViewChange("bullish")}
        >
          TOP BULLISH
        </button>
        <button
          className={bearishButtonClass}
          onClick={() => onViewChange("bearish")}
        >
          TOP BEARISH
        </button>
      </div>

      {/* List */}
      <div className="grow px-2 pb-0 pt-2.5 overflow-y-auto no-scrollbar">
        <div className="space-y-[5px]">
          {sortedTokens.map((crypto, index) => (
            <LeaderboardItem
              key={`${crypto.id}-${index}`}
              crypto={crypto}
              index={index}
              isSelected={currentCrypto?.id === crypto.id}
              lastVotedId={lastVotedId}
              onSelect={onSelectCrypto}
              view={view}
            />
          ))}
          
          {/* Loading indicator and observer */}
          <div 
            ref={observerRef} 
            className="py-4 text-center flex items-center justify-center"
            style={{ minHeight: '100px' }}
          >
            {isLoadingMore ? (
              <div className="text-gray-400 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#D9FF00] border-t-transparent"></div>
                Loading more tokens...
              </div>
            ) : hasMore ? (
              <div className="h-4" /> // Spacer for observer
            ) : (
              <div className="text-gray-400 text-sm py-2">No more tokens to load</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 