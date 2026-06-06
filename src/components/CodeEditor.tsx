import React, { useState, useEffect, useMemo } from "react";
import { Code, Save, Play, RefreshCw, FileDown, Check, Columns, GitCompare, RotateCcw, Sparkles } from "lucide-react";

interface CodeEditorProps {
  initialCode: string;
  lastAiCode: string;
  onSave: (newCode: string) => void;
  appName: string;
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
  lineNumberGen?: number;
  lineNumberCurrent?: number;
}

// Longest Common Subsequence line-by-line diff compiler
function computeDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");
  
  const m = origLines.length;
  const n = modLines.length;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origLines[i - 1] === modLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const diff: DiffLine[] = [];
  let i = m;
  let j = n;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      diff.unshift({
        type: "unchanged",
        text: origLines[i - 1],
        lineNumberGen: i,
        lineNumberCurrent: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: "added",
        text: modLines[j - 1],
        lineNumberCurrent: j,
      });
      j--;
    } else {
      diff.unshift({
        type: "removed",
        text: origLines[i - 1],
        lineNumberGen: i,
      });
      i--;
    }
  }
  
  return diff;
}

export default function CodeEditor({ initialCode, lastAiCode, onSave, appName }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  // Sync state if initialCode switches
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleManualSave = () => {
    onSave(code);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyEdits = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2050);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${appName.toLowerCase().replace(/\s+/g, "_")}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRollback = () => {
    if (confirm("Reset current manual edits back to the last AI-generated blueprint? Unsaved work will be lost.")) {
      setCode(lastAiCode);
    }
  };

  // Perform LCS compilation with hook cache optimization
  const diffData = useMemo(() => {
    return computeDiff(lastAiCode, code);
  }, [lastAiCode, code]);

  // Compute metrics statistics
  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffData.forEach((line) => {
      if (line.type === "added") added++;
      if (line.type === "removed") removed++;
    });
    return { added, removed, totalChanges: added + removed };
  }, [diffData]);

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden h-full min-h-[550px] transition-all">
      {/* Code Header Bar */}
      <div className="bg-slate-900 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-slate-200 block">
              {appName ? `${appName.toLowerCase().replace(/\s+/g, "_")}.html` : "app.html"}
            </span>
            <span className="text-[10px] text-slate-400">Sandbox Sandbox Source Code</span>
          </div>
        </div>

        {/* Action Controls toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Compare changes toggler */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer border ${
              compareMode
                ? "bg-slate-800 hover:bg-slate-750 text-indigo-400 border-indigo-505/30"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
            }`}
            title="Highlight differences with last AI code version"
          >
            <GitCompare className={`w-3.5 h-3.5 ${compareMode ? "text-indigo-400 animate-pulse" : "text-slate-400"}`} />
            <span>Compare Changes</span>
            {stats.totalChanges > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-indigo-500/25 text-indigo-300 text-[9px] rounded-full font-mono font-bold">
                {stats.totalChanges}
              </span>
            )}
          </button>

          {stats.totalChanges > 0 && (
            <button
              onClick={handleRollback}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-400 hover:text-red-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
              title="Revert entire script to AI generated version"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Copy edits code */}
          <button
            onClick={copyEdits}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
          >
            {copied ? (
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</span>
            ) : "Copy"}
          </button>

          {/* Download file */}
          <button
            onClick={handleDownload}
            title="Download full standalone HTML file"
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 p-1.5 rounded-lg transition shadow-sm cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {/* Save changes action */}
          <button
            onClick={handleManualSave}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
            title="Inject edits instantly into simulation preview"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saved ? "Synchronizing!" : "Save & Run"}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body & Split View */}
      <div className={`flex-1 relative flex flex-col md:flex-row min-h-[480px] overflow-hidden`}>
        {/* Left Side: Textarea Code Editor */}
        <div className={`flex-1 flex flex-col min-h-[250px] relative transition-all duration-300 ${
          compareMode ? "md:w-1/2 md:border-r border-slate-800" : "w-full"
        }`}>
          <div className="absolute top-2.5 right-4 z-10 px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded-md text-[9px] font-mono tracking-wider uppercase">
            Active Editor
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-slate-950 font-mono text-xs text-indigo-300 p-4 pt-10 leading-relaxed focus:outline-none resize-none overflow-y-auto selection:bg-slate-800 selection:text-white"
            placeholder="<!-- Inline customized HTML code... -->"
          />
        </div>

        {/* Right Side: High Fidelity Compare Changes Diff Panel */}
        {compareMode && (
          <div className="flex-1 md:w-1/2 flex flex-col bg-[#060814] pb-4 min-h-[300px] overflow-hidden">
            {/* Diff Summary banner */}
            <div className="bg-[#0b0e25] border-b border-indigo-950/40 p-2 px-4 flex items-center justify-between text-xs text-slate-305">
              <span className="font-semibold text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                Live Difference Map
              </span>
              <div className="flex gap-2 text-[10px] font-mono">
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  +{stats.added} additions
                </span>
                <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  -{stats.removed} deletions
                </span>
              </div>
            </div>

            {/* Scrollable list of diffs */}
            <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed p-4 select-none">
              {stats.totalChanges === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Check className="w-8 h-8 text-indigo-500/60 mb-2" />
                  <p className="font-semibold text-xs text-slate-400">Perfect Sync</p>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1">
                    No manual corrections applied yet. The loaded script is identical to the baseline AI model output.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {diffData.map((line, idx) => {
                    const isAdded = line.type === "added";
                    const isRemoved = line.type === "removed";
                    
                    let bgStyle = "text-slate-500/70 opacity-55 hover:opacity-100";
                    let sign = " ";
                    let indicator = "border-transparent bg-transparent";
                    
                    if (isAdded) {
                      bgStyle = "bg-emerald-500/10 text-emerald-300";
                      sign = "+";
                      indicator = "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold";
                    } else if (isRemoved) {
                      bgStyle = "bg-rose-500/10 text-rose-300 line-through decoration-rose-900/50";
                      sign = "-";
                      indicator = "border-rose-500 bg-rose-500/20 text-rose-400 font-bold";
                    }

                    return (
                      <div 
                        key={idx} 
                        className={`flex items-stretch rounded transition-colors group ${bgStyle}`}
                      >
                        {/* Line number gutter */}
                        <div className="w-[45px] shrink-0 text-slate-600 text-right pr-2 select-none border-r border-slate-800/40 font-mono text-[10px] py-0.5">
                          {isAdded ? line.lineNumberCurrent : isRemoved ? line.lineNumberGen : line.lineNumberCurrent}
                        </div>
                        {/* Plus/Minus emblem column */}
                        <div className={`w-5 shrink-0 flex items-center justify-center font-mono text-[11px] select-none border-r border-slate-800/40 ${indicator}`}>
                          {sign}
                        </div>
                        {/* Actual content */}
                        <pre className="flex-1 pl-2.5 truncate font-mono text-left py-0.5 select-text overflow-x-auto scrollbar-none whitespace-pre-wrap">
                          {line.text || " "}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating status prompt footer */}
      <div className="bg-slate-900/90 border-t border-slate-850 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Injection Console Active</span>
        {compareMode && (
          <span className="text-slate-400 text-[10px]">
            Press <strong className="text-indigo-400">Compare Changes</strong> to restore standard screen view.
          </span>
        )}
      </div>
    </div>
  );
}
