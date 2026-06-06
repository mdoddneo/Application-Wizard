import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Smartphone, 
  RefreshCw, 
  Code, 
  ArrowUpRight, 
  Check, 
  Eye, 
  QrCode,
  Activity, 
  Terminal, 
  Trash2, 
  X, 
  Search, 
  AlertTriangle, 
  Cpu, 
  Layers 
} from "lucide-react";
import { AppItem } from "../types";
import QRCodeGenerator from "./QRCodeGenerator";

interface PhonePreviewProps {
  app: AppItem | null;
  platform: "ios" | "android" | "cross-platform";
  setPlatform: (platform: "ios" | "android" | "cross-platform") => void;
  onCodeClick?: () => void;
  onRefineRequest?: (prompt: string) => void;
}

function injectHealthScript(rawHtml: string): string {
  if (!rawHtml) return "";
  
  const interceptorScript = `
<script id="app-health-interceptor">
  (function() {
    // Avoid double injection
    if (window.__app_health_intercepted) return;
    window.__app_health_intercepted = true;

    const parent = window.parent;
    if (!parent) return;

    const startTime = performance.now();
    window.addEventListener('load', () => {
      const loadDuration = performance.now() - startTime;
      const domCount = document.getElementsByTagName('*').length;
      const resourceCount = performance.getEntriesByType ? performance.getEntriesByType('resource').length : 0;
      let memoryUsage = null;
      if (window.performance && (window.performance as any).memory) {
        memoryUsage = Math.round((window.performance as any).memory.usedJSHeapSize / 1024 / 1024);
      }
      
      parent.postMessage({
        type: 'APP_HEALTH_METRICS',
        metrics: {
          loadTimeMs: Math.round(loadDuration),
          domNodes: domCount,
          resourceCount: resourceCount,
          memory: memoryUsage
        }
      }, '*');
    });

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    function sendLog(type, args) {
      const serializedArgs = Array.from(args).map(arg => {
        try {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            return JSON.stringify(arg, (key, value) => {
              if (value instanceof HTMLElement) return '[' + value.tagName.toLowerCase() + ' Element]';
              return value;
            }, 2);
          }
          return String(arg);
        } catch (e) {
          return '[Unserializable Object]';
        }
      });

      parent.postMessage({
        type: 'APP_HEALTH_CONSOLE_LOG',
        log: {
          type,
          content: serializedArgs.join(' '),
          timestamp: new Date().toLocaleTimeString()
        }
      }, '*');
    }

    console.log = function() {
      sendLog('log', arguments);
      originalConsole.log.apply(console, arguments);
    };
    console.warn = function() {
      sendLog('warn', arguments);
      originalConsole.warn.apply(console, arguments);
    };
    console.error = function() {
      sendLog('error', arguments);
      originalConsole.error.apply(console, arguments);
    };
    console.info = function() {
      sendLog('info', arguments);
      originalConsole.info.apply(console, arguments);
    };

    window.addEventListener('error', function(event) {
      parent.postMessage({
        type: 'APP_HEALTH_CONSOLE_LOG',
        log: {
          type: 'error',
          content: 'Uncaught Error: ' + event.message + ' at ' + event.filename + ':' + event.lineno,
          timestamp: new Date().toLocaleTimeString()
        }
      }, '*');
    });
  })();
</script>
`;

  if (rawHtml.toLowerCase().includes("<head>")) {
    return rawHtml.replace(/<head>/i, `<head>\n${interceptorScript}`);
  } else if (rawHtml.toLowerCase().includes("<html>")) {
    return rawHtml.replace(/<html>/i, `<html>\n${interceptorScript}`);
  } else {
    return interceptorScript + rawHtml;
  }
}

export default function PhonePreview({
  app,
  platform,
  setPlatform,
  onCodeClick,
  onRefineRequest,
}: PhonePreviewProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [showSource, setShowSource] = useState(false);
  const [showQRConsole, setShowQRConsole] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // App health logging and performance states
  const [logs, setLogs] = useState<Array<{ type: string; content: string; timestamp: string }>>([]);
  const [healthMetrics, setHealthMetrics] = useState<{
    loadTimeMs: number;
    domNodes: number;
    resourceCount: number;
    memory: number | null;
  } | null>(null);
  const [frameLoadStart, setFrameLoadStart] = useState<number>(0);
  const [frameLoadTime, setFrameLoadTime] = useState<number | null>(null);
  const [showHealthSheet, setShowHealthSheet] = useState(false);
  const [logFilter, setLogFilter] = useState<"all" | "log" | "warn" | "error">("all");
  const [logSearch, setLogSearch] = useState("");

  // Sync state & reset logs when code updates or on reload
  useEffect(() => {
    setLogs([]);
    setHealthMetrics(null);
    setFrameLoadTime(null);
    setFrameLoadStart(performance.now());
  }, [app?.id, app?.code, iframeKey]);

  // Handle postMessage console & load reports
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "object") {
        if (event.data.type === "APP_HEALTH_CONSOLE_LOG" && event.data.log) {
          setLogs((prev) => [...prev, event.data.log].slice(-100));
        } else if (event.data.type === "APP_HEALTH_METRICS" && event.data.metrics) {
          setHealthMetrics((prev) => ({
            ...prev,
            ...event.data.metrics
          }));
        }
      }
    };

    window.addEventListener("message", handleIframeMessage);
    return () => {
      window.removeEventListener("message", handleIframeMessage);
    };
  }, []);

  // Filter & search logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesFilter = logFilter === "all" || log.type === logFilter;
      const matchesSearch = logSearch === "" || log.content.toLowerCase().includes(logSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [logs, logFilter, logSearch]);

  const bundleSizeEstimate = useMemo(() => {
    if (!app?.code) return "0 KB";
    const bytes = new Blob([app.code]).size;
    return (bytes / 1024).toFixed(1) + " KB";
  }, [app?.code]);

  const { errorCount, warnCount } = useMemo(() => {
    let errors = 0;
    let warnings = 0;
    logs.forEach((log) => {
      if (log.type === "error") errors++;
      if (log.type === "warn") warnings++;
    });
    return { errorCount: errors, warnCount: warnings };
  }, [logs]);

  // Restart frame helper
  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const copyCode = () => {
    if (!app?.code) return;
    navigator.clipboard.writeText(app.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe time simulation on top notch
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      let hrs = d.getHours();
      let mins = String(d.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white shadow-sm rounded-2xl p-12 text-center h-full min-h-[500px]">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-full mb-4 shadow-inner">
          <Smartphone className="w-10 h-10 text-slate-505 animate-bounce" />
        </div>
        <h3 className="text-lg font-display font-bold text-slate-800">No Application Selected</h3>
        <p className="text-sm text-slate-505 mt-2 max-w-sm leading-relaxed">
          Acknowledge app prompts in the left designer wizard. Our AI engine will stream compiled HTML code layout options directly into the mobile preview module here.
        </p>
      </div>
    );
  }

  const isIOS = platform === "ios" || platform === "cross-platform";

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Controls Board */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-500 block uppercase tracking-wider">Device Preview</span>
            <span className="text-sm font-bold text-slate-900 truncate max-w-[150px] inline-block">{app.title}</span>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* iOS / Android selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 font-sans">
            <button
              onClick={() => setPlatform("ios")}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition duration-150 cursor-pointer ${
                platform === "ios"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              iOS (Apple)
            </button>
            <button
              onClick={() => setPlatform("android")}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition duration-150 cursor-pointer ${
                platform === "android"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Android
            </button>
          </div>

          <button
            onClick={handleReload}
            title="Refresh Sandbox frame"
            className="p-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition shadow-sm bg-white cursor-pointer hover:border-slate-350"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Test on real physical device QR button */}
          <button
            onClick={() => {
              setShowQRConsole(!showQRConsole);
              if (showSource) setShowSource(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold border transition shadow-sm cursor-pointer ${
              showQRConsole
                ? "bg-indigo-650 hover:bg-indigo-700 text-white border-indigo-600"
                : "hover:bg-indigo-50 text-indigo-600 border border-indigo-150 bg-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Physical Device Test</span>
          </button>

          <button
            onClick={() => {
              setShowSource(!showSource);
              if (showQRConsole) setShowQRConsole(false);
            }}
            className="flex items-center gap-1 px-2.5 py-2 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded-lg text-xs font-semibold border border-indigo-150 transition shadow-sm bg-white cursor-pointer hover:border-indigo-350"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showSource ? "Show View" : "View Source"}</span>
          </button>
        </div>
      </div>

      {showSource ? (
        /* Source Viewer block override */
        <div className="flex-1 flex flex-col bg-[#070a10] border border-slate-800 rounded-3xl overflow-hidden p-4 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="font-mono text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Source Code Explorer ({app.title}.html)
            </span>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
              >
                {copied ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span> : "Copy Code"}
              </button>
              {onCodeClick && (
                <button
                  onClick={onCodeClick}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                >
                  Edit Manually
                </button>
              )}
            </div>
          </div>
          <textarea
            readOnly
            value={app.code}
            className="flex-1 w-full bg-slate-950 text-[#38bdf8] font-mono p-4 rounded-xl border border-slate-900 focus:outline-none resize-none overflow-y-auto text-xs leading-relaxed"
          />
        </div>
      ) : (
        /* The Responsive Layout featuring Device Chassis Sandbox + QR Panel */
        <div className="flex-1 flex flex-col xl:flex-row items-center xl:items-stretch justify-center gap-6 py-4">
          
          {/* Main frame chassis wrapper */}
          <div className="flex-1 flex items-center justify-center py-2 h-full min-h-[500px]">
            <div
              className={`relative mx-auto transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[12px] bg-black shrink-0 ${
                isIOS
                  ? "w-[360px] h-[720px] rounded-[52px] border-slate-800/90 ring-4 ring-slate-900"
                  : "w-[360px] h-[710px] rounded-[40px] border-zinc-800/90 ring-4 ring-zinc-900"
              }`}
            >
              {/* iOS Dynamic Island Notch Simulation */}
              {isIOS && (
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-[#05050e] rounded-full absolute left-3 border border-zinc-950" />
                  <div className="w-1.5 h-1.5 bg-[#0a0a22]/80 rounded-full absolute right-6" />
                </div>
              )}

              {/* Android Notch Pin-hole Camera */}
              {!isIOS && (
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-zinc-800" />
                </div>
              )}

              {/* Simulated Device Top Status Bar */}
              <div className="absolute top-0 inset-x-0 h-10 px-6 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none z-20 bg-transparent">
                <span className="font-semibold text-slate-300 drop-shadow-md">
                  {currentTime || "09:41"}
                </span>
                <div className="flex items-center gap-1.5">
                  {/* Simulated Signal icon */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c-1.2 0-2.4.4-3.4 1.2L2.7 10c-.8.6-1 1.7-.4 2.5s1.7 1 2.5.4l2.4-1.8v8.9c0 1.1.9 2 2 2h5.6c1.1 0 2-.9 2-2v-8.9l2.4 1.8c.8.6 1.9.4 2.5-.4s.4-1.9-.4-2.5l-5.9-4.4c-1-.8-2.2-1.2-3.4-1.2h.1z" />
                  </svg>
                  {/* Battery icon */}
                  <span className="bg-emerald-950/60 text-emerald-400 font-bold px-1 py-0.2 rounded text-[9px] scale-95 border border-emerald-800/40">
                    92%
                  </span>
                </div>
              </div>

              {/* Main Application Execution Iframe with Health overlay */}
              <div className={`w-full h-full bg-slate-100 overflow-hidden relative ${isIOS ? 'rounded-[40px]' : 'rounded-[28px]'}`}>
                {app.code ? (
                  <>
                    <iframe
                      key={iframeKey}
                      ref={iframeRef}
                      sandbox="allow-scripts allow-forms allow-popups allow-modals"
                      srcDoc={injectHealthScript(app.code)}
                      title="Application Wizard Live Simulator Sandbox"
                      onLoad={() => {
                        const duration = Math.round(performance.now() - frameLoadStart);
                        setFrameLoadTime(duration);
                      }}
                      className="w-full h-full border-0 absolute inset-0 pt-9 bg-white"
                    />

                    {/* Floating pill button for App Health */}
                    <button
                      onClick={() => setShowHealthSheet(!showHealthSheet)}
                      className={`absolute bottom-16 right-4 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10.5px] font-bold shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 select-none cursor-pointer border ${
                        errorCount > 0
                          ? "bg-red-950/80 text-red-300 border-red-500/35"
                          : warnCount > 0
                          ? "bg-amber-950/80 text-amber-300 border-amber-500/35"
                          : "bg-emerald-950/80 text-emerald-300 border-emerald-500/35"
                      }`}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          errorCount > 0 ? "bg-red-400" : warnCount > 0 ? "bg-amber-400" : "bg-emerald-400"
                        }`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          errorCount > 0 ? "bg-red-500" : warnCount > 0 ? "bg-amber-500" : "bg-emerald-500"
                        }`}></span>
                      </span>
                      <Activity className="w-3.5 h-3.5" />
                      <span>App Health</span>
                    </button>

                    {/* App Health Bottom Overlay Drawer */}
                    {showHealthSheet && (
                      <div className="absolute bottom-0 inset-x-0 h-[62%] bg-slate-950 text-slate-100 z-40 border-t border-slate-800 rounded-t-2xl flex flex-col transition-all duration-300 shadow-2xl animate-slideUp font-sans">
                        {/* Drawer Drag handle / Header */}
                        <div className="flex items-center justify-between px-3.5 py-3 border-b border-zinc-850">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                            <div>
                              <h4 className="font-bold text-[11px] leading-tight text-white uppercase tracking-widest font-mono">App Diagnostic Console</h4>
                              <p className="text-[9px] text-slate-400">Real-time compilation and execution telemetry</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowHealthSheet(false)}
                            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Telemetry Metric Grid */}
                        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 border-b border-zinc-850 text-left">
                          <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                              <Layers className="w-2.5 h-2.5 text-indigo-400" /> Bundle size
                            </span>
                            <span className="text-xs font-mono font-bold text-white truncate">
                              {bundleSizeEstimate}
                            </span>
                          </div>
                          
                          <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 flex flex-col gap-0.5" title="Time taken to mount iframe and load assets">
                            <span className="text-[8px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                              <Cpu className="w-2.5 h-2.5 text-emerald-400" /> Latency
                            </span>
                            <span className="text-xs font-mono font-bold text-white truncate">
                              {frameLoadTime !== null ? `${frameLoadTime} ms` : "Measuring..."}
                            </span>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 flex flex-col gap-0.5" title="Render statistics returned by interceptor">
                            <span className="text-[8px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                              <Activity className="w-2.5 h-2.5 text-purple-400" /> DOM Elements
                            </span>
                            <span className="text-xs font-mono font-bold text-white truncate">
                              {healthMetrics?.domNodes ? `${healthMetrics.domNodes} nodes` : "Reading..."}
                            </span>
                          </div>
                        </div>

                        {/* Level Filters & Search Row */}
                        <div className="p-2 bg-slate-900 border-b border-zinc-850 flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="relative flex-1 min-w-[100px]">
                            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={logSearch}
                              onChange={(e) => setLogSearch(e.target.value)}
                              placeholder="Search logs..."
                              className="w-full bg-slate-950 text-slate-200 text-[10px] pl-6.5 pr-2 py-1 rounded-md border border-slate-850 focus:outline-none focus:border-indigo-650 font-sans"
                            />
                          </div>
                          
                          {/* Log Levels */}
                          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-850">
                            {(["all", "log", "warn", "error"] as const).map((lvl) => {
                              const isActive = logFilter === lvl;
                              let label = lvl === "all" ? "All" : lvl === "log" ? "Log" : lvl === "warn" ? "Warn" : "Err";
                              return (
                                <button
                                  key={lvl}
                                  onClick={() => setLogFilter(lvl)}
                                  className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded cursor-pointer transition ${
                                    isActive
                                      ? "bg-slate-800 text-white"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setLogs([])}
                            title="Clear console window logs"
                            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Active Console Window Log Outputs */}
                        <div className="flex-1 overflow-y-auto p-2.5 font-mono text-[9.5px] leading-relaxed space-y-1 select-text bg-[#03050d]">
                          {filteredLogs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-4 text-center text-slate-500 text-[10px]">
                              <Terminal className="w-5 h-5 text-slate-600 mb-1" />
                              <span>No diagnostic logs reported</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {filteredLogs.map((log, idx) => {
                                let labelColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
                                let bgClass = "bg-slate-950/20";
                                if (log.type === "error") {
                                  labelColor = "text-red-400 bg-red-500/15 border-red-500/30 font-bold";
                                  bgClass = "bg-red-950/10 border-l border-red-500/30";
                                } else if (log.type === "warn") {
                                  labelColor = "text-amber-400 bg-amber-500/15 border-amber-500/30 font-bold";
                                  bgClass = "bg-amber-950/10 border-l border-amber-500/30";
                                }

                                return (
                                  <div key={idx} className={`p-1.5 rounded flex items-start gap-1.5 transition-all text-left ${bgClass}`}>
                                    <span className="text-[8px] text-slate-500 font-mono shrink-0 pt-0.5">{log.timestamp}</span>
                                    <span className={`text-[8px] px-1 py-0.2 rounded border uppercase font-mono shrink-0 ${labelColor}`}>
                                      {log.type}
                                    </span>
                                    <pre className="flex-1 whitespace-pre-wrap word-break-all text-slate-205">
                                      {log.content}
                                    </pre>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-500">
                    <p className="text-xs">Compiling code bundle...</p>
                  </div>
                )}
              </div>

              {/* iOS Bottom Indicator Bar */}
              {isIOS && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-300 rounded-full z-30 opacity-70 hover:opacity-100 transition" />
              )}
            </div>
          </div>

          {/* Collapsible/Expandable QR Code Testing Frame */}
          {showQRConsole && (
            <div className="w-full xl:w-[325px] shrink-0 self-center xl:self-stretch flex flex-col justify-center xl:overflow-y-auto">
              <QRCodeGenerator
                appId={app.id}
                appTitle={app.title}
                onClose={() => setShowQRConsole(false)}
              />
            </div>
          )}

        </div>
      )}
    </div>
  );
}
