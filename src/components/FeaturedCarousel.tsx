import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  PenSquare, 
  ThumbsUp, 
  MessageSquare, 
  Eye, 
  Sparkles, 
  Calendar, 
  User, 
  TrendingUp,
  Award
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { AppItem, CommentItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

// Dynamic LucideIcon resolver
function DynamicIcon({ name, className = "w-5 h-5 text-indigo-400" }: { name: string; className?: string }) {
  const pascalName = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const IconComponent = (LucideIcons as any)[pascalName] || (LucideIcons as any)[name] || LucideIcons.Smartphone;
  return <IconComponent className={className} />;
}

interface FeaturedCarouselProps {
  apps: AppItem[];
  comments: { [appId: string]: CommentItem[] };
  likedApps: string[];
  onRun: (app: AppItem) => void;
  onTweak: (app: AppItem) => void;
  onLike: (appId: string) => void;
}

export default function FeaturedCarousel({
  apps,
  comments,
  likedApps,
  onRun,
  onTweak,
  onLike,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [autoplayActive, setAutoplayActive] = useState(true);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute 30 days window and build sorted engagement rankings
  const featuredDetails = useMemo(() => {
    if (apps.length === 0) return { list: [], isFallback: false };

    // Reference time in system metadata: 2026-06-06T16:36:37Z
    const nowTime = new Date("2026-06-06T16:36:37Z").getTime();
    const thirtyDaysAgo = nowTime - 30 * 24 * 60 * 60 * 1000;

    // Calculate score: Likes * 10 + Views * 2 + comments * 15
    const scoredApps = apps.map((app) => {
      const likes = app.likesCount || 0;
      const views = app.viewsCount || 0;
      const commentCount = (comments[app.id] || []).length;
      const engagementScore = likes * 10 + views * 2 + commentCount * 15;
      return {
        app,
        engagementScore,
        likes,
        views,
        commentCount,
      };
    });

    // 1st Priority: engagement within the last 30 days
    const recentScored = scoredApps.filter((item) => {
      const createdTime = new Date(item.app.createdAt).getTime();
      return createdTime >= thirtyDaysAgo;
    });

    recentScored.sort((a, b) => b.engagementScore - a.engagementScore);

    let list = recentScored.slice(0, 5);
    let isFallback = false;

    // Gracefully fallback to overall top apps if insufficient recent engagement
    if (list.length < 3) {
      const allScored = [...scoredApps].sort((a, b) => b.engagementScore - a.engagementScore);
      list = allScored.slice(0, 5);
      isFallback = true;
    }

    return {
      list,
      isFallback,
    };
  }, [apps, comments]);

  // Autoplay handler
  useEffect(() => {
    if (!autoplayActive || featuredDetails.list.length <= 1) {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
      return;
    }

    autoplayTimerRef.current = setInterval(() => {
      setDirection("next");
      setCurrentIndex((prev) => (prev + 1) % featuredDetails.list.length);
    }, 6000);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [autoplayActive, featuredDetails.list.length]);

  if (apps.length === 0 || featuredDetails.list.length === 0) {
    return null;
  }

  const currentItem = featuredDetails.list[currentIndex];
  if (!currentItem) return null;

  const { app, engagementScore, likes, views, commentCount } = currentItem;
  const isCurrentlyLiked = likedApps.includes(app.id);

  const prevSlide = () => {
    setDirection("prev");
    setCurrentIndex((prev) => (prev - 1 + featuredDetails.list.length) % featuredDetails.list.length);
  };

  const nextSlide = () => {
    setDirection("next");
    setCurrentIndex((prev) => (prev + 1) % featuredDetails.list.length);
  };

  // Slide transition animation config
  const slideVariants = {
    enter: (dir: "next" | "prev") => ({
      x: dir === "next" ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      },
    },
    exit: (dir: "next" | "prev") => ({
      x: dir === "next" ? -300 : 300,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  return (
    <div 
      className="relative mb-6 rounded-3xl border border-indigo-950/20 shadow-xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900/40 text-slate-100 font-sans group/carousel"
      onMouseEnter={() => setAutoplayActive(false)}
      onMouseLeave={() => setAutoplayActive(true)}
      id="featured-apps-carousel"
    >
      {/* Decorative ambient backdrop shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Structured header bar */}
      <div className="px-6 py-4 border-b border-indigo-950/40 flex items-center justify-between relative z-10 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Trending & Engagement Leaders
              </h3>
              {featuredDetails.isFallback ? (
                <span className="bg-slate-800 text-slate-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700/50">
                  All-Time Top
                </span>
              ) : (
                <span className="bg-indigo-500/25 text-indigo-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Last 30 Days
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Dynamically promoted through physical community interactions</p>
          </div>
        </div>

        {/* Scoring rank indices indicators */}
        <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1 rounded-full border border-white/5 text-[10.5px]">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300">Ecosystem Rank:</span>
          <span className="font-mono font-bold text-amber-300">#{currentIndex + 1}</span>
          <span className="text-slate-500 px-0.5">|</span>
          <span className="text-slate-400">Score: {engagementScore} pts</span>
        </div>
      </div>

      <div className="p-6 md:p-8 min-h-[300px] relative z-10">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={app.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
          >
            {/* Visual description segment - Row 7 columns spacing */}
            <div className="md:col-span-7 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-indigo-500/30 capitalize">
                  {app.category || "Utility"}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/30 capitalize">
                  {app.platform || "Cross-platform"}
                </span>
              </div>

              <div>
                <h2 className="text-lg md:text-2xl font-display font-extrabold text-white leading-tight flex items-center gap-3">
                  <DynamicIcon name={app.icon || "smartphone"} className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
                  <span>{app.title}</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-300 mt-2.5 leading-relaxed max-w-2xl">
                  {app.description}
                </p>
              </div>

              {/* Engagement statistics grid */}
              <div className="grid grid-cols-3 gap-2.5 max-w-md my-1 font-mono text-[10.5px]">
                <div className="bg-slate-950/60 p-2 py-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                  <ThumbsUp className={`w-4 h-4 ${isCurrentlyLiked ? "text-indigo-400 fill-indigo-400/20" : "text-slate-400"}`} />
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Likes</span>
                    <strong className="text-white text-xs">{likes} counts</strong>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2 py-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Feedbacks</span>
                    <strong className="text-white text-xs">{commentCount} posts</strong>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2 py-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Views</span>
                    <strong className="text-white text-xs">{views} scans</strong>
                  </div>
                </div>
              </div>

              {/* Creator details and interactive action triggers */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-3 border-t border-indigo-950/40">
                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    {app.creatorEmail || "Anonymous"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRun(app)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/10 font-sans"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Application</span>
                  </button>

                  <button
                    onClick={() => onTweak(app)}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 px-2.5 py-2.5 rounded-xl transition cursor-pointer border border-white/5 font-sans"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>Tweak Design</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right graphic mockup column */}
            <div className="md:col-span-5 h-[240px] md:h-full relative flex items-center justify-center p-3">
              {/* Card visual showcase */}
              <div className="w-full max-w-[280px] aspect-[4/5] md:aspect-auto md:h-[230px] rounded-2xl bg-gradient-to-tr from-slate-950 to-indigo-950 border border-indigo-500/20 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
                {/* Aesthetic concentric grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
                <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl group-hover:scale-125 transition duration-500" />

                <div className="flex justify-between items-start relative z-10">
                  <div className="p-3 bg-indigo-500/15 rounded-xl border border-indigo-400/20">
                    <DynamicIcon name={app.icon || "smartphone"} className="w-7 h-7 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15">
                      ACTIVE RUN
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" /> +{engagementScore} pts
                    </span>
                  </div>
                </div>

                <div className="relative z-10 text-left mt-auto">
                  <h4 className="font-display font-bold text-sm text-white line-clamp-1">{app.title}</h4>
                  <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                    {app.description}
                  </p>
                  
                  {/* Subtle active simulation line */}
                  <div className="mt-3.5 pt-2 border-t border-indigo-950/40 flex items-center justify-between text-[8px] text-indigo-400 font-mono uppercase tracking-wider">
                    <span>Virtual Simulator</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                      Live Ecosystem
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Carousel Switcher Controls & Dot Indicators */}
      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
        {/* Dot Indicators */}
        <div className="flex gap-1.5 pointer-events-auto">
          {featuredDetails.list.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? "next" : "prev");
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-indigo-500" : "w-1.5 bg-slate-700 hover:bg-slate-500"
              }`}
              title={`Jump to index ${idx + 1}`}
            />
          ))}
        </div>

        {/* Carousel buttons */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={prevSlide}
            className="w-8 h-8 rounded-full bg-slate-900/60 border border-white/5 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Previous Featured APP"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="w-8 h-8 rounded-full bg-slate-900/60 border border-white/5 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Next Featured APP"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
