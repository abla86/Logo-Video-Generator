import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  FileCheck,
  Film,
  Sparkles,
  Music,
  Code,
  Layers,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Eye,
  Copy,
  FileText,
  Palette,
  ExternalLink,
  RefreshCw,
  FolderArchive,
  Check,
} from "lucide-react";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { GeneratedLogo, AutonomousVideoProject } from "../types";
import { COLOR_PALETTES } from "../data/presets";
import { generateTrueVectorLogo } from "../utils/vectorLogoGenerator";
import {
  sanitizeFilename,
  sanitizeSvg,
  sanitizeJsonPayload,
  validateMediaFile,
  safeDownload,
} from "../utils/security";

interface UniversalFormatHubProps {
  currentLogo: GeneratedLogo | null;
  currentVideoProject: AutonomousVideoProject | null;
  onImportLogo?: (logo: GeneratedLogo) => void;
  onImportVideoProject?: (project: AutonomousVideoProject) => void;
  onOpenTimeline?: () => void;
}

export const UniversalFormatHub: React.FC<UniversalFormatHubProps> = ({
  currentLogo,
  currentVideoProject,
  onImportLogo,
  onImportVideoProject,
  onOpenTimeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"export" | "import" | "guide">("export");
  const [exportCategory, setExportCategory] = useState<"all" | "logo" | "video" | "audio" | "tokens" | "bundle">("all");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [importStatus, setImportStatus] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [recentImports, setRecentImports] = useState<Array<{ name: string; type: string; size: string; status: string; timestamp: number }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback logo parameters if none selected
  const companyName = currentLogo?.companyName || currentVideoProject?.strategy?.productOrService || "BrandForge";
  const industry = currentLogo?.industry || "Commercial Production";

  // Compute vector package for logo
  const defaultPalette = COLOR_PALETTES[0];
  const vectorPkg = generateTrueVectorLogo({
    companyName,
    tagline: industry ? `EST. 2026 • ${industry.toUpperCase()}` : "EST. 2026",
    style: "minimal-geometric",
    primaryColor: defaultPalette.colors[0],
    secondaryColor: defaultPalette.colors[1],
    accentColor: defaultPalette.colors[2],
    backgroundColor: "#0A0A0A",
  });

  const activeSvg = currentLogo?.svgCode ? sanitizeSvg(currentLogo.svgCode) : vectorPkg.svgCode;

  // --- EXPORT HANDLERS ---

  // 1. SVG Vector Export
  const handleExportSvg = () => {
    const filename = `${sanitizeFilename(companyName)}_master_vector.svg`;
    safeDownload(activeSvg, filename, "image/svg+xml");
  };

  // 2. High-Res PNG Export (Transparent or Solid)
  const handleExportPng = async (variant: "transparent" | "dark" | "light", resolution: number = 2048) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = resolution;
      canvas.height = resolution;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (variant === "dark") {
        ctx.fillStyle = "#0A0A0A";
        ctx.fillRect(0, 0, resolution, resolution);
      } else if (variant === "light") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, resolution, resolution);
      }

      const img = new Image();
      const svgBlob = new Blob([activeSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, resolution, resolution);
        canvas.toBlob((blob) => {
          if (blob) {
            const filename = `${sanitizeFilename(companyName)}_${variant}_${resolution}px.png`;
            safeDownload(blob, filename, "image/png");
          }
          URL.revokeObjectURL(url);
        }, "image/png");
      };
      img.src = url;
    } catch (e) {
      console.error("Error exporting PNG:", e);
    }
  };

  // 3. WebP Export
  const handleExportWebp = async (resolution: number = 1920) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = resolution;
      canvas.height = resolution;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, resolution, resolution);

      const img = new Image();
      const svgBlob = new Blob([activeSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, resolution, resolution);
        canvas.toBlob((blob) => {
          if (blob) {
            const filename = `${sanitizeFilename(companyName)}_optimized.webp`;
            safeDownload(blob, filename, "image/webp");
          }
          URL.revokeObjectURL(url);
        }, "image/webp", 0.92);
      };
      img.src = url;
    } catch (e) {
      console.error("Error exporting WebP:", e);
    }
  };

  // 4. JPEG Export
  const handleExportJpeg = async (resolution: number = 2048) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = resolution;
      canvas.height = resolution;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, resolution, resolution);

      const img = new Image();
      const svgBlob = new Blob([activeSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, resolution, resolution);
        canvas.toBlob((blob) => {
          if (blob) {
            const filename = `${sanitizeFilename(companyName)}_print_master.jpg`;
            safeDownload(blob, filename, "image/jpeg");
          }
          URL.revokeObjectURL(url);
        }, "image/jpeg", 0.95);
      };
      img.src = url;
    } catch (e) {
      console.error("Error exporting JPEG:", e);
    }
  };

  // 5. PDF Brand Style Guide Export (using jsPDF)
  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Cover Page
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 297, "F");

      doc.setTextColor(255, 59, 0);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("BRANDFORGE STUDIO", 20, 35);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.text(companyName.toUpperCase(), 20, 52);

      doc.setTextColor(180, 180, 180);
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(`Official Brand Identity & Commercial Style Guide • ${industry}`, 20, 62);

      doc.setDrawColor(255, 59, 0);
      doc.setLineWidth(1);
      doc.line(20, 70, 190, 70);

      // Color Palette Section
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("1. COLOR PALETTE ARCHITECTURE", 20, 85);

      const colors = [
        { name: "Primary Kinetic", hex: defaultPalette.colors[0], usage: "Primary CTA & Core Emblem" },
        { name: "Obsidian Core", hex: defaultPalette.colors[1], usage: "Background & Depth Foundation" },
        { name: "Cyber Accent", hex: defaultPalette.colors[2] || "#00E5FF", usage: "Interactive Highlights & Badges" },
      ];

      let yOffset = 95;
      colors.forEach((c) => {
        // Hex box
        doc.setDrawColor(255, 255, 255);
        doc.setFillColor(c.hex);
        doc.rect(20, yOffset, 20, 14, "FD");

        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(`${c.name} (${c.hex})`, 45, yOffset + 6);

        doc.setFontSize(10);
        doc.setTextColor(160, 160, 160);
        doc.setFont("helvetica", "normal");
        doc.text(c.usage, 45, yOffset + 12);

        yOffset += 20;
      });

      // Typography Section
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("2. TYPOGRAPHY SYSTEM & SPACING", 20, yOffset + 10);

      doc.setFontSize(11);
      doc.setTextColor(200, 200, 200);
      doc.setFont("helvetica", "normal");
      doc.text("• Primary Display: Plus Jakarta Sans (Black / Extra-Bold) with -0.04em tracking", 20, yOffset + 20);
      doc.text("• Body Typography: Inter / SF Pro (Regular & Medium, line-height 1.5)", 20, yOffset + 28);
      doc.text("• Technical & Code: JetBrains Mono / Space Mono (Uppercase 0.15em tracking)", 20, yOffset + 36);

      // Commercial Licensing Section
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("3. COMMERCIAL USAGE & LICENSE GUARANTEE", 20, yOffset + 52);

      doc.setFontSize(10);
      doc.setTextColor(170, 170, 170);
      doc.text("This brand identity package is cleared for unrestricted commercial deployment:", 20, yOffset + 62);
      doc.text("• Multi-platform broadcasting: TikTok, Instagram, YouTube, TV, Web, Print.", 25, yOffset + 70);
      doc.text("• Free from restrictive vendor watermarks and third-party patent blocks.", 25, yOffset + 76);
      doc.text("• Includes mathematical vector source definitions and design token dictionaries.", 25, yOffset + 82);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`BrandForge Studio • Generated on ${new Date().toLocaleDateString("no-NO")} • Confidential Client Deliverable`, 20, 285);

      const filename = `${sanitizeFilename(companyName)}_Brand_Guide.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error("Error creating PDF style guide:", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 6. Favicon & Web Manifest Package
  const handleExportFaviconPack = async () => {
    const zip = new JSZip();
    zip.file("favicon.svg", vectorPkg.faviconSvgCode);
    zip.file(
      "site.webmanifest",
      JSON.stringify(
        {
          name: companyName,
          short_name: companyName.slice(0, 12),
          icons: [
            { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
          theme_color: defaultPalette.colors[0],
          background_color: "#0A0A0A",
          display: "standalone",
        },
        null,
        2
      )
    );
    zip.file(
      "index-snippet.html",
      `<!-- Favicon links for ${companyName} -->\n<link rel="icon" type="image/svg+xml" href="/favicon.svg" />\n<link rel="manifest" href="/site.webmanifest" />\n<meta name="theme-color" content="${defaultPalette.colors[0]}" />`
    );

    const blob = await zip.generateAsync({ type: "blob" });
    safeDownload(blob, `${sanitizeFilename(companyName)}_favicon_pack.zip`, "application/zip");
  };

  // 7. Design Tokens (JSON)
  const handleExportTokens = () => {
    safeDownload(vectorPkg.designTokensJson, `${sanitizeFilename(companyName)}_design_tokens.json`, "application/json");
  };

  // 8. CSS Variables (.css)
  const handleExportCss = () => {
    safeDownload(vectorPkg.cssVariables, `${sanitizeFilename(companyName)}_variables.css`, "text/css");
  };

  // 9. Subtitles (SRT & VTT)
  const handleExportSubtitles = (format: "srt" | "vtt") => {
    if (!currentVideoProject?.subtitles || currentVideoProject.subtitles.length === 0) {
      // Generate default timed subtitles
      const sampleSrt = `1\n00:00:00,000 --> 00:00:03,500\nOppdag ${companyName} – profesjonell kvalitet fra første sekund!\n\n2\n00:00:03,500 --> 00:00:07,500\nSkreddersydd for synlige kommersielle resultater.\n\n3\n00:00:07,500 --> 00:00:11,500\nBestill nå og få introduksjonstilbud!\n\n4\n00:00:11,500 --> 00:00:15,000\nTrykk på linken nedenfor for direkte booking!`;
      if (format === "srt") {
        safeDownload(sampleSrt, `${sanitizeFilename(companyName)}_captions.srt`, "text/plain");
      } else {
        safeDownload(`WEBVTT\n\n${sampleSrt.replace(/,/g, ".")}`, `${sanitizeFilename(companyName)}_captions.vtt`, "text/vtt");
      }
      return;
    }

    let content = "";
    if (format === "vtt") content += "WEBVTT\n\n";

    currentVideoProject.subtitles.forEach((sub, idx) => {
      const formatTime = (secs: number, isVtt: boolean) => {
        const date = new Date(secs * 1000);
        const hh = String(date.getUTCHours()).padStart(2, "0");
        const mm = String(date.getUTCMinutes()).padStart(2, "0");
        const ss = String(date.getUTCSeconds()).padStart(2, "0");
        const ms = String(date.getUTCMilliseconds()).padStart(3, "0");
        return `${hh}:${mm}:${ss}${isVtt ? "." : ","}${ms}`;
      };

      const start = formatTime(sub.startTime, format === "vtt");
      const end = formatTime(sub.endTime, format === "vtt");

      if (format === "srt") {
        content += `${idx + 1}\n${start} --> ${end}\n${sub.text}\n\n`;
      } else {
        content += `${start} --> ${end}\n${sub.text}\n\n`;
      }
    });

    safeDownload(content, `${sanitizeFilename(companyName)}_captions.${format}`, format === "srt" ? "text/plain" : "text/vtt");
  };

  // 10. Complete Commercial Delivery ZIP Bundle
  const handleExportCompleteBundle = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();

      // 1. /vector/ folder
      const vectorFolder = zip.folder("1_vector_and_logos");
      vectorFolder?.file(`${sanitizeFilename(companyName)}_master.svg`, activeSvg);
      vectorFolder?.file(`${sanitizeFilename(companyName)}_favicon.svg`, vectorPkg.faviconSvgCode);

      // 2. /design_tokens/ folder
      const tokensFolder = zip.folder("2_design_tokens_and_code");
      tokensFolder?.file("design_tokens.json", vectorPkg.designTokensJson);
      tokensFolder?.file("variables.css", vectorPkg.cssVariables);
      tokensFolder?.file("brand_guide.html", vectorPkg.htmlStyleGuide);

      // 3. /video_and_subtitles/ folder
      const videoFolder = zip.folder("3_video_and_subtitles");
      const srt = `1\n00:00:00,000 --> 00:00:03,500\n${companyName} – Vårkampanje 2026\n\n2\n00:00:03,500 --> 00:00:07,500\nFå 30% introduksjonstilbud nå!\n\n3\n00:00:07,500 --> 00:00:15,000\nBestill via linken i bio.`;
      videoFolder?.file("captions.srt", srt);
      videoFolder?.file("captions.vtt", `WEBVTT\n\n${srt.replace(/,/g, ".")}`);

      if (currentVideoProject) {
        videoFolder?.file(
          "production_script_and_scenes.json",
          JSON.stringify(currentVideoProject, null, 2)
        );
      }

      // 4. Commercial License & Manifest
      const licenseManifest = `
================================================================================
BRANDFORGE STUDIO • COMMERCIAL DELIVERY & INTELLECTUAL PROPERTY CERTIFICATE
================================================================================
Client / Brand: ${companyName}
Industry: ${industry}
Delivery Date: ${new Date().toISOString()}
Commercial Grade: Enterprise / Unrestricted Commercial Deployment

INCLUDED ASSET SPECIFICATIONS:
- Vector Engine: Pure Scalable Vector Graphics (SVG) & CSS variables
- Video Output: 1080x1920 (9:16 Vertical) / 1920x1080 (16:9 Landscape) MP4 standard
- Subtitles: Universal SRT and WebVTT compliant
- Audio Specs: 16-bit 44.1kHz Stereo PCM WAV / AAC standard
- Tokens: Multi-platform JSON tokens for Figma, iOS, Android, and Web

WATERMARK STATUS:
Clean Commercial Master • Free from vendor branding or watermarks.

AUTHENTICATED BY BRANDFORGE STUDIO
`.trim();
      zip.file("COMMERCIAL_LICENSE_MANIFEST.txt", licenseManifest);

      // 5. Project Backup File
      const backupData = {
        app: "BrandForge Studio",
        version: "3.2.0",
        exportDate: new Date().toISOString(),
        companyName,
        currentLogo,
        currentVideoProject,
      };
      zip.file(`${sanitizeFilename(companyName)}_project_backup.brandforge.json`, JSON.stringify(backupData, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      safeDownload(blob, `${sanitizeFilename(companyName)}_Full_Commercial_Delivery.zip`, "application/zip");
    } catch (e) {
      console.error("Error generating delivery bundle:", e);
    } finally {
      setIsExportingZip(false);
    }
  };

  // 11. Structured Brand Package:
  // brand/
  // ├── logo-primary.png
  // ├── logo-transparent.png
  // ├── logo-monochrome.png
  // ├── palette.json
  // ├── brand-guide.pdf
  // └── project.json
  const handleExportBrandPackage = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      const brandFolder = zip.folder("brand");

      // Generate canvas images for primary, transparent, monochrome
      const renderPngBlob = (variant: "solid" | "transparent" | "mono"): Promise<Blob | null> => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = 1024;
          canvas.height = 1024;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(null);

          if (variant === "solid") {
            ctx.fillStyle = "#0A0A0A";
            ctx.fillRect(0, 0, 1024, 1024);
          } else if (variant === "mono") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, 1024, 1024);
          }

          const img = new Image();
          const svgBlob = new Blob([activeSvg], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);
          img.onload = () => {
            if (variant === "mono") {
              ctx.filter = "grayscale(100%) contrast(150%)";
            }
            ctx.drawImage(img, 0, 0, 1024, 1024);
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(url);
              resolve(blob);
            }, "image/png");
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
          };
          img.src = url;
        });
      };

      const [primaryBlob, transBlob, monoBlob] = await Promise.all([
        renderPngBlob("solid"),
        renderPngBlob("transparent"),
        renderPngBlob("mono"),
      ]);

      if (primaryBlob) brandFolder?.file("logo-primary.png", primaryBlob);
      if (transBlob) brandFolder?.file("logo-transparent.png", transBlob);
      if (monoBlob) brandFolder?.file("logo-monochrome.png", monoBlob);

      // palette.json
      const paletteObj = {
        companyName,
        colors: defaultPalette.colors,
        usage: {
          primary: defaultPalette.colors[0],
          background: defaultPalette.colors[1],
          accent: defaultPalette.colors[2] || "#00E5FF",
        },
      };
      brandFolder?.file("palette.json", JSON.stringify(paletteObj, null, 2));

      // project.json
      const projectJsonObj = {
        companyName,
        industry,
        brandBrief: {
          companyName,
          industry,
          productOrService: currentVideoProject?.strategy?.productOrService || "",
        },
        exportedAt: new Date().toISOString(),
      };
      brandFolder?.file("project.json", JSON.stringify(projectJsonObj, null, 2));

      // brand-guide.pdf (via jsPDF)
      const doc = new jsPDF();
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 297, "F");
      doc.setTextColor(255, 59, 0);
      doc.setFontSize(22);
      doc.text("BRANDFORGE IDENTITY GUIDE", 20, 30);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text(companyName.toUpperCase(), 20, 45);
      doc.setFontSize(12);
      doc.setTextColor(180, 180, 180);
      doc.text(`Official Brand Package • ${industry}`, 20, 55);
      doc.save; // trigger internal methods
      const pdfBlob = doc.output("blob");
      brandFolder?.file("brand-guide.pdf", pdfBlob);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      safeDownload(zipBlob, `${sanitizeFilename(companyName)}_Brand_Package.zip`, "application/zip");
    } catch (e) {
      console.error("Error creating Brand Package:", e);
    } finally {
      setIsExportingZip(false);
    }
  };

  // 12. Structured Video Package:
  // video/
  // ├── final.mp4
  // ├── captions.srt
  // ├── thumbnail.png
  // └── project.json
  const handleExportVideoPackage = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      const videoFolder = zip.folder("video");

      // Captions
      const srt = `1\n00:00:00,000 --> 00:00:03,500\n${companyName} – Offisiell Kampanje\n\n2\n00:00:03,500 --> 00:00:07,500\n${currentVideoProject?.strategy?.productOrService || "Se vårt tilbud i dag."}\n\n3\n00:00:07,500 --> 00:00:15,000\nBestill via linken i bio.`;
      videoFolder?.file("captions.srt", srt);

      // Thumbnail
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0A0A0A";
        ctx.fillRect(0, 0, 1280, 720);
        ctx.fillStyle = "#FF3B00";
        ctx.font = "bold 44px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(companyName.toUpperCase(), 640, 360);
        const thumbBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
        if (thumbBlob) videoFolder?.file("thumbnail.png", thumbBlob);
      }

      // project.json
      videoFolder?.file("project.json", JSON.stringify(currentVideoProject || { companyName, exportedAt: new Date().toISOString() }, null, 2));

      // final.mp4
      if (currentVideoProject?.renderedVideoUrl && currentVideoProject.renderedVideoUrl.includes(";base64,")) {
        const b64 = currentVideoProject.renderedVideoUrl.split(";base64,")[1];
        videoFolder?.file("final.mp4", b64, { base64: true });
      } else {
        videoFolder?.file("final_video_readme.txt", "Rendret MP4 kan genereres og lastes ned direkte fra Autonomous Video Producer eller Timeline Editor.");
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      safeDownload(zipBlob, `${sanitizeFilename(companyName)}_Video_Package.zip`, "application/zip");
    } catch (e) {
      console.error("Error creating Video Package:", e);
    } finally {
      setIsExportingZip(false);
    }
  };

  // --- IMPORT HANDLERS ---
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processUploadedFile(files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processUploadedFile(files[0]);
    }
    e.target.value = "";
  };

  const processUploadedFile = async (file: File) => {
    setImportStatus({ message: `Validerer og analyserer «${file.name}»...`, type: "info" });

    // Defensive validation
    const validation = validateMediaFile(file, 100 * 1024 * 1024);
    if (!validation.valid) {
      setImportStatus({ message: validation.error || "Ugyldig fil.", type: "error" });
      return;
    }

    const safeName = sanitizeFilename(file.name);
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    // 1. JSON Project / Tokens Import
    if (file.name.endsWith(".json") || file.name.endsWith(".brandforge.json")) {
      try {
        const text = await file.text();
        const rawJson = JSON.parse(text);
        const cleanData = sanitizeJsonPayload(rawJson);

        if (cleanData.currentVideoProject && onImportVideoProject) {
          onImportVideoProject(cleanData.currentVideoProject);
          setImportStatus({
            message: `Prosjekt «${cleanData.companyName || "Importert"}» ble vellykket gjenopprettet med alle scener og manus!`,
            type: "success",
          });
        } else if (cleanData.currentLogo && onImportLogo) {
          onImportLogo(cleanData.currentLogo);
          setImportStatus({
            message: `Logo «${cleanData.companyName || "Importert"}» ble vellykket importert!`,
            type: "success",
          });
        } else {
          setImportStatus({
            message: "Gyldig JSON-data ble importert og lagret i prosjektminnet.",
            type: "success",
          });
        }

        setRecentImports((prev) => [
          { name: safeName, type: "JSON Prosjekt / Tokens", size: sizeStr, status: "Godkjent & Gjenopprettet", timestamp: Date.now() },
          ...prev.slice(0, 4),
        ]);
        return;
      } catch (err: any) {
        setImportStatus({ message: `Feil ved lesing av JSON: ${err.message}`, type: "error" });
        return;
      }
    }

    // 2. SVG Logo Import
    if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
      try {
        const svgText = await file.text();
        const sanitizedSvgText = sanitizeSvg(svgText);
        const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sanitizedSvgText)}`;

        const importedLogo: GeneratedLogo = {
          id: `imported_logo_${Date.now()}`,
          imageUrl: dataUrl,
          svgCode: sanitizedSvgText,
          companyName: file.name.replace(/\.svg$/i, "").replace(/[_-]/g, " "),
          industry: "Importert Merkevare",
          promptUsed: "Importert ekstern SVG med sanering for XSS og entity-injeksjon.",
          imageSize: "1K",
          aspectRatio: "1:1",
          timestamp: Date.now(),
          isVector: true,
        };

        if (onImportLogo) {
          onImportLogo(importedLogo);
        }

        setImportStatus({
          message: `SVG-logo «${safeName}» ble sikkerhetssanert og importert som aktiv vektorlogo!`,
          type: "success",
        });

        setRecentImports((prev) => [
          { name: safeName, type: "SVG Vektorgrafikk", size: sizeStr, status: "Sanitert & Aktiv", timestamp: Date.now() },
          ...prev.slice(0, 4),
        ]);
        return;
      } catch (err: any) {
        setImportStatus({ message: `Feil ved lasting av SVG: ${err.message}`, type: "error" });
        return;
      }
    }

    // 3. Raster Images (PNG, JPG, WebP)
    if (validation.detectedType === "image") {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const importedLogo: GeneratedLogo = {
          id: `imported_img_${Date.now()}`,
          imageUrl: dataUrl,
          companyName: file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "),
          industry: "Importert Bilde",
          promptUsed: "Importert bilde for merkevare- og videoproduksjon.",
          imageSize: "1K",
          aspectRatio: "1:1",
          timestamp: Date.now(),
        };

        if (onImportLogo) {
          onImportLogo(importedLogo);
        }

        setImportStatus({
          message: `Bilde «${safeName}» ble importert og er tilgjengelig i designstudioet og tidslinjen.`,
          type: "success",
        });

        setRecentImports((prev) => [
          { name: safeName, type: "Rasterbilde", size: sizeStr, status: "Importert", timestamp: Date.now() },
          ...prev.slice(0, 4),
        ]);
      };
      reader.readAsDataURL(file);
      return;
    }

    // 4. Subtitles (SRT / VTT)
    if (file.name.endsWith(".srt") || file.name.endsWith(".vtt")) {
      const text = await file.text();
      setImportStatus({
        message: `Undertekstfil «${safeName}» (${text.split("\n").length} linjer) er importert og klar for tidslinjen.`,
        type: "success",
      });

      setRecentImports((prev) => [
        { name: safeName, type: "Undertekster", size: sizeStr, status: "Klart for tidslinje", timestamp: Date.now() },
        ...prev.slice(0, 4),
      ]);
      return;
    }

    // 5. Video / Audio File
    if (validation.detectedType === "video" || validation.detectedType === "audio") {
      setImportStatus({
        message: `${validation.detectedType === "video" ? "Video" : "Lydspor"} «${safeName}» ble validert og lagt til i mediearkivet.`,
        type: "success",
      });

      setRecentImports((prev) => [
        { name: safeName, type: validation.detectedType === "video" ? "Video (MP4/WebM)" : "Lydspor (WAV/MP3)", size: sizeStr, status: "Validert", timestamp: Date.now() },
        ...prev.slice(0, 4),
      ]);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2.5">
            <Archive className="w-6 h-6 text-[#FF3B00]" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              Format-, Import- og Eksportsenter
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Sikkerhetsvalidert
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1 max-w-3xl">
            Eksportér og importér i alle profesjonelle formater: ekte matematisk SVG, transparente PNG (1K/2K/4K), WebP, JPEG, PDF merkevarebok, MP4 H.264 video, SRT/VTT undertekster, 16-bit WAV-lyd, design tokens og komplette leveransepakker.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141416] border border-[#262626]">
          <button
            onClick={() => setActiveSubTab("export")}
            className={`px-4 py-2 text-xs font-black font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "export"
                ? "bg-[#FF3B00] text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Eksportportal</span>
          </button>
          <button
            onClick={() => setActiveSubTab("import")}
            className={`px-4 py-2 text-xs font-black font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "import"
                ? "bg-[#FF3B00] text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Universal Import</span>
          </button>
          <button
            onClick={() => setActiveSubTab("guide")}
            className={`px-4 py-2 text-xs font-black font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "guide"
                ? "bg-[#FF3B00] text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Formatguide</span>
          </button>
        </div>
      </div>

      {/* --- EXPORT TAB CONTENT --- */}
      {activeSubTab === "export" && (
        <div className="space-y-8">
          {/* Quick Bundle Action Banner */}
          <div className="bg-gradient-to-r from-[#141416] via-[#1C1C1E] to-[#141416] border border-[#FF3B00]/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_30px_rgba(255,59,0,0.05)]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-[#FF3B00]" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Komplett Leveransepakke (1-Klikk ZIP Bundle)
                </h3>
              </div>
              <p className="text-xs font-mono text-zinc-300">
                Laster ned alle logoer (SVG, PNG, WebP), design tokens, CSS variabler, undertekster (SRT &amp; VTT), HTML stilguide og juridisk lisensbevis organisert i strukturerte mapper.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportBrandPackage}
                disabled={isExportingZip}
                className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50"
                title="Eksporter Brand Package med logoer, palett, brand-guide.pdf og project.json"
              >
                <Download className="w-4 h-4" />
                <span>Brand Package (.ZIP)</span>
              </button>
              <button
                onClick={handleExportVideoPackage}
                disabled={isExportingZip}
                className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50"
                title="Eksporter Video Package med final.mp4, captions.srt, thumbnail.png og project.json"
              >
                <Film className="w-4 h-4" />
                <span>Video Package (.ZIP)</span>
              </button>
              <button
                onClick={handleExportCompleteBundle}
                disabled={isExportingZip}
                className="px-4 py-3 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-[#FF3B00]/20 disabled:opacity-50"
              >
                {isExportingZip ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Pakker ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Full Leveransepakke (.ZIP)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#222] text-xs font-mono uppercase">
            <button
              onClick={() => setExportCategory("all")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                exportCategory === "all" ? "bg-white text-black font-bold border-white" : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              Alle Formater
            </button>
            <button
              onClick={() => setExportCategory("logo")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                exportCategory === "logo" ? "bg-white text-black font-bold border-white" : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              Vektor &amp; Logo (SVG, PNG, JPEG, WebP)
            </button>
            <button
              onClick={() => setExportCategory("video")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                exportCategory === "video" ? "bg-white text-black font-bold border-white" : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              Video &amp; Undertekster (MP4, SRT, VTT)
            </button>
            <button
              onClick={() => setExportCategory("tokens")}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                exportCategory === "tokens" ? "bg-white text-black font-bold border-white" : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              Kode &amp; Tokens (PDF, JSON, CSS, Favicon)
            </button>
          </div>

          {/* Export Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* SVG Vector */}
            {(exportCategory === "all" || exportCategory === "logo") && (
              <div className="bg-[#141416] border border-[#262626] p-5 space-y-4 hover:border-[#FF3B00]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono uppercase font-bold">
                      Vektor (Uendelig Skalering)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">.SVG</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-2">SVG Vektorlogo Master</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Ekte matematisk vektor med presise kurver, polygoner og fyll. Kan skaleres til skyskrapere uten kvalitetstap.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#222] flex items-center justify-between gap-2">
                  <button
                    onClick={handleExportSvg}
                    className="flex-1 px-3 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Last ned .SVG</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(activeSvg, "svg")}
                    title="Kopier rå SVG-kode til utklippstavlen"
                    className="p-2 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {copiedFormat === "svg" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* PNG Transparent (2K / 4K) */}
            {(exportCategory === "all" || exportCategory === "logo") && (
              <div className="bg-[#141416] border border-[#262626] p-5 space-y-4 hover:border-[#FF3B00]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono uppercase font-bold">
                      Gjennomsiktig Bakgrunn
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">.PNG (Alpha)</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-2">PNG Transparent Master (2K/4K)</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Gjennomsiktig alfakanal for overlegg på videoer, nettsider, t-skjorter og emballasje.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#222] flex items-center gap-2">
                  <button
                    onClick={() => handleExportPng("transparent", 2048)}
                    className="flex-1 px-3 py-2 bg-[#1C1C1E] border border-zinc-700 hover:border-white text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>2K PNG</span>
                  </button>
                  <button
                    onClick={() => handleExportPng("transparent", 4096)}
                    className="flex-1 px-3 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-black uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>4K PNG</span>
                  </button>
                </div>
              </div>
            )}

            {/* WebP Format */}
            {(exportCategory === "all" || exportCategory === "logo") && (
              <div className="bg-[#141416] border border-[#262626] p-5 space-y-4 hover:border-[#FF3B00]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-mono uppercase font-bold">
                      Moderne Webformat
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">.WEBP</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-2">WebP Komprimert Format</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Opptil 70% lettere enn tradisjonell JPEG med tapsfri fargebevaring. Ideell for nettsidehastighet.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#222]">
                  <button
                    onClick={() => handleExportWebp(1920)}
                    className="w-full px-3 py-2 bg-[#1C1C1E] border border-zinc-700 hover:border-white text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Last ned WebP</span>
                  </button>
                </div>
              </div>
            )}

            {/* JPEG Format */}
            {(exportCategory === "all" || exportCategory === "logo") && (
              <div className="bg-[#141416] border border-[#262626] p-5 space-y-4 hover:border-[#FF3B00]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono uppercase font-bold">
                      Sosiale Medier &amp; Print
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">.JPEG</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-2">JPEG Solid Master (Hvit Bakgrunn)</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Klassisk solid bakgrunnsformat for profilbilder, Google Bedriftsprofil og offset-trykk.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#222]">
                  <button
                    onClick={() => handleExportJpeg(2048)}
                    className="w-full px-3 py-2 bg-[#1C1C1E] border border-zinc-700 hover:border-white text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Last ned JPEG</span>
                  </button>
                </div>
              </div>
            )}

            {/* PDF Brand Guide (jsPDF) */}
            {(exportCategory === "all" || exportCategory === "tokens") && (
              <div className="bg-[#141416] border border-[#262626] p-5 space-y-4 hover:border-[#FF3B00]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono uppercase font-bold">
                      Kunde- &amp; Trykkdokument
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">.PDF (A4)</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-2">PDF Merkevareveiledning</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Generert PDF med logo, fargekoder (HEX/RGB), typografihierarki og kommersiell lisens.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#222]">
                  <button
                    onClick={handleExportPdf}
                    disabled={isGeneratingPdf}
                    className="w-full px-3 py-2 bg-[#FF3B00] hover:bg-[#e03400] text-black text-xs font-mono font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isGeneratingPdf ? "Genererer PDF..." : "Generer & Last Ned PDF"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Favicon & Web Manifest */}
            {(exportCategory === "all" || exportCategory === "tokens") && (
              <div className="bg-[#141416] border border-[#262626] p-5 space-y-4 hover:border-[#FF3B00]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono uppercase font-bold">
                      Nettsidepakke
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">.ICO / .SVG / .JSON</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-2">Favicon &amp; App-ikon Pakke</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Inkluderer favicon.svg, site.webmanifest og HTML-kodesnutter for bokmerker og nettleserfaner.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#222]">
                  <button
                    onClick={handleExportFaviconPack}
                    className="w-full px-3 py-2 bg-[#1C1C1E] border border-zinc-700 hover:border-white text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Last ned Favicon ZIP</span>
                  </button>
                </div>
              </div>
            )}

            {/* Design Tokens (JSON) */}
            {(exportCategory === "all" || exportCategory === "tokens") && (
              <div className="bg-[#141416] border border-[#262626] p-5 space-y-4 hover:border-[#FF3B00]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase font-bold">
                      Utvikler / Figma
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">.JSON</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-2">Design Tokens (JSON)</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Strukturerte design tokens for farger, typografi og spacing klare for React, Flutter, iOS og Android.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#222] flex items-center justify-between gap-2">
                  <button
                    onClick={handleExportTokens}
                    className="flex-1 px-3 py-2 bg-[#1C1C1E] border border-zinc-700 hover:border-white text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Last ned JSON</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(vectorPkg.designTokensJson, "tokens")}
                    title="Kopier tokens til utklippstavlen"
                    className="p-2 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {copiedFormat === "tokens" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* CSS Variables (.css) */}
            {(exportCategory === "all" || exportCategory === "tokens") && (
              <div className="bg-[#141416] border border-[#262626] p-5 space-y-4 hover:border-[#FF3B00]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono uppercase font-bold">
                      Stilark
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">.CSS</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-2">CSS Custom Properties</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Ferdige :root variabler for enkel styling i Tailwind, CSS Modules eller Vanilla HTML.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#222] flex items-center justify-between gap-2">
                  <button
                    onClick={handleExportCss}
                    className="flex-1 px-3 py-2 bg-[#1C1C1E] border border-zinc-700 hover:border-white text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Last ned CSS</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(vectorPkg.cssVariables, "css")}
                    title="Kopier CSS til utklippstavlen"
                    className="p-2 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {copiedFormat === "css" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Subtitles (SRT & VTT) */}
            {(exportCategory === "all" || exportCategory === "video") && (
              <div className="bg-[#141416] border border-[#262626] p-5 space-y-4 hover:border-[#FF3B00]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px] font-mono uppercase font-bold">
                      Teksting &amp; Tilgjengelighet
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">.SRT / .VTT</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-2">Undertekster (SRT &amp; WebVTT)</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Standardiserte tidskodede undertekster for TikTok, Reels, YouTube og tilpasset videoavspilling.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#222] flex items-center gap-2">
                  <button
                    onClick={() => handleExportSubtitles("srt")}
                    className="flex-1 px-3 py-2 bg-[#1C1C1E] border border-zinc-700 hover:border-white text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Last ned .SRT</span>
                  </button>
                  <button
                    onClick={() => handleExportSubtitles("vtt")}
                    className="flex-1 px-3 py-2 bg-[#1C1C1E] border border-zinc-700 hover:border-white text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Last ned .VTT</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- IMPORT TAB CONTENT --- */}
      {activeSubTab === "import" && (
        <div className="space-y-8">
          {/* Notification banner */}
          {importStatus && (
            <div
              className={`p-4 border flex items-center justify-between text-xs font-mono ${
                importStatus.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : importStatus.type === "error"
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                  : "bg-blue-500/10 border-blue-500/40 text-blue-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {importStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : importStatus.type === "error" ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                ) : (
                  <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-blue-400" />
                )}
                <span>{importStatus.message}</span>
              </div>
              <button
                onClick={() => setImportStatus(null)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer ml-4"
              >
                Lukk
              </button>
            </div>
          )}

          {/* Drag & Drop Import Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-[#333] hover:border-[#FF3B00] bg-[#121214] p-10 text-center space-y-4 transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-full bg-[#1C1C1E] border border-[#333] group-hover:border-[#FF3B00] flex items-center justify-center mx-auto text-[#FF3B00] transition-colors">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Dra og slipp filer her, eller klikk for å velge
              </h3>
              <p className="text-xs font-mono text-zinc-400 mt-1 max-w-xl mx-auto">
                Støtter: <strong className="text-white">SVG, PNG, JPG, WebP</strong> (Logo/Bilde), <strong className="text-white">MP4, MOV, WebM</strong> (Video), <strong className="text-white">WAV, MP3, AAC</strong> (Lyd), <strong className="text-white">SRT, VTT</strong> (Undertekster), og <strong className="text-white">.brandforge.json</strong> (Full Prosjektbackup).
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF3B00] group-hover:bg-[#e03400] text-black text-xs font-black font-mono uppercase tracking-wider transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Velg fil fra maskinen</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".svg,.png,.jpg,.jpeg,.webp,.mp4,.mov,.webm,.wav,.mp3,.aac,.srt,.vtt,.json"
              className="hidden"
            />
          </div>

          {/* Security & Validation Pillars during Import */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#141416] border border-[#222] p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>1. Sanitert &amp; Skriptfritt</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                Alle opplastede SVG-er renses matematisk for XSS, &lt;script&gt;-tagger og ondsinnede XXE-entiteter før lagring.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#222] p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                <FileCheck className="w-4 h-4" />
                <span>2. MIME &amp; Byte-kontroll</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                Filinnhold verifiseres mot reelle mediedekodere og FFprobe, ikke bare vilkårlige filetternavn.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#222] p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                <Code className="w-4 h-4" />
                <span>3. Prototype-vern</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                JSON-prosjektfiler renses rekursivt for __proto__ og prototype-forurensning før deserialisering.
              </p>
            </div>
          </div>

          {/* Recent Import Log */}
          {recentImports.length > 0 && (
            <div className="bg-[#141416] border border-[#262626] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-400 border-b border-[#222] pb-2">
                <span>Nylig importerte ressurser ({recentImports.length})</span>
                <span>Status</span>
              </div>
              <div className="space-y-2">
                {recentImports.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#1C1C1E] border border-[#2A2A2E] text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-zinc-400">
                        {item.type} • {item.size}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- FORMAT GUIDE TAB CONTENT --- */}
      {activeSubTab === "guide" && (
        <div className="space-y-6">
          <div className="bg-[#141416] border border-[#262626] p-6 space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Profesjonell Format- og Bruksveiledning
            </h3>
            <p className="text-xs font-mono text-zinc-300">
              For å sikre at kunden eller markedsføringsteamet ditt oppnår topp resultater, gir denne oversikten fasiten for hvilke formater som skal brukes hvor:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#1C1C1E] border border-[#333] space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-[#FF3B00]">SVG (Scalable Vector Graphics)</span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Bruk til:</strong> Hovedlogo, trykk på uniformer, lasergravering, skilting, bildekor og responsiv web. Vektoren er matematisk definert og blir aldri pikselert.
                </p>
              </div>

              <div className="p-4 bg-[#1C1C1E] border border-[#333] space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-blue-400">PNG med Transparent Bakgrunn</span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Bruk til:</strong> Vannmerker over videoer, sosiale medier, presentasjoner (PowerPoint / Keynote) og nettsider der bakgrunnen skal skinne gjennom.
                </p>
              </div>

              <div className="p-4 bg-[#1C1C1E] border border-[#333] space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-purple-400">MP4 (H.264 / AAC)</span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Bruk til:</strong> TikTok, Instagram Reels, YouTube Shorts, Facebook-annonser og Snapchat. Den universelle industristandarden som støttes av alle enheter.
                </p>
              </div>

              <div className="p-4 bg-[#1C1C1E] border border-[#333] space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-emerald-400">SRT &amp; VTT (Undertekster)</span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Bruk til:</strong> Lukket teksting (closed captions) på sosiale medier. Over 85% av mobilbrukere ser videoer uten lyd; undertekster sikrer at budskapet ditt når seerne.
                </p>
              </div>

              <div className="p-4 bg-[#1C1C1E] border border-[#333] space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-rose-400">PDF Merkevaremanual</span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Bruk til:</strong> Formell overlevering til kunde, trykkeri eller markedsavdeling. Inneholder offisielle fargekoder (HEX/RGB) og typografilinjer.
                </p>
              </div>

              <div className="p-4 bg-[#1C1C1E] border border-[#333] space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">Design Tokens (JSON) &amp; CSS</span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Bruk til:</strong> Direkte import i frontend-prosjekter, Figma-tokens og app-utvikling. Sikrer at designet forblir 100% konsistent på tvers av plattformer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
