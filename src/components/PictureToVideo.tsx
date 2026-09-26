import React, { useState, useRef } from "react";
import {
  Upload,
  Film,
  Download,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { GeneratedLogo, GeneratedVideo, VideoAspectRatio, VideoResolution } from "../types";
import { PHOTO_VIDEO_PRESETS } from "../data/presets";

interface PictureToVideoProps {
  initialImage?: string | null;
  savedLogos: GeneratedLogo[];
  onVideoGenerated: (video: GeneratedVideo) => void;
}

export const PictureToVideo: React.FC<PictureToVideoProps> = ({
  initialImage,
  savedLogos,
  onVideoGenerated,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
  const [imageMime, setImageMime] = useState<string>("image/png");
  const [imageFileName, setImageFileName] = useState<string>("uploaded-photo.png");

  // Mandatory aspect ratios: '16:9' or '9:16'
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [resolution, setResolution] = useState<VideoResolution>("720p");
  const [prompt, setPrompt] = useState<string>(PHOTO_VIDEO_PRESETS[0].prompt);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>("");
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(true);

  // Sample photos for immediate prototyping
  const samplePhotos = [
    {
      name: "Cyber City Architecture",
      url: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Coffee Pour & Atmosphere",
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Mountain Mist Landscape",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    setImageMime(file.type);
    setImageFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    setImageMime(file.type);
    setImageFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const selectSamplePhoto = async (url: string, name: string) => {
    try {
      setError(null);
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setImageMime(blob.type || "image/jpeg");
        setImageFileName(name);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setSelectedImage(url);
      setImageFileName(name);
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedImage) {
      setError("Please upload or choose a picture first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);
    setPollingStatus("Initializing Veo 3.1 Fast video synthesis...");

    try {
      const startRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageBase64: selectedImage,
          mimeType: imageMime,
          aspectRatio, // '16:9' or '9:16'
          resolution,
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.operationName) {
        throw new Error(startData.error || "Failed to initialize video generation");
      }

      const opName = startData.operationName;
      setPollingStatus("Veo 3.1 is analyzing spatial depth and image features...");

      let isDone = false;
      let attempts = 0;
      const maxAttempts = 120;

      const poll = async () => {
        while (!isDone && attempts < maxAttempts) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 3500));

          if (attempts === 3) {
            setPollingStatus("Simulating temporal camera trajectory...");
          } else if (attempts === 8) {
            setPollingStatus("Synthesizing natural motion and volumetric lighting...");
          } else if (attempts === 15) {
            setPollingStatus("Rendering final 60fps MP4 video frames...");
          }

          try {
            const statusRes = await fetch("/api/video-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName: opName }),
            });

            const statusData = await statusRes.json();
            if (!statusRes.ok) {
              throw new Error(statusData.error || "Failed checking video status");
            }

            if (statusData.error) {
              throw new Error(statusData.error);
            }

            if (statusData.done) {
              isDone = true;
              const streamUrl = statusData.streamUrl || `/api/video-stream?name=${encodeURIComponent(opName)}`;
              const videoUrl = statusData.videoUrl;
              const newVid: GeneratedVideo = {
                id: "video-" + Date.now(),
                operationName: opName,
                streamUrl,
                videoUrl,
                prompt,
                sourceImage: selectedImage,
                aspectRatio,
                resolution,
                timestamp: Date.now(),
                title: imageFileName.replace(/\.[^/.]+$/, "") + " (Veo Video)",
              };
              setGeneratedVideo(newVid);
              onVideoGenerated(newVid);
              setPollingStatus("Video generation complete!");
              break;
            }
          } catch (pollErr: any) {
            console.warn("Polling error:", pollErr);
          }
        }

        if (!isDone && attempts >= maxAttempts) {
          throw new Error("Video generation timed out. Please try again.");
        }
      };

      await poll();
    } catch (err: any) {
      setError(err.message || "Failed to synthesize video from picture.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-[0.2em] font-black">
              MODULE // 03
            </span>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              [IMAGE-TO-VIDEO VEO SYNTHESIZER]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F0F0F0]">
            IMAGE-TO-VIDEO CINEMA
          </h1>
          <p className="mt-1 text-xs text-white/60 font-light tracking-wide max-w-2xl">
            Synthesize dynamic cinema from static photos using{" "}
            <span className="font-bold text-[#FF3B00]">Veo 3.1 Fast</span> (16:9 Landscape or 9:16 Portrait specification).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151515] border border-[#333] text-[10px] font-mono uppercase tracking-widest text-[#FF3B00]">
            <Film className="w-3.5 h-3.5" />
            VEO 3.1 FAST
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151515] border border-[#333] text-[10px] font-mono uppercase tracking-widest text-white/70">
            ASPECT: {aspectRatio}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#180d0a] border border-[#FF3B00]/40 flex items-start gap-3 text-[#FF3B00] text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FF3B00]" />
          <div className="flex-1">
            <p className="font-bold uppercase tracking-wider">Video Synthesis Diagnostic</p>
            <p className="mt-0.5 text-white/80">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-white/40 hover:text-white text-[10px] uppercase font-bold tracking-widest"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Photo & Configure Motion */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative space-y-6">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            {/* Step 1: Upload Photo */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                  01. Source Image Asset <span className="text-white/40">*</span>
                </label>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-[10px] font-mono text-[#FF3B00] hover:underline uppercase tracking-wider cursor-pointer"
                  >
                    [Clear Image]
                  </button>
                )}
              </div>

              {selectedImage ? (
                <div className="relative border border-[#333] bg-[#0A0A0A] p-3 group">
                  <div className="max-h-72 w-full flex items-center justify-center overflow-hidden bg-black/50">
                    <img
                      src={selectedImage}
                      alt="Source for Veo"
                      referrerPolicy="no-referrer"
                      className="max-h-64 max-w-full object-contain"
                    />
                  </div>
                  <div className="mt-3 px-1 flex items-center justify-between text-[10px] font-mono text-white/50 border-t border-[#222] pt-2">
                    <span className="truncate max-w-[200px]">{imageFileName}</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#FF3B00] hover:underline uppercase tracking-widest cursor-pointer"
                    >
                      Change Picture
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#333] hover:border-[#FF3B00] bg-[#0E0E0E] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px]"
                >
                  <div className="w-10 h-10 bg-[#151515] border border-[#333] flex items-center justify-center mb-3 text-[#FF3B00]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#F0F0F0]">
                    + ADD PICTURES / DRAG & DROP
                  </p>
                  <p className="text-[9px] font-mono text-white/40 mt-1">
                    Supports PNG, JPG, WebP format
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Quick Pick: From Generated Logos or Sample Photos */}
              <div className="mt-4 pt-3 border-t border-[#222]">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-2">
                  Select Generated Emblem or Preset:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {savedLogos.map((lg) => (
                    <button
                      key={lg.id}
                      type="button"
                      onClick={() => {
                        setSelectedImage(lg.imageUrl);
                        setImageFileName(`${lg.companyName}-logo.png`);
                        setImageMime("image/png");
                      }}
                      className="w-10 h-10 border border-[#333] hover:border-[#FF3B00] flex-shrink-0 transition-colors bg-black cursor-pointer"
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

                  {samplePhotos.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => selectSamplePhoto(sample.url, sample.name)}
                      className="w-10 h-10 border border-[#333] hover:border-[#FF3B00] flex-shrink-0 transition-colors relative bg-black cursor-pointer"
                      title={sample.name}
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Camera Motion & Style Direction */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-2 block">
                02. Motion Prompt & Trajectory
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe camera path and motion choreography..."
                className="w-full px-3.5 py-2.5 bg-[#0E0E0E] border border-[#333] text-[#F0F0F0] focus:border-[#FF3B00] outline-none text-xs font-mono transition-colors resize-none"
              />

              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                {PHOTO_VIDEO_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => setPrompt(preset.prompt)}
                    className="text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 border border-[#333] bg-[#0E0E0E] hover:border-[#FF3B00] text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: MANDATORY ASPECT RATIO (16:9 or 9:16) & Resolution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#222]">
              {/* Aspect Ratio */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2 block">
                  Aspect Ratio <span className="text-[#FF3B00]">(Required)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="btn-aspect-16-9"
                    onClick={() => setAspectRatio("16:9")}
                    className={`p-2.5 border text-center transition-all cursor-pointer ${
                      aspectRatio === "16:9"
                        ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                        : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-black">16:9</div>
                    <div className="text-[8px] font-mono uppercase">Landscape</div>
                  </button>

                  <button
                    type="button"
                    id="btn-aspect-9-16"
                    onClick={() => setAspectRatio("9:16")}
                    className={`p-2.5 border text-center transition-all cursor-pointer ${
                      aspectRatio === "9:16"
                        ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                        : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-black">9:16</div>
                    <div className="text-[8px] font-mono uppercase">Portrait</div>
                  </button>
                </div>
              </div>

              {/* Resolution */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2 block">
                  Video Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolution("720p")}
                    className={`p-2.5 border text-center transition-all cursor-pointer ${
                      resolution === "720p"
                        ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                        : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-black">720p</div>
                    <div className="text-[8px] font-mono uppercase">Fast Gen</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolution("1080p")}
                    className={`p-2.5 border text-center transition-all cursor-pointer ${
                      resolution === "1080p"
                        ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                        : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-black">1080p</div>
                    <div className="text-[8px] font-mono uppercase">Full HD</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Execute Generation Button */}
            <button
              type="button"
              id="btn-run-picture-to-video"
              disabled={isGenerating || !selectedImage}
              onClick={handleGenerateVideo}
              className="w-full bg-[#FF3B00] text-black py-4 font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.01] hover:bg-white transition-all shadow-[0_0_20px_rgba(255,59,0,0.25)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>SYNTHESIZING WITH VEO 3.1...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 text-black" />
                  <span>RENDER PROJECT ({aspectRatio})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output Cinema Player & Comparison */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative flex flex-col h-full">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                VIEWPORT // CINEMA PLAYER
              </label>
              {generatedVideo && (
                <a
                  href={`${generatedVideo.streamUrl}&download=1`}
                  download="veo-picture-video.mp4"
                  className="px-3 py-1 bg-white text-black font-black uppercase text-[9px] tracking-widest hover:bg-[#FF3B00] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  Download MP4
                </a>
              )}
            </div>

            {/* Player Container */}
            <div className="relative flex-1 min-h-[380px] bg-[#0E0E0E] border border-[#222] flex items-center justify-center overflow-hidden">
              {/* Radial Dot Grid Background */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#FF3B00 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {isGenerating ? (
                <div className="text-center p-8 max-w-sm relative z-10 font-mono">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-[#FF3B00]/20 border-t-[#FF3B00] animate-spin" />
                    <div className="absolute inset-2 bg-[#0A0A0A] rounded-full flex items-center justify-center border border-[#333]">
                      <Film className="w-5 h-5 text-[#FF3B00] animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-1">
                    Veo 3.1 Fast Synthesis
                  </h3>
                  <p className="text-[10px] text-[#FF3B00] h-6 uppercase tracking-wider">
                    {pollingStatus}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="h-px w-8 bg-[#333]"></div>
                    <span className="text-[9px] font-mono opacity-40 uppercase">VEO CORE</span>
                    <div className="h-px w-8 bg-[#333]"></div>
                  </div>
                </div>
              ) : generatedVideo ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 z-10">
                  <div
                    className={`w-full max-h-[440px] flex items-center justify-center overflow-hidden ${
                      generatedVideo.aspectRatio === "9:16" ? "max-w-[270px] aspect-[9/16]" : "aspect-video"
                    }`}
                  >
                    <video
                      ref={videoRef}
                      src={generatedVideo.videoUrl || generatedVideo.streamUrl}
                      controls
                      autoPlay
                      muted
                      playsInline
                      loop={isLooping}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-white/40 relative z-10">
                  <div className="w-14 h-14 mx-auto mb-3 bg-[#0A0A0A] border border-[#333] flex items-center justify-center">
                    <Film className="w-6 h-6 text-[#FF3B00]" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                    Cinema Canvas Awaiting Input
                  </p>
                  <p className="text-[10px] font-mono text-white/40 mt-1 max-w-xs mx-auto">
                    Select a picture on the left, set camera motion, and render 16:9 or 9:16 video.
                  </p>
                </div>
              )}

              {/* Bottom Frame Status bar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none z-10">
                <div className="h-px w-16 bg-[#333]"></div>
                <span className="text-[9px] font-mono tracking-tighter opacity-40 uppercase text-white">
                  RENDER ENGINE // VEO 3.1
                </span>
                <div className="h-px w-16 bg-[#333]"></div>
              </div>
            </div>

            {/* Video Controls & Side-by-Side Comparison */}
            {generatedVideo && (
              <div className="mt-4 pt-3 border-t border-[#222] space-y-3 font-mono">
                <div className="flex items-center justify-between text-[10px] text-white/60">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider">Velocity:</span>
                    {[0.75, 1, 1.25, 1.5].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`px-2 py-0.5 border cursor-pointer ${
                          playbackSpeed === s
                            ? "border-[#FF3B00] bg-[#FF3B00] text-black font-bold"
                            : "border-[#333] bg-[#0E0E0E] text-white/60"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 border cursor-pointer ${
                      isLooping
                        ? "border-[#FF3B00] text-[#FF3B00] bg-[#FF3B00]/10"
                        : "border-[#333] text-white/50"
                    }`}
                  >
                    {isLooping ? "Loop On" : "Loop Off"}
                  </button>
                </div>

                {generatedVideo.sourceImage && (
                  <div className="p-3 bg-[#0E0E0E] border border-[#333] flex items-center gap-3">
                    <div className="w-12 h-12 border border-[#333] flex-shrink-0 bg-black">
                      <img
                        src={generatedVideo.sourceImage}
                        alt="Original"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-black text-[#F0F0F0] block truncate">
                        INPUT SOURCE IMAGE
                      </span>
                      <p className="text-[9px] font-mono text-white/40 truncate">{generatedVideo.prompt}</p>
                    </div>
                    <span className="px-2 py-0.5 border border-[#FF3B00] text-[#FF3B00] text-[9px] font-mono uppercase">
                      RENDERED
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
