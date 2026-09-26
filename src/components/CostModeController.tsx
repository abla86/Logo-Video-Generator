import React, { useState, useEffect } from "react";
import { Shield, DollarSign, Cpu, Sliders, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { CostTelemetry } from "../types";

interface CostModeControllerProps {
  onTelemetryChange?: (telemetry: CostTelemetry) => void;
}

export const CostModeController: React.FC<CostModeControllerProps> = ({ onTelemetryChange }) => {
  const [telemetry, setTelemetry] = useState<CostTelemetry>({
    dailyTokensUsed: 8200,
    monthlyTokensUsed: 64500,
    dailySpendUSD: 0.04,
    monthlySpendUSD: 0.28,
    dailyLimitUSD: 5.0,
    monthlyLimitUSD: 50.0,
    isFreeLocalMode: true,
    zeroCostFilter: true,
    cacheHits: 48,
    totalJobsProcessed: 22,
  });

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [tempDailyLimit, setTempDailyLimit] = useState(5.0);
  const [tempMonthlyLimit, setTempMonthlyLimit] = useState(50.0);

  // Fetch telemetry on mount
  useEffect(() => {
    fetch("/api/cost-telemetry")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setTelemetry(data);
          setTempDailyLimit(data.dailyLimitUSD || 5.0);
          setTempMonthlyLimit(data.monthlyLimitUSD || 50.0);
          onTelemetryChange?.(data);
        }
      })
      .catch((err) => console.warn("Could not fetch telemetry:", err));
  }, []);

  const handleToggleFreeLocal = async () => {
    const nextVal = !telemetry.isFreeLocalMode;
    const updated = { ...telemetry, isFreeLocalMode: nextVal };
    setTelemetry(updated);
    onTelemetryChange?.(updated);

    try {
      await fetch("/api/cost-telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFreeLocalMode: nextVal }),
      });
    } catch (e) {
      console.warn("Failed to sync cost mode:", e);
    }
  };

  const handleToggleZeroCostFilter = async () => {
    const nextVal = !telemetry.zeroCostFilter;
    const updated = { ...telemetry, zeroCostFilter: nextVal };
    setTelemetry(updated);
    onTelemetryChange?.(updated);

    try {
      await fetch("/api/cost-telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zeroCostFilter: nextVal }),
      });
    } catch (e) {
      console.warn("Failed to sync zero cost filter:", e);
    }
  };

  const handleSaveBudget = async () => {
    const updated = {
      ...telemetry,
      dailyLimitUSD: tempDailyLimit,
      monthlyLimitUSD: tempMonthlyLimit,
    };
    setTelemetry(updated);
    onTelemetryChange?.(updated);
    setIsOpenModal(false);

    try {
      await fetch("/api/cost-telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyLimitUSD: tempDailyLimit,
          monthlyLimitUSD: tempMonthlyLimit,
        }),
      });
    } catch (e) {
      console.warn("Failed to save budget:", e);
    }
  };

  const percentUsed = Math.min(100, Math.round((telemetry.dailySpendUSD / telemetry.dailyLimitUSD) * 100));

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Free Local Mode Toggle Pill */}
        <button
          onClick={handleToggleFreeLocal}
          title={
            telemetry.isFreeLocalMode
              ? "Gratis lokal modus er aktiv: Bruker din egen maskin (SVG-motor, lokal video, tidslinje, nettleser-stemme) uten API-kostnad."
              : "Sky-AI modus aktiv: Bruker Gemini / Veo modeller for dyp generering."
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase border transition-all cursor-pointer ${
            telemetry.isFreeLocalMode
              ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/50"
              : "bg-[#181818] border-amber-500/50 text-amber-300 hover:bg-[#222]"
          }`}
        >
          {telemetry.isFreeLocalMode ? (
            <>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">Gratis Lokal Modus</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </>
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Sky-AI Aktiv</span>
            </>
          )}
        </button>

        {/* Budget Bar Widget */}
        <button
          onClick={() => setIsOpenModal(true)}
          title="Budsjett- og kostnadskontroll"
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#121212] border border-[#2a2a2a] hover:border-[#444] text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer"
        >
          <DollarSign className="w-3 h-3 text-[#FF3B00]" />
          <span>
            ${telemetry.dailySpendUSD.toFixed(2)} / ${telemetry.dailyLimitUSD.toFixed(2)}
          </span>
          <div className="w-12 h-1.5 bg-[#222] rounded-full overflow-hidden">
            <div
              className={`h-full ${percentUsed > 80 ? "bg-red-500" : "bg-emerald-500"}`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <Sliders className="w-3 h-3 text-zinc-500" />
        </button>
      </div>

      {/* Budget & Cost Control Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121214] border border-[#262626] w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black tracking-tight text-white uppercase">
                  Kostnadskontroll &amp; Kreditteffektiv Drift
                </h3>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Prioriteringsrekkefølge info */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-300">
                <div className="font-bold text-white mb-1">Standard Driftsrekkefølge:</div>
                <ol className="list-decimal pl-4 space-y-0.5 text-zinc-400 font-mono text-[10px]">
                  <li>Lokal behandling uten API-kostnad (SVG-vektor, Canvas, Web Speech)</li>
                  <li>Gjenbruk av eksisterende prosjektressurser og cache</li>
                  <li>Gratis API-kvoter ved behov</li>
                  <li>Valgfri ekstern generering kun ved godkjenning</li>
                </ol>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between p-3 border border-zinc-800 bg-[#161618]">
                <div>
                  <div className="font-bold text-white">Gratis Lokal Modus (Standard)</div>
                  <div className="text-[10px] text-zinc-400">
                    Deaktiverer alle betalte API-anrop. Alt genereres lokalt.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={telemetry.isFreeLocalMode}
                  onChange={handleToggleFreeLocal}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-zinc-800 bg-[#161618]">
                <div>
                  <div className="font-bold text-white">Nullkostnadsfilter</div>
                  <div className="text-[10px] text-zinc-400">
                    Varsler og krever bekreftelse før enhver ekstern modell brukes.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={telemetry.zeroCostFilter}
                  onChange={handleToggleZeroCostFilter}
                  className="w-4 h-4 accent-[#FF3B00] cursor-pointer"
                />
              </div>

              {/* Limits */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="block text-[11px] font-mono text-zinc-300">
                  Daglig Kostnadsgrense (USD):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={tempDailyLimit}
                    onChange={(e) => setTempDailyLimit(parseFloat(e.target.value))}
                    className="flex-1 accent-[#FF3B00] cursor-pointer"
                  />
                  <span className="font-mono font-bold text-white w-14 text-right">
                    ${tempDailyLimit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Consumption Telemetry Overview */}
              <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[10px]">
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
                  <span className="text-zinc-500 block">DAGLIG FORBRUK</span>
                  <span className="text-emerald-400 font-bold text-xs">
                    ${telemetry.dailySpendUSD.toFixed(2)} ({telemetry.dailyTokensUsed} tokens)
                  </span>
                </div>
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
                  <span className="text-zinc-500 block">CACHE TREFF</span>
                  <span className="text-white font-bold text-xs">{telemetry.cacheHits} sparte kall</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-zinc-800">
              <button
                onClick={() => setIsOpenModal(false)}
                className="px-3 py-1.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs font-mono uppercase cursor-pointer"
              >
                Avbryt
              </button>
              <button
                onClick={handleSaveBudget}
                className="px-4 py-1.5 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black text-xs font-mono uppercase cursor-pointer transition-colors"
              >
                Lagre Innstillinger
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
