'use client';

import { useEffect, useRef } from 'react';

export function useAutoSync(intervalMinutes: number = 15) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const syncTokens = async () => {
    try {
      console.log('[AutoSync] Triggering background sync...');
      const response = await fetch('/api/sync/trending', {
        method: 'POST',
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[AutoSync] Sync completed: ${data.storedPairs} pairs updated`);
        
        // Refresh the page to show new data
        if (data.storedPairs > 0) {
          window.location.reload();
        }
      } else {
        console.error('[AutoSync] Sync failed:', response.statusText);
      }
    } catch (error) {
      console.error('[AutoSync] Sync error:', error);
    }
  };

  useEffect(() => {
    // Start periodic sync
    intervalRef.current = setInterval(syncTokens, intervalMinutes * 60 * 1000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMinutes]);

  // Return manual sync function
  return { syncNow: syncTokens };
}