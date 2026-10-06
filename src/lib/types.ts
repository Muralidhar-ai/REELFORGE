import {
  ContentType,
  AspectRatioFormat,
  Skill,
  Specialization,
  Tool,
  StyleTag,
  UsageRight,
  LicenseStatus,
  PlatformPresetId,
} from "./vocab";

export type VerificationLevel = "platform_reviewed" | "proof_attached" | "self_declared";

export interface ToolUsed {
  tool: Tool;
  plan: string;
}

export interface WorkflowStep {
  title: string;
  tool?: Tool;
  detail: string;
}

export interface Creator {
  id: string;
  name: string;
  headline: string;
  bio: string;
  avatar_url: string;
  location: string;
  availability: "available" | "busy";
  reviewed: boolean;
  specialization: Specialization[];
  skills: Skill[];
  tools: Tool[];
  content_types: ContentType[];
  formats: AspectRatioFormat[];
  style_tags: StyleTag[];
  verification_level?: VerificationLevel;
}

export interface PortfolioItem {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url: string;
  alt_text: string;
  aspect_ratio: AspectRatioFormat;
  content_type: ContentType;
  style_tags: StyleTag[];
  tools_used: ToolUsed[];
  generation_count: number;
  proof_url?: string;
  brand_work: boolean;
  year: number;
  workflow_steps: WorkflowStep[];
}

export interface Brief {
  id: string;
  brand_name: string;
  title: string;
  objective: string;
  idea_text: string;
  content_type: ContentType;
  style_tags: StyleTag[];
  format: AspectRatioFormat;
  platform_preset?: PlatformPresetId;
  duration_sec?: number;
  deliverables: string;
  budget_range?: string;
  deadline?: string;
  required_tools: Tool[];
  required_skills: Skill[];
  usage_rights: UsageRight[];
  territory: string;
  usage_duration_months: number;
  exclusivity: boolean;
  ai_disclosure_required: boolean;
  max_revision_rounds: number;
  quality_score: number;
  status: "draft" | "published";
  created_at?: string;
}

export interface VersionSubmission {
  n: number;
  note: string;
  media_url?: string;
  brand_feedback?: string;
  state: "submitted" | "changes_requested" | "approved";
}

export interface Engagement {
  id: string;
  brief_id: string;
  creator_id: string;
  status: "invited" | "accepted" | "in_progress" | "delivered" | "approved";
  revision_rounds_used: number;
  versions: VersionSubmission[];
  updated_at: string;
}

export interface ToolLicense {
  tool: Tool;
  plan: string;
  commercial_use: LicenseStatus;
  notes: string;
  source_url: string;
  last_checked: string;
}

export function computeVerificationLevel(
  creator: Creator,
  portfolioItems: PortfolioItem[]
): VerificationLevel {
  if (creator.reviewed) return "platform_reviewed";
  const hasProof = portfolioItems.some(
    (item) => item.creator_id === creator.id && !!item.proof_url && item.proof_url.trim().length > 0
  );
  if (hasProof) return "proof_attached";
  return "self_declared";
}
