import React, { useState } from "react";
import { Palette, Type as FontIcon, Sparkles, Check, RefreshCw } from "lucide-react";

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  bgLight: string;
  bgDark: string;
  isDark: boolean;
}

export interface TypographySet {
  id: string;
  name: string;
  headingFamily: string;
  bodyFamily: string;
  importUrl: string;
  description: string;
}

export const PRESET_PALETTES: ColorPalette[] = [
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    description: "Warm, energetic gradient aesthetics",
    primary: "#f97316", // Orange 500
    secondary: "#ec4899", // Pink 500
    accent: "#e11d48", // Rose 600
    bgLight: "#fff7ed", // Warm tint
    bgDark: "#1c1917", // Stone 900
    isDark: false,
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    description: "High-contrast electric cyberpunk",
    primary: "#06b6d4", // Cyan 500
    secondary: "#a855f7", // Purple 500
    accent: "#10b981", // Emerald 500
    bgLight: "#f8fafc", // Slate 50
    bgDark: "#030712", // Gray 950
    isDark: true,
  },
  {
    id: "organic-sage",
    name: "Organic Sage",
    description: "Earthy, peaceful woodland greens",
    primary: "#15803d", // Green 700
    secondary: "#84cc16", // Lime 500
    accent: "#eab308", // Yellow 500
    bgLight: "#f0fdf4", // Green 50
    bgDark: "#0f172a", // Slate 900
    isDark: false,
  },
  {
    id: "cosmic-royal",
    name: "Cosmic Royal",
    description: "Deep luxury Indigo & Blue velvet",
    primary: "#4f46e5", // Indigo 600
    secondary: "#2563eb", // Blue 600
    accent: "#db2777", // Pink 60
    bgLight: "#fafafa", // Zinc 50
    bgDark: "#09090b", // Zinc 950
    isDark: true,
  },
  {
    id: "vintage-amber",
    name: "Vintage Amber",
    description: "Warm retro terminal sepia",
    primary: "#d97706", // Amber 600
    secondary: "#b45309", // Amber 700
    accent: "#f59e0b", // Gold 500
    bgLight: "#fcf8f2", // Linen sepia
    bgDark: "#1c0d02", // Dark espresso
    isDark: false,
  }
];

export const PRESET_TYPOGRAPHY: TypographySet[] = [
  {
    id: "modern-sans",
    name: "Modern Outfit",
    headingFamily: "Outfit",
    bodyFamily: "Inter",
    importUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&family=Inter:wght@400;500;600&display=swap",
    description: "Sleek, geometric, high-profile sans",
  },
  {
    id: "editorial-serif",
    name: "Editorial Playfair",
    headingFamily: "Playfair Display",
    bodyFamily: "Inter",
    importUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Inter:wght@400;500&display=swap",
    description: "Elegant, high-contrast serif, formal tone",
  },
  {
    id: "cyber-mono",
    name: "Technical Space Mono",
    headingFamily: "Space Grotesk",
    bodyFamily: "JetBrains Mono",
    importUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap",
    description: "Brutalist coding & tech structure aesthetics",
  },
  {
    id: "playful-rounded",
    name: "Lexend Friendly",
    headingFamily: "Lexend",
    bodyFamily: "Plus Jakarta Sans",
    importUrl: "https://fonts.googleapis.com/css2?family=Lexend:wght@600;750&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap",
    description: "Kind, approachable, high readability curves",
  }
];

interface ThemeControlPanelProps {
  currentHtml: string;
  onUpdateCode: (newCode: string) => void;
}

export default function ThemeControlPanel({ currentHtml, onUpdateCode }: ThemeControlPanelProps) {
  const [selectedPalette, setSelectedPalette] = useState<string>("sunset-glow");
  const [selectedTypo, setSelectedTypo] = useState<string>("modern-sans");
  const [customPrimary, setCustomPrimary] = useState("#f97316");
  const [customSecondary, setCustomSecondary] = useState("#ec4899");
  const [isApplying, setIsApplying] = useState(false);

  const applyColorsAndFonts = (paletteId: string, typoId: string, primaryOverride?: string, secondaryOverride?: string) => {
    setIsApplying(true);
    setTimeout(() => {
      try {
        const palette = PRESET_PALETTES.find((p) => p.id === paletteId) || PRESET_PALETTES[0];
        const typo = PRESET_TYPOGRAPHY.find((t) => t.id === typoId) || PRESET_TYPOGRAPHY[0];

        const primaryColor = primaryOverride || palette.primary;
        const secondaryColor = secondaryOverride || palette.secondary;
        const accentColor = palette.accent;
        const bgLightColor = palette.bgLight;
        const bgDarkColor = palette.bgDark;

        // Construct high-fidelity stylesheet overrides to overwrite app variables & common tailwind classes
        const themeStyleContent = `
  /* THEME CONFIGURATION OVERLAY */
  @import url('${typo.importUrl}');
  
  :root {
    --primary-color: ${primaryColor};
    --secondary-color: ${secondaryColor};
    --accent-color: ${accentColor};
    --bg-light: ${bgLightColor};
    --bg-dark: ${bgDarkColor};
    
    /* Secondary CSS helper designations */
    --font-heading: '${typo.headingFamily}', sans-serif;
    --font-body: '${typo.bodyFamily}', sans-serif;
  }
  
  /* Apply font styles globally inside iframe sandbox */
  h1, h2, h3, h4, h5, h6, .font-heading {
    font-family: '${typo.headingFamily}', sans-serif !important;
  }
  body, p, span, div, button, input, select, textarea, .font-body {
    font-family: '${typo.bodyFamily}', sans-serif !important;
  }
  
  /* High priority Tailwind overrides to immediately map classes to selected palette */
  .bg-indigo-600, .bg-blue-600, .bg-violet-600, .bg-indigo-500, .bg-blue-500, .bg-purple-600 {
    background-color: ${primaryColor} !important;
  }
  .hover\\:bg-indigo-700:hover, .hover\\:bg-blue-700:hover, .hover\\:bg-indigo-600:hover:hover, .hover\\:bg-purple-700:hover {
    background-color: ${secondaryColor} !important;
  }
  .text-indigo-600, .text-blue-600, .text-violet-600, .text-indigo-500, .text-blue-500, .text-purple-600 {
    color: ${primaryColor} !important;
  }
  .bg-slate-950, .bg-slate-900, .bg-gray-950, .bg-gray-900, .bg-zinc-950 {
    background-color: ${bgDarkColor} !important;
  }
  .bg-indigo-50, .bg-blue-50, .bg-slate-50, .bg-slate-100 {
    background-color: ${bgLightColor} !important;
  }
  .border-indigo-600, .border-blue-600, .border-indigo-500 {
    border-color: ${primaryColor} !important;
  }
  .focus\\:ring-indigo-500:focus, .focus\\:ring-blue-500:focus {
    --tw-ring-color: ${primaryColor} !important;
  }
`;

        // Parse HTML to update CSS variables & styling content
        let updatedHtml = currentHtml;

        // 1. If we already injected variables in previously modified app code, we should replace it
        const themeStyleRegex = /<style id="app-designer-theme-injector">[\s\S]*?<\/style>/i;
        if (themeStyleRegex.test(updatedHtml)) {
          updatedHtml = updatedHtml.replace(
            themeStyleRegex,
            `<style id="app-designer-theme-injector">${themeStyleContent}</style>`
          );
        } else {
          // Put standard variables and override styling code in <head> tag right before closing </head>
          if (updatedHtml.includes("</head>")) {
            updatedHtml = updatedHtml.replace(
              "</head>",
              `  <style id="app-designer-theme-injector">${themeStyleContent}</style>\n</head>`
            );
          } else {
            // Fallback prepend to html body
            updatedHtml = `<style id="app-designer-theme-injector">${themeStyleContent}</style>\n` + updatedHtml;
          }
        }

        // 2. Scan and replace literal styles if the source app defines variables directly on :root inside some other style block
        const rootVarsRegex = /:root\s*{([\s\S]*?)}/gi;
        if (rootVarsRegex.test(updatedHtml)) {
          updatedHtml = updatedHtml.replace(rootVarsRegex, (match, innerContent) => {
            let replaced = innerContent;
            // replace --primary-color or --primary or similar keys if exist
            if (replaced.includes("--primary")) {
              replaced = replaced.replace(/(--primary(?:-color)?\s*:\s*)[^;]+(;?)/g, `$1${primaryColor}$2`);
            }
            if (replaced.includes("--secondary")) {
              replaced = replaced.replace(/(--secondary(?:-color)?\s*:\s*)[^;]+(;?)/g, `$1${secondaryColor}$2`);
            }
            if (replaced.includes("--accent")) {
              replaced = replaced.replace(/(--accent(?:-color)?\s*:\s*)[^;]+(;?)/g, `$1${accentColor}$2`);
            }
            if (replaced.includes("--bg-light")) {
              replaced = replaced.replace(/(--bg-light\s*:\s*)[^;]+(;?)/g, `$1${bgLightColor}$2`);
            }
            if (replaced.includes("--bg-dark")) {
              replaced = replaced.replace(/(--bg-dark\s*:\s*)[^;]+(;?)/g, `$1${bgDarkColor}$2`);
            }
            return `:root {${replaced}}`;
          });
        }

        onUpdateCode(updatedHtml);
      } catch (err) {
        console.error("Theme application error: ", err);
      } finally {
        setIsApplying(false);
      }
    }, 450);
  };

  const handlePaletteSelect = (paletteId: string) => {
    setSelectedPalette(paletteId);
    if (paletteId === "custom") {
      applyColorsAndFonts("custom", selectedTypo, customPrimary, customSecondary);
    } else {
      const palette = PRESET_PALETTES.find((p) => p.id === paletteId);
      if (palette) {
        setCustomPrimary(palette.primary);
        setCustomSecondary(palette.secondary);
        applyColorsAndFonts(paletteId, selectedTypo);
      }
    }
  };

  const handleTypoSelect = (typoId: string) => {
    setSelectedTypo(typoId);
    applyColorsAndFonts(selectedPalette, typoId, customPrimary, customSecondary);
  };

  const handleCustomColorChange = (type: "primary" | "secondary", hex: string) => {
    if (type === "primary") {
      setCustomPrimary(hex);
      setSelectedPalette("custom");
      applyColorsAndFonts("custom", selectedTypo, hex, customSecondary);
    } else {
      setCustomSecondary(hex);
      setSelectedPalette("custom");
      applyColorsAndFonts("custom", selectedTypo, customPrimary, hex);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5 text-left animate-fadeIn">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-605" />
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Visual Theme Control</h3>
            <p className="text-[11px] text-slate-500">Choose global color preset and font identity</p>
          </div>
        </div>
        {isApplying && (
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Applying...</span>
          </div>
        )}
      </div>

      {/* Preset Swatches list */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
          <Palette className="w-3.5 h-3.5 text-indigo-500" /> Color Palettes
        </span>
        <div className="grid grid-cols-1 gap-2">
          {PRESET_PALETTES.map((palette) => {
            const isSelected = selectedPalette === palette.id;
            return (
              <button
                key={palette.id}
                onClick={() => handlePaletteSelect(palette.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer hover:bg-slate-50 relative ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/10 shadow-sm"
                    : "border-slate-105 bg-white"
                }`}
              >
                <div className="flex flex-col gap-0.5 max-w-[65%]">
                  <span className="font-bold text-xs text-slate-800">{palette.name}</span>
                  <span className="text-[10px] text-slate-500 truncate" title={palette.description}>
                    {palette.description}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <span className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: palette.primary }} />
                    <span className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: palette.secondary }} />
                    <span className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: palette.bgDark }} />
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Custom color picker row */}
          <div
            className={`p-2.5 rounded-xl border text-left flex flex-col gap-2.5 transition ${
              selectedPalette === "custom"
                ? "border-indigo-500 bg-indigo-50/10 shadow-sm"
                : "border-slate-105 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">Custom Palette Designer</span>
              {selectedPalette === "custom" && (
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 px-2 rounded-lg border border-slate-100">
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => handleCustomColorChange("primary", e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase font-bold font-mono">Primary</span>
                  <span className="text-[10px] font-mono text-slate-700 uppercase">{customPrimary}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1.5 px-2 rounded-lg border border-slate-100">
                <input
                  type="color"
                  value={customSecondary}
                  onChange={(e) => handleCustomColorChange("secondary", e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase font-bold font-mono">Secondary</span>
                  <span className="text-[10px] font-mono text-slate-700 uppercase">{customSecondary}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Font typography selection */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
          <FontIcon className="w-3.5 h-3.5 text-indigo-505" /> Typography Identity
        </span>
        <div className="grid grid-cols-1 gap-2">
          {PRESET_TYPOGRAPHY.map((typo) => {
            const isSelected = selectedTypo === typo.id;
            return (
              <button
                key={typo.id}
                onClick={() => handleTypoSelect(typo.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer hover:bg-slate-50 relative ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/10 shadow-sm"
                    : "border-slate-105 bg-white"
                }`}
              >
                <div className="flex flex-col gap-0.5 max-w-[80%]">
                  <span className="font-bold text-xs text-slate-800">{typo.name}</span>
                  <span className="text-[10px] text-slate-500 leading-normal">
                    {typo.description}
                  </span>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="font-semibold text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                      H: {typo.headingFamily}
                    </span>
                    <span className="font-normal text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                      B: {typo.bodyFamily}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Small informative advice */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10.5px] text-slate-500 leading-relaxed flex items-start gap-1.5">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p>
          Applying theme choices immediately injects customized typography pairings and overrides any base colors found in the generated mockup code.
        </p>
      </div>
    </div>
  );
}
