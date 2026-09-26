/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Check,
  Star,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Layers,
  Sparkles,
  Maximize2,
  Palette,
  Eye,
  FileImage,
  Upload,
} from "lucide-react";
import JSZip from "jszip";
import {
  BannerFormat,
  BannerTheme,
  BANNER_FORMAT_LIST,
  BANNER_DIMENSIONS,
  renderBannerToCanvas,
  downloadCanvasAsPng,
  canvasToBlobAsync,
} from "../utils/bannerCanvasRenderer";

interface BannerStudioProps {
  companyName: string;
  productTitle: string;
  hook: string;
  subTitle?: string;
  ctaText?: string;
  productImage?: string | null;
  onApproveBanner?: (format: BannerFormat, isApproved: boolean) => void;
  approvedBanners?: Record<string, boolean>;
}

export const BannerStudio: React.FC<BannerStudioProps> = ({
  companyName,
  productTitle,
  hook,
  subTitle,
  ctaText = "KJØP PÅ ETSY NÅ ➔",
  productImage,
  onApproveBanner,
  approvedBanners: externalApproved,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<BannerFormat | "all">("all");
  const [theme, setTheme] = useState<BannerTheme>("dark-spark");
  const [customTitle, setCustomTitle] = useState(productTitle || "Digital Dayplanner");
  const [customHook, setCustomHook] = useState(hook || "Få full kontroll over hverdagen");
  const [customCta, setCustomCta] = useState(ctaText);
  const [discountBadge, setDiscountBadge] = useState("-25% LANSERINGSRABATT");
  const [localApproved, setLocalApproved] = useState<Record<string, boolean>>(() => {
    return {
      "1:1": true,
      "4:5": true,
      "9:16": true,
    };
  });

  const [activePreviewFormat, setActivePreviewFormat] = useState<BannerFormat | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  // Sync external changes
  useEffect(() => {
    if (productTitle) setCustomTitle(productTitle);
    if (hook) setCustomHook(hook);
    if (ctaText) setCustomCta(ctaText);
  }, [productTitle, hook, ctaText]);

  const approvedState = externalApproved || localApproved;

  const toggleApproval = (format: BannerFormat) => {
    const nextVal = !approvedState[format];
    setLocalApproved((prev) => ({ ...prev, [format]: nextVal }));
    if (onApproveBanner) onApproveBanner(format, nextVal);
  };

  const approvedCount = BANNER_FORMAT_LIST.filter((f) => approvedState[f.id]).length;

  // Handler to download a single banner format
  const handleDownloadSingle = async (format: BannerFormat) => {
    try {
      const canvas = await renderBannerToCanvas({
        format,
        theme,
        companyName,
        productTitle: customTitle,
        hook: customHook,
        subTitle,
        ctaText: customCta,
        discountBadge,
        productImage,
      });
      const filename = `${companyName.replace(/\s+/g, "_")}_Banner_${format}_${theme}.png`;
      await downloadCanvasAsPng(canvas, filename);
    } catch (e) {
      console.error("Feil ved nedlasting av banner:", e);
    }
  };

  // Handler to download all approved banners in a ZIP file
  const handleDownloadApprovedZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const formatsToDownload = BANNER_FORMAT_LIST.filter(
        (f) => approvedState[f.id] || selectedFormat === f.id
      );

      const targets = formatsToDownload.length > 0 ? formatsToDownload : BANNER_FORMAT_LIST;

      for (const f of targets) {
        const canvas = await renderBannerToCanvas({
          format: f.id,
          theme,
          companyName,
          productTitle: customTitle,
          hook: customHook,
          subTitle,
          ctaText: customCta,
          discountBadge,
          productImage,
        });
        const blob = await canvasToBlobAsync(canvas);
        zip.file(
          `bannere/${companyName.replace(/\s+/g, "_")}_${f.id.toUpperCase()}_${f.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`,
          blob
        );
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${companyName.replace(/\s+/g, "_")}_Godkjente_Bannere.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Feil ved zipping av bannere:", e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & Approval Bar */}
      <div className="bg-[#141416] border border-[#262626] p-4 sm:p-5 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF3B00]" />
            <h3 className="text-base font-black uppercase text-white font-mono tracking-tight">
              Annonsebannere // 6 Formater &amp; Live Forhåndsvisning
            </h3>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Generer og godkjenn skreddersydde annonsebannere i høy oppløsning for Instagram, Facebook, TikTok og Etsy.
          </p>
        </div>

        {/* Global Approved Action */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#1C1C1E] border border-zinc-700 text-xs font-mono text-zinc-300 rounded flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>{approvedCount}</strong> av {BANNER_FORMAT_LIST.length} godkjent
            </span>
          </div>

          <button
            onClick={handleDownloadApprovedZip}
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
                <span>Last ned godkjente (ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Bar: Formats & Theme Controls */}
      <div className="bg-[#101012] border border-[#262626] p-4 rounded space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Format Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setSelectedFormat("all")}
              className={`px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                selectedFormat === "all"
                  ? "bg-white text-black font-bold border-white"
                  : "bg-[#18181A] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              Alle Formater (6)
            </button>
            {BANNER_FORMAT_LIST.map((f) => {
              const isApproved = approvedState[f.id];
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`px-3 py-1.5 rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedFormat === f.id
                      ? "bg-[#FF3B00] text-black font-bold border-[#FF3B00]"
                      : "bg-[#18181A] text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  <span>{f.name}</span>
                  {isApproved && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-zinc-400" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as BannerTheme)}
              className="bg-[#18181A] border border-zinc-700 text-xs text-white px-2.5 py-1.5 rounded font-mono cursor-pointer focus:border-[#FF3B00] focus:outline-none"
            >
              <option value="dark-spark">SPARK Mørk Glød (Sort/Oransje)</option>
              <option value="minimal-beige">Varm Beige &amp; Minimal (Etsy-stil)</option>
              <option value="vibrant-gradient">Vibrant Sunset (Lilla/Rosa)</option>
              <option value="clean-nordic">Nordisk Cyan (Slate/Blå)</option>
            </select>
          </div>
        </div>

        {/* Quick Edit Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#222]">
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Produkttittel på banner:
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-[#18181C] border border-[#333] px-2.5 py-1 text-xs text-white rounded font-mono focus:border-[#FF3B00] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Hovedhook / Slagord:
            </label>
            <input
              type="text"
              value={customHook}
              onChange={(e) => setCustomHook(e.target.value)}
              className="w-full bg-[#18181C] border border-[#333] px-2.5 py-1 text-xs text-white rounded font-mono focus:border-[#FF3B00] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Rabatt / Tilbudsbånd:
            </label>
            <input
              type="text"
              value={discountBadge}
              onChange={(e) => setDiscountBadge(e.target.value)}
              className="w-full bg-[#18181C] border border-[#333] px-2.5 py-1 text-xs text-white rounded font-mono focus:border-[#FF3B00] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Knappetekst (CTA):
            </label>
            <input
              type="text"
              value={customCta}
              onChange={(e) => setCustomCta(e.target.value)}
              className="w-full bg-[#18181C] border border-[#333] px-2.5 py-1 text-xs text-white rounded font-mono focus:border-[#FF3B00] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BANNER_FORMAT_LIST.filter(
          (f) => selectedFormat === "all" || selectedFormat === f.id
        ).map((formatItem) => (
          <BannerCard
            key={`${formatItem.id}_${theme}_${customTitle}_${customHook}_${customCta}_${discountBadge}_${productImage || ""}`}
            formatItem={formatItem}
            theme={theme}
            companyName={companyName}
            productTitle={customTitle}
            hook={customHook}
            ctaText={customCta}
            discountBadge={discountBadge}
            productImage={productImage}
            isApproved={!!approvedState[formatItem.id]}
            onToggleApproval={() => toggleApproval(formatItem.id)}
            onDownload={() => handleDownloadSingle(formatItem.id)}
            onExpand={() => setActivePreviewFormat(formatItem.id)}
          />
        ))}
      </div>

      {/* Expanded Modal Preview */}
      {activePreviewFormat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#141416] border-2 border-zinc-700 max-w-4xl w-full p-6 space-y-4 rounded-xl shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h4 className="text-base font-black uppercase text-white font-mono">
                  {BANNER_DIMENSIONS[activePreviewFormat].name} ({BANNER_DIMENSIONS[activePreviewFormat].ratioLabel})
                </h4>
                <p className="text-xs font-mono text-zinc-400">
                  Full oppløsning forhåndsvisning med ekte typografi og produktoppsett
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleApproval(activePreviewFormat)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    approvedState[activePreviewFormat]
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-[#222] text-zinc-300 border-zinc-700 hover:text-white"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{approvedState[activePreviewFormat] ? "Godkjent" : "Godkjenn denne"}</span>
                </button>
                <button
                  onClick={() => handleDownloadSingle(activePreviewFormat)}
                  className="px-3 py-1.5 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Last ned PNG</span>
                </button>
                <button
                  onClick={() => setActivePreviewFormat(null)}
                  className="p-1.5 text-zinc-400 hover:text-white cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex justify-center p-4 bg-[#0A0A0C] border border-[#222] rounded overflow-auto max-h-[70vh]">
              <ModalCanvasPreview
                format={activePreviewFormat}
                theme={theme}
                companyName={companyName}
                productTitle={customTitle}
                hook={customHook}
                ctaText={customCta}
                discountBadge={discountBadge}
                productImage={productImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface BannerCardProps {
  formatItem: (typeof BANNER_FORMAT_LIST)[0];
  theme: BannerTheme;
  companyName: string;
  productTitle: string;
  hook: string;
  ctaText: string;
  discountBadge: string;
  productImage?: string | null;
  isApproved: boolean;
  onToggleApproval: () => void;
  onDownload: () => void;
  onExpand: () => void;
}

const BannerCard: React.FC<BannerCardProps> = ({
  formatItem,
  theme,
  companyName,
  productTitle,
  hook,
  ctaText,
  discountBadge,
  productImage,
  isApproved,
  onToggleApproval,
  onDownload,
  onExpand,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (canvasRef.current) {
      renderBannerToCanvas(
        {
          format: formatItem.id,
          theme,
          companyName,
          productTitle,
          hook,
          ctaText,
          discountBadge,
          productImage,
        },
        canvasRef.current
      )
        .then(() => {
          if (!cancelled) setIsRendered(true);
        })
        .catch(console.error);
    }
    return () => {
      cancelled = true;
    };
  }, [formatItem.id, theme, companyName, productTitle, hook, ctaText, discountBadge, productImage]);

  return (
    <div
      className={`p-4 bg-[#141416] border rounded-lg space-y-3 flex flex-col justify-between transition-all ${
        isApproved
          ? "border-emerald-500/80 shadow-lg shadow-emerald-500/10"
          : "border-[#2D2D32] hover:border-zinc-600"
      }`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-[#252528] pb-2">
        <div>
          <span className="text-xs font-black uppercase text-white font-mono block">
            {formatItem.name}
          </span>
          <span className="text-[10px] font-mono text-zinc-400">{formatItem.ratioLabel}</span>
        </div>

        {/* Approval Status Button */}
        <button
          onClick={onToggleApproval}
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
            isApproved
              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
              : "bg-[#202024] text-zinc-400 hover:text-white hover:bg-[#2A2A2E] border border-zinc-700"
          }`}
          title={isApproved ? "Trykk for å fjerne godkjenning" : "Trykk for å godkjenne"}
        >
          <Check className="w-3 h-3" />
          <span>{isApproved ? "Godkjent" : "Godkjenn"}</span>
        </button>
      </div>

      {/* Visual Canvas Thumbnail */}
      <div
        onClick={onExpand}
        className="relative bg-black rounded border border-[#2D2D32] overflow-hidden flex items-center justify-center p-2 cursor-pointer group min-h-[200px]"
      >
        <canvas
          ref={canvasRef}
          className="max-h-[260px] max-w-full object-contain rounded shadow-md group-hover:scale-[1.01] transition-transform"
        />

        {/* Hover zoom overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <div className="px-3 py-1.5 bg-black/80 rounded border border-white/20 text-white text-xs font-mono flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-[#FF3B00]" />
            <span>Klikk for full visning</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#222]">
        <button
          onClick={onDownload}
          className="flex-1 py-2 bg-[#202024] hover:bg-[#FF3B00] text-zinc-200 hover:text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Last ned PNG</span>
        </button>

        <button
          onClick={onExpand}
          className="p-2 bg-[#1C1C1E] hover:bg-[#2A2A2E] text-zinc-400 hover:text-white rounded border border-[#333] cursor-pointer"
          title="Vis i fullskjerm"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ModalCanvasPreview: React.FC<{
  format: BannerFormat;
  theme: BannerTheme;
  companyName: string;
  productTitle: string;
  hook: string;
  ctaText: string;
  discountBadge: string;
  productImage?: string | null;
}> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderBannerToCanvas(
        {
          format: props.format,
          theme: props.theme,
          companyName: props.companyName,
          productTitle: props.productTitle,
          hook: props.hook,
          ctaText: props.ctaText,
          discountBadge: props.discountBadge,
          productImage: props.productImage,
        },
        canvasRef.current
      ).catch(console.error);
    }
  }, [props]);

  return <canvas ref={canvasRef} className="max-h-[65vh] max-w-full object-contain rounded shadow-2xl" />;
};
