"use client"

import { useState } from "react"
import { ActivityBar } from "@/components/ActivityBar"
import { Leaderboard } from "@/components/Leaderboard"
import { TokenInfo } from "@/components/TokenInfo"
import { TokenDetails } from "@/components/TokenDetails"
import { useTokenVoting } from "@/hooks/useTokenVoting"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

export default function Home() {
  const [leaderboardView, setLeaderboardView] = useState<"bullish" | "bearish">("bullish")
  
  const {
    currentCrypto,
    leaderboard,
    recentRatings,
    lastVotedId,
    ratingHistory,
    isLoading,
    hasMore,
    isLoadingMore,
    page,
    setCurrentCrypto,
    onVote,
    onRedo,
    onSkip,
    fetchTokens,
  } = useTokenVoting();

  const observerRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: () => {
      const nextPage = page + 1;
      fetchTokens(nextPage);
    },
  });

  if (!currentCrypto) return null;

  return (
    <main className="h-[100dvh] bg-[#080709] flex flex-col overflow-hidden font-mono">
      <div className="px-2.5 pt-3.5 pb-2.5">
        <ActivityBar recentRatings={recentRatings} />
      </div>

      <div className="flex-1 min-h-0 px-2.5 pb-1.25">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-2.5 h-full">
          <div className="flex flex-col space-y-2.5 h-full overflow-hidden">
            <TokenInfo />
            <Leaderboard
              tokens={leaderboard}
              currentCrypto={currentCrypto}
              lastVotedId={lastVotedId}
              view={leaderboardView}
              onSelectCrypto={setCurrentCrypto}
              onViewChange={setLeaderboardView}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              observerRef={observerRef}
            />
          </div>

          <TokenDetails
            crypto={currentCrypto}
            onVote={onVote}
            onSkip={onSkip}
            onRedo={onRedo}
            canRedo={ratingHistory.length > 0}
          />
        </div>
      </div>
      <style jsx global>{`
        @keyframes scaleUp {
          to {
            transform: scale(1.05);
          }
        }
        .hover\:scale-105:hover {
          animation: scaleUp 200ms ease-out forwards;
        }
      `}</style>
    </main>
  );
}

