/**
 * Genuine Vector SVG Logo & Brand Identity Asset Generator
 * Produces mathematical SVG vector graphics, design tokens, and CSS properties
 * without any raster wrappers.
 */

export interface VectorLogoConfig {
  companyName: string;
  tagline?: string;
  style: "minimal-geometric" | "corporate-shield" | "abstract-dynamic" | "monogram" | "tech-nodes" | "golden-ratio";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
}

export interface GeneratedVectorPackage {
  svgCode: string;
  lightSvgCode: string;
  darkSvgCode: string;
  monochromeSvgCode: string;
  faviconSvgCode: string;
  appIconSvgCode: string;
  designTokensJson: string;
  cssVariables: string;
  htmlStyleGuide: string;
}

export function generateTrueVectorLogo(config: VectorLogoConfig): GeneratedVectorPackage {
  const {
    companyName,
    tagline = "EST. 2026",
    style,
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
  } = config;

  const initial = (companyName[0] || "M").toUpperCase();
  const secondInitial = (companyName[1] || "O").toUpperCase();

  // Generate symbol graphic based on chosen mathematical vector style
  let symbolMarkup = "";
  let faviconSymbolMarkup = "";

  switch (style) {
    case "minimal-geometric":
      symbolMarkup = `
        <g transform="translate(180, 100)">
          <polygon points="120,20 220,180 20,180" fill="none" stroke="${primaryColor}" stroke-width="14" stroke-linejoin="round" />
          <polygon points="120,65 185,170 55,170" fill="${secondaryColor}" opacity="0.85" />
          <circle cx="120" cy="130" r="22" fill="${accentColor}" />
        </g>
      `;
      faviconSymbolMarkup = `
        <polygon points="32,8 56,52 8,52" fill="none" stroke="${primaryColor}" stroke-width="5" stroke-linejoin="round" />
        <circle cx="32" cy="38" r="7" fill="${accentColor}" />
      `;
      break;

    case "corporate-shield":
      symbolMarkup = `
        <g transform="translate(180, 90)">
          <path d="M120 20 L200 55 C200 135 155 185 120 205 C85 185 40 135 40 55 Z" fill="none" stroke="${primaryColor}" stroke-width="12" />
          <path d="M120 40 L180 70 C180 130 145 170 120 185 C95 170 60 130 60 70 Z" fill="${secondaryColor}" opacity="0.25" />
          <path d="M100 115 L115 130 L145 95" fill="none" stroke="${accentColor}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
        </g>
      `;
      faviconSymbolMarkup = `
        <path d="M32 6 L54 16 C54 40 42 54 32 58 C22 54 10 40 10 16 Z" fill="${primaryColor}" />
        <path d="M26 31 L30 35 L39 25" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;

    case "abstract-dynamic":
      symbolMarkup = `
        <g transform="translate(180, 100)">
          <path d="M60 180 C40 100 90 40 150 40 C190 40 220 70 200 110 C180 150 110 130 120 180 Z" fill="${primaryColor}" opacity="0.85" />
          <circle cx="90" cy="80" r="32" fill="${secondaryColor}" opacity="0.75" />
          <path d="M130 150 C160 110 190 120 210 160" fill="none" stroke="${accentColor}" stroke-width="10" stroke-linecap="round" />
        </g>
      `;
      faviconSymbolMarkup = `
        <circle cx="28" cy="28" r="18" fill="${primaryColor}" />
        <circle cx="40" cy="38" r="14" fill="${accentColor}" opacity="0.85" />
      `;
      break;

    case "monogram":
      symbolMarkup = `
        <g transform="translate(180, 80)">
          <rect x="30" y="30" width="180" height="180" rx="28" fill="none" stroke="${primaryColor}" stroke-width="10" />
          <text x="90" y="155" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="105" fill="${primaryColor}" letter-spacing="-4">${initial}</text>
          <text x="145" y="175" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="80" fill="${accentColor}">${secondInitial}</text>
        </g>
      `;
      faviconSymbolMarkup = `
        <rect x="6" y="6" width="52" height="52" rx="10" fill="${primaryColor}" />
        <text x="32" y="44" font-family="system-ui, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle">${initial}</text>
      `;
      break;

    case "tech-nodes":
      symbolMarkup = `
        <g transform="translate(180, 95)">
          <line x1="60" y1="120" x2="120" y2="50" stroke="${secondaryColor}" stroke-width="8" />
          <line x1="120" y1="50" x2="180" y2="120" stroke="${secondaryColor}" stroke-width="8" />
          <line x1="60" y1="120" x2="120" y2="190" stroke="${secondaryColor}" stroke-width="8" />
          <line x1="120" y1="190" x2="180" y2="120" stroke="${secondaryColor}" stroke-width="8" />
          <line x1="60" y1="120" x2="180" y2="120" stroke="${accentColor}" stroke-width="6" stroke-dasharray="8 6" />
          <circle cx="120" cy="50" r="18" fill="${primaryColor}" />
          <circle cx="60" cy="120" r="18" fill="${primaryColor}" />
          <circle cx="180" cy="120" r="18" fill="${primaryColor}" />
          <circle cx="120" cy="190" r="18" fill="${primaryColor}" />
          <circle cx="120" cy="120" r="12" fill="${accentColor}" />
        </g>
      `;
      faviconSymbolMarkup = `
        <polygon points="32,10 52,32 32,54 12,32" fill="none" stroke="${primaryColor}" stroke-width="4" />
        <circle cx="32" cy="32" r="8" fill="${accentColor}" />
      `;
      break;

    case "golden-ratio":
    default:
      symbolMarkup = `
        <g transform="translate(180, 95)">
          <circle cx="120" cy="120" r="90" fill="none" stroke="${primaryColor}" stroke-width="8" opacity="0.4" />
          <circle cx="120" cy="120" r="56" fill="none" stroke="${secondaryColor}" stroke-width="10" />
          <circle cx="120" cy="120" r="34" fill="${accentColor}" />
          <path d="M120 30 A90 90 0 0 1 210 120" fill="none" stroke="${primaryColor}" stroke-width="12" stroke-linecap="round" />
        </g>
      `;
      faviconSymbolMarkup = `
        <circle cx="32" cy="32" r="26" fill="none" stroke="${primaryColor}" stroke-width="4" />
        <circle cx="32" cy="32" r="12" fill="${accentColor}" />
      `;
      break;
  }

  // Full SVG with typography
  const buildSvg = (bg: string, textColor: string, subColor: string, isMono = false) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 480" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;900&amp;display=swap');
      .brand-title {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        font-weight: 900;
        font-size: 38px;
        letter-spacing: -0.04em;
        text-anchor: middle;
      }
      .brand-tagline {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        text-anchor: middle;
      }
    </style>
  </defs>
  ${bg ? `<rect width="600" height="480" fill="${bg}" />` : ""}
  ${isMono ? symbolMarkup.replace(new RegExp(primaryColor, "g"), textColor).replace(new RegExp(secondaryColor, "g"), textColor).replace(new RegExp(accentColor, "g"), textColor) : symbolMarkup}
  <text x="300" y="365" class="brand-title" fill="${textColor}">${companyName.toUpperCase()}</text>
  <text x="300" y="398" class="brand-tagline" fill="${subColor}">${tagline}</text>
</svg>`.trim();

  const standardSvg = buildSvg(backgroundColor, "#FFFFFF", "#999999");
  const lightSvg = buildSvg("#FFFFFF", "#111111", "#666666");
  const darkSvg = buildSvg("#0A0A0A", "#FFFFFF", "#A3A3A3");
  const monochromeSvg = buildSvg("#000000", "#FFFFFF", "#888888", true);

  const faviconSvgCode = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="${backgroundColor || "#0A0A0A"}" />
  <g transform="translate(0, 0)">
    ${faviconSymbolMarkup}
  </g>
</svg>`.trim();

  const appIconSvgCode = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="appBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="115" fill="url(#appBg)" />
  <g transform="scale(7.5) translate(4, 4)">
    ${faviconSymbolMarkup.replace(/fill="#FFFFFF"/g, `fill="#FFFFFF"`)}
  </g>
</svg>`.trim();

  // Design Tokens (JSON)
  const designTokens = {
    brand: {
      name: companyName,
      tagline,
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
    },
    color: {
      primary: { value: primaryColor, type: "color" },
      secondary: { value: secondaryColor, type: "color" },
      accent: { value: accentColor, type: "color" },
      background: { value: backgroundColor, type: "color" },
      neutralDark: { value: "#0A0A0A", type: "color" },
      neutralLight: { value: "#FAFAFA", type: "color" },
    },
    typography: {
      fontFamilyPrimary: { value: "Plus Jakarta Sans, system-ui, sans-serif" },
      fontFamilyMono: { value: "JetBrains Mono, monospace" },
      headingScale: {
        h1: { fontSize: "48px", lineHeight: "1.1", fontWeight: "900" },
        h2: { fontSize: "36px", lineHeight: "1.2", fontWeight: "800" },
        h3: { fontSize: "24px", lineHeight: "1.3", fontWeight: "700" },
      },
    },
    spacing: {
      xs: { value: "4px" },
      sm: { value: "8px" },
      md: { value: "16px" },
      lg: { value: "24px" },
      xl: { value: "48px" },
    },
    radii: {
      sm: { value: "4px" },
      md: { value: "8px" },
      full: { value: "9999px" },
    },
  };

  const cssVariables = `
:root {
  /* ${companyName} Brand Design Tokens */
  --brand-primary: ${primaryColor};
  --brand-secondary: ${secondaryColor};
  --brand-accent: ${accentColor};
  --brand-bg: ${backgroundColor};
  --brand-text: #FFFFFF;
  --brand-font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --brand-font-mono: 'JetBrains Mono', monospace;
  --brand-radius-sm: 4px;
  --brand-radius-md: 8px;
  --brand-radius-lg: 16px;
  --brand-transition-smooth: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
`.trim();

  const htmlStyleGuide = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${companyName} - Brand Style Guide</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #0F0F11; color: #ECECEC; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; letter-spacing: -0.03em; color: #FFF; }
    .tagline { color: #888; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 3rem; }
    .section { background: #18181C; border: 1px solid #282830; border-radius: 12px; padding: 28px; margin-bottom: 32px; }
    .color-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-top: 16px; }
    .color-card { border-radius: 8px; overflow: hidden; background: #222228; border: 1px solid #333; }
    .color-swatch { height: 90px; width: 100%; }
    .color-info { padding: 12px; font-size: 12px; }
    .color-hex { font-weight: bold; font-family: monospace; }
    .logo-preview-box { display: flex; align-items: center; justify-content: center; height: 260px; background: ${backgroundColor}; border-radius: 8px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${companyName}</h1>
    <div class="tagline">${tagline} • Official Brand Guidelines</div>

    <div class="section">
      <h2>Primary Visual Identity</h2>
      <div class="logo-preview-box">
        ${standardSvg}
      </div>
    </div>

    <div class="section">
      <h2>Color System</h2>
      <div class="color-grid">
        <div class="color-card">
          <div class="color-swatch" style="background: ${primaryColor};"></div>
          <div class="color-info">
            <div class="color-hex">${primaryColor}</div>
            <div>Primary Energy</div>
          </div>
        </div>
        <div class="color-card">
          <div class="color-swatch" style="background: ${secondaryColor};"></div>
          <div class="color-info">
            <div class="color-hex">${secondaryColor}</div>
            <div>Foundation Secondary</div>
          </div>
        </div>
        <div class="color-card">
          <div class="color-swatch" style="background: ${accentColor};"></div>
          <div class="color-info">
            <div class="color-hex">${accentColor}</div>
            <div>Call To Action Accent</div>
          </div>
        </div>
        <div class="color-card">
          <div class="color-swatch" style="background: ${backgroundColor};"></div>
          <div class="color-info">
            <div class="color-hex">${backgroundColor}</div>
            <div>Surface Background</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Usage Rules &amp; Safe Margins</h2>
      <ul>
        <li>Maintain a minimum clear space equal to 25% of the symbol width around the logo.</li>
        <li>Never stretch, rotate, or alter the mathematical proportions of the emblem.</li>
        <li>Always ensure minimum 4.5:1 contrast against backdrops for accessibility.</li>
      </ul>
    </div>
  </div>
</body>
</html>`.trim();

  return {
    svgCode: standardSvg,
    lightSvgCode: lightSvg,
    darkSvgCode: darkSvg,
    monochromeSvgCode: monochromeSvg,
    faviconSvgCode,
    appIconSvgCode,
    designTokensJson: JSON.stringify(designTokens, null, 2),
    cssVariables,
    htmlStyleGuide,
  };
}

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
