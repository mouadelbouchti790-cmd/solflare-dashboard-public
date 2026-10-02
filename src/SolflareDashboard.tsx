import React, { useState, useEffect, useId, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  TrendingUp,
  Activity,
  Layers,
  Shield,
  Coins,
  Search,
  X,
  Zap,
} from "lucide-react";

// ==========================================
// 1. DATA TYPES & CONTRACT INTERFACES
// ==========================================

export type Network = "mainnet-beta" | "devnet" | "testnet";

export interface TokenAsset {
  symbol: string;
  name: string;
  mint: string;
  balance: number;
  decimals: number;
  priceUsd: number;
  change24h: number;
  iconBg: string;
  category: "sol" | "lst" | "stable" | "defi" | "meme";
  sparkline: number[];
}

export interface StakingPosition {
  validatorName: string;
  validatorAddress: string;
  stakeSol: number;
  apyPercent: number;
  rewardsAccruedSol: number;
  status: "active" | "activating" | "deactivating";
  voteAccount: string;
}

export interface TransactionRecord {
  id: string;
  signature: string;
  type: "swap" | "send" | "receive" | "stake";
  description: string;
  amount: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
}

// ==========================================
// 2. REALISTIC MOCK REPOSITORY
// ==========================================

const INITIAL_TOKENS: TokenAsset[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    balance: 48.34,
    decimals: 9,
    priceUsd: 148.65,
    change24h: 5.42,
    iconBg: "bg-gradient-to-tr from-[#9945FF] to-[#14F195]",
    category: "sol",
    sparkline: [138, 140, 142, 139, 144, 146, 148.65],
  },
  {
    symbol: "JitoSOL",
    name: "Jito Staked SOL",
    mint: "J1toso1uCk3RKmdoTVht3h5VD4mqxzHs2Rh9um6zkNi5",
    balance: 22.15,
    decimals: 9,
    priceUsd: 167.24,
    change24h: 5.81,
    iconBg: "bg-[#2688E8]",
    category: "lst",
    sparkline: [156, 158, 159, 161, 164, 165, 167.24],
  },
  {
    symbol: "mSOL",
    name: "Marinade staked SOL",
    mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    balance: 14.8,
    decimals: 9,
    priceUsd: 169.88,
    change24h: 5.62,
    iconBg: "bg-[#0EA5E9]",
    category: "lst",
    sparkline: [159, 161, 162, 163, 166, 168, 169.88],
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    balance: 4250.0,
    decimals: 6,
    priceUsd: 1.0,
    change24h: 0.01,
    iconBg: "bg-[#2775CA]",
    category: "stable",
    sparkline: [1.0, 1.0, 0.999, 1.001, 1.0, 1.0, 1.0],
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    balance: 1850.5,
    decimals: 6,
    priceUsd: 1.14,
    change24h: -2.31,
    iconBg: "bg-[#10B981]",
    category: "defi",
    sparkline: [1.22, 1.2, 1.18, 1.15, 1.13, 1.16, 1.14],
  },
  {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    balance: 48500210,
    decimals: 5,
    priceUsd: 0.000024,
    change24h: 12.8,
    iconBg: "bg-[#F5841F]",
    category: "meme",
    sparkline: [0.00002, 0.000021, 0.000023, 0.000022, 0.000025, 0.000024],
  },
];

const INITIAL_STAKE: StakingPosition[] = [
  {
    validatorName: "Jito Labs MEV Node 1",
    validatorAddress: "J1tovp593m3u219Jd39k3Hdu014k9jF301",
    stakeSol: 35.0,
    apyPercent: 7.85,
    rewardsAccruedSol: 1.42,
    status: "active",
    voteAccount: "Vote111111111111111111111111111111111111111",
  },
  {
    validatorName: "Shinobi Systems Stake Pool",
    validatorAddress: "Shino3941k02dfj4982m3kd83jd02md832",
    stakeSol: 12.5,
    apyPercent: 7.32,
    rewardsAccruedSol: 0.58,
    status: "active",
    voteAccount: "ShinobiVote99999999999999999999999999999999",
  },
];

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "tx-1",
    signature: "5K2P9kM...8xJ1qW",
    type: "swap",
    description: "Swapped 5.0 SOL for 743.25 USDC",
    amount: "+$743.25",
    timestamp: "2 mins ago",
    status: "success",
  },
  {
    id: "tx-2",
    signature: "4X9aLmP...2nB7vR",
    type: "receive",
    description: "Received SOL from Binance",
    amount: "+15.0 SOL",
    timestamp: "1 hour ago",
    status: "success",
  },
  {
    id: "tx-3",
    signature: "2mN8vTq...9pK4sD",
    type: "stake",
    description: "Staked with Jito Labs Validator",
    amount: "-35.0 SOL",
    timestamp: "Yesterday",
    status: "success",
  },
  {
    id: "tx-4",
    signature: "7wQ3pLx...1mF6zK",
    type: "send",
    description: "Sent USDC to Phantom wallet",
    amount: "-250.00 USDC",
    timestamp: "3 days ago",
    status: "success",
  },
];

const PERFORMANCE_DATA: Record<string, { time: string; value: number }[]> = {
  "1D": [
    { time: "00:00", value: 16840 },
    { time: "04:00", value: 16920 },
    { time: "08:00", value: 16790 },
    { time: "12:00", value: 17150 },
    { time: "16:00", value: 17420 },
    { time: "20:00", value: 17890 },
    { time: "Now", value: 18130.5 },
  ],
  "1W": [
    { time: "Mon", value: 15400 },
    { time: "Tue", value: 15900 },
    { time: "Wed", value: 16200 },
    { time: "Thu", value: 15850 },
    { time: "Fri", value: 16900 },
    { time: "Sat", value: 17400 },
    { time: "Sun", value: 18130.5 },
  ],
  "1M": [
    { time: "W1", value: 13200 },
    { time: "W2", value: 14100 },
    { time: "W3", value: 15800 },
    { time: "W4", value: 18130.5 },
  ],
  "1Y": [
    { time: "Q1", value: 8400 },
    { time: "Q2", value: 10900 },
    { time: "Q3", value: 14200 },
    { time: "Q4", value: 18130.5 },
  ],
  ALL: [
    { time: "2023", value: 4100 },
    { time: "2024", value: 9800 },
    { time: "2025", value: 14500 },
    { time: "Current", value: 18130.5 },
  ],
};

// ==========================================
// 3. DETERMINISTIC IDENTICON SVG GENERATOR
// ==========================================

const IdenticonAvatar = ({ address, size = 22 }: { address: string; size?: number }) => {
  const hash = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = (hash * 37) % 360;
  const hue2 = (hue1 + 80) % 360;

  return (
    <div
      style={{ width: size, height: size }}
      className="relative rounded-full overflow-hidden flex-shrink-0 border border-[#21435F]"
    >
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#0D1E30" />
        <circle cx="25" cy="25" r="28" fill={`hsl(${hue1}, 70%, 55%)`} opacity="0.8" />
        <circle cx="60" cy="55" r="30" fill={`hsl(${hue2}, 60%, 65%)`} opacity="0.7" />
        <rect
          x="20"
          y="35"
          width="40"
          height="40"
          transform="rotate(45 35 55)"
          fill="#4DA3FF"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};

// ==========================================
// 4. MICRO SPARKLINE SVG (Financial Strict Colors)
// ==========================================

const Sparkline = ({
  data,
  isPositive,
  width = 54,
  height = 20,
}: {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
}) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = 2 + (idx / (data.length - 1)) * (width - 4);
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = isPositive ? "#22C55E" : "#EF4444";

  return (
    <svg width={width} height={height} className="overflow-hidden flex-shrink-0 block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// ==========================================
// 5. INTERACTIVE PERFORMANCE AREA CHART
// ==========================================

interface AreaChartProps {
  data: { time: string; value: number }[];
  onHoverValue: (val: number | null) => void;
}

const PerformanceAreaChart: React.FC<AreaChartProps> = ({ data, onHoverValue }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgId = useId();

  const width = 640;
  const height = 180;
  const paddingX = 20;
  const paddingBottom = 26;
  const paddingTop = 14;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.995;
  const maxVal = Math.max(...values) * 1.005;
  const valRange = maxVal - minVal;

  const coords = useMemo(() => {
    return data.map((pt, i) => {
      const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
      const y =
        paddingTop + (1 - (pt.value - minVal) / valRange) * (height - paddingTop - paddingBottom);
      return { x, y, pt };
    });
  }, [data, minVal, valRange]);

  const pathD = useMemo(() => {
    if (coords.length === 0) return "";
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [coords]);

  const areaD = useMemo(() => {
    if (coords.length === 0) return "";
    const bottomY = height - paddingBottom;
    return `${pathD} L ${coords[coords.length - 1].x} ${bottomY} L ${coords[0].x} ${bottomY} Z`;
  }, [pathD, coords, height, paddingBottom]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const mappedIndex = Math.min(
      Math.max(Math.round(relativeX * (coords.length - 1)), 0),
      coords.length - 1
    );
    setHoverIndex(mappedIndex);
    onHoverValue(coords[mappedIndex].pt.value);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    onHoverValue(null);
  };

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-44 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Restrained subtle fill gradient */}
          <linearGradient id={`grad-${svgId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4DA3FF" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#4DA3FF" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Subtle Navy Grids */}
        {[0.25, 0.5, 0.75].map((pct, idx) => {
          const y = paddingTop + pct * (height - paddingTop - paddingBottom);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="#18344D"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area Fill */}
        <path d={areaD} fill={`url(#grad-${svgId})`} />

        {/* Main Brand Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#4DA3FF"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Interactive Crosshair & Cursor */}
        {hoverIndex !== null && coords[hoverIndex] && (
          <g>
            <line
              x1={coords[hoverIndex].x}
              y1={paddingTop}
              x2={coords[hoverIndex].x}
              y2={height - paddingBottom}
              stroke="#2D526F"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={coords[hoverIndex].x}
              cy={coords[hoverIndex].y}
              r="4.5"
              fill="#4DA3FF"
            />
            <circle
              cx={coords[hoverIndex].x}
              cy={coords[hoverIndex].y}
              r="2"
              fill="#081522"
            />
          </g>
        )}

        {/* Timestamp axis labels */}
        {coords.map((c, i) => (
          <text
            key={i}
            x={c.x}
            y={height - 6}
            textAnchor="middle"
            fill="#8C98A5"
            className="text-[10px] font-num tracking-tight"
          >
            {c.pt.time}
          </text>
        ))}
      </svg>
    </div>
  );
};

// ==========================================
// 6. MAIN CRYPTO PORTFOLIO TERMINAL
// ==========================================

export default function SolflareDashboard() {
  const [network, setNetwork] = useState<Network>("mainnet-beta");
  const [activeTab, setActiveTab] = useState<"tokens" | "staking" | "activity">("tokens");
  const [tokens, setTokens] = useState<TokenAsset[]>(INITIAL_TOKENS);
  const [staking] = useState<StakingPosition[]>(INITIAL_STAKE);
  const [transactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);

  // Timeframe & Chart Hover States
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "1Y" | "ALL">("1D");
  const [hoveredChartValue, setHoveredChartValue] = useState<number | null>(null);

  // UI state
  const [expandedTokenMint, setExpandedTokenMint] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [wsConnected] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  // Modals state
  const [activeModal, setActiveModal] = useState<"send" | "receive" | "swap" | "stake" | null>(null);
  const [selectedTokenForAction, setSelectedTokenForAction] = useState<TokenAsset | null>(null);

  const walletPubkey = "SoL8f2Az9kMQx1vB87uPL3aZJm4dF6gH91K2qWeRTyU";
  const displayAddress = `${walletPubkey.slice(0, 4)}...${walletPubkey.slice(-4)}`;

  // Total Net Worth Calculations
  const totalNetWorth = useMemo(() => {
    const tokensValue = tokens.reduce((sum, t) => sum + t.balance * t.priceUsd, 0);
    const stakingValue = staking.reduce((sum, s) => {
      const solToken = tokens.find((t) => t.symbol === "SOL");
      return sum + (s.stakeSol + s.rewardsAccruedSol) * (solToken?.priceUsd || 148);
    }, 0);
    return tokensValue + stakingValue;
  }, [tokens, staking]);

  // Asset Categories Distribution
  const allocation = useMemo(() => {
    let solSum = 0;
    let lstSum = 0;
    let stableSum = 0;
    let defiSum = 0;
    let memeSum = 0;

    tokens.forEach((t) => {
      const val = t.balance * t.priceUsd;
      if (t.category === "sol") solSum += val;
      if (t.category === "lst") lstSum += val;
      if (t.category === "stable") stableSum += val;
      if (t.category === "defi") defiSum += val;
      if (t.category === "meme") memeSum += val;
    });

    const total = solSum + lstSum + stableSum + defiSum + memeSum || 1;
    return [
      { label: "Solana", percent: (solSum / total) * 100, color: "#4DA3FF" },
      { label: "Liquid Staking", percent: (lstSum / total) * 100, color: "#70B7FF" },
      { label: "Stablecoins", percent: (stableSum / total) * 100, color: "#2775CA" },
      { label: "DeFi", percent: (defiSum / total) * 100, color: "#94A3B8" },
      { label: "Memes", percent: (memeSum / total) * 100, color: "#F5841F" },
    ].filter((item) => item.percent > 0.5);
  }, [tokens]);

  // Real-time price flutter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prev) =>
        prev.map((tok) => {
          if (tok.symbol === "USDC") return tok;
          const delta = (Math.random() - 0.495) * 0.008;
          const newPrice = Number((tok.priceUsd * (1 + delta)).toFixed(tok.priceUsd < 0.01 ? 7 : 2));
          return {
            ...tok,
            priceUsd: newPrice,
          };
        })
      );
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletPubkey);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const filteredTokens = tokens.filter(
    (t) =>
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.symbol.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#081522] text-[#F4F6F8] font-sans antialiased selection:bg-[#4DA3FF]/20 selection:text-[#70B7FF]">
      {/* ========================================================= */}
      {/* 1. HEADER (Deep Navy Surface, Platinum Symbol Emblem) */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-[#0D1E30]/90 backdrop-blur-md border-b border-[#18344D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo: Navy Background + Platinum/Silver Symbol */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D1E30] border border-[#21435F] flex items-center justify-center shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#F4F6F8]">
                {/* Platinum Geometric Monogram Symbol */}
                <path
                  d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                  stroke="#CACFD5"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6L7 9V15L12 18L17 15V9L12 6Z"
                  fill="#4DA3FF"
                  fillOpacity="0.2"
                  stroke="#4DA3FF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="2" fill="#F4F6F8" />
              </svg>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#CACFD5]">
                Portfolio Vault
              </span>
              <span className="text-[10px] text-[#8C98A5] font-num">v2.4.0</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Connection Dot */}
            <div
              title={wsConnected ? "Solana RPC: Connected" : "Connecting..."}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#081522] border border-[#18344D] text-xs text-[#8C98A5]"
            >
              <span className="relative flex h-2 w-2">
                {wsConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    wsConnected ? "bg-[#22C55E]" : "bg-amber-400"
                  }`}
                />
              </span>
              <span className="font-num text-[11px] text-[#8C98A5]">14ms</span>
            </div>

            {/* Network Selector */}
            <div className="relative">
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as Network)}
                className="appearance-none bg-[#12283D] hover:bg-[#18344D] border border-[#21435F] text-xs text-[#CACFD5] font-medium py-1.5 pl-3 pr-7 rounded-lg cursor-pointer transition focus:outline-none focus:border-[#4DA3FF]"
              >
                <option value="mainnet-beta">Mainnet-Beta</option>
                <option value="devnet">Devnet</option>
                <option value="testnet">Testnet</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C98A5] absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Wallet Address Pill */}
            <button
              onClick={handleCopyAddress}
              className="flex items-center space-x-2 bg-[#12283D] hover:bg-[#18344D] active:scale-95 border border-[#21435F] hover:border-[#4DA3FF]/50 px-3 py-1.5 rounded-lg transition duration-150 group"
            >
              <IdenticonAvatar address={walletPubkey} size={18} />
              <span className="font-num text-xs font-semibold text-[#CACFD5] tabular-nums">
                {displayAddress}
              </span>
              {copiedAddress ? (
                <Check className="w-3.5 h-3.5 text-[#22C55E]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#8C98A5] group-hover:text-[#F4F6F8] transition" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ========================================================= */}
        {/* 2. PORTFOLIO OVERVIEW CARD */}
        {/* ========================================================= */}
        {/* ── PORTFOLIO OVERVIEW CARD – glassmorphic neon-blue hero ── */}
        <div className="relative overflow-hidden rounded-2xl border border-[#2D526F]/60 shadow-[0_0_0_1px_rgba(77,163,255,0.08),0_8px_40px_rgba(0,0,0,0.45)] p-6 sm:p-8"
          style={{ background: "linear-gradient(135deg,#0D1E30 60%,#0f2540 100%)", backdropFilter: "blur(16px)" }}
        >
          {/* Neon border glow overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ boxShadow: "inset 0 0 0 1px rgba(77,163,255,0.18), 0 0 60px rgba(77,163,255,0.07)" }} />

          {/* Radial glow orbs */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #4DA3FF 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute -bottom-20 right-10 w-56 h-56 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #70B7FF 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #2688E8 0%, transparent 70%)" }} />

          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-semibold uppercase tracking-wider text-[#8C98A5] mb-1.5">
                <span>Total Portfolio Net Worth</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" style={{ boxShadow: "0 0 6px #4DA3FF" }} />
                <span className="text-[#8C98A5]">Solana Account</span>
              </div>

              <div className="flex items-baseline space-x-3">
                {/* Balance with blue neon gradient */}
                <span
                  className="text-4xl sm:text-5xl font-extrabold tracking-tight font-num tabular-nums"
                  style={{
                    background: "linear-gradient(90deg, #F4F6F8 30%, #70B7FF 70%, #4DA3FF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 12px rgba(77,163,255,0.25))",
                  }}
                >
                  ${(hoveredChartValue ?? totalNetWorth).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                {hoveredChartValue !== null && (
                  <span className="text-xs font-num uppercase bg-[#12283D] text-[#4DA3FF] px-2 py-0.5 rounded border border-[#4DA3FF]/30"
                    style={{ boxShadow: "0 0 8px rgba(77,163,255,0.15)" }}>
                    Previewing
                  </span>
                )}
              </div>

              {/* 24h PnL badge */}
              <div className="flex items-center space-x-3 mt-3">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#0B2A20] text-[#22C55E] border border-[#22C55E]/30">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="font-num tabular-nums">+$1,240.50 (+4.82%)</span>
                </div>
                <span className="text-xs text-[#8C98A5] font-medium">Past 24 hours</span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full md:w-auto">
              {[
                { label: "Receive", icon: ArrowDownLeft, action: () => setActiveModal("receive") },
                { label: "Send",    icon: ArrowUpRight,  action: () => setActiveModal("send")    },
                { label: "Swap",    icon: ArrowLeftRight, action: () => setActiveModal("swap")   },
                { label: "Stake",   icon: Zap,           action: () => setActiveModal("stake")   },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  className="flex flex-col items-center justify-center p-3 sm:px-5 sm:py-3.5 rounded-xl border border-[#21435F] transition duration-150 active:scale-95 group"
                  style={{
                    background: "linear-gradient(145deg,#12283D,#0f2236)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(77,163,255,0.5)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(77,163,255,0.12), 0 2px 12px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#21435F";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
                  }}
                >
                  <btn.icon className="w-5 h-5 text-[#CACFD5] group-hover:text-[#4DA3FF] transition mb-1.5" />
                  <span className="text-[11px] font-semibold text-[#CACFD5] group-hover:text-[#F4F6F8] tracking-wide">
                    {btn.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. MAIN PERFORMANCE CHART & ASSET ALLOCATION */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 rounded-2xl bg-[#0D1E30] border border-[#18344D] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#18344D]">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#4DA3FF]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#CACFD5]">
                  Performance History
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-[#081522] p-0.5 rounded-lg border border-[#18344D]">
                {(["1D", "1W", "1M", "1Y", "ALL"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                      timeframe === tf
                        ? "bg-[#12283D] text-[#4DA3FF] font-semibold border border-[#21435F]"
                        : "text-[#8C98A5] hover:text-[#F4F6F8]"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-2">
              <PerformanceAreaChart
                data={PERFORMANCE_DATA[timeframe]}
                onHoverValue={(val) => setHoveredChartValue(val)}
              />
            </div>
          </div>

          {/* Asset Allocation Breakdown */}
          <div className="rounded-2xl bg-[#0D1E30] border border-[#18344D] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#18344D]">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#70B7FF]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#CACFD5]">
                    Asset Allocation
                  </span>
                </div>
                <span className="text-[11px] font-num text-[#8C98A5]">
                  {tokens.length} Assets
                </span>
              </div>

              {/* Segmented Distribution Bar */}
              <div className="mt-5 space-y-2">
                <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-[#081522] p-0.5 gap-0.5 border border-[#18344D]">
                  {allocation.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full rounded-sm transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                      title={`${item.label}: ${item.percent.toFixed(1)}%`}
                    />
                  ))}
                </div>
              </div>

              {/* Breakdown Legend */}
              <div className="mt-6 space-y-2.5">
                {allocation.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[#CACFD5] font-medium">{item.label}</span>
                    </div>
                    <span className="font-num text-[#8C98A5] font-semibold tabular-nums">
                      {item.percent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Staking Yield Promo */}
            <div className="mt-5 p-3 rounded-xl bg-[#12283D] border border-[#21435F] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#21435F]/60 flex items-center justify-center text-[#4DA3FF]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#F4F6F8]">Liquid Staking Yield</div>
                  <div className="text-[10px] text-[#8C98A5]">Earn up to 7.85% APY</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal("stake")}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#4DA3FF] hover:bg-[#70B7FF] text-[#081522] transition"
              >
                Stake
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. TABBED VIEWS (Tokens, Staking & Yield, Activity) */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between border-b border-[#18344D] mb-6">
            <div className="flex items-center space-x-2 sm:space-x-6">
              {[
                { id: "tokens", label: "Tokens", icon: Coins, count: tokens.length },
                { id: "staking", label: "Staking & Yield", icon: Shield, count: staking.length },
                { id: "activity", label: "Activity", icon: Activity, count: transactions.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`relative flex items-center space-x-2 py-3 px-3 text-xs sm:text-sm font-semibold transition ${
                      isActive ? "text-[#4DA3FF]" : "text-[#8C98A5] hover:text-[#CACFD5]"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] font-num px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-[#4DA3FF]/15 text-[#4DA3FF]" : "bg-[#12283D] text-[#8C98A5]"
                      }`}
                    >
                      {tab.count}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4DA3FF]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {activeTab === "tokens" && (
              <div className="relative hidden sm:block">
                <Search className="w-3.5 h-3.5 text-[#8C98A5] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter token name..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-[#0D1E30] border border-[#21435F] text-xs text-[#F4F6F8] pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-[#4DA3FF] w-44 transition"
                />
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* SUB-VIEW 1: TOKENS TABLE */}
            {activeTab === "tokens" && (
              <motion.div
                key="tokens-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <div className="rounded-2xl bg-[#0D1E30] border border-[#18344D] overflow-hidden">
                  <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#8C98A5] border-b border-[#18344D]">
                    <div className="col-span-5 sm:col-span-4">Asset</div>
                    <div className="col-span-3 sm:col-span-2 text-right pr-2">Price</div>
                    <div className="hidden sm:flex sm:col-span-3 justify-end pr-3">24h Change</div>
                    <div className="col-span-4 sm:col-span-2 text-right">Holdings</div>
                    <div className="hidden sm:block sm:col-span-1 text-center">Action</div>
                  </div>

                  <div className="divide-y divide-[#18344D]">
                    {filteredTokens.map((token) => {
                      const isExpanded = expandedTokenMint === token.mint;
                      const holdingUsd = token.balance * token.priceUsd;
                      const isPositive = token.change24h >= 0;

                      return (
                        <div key={token.mint} className="transition-colors hover:bg-[#12283D]">
                          <div
                            onClick={() =>
                              setExpandedTokenMint(isExpanded ? null : token.mint)
                            }
                            className="grid grid-cols-12 items-center px-5 py-4 cursor-pointer select-none"
                          >
                            <div className="col-span-5 sm:col-span-4 flex items-center space-x-3">
                              <div
                                className={`w-9 h-9 rounded-xl ${token.iconBg} flex items-center justify-center font-bold text-white shadow-sm text-xs`}
                              >
                                {token.symbol.slice(0, 3)}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-[#F4F6F8] flex items-center space-x-1.5">
                                  <span>{token.name}</span>
                                  <span className="text-xs text-[#8C98A5] font-num">
                                    {token.symbol}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#8C98A5] font-num sm:hidden">
                                  {token.balance.toLocaleString()} {token.symbol}
                                </div>
                              </div>
                            </div>

                            {/* Price with JetBrains Mono */}
                            <div className="col-span-3 sm:col-span-2 text-right font-num text-sm font-medium tabular-nums text-[#F4F6F8] pr-2">
                              ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(2)}
                            </div>

                            {/* 24h Change & Sparkline */}
                            <div className="hidden sm:flex sm:col-span-3 items-center justify-end space-x-2.5 pr-3">
                              <Sparkline data={token.sparkline} isPositive={isPositive} width={54} height={20} />
                              <span
                                className={`font-num text-xs font-semibold tabular-nums ${
                                  isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
                                }`}
                              >
                                {isPositive ? "+" : ""}
                                {token.change24h.toFixed(2)}%
                              </span>
                            </div>

                            {/* Holdings Value */}
                            <div className="col-span-4 sm:col-span-2 text-right">
                              <div className="text-sm font-semibold font-num text-[#F4F6F8] tabular-nums">
                                ${holdingUsd.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                              <div className="text-xs text-[#8C98A5] font-num tabular-nums">
                                {token.balance.toLocaleString()} {token.symbol}
                              </div>
                            </div>

                            <div className="hidden sm:flex sm:col-span-1 items-center justify-center text-[#8C98A5]">
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180 text-[#4DA3FF]" : ""
                                }`}
                              />
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden bg-[#081522] border-t border-[#18344D] px-6 py-4"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="text-[11px] text-[#8C98A5] font-semibold uppercase tracking-wider">
                                      SPL Token Mint Address
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <code className="text-xs font-num text-[#CACFD5] bg-[#0D1E30] px-2 py-1 rounded border border-[#21435F]">
                                        {token.mint}
                                      </code>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(token.mint);
                                        }}
                                        className="p-1 hover:bg-[#18344D] rounded text-[#8C98A5] hover:text-[#F4F6F8] transition"
                                        title="Copy Mint"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                      <a
                                        href={`https://solscan.io/token/${token.mint}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center space-x-1 text-xs text-[#4DA3FF] hover:underline"
                                      >
                                        <span>Solscan</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTokenForAction(token);
                                        setActiveModal("send");
                                      }}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#12283D] hover:bg-[#18344D] text-[#CACFD5] border border-[#21435F] transition"
                                    >
                                      Send {token.symbol}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTokenForAction(token);
                                        setActiveModal("swap");
                                      }}
                                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#4DA3FF] hover:bg-[#70B7FF] text-[#081522] transition"
                                    >
                                      Instant Swap
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-VIEW 2: STAKING & YIELD */}
            {activeTab === "staking" && (
              <motion.div
                key="staking-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-[#0D1E30] border border-[#18344D]">
                    <div className="text-[11px] uppercase font-semibold text-[#8C98A5] mb-1">
                      Total Active Stake
                    </div>
                    <div className="text-2xl font-bold font-num text-[#F4F6F8] tabular-nums">
                      47.50 SOL
                    </div>
                    <div className="text-xs text-[#8C98A5] mt-1 font-num">~$7,060.87 USD</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0D1E30] border border-[#18344D]">
                    <div className="text-[11px] uppercase font-semibold text-[#8C98A5] mb-1">
                      Accrued Staking Rewards
                    </div>
                    <div className="text-2xl font-bold font-num text-[#22C55E] tabular-nums">
                      +2.00 SOL
                    </div>
                    <div className="text-xs text-[#8C98A5] mt-1 font-num">Auto-compounding</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0D1E30] border border-[#18344D]">
                    <div className="text-[11px] uppercase font-semibold text-[#8C98A5] mb-1">
                      Average Network APY
                    </div>
                    <div className="text-2xl font-bold font-num text-[#4DA3FF] tabular-nums">
                      7.71%
                    </div>
                    <div className="text-xs text-[#22C55E] mt-1 font-num">MEV Boost Included</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0D1E30] border border-[#18344D] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#18344D] flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#CACFD5]">
                      Active Delegations
                    </span>
                    <button
                      onClick={() => setActiveModal("stake")}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#4DA3FF] hover:bg-[#70B7FF] text-[#081522] transition flex items-center space-x-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Stake More SOL</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#18344D]">
                    {staking.map((pos) => (
                      <div
                        key={pos.validatorAddress}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#12283D] transition"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#12283D] border border-[#21435F] flex items-center justify-center text-[#4DA3FF] font-bold">
                            <Shield className="w-5 h-5 text-[#4DA3FF]" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[#F4F6F8]">
                              {pos.validatorName}
                            </div>
                            <div className="text-xs font-num text-[#8C98A5]">
                              Vote: {pos.voteAccount.slice(0, 8)}...
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 sm:gap-10 text-right sm:text-left">
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-[#8C98A5]">
                              Stake
                            </div>
                            <div className="font-num text-sm font-bold text-[#F4F6F8] tabular-nums">
                              {pos.stakeSol.toFixed(2)} SOL
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-[#8C98A5]">
                              APY
                            </div>
                            <div className="font-num text-sm font-bold text-[#22C55E] tabular-nums">
                              {pos.apyPercent}%
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-[#8C98A5]">
                              Accrued
                            </div>
                            <div className="font-num text-sm font-bold text-[#4DA3FF] tabular-nums">
                              +{pos.rewardsAccruedSol} SOL
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => alert("De-stake requested for " + pos.validatorName)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#12283D] hover:bg-[#18344D] text-[#CACFD5] border border-[#21435F] transition"
                          >
                            De-stake
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-VIEW 3: ACTIVITY / TRANSACTION HISTORY */}
            {activeTab === "activity" && (
              <motion.div
                key="activity-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl bg-[#0D1E30] border border-[#18344D] overflow-hidden divide-y divide-[#18344D]"
              >
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#12283D] transition"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tx.type === "swap"
                            ? "bg-[#4DA3FF]/15 text-[#4DA3FF]"
                            : tx.type === "receive"
                            ? "bg-[#0B2A20] text-[#22C55E]"
                            : tx.type === "stake"
                            ? "bg-[#12283D] text-[#70B7FF]"
                            : "bg-[#301619] text-[#EF4444]"
                        }`}
                      >
                        {tx.type === "swap" && <ArrowLeftRight className="w-4 h-4" />}
                        {tx.type === "receive" && <ArrowDownLeft className="w-4 h-4" />}
                        {tx.type === "send" && <ArrowUpRight className="w-4 h-4" />}
                        {tx.type === "stake" && <Zap className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-[#F4F6F8]">{tx.description}</div>
                        <div className="flex items-center space-x-2 text-xs text-[#8C98A5] font-num mt-0.5">
                          <span>{tx.timestamp}</span>
                          <span>•</span>
                          <a
                            href={`https://solscan.io/tx/${tx.signature}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#8C98A5] hover:text-[#4DA3FF] flex items-center space-x-0.5"
                          >
                            <span>{tx.signature}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-num text-sm font-bold tabular-nums tracking-tight ${
                          tx.amount.startsWith("+") ? "text-[#22C55E]" : "text-[#F4F6F8]"
                        }`}
                      >
                        {tx.amount}
                      </div>
                      <div className="text-[10px] tracking-wider text-[#22C55E] uppercase font-semibold">
                        Confirmed
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE ACTION MODALS (Send, Receive, Swap, Stake) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081522]/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md rounded-2xl bg-[#0D1E30] border border-[#21435F] shadow-2xl p-6 overflow-hidden"
            >
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedTokenForAction(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8C98A5] hover:text-[#F4F6F8] hover:bg-[#12283D] transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* RECEIVE MODAL */}
              {activeModal === "receive" && (
                <div className="text-center space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#F4F6F8]">Receive SOL & SPL Tokens</h3>
                    <p className="text-xs text-[#8C98A5]">
                      Send only Solana network assets to this deposit address.
                    </p>
                  </div>

                  <div className="mx-auto w-52 h-52 bg-white p-3 rounded-2xl shadow-md flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <rect width="100" height="100" fill="white" />
                      <path
                        d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M22,22 h6 v6 h-6 z"
                        fill="black"
                      />
                      <path
                        d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M72,22 h6 v6 h-6 z"
                        fill="black"
                      />
                      <path
                        d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M22,72 h6 v6 h-6 z"
                        fill="black"
                      />
                      <rect x="45" y="15" width="8" height="8" fill="black" />
                      <rect x="45" y="30" width="8" height="15" fill="black" />
                      <rect x="55" y="55" width="12" height="12" fill="black" />
                      <rect x="75" y="55" width="15" height="8" fill="black" />
                      <rect x="50" y="75" width="20" height="15" fill="black" />
                    </svg>
                  </div>

                  <div className="p-3 bg-[#081522] border border-[#21435F] rounded-xl flex items-center justify-between">
                    <span className="font-num text-xs text-[#CACFD5] break-all select-all">
                      {walletPubkey}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="ml-2 p-2 bg-[#12283D] hover:bg-[#18344D] text-[#4DA3FF] rounded-lg transition"
                    >
                      {copiedAddress ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* SEND MODAL */}
              {activeModal === "send" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#F4F6F8]">Send Assets</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-[#8C98A5] mb-1 block">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        placeholder="Solana address or .sol domain"
                        className="w-full bg-[#081522] border border-[#21435F] focus:border-[#4DA3FF] rounded-xl px-3.5 py-2.5 text-xs font-num text-[#F4F6F8] focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold uppercase text-[#8C98A5] mb-1">
                        <span>Amount</span>
                        <span className="font-num">
                          Balance: {selectedTokenForAction?.balance ?? 48.34}{" "}
                          {selectedTokenForAction?.symbol ?? "SOL"}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0.00"
                          className="w-full bg-[#081522] border border-[#21435F] focus:border-[#4DA3FF] rounded-xl px-3.5 py-2.5 text-sm font-num text-[#F4F6F8] focus:outline-none transition"
                        />
                        <button
                          onClick={() => {}}
                          className="absolute right-2.5 top-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#12283D] hover:bg-[#18344D] text-[#4DA3FF] transition"
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        alert("Transaction broadcasted to Solana validator network!");
                        setActiveModal(null);
                      }}
                      className="w-full py-3 mt-2 rounded-xl bg-[#4DA3FF] hover:bg-[#70B7FF] font-bold text-[#081522] text-sm transition"
                    >
                      Sign & Send Transaction
                    </button>
                  </div>
                </div>
              )}

              {/* SWAP MODAL */}
              {activeModal === "swap" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#F4F6F8]">Instant Swap</h3>
                    <span className="text-[11px] font-num text-[#4DA3FF] flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
                      <span>Best Route: Jupiter v6</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#081522] border border-[#21435F] space-y-2">
                    <div className="flex justify-between text-[11px] text-[#8C98A5] font-semibold uppercase">
                      <span>You Pay</span>
                      <span className="font-num">Balance: 48.34 SOL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        defaultValue="2.5"
                        className="bg-transparent font-num text-xl font-bold text-[#F4F6F8] focus:outline-none w-1/2 tabular-nums"
                      />
                      <div className="flex items-center space-x-2 bg-[#12283D] px-2.5 py-1.5 rounded-xl border border-[#21435F]">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] text-[10px] flex items-center justify-center font-bold text-white">
                          S
                        </div>
                        <span className="text-xs font-bold text-[#F4F6F8]">SOL</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center -my-2 relative z-10">
                    <button className="p-2 rounded-full bg-[#0D1E30] border border-[#21435F] hover:border-[#4DA3FF] text-[#CACFD5] hover:text-white transition shadow-sm">
                      <ArrowLeftRight className="w-4 h-4 rotate-90" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#081522] border border-[#21435F] space-y-2">
                    <div className="flex justify-between text-[11px] text-[#8C98A5] font-semibold uppercase">
                      <span>You Receive (Estimated)</span>
                      <span className="font-num">Balance: 4,250.00 USDC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        readOnly
                        value="371.62"
                        className="bg-transparent font-num text-xl font-bold text-[#4DA3FF] focus:outline-none w-1/2 tabular-nums"
                      />
                      <div className="flex items-center space-x-2 bg-[#12283D] px-2.5 py-1.5 rounded-xl border border-[#21435F]">
                        <div className="w-5 h-5 rounded-full bg-[#2775CA] text-[10px] flex items-center justify-center font-bold text-white">
                          $
                        </div>
                        <span className="text-xs font-bold text-[#F4F6F8]">USDC</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#8C98A5] border-t border-[#18344D] pt-3">
                    <div className="flex justify-between">
                      <span>Rate</span>
                      <span className="font-num text-[#CACFD5]">1 SOL ≈ 148.65 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price Impact</span>
                      <span className="font-num text-[#22C55E]">&lt; 0.01%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slippage Tolerance</span>
                      <span className="font-num text-[#CACFD5]">0.5% (Dynamic)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      alert("Swap executed successfully via Jupiter!");
                      setActiveModal(null);
                    }}
                    className="w-full py-3 rounded-xl bg-[#4DA3FF] hover:bg-[#70B7FF] font-bold text-[#081522] text-sm transition"
                  >
                    Confirm Swap
                  </button>
                </div>
              )}

              {/* STAKE MODAL */}
              {activeModal === "stake" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#F4F6F8]">Stake SOL</h3>
                  <p className="text-xs text-[#8C98A5]">
                    Delegate your SOL to high-reputation validators and earn compounding staking rewards with zero lockup using Liquid Staking.
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#081522] border border-[#21435F] space-y-2">
                    <div className="flex justify-between text-[11px] text-[#8C98A5] font-semibold uppercase">
                      <span>Amount to Stake</span>
                      <span className="font-num">Available: 48.34 SOL</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="10.0"
                        className="w-full bg-transparent font-num text-xl font-bold text-[#F4F6F8] focus:outline-none tabular-nums"
                      />
                      <span className="absolute right-0 top-1 text-xs font-bold text-[#8C98A5]">
                        SOL
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#12283D] border border-[#21435F] flex items-center justify-between text-xs">
                    <span className="text-[#8C98A5]">Validator</span>
                    <span className="font-bold text-[#4DA3FF]">Jito Labs (MEV Optimized)</span>
                  </div>

                  <button
                    onClick={() => {
                      alert("Stake delegated successfully!");
                      setActiveModal(null);
                    }}
                    className="w-full py-3 rounded-xl bg-[#4DA3FF] hover:bg-[#70B7FF] font-bold text-[#081522] text-sm transition"
                  >
                    Delegate Stake
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

