/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CentralizedProjectState,
  ProjectContextType,
  ApprovedDeliverables,
  AutonomousVideoProject,
  VideoValidationReport,
  SalesCopilotData,
  CampaignVariant,
  OmnichannelPackage,
} from "../types";

const LOCAL_STORAGE_KEY = "brandforge_central_project_context";

const DEFAULT_APPROVED_DELIVERABLES: ApprovedDeliverables = {
  video: true,
  banners: {
    "1:1": true,
    "4:5": true,
    "9:16": true,
    "16:9": true,
    "etsy-shop": true,
    "etsy-mockup": true,
  },
  slides: {
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  },
  variants: {
    var_1: true,
    var_2: true,
    var_3: true,
  },
};

const DEFAULT_STATE: CentralizedProjectState = {
  companyName: "BrandForge Labs",
  brandLogoUrl: undefined,
  productOrService: "Digital Dayplanner & Notatmaler for Etsy",
  industry: "Digitale Produkter & Produktivitet",
  targetAudience: "Studenter, travle gründere og yrkesaktive som vil ha kontroll på hverdagen",
  uniqueValueProposition: "Alt-i-ett estetisk dagsplanlegger for GoodNotes og print som gir ro og struktur på 5 minutter.",
  selectedStrategyKey: "etsy-dayplanner",
  activeProject: null,
  renderedVideoUrl: null,
  validationReport: null,
  salesCopilotData: null,
  activeStrategyRecommendation: null,
  variantsList: [],
  omnichannelData: null,
  approvedDeliverables: DEFAULT_APPROVED_DELIVERABLES,
  lastUpdated: Date.now(),
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CentralizedProjectState>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          approvedDeliverables: {
            ...DEFAULT_APPROVED_DELIVERABLES,
            ...(parsed.approvedDeliverables || {}),
          },
        };
      }
    } catch (e) {
      console.warn("Could not read project context from localStorage:", e);
    }
    return DEFAULT_STATE;
  });

  // Sync to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save project context to localStorage:", e);
    }
  }, [state]);

  const setCompanyName = (name: string) => {
    setState((prev) => ({
      ...prev,
      companyName: name,
      lastUpdated: Date.now(),
    }));
  };

  const setBrandLogoUrl = (url?: string) => {
    setState((prev) => ({
      ...prev,
      brandLogoUrl: url,
      lastUpdated: Date.now(),
    }));
  };

  const setProductContext = (info: {
    productOrService: string;
    targetAudience?: string;
    uniqueValueProposition?: string;
    industry?: string;
  }) => {
    setState((prev) => ({
      ...prev,
      productOrService: info.productOrService || prev.productOrService,
      targetAudience: info.targetAudience ?? prev.targetAudience,
      uniqueValueProposition: info.uniqueValueProposition ?? prev.uniqueValueProposition,
      industry: info.industry ?? prev.industry,
      lastUpdated: Date.now(),
    }));
  };

  const setActiveProject = (project: AutonomousVideoProject | null) => {
    setState((prev) => ({
      ...prev,
      activeProject: project,
      lastUpdated: Date.now(),
    }));
  };

  const setRenderedVideoUrl = (
    url: string | null,
    validation?: VideoValidationReport | null
  ) => {
    setState((prev) => ({
      ...prev,
      renderedVideoUrl: url,
      validationReport: validation !== undefined ? validation : prev.validationReport,
      lastUpdated: Date.now(),
    }));
  };

  const setSalesCopilotData = (data: SalesCopilotData | null) => {
    setState((prev) => ({
      ...prev,
      salesCopilotData: data,
      lastUpdated: Date.now(),
    }));
  };

  const setActiveStrategyRecommendation = (strategy: any | null, key?: string) => {
    setState((prev) => ({
      ...prev,
      activeStrategyRecommendation: strategy,
      selectedStrategyKey: key || prev.selectedStrategyKey,
      lastUpdated: Date.now(),
    }));
  };

  const setVariantsList = (variants: CampaignVariant[]) => {
    setState((prev) => {
      const newApprovedVariants = { ...prev.approvedDeliverables.variants };
      variants.forEach((v) => {
        if (newApprovedVariants[v.id] === undefined) {
          newApprovedVariants[v.id] = true;
        }
      });
      return {
        ...prev,
        variantsList: variants,
        approvedDeliverables: {
          ...prev.approvedDeliverables,
          variants: newApprovedVariants,
        },
        lastUpdated: Date.now(),
      };
    });
  };

  const setOmnichannelData = (pkg: OmnichannelPackage | null) => {
    setState((prev) => ({
      ...prev,
      omnichannelData: pkg,
      lastUpdated: Date.now(),
    }));
  };

  const setApprovedDeliverables = (
    approved: Partial<ApprovedDeliverables> | ((prev: ApprovedDeliverables) => ApprovedDeliverables)
  ) => {
    setState((prev) => {
      const next = typeof approved === "function" ? approved(prev.approvedDeliverables) : { ...prev.approvedDeliverables, ...approved };
      return {
        ...prev,
        approvedDeliverables: next,
        lastUpdated: Date.now(),
      };
    });
  };

  const toggleBannerApproval = (format: string, approved: boolean) => {
    setState((prev) => ({
      ...prev,
      approvedDeliverables: {
        ...prev.approvedDeliverables,
        banners: {
          ...prev.approvedDeliverables.banners,
          [format]: approved,
        },
      },
      lastUpdated: Date.now(),
    }));
  };

  const toggleSlideApproval = (slideIndex: number, approved: boolean) => {
    setState((prev) => ({
      ...prev,
      approvedDeliverables: {
        ...prev.approvedDeliverables,
        slides: {
          ...prev.approvedDeliverables.slides,
          [slideIndex]: approved,
        },
      },
      lastUpdated: Date.now(),
    }));
  };

  const toggleVariantApproval = (variantId: string, approved: boolean) => {
    setState((prev) => ({
      ...prev,
      approvedDeliverables: {
        ...prev.approvedDeliverables,
        variants: {
          ...prev.approvedDeliverables.variants,
          [variantId]: approved,
        },
      },
      lastUpdated: Date.now(),
    }));
  };

  const setVideoApproved = (approved: boolean) => {
    setState((prev) => ({
      ...prev,
      approvedDeliverables: {
        ...prev.approvedDeliverables,
        video: approved,
      },
      lastUpdated: Date.now(),
    }));
  };

  const approveAllDeliverables = () => {
    setState((prev) => {
      const allVars: Record<string, boolean> = {};
      prev.variantsList.forEach((v) => (allVars[v.id] = true));
      return {
        ...prev,
        approvedDeliverables: {
          video: true,
          banners: {
            "1:1": true,
            "4:5": true,
            "9:16": true,
            "16:9": true,
            "etsy-shop": true,
            "etsy-mockup": true,
          },
          slides: { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true },
          variants: { ...prev.approvedDeliverables.variants, ...allVars },
        },
        lastUpdated: Date.now(),
      };
    });
  };

  const resetProjectContext = () => {
    setState({
      ...DEFAULT_STATE,
      lastUpdated: Date.now(),
    });
  };

  return (
    <ProjectContext.Provider
      value={{
        ...state,
        setCompanyName,
        setBrandLogoUrl,
        setProductContext,
        setActiveProject,
        setRenderedVideoUrl,
        setSalesCopilotData,
        setActiveStrategyRecommendation,
        setVariantsList,
        setOmnichannelData,
        setApprovedDeliverables,
        toggleBannerApproval,
        toggleSlideApproval,
        toggleVariantApproval,
        setVideoApproved,
        approveAllDeliverables,
        resetProjectContext,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectContextProvider");
  }
  return context;
};
