import React, { useState } from "react";
import { Sparkles, Compass, AlertTriangle, ArrowRight, Settings2, HelpCircle } from "lucide-react";

interface PromptWizardProps {
  onGenerate: (prompt: string, options: any) => void;
  loading: boolean;
  statusText: string;
  activeAppTitle?: string;
  onRefine: (refinementPrompt: string) => void;
}

export default function PromptWizard({
  onGenerate,
  loading,
  statusText,
  activeAppTitle,
  onRefine,
}: PromptWizardProps) {
  const [prompt, setPrompt] = useState("");
  const [refinePrompt, setRefinePrompt] = useState("");
  const [category, setCategory] = useState("Utility");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategoryActive, setIsCustomCategoryActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [extraGuidelines, setExtraGuidelines] = useState("");

  const presets = [
    { title: "Task Ledger", desc: "Todo with category filters", category: "Productivity" },
    { title: "Scientific Calc", desc: "Math with dark retro theme", category: "Utility" },
    { title: "Color Harmonics", desc: "Generate palette with hex copier", category: "Creative" },
    { title: "Sound Synthesizer", desc: "Interactive drum synth pad", category: "Entertainment" },
    { title: "Memory Tile Blitz", desc: "Card matching logic game", category: "Game" },
  ];

  const handleSelectPreset = (preset: any) => {
    setPrompt(`A beautifully designed and optimized ${preset.title.toLowerCase()}. It should achieve: ${preset.desc}.`);
    const standardCategories = ["Utility", "Game", "Productivity", "Education", "Creative", "Lifestyle"];
    if (standardCategories.includes(preset.category)) {
      setCategory(preset.category);
      setIsCustomCategoryActive(false);
    } else {
      setCategory("Custom");
      setCustomCategory(preset.category);
      setIsCustomCategoryActive(true);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    const finalCategory = isCustomCategoryActive ? (customCategory.trim() || "Utility") : category;
    onGenerate(prompt, { category: finalCategory, extraGuidelines });
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinePrompt.trim() || loading) return;
    onRefine(refinePrompt);
    setRefinePrompt("");
  };

  return (
    <div className="flex flex-col gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      {/* Tab Header/Title */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>AI App Creator Studio</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Specify what app you want to build. Craft simple applications instantly, or improve existing versions recursively.
        </p>
      </div>

      {/* Builder Form (Prompt Entry) */}
      {!activeAppTitle ? (
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 font-mono flex items-center justify-between">
              <span>Primary Application Prompt</span>
              <span className="text-[10px] text-indigo-600 font-bold">Model: Gemini 3.5 Flash</span>
            </label>
            <textarea
              required
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A gorgeous, modern task manager where users can create projects, add items with priorities, mark them done, track their daily progress percentage, and filter items by priority..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 resize-none transition"
              disabled={loading}
            />
          </div>

          {/* Inspiration Preset Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold font-mono text-slate-500 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
              Quickstart Inspiration Ideas:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  disabled={loading}
                  className="text-left text-xs bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 border border-slate-200 px-3 py-2 rounded-xl transition duration-150"
                >
                  <span className="font-bold text-slate-800 block text-[11px]">{preset.title}</span>
                  <span className="text-[10px] text-slate-550 block line-clamp-1">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 font-mono">App Category</label>
              <select
                value={isCustomCategoryActive ? "Custom" : category}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "Custom") {
                    setIsCustomCategoryActive(true);
                  } else {
                    setCategory(val);
                    setIsCustomCategoryActive(false);
                  }
                }}
                disabled={loading}
                className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Utility">Utility</option>
                <option value="Game">Game</option>
                <option value="Productivity">Productivity</option>
                <option value="Education">Education</option>
                <option value="Creative">Creative</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Custom">Custom (Specify below...)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 self-start md:self-end md:mb-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>{showAdvanced ? "Hide parameter tuning" : "Tune design parameters"}</span>
              </button>
            </div>
          </div>

          {/* Custom Category Input (shown when Custom is selected) */}
          {isCustomCategoryActive && (
            <div className="flex flex-col gap-1.5 bg-indigo-50/20 border border-indigo-100/50 p-3 rounded-xl transition duration-200">
              <label className="text-xs font-semibold text-slate-700 font-mono">Specify Custom Category</label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Finance, Healthcare, Fitness, Travel..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
                disabled={loading}
              />
            </div>
          )}

          {/* Advanced guidelines panel */}
          {showAdvanced && (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col gap-2">
              <span className="text-xs font-semibold font-mono text-slate-700">Custom System Tuning:</span>
              <textarea
                rows={2}
                value={extraGuidelines}
                onChange={(e) => setExtraGuidelines(e.target.value)}
                placeholder="e.g. Include subtle sound effects using Web Audio API / style in elegant vintage terminal style / use warm amber colors..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 resize-none"
                disabled={loading}
              />
            </div>
          )}

          {/* Prompt Build actions */}
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-sm font-semibold py-3 px-4 rounded-xl text-white shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 transition duration-150 cursor-pointer disabled:cursor-not-allowed border border-transparent"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{statusText || "Compiling system..."}</span>
              </span>
            ) : (
              <>
                <span>Launch Application Wizard Compiler</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Improvement / Refinement Wizard mode */
        <div className="flex flex-col gap-4">
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">Currently Customizing</span>
            <span className="text-sm font-bold text-slate-800 block mt-1">{activeAppTitle}</span>
          </div>

          <form onSubmit={handleRefineSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 font-mono">
                Evolution Prompt (Refine/Improve)
              </label>
              <textarea
                required
                rows={4}
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                placeholder="What feature do you want to add or change? e.g., 'Add a dark mode toggle button on top right', or 'Add simple sound effects when user finishes tasks', or 'Make the columns sortable'..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 resize-none transition"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !refinePrompt.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-xs font-semibold py-3 px-4 rounded-xl text-white flex items-center justify-center gap-2 transition duration-150 cursor-pointer disabled:cursor-not-allowed shadow shadow-indigo-600/5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{statusText || "Refining source framework..."}</span>
                </span>
              ) : (
                <>
                  <span>Inject Improvement Prompt</span>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Reset Workspace Toggle */}
          <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-500">
            <span>Want to start fresh?</span>
            <button
              onClick={() => onRefine("__RESET_WORKSPACE__")}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              Close Studio Editor
            </button>
          </div>
        </div>
      )}

      {/* Warning/Guidelines disclaimer block */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex gap-2 w-full mt-auto text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-800 leading-relaxed">
          <span className="font-bold text-amber-950 block">Persistence Check</span>
          Remember to <span className="text-indigo-600 font-semibold underline">Publish</span> your finished apps so they reside permanently in our community marketplace. Use My Vault to manage your active drafts.
        </div>
      </div>
    </div>
  );
}
