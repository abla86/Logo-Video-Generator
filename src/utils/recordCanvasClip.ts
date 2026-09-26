import { AnimationPresetId } from "../types";

export interface RecordClipOptions {
  logoUrl: string;
  companyName: string;
  industry?: string;
  presetId: AnimationPresetId;
  durationMs?: number;
  onProgress?: (progressPercent: number) => void;
}

export interface GeneratedClipResult {
  blob: Blob;
  videoUrl: string;
  durationSeconds: number;
}

/**
 * Records a smooth 60fps high-definition video clip of the logo animating
 * with the selected animation preset using HTML5 Canvas & MediaRecorder.
 */
export async function recordAnimatedLogoClip({
  logoUrl,
  companyName,
  industry = "Corporate Mark",
  presetId,
  durationMs = 3500,
  onProgress,
}: RecordClipOptions): Promise<GeneratedClipResult> {
  // 1. Create canvas
  const width = 720;
  const height = 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not initialize 2D canvas context for clip recording.");
  }

  // 2. Load logo image
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load logo image into memory."));
    img.src = logoUrl;
  });

  // 3. Setup MediaRecorder with best supported mimeType
  const stream = (canvas as any).captureStream ? (canvas as any).captureStream(60) : null;
  if (!stream) {
    throw new Error("MediaStream canvas capture is not supported in this browser environment.");
  }

  let mimeType = "video/webm;codecs=vp9";
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = "video/webm";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "";
    }
  }

  const recordedChunks: Blob[] = [];
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  recorder.start(100);

  // 4. Animation render loop
  const fps = 60;
  const totalFrames = Math.floor((durationMs / 1000) * fps);
  let currentFrame = 0;

  return new Promise<GeneratedClipResult>((resolve, reject) => {
    const renderFrame = () => {
      if (currentFrame > totalFrames) {
        recorder.onstop = () => {
          const finalBlob = new Blob(recordedChunks, { type: mimeType || "video/webm" });
          const videoUrl = URL.createObjectURL(finalBlob);
          resolve({
            blob: finalBlob,
            videoUrl,
            durationSeconds: durationMs / 1000,
          });
        };
        recorder.stop();
        return;
      }

      const t = currentFrame / totalFrames; // 0 to 1
      if (onProgress) {
        onProgress(Math.min(99, Math.round(t * 100)));
      }

      // Draw Obsidian Dark Studio Canvas
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid
      ctx.fillStyle = "rgba(255, 59, 0, 0.05)";
      for (let x = 0; x < width; x += 36) {
        for (let y = 0; y < height; y += 36) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Architectural concentric circles
      ctx.strokeStyle = "#1A1A1A";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 - 20, 220, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#252525";
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 - 20, 160, 0, Math.PI * 2);
      ctx.stroke();

      // Top Header & Corner Ticks (Artistic Flair)
      ctx.strokeStyle = "#FF3B00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, 45);
      ctx.lineTo(30, 30);
      ctx.lineTo(45, 30);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width - 45, 30);
      ctx.lineTo(width - 30, 30);
      ctx.lineTo(width - 30, 45);
      ctx.stroke();

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#FF3B00";
      ctx.fillText("BRANDFORGE STUDIO // MOTION CAPTURE", 40, 50);

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText(`PRESET // ${presetId.toUpperCase()}`, width - 210, 50);

      // Calculate transformation according to preset
      ctx.save();
      const centerX = width / 2;
      const centerY = height / 2 - 20;
      ctx.translate(centerX, centerY);

      let scale = 1;
      let alpha = 1;
      let rotation = 0;
      let offsetY = 0;

      switch (presetId) {
        case "fade-in": {
          if (t < 0.3) {
            alpha = t / 0.3;
            scale = 0.82 + (t / 0.3) * 0.22;
          } else if (t < 0.45) {
            alpha = 1;
            scale = 1.04 - ((t - 0.3) / 0.15) * 0.04;
          } else {
            alpha = 1;
            scale = 1;
          }
          break;
        }

        case "elastic-bounce": {
          // Physics spring bounce
          if (t < 0.3) {
            const p = t / 0.3;
            offsetY = -120 * (1 - p);
            scale = 0.9 + 0.3 * Math.sin(p * Math.PI);
            alpha = Math.min(1, p * 2);
          } else if (t < 0.5) {
            const p = (t - 0.3) / 0.2;
            offsetY = -40 * Math.sin(p * Math.PI);
            scale = 1 - 0.08 * Math.sin(p * Math.PI);
          } else if (t < 0.7) {
            const p = (t - 0.5) / 0.2;
            offsetY = -15 * Math.sin(p * Math.PI);
          } else {
            offsetY = 0;
            scale = 1;
          }
          break;
        }

        case "orbit-spin": {
          rotation = t * Math.PI * 2;
          // Draw orbital ring around
          ctx.save();
          ctx.strokeStyle = "rgba(255, 59, 0, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 180, 0, Math.PI * 2);
          ctx.stroke();

          // Particle on ring
          const particleAngle = t * Math.PI * 4;
          const px = Math.cos(particleAngle) * 180;
          const py = Math.sin(particleAngle) * 180;
          ctx.fillStyle = "#FF3B00";
          ctx.shadowColor = "#FF3B00";
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case "pulse-breathe": {
          const cycle = Math.sin(t * Math.PI * 4);
          scale = 1 + cycle * 0.08;
          ctx.save();
          ctx.fillStyle = "rgba(255, 59, 0, 0.15)";
          ctx.shadowColor = "#FF3B00";
          ctx.shadowBlur = 40 * (1 + cycle * 0.5);
          ctx.beginPath();
          ctx.arc(0, 0, 140 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case "glitch-scan": {
          if (Math.sin(t * 24) > 0.6) {
            offsetY = (Math.random() - 0.5) * 8;
            ctx.shadowColor = "#00FFFF";
            ctx.shadowBlur = 12;
          } else if (Math.cos(t * 18) > 0.7) {
            ctx.shadowColor = "#FF0055";
            ctx.shadowBlur = 12;
          }
          break;
        }

        case "flip-3d": {
          // Perspective scale on X
          const flipT = (t * 2) % 1;
          const cosAngle = Math.cos(flipT * Math.PI * 2);
          scale = Math.max(0.08, Math.abs(cosAngle));
          break;
        }

        case "shimmer-sheen": {
          scale = 1;
          break;
        }

        case "liquid-wave": {
          offsetY = Math.sin(t * Math.PI * 4) * 16;
          rotation = Math.sin(t * Math.PI * 4) * 0.06;
          break;
        }

        default:
          scale = 1;
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(0, offsetY);
      ctx.rotate(rotation);
      if (presetId === "flip-3d") {
        ctx.scale(scale, 1);
      } else {
        ctx.scale(scale, scale);
      }

      // Draw dynamic radial aura behind logo
      ctx.save();
      const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 160);
      auraGrad.addColorStop(0, "rgba(255, 59, 0, 0.25)");
      auraGrad.addColorStop(1, "rgba(255, 59, 0, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Logo Image (centered)
      const targetSize = 260;
      const aspect = img.width / img.height || 1;
      let drawW = targetSize;
      let drawH = targetSize;
      if (aspect > 1) {
        drawH = targetSize / aspect;
      } else {
        drawW = targetSize * aspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      // Shimmer sweep laser beam overlay
      if (presetId === "shimmer-sheen") {
        ctx.save();
        const beamX = -drawW + (t * 3) % 2 * drawW;
        ctx.beginPath();
        ctx.rect(-drawW / 2, -drawH / 2, drawW, drawH);
        ctx.clip();

        const grad = ctx.createLinearGradient(beamX, -drawH / 2, beamX + 60, drawH / 2);
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(0.5, "rgba(255, 255, 255, 0.6)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      ctx.restore();

      // Brand Typography at bottom
      ctx.font = "900 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(companyName.toUpperCase(), width / 2, height - 75);

      ctx.font = "bold 10px monospace";
      ctx.fillStyle = "#FF3B00";
      ctx.fillText((industry || "IDENTITY SYSTEM").toUpperCase(), width / 2, height - 52);

      currentFrame++;
      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  });
}
