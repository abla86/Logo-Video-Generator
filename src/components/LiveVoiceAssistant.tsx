import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, X, Radio, AlertCircle } from "lucide-react";

interface LiveVoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
  onThemeChange?: (theme: "dark" | "light") => void;
}

export const LiveVoiceAssistant: React.FC<LiveVoiceAssistantProps> = ({
  isOpen,
  onClose,
  companyName,
  onThemeChange,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [statusText, setStatusText] = useState("Tap to start live voice consultation");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Convert Float32Array to 16-bit PCM little-endian Base64
  const floatTo16BitPCM = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Play back 24kHz PCM from base64 string
  const playAudioChunk = (base64Audio: string) => {
    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
    }
    const ctx = outputAudioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    try {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      activeSourcesRef.current.push(source);
      setIsTalking(true);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsTalking(false);
        }
      };
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  const stopActiveAudio = () => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsTalking(false);
  };

  const startSession = async () => {
    setErrorMessage(null);
    setStatusText("Connecting to Gemini 3.8 Live API...");

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Setup input AudioContext (16kHz)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;

      // 3. Connect WebSocket to backend /live
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsMicActive(true);
        setStatusText("Connected • Listening... Speak in Norwegian or English");

        // Send initial context greeting
        ws.send(
          JSON.stringify({
            text: `Hello! I am designing branding for "${companyName || "my company"}". Can you advise me on brand naming, logo ideas, and visual aesthetics?`,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action === "set_theme" && data.theme) {
            onThemeChange?.(data.theme);
            setStatusText(`Stemmekommando utført: Byttet til ${data.theme.toUpperCase()} modus`);
          }
          if (data.audio) {
            playAudioChunk(data.audio);
          }
          if (data.interrupted) {
            stopActiveAudio();
          }
          if (data.error) {
            setErrorMessage(data.error);
          }
        } catch (e) {
          console.error("WS message parse error:", e);
        }
      };

      ws.onerror = (e) => {
        console.error("Live WebSocket error:", e);
        setErrorMessage("Connection to Live API failed");
        setStatusText("Disconnected");
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsMicActive(false);
        setStatusText("Session closed");
      };

      // 4. Stream mic PCM to WebSocket
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const base64PCM = floatTo16BitPCM(inputData);
          ws.send(JSON.stringify({ audio: base64PCM }));
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: any) {
      console.error("Could not start live voice session:", err);
      setErrorMessage(err.message || "Microphone access denied or connection error");
      setStatusText("Failed to initialize");
      cleanup();
    }
  };

  const cleanup = () => {
    stopActiveAudio();
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsMicActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111] border border-[#262626] w-full max-w-lg p-6 relative overflow-hidden shadow-2xl">
        {/* Corner tick marks */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#FF3B00]"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#FF3B00]"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#222] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#FF3B00] animate-pulse" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF3B00] block">
                Live API • gemini-3.8-live
              </span>
              <h3 className="text-base font-black tracking-tight text-white">
                CREATIVE DIRECTOR VOICE CONSULTANT
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#333] hover:border-white text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Voice Sphere / Waveform */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Animated rings */}
            <div
              className={`absolute inset-0 rounded-full border border-[#FF3B00]/20 transition-transform duration-500 ${
                isTalking ? "scale-125 animate-ping opacity-20" : "scale-100"
              }`}
            />
            <div
              className={`absolute inset-2 rounded-full border border-[#FF3B00]/40 transition-transform duration-300 ${
                isMicActive ? "scale-110" : "scale-95 opacity-40"
              }`}
            />
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isConnected
                  ? isTalking
                    ? "bg-[#FF3B00] text-black shadow-lg shadow-[#FF3B00]/30 scale-105"
                    : "bg-[#222] text-[#FF3B00] border border-[#FF3B00]/50"
                  : "bg-[#181818] text-white/40 border border-[#333]"
              }`}
            >
              {isTalking ? (
                <Volume2 className="w-10 h-10 animate-pulse" />
              ) : isConnected ? (
                <Mic className="w-10 h-10 text-[#FF3B00]" />
              ) : (
                <MicOff className="w-10 h-10" />
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-xs font-mono font-bold text-white tracking-wide uppercase">
              {statusText}
            </div>
            <div className="text-[11px] text-white/50 font-light mt-1">
              Real-time low-latency voice dialogue • Norsk & English
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 p-2.5 bg-red-500/10 border border-red-500/30 text-[11px] text-red-400 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#222] flex gap-3">
          {!isConnected ? (
            <button
              onClick={startSession}
              className="flex-1 py-3 px-4 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Connect Voice Assistant</span>
            </button>
          ) : (
            <button
              onClick={cleanup}
              className="flex-1 py-3 px-4 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MicOff className="w-4 h-4" />
              <span>Disconnect Voice Session</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="py-3 px-4 border border-[#333] hover:border-white text-white/70 hover:text-white uppercase text-xs font-mono tracking-widest cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
