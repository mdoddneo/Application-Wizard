import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Search,
  MessageSquare,
  ThumbsUp,
  Play,
  Copy,
  PenSquare,
  Check,
  Calendar,
  User,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { AppItem, CommentItem } from "../types";
import FeaturedCarousel from "./FeaturedCarousel";

const getCategoryIconAndColor = (cat: string) => {
  const c = cat.toLowerCase();
  
  if (c === "all") return { icon: LucideIcons.LayoutGrid || LucideIcons.HelpCircle, color: "bg-indigo-505/10 text-indigo-400 border-indigo-500/20" };
  if (c === "utility") return { icon: LucideIcons.Wrench || LucideIcons.HelpCircle, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
  if (c === "game" || c === "gaming") return { icon: LucideIcons.Gamepad2 || LucideIcons.HelpCircle, color: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  if (c === "productivity") return { icon: LucideIcons.Briefcase || LucideIcons.HelpCircle, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  if (c === "education") return { icon: LucideIcons.BookOpen || LucideIcons.HelpCircle, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  if (c === "creative" || c === "design") return { icon: LucideIcons.Paintbrush || LucideIcons.HelpCircle, color: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" };
  if (c === "lifestyle") return { icon: LucideIcons.Heart || LucideIcons.HelpCircle, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
  if (c === "social") return { icon: LucideIcons.Users || LucideIcons.HelpCircle, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
  
  return { icon: LucideIcons.Tag || LucideIcons.HelpCircle, color: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
};

const getCategoryDescriptor = (cat: string) => {
  const c = cat.toLowerCase();
  if (c === "all") return "View entire catalog";
  if (c === "utility") return "Helper tools & math computations";
  if (c === "game" || c === "gaming") return "Interactive puzzle & simulation plays";
  if (c === "productivity") return "Schedules, taskers & note summaries";
  if (c === "education") return "Study materials, logs & flashcards";
  if (c === "creative" || c === "design") return "UI styles, themes & mockups";
  if (c === "lifestyle") return "Habits, health indicators & trackers";
  if (c === "social") return "Chat screens, review feeds & logboards";
  return "Dynamic custom tag";
};

// Dynamic LucideIcon resolver
function DynamicIcon({ name, className = "w-5 h-5 text-indigo-400" }: { name: string; className?: string }) {
  const pascalName = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const IconComponent = (LucideIcons as any)[pascalName] || (LucideIcons as any)[name] || LucideIcons.Smartphone;
  return <IconComponent className={className} />;
}

interface MarketplaceProps {
  apps: AppItem[];
  comments: { [appId: string]: CommentItem[] };
  currentUserId?: string;
  onRun: (app: AppItem) => void;
  onTweak: (app: AppItem) => void;
  onLike: (appId: string) => void;
  onDelete: (appId: string) => void;
  onAddComment: (appId: string, commentText: string) => void;
  likedApps: string[];
}

export default function Marketplace({
  apps,
  comments,
  currentUserId,
  onRun,
  onTweak,
  onLike,
  onDelete,
  onAddComment,
  likedApps,
}: MarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);
  const [expandedCommentsAppId, setExpandedCommentsAppId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  const categories = useMemo(() => {
    const base = ["All", "Utility", "Game", "Productivity", "Education", "Creative", "Lifestyle"];
    const baseLower = base.map((b) => b.toLowerCase());
    
    // Harvest other categories present in existing applications
    const customCats: string[] = [];
    apps.forEach((app) => {
      if (app.category) {
        const cat = app.category.trim();
        const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
        
        if (
          !baseLower.includes(cat.toLowerCase()) && 
          !customCats.map((c) => c.toLowerCase()).includes(cat.toLowerCase())
        ) {
          customCats.push(formattedCat);
        }
      }
    });
    
    return [...base, ...customCats];
  }, [apps]);

  const categoryStats = useMemo(() => {
    const counts: { [key: string]: number } = { All: apps.length };
    
    apps.forEach((app) => {
      const cat = app.category ? app.category.trim() : "Utility";
      const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
      
      const matched = categories.find((c) => c.toLowerCase() === formattedCat.toLowerCase()) || "Utility";
      counts[matched] = (counts[matched] || 0) + 1;
    });
    
    categories.forEach((cat) => {
      if (cat !== "All" && !counts[cat]) {
        counts[cat] = 0;
      }
    });
    
    return counts;
  }, [apps, categories]);

  const filteredApps = apps.filter((app) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      app.title.toLowerCase().includes(term) ||
      app.description.toLowerCase().includes(term) ||
      app.prompt.toLowerCase().includes(term) ||
      (app.creatorEmail || "").toLowerCase().includes(term);
      
    const appCatNormalized = app.category ? app.category.trim().toLowerCase() : "";
    const selectedCatNormalized = selectedCategory.trim().toLowerCase();
    
    const matchesCategory =
      selectedCategory === "All" ||
      appCatNormalized === selectedCatNormalized ||
      (selectedCatNormalized === "utility" && !app.category);
      
    return matchesSearch && matchesCategory;
  });

  const handleCopyCode = (app: AppItem) => {
    navigator.clipboard.writeText(app.code);
    setCopiedAppId(app.id);
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent, appId: string) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(appId, newCommentText.trim());
    setNewCommentText("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            <span>Application Wizard Shared Marketplace</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Discover community constructed applications, review user feedbacks, copy layouts, or load them directly into the phone frame to tweak and customize!
          </p>
        </div>
      </div>

      {/* Featured Carousel showcasing top engagement */}
      <FeaturedCarousel
        apps={apps}
        comments={comments}
        likedApps={likedApps}
        onRun={onRun}
        onTweak={onTweak}
        onLike={onLike}
      />

      {/* Category Discovery Showcase Board */}
      <div className="bg-slate-900 relative rounded-2xl border border-slate-800 p-5 flex flex-col gap-4 text-slate-100 shadow-md overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950/90">
        {/* Ambient absolute vector glow */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5 relative z-10 font-sans">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-400/20">
              <LucideIcons.Compass className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs text-white">Category Discovery Hub</h3>
              <p className="text-[10px] text-slate-400">Dynamically compiled from active ecosystem app tags</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px]">
            <span className="text-slate-400">Current Tag Scope:</span>
            <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-bold px-2.5 py-0.5 rounded-full font-mono">
              {selectedCategory} ({categoryStats[selectedCategory] || 0} active)
            </span>
          </div>
        </div>

        {/* Categories Flex grid deck */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
          {categories.slice(0, 14).map((cat) => {
            const isSelected = selectedCategory === cat;
            const statsCount = categoryStats[cat] || 0;
            const { icon: CatIcon, color } = getCategoryIconAndColor(cat);
            const desc = getCategoryDescriptor(cat);

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-3.5 transition-all duration-200 cursor-pointer relative overflow-hidden group hover:scale-101 ${
                  isSelected
                    ? "bg-slate-950 border-indigo-500 shadow-md shadow-indigo-500/10 text-white"
                    : "bg-slate-900/40 border-slate-805 hover:border-slate-700 text-slate-300 hover:text-slate-100"
                }`}
              >
                {/* Visual hover color swipe */}
                <div className="absolute right-0 bottom-0 w-12 h-12 rounded-full bg-indigo-500/5 blur-lg group-hover:scale-150 transition-all duration-500" />
                
                <div className="flex items-center justify-between w-full">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${
                    isSelected ? "bg-indigo-500/20 text-indigo-350 border-indigo-500/30" : color
                  }`}>
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-indigo-500/30 text-indigo-200" : "bg-slate-800 text-slate-400"
                  }`}>
                    {statsCount}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className={`text-xs font-bold leading-tight font-display truncate ${
                    isSelected ? "text-indigo-300" : "text-white"
                  }`}>
                    {cat}
                  </h4>
                  <p className="text-[9px] text-slate-405 truncate mt-0.5" title={desc}>
                    {desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Panel: Filters & Search bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, description, category, or creator email..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none transition"
          />
        </div>

        {/* Category Pills Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition duration-150 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Apps */}
      {filteredApps.length === 0 ? (
        <div className="text-center p-16 border border-dashed border-slate-300 bg-white shadow-sm rounded-2xl">
          <p className="text-slate-500 font-medium">No shared applications found matching search criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to publish a custom tool in the community feed!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredApps.map((app) => {
            const appComments = comments[app.id] || [];
            const isLiked = likedApps.includes(app.id);
            const isCommentsExpanded = expandedCommentsAppId === app.id;

            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* App summary line */}
                <div className="p-5 flex flex-col sm:flex-row items-start gap-4">
                  {/* Icon wrapper */}
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                    <DynamicIcon name={app.icon || "smartphone"} className="w-6 h-6 text-indigo-600" />
                  </div>

                  {/* Text properties */}
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-slate-900 text-base">{app.title}</h3>
                        <span className="bg-slate-100 text-slate-650 text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-200 capitalize">
                          {(app.category || "General").toLowerCase()}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-emerald-100">
                          {app.platform || "Cross-platform"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{app.description}</p>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-3 font-mono">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {app.creatorEmail || "Anonymous Creator"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      {app.features && app.features.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-indigo-600 font-bold">Features:</span>
                          {app.features.slice(0, 3).map((f, i) => (
                            <span key={i} className="text-slate-600">
                              • {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary interactive controls */}
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <button
                      onClick={() => onRun(app)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition duration-150 shadow shadow-indigo-600/10 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Live</span>
                    </button>

                    <button
                      onClick={() => onTweak(app)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200/80 transition duration-150 cursor-pointer shadow-sm"
                    >
                      <PenSquare className="w-3.5 h-3.5" />
                      <span>Tweak Code</span>
                    </button>
                  </div>
                </div>

                {/* Sub-toolbar: likes, comments toggler, copy layout, delete */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
                  <div className="flex items-center gap-4">
                    {/* Like Action */}
                    <button
                      onClick={() => onLike(app.id)}
                      className={`flex items-center gap-1.5 font-bold transition duration-150 ${
                        isLiked ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-indigo-600/10" : ""}`} />
                      <span>{app.likesCount || 0}</span>
                    </button>

                    {/* Comment Count Toggler */}
                    <button
                      onClick={() => setExpandedCommentsAppId(isCommentsExpanded ? null : app.id)}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-slate-850 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{appComments.length} Feedbacks</span>
                      {isCommentsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Copy source block */}
                    <button
                      onClick={() => handleCopyCode(app)}
                      className="text-slate-500 hover:text-slate-805 flex items-center gap-1 transition-all"
                      title="Copy full HTML bundle code"
                    >
                      {copiedAppId === app.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy HTML</span>
                        </>
                      )}
                    </button>

                    {/* Delete block triggered only of user matches */}
                    {currentUserId && app.creatorId === currentUserId && (
                      <button
                        onClick={() => onDelete(app.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                        title="Delete published app"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Comment Feed Section */}
                {isCommentsExpanded && (
                  <div className="bg-slate-50/50 px-5 py-4 border-t border-slate-100 flex flex-col gap-4">
                    <span className="text-xs font-bold text-slate-800 font-mono">Community Feedbacks</span>

                    {/* List */}
                    <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto">
                      {appComments.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No feedback comments left yet. Write yours below!</p>
                      ) : (
                        appComments.map((comment) => (
                           <div key={comment.id} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                              <span className="text-indigo-600 font-semibold">{comment.userEmail}</span>
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-750">{comment.commentText}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Write comment input block */}
                    {currentUserId ? (
                      <form onSubmit={(e) => handleCommentSubmit(e, app.id)} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Provide supportive feedback, report bugs, or suggest updates..."
                          className="flex-1 bg-white border border-slate-205 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600/10 placeholder-slate-400"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl font-semibold transition cursor-pointer"
                        >
                          Submit
                        </button>
                      </form>
                    ) : (
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-100 text-center flex items-center justify-center gap-2 text-xs text-slate-500 font-mono shadow-inner">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Please authenticate session (Google Sync) to write review feedback.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
