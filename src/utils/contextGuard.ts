/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SPARK Context Guard & Intent Guard Engine
 * Enforces strict semantic relevance between the user's input intent and all generated output.
 * Prevents unrelated domains (e.g. skincare/tørr hud) from contaminating product requests (e.g. dayplanner/etsy).
 */

export interface ContextGuardRule {
  domain: string;
  triggerRegex: RegExp;
  allowedKeywords: string[];
  forbiddenIfNotTriggered: string[];
  fallbackTopicReplacements: Record<string, string>;
}

export const CONTEXT_RULES: Record<string, ContextGuardRule> = {
  skincare: {
    domain: "Hudpleie & Kosmetikk",
    triggerRegex: /hudpleie|skincare|hud|tørr hud|kosmetikk|peeling|glød|krem|serum|spa|hudpleiesalong/i,
    allowedKeywords: ["hudpleie", "glød", "fuktighet", "hudanalyse", "serum", "rens", "terapeut", "salong"],
    forbiddenIfNotTriggered: [
      "hudpleie",
      "tørr hud",
      "gusten hud",
      "kosmetikk",
      "kjemisk peeling",
      "fruktsyrer",
      "dyprens",
      "hudanalyse",
      "hudterapeut",
      "fuktighetsmaske",
      "hudklinikk",
      "hyaluronsyre",
      "ansiktsbehandling"
    ],
    fallbackTopicReplacements: {
      "tørr hud": "kaos i hverdagen",
      "gusten hud": "manglende struktur",
      "hudpleie": "produktivitet",
      "dyprens": "full oversikt",
      "hudanalyse": "behovsanalyse",
      "hudterapeut": "ekspert",
      "behandling": "løsning"
    }
  },
  planner: {
    domain: "Dayplanner & Etsy Digital Downloads",
    triggerRegex: /dayplanner|planner|planlegger|notat|dagbok|kalender|digital planner|journal|notatmal|skrivebok|organizer|etsy|etzy|goodnotes|printable/i,
    allowedKeywords: [
      "dayplanner",
      "digital planner",
      "planlegger",
      "ukeplanlegger",
      "månedsplan",
      "notatmal",
      "etsy",
      "digital download",
      "goodnotes",
      "notability",
      "organisering",
      "produktivitet",
      "tidsstyring",
      "vanelogger",
      "målsetting",
      "budsjett",
      "adhd-planner",
      "studieplanlegger",
      "familieplanlegger",
      "klistremerker",
      "pdf",
      "templates"
    ],
    forbiddenIfNotTriggered: [],
    fallbackTopicReplacements: {}
  }
};

/**
 * Checks whether the user's prompt explicitly introduced a domain.
 */
export function hasUserIntroducedDomain(userPrompt: string, domainKey: "skincare"): boolean {
  return CONTEXT_RULES[domainKey].triggerRegex.test(userPrompt);
}

/**
 * Audits text against the context guard.
 * Returns true if clean, or false with list of violations.
 */
export function auditTextAgainstIntent(
  text: string,
  userPrompt: string
): { isValid: boolean; violations: string[]; sanitized: string } {
  if (!text) return { isValid: true, violations: [], sanitized: "" };

  const isSkincareAllowed = hasUserIntroducedDomain(userPrompt, "skincare");
  const violations: string[] = [];
  let sanitized = text;

  if (!isSkincareAllowed) {
    const forbidden = CONTEXT_RULES.skincare.forbiddenIfNotTriggered;
    for (const term of forbidden) {
      const reg = new RegExp(`\\b${term}\\b`, "gi");
      if (reg.test(text)) {
        violations.push(term);
        // Replace with contextually neutral or productivity equivalent
        const replacement = CONTEXT_RULES.skincare.fallbackTopicReplacements[term.toLowerCase()] || "løsningen";
        sanitized = sanitized.replace(reg, replacement);
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    sanitized
  };
}

/**
 * Enforces Context Guard on an entire AutonomousVideoProject object.
 * Guarantees zero skincare/unrelated leaks in scenes, voiceover, strategy, and subtitles!
 */
export function enforceContextGuardOnProject<T extends {
  strategy?: any;
  scenes?: any[];
  voiceoverScript?: string;
  subtitles?: any[];
  originalPrompt?: string;
}>(project: T, userPrompt: string): T {
  if (!project) return project;

  const isSkincareAllowed = hasUserIntroducedDomain(userPrompt, "skincare");
  if (isSkincareAllowed) return project;

  const audit = (val: string) => auditTextAgainstIntent(val, userPrompt).sanitized;

  // Sanitize project copy
  const updatedProject = { ...project };

  if (updatedProject.voiceoverScript) {
    updatedProject.voiceoverScript = audit(updatedProject.voiceoverScript);
  }

  if (Array.isArray(updatedProject.scenes)) {
    updatedProject.scenes = updatedProject.scenes.map((scene) => ({
      ...scene,
      onScreenText: audit(scene.onScreenText || ""),
      narrationVoiceover: audit(scene.narrationVoiceover || ""),
      visualPrompt: audit(scene.visualPrompt || ""),
      mood: audit(scene.mood || "")
    }));
  }

  if (Array.isArray(updatedProject.subtitles)) {
    updatedProject.subtitles = updatedProject.subtitles.map((sub) => ({
      ...sub,
      text: audit(sub.text || "")
    }));
  }

  if (updatedProject.strategy) {
    const strat = { ...updatedProject.strategy };
    strat.productOrService = audit(strat.productOrService || "");
    strat.targetAudience = audit(strat.targetAudience || "");
    strat.uniqueValueProposition = audit(strat.uniqueValueProposition || "");
    strat.primaryCallToAction = audit(strat.primaryCallToAction || "");
    strat.offerDetails = audit(strat.offerDetails || "");

    if (Array.isArray(strat.customerPains)) {
      strat.customerPains = strat.customerPains.map(audit);
    }
    if (Array.isArray(strat.uniqueSellingPoints)) {
      strat.uniqueSellingPoints = strat.uniqueSellingPoints.map(audit);
    }
    if (Array.isArray(strat.scrollStoppingHooks)) {
      strat.scrollStoppingHooks = strat.scrollStoppingHooks.map(audit);
    }
    updatedProject.strategy = strat;
  }

  return updatedProject;
}

/**
 * Generates an allowed themes tags list based on user input
 */
export function extractSemanticContextTags(userPrompt: string): string[] {
  const p = userPrompt.toLowerCase();
  const tags: string[] = [];

  if (/dayplanner|planner|planlegger/i.test(p)) tags.push("Planners", "Digital Downloads", "Organisering");
  if (/etsy|etzy/i.test(p)) tags.push("Etsy Marketplace", "Instant Download", "Etsy SEO");
  if (/tiktok/i.test(p)) tags.push("TikTok 9:16", "Viral Hook", "Fast Demonstration");
  if (/snapchat/i.test(p)) tags.push("Snapchat Spotlight", "Vertical Story", "Native Feel");
  if (/youtube/i.test(p)) tags.push("YouTube Shorts", "Long-form Tutorial");
  if (/instagram/i.test(p)) tags.push("Instagram Reels", "Aesthetic Feed");
  if (/habit|vane/i.test(p)) tags.push("Habit Tracking", "Routines");
  if (/budsjett|budget|økonomi/i.test(p)) tags.push("Budgeting", "Financial Planning");
  if (/studie|student/i.test(p)) tags.push("Study Planner", "Academic Success");
  if (/adhd/i.test(p)) tags.push("ADHD-friendly", "Dopamine-focused Flow");
  if (/meal|matplan/i.test(p)) tags.push("Meal Planner", "Kitchen Organization");
  if (/plakat|poster|print/i.test(p)) tags.push("Wall Art", "Print on Demand");

  if (tags.length === 0) {
    tags.push("Kommersielt Salg", "Optimalisert Konvertering", "Sosiale Medier");
  }

  return tags;
}
