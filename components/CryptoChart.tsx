"use client"

import { useState, useEffect, useRef, useCallback, memo } from 'react';

interface CryptoChartProps {
  pairAddress: string
}

// DNS prefetch and preconnect optimization
const DEXSCREENER_DOMAINS = [
  'https://dexscreener.com',
  'https://io.dexscreener.com',
  'https://dd.dexscreener.com',
  'https://pls.dexscreener.com'
];

const ChartStyles = () => (
  <style jsx global>{`
    .chart-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #1A181C;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }
    .chart-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }
    .chart-container iframe {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      border: 0;
      background: #1A181C;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  `}</style>
);

const CryptoChart = memo(function CryptoChart({ pairAddress }: CryptoChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const previousPairAddress = useRef(pairAddress);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const handleIntersection = useCallback(([entry]: IntersectionObserverEntry[]) => {
    if (!entry) return;
    setIsVisible(entry.isIntersecting);
  }, []);

  const buildEmbedUrl = useCallback((address: string) => {
    const params = new URLSearchParams({
      embed: '1',
      loadChartSettings: '0',
      trades: '0',
      tabs: '0',
      info: '0',
      chartLeftToolbar: '0',
      chartTimeframesToolbar: '0',
      chartTheme: 'dark',
      theme: 'dark',
      chartStyle: '1',
      chartType: 'usd',
      interval: '15'
    }).toString();
    return `https://dexscreener.com/solana/${address}?${params}`;
  }, []);

  // Optimized resize handling with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let debounceTimeout: NodeJS.Timeout;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry || !iframeRef.current?.contentWindow) return;

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const { width, height } = entry.contentRect;
        
        if (iframeRef.current) {
          iframeRef.current.style.width = `${width}px`;
          iframeRef.current.style.height = `${height}px`;
          
          iframeRef.current.contentWindow?.postMessage({
            name: 'resize',
            size: { width, height }
          }, '*');
        }
      }, 100);
    };

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(container);

    return () => {
      clearTimeout(debounceTimeout);
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    const element = document.getElementById('chart-wrapper');
    if (element) {
      observerRef.current.observe(element);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [handleIntersection]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    if (!iframeRef.current) {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
        background-color: #1A181C;
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        display: block;
      `;
      iframe.allow = 'clipboard-write';
      iframe.title = 'DEX Chart';
      iframe.loading = 'lazy';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
      
      // Performance optimization attributes
      iframe.setAttribute('decoding', 'async');
      iframe.setAttribute('loading', 'lazy');
      
      // Handle iframe load
      iframe.onload = () => {
        requestAnimationFrame(() => {
          setIsLoaded(true);
          const container = containerRef.current;
          if (iframe.contentWindow && container) {
            const rect = container.getBoundingClientRect();
            iframe.contentWindow.postMessage({
              name: 'resize',
              size: {
                width: rect.width,
                height: rect.height
              }
            }, '*');
          }
        });
      };

      iframe.src = buildEmbedUrl(pairAddress);
      iframeRef.current = iframe;
      containerRef.current.appendChild(iframe);
    } else if (previousPairAddress.current !== pairAddress) {
      const isSamePairDifferentCase = previousPairAddress.current?.toLowerCase() === pairAddress.toLowerCase();
      
      if (!isSamePairDifferentCase) {
        setIsLoaded(false);
        const newUrl = buildEmbedUrl(pairAddress);
        if (iframeRef.current.src !== newUrl) {
          iframeRef.current.src = newUrl;
        }
      }
      previousPairAddress.current = pairAddress;
    }

    return () => {
      if (iframeRef.current && containerRef.current?.contains(iframeRef.current)) {
        containerRef.current.removeChild(iframeRef.current);
        iframeRef.current = null;
        setIsLoaded(false);
      }
    };
  }, [pairAddress, buildEmbedUrl, isVisible]);

  return (
    <>
      <ChartStyles />
      <div id="chart-wrapper" className="chart-wrapper">
        <div ref={containerRef} className="chart-container">
          {!isLoaded && isVisible && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1A181C]">
              <div className="text-[#4A484C] text-sm">Loading chart...</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default CryptoChart;

