import React from "react";
import {
  CONTENT_TYPES,
  FORMATS,
  SKILLS,
  SPECIALIZATIONS,
  TOOLS,
  STYLE_TAGS,
  USAGE_RIGHTS,
  LICENSE_STATUS,
} from "@/lib/vocab";

export default function DataModelPage() {
  return (
    <div className="space-y-10 max-w-4xl py-4">
      {/* Title */}
      <div className="border-b border-slate-800/80 pb-5">
        <span className="font-mono text-xs text-indigo-400 uppercase tracking-wider font-medium">Domain Architecture Specification</span>
        <h1 className="text-3xl font-bold text-white font-display mt-1">Data Model & Clearance Schema</h1>
        <p className="text-slate-400 text-sm mt-1">
          Detailed specification of ReelForge domain models, controlled vocabularies, repository interfaces, and commercial clearance rules.
        </p>
      </div>

      {/* Controlled Vocabularies */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white font-display border-b border-slate-800/80 pb-3">1. Controlled Vocabularies</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2.5">
            <span className="text-white font-semibold block text-sm">CONTENT_TYPES</span>
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_TYPES.map((v) => (
                <span key={v} className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2.5">
            <span className="text-white font-semibold block text-sm">FORMATS (Aspect Ratios)</span>
            <div className="flex flex-wrap gap-1.5">
              {FORMATS.map((v) => (
                <span key={v} className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2.5">
            <span className="text-white font-semibold block text-sm">GENERATIVE TOOLS</span>
            <div className="flex flex-wrap gap-1.5">
              {TOOLS.map((v) => (
                <span key={v} className="bg-indigo-950/40 border border-indigo-800/40 px-2 py-1 rounded text-indigo-300">
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2.5">
            <span className="text-white font-semibold block text-sm">SPECIALIZATIONS</span>
            <div className="flex flex-wrap gap-1.5">
              {SPECIALIZATIONS.map((v) => (
                <span key={v} className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2.5">
            <span className="text-white font-semibold block text-sm">STYLE_TAGS</span>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_TAGS.map((v) => (
                <span key={v} className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2.5">
            <span className="text-white font-semibold block text-sm">USAGE_RIGHTS & LICENSE_STATUS</span>
            <div className="flex flex-wrap gap-1.5">
              {USAGE_RIGHTS.map((v) => (
                <span key={v} className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">
                  {v}
                </span>
              ))}
              {LICENSE_STATUS.map((v) => (
                <span key={v} className="bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded text-emerald-300">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Model Schemas */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white font-display border-b border-slate-800/80 pb-3">2. Core Domain Entities</h2>

        <div className="space-y-4 text-xs font-mono">
          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2">
            <span className="text-white font-bold block text-sm">Creator Entity</span>
            <p className="text-slate-400 leading-relaxed">
              id (string), name (string), headline (string), bio (text), avatar_url (string), location (string), availability (&quot;available&quot; | &quot;busy&quot;), reviewed (boolean), specialization (text[]), skills (text[]), tools (text[]), content_types (text[]), formats (text[]), style_tags (text[]), verification_level (&quot;platform_reviewed&quot; | &quot;proof_attached&quot; | &quot;self_declared&quot;)
            </p>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2">
            <span className="text-white font-bold block text-sm">PortfolioItem Entity</span>
            <p className="text-slate-400 leading-relaxed">
              id (string), creator_id (string), title (string), description (text), media_type (&quot;image&quot; | &quot;video&quot;), media_url (string), thumbnail_url (string), alt_text (string), aspect_ratio (string), content_type (string), style_tags (text[]), tools_used (jsonb: &#123;tool, plan&#125;[]), generation_count (int), proof_url? (string), brand_work (boolean), year (int), workflow_steps (jsonb: &#123;title, tool?, detail&#125;[])
            </p>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2">
            <span className="text-white font-bold block text-sm">Brief Entity</span>
            <p className="text-slate-400 leading-relaxed">
              id (string), brand_name (string), title (string), objective (text), idea_text (text), content_type (string), style_tags (text[]), format (string), platform_preset? (string), duration_sec? (int), deliverables (text), budget_range? (string), deadline? (string), required_tools (text[]), required_skills (text[]), usage_rights (text[]), territory (string), usage_duration_months (int), exclusivity (boolean), ai_disclosure_required (boolean), max_revision_rounds (int), quality_score (int), status (&quot;draft&quot; | &quot;published&quot;)
            </p>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2">
            <span className="text-white font-bold block text-sm">Engagement Entity</span>
            <p className="text-slate-400 leading-relaxed">
              id (string), brief_id (string), creator_id (string), status (&quot;invited&quot; | &quot;accepted&quot; | &quot;in_progress&quot; | &quot;delivered&quot; | &quot;approved&quot;), revision_rounds_used (int), versions (jsonb: &#123;n, note, media_url?, brand_feedback?, state&#125;[]), updated_at (timestamptz)
            </p>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 p-5 rounded-xl space-y-2">
            <span className="text-white font-bold block text-sm">ToolLicense Entity</span>
            <p className="text-slate-400 leading-relaxed">
              tool (string), plan (string), commercial_use (&quot;allowed&quot; | &quot;restricted&quot; | &quot;not_allowed&quot; | &quot;unknown&quot;), notes (text), source_url (string), last_checked (string)
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white font-display border-b border-slate-800/80 pb-3">3. Architecture Overview</h2>
        <ul className="list-disc list-inside space-y-2.5 text-xs text-slate-300 font-mono">
          <li><strong>Repository Pattern</strong>: Unified `Repo` interface (`src/lib/data/repo.ts`) implemented by `LocalRepo` (in-memory JSON seed store) and `SupabaseRepo` (PostgreSQL with graceful fallback).</li>
          <li><strong>Commercial Clearance Engine</strong>: Evaluates item-level tool subscription plans (`tools_used`) against `ToolLicense` lookup rules to determine green / amber / red safety status.</li>
        </ul>
      </div>
    </div>
  );
}
