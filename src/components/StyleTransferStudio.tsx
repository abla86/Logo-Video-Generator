import React, { useState, useRef } from "react";
import {
  Wand2,
  Sparkles,
  Upload,
  RefreshCw,
  Play,
  Film,
  Download,
  Check,
  AlertCircle,
  Layers,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import { GeneratedLogo, GeneratedVideo } from "../types";
import { ARTISTIC_STYLES } from "../data/presets";

interface StyleTransferStudioProps {
  currentLogo: GeneratedLogo | null;
  savedLogos: GeneratedLogo[];
  onLogoGenerated: (logo: GeneratedLogo) => void;
  onAnimateLogo: (logo: GeneratedLogo) => void;
  onConvertToVideo: (logo: GeneratedLogo) => void;
}

export const StyleTransferStudio: React.FC<StyleTransferStudioProps> = ({
  currentLogo,
  savedLogos,
  onLogoGenerated,
  onAnimateLogo,
  onConvertToVideo,
}) => {
  // Base logo selection or custom upload
  const [baseImage, setBaseImage] = useState<string>(currentLogo?.imageUrl || "");
  const [baseCompanyName, setBaseCompanyName] = useState<string>(
    currentLogo?.companyName || "BrandForge"
  );

  // Selected preset style or custom reference image
  const [selectedStyleId, setSelectedStyleId] = useState<string>(ARTISTIC_STYLES[0].id);
  const [customStyleImage, setCustomStyleImage] = useState<string | null>(null);
  const [customStyleName, setCustomStyleName] = useState<string>("");

  // Process state
  const [isTransferring, setIsTransferring] = useState(false);
  const [stylizedLogo, setStylizedLogo] = useState<GeneratedLogo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const baseInputRef = useRef<HTMLInputElement>(null);
  const customStyleInputRef = useRef<HTMLInputElement>(null);

  // Handle base image file upload
  const handleBaseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBaseImage(event.target.result as string);
        setBaseCompanyName(file.name.replace(/\.[^/.]+$/, "").toUpperCase());
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle custom style reference upload
  const handleCustomStyleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomStyleImage(event.target.result as string);
        setSelectedStyleId("custom");
        if (!customStyleName) {
          setCustomStyleName(file.name.replace(/\.[^/.]+$/, ""));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute AI Style Transfer via Gemini 3 Pro
  const handleApplyStyleTransfer = async () => {
    if (!baseImage) {
      setError("Please select or upload a base logo image.");
      return;
    }

    setIsTransferring(true);
    setError(null);
    setStatusMessage("Analyzing base logo contours & spatial semantics...");

    const selectedPreset = ARTISTIC_STYLES.find((s) => s.id === selectedStyleId);
    const styleName =
      selectedStyleId === "custom"
        ? customStyleName || "Custom Reference Style"
        : selectedPreset?.name || "Artistic Style";
    const styleDescription =
      selectedStyleId === "custom"
        ? "Transfer visual medium, lighting, texture, and aesthetic vibe from the attached style reference"
        : selectedPreset?.description || "";

    try {
      setTimeout(() => {
        setStatusMessage("Infusing artistic shaders & chromatic textures with Gemini 3 Pro...");
      }, 2500);

      const res = await fetch("/api/style-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseImage,
          logoBase64: baseImage,
          styleName,
          stylePrompt: styleDescription,
          styleDescription,
          referenceImage: selectedStyleId === "custom" ? customStyleImage : undefined,
          customStyleBase64: selectedStyleId === "custom" ? customStyleImage : undefined,
          companyName: baseCompanyName,
          aspectRatio: "1:1",
          imageSize: "1K",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || "Failed to complete AI style transfer");
      }

      const newLogo: GeneratedLogo = {
        id: `stylized-${Date.now()}`,
        imageUrl: data.imageUrl,
        companyName: `${baseCompanyName} [${styleName}]`,
        industry: "Stylized Edition",
        promptUsed: data.promptUsed,
        imageSize: "1K",
        aspectRatio: "1:1",
        timestamp: Date.now(),
      };

      setStylizedLogo(newLogo);
      onLogoGenerated(newLogo);
      setStatusMessage("Style transfer complete!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to perform AI style transfer.");
    } finally {
      setIsTransferring(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title banner */}
      <div className="mb-8 border-b border-[#222] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF3B00] font-black">
              METAMORPHIC ENGINE // STYLE TRANSFER
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border border-[#333] text-white/50 bg-[#0E0E0E]">
              GEMINI 3 PRO VISION
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            AI Artistic Style Transfer
          </h2>
          <p className="mt-1 text-xs text-white/60 font-light tracking-wide max-w-2xl">
            Re-render any logo mark through iconic artistic movements, from Bauhaus risograph to liquid chrome &amp; cyberpunk neon, while preserving exact core iconography.
          </p>
        </div>

        {savedLogos.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Switch Logo:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs py-1">
              {savedLogos.map((lg) => (
                <button
                  key={lg.id}
                  onClick={() => {
                    setBaseImage(lg.imageUrl);
                    setBaseCompanyName(lg.companyName);
                  }}
                  className={`w-9 h-9 border transition-all flex-shrink-0 cursor-pointer ${
                    lg.imageUrl === baseImage
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

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs uppercase hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Style Selection & Base Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative space-y-6">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            {/* 01. Base Image Setup */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-3 block">
                01. Base Logo Selection
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Image Preview Box */}
                <div className="h-36 bg-[#0E0E0E] border border-[#333] relative flex items-center justify-center p-3 overflow-hidden">
                  {baseImage ? (
                    <img
                      src={baseImage}
                      alt="Base logo"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-white/40">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-white/30" />
                      <span className="text-[10px] font-mono">No base image loaded</span>
                    </div>
                  )}
                  {baseImage && (
                    <div className="absolute bottom-1 right-2 text-[9px] font-mono text-white/40 uppercase">
                      Base Active
                    </div>
                  )}
                </div>

                {/* Upload or Brand Name */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1 font-bold">
                      Logo Brand Name
                    </label>
                    <input
                      type="text"
                      value={baseCompanyName}
                      onChange={(e) => setBaseCompanyName(e.target.value)}
                      placeholder="e.g. BrandForge"
                      className="w-full px-3 py-2 bg-[#0E0E0E] border border-[#333] text-white text-xs font-mono uppercase tracking-wider focus:border-[#FF3B00] outline-none"
                    />
                  </div>

                  <div>
                    <input
                      ref={baseInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBaseImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => baseInputRef.current?.click()}
                      className="w-full py-2.5 px-3 border border-[#333] hover:border-[#FF3B00] text-white/80 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer bg-[#0E0E0E]"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#FF3B00]" />
                      <span>Upload Custom Base Logo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 02. Predefined Artistic Styles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                  02. Choose Target Artistic Movement
                </label>
                <span className="text-[9px] font-mono uppercase text-white/40">
                  {ARTISTIC_STYLES.length} Curated Styles
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {ARTISTIC_STYLES.map((style) => {
                  const isSelected = selectedStyleId === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => {
                        setSelectedStyleId(style.id);
                        setCustomStyleImage(null);
                      }}
                      className={`p-3 border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#FF3B00] bg-[#FF3B00]/10 text-white"
                          : "border-[#333] bg-[#0E0E0E]/70 text-white/70 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                          {style.name}
                        </span>
                        <span
                          className="text-[8px] font-mono uppercase px-1.5 py-0.2 border"
                          style={{
                            borderColor: style.accentColor,
                            color: style.accentColor,
                          }}
                        >
                          {style.badge}
                        </span>
                      </div>
                      <p className="text-[9px] font-mono leading-relaxed opacity-60 line-clamp-2">
                        {style.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 03. Custom Style Image Reference (Optional) */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-2 block">
                03. Or Upload Custom Style Reference
              </label>
              <div className="p-4 border border-[#333] bg-[#0E0E0E] flex flex-col sm:flex-row items-center gap-4">
                <input
                  ref={customStyleInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCustomStyleUpload}
                  className="hidden"
                />

                {customStyleImage ? (
                  <div className="w-20 h-20 border border-[#FF3B00] p-1 bg-black relative flex-shrink-0">
                    <img
                      src={customStyleImage}
                      alt="Custom style reference"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF3B00] rounded-full flex items-center justify-center text-black text-[9px] font-bold">
                      ✓
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => customStyleInputRef.current?.click()}
                    className="w-20 h-20 border border-dashed border-[#444] hover:border-[#FF3B00] flex flex-col items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-white/40 mb-1" />
                    <span className="text-[8px] font-mono text-white/40 uppercase">Upload</span>
                  </div>
                )}

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="text-xs font-bold text-white uppercase">
                    {customStyleImage ? "Custom Reference Loaded" : "Upload Any Painting, Texture, or Artwork"}
                  </div>
                  <p className="text-[10px] font-mono text-white/40">
                    The AI will extract artistic brushwork, palette, and lighting from your reference and apply them to the logo.
                  </p>
                  {customStyleImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStyleImage(null);
                        setSelectedStyleId(ARTISTIC_STYLES[0].id);
                      }}
                      className="text-[9px] font-mono uppercase text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      Clear custom style
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Transform Action Button */}
            <button
              type="button"
              id="btn-apply-style-transfer"
              disabled={isTransferring || !baseImage}
              onClick={handleApplyStyleTransfer}
              className="w-full bg-[#FF3B00] text-black py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_25px_rgba(255,59,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isTransferring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>TRANSMUTING WITH GEMINI 3 PRO...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-black" />
                  <span>EXECUTE STYLE TRANSFER</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Stage & Stylized Animated Version */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative flex flex-col h-full">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                STYLIZED TRANSFORMATION // VIEWPORT
              </label>
              <span className="text-[9px] font-mono text-white/40 uppercase">
                {stylizedLogo ? "RENDERED" : "AWAITING TRANSFORM"}
              </span>
            </div>

            {/* Stage Canvas */}
            <div className="relative flex-1 min-h-[380px] bg-[#0E0E0E] border border-[#222] flex items-center justify-center overflow-hidden p-6">
              {/* Radial Dot Grid Background */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#FF3B00 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />

              {/* Concentric circle architectural framing */}
              <div className="absolute w-72 h-72 border border-[#222] rounded-full pointer-events-none opacity-40"></div>
              <div className="absolute w-96 h-96 border border-[#222] rounded-full pointer-events-none opacity-20"></div>

              {isTransferring ? (
                <div className="text-center p-8 max-w-sm relative z-10">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-[#FF3B00]/20 border-t-[#FF3B00] animate-spin"></div>
                    <div className="absolute inset-2 bg-[#0A0A0A] rounded-full flex items-center justify-center border border-[#333]">
                      <Sparkles className="w-5 h-5 text-[#FF3B00] animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-1">
                    Applying Style Transformation
                  </h3>
                  <p className="text-[10px] font-mono text-[#FF3B00] h-6 uppercase tracking-wider">
                    {statusMessage}
                  </p>
                </div>
              ) : stylizedLogo ? (
                <div className="relative group w-full h-full flex items-center justify-center p-4 z-10">
                  <img
                    src={stylizedLogo.imageUrl}
                    alt={stylizedLogo.companyName}
                    referrerPolicy="no-referrer"
                    className="max-h-[320px] max-w-full object-contain drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        downloadImage(
                          stylizedLogo.imageUrl,
                          `${stylizedLogo.companyName}-stylized.png`
                        )
                      }
                      className="p-2 bg-[#0A0A0A] border border-[#333] text-white hover:border-[#FF3B00] text-xs transition-colors cursor-pointer"
                      title="Download stylized image"
                    >
                      <Download className="w-4 h-4 text-[#FF3B00]" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-white/40 relative z-10">
                  <div className="w-14 h-14 mx-auto mb-3 bg-[#0A0A0A] border border-[#333] flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-[#FF3B00]" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                    Awaiting Style Transfer
                  </p>
                  <p className="text-[10px] font-mono text-white/40 mt-1 max-w-xs mx-auto">
                    Select a target artistic movement and click &ldquo;Execute Style Transfer&rdquo;.
                  </p>
                </div>
              )}
            </div>

            {/* Stylized Action: Go to Animated Version */}
            {stylizedLogo && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/60 px-1 border-b border-[#222] pb-2">
                  <span>
                    STYLIZED // <strong className="text-white">{stylizedLogo.companyName}</strong>
                  </span>
                  <span className="text-emerald-400 font-bold">READY TO ANIMATE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    id="btn-animate-stylized"
                    onClick={() => onAnimateLogo(stylizedLogo)}
                    className="py-3 px-4 bg-[#FF3B00] text-black font-black uppercase text-[10px] tracking-widest hover:bg-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_15px_rgba(255,59,0,0.3)]"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Open in Motion Studio</span>
                  </button>

                  <button
                    type="button"
                    id="btn-video-stylized"
                    onClick={() => onConvertToVideo(stylizedLogo)}
                    className="py-3 px-4 border border-[#FF3B00] text-[#FF3B00] font-black uppercase text-[10px] tracking-widest hover:bg-[#FF3B00] hover:text-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Synthesize Video</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
