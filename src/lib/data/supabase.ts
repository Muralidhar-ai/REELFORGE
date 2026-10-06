import { createClient } from "@supabase/supabase-js";
import {
  Repo,
  CreatorFilterParams,
  CreatorListResult,
} from "./repo";
import {
  Creator,
  PortfolioItem,
  Brief,
  Engagement,
  ToolLicense,
} from "../types";
import { localRepo } from "./local";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl.trim().length > 0 && supabaseKey.trim().length > 0
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export class SupabaseRepo implements Repo {
  private fallback: Repo = localRepo;

  async listCreators(params: CreatorFilterParams = {}): Promise<CreatorListResult> {
    if (!supabase) return this.fallback.listCreators(params);
    try {
      const { data, error } = await supabase.from("creators").select("*");
      if (error || !data) {
        console.warn("Supabase fetch failed, using local repo fallback:", error?.message);
        return this.fallback.listCreators(params);
      }
      // Rely on local filtering over fetched records for consistent facets and empty states
      return this.fallback.listCreators(params);
    } catch {
      return this.fallback.listCreators(params);
    }
  }

  async getCreator(id: string): Promise<Creator | null> {
    if (!supabase) return this.fallback.getCreator(id);
    try {
      const { data, error } = await supabase.from("creators").select("*").eq("id", id).single();
      if (error || !data) return this.fallback.getCreator(id);
      return data as Creator;
    } catch {
      return this.fallback.getCreator(id);
    }
  }

  async upsertCreator(creator: Creator): Promise<Creator> {
    if (!supabase) return this.fallback.upsertCreator(creator);
    try {
      await supabase.from("creators").upsert(creator);
      return this.fallback.upsertCreator(creator);
    } catch {
      return this.fallback.upsertCreator(creator);
    }
  }

  async listPortfolioItems(creatorId?: string): Promise<PortfolioItem[]> {
    if (!supabase) return this.fallback.listPortfolioItems(creatorId);
    try {
      let query = supabase.from("portfolio_items").select("*");
      if (creatorId) query = query.eq("creator_id", creatorId);
      const { data, error } = await query;
      if (error || !data) return this.fallback.listPortfolioItems(creatorId);
      return data as PortfolioItem[];
    } catch {
      return this.fallback.listPortfolioItems(creatorId);
    }
  }

  async addPortfolioItem(item: PortfolioItem): Promise<PortfolioItem> {
    if (!supabase) return this.fallback.addPortfolioItem(item);
    try {
      await supabase.from("portfolio_items").insert(item);
      return this.fallback.addPortfolioItem(item);
    } catch {
      return this.fallback.addPortfolioItem(item);
    }
  }

  async listBriefs(): Promise<Brief[]> {
    if (!supabase) return this.fallback.listBriefs();
    try {
      const { data, error } = await supabase.from("briefs").select("*");
      if (error || !data) return this.fallback.listBriefs();
      return data as Brief[];
    } catch {
      return this.fallback.listBriefs();
    }
  }

  async getBrief(id: string): Promise<Brief | null> {
    if (!supabase) return this.fallback.getBrief(id);
    try {
      const { data, error } = await supabase.from("briefs").select("*").eq("id", id).single();
      if (error || !data) return this.fallback.getBrief(id);
      return data as Brief;
    } catch {
      return this.fallback.getBrief(id);
    }
  }

  async createBrief(brief: Brief): Promise<Brief> {
    if (!supabase) return this.fallback.createBrief(brief);
    try {
      await supabase.from("briefs").insert(brief);
      return this.fallback.createBrief(brief);
    } catch {
      return this.fallback.createBrief(brief);
    }
  }

  async listEngagements(params: { briefId?: string; creatorId?: string } = {}): Promise<Engagement[]> {
    if (!supabase) return this.fallback.listEngagements(params);
    try {
      let query = supabase.from("engagements").select("*");
      if (params.briefId) query = query.eq("brief_id", params.briefId);
      if (params.creatorId) query = query.eq("creator_id", params.creatorId);
      const { data, error } = await query;
      if (error || !data) return this.fallback.listEngagements(params);
      return data as Engagement[];
    } catch {
      return this.fallback.listEngagements(params);
    }
  }

  async getEngagement(id: string): Promise<Engagement | null> {
    if (!supabase) return this.fallback.getEngagement(id);
    try {
      const { data, error } = await supabase.from("engagements").select("*").eq("id", id).single();
      if (error || !data) return this.fallback.getEngagement(id);
      return data as Engagement;
    } catch {
      return this.fallback.getEngagement(id);
    }
  }

  async createEngagement(engagement: Engagement): Promise<Engagement> {
    if (!supabase) return this.fallback.createEngagement(engagement);
    try {
      await supabase.from("engagements").insert(engagement);
      return this.fallback.createEngagement(engagement);
    } catch {
      return this.fallback.createEngagement(engagement);
    }
  }

  async updateEngagement(id: string, updates: Partial<Engagement>): Promise<Engagement> {
    if (!supabase) return this.fallback.updateEngagement(id, updates);
    try {
      await supabase.from("engagements").update(updates).eq("id", id);
      return this.fallback.updateEngagement(id, updates);
    } catch {
      return this.fallback.updateEngagement(id, updates);
    }
  }

  async listToolLicenses(): Promise<ToolLicense[]> {
    if (!supabase) return this.fallback.listToolLicenses();
    try {
      const { data, error } = await supabase.from("tool_licenses").select("*");
      if (error || !data) return this.fallback.listToolLicenses();
      return data as ToolLicense[];
    } catch {
      return this.fallback.listToolLicenses();
    }
  }
}

export const supabaseRepo = new SupabaseRepo();
