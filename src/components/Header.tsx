import React from "react";
import { Sparkles, Globe, FolderGit, LogIn, LogOut, Code, UserCheck, Compass } from "lucide-react";
import { ActiveTab } from "../types";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: any;
  loadingAuth: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isGuest: boolean;
  guestUserEmail: string;
  onStartTour?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  user,
  loadingAuth,
  onLogin,
  onLogout,
  isGuest,
  guestUserEmail,
  onStartTour,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      {/* Brand Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg ring-1 ring-indigo-400/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 bg-clip-text text-transparent">
            Application Wizard
          </h1>
          <p className="text-xs text-slate-500 font-mono">Mobile App Builder & Marketplace</p>
        </div>
      </div>

      {/* Primary Navigation Toggles */}
      <nav className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab("design-studio")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "design-studio"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Design Lab</span>
        </button>

        <button
          onClick={() => setActiveTab("marketplace")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "marketplace"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Marketplace</span>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-1 ring-indigo-300/20">
            Feed
          </span>
        </button>

        <button
          onClick={() => setActiveTab("my-vault")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "my-vault"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <FolderGit className="w-4 h-4" />
          <span>My Vault</span>
        </button>
      </nav>

      {/* User Session Handler */}
      <div className="flex items-center gap-3">
        {onStartTour && (
          <button
            onClick={onStartTour}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-indigo-650 hover:text-indigo-800 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-sm"
            title="Take Application Wizard Tour"
          >
            <Compass className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline">Quick Tour</span>
          </button>
        )}

        {loadingAuth ? (
          <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-1.5 pr-3 rounded-xl border border-slate-200/80 transition duration-150">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-7 h-7 rounded-lg ring-1 ring-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 bg-indigo-900 rounded-lg flex items-center justify-center font-bold text-xs text-indigo-300">
                {String(user.displayName || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-800 max-w-[120px] truncate">
                {user.displayName || "Craft User"}
              </p>
              <p className="text-[10px] text-slate-500 max-w-[120px] truncate">
                {user.email || "cloud auth active"}
              </p>
            </div>
            <button
              onClick={onLogout}
              title="Logout session"
              className="p-1 px-1.5 ml-2 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg transition duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {isGuest ? (
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-amber-700 font-mono bg-amber-50 rounded-lg border border-amber-200">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[100px] truncate">{guestUserEmail}</span>
              </div>
            ) : null}
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition-all duration-150"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sync</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
