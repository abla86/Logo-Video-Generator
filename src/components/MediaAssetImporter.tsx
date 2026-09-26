import React, { useState, useMemo } from "react";
import {
  Upload,
  Film,
  Image as ImageIcon,
  Music,
  Trash2,
  Sliders,
  Volume2,
  Download,
  Tag,
  Folder,
  Sparkles,
  Filter,
  X,
  Plus,
  Search,
  RefreshCw,
  ShoppingBag,
  Layers,
  Palette,
  Check,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useProjectContext } from "../context/ProjectContext";
import { ImportedMediaAsset, MediaAssetCategory } from "../types";

export type { ImportedMediaAsset, MediaAssetCategory };

interface MediaAssetImporterProps {
  onSelectAssetForScene?: (asset: ImportedMediaAsset) => void;
}

// Preset style catalog for smart detection and manual selection
export const AVAILABLE_STYLE_PRESETS = [
  "Minimalist",
  "Cinematisk",
  "Nordisk Ren",
  "Modig & Kinetisk",
  "Cyberpunk / Neon",
  "Vintage / Retro",
  "Luksus & Premium",
  "Bedrift / Profesjonell",
  "Sosiale Medier (Reels/TikTok)",
  "B-Roll / Stemning",
  "Produktfokus",
  "3D / Render",
  "Vektor / Emblem",
] as const;

/**
 * Intelligent auto-categorizer for media assets
 * Automatically inspects filename, MIME type, dimensions, duration, and active project context
 */
export function autoCategorizeAsset(
  name: string,
  type: "image" | "video" | "audio",
  mimeType: string,
  width?: number,
  height?: number,
  duration?: number,
  activeProjectName?: string
): {
  category: MediaAssetCategory;
  projectTag: string;
  styleTags: string[];
  aspectRatioTag: string;
  tags: string[];
} {
  const lowerName = name.toLowerCase();
  const styleTags: string[] = [];
  let category: MediaAssetCategory = "general";
  let aspectRatioTag = "";

  // 1. Calculate Aspect Ratio Tag
  if (width && height && height > 0) {
    const ratio = width / height;
    if (ratio >= 0.5 && ratio <= 0.65) {
      aspectRatioTag = "9:16 (Vertikal/Reels)";
    } else if (ratio >= 1.6 && ratio <= 1.9) {
      aspectRatioTag = "16:9 (Kino/Landskap)";
    } else if (ratio >= 0.95 && ratio <= 1.05) {
      aspectRatioTag = "1:1 (Kvadratisk Feed)";
    } else if (ratio >= 0.75 && ratio <= 0.85) {
      aspectRatioTag = "4:5 (Instagram Portrett)";
    } else {
      aspectRatioTag = `${width}x${height}`;
    }
  }

  // 2. Identify Category
  if (type === "image") {
    const isLogoPattern =
      /(logo|emblem|brand|icon|crest|symbol|badge|monogram|merke|insignia|watermark)/i.test(
        lowerName
      );
    const isSquareOrVector =
      (width && height && Math.abs(width - height) < 80) ||
      mimeType.includes("svg") ||
      lowerName.endsWith(".svg");

    if (isLogoPattern || (isSquareOrVector && !lowerName.includes("product") && !lowerName.includes("banner"))) {
      category = "logo";
    } else if (
      /(banner|annonse|header|cover|plakat|poster|billboard|ad_)/i.test(lowerName) ||
      (width && height && width / height >= 1.7)
    ) {
      category = "banner";
    } else if (
      /(product|produkt|vare|item|shop|pakke|flaske|kopp|mockup|t-skjorte|klær)/i.test(
        lowerName
      )
    ) {
      category = "product_photo";
    } else {
      category = isSquareOrVector ? "logo" : "product_photo";
    }
  } else if (type === "video") {
    if (/(broll|b-roll|cutaway|ambient|landscape|drone|background|bakgrunn)/i.test(lowerName)) {
      category = "b_roll";
    } else if (
      (duration && duration <= 15) ||
      /(clip|klipp|reels|tiktok|short|hook|teaser|promo|spot)/i.test(lowerName)
    ) {
      category = "video_clip";
    } else {
      category = "video_clip";
    }
  } else if (type === "audio") {
    category = "audio_track";
  }

  // 3. Detect Style Tags from Filename & Metadata
  if (/(minimal|clean|simple|flat|enkel|nordic|scandi|ren)/i.test(lowerName)) {
    styleTags.push("Minimalist");
  }
  if (/(cinematic|kino|film|movie|epic|dramatic|dramatisk|widescreen)/i.test(lowerName)) {
    styleTags.push("Cinematisk");
  }
  if (/(nordic|nordisk|norge|skandinavisk|fjell|fjord)/i.test(lowerName)) {
    styleTags.push("Nordisk Ren");
  }
  if (/(cyber|neon|synth|glow|future|futuristisk|matrix|dark)/i.test(lowerName)) {
    styleTags.push("Cyberpunk / Neon");
  }
  if (/(vintage|retro|classic|analog|vhs|nostalgi|gammel|70s|80s|90s)/i.test(lowerName)) {
    styleTags.push("Vintage / Retro");
  }
  if (/(lux|gold|premium|gull|eksklusiv|luksus|elegant)/i.test(lowerName)) {
    styleTags.push("Luksus & Premium");
  }
  if (/(bold|energetic|action|fast|punch|dynamisk|kinetisk|power)/i.test(lowerName)) {
    styleTags.push("Modig & Kinetisk");
  }
  if (/(corporate|business|pro|finans|bedrift|b2b|kontor)/i.test(lowerName)) {
    styleTags.push("Bedrift / Profesjonell");
  }
  if (/(3d|render|blender|isometric|c4d)/i.test(lowerName)) {
    styleTags.push("3D / Render");
  }
  if (/(vector|svg|emblem|illustrasjon|tegning)/i.test(lowerName) || mimeType.includes("svg")) {
    styleTags.push("Vektor / Emblem");
  }

  // Fallback styles if none were explicitly matched
  if (styleTags.length === 0) {
    if (category === "logo") {
      styleTags.push("Minimalist", "Vektor / Emblem");
    } else if (category === "video_clip") {
      if (aspectRatioTag.includes("9:16")) {
        styleTags.push("Sosiale Medier (Reels/TikTok)", "Modig & Kinetisk");
      } else {
        styleTags.push("Cinematisk");
      }
    } else if (category === "b_roll") {
      styleTags.push("B-Roll / Stemning", "Cinematisk");
    } else if (category === "product_photo") {
      styleTags.push("Produktfokus", "Nordisk Ren");
    } else if (category === "audio_track") {
      if (/(voice|tale|speak|speech|narration)/i.test(lowerName)) {
        styleTags.push("Stemme / Voiceover");
      } else {
        styleTags.push("Bakgrunnsmusikk");
      }
    }
  }

  // 4. Determine Project Tag
  let projectTag = activeProjectName?.trim() || "Generelt";
  // Check if filename has prefix pattern like `[BrandName]_file.png` or `BrandName-file.mp4`
  const prefixMatch = lowerName.match(/^([a-z0-9æøå_-]+)[-_](logo|video|clip|audio|broll|product)/i);
  if (prefixMatch && prefixMatch[1] && prefixMatch[1].length >= 3) {
    // Capitalize first letter of parsed brand prefix
    const cleanPrefix = prefixMatch[1].replace(/[-_]/g, " ").trim();
    projectTag = cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1);
  }

  // 5. Build Unified Tags Array
  const combinedTags = new Set<string>();

  // Category Tag
  const categoryLabelMap: Record<MediaAssetCategory, string> = {
    logo: "Logo",
    video_clip: "Videoklipp",
    b_roll: "B-Roll",
    product_photo: "Produktbilde",
    audio_track: "Lydspor",
    banner: "Annonsebanner",
    general: "Medie",
  };
  combinedTags.add(categoryLabelMap[category]);

  // Project Tag
  combinedTags.add(`Prosjekt: ${projectTag}`);

  // Style Tags
  styleTags.forEach((s) => combinedTags.add(s));

  // Aspect Ratio Tag
  if (aspectRatioTag) {
    combinedTags.add(aspectRatioTag.split(" ")[0]);
  }

  return {
    category,
    projectTag,
    styleTags,
    aspectRatioTag,
    tags: Array.from(combinedTags),
  };
}

export const MediaAssetImporter: React.FC<MediaAssetImporterProps> = ({
  onSelectAssetForScene,
}) => {
  const projectCtx = useProjectContext();

  const [assets, setAssets] = useState<ImportedMediaAsset[]>(() => {
    try {
      const stored = localStorage.getItem("brandforge_imported_assets");
      if (stored) {
        const parsed: ImportedMediaAsset[] = JSON.parse(stored);
        // Ensure legacy assets get default tags if missing
        return parsed.map((a) => {
          if (!a.tags || a.tags.length === 0) {
            const auto = autoCategorizeAsset(
              a.name,
              a.type,
              a.mimeType,
              a.width,
              a.height,
              a.duration,
              projectCtx.companyName
            );
            return {
              ...a,
              category: a.category || auto.category,
              projectTag: a.projectTag || auto.projectTag,
              styleTags: a.styleTags || auto.styleTags,
              aspectRatioTag: a.aspectRatioTag || auto.aspectRatioTag,
              tags: auto.tags,
              autoCategorized: true,
            };
          }
          return a;
        });
      }
    } catch {}
    return [];
  });

  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | MediaAssetCategory>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStyle, setFilterStyle] = useState<string>("all");
  const [selectedTagChip, setSelectedTagChip] = useState<string | null>(null);

  // Quick tag editor popover state
  const [taggingAssetId, setTaggingAssetId] = useState<string | null>(null);
  const [newCustomTag, setNewCustomTag] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveAssets = (newAssets: ImportedMediaAsset[]) => {
    setAssets(newAssets);
    try {
      localStorage.setItem("brandforge_imported_assets", JSON.stringify(newAssets));
    } catch (e) {
      console.warn("Storage quota warning for imported assets:", e);
    }
  };

  // Compute unique projects for filter dropdown
  const uniqueProjects = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => {
      if (a.projectTag) set.add(a.projectTag);
    });
    if (projectCtx.companyName) {
      set.add(projectCtx.companyName);
    }
    return Array.from(set).sort();
  }, [assets, projectCtx.companyName]);

  // Compute unique style tags for filter dropdown
  const uniqueStyles = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => {
      a.styleTags?.forEach((s) => set.add(s));
    });
    AVAILABLE_STYLE_PRESETS.forEach((p) => set.add(p));
    return Array.from(set).sort();
  }, [assets]);

  // Compute top popular tags for the quick-filter cloud
  const popularTags = useMemo(() => {
    const counts: Record<string, number> = {};
    assets.forEach((a) => {
      a.tags?.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([tag]) => tag);
  }, [assets]);

  // Handle file uploads with automatic categorization
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const addedAssets: ImportedMediaAsset[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mime = file.type || "application/octet-stream";
      let assetType: "image" | "video" | "audio" = "image";

      if (mime.startsWith("video/") || /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(file.name)) {
        assetType = "video";
      } else if (mime.startsWith("audio/") || /\.(mp3|wav|aac|m4a|ogg|flac)$/i.test(file.name)) {
        assetType = "audio";
      }

      // Read file data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      let width: number | undefined;
      let height: number | undefined;
      let duration: number | undefined;
      let status: "valid" | "warning" | "invalid" = "valid";
      const notes: string[] = [];

      // Validate metadata
      if (assetType === "image") {
        try {
          const img = new Image();
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = dataUrl;
          });
          width = img.width;
          height = img.height;
          notes.push(`Oppløsning: ${width}x${height}px`);
          if (width < 720 || height < 720) {
            status = "warning";
            notes.push("Lav oppløsning (mindre enn 720px anbefalt for 1080p).");
          }
        } catch {
          status = "invalid";
          notes.push("Bildet kunne ikke dekodes av nettleseren.");
        }
      } else if (assetType === "video") {
        try {
          const vid = document.createElement("video");
          vid.preload = "metadata";
          await new Promise((res, rej) => {
            vid.onloadedmetadata = res;
            vid.onerror = rej;
            vid.src = dataUrl;
          });
          width = vid.videoWidth;
          height = vid.videoHeight;
          duration = vid.duration;
          notes.push(`Oppløsning: ${width}x${height}px, Varighet: ${duration.toFixed(1)}s`);
        } catch {
          notes.push("Video ble lastet inn. Forhåndsvisning sjekket.");
        }

        // Server FFprobe validation
        try {
          const probeRes = await fetch("/api/validate-video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoBase64: dataUrl }),
          });
          if (probeRes.ok) {
            const probeData = await probeRes.json();
            if (probeData.report) {
              notes.push(
                `FFprobe: ${probeData.report.videoCodec} / ${probeData.report.audioCodec}, ${probeData.report.bitrateKbps} kbps`
              );
            }
          }
        } catch {}
      } else if (assetType === "audio") {
        try {
          const aud = new Audio();
          aud.preload = "metadata";
          await new Promise((res, rej) => {
            aud.onloadedmetadata = res;
            aud.onerror = rej;
            aud.src = dataUrl;
          });
          duration = aud.duration;
          notes.push(`Lydspor varighet: ${duration.toFixed(1)}s`);
        } catch {
          notes.push("Lydfil importert.");
        }
      }

      // Execute smart categorization
      const autoData = autoCategorizeAsset(
        file.name,
        assetType,
        mime,
        width,
        height,
        duration,
        projectCtx.companyName
      );

      const newAsset: ImportedMediaAsset = {
        id: `asset_${Date.now()}_${i}`,
        name: file.name,
        type: assetType,
        mimeType: mime,
        sizeBytes: file.size,
        dataUrl,
        width,
        height,
        duration,
        validationStatus: status,
        validationNotes: notes,
        uploadedAt: Date.now(),
        category: autoData.category,
        projectTag: autoData.projectTag,
        styleTags: autoData.styleTags,
        aspectRatioTag: autoData.aspectRatioTag,
        tags: autoData.tags,
        autoCategorized: true,
      };

      addedAssets.push(newAsset);
    }

    const updated = [...addedAssets, ...assets];
    saveAssets(updated);
    setIsUploading(false);
    e.target.value = "";
    showToast(
      `Importerte og kategoriserte ${addedAssets.length} filer automatisk etter prosjekt og stil!`
    );
  };

  // Import active project brand logo directly into vault
  const handleImportActiveBrandLogo = () => {
    if (!projectCtx.brandLogoUrl) {
      showToast("Ingen aktiv logo funnet i nåværende prosjekt.");
      return;
    }
    const assetName = `${projectCtx.companyName || "Merkevare"}_Offisiell_Logo.png`;
    const autoData = autoCategorizeAsset(
      assetName,
      "image",
      "image/png",
      1024,
      1024,
      undefined,
      projectCtx.companyName
    );

    const newAsset: ImportedMediaAsset = {
      id: `asset_logo_${Date.now()}`,
      name: assetName,
      type: "image",
      mimeType: "image/png",
      sizeBytes: 150000,
      dataUrl: projectCtx.brandLogoUrl,
      width: 1024,
      height: 1024,
      validationStatus: "valid",
      validationNotes: ["Importert fra aktiv merkevare-designer"],
      uploadedAt: Date.now(),
      category: "logo",
      projectTag: projectCtx.companyName || "Aktivt Prosjekt",
      styleTags: ["Minimalist", "Vektor / Emblem", "Luksus & Premium"],
      aspectRatioTag: "1:1 (Kvadratisk Feed)",
      tags: [
        "Logo",
        `Prosjekt: ${projectCtx.companyName || "Aktivt Prosjekt"}`,
        "Minimalist",
        "Vektor / Emblem",
        "1:1",
      ],
      autoCategorized: true,
    };

    saveAssets([newAsset, ...assets]);
    showToast(`Logo for «${projectCtx.companyName}» importert og tagget!`);
  };

  // Import rendered video from active project
  const handleImportActiveRenderedVideo = () => {
    if (!projectCtx.renderedVideoUrl) {
      showToast("Ingen rendret video funnet i nåværende prosjekt.");
      return;
    }
    const assetName = `${projectCtx.companyName || "Video"}_Master_Commercial.mp4`;
    const autoData = autoCategorizeAsset(
      assetName,
      "video",
      "video/mp4",
      720,
      1280,
      projectCtx.activeProject?.totalDurationSeconds || 15,
      projectCtx.companyName
    );

    const newAsset: ImportedMediaAsset = {
      id: `asset_vid_${Date.now()}`,
      name: assetName,
      type: "video",
      mimeType: "video/mp4",
      sizeBytes: 850000,
      dataUrl: projectCtx.renderedVideoUrl,
      width: 720,
      height: 1280,
      duration: projectCtx.activeProject?.totalDurationSeconds || 15,
      validationStatus: "valid",
      validationNotes: ["Importert fra autonom videoprodusent (H.264/AAC)"],
      uploadedAt: Date.now(),
      category: "video_clip",
      projectTag: projectCtx.companyName || "Aktivt Prosjekt",
      styleTags: ["Cinematisk", "Sosiale Medier (Reels/TikTok)", "Modig & Kinetisk"],
      aspectRatioTag: "9:16 (Vertikal/Reels)",
      tags: [
        "Videoklipp",
        `Prosjekt: ${projectCtx.companyName || "Aktivt Prosjekt"}`,
        "Cinematisk",
        "Sosiale Medier (Reels/TikTok)",
        "9:16",
      ],
      autoCategorized: true,
    };

    saveAssets([newAsset, ...assets]);
    showToast(`Rendret video for «${projectCtx.companyName}» importert og tagget!`);
  };

  // Re-run auto categorization on all assets
  const handleReanalyzeAllAssets = () => {
    const updated = assets.map((a) => {
      const autoData = autoCategorizeAsset(
        a.name,
        a.type,
        a.mimeType,
        a.width,
        a.height,
        a.duration,
        a.projectTag || projectCtx.companyName
      );
      return {
        ...a,
        category: autoData.category,
        projectTag: a.projectTag || autoData.projectTag,
        styleTags: autoData.styleTags,
        aspectRatioTag: autoData.aspectRatioTag,
        tags: autoData.tags,
        autoCategorized: true,
      };
    });
    saveAssets(updated);
    showToast(`Alle ${assets.length} mediefiler ble re-analysert og organisert med tags!`);
  };

  // Add custom tag to an asset
  const handleAddCustomTag = (assetId: string, tagToAdd: string) => {
    const cleanTag = tagToAdd.trim();
    if (!cleanTag) return;

    const updated = assets.map((a) => {
      if (a.id === assetId) {
        const existingTags = a.tags || [];
        if (!existingTags.includes(cleanTag)) {
          const nextTags = [...existingTags, cleanTag];
          return {
            ...a,
            tags: nextTags,
          };
        }
      }
      return a;
    });

    saveAssets(updated);
    setNewCustomTag("");
    setTaggingAssetId(null);
  };

  // Remove tag from an asset
  const handleRemoveTag = (assetId: string, tagToRemove: string) => {
    const updated = assets.map((a) => {
      if (a.id === assetId) {
        return {
          ...a,
          tags: (a.tags || []).filter((t) => t !== tagToRemove),
          styleTags: (a.styleTags || []).filter((s) => s !== tagToRemove),
        };
      }
      return a;
    });
    saveAssets(updated);
  };

  // Re-assign project tag to an asset
  const handleChangeProject = (assetId: string, newProjectName: string) => {
    const cleanName = newProjectName.trim();
    if (!cleanName) return;

    const updated = assets.map((a) => {
      if (a.id === assetId) {
        const tagsWithoutProject = (a.tags || []).filter((t) => !t.startsWith("Prosjekt:"));
        return {
          ...a,
          projectTag: cleanName,
          tags: [`Prosjekt: ${cleanName}`, ...tagsWithoutProject],
        };
      }
      return a;
    });

    saveAssets(updated);
    showToast(`Endret prosjekt til «${cleanName}»`);
  };

  // Delete an asset
  const handleDelete = (id: string) => {
    const updated = assets.filter((a) => a.id !== id);
    saveAssets(updated);
    showToast("Mediefil slettet fra arkivet.");
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterProject("all");
    setFilterStyle("all");
    setSelectedTagChip(null);
  };

  // Multi-criteria filter pipeline
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // 1. Search Query (name, tags, projectTag, styleTags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = asset.name.toLowerCase().includes(q);
        const matchesProject = asset.projectTag?.toLowerCase().includes(q);
        const matchesCategory = asset.category?.toLowerCase().includes(q);
        const matchesTags = asset.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesProject && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // 2. Category Filter
      if (filterCategory !== "all") {
        if (asset.category !== filterCategory) return false;
      }

      // 3. Project Filter
      if (filterProject !== "all") {
        if (asset.projectTag !== filterProject) return false;
      }

      // 4. Style Filter
      if (filterStyle !== "all") {
        if (!asset.styleTags?.includes(filterStyle)) return false;
      }

      // 5. Selected Tag Chip
      if (selectedTagChip) {
        if (!asset.tags?.includes(selectedTagChip)) return false;
      }

      return true;
    });
  }, [assets, searchQuery, filterCategory, filterProject, filterStyle, selectedTagChip]);

  // Category counts for quick tabs
  const categoryCounts = useMemo(() => {
    return {
      all: assets.length,
      logo: assets.filter((a) => a.category === "logo").length,
      video_clip: assets.filter((a) => a.category === "video_clip" || a.category === "b_roll")
        .length,
      product_photo: assets.filter((a) => a.category === "product_photo").length,
      banner: assets.filter((a) => a.category === "banner").length,
      audio_track: assets.filter((a) => a.category === "audio_track").length,
    };
  }, [assets]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#141416] border-2 border-[#FF3B00] text-white shadow-2xl rounded-lg flex items-center gap-3 text-xs font-mono animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF3B00]/10 border border-[#FF3B00]/30 flex items-center justify-center text-[#FF3B00]">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white font-mono">
              Mediearkiv &amp; Smart Tagging
            </h2>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono rounded font-bold">
              AI Tagger Aktiv
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1 max-w-2xl">
            Automatisk tagging og kategorisering av logoer, videoklipp, b-roll og lydspor etter prosjekt og visuell stil.
            Gjør det lekende lett å gjenbruke godkjente merkevareressurser i alle scener.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {projectCtx.brandLogoUrl && (
            <button
              type="button"
              onClick={handleImportActiveBrandLogo}
              className="px-3 py-2 bg-[#1C1C20] hover:bg-[#25252B] border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Importer logoen fra ditt aktive prosjekt direkte til hvelvet"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hent Aktiv Logo</span>
            </button>
          )}

          {projectCtx.renderedVideoUrl && (
            <button
              type="button"
              onClick={handleImportActiveRenderedVideo}
              className="px-3 py-2 bg-[#1C1C20] hover:bg-[#25252B] border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Importer den ferdig rendret videoen fra videoprodusenten"
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hent Rendret Video</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReanalyzeAllAssets}
            disabled={assets.length === 0}
            className="px-3 py-2 bg-[#1C1C20] hover:bg-[#25252B] border border-zinc-700 text-zinc-300 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            title="Kjør automatisk gjenkjenning av prosjekt og stil på alle eksisterende filer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#FF3B00]" />
            <span>Tagg Alle på Nytt</span>
          </button>

          <label className="px-4 py-2 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer transition-colors rounded shadow-lg shadow-[#FF3B00]/20">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? "Analyserer & Tagger..." : "+ Last opp Filer"}</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.mp4,.mov,.webm,.mkv,.avi,.mp3,.wav,.aac,.m4a"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Active Project Banner Info */}
      <div className="bg-[#121215] border border-[#26262A] p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-[#FF3B00]" />
          <span className="text-zinc-400">Aktivt Prosjekt for automatisk tagging:</span>
          <span className="px-2 py-0.5 bg-[#FF3B00]/15 text-[#FF3B00] border border-[#FF3B00]/30 rounded font-black uppercase">
            {projectCtx.companyName || "Generell Kampanje"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          <span>{assets.length} ressurser i arkivet</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">
            {assets.filter((a) => a.autoCategorized).length} auto-tagget
          </span>
        </div>
      </div>

      {/* Multi-Criteria Filter Controls */}
      <div className="bg-[#141416] border border-[#262626] p-4 rounded-lg space-y-3">
        {/* Row 1: Search & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Søk i navn, tags (#Cinematisk), prosjekt (#Acme)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#0A0A0C] border border-zinc-800 focus:border-[#FF3B00] text-xs font-mono text-white rounded outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Project Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full py-2 px-3 bg-[#0A0A0C] border border-zinc-800 text-xs font-mono text-zinc-300 rounded outline-none focus:border-[#FF3B00]"
            >
              <option value="all">Alle Prosjekter ({uniqueProjects.length})</option>
              {uniqueProjects.map((p) => (
                <option key={p} value={p}>
                  📁 Prosjekt: {p}
                </option>
              ))}
            </select>
          </div>

          {/* Style Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value)}
              className="w-full py-2 px-3 bg-[#0A0A0C] border border-zinc-800 text-xs font-mono text-zinc-300 rounded outline-none focus:border-[#FF3B00]"
            >
              <option value="all">Alle Stiler ({uniqueStyles.length})</option>
              {uniqueStyles.map((s) => (
                <option key={s} value={s}>
                  🎨 Stil: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <div className="sm:col-span-1 flex items-center justify-end">
            {(searchQuery ||
              filterCategory !== "all" ||
              filterProject !== "all" ||
              filterStyle !== "all" ||
              selectedTagChip) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono uppercase font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="Tilbakestill alle filtre"
              >
                <X className="w-3 h-3" />
                <span>Nullstill</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#222] overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterCategory === "all"
                ? "bg-white text-black font-black"
                : "bg-[#0A0A0C] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <span>Alle Medier</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded-full">
              {categoryCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory("logo")}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterCategory === "logo"
                ? "bg-purple-500 text-black font-black"
                : "bg-[#0A0A0C] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Logoer &amp; Emblemer</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-purple-950 text-purple-300 rounded-full">
              {categoryCounts.logo}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory("video_clip")}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterCategory === "video_clip"
                ? "bg-cyan-500 text-black font-black"
                : "bg-[#0A0A0C] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Videoklipp &amp; B-Roll</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded-full">
              {categoryCounts.video_clip}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory("product_photo")}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterCategory === "product_photo"
                ? "bg-emerald-500 text-black font-black"
                : "bg-[#0A0A0C] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Produktbilder</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded-full">
              {categoryCounts.product_photo}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory("banner")}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterCategory === "banner"
                ? "bg-amber-500 text-black font-black"
                : "bg-[#0A0A0C] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Bannere &amp; Annonser</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-950 text-amber-300 rounded-full">
              {categoryCounts.banner}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory("audio_track")}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterCategory === "audio_track"
                ? "bg-fuchsia-500 text-black font-black"
                : "bg-[#0A0A0C] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Music className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Lyd &amp; Tale</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-fuchsia-950 text-fuchsia-300 rounded-full">
              {categoryCounts.audio_track}
            </span>
          </button>
        </div>

        {/* Row 3: Popular Tag Chips Cloud */}
        {popularTags.length > 0 && (
          <div className="pt-2 border-t border-[#222] flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-[#FF3B00]" />
              <span>Hurtigtags:</span>
            </span>
            {popularTags.map((tag) => {
              const isSelected = selectedTagChip === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTagChip(isSelected ? null : tag)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors cursor-pointer border ${
                    isSelected
                      ? "bg-[#FF3B00] text-black border-[#FF3B00] font-black shadow-md shadow-[#FF3B00]/30"
                      : "bg-[#0A0A0C] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center bg-[#141416] border border-[#262626] rounded-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <div className="text-sm font-mono font-bold text-zinc-300">
            Ingen mediefiler matcher de valgte filtrene.
          </div>
          <p className="text-xs text-zinc-500 max-w-md mx-auto font-mono">
            Prøv å endre søkeord, nullstill filtrene eller last opp nye logoer og videoer for å utvide samlingen.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#1C1C20] hover:bg-[#25252B] border border-zinc-700 text-zinc-200 text-xs font-mono font-bold rounded cursor-pointer transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Nullstill alle filtre</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const isEditingTag = taggingAssetId === asset.id;
            const categoryBadge = getCategoryBadge(asset.category || "general");

            return (
              <div
                key={asset.id}
                className="bg-[#141416] border border-[#262626] hover:border-[#444] rounded-xl overflow-hidden flex flex-col justify-between group transition-all shadow-lg hover:shadow-2xl"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {asset.type === "image" && (
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      className="w-full h-full object-contain p-2"
                    />
                  )}
                  {asset.type === "video" && (
                    <video
                      src={asset.dataUrl}
                      muted
                      playsInline
                      loop
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                  {asset.type === "audio" && (
                    <div className="flex flex-col items-center gap-2 text-zinc-400 p-4">
                      <div className="w-12 h-12 rounded-full bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        <Music className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {asset.duration ? `${asset.duration.toFixed(1)}s Lydfil` : "Lydopptak"}
                      </span>
                    </div>
                  )}

                  {/* Top Badges (Category & Project) */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap z-10">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1 backdrop-blur-md ${categoryBadge.classes}`}
                    >
                      {categoryBadge.icon}
                      <span>{categoryBadge.label}</span>
                    </span>
                  </div>

                  {/* Aspect Ratio Badge */}
                  {asset.aspectRatioTag && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-white/80 border border-white/20 backdrop-blur-sm">
                        {asset.aspectRatioTag.split(" ")[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info & Tags Area */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Filename & Project Attribution */}
                    <div className="truncate font-bold text-xs text-white" title={asset.name}>
                      {asset.name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        <span>{asset.projectTag || "Uavhengig"}</span>
                      </span>
                      <span>{(asset.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>

                    {/* Tags List */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1">
                      {asset.tags?.map((t) => (
                        <span
                          key={t}
                          className="group/tag inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1C1C20] border border-zinc-700/60 text-[9px] font-mono text-zinc-300 hover:border-zinc-500"
                        >
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(asset.id, t)}
                            className="opacity-40 group-hover/tag:opacity-100 hover:text-red-400 transition-opacity"
                            title="Fjern tag"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}

                      {/* Add Custom Tag Button */}
                      {!isEditingTag ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTaggingAssetId(asset.id);
                            setNewCustomTag("");
                          }}
                          className="px-1.5 py-0.5 rounded border border-dashed border-zinc-700 hover:border-[#FF3B00] text-zinc-500 hover:text-[#FF3B00] text-[9px] font-mono flex items-center gap-0.5 cursor-pointer transition-colors"
                          title="Legg til egendefinert tag"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Tag</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 mt-1 w-full animate-fade-in">
                          <input
                            type="text"
                            placeholder="Ny tag (Trykk Enter)..."
                            value={newCustomTag}
                            autoFocus
                            onChange={(e) => setNewCustomTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddCustomTag(asset.id, newCustomTag);
                              } else if (e.key === "Escape") {
                                setTaggingAssetId(null);
                              }
                            }}
                            className="flex-1 px-1.5 py-0.5 bg-black border border-[#FF3B00] text-[10px] font-mono text-white rounded outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomTag(asset.id, newCustomTag)}
                            className="p-1 bg-[#FF3B00] text-black rounded hover:bg-[#e03400]"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaggingAssetId(null)}
                            className="p-1 text-zinc-500 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Project Switcher Selector */}
                  <div className="pt-2 border-t border-[#222] flex items-center justify-between gap-1 text-[9px] font-mono">
                    <span className="text-zinc-500">Bytt prosjekt:</span>
                    <select
                      value={asset.projectTag || ""}
                      onChange={(e) => handleChangeProject(asset.id, e.target.value)}
                      className="bg-[#0A0A0C] border border-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-[9px] outline-none max-w-[140px] truncate"
                    >
                      {uniqueProjects.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#222]">
                    {onSelectAssetForScene && (
                      <button
                        type="button"
                        onClick={() => onSelectAssetForScene(asset)}
                        className="flex-1 py-1.5 bg-[#1C1C1E] hover:bg-[#FF3B00] text-zinc-300 hover:text-black font-mono text-[10px] uppercase font-bold border border-[#333] transition-colors cursor-pointer rounded flex items-center justify-center gap-1"
                      >
                        <span>Bruk i Scene</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <a
                      href={asset.dataUrl}
                      download={asset.name}
                      className="p-1.5 bg-[#1C1C1E] text-zinc-400 hover:text-white border border-[#333] rounded transition-colors cursor-pointer"
                      title="Last ned ressurs"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(asset.id)}
                      className="p-1.5 bg-[#1C1C1E] text-zinc-500 hover:text-red-400 border border-[#333] rounded transition-colors cursor-pointer"
                      title="Slett ressurs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper badge renderer for media asset categories
function getCategoryBadge(category: MediaAssetCategory): {
  label: string;
  classes: string;
  icon: React.ReactNode;
} {
  switch (category) {
    case "logo":
      return {
        label: "Logo",
        classes: "bg-purple-950/80 text-purple-300 border border-purple-500/50",
        icon: <Sparkles className="w-2.5 h-2.5 text-purple-300" />,
      };
    case "video_clip":
      return {
        label: "Klipp",
        classes: "bg-cyan-950/80 text-cyan-300 border border-cyan-500/50",
        icon: <Film className="w-2.5 h-2.5 text-cyan-300" />,
      };
    case "b_roll":
      return {
        label: "B-Roll",
        classes: "bg-blue-950/80 text-blue-300 border border-blue-500/50",
        icon: <Film className="w-2.5 h-2.5 text-blue-300" />,
      };
    case "product_photo":
      return {
        label: "Produkt",
        classes: "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50",
        icon: <ShoppingBag className="w-2.5 h-2.5 text-emerald-300" />,
      };
    case "banner":
      return {
        label: "Banner",
        classes: "bg-amber-950/80 text-amber-300 border border-amber-500/50",
        icon: <Layers className="w-2.5 h-2.5 text-amber-300" />,
      };
    case "audio_track":
      return {
        label: "Lyd",
        classes: "bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/50",
        icon: <Music className="w-2.5 h-2.5 text-fuchsia-300" />,
      };
    default:
      return {
        label: "Medie",
        classes: "bg-zinc-800 text-zinc-300 border border-zinc-600",
        icon: <ImageIcon className="w-2.5 h-2.5 text-zinc-300" />,
      };
  }
}
