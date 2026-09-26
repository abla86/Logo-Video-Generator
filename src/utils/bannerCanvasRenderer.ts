/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BannerFormat = "1:1" | "4:5" | "9:16" | "16:9" | "etsy-shop" | "etsy-mockup";

export type BannerTheme = "dark-spark" | "minimal-beige" | "vibrant-gradient" | "clean-nordic";

export interface BannerRenderOptions {
  format: BannerFormat;
  theme?: BannerTheme;
  companyName: string;
  productTitle: string;
  hook: string;
  subTitle?: string;
  ctaText?: string;
  discountBadge?: string;
  ratingText?: string;
  badges?: string[];
  productImage?: string | null;
}

export interface CarouselSlideData {
  slideNumber: number;
  totalSlides: number;
  type: "hook" | "problem" | "solution" | "features" | "proof" | "cta";
  badge: string;
  title: string;
  description: string;
  bulletPoints?: string[];
  highlight?: string;
  ctaButton?: string;
}

export const BANNER_DIMENSIONS: Record<BannerFormat, { width: number; height: number; name: string; ratioLabel: string }> = {
  "1:1": { width: 1080, height: 1080, name: "Kvadratisk Feed-annonse", ratioLabel: "1:1 (1080x1080)" },
  "4:5": { width: 1080, height: 1350, name: "Vertikal Feed-annonse", ratioLabel: "4:5 (1080x1350)" },
  "9:16": { width: 1080, height: 1920, name: "Story & Reels Banner", ratioLabel: "9:16 (1080x1920)" },
  "16:9": { width: 1920, height: 1080, name: "Nettside & YouTube Hero", ratioLabel: "16:9 (1920x1080)" },
  "etsy-shop": { width: 1600, height: 400, name: "Etsy Butikk Stort Banner", ratioLabel: "4:1 (1600x400)" },
  "etsy-mockup": { width: 1600, height: 1200, name: "Etsy Produkt Listing Bilde", ratioLabel: "4:3 (1600x1200)" },
};

export const BANNER_FORMAT_LIST = Object.entries(BANNER_DIMENSIONS).map(([key, val]) => ({
  id: key as BannerFormat,
  ...val,
}));

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 4
): number {
  const words = text.split(" ");
  let line = "";
  let linesDrawn = 0;
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
      linesDrawn++;
      if (linesDrawn >= maxLines - 1 && n < words.length - 1) {
        // Add ellipsis
        const remaining = words.slice(n).join(" ");
        let truncated = remaining;
        while (ctx.measureText(truncated + "...").width > maxWidth && truncated.length > 3) {
          truncated = truncated.slice(0, -3);
        }
        ctx.fillText((truncated + "...").trim(), x, currentY);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Loads an image from URL or data URI with CORS enabled
 */
export function loadImageAsync(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error("Kunne ikke laste bilde: " + e));
    img.src = src;
  });
}

/**
 * Render a complete high-definition commercial ad banner onto an HTML5 canvas
 */
export async function renderBannerToCanvas(
  options: BannerRenderOptions,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const dim = BANNER_DIMENSIONS[options.format] || BANNER_DIMENSIONS["1:1"];
  const width = dim.width;
  const height = dim.height;

  const canvas = targetCanvas || document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context");

  const theme = options.theme || "dark-spark";

  // 1. Draw Background
  if (theme === "dark-spark") {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#0E0E11");
    grad.addColorStop(0.5, "#151518");
    grad.addColorStop(1, "#0A0A0C");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle glow circles
    const radGlow = ctx.createRadialGradient(width * 0.8, height * 0.2, 10, width * 0.8, height * 0.2, width * 0.6);
    radGlow.addColorStop(0, "rgba(255, 59, 0, 0.18)");
    radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === "minimal-beige") {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#FAF7F2");
    grad.addColorStop(1, "#EDE5DC");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const radGlow = ctx.createRadialGradient(width * 0.2, height * 0.8, 10, width * 0.2, height * 0.8, width * 0.5);
    radGlow.addColorStop(0, "rgba(217, 119, 6, 0.08)");
    radGlow.addColorStop(1, "rgba(250, 247, 242, 0)");
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === "vibrant-gradient") {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#312E81");
    grad.addColorStop(0.5, "#4C1D95");
    grad.addColorStop(1, "#831843");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // clean-nordic
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#0F172A");
    grad.addColorStop(1, "#020617");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const radGlow = ctx.createRadialGradient(width * 0.7, height * 0.3, 10, width * 0.7, height * 0.3, width * 0.6);
    radGlow.addColorStop(0, "rgba(6, 182, 212, 0.2)");
    radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw border frame
  ctx.save();
  ctx.lineWidth = Math.max(2, Math.round(width * 0.003));
  ctx.strokeStyle =
    theme === "minimal-beige" ? "rgba(180, 160, 140, 0.3)" : "rgba(255, 255, 255, 0.08)";
  drawRoundedRect(ctx, 24, 24, width - 48, height - 48, 20);
  ctx.stroke();
  ctx.restore();

  // Colors setup
  const primaryTextColor = theme === "minimal-beige" ? "#1C1917" : "#FFFFFF";
  const secondaryTextColor = theme === "minimal-beige" ? "#57534E" : "#A1A1AA";
  const accentColor =
    theme === "dark-spark"
      ? "#FF3B00"
      : theme === "minimal-beige"
      ? "#D97706"
      : theme === "vibrant-gradient"
      ? "#F43F5E"
      : "#00E5FF";

  const isWide = options.format === "etsy-shop" || options.format === "16:9";

  // 3. Draw Header (Brand name + Discount Badge)
  const headerY = isWide ? 65 : 85;
  ctx.save();
  // Brand Pill
  ctx.fillStyle = theme === "minimal-beige" ? "rgba(217, 119, 6, 0.12)" : "rgba(255, 59, 0, 0.15)";
  drawRoundedRect(ctx, 50, headerY - 30, Math.min(350, width * 0.4), 44, 22);
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = accentColor;
  ctx.textAlign = "left";
  ctx.fillText(
    `⚡ ${options.companyName.toUpperCase().slice(0, 24)}`,
    68,
    headerY - 2
  );

  // Discount / Special Offer Badge
  const discountText = options.discountBadge || "-25% LANSERINGSRABATT";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const discMetrics = ctx.measureText(discountText);
  const discW = discMetrics.width + 36;
  const discX = width - 50 - discW;

  ctx.fillStyle = theme === "minimal-beige" ? "#D97706" : "#FF3B00";
  drawRoundedRect(ctx, discX, headerY - 30, discW, 44, 22);
  ctx.fill();

  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText(discountText, discX + discW / 2, headerY - 2);
  ctx.restore();

  // 4. Draw Product Mockup Image or Realistic Planner Illustration
  let imageRendered = false;
  if (options.productImage) {
    try {
      const img = await loadImageAsync(options.productImage);
      ctx.save();
      // Calculate placement
      let imgX = width * 0.52;
      let imgY = height * 0.22;
      let imgW = width * 0.42;
      let imgH = height * 0.55;

      if (options.format === "1:1") {
        imgX = width * 0.48;
        imgY = height * 0.22;
        imgW = width * 0.46;
        imgH = height * 0.58;
      } else if (options.format === "4:5") {
        imgX = width * 0.46;
        imgY = height * 0.26;
        imgW = width * 0.48;
        imgH = height * 0.48;
      } else if (options.format === "9:16") {
        imgX = width * 0.12;
        imgY = height * 0.38;
        imgW = width * 0.76;
        imgH = height * 0.34;
      } else if (options.format === "etsy-shop") {
        imgX = width * 0.68;
        imgY = height * 0.12;
        imgW = width * 0.28;
        imgH = height * 0.76;
      } else if (options.format === "etsy-mockup") {
        imgX = width * 0.48;
        imgY = height * 0.20;
        imgW = width * 0.47;
        imgH = height * 0.64;
      }

      // Drop shadow behind product
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 35;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 15;

      // Mockup container
      ctx.fillStyle = theme === "minimal-beige" ? "#FFFFFF" : "#1A1A1E";
      drawRoundedRect(ctx, imgX, imgY, imgW, imgH, 18);
      ctx.fill();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Reset shadow for clipping image
      ctx.shadowColor = "transparent";

      ctx.save();
      drawRoundedRect(ctx, imgX + 8, imgY + 8, imgW - 16, imgH - 16, 12);
      ctx.clip();

      // Draw aspect-ratio contained
      const scale = Math.min((imgW - 16) / img.width, (imgH - 16) / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = imgX + 8 + (imgW - 16 - drawW) / 2;
      const drawY = imgY + 8 + (imgH - 16 - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Badge on mockup
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      drawRoundedRect(ctx, imgX + 16, imgY + imgH - 42, 120, 26, 6);
      ctx.fill();
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText("DIGITAL MOCKUP", imgX + 76, imgY + imgH - 25);

      ctx.restore();
      imageRendered = true;
    } catch (e) {
      console.warn("Could not draw product image onto canvas:", e);
    }
  }

  // If no uploaded image was rendered, render high-aesthetic planner graphic
  if (!imageRendered && options.format !== "etsy-shop") {
    ctx.save();
    let padX = width * 0.54;
    let padY = height * 0.24;
    let padW = width * 0.40;
    let padH = height * 0.52;

    if (options.format === "9:16") {
      padX = width * 0.16;
      padY = height * 0.38;
      padW = width * 0.68;
      padH = height * 0.30;
    }

    // Shadow
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;

    // iPad / Notebook frame
    ctx.fillStyle = theme === "minimal-beige" ? "#FFFFFF" : "#1A1A20";
    drawRoundedRect(ctx, padX, padY, padW, padH, 16);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowColor = "transparent";

    // Inner page
    ctx.fillStyle = theme === "minimal-beige" ? "#F5EFEB" : "#111114";
    drawRoundedRect(ctx, padX + 16, padY + 16, padW - 32, padH - 32, 10);
    ctx.fill();

    // Planner UI Lines & Mock elements
    ctx.fillStyle = accentColor;
    ctx.fillRect(padX + 28, padY + 36, padW * 0.5, 8);

    ctx.fillStyle = theme === "minimal-beige" ? "#C7B8A8" : "#2E2E36";
    for (let r = 0; r < 5; r++) {
      ctx.fillRect(padX + 28, padY + 60 + r * 22, padW - 56, 4);
    }

    // Interactive Checkboxes
    ctx.fillStyle = accentColor;
    for (let c = 0; c < 3; c++) {
      drawRoundedRect(ctx, padX + 28, padY + 180 + c * 28, 16, 16, 4);
      ctx.fill();
      ctx.fillRect(padX + 54, padY + 184 + c * 28, padW * 0.45, 8);
    }

    // Badge
    ctx.fillStyle = theme === "minimal-beige" ? "#1C1917" : "#000000";
    drawRoundedRect(ctx, padX + padW - 130, padY + padH - 46, 114, 28, 6);
    ctx.fill();
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = accentColor;
    ctx.textAlign = "center";
    ctx.fillText("✨ 2026 EDITION", padX + padW - 73, padY + padH - 28);

    ctx.restore();
  }

  // 5. Typography Content Area (Left side or Full top)
  const contentWidth =
    options.format === "9:16"
      ? width * 0.85
      : options.format === "etsy-shop"
      ? width * 0.65
      : width * 0.45;

  const contentX = 60;
  let currentTextY = isWide ? 150 : height * 0.22;

  // Rating Stars
  ctx.save();
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#FBBF24"; // Star gold
  ctx.textAlign = "left";
  ctx.fillText("⭐⭐⭐⭐⭐", contentX, currentTextY);
  ctx.font = "bold 13px -apple-system, sans-serif";
  ctx.fillStyle = secondaryTextColor;
  ctx.fillText(options.ratingText || "5.0 (500+ Etsy anmeldelser)", contentX + 115, currentTextY);
  ctx.restore();

  currentTextY += isWide ? 40 : 50;

  // Product Main Headline (Title)
  ctx.save();
  const titleSize = isWide ? 38 : options.format === "9:16" ? 44 : 46;
  ctx.font = `900 ${titleSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.fillStyle = primaryTextColor;
  ctx.textAlign = "left";
  currentTextY = wrapText(
    ctx,
    options.productTitle.toUpperCase(),
    contentX,
    currentTextY,
    contentWidth,
    titleSize * 1.15,
    3
  );
  ctx.restore();

  currentTextY += 10;

  // Viral Hook / Key Value proposition
  ctx.save();
  const hookSize = isWide ? 20 : 22;
  ctx.font = `600 ${hookSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillStyle = accentColor;
  ctx.textAlign = "left";
  currentTextY = wrapText(
    ctx,
    `«${options.hook}»`,
    contentX,
    currentTextY,
    contentWidth,
    hookSize * 1.3,
    2
  );
  ctx.restore();

  currentTextY += 16;

  // Badges / Checklist bullets
  const defaultBadges = [
    "✓ Umiddelbar PDF & GoodNotes nedlasting",
    "✓ 250+ hyperlenkede sider & ukeoversikter",
    "✓ Inkluderer vanelogg, budsjett & klistremerker",
  ];
  const badgesToRender = options.badges && options.badges.length > 0 ? options.badges : defaultBadges;

  if (options.format !== "etsy-shop" && currentTextY < height * 0.72) {
    ctx.save();
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = secondaryTextColor;
    ctx.textAlign = "left";
    for (let b = 0; b < Math.min(3, badgesToRender.length); b++) {
      ctx.fillText(badgesToRender[b], contentX, currentTextY);
      currentTextY += 26;
    }
    ctx.restore();
  }

  // 6. Primary CTA Button (Bottom or Content End)
  const buttonY =
    options.format === "9:16"
      ? height - 150
      : isWide
      ? height - 100
      : height - 120;

  ctx.save();
  const ctaText = options.ctaText || "KJØP PÅ ETSY NÅ ➔";
  ctx.font = "900 18px -apple-system, BlinkMacSystemFont, sans-serif";
  const btnMetrics = ctx.measureText(ctaText);
  const btnW = Math.max(260, btnMetrics.width + 50);
  const btnH = 56;

  // CTA Glow
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = accentColor;
  drawRoundedRect(ctx, contentX, buttonY, btnW, btnH, 12);
  ctx.fill();

  ctx.shadowColor = "transparent";

  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText(ctaText, contentX + btnW / 2, buttonY + 36);

  // Guarantee / Digital delivery note next to button
  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = secondaryTextColor;
  ctx.textAlign = "left";
  ctx.fillText("⚡ 100% Digital • Ingen ventetid", contentX + btnW + 24, buttonY + 34);

  ctx.restore();

  return canvas;
}

/**
 * Render a dedicated 1080x1080 carousel slide for Instagram/LinkedIn/Facebook
 */
export async function renderCarouselSlideToCanvas(
  slide: CarouselSlideData,
  options: {
    companyName: string;
    productTitle: string;
    theme?: BannerTheme;
    productImage?: string | null;
  },
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = 1080;

  const canvas = targetCanvas || document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context");

  const theme = options.theme || "dark-spark";
  const primaryTextColor = theme === "minimal-beige" ? "#1C1917" : "#FFFFFF";
  const secondaryTextColor = theme === "minimal-beige" ? "#57534E" : "#A1A1AA";
  const accentColor =
    theme === "dark-spark"
      ? "#FF3B00"
      : theme === "minimal-beige"
      ? "#D97706"
      : theme === "vibrant-gradient"
      ? "#F43F5E"
      : "#00E5FF";

  // Background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  if (theme === "minimal-beige") {
    grad.addColorStop(0, "#FAF7F2");
    grad.addColorStop(1, "#EDE5DC");
  } else {
    grad.addColorStop(0, "#0F0F12");
    grad.addColorStop(0.5, "#16161A");
    grad.addColorStop(1, "#0A0A0C");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 30, 30, width - 60, height - 60, 24);
  ctx.stroke();

  // Top Bar: Brand + Slide Counter
  ctx.save();
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = accentColor;
  ctx.textAlign = "left";
  ctx.fillText(options.companyName.toUpperCase(), 70, 90);

  // Slide Counter (e.g. "01 / 06")
  ctx.font = "900 18px monospace";
  ctx.fillStyle = secondaryTextColor;
  ctx.textAlign = "right";
  ctx.fillText(
    `SLIDE 0${slide.slideNumber} / 0${slide.totalSlides}`,
    width - 70,
    90
  );

  // Progress Bar under header
  const barW = width - 140;
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  drawRoundedRect(ctx, 70, 110, barW, 6, 3);
  ctx.fill();

  const progressW = (barW / slide.totalSlides) * slide.slideNumber;
  ctx.fillStyle = accentColor;
  drawRoundedRect(ctx, 70, 110, progressW, 6, 3);
  ctx.fill();
  ctx.restore();

  // Category Badge (e.g. "PROBLEM", "LØSNING", "HEMMELIGHETEN")
  ctx.save();
  ctx.fillStyle = theme === "minimal-beige" ? "rgba(217, 119, 6, 0.15)" : "rgba(255, 59, 0, 0.18)";
  drawRoundedRect(ctx, 70, 170, 240, 44, 22);
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "bold 15px sans-serif";
  ctx.fillStyle = accentColor;
  ctx.textAlign = "center";
  ctx.fillText(slide.badge.toUpperCase(), 190, 198);
  ctx.restore();

  // Main Headline
  ctx.save();
  ctx.font = "900 52px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = primaryTextColor;
  ctx.textAlign = "left";
  let curY = wrapText(ctx, slide.title, 70, 280, width - 140, 64, 3);
  ctx.restore();

  curY += 24;

  // Description / Story paragraph
  ctx.save();
  ctx.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = secondaryTextColor;
  ctx.textAlign = "left";
  curY = wrapText(ctx, slide.description, 70, curY, width - 140, 36, 4);
  ctx.restore();

  curY += 24;

  // Bullet Points if any
  if (slide.bulletPoints && slide.bulletPoints.length > 0) {
    ctx.save();
    for (const point of slide.bulletPoints) {
      // Pill container
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      drawRoundedRect(ctx, 70, curY - 26, width - 140, 52, 10);
      ctx.fill();

      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = accentColor;
      ctx.textAlign = "left";
      ctx.fillText("✓", 94, curY + 6);

      ctx.font = "600 20px -apple-system, sans-serif";
      ctx.fillStyle = primaryTextColor;
      ctx.fillText(point, 130, curY + 6);

      curY += 66;
    }
    ctx.restore();
  }

  // Highlight Box (Quote / Stat)
  if (slide.highlight) {
    ctx.save();
    ctx.fillStyle = theme === "minimal-beige" ? "#EFE7DE" : "#1A1A22";
    drawRoundedRect(ctx, 70, curY, width - 140, 110, 14);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold italic 22px -apple-system, sans-serif";
    ctx.fillStyle = accentColor;
    ctx.textAlign = "center";
    ctx.fillText(`«${slide.highlight}»`, width / 2, curY + 62);
    ctx.restore();
    curY += 130;
  }

  // Bottom Navigation Hint / CTA
  ctx.save();
  const bottomY = height - 120;
  if (slide.slideNumber < slide.totalSlides) {
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = accentColor;
    ctx.textAlign = "right";
    ctx.fillText("Sveip til neste side 👉", width - 80, bottomY);
  } else {
    // Final CTA button
    const btnW = 320;
    const btnH = 64;
    ctx.fillStyle = accentColor;
    drawRoundedRect(ctx, width / 2 - btnW / 2, bottomY - 20, btnW, btnH, 14);
    ctx.fill();

    ctx.font = "900 20px sans-serif";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(slide.ctaButton || "KJØP PÅ ETSY NÅ ➔", width / 2, bottomY + 20);
  }
  ctx.restore();

  return canvas;
}

/**
 * Downloads a canvas element as a PNG directly to the user's computer
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

/**
 * Returns a Blob from a canvas element
 */
export function canvasToBlobAsync(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Kunne ikke konvertere canvas til blob."));
    }, "image/png");
  });
}
