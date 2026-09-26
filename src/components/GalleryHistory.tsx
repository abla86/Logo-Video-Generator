import React, { useState } from "react";
import {
  Download,
  Film,
  Play,
  Trash2,
  Layers,
  Sparkles,
} from "lucide-react";
import { GeneratedLogo, GeneratedVideo } from "../types";

interface GalleryHistoryProps {
  savedLogos: GeneratedLogo[];
  savedVideos: GeneratedVideo[];
  onSelectLogo: (logo: GeneratedLogo) => void;
  onSelectVideo: (video: GeneratedVideo) => void;
  onDeleteLogo: (id: string) => void;
  onDeleteVideo: (id: string) => void;
}

export const GalleryHistory: React.FC<GalleryHistoryProps> = ({
  savedLogos,
  savedVideos,
  onSelectLogo,
  onSelectVideo,
  onDeleteLogo,
  onDeleteVideo,
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "logos" | "videos">("all");

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalItems = savedLogos.length + savedVideos.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-[0.2em] font-black">
              MODULE // 04
            </span>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              [ASSET REPOSITORY]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F0F0F0]">
            IDENTITY ARCHIVE
          </h1>
          <p className="mt-1 text-xs text-white/60 font-light tracking-wide">
            Master repository of synthesized brand emblems, motion choreography, and cinematic Veo renders.
          </p>
        </div>

        {/* Filters in Artistic Flair theme */}
        <div className="flex items-center gap-1 border border-[#333] p-1 bg-[#151515]">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
              activeFilter === "all" ? "bg-[#FF3B00] text-black font-black" : "text-white/50 hover:text-white"
            }`}
          >
            All Assets ({totalItems})
          </button>
          <button
            onClick={() => setActiveFilter("logos")}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
              activeFilter === "logos" ? "bg-[#FF3B00] text-black font-black" : "text-white/50 hover:text-white"
            }`}
          >
            Logos ({savedLogos.length})
          </button>
          <button
            onClick={() => setActiveFilter("videos")}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
              activeFilter === "videos" ? "bg-[#FF3B00] text-black font-black" : "text-white/50 hover:text-white"
            }`}
          >
            Videos ({savedVideos.length})
          </button>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="max-w-md mx-auto py-16 text-center">
          <div className="w-16 h-16 bg-[#151515] border border-[#333] flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-[#FF3B00]" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#F0F0F0]">Archive Empty</h3>
          <p className="text-xs font-mono text-white/50 mt-1.5">
            Synthesize an emblem in DESIGN or render a clip in IMAGE-TO-VIDEO to populate the archive.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Logos Section */}
          {(activeFilter === "all" || activeFilter === "logos") && savedLogos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-2">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF3B00]" />
                  VECTOR LOGOS ({savedLogos.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {savedLogos.map((logo) => (
                  <div
                    key={logo.id}
                    className="group bg-[#151515] border border-[#333] hover:border-[#FF3B00] transition-colors relative flex flex-col"
                  >
                    <div className="absolute -top-px -left-px w-2.5 h-2.5 border-t border-l border-[#FF3B00] pointer-events-none"></div>

                    <div className="relative aspect-square bg-[#0E0E0E] flex items-center justify-center p-6 border-b border-[#222]">
                      <img
                        src={logo.imageUrl}
                        alt={logo.companyName}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain drop-shadow"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 border border-[#333] bg-[#0A0A0A] text-white/70 text-[9px] font-mono uppercase">
                        {logo.imageSize}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                          {logo.companyName}
                        </h4>
                        <p className="text-[10px] font-mono text-white/40 line-clamp-2 mt-1">
                          {logo.promptUsed}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between">
                        <button
                          onClick={() => onSelectLogo(logo)}
                          className="text-[10px] font-black uppercase tracking-widest text-[#FF3B00] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Animate</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadImage(logo.imageUrl, `${logo.companyName}-logo.png`)}
                            className="p-1.5 text-white/50 hover:text-white hover:border-[#FF3B00] transition-colors cursor-pointer"
                            title="Download Image"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteLogo(logo.id)}
                            className="p-1.5 text-white/30 hover:text-[#FF3B00] transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {(activeFilter === "all" || activeFilter === "videos") && savedVideos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-2">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-[#FF3B00]" />
                  SYNTHESIZED VEO RENDERS ({savedVideos.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {savedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-[#151515] border border-[#333] hover:border-[#FF3B00] transition-colors relative flex flex-col"
                  >
                    <div className="absolute -top-px -left-px w-2.5 h-2.5 border-t border-l border-[#FF3B00] pointer-events-none"></div>

                    <div
                      className={`relative bg-[#0E0E0E] flex items-center justify-center border-b border-[#222] ${
                        video.aspectRatio === "9:16" ? "aspect-[9/16] max-h-80" : "aspect-video"
                      }`}
                    >
                      <video
                        src={video.videoUrl || video.streamUrl}
                        controls
                        muted
                        playsInline
                        loop
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 border border-[#333] bg-[#0A0A0A] text-white/70 text-[9px] font-mono uppercase">
                        {video.aspectRatio} • {video.resolution}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                          {video.title}
                        </h4>
                        <p className="text-[10px] font-mono text-white/40 line-clamp-2 mt-1">
                          {video.prompt}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between">
                        <a
                          href={`${video.streamUrl}&download=1`}
                          download="video.mp4"
                          className="text-[10px] font-black uppercase tracking-widest text-[#FF3B00] hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export MP4</span>
                        </a>

                        <button
                          onClick={() => onDeleteVideo(video.id)}
                          className="p-1.5 text-white/30 hover:text-[#FF3B00] transition-colors cursor-pointer"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
