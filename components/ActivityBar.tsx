import { ArrowUpRight, ArrowDown } from "lucide-react";
import type { CryptoCurrency } from "@/types";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ActivityBarProps {
  recentRatings: CryptoCurrency[];
}

export function ActivityBar({ recentRatings }: ActivityBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-16 bg-[#1A181C] border border-[#2A272E] overflow-hidden"
      aria-label="Activity Bar"
    >
      <div className="h-full flex items-center">
        <div className="grid grid-flow-col auto-cols-fr gap-1.5 w-full px-2.5">
          {recentRatings.slice(0, 5).reverse().map((crypto, index) => {
            const imageUrl = !imageErrors[crypto.id] && crypto.logo ? crypto.logo : "/placeholder.svg";
            const isDataUrl = imageUrl.startsWith('data:');
            const isBullish = crypto.bullishPercentage >= 50;

            return (
              <div
                key={`${crypto.id}-${index}`}
                className={`animate-slide-left bg-[#131314] border border-[#2A272E] h-[52px] rounded-lg flex items-center py-1.5 pl-2 pr-1.5`}
              >
                {/* Profile Picture */}
                <div className="w-9 h-9 bg-[#1A181C] rounded-lg overflow-hidden relative flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={`${crypto.name || 'Token'} logo`}
                    width={36}
                    height={36}
                    className="object-cover object-center"
                    onError={() => handleImageError(crypto.id)}
                    priority={index < 5}
                    unoptimized={isDataUrl}
                    loading={index < 10 ? "eager" : "lazy"}
                    sizes="36px"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>

                {/* Token Info */}
                <div className="ml-2 flex-grow min-w-0">
                  <h3 className="text-[#F5F5F5] text-sm font-medium leading-tight truncate">{crypto.name}</h3>
                  <p className="text-gray-500 text-xs leading-tight truncate">{crypto.symbol}</p>
                </div>

                {/* Vote Badge */}
                <div
                  className={`inline-flex items-center gap-0.5 ${
                    isBullish ? "bg-[#D9FF00] text-black" : "bg-[#FF1654] text-white"
                  } font-helvetica-bold text-sm px-2 py-1 rounded-full ml-2`}
                >
                  {isBullish ? (
                    <ArrowUpRight className="h-4 w-4 flex-shrink-0" strokeWidth={2.3} />
                  ) : (
                    <ArrowDown className="h-4 w-4 flex-shrink-0" strokeWidth={2.3} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 