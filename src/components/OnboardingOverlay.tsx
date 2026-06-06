import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Smartphone,
  Globe,
  FolderGit,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code,
  TrendingDown,
  Activity,
  Heart,
  MessageSquare,
  HelpCircle,
  X,
} from "lucide-react";

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: "design-studio" | "marketplace" | "my-vault") => void;
}

export default function OnboardingOverlay({ isOpen, onClose, onNavigateTab }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      // Optional interactive auto-tab migration to let user see real context
      if (onNavigateTab) {
        if (step === 0) onNavigateTab("design-studio");
        else if (step === 1) onNavigateTab("marketplace");
        else if (step === 2) onNavigateTab("my-vault");
      }
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      if (onNavigateTab) {
        if (step === 1) onNavigateTab("design-studio");
        else if (step === 2) onNavigateTab("design-studio");
        else if (step === 3) onNavigateTab("marketplace");
      }
    }
  };

  const stepsData = [
    {
      title: "Welcome to Application Wizard!",
      subtitle: "Your AI-Powered Mobile App Builder & Community",
      description: "Let's find out how you can build, explore, and share responsive design templates, all within a beautiful native mockup environment.",
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-gradient-to-tr from-indigo-500 to-violet-600 p-5 rounded-3xl shadow-xl border border-indigo-400/20 text-white flex items-center justify-center">
            <Sparkles className="w-10 h-10 animate-bounce" />
          </div>
        </div>
      ),
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mt-2">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-indigo-50 text-indigo-650 p-2 rounded-xl mb-2">
              <Code className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-800">Design Lab</div>
            <div className="text-[10px] text-slate-500 mt-1">Compile layout code instantly via prompt inputs.</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-emerald-50 text-emerald-650 p-2 rounded-xl mb-2">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-800">Marketplace</div>
            <div className="text-[10px] text-slate-500 mt-1">Discover, read commentaries & test collaborative feeds.</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-pink-50 text-pink-650 p-2 rounded-xl mb-2">
              <FolderGit className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-800">Creative Vault</div>
            <div className="text-[10px] text-slate-500 mt-1">Review live engagement and aggregate chart analytics.</div>
          </div>
        </div>
      ),
    },
    {
      title: "Design Lab & Studio workspace",
      subtitle: "Turn Prompts into Functional Applications",
      description: "Harness Gemini to generate clean structural layouts, apply custom guidelines, and view results instantaneously.",
      icon: (
        <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full border border-indigo-100">
          <Smartphone className="w-8 h-8" />
        </div>
      ),
      content: (
        <div className="bg-slate-50/70 border border-slate-200/60 p-4 rounded-2xl flex flex-col gap-3.5 w-full mt-1.5 text-left">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
            <div>
              <div className="text-xs font-bold text-slate-850">Wizard Prompt Control</div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Type your core feature requirement inside the prompt box, define customized tags, or utilize built-in preset guidelines.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
            <div>
              <div className="text-xs font-bold text-slate-850">Device Frame Simulator (iOS / Android)</div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Inspect how compiler designs behave in simulated mobile viewport formats. Play with touch targets, tabs, and interactive triggers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
            <div>
              <div className="text-xs font-bold text-slate-850">Live Manual Coding</div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Access direct code rendering to refine style definitions or insert complex React Hooks directly in the editor workspace.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Public Share Marketplace",
      subtitle: "Join a Growing Community of Creators",
      description: "Any application you publish is instantly displayed to other creators in our community feed.",
      icon: (
        <div className="bg-emerald-50 text-emerald-650 p-4 rounded-full border border-emerald-100">
          <Globe className="w-8 h-8" />
        </div>
      ),
      content: (
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 w-full mt-1.5 shadow-sm text-left">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between border-b border-slate-100 pb-2">
            <span>FEED DISCOVERIES</span>
            <span className="text-emerald-600 font-bold uppercase">● LIVE SYNC</span>
          </div>
          {/* Mock Marketplace card */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 text-xs font-bold font-mono">
              GAME
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-800">Space Invaders 1982</div>
              <p className="text-[10px] text-slate-500 line-clamp-1">Classic retro alien shooter built with canvas grids...</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-slate-550">
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  <span>142 Likes</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-550">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  <span>3 Reviews</span>
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 text-center italic mt-0.5">
            Like community projects, type reviews, or clone any workspace with a single click to experiment!
          </p>
        </div>
      ),
    },
    {
      title: "Private Creative Vault",
      subtitle: "Review Aggregate Performance & Growth",
      description: "The App Vault functions as your personal workspace. Manage local draft products or monitor real-time visitor interactions.",
      icon: (
        <div className="bg-pink-50 text-pink-650 p-4 rounded-full border border-pink-100">
          <FolderGit className="w-8 h-8" />
        </div>
      ),
      content: (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 w-full mt-1.5 text-left">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-extrabold text-slate-800">Dynamic Recharts Analytics</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed -mt-1">
            Our telemetry automatically graphs daily page impressions, view trends, and conversion curves. Assess how visitors consume your published designs.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-white border border-slate-200 p-2 rounded-xl text-center shadow-inner">
              <span className="text-[9px] font-mono font-bold text-indigo-500 block">TOTAL VIEWS</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5">1.2K+</span>
            </div>
            <div className="bg-white border border-slate-200 p-2 rounded-xl text-center shadow-inner">
              <span className="text-[9px] font-mono font-bold text-emerald-600 block">LIKES RATE</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5">24.5%</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = stepsData[step];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          id="onboarding-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Walkthrough Modal Body */}
        <motion.div
          id="onboarding-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center gap-5 overflow-hidden z-10"
        >
          {/* Close button top corner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition cursor-pointer"
            aria-label="Skip walkthrough"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon decoration */}
          <div className="mt-2 mb-1 flex items-center justify-center">
            {currentStepData.icon}
          </div>

          {/* Stepper Headers */}
          <div className="flex flex-col gap-1.5 max-w-sm">
            <h3 className="font-display font-extrabold text-slate-900 text-xl leading-snug tracking-tight">
              {currentStepData.title}
            </h3>
            <p className="text-[11px] font-mono font-bold text-indigo-600/90 uppercase tracking-widest">
              {currentStepData.subtitle}
            </p>
            <p className="text-[12px] text-slate-550 leading-relaxed mt-1">
              {currentStepData.description}
            </p>
          </div>

          {/* Custom Step Content Illustration */}
          <div className="w-full bg-slate-50/50 rounded-2xl p-2 border border-slate-100 min-h-[160px] flex items-center justify-center">
            {currentStepData.content}
          </div>

          {/* Bottom navigation controllers */}
          <div className="w-full flex items-center justify-between border-t border-slate-100 pt-5 mt-2">
            {/* Steps indicator dots */}
            <div className="flex items-center gap-1.5">
              {stepsData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setStep(idx);
                    if (onNavigateTab) {
                      if (idx === 0) onNavigateTab("design-studio");
                      else if (idx === 1) onNavigateTab("design-studio");
                      else if (idx === 2) onNavigateTab("marketplace");
                      else if (idx === 3) onNavigateTab("my-vault");
                    }
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === step ? "w-6 bg-indigo-600" : "w-2 bg-slate-200 hover:bg-slate-350"
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Back & Next Actions */}
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-505 shadow shadow-indigo-600/20 hover:shadow-lg rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <span>{step === totalSteps - 1 ? "Get Crafting!" : "Next Step"}</span>
                {step === totalSteps - 1 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Quick exit footer */}
          {step < totalSteps - 1 && (
            <button
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-650 tracking-wide font-mono hover:underline cursor-pointer"
            >
              Skip entire tour
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
