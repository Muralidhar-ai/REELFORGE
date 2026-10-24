"use client";

import { useEffect, useState } from "react";

interface FeedbackEntry {
  id: string;
  type: "bug" | "feature" | "general" | "praise";
  subject: string;
  message: string;
  rating?: number;
  email?: string;
  page?: string;
  role?: string;
  createdAt: string;
  status: "new" | "reviewed" | "resolved";
}

const TYPE_CONFIG = {
  praise:  { label: "Praise",     emoji: "✦", color: "text-emerald-400 bg-emerald-900/20 border-emerald-900/40" },
  general: { label: "Suggestion", emoji: "◈", color: "text-[#D5AD52] bg-[#D5AD52]/10 border-[#D5AD52]/30" },
  feature: { label: "Feature",    emoji: "◇", color: "text-blue-400 bg-blue-900/20 border-blue-900/40" },
  bug:     { label: "Bug",        emoji: "◉", color: "text-red-400 bg-red-900/20 border-red-900/40" },
};

const STATUS_CONFIG = {
  new:      { label: "New",      dot: "bg-[#D5AD52]" },
  reviewed: { label: "Reviewed", dot: "bg-blue-400" },
  resolved: { label: "Resolved", dot: "bg-emerald-400" },
};

export default function FeedbackInboxPage() {
  const [entries, setEntries]     = useState<FeedbackEntry[]>([]);
  const [counts, setCounts]       = useState({ new: 0, reviewed: 0, resolved: 0 });
  const [filter, setFilter]       = useState<"all" | FeedbackEntry["status"]>("all");
  const [selected, setSelected]   = useState<FeedbackEntry | null>(null);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch("/api/feedback");
      const data = await res.json();
      setEntries(data.feedback || []);
      setCounts(data.counts || { new: 0, reviewed: 0, resolved: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: FeedbackEntry["status"]) {
    setUpdating(true);
    await fetch("/api/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
    setSelected((prev) => prev ? { ...prev, status } : null);
    setUpdating(false);
  }

  const shown = filter === "all" ? entries : entries.filter((e) => e.status === filter);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono text-[#D5AD52] uppercase tracking-widest mb-1">Admin · Feedback</p>
          <h1 className="text-2xl font-display font-bold text-[#F3F0E8] leading-tight">
            Feedback Inbox
          </h1>
          <p className="text-sm text-[#AAA99F] mt-1">
            All user-submitted feedback, bugs, and feature requests.
          </p>
        </div>
        <button
          onClick={load}
          className="px-3 py-1.5 rounded bg-[#20211D] border border-[#282A24] text-xs font-mono text-[#AAA99F] hover:text-[#F3F0E8] transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {(["new", "reviewed", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`
              p-4 rounded-lg border text-left transition-all
              ${filter === s
                ? "border-[#D5AD52]/50 bg-[#20211D]"
                : "border-[#282A24] bg-[#191A17] hover:border-[#3A3C36]"
              }
            `}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
              <span className="text-[10px] font-mono text-[#AAA99F] uppercase tracking-wide">
                {STATUS_CONFIG[s].label}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-[#F3F0E8]">
              {counts[s]}
            </p>
          </button>
        ))}
      </div>

      {/* Layout: list + detail */}
      <div className="grid grid-cols-[1fr_340px] gap-4 min-h-[420px]">
        {/* List */}
        <div className="rounded-lg border border-[#282A24] bg-[#191A17] overflow-hidden">
          {/* Filter tabs */}
          <div className="flex items-center gap-0.5 px-3 pt-3 pb-0 border-b border-[#282A24]">
            {(["all", "new", "reviewed", "resolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-3 py-2 text-[11px] font-mono rounded-t transition-colors
                  ${filter === f
                    ? "text-[#D5AD52] border-b-2 border-[#D5AD52]"
                    : "text-[#AAA99F] hover:text-[#F3F0E8]"
                  }
                `}
              >
                {f === "all" ? `All (${entries.length})` : `${STATUS_CONFIG[f].label} (${counts[f]})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#555750] text-sm font-mono">
              Loading…
            </div>
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-3xl text-[#282A24]">◈</span>
              <p className="text-sm text-[#555750] font-mono">No feedback in this category</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#282A24]">
              {shown.map((entry) => {
                const tc = TYPE_CONFIG[entry.type];
                const sc = STATUS_CONFIG[entry.status];
                const isActive = selected?.id === entry.id;
                return (
                  <li key={entry.id}>
                    <button
                      onClick={() => setSelected(entry)}
                      className={`
                        w-full text-left px-4 py-3.5 transition-colors
                        ${isActive ? "bg-[#20211D]" : "hover:bg-[#1C1D19]"}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Type badge */}
                        <span className={`mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border flex-shrink-0 ${tc.color}`}>
                          {tc.emoji} {tc.label}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[#F3F0E8] truncate leading-tight">
                              {entry.subject}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {entry.status === "new" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D5AD52]" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-[#AAA99F] mt-0.5 truncate leading-snug">
                            {entry.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[9px] font-mono text-[#555750]">
                              {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </span>
                            {entry.role && (
                              <span className="text-[9px] font-mono text-[#555750] uppercase">{entry.role}</span>
                            )}
                            {entry.rating && (
                              <span className="text-[9px] font-mono text-[#D5AD52]">{"★".repeat(entry.rating)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail panel */}
        <div className="rounded-lg border border-[#282A24] bg-[#191A17] overflow-hidden">
          {selected ? (
            <DetailPanel
              entry={selected}
              updating={updating}
              onUpdateStatus={(s) => updateStatus(selected.id, s)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-center px-6">
              <span className="text-4xl text-[#282A24]">◈</span>
              <p className="text-sm text-[#555750] font-mono">Select an entry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  entry,
  updating,
  onUpdateStatus,
}: {
  entry: FeedbackEntry;
  updating: boolean;
  onUpdateStatus: (s: FeedbackEntry["status"]) => void;
}) {
  const tc = TYPE_CONFIG[entry.type];
  const sc = STATUS_CONFIG[entry.status];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#282A24]">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border ${tc.color}`}>
            {tc.emoji} {tc.label}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-[#555750]">
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </span>
        </div>
        <h2 className="text-sm font-semibold text-[#F3F0E8] leading-snug">{entry.subject}</h2>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Message */}
        <div>
          <p className="text-[9px] font-mono text-[#555750] uppercase tracking-wider mb-1.5">Message</p>
          <p className="text-sm text-[#AAA99F] leading-relaxed whitespace-pre-wrap">{entry.message}</p>
        </div>

        {/* Rating */}
        {entry.rating && (
          <div>
            <p className="text-[9px] font-mono text-[#555750] uppercase tracking-wider mb-1">Rating</p>
            <p className="text-[#D5AD52] text-base tracking-wider">
              {"★".repeat(entry.rating)}
              <span className="text-[#282A24]">{"★".repeat(5 - entry.rating)}</span>
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <MetaItem label="Page" value={entry.page || "—"} />
          <MetaItem label="Role" value={entry.role || "—"} />
          <MetaItem label="Email" value={entry.email || "—"} />
          <MetaItem label="Submitted" value={new Date(entry.createdAt).toLocaleString("en-GB")} />
          <MetaItem label="ID" value={entry.id} mono />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-3 border-t border-[#282A24] space-y-2">
        <p className="text-[9px] font-mono text-[#555750] uppercase tracking-wider mb-2">Update Status</p>
        <div className="flex gap-2">
          {(["new", "reviewed", "resolved"] as const)
            .filter((s) => s !== entry.status)
            .map((s) => (
              <button
                key={s}
                onClick={() => onUpdateStatus(s)}
                disabled={updating}
                className="flex-1 py-1.5 rounded bg-[#111210] border border-[#282A24] text-[10px] font-mono text-[#AAA99F] hover:text-[#F3F0E8] hover:border-[#3A3C36] transition-colors disabled:opacity-40"
              >
                → {STATUS_CONFIG[s].label}
              </button>
            ))}
        </div>
        {entry.email && (
          <a
            href={`mailto:${entry.email}?subject=Re: ${encodeURIComponent(entry.subject)}`}
            className="block w-full text-center py-1.5 rounded bg-[#D5AD52]/10 border border-[#D5AD52]/30 text-[10px] font-mono text-[#D5AD52] hover:bg-[#D5AD52]/20 transition-colors"
          >
            Reply via Email
          </a>
        )}
      </div>
    </div>
  );
}

function MetaItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="col-span-1">
      <p className="text-[9px] font-mono text-[#555750] uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-xs text-[#AAA99F] truncate ${mono ? "font-mono text-[10px]" : ""}`}>{value}</p>
    </div>
  );
}
