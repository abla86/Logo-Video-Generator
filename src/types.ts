export type ImageResolution = "512px" | "1K" | "2K" | "4K";
export type VideoAspectRatio = "16:9" | "9:16" | "1:1" | "4:5";
export type VideoResolution = "720p" | "1080p";

export type CostMode = "free-local" | "quota-free" | "user-key" | "premium-cloud";

export interface CostTelemetry {
  dailyTokensUsed: number;
  monthlyTokensUsed: number;
  dailySpendUSD: number;
  monthlySpendUSD: number;
  dailyLimitUSD: number;
  monthlyLimitUSD: number;
  isFreeLocalMode: boolean;
  zeroCostFilter: boolean;
  cacheHits: number;
  totalJobsProcessed: number;
}

export interface LogoRequest {
  companyName: string;
  industry: string;
  description: string;
  style: string;
  colorPalette: string;
  imageSize: ImageResolution;
  aspectRatio: string;
}

export interface GeneratedLogo {
  id: string;
  imageUrl: string;
  svgCode?: string;
  companyName: string;
  industry?: string;
  promptUsed: string;
  imageSize: ImageResolution;
  aspectRatio: string;
  timestamp: number;
  isVector?: boolean;
}

export interface VideoRequest {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
}

export interface GeneratedVideo {
  id: string;
  operationName?: string;
  streamUrl: string;
  videoUrl?: string;
  prompt: string;
  sourceImage?: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
  timestamp: number;
  title: string;
  duration?: number;
  fileSizeBytes?: number;
  validation?: VideoValidationReport;
  format?: "mp4" | "webm";
}

export type MediaAssetCategory =
  | "logo"
  | "video_clip"
  | "b_roll"
  | "product_photo"
  | "audio_track"
  | "banner"
  | "general";

export interface ImportedMediaAsset {
  id: string;
  name: string;
  type: "image" | "video" | "audio";
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  width?: number;
  height?: number;
  duration?: number;
  validationStatus: "valid" | "warning" | "invalid";
  validationNotes: string[];
  uploadedAt: number;
  // Tagging & Categorization System
  category?: MediaAssetCategory;
  projectTag?: string;
  styleTags?: string[];
  aspectRatioTag?: string;
  tags?: string[];
  autoCategorized?: boolean;
}

export interface BrandMusicTrack {
  id: string;
  title: string;
  audioUrl: string;
  prompt: string;
  durationSeconds: number;
  genre?: string;
  timestamp: number;
  isLocalProcedural?: boolean;
}

export interface BrandVerificationReport {
  id: string;
  companyName: string;
  availabilityScore: number; // 0 - 100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CONFLICT";
  reportMarkdown: string;
  sources: { uri: string; title: string }[];
  timestamp: number;
}

// Commercial Clients & Projects
export type ApprovalStatus = "draft" | "in_review" | "approved" | "delivered";

export interface ClientComment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  resolved: boolean;
}

export interface CampaignProject {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  platform: VideoTargetPlatform;
  aspectRatio: VideoAspectRatio;
  status: ApprovalStatus;
  commercialLicense: boolean;
  version: number;
  createdAt: number;
  updatedAt: number;
  comments: ClientComment[];
  prompt?: string;
  storyboardId?: string;
  renderedVideoUrl?: string;
  validationReport?: VideoValidationReport;
}

export interface ClientAccount {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  contactEmail: string;
  brandColors: string[];
  brandFont?: string;
  logoUrl?: string;
  projectCount: number;
  createdAt: number;
}

// Autonomous Video Engine Types
export type VideoTargetPlatform =
  | "tiktok"
  | "instagram-reel"
  | "youtube-short"
  | "snapchat"
  | "youtube-video"
  | "facebook-reel";

export type SalesFramework =
  | "AIDA"
  | "PAS"
  | "ProblemSolutionCTA"
  | "BeforeAfter"
  | "ProductDemo"
  | "Educational"
  | "SocialProof"
  | "Storytelling"
  | "MythVsFact"
  | "QA"
  | "Comparison"
  | "Listicle"
  | "LimitedTimeOffer"
  | "UGC";

export interface VideoScriptScene {
  id: string;
  sceneNumber: number;
  durationSeconds: number;
  visualPrompt: string;
  imageUrl?: string;
  narrationVoiceover: string;
  onScreenText: string;
  mood: string;
  transition: "cut" | "fade" | "dissolve" | "slide-left" | "zoom-in" | "glitch";
  soundEffect?: string;
}

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words?: SubtitleWord[];
}

export interface VideoSalesStrategy {
  productOrService: string;
  targetAudience: string;
  customerPains: string[];
  objectionsAndRebuttals: { objection: string; rebuttal: string }[];
  uniqueValueProposition: string;
  uniqueSellingPoints: string[];
  scrollStoppingHooks: string[];
  primaryCallToAction: string;
  offerDetails: string;
  missingInformationIdentified: string[];
  assumptionsMade: string[];
  recommendedHashtags: string[];
  adCopyVariants: { headline: string; primaryText: string; ctaText: string }[];
}

export interface AutonomousVideoProject {
  id: string;
  originalPrompt: string;
  platform: VideoTargetPlatform;
  aspectRatio: VideoAspectRatio;
  salesFramework: SalesFramework;
  totalDurationSeconds: number;
  strategy: VideoSalesStrategy;
  scenes: VideoScriptScene[];
  voiceoverAudioUrl?: string;
  voiceoverScript: string;
  subtitles: SubtitleSegment[];
  backgroundMusicUrl?: string;
  musicGenre: string;
  musicDuckingPercent: number; // e.g. 75% reduction when voiceover plays
  brandLogoUrl?: string;
  logoPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "outro";
  renderedVideoUrl?: string;
  renderedVideoFormat?: "mp4" | "webm";
  validation?: VideoValidationReport;
  status: "draft" | "analyzing" | "ready" | "rendering" | "complete" | "error";
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

// Video Validation (FFprobe output)
export interface VideoValidationReport {
  valid: boolean;
  format: string;
  videoCodec: string;
  audioCodec: string;
  width: number;
  height: number;
  aspectRatio: string;
  durationSeconds: number;
  fps: number;
  bitrateKbps: number;
  fileSizeBytes: number;
  isDecodable: boolean;
  errors: string[];
  warnings: string[];
  timestamp: number;
}

// Multi-track Timeline
export type TimelineTrackType = "visual" | "text" | "voiceover" | "music" | "brand";

export interface TimelineTrackItem {
  id: string;
  trackType: TimelineTrackType;
  startTime: number;
  duration: number;
  title: string;
  content: string; // URL, text string, or base64
  volume?: number;
  transition?: string;
  color?: string;
  locked?: boolean;
  muted?: boolean;
}

export interface TimelineTrack {
  id: string;
  type: TimelineTrackType;
  name: string;
  muted: boolean;
  locked: boolean;
  items: TimelineTrackItem[];
}

export type ActiveTab =
  | "video-producer"
  | "strategy-engine"
  | "timeline-editor"
  | "logo-designer"
  | "format-hub"
  | "media-assets"
  | "client-manager"
  | "brand-shield"
  | "sonic-branding"
  | "logo-animator"
  | "style-transfer"
  | "palette-studio"
  | "picture-to-video"
  | "gallery";

export type AnimationPresetId =
  | "fade-in"
  | "elastic-bounce"
  | "orbit-spin"
  | "pulse-breathe"
  | "glitch-scan"
  | "flip-3d"
  | "shimmer-sheen"
  | "liquid-wave";

export interface AnimationPreset {
  id: AnimationPresetId;
  name: string;
  description: string;
  tag: string;
  veoPrompt: string;
}

export type AnimationMode =
  | "ambient-glow"
  | "3d-tilt"
  | "orbit-spin"
  | "shimmer-pulse"
  | "mockup-showcase"
  | AnimationPresetId;

export interface BrandColorSpec {
  hex: string;
  name: string;
  role: string;
  usage: string;
  contrast?: string;
}

export interface SuggestedBrandPalette {
  paletteName: string;
  rationale: string;
  harmonyType: string;
  primary: BrandColorSpec;
  secondary: BrandColorSpec;
  accent: BrandColorSpec;
  background: BrandColorSpec;
  surface: BrandColorSpec;
  text: BrandColorSpec;
  typographySuggestion?: string;
}

export interface ArtisticStylePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  accentColor: string;
  veoMotionPrompt: string;
}

// ==========================================
// SPARK: Central Context Engine & Copilot Types
// ==========================================

export interface ProjectContext {
  id: string;
  productTitle: string;
  category: string;
  targetAudience: string;
  problemSolved: string;
  primaryPlatform: VideoTargetPlatform | "etsy" | "omnichannel";
  objective: string;
  priceRange: string;
  allowedThemes: string[];
  forbiddenThemes: string[];
  productImageUrl?: string;
  productImageName?: string;
  status: "draft" | "active" | "ready";
  updatedAt: number;
}

export type IdeaDataSource = "Kreativ idé" | "Markedsbasert forslag" | "Verifisert trend";

export interface SellableIdeaConcept {
  id: string;
  title: string;
  category: string;
  platform: "Etsy" | "TikTok Shop" | "Shopify" | "Gumroad" | "YouTube" | "Amazon";
  targetAudience: string;
  problemSolved: string;
  whyBuy: string;
  differentiation: string;
  difficulty: "Lav" | "Middels" | "Høy";
  estimatedProductionTime: string;
  suggestedPriceRange: string;
  contentOpportunities: string[];
  videoIdea: string;
  videoHook: string;
  keywords: string[];
  seasonality: string;
  dataSource: IdeaDataSource;
  feasibilityScore: number; // 0 - 100
  scoreBreakdown: {
    demand: number;
    competition: number;
    margin: number;
    timeToMarket: number;
  };
  scoreExplanation: string;
}

export type VariantAngle =
  | "ProblemSolution"
  | "ProductDemo"
  | "BeforeAfter"
  | "ThreeReasons"
  | "Storytelling"
  | "PAS"
  | "Educational"
  | "DirectSales"
  | "FacelessAesthetic"
  | "ASMRUnboxing";

export interface CampaignVariant {
  id: string;
  variantType: VariantAngle;
  title: string;
  hook: string;
  coreMessage: string;
  targetMood: string;
  cta: string;
  scriptPreview: string;
  scenes: VideoScriptScene[];
}

export interface OmnichannelPackage {
  etsy: {
    title: string;
    tags: string[];
    description: string;
    mockups: string[];
    digitalDownloadInstructions: string;
    productVideoConcept: string;
    priceStrategy: string;
  };
  tiktok: {
    hookFirst3s: string;
    format: "9:16";
    durationSeconds: number;
    script: string;
    onScreenText: string[];
    cta: string;
    soundRecommendation: string;
  };
  snapchat: {
    hookFirst2s: string;
    format: "9:16";
    durationSeconds: number;
    nativeStoryStyle: string;
    swipeUpCta: string;
    textOverlay: string;
  };
  youtubeShorts: {
    hook: string;
    durationSeconds: number;
    payoff: string;
    cta: string;
    loopPotential: string;
  };
  youtubeLong: {
    title: string;
    thumbnailConcept: string;
    introHook: string;
    chapters: { timestamp: string; title: string; summary: string }[];
    fullScriptOutline: string;
    brollSuggestions: string[];
    cta: string;
  };
  instagram: {
    reelScript: string;
    captionWithHashtags: string;
    storySequence: string[];
    feedVisualConcept: string;
  };
  facebook: {
    videoAdScript: string;
    aspect: "4:5" | "1:1";
    primaryAdCopy: string;
    headline: string;
    linkDescription: string;
    ctaButton: string;
  };
}

export interface SalesCopilotData {
  product: string;
  targetAudiencePersonas: {
    role: string;
    ageRange: string;
    motivation: string;
    biggestFrustration: string;
  }[];
  problemsSolved: string[];
  buyingArguments: { psychologicalTrigger: string; argument: string }[];
  usps: string[];
  hooks: {
    category: "Nysgjerrighet" | "Smertepunkt" | "Transformasjon" | "Kontrær";
    hookText: string;
  }[];
  ctas: {
    type: "Direkte salg" | "Lavterskel" | "FOMO/Knapphet";
    text: string;
  }[];
  adCopies: {
    format: string;
    headline: string;
    body: string;
    cta: string;
  }[];
  bundles: {
    name: string;
    items: string[];
    priceAdvantage: string;
  }[];
  upsells: {
    trigger: string;
    recommendation: string;
    expectedIncrease: string;
  }[];
  crossSells: {
    product: string;
    why: string;
  }[];
}

export interface SmartAutoSuggestion {
  id: string;
  triggerCondition: string;
  recommendation: string;
  actionLabel: string;
  actionType: "create-etsy-video" | "generate-variants" | "create-shorts" | "generate-tags" | "create-ad-copy";
}

export interface ContextGuardResult {
  isValid: boolean;
  detectedTopic: string;
  forbiddenDetected: string[];
  sanitizedText?: string;
}

// ==========================================
// Centralized ProjectContext State Management
// ==========================================

export interface ApprovedDeliverables {
  video: boolean;
  banners: Record<string, boolean>;
  slides: Record<number, boolean>;
  variants: Record<string, boolean>;
}

export interface CentralizedProjectState {
  // Brand & Business Identity
  companyName: string;
  brandLogoUrl?: string;
  productOrService: string;
  industry: string;
  targetAudience: string;
  uniqueValueProposition: string;
  selectedStrategyKey: string;

  // Active Video Project & Rendered Outputs
  activeProject: AutonomousVideoProject | null;
  renderedVideoUrl: string | null;
  validationReport: VideoValidationReport | null;

  // Commercial Copilot & Market Engine
  salesCopilotData: SalesCopilotData | null;
  activeStrategyRecommendation: any | null;
  variantsList: CampaignVariant[];
  omnichannelData: OmnichannelPackage | null;

  // Deliverables & Approval System
  approvedDeliverables: ApprovedDeliverables;

  // Global Sync Timestamp
  lastUpdated: number;
}

export interface ProjectContextType extends CentralizedProjectState {
  setCompanyName: (name: string) => void;
  setBrandLogoUrl: (url?: string) => void;
  setProductContext: (info: {
    productOrService: string;
    targetAudience?: string;
    uniqueValueProposition?: string;
    industry?: string;
  }) => void;
  setActiveProject: (project: AutonomousVideoProject | null) => void;
  setRenderedVideoUrl: (url: string | null, validation?: VideoValidationReport | null) => void;
  setSalesCopilotData: (data: SalesCopilotData | null) => void;
  setActiveStrategyRecommendation: (strategy: any | null, key?: string) => void;
  setVariantsList: (variants: CampaignVariant[]) => void;
  setOmnichannelData: (pkg: OmnichannelPackage | null) => void;
  setApprovedDeliverables: (
    approved: Partial<ApprovedDeliverables> | ((prev: ApprovedDeliverables) => ApprovedDeliverables)
  ) => void;
  toggleBannerApproval: (format: string, approved: boolean) => void;
  toggleSlideApproval: (slideIndex: number, approved: boolean) => void;
  toggleVariantApproval: (variantId: string, approved: boolean) => void;
  setVideoApproved: (approved: boolean) => void;
  approveAllDeliverables: () => void;
  resetProjectContext: () => void;
}

