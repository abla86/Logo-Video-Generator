/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  SplitSquareVertical,
  Play,
  Check,
  Download,
  Sparkles,
  RefreshCw,
  Eye,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";
import JSZip from "jszip";
import { CampaignVariant, AutonomousVideoProject } from "../types";

interface ABTestStudioProps {
  variants: CampaignVariant[];
  currentProject?: AutonomousVideoProject | null;
  productImage?: string | null;
  onSelectVariant: (variant: CampaignVariant) => void;
  onRefreshVariants: () => void;
  isGenerating?: boolean;
}

export const ABTestStudio: React.FC<ABTestStudioProps> = ({
  variants,
  currentProject,
  productImage,
  onSelectVariant,
  onRefreshVariants,
  isGenerating,
}) => {
  const [approvedVariants, setApprovedVariants] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    variants.slice(0, 3).forEach((v) => (init[v.id] = true));
    return init;
  });
  const [activePreviewVariant, setActivePreviewVariant] = useState<CampaignVariant | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const toggleApproval = (id: string) => {
    setApprovedVariants((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownloadSingleVariant = (variant: CampaignVariant) => {
    let content = `=== KAMPANJEVARIANT: ${variant.title.toUpperCase()} ===\n`;
    content += `Formål: ${variant.targetMood}\n`;
    content += `Hook: «${variant.hook}»\n`;
    content += `Kjernemelding: ${variant.coreMessage}\n`;
    content += `Call to action: ${variant.cta}\n\n`;
    content += `FULLT MANUS:\n${variant.scriptPreview}\n\n`;
    content += `SCENEPLAN:\n`;
    variant.scenes.forEach((sc) => {
      content += `Scene ${sc.sceneNumber} (${sc.durationSeconds}s) [${sc.mood}]:\n`;
      content += `  Tekst på skjerm: ${sc.onScreenText}\n`;
      content += `  Voiceover: «${sc.narrationVoiceover}»\n`;
      content += `  Visuell regi: ${sc.visualPrompt}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Kampanje_${variant.id}_${variant.variantType}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllApprovedZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      variants
        .filter((v) => approvedVariants[v.id])
        .forEach((v) => {
          let content = `=== KAMPANJEVARIANT: ${v.title.toUpperCase()} ===\n`;
          content += `Vinkel: ${v.variantType}\n`;
          content += `Stemning: ${v.targetMood}\n`;
          content += `Hook: «${v.hook}»\n`;
          content += `CTA: ${v.cta}\n\n`;
          content += `FULLT MANUS:\n${v.scriptPreview}\n\n`;
          content += `SCENER:\n`;
          v.scenes.forEach((sc) => {
            content += `[Scene ${sc.sceneNumber} - ${sc.durationSeconds}s] ${sc.onScreenText}\n`;
            content += `Voiceover: «${sc.narrationVoiceover}»\n\n`;
          });
          zip.file(`manus/${v.id}_${v.variantType}.txt`, content);
        });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Godkjente_Kampanjevarianter.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Zipping error:", e);
    } finally {
      setIsZipping(false);
    }
  };

  const approvedCount = variants.filter((v) => approvedVariants[v.id]).length;

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-[#141416] border border-[#262626] p-4 sm:p-5 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SplitSquareVertical className="w-5 h-5 text-[#FF3B00]" />
            <h3 className="text-base font-black uppercase text-white font-mono tracking-tight">
              A/B-Testvarianter &amp; Salgsvinkler // {variants.length} Varianter
            </h3>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Test ulike psykologiske vinkler (Problem/Løsning, Produktdemo, Før/Etter, PAS, ASMR). Velg og godkjenn de du vil kjøre.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#1C1C1E] border border-zinc-700 text-xs font-mono text-zinc-300 rounded flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>{approvedCount}</strong> av {variants.length} godkjent
            </span>
          </div>

          <button
            onClick={onRefreshVariants}
            disabled={isGenerating}
            className="px-3 py-2 bg-[#202024] hover:bg-[#2A2A2E] text-white border border-zinc-700 text-xs font-mono rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Generer nye vinkler"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-[#FF3B00]" : ""}`} />
            <span>Regenerer</span>
          </button>

          <button
            onClick={handleDownloadAllApprovedZip}
            disabled={isZipping || approvedCount === 0}
            className="px-4 py-2 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono tracking-wider flex items-center gap-2 rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Last ned godkjente manus (ZIP)</span>
          </button>
        </div>
      </div>

      {/* Grid of Variant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {variants.map((v) => {
          const isApproved = approvedVariants[v.id];
          return (
            <div
              key={v.id}
              className={`p-5 bg-[#141416] border rounded-lg space-y-4 flex flex-col justify-between transition-all ${
                isApproved
                  ? "border-emerald-500/80 shadow-lg shadow-emerald-500/10"
                  : "border-[#2D2D32] hover:border-zinc-600"
              }`}
            >
              <div className="space-y-3">
                {/* Header & Badges */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#202024] text-[#FF3B00] font-bold rounded">
                    {v.variantType}
                  </span>
                  <button
                    onClick={() => toggleApproval(v.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isApproved
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                        : "bg-[#202024] text-zinc-400 hover:text-white border border-zinc-700"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{isApproved ? "Godkjent" : "Godkjenn"}</span>
                  </button>
                </div>

                <h4 className="text-sm font-bold text-white uppercase">{v.title}</h4>

                {/* Hook Box */}
                <div className="p-2.5 bg-[#0D0D0F] border border-zinc-800 rounded">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">
                    Viral Hook (0-3 sek):
                  </span>
                  <p className="text-xs text-[#FF3B00] font-medium leading-snug">«{v.hook}»</p>
                </div>

                {/* Simulated Visual Player Preview Frame */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-[#18181C] to-[#0A0A0C] border border-[#333] rounded overflow-hidden p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded">
                      {v.scenes.length} Scener
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded">
                      {v.targetMood}
                    </span>
                  </div>

                  <div className="text-center my-auto px-2">
                    <div className="inline-block px-2 py-0.5 bg-[#FF3B00] text-black font-black uppercase text-[10px] rounded mb-1">
                      {v.scenes[0]?.onScreenText || "SCENE 1"}
                    </div>
                    <p className="text-[10px] text-zinc-300 line-clamp-2">
                      «{v.scenes[0]?.narrationVoiceover || v.scriptPreview}»
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-white bg-black/70 px-2 py-0.5 rounded">
                      {v.cta.slice(0, 26)}
                    </span>
                  </div>
                </div>

                {/* Script snippet */}
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {v.scriptPreview}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#222] flex items-center gap-2">
                <button
                  onClick={() => onSelectVariant(v)}
                  className="flex-1 py-2 bg-[#202024] hover:bg-[#FF3B00] text-zinc-200 hover:text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Bruk i Videospiller</span>
                </button>

                <button
                  onClick={() => handleDownloadSingleVariant(v)}
                  className="p-2 bg-[#1C1C1E] hover:bg-[#2A2A2E] text-zinc-400 hover:text-white rounded border border-[#333] cursor-pointer"
                  title="Last ned manus"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
