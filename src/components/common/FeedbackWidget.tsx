"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";

type FeedbackType = "bug" | "feature" | "general" | "praise";

const FEEDBACK_TYPES: { value: FeedbackType; label: string; emoji: string; desc: string }[] = [
  { value: "praise",  label: "Praise",        emoji: "✦", desc: "Something works great" },
  { value: "general", label: "Suggestion",    emoji: "◈", desc: "Ideas & improvements" },
  { value: "feature", label: "Feature",       emoji: "◇", desc: "Something you need" },
  { value: "bug",     label: "Bug",           emoji: "◉", desc: "Something is broken" },
];

const STAR_COUNT = 5;

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "sent">("form");
  const [type, setType]       = useState<FeedbackType>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating]   = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const pathname = usePathname();
  const { role } = useRole();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("form");
        setSubject("");
        setMessage("");
        setRating(0);
        setEmail("");
        setError("");
        setType("general");
      }, 300);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError("Please fill in both subject and message.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject,
          message,
          rating: rating || undefined,
          email: email || undefined,
          page: pathname,
          role,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send feedback.");
      } else {
        setStep("sent");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Tooltip */}
        {!open && (
          <span
            className="px-2.5 py-1 rounded bg-[#20211D] border border-[#282A24] text-[10px] font-mono text-[#AAA99F]
                       opacity-0 group-hover:opacity-100 pointer-events-none select-none
                       transition-opacity duration-150"
          />
        )}

        <button
          id="feedback-widget-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-label="Send feedback"
          title="Send feedback"
          className={`
            group relative w-12 h-12 rounded-full flex items-center justify-center
            border transition-all duration-200 shadow-xl
            ${open
              ? "bg-[#E5A83B] border-[#F5BA4C] text-[#0B0D11] rotate-45 shadow-[0_0_15px_rgba(229,168,59,0.4)]"
              : "bg-[#12151D] border-[#1E2536] text-[#E5A83B] hover:bg-[#1A1E29] hover:border-[#E5A83B]/60 hover:shadow-[0_0_20px_rgba(229,168,59,0.2)]"
            }
          `}
        >
          {open ? (
            /* × when open */
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            /* chat bubble icon */
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3l2 3 2-3h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
              />
              <circle cx="5" cy="5.5" r="0.9" fill="currentColor"/>
              <circle cx="8" cy="5.5" r="0.9" fill="currentColor"/>
              <circle cx="11" cy="5.5" r="0.9" fill="currentColor"/>
            </svg>
          )}

          {/* Pulse ring when closed */}
          {!open && (
            <span className="absolute inset-0 rounded-full border border-[#E5A83B]/40 animate-ping pointer-events-none" />
          )}
        </button>
      </div>

      {/* Slide-in panel */}
      <div
        className={`
          fixed bottom-[88px] right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]
          transition-all duration-300 ease-out origin-bottom-right
          ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        <div
          ref={panelRef}
          className="rounded-2xl border border-[#1E2536] bg-[#12151D] shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#1E2536] flex items-center justify-between bg-[#161B26]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#E5A83B] text-xs font-mono font-bold uppercase tracking-widest">Feedback & Support</span>
              </div>
              <p className="text-[#F8FAFC] text-sm font-bold mt-0.5 leading-snug">
                Help us improve ReelForge
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close feedback panel"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E29] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          {step === "sent" ? (
            <SentState onClose={() => setOpen(false)} />
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="px-5 py-4 space-y-4">

                {/* Type chips */}
                <div>
                  <p className="text-[10px] font-mono text-[#AAA99F] uppercase tracking-wider mb-2">Type</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {FEEDBACK_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        title={t.desc}
                        className={`
                          py-2 rounded-lg flex flex-col items-center gap-1 border text-center
                          transition-all duration-150
                          ${type === t.value
                            ? "bg-[#1A1E29] border-[#E5A83B]/70 text-[#E5A83B] shadow-sm font-semibold"
                            : "bg-[#0B0D11] border-[#1E2536] text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC]"
                          }
                        `}
                      >
                        <span className="text-sm leading-none">{t.emoji}</span>
                        <span className="text-[10px] font-mono uppercase tracking-wide leading-none">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Star rating */}
                <div>
                  <p className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider mb-2 font-medium">
                    Overall experience <span className="normal-case text-[#64748B]">(optional)</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star === rating ? 0 : star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                        className="w-7 h-7 flex items-center justify-center transition-transform hover:scale-110"
                      >
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.4l-3.52 1.94.67-3.92L2.3 5.64l3.94-.57L8 1.5Z"
                            fill={star <= (hovered || rating) ? "#E5A83B" : "none"}
                            stroke={star <= (hovered || rating) ? "#E5A83B" : "#334155"}
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-1 text-[11px] font-mono text-[#E5A83B] font-bold">
                        {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="fb-subject" className="block text-[10px] font-mono text-[#AAA99F] uppercase tracking-wider mb-1.5">
                    Subject *
                  </label>
                  <input
                    id="fb-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary…"
                    maxLength={120}
                    required
                    className="
                      w-full px-3 py-2 rounded-md bg-[#111210] border border-[#282A24]
                      text-[#F3F0E8] text-sm placeholder-[#555750]
                      focus:outline-none focus:border-[#D5AD52]/50 focus:ring-1 focus:ring-[#D5AD52]/20
                      transition-colors
                    "
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="fb-message" className="block text-[10px] font-mono text-[#AAA99F] uppercase tracking-wider mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="fb-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more…"
                    rows={4}
                    maxLength={2000}
                    required
                    className="
                      w-full px-3 py-2 rounded-md bg-[#111210] border border-[#282A24]
                      text-[#F3F0E8] text-sm placeholder-[#555750] resize-none
                      focus:outline-none focus:border-[#D5AD52]/50 focus:ring-1 focus:ring-[#D5AD52]/20
                      transition-colors leading-relaxed
                    "
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] font-mono text-[#555750]">
                      {message.length}/2000
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="fb-email" className="block text-[10px] font-mono text-[#AAA99F] uppercase tracking-wider mb-1.5">
                    Email <span className="normal-case text-[#555750]">(optional — for follow-up)</span>
                  </label>
                  <input
                    id="fb-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="
                      w-full px-3 py-2 rounded-md bg-[#111210] border border-[#282A24]
                      text-[#F3F0E8] text-sm placeholder-[#555750]
                      focus:outline-none focus:border-[#D5AD52]/50 focus:ring-1 focus:ring-[#D5AD52]/20
                      transition-colors
                    "
                  />
                </div>

                {/* Metadata chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-[#111210] border border-[#282A24] text-[9px] font-mono text-[#555750] uppercase tracking-wide">
                    Page: {pathname}
                  </span>
                  {role && (
                    <span className="px-2 py-0.5 rounded bg-[#111210] border border-[#282A24] text-[9px] font-mono text-[#555750] uppercase tracking-wide">
                      Role: {role}
                    </span>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-400 font-mono bg-red-900/20 border border-red-900/40 rounded px-3 py-2">
                    {error}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <button
                  id="fb-submit"
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-2.5 rounded-md bg-[#D5AD52] hover:bg-[#E2BE6A]
                    text-[#111210] text-sm font-semibold font-mono
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                  "
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#111210]/30 border-t-[#111210] rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Feedback →"
                  )}
                </button>
                <p className="text-center text-[10px] font-mono text-[#555750] mt-3">
                  Your feedback goes directly to the ReelForge team.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function SentState({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-5 py-10 flex flex-col items-center text-center gap-4">
      {/* Animated check */}
      <div className="w-14 h-14 rounded-full border-2 border-[#D5AD52]/40 flex items-center justify-center relative">
        <svg
          className="text-[#D5AD52]"
          width="24" height="24" viewBox="0 0 24 24" fill="none"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: "drawCheck 0.5s ease forwards" }}
          />
        </svg>
        <span className="absolute inset-0 rounded-full bg-[#D5AD52]/5 animate-ping" />
      </div>

      <div>
        <p className="text-[#F3F0E8] text-base font-semibold">Thank you!</p>
        <p className="text-[#AAA99F] text-sm mt-1 leading-relaxed max-w-[220px]">
          Your feedback has been received. We review every submission.
        </p>
      </div>

      <button
        onClick={onClose}
        className="mt-2 px-5 py-2 rounded-md bg-[#20211D] border border-[#282A24] text-[#AAA99F] text-xs font-mono hover:text-[#F3F0E8] hover:border-[#3A3C36] transition-colors"
      >
        Close
      </button>

      <style>{`
        @keyframes drawCheck {
          from { stroke-dashoffset: 24; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
