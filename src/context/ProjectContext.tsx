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
  ProjectBrief,
  StudioProjectRecord,
  BrandMusicTrack,
} from "../types";

const LOCAL_STORAGE_KEY = "brandforge_central_project_context";

const DEFAULT_APPROVED_DELIVERABLES: ApprovedDeliverables = {
  video: true,
  banners: {
    "1:1": true,
    "4:5": true,
    "9:16": true,
    "16:9": true,
  },
  slides: {
    0: true,
    1: true,
    2: true,
    3: true,
  },
  variants: {
    var_1: true,
    var_2: true,
    var_3: true,
  },
};

const DEFAULT_BRIEF: ProjectBrief = {
  id: `brief_${Date.now()}`,
  name: "Ny Kampanje",
  productOrService: "",
  companyName: "Mitt Varemerke",
  industry: "Generelt",
  targetAudience: "",
  uniqueValueProposition: "",
  brandPersonality: "Moderne og troverdig",
  preferredStyle: "Moderne Minimalistisk",
  colorPalette: ["#FF3B00", "#111111", "#FFFFFF"],
  language: "no",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const DEFAULT_STATE: CentralizedProjectState = {
  projectBrief: DEFAULT_BRIEF,
  companyName: "Mitt Varemerke",
  brandLogoUrl: undefined,
  productOrService: "",
  industry: "Generelt",
  targetAudience: "",
  uniqueValueProposition: "",
  selectedStrategyKey: "custom",
  brandPalette: ["#FF3B00", "#111111", "#FFFFFF"],
  soundtrack: null,
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
          projectBrief: {
            ...DEFAULT_BRIEF,
            ...(parsed.projectBrief || {}),
          },
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

  const updateProjectBrief = (partial: Partial<ProjectBrief>) => {
    setState((prev) => {
      const updatedBrief: ProjectBrief = {
        ...prev.projectBrief,
        ...partial,
        updatedAt: Date.now(),
      };
      return {
        ...prev,
        projectBrief: updatedBrief,
        companyName: partial.companyName !== undefined ? partial.companyName : prev.companyName,
        productOrService: partial.productOrService !== undefined ? partial.productOrService : prev.productOrService,
        industry: partial.industry !== undefined ? partial.industry : prev.industry,
        targetAudience: partial.targetAudience !== undefined ? partial.targetAudience : prev.targetAudience,
        uniqueValueProposition: partial.uniqueValueProposition !== undefined ? partial.uniqueValueProposition : prev.uniqueValueProposition,
        brandPalette: partial.colorPalette !== undefined ? partial.colorPalette : prev.brandPalette,
        lastUpdated: Date.now(),
      };
    });
  };

  const setCompanyName = (name: string) => {
    setState((prev) => ({
      ...prev,
      companyName: name,
      projectBrief: {
        ...prev.projectBrief,
        companyName: name,
        updatedAt: Date.now(),
      },
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

  const setBrandPalette = (palette: string[]) => {
    setState((prev) => ({
      ...prev,
      brandPalette: palette,
      projectBrief: {
        ...prev.projectBrief,
        colorPalette: palette,
        updatedAt: Date.now(),
      },
      lastUpdated: Date.now(),
    }));
  };

  const setSoundtrack = (track: BrandMusicTrack | null) => {
    setState((prev) => ({
      ...prev,
      soundtrack: track,
      lastUpdated: Date.now(),
    }));
  };

  const setProductContext = (info: {
    productOrService: string;
    targetAudience?: string;
    uniqueValueProposition?: string;
    industry?: string;
  }) => {
    setState((prev) => {
      const p = info.productOrService || prev.productOrService;
      const aud = info.targetAudience ?? prev.targetAudience;
      const uvp = info.uniqueValueProposition ?? prev.uniqueValueProposition;
      const ind = info.industry ?? prev.industry;
      return {
        ...prev,
        productOrService: p,
        targetAudience: aud,
        uniqueValueProposition: uvp,
        industry: ind,
        projectBrief: {
          ...prev.projectBrief,
          productOrService: p,
          targetAudience: aud,
          uniqueValueProposition: uvp,
          industry: ind,
          updatedAt: Date.now(),
        },
        lastUpdated: Date.now(),
      };
    });
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
          },
          slides: { 0: true, 1: true, 2: true, 3: true },
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

  const loadProjectRecord = (record: StudioProjectRecord) => {
    setState((prev) => ({
      ...prev,
      projectBrief: record.brief,
      companyName: record.brief.companyName || prev.companyName,
      productOrService: record.brief.productOrService || "",
      industry: record.brief.industry || "Generelt",
      targetAudience: record.brief.targetAudience || "",
      uniqueValueProposition: record.brief.uniqueValueProposition || "",
      brandLogoUrl: record.brandLogoUrl,
      renderedVideoUrl: record.renderedVideoUrl || null,
      validationReport: record.validationReport || null,
      activeProject: record.activeProject,
      brandPalette: record.palette || record.brief.colorPalette || prev.brandPalette,
      soundtrack: record.soundtrack || null,
      lastUpdated: Date.now(),
    }));
  };

  const getProjectRecord = (): StudioProjectRecord => {
    return {
      id: state.projectBrief.id || `proj_${Date.now()}`,
      name: state.projectBrief.name || state.projectBrief.productOrService || "BrandForge Prosjekt",
      createdAt: state.projectBrief.createdAt || Date.now(),
      updatedAt: Date.now(),
      brief: state.projectBrief,
      activeProject: state.activeProject,
      brandLogoUrl: state.brandLogoUrl,
      renderedVideoUrl: state.renderedVideoUrl || undefined,
      validationReport: state.validationReport,
      palette: state.brandPalette,
      soundtrack: state.soundtrack,
    };
  };

  return (
    <ProjectContext.Provider
      value={{
        ...state,
        updateProjectBrief,
        setCompanyName,
        setBrandLogoUrl,
        setBrandPalette,
        setSoundtrack,
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
        loadProjectRecord,
        getProjectRecord,
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
