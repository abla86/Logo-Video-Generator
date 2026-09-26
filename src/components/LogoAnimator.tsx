import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Film,
  Download,
  Smartphone,
  CreditCard,
  Building2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Sliders,
  Video,
  Layers,
  Palette,
  Wand2,
} from "lucide-react";
import {
  GeneratedLogo,
  GeneratedVideo,
  AnimationPresetId,
  AnimationMode,
  VideoAspectRatio,
} from "../types";
import { ANIMATION_PRESETS, LOGO_ANIMATION_PROMPTS } from "../data/presets";
import { recordAnimatedLogoClip, GeneratedClipResult } from "../utils/recordCanvasClip";

interface LogoAnimatorProps {
  currentLogo: GeneratedLogo | null;
  savedLogos: GeneratedLogo[];
  onSelectLogo: (logo: GeneratedLogo) => void;
  onVideoGenerated: (video: GeneratedVideo) => void;
  onOpenPalette?: () => void;
  onOpenStyleTransfer?: () => void;
}

export const LogoAnimator: React.FC<LogoAnimatorProps> = ({
  currentLogo,
  savedLogos,
  onSelectLogo,
  onVideoGenerated,
  onOpenPalette,
  onOpenStyleTransfer,
}) => {
  // Active animation preset
  const [selectedPresetId, setSelectedPresetId] = useState<AnimationPresetId>("fade-in");
  const [activeViewMode, setActiveViewMode] = useState<"preset" | "3d-tilt" | "mockup">("preset");
  const [isPlaying, setIsPlaying] = useState(true);
  const [motionSpeed, setMotionSpeed] = useState<number>(1);
  const [glowIntensity, setGlowIntensity] = useState<number>(50);
  const [replayKey, setReplayKey] = useState<number>(0);

  // Mockup mode sub-selection
  const [activeMockup, setActiveMockup] = useState<"app-icon" | "business-card" | "signboard">("app-icon");

  // Instant HTML5 Video Clip Recording State
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordedClip, setRecordedClip] = useState<GeneratedClipResult | null>(null);
  const [clipSavedToGallery, setClipSavedToGallery] = useState(false);

  // Veo AI Video generation state
  const [veoPrompt, setVeoPrompt] = useState<string>(
    ANIMATION_PRESETS.find((p) => p.id === "fade-in")?.veoPrompt || LOGO_ANIMATION_PROMPTS[0].prompt
  );
  const [veoAspectRatio, setVeoAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [veoResolution, setVeoResolution] = useState<"720p" | "1080p">("720p");
  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false);
  const [veoError, setVeoError] = useState<string | null>(null);
  const [generatedVeoVideo, setGeneratedVeoVideo] = useState<GeneratedVideo | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>("");

  // 3D tilt tracking ref
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Synchronize Veo prompt when preset changes
  useEffect(() => {
    const preset = ANIMATION_PRESETS.find((p) => p.id === selectedPresetId);
    if (preset) {
      setVeoPrompt(preset.veoPrompt);
    }
  }, [selectedPresetId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeViewMode !== "3d-tilt" || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / (rect.height / 2)) * -18,
      y: (x / (rect.width / 2)) * 18,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleTriggerReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  // Generate Short Animated Video Clip directly via Canvas & MediaRecorder
  const handleGenerateShortClip = async () => {
    if (!activeLogo) return;

    setIsRecordingClip(true);
    setRecordingProgress(0);
    setRecordedClip(null);
    setClipSavedToGallery(false);

    try {
      const result = await recordAnimatedLogoClip({
        logoUrl: activeLogo.imageUrl,
        companyName: activeLogo.companyName,
        industry: activeLogo.industry,
        presetId: selectedPresetId,
        durationMs: 3500,
        onProgress: (pct) => setRecordingProgress(pct),
      });

      setRecordedClip(result);
    } catch (err: any) {
      console.error("Clip recording failed:", err);
      setVeoError("Could not generate video clip: " + (err.message || err));
    } finally {
      setIsRecordingClip(false);
    }
  };

  // Save generated animated clip to Studio repository
  const handleSaveClipToGallery = () => {
    if (!recordedClip || !activeLogo) return;

    const newVideo: GeneratedVideo = {
      id: `clip-${Date.now()}`,
      operationName: `client-clip-${Date.now()}`,
      streamUrl: recordedClip.videoUrl,
      prompt: `Animated ${selectedPresetId} motion clip (${recordedClip.durationSeconds}s loop)`,
      sourceImage: activeLogo.imageUrl,
      aspectRatio: "16:9",
      resolution: "720p",
      timestamp: Date.now(),
      title: `${activeLogo.companyName} - ${selectedPresetId.toUpperCase()}`,
    };

    onVideoGenerated(newVideo);
    setClipSavedToGallery(true);
  };

  // Veo video generation pipeline using veo-3.1-fast-generate-preview
  const handleGenerateVeoVideo = async () => {
    if (!activeLogo) {
      setVeoError("Please select or generate a logo first.");
      return;
    }

    setIsGeneratingVeo(true);
    setVeoError(null);
    setGeneratedVeoVideo(null);
    setPollingStatus("Contacting Veo 3.1 Fast video engine...");

    try {
      const startRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: veoPrompt,
          imageBase64: activeLogo.imageUrl,
          aspectRatio: veoAspectRatio,
          resolution: veoResolution,
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.operationName) {
        throw new Error(startData.error || "Failed to start Veo video generation.");
      }

      const opName = startData.operationName;
      setPollingStatus("Synthesizing fluid logo animation with Veo 3.1...");

      let isDone = false;
      let attempts = 0;
      const maxAttempts = 120;

      const poll = async () => {
        while (!isDone && attempts < maxAttempts) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 3500));

          if (attempts === 3) {
            setPollingStatus("Analyzing logo contours and specular reflections...");
          } else if (attempts === 8) {
            setPollingStatus("Generating cinematic camera sweep & particle dynamics...");
          } else if (attempts === 15) {
            setPollingStatus("Encoding high-definition video frames...");
          }

          try {
            const statusRes = await fetch("/api/video-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName: opName }),
            });

            const statusData = await statusRes.json();
            if (!statusRes.ok) {
              throw new Error(statusData.error || "Status check failed");
            }

            if (statusData.error) {
              throw new Error(statusData.error);
            }

            if (statusData.done) {
              isDone = true;
              const streamUrl = statusData.streamUrl || `/api/video-stream?name=${encodeURIComponent(opName)}`;
              const newVideo: GeneratedVideo = {
                id: `veo-${Date.now()}`,
                operationName: opName,
                streamUrl,
                prompt: veoPrompt,
                sourceImage: activeLogo.imageUrl,
                aspectRatio: veoAspectRatio,
                resolution: veoResolution,
                timestamp: Date.now(),
                title: `${activeLogo.companyName} Animated Logo`,
              };

              setGeneratedVeoVideo(newVideo);
              onVideoGenerated(newVideo);
              setIsGeneratingVeo(false);
              break;
            }
          } catch (pollErr: any) {
            console.warn("Poll attempt error:", pollErr);
          }
        }

        if (!isDone) {
          throw new Error("Video generation timed out. Please retry.");
        }
      };

      await poll();
    } catch (err: any) {
      console.error(err);
      setVeoError(err.message || "Failed to generate video.");
      setIsGeneratingVeo(false);
    }
  };

  const fallbackLogo: GeneratedLogo = {
    id: "default-logo",
    imageUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%230E0E0E'/><circle cx='200' cy='200' r='110' fill='none' stroke='%23FF3B00' stroke-width='8'/><polygon points='200,110 265,245 135,245' fill='none' stroke='%23F0F0F0' stroke-width='6'/><circle cx='200' cy='200' r='24' fill='%23FF3B00'/></svg>",
    companyName: "BrandForge Labs",
    industry: "Technology & AI",
    promptUsed: "Default Bauhaus logo",
    imageSize: "1K",
    aspectRatio: "1:1",
    timestamp: Date.now(),
  };

  const activeLogo = currentLogo || (savedLogos.length > 0 ? savedLogos[0] : fallbackLogo);

  // Determine active animation class and styles based on preset
  const getAnimationClass = () => {
    if (!isPlaying || activeViewMode !== "preset") return "";
    switch (selectedPresetId) {
      case "fade-in":
        return "animate-[presetFadeIn_1.4s_ease-out_forwards]";
      case "elastic-bounce":
        return "animate-[presetElasticBounce_1.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]";
      case "orbit-spin":
        return `animate-[presetOrbitSpin_${8 / motionSpeed}s_linear_infinite]`;
      case "pulse-breathe":
        return `animate-[presetPulseBreathe_${3 / motionSpeed}s_ease-in-out_infinite]`;
      case "glitch-scan":
        return `animate-[presetGlitchScan_${2 / motionSpeed}s_steps(2)_infinite]`;
      case "flip-3d":
        return `animate-[presetFlip3D_${2.5 / motionSpeed}s_cubic-bezier(0.4,0,0.2,1)_forwards]`;
      case "liquid-wave":
        return `animate-[presetLiquidWave_${3.5 / motionSpeed}s_ease-in-out_infinite]`;
      case "shimmer-sheen":
        return "";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Logo Switcher */}
      <div className="mb-8 border-b border-[#222] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF3B00] font-black">
              KINETIC CHOREOGRAPHY // ANIMATION PRESETS
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border border-[#333] text-white/50 bg-[#0E0E0E]">
              60 FPS CLIP RECORDER + VEO 3.1
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            Logo Motion Studio
          </h2>
          <p className="mt-1 text-xs text-white/60 font-light tracking-wide max-w-2xl">
            Choose animation presets (fade-in, bounce, spin, pulse, glitch) to preview real-time kinetic motion, record instant animated video clips, and synthesize cinematic AI films with{" "}
            <span className="font-bold text-[#FF3B00]">Veo 3.1 Fast</span>.
          </p>
        </div>

        {/* Action Shortcuts & Switcher */}
        <div className="flex items-center gap-3">
          {onOpenPalette && (
            <button
              onClick={onOpenPalette}
              className="px-3 py-2 border border-[#333] hover:border-[#FF3B00] text-white/80 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 bg-[#151515] transition-colors cursor-pointer"
            >
              <Palette className="w-3 h-3 text-[#FF3B00]" />
              <span>Palette</span>
            </button>
          )}

          {onOpenStyleTransfer && (
            <button
              onClick={onOpenStyleTransfer}
              className="px-3 py-2 border border-[#333] hover:border-[#FF3B00] text-white/80 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 bg-[#151515] transition-colors cursor-pointer"
            >
              <Wand2 className="w-3 h-3 text-[#FF3B00]" />
              <span>Style Transfer</span>
            </button>
          )}

          {savedLogos.length > 1 && (
            <div className="flex items-center gap-2 border-l border-[#333] pl-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Switch:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs py-1">
                {savedLogos.map((lg) => (
                  <button
                    key={lg.id}
                    onClick={() => onSelectLogo(lg)}
                    className={`w-9 h-9 border transition-all flex-shrink-0 cursor-pointer ${
                      lg.id === activeLogo.id
                        ? "border-[#FF3B00] shadow-[0_0_10px_rgba(255,59,0,0.5)]"
                        : "border-[#333] opacity-50 hover:opacity-100"
                    }`}
                    title={lg.companyName}
                  >
                    <img
                      src={lg.imageUrl}
                      alt={lg.companyName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Animation Stage & Playback Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            {/* View Mode Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-[#222]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveViewMode("preset")}
                  className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                    activeViewMode === "preset"
                      ? "border border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                      : "border border-[#333] bg-[#0E0E0E] text-white/60 hover:text-white"
                  }`}
                >
                  Animation Presets
                </button>

                <button
                  type="button"
                  onClick={() => setActiveViewMode("3d-tilt")}
                  className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                    activeViewMode === "3d-tilt"
                      ? "border border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                      : "border border-[#333] bg-[#0E0E0E] text-white/60 hover:text-white"
                  }`}
                >
                  Interactive 3D Tilt
                </button>

                <button
                  type="button"
                  onClick={() => setActiveViewMode("mockup")}
                  className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                    activeViewMode === "mockup"
                      ? "border border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                      : "border border-[#333] bg-[#0E0E0E] text-white/60 hover:text-white"
                  }`}
                >
                  Mockup Showcase
                </button>
              </div>

              {/* Playback Trigger & Replay */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerReplay}
                  className="p-2 border border-[#333] bg-[#0E0E0E] text-white/70 hover:text-white hover:border-[#FF3B00] transition-colors cursor-pointer"
                  title="Replay Animation Entrance"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 border border-[#333] bg-[#0E0E0E] text-white/80 hover:text-white hover:border-[#FF3B00] transition-colors cursor-pointer"
                  title={isPlaying ? "Pause Animation" : "Play Animation"}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Animation Stage Canvas */}
            <div
              ref={stageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative min-h-[420px] bg-[#0E0E0E] border border-[#222] overflow-hidden flex items-center justify-center p-8 select-none"
              style={{ perspective: "1000px" }}
            >
              {/* Radial Dot Matrix Backdrop */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#FF3B00 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Bauhaus Concentric Framing Circles */}
              <div className="absolute w-72 h-72 border border-[#222] rounded-full pointer-events-none opacity-40"></div>
              <div className="absolute w-96 h-96 border border-[#222] rounded-full pointer-events-none opacity-20"></div>

              {/* Preset / 3D Mode Canvas */}
              {activeViewMode !== "mockup" && (
                <div
                  key={`anim-wrapper-${replayKey}`}
                  className="relative z-10 flex flex-col items-center justify-center transition-transform duration-100 ease-out"
                  style={{
                    transform:
                      activeViewMode === "3d-tilt"
                        ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.05, 1.05, 1.05)`
                        : undefined,
                  }}
                >
                  {/* Dynamic Radial Glow */}
                  <div
                    className="absolute -inset-8 rounded-full blur-3xl opacity-35 transition-all pointer-events-none"
                    style={{
                      backgroundColor: "#FF3B00",
                      filter: `blur(${glowIntensity}px)`,
                      transform: isPlaying ? "scale(1.1)" : "scale(1)",
                      animation:
                        isPlaying && selectedPresetId === "pulse-breathe"
                          ? `pulse ${2 / motionSpeed}s infinite ease-in-out`
                          : "none",
                    }}
                  />

                  {/* Preset Orbital Halo Rings */}
                  {selectedPresetId === "orbit-spin" && isPlaying && activeViewMode === "preset" && (
                    <>
                      <div
                        className="absolute -inset-16 rounded-full border border-[#FF3B00]/40 pointer-events-none"
                        style={{
                          animation: `spin ${8 / motionSpeed}s linear infinite`,
                        }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B00] shadow-[0_0_12px_#FF3B00] absolute -top-1.5 left-1/2 -translate-x-1/2"></div>
                      </div>
                      <div
                        className="absolute -inset-24 rounded-full border border-white/20 border-dashed pointer-events-none"
                        style={{
                          animation: `spin ${14 / motionSpeed}s linear infinite reverse`,
                        }}
                      />
                    </>
                  )}

                  {/* Logo Image Container with Active Animation */}
                  <div
                    className={`relative p-5 bg-[#151515]/90 border border-[#333] shadow-2xl overflow-hidden ${getAnimationClass()}`}
                  >
                    <img
                      src={activeLogo.imageUrl}
                      alt={activeLogo.companyName}
                      referrerPolicy="no-referrer"
                      className="max-h-[250px] max-w-full object-contain drop-shadow-xl"
                    />

                    {/* Specular Shimmer Beam */}
                    {selectedPresetId === "shimmer-sheen" && isPlaying && activeViewMode === "preset" && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none"
                        style={{
                          animation: `shimmer ${2.2 / motionSpeed}s infinite ease-in-out`,
                        }}
                      />
                    )}
                  </div>

                  {/* Brand Typography Banner */}
                  <div className="mt-4 text-center">
                    <span className="text-white font-black tracking-widest uppercase text-xs drop-shadow-md">
                      {activeLogo.companyName}
                    </span>
                    <p className="text-[10px] font-mono text-[#FF3B00] tracking-widest uppercase mt-0.5">
                      {activeLogo.industry || "Identity System"}
                    </p>
                  </div>
                </div>
              )}

              {/* Mockup Showcase View */}
              {activeViewMode === "mockup" && (
                <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-6 bg-[#0E0E0E] p-1 border border-[#333]">
                    <button
                      onClick={() => setActiveMockup("app-icon")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${
                        activeMockup === "app-icon" ? "bg-[#FF3B00] text-black" : "text-white/50 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      App Icon
                    </button>
                    <button
                      onClick={() => setActiveMockup("business-card")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${
                        activeMockup === "business-card" ? "bg-[#FF3B00] text-black" : "text-white/50 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      Card
                    </button>
                    <button
                      onClick={() => setActiveMockup("signboard")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${
                        activeMockup === "signboard" ? "bg-[#FF3B00] text-black" : "text-white/50 hover:text-white"
                      }`}
                    >
                      <Building2 className="w-3 h-3" />
                      HQ Sign
                    </button>
                  </div>

                  {activeMockup === "app-icon" && (
                    <div className="flex flex-col items-center animate-fade-in">
                      <div className="w-36 h-36 bg-[#151515] p-4 border border-[#333] shadow-2xl flex items-center justify-center relative">
                        <img
                          src={activeLogo.imageUrl}
                          alt={activeLogo.companyName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                        />
                        <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-[#FF3B00]"></div>
                      </div>
                      <span className="text-white/60 font-mono text-[10px] uppercase tracking-widest mt-3">
                        iOS / Android System Icon
                      </span>
                    </div>
                  )}

                  {activeMockup === "business-card" && (
                    <div className="w-80 h-48 bg-[#151515] border border-[#333] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden animate-fade-in">
                      <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#FF3B00]"></div>
                      <div className="flex items-start justify-between">
                        <img
                          src={activeLogo.imageUrl}
                          alt={activeLogo.companyName}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-contain border border-[#333] p-1 bg-black"
                        />
                        <span className="text-[9px] uppercase font-mono tracking-widest text-[#FF3B00]">
                          IDENTITY // ARCHETYPE
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white text-sm font-black tracking-wider uppercase">
                          {activeLogo.companyName}
                        </h4>
                        <p className="text-white/40 font-mono text-[10px] mt-0.5">Brand Specification</p>
                      </div>
                    </div>
                  )}

                  {activeMockup === "signboard" && (
                    <div className="w-full max-w-sm bg-[#151515] border border-[#333] p-8 shadow-2xl text-center relative overflow-hidden animate-fade-in">
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-[#FF3B00]" />
                      <img
                        src={activeLogo.imageUrl}
                        alt={activeLogo.companyName}
                        referrerPolicy="no-referrer"
                        className="h-16 mx-auto object-contain mb-3 drop-shadow-md"
                      />
                      <h4 className="text-white font-black tracking-widest uppercase text-base">
                        {activeLogo.companyName}
                      </h4>
                      <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mt-1">
                        Corporate Headquarters • Signage Preview
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Status footer bar */}
              <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest pointer-events-none">
                <span>FPS // 60.0</span>
                <span>STATUS // {isPlaying ? "ACTIVE" : "PAUSED"}</span>
              </div>
            </div>

            {/* Instant Animated Clip Generator Bar */}
            <div className="mt-4 p-4 border border-[#333] bg-[#0E0E0E] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#FF3B00]" />
                  <span>Generate Short Animated Clip</span>
                </div>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">
                  Records a seamless 60fps video loop of &ldquo;{selectedPresetId}&rdquo; ready to download or play.
                </p>
              </div>

              <button
                type="button"
                id="btn-record-clip"
                disabled={isRecordingClip}
                onClick={handleGenerateShortClip}
                className="px-4 py-2.5 bg-[#FF3B00] text-black font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
              >
                {isRecordingClip ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-black" />
                    <span>Recording ({recordingProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-black" />
                    <span>Record Animated Clip</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Sliders: Speed & Glow Intensity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#222]">
              <div>
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider mb-1.5 text-white/70">
                  <span>Motion Velocity</span>
                  <span className="text-[#FF3B00] font-bold">{motionSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={motionSpeed}
                  onChange={(e) => setMotionSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#FF3B00] bg-[#222] h-1.5 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider mb-1.5 text-white/70">
                  <span>Luminescence Intensity</span>
                  <span className="text-[#FF3B00] font-bold">{glowIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                  className="w-full accent-[#FF3B00] bg-[#222] h-1.5 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Generated Clip Preview Modal / Drawer */}
          {recordedClip && (
            <div className="p-6 border border-[#FF3B00] bg-[#151515] relative animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#FF3B00] rounded-full animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Generated Short Animated Clip Ready
                  </span>
                </div>
                <button
                  onClick={() => setRecordedClip(null)}
                  className="text-white/40 hover:text-white text-xs font-mono"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Loop Video Player */}
                <div className="border border-[#333] bg-black overflow-hidden flex items-center justify-center max-h-56">
                  <video
                    src={recordedClip.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Clip Meta & Actions */}
                <div className="space-y-3">
                  <div className="text-[10px] font-mono space-y-1 text-white/60">
                    <div>PRESET // <strong className="text-white">{selectedPresetId.toUpperCase()}</strong></div>
                    <div>DURATION // <strong className="text-white">{recordedClip.durationSeconds} SECONDS</strong></div>
                    <div>FORMAT // <strong className="text-[#FF3B00]">60 FPS WEBM / HIGH-RES</strong></div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <a
                      href={recordedClip.videoUrl}
                      download={`${activeLogo.companyName}-${selectedPresetId}-clip.webm`}
                      className="w-full py-2.5 px-4 bg-[#FF3B00] text-black font-black uppercase text-[10px] tracking-widest hover:bg-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Animated Clip (.webm)</span>
                    </a>

                    <button
                      type="button"
                      disabled={clipSavedToGallery}
                      onClick={handleSaveClipToGallery}
                      className="w-full py-2.5 px-4 border border-[#333] hover:border-white text-white text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {clipSavedToGallery ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Saved to Studio Gallery</span>
                        </>
                      ) : (
                        <>
                          <Film className="w-3.5 h-3.5 text-[#FF3B00]" />
                          <span>Save to Studio Gallery</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Animation Presets Grid & Veo 3.1 Fast Video Engine */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Selector Card */}
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative space-y-4">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                Animation Style Presets
              </label>
              <span className="text-[9px] font-mono text-white/40 uppercase">
                {ANIMATION_PRESETS.length} Motion Styles
              </span>
            </div>

            {/* Presets List */}
            <div className="grid grid-cols-1 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {ANIMATION_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id && activeViewMode === "preset";
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id as AnimationPresetId);
                      setActiveViewMode("preset");
                      setReplayKey((prev) => prev + 1);
                    }}
                    className={`p-3 border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#FF3B00] bg-[#FF3B00]/10 text-white shadow-[0_0_10px_rgba(255,59,0,0.15)]"
                        : "border-[#333] bg-[#0E0E0E]/70 text-white/70 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        {preset.name}
                      </span>
                      <span className="text-[8px] font-mono uppercase px-1.5 py-0.2 border border-[#FF3B00]/40 text-[#FF3B00]">
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-[9px] font-mono leading-relaxed opacity-60">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Veo 3.1 AI Video Generation Module */}
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative space-y-4">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                Veo 3.1 Fast Video Synthesis
              </label>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-[#FF3B00] text-black font-black">
                VEO 3.1
              </span>
            </div>

            <p className="text-[10px] font-light text-white/60">
              Generate full studio video animation utilizing Google&apos;s Veo 3.1 model.
            </p>

            {veoError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{veoError}</span>
              </div>
            )}

            {/* Veo Prompt */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1 font-bold">
                Cinematic Motion Prompt
              </label>
              <textarea
                rows={3}
                value={veoPrompt}
                onChange={(e) => setVeoPrompt(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-[#333] text-[#F0F0F0] focus:border-[#FF3B00] outline-none text-xs leading-relaxed font-light transition-colors resize-none"
              />
            </div>

            {/* Veo Format & Resolution */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1 font-bold">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["16:9", "9:16"] as VideoAspectRatio[]).map((ar) => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => setVeoAspectRatio(ar)}
                      className={`py-1.5 text-[10px] font-mono uppercase transition-colors cursor-pointer border ${
                        veoAspectRatio === ar
                          ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                          : "border-[#333] bg-[#0E0E0E] text-white/60 hover:text-white"
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1 font-bold">
                  Resolution
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["720p", "1080p"] as const).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setVeoResolution(res)}
                      className={`py-1.5 text-[10px] font-mono uppercase transition-colors cursor-pointer border ${
                        veoResolution === res
                          ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                          : "border-[#333] bg-[#0E0E0E] text-white/60 hover:text-white"
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Veo Video Action */}
            <button
              type="button"
              id="btn-generate-veo-video"
              disabled={isGeneratingVeo}
              onClick={handleGenerateVeoVideo}
              className="w-full py-3.5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#FF3B00] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isGeneratingVeo ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>SYNTHESIZING VEO VIDEO...</span>
                </>
              ) : (
                <>
                  <Film className="w-3.5 h-3.5" />
                  <span>RENDER WITH VEO 3.1 FAST</span>
                </>
              )}
            </button>

            {isGeneratingVeo && (
              <div className="p-3 bg-[#0E0E0E] border border-[#222] text-center space-y-1">
                <p className="text-[10px] font-mono text-[#FF3B00] animate-pulse">
                  {pollingStatus}
                </p>
                <span className="text-[9px] font-mono text-white/30 uppercase">
                  Google DeepMind Veo Video Cluster
                </span>
              </div>
            )}

            {generatedVeoVideo && (
              <div className="p-3 border border-emerald-500/50 bg-emerald-950/20 text-emerald-300 text-xs font-mono space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Veo 3.1 Video Rendered!</span>
                </div>
                <video
                  src={generatedVeoVideo.streamUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  loop
                  className="w-full max-h-48 bg-black mt-1"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
