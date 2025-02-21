"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  ArrowUpRight,
  ArrowDown,
  RotateCwIcon as RotateCounterClockwise,
  FastForward,
  Copy,
  Check,
  LineChart,
  Twitter,
  Globe,
} from "lucide-react"
import dynamic from "next/dynamic"

const CryptoChart = dynamic(() => import("@/components/CryptoChart"), { ssr: false })

interface CryptoCurrency {
  id: string
  name: string
  symbol: string
  logo: string
  marketCap: string
  volume24h: string
  bullishPercentage: number
  tradingViewSymbol: string
  change24h: string
  bullishVotes: number
  bearishVotes: number
}

const cryptoList: CryptoCurrency[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
    marketCap: "$1.2T",
    volume24h: "$35.4B",
    bullishPercentage: 65,
    tradingViewSymbol: "COINBASE:BTCUSD",
    change24h: "+1.2%",
    bullishVotes: 452,
    bearishVotes: 243,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
    marketCap: "$360B",
    volume24h: "$20.1B",
    bullishPercentage: 55,
    tradingViewSymbol: "COINBASE:ETHUSD",
    change24h: "-0.8%",
    bullishVotes: 387,
    bearishVotes: 316,
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422",
    marketCap: "$42.1B",
    volume24h: "$2.1B",
    bullishPercentage: 72,
    tradingViewSymbol: "COINBASE:SOLUSD",
    change24h: "+2.3%",
    bullishVotes: 343,
    bearishVotes: 103,
  },
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRP",
    logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1605778731",
    marketCap: "$35.2B",
    volume24h: "$1.8B",
    bullishPercentage: 61,
    tradingViewSymbol: "BINANCE:XRPUSDT",
    change24h: "+0.7%",
    bullishVotes: 298,
    bearishVotes: 190,
  },
  {
    id: "binancecoin",
    name: "BNB",
    symbol: "BNB",
    logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850",
    marketCap: "$48.2B",
    volume24h: "$1.2B",
    bullishPercentage: 58,
    tradingViewSymbol: "BINANCE:BNBUSDT",
    change24h: "+0.5%",
    bullishVotes: 276,
    bearishVotes: 200,
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png?1547034860",
    marketCap: "$20.5B",
    volume24h: "$850M",
    bullishPercentage: 48,
    tradingViewSymbol: "COINBASE:ADAUSD",
    change24h: "-1.2%",
    bullishVotes: 198,
    bearishVotes: 214,
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png?1670992574",
    marketCap: "$15.8B",
    volume24h: "$720M",
    bullishPercentage: 62,
    tradingViewSymbol: "COINBASE:AVAXUSD",
    change24h: "+1.8%",
    bullishVotes: 245,
    bearishVotes: 150,
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png?1547792256",
    marketCap: "$12.1B",
    volume24h: "$580M",
    bullishPercentage: 59,
    tradingViewSymbol: "BINANCE:DOGEUSDT",
    change24h: "-0.4%",
    bullishVotes: 234,
    bearishVotes: 163,
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    logo: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png?1639712644",
    marketCap: "$9.8B",
    volume24h: "$420M",
    bullishPercentage: 45,
    tradingViewSymbol: "COINBASE:DOTUSD",
    change24h: "-0.9%",
    bullishVotes: 167,
    bearishVotes: 204,
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    logo: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1547034700",
    marketCap: "$8.9B",
    volume24h: "$380M",
    bullishPercentage: 68,
    tradingViewSymbol: "COINBASE:LINKUSD",
    change24h: "+1.5%",
    bullishVotes: 289,
    bearishVotes: 136,
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912",
    marketCap: "$7.2B",
    volume24h: "$310M",
    bullishPercentage: 70,
    tradingViewSymbol: "BINANCE:MATICUSDT",
    change24h: "+2.1%",
    bullishVotes: 312,
    bearishVotes: 134,
  },
  {
    id: "shiba-inu",
    name: "Shiba Inu",
    symbol: "SHIB",
    logo: "https://assets.coingecko.com/coins/images/11939/large/shiba.png?1622619446",
    marketCap: "$6.9B",
    volume24h: "$290M",
    bullishPercentage: 57,
    tradingViewSymbol: "BINANCE:SHIBUSDT",
    change24h: "-1.3%",
    bullishVotes: 245,
    bearishVotes: 185,
  },
  {
    id: "litecoin",
    name: "Litecoin",
    symbol: "LTC",
    logo: "https://assets.coingecko.com/coins/images/2/large/litecoin.png?1547033580",
    marketCap: "$5.8B",
    volume24h: "$250M",
    bullishPercentage: 63,
    tradingViewSymbol: "BINANCE:LTCUSDT",
    change24h: "+0.9%",
    bullishVotes: 267,
    bearishVotes: 157,
  },
  {
    id: "uniswap",
    name: "Uniswap",
    symbol: "UNI",
    logo: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1600306604",
    marketCap: "$4.8B",
    volume24h: "$280M",
    bullishPercentage: 59,
    tradingViewSymbol: "BINANCE:UNIUSDT",
    change24h: "-0.7%",
    bullishVotes: 245,
    bearishVotes: 170,
  },
  {
    id: "bitcoin-cash",
    name: "Bitcoin Cash",
    symbol: "BCH",
    logo: "https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png?1594689492",
    marketCap: "$4.2B",
    volume24h: "$220M",
    bullishPercentage: 56,
    tradingViewSymbol: "BINANCE:BCHUSDT",
    change24h: "-0.5%",
    bullishVotes: 234,
    bearishVotes: 184,
  },
  {
    id: "cosmos",
    name: "Cosmos",
    symbol: "ATOM",
    logo: "https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png?1555657960",
    marketCap: "$3.2B",
    volume24h: "$190M",
    bullishPercentage: 57,
    tradingViewSymbol: "BINANCE:ATOMUSDT",
    change24h: "-1.5%",
    bullishVotes: 234,
    bearishVotes: 176,
  },
  {
    id: "monero",
    name: "Monero",
    symbol: "XMR",
    logo: "https://assets.coingecko.com/coins/images/69/large/monero_logo.png?1547033729",
    marketCap: "$2.8B",
    volume24h: "$160M",
    bullishPercentage: 69,
    tradingViewSymbol: "BINANCE:XMRUSDT",
    change24h: "+1.4%",
    bullishVotes: 312,
    bearishVotes: 140,
  },
  {
    id: "stellar",
    name: "Stellar",
    symbol: "XLM",
    logo: "https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png?1552356157",
    marketCap: "$3.5B",
    volume24h: "$180M",
    bullishPercentage: 54,
    tradingViewSymbol: "BINANCE:XLMUSDT",
    change24h: "-0.3%",
    bullishVotes: 245,
    bearishVotes: 209,
  },
  {
    id: "near",
    name: "NEAR Protocol",
    symbol: "NEAR",
    logo: "https://assets.coingecko.com/coins/images/10365/large/near_icon.png?1601359077",
    marketCap: "$1.8B",
    volume24h: "$140M",
    bullishPercentage: 66,
    tradingViewSymbol: "BINANCE:NEARUSDT",
    change24h: "+1.7%",
    bullishVotes: 267,
    bearishVotes: 138,
  },
  {
    id: "fantom",
    name: "Fantom",
    symbol: "FTM",
    logo: "https://assets.coingecko.com/coins/images/4001/large/Fantom.png?1558015016",
    marketCap: "$1.5B",
    volume24h: "$130M",
    bullishPercentage: 63,
    tradingViewSymbol: "BINANCE:FTMUSDT",
    change24h: "+2.2%",
    bullishVotes: 289,
    bearishVotes: 170,
  },
]

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentCrypto, setCurrentCrypto] = useState(cryptoList[0])
  const [leaderboard, setLeaderboard] = useState<CryptoCurrency[]>(cryptoList)
  const [recentRatings, setRecentRatings] = useState<CryptoCurrency[]>([])
  const [leaderboardView, setLeaderboardView] = useState<"bullish" | "bearish">("bullish")
  const [ratingHistory, setRatingHistory] = useState<
    Array<{
      crypto: CryptoCurrency
      rating: boolean
    }>
  >([])
  const [lastVotedId, setLastVotedId] = useState<string | null>(null)
  const [isAutoVoting, setIsAutoVoting] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setCurrentCrypto(cryptoList[currentIndex])
  }, [currentIndex])

  // Auto-voting simulation
  useEffect(() => {
    if (!isAutoVoting) return

    const interval = setInterval(() => {
      const randomCryptoIndex = Math.floor(Math.random() * cryptoList.length)
      const isBullish = Math.random() > 0.4 // 60% chance of bullish vote
      const votedCrypto = { ...cryptoList[randomCryptoIndex], isBullish }

      // Only update recent ratings and leaderboard for auto-votes
      setRecentRatings((prev) => [votedCrypto, ...prev])
      setLeaderboard((prev) => {
        const updatedList = prev.map((crypto) => {
          if (crypto.id === cryptoList[randomCryptoIndex].id) {
            const newBullishVotes = isBullish ? crypto.bullishVotes + 1 : crypto.bullishVotes
            const newBearishVotes = isBullish ? crypto.bearishVotes : crypto.bearishVotes + 1
            const totalVotes = newBullishVotes + newBearishVotes
            return {
              ...crypto,
              bullishVotes: newBullishVotes,
              bearishVotes: newBearishVotes,
              bullishPercentage: Math.round((newBullishVotes / totalVotes) * 100),
            }
          }
          return crypto
        })
        return updatedList.sort((a, b) => b.bullishPercentage - a.bullishPercentage)
      })
    }, 2000) // Vote every 2 seconds

    return () => clearInterval(interval)
  }, [isAutoVoting])

  const onVote = useCallback(
    (isBullish: boolean) => {
      const votedCrypto = { ...currentCrypto, isBullish }
      setRecentRatings((prev) => [votedCrypto, ...prev])
      setRatingHistory((prev) => [...prev, { crypto: currentCrypto, rating: isBullish }])

      if (isBullish) {
        setLastVotedId(currentCrypto.id)
        setTimeout(() => setLastVotedId(null), 1000)
      }

      setLeaderboard((prev) => {
        const updatedList = prev.map((crypto) => {
          if (crypto.id === currentCrypto.id) {
            const newBullishVotes = isBullish ? crypto.bullishVotes + 1 : crypto.bullishVotes
            const newBearishVotes = isBullish ? crypto.bearishVotes : crypto.bearishVotes + 1
            const totalVotes = newBullishVotes + newBearishVotes
            return {
              ...crypto,
              bullishVotes: newBullishVotes,
              bearishVotes: newBearishVotes,
              bullishPercentage: Math.round((newBullishVotes / totalVotes) * 100),
            }
          }
          return crypto
        })
        return updatedList.sort((a, b) => b.bullishPercentage - a.bullishPercentage)
      })

      setCurrentIndex((prevIndex) => (prevIndex + 1) % cryptoList.length)
    },
    [currentCrypto],
  )

  const onRedo = useCallback(() => {
    if (ratingHistory.length === 0) return

    const lastRating = ratingHistory[ratingHistory.length - 1]

    setRatingHistory((prev) => prev.slice(0, -1))
    setRecentRatings((prev) => prev.slice(1))

    setLeaderboard((prev) => {
      const updatedList = prev.map((crypto) => {
        if (crypto.id === lastRating.crypto.id) {
          const newBullishVotes = lastRating.rating ? crypto.bullishVotes - 1 : crypto.bullishVotes
          const newBearishVotes = lastRating.rating ? crypto.bearishVotes : crypto.bearishVotes - 1
          const totalVotes = newBullishVotes + newBearishVotes
          return {
            ...crypto,
            bullishVotes: newBullishVotes,
            bearishVotes: newBearishVotes,
            bullishPercentage: totalVotes === 0 ? 50 : Math.round((newBullishVotes / totalVotes) * 100),
          }
        }
        return crypto
      })
      return updatedList.sort((a, b) => b.bullishPercentage - a.bullishPercentage)
    })

    setCurrentIndex((prevIndex) => (prevIndex === 0 ? cryptoList.length - 1 : prevIndex - 1))
  }, [ratingHistory])

  const onSkip = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cryptoList.length)
  }, [])

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText("0x7a250d5...")
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }, [])

  const sortedLeaderboard =
    leaderboardView === "bullish"
      ? [...leaderboard].sort((a, b) => b.bullishPercentage - a.bullishPercentage)
      : [...leaderboard].sort((a, b) => a.bullishPercentage - b.bullishPercentage)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const width = container.scrollWidth - container.offsetWidth

    setOffset(0)
    const timer = setTimeout(() => {
      setOffset(-width)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="h-[100dvh] bg-[#080709] px-2.5 pb-1.25 flex flex-col space-y-2.5 pt-3.5 overflow-hidden font-mono">
      {/* Activity Bar */}
      <div
        ref={containerRef}
        className="w-full h-16 bg-[#1A181C] border border-[#2A272E] overflow-hidden relative px-2.5"
        aria-label="Activity Bar"
      >
        <div className="absolute inset-0 flex items-center">
          <div
            className="flex space-x-1.5 px-2.5 min-w-max transition-transform duration-1000 ease-linear"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {recentRatings.map((crypto, index) => (
              <div
                key={`${crypto.id}-${index}`}
                className="bg-[#131314] border border-[#2A272E] backdrop-blur-sm h-[52px] w-[300px] rounded-lg flex items-center py-1.5 pl-2 pr-1.5 flex-shrink-0"
              >
                {/* Profile Picture */}
                <div className="h-9 w-9 bg-[#131314] rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={crypto.logo || "/placeholder.svg"}
                    alt={`${crypto.name} logo`}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Token Info */}
                <div className="ml-2 flex-grow min-w-0">
                  <h3 className="text-[#F5F5F5] text-sm font-helvetica-bold leading-tight truncate">{crypto.name}</h3>
                  <p className="text-[#3A383C] text-xs leading-tight truncate">{crypto.symbol}</p>
                </div>

                {/* Percentage Badge */}
                <div
                  className={`flex items-center ${crypto.isBullish ? "bg-[#D9FF00] text-black" : "bg-[#FF1654] text-white"} font-helvetica-bold text-sm px-3 py-1 rounded-full ml-2`}
                >
                  <span>{crypto.isBullish ? "Bullish" : "Bearish"}</span>
                  {crypto.isBullish ? (
                    <ArrowUpRight className="h-4 w-4 ml-0.5" strokeWidth={2.3} />
                  ) : (
                    <ArrowDown className="h-4 w-4 ml-0.5" strokeWidth={2.3} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area - Update to use remaining height */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-2.5 h-[calc(100vh-104px)]">
        {/* Left Sidebar */}
        <div className="flex flex-col space-y-2.5 h-full overflow-hidden">
          {/* Coininfo - Update height to be auto */}
          <div
            className="w-full bg-[#1A181C] border border-[#2A272E] p-2.5 flex-shrink-0 space-y-2.5"
            aria-label="Coin Information"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 bg-[#1A181C] rounded-full overflow-hidden flex-shrink-0">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b8jKsRdpMrlGP6jNSXj0Dm5mUDI84z.png"
                  alt="Coinswiper logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[#F5F5F5] font-bold">COINSWIPER</span>
                  <span className="text-gray-400">$SWIPE</span>
                </div>
                <div className="text-[#D9FF00] text-sm font-medium">0x7a250d5...</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 bg-[#131314] border border-[#2A272E] rounded-lg p-3">
              <div className="flex flex-col items-center justify-center">
                <div className="text-gray-400 text-xs">MARKET CAP</div>
                <div className="text-[#F5F5F5] font-medium">$724.91K</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-gray-400 text-xs">VOLUME (24H)</div>
                <div className="text-[#F5F5F5] font-medium">$42.91M</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3">
              <button
                onClick={onCopy}
                className={`flex items-center justify-center gap-2 bg-[#131314] hover:bg-[#1A181C] text-[#F5F5F5] py-2.5 rounded-lg text-sm border border-[#2A272E] transition-colors bullish-vote-animation ${
                  isCopied ? "active" : ""
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 text-[#D9FF00]" />
                    <span className="text-[#D9FF00]">COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    COPY CA
                  </>
                )}
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#131314] hover:bg-[#1A181C] text-[#F5F5F5] py-2.5 rounded-lg text-sm border border-[#2A272E] transition-colors">
                <LineChart className="h-4 w-4 text-[#4A484C]" />
                CHARTS
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#131314] hover:bg-[#1A181C] text-[#F5F5F5] py-2.5 rounded-lg text-sm border border-[#2A272E] transition-colors">
                <Twitter className="h-4 w-4 text-[#4A484C]" />
                TWITTER
              </button>
            </div>
          </div>

          {/* Leaderboard - Update to use remaining height */}
          <div
            className="w-full bg-[#1A181C] border border-[#2A272E] overflow-hidden flex-grow flex flex-col"
            aria-label="Leaderboard"
          >
            {/* Header Tabs */}
            <div className="grid grid-cols-2">
              <button
                className={`py-3 text-sm font-medium transition-colors ${
                  leaderboardView === "bullish"
                    ? "bg-[#1A181C] text-[#F5F5F5]"
                    : "bg-[#2A272E] text-gray-500 hover:text-gray-400"
                }`}
                onClick={() => setLeaderboardView("bullish")}
              >
                TOP BULLISH
              </button>
              <button
                className={`py-3 text-sm font-medium transition-colors ${
                  leaderboardView === "bearish"
                    ? "bg-[#1A181C] text-[#F5F5F5]"
                    : "bg-[#131314] text-gray-500 hover:text-gray-400"
                }`}
                onClick={() => setLeaderboardView("bearish")}
              >
                TOP BEARISH
              </button>
            </div>

            {/* List - Update to use full height minus header */}
            <div className="flex-grow px-2 pb-0 pt-2.5 overflow-y-auto no-scrollbar">
              <div className="space-y-[5px]">
                {sortedLeaderboard.map((crypto, index) => (
                  <div
                    key={crypto.id}
                    className={`bg-[#131314] rounded-lg py-[7px] px-2 pl-0 flex items-center gap-3 border border-[#2A272E] bullish-vote-animation ${
                      lastVotedId === crypto.id ? "active" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="text-gray-500 font-medium w-10 pl-4">#{index + 1}</div>

                    {/* Profile Picture */}
                    <div className="h-8 w-8 bg-[#1A181C] rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={crypto.logo || "/placeholder.svg"}
                        alt={`${crypto.name} logo`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Token Info */}
                    <div className="flex-grow min-w-0">
                      <div className="text-[#F5F5F5] font-medium leading-tight truncate text-sm">{crypto.name}</div>
                      <div className="text-gray-500 text-xs leading-tight truncate">{crypto.symbol}</div>
                    </div>

                    {/* Vote Statistics */}
                    <div className="flex items-center gap-1 mr-2 font-helvetica-bold">
                      <span className="text-[#D9FF00]">{crypto.bullishVotes}</span>
                      <span className="text-gray-500 mx-1">/</span>
                      <span className="text-[#FF1654]">{crypto.bearishVotes}</span>
                    </div>

                    {/* Percentage Badge */}
                    <div
                      className={`flex items-center text-xs ${
                        leaderboardView === "bullish" ? "bg-[#D9FF00] text-black" : "bg-[#FF1654] text-white"
                      } font-helvetica-bold font-extrabold text-sm px-3 py-1 rounded-full`}
                    >
                      <span>{crypto.bullishPercentage}%</span>
                      {leaderboardView === "bullish" ? (
                        <ArrowUpRight className="h-4 w-4 ml-0.5" strokeWidth={2.3} />
                      ) : (
                        <ArrowDown className="h-4 w-4 ml-0.5" strokeWidth={2.3} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-24 bg-gradient-to-t from-[#1A181C] to-transparent pointer-events-none mt-[-96px]" />
            </div>
          </div>
        </div>

        {/* Ratebox - Already using flex-col for full height */}
        <div
          className="w-full h-full bg-[#1A181C] border border-[#2A272E] overflow-hidden flex flex-col"
          aria-label="Rate Box"
        >
          {/* Header */}
          <div className="h-[72px] bg-[#1A181C] px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#F5F5F5] rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={currentCrypto.logo || "/placeholder.svg"}
                  alt={`${currentCrypto.name} logo`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 py-1">
                  <span className="text-[#F5F5F5] font-bold text-lg">{currentCrypto.name}</span>
                  <span className="text-gray-400 text-lg">{currentCrypto.symbol}</span>
                </div>
                <div className="text-[#D9FF00] text-sm">{currentCrypto.id}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <a
                  href={`https://twitter.com/search?q=%24${currentCrypto.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 flex items-center justify-center bg-[#1A181C] hover:bg-[#252328] rounded-lg transition-colors"
                >
                  <Twitter className="h-4 w-4 text-[#4A484C]" />
                </a>
                <a
                  href={`https://www.coingecko.com/en/coins/${currentCrypto.id}`}
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
              <div className="flex items-center gap-1">
                <div className="flex items-center font-helvetica-bold text-sm mr-2">
                  <span className="text-[#D9FF00]">{currentCrypto.bullishVotes}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-[#FF1654]">{currentCrypto.bearishVotes}</span>
                </div>
                <div className="flex items-center bg-[#D9FF00] text-black font-helvetica-bold font-bold text-sm px-4 py-2 rounded-full">
                  <span>{currentCrypto.bullishPercentage}%</span>
                  <ArrowUpRight className="h-5 w-5 ml-1" strokeWidth={2.3} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="h-[60px] grid grid-cols-3 bg-[#1A181C] border-y border-[#2A272E]">
            <div className="flex flex-row items-center justify-between px-4">
              <div className="text-gray-400 text-xs uppercase tracking-wider">Market Cap</div>
              <div className="text-[#F5F5F5] text-sm font-medium">{currentCrypto.marketCap}</div>
            </div>
            <div className="flex flex-row items-center justify-between px-4">
              <div className="text-gray-400 text-xs uppercase tracking-wider">24h Change</div>
              <div
                className={`text-sm font-medium ${currentCrypto.change24h.startsWith("+") ? "text-green-500" : "text-red-500"}`}
              >
                {currentCrypto.change24h}
              </div>
            </div>
            <div className="flex flex-row items-center justify-between px-4">
              <div className="text-gray-400 text-xs uppercase tracking-wider">Volume (24h)</div>
              <div className="text-[#F5F5F5] text-sm font-medium">{currentCrypto.volume24h}</div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-grow bg-[#1A181C] min-h-0">
            <CryptoChart symbol={currentCrypto.tradingViewSymbol} />
          </div>

          {/* Bottom Controls */}
          <div className="h-[80px] bg-[#1A181C] border-t border-[#2A272E] px-4 flex items-center justify-between">
            <button
              onClick={onRedo}
              disabled={ratingHistory.length === 0}
              className="h-10 w-10 flex items-center justify-center bg-[#1A181C] hover:bg-[#252328] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCounterClockwise className="h-5 w-5 text-[#4A484C]" />
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => onVote(false)}
                disabled={false}
                className="flex items-center justify-center gap-2 bg-[#FF1654] hover:bg-[#FF1654]/90 text-[#F5F5F5] px-12 py-3 rounded-full text-sm font-helvetica-bold transition-all duration-200 hover:scale-105 w-[30rem] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDown className="h-6 w-6" />
                vote bearish
              </button>
              <button
                onClick={() => onVote(true)}
                disabled={false}
                className="flex items-center justify-center gap-2 bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black px-12 py-3 rounded-full text-sm font-helvetica-bold transition-all duration-200 hover:scale-105 w-[30rem] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                vote bullish
                <ArrowUpRight className="h-6 w-6" />
              </button>
            </div>

            <button
              onClick={onSkip}
              disabled={false}
              className="h-10 w-10 flex items-center justify-center bg-[#1A181C] hover:bg-[#252328] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FastForward className="h-5 w-5 text-[#4A484C]" />
            </button>
          </div>
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
  )
}

