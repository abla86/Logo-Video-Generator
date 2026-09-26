import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Building2,
  Plus,
  Trash2,
  MessageSquare,
  FileCheck,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Archive,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
} from "lucide-react";
import JSZip from "jszip";
import {
  ClientAccount,
  CampaignProject,
  ApprovalStatus,
  ClientComment,
} from "../types";

export const ClientProjectManager: React.FC = () => {
  // Clients state
  const [clients, setClients] = useState<ClientAccount[]>(() => {
    try {
      const stored = localStorage.getItem("brandforge_clients");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: "client_1",
        name: "Nordic Planner & Stationery Studio",
        industry: "Etsy & Digitale Dayplannere",
        contactPerson: "Astrid Lind",
        contactEmail: "kontakt@nordicplanner.no",
        brandColors: ["#FF3B00", "#1E1E24", "#F4F1DE"],
        projectCount: 2,
        createdAt: Date.now() - 86400000 * 5,
      },
      {
        id: "client_2",
        name: "Aura Streetwear Oslo",
        industry: "Mote & Klesmerke",
        contactPerson: "Kasper Dahl",
        contactEmail: "kasper@aurastreetwear.no",
        brandColors: ["#00E5FF", "#111114", "#FFFFFF"],
        projectCount: 1,
        createdAt: Date.now() - 86400000 * 8,
      },
      {
        id: "client_3",
        name: "FjordTech Solutions",
        industry: "SaaS & Digital Teknologi",
        contactPerson: "Eirik Vik",
        contactEmail: "eirik@fjordtech.no",
        brandColors: ["#0066FF", "#0A192F", "#00FFCC"],
        projectCount: 1,
        createdAt: Date.now() - 86400000 * 12,
      },
    ];
  });

  const [activeClientId, setActiveClientId] = useState<string>("client_1");

  // Campaigns / Projects state
  const [projects, setProjects] = useState<CampaignProject[]>(() => {
    try {
      const stored = localStorage.getItem("brandforge_campaigns");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: "camp_1",
        clientId: "client_1",
        clientName: "Nordic Planner & Stationery Studio",
        title: "Etsy & TikTok Viral Dayplanner 2026",
        description: "15 sekunders viral videoannonse for salg og nedlasting av 2026 Dayplanner på Etsy, Snapchat og TikTok.",
        platform: "tiktok",
        aspectRatio: "9:16",
        status: "approved",
        commercialLicense: true,
        version: 2,
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000,
        comments: [
          {
            id: "c_1",
            author: "Astrid Lind (Kunde)",
            text: "Elsker fargene og iPad-hooken i scene 1! Fikk 40 nye Etsy-bestillinger første døgn.",
            timestamp: Date.now() - 86400000 * 2,
            resolved: true,
          },
          {
            id: "c_2",
            author: "Produksjonsteam",
            text: "CTA er forstørret med 20% og plassert i safe-zone i versjon 2.",
            timestamp: Date.now() - 86400000,
            resolved: true,
          },
        ],
      },
      {
        id: "camp_2",
        clientId: "client_1",
        clientName: "Nordic Planner & Stationery Studio",
        title: "Snapchat & Instagram Reel: 10 min Plan With Me",
        description: "ASMR-stil video med nettbrett, GoodNotes og estetisk ukeplanlegging.",
        platform: "snapchat",
        aspectRatio: "9:16",
        status: "in_review",
        commercialLicense: true,
        version: 1,
        createdAt: Date.now() - 86400000 * 1,
        updatedAt: Date.now() - 86400000 * 1,
        comments: [],
      },
    ];
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>("camp_1");
  const [newCommentText, setNewCommentText] = useState("");
  const [isNewClientModal, setIsNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientIndustry, setNewClientIndustry] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");

  const [isNewProjectModal, setIsNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectPlatform, setNewProjectPlatform] = useState<any>("tiktok");

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("brandforge_clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("brandforge_campaigns", JSON.stringify(projects));
  }, [projects]);

  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0];
  const clientProjects = projects.filter((p) => p.clientId === activeClientId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || clientProjects[0];

  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedProject) return;
    const comment: ClientComment = {
      id: `comm_${Date.now()}`,
      author: "Byrå / Prosjektleder",
      text: newCommentText.trim(),
      timestamp: Date.now(),
      resolved: false,
    };
    const updated = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, comments: [...p.comments, comment] } : p
    );
    setProjects(updated);
    setNewCommentText("");
  };

  const handleUpdateStatus = (status: ApprovalStatus) => {
    if (!selectedProject) return;
    const updated = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, status, updatedAt: Date.now() } : p
    );
    setProjects(updated);
  };

  const handleToggleCommercialLicense = () => {
    if (!selectedProject) return;
    const updated = projects.map((p) =>
      p.id === selectedProject.id
        ? { ...p, commercialLicense: !p.commercialLicense, updatedAt: Date.now() }
        : p
    );
    setProjects(updated);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    const newClient: ClientAccount = {
      id: `client_${Date.now()}`,
      name: newClientName.trim(),
      industry: newClientIndustry.trim() || "Generell",
      contactPerson: "Kontaktperson",
      contactEmail: newClientEmail.trim() || "post@bedrift.no",
      brandColors: ["#FF3B00", "#111111", "#FFFFFF"],
      projectCount: 0,
      createdAt: Date.now(),
    };
    setClients([newClient, ...clients]);
    setActiveClientId(newClient.id);
    setIsNewClientModal(false);
    setNewClientName("");
    setNewClientIndustry("");
    setNewClientEmail("");
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !activeClient) return;
    const newProj: CampaignProject = {
      id: `camp_${Date.now()}`,
      clientId: activeClient.id,
      clientName: activeClient.name,
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim() || "Kommersiell videoproduksjon",
      platform: newProjectPlatform,
      aspectRatio: newProjectPlatform === "youtube-video" ? "16:9" : "9:16",
      status: "draft",
      commercialLicense: true,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      comments: [],
    };
    setProjects([newProj, ...projects]);
    setSelectedProjectId(newProj.id);
    setIsNewProjectModal(false);
    setNewProjectTitle("");
    setNewProjectDesc("");
  };

  const handleExportDeliveryZip = async () => {
    if (!selectedProject) return;
    const zip = new JSZip();

    // 1. Delivery manifest & commercial license
    const licenseDoc = `
================================================================================
BRANDFORGE STUDIO • COMMERCIAL DELIVERY & LICENSE MANIFEST
================================================================================
Client: ${selectedProject.clientName}
Project: ${selectedProject.title}
Version: v${selectedProject.version}
Platform: ${selectedProject.platform}
Aspect Ratio: ${selectedProject.aspectRatio}
Commercial License: ${selectedProject.commercialLicense ? "FULL COMMERCIAL USE AUTHORIZED" : "PERSONAL USE ONLY"}
Approval Status: ${selectedProject.status.toUpperCase()}
Delivery Timestamp: ${new Date().toISOString()}

LICENSING & MODEL ATTRIBUTION:
- Video Engine: FFmpeg H.264 High Profile / AAC Audio
- Visual Rendering: Mathematical Vector SVG & High-Resolution Canvas
- Subtitles: Clean SRT and WebVTT timed standards
- Watermarks: ${selectedProject.commercialLicense ? "None (Commercial Clean Master)" : "BrandForge Studio Free Export"}

DELIVERY ASSET CONTENTS:
- /video/ (Master MP4 video render)
- /subtitles/ (SRT & VTT closed captions)
- /campaign/ (Strategy, Hooks, Objections, Ad Copy)
- /brand/ (Design tokens, CSS variables, Palette)

Generated with BrandForge Studio.
`.trim();

    zip.file("COMMERCIAL_LICENSE_MANIFEST.txt", licenseDoc);

    // 2. Subtitles folder
    const srtContent = `1
00:00:00,000 --> 00:00:03,500
Klar for å nå målene dine med ${selectedProject.title}?

2
00:00:03,500 --> 00:00:07,500
Hos ${selectedProject.clientName} gir vi deg full kontroll og overskudd.

3
00:00:07,500 --> 00:00:11,500
Få spesialtilbud ved bestilling i dag!

4
00:00:11,500 --> 00:00:15,000
Trykk på linken i bio for å sikre deg din nå!
`;
    zip.file("subtitles/captions.srt", srtContent);
    zip.file(
      "subtitles/captions.vtt",
      "WEBVTT\n\n" + srtContent.replace(/,/g, ".")
    );

    // 3. Campaign strategy and social media copy
    const campaignDoc = `
# ${selectedProject.title} - Social Media & Publishing Plan

## Recommended Publishing Copy:
Klar for en enklere og mer strukturert hverdag? ✨
${selectedProject.description}
Sikre deg lanseringsrabatten via linken i bio nå før tilbudet utløper!

👉 Link i bio for umiddelbar tilgang.

## Target Platform:
- Platform: ${selectedProject.platform.toUpperCase()}
- Aspect Ratio: ${selectedProject.aspectRatio}
- Duration: 15s
- Optimal Posting Time: Mandag-Torsdag kl 18:00 - 21:00
`;
    zip.file("campaign/publishing_guide.md", campaignDoc);

    // 4. Master video export (embed real MP4 if rendered)
    if (selectedProject.renderedVideoUrl && selectedProject.renderedVideoUrl.includes(";base64,")) {
      const base64Data = selectedProject.renderedVideoUrl.split(";base64,")[1];
      zip.file("video/master_video.mp4", base64Data, { base64: true });
    } else {
      zip.file(
        "video/production_specification.json",
        JSON.stringify(
          {
            projectTitle: selectedProject.title,
            client: selectedProject.clientName,
            platform: selectedProject.platform,
            aspectRatio: selectedProject.aspectRatio,
            resolution: "1080x1920",
            videoCodec: "libx264 (H.264 High Profile)",
            audioCodec: "aac (192 kbps, 44.1kHz)",
            targetFps: 30,
            commercialLicense: selectedProject.commercialLicense,
            version: selectedProject.version,
          },
          null,
          2
        )
      );
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BrandForge_Delivery_${selectedProject.clientName.replace(/\s+/g, "_")}_v${selectedProject.version}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportBackup = () => {
    const backupData = {
      clients,
      projects,
      exportDate: new Date().toISOString(),
      studio: "BrandForge Studio",
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BrandForge_Studio_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#FF3B00]" />
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              Kunde- og Kampanjestyring (Commercial Hub)
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Administrer kundemapper, kampanjer, godkjenningsstatus, revisjonskommentarer og leveransepakker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewClientModal(true)}
            className="px-3 py-2 bg-[#1C1C1E] border border-[#333] hover:border-white text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF3B00]" />
            <span>Ny Kunde</span>
          </button>
          <button
            onClick={() => setIsNewProjectModal(true)}
            className="px-3 py-2 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ny Kampanje</span>
          </button>
          <button
            onClick={handleExportBackup}
            title="Eksporter full JSON sikkerhetskopi av alle kunder og prosjekter"
            className="p-2 border border-[#333] hover:border-[#666] text-zinc-400 hover:text-white cursor-pointer"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client List & Projects */}
        <div className="lg:col-span-4 space-y-6">
          {/* Client selector box */}
          <div className="bg-[#141416] border border-[#262626] p-4 space-y-3">
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
              Kunder ({clients.length})
            </div>
            <div className="space-y-1.5">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveClientId(c.id);
                    const firstProj = projects.find((p) => p.clientId === c.id);
                    if (firstProj) setSelectedProjectId(firstProj.id);
                  }}
                  className={`w-full text-left p-3 border transition-colors cursor-pointer flex items-center justify-between ${
                    c.id === activeClientId
                      ? "bg-[#1C1C1E] border-[#FF3B00]"
                      : "bg-[#111] border-[#222] hover:border-[#444]"
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-white">{c.name}</div>
                    <div className="text-[10px] font-mono text-zinc-400">{c.industry}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.brandColors.slice(0, 3).map((col, idx) => (
                      <span
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full border border-black/40"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Projects under active client */}
          <div className="bg-[#141416] border border-[#262626] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                Kampanjer for {activeClient?.name} ({clientProjects.length})
              </div>
              <button
                onClick={() => setIsNewProjectModal(true)}
                className="text-[10px] font-mono text-[#FF3B00] hover:underline cursor-pointer"
              >
                + Legg til
              </button>
            </div>

            {clientProjects.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs font-mono">
                Ingen kampanjer registrert ennå.
              </div>
            ) : (
              <div className="space-y-2">
                {clientProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full text-left p-3 border transition-colors cursor-pointer flex flex-col gap-1.5 ${
                      p.id === selectedProjectId
                        ? "bg-[#1C1C1E] border-[#FF3B00]"
                        : "bg-[#111] border-[#222] hover:border-[#444]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate max-w-[190px]">
                        {p.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 uppercase tracking-wider ${
                          p.status === "approved"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                            : p.status === "in_review"
                            ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                      <span>{p.platform.toUpperCase()}</span>
                      <span>•</span>
                      <span>v{p.version}</span>
                      <span>•</span>
                      <span>{p.comments.length} kommentarer</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Campaign Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {selectedProject ? (
            <div className="bg-[#141416] border border-[#262626] p-6 space-y-6">
              {/* Project Title & Approval Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{selectedProject.title}</h3>
                    <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 text-zinc-300 border border-zinc-700">
                      v{selectedProject.version}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{selectedProject.description}</p>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5">
                  {(["draft", "in_review", "approved", "delivered"] as ApprovalStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border cursor-pointer transition-colors ${
                          selectedProject.status === st
                            ? "bg-[#FF3B00] text-black font-black border-[#FF3B00]"
                            : "bg-[#181818] border-[#333] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Commercial License & Legal Attribution */}
              <div className="p-4 bg-[#18181A] border border-[#2A2A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white">Kommersiell Brukslisens</div>
                    <div className="text-[11px] text-zinc-400">
                      {selectedProject.commercialLicense
                        ? "Eksport uten vannmerke er godkjent for kommersiell distribusjon, annonsering og kundeleveranse."
                        : "Prosjektet er merket med referansevannmerke."}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleToggleCommercialLicense}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border cursor-pointer ${
                    selectedProject.commercialLicense
                      ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300"
                      : "bg-zinc-800 border-zinc-600 text-zinc-400"
                  }`}
                >
                  {selectedProject.commercialLicense ? "Kommersiell Aktiv" : "Aktiver Kommersiell"}
                </button>
              </div>

              {/* Delivery Package Export Button */}
              <div className="p-4 bg-gradient-to-r from-[#18181A] to-[#1F1715] border border-[#33221C] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-[#FF3B00]" />
                    <span>Komplett Leveransepakke (ZIP)</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Pakker video, SRT/VTT undertekster, publiseringsmanus, lisensmanifest og merkevareguide i én zip-fil.
                  </div>
                </div>
                <button
                  onClick={handleExportDeliveryZip}
                  className="px-4 py-2 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono tracking-widest cursor-pointer transition-colors"
                >
                  Last ned ZIP
                </button>
              </div>

              {/* Revision Comments & Client Feedback */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-zinc-400 tracking-wider">
                  <MessageSquare className="w-4 h-4 text-[#FF3B00]" />
                  <span>Kunde- og Revisjonsnotater ({selectedProject.comments.length})</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedProject.comments.length === 0 ? (
                    <div className="p-4 bg-[#111] border border-[#222] text-center text-zinc-500 text-xs font-mono">
                      Ingen kommentarer eller endringsønsker ennå.
                    </div>
                  ) : (
                    selectedProject.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 bg-[#111] border border-[#262626] rounded text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span className="font-bold text-white">{comm.author}</span>
                          <span>{new Date(comm.timestamp).toLocaleString("no-NO")}</span>
                        </div>
                        <p className="text-zinc-200">{comm.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Skriv tilbakemelding, endringsønske eller produksjonsnotat..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    className="flex-1 bg-[#111] border border-[#333] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF3B00]"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-[#1C1C1E] border border-[#333] hover:border-white text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#FF3B00]" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs bg-[#141416] border border-[#262626]">
              Velg eller opprett en kampanje for å se detaljer.
            </div>
          )}
        </div>
      </div>

      {/* New Client Modal */}
      {isNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateClient}
            className="bg-[#121214] border border-[#262626] w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="text-sm font-black uppercase text-white tracking-wide border-b border-[#222] pb-2">
              Opprett Ny Kunde
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Kundenavn / Bedrift:
              </label>
              <input
                type="text"
                required
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="F.eks. Vestland Solskjerming AS"
                className="w-full bg-[#18181A] border border-[#333] p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Bransje:</label>
              <input
                type="text"
                value={newClientIndustry}
                onChange={(e) => setNewClientIndustry(e.target.value)}
                placeholder="F.eks. Bygg & Håndverk"
                className="w-full bg-[#18181A] border border-[#333] p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">E-post:</label>
              <input
                type="email"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="post@bedrift.no"
                className="w-full bg-[#18181A] border border-[#333] p-2 text-xs text-white"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsNewClientModal(false)}
                className="px-3 py-1.5 border border-zinc-700 text-zinc-400 text-xs font-mono uppercase cursor-pointer"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#FF3B00] text-black font-black text-xs font-mono uppercase cursor-pointer"
              >
                Lagre Kunde
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Project Modal */}
      {isNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateProject}
            className="bg-[#121214] border border-[#262626] w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="text-sm font-black uppercase text-white tracking-wide border-b border-[#222] pb-2">
              Ny Kampanje for {activeClient?.name}
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Kampanjetittel:
              </label>
              <input
                type="text"
                required
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="F.eks. TikTok Høstkampanje 15s"
                className="w-full bg-[#18181A] border border-[#333] p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Plattform:</label>
              <select
                value={newProjectPlatform}
                onChange={(e) => setNewProjectPlatform(e.target.value as any)}
                className="w-full bg-[#18181A] border border-[#333] p-2 text-xs text-white"
              >
                <option value="tiktok">TikTok (9:16)</option>
                <option value="instagram-reel">Instagram Reel (9:16)</option>
                <option value="youtube-short">YouTube Short (9:16)</option>
                <option value="snapchat">Snapchat (9:16)</option>
                <option value="youtube-video">YouTube Film (16:9)</option>
                <option value="facebook-reel">Facebook Reel (9:16)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Beskrivelse:</label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Mål, tilbud og budskap..."
                rows={2}
                className="w-full bg-[#18181A] border border-[#333] p-2 text-xs text-white"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsNewProjectModal(false)}
                className="px-3 py-1.5 border border-zinc-700 text-zinc-400 text-xs font-mono uppercase cursor-pointer"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#FF3B00] text-black font-black text-xs font-mono uppercase cursor-pointer"
              >
                Opprett Kampanje
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
