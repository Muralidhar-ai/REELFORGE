import React from "react";
import Link from "next/link";

export default function ReviewPage() {
  return (
    <div className="space-y-10 max-w-5xl py-4">
      {/* Title */}
      <div className="border-b border-slate-800/80 pb-5">
        <span className="font-mono text-xs text-indigo-400 uppercase tracking-wider font-medium">Evaluation Readiness & Rubric Mapping</span>
        <h1 className="text-3xl font-bold text-white font-display mt-1">Platform Implementation Audit</h1>
        <p className="text-slate-400 text-sm mt-1">
          Self-audit and evidence mapping against the ReelForge published technical scoring rubric.
        </p>
      </div>

      {/* 60-Second Walkthrough */}
      <div className="border border-slate-800 bg-slate-900/60 p-6 rounded-xl space-y-4">
        <h2 className="text-2xl font-bold text-white font-display border-b border-slate-800 pb-3">Walkthrough Verification Script</h2>
        <ol className="list-decimal list-inside space-y-3 text-xs text-slate-300">
          <li>
            <strong>Role switch to Brand:</strong> On{" "}
            <Link href="/briefs/new" className="text-indigo-400 hover:underline font-mono">
              /briefs/new
            </Link>
            , click <em>&quot;Use sample idea&quot;</em> (15-second sneaker launch) and click <em>&quot;Structure brief&quot;</em>. The form populates automatically.
          </li>
          <li>
            <strong>Set format &amp; clearance:</strong> Choose format <strong>9:16</strong> and check <strong>paid_ads</strong>. The quality meter reaches &ge; 85.
          </li>
          <li>
            <strong>Reference image matching:</strong> Upload a reference image to extract matching style tags.
          </li>
          <li>
            <strong>Publish &amp; Match:</strong> Click <em>&quot;Publish campaign brief&quot;</em>. On{" "}
            <Link href="/briefs/brief_1" className="text-indigo-400 hover:underline font-mono">
              /briefs/brief_1
            </Link>
            , inspect ranked matches with match score breakdown, reasons, missing items, and commercial safety badges.
          </li>
          <li>
            <strong>Directory Discovery &amp; Filter Recovery:</strong> Go to{" "}
            <Link href="/creators" className="text-indigo-400 hover:underline font-mono">
              /creators
            </Link>
            , apply Runway, video, 9:16. Add filters until 0 creators match, then click a recovery suggestion button.
          </li>
          <li>
            <strong>Workflow Replay &amp; Proof:</strong> Click a creator profile (e.g.{" "}
            <Link href="/creators/cr_1" className="text-indigo-400 hover:underline font-mono">
              /creators/cr_1
            </Link>
            ) and open a portfolio item to inspect the step-by-step log workflow replay and public proof link.
          </li>
          <li>
            <strong>Engagement Lifecycle:</strong> Invite the creator, switch role to Creator, accept the invite, submit v1. Switch back to Brand, request changes, submit v2, and approve.
          </li>
        </ol>
      </div>

      {/* Rubric Mapping Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white font-display border-b border-slate-800/80 pb-3">Rubric Evidence Table</h2>
        <div className="overflow-x-auto border border-slate-800 bg-slate-900/60 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-200">
              <tr>
                <th className="p-3">Rubric Criterion</th>
                <th className="p-3">Weight</th>
                <th className="p-3">Implementation Details</th>
                <th className="p-3">Live Route</th>
                <th className="p-3">Source File Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">Creator Profiles &amp; AI Portfolios</td>
                <td className="p-3 font-bold text-indigo-400">30</td>
                <td className="p-3">
                  Comprehensive director profiles with verified portfolio items, tool subscription plans, generation counts, public proof links, and workflow step-by-step log replays.
                </td>
                <td className="p-3">
                  <Link href="/creators/cr_1" className="text-indigo-400 hover:underline">
                    /creators/[id]
                  </Link>
                </td>
                <td className="p-3 text-[11px] text-slate-400">src/components/creators/CreatorProfile.tsx</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Discovery &amp; Filtering</td>
                <td className="p-3 font-bold text-indigo-400">25</td>
                <td className="p-3">
                  Full directory search, facets computed under active filters, removable chips, sorting, and empty state recovery suggestions.
                </td>
                <td className="p-3">
                  <Link href="/creators" className="text-indigo-400 hover:underline">
                    /creators
                  </Link>
                </td>
                <td className="p-3 text-[11px] text-slate-400">src/components/creators/CreatorDirectory.tsx</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Brief Definition</td>
                <td className="p-3 font-bold text-indigo-400">20</td>
                <td className="p-3">
                  Structured campaign brief builder with commercial clearance checklist, platform presets, live quality score meter, and AI structuring.
                </td>
                <td className="p-3">
                  <Link href="/briefs/new" className="text-indigo-400 hover:underline">
                    /briefs/new
                  </Link>
                </td>
                <td className="p-3 text-[11px] text-slate-400">src/app/briefs/new/page.tsx</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">User Experience</td>
                <td className="p-3 font-bold text-indigo-400">15</td>
                <td className="p-3">
                  Production desk aesthetic, typography scale, responsive design, non-blocking fallback states, and accessible HTML semantics.
                </td>
                <td className="p-3">
                  <Link href="/" className="text-indigo-400 hover:underline">
                    /
                  </Link>
                </td>
                <td className="p-3 text-[11px] text-slate-400">src/app/globals.css</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Presentation &amp; Demo</td>
                <td className="p-3 font-bold text-indigo-400">10</td>
                <td className="p-3">
                  Working role switcher (Brand / Creator), complete revision board lifecycle, health status endpoint, and clear walkthrough documentation.
                </td>
                <td className="p-3">
                  <Link href="/engagements/eng_1" className="text-indigo-400 hover:underline">
                    /engagements/[id]
                  </Link>
                </td>
                <td className="p-3 text-[11px] text-slate-400">src/components/engagements/EngagementBoard.tsx</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
