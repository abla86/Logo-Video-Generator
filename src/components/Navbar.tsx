import React from "react";
import {
  Sparkles,
  Film,
  Image as ImageIcon,
  LayoutGrid,
  Wand2,
  Palette,
  ShieldCheck,
  Music,
  Mic,
  LogIn,
  LogOut,
  Scissors,
  TrendingUp,
  FolderKanban,
  Upload,
  Sun,
  Moon,
  Download,
} from "lucide-react";
import { ActiveTab } from "../types";
import { User } from "firebase/auth";
import { CostModeController } from "./CostModeController";

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  logoCount: number;
  videoCount: number;
  user: User | null;
  currentTheme: "dark" | "light";
  onToggleTheme: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenVoice: () => void;
  onOpenInstallModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  logoCount,
  videoCount,
  user,
  currentTheme,
  onToggleTheme,
  onSignIn,
  onSignOut,
  onOpenVoice,
  onOpenInstallModal,
}) => {
  return (
    <header
      className={`border-b sticky top-0 z-40 transition-colors ${
        currentTheme === "light"
          ? "bg-white border-zinc-200 text-zinc-900"
          : "bg-[#0A0A0A] border-[#222] text-[#F0F0F0]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name: SPARK */}
          <div
            className="flex items-center gap-3.5 cursor-pointer select-none"
            onClick={() => onTabChange("video-producer")}
          >
            <div className="w-10 h-10 bg-[#FF3B00] rounded-full flex items-center justify-center font-black text-black text-base shadow-[0_0_15px_rgba(255,59,0,0.3)]">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1
                  className={`text-xl sm:text-2xl font-black tracking-tighter ${
                    currentTheme === "light" ? "text-zinc-950" : "text-[#F0F0F0]"
                  }`}
                >
                  SPARK<span className="text-[#FF3B00]"> Studio</span>
                </h1>
                <span className="hidden xl:inline-block text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-[#333] text-zinc-400 bg-[#121212]">
                  AI SALGS- &amp; VIDEOMOTOR
                </span>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 hidden sm:block">
                Etsy, TikTok, Snapchat, YouTube, Instagram &amp; Facebook
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 lg:gap-3 text-xs font-bold tracking-[0.12em] uppercase overflow-x-auto py-2">
            <button
              id="nav-video-producer"
              onClick={() => onTabChange("video-producer")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "video-producer"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Autopilot Video</span>
            </button>

            <button
              id="nav-strategy-engine"
              onClick={() => onTabChange("strategy-engine")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "strategy-engine"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Salg &amp; Idéer</span>
            </button>

            <button
              id="nav-timeline-editor"
              onClick={() => onTabChange("timeline-editor")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "timeline-editor"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Tidslinje</span>
            </button>

            <button
              id="nav-logo-designer"
              onClick={() => onTabChange("logo-designer")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "logo-designer"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Design</span>
            </button>

            <button
              id="nav-format-hub"
              onClick={() => onTabChange("format-hub")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "format-hub"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Download className="w-3.5 h-3.5 text-[#FF3B00]" />
              <span>Eksport / Import</span>
            </button>

            <button
              id="nav-media-assets"
              onClick={() => onTabChange("media-assets")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "media-assets"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Medier</span>
            </button>

            <button
              id="nav-client-manager"
              onClick={() => onTabChange("client-manager")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "client-manager"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Kunder</span>
            </button>

            <button
              id="nav-brand-shield"
              onClick={() => onTabChange("brand-shield")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap hidden lg:flex ${
                activeTab === "brand-shield"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Varemerke</span>
            </button>

            <button
              id="nav-sonic-branding"
              onClick={() => onTabChange("sonic-branding")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap hidden lg:flex ${
                activeTab === "sonic-branding"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Sonic</span>
            </button>

            <button
              id="nav-gallery"
              onClick={() => onTabChange("gallery")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "gallery"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Studio</span>
              {(logoCount > 0 || videoCount > 0) && (
                <span className="w-4 h-4 rounded-full bg-[#FF3B00] text-black text-[9px] flex items-center justify-center font-black">
                  {logoCount + videoCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Tools: Gratis Lokal Controller + Theme Toggle + Voice + Firebase */}
          <div className="flex items-center gap-2.5">
            {/* Cost & Gratis Lokal Controller */}
            <CostModeController />

            {/* Dark / Light Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${currentTheme === "dark" ? "Light" : "Dark"} Mode (Voice command also supported)`}
              className={`p-1.5 border transition-colors cursor-pointer ${
                currentTheme === "light"
                  ? "border-zinc-300 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  : "border-[#333] bg-[#121212] text-zinc-300 hover:text-white hover:border-[#555]"
              }`}
            >
              {currentTheme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </button>

            {/* Install / Download App Button */}
            <button
              onClick={onOpenInstallModal}
              title="Last ned BrandForge Studio som skrivebordsapp eller ta offline backup"
              className="px-2.5 py-1.5 border border-[#333] hover:border-[#FF3B00] bg-[#121212] text-zinc-300 hover:text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-[#FF3B00]" />
              <span className="hidden md:inline">Last ned app</span>
            </button>

            {/* Live Voice Assistant Trigger */}
            <button
              onClick={onOpenVoice}
              title="Launch Live Voice Director with Gemini 3.8 Live (Voice command: 'Switch to Light/Dark Mode')"
              className="px-2.5 py-1.5 border border-[#333] hover:border-[#FF3B00] bg-[#121212] hover:bg-[#FF3B00]/10 text-white/80 hover:text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mic className="w-3 h-3 text-[#FF3B00] animate-pulse" />
              <span className="hidden sm:inline">Voice Director</span>
            </button>

            {/* Firebase Auth Account Controls */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-[#333] pl-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-7 h-7 rounded-full border border-[#FF3B00]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[10px] font-bold text-white">
                    {user.displayName?.[0] || user.email?.[0] || "U"}
                  </div>
                )}
                <button
                  onClick={onSignOut}
                  title="Logg ut fra Firebase"
                  className="p-1.5 text-zinc-400 hover:text-[#FF3B00] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="px-3 py-1.5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#FF3B00] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
