import React, { useState } from "react";
import {
  Wand2,
  X,
  Sparkles,
  RefreshCw,
  Download,
  Check,
  Layers,
  ArrowRight,
  SplitSquareVertical,
} from "lucide-react";
import { GeneratedLogo, ImageResolution } from "../types";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseImageUrl: string;
  companyName?: string;
  onImageUpdated?: (newImageUrl: string) => void;
}

const EDIT_PRESET_PROMPTS = [
  "Add subtle golden metallic reflection and volumetric lighting to the symbol",
  "Isolate the logo mark cleanly on pure jet-black matte background with no artifacts",
  "Transform into a futuristic neon hologram with cyan and electric vermillion glow",
  "Convert into sleek 3D frosted glassmorphism with soft ambient shadows",
  "Refine lines into ultra-sharp high-precision geometric minimalism",
  "Add liquid chrome shader effect with realistic mercury reflections",
];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  baseImageUrl,
  companyName = "Logo",
  onImageUpdated,
}) => {
  const [editPrompt, setEditPrompt] = useState(
    "Add sleek metallic copper sheen to the logo mark and isolate on deep dark obsidian background"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  if (!isOpen) return null;

  const handleEditImage = async () => {
    if (!editPrompt.trim()) {
      setError("Please describe the edit you want to make.");
      return;
    }
    setError(null);
    setIsEditing(true);

    try {
      const response = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: baseImageUrl,
          editPrompt: editPrompt.trim(),
          aspectRatio: "1:1",
          imageSize: "1K",
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Image edit failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      setEditedImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error("Image editing error:", err);
      setError(err.message || "Failed to edit image with prompt.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleApply = () => {
    if (editedImageUrl && onImageUpdated) {
      onImageUpdated(editedImageUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111] border border-[#262626] w-full max-w-4xl p-6 relative overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Corner ticks */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#FF3B00]"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#FF3B00]"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222] pb-4 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF3B00] block">
              Prompt-Guided Image Synthesis & Edit
            </span>
            <h3 className="text-lg font-black tracking-tight text-white">
              AI IMAGE EDITOR • gemini-3.1-flash-image-preview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#333] hover:border-white text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-y-auto pr-1">
          {/* Controls */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-white/70 block mb-1.5 font-medium">
                Describe Modifications (Natural Language)
              </label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={4}
                placeholder="e.g. Change color to electric orange, add metallic reflections, remove border..."
                className="w-full bg-[#0A0A0A] border border-[#333] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF3B00] focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Quick Inspiration Chips */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-white/50 block mb-2 font-mono">
                Quick Edit Directives:
              </span>
              <div className="space-y-1.5">
                {EDIT_PRESET_PROMPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditPrompt(preset)}
                    className="w-full text-left p-2 border border-[#222] hover:border-[#FF3B00] bg-[#0E0E0E] text-[11px] text-white/70 hover:text-white transition-colors truncate"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isEditing}
              onClick={handleEditImage}
              className="w-full py-3 px-4 bg-[#FF3B00] hover:bg-[#e03400] disabled:opacity-50 text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isEditing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Image Changes...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Apply AI Edit Instruction</span>
                </>
              )}
            </button>
          </div>

          {/* Visual Canvas Comparison */}
          <div className="md:col-span-6 flex flex-col items-center justify-center bg-[#0A0A0A] border border-[#262626] p-4 relative min-h-[300px]">
            {isEditing && (
              <div className="text-center p-8">
                <div className="w-12 h-12 border-2 border-[#333] border-t-[#FF3B00] rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-xs font-mono uppercase tracking-widest text-white/70">
                  Editing Image with Gemini 3.1 Flash Image...
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-64 h-64 border border-[#333] bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={showOriginal || !editedImageUrl ? baseImageUrl : editedImageUrl}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 text-[9px] font-mono border border-white/20 text-white/80">
                    {showOriginal || !editedImageUrl ? "ORIGINAL" : "AI EDITED"}
                  </div>
                </div>

                {editedImageUrl && (
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      type="button"
                      onMouseDown={() => setShowOriginal(true)}
                      onMouseUp={() => setShowOriginal(false)}
                      onTouchStart={() => setShowOriginal(true)}
                      onTouchEnd={() => setShowOriginal(false)}
                      className="py-1.5 px-3 border border-[#333] hover:border-white text-[10px] font-mono uppercase text-white/70 flex items-center gap-1 cursor-pointer select-none"
                    >
                      <SplitSquareVertical className="w-3 h-3 text-[#FF3B00]" />
                      <span>Hold to view original</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#222] mt-4 flex items-center justify-between">
          <div className="text-[10px] font-mono text-white/40">
            Powered by gemini-3.1-flash-image-preview
          </div>
          <div className="flex gap-2">
            {editedImageUrl && (
              <>
                <a
                  href={editedImageUrl}
                  download={`${companyName}-edited.png`}
                  className="py-2 px-3 border border-[#333] hover:border-white text-white/70 hover:text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={handleApply}
                  className="py-2 px-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#FF3B00] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply As Master Logo</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="py-2 px-3 border border-[#333] text-white/60 hover:text-white text-[10px] font-mono uppercase tracking-wider cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
