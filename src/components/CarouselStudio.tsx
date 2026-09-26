/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  Check,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Eye,
  FileText,
  Palette,
} from "lucide-react";
import JSZip from "jszip";
import {
  CarouselSlideData,
  BannerTheme,
  renderCarouselSlideToCanvas,
  downloadCanvasAsPng,
  canvasToBlobAsync,
} from "../utils/bannerCanvasRenderer";

interface CarouselStudioProps {
  companyName: string;
  productTitle: string;
  hook?: string;
  productImage?: string | null;
  onApproveSlide?: (slideIndex: number, isApproved: boolean) => void;
}

export const CarouselStudio: React.FC<CarouselStudioProps> = ({
  companyName,
  productTitle,
  hook,
  productImage,
  onApproveSlide,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [theme, setTheme] = useState<BannerTheme>("dark-spark");
  const [approvedSlides, setApprovedSlides] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  const [slides, setSlides] = useState<CarouselSlideData[]>([
    {
      slideNumber: 1,
      totalSlides: 6,
      type: "hook",
      badge: "SLIDE 1 // HOOK",
      title: hook || "Føler du at hverdagen forsvinner i kaos?",
      description:
        "Mange starter uken med de beste intensjoner, men ender opp overveldet av endeløse lister og tapte timer.",
      highlight: "«Her er hemmeligheten som gir deg full kontroll på 10 minutter om morgenen.»",
    },
    {
      slideNumber: 2,
      totalSlides: 6,
      type: "problem",
      badge: "SLIDE 2 // PROBLEMET",
      title: "Hvorfor tradisjonelle apper feiler:",
      description:
        "Tungvinte apper skaper mer støy enn orden. Varsler, oppdateringer og kompliserte menyer stjeler fokuset ditt.",
      bulletPoints: [
        "For mange unødvendige innstillinger og menyer",
        "Mangel på helhetlig visuell dags- og ukeoversikt",
        "Frustrasjonen over å aldri rekke det viktigste",
      ],
    },
    {
      slideNumber: 3,
      totalSlides: 6,
      type: "solution",
      badge: "SLIDE 3 // LØSNINGEN",
      title: `Møt ${productTitle || "Digital Dayplanner"}`,
      description:
        "Et estetisk og minimalistisk planleggingssystem designet for ekte resultater og ro i hodet. Fungerer sømløst på iPad og utskrift.",
      bulletPoints: [
        "Hyperlenkede faner for umiddelbar navigasjon",
        "Tidsblokkerte dags- og ukeoppsett",
        "Ingen månedsabonnement – du eier filen for alltid",
      ],
    },
    {
      slideNumber: 4,
      totalSlides: 6,
      type: "features",
      badge: "SLIDE 4 // INNHOLD",
      title: "Alt du trenger i én pakke:",
      description: "Over 250+ sider nøye tilpasset for studenter, gründere og travle profesjonelle.",
      bulletPoints: [
        "Daglige prioriteringer & vanelogg (Habit tracker)",
        "Finansiell budsjett- og spareplanlegger",
        "200+ gratis estetiske klistremerker inkludert",
      ],
      highlight: "«Umiddelbar digital nedlasting sekunder etter kjøp.»",
    },
    {
      slideNumber: 5,
      totalSlides: 6,
      type: "proof",
      badge: "SLIDE 5 // SOSIALT BEVIS",
      title: "Hva fornøyde kjøpere sier:",
      description:
        "Vurdert til 5.0 av 5 stjerner av over 500 aktive brukere på Etsy.",
      highlight:
        "«Dette enkle verktøyet reddet meg fra eksamensstress og hverdagskaos. Beste kjøpet jeg har gjort!» — Sofie M.",
      bulletPoints: [
        "⭐⭐⭐⭐⭐ 5.0 gjennomsnittlig vurdering",
        "Dokumentert tidsbesparelse fra første uke",
      ],
    },
    {
      slideNumber: 6,
      totalSlides: 6,
      type: "cta",
      badge: "SLIDE 6 // HANDLING",
      title: "Klar for en ryddigere hverdag?",
      description:
        "Sikre deg bestselgeren med 25% lanseringsrabatt denne uken. Trykk på linken i bio for å laste ned nå!",
      highlight: "«Begrenset antall med lanseringspris. Last ned umiddelbart.»",
      ctaButton: "KJØP PÅ ETSY NÅ ➔",
    },
  ]);

  const [isZipping, setIsZipping] = useState(false);
  const activeSlide = slides[activeSlideIndex];
  const activeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render active slide to canvas
  useEffect(() => {
    if (activeCanvasRef.current && activeSlide) {
      renderCarouselSlideToCanvas(
        activeSlide,
        {
          companyName,
          productTitle,
          theme,
          productImage,
        },
        activeCanvasRef.current
      ).catch(console.error);
    }
  }, [activeSlide, companyName, productTitle, theme, productImage]);

  const toggleApproval = (idx: number) => {
    const nextVal = !approvedSlides[idx];
    setApprovedSlides((prev) => ({ ...prev, [idx]: nextVal }));
    if (onApproveSlide) onApproveSlide(idx, nextVal);
  };

  const handleUpdateActiveSlide = (field: keyof CarouselSlideData, val: any) => {
    const updated = [...slides];
    updated[activeSlideIndex] = { ...updated[activeSlideIndex], [field]: val };
    setSlides(updated);
  };

  const handleDownloadActiveSlide = async () => {
    if (!activeCanvasRef.current) return;
    await downloadCanvasAsPng(
      activeCanvasRef.current,
      `${companyName.replace(/\s+/g, "_")}_Slide_${activeSlide.slideNumber}_${activeSlide.type}.png`
    );
  };

  const handleDownloadAllSlidesZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const s of slides) {
        if (approvedSlides[s.slideNumber - 1]) {
          const c = await renderCarouselSlideToCanvas(s, {
            companyName,
            productTitle,
            theme,
            productImage,
          });
          const blob = await canvasToBlobAsync(c);
          zip.file(`karusell/Slide_${s.slideNumber}_${s.type}.png`, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${companyName.replace(/\s+/g, "_")}_Karusell_Slides.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Feil ved zipping av slides:", e);
    } finally {
      setIsZipping(false);
    }
  };

  const approvedCount = Object.values(approvedSlides).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-[#141416] border border-[#262626] p-4 sm:p-5 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF3B00]" />
            <h3 className="text-base font-black uppercase text-white font-mono tracking-tight">
              Karusellinnlegg // 6 Slides Forhåndsvisning &amp; Godkjenning
            </h3>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Ferdig sammensatt 6-siders karusell for Instagram, LinkedIn og Facebook. Bla gjennom, godkjenn og last ned.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#1C1C1E] border border-zinc-700 text-xs font-mono text-zinc-300 rounded flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>{approvedCount}</strong> av {slides.length} slides godkjent
            </span>
          </div>

          <button
            onClick={handleDownloadAllSlidesZip}
            disabled={isZipping}
            className="px-4 py-2 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono tracking-wider flex items-center gap-2 rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            {isZipping ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Pakker ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Last ned alle slides (ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Slide Canvas Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#101012] border border-[#262626] p-4 rounded space-y-3">
            {/* Viewer Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Slide {activeSlideIndex + 1} av {slides.length}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#202024] text-zinc-300 rounded">
                  {activeSlide.badge}
                </span>
              </div>

              {/* Approval status toggle */}
              <button
                onClick={() => toggleApproval(activeSlideIndex)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                  approvedSlides[activeSlideIndex]
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                    : "bg-[#202024] text-zinc-400 hover:text-white border border-zinc-700"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{approvedSlides[activeSlideIndex] ? "Godkjent" : "Godkjenn denne"}</span>
              </button>
            </div>

            {/* Canvas Display */}
            <div className="relative bg-black rounded-lg border border-[#333] overflow-hidden flex items-center justify-center p-3 shadow-2xl aspect-square">
              <canvas
                ref={activeCanvasRef}
                className="max-h-full max-w-full object-contain rounded shadow-lg"
              />
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeSlideIndex === 0}
                className="px-3 py-2 bg-[#1C1C1E] hover:bg-[#252528] disabled:opacity-30 text-white rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Forrige Slide</span>
              </button>

              <button
                onClick={handleDownloadActiveSlide}
                className="py-2 px-4 bg-[#202024] hover:bg-[#FF3B00] text-zinc-200 hover:text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Last ned denne sliden (PNG)</span>
              </button>

              <button
                onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                disabled={activeSlideIndex === slides.length - 1}
                className="px-3 py-2 bg-[#1C1C1E] hover:bg-[#252528] disabled:opacity-30 text-white rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Neste Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide Thumbnails Strip */}
          <div className="grid grid-cols-6 gap-2">
            {slides.map((s, idx) => {
              const isSelected = activeSlideIndex === idx;
              const isApproved = approvedSlides[idx];
              return (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`p-2 rounded border text-center transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#1C1C1E] border-[#FF3B00] shadow-md shadow-[#FF3B00]/20"
                      : "bg-[#141416] border-[#262626] hover:border-zinc-700"
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold text-white uppercase">
                    0{s.slideNumber}
                  </div>
                  <div className="text-[9px] font-mono text-zinc-400 truncate mt-1">
                    {s.type}
                  </div>
                  <div className="mt-1 flex justify-center">
                    {isApproved ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-700" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Slide Editor & Metadata */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#141416] border border-[#262626] p-4 rounded space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF3B00]" />
                <span>Rediger Slide {activeSlideIndex + 1} Innhold</span>
              </span>

              {/* Theme Picker */}
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as BannerTheme)}
                className="bg-[#1C1C1E] border border-zinc-700 text-xs text-white px-2 py-1 rounded font-mono cursor-pointer"
              >
                <option value="dark-spark">SPARK Mørk Glød</option>
                <option value="minimal-beige">Varm Beige</option>
                <option value="vibrant-gradient">Vibrant Sunset</option>
                <option value="clean-nordic">Nordisk Cyan</option>
              </select>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Kategori / Fane-etikett:
                </label>
                <input
                  type="text"
                  value={activeSlide.badge}
                  onChange={(e) => handleUpdateActiveSlide("badge", e.target.value)}
                  className="w-full bg-[#101012] border border-[#333] px-2.5 py-1.5 text-xs text-white rounded focus:border-[#FF3B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Hovedoverskrift:
                </label>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => handleUpdateActiveSlide("title", e.target.value)}
                  className="w-full bg-[#101012] border border-[#333] px-2.5 py-1.5 text-xs text-white rounded focus:border-[#FF3B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Brødtekst / Forklaring:
                </label>
                <textarea
                  rows={3}
                  value={activeSlide.description}
                  onChange={(e) => handleUpdateActiveSlide("description", e.target.value)}
                  className="w-full bg-[#101012] border border-[#333] px-2.5 py-1.5 text-xs text-white rounded focus:border-[#FF3B00] focus:outline-none leading-relaxed"
                />
              </div>

              {activeSlide.highlight !== undefined && (
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    Uthevet sitat / nøkkelbudskap:
                  </label>
                  <input
                    type="text"
                    value={activeSlide.highlight}
                    onChange={(e) => handleUpdateActiveSlide("highlight", e.target.value)}
                    className="w-full bg-[#101012] border border-[#333] px-2.5 py-1.5 text-xs text-white rounded focus:border-[#FF3B00] focus:outline-none"
                  />
                </div>
              )}

              {activeSlide.ctaButton !== undefined && (
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    Call To Action Knappetekst:
                  </label>
                  <input
                    type="text"
                    value={activeSlide.ctaButton}
                    onChange={(e) => handleUpdateActiveSlide("ctaButton", e.target.value)}
                    className="w-full bg-[#101012] border border-[#333] px-2.5 py-1.5 text-xs text-white rounded focus:border-[#FF3B00] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
