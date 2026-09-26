import React, { useState, useRef } from "react";
import {
  Music,
  Play,
  Pause,
  Download,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  Sliders,
  Disc,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { BrandMusicTrack, GeneratedLogo } from "../types";

interface SonicBrandingStudioProps {
  currentLogo?: GeneratedLogo | null;
  onTrackSaved?: (track: BrandMusicTrack) => void;
}

const MUSIC_PRESETS = [
  {
    name: "Tech Minimalist Intro",
    genre: "Electronic / Ambient",
    prompt: "Clean minimal electronic audio logo stinger with delicate chime harmonics, warm synth bass, and uplifting tech resolution",
    duration: 15,
  },
  {
    name: "Kinetic Motion Beats",
    genre: "Glitch / Future Bass",
    prompt: "High-energy modern corporate kinetic beat with syncopated analog synthesizers, deep sub-bass drop, and crisp percussion",
    duration: 30,
  },
  {
    name: "Nordic Acoustic Clarity",
    genre: "Organic / Neo-Classical",
    prompt: "Nordic minimalist branding music with gentle acoustic piano, warm subtle cello textures, and airy spacious reverb",
    duration: 30,
  },
  {
    name: "Cyberpunk Industrial Pulse",
    genre: "Synthwave / Dark Electro",
    prompt: "Gritty analog synth bassline, shimmering arpeggios, neon cyber aura, driving cyberpunk cinematic commercial tempo",
    duration: 30,
  },
  {
    name: "Grand Cinematic Anthem",
    genre: "Orchestral / Hybrid",
    prompt: "Epic hybrid cinematic orchestral brand theme with rising brass, sweeping violins, deep taiko impact, and triumphant finish",
    duration: 45,
  },
];

export const SonicBrandingStudio: React.FC<SonicBrandingStudioProps> = ({
  currentLogo,
  onTrackSaved,
}) => {
  const [prompt, setPrompt] = useState(
    "Futuristic electronic corporate sound identity with warm uplifting synthesizer chords and polished audio resolution"
  );
  const [duration, setDuration] = useState<number>(30); // 15, 30, 45
  const [genre, setGenre] = useState("Electronic / Tech");
  const [useLogoAsReference, setUseLogoAsReference] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<BrandMusicTrack | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) {
      setError("Please describe the desired sound identity or music.");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const payload: any = {
        prompt: prompt.trim(),
        duration,
        genre,
      };

      if (useLogoAsReference && currentLogo?.imageUrl) {
        payload.base64Image = currentLogo.imageUrl;
      }

      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Music generation failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      const track: BrandMusicTrack = {
        id: `music-${Date.now()}`,
        title: `${currentLogo?.companyName || "Brand"} Audio Identity`,
        audioUrl: data.audioUrl,
        prompt,
        durationSeconds: duration,
        genre,
        timestamp: Date.now(),
      };

      setCurrentTrack(track);
      if (onTrackSaved) {
        onTrackSaved(track);
      }
    } catch (err: any) {
      console.error("Music generation error:", err);
      setError(err.message || "Failed to generate brand soundtrack.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setAudioDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#FF3B00] bg-[#FF3B00]/10 px-2 py-0.5 border border-[#FF3B00]/20">
              Lyria Music Engine
            </span>
            <span className="text-[10px] font-mono opacity-40 uppercase">
              lyria-3-clip-preview & lyria-3-pro-preview
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter mt-2">
            SONIC BRANDING & AUDIO IDENTITY STUDIO
          </h2>
          <p className="text-sm text-white/60 font-light mt-1 max-w-2xl">
            Synthesize custom brand themes, logo motion stingers, and commercial video soundtracks
            tailored to your company's visual logo and identity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Parameters */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#151515] p-6 border border-[#262626] relative">
            <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#FF3B00]"></div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-4 block">
              01. Audio Prompt & Presets
            </label>

            {/* Presets */}
            <div className="space-y-2 mb-4">
              <span className="text-xs uppercase tracking-wider text-white/70 block font-medium">
                Sonic Archetypes
              </span>
              <div className="grid grid-cols-1 gap-2">
                {MUSIC_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(p.prompt);
                      setGenre(p.genre);
                      setDuration(p.duration);
                    }}
                    className={`text-left p-2.5 border transition-colors cursor-pointer ${
                      prompt === p.prompt
                        ? "border-[#FF3B00] bg-[#FF3B00]/10"
                        : "border-[#262626] hover:border-[#444] bg-[#0E0E0E]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{p.name}</span>
                      <span className="text-[10px] font-mono text-[#FF3B00]">{p.duration}s</span>
                    </div>
                    <div className="text-[10px] text-white/50 truncate mt-0.5">{p.genre}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/70 block mb-1.5 font-medium">
                  Soundtrack & Mood Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="Describe instruments, tempo, emotions, textures..."
                  className="w-full bg-[#0E0E0E] border border-[#333] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF3B00] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Duration selection */}
              <div>
                <label className="text-xs uppercase tracking-wider text-white/70 block mb-1.5 font-medium">
                  Track Duration & Engine
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "15s Stinger", val: 15, sub: "Lyria Clip" },
                    { label: "30s Commercial", val: 30, sub: "Lyria Clip" },
                    { label: "45s Full Track", val: 45, sub: "Lyria Pro" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDuration(item.val)}
                      className={`p-2.5 border text-center transition-colors cursor-pointer ${
                        duration === item.val
                          ? "border-[#FF3B00] bg-[#FF3B00]/10 text-white"
                          : "border-[#262626] hover:border-[#444] bg-[#0E0E0E] text-white/60"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[9px] font-mono text-white/40">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Visual Reference Toggle */}
              {currentLogo && (
                <div className="bg-[#0E0E0E] p-3 border border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentLogo.imageUrl}
                      alt="Logo ref"
                      className="w-10 h-10 object-contain bg-black border border-[#333]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">Visual Image Conditioning</div>
                      <div className="text-[10px] text-white/50">Inspire music from current logo</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useLogoAsReference}
                    onChange={(e) => setUseLogoAsReference(e.target.checked)}
                    className="accent-[#FF3B00] w-4 h-4 cursor-pointer"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateMusic}
                className="w-full py-3.5 px-4 bg-[#FF3B00] hover:bg-[#e03400] disabled:opacity-50 text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Track With Lyria...</span>
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    <span>Generate Audio Soundtrack</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Player Panel */}
        <div className="lg:col-span-7">
          {isGenerating && (
            <div className="bg-[#151515] border border-[#262626] p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-14 h-14 border-2 border-[#333] border-t-[#FF3B00] rounded-full animate-spin mb-6"></div>
              <h3 className="text-lg font-black tracking-tight uppercase">
                Generating High-Fidelity Audio Stream
              </h3>
              <p className="text-xs text-white/50 max-w-md mt-2 font-mono">
                Streaming audio chunks from Lyria, decoding WAV audio stream, and harmonizing with
                brand identity...
              </p>
            </div>
          )}

          {!isGenerating && !currentTrack && (
            <div className="bg-[#151515] border border-[#222] p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
              <Disc className="w-12 h-12 text-[#FF3B00] mb-4 opacity-70 animate-spin-slow" />
              <h3 className="text-lg font-bold tracking-tight">No Audio Synthesized Yet</h3>
              <p className="text-xs text-white/50 max-w-md mt-1.5 font-light">
                Select a sonic archetype or customize your prompt, then click "Generate Audio
                Soundtrack" to produce audio using Google's Lyria engine.
              </p>
            </div>
          )}

          {!isGenerating && currentTrack && (
            <div className="bg-[#151515] border border-[#262626] p-8 space-y-6 relative">
              <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Player Header */}
              <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-widest block mb-1">
                    Master Soundtrack Output
                  </span>
                  <h3 className="text-xl font-black tracking-tight text-white">
                    {currentTrack.title}
                  </h3>
                  <div className="text-xs text-white/50 mt-0.5">{currentTrack.genre}</div>
                </div>

                <a
                  href={currentTrack.audioUrl}
                  download={`${currentTrack.title.replace(/\s+/g, "-")}.wav`}
                  className="py-2 px-3 border border-[#333] hover:border-[#FF3B00] text-white/80 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF3B00]" />
                  <span>Download WAV</span>
                </a>
              </div>

              {/* Animated Waveform Visualization */}
              <div className="h-28 bg-[#0E0E0E] border border-[#262626] p-4 flex items-center justify-center gap-1 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 bg-radial-gradient"></div>
                {Array.from({ length: 48 }).map((_, i) => {
                  const height = isPlaying
                    ? Math.sin(i * 0.3 + currentTime * 5) * 35 + 40
                    : 15 + ((i * 7) % 30);
                  return (
                    <div
                      key={i}
                      className="w-1.5 bg-[#FF3B00] rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(6, Math.min(80, height))}%`,
                        opacity: isPlaying ? 0.9 : 0.3,
                      }}
                    />
                  );
                })}
              </div>

              {/* Scrubber & Controls */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={audioDuration || currentTrack.durationSeconds}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-[#FF3B00] cursor-pointer h-1.5 bg-[#222]"
                />
                <div className="flex justify-between text-[11px] font-mono text-white/40">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || currentTrack.durationSeconds)}</span>
                </div>
              </div>

              {/* Main Control Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-[#FF3B00] hover:bg-[#e03400] text-black rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="p-2 border border-[#333] hover:border-white text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-[10px] font-mono text-white/40 uppercase">
                  Engine: Lyria 3 • High-Res Lossless Audio
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
