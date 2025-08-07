"use client"

import { useState } from "react"
import { ActivityBar } from "@/components/ActivityBar"
import { Leaderboard } from "@/components/Leaderboard"
import { TokenInfo } from "@/components/TokenInfo"
import { TokenDetails } from "@/components/TokenDetails"
import { useTokenVoting } from "@/hooks/useTokenVoting"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { useAutoSync } from "@/hooks/useAutoSync"

export default function Home() {
  console.log("[DEBUG] Home component rendering")
  const [leaderboardView, setLeaderboardView] = useState<"bullish" | "bearish">("bullish")
  
  // Auto-sync every 15 minutes
  useAutoSync(15)
  
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
    error,
    setCurrentCrypto,
    onVote,
    onRedo,
    onSkip,
    fetchTokens,
  } = useTokenVoting();

  console.log("[DEBUG] Hook data:", { 
    currentCrypto: currentCrypto?.name || "null", 
    leaderboardLength: leaderboard?.length || 0,
    isLoading,
    hasMore,
    page
  })

  const observerRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: () => {
      const nextPage = page + 1;
      fetchTokens(nextPage);
    },
  });

  if (isLoading) {
    console.log("[DEBUG] Loading state, showing loading component")
    return (
      <div className="h-dvh bg-[#080709] px-2.5 pb-1.25 flex flex-col space-y-2.5 pt-3.5 overflow-hidden font-mono">
        <div className="w-full h-16 bg-[#1A181C] border border-[#2A272E] overflow-hidden animate-pulse">
          <div className="h-full flex items-center px-2.5">
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[52px] bg-[#131314] rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-2.5 h-[calc(100vh-104px)]">
          <div className="flex flex-col space-y-2.5 h-full">
            <div className="w-full h-[72px] bg-[#1A181C] border border-[#2A272E] animate-pulse">
              <div className="h-full flex items-center px-4">
                <div className="w-10 h-10 bg-[#2A272E] rounded-lg" />
                <div className="ml-4 flex-1">
                  <div className="h-4 w-24 bg-[#2A272E] rounded" />
                  <div className="h-3 w-16 bg-[#2A272E] rounded mt-2" />
                </div>
              </div>
            </div>
            <div className="w-full bg-[#1A181C] border border-[#2A272E] grow animate-pulse">
              <div className="grid grid-cols-2">
                <div className="h-12 bg-[#1A181C] border-b border-[#2A272E]" />
                <div className="h-12 bg-[#131314] border-b border-[#2A272E]" />
              </div>
              <div className="p-2.5 space-y-1.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[52px] bg-[#131314] rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="w-full h-full bg-[#1A181C] border border-[#2A272E] flex items-center justify-center">
            <div className="text-[#4A484C] text-sm">Loading tokens...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    console.log("[DEBUG] Error state, showing error message:", error)
    return (
      <div className="h-dvh bg-[#080709] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[#FF1654] text-xl font-bold mb-4">Failed to load tokens</h2>
          <p className="text-[#4A484C] mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#D9FF00] text-black px-6 py-3 rounded-full font-bold hover:bg-[#D9FF00]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentCrypto && !isLoading && !error) {
    console.log("[DEBUG] No tokens available, showing empty state")
    return (
      <div className="h-dvh bg-[#080709] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[#F5F5F5] text-xl font-bold mb-4">No tokens available</h2>
          <p className="text-[#4A484C] mb-6">Try refreshing the page to load tokens</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#D9FF00] text-black px-6 py-3 rounded-full font-bold hover:bg-[#D9FF00]/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="h-dvh bg-[#080709] flex flex-col overflow-hidden font-mono">
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

