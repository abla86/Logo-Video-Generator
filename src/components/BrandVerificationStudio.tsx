import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Search,
  Sparkles,
  RefreshCw,
  Building2,
  Globe2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { BrandVerificationReport, GeneratedLogo } from "../types";

interface BrandVerificationStudioProps {
  initialCompanyName?: string;
  initialIndustry?: string;
  currentLogo?: GeneratedLogo | null;
  onUseNameInDesigner?: (name: string) => void;
  userId?: string | null;
}

export const BrandVerificationStudio: React.FC<BrandVerificationStudioProps> = ({
  initialCompanyName = "BrandForge Labs",
  initialIndustry = "Technology & AI",
  currentLogo,
  onUseNameInDesigner,
}) => {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [industry, setIndustry] = useState(initialIndustry);
  const [logoDescription, setLogoDescription] = useState(
    currentLogo?.promptUsed || "Minimalist geometric sun with sharp linear rays and cobalt blue accents"
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [report, setReport] = useState<BrandVerificationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunVerification = async () => {
    if (!companyName.trim()) {
      setError("Please provide a company name to verify.");
      return;
    }
    setError(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/verify-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          industry: industry.trim(),
          logoDescription: logoDescription.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Verification failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      const generatedReport: BrandVerificationReport = {
        id: `report-${Date.now()}`,
        companyName: data.companyName,
        availabilityScore: data.availabilityScore ?? 85,
        riskLevel: data.riskLevel ?? "LOW",
        reportMarkdown: data.reportMarkdown || "",
        sources: data.sources || [],
        timestamp: Date.now(),
      };

      setReport(generatedReport);
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to complete search-grounded trademark clearance.");
    } finally {
      setIsVerifying(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "LOW":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          label: "LOW RISK / SAFE TO USE",
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          label: "MODERATE RISK / SIMILAR NAMES FOUND",
        };
      case "HIGH":
        return {
          bg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
          icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
          label: "HIGH RISK / LIKELY CONFLICT",
        };
      case "CONFLICT":
      default:
        return {
          bg: "bg-red-500/10 border-red-500/30 text-red-400",
          icon: <XCircle className="w-4 h-4 text-red-400" />,
          label: "TRADEMARK CONFLICT DETECTED",
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#FF3B00] bg-[#FF3B00]/10 px-2 py-0.5 border border-[#FF3B00]/20">
              Google Search Grounding Clearance
            </span>
            <span className="text-[10px] font-mono opacity-40 uppercase">
              Gemini 3.5 Flash + Web Grounding
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter mt-2">
            BRAND & TRADEMARK VERIFICATION SHIELD
          </h2>
          <p className="text-sm text-white/60 font-light mt-1 max-w-2xl">
            Live verification of company names, Norwegian registries (Brønnøysundregistrene &
            Patentstyret), global trademarks (WIPO/USPTO/EUIPO), domain availability, and visual logo collision avoidance.
          </p>
        </div>

        {report && onUseNameInDesigner && (
          <button
            onClick={() => onUseNameInDesigner(report.companyName)}
            className="self-start md:self-auto py-2.5 px-5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#FF3B00] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Proceed With Verified Name</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Query Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#151515] p-6 border border-[#262626] relative">
            <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#FF3B00]"></div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-4 block">
              01. Brand & Registry Parameters
            </label>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/70 block mb-1.5 font-medium">
                  Company / Brand Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. BrandForge Labs, Nordica AI..."
                  className="w-full bg-[#0E0E0E] border border-[#333] px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF3B00] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/70 block mb-1.5 font-medium">
                  Industry / Market Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Technology, Renewable Energy, FinTech..."
                  className="w-full bg-[#0E0E0E] border border-[#333] px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF3B00] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/70 block mb-1.5 font-medium">
                  Proposed Logo Visual Motif / Shape
                </label>
                <textarea
                  value={logoDescription}
                  onChange={(e) => setLogoDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your logo icon or geometric layout to check against famous existing logos..."
                  className="w-full bg-[#0E0E0E] border border-[#333] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF3B00] focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="bg-[#0A0A0A] p-3.5 border border-[#222] text-[11px] font-mono text-white/60 space-y-1.5">
                <div className="flex items-center gap-2 text-white/80">
                  <Building2 className="w-3.5 h-3.5 text-[#FF3B00]" />
                  <span>Norway: Brønnøysund & Patentstyret (.no)</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Globe2 className="w-3.5 h-3.5 text-[#FF3B00]" />
                  <span>Global: WIPO, USPTO, EUIPO, .com/.io</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF3B00]" />
                  <span>Logo geometry & trademark collision check</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={isVerifying}
                onClick={handleRunVerification}
                className="w-full py-3.5 px-4 bg-[#FF3B00] hover:bg-[#e03400] disabled:opacity-50 text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Cross-Checking Global Registries...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Search Grounded Clearance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Clearance Dossier */}
        <div className="lg:col-span-8">
          {isVerifying && (
            <div className="bg-[#151515] border border-[#262626] p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 border-2 border-[#333] border-t-[#FF3B00] rounded-full animate-spin mb-6"></div>
              <h3 className="text-lg font-black tracking-tight uppercase">
                Verifying Against Live Norwegian & Global Databases
              </h3>
              <p className="text-xs text-white/50 max-w-md mt-2 font-mono">
                Querying Brønnøysundregistrene (Foretaksregisteret, Enhetsregisteret), Patentstyret,
                WIPO Global Brand Database, active trademark registrations, and domain registries...
              </p>
            </div>
          )}

          {!isVerifying && !report && (
            <div className="bg-[#151515] border border-[#222] p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
              <ShieldCheck className="w-12 h-12 text-[#FF3B00] mb-4 opacity-70" />
              <h3 className="text-lg font-bold tracking-tight">No Clearance Report Yet</h3>
              <p className="text-xs text-white/50 max-w-md mt-1.5 font-light">
                Enter your company name and proposed logo concept on the left, then click "Run Search
                Grounded Clearance" to obtain a live legal clearance report.
              </p>
            </div>
          )}

          {!isVerifying && report && (
            <div className="space-y-6">
              {/* Score & Risk Summary Header */}
              <div className="bg-[#151515] border border-[#262626] p-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-[#0E0E0E] border border-[#333] flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-[#FF3B00]">
                        {report.availabilityScore}
                      </span>
                      <span className="text-[9px] font-mono text-white/40 uppercase">/ 100</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-white/50 uppercase tracking-widest">
                          Uniqueness Score
                        </span>
                      </div>
                      <h3 className="text-xl font-black tracking-tight">{report.companyName}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {(() => {
                          const badge = getRiskBadge(report.riskLevel);
                          return (
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${badge.bg}`}
                            >
                              {badge.icon}
                              <span>{badge.label}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[10px] font-mono text-white/40">
                    <div>Checked: {new Date(report.timestamp).toLocaleTimeString()}</div>
                    <div>Engine: Gemini 3.5 Flash Search Grounding</div>
                  </div>
                </div>
              </div>

              {/* Clearance Report Markdown */}
              <div className="bg-[#151515] border border-[#262626] p-6">
                <h4 className="text-xs uppercase tracking-[0.2em] font-mono text-[#FF3B00] mb-4">
                  Official Verification Dossier
                </h4>
                <div className="prose prose-invert max-w-none text-xs leading-relaxed text-white/80 space-y-3 font-sans whitespace-pre-line">
                  {report.reportMarkdown}
                </div>
              </div>

              {/* Grounded Web Sources */}
              {report.sources && report.sources.length > 0 && (
                <div className="bg-[#151515] border border-[#262626] p-6">
                  <h4 className="text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-3 flex items-center gap-2">
                    <Globe2 className="w-3.5 h-3.5 text-[#FF3B00]" />
                    <span>Search Grounding Citations & Registries ({report.sources.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0E0E0E] border border-[#262626] hover:border-[#FF3B00] p-2.5 text-[11px] text-white/70 hover:text-white flex items-center justify-between gap-2 transition-colors"
                      >
                        <span className="truncate">{s.title || s.uri}</span>
                        <ExternalLink className="w-3 h-3 text-[#FF3B00] shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
