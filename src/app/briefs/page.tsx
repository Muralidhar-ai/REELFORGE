import React from "react";
import Link from "next/link";
import { repo } from "@/lib/data";
import { Plus, ArrowRight, Sparkles, CheckCircle2, Clock } from "lucide-react";

export const revalidate = 0;

export default async function BriefsPage() {
  const briefs = await repo.listBriefs();
  const { creators } = await repo.listCreators({});

  return (
    <div className="space-y-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#1E2536] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151D] border border-[#1E2536] text-[#E5A83B] text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>COMMERCIAL CAMPAIGN SPECIFICATIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC] font-display">
            Active Campaign Briefs
          </h1>
          <p className="text-[#94A3B8] text-sm max-w-2xl">
            Commercial briefs defining creative specifications, aspect ratios, usage licensing, and algorithm-ranked director match requirements.
          </p>
        </div>

        <Link
          href="/briefs/new"
          className="btn-primary text-xs font-mono font-bold flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-[#E5A83B]/20"
        >
          <Plus className="w-4 h-4" /> Create Campaign Brief
        </Link>
      </div>

      {/* Briefs Grid */}
      {briefs.length === 0 ? (
        <div className="border border-[#1E2536] bg-[#12151D] rounded-2xl p-12 text-center space-y-4 shadow-xl">
          <p className="text-[#94A3B8] text-sm">No campaign briefs found.</p>
          <Link href="/briefs/new" className="btn-primary text-xs inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Define First Campaign Brief
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {briefs.map((brief) => (
            <div
              key={brief.id}
              className="border border-[#1E2536] hover:border-[#E5A83B]/50 bg-[#12151D] rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between space-y-5 group shadow-xl hover:shadow-[#E5A83B]/5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs text-[#E5A83B] uppercase font-bold tracking-wider">
                      {brief.brand_name}
                    </span>
                    <h2 className="text-xl font-bold text-[#F8FAFC] font-display mt-1 group-hover:text-[#E5A83B] transition-colors leading-snug">
                      {brief.title}
                    </h2>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0 bg-[#1A1E29] px-3.5 py-1.5 rounded-xl border border-[#1E2536] shadow-sm">
                    <span className="font-mono text-[9px] text-[#64748B] uppercase font-bold tracking-wider">Quality</span>
                    <span className="font-mono text-sm font-extrabold text-[#10B981]">
                      {brief.quality_score}/100
                    </span>
                  </div>
                </div>

                <p className="text-[#94A3B8] text-xs line-clamp-2 leading-relaxed">
                  {brief.objective}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#1E2536] font-mono text-[11px]">
                  <div className="bg-[#0B0D11] p-2.5 rounded-lg border border-[#1E2536]">
                    <span className="text-[#64748B] block text-[9px] uppercase font-bold">Format</span>
                    <span className="text-[#F8FAFC] font-semibold">{brief.format}</span>
                  </div>
                  <div className="bg-[#0B0D11] p-2.5 rounded-lg border border-[#1E2536]">
                    <span className="text-[#64748B] block text-[9px] uppercase font-bold">Type</span>
                    <span className="text-[#F8FAFC] font-semibold capitalize">{brief.content_type}</span>
                  </div>
                  <div className="bg-[#0B0D11] p-2.5 rounded-lg border border-[#1E2536]">
                    <span className="text-[#64748B] block text-[9px] uppercase font-bold">Budget</span>
                    <span className="text-[#F8FAFC] font-semibold">{brief.budget_range || "Negotiable"}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {brief.required_tools.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-[#0B0D11] border border-[#1E2536] text-[#94A3B8] text-[10px] font-mono font-medium"
                    >
                      {t}
                    </span>
                  ))}
                  {brief.usage_rights.map((u) => (
                    <span
                      key={u}
                      className="px-2.5 py-0.5 rounded-md bg-[#E5A83B]/10 border border-[#E5A83B]/30 text-[#E5A83B] text-[10px] font-mono font-bold"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Action Link */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1E2536]">
                <span className="text-xs font-mono text-[#94A3B8] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5A83B]" />
                  Roster Match Available
                </span>

                <Link
                  href={`/briefs/${brief.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#E5A83B] hover:text-[#FCD34D] font-bold transition-colors"
                >
                  View Ranked Matches & Shortlist
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
