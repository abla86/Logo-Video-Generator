/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { AutonomousVideoProducer } from "./components/AutonomousVideoProducer";
import { BusinessStrategyEngine } from "./components/BusinessStrategyEngine";
import { TimelineEditor } from "./components/TimelineEditor";
import { MediaAssetImporter } from "./components/MediaAssetImporter";
import { ClientProjectManager } from "./components/ClientProjectManager";
import { LogoDesigner } from "./components/LogoDesigner";
import { LogoAnimator } from "./components/LogoAnimator";
import { StyleTransferStudio } from "./components/StyleTransferStudio";
import { BrandPaletteStudio } from "./components/BrandPaletteStudio";
import { PictureToVideo } from "./components/PictureToVideo";
import { GalleryHistory } from "./components/GalleryHistory";
import { BrandVerificationStudio } from "./components/BrandVerificationStudio";
import { SonicBrandingStudio } from "./components/SonicBrandingStudio";
import { LiveVoiceAssistant } from "./components/LiveVoiceAssistant";
import { UniversalFormatHub } from "./components/UniversalFormatHub";
import {
  ActiveTab,
  GeneratedLogo,
  GeneratedVideo,
  BrandMusicTrack,
  AutonomousVideoProject,
} from "./types";
import {
  auth,
  signInWithGoogle,
  signOutUser,
  saveUserLogo,
  loadUserLogos,
  deleteUserLogo,
  testConnection,
} from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Download, X, Laptop, HardDrive, FileCheck, CheckCircle2, Upload as UploadIcon } from "lucide-react";
import { ProjectContextProvider, useProjectContext } from "./context/ProjectContext";

function AppContent() {
  const projectCtx = useProjectContext();
  const [activeTab, setActiveTab] = useState<ActiveTab>("video-producer");
  const [user, setUser] = useState<User | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [autopilotInitialPrompt, setAutopilotInitialPrompt] = useState<string | null>(null);
  const [backupNotification, setBackupNotification] = useState<string | null>(null);

  // UI Theme mode: 'dark' | 'light' (Voice command supported)
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">(() => {
    try {
      const stored = localStorage.getItem("brandforge_theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch {}
    return "dark";
  });

  // Saved Logos
  const [savedLogos, setSavedLogos] = useState<GeneratedLogo[]>(() => {
    try {
      const stored = localStorage.getItem("app_saved_logos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Saved Videos
  const [savedVideos, setSavedVideos] = useState<GeneratedVideo[]>(() => {
    try {
      const stored = localStorage.getItem("app_saved_videos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Saved Music Tracks
  const [savedTracks, setSavedTracks] = useState<BrandMusicTrack[]>(() => {
    try {
      const stored = localStorage.getItem("app_saved_tracks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentLogo, setCurrentLogo] = useState<GeneratedLogo | null>(() => {
    return savedLogos.length > 0 ? savedLogos[0] : null;
  });

  const [currentVideoProject, setCurrentVideoProject] = useState<AutonomousVideoProject | null>(() => {
    try {
      const stored = localStorage.getItem("brandforge_current_videoproj");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [initialImageForVideo, setInitialImageForVideo] = useState<string | null>(null);

  // Verification preset params
  const [verificationName, setVerificationName] = useState("BrandForge Labs");
  const [verificationIndustry, setVerificationIndustry] = useState("Technology & AI");

  // Sync theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("brandforge_theme", currentTheme);
    } catch {}
  }, [currentTheme]);

  // Listen to PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  // Firebase Auth & Firestore synchronization
  useEffect(() => {
    testConnection().catch(console.warn);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const cloudLogos = await loadUserLogos(currentUser.uid);
          if (cloudLogos && cloudLogos.length > 0) {
            setSavedLogos((prev) => {
              const combined = [...cloudLogos, ...prev];
              const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
              return unique;
            });
          }
        } catch (e) {
          console.warn("Could not load user logos from Firestore:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("app_saved_logos", JSON.stringify(savedLogos));
    } catch (e) {
      console.warn("Could not persist logos to localStorage:", e);
    }
  }, [savedLogos]);

  useEffect(() => {
    try {
      localStorage.setItem("app_saved_videos", JSON.stringify(savedVideos));
    } catch (e) {
      console.warn("Could not persist videos to localStorage:", e);
    }
  }, [savedVideos]);

  useEffect(() => {
    try {
      localStorage.setItem("app_saved_tracks", JSON.stringify(savedTracks));
    } catch (e) {
      console.warn("Could not persist tracks to localStorage:", e);
    }
  }, [savedTracks]);

  const handleLogoGenerated = (logo: GeneratedLogo) => {
    setCurrentLogo(logo);
    setSavedLogos((prev) => [logo, ...prev.filter((l) => l.id !== logo.id)]);
    projectCtx.setCompanyName(logo.companyName);
    projectCtx.setBrandLogoUrl(logo.imageUrl);
    if (user) {
      saveUserLogo(user.uid, logo).catch((err) =>
        console.warn("Firestore cloud save warning:", err)
      );
    }
  };

  const handleAnimateLogo = (logo: GeneratedLogo) => {
    setCurrentLogo(logo);
    setActiveTab("logo-animator");
  };

  const handleConvertToVideo = (logo: GeneratedLogo) => {
    setInitialImageForVideo(logo.imageUrl);
    setActiveTab("picture-to-video");
  };

  const handleOpenStyleTransfer = (logo?: GeneratedLogo) => {
    if (logo) {
      setCurrentLogo(logo);
    }
    setActiveTab("style-transfer");
  };

  const handleOpenPaletteStudio = (logo?: GeneratedLogo) => {
    if (logo) {
      setCurrentLogo(logo);
    }
    setActiveTab("palette-studio");
  };

  const handleOpenBrandShield = (name: string, ind: string) => {
    setVerificationName(name);
    setVerificationIndustry(ind);
    setActiveTab("brand-shield");
  };

  const handleOpenSonicStudio = (logo: GeneratedLogo) => {
    setCurrentLogo(logo);
    setActiveTab("sonic-branding");
  };

  const handleVideoGenerated = (video: GeneratedVideo) => {
    setSavedVideos((prev) => [video, ...prev.filter((v) => v.id !== video.id)]);
  };

  const handleTrackSaved = (track: BrandMusicTrack) => {
    setSavedTracks((prev) => [track, ...prev.filter((t) => t.id !== track.id)]);
  };

  const handleDeleteLogo = (id: string) => {
    setSavedLogos((prev) => prev.filter((l) => l.id !== id));
    if (user) {
      deleteUserLogo(user.uid, id).catch(console.warn);
    }
    if (currentLogo?.id === id) {
      setCurrentLogo(savedLogos.find((l) => l.id !== id) || null);
    }
  };

  const handleDeleteVideo = (id: string) => {
    setSavedVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const handleExportFullWorkspaceBackup = () => {
    try {
      const backupData = {
        app: "BrandForge Studio",
        version: "5.0",
        exportedAt: new Date().toISOString(),
        logos: savedLogos,
        videos: savedVideos,
        tracks: savedTracks,
        currentVideoProject: (() => {
          try {
            const p = localStorage.getItem("brandforge_current_videoproj");
            return p ? JSON.parse(p) : null;
          } catch {
            return null;
          }
        })(),
        clients: (() => {
          try {
            const c = localStorage.getItem("brandforge_clients");
            return c ? JSON.parse(c) : [];
          } catch {
            return [];
          }
        })(),
        campaigns: (() => {
          try {
            const cp = localStorage.getItem("brandforge_campaigns");
            return cp ? JSON.parse(cp) : [];
          } catch {
            return [];
          }
        })(),
        importedAssets: (() => {
          try {
            const a = localStorage.getItem("brandforge_imported_assets");
            return a ? JSON.parse(a) : [];
          } catch {
            return [];
          }
        })(),
        theme: currentTheme,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BrandForge_Studio_Backup_${new Date().toISOString().slice(0, 10)}.brandforge-backup.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupNotification("Komplett sikkerhetskopi lastet ned som JSON!");
      setTimeout(() => setBackupNotification(null), 4000);
    } catch (err: any) {
      console.error("Backup export error:", err);
    }
  };

  const handleImportWorkspaceBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        if (data.logos && Array.isArray(data.logos)) {
          setSavedLogos(data.logos);
          if (data.logos.length > 0) setCurrentLogo(data.logos[0]);
        }
        if (data.videos && Array.isArray(data.videos)) setSavedVideos(data.videos);
        if (data.tracks && Array.isArray(data.tracks)) setSavedTracks(data.tracks);
        if (data.clients) localStorage.setItem("brandforge_clients", JSON.stringify(data.clients));
        if (data.campaigns) localStorage.setItem("brandforge_campaigns", JSON.stringify(data.campaigns));
        if (data.importedAssets) localStorage.setItem("brandforge_imported_assets", JSON.stringify(data.importedAssets));
        if (data.currentVideoProject) localStorage.setItem("brandforge_current_videoproj", JSON.stringify(data.currentVideoProject));
        if (data.theme) setCurrentTheme(data.theme);
        setBackupNotification("Sikkerhetskopi ble importert! Alle prosjekter og data er oppdatert.");
        setTimeout(() => setBackupNotification(null), 4000);
      } catch (err: any) {
        console.error("Backup import error:", err);
        setBackupNotification("Kunne ikke lese sikkerhetskopifilen. Kontroller at det er en gyldig JSON-fil.");
        setTimeout(() => setBackupNotification(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleToggleTheme = () => {
    setCurrentTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-[#FF3B00] selection:text-black ${
        currentTheme === "light"
          ? "bg-[#F8F9FA] text-[#111111]"
          : "bg-[#0A0A0A] text-[#F0F0F0]"
      }`}
    >
      {/* PWA Standalone Install Banner if installable */}
      {installPrompt && (
        <div
          className={`border-b px-4 py-2 flex items-center justify-between text-xs font-mono ${
            currentTheme === "light"
              ? "bg-zinc-100 border-zinc-300 text-zinc-900"
              : "bg-[#151515] border-[#262626] text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-[#FF3B00]" />
            <span>Installer BrandForge Studio som frittstående skrivebords- eller mobilprogram</span>
          </div>
          <button
            onClick={handleInstallApp}
            className="px-3 py-1 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-[10px] tracking-widest cursor-pointer transition-colors"
          >
            Installer App
          </button>
        </div>
      )}

      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        logoCount={savedLogos.length}
        videoCount={savedVideos.length}
        user={user}
        currentTheme={currentTheme}
        onToggleTheme={handleToggleTheme}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {/* TAB 1: Autonomous Video Producer (Creative Autopilot) */}
        {activeTab === "video-producer" && (
          <AutonomousVideoProducer
            onOpenTimeline={(proj) => {
              setCurrentVideoProject(proj);
              setActiveTab("timeline-editor");
            }}
            companyName={currentLogo?.companyName || "BrandForge Labs"}
            brandLogoUrl={currentLogo?.imageUrl}
            initialPrompt={autopilotInitialPrompt || undefined}
          />
        )}

        {/* TAB 2: Commercial Sales & Business Strategy Engine */}
        {activeTab === "strategy-engine" && (
          <BusinessStrategyEngine
            onApplyStrategyToAutopilot={(strategyPrompt) => {
              setAutopilotInitialPrompt(strategyPrompt);
              setActiveTab("video-producer");
            }}
          />
        )}

        {/* TAB 3: Professional Multi-Track Timeline Editor */}
        {activeTab === "timeline-editor" && (
          <TimelineEditor
            project={currentVideoProject}
            companyName={currentLogo?.companyName || "BrandForge Labs"}
          />
        )}

        {/* TAB 4: Media Asset Importer & Vault */}
        {activeTab === "media-assets" && (
          <MediaAssetImporter
            onSelectAssetForScene={(asset) => {
              try {
                localStorage.setItem("brandforge_pending_timeline_asset", JSON.stringify(asset));
              } catch {}
              setActiveTab("timeline-editor");
            }}
          />
        )}

        {/* TAB 5: Client & Campaign Project Manager */}
        {activeTab === "client-manager" && <ClientProjectManager />}

        {/* TAB 6: Logo & Brand Kit Designer */}
        {activeTab === "logo-designer" && (
          <LogoDesigner
            onLogoGenerated={handleLogoGenerated}
            onAnimateLogo={handleAnimateLogo}
            onConvertToVideo={handleConvertToVideo}
            onOpenStyleTransfer={handleOpenStyleTransfer}
            onOpenPaletteStudio={handleOpenPaletteStudio}
            onOpenBrandShield={handleOpenBrandShield}
            onOpenSonicStudio={handleOpenSonicStudio}
          />
        )}

        {/* TAB 6B: Universal Format, Export & Import Hub */}
        {activeTab === "format-hub" && (
          <UniversalFormatHub
            currentLogo={currentLogo}
            currentVideoProject={currentVideoProject}
            onImportLogo={(logo) => {
              setCurrentLogo(logo);
              setSavedLogos((prev) => [logo, ...prev]);
              setActiveTab("logo-designer");
            }}
            onImportVideoProject={(project) => {
              setCurrentVideoProject(project);
              try {
                localStorage.setItem("brandforge_current_videoproj", JSON.stringify(project));
              } catch {}
              setActiveTab("timeline-editor");
            }}
            onOpenTimeline={() => setActiveTab("timeline-editor")}
          />
        )}

        {/* TAB 7: Trademark Shield & Search Clearance */}
        {activeTab === "brand-shield" && (
          <BrandVerificationStudio
            initialCompanyName={verificationName}
            initialIndustry={verificationIndustry}
            currentLogo={currentLogo}
            userId={user?.uid}
            onUseNameInDesigner={(name) => {
              setVerificationName(name);
              setActiveTab("logo-designer");
            }}
          />
        )}

        {/* TAB 8: Sonic Branding & Music Generator */}
        {activeTab === "sonic-branding" && (
          <SonicBrandingStudio
            currentLogo={currentLogo}
            onTrackSaved={handleTrackSaved}
          />
        )}

        {/* TAB 9: Kinetic Logo Animator */}
        {activeTab === "logo-animator" && (
          <LogoAnimator
            currentLogo={currentLogo}
            savedLogos={savedLogos}
            onSelectLogo={(logo) => setCurrentLogo(logo)}
            onVideoGenerated={handleVideoGenerated}
            onOpenPalette={() => setActiveTab("palette-studio")}
            onOpenStyleTransfer={() => setActiveTab("style-transfer")}
          />
        )}

        {/* TAB 10: Style Transfer Studio */}
        {activeTab === "style-transfer" && (
          <StyleTransferStudio
            currentLogo={currentLogo}
            savedLogos={savedLogos}
            onLogoGenerated={handleLogoGenerated}
            onAnimateLogo={handleAnimateLogo}
            onConvertToVideo={handleConvertToVideo}
          />
        )}

        {/* TAB 11: Brand Palette Studio */}
        {activeTab === "palette-studio" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BrandPaletteStudio
              currentLogo={currentLogo}
              companyName={currentLogo?.companyName || "BrandForge Labs"}
              description={currentLogo?.promptUsed || "Futuristic AI and kinetic design technology"}
              industry={currentLogo?.industry || "Technology & AI"}
            />
          </div>
        )}

        {/* TAB 12: Picture to Video (Veo) */}
        {activeTab === "picture-to-video" && (
          <PictureToVideo
            initialImage={initialImageForVideo || currentLogo?.imageUrl || null}
            savedLogos={savedLogos}
            onVideoGenerated={handleVideoGenerated}
          />
        )}

        {/* TAB 13: Studio Gallery History */}
        {activeTab === "gallery" && (
          <GalleryHistory
            savedLogos={savedLogos}
            savedVideos={savedVideos}
            onSelectLogo={(logo) => {
              setCurrentLogo(logo);
              setActiveTab("logo-animator");
            }}
            onSelectVideo={() => {
              setActiveTab("picture-to-video");
            }}
            onDeleteLogo={handleDeleteLogo}
            onDeleteVideo={handleDeleteVideo}
          />
        )}
      </main>

      {/* Real-time Voice Consultation Modal with Live Voice Theme Command */}
      <LiveVoiceAssistant
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        companyName={currentLogo?.companyName || "BrandForge Labs"}
        onThemeChange={(theme) => setCurrentTheme(theme)}
      />

      {/* Backup Notification Toast */}
      {backupNotification && (
        <div className="fixed bottom-16 right-6 z-50 p-4 bg-[#141416] border-2 border-[#FF3B00] text-white shadow-2xl rounded flex items-center gap-3 text-xs font-mono animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{backupNotification}</span>
        </div>
      )}

      {/* Standalone App Install & Complete Backup Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#141416] border-2 border-[#333] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setIsInstallModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-[#262626] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF3B00] rounded flex items-center justify-center font-black text-black text-lg">
                  B
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    BrandForge Studio // Programinstallasjon &amp; Offline Eksport
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    Kjør programmet som en frittstående skrivebordsapp eller ta full offline sikkerhetskopi.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: PWA Desktop / Mobile Install */}
            <div className="p-4 bg-[#101012] border border-[#262626] rounded space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#FF3B00]" />
                  <span className="font-bold text-sm text-white uppercase font-mono">
                    1. Frittstående Skrivebordsapp (PWA)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  OFFLINE KLAR
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                BrandForge Studio er programmert med Progressive Web App (PWA) standarder med Service Worker og Web App Manifest. Du kan installere programmet direkte på Windows, Mac, Linux, iPhone eller Android, slik at det kjører i eget vindu uten nettleserlinjer.
              </p>

              {installPrompt ? (
                <button
                  onClick={handleInstallApp}
                  className="w-full py-3 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Installer BrandForge Studio på denne enheten nå</span>
                </button>
              ) : (
                <div className="p-3 bg-[#18181A] border border-[#333] text-xs font-mono text-zinc-300 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Slik installerer du programmet i din nettleser:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                    <li><strong>Google Chrome / Edge:</strong> Klikk på installeringsikonet (skjerm med ned-pil) helt til høyre i adressefeltet, eller meny (... ) &rarr; «Installer BrandForge Studio».</li>
                    <li><strong>Apple Safari (Mac):</strong> Gå til Fil &rarr; «Legg til i Dock...» for å kjøre som ekte Mac-app.</li>
                    <li><strong>iPhone / iPad (iOS):</strong> Trykk på Del-ikonet i Safari og velg «Legg til på Hjem-skjerm».</li>
                    <li><strong>Android:</strong> Trykk på menyen og velg «Legg til på startskjerm».</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Section 2: Complete Workspace Archive Export & Restore */}
            <div className="p-4 bg-[#101012] border border-[#262626] rounded space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#00E5FF]" />
                <span className="font-bold text-sm text-white uppercase font-mono">
                  2. Komplett Offline Sikkerhetskopi &amp; Prosjektarkiv
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Ta vare på alle dine logoer ({savedLogos.length}), videoer ({savedVideos.length}), lydspor ({savedTracks.length}), kundeprofiler og aktive prosjekter i én bærbar JSON-fil. Ingen data går tapt.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleExportFullWorkspaceBackup}
                  className="py-2.5 px-3 bg-[#1C1C1E] hover:bg-[#252528] border border-[#333] hover:border-white text-white font-mono text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Last ned Sikkerhetskopi</span>
                </button>

                <label className="py-2.5 px-3 bg-[#1C1C1E] hover:bg-[#252528] border border-[#333] hover:border-white text-white font-mono text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <UploadIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gjenopprett / Importer</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportWorkspaceBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Section 3: Self-contained Node.js & FFmpeg execution */}
            <div className="p-3 bg-[#101012] border border-[#222] rounded text-[11px] font-mono text-zinc-400 space-y-1">
              <div className="text-white font-bold uppercase">
                3. Lokal Full-Stack Kjøring (Node.js + FFmpeg):
              </div>
              <p>
                BrandForge Studio kjører med innebygd Express backend og lokal FFmpeg videoprosessering. For 100% lokal terminalkjøring kan du kjøre <code className="text-white bg-[#1C1C1E] px-1 py-0.5">node server.ts</code> eller <code className="text-white bg-[#1C1C1E] px-1 py-0.5">npm run dev</code> på port 3000.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Commercial Telemetry Footer */}
      <footer
        className={`h-12 border-t flex items-center px-4 sm:px-10 text-[10px] font-mono transition-colors ${
          currentTheme === "light"
            ? "bg-zinc-100 border-zinc-300 text-zinc-600"
            : "bg-[#0A0A0A] border-[#222] text-zinc-400 opacity-70"
        }`}
      >
        <div className="flex gap-6 sm:gap-10 items-center w-full">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="uppercase tracking-widest font-bold">
              BrandForge Commercial Suite v5.0
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>GRATIS LOKAL MOTOR</span>
            <span>•</span>
            <span>GEMINI LIVE VOICE</span>
            <span>•</span>
            <span>FFMPEG MP4</span>
            <span>•</span>
            <span>FFPROBE VALIDERT</span>
          </div>
          <div className="ml-auto flex gap-4 sm:gap-6 tracking-wider">
            <span>{user ? `SKY-SYNK: ${user.email}` : "LOKAL SIKKER SESJON"}</span>
            <span className="hidden md:inline">STANDALONE READY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ProjectContextProvider>
      <AppContent />
    </ProjectContextProvider>
  );
}
