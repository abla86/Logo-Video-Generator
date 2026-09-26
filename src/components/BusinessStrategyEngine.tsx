/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  Package,
  DollarSign,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  ShoppingBag,
  Scissors,
  Dumbbell,
  Gem,
  Store,
  Rocket,
  Layers,
  Share2,
  Users,
  Shield,
  BarChart3,
  Search,
  ExternalLink,
  Flame,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  AutonomousVideoProject,
  SellableIdeaConcept,
  SalesCopilotData,
  IdeaDataSource,
} from "../types";
import { useProjectContext } from "../context/ProjectContext";

export interface BusinessRecommendation {
  businessType: string;
  recommendedServices: { name: string; why: string; targetAudience: string }[];
  recommendedProducts: { name: string; why: string; margin: string }[];
  introductoryOffers: { offer: string; priceStrategy: string; conversionGoal: string }[];
  packagesAndBundles: { bundleName: string; contents: string; perceivedValue: string }[];
  upsellAndCrossSell: { trigger: string; upsell: string; crossSell: string }[];
  leadMagnets: { title: string; format: string; hook: string }[];
  contentFunnelPhases: {
    phase: "Awareness (Oppmerksomhet)" | "Consideration (Vurdering)" | "Decision (Handling)" | "Retention (Gjenkjøp)";
    videoConcept: string;
    targetPlatform: string;
    problemSolved: string;
    whyItWorks: string;
  }[];
  contentSeries: { seriesName: string; episodeIdeas: string[] }[];
}

const BUSINESS_TEMPLATES: Record<string, BusinessRecommendation> = {
  "etsy-dayplanner": {
    businessType: "Etsy Dayplanner & Digitale Notatmaler",
    recommendedServices: [
      {
        name: "2026 Ultimate Life & Work Dayplanner (Digital & Printbar PDF)",
        why: "Ekstremt høy organisk etterspørsel på Etsy, null varelager, 100% profittmargin etter plattformgebyr.",
        targetAudience: "Studenter, travle gründere, yrkesaktive og mødre som vil ha kontroll over hverdagen.",
      },
      {
        name: "Månedlig Goal-Setting & Habit Tracker Mal",
        why: "Perfekt lavterskel-kjøp for å samle 5-stjerners anmeldelser og bygge lojalitet på Etsy.",
        targetAudience: "Folk som ønsker enkle daglige rutiner uten kompliserte systemer.",
      },
    ],
    recommendedProducts: [
      { name: "GoodNotes / Notability Digital Klistremerkepakke", why: "Mest populære tilleggsprodukt på Etsy for estetiske notater.", margin: "95% margin" },
      { name: "Finansiell Budsjett- & Spareplanlegger", why: "Sesongløs bestselger for personlig økonomi og måloppnåelse.", margin: "95% margin" },
    ],
    introductoryOffers: [
      {
        offer: "25% lanseringsrabatt + 50 gratis estetiske klistremerker ved kjøp i dag",
        priceStrategy: "Pris under 149 kr fjerner kjøpsterskelen og gir høyt salgsvolum raskt.",
        conversionGoal: "Få mange salg de første 48 timene for å klatre i Etsy-søkefeltet.",
      },
    ],
    packagesAndBundles: [
      {
        bundleName: "The All-in-One Life Planner Bundle",
        contents: "Dayplanner + Budsjettmal + Treningslogg + 200 estetiske klistremerker.",
        perceivedValue: "Kunden sparer 40% sammenlignet med å kjøpe malene enkeltvis.",
      },
    ],
    upsellAndCrossSell: [
      {
        trigger: "Kunden legger Dayplanner i handlekurven på Etsy",
        upsell: "«Vil du legge til vår matplanlegger for kun 39 kr ekstra?»",
        crossSell: "E-bok med 21 dagers rutineguide for tidsstyring og fokus.",
      },
    ],
    leadMagnets: [
      {
        title: "Gratis Ukesplanlegger (Printbar PDF)",
        format: "Nedlastbar 1-sides PDF i bytte mot e-postadresse.",
        hook: "Test vår mest populære ukesoversikt helt gratis før du kjøper fullversjonen.",
      },
    ],
    contentFunnelPhases: [
      {
        phase: "Awareness (Oppmerksomhet)",
        videoConcept: "«Slik planlegger jeg hele uken på under 10 minutter med iPad & GoodNotes» (Aesthetic ASMR).",
        targetPlatform: "TikTok & Instagram Reels (9:16)",
        problemSolved: "Inspirerer og viser hvor beroligende og ryddig det er å ha kontroll.",
        whyItWorks: "ASMR og estetisk planlegging har enorm viral spredning på TikTok og Pinterest.",
      },
      {
        phase: "Consideration (Vurdering)",
        videoConcept: "Bla gjennom alle funksjonene: Dagsplan, vanelogger, prioriteringer og klistremerker.",
        targetPlatform: "YouTube Shorts & TikTok",
        problemSolved: "Fjerner usikkerhet om filen fungerer på kundens nettbrett.",
        whyItWorks: "Viser den faktiske brukeropplevelsen i detalj.",
      },
      {
        phase: "Decision (Handling)",
        videoConcept: "«Lanseringssalg: 25% rabatt på Etsy bare denne helgen – direkte link i bio!»",
        targetPlatform: "Snapchat Spotlight & Instagram Stories",
        problemSolved: "Får seeren til å trykke på linken og kjøpe nå.",
        whyItWorks: "Tidsbegrenset rabatt og direkte call-to-action skaper FOMO.",
      },
      {
        phase: "Retention (Gjenkjøp)",
        videoConcept: "Slik oppsummerer jeg måneden og setter nye mål for neste måned.",
        targetPlatform: "Nyhetsbrev & TikTok Community",
        problemSolved: "Holder brukerne engasjerte gjennom hele året.",
        whyItWorks: "Bygger lojalitet til merkevaren og forbereder neste års planner-kjøp.",
      },
    ],
    contentSeries: [
      {
        seriesName: "«Plan With Me: Søndagsrutinen» (Ukentlig serie)",
        episodeIdeas: [
          "Ep. 1: Slik prioriterer jeg ukens 3 viktigste mål uten å bli overveldet.",
          "Ep. 2: Fargetesting og klistremerker for en rolig planleggingsstund.",
          "Ep. 3: Fra prokrastinering til flyt: Min 15-minutters kveldsrutine.",
        ],
      },
    ],
  },
  "snapchat-fashion": {
    businessType: "Klesmerke & Mote (Snapchat & TikTok)",
    recommendedServices: [
      {
        name: "Sesongens Drop: Streetwear & Tidløse Hverdagsplagg",
        why: "Høy delingsfrekvens blant unge voksne, store ordrestørrelser (AOV 800-1600 kr).",
        targetAudience: "Motebevisste personer 16-35 år som ser etter god passform og stil.",
      },
    ],
    recommendedProducts: [
      { name: "Heavyweight Oversized Hoodie", why: "Flaggskipprodukt som selger ut raskest.", margin: "75% margin" },
      { name: "Caps og tilbehør med diskret logo", why: "Enkel kurvfyller ved kassen.", margin: "80% margin" },
    ],
    introductoryOffers: [
      {
        offer: "20% rabatt på din første bestilling + fri frakt ved kjøp over 600 kr",
        priceStrategy: "Fjerner fraktbarrieren og oppfordrer til å legge til et ekstra plagg.",
        conversionGoal: "Skaffe førstegangskjøpere som returnerer ved neste kolleksjonsslipp.",
      },
    ],
    packagesAndBundles: [
      {
        bundleName: "The Essential Streetwear Set (Hoodie + Bukse)",
        contents: "Komplett matchende sett med 250 kr avslag.",
        perceivedValue: "Maksimal stilfaktor for pengene.",
      },
    ],
    upsellAndCrossSell: [
      {
        trigger: "Kunden velger en hoodie",
        upsell: "«Match med caps for kun 199 kr ekstra.»",
        crossSell: "Spesialsokker med logo.",
      },
    ],
    leadMagnets: [
      {
        title: "Tidlig tilgang til neste kolleksjonsslipp på SMS",
        format: "SMS-varsling 1 time før offentlig lansering.",
        hook: "Ikke gå glipp av størrelsen din – bli med på VIP-listen.",
      },
    ],
    contentFunnelPhases: [
      {
        phase: "Awareness (Oppmerksomhet)",
        videoConcept: "Rask outfit-overgang i urbant miljø med energisk musikk og 'outfit check'.",
        targetPlatform: "Snapchat Spotlight & TikTok",
        problemSolved: "Viser passformen og teksturen i bevegelse.",
        whyItWorks: "Rask klipping og trendy lydspor fanger blikket umiddelbart.",
      },
      {
        phase: "Consideration (Vurdering)",
        videoConcept: "Nærbilde av sømmer, stofftykkelse og vaskelapp som beviser slitestyrke.",
        targetPlatform: "Instagram Reels & TikTok",
        problemSolved: "Fjerner tvil om materialkvalitet ved netthandel.",
        whyItWorks: "Tydelig kvalitetsbevis skiller merket fra billig fast-fashion.",
      },
      {
        phase: "Decision (Handling)",
        videoConcept: "«Siste sjanse: 20% velkomstrabatt utløper ved midnatt – fri frakt nå!»",
        targetPlatform: "Snapchat Commercials & Stories",
        problemSolved: "Utløser umiddelbar handling.",
        whyItWorks: "Tidsbegrensning og rabattkode trigger impulsbestilling.",
      },
      {
        phase: "Retention (Gjenkjøp)",
        videoConcept: "Slik styler du samme hoodie på 3 helt forskjellige måter.",
        targetPlatform: "Instagram & TikTok",
        problemSolved: "Hjelper kunden å få mer ut av kjøpet sitt.",
        whyItWorks: "Øker stoltheten over plagget og skaper ambassadører.",
      },
    ],
    contentSeries: [
      {
        seriesName: "«Designprosessen fra skisse til ferdig plagg»",
        episodeIdeas: [
          "Ep. 1: Hvorfor vi testet 12 ulike stoffer før vi fant den perfekte tykkelsen.",
          "Ep. 2: Første vareprøve ankommer lageret...",
          "Ep. 3: Pakker de 100 første bestillingene.",
        ],
      },
    ],
  },
  "nettbutikk": {
    businessType: "Nettbutikk & Fysiske Produkter",
    recommendedServices: [
      {
        name: "Abonnement på forbruksvarer (Autolevering)",
        why: "Fast månedlig omsetning og redusert kundeanskaffelseskost.",
        targetAudience: "Lojale kunder som bruker produktet jevnlig.",
      },
    ],
    recommendedProducts: [
      { name: "Bestseller Produkt & Tilbehør", why: "Drivkraften bak butikkens trafikk.", margin: "70% margin" },
    ],
    introductoryOffers: [
      {
        offer: "Kjøp 2 få 1 gratis på utvalgte varer",
        priceStrategy: "Øker gjennomsnittlig handlekurvverdi (AOV).",
        conversionGoal: "Få kunden til å prøve flere produktvarianter.",
      },
    ],
    packagesAndBundles: [
      {
        bundleName: "Komplett Startkit",
        contents: "Hovedprodukt + 2 tilbehørsprodukter til pakkepris.",
        perceivedValue: "Kunden sparer 30% mot enkeltkjøp.",
      },
    ],
    upsellAndCrossSell: [
      {
        trigger: "Kunden går til kassen",
        upsell: "Legg til ekspressfrakt og gaveinnpakning for 49 kr.",
        crossSell: "Tilby komplementær vare som andre kjøpte sammen.",
      },
    ],
    leadMagnets: [
      {
        title: "Rabattkode 15% på første ordre ved påmelding til nyhetsbrev",
        format: "Pop-up ved exit-intent på nettsiden.",
        hook: "Meld deg inn i kundeklubben og få 15% rabatt med én gang.",
      },
    ],
    contentFunnelPhases: [
      {
        phase: "Awareness (Oppmerksomhet)",
        videoConcept: "Unboxing-reaksjon med ekte kunde og 'se hva som kom i posten'.",
        targetPlatform: "TikTok & Reels (9:16)",
        problemSolved: "Gjør seeren nysgjerrig på produktet.",
        whyItWorks: "UGC-stilen føles genuint og ikke som en tradisjonell TV-reklame.",
      },
      {
        phase: "Consideration (Vurdering)",
        videoConcept: "Sammenligning: Vårt produkt vs. billige kopier fra utlandet.",
        targetPlatform: "Instagram Karusell & YouTube Shorts",
        problemSolved: "Begrunner prisen og viser overlegen kvalitet og holdbarhet.",
        whyItWorks: "Fjerner tvil om hvorvidt produktet er verdt pengene.",
      },
      {
        phase: "Decision (Handling)",
        videoConcept: "Pakking av dagens ordre med personlig hilsen + 'Kun 12 igjen på lager'.",
        targetPlatform: "TikTok Live & Instagram Stories",
        problemSolved: "Skaper hastverk og sosialt bevis.",
        whyItWorks: "Folk vil ha det andre kjøper.",
      },
      {
        phase: "Retention (Gjenkjøp)",
        videoConcept: "Eksklusiv forhåndstitt på neste ukes nye farger for nyhetsbrevabonnenter.",
        targetPlatform: "E-post og lukkede fellesskap",
        problemSolved: "Får kunden til å åpne e-postene dine jevnlig.",
        whyItWorks: "Følelsen av å være en VIP gir lojalitet.",
      },
    ],
    contentSeries: [
      {
        seriesName: "«Bak kulissene på lageret»",
        episodeIdeas: [
          "Ep. 1: Pakker den største ordren i nettbutikkens historie.",
          "Ep. 2: Når leverandøren sender feil farge...",
          "Ep. 3: Svarer på de rareste spørsmålene vi får i kundeservice.",
        ],
      },
    ],
  },
};

interface BusinessStrategyEngineProps {
  onApplyStrategyToAutopilot: (prompt: string, recommendation: BusinessRecommendation) => void;
}

export const BusinessStrategyEngine: React.FC<BusinessStrategyEngineProps> = ({
  onApplyStrategyToAutopilot,
}) => {
  const projectCtx = useProjectContext();
  const [activeSubTab, setActiveSubTab] = useState<"ideas" | "copilot" | "funnel" | "trends">(
    "ideas"
  );
  const [selectedKey, setSelectedKey] = useState<string>(() => projectCtx.selectedStrategyKey || "etsy-dayplanner");
  const [customSearchQuery, setCustomSearchQuery] = useState("");
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState(false);
  const [customRecommendation, setCustomRecommendation] = useState<BusinessRecommendation | null>(
    () => projectCtx.activeStrategyRecommendation || null
  );

  // Ideas state
  const [ideas, setIdeas] = useState<SellableIdeaConcept[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [selectedIdeaFilter, setSelectedIdeaFilter] = useState<string>("alle");

  // Copilot state
  const [copilotData, setCopilotData] = useState<SalesCopilotData | null>(
    () => projectCtx.salesCopilotData || null
  );
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);

  const currentRecommendation =
    customRecommendation || BUSINESS_TEMPLATES[selectedKey] || BUSINESS_TEMPLATES["etsy-dayplanner"];

  // Fetch sellable ideas on mount
  useEffect(() => {
    setIsLoadingIdeas(true);
    fetch("/api/generate-ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Etsy & Digital Products" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ideas) setIdeas(data.ideas);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingIdeas(false));
  }, []);

  // Fetch sales copilot data when switching to copilot tab
  useEffect(() => {
    if (activeSubTab === "copilot" && !copilotData) {
      setIsLoadingCopilot(true);
      const prodName = currentRecommendation.businessType || "Digital Dayplanner for Etsy";
      fetch("/api/sales-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: prodName }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.copilot) setCopilotData(data.copilot);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoadingCopilot(false));
    }
  }, [activeSubTab, currentRecommendation, copilotData]);

  const handleSelectTemplate = (key: string) => {
    setSelectedKey(key);
    setCustomRecommendation(null);
  };

  const handleAnalyzeCustomBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchQuery.trim()) return;

    setIsAnalyzingCustom(true);
    try {
      const res = await fetch("/api/suggest-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: customSearchQuery.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.strategy) {
          setCustomRecommendation(data.strategy);
          setSelectedKey("custom");
          // Also refresh Copilot
          fetch("/api/sales-copilot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product: customSearchQuery.trim() }),
          })
            .then((r) => r.json())
            .then((cData) => {
              if (cData.copilot) setCopilotData(cData.copilot);
            });
        }
      }
    } catch (err) {
      console.warn("Could not query dynamic strategy:", err);
    } finally {
      setIsAnalyzingCustom(false);
    }
  };

  const handleLaunchAutopilotWithStrategy = () => {
    projectCtx.setProductContext({
      productOrService: currentRecommendation.businessType,
      targetAudience: currentRecommendation.recommendedServices[0]?.targetAudience,
      uniqueValueProposition: currentRecommendation.introductoryOffers[0]?.offer,
    });
    projectCtx.setActiveStrategyRecommendation(currentRecommendation, selectedKey);
    if (copilotData) projectCtx.setSalesCopilotData(copilotData);

    const promptText = `Lag en kommersiell video for ${currentRecommendation.businessType}. Hovedtilbud: ${
      currentRecommendation.introductoryOffers[0]?.offer || "Introduksjonstilbud"
    }. Målgruppe: ${
      currentRecommendation.recommendedServices[0]?.targetAudience || "Målgruppe"
    }. Lag fengende hooks, overbevisende manus og tydelig CTA.`;
    onApplyStrategyToAutopilot(promptText, currentRecommendation);
  };

  const handleLaunchIdeaInAutopilot = (idea: SellableIdeaConcept) => {
    const promptText = `Lag en salgsvideo for ${idea.title} på ${idea.platform}. Målgruppe: ${idea.targetAudience}. Problem som løses: ${idea.problemSolved}. Hook: ${idea.videoHook}.`;
    const pseudoRec: BusinessRecommendation = {
      businessType: `${idea.title} (${idea.platform})`,
      recommendedServices: [{ name: idea.title, why: idea.whyBuy, targetAudience: idea.targetAudience }],
      recommendedProducts: [{ name: idea.title, why: idea.differentiation, margin: "95% margin" }],
      introductoryOffers: [{ offer: `Spesialtilbud: ${idea.suggestedPriceRange}`, priceStrategy: "Lansering", conversionGoal: "Salg" }],
      packagesAndBundles: [],
      upsellAndCrossSell: [],
      leadMagnets: [],
      contentFunnelPhases: [
        {
          phase: "Awareness (Oppmerksomhet)",
          videoConcept: idea.videoIdea,
          targetPlatform: "TikTok 9:16",
          problemSolved: idea.problemSolved,
          whyItWorks: "Fanger oppmerksomhet med viral hook",
        },
      ],
      contentSeries: [],
    };
    projectCtx.setProductContext({
      productOrService: idea.title,
      targetAudience: idea.targetAudience,
      uniqueValueProposition: idea.problemSolved,
    });
    projectCtx.setActiveStrategyRecommendation(pseudoRec, idea.id);
    onApplyStrategyToAutopilot(promptText, pseudoRec);
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (selectedIdeaFilter === "alle") return true;
    if (selectedIdeaFilter === "etsy") return idea.platform === "Etsy";
    if (selectedIdeaFilter === "high-score") return idea.feasibilityScore >= 92;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF3B00]" />
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              Salgsmotor &amp; Idéhub // SPARK Intelligence
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Finn ut nøyaktig hva som kan selge på Etsy, TikTok og sosiale medier, bygg kjøpsargumenter og lag innhold som konverterer.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleLaunchAutopilotWithStrategy}
          className="px-4 py-2.5 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-[#FF3B00]/20 rounded"
        >
          <Sparkles className="w-4 h-4" />
          <span>Produser Video Fra Aktiv Strategi</span>
        </button>
      </div>

      {/* Search Bar for ANY Custom Business, Product or Marketplace */}
      <div className="bg-[#141416] border border-[#262626] p-5 rounded space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FF3B00]" />
            <span>Søk eller Skriv Inn Hvilken Som Helst Idé, Produkt eller Nisje:</span>
          </label>
          <span className="text-[10px] font-mono text-emerald-400">
            Fungerer for Etsy, TikTok, Snapchat, YouTube, Shopify m.m.
          </span>
        </div>

        <form onSubmit={handleAnalyzeCustomBusiness} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
              placeholder="F.eks: Digital dayplanner på Etsy, meal planner for travle mødre, YouTube faceless channel..."
              className="w-full bg-[#101012] border border-[#333] focus:border-[#FF3B00] px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none rounded font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzingCustom || !customSearchQuery.trim()}
            className="px-5 py-2.5 bg-[#FF3B00] hover:bg-[#e03400] disabled:opacity-50 text-black font-black uppercase text-xs font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 rounded"
          >
            {isAnalyzingCustom ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Analyserer...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyser Idé</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-mono text-zinc-400 pt-1">
          <span className="shrink-0 text-zinc-500 text-[10px] uppercase font-bold">Raske Eksempler:</span>
          {[
            "Etsy Dayplanner & Notatmaler",
            "Printable Habit Tracker",
            "Snapchat & TikTok Klesmerke / Streetwear",
            "YouTube Shorts for Personlig Økonomi",
            "Print-on-Demand Veggplakater",
          ].map((suggestion, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => {
                setCustomSearchQuery(suggestion);
                fetch("/api/suggest-strategy", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ query: suggestion }),
                })
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.strategy) {
                      setCustomRecommendation(d.strategy);
                      setSelectedKey("custom");
                    }
                  });
              }}
              className="shrink-0 px-2.5 py-1 bg-[#1A1A1E] hover:bg-[#252528] hover:border-[#FF3B00] border border-[#2D2D32] text-zinc-200 rounded cursor-pointer transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262626] pb-3 text-xs font-mono uppercase overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("ideas")}
          className={`px-4 py-2 border transition-colors cursor-pointer rounded flex items-center gap-2 ${
            activeSubTab === "ideas"
              ? "bg-[#FF3B00] text-black font-bold border-[#FF3B00]"
              : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>🔎 Finn Salgbar Idé ({ideas.length} Konsepter)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("copilot")}
          className={`px-4 py-2 border transition-colors cursor-pointer rounded flex items-center gap-2 ${
            activeSubTab === "copilot"
              ? "bg-[#FF3B00] text-black font-bold border-[#FF3B00]"
              : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Sales Copilot (Kjøpsargumenter &amp; Målgruppe)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("funnel")}
          className={`px-4 py-2 border transition-colors cursor-pointer rounded flex items-center gap-2 ${
            activeSubTab === "funnel"
              ? "bg-[#FF3B00] text-black font-bold border-[#FF3B00]"
              : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kommersiell Trakt &amp; Tilbud</span>
        </button>

        <button
          onClick={() => setActiveSubTab("trends")}
          className={`px-4 py-2 border transition-colors cursor-pointer rounded flex items-center gap-2 ${
            activeSubTab === "trends"
              ? "bg-[#FF3B00] text-black font-bold border-[#FF3B00]"
              : "bg-[#141416] text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Trend- &amp; Markedsdata</span>
        </button>
      </div>

      {/* 1. SUB-TAB: FINN SALGBAR IDÉ */}
      {activeSubTab === "ideas" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#101012] p-4 border border-[#262626] rounded">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF3B00]" />
                <span>Salgbare Konsepter med Dokumentert Etterspørsel</span>
              </h3>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Konkrete produkter med estimert produksjonstid, prisintervall, søkeord og transparent lønnsomhetsscore.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500">Filter:</span>
              <button
                onClick={() => setSelectedIdeaFilter("alle")}
                className={`px-2.5 py-1 rounded cursor-pointer border ${
                  selectedIdeaFilter === "alle" ? "bg-[#FF3B00] text-black font-bold" : "bg-[#18181A] text-zinc-300 border-zinc-700"
                }`}
              >
                Alle ({ideas.length})
              </button>
              <button
                onClick={() => setSelectedIdeaFilter("etsy")}
                className={`px-2.5 py-1 rounded cursor-pointer border ${
                  selectedIdeaFilter === "etsy" ? "bg-[#FF3B00] text-black font-bold" : "bg-[#18181A] text-zinc-300 border-zinc-700"
                }`}
              >
                Kun Etsy
              </button>
              <button
                onClick={() => setSelectedIdeaFilter("high-score")}
                className={`px-2.5 py-1 rounded cursor-pointer border ${
                  selectedIdeaFilter === "high-score" ? "bg-[#FF3B00] text-black font-bold" : "bg-[#18181A] text-zinc-300 border-zinc-700"
                }`}
              >
                Score 92%+
              </button>
            </div>
          </div>

          {isLoadingIdeas ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#FF3B00] animate-spin mx-auto" />
              <p className="text-xs font-mono text-zinc-400">Laster salgbare konsepter...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIdeas.map((idea) => {
                const badgeColor =
                  idea.dataSource === "Verifisert trend"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                    : idea.dataSource === "Markedsbasert forslag"
                    ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                    : "bg-purple-950 text-purple-300 border-purple-500/40";

                return (
                  <div
                    key={idea.id}
                    className="p-5 bg-[#141416] border border-[#2D2D32] hover:border-[#FF3B00] rounded space-y-4 flex flex-col justify-between transition-colors shadow-lg"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-[#222] pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border bg-[#1E1E22] text-white">
                              {idea.platform}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
                              [{idea.dataSource.toUpperCase()}]
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white mt-1.5">{idea.title}</h4>
                        </div>

                        {/* Score Circle */}
                        <div className="text-right shrink-0">
                          <div className="text-xl font-black text-[#FF3B00]">{idea.feasibilityScore}</div>
                          <div className="text-[9px] font-mono text-zinc-500 uppercase">Score / 100</div>
                        </div>
                      </div>

                      {/* Problem & Audience */}
                      <div className="space-y-1.5 text-xs">
                        <div className="text-zinc-300">
                          <strong className="text-white font-mono text-[11px] uppercase">Målgruppe: </strong>
                          {idea.targetAudience}
                        </div>
                        <div className="text-zinc-300">
                          <strong className="text-white font-mono text-[11px] uppercase">Problem: </strong>
                          {idea.problemSolved}
                        </div>
                        <div className="text-zinc-300">
                          <strong className="text-white font-mono text-[11px] uppercase">Hvorfor kjøpe: </strong>
                          {idea.whyBuy}
                        </div>
                      </div>

                      {/* Metrics Bar */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#0D0D0F] border border-[#222] rounded text-[11px] font-mono">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Prisnivå:</span>
                          <span className="text-emerald-400 font-bold">{idea.suggestedPriceRange}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Produksjonstid:</span>
                          <span className="text-white">{idea.estimatedProductionTime}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Vanskelighet:</span>
                          <span className="text-white">{idea.difficulty}</span>
                        </div>
                      </div>

                      {/* Video Idea & Hook */}
                      <div className="p-3 bg-[#1A1A1E] border border-zinc-700/60 rounded space-y-1 text-xs">
                        <div className="text-[10px] font-mono text-[#FF3B00] uppercase font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Videoidé &amp; Hook:</span>
                        </div>
                        <div className="text-white font-medium italic">«{idea.videoHook}»</div>
                        <div className="text-zinc-400 text-[11px]">{idea.videoIdea}</div>
                      </div>

                      {/* Score Explanation */}
                      <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                        <span>{idea.scoreExplanation}</span>
                      </div>
                    </div>

                    {/* Launch Button */}
                    <button
                      type="button"
                      onClick={() => handleLaunchIdeaInAutopilot(idea)}
                      className="w-full py-2.5 bg-[#FF3B00] hover:bg-[#e03400] text-black font-black uppercase text-xs font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors rounded shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Produser Video For Dette Konseptet</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. SUB-TAB: SALES COPILOT */}
      {activeSubTab === "copilot" && (
        <div className="space-y-6">
          <div className="bg-[#101012] p-4 border border-[#262626] rounded flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Sales Copilot // Dyp Kommersiell Analyse</span>
              </h3>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Konverteringsorientert innsikt: personas, psykologiske triggere, USPs, hooks og kryssalg.
              </p>
            </div>
            <span className="text-xs font-mono text-white bg-[#1C1C1E] px-3 py-1 rounded border border-[#333]">
              Produkt: {currentRecommendation.businessType}
            </span>
          </div>

          {isLoadingCopilot ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs font-mono text-zinc-400">Bygger salgsassistent-innsikt...</p>
            </div>
          ) : copilotData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buyer Personas */}
              <div className="p-5 bg-[#141416] border border-[#262626] rounded space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-[#FF3B00] flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Kjøper-Personas (Hvem kjøper dette?):</span>
                </h4>
                <div className="space-y-3">
                  {copilotData.targetAudiencePersonas.map((persona, pIdx) => (
                    <div key={pIdx} className="p-3 bg-[#18181A] border border-[#2D2D32] rounded space-y-1 text-xs">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{persona.role}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{persona.ageRange}</span>
                      </div>
                      <div className="text-zinc-300">
                        <strong className="text-zinc-400">Motivasjon: </strong>
                        {persona.motivation}
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        <strong className="text-red-400">Frustrasjon: </strong>
                        {persona.biggestFrustration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buying Arguments & Psychological Triggers */}
              <div className="p-5 bg-[#141416] border border-[#262626] rounded space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Psykologiske Kjøpsargumenter:</span>
                </h4>
                <div className="space-y-3">
                  {copilotData.buyingArguments.map((arg, aIdx) => (
                    <div key={aIdx} className="p-3 bg-[#18181A] border border-[#2D2D32] rounded space-y-1 text-xs">
                      <div className="font-bold text-emerald-300 text-[11px] uppercase font-mono">
                        {arg.psychologicalTrigger}
                      </div>
                      <p className="text-zinc-200 leading-relaxed">{arg.argument}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll-stopping Viral Hooks */}
              <div className="p-5 bg-[#141416] border border-[#262626] rounded space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span>Scroll-Stopping Hooks (Første 3 sekunder):</span>
                </h4>
                <div className="space-y-2">
                  {copilotData.hooks.map((h, hIdx) => (
                    <div key={hIdx} className="p-3 bg-[#18181A] border border-[#2D2D32] rounded text-xs space-y-1">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#25252A] text-amber-300 rounded">
                        {h.category}
                      </span>
                      <p className="text-white font-medium italic mt-1">{h.hookText}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bundles & Upsells */}
              <div className="p-5 bg-[#141416] border border-[#262626] rounded space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-400 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Pakketilbud &amp; Merverdi (Bundles):</span>
                </h4>
                <div className="space-y-3">
                  {copilotData.bundles.map((b, bIdx) => (
                    <div key={bIdx} className="p-3 bg-[#18181A] border border-[#2D2D32] rounded text-xs space-y-2">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{b.name}</span>
                        <span className="text-[10px] font-mono text-purple-300">{b.priceAdvantage}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {b.items.map((item, iIdx) => (
                          <span key={iIdx} className="text-[10px] font-mono px-2 py-0.5 bg-black/50 text-zinc-300 rounded">
                            + {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {copilotData.upsells.map((u, uIdx) => (
                    <div key={uIdx} className="p-3 bg-[#18181A] border border-[#2D2D32] rounded text-xs space-y-1">
                      <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                        Upsell ved utsjekk: {u.expectedIncrease}
                      </div>
                      <p className="text-zinc-300">{u.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* 3. SUB-TAB: TRAKT & TILBUD */}
      {activeSubTab === "funnel" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRecommendation.contentFunnelPhases.map((phase, pIdx) => (
              <div
                key={pIdx}
                className="p-4 bg-[#141416] border border-[#262626] rounded space-y-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#FF3B00]/20 text-[#FF3B00] rounded font-bold">
                    Fase {pIdx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-2">{phase.phase}</h4>
                  <p className="text-xs text-zinc-300 mt-2 font-medium">«{phase.videoConcept}»</p>
                  <div className="text-[11px] font-mono text-zinc-500 mt-2">Kanal: {phase.targetPlatform}</div>
                </div>
                <div className="pt-3 border-t border-[#222] text-[11px] text-zinc-400">
                  <span className="text-zinc-500 block text-[9px] uppercase font-mono">Hvorfor det virker:</span>
                  <span>{phase.whyItWorks}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Introductory Offers */}
          <div className="p-6 bg-[#141416] border border-[#262626] rounded space-y-4">
            <h4 className="text-sm font-mono font-bold uppercase text-white">
              Anbefalte Lanseringstilbud:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentRecommendation.introductoryOffers.map((off, oIdx) => (
                <div key={oIdx} className="p-4 bg-[#18181A] border border-[#333] rounded space-y-2 text-xs">
                  <div className="font-bold text-white text-sm">{off.offer}</div>
                  <div className="text-zinc-400">{off.priceStrategy}</div>
                  <div className="text-emerald-400 font-mono text-[11px]">Mål: {off.conversionGoal}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: TRENDS & DATA VERIFICATION */}
      {activeSubTab === "trends" && (
        <div className="p-6 bg-[#141416] border border-[#262626] rounded space-y-6">
          <div className="border-b border-[#262626] pb-4">
            <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Trend- og Markedsmodus (Klart skille mellom Data og AI-forslag)</span>
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              SPARK skiller eksplisitt mellom kreative forslag, historiske e-handelsdata og verifiserte markedstrender.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#18181C] border border-purple-500/40 rounded space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-950 text-purple-300 rounded font-bold uppercase">
                [KREATIV IDÉ - AI-FORSLAG]
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Konsepter utledet fra avanserte språkmodeller og kreativ resonnering. Ideelt for unike vinkler og nyskaping.
              </p>
            </div>

            <div className="p-4 bg-[#18181C] border border-cyan-500/40 rounded space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded font-bold uppercase">
                [MARKEDSBASERT FORSLAG]
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Bygger på kjente konverteringsmønstre fra e-handel, typiske kurvstørrelser og priserfaringer på Etsy og TikTok.
              </p>
            </div>

            <div className="p-4 bg-[#18181C] border border-emerald-500/40 rounded space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded font-bold uppercase">
                [VERIFISERT TREND]
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Basert på reelle søkedata fra Google Trends og Etsy-søk (f.eks. sesongtopper i januar og skolestart i august).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
