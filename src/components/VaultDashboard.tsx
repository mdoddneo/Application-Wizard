import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  ThumbsUp,
  Eye,
  Activity,
  Award,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  Coins,
  DollarSign,
  Users,
  CheckCircle2,
  Percent,
  Wallet,
  Lock,
  ArrowDownRight,
  HelpCircle,
} from "lucide-react";
import { AppItem } from "../types";

interface VaultDashboardProps {
  apps: AppItem[];
  onTweak?: (app: AppItem) => void;
  onRun?: (app: AppItem) => void;
}

// Predefined illustrative showcase items
const demoApps: AppItem[] = [
  {
    id: "demo_1",
    title: "TaskMaster Pro",
    description: "A gorgeous modern task management suite with custom Kanban boards and workspace integration.",
    prompt: "",
    code: "",
    platform: "ios",
    category: "Productivity",
    icon: "check-square",
    creatorId: "demo",
    creatorEmail: "demo@appwizard.io",
    published: true,
    viewsCount: 142,
    likesCount: 38,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    features: [],
  },
  {
    id: "demo_2",
    title: "EcoTracker Daily",
    description: "Calculate your carbon footprint and log eco-friendly activities with nice charts.",
    prompt: "",
    code: "",
    platform: "android",
    category: "Lifestyle",
    icon: "leaf",
    creatorId: "demo",
    creatorEmail: "demo@appwizard.io",
    published: true,
    viewsCount: 310,
    likesCount: 82,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    features: [],
  },
  {
    id: "demo_3",
    title: "Retro Arcade Pong",
    description: "A neat retro style pong recreation with full touch controls and local highscores.",
    prompt: "",
    code: "",
    platform: "cross-platform",
    category: "Games",
    icon: "gamepad-2",
    creatorId: "demo",
    creatorEmail: "demo@appwizard.io",
    published: true,
    viewsCount: 685,
    likesCount: 214,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    features: [],
  }
];

export default function VaultDashboard({ apps, onTweak, onRun }: VaultDashboardProps) {
  // Config states
  const [filterType, setFilterType] = useState<"published" | "all">("published");
  const [chartType, setChartType] = useState<"timeline" | "comparison" | "royalties">("timeline");

  // Royalties simulation parameters
  const [adRateMultiplier, setAdRateMultiplier] = useState(1.0);
  const [licensingMultiplier, setLicensingMultiplier] = useState(1.0);
  const [claimedAmount, setClaimedAmount] = useState(0.0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimingTxReceipt, setClaimingTxReceipt] = useState("");
  
  // Isolate current user's genuine dashboard apps
  const userFilteredApps = useMemo(() => {
    return apps.filter((app) => (filterType === "published" ? app.published : true));
  }, [apps, filterType]);

  // Determine whether we should display demo simulation mode (defaults to True if user has no data)
  const [showDemoData, setShowDemoData] = useState(userFilteredApps.length === 0);

  // Auto-disable demo mode if the user suddenly adds fresh data, but allow manual toggle back and forth
  React.useEffect(() => {
    if (userFilteredApps.length > 0) {
      setShowDemoData(false);
    } else {
      setShowDemoData(true);
    }
  }, [userFilteredApps.length]);

  const activeAppsList = showDemoData ? demoApps : userFilteredApps;

  // Compute Aggregate Stats
  const stats = useMemo(() => {
    const totalApps = activeAppsList.length;
    const publishedApps = activeAppsList.filter((a) => a.published).length;
    const totalViews = activeAppsList.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
    const totalLikes = activeAppsList.reduce((sum, a) => sum + (a.likesCount || 0), 0);
    const engagementRatio = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : "0.0";

    return {
      totalApps,
      publishedApps,
      totalViews,
      totalLikes,
      engagementRatio,
    };
  }, [activeAppsList]);

  // Compute Royalties Specific Metrics
  const royaltiesStats = useMemo(() => {
    let totalGoogleUsageFees = 0;
    let totalCreatorAdsShare = 0;
    let totalCombinedEarned = 0;
    let sumInnovationScores = 0;

    const appsWithRoyalties = activeAppsList.map((app) => {
      const views = app.viewsCount || 0;
      const likes = app.likesCount || 0;
      const descLen = app.description ? app.description.trim().split(/\s+/).length : 0;
      const titleLen = app.title ? app.title.length : 0;
      
      // Dynamic Innovation Index formula using human parameters
      const score = Math.min(
        99,
        Math.round(62 + (likes * 1.8) + (views * 0.05) + (titleLen * 0.3) + (descLen * 0.15))
      );
      
      sumInnovationScores += score;

      let tier: "Gold" | "Silver" | "Bronze" = "Bronze";
      let licenseFeeRate = 0.08; // Base rate per view paid by Google
      if (score >= 90) {
        tier = "Gold";
        licenseFeeRate = 0.28; // Gold valuation
      } else if (score >= 75) {
        tier = "Silver";
        licenseFeeRate = 0.16; // Silver premium rate
      }

      // Ad Monetization Revenue (assuming Google advertising) with adjustable rate multiplier
      const directAdRevenue = ((views * 0.06) + (likes * 0.35)) * adRateMultiplier;
      const creatorDirectShare = directAdRevenue * 0.80; // keep 80%

      // Google Innovation/Usage Royalty with adjustable licensing multiplier
      const googleUsageRoyaltyValue = views * licenseFeeRate * licensingMultiplier;

      // Group collective rebate bonus distribution representing "assumed Google placement"
      const groupRebateBonus = likes * 0.08 * adRateMultiplier; 

      const totalAppRoyalties = googleUsageRoyaltyValue + creatorDirectShare + groupRebateBonus;

      totalGoogleUsageFees += googleUsageRoyaltyValue;
      totalCreatorAdsShare += creatorDirectShare + groupRebateBonus;
      totalCombinedEarned += totalAppRoyalties;

      return {
        ...app,
        innovationScore: score,
        innovationTier: tier,
        googleRoyalty: googleUsageRoyaltyValue,
        adRoyalty: creatorDirectShare,
        collectiveRebate: groupRebateBonus,
        totalRoyalties: totalAppRoyalties,
      };
    });

    const averageInnovationScore = activeAppsList.length > 0 
      ? sumInnovationScores / activeAppsList.length 
      : 0;

    return {
      appsWithRoyalties,
      googleUsageFees: totalGoogleUsageFees,
      collectiveAdsShare: totalCreatorAdsShare,
      totalEarned: totalCombinedEarned,
      averageInnovationScore,
    };
  }, [activeAppsList, adRateMultiplier, licensingMultiplier]);

  // Handle simulated claiming of wallet funds
  const handleClaimAccrued = () => {
    setIsClaiming(true);
    setTimeout(() => {
      setIsClaiming(false);
      setClaimSuccess(true);
      const randomTx = "TX-AW-" + Math.floor(10000 + Math.random() * 90000);
      setClaimingTxReceipt(randomTx);
      setClaimedAmount(royaltiesStats.totalEarned);
    }, 1500);
  };

  // Generate responsive cumulative timeline points using existing creation timestamps
  const timelineData = useMemo(() => {
    if (activeAppsList.length === 0) return [];

    // Sort apps chronologically
    const sortedApps = [...activeAppsList].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const minTimestamp = new Date(sortedApps[0].createdAt).getTime();
    const maxTimestamp = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    // Build timeline window starting from earliest app creation or last 7 days (whichever range is logical)
    let startTimestamp = minTimestamp;
    if (maxTimestamp - minTimestamp > 30 * ONE_DAY) {
      startTimestamp = maxTimestamp - 30 * ONE_DAY;
    }
    if (maxTimestamp - startTimestamp < 7 * ONE_DAY) {
      startTimestamp = maxTimestamp - 7 * ONE_DAY;
    }

    const dateList: string[] = [];
    let currentStamp = startTimestamp;
    while (currentStamp <= maxTimestamp + ONE_DAY / 2) {
      dateList.push(new Date(currentStamp).toISOString().split("T")[0]);
      currentStamp += ONE_DAY;
    }

    // Map aggregate curves over intervals
    return dateList.map((dateStr) => {
      const boundaryDate = new Date(dateStr + "T23:59:59");
      let viewsCurve = 0;
      let likesCurve = 0;

      activeAppsList.forEach((app) => {
        const appCreated = new Date(app.createdAt);
        if (appCreated <= boundaryDate) {
          const rawViews = app.viewsCount || 0;
          const rawLikes = app.likesCount || 0;

          // Compute age at simulation timestamp vs now to smooth out historical growth
          const appLifespan = Math.max(ONE_DAY, Date.now() - appCreated.getTime());
          const currentElapsed = Math.max(0, boundaryDate.getTime() - appCreated.getTime());
          const lifeProgress = Math.min(1.0, currentElapsed / appLifespan);

          // Use acceleration curve to represent natural progressive traffic over time
          const exponentialMultiplier = Math.pow(lifeProgress, 1.6);
          viewsCurve += Math.round(rawViews * exponentialMultiplier);
          likesCurve += Math.round(rawLikes * exponentialMultiplier);
        }
      });

      const dateLabel = new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        dateName: dateLabel,
        "Total Views": viewsCurve,
        "Total Likes": likesCurve,
      };
    });
  }, [activeAppsList]);

  // Generate bar chart data for distinct apps comparison
  const comparisonData = useMemo(() => {
    return activeAppsList.map((app) => ({
      name: app.title.length > 14 ? `${app.title.substring(0, 12)}...` : app.title,
      fullName: app.title,
      Views: app.viewsCount || 0,
      Likes: app.likesCount || 0,
      rawApp: app,
    }));
  }, [activeAppsList]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      {/* Dashboard Top Row and Navigation Controller */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-650 rounded-xl">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-lg">Portfolio Analytics & Royalties</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor and review your application's growth, total interaction, and custom Google-advertised royalty distributions.
              </p>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
          {/* Timeline vs Project bar vs Royalties togglers */}
          <div className="inline-flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold shadow-inner">
            <button
              onClick={() => setChartType("timeline")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === "timeline"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Timeline Growth
            </button>
            <button
              onClick={() => setChartType("comparison")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === "comparison"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              App Comparisons
            </button>
            <button
              onClick={() => setChartType("royalties")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                chartType === "royalties"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Royalties Dashboard</span>
            </button>
          </div>

          {/* Project Filters */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none transition shadow-sm cursor-pointer"
          >
            <option value="published">Published Only</option>
            <option value="all">All Vault Drafts</option>
          </select>

          {/* Demonstration Mode triggers */}
          {userFilteredApps.length > 0 && (
            <button
              onClick={() => setShowDemoData(!showDemoData)}
              className={`px-3 py-2 text-xs rounded-xl font-bold transition flex items-center gap-1 cursor-pointer border ${
                showDemoData
                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
              title="Toggle illustrative demo workspace dataset"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showDemoData ? "Show Mine" : "See Sandbox Demo"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Banner notification */}
      {showDemoData && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/85 p-4 rounded-2xl flex items-start gap-3 shadow-inner">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-800">Sandbox Interactive Simulation Active</div>
            <p className="text-[11px] text-amber-700/90 leading-relaxed mt-0.5">
              {userFilteredApps.length === 0
                ? "You do not have any published projects matching your current filter in your vault yet. We loaded interactive demo portfolio metrics below to showcase how you can track audience interaction and estimated royalties earnings!"
                : "Showing sample community portfolio statistics. Switch back to your own projects above to review live stats."}
            </p>
          </div>
        </div>
      )}

      {/* Grid of Key Bento Telemetry Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {chartType === "royalties" ? (
          <>
            {/* Box 1: Google Usage Licensing Fee */}
            <div className="bg-amber-50/65 border border-amber-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                  Google Usage Fee
                </span>
                <Sparkles className="w-4 h-4 text-amber-550 animate-pulse" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-amber-900 tracking-tight">
                  ${royaltiesStats.googleUsageFees.toFixed(2)}
                </div>
                <p className="text-[10px] text-amber-700/95 font-semibold mt-1">
                  Innovation licensing royalties
                </p>
              </div>
            </div>

            {/* Box 2: Ads Revenue Direct */}
            <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  Syndicated Ads Pool
                </span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-emerald-950 tracking-tight">
                  ${royaltiesStats.collectiveAdsShare.toFixed(2)}
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">
                  Ad placement share
                </p>
              </div>
            </div>

            {/* Box 3: Total Combined Royalties accrued */}
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm ring-2 ring-indigo-650/15">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-indigo-700 uppercase tracking-wider">
                  Accrued Royalties
                </span>
                <Coins className="w-4 h-4 text-indigo-600 animate-bounce" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-indigo-900 tracking-tight">
                  ${royaltiesStats.totalEarned.toFixed(2)}
                </div>
                <p className="text-[10px] text-indigo-600 font-bold mt-1">
                  Consolidated claimant balance
                </p>
              </div>
            </div>

            {/* Box 4: Converted likes to views ratio */}
            <div className="bg-pink-50/60 border border-pink-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-pink-700 uppercase tracking-wider">
                  Avg Innovation Index
                </span>
                <Award className="w-4 h-4 text-pink-500" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-pink-900 tracking-tight">
                  {royaltiesStats.averageInnovationScore.toFixed(1)}%
                </div>
                <p className="text-[10px] text-pink-650 mt-1 font-semibold">
                  {royaltiesStats.averageInnovationScore >= 85 ? "🏅 Premium Gold Standard" : "🥈 Advanced Silver Index"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Box 1: Apps count */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  {filterType === "published" ? "Published Assets" : "Total Assets"}
                </span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.publishedApps}</div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Active projects in feed
                </p>
              </div>
            </div>

            {/* Box 2: Total views */}
            <div className="bg-indigo-50/55 border border-indigo-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-indigo-650 uppercase tracking-wider">
                  Total Impression
                </span>
                <Eye className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-indigo-900 tracking-tight">{stats.totalViews}</div>
                <p className="text-[10px] text-indigo-500 mt-1">
                  Incremental views gathered
                </p>
              </div>
            </div>

            {/* Box 3: Total Likes */}
            <div className="bg-emerald-50/55 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                  Total Appreciation
                </span>
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-emerald-950 tracking-tight">{stats.totalLikes}</div>
                <p className="text-[10px] text-emerald-600 mt-1">
                  Total likes given by visitors
                </p>
              </div>
            </div>

            {/* Box 4: Converted likes to views ratio */}
            <div className="bg-pink-50/55 border border-pink-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-pink-700 uppercase tracking-wider">
                  Appreciation Rate
                </span>
                <Award className="w-4 h-4 text-pink-500" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-pink-900 tracking-tight">{stats.engagementRatio}%</div>
                <p className="text-[10px] text-pink-650 mt-1">
                  Views to appreciation ratio
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area: Recharts Canvas charts or Royalties Dashboard details */}
      <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 min-h-[300px] flex flex-col items-stretch justify-center">
        {activeAppsList.length === 0 ? (
          <div className="text-center p-12 flex flex-col items-center justify-center">
            <div className="bg-white border border-slate-200 p-3 rounded-full mb-3 shadow-md text-slate-400">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">No Projects in Analytics Scoop</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Publish some products or toggle filter options to pop up metrics here.
            </p>
          </div>
        ) : chartType === "royalties" ? (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            {/* Split layout: Interactive multipliers & Developers Collective information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              {/* Sliders settings */}
              <div className="flex flex-col gap-4 bg-slate-50 border border-slate-150 p-5 rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-display">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <span>Interactive Earnings Calculator</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Adjust simulation variables to forecast prospective revenues under different platform advertising placements and indexing options.
                  </p>
                </div>

                {/* Slider 1: Ad rate factor */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 font-mono">
                    <span>Ad Placement CPM Factor</span>
                    <span className="text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                      {adRateMultiplier.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={adRateMultiplier}
                    onChange={(e) => setAdRateMultiplier(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Low Traffic Rating</span>
                    <span>High Commercial Ad Bid</span>
                  </div>
                </div>

                {/* Slider 2: Google Innovation modifier */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 font-mono">
                    <span>Google Innovation Factor</span>
                    <span className="text-amber-650 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                      {licensingMultiplier.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={licensingMultiplier}
                    onChange={(e) => setLicensingMultiplier(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Standard Index Rate</span>
                    <span>High Uniqueness Licensing</span>
                  </div>
                </div>
              </div>

              {/* Developers Collective Pool status card */}
              <div className="flex flex-col justify-between bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-5 rounded-2xl relative overflow-hidden shadow-md">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-700 rounded-full blur-2xl opacity-25 pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-305 bg-indigo-850 px-2 py-0.5 rounded-full uppercase">
                      ● Developers Collective Syndicate
                    </span>
                    <Users className="w-4 h-4 text-indigo-300" />
                  </div>
                  <h4 className="text-base font-bold text-white mt-2 font-display">Paid Advertising Monetization Pool</h4>
                  <p className="text-[11.5px] text-indigo-100/80 leading-relaxed mt-2">
                    According to the joint royalty mechanism: direct creators claim <strong className="text-white font-extrabold">80% monetization shares</strong> of paid advertising traffic, while <strong className="text-white font-bold">20% splits</strong> to the Developers Collective Pool to safeguard group sustainability and reward active review providers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 border-t border-indigo-800/60 pt-3.5">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-300 uppercase block">Monetized Base</span>
                    <span className="text-xs font-bold text-white">418 Active Members</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-indigo-300 uppercase block">Group Utility Allocation</span>
                    <span className="text-xs font-bold text-emerald-400">+12.0% Spillover Rebate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consolidated developer wallet claim banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_60%)] pointer-events-none" />
              
              <div className="flex items-center gap-3.5 relative z-10 text-left">
                <div className="bg-gradient-to-tr from-amber-400 to-orange-500 p-3 rounded-xl text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  <Wallet className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-[9.5px] font-mono uppercase tracking-wider text-indigo-300">ACCUMULATED WALLET BALANCE</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-white tracking-tight">
                      ${Math.max(0, royaltiesStats.totalEarned - claimedAmount).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400">USD Ready</span>
                  </div>
                  <p className="text-[10px] text-slate-300/80 mt-1">
                    Based on verified Google licensing appraisal, audience impressions, and collective syndicate variables.
                  </p>
                </div>
              </div>

              <div className="relative shrink-0 z-10 w-full md:w-auto text-right">
                {claimSuccess ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Transferred to Wallet!</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block shrink-0">Receipt ID: {claimingTxReceipt}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleClaimAccrued}
                    disabled={isClaiming || royaltiesStats.totalEarned - claimedAmount <= 0.01}
                    className="w-full md:w-auto bg-gradient-to-r from-amber-450 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 px-5 py-2.5 rounded-xl font-bold text-xs transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isClaiming ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating Innovation...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 text-slate-950" />
                        <span>Claim Estimated Royalties</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* List Header: App appraisals */}
            <div className="border-t border-slate-100 pt-4 text-left">
              <h5 className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Product-Level Innovation & Royalty Appraisals</span>
              </h5>
              <p className="text-xs text-slate-400 mt-0.5">
                Google assesses royalties dynamically. Higher description complexity and citizen feedback boost your Index level tier.
              </p>
            </div>

            {/* Specific applications lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {royaltiesStats.appsWithRoyalties.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between gap-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition duration-150"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-205 px-1.5 py-0.5 rounded uppercase">
                            {app.category || "Utility"}
                          </span>
                          {app.published ? (
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-100">
                              PUBLISHED
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-200">
                              DRAFT
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-850 text-sm mt-2 font-display line-clamp-1">{app.title}</h4>
                      </div>

                      {/* Cumulative direct royalties */}
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono text-slate-400 block">ESTIMATED YIELD</span>
                        <span className="text-base font-extrabold text-indigo-700 mt-0.5 block">
                          ${app.totalRoyalties.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Innovation progress index bar */}
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-650">
                      <span>GOOGLE INDEX EVALUATION</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[8.5px] uppercase ${
                        app.innovationTier === "Gold"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : app.innovationTier === "Silver"
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                            : "bg-slate-100 text-slate-600 border border-slate-250"
                      }`}>
                        {app.innovationTier === "Gold" ? "🏅 Gold (" + app.innovationScore + "%)" : app.innovationTier === "Silver" ? "🥈 Silver (" + app.innovationScore + "%)" : "🥉 Bronze (" + app.innovationScore + "%)"}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          app.innovationTier === "Gold"
                            ? "bg-gradient-to-r from-amber-400 to-orange-400"
                            : app.innovationTier === "Silver"
                              ? "bg-gradient-to-r from-indigo-400 to-violet-400"
                              : "bg-slate-400"
                        }`}
                        style={{ width: `${app.innovationScore}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 leading-normal">
                      Evaluated on user likes ({app.likesCount || 0}), details length, and platform engagement index rules.
                    </span>
                  </div>

                  {/* Royalty Grid details breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-left text-[10px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-150/40">
                    <div>
                      <span className="text-slate-400 font-mono text-[8.5px] uppercase block">Platform Usage Licensing:</span>
                      <span className="font-bold text-slate-800">${app.googleRoyalty.toFixed(2)}</span>
                      <span className="text-slate-400 text-[9px] block">
                        ({app.viewsCount || 0} views • {app.innovationTier === "Gold" ? "$0.28" : app.innovationTier === "Silver" ? "$0.16" : "$0.08"}/view)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[8.5px] uppercase block">Syndicated Ads & Bonus:</span>
                      <span className="font-bold text-slate-800">
                        ${(app.adRoyalty + app.collectiveRebate).toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-[9px] block">
                        (Direct Likes and 12% syndicate distribution pool)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "timeline" ? (
                <AreaChart
                  data={timelineData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="dateName"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#1e293b",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", fontWeight: "600" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Total Views"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Total Likes"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLikes)"
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={comparisonData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#1e293b",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    }}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", fontWeight: "600" }}
                  />
                  <Bar dataKey="Views" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="Likes" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Dynamic Pro Tip Footer Section */}
      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="flex-1 text-left">
          <div className="text-xs font-bold text-slate-800">Royalty Optimization Guidelines</div>
          <p className="text-[11.5px] text-slate-600 leading-relaxed mt-0.5">
            Optimize your application's **Google Innovation Evaluator Score** by detailing feature tags and styling elements appropriately. Under active ad placement, items placed inside the Shared Marketplace increase cumulative royalties exponentially!
          </p>
        </div>
      </div>
    </div>
  );
}
