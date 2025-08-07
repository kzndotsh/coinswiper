const TokenInfoSkeleton = () => (
  <div className="w-full h-[72px] bg-[#1A181C] border border-[#2A272E] animate-pulse">
    <div className="h-full flex items-center px-4">
      <div className="w-10 h-10 bg-[#2A272E] rounded-lg" />
      <div className="ml-4 flex-1">
        <div className="h-4 w-24 bg-[#2A272E] rounded" />
        <div className="h-3 w-16 bg-[#2A272E] rounded mt-2" />
      </div>
    </div>
  </div>
);

const LeaderboardSkeleton = () => (
  <div className="w-full bg-[#1A181C] border border-[#2A272E] grow">
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
);

const ChartSkeleton = () => (
  <div className="w-full h-full bg-[#1A181C] border border-[#2A272E] overflow-hidden flex flex-col">
    {/* Header */}
    <div className="h-[72px] bg-[#1A181C] px-4 flex items-center justify-between border-b border-[#2A272E]">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-[#2A272E] rounded-full animate-pulse" />
        <div>
          <div className="h-4 w-24 bg-[#2A272E] rounded animate-pulse" />
          <div className="h-3 w-16 bg-[#2A272E] rounded mt-2 animate-pulse" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-[#2A272E] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-[#2A272E] rounded-full animate-pulse" />
        </div>
      </div>
    </div>

    {/* Stats Bar */}
    <div className="h-[60px] grid grid-cols-3 bg-[#1A181C] border-b border-[#2A272E]">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col justify-center px-4 animate-pulse">
          <div className="h-3 w-16 bg-[#2A272E] rounded" />
          <div className="h-4 w-20 bg-[#2A272E] rounded mt-2" />
        </div>
      ))}
    </div>

    {/* Chart Area */}
    <div className="flex-1 bg-[#1A181C] animate-pulse">
      <div className="w-full h-full bg-[#2A272E] opacity-50" />
    </div>

    {/* Control Buttons */}
    <div className="h-[80px] bg-[#1A181C] border-t border-[#2A272E] px-4 flex items-center justify-between">
      <div className="h-10 w-10 bg-[#2A272E] rounded-lg animate-pulse" />
      <div className="flex gap-4">
        <div className="h-12 w-120 bg-[#2A272E] rounded-full animate-pulse" />
        <div className="h-12 w-120 bg-[#2A272E] rounded-full animate-pulse" />
      </div>
      <div className="h-10 w-10 bg-[#2A272E] rounded-lg animate-pulse" />
    </div>
  </div>
);

export default function Loading() {
  return (
    <div className="h-dvh bg-[#080709] px-2.5 pb-1.25 flex flex-col space-y-2.5 pt-3.5 overflow-hidden font-mono">
      {/* Activity Bar */}
      <div className="w-full h-16 bg-[#1A181C] border border-[#2A272E] overflow-hidden">
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
          <TokenInfoSkeleton />
          <LeaderboardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    </div>
  );
} 