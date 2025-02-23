import { useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({ hasMore, isLoading, onLoadMore }: UseInfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0]?.isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    if (!observerRef.current || isLoading || !hasMore) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, handleIntersection]);

  return observerRef;
} 