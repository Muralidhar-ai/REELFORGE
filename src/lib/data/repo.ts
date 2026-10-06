import {
  Creator,
  PortfolioItem,
  Brief,
  Engagement,
  ToolLicense,
} from "../types";

export interface CreatorFilterParams {
  search?: string;
  specialization?: string[];
  skills?: string[];
  tools?: string[];
  content_types?: string[];
  formats?: string[];
  style_tags?: string[];
  availability?: "available" | "busy";
  verifiedOnly?: boolean;
  safeForPaidAds?: boolean;
  sort?: "relevance" | "most_verified" | "most_portfolio";
}

export interface EmptyStateSuggestion {
  filterKey: string;
  filterValue: string;
  label: string;
  count: number;
}

export interface CreatorListResult {
  creators: Creator[];
  total: number;
  facets: {
    specializations: Record<string, number>;
    skills: Record<string, number>;
    tools: Record<string, number>;
    content_types: Record<string, number>;
    formats: Record<string, number>;
    style_tags: Record<string, number>;
  };
  emptyStateSuggestions?: EmptyStateSuggestion[];
}

export interface Repo {
  listCreators(params?: CreatorFilterParams): Promise<CreatorListResult>;
  getCreator(id: string): Promise<Creator | null>;
  upsertCreator(creator: Creator): Promise<Creator>;
  listPortfolioItems(creatorId?: string): Promise<PortfolioItem[]>;
  addPortfolioItem(item: PortfolioItem): Promise<PortfolioItem>;
  listBriefs(): Promise<Brief[]>;
  getBrief(id: string): Promise<Brief | null>;
  createBrief(brief: Brief): Promise<Brief>;
  listEngagements(params?: { briefId?: string; creatorId?: string }): Promise<Engagement[]>;
  getEngagement(id: string): Promise<Engagement | null>;
  createEngagement(engagement: Engagement): Promise<Engagement>;
  updateEngagement(id: string, updates: Partial<Engagement>): Promise<Engagement>;
  listToolLicenses(): Promise<ToolLicense[]>;
}
