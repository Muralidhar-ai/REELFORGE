import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-6 py-16 text-center max-w-md mx-auto">
      <span className="font-mono text-4xl text-accent font-bold block">404</span>
      <h1 className="font-display text-4xl text-ink">Page Not Found</h1>
      <p className="text-ink-2 text-sm">
        The requested brief, creator profile, or engagement record could not be found.
      </p>
      <div className="pt-2">
        <Link href="/" className="btn-primary text-xs">
          Return to home page →
        </Link>
      </div>
    </div>
  );
}
