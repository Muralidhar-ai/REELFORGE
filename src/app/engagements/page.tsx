import React from "react";
import Link from "next/link";
import { repo } from "@/lib/data";
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export const revalidate = 0;

export default async function EngagementsPage() {
  const engagements = await repo.listEngagements();
  const allBriefs = await repo.listBriefs();
  const { creators } = await repo.listCreators({});

  const briefMap = new Map(allBriefs.map((b) => [b.id, b]));
  const creatorMap = new Map(creators.map((c) => [c.id, c]));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-[#3E895B]/15 border border-[#3E895B]/30 text-[#6BCB8B] flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> Approved & Cleared
          </span>
        );
      case "delivered":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-[#D5AD52]/15 border border-[#D5AD52]/30 text-[#D5AD52] flex items-center gap-1.5">
            <Layers className="w-3 h-3" /> Deliverable In Review
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-[#4A6E82]/15 border border-[#4A6E82]/30 text-[#7BA5BC] flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> In Production
          </span>
        );
      case "accepted":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-[#C68A36]/15 border border-[#C68A36]/30 text-[#E5A853] flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Brief Accepted
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-[#20211D] border border-[#282A24] text-[#AAA99F] flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Awaiting Response
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282A24] pb-6">
        <div>
          <span className="font-mono text-xs text-[#D5AD52] uppercase tracking-wider font-semibold">
            Production Desk & Quality Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F0E8] font-display mt-1">
            Reviews & Deliverable Approvals
          </h1>
          <p className="text-[#AAA99F] text-xs sm:text-sm mt-1 max-w-2xl">
            Live pipeline of active production engagements, versioned draft review rounds, commercial licensing audits, and final master deliverable handoffs.
          </p>
        </div>
      </div>

      {/* Engagements Queue Table / Cards */}
      {engagements.length === 0 ? (
        <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-12 text-center space-y-4">
          <p className="text-[#AAA99F] text-sm">No active production engagements currently in progress.</p>
          <Link href="/briefs" className="btn-primary text-xs inline-flex items-center gap-2">
            View Briefs & Commission Creators
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {engagements.map((eng) => {
            const brief = briefMap.get(eng.brief_id);
            const creator = creatorMap.get(eng.creator_id);
            const latestVersion = eng.versions[eng.versions.length - 1];

            return (
              <div
                key={eng.id}
                className="border border-[#282A24] hover:border-[#D5AD52]/40 bg-[#191A17] rounded-xl p-6 transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs text-[#D5AD52]">
                      <span className="uppercase font-semibold">{brief?.brand_name || "Brand Campaign"}</span>
                      <span className="text-[#76756D]">•</span>
                      <span className="text-[#AAA99F]">ID: {eng.id}</span>
                      <span className="text-[#76756D]">•</span>
                      <span className="text-[#AAA99F]">Format: {brief?.format || "9:16"}</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#F3F0E8] font-display">
                      {brief?.title || "Campaign Deliverable"}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(eng.status)}
                    <Link
                      href={`/engagements/${eng.id}`}
                      className="btn-primary text-xs font-mono font-medium flex items-center gap-1.5"
                    >
                      Open Engagement Board
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Details Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#282A24] font-mono text-xs">
                  <div className="bg-[#20211D] p-3 rounded-lg border border-[#282A24]">
                    <span className="text-[#76756D] block text-[10px] uppercase">Commissioned Director</span>
                    <span className="text-[#F3F0E8] font-semibold">{creator?.name || "AI Director"}</span>
                  </div>

                  <div className="bg-[#20211D] p-3 rounded-lg border border-[#282A24]">
                    <span className="text-[#76756D] block text-[10px] uppercase">Revision Allowance</span>
                    <span className="text-[#F3F0E8] font-semibold">
                      {eng.revision_rounds_used} of {brief?.max_revision_rounds || 2} rounds used
                    </span>
                  </div>

                  <div className="bg-[#20211D] p-3 rounded-lg border border-[#282A24]">
                    <span className="text-[#76756D] block text-[10px] uppercase">Latest Version</span>
                    <span className="text-[#F3F0E8] font-semibold">
                      {latestVersion ? `Version v${latestVersion.n} (${latestVersion.state})` : "Awaiting v1"}
                    </span>
                  </div>

                  <div className="bg-[#20211D] p-3 rounded-lg border border-[#282A24]">
                    <span className="text-[#76756D] block text-[10px] uppercase">Commercial Licensing</span>
                    <span className="text-[#6BCB8B] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3E895B]" /> Cleared (Paid Media)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
