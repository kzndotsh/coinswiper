import { useState, useCallback, useEffect } from "react";
import type { CryptoCurrency } from "@/types";
import { transformToken } from "@/lib/utils";

export function useTokenVoting() {
  console.log("[DEBUG] useTokenVoting hook initializing")
  const [tokens, setTokens] = useState<CryptoCurrency[]>([]);
  const [currentCrypto, setCurrentCrypto] = useState<CryptoCurrency | null>(null);
  const [leaderboard, setLeaderboard] = useState<CryptoCurrency[]>([]);
  const [recentRatings, setRecentRatings] = useState<CryptoCurrency[]>([]);
  const [ratingHistory, setRatingHistory] = useState<Array<{ crypto: CryptoCurrency; rating: boolean }>>([]);
  const [lastVotedId, setLastVotedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchTokens = useCallback(async (pageNum: number, isInitial = false) => {
    console.log(`[DEBUG] fetchTokens called - page: ${pageNum}, isInitial: ${isInitial}`)
    try {
      setIsLoadingMore(!isInitial);
      const response = await fetch(`/api/tokens/trending?sortBy=volume24h&sortOrder=desc&limit=30&page=${pageNum}`);
      console.log(`[DEBUG] API response status: ${response.status}`)
      if (!response.ok) throw new Error("Failed to fetch tokens");
      const data = await response.json();
      console.log(`[DEBUG] API response data:`, data)
      
      const transformedTokens = data.data.map(transformToken);
      console.log(`[DEBUG] Transformed ${transformedTokens.length} tokens`)
      
      if (transformedTokens.length > 0) {
        if (isInitial) {
          const sortedTokens = [...transformedTokens].sort((a, b) => b.bullishPercentage - a.bullishPercentage);
          setTokens(transformedTokens);
          setLeaderboard(sortedTokens);
          setCurrentCrypto(sortedTokens[0]);
          console.log(`[DEBUG] Set initial currentCrypto: ${sortedTokens[0]?.name}`);
        } else {
          setTokens(prev => [...prev, ...transformedTokens]);
          setLeaderboard(prev => {
            const newList = [...prev, ...transformedTokens];
            return newList.sort((a, b) => b.bullishPercentage - a.bullishPercentage);
          });
        }
        setHasMore(data.pagination.hasNextPage);
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error("[DEBUG] Error fetching tokens:", error);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const fetchRecentVotes = useCallback(async () => {
    try {
      const response = await fetch('/api/votes/recent?limit=20');
      if (!response.ok) throw new Error("Failed to fetch recent votes");
      const data = await response.json();
      
      const transformedVotes = data.data.map((vote: any) => transformToken({
        ...vote,
        baseTokenName: vote.baseTokenName,
        baseTokenSymbol: vote.baseTokenSymbol,
        imageUrl: vote.imageUrl,
      }));
      
      setRecentRatings(transformedVotes);
    } catch (error) {
      console.error("Error fetching recent votes:", error);
    }
  }, []);

  const onVote = useCallback(async (isBullish: boolean) => {
    if (!currentCrypto) return;

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cryptoCurrencyId: currentCrypto.id,
          voteType: isBullish ? "BULLISH" : "BEARISH",
        }),
      });

      if (!response.ok) throw new Error("Failed to submit vote");
      
      const updatedCrypto = await response.json();
      const transformedCrypto = transformToken({
        ...updatedCrypto,
        baseTokenName: currentCrypto.name,
        baseTokenSymbol: currentCrypto.symbol,
        imageUrl: currentCrypto.logo,
      });
      
      setRecentRatings(prev => [transformedCrypto, ...prev]);
      setRatingHistory(prev => [...prev, { crypto: currentCrypto, rating: isBullish }]);

      if (isBullish) {
        setLastVotedId(currentCrypto.id);
        setTimeout(() => setLastVotedId(null), 500);
      }

      setLeaderboard(prev => {
        const updatedList = prev.map(crypto =>
          crypto.id === currentCrypto.id ? transformedCrypto : crypto
        ).sort((a, b) => b.bullishPercentage - a.bullishPercentage);
        
        const currentIndex = updatedList.findIndex(crypto => crypto.id === currentCrypto.id);
        const nextToken = updatedList[(currentIndex + 1) % updatedList.length];
        if (nextToken) {
          setCurrentCrypto(nextToken);
        }
        
        return updatedList;
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  }, [currentCrypto]);

  const onRedo = useCallback(() => {
    if (ratingHistory.length === 0) return;

    const lastRating = ratingHistory[ratingHistory.length - 1];
    if (!lastRating) return;

    setRatingHistory(prev => prev.slice(0, -1));
    setRecentRatings(prev => prev.slice(1));

    setLeaderboard(prev => {
      const updatedList = prev.map(crypto => {
        if (crypto.id === lastRating.crypto.id) {
          const newBullishVotes = lastRating.rating ? crypto.bullishVotes - 1 : crypto.bullishVotes;
          const newBearishVotes = lastRating.rating ? crypto.bearishVotes : crypto.bearishVotes - 1;
          const totalVotes = newBullishVotes + newBearishVotes;
          return {
            ...crypto,
            bullishVotes: newBullishVotes,
            bearishVotes: newBearishVotes,
            bullishPercentage: totalVotes === 0 ? 50 : Math.round((newBullishVotes / totalVotes) * 100),
          };
        }
        return crypto;
      }).sort((a, b) => b.bullishPercentage - a.bullishPercentage);

      const currentIndex = updatedList.findIndex(crypto => crypto.id === currentCrypto?.id);
      const prevToken = updatedList[currentIndex === 0 ? updatedList.length - 1 : currentIndex - 1];
      if (prevToken) {
        setCurrentCrypto(prevToken);
      }

      return updatedList;
    });
  }, [ratingHistory, currentCrypto]);

  const onSkip = useCallback(() => {
    setLeaderboard(prev => {
      const currentIndex = prev.findIndex(crypto => crypto.id === currentCrypto?.id);
      const nextToken = prev[(currentIndex + 1) % prev.length];
      if (nextToken) {
        setCurrentCrypto(nextToken);
      }
      return prev;
    });
  }, [currentCrypto]);

  useEffect(() => {
    fetchTokens(1, true);
  }, [fetchTokens]);

  useEffect(() => {
    fetchRecentVotes();
  }, [fetchRecentVotes]);

  return {
    currentCrypto,
    tokens,
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
    setPage,
  };
} 