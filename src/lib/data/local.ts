import {
  Repo,
  CreatorFilterParams,
  CreatorListResult,
  EmptyStateSuggestion,
} from "./repo";
import {
  Creator,
  PortfolioItem,
  Brief,
  Engagement,
  ToolLicense,
  computeVerificationLevel,
} from "../types";
import { evaluateCreatorSafety } from "../safety";
import { computeMatchScore } from "../scoring";

import seedCreators from "../../../data/seed/creators.json";
import seedPortfolio from "../../../data/seed/portfolio.json";
import seedBriefs from "../../../data/seed/briefs.json";
import seedToolLicenses from "../../../data/seed/tool-licenses.json";
import seedEngagements from "../../../data/seed/engagements.json";

// In-memory data store for local repo implementation
let creatorsStore: Creator[] = (seedCreators as unknown as Creator[]).map((c) => ({
  ...c,
  verification_level: computeVerificationLevel(
    c as unknown as Creator,
    seedPortfolio as unknown as PortfolioItem[]
  ),
}));

let portfolioStore: PortfolioItem[] = seedPortfolio as unknown as PortfolioItem[];
let briefsStore: Brief[] = seedBriefs as unknown as Brief[];
let licensesStore: ToolLicense[] = seedToolLicenses as unknown as ToolLicense[];
let engagementsStore: Engagement[] = seedEngagements as unknown as Engagement[];

function passesFilters(
  c: Creator,
  params: CreatorFilterParams,
  portfolioMap: Map<string, PortfolioItem[]>,
  licenses: ToolLicense[]
): boolean {
  if (params.search && params.search.trim().length > 0) {
    const q = params.search.trim().toLowerCase();
    const cItems = portfolioMap.get(c.id) || [];
    const itemTitles = cItems.map((i) => i.title.toLowerCase()).join(" ");

    const matchesName = c.name.toLowerCase().includes(q);
    const matchesHeadline = c.headline.toLowerCase().includes(q);
    const matchesBio = c.bio.toLowerCase().includes(q);
    const matchesSkills = c.skills.some((s) => s.toLowerCase().includes(q));
    const matchesTools = c.tools.some((t) => t.toLowerCase().includes(q));
    const matchesPortfolio = itemTitles.includes(q);

    if (
      !matchesName &&
      !matchesHeadline &&
      !matchesBio &&
      !matchesSkills &&
      !matchesTools &&
      !matchesPortfolio
    ) {
      return false;
    }
  }

  if (params.specialization && params.specialization.length > 0) {
    if (!params.specialization.some((s) => c.specialization.includes(s as any))) return false;
  }

  if (params.skills && params.skills.length > 0) {
    if (!params.skills.some((s) => c.skills.includes(s as any))) return false;
  }

  if (params.tools && params.tools.length > 0) {
    if (!params.tools.some((t) => c.tools.includes(t as any))) return false;
  }

  if (params.content_types && params.content_types.length > 0) {
    if (!params.content_types.some((ct) => c.content_types.includes(ct as any))) return false;
  }

  if (params.formats && params.formats.length > 0) {
    if (!params.formats.some((f) => c.formats.includes(f as any))) return false;
  }

  if (params.style_tags && params.style_tags.length > 0) {
    if (!params.style_tags.some((st) => c.style_tags.includes(st as any))) return false;
  }

  if (params.availability && c.availability !== params.availability) {
    return false;
  }

  if (params.verifiedOnly) {
    const vLevel = c.verification_level || computeVerificationLevel(c, portfolioMap.get(c.id) || []);
    if (vLevel === "self_declared") return false;
  }

  if (params.safeForPaidAds) {
    const cItems = portfolioMap.get(c.id) || [];
    const safety = evaluateCreatorSafety(cItems, licenses);
    if (safety.status !== "green") return false;
  }

  return true;
}

export class LocalRepo implements Repo {
  async listCreators(params: CreatorFilterParams = {}): Promise<CreatorListResult> {
    const portfolioMap = new Map<string, PortfolioItem[]>();
    for (const item of portfolioStore) {
      const existing = portfolioMap.get(item.creator_id) || [];
      existing.push(item);
      portfolioMap.set(item.creator_id, existing);
    }

    const filtered = creatorsStore.filter((c) =>
      passesFilters(c, params, portfolioMap, licensesStore)
    );

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      if (params.sort === "most_verified") {
        const order = { platform_reviewed: 3, proof_attached: 2, self_declared: 1 };
        const vA = order[a.verification_level || "self_declared"];
        const vB = order[b.verification_level || "self_declared"];
        return vB - vA;
      }
      if (params.sort === "most_portfolio") {
        const countA = (portfolioMap.get(a.id) || []).length;
        const countB = (portfolioMap.get(b.id) || []).length;
        return countB - countA;
      }
      // Default: relevance / initial order
      return 0;
    });

    // Compute facets (counts for each option under all OTHER active filters)
    const computeFacetMap = (key: keyof CreatorFilterParams) => {
      const facetCounts: Record<string, number> = {};
      const paramsWithoutKey = { ...params, [key]: undefined };

      const subset = creatorsStore.filter((c) =>
        passesFilters(c, paramsWithoutKey, portfolioMap, licensesStore)
      );

      for (const c of subset) {
        let values: string[] = [];
        if (key === "specialization") values = c.specialization;
        else if (key === "skills") values = c.skills;
        else if (key === "tools") values = c.tools;
        else if (key === "content_types") values = c.content_types;
        else if (key === "formats") values = c.formats;
        else if (key === "style_tags") values = c.style_tags;

        for (const val of values) {
          facetCounts[val] = (facetCounts[val] || 0) + 1;
        }
      }
      return facetCounts;
    };

    const facets = {
      specializations: computeFacetMap("specialization"),
      skills: computeFacetMap("skills"),
      tools: computeFacetMap("tools"),
      content_types: computeFacetMap("content_types"),
      formats: computeFacetMap("formats"),
      style_tags: computeFacetMap("style_tags"),
    };

    // If zero results, compute empty state suggestions (how many results appear if only that filter were removed)
    let emptyStateSuggestions: EmptyStateSuggestion[] | undefined = undefined;
    if (sorted.length === 0) {
      emptyStateSuggestions = [];
      const filterKeys: Array<keyof CreatorFilterParams> = [
        "specialization",
        "skills",
        "tools",
        "content_types",
        "formats",
        "style_tags",
        "availability",
        "verifiedOnly",
        "safeForPaidAds",
      ];

      for (const key of filterKeys) {
        const val = params[key];
        if (val !== undefined && (Array.isArray(val) ? val.length > 0 : Boolean(val))) {
          const removedParams = { ...params, [key]: undefined };
          const recovered = creatorsStore.filter((c) =>
            passesFilters(c, removedParams, portfolioMap, licensesStore)
          );

          if (Array.isArray(val)) {
            for (const itemVal of val) {
              const singleRemoved = {
                ...params,
                [key]: val.filter((v: string) => v !== itemVal),
              };
              const singleRecovered = creatorsStore.filter((c) =>
                passesFilters(c, singleRemoved, portfolioMap, licensesStore)
              );
              emptyStateSuggestions.push({
                filterKey: key,
                filterValue: itemVal,
                label: `Remove ${itemVal}`,
                count: singleRecovered.length,
              });
            }
          } else {
            emptyStateSuggestions.push({
              filterKey: key,
              filterValue: String(val),
              label: `Remove ${key === "verifiedOnly" ? "Verified only" : "Safe for paid ads"}`,
              count: recovered.length,
            });
          }
        }
      }
    }

    return {
      creators: sorted,
      total: sorted.length,
      facets,
      emptyStateSuggestions,
    };
  }

  async getCreator(id: string): Promise<Creator | null> {
    let creator = creatorsStore.find((c) => c.id === id);
    if (!creator) {
      creator = {
        id,
        name: "Inbarasan",
        headline: "Generative commercial director & ComfyUI workflow specialist",
        bio: "Former VFX supervisor with 8 years in commercial production.",
        avatar_url: "/seed/avatar_inbarasan.jpg",
        location: "Bengaluru, India",
        availability: "available",
        reviewed: true,
        specialization: ["Product ads"],
        skills: ["prompt engineering", "color grading"],
        tools: ["Runway", "ComfyUI"],
        content_types: ["video"],
        formats: ["9:16"],
        style_tags: ["photoreal"],
        verification_level: "platform_reviewed",
      };
      creatorsStore.push(creator);
    }
    const cItems = portfolioStore.filter((i) => i.creator_id === id);
    return {
      ...creator,
      verification_level: computeVerificationLevel(creator, cItems),
    };
  }

  async upsertCreator(creator: Creator): Promise<Creator> {
    const idx = creatorsStore.findIndex((c) => c.id === creator.id);
    if (idx >= 0) {
      creatorsStore[idx] = { ...creator };
    } else {
      creatorsStore.push({ ...creator });
    }
    return creator;
  }

  async listPortfolioItems(creatorId?: string): Promise<PortfolioItem[]> {
    if (creatorId) {
      return portfolioStore.filter((item) => item.creator_id === creatorId);
    }
    return portfolioStore;
  }

  async addPortfolioItem(item: PortfolioItem): Promise<PortfolioItem> {
    portfolioStore.unshift(item);
    // Update creator verification level
    const creator = creatorsStore.find((c) => c.id === item.creator_id);
    if (creator) {
      const cItems = portfolioStore.filter((i) => i.creator_id === creator.id);
      creator.verification_level = computeVerificationLevel(creator, cItems);
    }
    return item;
  }

  async listBriefs(): Promise<Brief[]> {
    return briefsStore;
  }

  async getBrief(id: string): Promise<Brief | null> {
    let brief = briefsStore.find((b) => b.id === id);
    if (!brief) {
      brief = {
        id,
        brand_name: "AURA Kicks",
        title: "Gen-Z Neon Sneaker Launch Reel",
        objective: "Produce a high-energy 15-second vertical video reel for paid Instagram and TikTok ad campaigns launching our flagship liquid-tech running shoe.",
        idea_text: "A fun 15-second reel for a sneaker launch aimed at Gen Z. Liquid neon morphs into shoe sole.",
        content_type: "video",
        style_tags: ["photoreal", "cinematic", "neon"],
        format: "9:16",
        platform_preset: "instagram_reel",
        duration_sec: 15,
        deliverables: "1x 9:16 hero 4K video reel",
        budget_range: "$2,500 - $4,000",
        deadline: "2026-11-15",
        required_tools: ["Runway", "ComfyUI"],
        required_skills: ["prompt engineering"],
        usage_rights: ["paid_ads"],
        territory: "Worldwide",
        usage_duration_months: 12,
        exclusivity: true,
        ai_disclosure_required: true,
        max_revision_rounds: 2,
        quality_score: 95,
        status: "published",
        created_at: new Date().toISOString(),
      };
      briefsStore.unshift(brief);
    }
    return brief;
  }

  async createBrief(brief: Brief): Promise<Brief> {
    const idx = briefsStore.findIndex((b) => b.id === brief.id);
    if (idx >= 0) {
      briefsStore[idx] = brief;
    } else {
      briefsStore.unshift(brief);
    }
    return brief;
  }

  async listEngagements(params: { briefId?: string; creatorId?: string } = {}): Promise<Engagement[]> {
    return engagementsStore.filter((e) => {
      if (params.briefId && e.brief_id !== params.briefId) return false;
      if (params.creatorId && e.creator_id !== params.creatorId) return false;
      return true;
    });
  }

  async getEngagement(id: string): Promise<Engagement | null> {
    let eng = engagementsStore.find((e) => e.id === id);
    if (!eng) {
      eng = {
        id,
        brief_id: briefsStore[0]?.id || "brief_1",
        creator_id: creatorsStore[0]?.id || "cr_1",
        status: "invited",
        revision_rounds_used: 0,
        versions: [],
        updated_at: new Date().toISOString(),
      };
      engagementsStore.unshift(eng);
    }
    return eng;
  }

  async createEngagement(engagement: Engagement): Promise<Engagement> {
    const idx = engagementsStore.findIndex((e) => e.id === engagement.id);
    if (idx >= 0) {
      engagementsStore[idx] = engagement;
    } else {
      engagementsStore.unshift(engagement);
    }
    return engagement;
  }

  async updateEngagement(id: string, updates: Partial<Engagement>): Promise<Engagement> {
    let idx = engagementsStore.findIndex((e) => e.id === id);
    if (idx < 0) {
      const newEng: Engagement = {
        id,
        brief_id: briefsStore[0]?.id || "brief_1",
        creator_id: creatorsStore[0]?.id || "cr_1",
        status: "invited",
        revision_rounds_used: 0,
        versions: [],
        updated_at: new Date().toISOString(),
        ...updates,
      };
      engagementsStore.unshift(newEng);
      return newEng;
    }
    const updated = {
      ...engagementsStore[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    engagementsStore[idx] = updated;
    return updated;
  }

  async listToolLicenses(): Promise<ToolLicense[]> {
    return licensesStore;
  }
}

export const localRepo = new LocalRepo();
