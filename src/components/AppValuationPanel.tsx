import React, { useState, useMemo, useEffect } from "react";
import { TrendingUp, Sparkles, DollarSign, Award, Info, RefreshCw, BarChart2, ShieldCheck, Zap } from "lucide-react";
import { AppItem } from "../types";

interface AppValuationPanelProps {
  app: AppItem;
}

export default function AppValuationPanel({ app }: AppValuationPanelProps) {
  const [isAppraising, setIsAppraising] = useState(false);
  const [appraisalHistory, setAppraisalHistory] = useState<Record<string, number>>({});

  // Trigger brief simulation effect when app description changes
  useEffect(() => {
    setIsAppraising(true);
    const timer = setTimeout(() => {
      setIsAppraising(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [app.description, app.title]);

  const handleManualRefresh = () => {
    setIsAppraising(true);
    setTimeout(() => {
      setIsAppraising(false);
    }, 800);
  };

  // Sophisticated heuristic scoring logic to read description + code and figure out uniqueness + value
  const valuationMetrics = useMemo(() => {
    const desc = app.description || "";
    const title = app.title || "";
    const code = app.code || "";
    
    // 1. Analyze word count & vocabulary redundancy of description
    const words = desc.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const uniqueWords = new Set(words);
    const wordCount = words.length;
    const vocabularyDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0;

    // 2. Scan for high-value/highly unique innovative keyword combinations
    const innovationKeywords = [
      { rx: /synth|sound|audio|audio-api|midi|instrument/i, score: 18, name: "Web Audio Processing", weight: 1.25 },
      { rx: /canvas|physics|engine|game|vector|gravity|render|render-loop/i, score: 15, name: "Interactive Physics render engine", weight: 1.2 },
      { rx: /ai|gemini|openai|agent|summariz|chat-bot|intelligent|model/i, score: 20, name: "Intelligent Generative Agent Integration", weight: 1.3 },
      { rx: /database|firestore|storage|persist|local-storage|auth|save/i, score: 12, name: "Persistent Cloud State architecture", weight: 1.15 },
      { rx: /math|algorithm|calc|formula|graph|chart|visualization|d3/i, score: 14, name: "Data Processing Math algorithm", weight: 1.18 },
      { rx: /kanban|ledger|budget|todo|tasker|productivity|organize/i, score: 10, name: "High-productivity organizational framework", weight: 1.1 },
      { rx: /theme|designer|colour|palette|customizer|variables|style/i, score: 8, name: "Custom styling visual variable systems", weight: 1.05 }
    ];

    let keywordWeightedSum = 0;
    const detectedInnovativeFeatures: string[] = [];
    
    innovationKeywords.forEach(keyword => {
      if (keyword.rx.test(desc) || keyword.rx.test(title)) {
        keywordWeightedSum += keyword.score;
        detectedInnovativeFeatures.push(keyword.name);
      }
    });

    // 3. Code complexity measurement
    const byteLengthLength = code.length;
    let codeComplexityMultiplier = 1.0;
    if (byteLengthLength > 40000) {
      codeComplexityMultiplier = 1.4;
    } else if (byteLengthLength > 20000) {
      codeComplexityMultiplier = 1.25;
    } else if (byteLengthLength > 10000) {
      codeComplexityMultiplier = 1.15;
    } else {
      codeComplexityMultiplier = 1.0;
    }

    // 4. Calculate Uniqueness score percentage (range 45% - 99%)
    const baseUniqueness = 45;
    const vocabularyBonus = Math.min(25, Math.round(vocabularyDiversity * 30));
    const keywordBonus = Math.min(20, keywordWeightedSum);
    const sizeBonus = Math.min(10, Math.round((wordCount / 100) * 5));
    
    const uniquenessScore = Math.min(99, baseUniqueness + vocabularyBonus + keywordBonus + sizeBonus);

    // 5. Calculate Valuation Worth (USD $) depending strictly on description size, novelty indicators and code metrics
    // Simple baseline rate
    const baseWorth = 1500; 
    let finalWorth = baseWorth + (wordCount * 12) + (uniquenessScore * 280) * codeComplexityMultiplier;
    
    // Add additional multipliers based on category
    const cat = (app.category || "Utility").toLowerCase();
    if (cat === "creative" || cat === "game" || cat === "gaming") {
      finalWorth *= 1.18; // Gamified apps hold premium visual asset valuations
    } else if (cat === "productivity") {
      finalWorth *= 1.12; // High business value
    }

    // Round up or down gracefully for clean display aesthetics
    finalWorth = Math.round(finalWorth / 50) * 50;

    // Categorize novelty classification tier
    let ratingTier = "Standard Concept";
    let tierColor = "bg-slate-100 text-slate-700 border-slate-200";
    if (uniquenessScore >= 88) {
      ratingTier = "Unprecedented Innovation";
      tierColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
    } else if (uniquenessScore >= 75) {
      ratingTier = "Highly Distinctive";
      tierColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (uniquenessScore >= 60) {
      ratingTier = "Niche Refined";
      tierColor = "bg-amber-50 text-amber-700 border-amber-200";
    }

    return {
      uniquenessScore,
      worthValue: finalWorth,
      ratingTier,
      tierColor,
      wordCount,
      uniqueWordsCount: uniqueWords.size,
      vocabularyDiversity: Math.round(vocabularyDiversity * 100),
      detectedInnovativeFeatures: detectedInnovativeFeatures.slice(0, 3)
    };
  }, [app.description, app.title, app.code, app.category]);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

  return (
    <div id="valuation-appraisal-panel" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 text-left animate-fadeIn">
      {/* Panel Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">App Appraisal & Valuation</h3>
            <p className="text-[11px] text-slate-500">Heuristic valuation based on description & code uniqueness</p>
          </div>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isAppraising}
          className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition bg-white"
          title="Recalculate app value"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAppraising ? "animate-spin text-emerald-600" : ""}`} />
        </button>
      </div>

      {/* Main Stats Block Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Market Value estimation card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle neon glow */}
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl" />
          <div>
            <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 block font-bold flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Est. Market Value
            </span>
            <div className="text-xl font-display font-black text-emerald-400 mt-1">
              {isAppraising ? (
                <span className="inline-block animate-pulse">Calculating...</span>
              ) : (
                <span>{formatter.format(valuationMetrics.worthValue)}</span>
              )}
            </div>
          </div>
          <span className="text-[9px] text-zinc-500 font-medium block mt-1 relative z-10">
            Valued at target deployment
          </span>
        </div>

        {/* Uniqueness rating score */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
          <div>
            <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-500 block font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Uniqueness Score
            </span>
            <div className="text-xl font-display font-black text-slate-900 mt-1 flex items-baseline gap-1">
              {isAppraising ? (
                <span className="inline-block animate-pulse">...</span>
              ) : (
                <>
                  <span>{valuationMetrics.uniquenessScore}%</span>
                  <span className="text-xs text-indigo-600 font-bold">Uniqueness</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-1">
            <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full border ${valuationMetrics.tierColor}`}>
              {valuationMetrics.ratingTier}
            </span>
          </div>
        </div>
      </div>

      {/* Current App Summary Breakdown */}
      <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 flex flex-col gap-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
          Appraisal Audit Log
        </span>
        
        {/* Heuristics lists */}
        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
          <div className="flex items-center justify-between p-1 bg-white rounded border border-slate-100 px-2">
            <span className="text-slate-500">Words Analyzed:</span>
            <span className="font-mono font-bold text-slate-800">{valuationMetrics.wordCount}</span>
          </div>
          <div className="flex items-center justify-between p-1 bg-white rounded border border-slate-100 px-2">
            <span className="text-slate-500">Unique Vocabulary:</span>
            <span className="font-mono font-bold text-slate-800">{valuationMetrics.uniqueWordsCount} ({valuationMetrics.vocabularyDiversity}%)</span>
          </div>
        </div>

        {/* Generated Blueprint features */}
        {valuationMetrics.detectedInnovativeFeatures.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            <span className="text-[9px] text-slate-400 font-bold tracking-wide uppercase">High-Value Tech Identifiers:</span>
            <div className="flex flex-wrap gap-1">
              {valuationMetrics.detectedInnovativeFeatures.map((f, idx) => (
                <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9.5px] px-2 py-0.5 rounded-md font-medium">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggestion block on improving value */}
      <div className="text-[10.5px] text-slate-500 leading-normal flex items-start gap-1.5 border-t border-slate-100 pt-3">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          Need to increase this app’s estimated market value? Try writing a more complex, multi-feature prompt or refining the application description details on the left.
        </p>
      </div>
    </div>
  );
}
