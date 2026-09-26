export interface StyleOption {
  id: string;
  name: string;
  description: string;
  tag: string;
}

export interface ColorPaletteOption {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

export const INDUSTRIES = [
  "Technology & AI",
  "Coffee & Roastery",
  "Eco & Sustainability",
  "Fashion & Apparel",
  "Fitness & Athletics",
  "Food & Restaurant",
  "Finance & Fintech",
  "Creative Agency & Media",
  "Health & Wellness",
  "Real Estate & Architecture",
  "Gaming & Esports",
  "Automotive & Aerospace",
];

export const LOGO_STYLES: StyleOption[] = [
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    description: "Sleek geometric lines, clean negative space, timeless simplicity",
    tag: "Clean & Modern",
  },
  {
    id: "abstract-emblem",
    name: "Abstract Emblem",
    description: "Dynamic fluid symbols, conceptual icon, modern tech branding",
    tag: "High Concept",
  },
  {
    id: "monogram-mark",
    name: "Letterform Monogram",
    description: "Interlocking typemark initials with architectural symmetry",
    tag: "Signature",
  },
  {
    id: "cyber-neon",
    name: "Cyber & Holographic",
    description: "Luminescent vector contours, neon glow accents, dark backdrop",
    tag: "Futuristic",
  },
  {
    id: "vintage-crest",
    name: "Heritage Crest & Badge",
    description: "Artisan engraving, balanced filigree, timeless craft seal",
    tag: "Artisanal",
  },
  {
    id: "mascot-character",
    name: "Friendly Mascot",
    description: "Expressive illustrated character emblem, bold outlines",
    tag: "Playful",
  },
  {
    id: "luxury-gold",
    name: "Luxury Minimal",
    description: "Refined gold foil accents, high-fashion serif balance, ultra-premium",
    tag: "Editorial",
  },
];

export const COLOR_PALETTES: ColorPaletteOption[] = [
  {
    id: "tech-cyan",
    name: "Electric Cyan & Deep Navy",
    colors: ["#06b6d4", "#0284c7", "#0f172a"],
    description: "High-tech, trustworthy, and modern",
  },
  {
    id: "warm-ember",
    name: "Sunset Ember & Warm Coral",
    colors: ["#f97316", "#ef4444", "#fbbf24"],
    description: "Energetic, bold, and welcoming",
  },
  {
    id: "forest-sage",
    name: "Sage Green & Earth Copper",
    colors: ["#10b981", "#059669", "#78350f"],
    description: "Natural, organic, and grounded",
  },
  {
    id: "royal-gold",
    name: "Obsidian Black & Imperial Gold",
    colors: ["#eab308", "#ca8a04", "#18181b"],
    description: "Prestigious, luxurious, and refined",
  },
  {
    id: "monochrome",
    name: "High-Contrast Monochrome",
    colors: ["#09090b", "#71717a", "#fafafa"],
    description: "Timeless, universal, and bold",
  },
  {
    id: "violet-dream",
    name: "Ultraviolet & Magenta",
    colors: ["#8b5cf6", "#ec4899", "#3b82f6"],
    description: "Vibrant, creative, and imaginative",
  },
];

export const LOGO_ANIMATION_PROMPTS = [
  {
    title: "Cinematic Light Sweep",
    prompt:
      "A cinematic studio light sweep across the metallic emblem, soft volumetric ray illumination, elegant particle glint, 4k ultra-crisp motion",
  },
  {
    title: "3D Floating Hologram",
    prompt:
      "The logo emblem levitates gently with subtle 3D rotational perspective, glowing luminous edges, atmospheric dark studio backdrop",
  },
  {
    title: "Liquid Neon Form",
    prompt:
      "Smooth liquid neon energy streams together into the solid emblem, bursting into a sharp vibrant glow with glowing reflections",
  },
  {
    title: "Gentle Breathing Pulse",
    prompt:
      "Subtle breathing pulse motion of the central logo icon, soft radiant aura expanding and contracting smoothly, studio lighting",
  },
];

export const PHOTO_VIDEO_PRESETS = [
  {
    title: "Cinematic Slow Push-in",
    prompt:
      "Cinematic slow zoom dolly forward towards the subject, dramatic cinematic lighting, gentle natural motion, shallow depth of field",
  },
  {
    title: "Atmospheric Ambient Motion",
    prompt:
      "Subtle atmospheric environmental drift, soft breeze movement, changing golden sunlight rays, cinematic realism",
  },
  {
    title: "Dynamic Orbit Camera",
    prompt:
      "Smooth camera orbit around the focal subject, revealing depth and environmental lighting changes, professional cinematography",
  },
  {
    title: "Vibrant Energy Awakening",
    prompt:
      "Subtle time-lapse lighting shift, soft floating particles, radiant glow enhancement, filmic camera motion",
  },
];

export const ANIMATION_PRESETS = [
  {
    id: "fade-in",
    name: "Fade-In & Scale",
    description: "Smooth dissolve from transparency with high-impact forward zoom reveal",
    tag: "Cinematic Reveal",
    veoPrompt:
      "Dramatic cinematic slow fade in from pure darkness, golden specular edge glint, logo dissolves into solid form with soft atmospheric volumetric smoke",
  },
  {
    id: "elastic-bounce",
    name: "Elastic Bounce",
    description: "Dynamic gravity drop with spring overshoot and physical inertia settle",
    tag: "Kinetic Spring",
    veoPrompt:
      "Playful dynamic kinetic drop-in motion, logo bounces down onto clean reflective surface with subtle elastic squash and stretch settling effect",
  },
  {
    id: "orbit-spin",
    name: "360° Orbit Spin",
    description: "Continuous rotational sweep with concentric luminous halo rings",
    tag: "Continuous 3D",
    veoPrompt:
      "Full 360 degree smooth studio orbit rotation around the emblem, revealing metallic thickness and specular reflections on dark velvet backdrop",
  },
  {
    id: "pulse-breathe",
    name: "Neon Glow Pulse",
    description: "Rhythmic breathing luminescence with expanding chromatic aura waves",
    tag: "Organic Pulse",
    veoPrompt:
      "Hypnotic rhythmic breathing pulse motion, logo expands and contracts with radiant laser glow, illuminated neon reflections",
  },
  {
    id: "glitch-scan",
    name: "Cyber Glitch Scan",
    description: "Digital telemetry scanlines with RGB chromatic displacement",
    tag: "Futuristic Cyber",
    veoPrompt:
      "High-tech holographic glitch effect, digital scanline beam sweep, RGB chromatic aberration split, flickering cybernetic manifestation",
  },
  {
    id: "flip-3d",
    name: "3D Isometric Flip",
    description: "Tumbling card flip on X & Y axes with architectural depth",
    tag: "Spatial 3D",
    veoPrompt:
      "Isometric 3D card tumble flip in zero gravity, thick architectural edges caught in studio rim lighting, landing perfectly centered",
  },
  {
    id: "shimmer-sheen",
    name: "Metallic Light Sweep",
    description: "High-speed diagonal specular beam cutting across the contours",
    tag: "Luxury Sheen",
    veoPrompt:
      "Ultra-crisp diagonal laser beam sweeps across polished metallic chrome emblem, brilliant starburst glare glinting off edges",
  },
  {
    id: "liquid-wave",
    name: "Zero-G Liquid Drift",
    description: "Undulating sinusoidal floating motion with gentle angular tilting",
    tag: "Fluid Float",
    veoPrompt:
      "Weightless zero-gravity floating drift, emblem gently rocks and bobs on smooth invisible fluid waves with soft optical reflections",
  },
] as const;

export const ARTISTIC_STYLES = [
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon & Hologram",
    category: "Futuristic",
    description: "Vibrant cyan & electric magenta wireframes, chromatic aberration, holographic emission on obsidian dark grid",
    badge: "Holographic",
    accentColor: "#00FFCC",
    veoMotionPrompt: "Cyberpunk holographic hologram flickering with cyan and magenta laser scanlines, neon digital glitch motion",
  },
  {
    id: "bauhaus-risograph",
    name: "Bauhaus Geometric Risograph",
    category: "Constructivist",
    description: "Primary geometric planes (cobalt, vermillion, ochre) with authentic textured risograph ink stippling and asymmetry",
    badge: "Modernist",
    accentColor: "#FF3B00",
    veoMotionPrompt: "Stop-motion Bauhaus animated construction, geometric shapes snapping into place with tactile risograph paper texture",
  },
  {
    id: "liquid-chrome",
    name: "Liquid Chrome & 3D Gold",
    category: "Luxury",
    description: "Molten 3D mercury and polished 24k gold, flowing metallic reflections, hyper-specular studio environment",
    badge: "3D Molten",
    accentColor: "#F59E0B",
    veoMotionPrompt: "Molten liquid gold and mercury metal morphing and solidifying into the polished emblem, dramatic studio lighting",
  },
  {
    id: "japanese-woodblock",
    name: "Ukiyo-e Woodblock Print",
    category: "Artisanal",
    description: "Edo-period Japanese woodcut grain, sumi-e black ink calligraphic contouring, vintage washi paper deckle edge",
    badge: "Traditional",
    accentColor: "#E11D48",
    veoMotionPrompt: "Traditional Japanese woodblock print coming alive, subtle flowing water currents and ink strokes undulating naturally",
  },
  {
    id: "swiss-line-art",
    name: "Minimalist Swiss Modernism",
    category: "Corporate",
    description: "Ultra-precise monochrome vector contour lines, asymmetric Swiss grid alignment, timeless negative space elegance",
    badge: "Vector Clean",
    accentColor: "#FFFFFF",
    veoMotionPrompt: "Sleek geometric line art drawing itself in realtime with laser precision, pure black and white high-contrast animation",
  },
  {
    id: "pop-art-halftone",
    name: "Psychedelic 60s Pop Art",
    category: "Retro",
    description: "Silkscreen color-blocking, Ben-Day halftone dot pattern, saturated electric chartreuse, cyan, and hot magenta",
    badge: "Vibrant Pop",
    accentColor: "#EC4899",
    veoMotionPrompt: "Vibrant 1960s pop art screenprint flashing complementary psychedelic colors, groovy energetic pulse",
  },
  {
    id: "watercolor-ink",
    name: "Ethereal Watercolor & Ink Wash",
    category: "Organic",
    description: "Bleeding wet-on-wet pigments, deckled cotton paper texture, fluid gradients dissolving into crystalline splashes",
    badge: "Fine Art",
    accentColor: "#6366F1",
    veoMotionPrompt: "Watercolor paint bleeding and blooming across wet cotton paper, forming the logo mark in organic colored plumes",
  },
  {
    id: "synthwave-grid",
    name: "Synthwave 80s Retro Grid",
    category: "Retro Wave",
    description: "Chrome bevels, purple-to-vermillion sunset gradient, wireframe perspective grid horizon with starfield background",
    badge: "80s Retro",
    accentColor: "#D946EF",
    veoMotionPrompt: "80s synthwave camera flying across a neon purple wireframe grid towards glowing chrome logo under giant vector sun",
  },
  {
    id: "stained-glass",
    name: "Stained Glass Gothic Mosaic",
    category: "Ornamental",
    description: "Heavy lead came framing, jewel-toned fractured glass mosaic, warm sunlight rays beaming through prismatic color panes",
    badge: "Cathedral",
    accentColor: "#3B82F6",
    veoMotionPrompt: "Sunlight shifting through cathedral stained glass window, throwing dancing kaleidoscopic prismatic colors across the emblem",
  },
  {
    id: "brutalist-concrete",
    name: "Brutalist Monolithic Stone",
    category: "Architectural",
    description: "Heavy cast concrete block texture, chiseled bevels, stark low-angle architectural lighting and deep atmospheric shadows",
    badge: "Architectural",
    accentColor: "#94A3B8",
    veoMotionPrompt: "Massive chiseled concrete monolith rotating slowly under stark directional architectural spotlight, casting dramatic shadows",
  },
] as const;
