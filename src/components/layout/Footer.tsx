import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-20 py-8"
      style={{
        borderTop: "1px solid rgba(139, 139, 168, 0.1)",
        background: "linear-gradient(to bottom, transparent, rgba(124, 92, 252, 0.03))",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7C5CFC, #22D3EE)" }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M3 4L8 2L13 4V9C13 11.5 10.5 13.5 8 14C5.5 13.5 3 11.5 3 9V4Z" fill="white"/>
            </svg>
          </div>
          <span className="text-ink-2 text-sm font-mono">ReelForge</span>
          <span className="text-ink-3 text-xs font-mono">— Production desk for AI creators</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/review"
            className="text-xs font-mono text-ink-3 hover:text-accent-2 transition-colors"
          >
            Rubric mapping →
          </Link>
          <Link
            href="/data-model"
            className="text-xs font-mono text-ink-3 hover:text-accent-2 transition-colors"
          >
            Data model →
          </Link>
          <span className="text-xs font-mono text-ink-3">© 2026</span>
        </div>
      </div>
    </footer>
  );
}
