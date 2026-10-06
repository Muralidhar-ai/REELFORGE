# ReelForge Data Model Documentation

This document outlines the TypeScript interfaces and database schemas for ReelForge.

## Entities

### Creator
```typescript
interface Creator {
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
  verification_level?: "platform_reviewed" | "proof_attached" | "self_declared";
}
```

### PortfolioItem
```typescript
interface PortfolioItem {
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
  tools_used: { tool: Tool; plan: string }[];
  generation_count: number;
  proof_url?: string;
  brand_work: boolean;
  year: number;
  workflow_steps: { title: string; tool?: Tool; detail: string }[];
}
```

### Brief
```typescript
interface Brief {
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
}
```

### Engagement
```typescript
interface Engagement {
  id: string;
  brief_id: string;
  creator_id: string;
  status: "invited" | "accepted" | "in_progress" | "delivered" | "approved";
  revision_rounds_used: number;
  versions: { n: number; note: string; media_url?: string; brand_feedback?: string; state: string }[];
  updated_at: string;
}
```

### ToolLicense
```typescript
interface ToolLicense {
  tool: Tool;
  plan: string;
  commercial_use: "allowed" | "restricted" | "not_allowed" | "unknown";
  notes: string;
  source_url: string;
  last_checked: string;
}
```
