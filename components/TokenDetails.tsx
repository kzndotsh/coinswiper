import { memo, useMemo } from 'react';
import { ArrowUpRight, ArrowDown, FastForward, RotateCwIcon, Twitter, LineChart, Globe } from "lucide-react";
import type { CryptoCurrency } from "@/types/crypto";
import CryptoChart from "./CryptoChart";

interface TokenDetailsProps {
  crypto: CryptoCurrency;
  onVote: (isBullish: boolean) => void;
  onSkip: () => void;
  onRedo: () => void;
  canRedo: boolean;
}

// Memoize social links to prevent re-renders
const SocialLinks = memo(({ symbol, dexScreenerUrl }: { symbol: string, dexScreenerUrl: string }) => (
  <div className="flex items-center gap-3">
    <a
      href={`https://twitter.com/search?q=%24${symbol}`}
      target="_blank"
      rel="noopener noreferrer"
      className="h-8 w-8 flex items-center justify-center bg-[#1A181C] hover:bg-[#252328] rounded-lg transition-colors"
    >
      <Twitter className="h-4 w-4 text-[#4A484C]" />
    </a>
    <a
      href={dexScreenerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="h-8 w-8 flex items-center justify-center bg-[#1A181C] hover:bg-[#252328] rounded-lg transition-colors"
    >
      <LineChart className="h-4 w-4 text-[#4A484C]" />
    </a>
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      className="h-8 w-8 flex items-center justify-center bg-[#1A181C] hover:bg-[#252328] rounded-lg transition-colors"
    >
      <Globe className="h-4 w-4 text-[#4A484C]" />
    </a>
  </div>
));

// Memoize stats bar to prevent re-renders
const StatsBar = memo(({ marketCap, change24h, volume24h }: Pick<CryptoCurrency, 'marketCap' | 'change24h' | 'volume24h'>) => (
  <div className="h-[60px] grid grid-cols-3 bg-[#1A181C] border-y border-[#2A272E]">
    <div className="flex flex-row items-center justify-between px-4">
      <div className="text-gray-400 text-xs uppercase tracking-wider">Market Cap</div>
      <div className="text-[#F5F5F5] text-sm font-medium">{marketCap}</div>
    </div>
    <div className="flex flex-row items-center justify-between px-4">
      <div className="text-gray-400 text-xs uppercase tracking-wider">24h Change</div>
      <div
        className={`text-sm font-medium ${change24h.startsWith("+") ? "text-green-500" : "text-red-500"}`}
      >
        {change24h}
      </div>
    </div>
    <div className="flex flex-row items-center justify-between px-4">
      <div className="text-gray-400 text-xs uppercase tracking-wider">Volume (24h)</div>
      <div className="text-[#F5F5F5] text-sm font-medium">{volume24h}</div>
    </div>
  </div>
));

// Memoize control buttons to prevent re-renders
const ControlButtons = memo(({ onVote, onSkip, onRedo, canRedo }: Pick<TokenDetailsProps, 'onVote' | 'onSkip' | 'onRedo' | 'canRedo'>) => (
  <div className="h-[80px] bg-[#1A181C] border-t border-[#2A272E] px-4 flex items-center justify-between">
    <button
      onClick={onRedo}
      disabled={!canRedo}
      className="h-10 w-10 flex items-center justify-center bg-[#1A181C] hover:bg-[#252328] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RotateCwIcon className="h-5 w-5 text-[#4A484C]" />
    </button>

    <div className="flex gap-4">
      <button
        onClick={() => onVote(false)}
        className="flex items-center justify-center gap-2 bg-[#FF1654] hover:bg-[#FF1654]/90 text-[#F5F5F5] px-12 py-3 rounded-full text-sm font-helvetica-bold transition-all duration-200 hover:scale-105 w-120"
      >
        <ArrowDown className="h-6 w-6" />
        vote bearish
      </button>
      <button
        onClick={() => onVote(true)}
        className="flex items-center justify-center gap-2 bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black px-12 py-3 rounded-full text-sm font-helvetica-bold transition-all duration-200 hover:scale-105 w-120"
      >
        vote bullish
        <ArrowUpRight className="h-6 w-6" />
      </button>
    </div>

    <button
      onClick={onSkip}
      className="h-10 w-10 flex items-center justify-center bg-[#1A181C] hover:bg-[#252328] rounded-lg transition-colors"
    >
      <FastForward className="h-5 w-5 text-[#4A484C]" />
    </button>
  </div>
));

export const TokenDetails = memo(function TokenDetails({ crypto, onVote, onSkip, onRedo, canRedo }: TokenDetailsProps) {
  // Memoize the header content
  const headerContent = useMemo(() => (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-[#F5F5F5] rounded-full overflow-hidden shrink-0">
        <img
          src={crypto.logo || "/placeholder.svg"}
          alt={`${crypto.name} logo`}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <div className="flex items-center gap-4 py-1">
          <span className="text-[#F5F5F5] font-bold text-lg">{crypto.name}</span>
          <span className="text-gray-400 text-lg">{crypto.symbol}</span>
        </div>
        <div className="text-[#D9FF00] text-sm">{crypto.id}</div>
      </div>
    </div>
  ), [crypto.logo, crypto.name, crypto.symbol, crypto.id]);

  // Memoize the votes display
  const votesDisplay = useMemo(() => (
    <div className="flex items-center gap-1">
      <div className="flex items-center font-helvetica-bold text-sm mr-2">
        <span className="text-[#D9FF00]">{crypto.bullishVotes}</span>
        <span className="text-gray-500 mx-1">/</span>
        <span className="text-[#FF1654]">{crypto.bearishVotes}</span>
      </div>
      <div className="flex items-center bg-[#D9FF00] text-black font-helvetica-bold font-bold text-sm px-4 py-2 rounded-full">
        <span>{crypto.bullishPercentage}%</span>
        <ArrowUpRight className="h-5 w-5 ml-1" strokeWidth={2.3} />
      </div>
    </div>
  ), [crypto.bullishVotes, crypto.bearishVotes, crypto.bullishPercentage]);

  return (
    <div
      className="w-full h-full bg-[#1A181C] border border-[#2A272E] flex flex-col"
      aria-label="Rate Box"
    >
      {/* Header - fixed height */}
      <div className="h-[72px] flex-none bg-[#1A181C] px-4 flex items-center justify-between">
        {headerContent}
        <div className="flex items-center gap-6">
          <SocialLinks symbol={crypto.symbol} dexScreenerUrl={crypto.dexScreenerUrl} />
          {votesDisplay}
        </div>
      </div>

      {/* Stats Bar - fixed height */}
      <div className="h-[60px] flex-none">
        <StatsBar
          marketCap={crypto.marketCap}
          change24h={crypto.change24h}
          volume24h={crypto.volume24h}
        />
      </div>

      {/* Chart Area - flexible height */}
      <div className="flex-1 min-h-0 bg-[#1A181C] relative">
        <CryptoChart pairAddress={crypto.pairAddress} />
      </div>

      {/* Control Buttons - fixed height */}
      <div className="h-[80px] flex-none">
        <ControlButtons
          onVote={onVote}
          onSkip={onSkip}
          onRedo={onRedo}
          canRedo={canRedo}
        />
      </div>
    </div>
  );
}); 