import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Scissors,
  Copy,
  Trash2,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Layers,
  Sparkles,
  Download,
  Film,
  Type,
  Mic,
  Music,
  Image as ImageIcon,
} from "lucide-react";
import { TimelineTrack, TimelineTrackItem, AutonomousVideoProject } from "../types";

interface TimelineEditorProps {
  project?: AutonomousVideoProject | null;
  companyName?: string;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  project,
  companyName = "BrandForge Labs",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1); // 1x to 3x
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<TimelineTrack[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Default multi-track state
  const [tracks, setTracks] = useState<TimelineTrack[]>(() => {
    try {
      const stored = localStorage.getItem("brandforge_current_videoproj");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.scenes && parsed.scenes.length > 0) {
          let accumTime = 0;
          const visualItems: TimelineTrackItem[] = parsed.scenes.map((sc: any, i: number) => {
            const dur = sc.durationSeconds || 3.5;
            const start = accumTime;
            accumTime += dur;
            return {
              id: `sc_vis_${sc.id || i}`,
              trackType: "visual",
              startTime: start,
              duration: dur,
              title: `Scene ${i + 1}: ${sc.onScreenText || sc.mood || "Visual"}`,
              content: sc.visualPrompt || "",
              color: ["#FF3B00", "#E03400", "#FF5500", "#CC2D00", "#FF6600"][i % 5],
            };
          });

          const textItems: TimelineTrackItem[] = (parsed.subtitles && parsed.subtitles.length > 0)
            ? parsed.subtitles.map((sub: any, i: number) => ({
                id: `sub_${sub.id || i}`,
                trackType: "text",
                startTime: sub.startTime,
                duration: Math.max(0.5, sub.endTime - sub.startTime),
                title: sub.text,
                content: sub.text,
                color: "#00E5FF",
              }))
            : parsed.scenes.map((sc: any, i: number) => {
                const vis = visualItems[i];
                return {
                  id: `sc_txt_${sc.id || i}`,
                  trackType: "text",
                  startTime: vis ? vis.startTime : i * 3.5,
                  duration: vis ? vis.duration : 3.5,
                  title: sc.onScreenText || `Tekst scene ${i + 1}`,
                  content: sc.onScreenText || "",
                  color: "#00E5FF",
                };
              });

          return [
            { id: "tr_visual", type: "visual", name: "Video & Bilde (Visuals)", muted: false, locked: false, items: visualItems },
            { id: "tr_text", type: "text", name: "Tekst & Undertekster", muted: false, locked: false, items: textItems },
            {
              id: "tr_voice",
              type: "voiceover",
              name: "Voiceover (Tale)",
              muted: false,
              locked: false,
              items: [{ id: "vo_1", trackType: "voiceover", startTime: 0, duration: parsed.totalDurationSeconds || 15.0, title: "Norsk Speak Track", content: parsed.voiceoverScript || "", color: "#10B981" }],
            },
            {
              id: "tr_music",
              type: "music",
              name: "Bakgrunnsmusikk (Lyd)",
              muted: false,
              locked: false,
              items: [{ id: "m_1", trackType: "music", startTime: 0, duration: parsed.totalDurationSeconds || 15.0, title: parsed.musicGenre || "Lo-Fi Beats", content: "BGM", color: "#8B5CF6" }],
            },
            {
              id: "tr_brand",
              type: "brand",
              name: "Vannmerke & Logo",
              muted: false,
              locked: false,
              items: [{ id: "b_1", trackType: "brand", startTime: 0, duration: parsed.totalDurationSeconds || 15.0, title: `${companyName} Clean Mark`, content: "Logo badge", color: "#F59E0B" }],
            },
          ];
        }
      }
    } catch {}

    return [
      {
        id: "tr_visual",
        type: "visual",
        name: "Video & Bilde (Visuals)",
        muted: false,
        locked: false,
        items: [
          { id: "v_1", trackType: "visual", startTime: 0, duration: 3.5, title: "Hook: Kaos & Frustrasjon", content: "Disorganized desk", color: "#FF3B00" },
          { id: "v_2", trackType: "visual", startTime: 3.5, duration: 4.0, title: "Løsning: Estetisk Dayplanner", content: "Aesthetic digital planner layout", color: "#E03400" },
          { id: "v_3", trackType: "visual", startTime: 7.5, duration: 4.0, title: "Resultat: Full kontroll & vaner", content: "Calm productivity flow", color: "#FF5500" },
          { id: "v_4", trackType: "visual", startTime: 11.5, duration: 3.5, title: "CTA: Etsy Storefront Skjerm", content: "Etsy buy now", color: "#CC2D00" },
        ],
      },
      {
        id: "tr_text",
        type: "text",
        name: "Tekst & Undertekster",
        muted: false,
        locked: false,
        items: [
          { id: "t_1", trackType: "text", startTime: 0, duration: 3.5, title: "Kaos i hverdagen? 🛑", content: "Onscreen caption", color: "#00E5FF" },
          { id: "t_2", trackType: "text", startTime: 3.5, duration: 4.0, title: "Få full kontroll med Dayplanner 2026 ✨", content: "Onscreen caption", color: "#00E5FF" },
          { id: "t_3", trackType: "text", startTime: 7.5, duration: 4.0, title: "Mer overskudd & struktur 🎯", content: "Onscreen caption", color: "#00E5FF" },
          { id: "t_4", trackType: "text", startTime: 11.5, duration: 3.5, title: "FINN DEN PÅ ETSY NÅ 👆", content: "Onscreen caption", color: "#00E5FF" },
        ],
      },
      {
        id: "tr_voice",
        type: "voiceover",
        name: "Voiceover (Tale)",
        muted: false,
        locked: false,
        items: [
          { id: "vo_1", trackType: "voiceover", startTime: 0, duration: 15.0, title: "Etsy Dayplanner Speak Track (15s)", content: "Voiceover", color: "#10B981" },
        ],
      },
      {
        id: "tr_music",
        type: "music",
        name: "Bakgrunnsmusikk (Lyd)",
        muted: false,
        locked: false,
        items: [
          { id: "m_1", trackType: "music", startTime: 0, duration: 15.0, title: "Lo-Fi Aesthetic Study Beats", content: "BGM", color: "#8B5CF6" },
        ],
      },
      {
        id: "tr_brand",
        type: "brand",
        name: "Vannmerke & Logo",
        muted: false,
        locked: false,
        items: [
          { id: "b_1", trackType: "brand", startTime: 0, duration: 15.0, title: `${companyName} Clean Mark`, content: "Logo badge", color: "#F59E0B" },
        ],
      },
    ];
  });

  const totalDuration = project?.totalDurationSeconds || 15.0;
  const playTimerRef = useRef<any>(null);

  // Synchronize tracks with project when provided
  useEffect(() => {
    if (!project || !project.scenes || project.scenes.length === 0) return;

    let accumTime = 0;
    const visualItems: TimelineTrackItem[] = project.scenes.map((sc, i) => {
      const dur = sc.durationSeconds || 3.5;
      const start = accumTime;
      accumTime += dur;
      return {
        id: `sc_vis_${sc.id || i}`,
        trackType: "visual",
        startTime: start,
        duration: dur,
        title: `Scene ${i + 1}: ${sc.onScreenText || sc.mood || "Visual"}`,
        content: sc.visualPrompt || "",
        color: ["#FF3B00", "#E03400", "#FF5500", "#CC2D00", "#FF6600"][i % 5],
      };
    });

    const textItems: TimelineTrackItem[] = (project.subtitles && project.subtitles.length > 0)
      ? project.subtitles.map((sub, i) => ({
          id: `sub_${sub.id || i}`,
          trackType: "text",
          startTime: sub.startTime,
          duration: Math.max(0.5, sub.endTime - sub.startTime),
          title: sub.text,
          content: sub.text,
          color: "#00E5FF",
        }))
      : project.scenes.map((sc, i) => {
          const vis = visualItems[i];
          return {
            id: `sc_txt_${sc.id || i}`,
            trackType: "text",
            startTime: vis ? vis.startTime : i * 3.5,
            duration: vis ? vis.duration : 3.5,
            title: sc.onScreenText || `Scene ${i + 1}`,
            content: sc.onScreenText || "",
            color: "#00E5FF",
          };
        });

    const projDuration = project.totalDurationSeconds || Math.max(15, accumTime);

    const newTracks: TimelineTrack[] = [
      {
        id: "tr_visual",
        type: "visual",
        name: "Video & Bilde (Visuals)",
        muted: false,
        locked: false,
        items: visualItems,
      },
      {
        id: "tr_text",
        type: "text",
        name: "Tekst & Undertekster",
        muted: false,
        locked: false,
        items: textItems,
      },
      {
        id: "tr_voice",
        type: "voiceover",
        name: "Voiceover (Tale)",
        muted: false,
        locked: false,
        items: [
          {
            id: `vo_${project.id}`,
            trackType: "voiceover",
            startTime: 0,
            duration: Math.min(projDuration, accumTime),
            title: project.voiceoverScript ? project.voiceoverScript.slice(0, 50) + "..." : "Voiceover Speak Track",
            content: project.voiceoverScript || "",
            color: "#10B981",
          },
        ],
      },
      {
        id: "tr_music",
        type: "music",
        name: "Bakgrunnsmusikk (Lyd)",
        muted: false,
        locked: false,
        items: [
          {
            id: `m_${project.id}`,
            trackType: "music",
            startTime: 0,
            duration: projDuration,
            title: `${project.musicGenre || "Ambient Electronic"} (Duck: -${project.musicDuckingPercent || 12}dB)`,
            content: project.musicGenre || "BGM",
            color: "#8B5CF6",
          },
        ],
      },
      {
        id: "tr_brand",
        type: "brand",
        name: "Vannmerke & Logo",
        muted: false,
        locked: false,
        items: [
          {
            id: `b_${project.id}`,
            trackType: "brand",
            startTime: 0,
            duration: projDuration,
            title: `${companyName} Clean Mark (${project.logoPosition || "top-right"})`,
            content: "Logo badge",
            color: "#F59E0B",
          },
        ],
      },
    ];

    setTracks(newTracks);
  }, [project, companyName]);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      clearInterval(playTimerRef.current);
    }
    return () => clearInterval(playTimerRef.current);
  }, [isPlaying]);

  const handleMuteTrack = (trackId: string) => {
    setTracks(tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)));
  };

  const handleLockTrack = (trackId: string) => {
    setTracks(tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)));
  };

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const handleExportTimelineJson = () => {
    const data = {
      projectTitle: `${companyName} Timeline Sequence`,
      totalDuration,
      exportedAt: new Date().toISOString(),
      tracks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BrandForge_Timeline_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddNewItem = () => {
    const visualTrack = tracks.find((t) => t.type === "visual") || tracks[0];
    const newItem: TimelineTrackItem = {
      id: `item_${Date.now()}`,
      trackType: visualTrack.type,
      startTime: Math.min(12, currentTime),
      duration: 3.0,
      title: `Nytt Klipp (${(currentTime).toFixed(1)}s)`,
      content: "Ny scene",
      color: "#FF3B00",
    };
    setTracks(
      tracks.map((t) =>
        t.id === visualTrack.id ? { ...t, items: [...t.items, newItem] } : t
      )
    );
    setSelectedItemId(newItem.id);
  };

  const handleRenderTimelineVideo = async () => {
    setIsRendering(true);
    setRenderProgress(15);
    setRenderError(null);

    try {
      const visualTrack = tracks.find((t) => t.type === "visual");
      const textTrack = tracks.find((t) => t.type === "text");
      const visualItems = visualTrack?.items || [];
      const textItems = textTrack?.items || [];

      const scenes = visualItems.map((item, idx) => {
        const correspondingText = textItems.find(
          (t) => Math.abs(t.startTime - item.startTime) < 2
        );
        return {
          id: item.id,
          order: idx + 1,
          durationSeconds: item.duration,
          onScreenText: correspondingText?.title || item.title,
          narrationVoiceover: item.title,
          visualPrompt: item.title,
          mood: "Pro Tidslinje",
        };
      });

      const interval = setInterval(() => {
        setRenderProgress((prev) => Math.min(90, prev + 15));
      }, 350);

      const res = await fetch("/api/render-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenes: scenes.length > 0 ? scenes : [
            {
              id: "sc_1",
              order: 1,
              durationSeconds: 5,
              onScreenText: `${companyName} Kommersiell Reklame`,
              narrationVoiceover: "Redigert i BrandForge Studio Flerspors Tidslinje",
            },
          ],
          aspectRatio: "9:16",
          resolution: "720p",
          commercialLicense: true,
          fps: 30,
        }),
      });

      clearInterval(interval);
      setRenderProgress(100);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Rendering feilet");
      }

      const data = await res.json();
      if (data.videoUrl) {
        setRenderedVideoUrl(data.videoUrl);
      }
    } catch (err: any) {
      console.error("Timeline render error:", err);
      setRenderError(err.message || "Kunne ikke rendre tidslinjen med FFmpeg.");
    } finally {
      setIsRendering(false);
    }
  };

  const handleDeleteItem = () => {
    if (!selectedItemId) return;
    setTracks(
      tracks.map((t) => ({
        ...t,
        items: t.items.filter((item) => item.id !== selectedItemId),
      }))
    );
    setSelectedItemId(null);
  };

  const handleDuplicateItem = () => {
    if (!selectedItemId) return;
    const targetTrack = tracks.find((t) => t.items.some((i) => i.id === selectedItemId));
    if (!targetTrack) return;
    const targetItem = targetTrack.items.find((i) => i.id === selectedItemId);
    if (!targetItem) return;

    const duplicated: TimelineTrackItem = {
      ...targetItem,
      id: `${targetItem.id}_copy_${Date.now().toString().slice(-4)}`,
      startTime: Math.min(totalDuration - targetItem.duration, targetItem.startTime + targetItem.duration),
      title: `${targetItem.title} (Kopi)`,
    };

    setTracks(
      tracks.map((t) =>
        t.id === targetTrack.id ? { ...t, items: [...t.items, duplicated] } : t
      )
    );
  };

  const getTrackIcon = (type: string) => {
    switch (type) {
      case "visual":
        return <Film className="w-3.5 h-3.5 text-[#FF3B00]" />;
      case "text":
        return <Type className="w-3.5 h-3.5 text-[#00E5FF]" />;
      case "voiceover":
        return <Mic className="w-3.5 h-3.5 text-emerald-400" />;
      case "music":
        return <Music className="w-3.5 h-3.5 text-purple-400" />;
      case "brand":
        return <ImageIcon className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#FF3B00]" />
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              Flerspors Tidslinjeredigering (Pro Timeline Editor)
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Rediger klipp, undertekster, voiceover og musikk uavhengig. Klipping, trimming, snapping og ducking.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddNewItem}
            className="px-3 py-1.5 bg-[#FF3B00] hover:bg-white text-black font-black uppercase text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#FF3B00]/30 rounded"
          >
            <span>+ Legg til klipp</span>
          </button>
          <button
            onClick={handleDuplicateItem}
            disabled={!selectedItemId}
            className="px-2.5 py-1.5 bg-[#1C1C1E] border border-[#333] hover:border-white disabled:opacity-40 text-xs font-mono text-white flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 rounded"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Dupliser</span>
          </button>
          <button
            onClick={handleDeleteItem}
            disabled={!selectedItemId}
            className="px-2.5 py-1.5 bg-[#1C1C1E] border border-[#333] hover:border-red-500 disabled:opacity-40 text-xs font-mono text-red-400 flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Slett</span>
          </button>
          <button
            onClick={handleExportTimelineJson}
            className="px-2.5 py-1.5 bg-[#1C1C1E] border border-[#333] hover:border-[#FF3B00] text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 rounded"
          >
            <Download className="w-3.5 h-3.5 text-[#FF3B00]" />
            <span>Eksporter JSON</span>
          </button>
          <button
            onClick={handleRenderTimelineVideo}
            disabled={isRendering}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black uppercase text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/30 rounded"
          >
            <Film className="w-3.5 h-3.5" />
            <span>{isRendering ? `Rendrer (${renderProgress}%)...` : "Rendre MP4 (FFmpeg)"}</span>
          </button>
        </div>
      </div>

      {renderError && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono rounded">
          {renderError}
        </div>
      )}

      {/* Live Timeline Video & Stage Monitor */}
      {(() => {
        const activeVisual = tracks
          .find((t) => t.type === "visual")
          ?.items.find((i) => currentTime >= i.startTime && currentTime <= i.startTime + i.duration);
        const activeText = tracks
          .find((t) => t.type === "text")
          ?.items.find((i) => currentTime >= i.startTime && currentTime <= i.startTime + i.duration);
        const activeVoice = tracks
          .find((t) => t.type === "voiceover")
          ?.items.find((i) => currentTime >= i.startTime && currentTime <= i.startTime + i.duration);
        const activeBrand = tracks
          .find((t) => t.type === "brand")
          ?.items.find((i) => currentTime >= i.startTime && currentTime <= i.startTime + i.duration);

        return (
          <div className="p-4 bg-[#141416] border border-[#262626] hover:border-zinc-700 transition-colors rounded-xl space-y-3 shadow-2xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#FF3B00]" />
                <span className="font-bold text-white uppercase tracking-wider">
                  {renderedVideoUrl ? "Ferdig Rendret MP4 Spiller" : "Direkte Tidslinje-Forhåndsvisning"}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-black/60 text-zinc-400 border border-zinc-700 rounded">
                  00:{currentTime < 10 ? `0${currentTime.toFixed(1)}` : currentTime.toFixed(1)} / 00:{totalDuration.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderedVideoUrl ? (
                  <a
                    href={renderedVideoUrl}
                    download={`BrandForge_Timeline_${Date.now()}.mp4`}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] tracking-wider rounded transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
                  >
                    Last ned MP4
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleRenderTimelineVideo}
                    disabled={isRendering}
                    className="px-3 py-1.5 bg-[#FF3B00] hover:bg-white text-black font-black uppercase text-[10px] tracking-wider rounded transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-[#FF3B00]/30"
                  >
                    {isRendering ? `Rendrer (${renderProgress}%)...` : "Rendre til MP4 ➔"}
                  </button>
                )}
              </div>
            </div>

            <div className="relative max-w-xl mx-auto aspect-video bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#121216] rounded-xl overflow-hidden border-2 border-[#333] shadow-2xl flex flex-col justify-between p-4 group">
              {renderedVideoUrl ? (
                <video
                  src={renderedVideoUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  loop
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              ) : (
                <>
                  {/* Top Bar: Brand watermark & Scene status */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-lg border border-white/20 text-[10px] font-mono font-bold text-white flex items-center gap-1.5 shadow">
                      <span className="w-2 h-2 rounded-full bg-[#FF3B00] animate-pulse" />
                      <span>{activeBrand?.title || `${companyName}`}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-black/70 border border-white/10 text-[9px] font-mono text-zinc-300 rounded backdrop-blur-md">
                      {activeVisual?.title || "Visuelt Klipp"}
                    </span>
                  </div>

                  {/* Center stage content */}
                  <div className="my-auto text-center space-y-2.5 relative z-10 px-4">
                    <div className="inline-block px-4 py-1.5 bg-[#FF3B00] text-black font-black uppercase text-xs tracking-wider rounded-lg shadow-lg">
                      {activeText?.title || "TIDSLINJE HOOK // TITTEL"}
                    </div>
                    {activeVoice?.title && (
                      <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-2.5 max-w-md mx-auto text-xs text-zinc-200">
                        «{activeVoice.title}»
                      </div>
                    )}
                  </div>

                  {/* Big Play/Pause Toggle on screen */}
                  <div
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer transition-all"
                  >
                    {!isPlaying ? (
                      <div className="w-14 h-14 rounded-full bg-black/75 border-2 border-[#FF3B00] text-[#FF3B00] flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#FF3B00] group-hover:text-black transition-all">
                        <Play className="w-7 h-7 fill-current ml-0.5" />
                      </div>
                    ) : null}
                  </div>

                  {/* Bottom playhead indicator */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="text-emerald-400">● Live Preview Monitor</span>
                    <span>Klikk hvor som helst for å {isPlaying ? "pause" : "spille av"}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Main Timeline Workspace */}
      <div className="bg-[#141416] border border-[#262626] rounded overflow-hidden shadow-2xl space-y-4 p-4">
        {/* Playback Controls & Timecode */}
        <div className="flex items-center justify-between border-b border-[#222] pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-[#FF3B00] hover:bg-[#e03400] text-black rounded cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="font-mono text-sm font-bold text-white tracking-widest">
              00:{currentTime < 10 ? `0${currentTime.toFixed(1)}` : currentTime.toFixed(1)} / 00:15.0
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
              className="p-1.5 border border-[#333] text-zinc-400 hover:text-white cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-zinc-400 w-8 text-center">
              {zoomLevel}x
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
              className="p-1.5 border border-[#333] text-zinc-400 hover:text-white cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tracks Area */}
        <div className="overflow-x-auto relative pb-4">
          <div style={{ minWidth: `${Math.round(zoomLevel * 100)}%` }} className="space-y-2">
            {/* Time ruler bar */}
            <div className="flex pl-56 h-6 border-b border-[#2a2a2e] text-[9px] font-mono text-zinc-500 relative">
              {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => i)
                .filter((sec) => sec % (totalDuration > 20 ? 5 : 3) === 0 || sec === Math.ceil(totalDuration))
                .map((sec) => (
                  <div
                    key={sec}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: `calc(14rem + ${(sec / totalDuration) * 98}%)` }}
                  >
                    <span>{sec}s</span>
                    <span className="w-px h-2 bg-[#444]" />
                  </div>
                ))}
            </div>

            {/* Individual Tracks */}
            {tracks.map((track) => (
              <div key={track.id} className="flex items-center h-12 bg-[#101012] border border-[#222]">
                {/* Track Header / Controls */}
                <div className="w-56 px-3 flex items-center justify-between border-r border-[#222] bg-[#161618] h-full shrink-0 sticky left-0 z-20">
                  <div className="flex items-center gap-2 truncate">
                    {getTrackIcon(track.type)}
                    <span className="text-[11px] font-mono font-bold text-zinc-300 truncate">
                      {track.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMuteTrack(track.id)}
                      className="p-1 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      {track.muted ? (
                        <VolumeX className="w-3 h-3 text-red-400" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => handleLockTrack(track.id)}
                      className="p-1 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      {track.locked ? (
                        <Lock className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Unlock className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Track Content Timeline Lane */}
                <div className="flex-1 h-full relative overflow-hidden bg-[#0A0A0C]">
                  {track.items.map((item) => {
                    const leftPercent = (item.startTime / totalDuration) * 100;
                    const widthPercent = (item.duration / totalDuration) * 100;
                    const isSelected = selectedItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`absolute top-1 bottom-1 rounded px-2 flex items-center truncate text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-white z-10 brightness-110 shadow-lg"
                            : "opacity-90 hover:opacity-100"
                        }`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          backgroundColor: item.color || "#333",
                          color: "#000",
                        }}
                      >
                        <span className="truncate">{item.title}</span>
                      </div>
                    );
                  })}

                  {/* Vertical Playhead Cursor */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#FF3B00] pointer-events-none z-30"
                    style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                  >
                    <div className="w-2.5 h-2.5 bg-[#FF3B00] rotate-45 -ml-1 -mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inspector Panel for selected clip */}
        {selectedItemId && (
          <div className="p-3 bg-[#18181A] border border-[#2a2a2e] text-xs space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
              <span className="font-bold text-white uppercase">Valgt Klipp Egenskaper</span>
              <span>ID: {selectedItemId}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block">Tittel / Tekst:</label>
                <input
                  type="text"
                  value={
                    tracks
                      .flatMap((t) => t.items)
                      .find((i) => i.id === selectedItemId)?.title || ""
                  }
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setTracks(
                      tracks.map((t) => ({
                        ...t,
                        items: t.items.map((i) =>
                          i.id === selectedItemId ? { ...i, title: newVal } : i
                        ),
                      }))
                    );
                  }}
                  className="w-full bg-[#121214] border border-[#333] p-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block">Starttid (sek):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  value={
                    tracks
                      .flatMap((t) => t.items)
                      .find((i) => i.id === selectedItemId)?.startTime || 0
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTracks(
                      tracks.map((t) => ({
                        ...t,
                        items: t.items.map((i) =>
                          i.id === selectedItemId ? { ...i, startTime: val } : i
                        ),
                      }))
                    );
                  }}
                  className="w-full bg-[#121214] border border-[#333] p-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block">Varighet (sek):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="15"
                  value={
                    tracks
                      .flatMap((t) => t.items)
                      .find((i) => i.id === selectedItemId)?.duration || 1
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTracks(
                      tracks.map((t) => ({
                        ...t,
                        items: t.items.map((i) =>
                          i.id === selectedItemId ? { ...i, duration: val } : i
                        ),
                      }))
                    );
                  }}
                  className="w-full bg-[#121214] border border-[#333] p-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
