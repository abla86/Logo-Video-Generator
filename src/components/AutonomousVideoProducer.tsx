/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Play,
  Pause,
  Download,
  RefreshCw,
  Film,
  Volume2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  LayoutGrid,
  Shield,
  Layers,
  ArrowRight,
  Maximize2,
  HelpCircle,
  Target,
  Zap,
  SplitSquareVertical,
  Share2,
  Image as ImageIcon,
  Check,
  Scissors,
  Globe,
  Upload,
  X,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";
import JSZip from "jszip";
import {
  AutonomousVideoProject,
  VideoScriptScene,
  VideoTargetPlatform,
  SalesFramework,
  VideoValidationReport,
  CampaignVariant,
  OmnichannelPackage,
  SmartAutoSuggestion,
} from "../types";
import {
  auditTextAgainstIntent,
  extractSemanticContextTags,
  enforceContextGuardOnProject,
} from "../utils/contextGuard";
import { BannerStudio } from "./BannerStudio";
import { CarouselStudio } from "./CarouselStudio";
import { ABTestStudio } from "./ABTestStudio";
import { useProjectContext } from "../context/ProjectContext";
import {
  BANNER_FORMAT_LIST,
  renderBannerToCanvas,
  renderCarouselSlideToCanvas,
  canvasToBlobAsync,
} from "../utils/bannerCanvasRenderer";

interface AutonomousVideoProducerProps {
  onOpenTimeline?: (project: AutonomousVideoProject) => void;
  brandLogoUrl?: string;
  companyName?: string;
  initialPrompt?: string;
}

const CAMPAIGN_GOALS = [
  { id: "orders", label: "Få flere bestillinger", icon: "🛒", promptSuffix: "Fokus på timebestilling og online booking." },
  { id: "product", label: "Selge et digitalt produkt", icon: "📦", promptSuffix: "Fremhev umiddelbar nedlasting, hyperlenker og kjøpslenke." },
  { id: "leads", label: "Samle leads & e-post", icon: "📋", promptSuffix: "Gratis nedlastbar mal i bytte mot e-post." },
  { id: "traffic", label: "Driv trafikk til Etsy / butikk", icon: "🌐", promptSuffix: "Driv klikk til Etsy-butikken med rabattkode." },
  { id: "branding", label: "Bygge merkevare", icon: "💎", promptSuffix: "Estetisk visning, troverdighet og kvalitet." },
  { id: "awareness", label: "Maksimal viral spredning", icon: "📢", promptSuffix: "Sterk hook og stopp-effekt de første 2 sekundene." },
  { id: "offer", label: "Lansere et tidsbegrenset tilbud", icon: "🏷️", promptSuffix: "25% lanseringsrabatt denne uken." },
  { id: "bundle", label: "Selge produktpakke (Bundle)", icon: "🎁", promptSuffix: "Komplett pakke med planner, budsjett og klistremerker." },
];

const USER_EXAMPLE_PROMPTS = [
  "«Lag en reklamefilm for en elektrisk gressklipper»",
  "«Lanseringsvideo for nye løpesko med god demping»",
  "«Kort promovideo for en lokal kaffebar og bakeri»",
  "«Reklame uten lyd tilpasset Instagram og butikkskjerm»",
  "«Produktvideo for en minimalistisk skrivebordslampe»",
];

const VIDEO_PRESETS = [
  { id: "tiktok", label: "TikTok (9:16)", ratio: "9:16", dur: 15 },
  { id: "sound-off-social", label: "🔇 Sound-Off Feed (9:16)", ratio: "9:16", dur: 15 },
  { id: "digital-signage", label: "🔇 Butikkskjerm (16:9)", ratio: "16:9", dur: 15 },
  { id: "snapchat", label: "Snapchat Spotlight (9:16)", ratio: "9:16", dur: 12 },
  { id: "youtube-short", label: "YouTube Shorts (9:16)", ratio: "9:16", dur: 30 },
  { id: "instagram-reel", label: "Instagram Reels (9:16)", ratio: "9:16", dur: 15 },
  { id: "instagram-feed", label: "Instagram Feed (1:1)", ratio: "1:1", dur: 15 },
  { id: "facebook-reel", label: "Facebook Reel & Ad (4:5)", ratio: "4:5", dur: 20 },
  { id: "youtube-video", label: "YouTube Video (16:9)", ratio: "16:9", dur: 60 },
  { id: "etsy-product-video", label: "Etsy Produktvideo (1:1)", ratio: "1:1", dur: 15 },
];

export const AutonomousVideoProducer: React.FC<AutonomousVideoProducerProps> = ({
  onOpenTimeline,
  brandLogoUrl,
  companyName = "SPARK Studio",
  initialPrompt,
}) => {
  const projectCtx = useProjectContext();
  const effectiveCompanyName = projectCtx.companyName || companyName;

  const [prompt, setPrompt] = useState(() => {
    if (initialPrompt && initialPrompt.trim()) return initialPrompt.trim();
    if (projectCtx.productOrService) return `Jeg vil selge ${projectCtx.productOrService}`;
    return "";
  });

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setPrompt(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const [platform, setPlatform] = useState<VideoTargetPlatform>("tiktok");
  const [selectedPresetId, setSelectedPresetId] = useState("tiktok");
  const [salesFramework, setSalesFramework] = useState<SalesFramework>("ProblemSolutionCTA");
  const [selectedGoal, setSelectedGoal] = useState<string>("product");
  const [isAutopilot, setIsAutopilot] = useState(true);

  // Sound-Off / Reklame uten lyd state
  const [isSoundOffMode, setIsSoundOffMode] = useState<boolean>(() => {
    return /uten lyd|silent|sound-off|sound off|lydløs|stum|skjerm/i.test(prompt);
  });
  const [soundOffAudioMode, setSoundOffAudioMode] = useState<"silent" | "none">("silent");

  // Uploaded product image (PNG, JPG, WebP, SVG)
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageName, setProductImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [project, setProject] = useState<AutonomousVideoProject | null>(() => {
    if (projectCtx.activeProject) return projectCtx.activeProject;
    try {
      const stored = localStorage.getItem("brandforge_current_videoproj");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  // Active view tab for output
  const [deliverablesTab, setDeliverablesTab] = useState<
    "video" | "banners" | "carousel" | "copy" | "ab-test" | "omnichannel"
  >("video");

  // Video Player state & Voiceover
  const [playerMode, setPlayerMode] = useState<"interactive" | "mp4">(() => {
    return projectCtx.renderedVideoUrl ? "mp4" : "interactive";
  });
  const [speechVoiceEnabled, setSpeechVoiceEnabled] = useState(false);
  const [isApprovedVideo, setIsApprovedVideo] = useState(() => projectCtx.approvedDeliverables.video);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const renderedVideoRef = useRef<HTMLVideoElement>(null);
  const deliverablesSectionRef = useRef<HTMLDivElement>(null);
  const [videoPlaybackError, setVideoPlaybackError] = useState<string | null>(null);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [selectedSafeZonePlatform, setSelectedSafeZonePlatform] = useState<"tiktok" | "reels" | "shorts">("tiktok");

  // Approval state across all deliverables
  const [approvedBanners, setApprovedBanners] = useState<Record<string, boolean>>(() => ({
    ...projectCtx.approvedDeliverables.banners,
  }));

  const [approvedSlides, setApprovedSlides] = useState<Record<number, boolean>>(() => ({
    ...projectCtx.approvedDeliverables.slides,
  }));

  const [approvedVariants, setApprovedVariants] = useState<Record<string, boolean>>(() => ({
    ...projectCtx.approvedDeliverables.variants,
  }));

  const [isExportingAll, setIsExportingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rendering & Export state
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(
    () => projectCtx.renderedVideoUrl || null
  );
  const [validationReport, setValidationReport] = useState<VideoValidationReport | null>(
    () => projectCtx.validationReport || null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Variants modal state
  const [variantsList, setVariantsList] = useState<CampaignVariant[]>(() => projectCtx.variantsList || []);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);

  // Omnichannel modal state
  const [omnichannelData, setOmnichannelData] = useState<OmnichannelPackage | null>(null);
  const [isGeneratingOmnichannel, setIsGeneratingOmnichannel] = useState(false);
  const [isOmnichannelModalOpen, setIsOmnichannelModalOpen] = useState(false);

  // Smart suggestions
  const [suggestions, setSuggestions] = useState<SmartAutoSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Playback timer ref
  const playbackIntervalRef = useRef<any>(null);

  // Context Guard semantic tags
  const semanticTags = extractSemanticContextTags(prompt);

  // Auto-detect sound-off intent from user prompt
  useEffect(() => {
    if (/uten lyd|silent|sound-off|sound off|lydløs|stum|infoskjerm|butikkskjerm/i.test(prompt)) {
      setIsSoundOffMode(true);
    }
  }, [prompt]);

  useEffect(() => {
    if (project) {
      try {
        localStorage.setItem("brandforge_current_videoproj", JSON.stringify(project));
      } catch {}
    }
  }, [project]);

  // Load smart suggestions on mount or when project changes
  useEffect(() => {
    fetch("/api/smart-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.suggestions) setSuggestions(data.suggestions);
      })
      .catch(() => {});
  }, [project]);

  useEffect(() => {
    if (isPlaying && project && project.scenes.length > 0) {
      const totalDur = project.totalDurationSeconds || 15;
      playbackIntervalRef.current = setInterval(() => {
        setCurrentPlayTime((prev) => {
          const next = prev + 0.1;
          if (next >= totalDur) {
            setIsPlaying(false);
            return 0;
          }
          let accum = 0;
          for (let i = 0; i < project.scenes.length; i++) {
            accum += project.scenes[i].durationSeconds;
            if (next <= accum) {
              setActiveSceneIndex(i);
              break;
            }
          }
          return next;
        });
      }, 100);
    } else {
      clearInterval(playbackIntervalRef.current);
    }
    return () => clearInterval(playbackIntervalRef.current);
  }, [isPlaying, project]);

  // Speech synthesis voiceover during video preview
  useEffect(() => {
    if (isPlaying && speechVoiceEnabled && project && project.scenes[activeSceneIndex]) {
      const text = project.scenes[activeSceneIndex].narrationVoiceover;
      if (text && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const nbVoice = voices.find((v) => v.lang.startsWith("nb") || v.lang.startsWith("no"));
        if (nbVoice) utter.voice = nbVoice;
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      }
    } else if (!isPlaying && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [isPlaying, activeSceneIndex, speechVoiceEnabled, project]);

  // Master Playback Toggle Handler
  const togglePlayback = () => {
    if (playerMode === "mp4" && renderedVideoRef.current) {
      if (renderedVideoRef.current.paused) {
        renderedVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        renderedVideoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  // Preload variants and omnichannel if missing
  useEffect(() => {
    if (project) {
      if (variantsList.length === 0 && !isGeneratingVariants) {
        fetch("/api/generate-variants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: project.strategy?.productOrService || prompt || "Digital Dayplanner" }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.variants) setVariantsList(d.variants);
          })
          .catch(() => {});
      }
      if (!omnichannelData && !isGeneratingOmnichannel) {
        fetch("/api/generate-omnichannel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: project.strategy?.productOrService || prompt || "Digital Dayplanner" }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.package) setOmnichannelData(d.package);
          })
          .catch(() => {});
      }
    }
  }, [project]);

  // Handle direct file upload for product image (PNG, JPG, WebP, SVG)
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProductImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setProductImage(b64);

      // Inject into current project if exists
      if (project) {
        const updatedScenes = project.scenes.map((sc) => ({
          ...sc,
          imageUrl: b64,
        }));
        setProject({ ...project, scenes: updatedScenes });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProductImage = () => {
    setProductImage(null);
    setProductImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (project) {
      const updatedScenes = project.scenes.map((sc) => ({
        ...sc,
        imageUrl: undefined,
      }));
      setProject({ ...project, scenes: updatedScenes });
    }
  };

  const handleStartProduction = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setRenderedVideoUrl(null);
    setValidationReport(null);

    const goalObj = CAMPAIGN_GOALS.find((g) => g.id === selectedGoal);
    const fullPrompt = `${prompt}. Mål: ${goalObj?.label || "Selge et produkt"}. ${goalObj?.promptSuffix || ""}`;

    try {
      const res = await fetch("/api/analyze-prompt-to-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          platform,
          salesFramework,
          language: "no",
          isSoundOff: isSoundOffMode,
          soundOffMode: isSoundOffMode,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Kunne ikke analysere prompt");
      }

      const data = await res.json();
      if (data.project) {
        // Enforce client-side Context Guard defense
        const sanitized = enforceContextGuardOnProject(data.project, prompt);

        // If user uploaded a product image, attach it across scenes
        if (productImage) {
          sanitized.scenes = sanitized.scenes.map((s) => ({
            ...s,
            imageUrl: productImage,
          }));
        }

        setProject(sanitized);
        setCurrentPlayTime(0);
        setActiveSceneIndex(0);

        // Sync with centralized ProjectContext single source of truth
        projectCtx.setActiveProject(sanitized);
        projectCtx.setProductContext({
          productOrService: sanitized.strategy?.productOrService || prompt,
          targetAudience: sanitized.strategy?.targetAudience,
          uniqueValueProposition: sanitized.strategy?.uniqueValueProposition,
        });

        // Automatically trigger MP4 rendering in background
        setTimeout(() => {
          handleRenderMP4(sanitized);
        }, 150);

        // Smoothly scroll down to preview stage so the user immediately sees their video!
        setTimeout(() => {
          deliverablesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 350);
      }
    } catch (err: any) {
      console.error("Video production error:", err);
      setErrorMessage(err.message || "En feil oppstod under videogenereringen.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate 10 Variants
  const handleFetchVariants = async () => {
    setIsGeneratingVariants(true);
    setIsVariantsModalOpen(true);
    try {
      const productQuery = project?.strategy?.productOrService || prompt;
      const res = await fetch("/api/generate-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.variants) {
          setVariantsList(data.variants);
        }
      }
    } catch (err) {
      console.error("Could not generate variants:", err);
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const handleSelectVariant = (variant: CampaignVariant) => {
    if (!project) return;
    const updatedScenes = variant.scenes.map((sc, idx) => ({
      ...sc,
      imageUrl: productImage || project.scenes[idx]?.imageUrl,
    }));
    setProject({
      ...project,
      salesFramework: (variant.variantType as any) || "ProblemSolutionCTA",
      scenes: updatedScenes,
      voiceoverScript: variant.scriptPreview,
      strategy: {
        ...project.strategy,
        scrollStoppingHooks: [variant.hook, ...project.strategy.scrollStoppingHooks.slice(1)],
      },
    });
    setIsVariantsModalOpen(false);
    setCurrentPlayTime(0);
    setActiveSceneIndex(0);
  };

  // Generate Omnichannel (Én Idé -> Alle Plattformer)
  const handleFetchOmnichannel = async () => {
    setIsGeneratingOmnichannel(true);
    setIsOmnichannelModalOpen(true);
    try {
      const productQuery = project?.strategy?.productOrService || prompt;
      const res = await fetch("/api/generate-omnichannel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.package) {
          setOmnichannelData(data.package);
        }
      }
    } catch (err) {
      console.error("Could not generate omnichannel package:", err);
    } finally {
      setIsGeneratingOmnichannel(false);
    }
  };

  const handleSceneTextChange = (
    index: number,
    field: "onScreenText" | "narrationVoiceover",
    val: string
  ) => {
    if (!project) return;
    const updatedScenes = [...project.scenes];
    updatedScenes[index] = { ...updatedScenes[index], [field]: val };
    setProject({ ...project, scenes: updatedScenes });
  };

  const handleRegenerateSingleScene = (index: number) => {
    if (!project) return;
    const scene = project.scenes[index];
    const updatedScenes = [...project.scenes];
    updatedScenes[index] = {
      ...scene,
      visualPrompt: `${scene.visualPrompt} (Oppdatert visuell variasjon)`,
      mood: "Forbedret Vinkel",
    };
    setProject({ ...project, scenes: updatedScenes });
  };

  const handleRenderMP4 = async (customProject?: AutonomousVideoProject) => {
    const targetProject = customProject || project;
    if (!targetProject || targetProject.scenes.length === 0) return;
    setIsRendering(true);
    setRenderProgress(10);
    setErrorMessage(null);
    setVideoPlaybackError(null);

    try {
      const interval = setInterval(() => {
        setRenderProgress((prev) => Math.min(90, prev + 15));
      }, 400);

      const res = await fetch("/api/render-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenes: targetProject.scenes,
          aspectRatio: targetProject.aspectRatio || "9:16",
          resolution: "720p",
          commercialLicense: true,
          fps: 30,
          audioMode: isSoundOffMode ? soundOffAudioMode : "silent",
          isSoundOff: isSoundOffMode,
        }),
      });

      clearInterval(interval);
      setRenderProgress(100);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "FFmpeg rendering feilet");
      }

      const data = await res.json();
      if (data.videoUrl) {
        setRenderedVideoUrl(data.videoUrl);
        setValidationReport(data.validation);
        setPlayerMode("mp4");
        projectCtx.setRenderedVideoUrl(data.videoUrl, data.validation);
        setToastMessage("Video ble rendret med FFmpeg og er klar til avspilling og nedlasting!");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err: any) {
      console.error("Render error:", err);
      setErrorMessage(err.message || "Feil under videoeksport med FFmpeg.");
    } finally {
      setIsRendering(false);
    }
  };

  const handleApproveAll = () => {
    setIsApprovedVideo(true);
    setApprovedBanners({
      "1:1": true,
      "4:5": true,
      "9:16": true,
      "16:9": true,
      "etsy-shop": true,
      "etsy-mockup": true,
    });
    setApprovedSlides({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true });
    const allVars: Record<string, boolean> = {};
    variantsList.forEach((v) => (allVars[v.id] = true));
    setApprovedVariants(allVars);
    projectCtx.approveAllDeliverables();
    setToastMessage("Alle videoer, bannere, slides og varianter er nå godkjent!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadCompleteApprovedBundleZip = async () => {
    if (!project) return;
    setIsExportingAll(true);
    try {
      const zip = new JSZip();

      // 1. Master Video MP4 (if rendered)
      if (renderedVideoUrl && renderedVideoUrl.includes(";base64,")) {
        const b64 = renderedVideoUrl.split(";base64,")[1];
        zip.file(`video/SPARK_${project.platform}_Master.mp4`, b64, { base64: true });
      }

      // 2. Subtitles SRT & VTT
      let srtText = "";
      project.subtitles.forEach((s, idx) => {
        const startS = new Date(s.startTime * 1000).toISOString().substr(11, 8) + ",000";
        const endS = new Date(s.endTime * 1000).toISOString().substr(11, 8) + ",000";
        srtText += `${idx + 1}\n${startS} --> ${endS}\n${s.text}\n\n`;
      });
      zip.file("video/undertekster.srt", srtText);
      zip.file("video/undertekster.vtt", "WEBVTT\n\n" + srtText.replace(/,/g, "."));

      // 3. Approved Banners (PNG)
      for (const formatItem of BANNER_FORMAT_LIST) {
        if (approvedBanners[formatItem.id]) {
          try {
            const canvas = await renderBannerToCanvas({
              format: formatItem.id,
              companyName,
              productTitle: project.strategy.productOrService,
              hook: project.strategy.scrollStoppingHooks[0] || "Få full kontroll over hverdagen",
              subTitle: project.strategy.uniqueValueProposition,
              ctaText: project.strategy.primaryCallToAction,
              productImage,
            });
            const blob = await canvasToBlobAsync(canvas);
            zip.file(`bannere/${formatItem.id}_${formatItem.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`, blob);
          } catch (e) {
            console.warn("Could not export banner:", formatItem.id, e);
          }
        }
      }

      // 4. Approved Carousel Slides (PNG)
      const defaultSlides = [
        { slideNumber: 1, totalSlides: 6, type: "hook" as const, badge: "HOOK", title: project.strategy.scrollStoppingHooks[0] || "Føler du at hverdagen forsvinner?", description: "Mange starter uken med de beste intensjoner, men ender opp overveldet.", highlight: "«Her er hemmeligheten som gir deg full kontroll.»" },
        { slideNumber: 2, totalSlides: 6, type: "problem" as const, badge: "PROBLEMET", title: "Hvorfor tradisjonelle løsninger feiler:", description: "Tungvinte systemer stjeler mer tid enn de sparer.", bulletPoints: project.strategy.customerPains.slice(0, 3) },
        { slideNumber: 3, totalSlides: 6, type: "solution" as const, badge: "LØSNINGEN", title: `Møt ${project.strategy.productOrService}`, description: project.strategy.uniqueValueProposition, bulletPoints: project.strategy.uniqueSellingPoints.slice(0, 3) },
        { slideNumber: 4, totalSlides: 6, type: "features" as const, badge: "INNHOLD", title: "Alt du trenger i én pakke:", description: "Nøye utformet for umiddelbare resultater.", highlight: "«Umiddelbar digital nedlasting.»" },
        { slideNumber: 5, totalSlides: 6, type: "proof" as const, badge: "BEVIS", title: "⭐⭐⭐⭐⭐ 5.0 Vurdering", description: "Brukt og elsket av hundrevis av fornøyde kunder.", highlight: "«Beste investeringen jeg har gjort for hverdagen min.»" },
        { slideNumber: 6, totalSlides: 6, type: "cta" as const, badge: "HANDLING", title: "Klar for å komme i gang?", description: "Trykk på linken for å sikre deg din i dag!", ctaButton: project.strategy.primaryCallToAction }
      ];

      for (let i = 0; i < defaultSlides.length; i++) {
        if (approvedSlides[i]) {
          try {
            const canvas = await renderCarouselSlideToCanvas(defaultSlides[i], {
              companyName,
              productTitle: project.strategy.productOrService,
              productImage,
            });
            const blob = await canvasToBlobAsync(canvas);
            zip.file(`karusell/Slide_${i + 1}_${defaultSlides[i].type}.png`, blob);
          } catch (e) {
            console.warn("Could not export carousel slide:", i, e);
          }
        }
      }

      // 5. Approved Campaign Variant Scripts
      if (variantsList.length > 0) {
        variantsList.filter((v) => approvedVariants[v.id]).forEach((v) => {
          let vTxt = `KAMPANJEVARIANT: ${v.title}\n`;
          vTxt += `Vinkel: ${v.variantType}\nStemning: ${v.targetMood}\nHook: «${v.hook}»\nCTA: ${v.cta}\n\n`;
          vTxt += `MANUS:\n${v.scriptPreview}\n\nSCENER:\n`;
          v.scenes.forEach((sc) => {
            vTxt += `[Scene ${sc.sceneNumber}] ${sc.onScreenText}\nVoiceover: «${sc.narrationVoiceover}»\n\n`;
          });
          zip.file(`manus_varianter/${v.id}_${v.variantType}.txt`, vTxt);
        });
      }

      // 6. Omnichannel Copy & Etsy Listings
      if (omnichannelData) {
        let etsyDoc = `=== ETSY LISTING & SEO GUIDE ===\n\nTittel:\n${omnichannelData.etsy.title}\n\nPris:\n${omnichannelData.etsy.priceStrategy}\n\n13 SEO Tags:\n${omnichannelData.etsy.tags.join(", ")}\n\nBeskrivelse:\n${omnichannelData.etsy.description}\n`;
        zip.file("markedsforing/Etsy_Listing_og_Tags.txt", etsyDoc);

        let socialDoc = `=== SOSIALE MEDIER PUBLISERINGSMANUS ===\n\n[TIKTOK 9:16]\nHook: ${omnichannelData.tiktok.hookFirst3s}\nManus: ${omnichannelData.tiktok.script}\nCTA: ${omnichannelData.tiktok.cta}\n\n[SNAPCHAT SPOTLIGHT]\nHook: ${omnichannelData.snapchat.hookFirst2s}\nSwipe Up: ${omnichannelData.snapchat.swipeUpCta}\n\n[YOUTUBE SHORTS]\nHook: ${omnichannelData.youtubeShorts.hook}\nPayoff: ${omnichannelData.youtubeShorts.payoff}\n\n[INSTAGRAM REEL]\nCaption: ${omnichannelData.instagram.captionWithHashtags}\n\n[FACEBOOK AD]\nOverskrift: ${omnichannelData.facebook.headline}\nAnnonsetekst: ${omnichannelData.facebook.primaryAdCopy}\nKnapp: ${omnichannelData.facebook.ctaButton}\n`;
        zip.file("markedsforing/Sosiale_Medier_Publisering.txt", socialDoc);
      }

      // 7. Full Strategy & Storyboard Markdown
      let stratMd = `# SPARK Godkjent Salgspakke: ${project.strategy.productOrService}\n\n`;
      stratMd += `## Primær USP:\n${project.strategy.uniqueValueProposition}\n\n`;
      stratMd += `## Viral Hooks:\n${project.strategy.scrollStoppingHooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n\n`;
      stratMd += `## Fullt Voiceover Manus:\n${project.voiceoverScript}\n\n`;
      stratMd += `## Primær CTA:\n${project.strategy.primaryCallToAction}\n\n`;
      stratMd += `## Anbefalte Hashtags:\n${project.strategy.recommendedHashtags.join(" ")}\n`;
      zip.file("markedsforing/Kampanjestrategi.md", stratMd);

      // 8. Project JSON
      zip.file("prosjekt/spark_prosjekt.json", JSON.stringify(project, null, 2));

      // Generate & Trigger Download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SPARK_Godkjent_Kampanje_${project.strategy.productOrService.replace(/[^a-zA-Z0-9]/g, "_")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setToastMessage("Komplett godkjent kampanjepakke ble lastet ned som ZIP!");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      console.error("Feil under eksport av godkjent pakke:", e);
      setErrorMessage("Kunne ikke eksportere ZIP-pakken.");
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleDownloadFullDeliveryZip = async () => {
    if (!project) return;
    const zip = new JSZip();

    // 1. Video master file (if rendered)
    if (renderedVideoUrl && renderedVideoUrl.includes(";base64,")) {
      const b64 = renderedVideoUrl.split(";base64,")[1];
      zip.file(`video/master_${project.platform}.mp4`, b64, { base64: true });
    }

    // 2. Subtitles SRT & VTT
    let srtText = "";
    project.subtitles.forEach((s, idx) => {
      const startS = new Date(s.startTime * 1000).toISOString().substr(11, 8) + ",000";
      const endS = new Date(s.endTime * 1000).toISOString().substr(11, 8) + ",000";
      srtText += `${idx + 1}\n${startS} --> ${endS}\n${s.text}\n\n`;
    });
    zip.file("subtitles/captions.srt", srtText);
    zip.file("subtitles/captions.vtt", "WEBVTT\n\n" + srtText.replace(/,/g, "."));

    // 3. Complete Project JSON
    zip.file("project/spark_project.json", JSON.stringify(project, null, 2));

    // 4. Standalone SVG Banners
    const banner1x1Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="#121214"/>
  <circle cx="540" cy="540" r="420" fill="#FF3B00" opacity="0.12"/>
  <rect x="60" y="60" width="960" height="960" fill="none" stroke="#FF3B00" stroke-width="4" opacity="0.3" rx="32"/>
  <text x="120" y="140" font-family="sans-serif" font-weight="900" font-size="36" fill="#FF3B00">${(companyName || "SPARK").toUpperCase()}</text>
  <text x="540" y="440" font-family="sans-serif" font-weight="900" font-size="52" fill="#FFFFFF" text-anchor="middle">${(project.strategy.scrollStoppingHooks[0] || "OPPLEV KVALITET").slice(0, 45)}</text>
  <text x="540" y="530" font-family="sans-serif" font-weight="500" font-size="28" fill="#D4D4D8" text-anchor="middle">${(project.strategy.uniqueValueProposition || "").slice(0, 60)}</text>
  <rect x="290" y="800" width="500" height="100" fill="#FF3B00" rx="16"/>
  <text x="540" y="862" font-family="sans-serif" font-weight="900" font-size="32" fill="#000000" text-anchor="middle">${(project.strategy.primaryCallToAction || "BESTILL NÅ").slice(0, 28).toUpperCase()}</text>
</svg>`;
    zip.file("banners/ad_banner_1080x1080.svg", banner1x1Svg);

    // 5. Scene Breakdown JSON
    zip.file("scenes/scenes_breakdown.json", JSON.stringify(project.scenes, null, 2));

    // 6. Campaign Strategy Guide
    const strategyDoc = `
# ${project.strategy.productOrService} • SPARK Commercial Marketing Package
Produced with SPARK Autonomous Production Studio.

## Campaign Goal:
${CAMPAIGN_GOALS.find((g) => g.id === selectedGoal)?.label || "Få flere bestillinger"}

## Target Audience:
${project.strategy.targetAudience}

## Customer Pains:
${project.strategy.customerPains.map((p) => `- ${p}`).join("\n")}

## Unique Value Proposition (USP):
${project.strategy.uniqueValueProposition}

## 3 Scroll-Stopping Viral Hooks:
${project.strategy.scrollStoppingHooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}

## Narration Voiceover Script:
${project.voiceoverScript}

## Primary Call To Action (CTA):
${project.strategy.primaryCallToAction}

## Publishing Ad Copy Variants:
${project.strategy.adCopyVariants.map((v, i) => `Variant ${i + 1} (${v.headline}):\n${v.primaryText}\nCTA: ${v.ctaText}\n`).join("\n")}

## Recommended Hashtags:
${project.strategy.recommendedHashtags.join(" ")}
`.trim();

    zip.file("strategy/sales_campaign_guide.md", strategyDoc);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SPARK_${project.platform}_Full_Campaign.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeScene = project?.scenes[activeSceneIndex] || project?.scenes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. MASTER HERO INPUT: «Hva vil du lage eller selge?» */}
      <div className="bg-[#141416] border-2 border-[#333] hover:border-[#FF3B00]/60 p-6 sm:p-8 space-y-6 shadow-2xl relative transition-all rounded">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF3B00] text-black font-black flex items-center justify-center text-lg shadow-[0_0_15px_rgba(255,59,0,0.4)]">
              ⚡
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Hva vil du lage eller selge?</span>
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Én enkel setning starter hele prosessen: SPARK analyserer produkt, marked, målgruppe og videoformater automatisk.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% KOMPLETT &amp; GRATIS LOKALT</span>
            </span>
          </div>
        </div>

        {/* The Master Input Box & Step-by-Step Workflow */}
        <div className="space-y-3">
          {/* Step Workflow Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-[#222] pb-2">
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 font-bold ${prompt.trim().length >= 2 ? "text-emerald-400" : "text-[#FF3B00]"}`}>
                <span className="w-5 h-5 rounded-full bg-[#1C1C1E] border border-current flex items-center justify-center text-[10px]">1</span>
                <span>Skriv produkt / idé</span>
                {prompt.trim().length >= 2 && <Check className="w-3.5 h-3.5" />}
              </span>
              <span className="text-zinc-600">➔</span>
              <span className={`flex items-center gap-1.5 font-bold ${prompt.trim().length >= 2 ? "text-[#FF3B00] animate-pulse" : "text-zinc-500"}`}>
                <span className="w-5 h-5 rounded-full bg-[#1C1C1E] border border-current flex items-center justify-center text-[10px]">2</span>
                <span>Trykk Produser</span>
              </span>
              <span className="text-zinc-600">➔</span>
              <span className="flex items-center gap-1.5 text-zinc-500 font-bold hidden sm:flex">
                <span className="w-5 h-5 rounded-full bg-[#1C1C1E] border border-zinc-700 flex items-center justify-center text-[10px]">3</span>
                <span>Se video &amp; salgspakke</span>
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 hidden md:inline">Ctrl + Enter for hurtigstart</span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (prompt.trim().length >= 2 && !isGenerating) {
                    handleStartProduction();
                  }
                }
              }}
              placeholder="F.eks: «Jeg vil selge en digital dayplanner for iPad og GoodNotes på Etsy.» eller «Lag en TikTok som selger en printable meal planner.»..."
              className="w-full bg-[#0D0D0F] border-2 border-[#333] focus:border-[#FF3B00] p-4 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none rounded font-medium leading-relaxed transition-colors shadow-inner"
            />
          </div>

          {/* Prominent Next Step Call-To-Action Command Box */}
          <div
            className={`p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 ${
              prompt.trim().length >= 2
                ? "bg-gradient-to-r from-[#20100C] via-[#16161A] to-[#20100C] border-[#FF3B00] shadow-[0_0_35px_rgba(255,59,0,0.4)]"
                : "bg-[#101012] border-zinc-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                      prompt.trim().length >= 2
                        ? "bg-[#FF3B00] shadow-[0_0_12px_#FF3B00] animate-ping"
                        : "bg-zinc-600"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-mono font-black uppercase text-white tracking-wider">
                    {prompt.trim().length >= 2
                      ? "⚡ STEG 2: KLIKK HER FOR Å STARTE FULL PRODUKSJON"
                      : "STEG 1: SKRIV INN HVA DU VIL SELGE I FELTET OVER"}
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-300">
                  {prompt.trim().length >= 2
                    ? "Tekst er registrert! Trykk på den store oransje knappen til høyre (eller trykk Ctrl+Enter) for å produsere video, manus og kampanje."
                    : "Skriv f.eks. «Digital dayplanner» eller klikk et av de raske eksemplene under for å fylle inn med ett klikk."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartProduction}
                disabled={isGenerating || prompt.trim().length < 2}
                className={`px-7 py-4 rounded-xl font-black uppercase text-xs sm:text-sm font-mono tracking-wider flex items-center justify-center gap-3 transition-all duration-200 shrink-0 ${
                  prompt.trim().length >= 2
                    ? "bg-[#FF3B00] hover:bg-white text-black hover:scale-[1.04] active:scale-[0.96] shadow-2xl shadow-[#FF3B00]/50 cursor-pointer animate-pulse"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700 opacity-60"
                }`}
                title="Start full autonom videoproduksjon fra teksten du oppga"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-black" />
                    <span>AI PRODUSERER VIDEOEN...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-black" />
                    <span>PRODUSER VIDEO NÅ ➔</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Prompt Example Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF3B00]" />
                <span>Raske eksempler (klikk for å fylle inn automatisk):</span>
              </span>
              <span className="text-zinc-500">Klar til bruk</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
              {USER_EXAMPLE_PROMPTS.map((pText, pIdx) => {
                const clean = pText.replace(/[«»]/g, "");
                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setPrompt(clean)}
                    className="shrink-0 px-3.5 py-2 bg-[#18181A] hover:bg-[#FF3B00] hover:text-black hover:border-[#FF3B00] hover:scale-105 active:scale-95 border border-[#2D2D32] text-zinc-200 rounded cursor-pointer transition-all whitespace-nowrap text-[11px] font-medium shadow-sm"
                  >
                    {pText}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Context Guard Protection Indicator */}
        <div className="p-3 bg-[#0A0A0C] border border-[#262626] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-white">Kontekst-vakt (Intent Guard):</span>
            <span className="text-zinc-400">Tillatte temaer:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {semanticTags.slice(0, 4).map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#1A1A1E] text-zinc-200 border border-zinc-700 text-[10px] rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Uvedkommende emner (hudpleie, bil, gaming) er blokkert</span>
          </div>
        </div>

        {/* Product Image Uploader (Produktbilde til video) */}
        <div className="p-4 bg-[#101012] border border-[#262626] rounded space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#FF3B00]" />
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Legg til eget produktbilde (PNG, JPG, WebP, SVG):
              </label>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Valgfritt — bildet brukes som faktisk asset i videoen
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleProductImageUpload}
              className="hidden"
              id="product-image-upload"
            />
            <label
              htmlFor="product-image-upload"
              className="px-4 py-2 bg-[#1C1C1E] hover:bg-[#252528] border border-[#333] hover:border-[#FF3B00] text-xs font-mono text-white rounded cursor-pointer transition-colors flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF3B00]" />
              <span>Velg produktbilde fra PC</span>
            </label>

            {productImage && (
              <div className="flex items-center gap-3 p-1.5 bg-[#18181A] border border-emerald-500/40 rounded">
                <img
                  src={productImage}
                  alt="Produkt"
                  className="w-10 h-10 object-contain bg-black rounded"
                />
                <span className="text-xs font-mono text-emerald-400 truncate max-w-[200px]">
                  {productImageName || "eget_produkt.png"}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveProductImage}
                  className="p-1 hover:text-red-400 text-zinc-400 cursor-pointer"
                  title="Fjern bilde"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Reklame Uten Lyd (Sound-Off Optimalisering) Panel */}
        <div className={`p-4 rounded-xl border transition-all ${
          isSoundOffMode 
            ? "bg-gradient-to-r from-[#18181A] via-[#1F1614] to-[#18181A] border-[#FF3B00] shadow-[0_0_20px_rgba(255,59,0,0.15)]"
            : "bg-[#101012] border-[#262626]"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSoundOffMode ? "bg-[#FF3B00] text-black" : "bg-zinc-800 text-zinc-400"
              }`}>
                <VolumeX className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                    🔇 Reklame Uten Lyd (Sound-Off Optimalisering)
                  </span>
                  {isSoundOffMode && (
                    <span className="px-2 py-0.5 bg-[#FF3B00]/20 border border-[#FF3B00]/50 text-[#FF3B00] text-[9px] font-mono font-bold rounded-full">
                      AKTIV
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Over 85% ser video i sosiale medier uten lyd. Optimaliserer med store tekstplakater, fargerike nøkkelord og tydelig visuell CTA.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSoundOffMode(!isSoundOffMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSoundOffMode
                    ? "bg-[#FF3B00] text-black shadow-md shadow-[#FF3B00]/30 hover:bg-white"
                    : "bg-[#1C1C1E] border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                }`}
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>{isSoundOffMode ? "Lydløs PÅ" : "Slå PÅ Lydløs"}</span>
              </button>
            </div>
          </div>

          {isSoundOffMode && (
            <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-[11px]">Lydspor-eksport:</span>
                <button
                  type="button"
                  onClick={() => setSoundOffAudioMode("silent")}
                  className={`px-2.5 py-1 rounded text-[10px] border transition-all cursor-pointer ${
                    soundOffAudioMode === "silent"
                      ? "bg-[#FF3B00]/20 border-[#FF3B00] text-[#FF3B00] font-bold"
                      : "bg-[#141416] border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                  title="Genererer et dempet AAC-spor slik at videoen godkjennes av Meta og TikTok"
                >
                  Dempet AAC (Meta / TikTok)
                </button>
                <button
                  type="button"
                  onClick={() => setSoundOffAudioMode("none")}
                  className={`px-2.5 py-1 rounded text-[10px] border transition-all cursor-pointer ${
                    soundOffAudioMode === "none"
                      ? "bg-[#FF3B00]/20 border-[#FF3B00] text-[#FF3B00] font-bold"
                      : "bg-[#141416] border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                  title="Fjerner lydsporet helt (-an) for butikk- og infoskjermer"
                >
                  100% Uten lydspor (-an)
                </button>
              </div>

              <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 ml-auto">
                <Check className="w-3.5 h-3.5" />
                <span>Forankret i faktiske produktattributter – ingen overdrevne påstander</span>
              </div>
            </div>
          )}
        </div>

        {/* Video Presets Bar (All video platforms) */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            Velg Plattform-format &amp; Presets:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {VIDEO_PRESETS.map((preset) => {
              const isSelected = platform === preset.id || selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setPlatform(preset.id as any);
                    setSelectedPresetId(preset.id);
                    if (preset.id === "sound-off-social" || preset.id === "digital-signage") {
                      setIsSoundOffMode(true);
                    }
                  }}
                  className={`p-2.5 border text-center transition-all cursor-pointer rounded hover:scale-105 active:scale-95 ${
                    isSelected
                      ? "bg-[#1C1C1E] border-[#FF3B00] text-white shadow-md shadow-[#FF3B00]/20 font-bold"
                      : "bg-[#101012] border-[#262626] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">{preset.label}</div>
                  <div className="text-[9px] font-mono text-zinc-500 mt-0.5">{preset.ratio}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button: Start Autopilot */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStartProduction}
            disabled={isGenerating || prompt.trim().length < 2}
            className={`flex-1 py-4 px-6 font-black uppercase text-xs sm:text-sm font-mono tracking-wider flex items-center justify-center gap-3 transition-all rounded shadow-xl ${
              prompt.trim().length >= 2
                ? "bg-[#FF3B00] hover:bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[#FF3B00]/30 cursor-pointer"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700 opacity-60"
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-black" />
                <span>Analyserer og produserer video...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-black" />
                <span>Kjør Full Videoproduksjon Fra Tekst ➔</span>
              </>
            )}
          </button>

          {/* Quick Action: Generer 10 Varianter */}
          <button
            type="button"
            onClick={handleFetchVariants}
            className="py-3 px-4 bg-[#1C1C1E] hover:bg-[#252528] border border-[#FF3B00]/60 hover:border-[#FF3B00] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 rounded"
          >
            <SplitSquareVertical className="w-4 h-4 text-[#FF3B00]" />
            <span>Generer 10 Varianter</span>
          </button>

          {/* Quick Action: Én Idé -> Alle Plattformer */}
          <button
            type="button"
            onClick={handleFetchOmnichannel}
            className="py-3 px-4 bg-[#1C1C1E] hover:bg-[#252528] border border-cyan-500/60 hover:border-cyan-400 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 rounded"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Én Idé → Alle Plattformer</span>
          </button>
        </div>
      </div>

      {/* Smart Suggestions Bar («Hva bør jeg lage nå?») */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="p-4 bg-[#101012] border border-[#262626] rounded space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase text-white">
                Autoforslag // Hva bør jeg lage nå?
              </span>
            </div>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
            >
              Skjul
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="p-3 bg-[#161618] border border-[#262626] rounded space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono text-zinc-400">{sug.triggerCondition}</div>
                  <div className="text-xs text-white mt-1 leading-snug">{sug.recommendation}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (sug.actionType === "generate-variants") handleFetchVariants();
                    else if (sug.actionType === "create-etsy-video") {
                      setPlatform("etsy-product-video" as any);
                      handleStartProduction();
                    } else if (sug.actionType === "create-shorts") {
                      setPlatform("youtube-short" as any);
                      handleStartProduction();
                    } else {
                      handleFetchOmnichannel();
                    }
                  }}
                  className="mt-2 w-full py-1.5 px-2 bg-[#222] hover:bg-[#FF3B00] text-zinc-200 hover:text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded transition-colors text-center cursor-pointer"
                >
                  {sug.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 rounded">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#141416] border-2 border-[#FF3B00] text-white shadow-2xl rounded-lg flex items-center gap-3 text-xs font-mono animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Deliverables Workspace */}
      {project && (
        <div ref={deliverablesSectionRef} id="deliverables-section" className="space-y-6">
          {/* AI Production Success Alert Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-[#16161A] to-emerald-950/80 border-2 border-emerald-500/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-white font-black uppercase flex items-center gap-2 tracking-wide">
                  <span>✅ AI-PRODUKSJON FULLFØRT! FORHÅNDSVISNINGEN ER KLAR</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500 text-black font-black rounded">
                    LIVE
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] mt-0.5">
                  Klikk direkte på videoskjermen under for å starte/stoppe avspilling. Du kan også bytte til ferdig rendret MP4 eller redigere storyboardet.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={togglePlayback}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs font-mono rounded-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/30"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? "Pause Video" : "Spill av Nå ➔"}</span>
              </button>
            </div>
          </div>
          {/* Global Campaign Approval Bar */}
          <div className="bg-[#121215] border-2 border-emerald-500/70 p-4 sm:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black uppercase text-white font-mono">
                    Kampanjegodkjenning // {
                      (isApprovedVideo ? 1 : 0) +
                      Object.values(approvedBanners).filter(Boolean).length +
                      Object.values(approvedSlides).filter(Boolean).length +
                      Object.values(approvedVariants).filter(Boolean).length
                    } elementer godkjent
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                    KLAR FOR SALG &amp; NEDLASTING
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">
                  Forhåndsvis videoer, annonsebannere og karusellinnlegg nedenfor. Godkjenn favorittene og last ned alt i én ferdig ZIP-pakke.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleApproveAll}
                className="px-3.5 py-2 bg-[#1C1C20] hover:bg-[#282830] text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono uppercase font-bold rounded cursor-pointer transition-colors"
              >
                ✓ Godkjenn Alt
              </button>

              <button
                type="button"
                onClick={handleDownloadCompleteApprovedBundleZip}
                disabled={isExportingAll}
                className="px-4 py-2 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono tracking-wider flex items-center gap-2 rounded transition-all cursor-pointer shadow-lg shadow-[#FF3B00]/25 disabled:opacity-50"
              >
                {isExportingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Pakker godkjent pakke...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-black" />
                    <span>Last ned ALT godkjent (ZIP)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Deliverables Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#222] pb-3 text-xs font-mono uppercase overflow-x-auto">
            <button
              onClick={() => setDeliverablesTab("video")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 rounded ${
                deliverablesTab === "video"
                  ? "bg-white text-black font-bold border-white"
                  : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Hovedfilm &amp; Spiller ({project.totalDurationSeconds}s)</span>
              {isApprovedVideo && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setDeliverablesTab("banners")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 rounded ${
                deliverablesTab === "banners"
                  ? "bg-white text-black font-bold border-white"
                  : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Annonsebannere (6 Formater)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded ml-0.5">
                {Object.values(approvedBanners).filter(Boolean).length}
              </span>
            </button>

            <button
              onClick={() => setDeliverablesTab("carousel")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 rounded ${
                deliverablesTab === "carousel"
                  ? "bg-white text-black font-bold border-white"
                  : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Karusellinnlegg (6 Slides)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded ml-0.5">
                {Object.values(approvedSlides).filter(Boolean).length}
              </span>
            </button>

            <button
              onClick={() => setDeliverablesTab("omnichannel")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 rounded ${
                deliverablesTab === "omnichannel"
                  ? "bg-cyan-500 text-black font-bold border-cyan-500"
                  : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Alle Plattformer (Omnichannel)</span>
            </button>

            <button
              onClick={() => setDeliverablesTab("ab-test")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 rounded ${
                deliverablesTab === "ab-test"
                  ? "bg-white text-black font-bold border-white"
                  : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>A/B-Testvarianter ({variantsList.length > 0 ? variantsList.length : 10})</span>
            </button>

            <button
              onClick={() => setDeliverablesTab("copy")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 rounded ${
                deliverablesTab === "copy"
                  ? "bg-white text-black font-bold border-white"
                  : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Publiseringsmanus &amp; Copy</span>
            </button>

            {onOpenTimeline && (
              <button
                onClick={() => onOpenTimeline(project)}
                className="ml-auto px-3 py-1.5 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap rounded"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Åpne i Flerspors Tidslinje</span>
              </button>
            )}
          </div>

          {/* TAB 1: Main Video & Scene plan */}
          {deliverablesTab === "video" && (() => {
            const sceneThemes = [
              {
                bg: "from-[#1E1B4B] via-[#0F172A] to-[#E11D48]/85",
                accent: "#FF3B00",
                badge: "HOOK // STOPP SCROLLEN",
                glow: "rgba(255, 59, 0, 0.4)",
                icon: "🔥",
              },
              {
                bg: "from-[#3B0764] via-[#1E1B4B] to-[#00E5FF]/80",
                accent: "#00E5FF",
                badge: "LØSNING // UNIK VERDI",
                glow: "rgba(0, 229, 255, 0.4)",
                icon: "✨",
              },
              {
                bg: "from-[#7C2D12] via-[#2A0845] to-[#F59E0B]/80",
                accent: "#F59E0B",
                badge: "BEVIS // SOSIAL TILLIT",
                glow: "rgba(245, 158, 11, 0.4)",
                icon: "⭐",
              },
              {
                bg: "from-[#064E3B] via-[#0F172A] to-[#10B981]/80",
                accent: "#10B981",
                badge: "RESULTAT // FORDEL",
                glow: "rgba(16, 185, 129, 0.4)",
                icon: "🚀",
              },
              {
                bg: "from-[#0F172A] via-[#1E1B4B] to-[#FF3B00]/85",
                accent: "#FF3B00",
                badge: "HANDLING // KJØP NÅ",
                glow: "rgba(255, 59, 0, 0.45)",
                icon: "⚡",
              },
            ];
            const currentTheme = sceneThemes[activeSceneIndex % sceneThemes.length];

            return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Player Stage */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#141416] border border-[#262626] p-4 space-y-3 rounded-lg shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#252528] pb-2">
                    {/* Player Mode Switcher */}
                    <div className="flex items-center gap-1 bg-[#1C1C1E] p-1 rounded-lg border border-[#333]">
                      <button
                        type="button"
                        onClick={() => setPlayerMode("interactive")}
                        className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          playerMode === "interactive"
                            ? "bg-[#FF3B00] text-black shadow-md shadow-[#FF3B00]/30"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        ✨ Forhåndsvisning
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (renderedVideoUrl) {
                            setPlayerMode("mp4");
                          } else {
                            handleRenderMP4();
                          }
                        }}
                        className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
                          playerMode === "mp4"
                            ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30"
                            : renderedVideoUrl
                            ? "text-zinc-200 hover:text-white bg-emerald-950/40 border border-emerald-500/30"
                            : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                        }`}
                        title={renderedVideoUrl ? "Spill av ekte rendret MP4" : "Trykk for å generere ekte MP4 video nå"}
                      >
                        <span>🎬 Rendret MP4</span>
                        {renderedVideoUrl ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ) : isRendering ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-[#FF3B00]" />
                        ) : null}
                      </button>

                      {!renderedVideoUrl && (
                        <button
                          type="button"
                          onClick={() => handleRenderMP4()}
                          disabled={isRendering}
                          className="px-2.5 py-1.5 text-[10px] font-mono font-bold bg-[#FF3B00] hover:bg-white text-black rounded transition-all flex items-center gap-1 cursor-pointer shadow-sm shadow-[#FF3B00]/30 hover:scale-105 active:scale-95"
                          title="Trykk her for å rendre videoen til ekte MP4 og spille den av direkte i appen"
                        >
                          {isRendering ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-black" />
                              <span>{renderProgress}%</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-black" />
                              <span>Rendre Nå</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Video Approval Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !isApprovedVideo;
                          setIsApprovedVideo(nextVal);
                          projectCtx.setVideoApproved(nextVal);
                        }}
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded uppercase flex items-center gap-1 transition-colors cursor-pointer ${
                          isApprovedVideo
                            ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                            : "bg-[#1C1C1E] text-zinc-400 hover:text-white border border-[#333]"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isApprovedVideo ? "Godkjent Video" : "Godkjenn"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSafeZones(!showSafeZones)}
                        className={`px-2 py-0.5 text-[10px] font-mono border cursor-pointer rounded ${
                          showSafeZones
                            ? "bg-[#FF3B00]/20 border-[#FF3B00] text-[#FF3B00]"
                            : "bg-[#1C1C1E] border-[#333] text-zinc-400"
                        }`}
                      >
                        Safe Zones
                      </button>
                      <select
                        value={selectedSafeZonePlatform}
                        onChange={(e) => setSelectedSafeZonePlatform(e.target.value as any)}
                        className="bg-[#1C1C1E] border border-[#333] text-[10px] text-zinc-300 px-1 py-0.5 font-mono rounded"
                      >
                        <option value="tiktok">TikTok</option>
                        <option value="reels">Reels</option>
                        <option value="shorts">Shorts</option>
                      </select>
                    </div>
                  </div>

                  {/* MP4 Ready Notification Callout */}
                  {renderedVideoUrl && playerMode !== "mp4" && (
                    <div className="p-3 bg-gradient-to-r from-emerald-950 via-[#16161A] to-emerald-950 border border-emerald-500/70 rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-emerald-300 shadow-xl">
                      <div className="flex items-center gap-2.5">
                        <Film className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                        <span className="font-bold">Ekte H.264 MP4-video er ferdig rendret!</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPlayerMode("mp4")}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/30 shrink-0"
                      >
                        Se MP4 Spiller ➔
                      </button>
                    </div>
                  )}

                  {/* Player Canvas Display / MP4 Player Display */}
                  {renderedVideoUrl && playerMode === "mp4" ? (
                    <div className="relative aspect-[9/16] bg-black border-2 border-emerald-500/40 rounded-lg overflow-hidden flex items-center justify-center shadow-2xl group">
                      {videoPlaybackError ? (
                        <div className="p-6 text-center space-y-3 z-20">
                          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                          <p className="text-xs font-mono text-zinc-300">{videoPlaybackError}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoPlaybackError(null);
                              handleRenderMP4();
                            }}
                            className="px-3.5 py-1.5 bg-[#FF3B00] hover:bg-[#e03400] text-black text-xs font-bold font-mono uppercase rounded cursor-pointer transition-colors shadow-lg"
                          >
                            Rendre på nytt med FFmpeg
                          </button>
                        </div>
                      ) : (
                        <>
                          <video
                            ref={renderedVideoRef}
                            src={renderedVideoUrl}
                            controls
                            autoPlay
                            muted={isMuted}
                            playsInline
                            loop
                            onClick={togglePlayback}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={(e) => {
                              if (playerMode === "mp4") {
                                setCurrentPlayTime((e.target as HTMLVideoElement).currentTime);
                              }
                            }}
                            onError={() => {
                              setVideoPlaybackError("Klarte ikke laste MP4-strømmen. Trykk nedenfor for å generere på nytt.");
                            }}
                            className="w-full h-full object-contain cursor-pointer"
                          />

                          {/* Quick Audio & Status Overlay */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-30">
                            <button
                              type="button"
                              onClick={() => {
                                const nextMuted = !isMuted;
                                setIsMuted(nextMuted);
                                if (renderedVideoRef.current) {
                                  renderedVideoRef.current.muted = nextMuted;
                                }
                              }}
                              className="px-2.5 py-1 bg-black/80 hover:bg-black text-white text-[10px] font-mono rounded-full border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:border-[#FF3B00] hover:scale-105 active:scale-95"
                              title={isMuted ? "Skru på video-lyd" : "Skru av video-lyd"}
                            >
                              {isMuted ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Lyd AV</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Lyd PÅ</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="absolute bottom-3 left-3 z-30 pointer-events-none">
                            <span className="px-2.5 py-0.5 bg-black/80 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono rounded-full backdrop-blur-md shadow-md">
                              ● 60 FPS • H.264 MP4
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={togglePlayback}
                      className={`relative aspect-[9/16] bg-gradient-to-br ${currentTheme.bg} border-2 border-white/20 hover:border-[#FF3B00] rounded-xl overflow-hidden flex flex-col justify-between p-4 shadow-2xl transition-all duration-500 select-none cursor-pointer group`}
                      style={{
                        boxShadow: `0 0 35px ${currentTheme.glow}`,
                      }}
                      title="Klikk hvor som helst på videoen for å spille av eller pause"
                    >
                      {/* Big Interactive Central Play/Pause Overlay */}
                      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-all">
                        {!isPlaying ? (
                          <div className="flex flex-col items-center gap-2 animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-black/80 border-2 border-[#FF3B00] text-[#FF3B00] flex items-center justify-center shadow-[0_0_35px_rgba(255,59,0,0.6)] group-hover:scale-110 group-hover:bg-[#FF3B00] group-hover:text-black transition-all duration-200">
                              <Play className="w-8 h-8 fill-current ml-1" />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-black/80 border border-white/20 text-[10px] font-mono font-bold text-white uppercase tracking-wider backdrop-blur-md shadow-lg group-hover:border-[#FF3B00] transition-colors">
                              Klikk for å spille av video ➔
                            </span>
                          </div>
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full bg-black/70 border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                            <Pause className="w-3.5 h-3.5 text-[#FF3B00]" />
                            <span>Trykk for å pause</span>
                          </div>
                        )}
                      </div>
                      {/* Safe zones overlay */}
                      {showSafeZones && (
                        <div className="absolute inset-0 pointer-events-none z-20">
                          <div className="absolute top-0 left-0 right-0 h-16 bg-red-500/10 border-b border-red-500/30 flex items-center justify-center text-[9px] font-mono text-red-300 uppercase">
                            Sikker Header-sone
                          </div>
                          {selectedSafeZonePlatform === "tiktok" && (
                            <div className="absolute top-28 right-0 bottom-24 w-16 bg-red-500/10 border-l border-red-500/30 flex flex-col items-center justify-around py-4 text-[9px] font-mono text-red-300">
                              <div>👤</div>
                              <div>❤️</div>
                              <div>💬</div>
                              <div>↗️</div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 h-24 bg-red-500/10 border-t border-red-500/30 flex items-end p-2 text-[9px] font-mono text-red-300">
                            Tekstfelt / Sikker Bunn
                          </div>
                        </div>
                      )}

                      {/* Top Story/Reels Scene Bars */}
                      <div className="relative z-10 w-full flex items-center gap-1.5 pt-1">
                        {project.scenes.map((sc, sIdx) => {
                          const isPast = sIdx < activeSceneIndex;
                          const isCurrent = sIdx === activeSceneIndex;
                          return (
                            <div
                              key={sc.id || sIdx}
                              className="h-1.5 flex-1 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm"
                            >
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isPast
                                    ? "bg-white w-full"
                                    : isCurrent
                                    ? "bg-[#FF3B00] w-full animate-pulse"
                                    : "w-0"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Logo, Scene Badge & Time Bar */}
                      <div className="relative z-10 flex items-center justify-between mt-2">
                        <div className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-white/20 text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1.5 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-[#FF3B00] animate-ping" />
                          <span>{companyName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-white bg-black/70 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-md">
                            {currentPlayTime.toFixed(1)}s / {project.totalDurationSeconds}s
                          </span>
                        </div>
                      </div>

                      {/* Center Visual Mockup & Dynamic Billboard */}
                      <div className="relative z-10 my-auto text-center space-y-3 px-2 flex flex-col items-center justify-center">
                        {productImage ? (
                          <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-black/60 backdrop-blur-md rounded-2xl p-3 border-2 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-pulse">
                            <img
                              src={productImage}
                              alt="Produkt Mockup"
                              className="w-full h-full object-contain rounded-xl"
                            />
                            <span className="absolute bottom-2 right-2 text-[9px] font-mono bg-[#FF3B00] px-2 py-0.5 text-black font-black uppercase rounded shadow">
                              Eget produkt
                            </span>
                          </div>
                        ) : (
                          <div className="relative w-44 h-44 rounded-2xl bg-black/65 backdrop-blur-md border-2 border-white/25 flex flex-col items-center justify-center p-3 shadow-2xl space-y-1.5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF3B00] to-amber-400 flex items-center justify-center text-xl font-black text-black shadow-lg">
                              {currentTheme.icon}
                            </div>
                            <span className="text-[11px] font-black uppercase text-white font-mono tracking-wider">
                              {effectiveCompanyName}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-300">
                              {project?.strategy?.productOrService?.slice(0, 30) || "Kommersiell Reklame"}
                            </span>
                            <span className="text-[8px] font-mono uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                              Verifisert Format
                            </span>
                          </div>
                        )}

                        {/* Scene Tag Pill */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/80 backdrop-blur-md text-white border border-white/20 rounded-full text-[10px] font-mono font-bold tracking-wider shadow-lg">
                          <span className="text-[#FF3B00] font-black">SCENE {activeSceneIndex + 1}/{project.scenes.length}</span>
                          <span className="text-white/40">•</span>
                          <span className="text-zinc-200">{currentTheme.badge}</span>
                        </div>

                        {/* Sound-Off Mode Floating Badge */}
                        {isSoundOffMode && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-black border border-black rounded-full text-[10px] font-mono font-black uppercase tracking-wider shadow-xl animate-pulse">
                            <VolumeX className="w-3 h-3 text-black" />
                            <span>🔇 Reklame Uten Lyd (Sound-Off)</span>
                          </div>
                        )}

                        {/* On Screen Headline */}
                        <div className={`transition-all ${
                          isSoundOffMode
                            ? "inline-block px-5 py-2.5 bg-yellow-400 text-black font-black uppercase text-sm tracking-wider rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.5)] border-2 border-black"
                            : "inline-block px-3.5 py-1.5 bg-[#FF3B00] text-black font-black uppercase text-xs tracking-wider rounded-lg shadow-2xl animate-fade-in"
                        }`}>
                          {activeScene?.onScreenText || "SCENE VISUELL HOOK"}
                        </div>

                        {/* Narration Script Bubble */}
                        <div className="bg-black/75 backdrop-blur-md border border-white/20 rounded-xl p-2.5 max-w-[280px] shadow-xl">
                          <p className="text-xs text-white font-medium drop-shadow-md leading-relaxed">
                            {isSoundOffMode ? `📢 [Undertekst / Visuelt budskap]: ${activeScene?.narrationVoiceover || activeScene?.onScreenText}` : `«${activeScene?.narrationVoiceover}»`}
                          </p>
                        </div>

                        {/* Soundwave or Sound-Off Visualizer */}
                        {isSoundOffMode ? (
                          <div className="px-3 py-1 bg-black/80 border border-yellow-500/40 rounded-full flex items-center gap-1.5 shadow-sm">
                            <VolumeX className="w-3 h-3 text-yellow-400" />
                            <span className="text-[9px] font-mono font-bold text-yellow-300">
                              Visuell lesbarhet: 100% optimalisert for mute
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 h-5 pt-1">
                            {[...Array(14)].map((_, idx) => (
                              <div
                                key={idx}
                                className="w-1 bg-[#FF3B00] rounded-full transition-all duration-150"
                                style={{
                                  height: isPlaying ? `${Math.max(4, Math.sin((currentPlayTime * 6) + idx) * 18)}px` : "4px",
                                  opacity: isPlaying ? 0.9 : 0.4
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CTA Bottom Banner */}
                      <div className="relative z-10 mb-16 text-center">
                        <div className="px-4 py-2 bg-white text-black font-black uppercase text-xs tracking-wider rounded-xl shadow-2xl inline-flex items-center gap-2 hover:scale-105 transition-transform">
                          <span>{(project.strategy.primaryCallToAction || "KJØP NÅ").slice(0, 32)}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#FF3B00]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Playhead & Controls */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveSceneIndex(Math.max(0, activeSceneIndex - 1))}
                      disabled={activeSceneIndex === 0}
                      className="p-2.5 bg-[#1C1C1E] text-zinc-300 hover:text-white hover:border-zinc-500 border border-[#333] rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                      title="Forrige scene"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlayback}
                      className="p-2.5 px-4 bg-[#FF3B00] hover:bg-white text-black font-black rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#FF3B00]/30 flex items-center gap-1.5"
                      title={isPlaying ? "Pause avspilling" : "Start avspilling"}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      <span className="text-[11px] font-mono uppercase">{isPlaying ? "Pause" : "Spill"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSceneIndex(Math.min(project.scenes.length - 1, activeSceneIndex + 1))}
                      disabled={activeSceneIndex >= project.scenes.length - 1}
                      className="p-2.5 bg-[#1C1C1E] text-zinc-300 hover:text-white hover:border-zinc-500 border border-[#333] rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                      title="Neste scene"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    <div className="flex-1 px-2">
                      <input
                        type="range"
                        min="0"
                        max={project.totalDurationSeconds || 15}
                        step="0.1"
                        value={currentPlayTime}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setCurrentPlayTime(val);
                          if (playerMode === "mp4" && renderedVideoRef.current) {
                            renderedVideoRef.current.currentTime = val;
                          }
                        }}
                        className="w-full accent-[#FF3B00] cursor-pointer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSoundOffMode(!isSoundOffMode)}
                      className={`px-2.5 py-2 text-[10px] font-mono rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                        isSoundOffMode
                          ? "bg-yellow-400 text-black border-yellow-400 font-black shadow-sm"
                          : "bg-[#1C1C1E] border-[#333] text-zinc-400 hover:text-white"
                      }`}
                      title="Slå av eller på lydløs annonseoptimalisering"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{isSoundOffMode ? "Lydløs: PÅ" : "Lydløs: AV"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpeechVoiceEnabled(!speechVoiceEnabled)}
                      className={`px-2.5 py-2 text-[10px] font-mono rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                        speechVoiceEnabled
                          ? "bg-[#FF3B00]/25 border-[#FF3B00] text-[#FF3B00] font-bold"
                          : "bg-[#1C1C1E] border-[#333] text-zinc-400 hover:text-white"
                      }`}
                      title="Automatisk opplesning av voiceover via nettleserens talesyntese"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{speechVoiceEnabled ? "Tale PÅ" : "Tale AV"}</span>
                    </button>
                  </div>

                  {/* Export Actions */}
                  <div className="pt-3 border-t border-[#222] space-y-2">
                    <button
                      onClick={() => handleRenderMP4()}
                      disabled={isRendering}
                      className="w-full py-3 bg-[#1C1C1E] border border-[#FF3B00] hover:bg-[#FF3B00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] rounded shadow-sm"
                    >
                      {isRendering ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#FF3B00]" />
                          <span>Rendrer med FFmpeg ({renderProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Film className="w-4 h-4 text-[#FF3B00]" />
                          <span>Rendre Video (FFmpeg MP4) ➔</span>
                        </>
                      )}
                    </button>

                    {renderedVideoUrl && (
                      <a
                        href={renderedVideoUrl}
                        download={`SPARK_${project.platform}.mp4`}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] rounded text-center shadow-lg shadow-emerald-950/40"
                      >
                        <Download className="w-4 h-4" />
                        <span>Last ned ferdig rendret MP4</span>
                      </a>
                    )}

                    <button
                      onClick={handleDownloadFullDeliveryZip}
                      className="w-full py-2.5 bg-[#141416] hover:bg-[#202024] hover:border-[#FF3B00] border border-[#333] text-zinc-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] rounded"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FF3B00]" />
                      <span>Last ned Full Kampanjepakke (ZIP)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Storyboard & Scenes List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                  <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#FF3B00]" />
                    <span>Storyboard Scener ({project.scenes.length} scener)</span>
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    Total spilletid: {project.totalDurationSeconds} sekunder
                  </span>
                </div>

                <div className="space-y-3">
                  {project.scenes.map((scene, idx) => {
                    const isActive = activeSceneIndex === idx;
                    return (
                      <div
                        key={scene.id || idx}
                        onClick={() => setActiveSceneIndex(idx)}
                        className={`p-4 border rounded space-y-3 transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#18181C] border-[#FF3B00] shadow-md shadow-[#FF3B00]/10"
                            : "bg-[#121214] border-[#262626] hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#FF3B00] text-black flex items-center justify-center text-[10px] font-black">
                              {scene.sceneNumber}
                            </span>
                            <span>Scene {scene.sceneNumber}</span>
                            <span className="text-[10px] text-zinc-400 font-normal">
                              ({scene.durationSeconds}s • {scene.mood})
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegenerateSingleScene(idx);
                            }}
                            className="p-1 hover:text-[#FF3B00] text-zinc-500 cursor-pointer"
                            title="Regenerer scene"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase block mb-1">
                              Tekst på skjerm (Hook / Tittel):
                            </label>
                            <input
                              type="text"
                              value={scene.onScreenText}
                              onChange={(e) =>
                                handleSceneTextChange(idx, "onScreenText", e.target.value)
                              }
                              className="w-full bg-[#0E0E10] border border-[#333] px-2.5 py-1.5 text-xs text-white rounded focus:border-[#FF3B00] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase block mb-1">
                              Stemme / Voiceover manus:
                            </label>
                            <input
                              type="text"
                              value={scene.narrationVoiceover}
                              onChange={(e) =>
                                handleSceneTextChange(idx, "narrationVoiceover", e.target.value)
                              }
                              className="w-full bg-[#0E0E10] border border-[#333] px-2.5 py-1.5 text-xs text-white rounded focus:border-[#FF3B00] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-zinc-400 bg-[#0E0E10] p-2 rounded border border-[#222]">
                          <span className="text-zinc-500 uppercase text-[9px] block">Visuell regi:</span>
                          <span>{scene.visualPrompt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            );
          })()}

          {/* TAB: Omnichannel View */}
          {deliverablesTab === "omnichannel" && (
            <div className="p-6 bg-[#141416] border border-[#262626] rounded space-y-6">
              <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span>Én Idé → Alle Plattformer (Omnichannel Pakke)</span>
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    Samme produkt ({project.strategy.productOrService}), ferdig tilpasset til Etsy, TikTok, Snapchat, YouTube, Instagram og Facebook.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchOmnichannel}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs uppercase font-bold rounded cursor-pointer transition-colors"
                >
                  Oppdater Alle Plattformer
                </button>
              </div>

              {omnichannelData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Etsy Card */}
                  <div className="p-4 bg-[#18181C] border border-[#333] rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-2">
                      <span className="text-sm font-bold text-orange-400">Etsy Listing</span>
                      <span className="text-[10px] font-mono bg-orange-950 text-orange-300 px-1.5 py-0.5 rounded">
                        13 Tags
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium">{omnichannelData.etsy.title}</div>
                    <div className="text-[11px] font-mono text-zinc-400 space-y-1">
                      <div>Pris: {omnichannelData.etsy.priceStrategy}</div>
                      <div>Format: Digital PDF + GoodNotes</div>
                    </div>
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {omnichannelData.etsy.tags.slice(0, 6).map((tag, tIdx) => (
                          <span key={tIdx} className="text-[9px] bg-black/50 px-1.5 py-0.5 text-zinc-300 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* TikTok Card */}
                  <div className="p-4 bg-[#18181C] border border-[#333] rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-2">
                      <span className="text-sm font-bold text-pink-400">TikTok 9:16</span>
                      <span className="text-[10px] font-mono bg-pink-950 text-pink-300 px-1.5 py-0.5 rounded">
                        30 sek
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium">{omnichannelData.tiktok.hookFirst3s}</div>
                    <p className="text-xs text-zinc-300 leading-relaxed bg-[#101012] p-2 rounded">
                      «{omnichannelData.tiktok.script}»
                    </p>
                    <div className="text-[11px] font-mono text-emerald-400">CTA: {omnichannelData.tiktok.cta}</div>
                  </div>

                  {/* Snapchat Card */}
                  <div className="p-4 bg-[#18181C] border border-[#333] rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-2">
                      <span className="text-sm font-bold text-yellow-400">Snapchat Spotlight</span>
                      <span className="text-[10px] font-mono bg-yellow-950 text-yellow-300 px-1.5 py-0.5 rounded">
                        12 sek
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium">{omnichannelData.snapchat.hookFirst2s}</div>
                    <div className="text-xs text-zinc-300">Stil: {omnichannelData.snapchat.nativeStoryStyle}</div>
                    <div className="text-[11px] font-mono text-yellow-300 bg-black/40 p-2 rounded">
                      Swipe Up: {omnichannelData.snapchat.swipeUpCta}
                    </div>
                  </div>

                  {/* YouTube Shorts Card */}
                  <div className="p-4 bg-[#18181C] border border-[#333] rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-2">
                      <span className="text-sm font-bold text-red-400">YouTube Shorts</span>
                      <span className="text-[10px] font-mono bg-red-950 text-red-300 px-1.5 py-0.5 rounded">
                        45 sek
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium">{omnichannelData.youtubeShorts.hook}</div>
                    <div className="text-xs text-zinc-300">Payoff: {omnichannelData.youtubeShorts.payoff}</div>
                    <div className="text-[11px] font-mono text-zinc-400">Loop: {omnichannelData.youtubeShorts.loopPotential}</div>
                  </div>

                  {/* YouTube Long-Form Card */}
                  <div className="p-4 bg-[#18181C] border border-[#333] rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-2">
                      <span className="text-sm font-bold text-red-500">YouTube Long-Form</span>
                      <span className="text-[10px] font-mono bg-red-950 text-red-300 px-1.5 py-0.5 rounded">
                        8 min
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium">{omnichannelData.youtubeLong.title}</div>
                    <div className="text-[11px] text-zinc-300">Thumbnail: {omnichannelData.youtubeLong.thumbnailConcept}</div>
                    <div className="text-[10px] font-mono text-zinc-400 space-y-0.5">
                      {omnichannelData.youtubeLong.chapters.slice(0, 3).map((ch, cIdx) => (
                        <div key={cIdx}>
                          {ch.timestamp} - {ch.title}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instagram Reels & Facebook */}
                  <div className="p-4 bg-[#18181C] border border-[#333] rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-2">
                      <span className="text-sm font-bold text-purple-400">Instagram &amp; Facebook</span>
                      <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">
                        Reels &amp; Ad
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium">{omnichannelData.facebook.headline}</div>
                    <p className="text-xs text-zinc-300 line-clamp-3">
                      {omnichannelData.facebook.primaryAdCopy}
                    </p>
                    <div className="text-[11px] font-mono text-purple-300">
                      Knapp: {omnichannelData.facebook.ctaButton}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <p className="text-xs font-mono text-zinc-400">
                    Trykk på knappen nedenfor for å bygge ut hele omnichannel-pakken for produktet ditt.
                  </p>
                  <button
                    type="button"
                    onClick={handleFetchOmnichannel}
                    disabled={isGeneratingOmnichannel}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs uppercase font-bold rounded cursor-pointer transition-colors"
                  >
                    {isGeneratingOmnichannel ? "Genererer Omnichannel..." : "Generer Alle 6 Plattformer Nå"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: Publiseringsmanus & Copy */}
          {deliverablesTab === "copy" && (
            <div className="p-6 bg-[#141416] border border-[#262626] rounded space-y-6">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF3B00]" />
                <span>Publiseringsmanus &amp; Annonsekopier</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-[#18181A] border border-[#333] rounded space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[#FF3B00] font-bold">
                      Fullt Voiceover Manus:
                    </span>
                    <p className="text-xs text-white leading-relaxed font-sans">
                      {project.voiceoverScript}
                    </p>
                  </div>

                  <div className="p-4 bg-[#18181A] border border-[#333] rounded space-y-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                      Anbefalte Hashtags:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs font-mono text-zinc-300">
                      {project.strategy.recommendedHashtags.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 bg-black/40 border border-zinc-700 rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#18181A] border border-[#333] rounded space-y-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                      Viral Hooks:
                    </span>
                    <div className="space-y-2">
                      {project.strategy.scrollStoppingHooks.map((hook, i) => (
                        <div
                          key={i}
                          className="p-2 bg-black/40 border border-[#262626] rounded text-xs text-white font-medium"
                        >
                          {hook}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#18181A] border border-[#333] rounded space-y-2">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                      Primær Call-To-Action (CTA):
                    </span>
                    <div className="p-2.5 bg-white text-black font-bold text-xs rounded">
                      {project.strategy.primaryCallToAction}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Banners */}
          {deliverablesTab === "banners" && (
            <BannerStudio
              companyName={companyName}
              productTitle={project.strategy.productOrService}
              hook={project.strategy.scrollStoppingHooks[0] || "Få full kontroll over hverdagen"}
              subTitle={project.strategy.uniqueValueProposition}
              ctaText={project.strategy.primaryCallToAction}
              productImage={productImage}
              approvedBanners={approvedBanners}
              onApproveBanner={(format, isApproved) => {
                setApprovedBanners((prev) => ({ ...prev, [format]: isApproved }));
              }}
            />
          )}

          {/* TAB: Carousel */}
          {deliverablesTab === "carousel" && (
            <CarouselStudio
              companyName={companyName}
              productTitle={project.strategy.productOrService}
              hook={project.strategy.scrollStoppingHooks[0]}
              productImage={productImage}
              onApproveSlide={(idx, isApproved) => {
                setApprovedSlides((prev) => ({ ...prev, [idx]: isApproved }));
              }}
            />
          )}

          {/* TAB: A/B Test Variants */}
          {deliverablesTab === "ab-test" && (
            <ABTestStudio
              variants={variantsList.length > 0 ? variantsList : [
                {
                  id: "var_1",
                  variantType: "ProblemSolution",
                  title: "Variant 1: Problem → Løsning",
                  hook: `«Føler du at hverdagen forsvinner i kaos og uoversiktlige lister?»`,
                  coreMessage: `Med ${project.strategy.productOrService} får du hele dagen samlet på én estetisk side på få minutter.`,
                  targetMood: "Oppgitthet vendt til umiddelbar ro og klarhet",
                  cta: project.strategy.primaryCallToAction || "Finn den på Etsy nå – link i bio!",
                  scriptPreview: `Føler du at hverdagen forsvinner i kaos? Med denne planneren ser du prioriteringene dine krystallklart. Bygg gode vaner og få mer overskudd. Trykk på linken i bio!`,
                  scenes: project.scenes,
                },
                {
                  id: "var_2",
                  variantType: "ProductDemo",
                  title: "Variant 2: Produktdemonstrasjon (Walkthrough)",
                  hook: `«Her er nøyaktig hva du får i den virale ${project.strategy.productOrService}»`,
                  coreMessage: "Detaljert gjennomgang av funksjoner, faner og hyperlenker.",
                  targetMood: "Informativ, visuelt tilfredsstillende og grundig",
                  cta: "Last ned umiddelbart etter kjøp!",
                  scriptPreview: `La meg vise deg hvordan denne planneren fungerer. Klikkbare faner tar deg direkte til dagsmål, vanelogg og budsjett. Alt fungerer sømløst på nettbrett og utskrift. Sikre deg din nå!`,
                  scenes: project.scenes,
                },
                {
                  id: "var_3",
                  variantType: "BeforeAfter",
                  title: "Variant 3: Før / Etter Transformasjon",
                  hook: `«Meg for 6 måneder siden vs. meg i dag med ${project.strategy.productOrService}»`,
                  coreMessage: "Fra konstant prokrastinering til gjennomføring av alle mål.",
                  targetMood: "Inspirerende og personlig transformasjon",
                  cta: "Start din transformasjon i dag – link i bio!",
                  scriptPreview: `Før glemte jeg avtaler og utsatte alt. Nå starter jeg hver morgen med 5 minutters fokus i planneren min. Forskjellen i energi er natt og dag. Prøv det selv!`,
                  scenes: project.scenes,
                }
              ]}
              currentProject={project}
              productImage={productImage}
              isGenerating={isGeneratingVariants}
              onRefreshVariants={handleFetchVariants}
              onSelectVariant={handleSelectVariant}
            />
          )}
        </div>
      )}

      {/* Modal: 10 Varianter */}
      {isVariantsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#141416] border-2 border-[#333] max-w-4xl w-full p-6 space-y-6 shadow-2xl rounded relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <SplitSquareVertical className="w-5 h-5 text-[#FF3B00]" />
                <h3 className="text-lg font-black uppercase text-white">
                  10 Kampanjevarianter &amp; Salgsvinkler
                </h3>
              </div>
              <button
                onClick={() => setIsVariantsModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isGeneratingVariants ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#FF3B00] animate-spin mx-auto" />
                <p className="text-xs font-mono text-zinc-300">
                  Bygger 10 unike kampanjevinkler (Problem-Løsning, Produktdemo, Før/Etter, Storytelling, PAS...)...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variantsList.map((variant) => (
                  <div
                    key={variant.id}
                    className="p-4 bg-[#18181A] border border-[#2D2D32] hover:border-[#FF3B00] rounded space-y-2 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase">{variant.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#26262A] text-zinc-300 rounded">
                          {variant.targetMood}
                        </span>
                      </div>
                      <p className="text-xs text-[#FF3B00] font-medium mt-1">«{variant.hook}»</p>
                      <p className="text-xs text-zinc-300 mt-1 line-clamp-3 leading-relaxed">
                        {variant.scriptPreview}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectVariant(variant)}
                      className="mt-3 w-full py-2 bg-[#222] hover:bg-[#FF3B00] text-zinc-200 hover:text-black text-xs font-mono font-bold uppercase tracking-wider rounded transition-colors text-center cursor-pointer"
                    >
                      Bruk denne varianten i videoen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Omnichannel Details */}
      {isOmnichannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#141416] border-2 border-[#333] max-w-4xl w-full p-6 space-y-6 shadow-2xl rounded relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black uppercase text-white">
                  Én Idé → Alle Plattformer
                </h3>
              </div>
              <button
                onClick={() => setIsOmnichannelModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isGeneratingOmnichannel ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-zinc-300">
                  Bygger skreddersydde pakker for Etsy, TikTok, Snapchat, YouTube, Instagram og Facebook...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-zinc-300">
                  Alle formatene er generert og synkronisert med ditt produkt. Du kan bla gjennom og kopiere tekstene eller åpne Omnichannel-fanen.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOmnichannelModalOpen(false);
                    setDeliverablesTab("omnichannel");
                  }}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs uppercase rounded cursor-pointer transition-colors"
                >
                  Gå til Omnichannel Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
