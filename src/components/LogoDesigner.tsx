import React, { useState } from "react";
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Download,
  Play,
  Film,
  Layers,
  Check,
  AlertCircle,
  Info,
  Palette,
  ShieldCheck,
  Music,
  Sliders,
} from "lucide-react";
import { GeneratedLogo, ImageResolution } from "../types";
import {
  INDUSTRIES,
  LOGO_STYLES,
  COLOR_PALETTES,
} from "../data/presets";
import { ImageEditorModal } from "./ImageEditorModal";
import { generateTrueVectorLogo, downloadBlob } from "../utils/vectorLogoGenerator";

interface LogoDesignerProps {
  onLogoGenerated: (logo: GeneratedLogo) => void;
  onAnimateLogo: (logo: GeneratedLogo) => void;
  onConvertToVideo: (logo: GeneratedLogo) => void;
  onOpenStyleTransfer?: (logo: GeneratedLogo) => void;
  onOpenPaletteStudio?: (logo: GeneratedLogo) => void;
  onOpenBrandShield?: (companyName: string, industry: string, desc: string) => void;
  onOpenSonicStudio?: (logo: GeneratedLogo) => void;
}

export const LogoDesigner: React.FC<LogoDesignerProps> = ({
  onLogoGenerated,
  onAnimateLogo,
  onConvertToVideo,
  onOpenStyleTransfer,
  onOpenPaletteStudio,
  onOpenBrandShield,
  onOpenSonicStudio,
}) => {
  const [companyName, setCompanyName] = useState("BrandForge Labs");
  const [industry, setIndustry] = useState("Technology & AI");
  const [description, setDescription] = useState(
    "A minimalist sun icon constructed from geometric rays, Bauhaus style, using a primary palette of cobalt and ochre. Sharp edges, high contrast, professional."
  );
  const [selectedStyle, setSelectedStyle] = useState(LOGO_STYLES[0].name);
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0].name);

  // Resolution selection: 512px, 1K, 2K, 4K
  const [imageSize, setImageSize] = useState<ImageResolution>("1K");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState<GeneratedLogo | null>(null);
  const [previewBg, setPreviewBg] = useState<"dark" | "light" | "grid">("dark");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [statusMessageIndex, setStatusMessageIndex] = useState(0);

  const statusMessages = [
    "Synthesizing geometric contours with Gemini 3.1 Flash Image...",
    "Computing Bauhaus color harmonics & optical balance...",
    "Calibrating vector typography and negative space...",
    "Rendering pristine commercial brand identity...",
  ];

  const handleGenerateLocalVector = () => {
    const chosenStyle = (
      selectedStyle.includes("Minimalist") ? "minimal-geometric" :
      selectedStyle.includes("Corporate") || selectedStyle.includes("Badge") ? "corporate-shield" :
      selectedStyle.includes("Monogram") ? "monogram" :
      selectedStyle.includes("Tech") || selectedStyle.includes("Futuristic") ? "tech-nodes" :
      "golden-ratio"
    ) as any;

    const paletteObj = COLOR_PALETTES.find((p) => p.name === selectedPalette) || COLOR_PALETTES[0];
    const primaryColor = paletteObj.colors[0] || "#FF3B00";
    const secondaryColor = paletteObj.colors[1] || "#1C1C1E";
    const accentColor = paletteObj.colors[2] || "#00E5FF";

    const vectorPkg = generateTrueVectorLogo({
      companyName: companyName || "BrandForge",
      tagline: industry ? `EST. 2026 • ${industry.toUpperCase()}` : "EST. 2026",
      style: chosenStyle,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor: previewBg === "light" ? "#FFFFFF" : "#0A0A0A",
    });

    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(vectorPkg.svgCode)}`;
    const newLogo: GeneratedLogo = {
      id: `vec_${Date.now()}`,
      imageUrl: svgDataUrl,
      svgCode: vectorPkg.svgCode,
      companyName,
      industry,
      promptUsed: `Ekte matematisk vektor-SVG (${chosenStyle}) med ekte polygoner, design tokens og CSS variabler.`,
      imageSize,
      aspectRatio,
      timestamp: Date.now(),
      isVector: true,
    };

    setCurrentLogo(newLogo);
    onLogoGenerated(newLogo);
  };

  const handleDownloadVectorAsset = (type: "svg" | "tokens" | "css" | "guide" | "favicon") => {
    if (!currentLogo) return;
    const paletteObj = COLOR_PALETTES.find((p) => p.name === selectedPalette) || COLOR_PALETTES[0];
    const vectorPkg = generateTrueVectorLogo({
      companyName: currentLogo.companyName,
      tagline: currentLogo.industry || "EST. 2026",
      style: "minimal-geometric",
      primaryColor: paletteObj.colors[0] || "#FF3B00",
      secondaryColor: paletteObj.colors[1] || "#1C1C1E",
      accentColor: paletteObj.colors[2] || "#00E5FF",
      backgroundColor: "#0A0A0A",
    });

    const safeName = currentLogo.companyName.replace(/\s+/g, "_").toLowerCase();
    if (type === "svg") {
      downloadBlob(currentLogo.svgCode || vectorPkg.svgCode, `${safeName}_logo.svg`, "image/svg+xml");
    } else if (type === "tokens") {
      downloadBlob(vectorPkg.designTokensJson, `${safeName}_design_tokens.json`, "application/json");
    } else if (type === "css") {
      downloadBlob(vectorPkg.cssVariables, `${safeName}_variables.css`, "text/css");
    } else if (type === "guide") {
      downloadBlob(vectorPkg.htmlStyleGuide, `${safeName}_brand_guide.html`, "text/html");
    } else if (type === "favicon") {
      downloadBlob(vectorPkg.faviconSvgCode, `${safeName}_favicon.svg`, "image/svg+xml");
    }
  };
  const handleEnhancePrompt = async () => {
    if (!description.trim()) return;
    setIsEnhancing(true);
    setError(null);
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industry,
          rawDescription: description,
          style: selectedStyle,
          colorPalette: selectedPalette,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance prompt");
      }

      const data = await response.json();
      if (data.enhancedPrompt) {
        setDescription(data.enhancedPrompt);
      }
    } catch (err: any) {
      console.error(err);
      setError("Prompt refinement encountered a hiccup. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Please provide a company or brand name.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const interval = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2800);

    try {
      const response = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          industry,
          description: description.trim(),
          style: selectedStyle,
          colorPalette: selectedPalette,
          imageSize,
          aspectRatio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed with status ${response.status}`);
      }

      const data = await response.json();

      const newLogo: GeneratedLogo = {
        id: `logo-${Date.now()}`,
        imageUrl: data.imageUrl,
        companyName: companyName.trim(),
        industry,
        promptUsed: data.promptUsed || description,
        imageSize: data.imageSize || imageSize,
        aspectRatio: data.aspectRatio || aspectRatio,
        timestamp: Date.now(),
      };

      setCurrentLogo(newLogo);
      onLogoGenerated(newLogo);

      setTimeout(() => {
        const viewportEl = document.getElementById("logo-canvas-viewport");
        if (viewportEl) {
          viewportEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    } catch (err: any) {
      console.error("Logo Generation Error:", err);
      setError(
        err.message || "Failed to generate logo. Please check network connection or try again."
      );
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#FF3B00] bg-[#FF3B00]/10 px-2 py-0.5 border border-[#FF3B00]/20">
              Module 01 // Generator
            </span>
            <span className="text-[10px] font-mono opacity-40 uppercase">
              Engine: gemini-3.1-flash-image
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter mt-2">
            AUTONOMOUS LOGO SYNTHESIZER
          </h2>
          <p className="text-sm text-white/60 font-light mt-1 max-w-xl">
            Vector-precision generative brand identities crafted according to constructivist,
            Bauhaus, and contemporary modernist design principles.
          </p>
        </div>

        {/* Global Action Utilities */}
        <div className="flex items-center gap-2">
          {onOpenBrandShield && (
            <button
              type="button"
              onClick={() => onOpenBrandShield(companyName, industry, description)}
              className="py-2 px-3 border border-[#333] hover:border-[#FF3B00] bg-[#121212] hover:bg-[#FF3B00]/10 text-white/80 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF3B00]" />
              <span>Trademark & Name Check</span>
            </button>
          )}

          <div className="text-[10px] font-mono text-white/40 border border-[#333] px-3 py-1.5 hidden sm:block">
            Target Canvas: <strong className="text-white">{imageSize}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Studio Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleGenerateLogo} className="space-y-6">
            {/* Step 01: Identity Basics */}
            <div className="bg-[#151515] p-6 border border-[#262626] relative">
              <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#FF3B00]"></div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-4 block">
                01. Company Profile
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/70 block mb-1.5 font-medium">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="input-company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. BrandForge, Kinetic, Aura"
                    required
                    className="w-full bg-[#0E0E0E] border border-[#333] px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF3B00] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-white/70 block mb-1.5 font-medium">
                    Industry Sector
                  </label>
                  <select
                    id="select-industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-[#333] px-3.5 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none transition-colors"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-[#151515]">
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 02: Visual Description */}
            <div className="bg-[#151515] p-6 border border-[#262626] relative">
              <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#FF3B00]"></div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black">
                  02. Creative Concept
                </label>
                <button
                  type="button"
                  id="btn-enhance-prompt"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !description.trim()}
                  className="text-[10px] font-mono uppercase tracking-widest text-white/60 hover:text-[#FF3B00] flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isEnhancing ? "Enhancing..." : "Refine with Gemini"}</span>
                </button>
              </div>

              <textarea
                id="textarea-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    if (companyName.trim()) {
                      handleGenerateLogo(e as any);
                    }
                  }
                }}
                rows={3}
                placeholder="Describe central symbols, geometry, mood, metaphor, or visual balance..."
                className="w-full bg-[#0E0E0E] border border-[#333] p-3 text-xs text-white placeholder-white/30 focus:border-[#FF3B00] focus:outline-none transition-colors resize-none leading-relaxed"
              />

              {/* Direct Next Step Banner */}
              <div
                className={`mt-3 p-3 rounded-lg border transition-all ${
                  companyName.trim()
                    ? "bg-[#1E1210] border-[#FF3B00] shadow-[0_0_20px_rgba(255,59,0,0.25)]"
                    : "bg-[#0E0E0E] border-[#222]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        companyName.trim() ? "bg-[#FF3B00] animate-ping" : "bg-zinc-600"
                      }`}
                    />
                    <span className="text-white font-bold">
                      {companyName.trim()
                        ? "KLAR FOR GENERERING! Klikk på knappen eller trykk Ctrl+Enter"
                        : "Fyll inn merkenavn i trinn 01 for å starte generering"}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || !companyName.trim()}
                    className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      companyName.trim()
                        ? "bg-[#FF3B00] hover:bg-white text-black hover:scale-105 active:scale-95 shadow-lg shadow-[#FF3B00]/40 font-bold"
                        : "bg-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generer Logo Nå ➔</span>
                  </button>
                </div>
              </div>

              {/* Inspiration Chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Geometric Bauhaus sun with cobalt & ochre rays",
                  "Minimalist origami crane in matte titanium",
                  "Intersecting optical rings with vibrant neon gradient",
                  "Cyberpunk neon circuit hexagon with deep shadow",
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDescription(preset)}
                    className="text-[10px] font-mono px-2 py-1 bg-[#0A0A0A] border border-[#222] hover:border-[#FF3B00] text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 03: Aesthetic & Motion Presets */}
            <div className="bg-[#151515] p-6 border border-[#262626] relative">
              <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#FF3B00]"></div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-4 block">
                03. Aesthetic Direction
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visual Style Selection */}
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/70 block mb-2 font-medium">
                    Artistic Style
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {LOGO_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyle(style.name)}
                        className={`p-2.5 border text-left transition-all cursor-pointer ${
                          selectedStyle === style.name
                            ? "border-[#FF3B00] bg-[#FF3B00]/10 text-white font-bold"
                            : "border-[#222] bg-[#0E0E0E] text-white/60 hover:border-[#444] hover:text-white"
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-wider truncate">
                          {style.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Palette Selection */}
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/70 block mb-2 font-medium">
                    Harmonic Color Palette
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {COLOR_PALETTES.map((palette) => (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => setSelectedPalette(palette.name)}
                        className={`p-2 border flex items-center justify-between transition-all cursor-pointer ${
                          selectedPalette === palette.name
                            ? "border-[#FF3B00] bg-[#FF3B00]/10 text-white font-bold"
                            : "border-[#222] bg-[#0E0E0E] text-white/60 hover:border-[#444] hover:text-white"
                        }`}
                      >
                        <span className="text-[11px] uppercase tracking-wider truncate">
                          {palette.name}
                        </span>
                        <div className="flex gap-1">
                          {palette.colors.slice(0, 3).map((col, cIdx) => (
                            <div
                              key={cIdx}
                              className="w-3 h-3 rounded-full border border-black/40"
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 04: Output Spec */}
            <div className="bg-[#151515] p-6 border border-[#262626] relative">
              <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#FF3B00]"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Image Resolution selection */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-2 block">
                    Resolution Quality
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["512px", "1K", "2K", "4K"] as ImageResolution[]).map((res) => {
                      const isSelected = imageSize === res;
                      return (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setImageSize(res)}
                          className={`p-2 border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                              : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-black tracking-widest">{res}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-2 block">
                    Canvas Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "1:1", label: "Square" },
                      { val: "16:9", label: "Wide" },
                      { val: "4:3", label: "Classic" },
                    ].map((ratio) => {
                      const isSelected = aspectRatio === ratio.val;
                      return (
                        <button
                          key={ratio.val}
                          type="button"
                          onClick={() => setAspectRatio(ratio.val)}
                          className={`p-2 border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                              : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-black tracking-widest">{ratio.val}</div>
                          <div className={`text-[9px] font-mono ${isSelected ? "text-black/80" : "text-white/40"}`}>
                            {ratio.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons: AI or Free Local Vector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="submit"
                id="btn-generate-logo"
                disabled={isGenerating || !companyName.trim()}
                className="w-full bg-[#FF3B00] text-black py-4 font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.01] hover:bg-white transition-all shadow-[0_0_25px_rgba(255,59,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>SYNTHESIZING WITH GEMINI ({imageSize})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>SYNTHESIZE AI EMBLEM ({imageSize})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGenerateLocalVector}
                disabled={!companyName.trim()}
                className="w-full bg-[#18181A] border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black py-4 font-black uppercase text-xs tracking-[0.15em] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ekte Vektor SVG (Gratis Lokal)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Bauhaus Viewport Stage */}
        <div className="lg:col-span-5 space-y-6">
          <div id="logo-canvas-viewport" className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative flex flex-col h-full rounded-lg shadow-xl">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                VIEWPORT // CANVAS
              </label>

              {/* Canvas Backdrop mode */}
              <div className="flex items-center border border-[#333] text-[9px] font-mono uppercase tracking-widest rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPreviewBg("dark")}
                  className={`px-2.5 py-1 transition-all cursor-pointer hover:scale-105 ${
                    previewBg === "dark" ? "bg-white text-black font-bold" : "text-white/50 hover:text-white"
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg("light")}
                  className={`px-2.5 py-1 transition-all cursor-pointer hover:scale-105 ${
                    previewBg === "light" ? "bg-white text-black font-bold" : "text-white/50 hover:text-white"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg("grid")}
                  className={`px-2.5 py-1 transition-all cursor-pointer hover:scale-105 ${
                    previewBg === "grid" ? "bg-white text-black font-bold" : "text-white/50 hover:text-white"
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>

            {/* Canvas Stage */}
            <div
              className={`relative flex-1 min-h-[380px] border border-[#222] flex items-center justify-center overflow-hidden transition-colors ${
                previewBg === "dark"
                  ? "bg-[#0E0E0E]"
                  : previewBg === "light"
                  ? "bg-[#EAEAEA]"
                  : "bg-[#111]"
              }`}
            >
              {/* Radial Dot Grid Background */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#FF3B00 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />

              {/* Concentric circles framing */}
              <div className="absolute w-72 h-72 border border-[#222] rounded-full pointer-events-none opacity-40"></div>
              <div className="absolute w-96 h-96 border border-[#222] rounded-full pointer-events-none opacity-20"></div>

              {/* Crosshair accents */}
              <div className="absolute top-4 left-4 text-[9px] font-mono opacity-30 select-none text-white">
                LOC // 01-A
              </div>
              <div className="absolute top-4 right-4 text-[9px] font-mono opacity-30 select-none text-white">
                {imageSize}
              </div>

              {/* Loading State Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-[#0E0E0E]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-2 border-[#222] rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-[#FF3B00] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 bg-[#FF3B00]/10 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#FF3B00] animate-pulse" />
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3B00] mb-2">
                    {statusMessages[statusMessageIndex]}
                  </div>
                  <div className="text-[10px] font-mono opacity-50 uppercase max-w-xs">
                    Synthesizing brand emblem with commercial vector precision
                  </div>
                </div>
              )}

              {/* Content Render: Logo or Placeholder */}
              {currentLogo ? (
                <div className="relative z-10 p-6 flex flex-col items-center justify-center max-w-full max-h-full">
                  <img
                    id="img-current-logo"
                    src={currentLogo.imageUrl}
                    alt={`${currentLogo.companyName} Logo`}
                    className="max-h-[300px] max-w-[300px] object-contain shadow-2xl transition-all"
                  />
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 max-w-xs">
                  <div className="w-20 h-20 bg-[#161616] border border-[#333] flex items-center justify-center mb-4 text-[#FF3B00]">
                    <Sparkles className="w-8 h-8 opacity-40" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    CANVAS READY
                  </h3>
                  <p className="text-[11px] text-white/40 mt-1 font-light leading-relaxed">
                    Set your company name, select style and palette, then hit synthesize to generate
                    your brand emblem.
                  </p>
                </div>
              )}

              {/* Bottom Frame Status bar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none z-10">
                <div className="h-px w-16 bg-[#333]"></div>
                <span className="text-[9px] font-mono tracking-tighter opacity-40 uppercase text-white">
                  FRAME STATUS // READY
                </span>
                <div className="h-px w-16 bg-[#333]"></div>
              </div>
            </div>

            {/* Logo Actions */}
            {currentLogo && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/60 px-1 border-b border-[#222] pb-2">
                  <span>
                    BRAND // <strong className="text-white">{currentLogo.companyName}</strong>
                  </span>
                  <span className="text-[#FF3B00] font-bold">
                    {currentLogo.imageSize} • {currentLogo.aspectRatio}
                  </span>
                </div>

                {/* Primary Action Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    id="btn-goto-animate"
                    onClick={() => onAnimateLogo(currentLogo)}
                    className="py-3 px-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#FF3B00] hover:text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md rounded"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Animate Motion</span>
                  </button>

                  <button
                    type="button"
                    id="btn-goto-veo-video"
                    onClick={() => onConvertToVideo(currentLogo)}
                    className="py-3 px-4 border border-[#FF3B00] text-[#FF3B00] font-black uppercase text-[10px] tracking-widest hover:bg-[#FF3B00] hover:text-black flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-[#FF3B00]/20 rounded"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Synthesize Video</span>
                  </button>
                </div>

                {/* Secondary Action Row: AI Image Editor & Sonic Branding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(true)}
                    className="py-2.5 px-3 border border-[#333] hover:border-[#FF3B00] bg-[#0E0E0E] text-white/80 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer rounded"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#FF3B00]" />
                    <span>Edit With Prompt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenSonicStudio && onOpenSonicStudio(currentLogo)}
                    className="py-2.5 px-3 border border-[#333] hover:border-[#FF3B00] bg-[#0E0E0E] text-white/80 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer rounded"
                  >
                    <Music className="w-3.5 h-3.5 text-[#FF3B00]" />
                    <span>Sonic Sound Identity</span>
                  </button>
                </div>

                {/* Vector Export Suite if vector logo */}
                {currentLogo.isVector && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded space-y-2">
                    <div className="text-[10px] font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ekte Vektorpakke (Uendelig Skalerbar)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px] font-mono">
                      <button
                        type="button"
                        onClick={() => handleDownloadVectorAsset("svg")}
                        className="p-1.5 bg-[#1C1C1E] border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black uppercase cursor-pointer text-center transition-all hover:scale-105 active:scale-95 rounded"
                      >
                        SVG Vektor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadVectorAsset("tokens")}
                        className="p-1.5 bg-[#1C1C1E] border border-zinc-700 text-zinc-300 hover:text-white uppercase cursor-pointer text-center transition-all hover:scale-105 active:scale-95 rounded"
                      >
                        Tokens (.JSON)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadVectorAsset("css")}
                        className="p-1.5 bg-[#1C1C1E] border border-zinc-700 text-zinc-300 hover:text-white uppercase cursor-pointer text-center transition-all hover:scale-105 active:scale-95 rounded"
                      >
                        CSS Variabler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadVectorAsset("guide")}
                        className="p-1.5 bg-[#1C1C1E] border border-zinc-700 text-zinc-300 hover:text-white uppercase cursor-pointer text-center transition-all hover:scale-105 active:scale-95 rounded"
                      >
                        Merkevareguide
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="btn-goto-palette"
                    onClick={() => onOpenPaletteStudio && onOpenPaletteStudio(currentLogo)}
                    className="py-2 px-3 border border-[#222] hover:border-[#FF3B00] bg-[#0A0A0A] text-white/70 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer rounded"
                  >
                    <Palette className="w-3.5 h-3.5 text-[#FF3B00]" />
                    <span>Brand Palette</span>
                  </button>

                  <button
                    type="button"
                    id="btn-goto-style-transfer"
                    onClick={() => onOpenStyleTransfer && onOpenStyleTransfer(currentLogo)}
                    className="py-2 px-3 border border-[#222] hover:border-[#FF3B00] bg-[#0A0A0A] text-white/70 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer rounded"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#FF3B00]" />
                    <span>Style Transfer</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    downloadImage(
                      currentLogo.imageUrl,
                      `${currentLogo.companyName}-logo-${currentLogo.imageSize}.png`
                    )
                  }
                  className="w-full py-2.5 px-4 border border-[#333] hover:border-[#FF3B00] bg-[#141416] text-white hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer rounded shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF3B00]" />
                  <span>Last ned Logo ({currentLogo.imageSize})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Image Editor Modal */}
      {currentLogo && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          baseImageUrl={currentLogo.imageUrl}
          companyName={currentLogo.companyName}
          onImageUpdated={(newImageUrl) => {
            const updated = { ...currentLogo, imageUrl: newImageUrl };
            setCurrentLogo(updated);
            onLogoGenerated(updated);
          }}
        />
      )}
    </div>
  );
};
