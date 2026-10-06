-- Supabase Postgres Schema for ReelForge

CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  headline TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  location TEXT NOT NULL,
  availability TEXT NOT NULL CHECK (availability IN ('available', 'busy')),
  reviewed BOOLEAN NOT NULL DEFAULT false,
  specialization TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  tools TEXT[] NOT NULL DEFAULT '{}',
  content_types TEXT[] NOT NULL DEFAULT '{}',
  formats TEXT[] NOT NULL DEFAULT '{}',
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  verification_level TEXT
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  content_type TEXT NOT NULL,
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  tools_used JSONB NOT NULL DEFAULT '[]',
  generation_count INT NOT NULL DEFAULT 1,
  proof_url TEXT,
  brand_work BOOLEAN NOT NULL DEFAULT false,
  year INT NOT NULL,
  workflow_steps JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS briefs (
  id TEXT PRIMARY KEY,
  brand_name TEXT NOT NULL,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  idea_text TEXT NOT NULL,
  content_type TEXT NOT NULL,
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  format TEXT NOT NULL,
  platform_preset TEXT,
  duration_sec INT,
  deliverables TEXT NOT NULL,
  budget_range TEXT,
  deadline TEXT,
  required_tools TEXT[] NOT NULL DEFAULT '{}',
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  usage_rights TEXT[] NOT NULL DEFAULT '{}',
  territory TEXT NOT NULL,
  usage_duration_months INT NOT NULL DEFAULT 12,
  exclusivity BOOLEAN NOT NULL DEFAULT false,
  ai_disclosure_required BOOLEAN NOT NULL DEFAULT false,
  max_revision_rounds INT NOT NULL DEFAULT 2,
  quality_score INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engagements (
  id TEXT PRIMARY KEY,
  brief_id TEXT NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('invited', 'accepted', 'in_progress', 'delivered', 'approved')),
  revision_rounds_used INT NOT NULL DEFAULT 0,
  versions JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_licenses (
  tool TEXT NOT NULL,
  plan TEXT NOT NULL,
  commercial_use TEXT NOT NULL CHECK (commercial_use IN ('allowed', 'restricted', 'not_allowed', 'unknown')),
  notes TEXT NOT NULL,
  source_url TEXT NOT NULL,
  last_checked TEXT NOT NULL,
  PRIMARY KEY (tool, plan)
);
