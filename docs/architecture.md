# ReelForge Architecture Overview

ReelForge is architected as a Next.js 15 App Router application emphasizing zero external setup friction, deterministic AI fallback, and modular data storage.

## Key Architectural Principles

1. **Repository Pattern (`src/lib/data/repo.ts`)**:
   - Isolates UI components from specific database implementations.
   - `LocalRepo` provides instant zero-setup execution using seeded JSON records stored in memory.
   - `SupabaseRepo` provides persistent PostgreSQL storage when environment credentials are present, automatically falling back to `LocalRepo` if disconnected.

2. **Commercial Safety Clearance Engine (`src/lib/safety.ts`)**:
   - Cross-references creator `tools_used` subscription tiers against `ToolLicense` records.
   - Evaluates commercial rights (`paid_ads`, `broadcast_tv`, `in_store_digital`) to assign green, amber, or red status labels with explicit explanatory causes.

3. **Deterministic AI Route Handlers (`src/app/api/briefs/*`)**:
   - Anthropic API integration is confined strictly to server-side Next.js route handlers (`/api/briefs/structure`, `/api/briefs/style-from-image`).
   - Strict 8-second execution timeouts and fallback handlers ensure zero application crashes if API keys are absent or rate-limited.

4. **Zero-JavaScript SSR Accessibility**:
   - Initial page loads for `/creators`, `/creators/[id]`, `/briefs/[id]`, and `/review` are server-rendered to preserve content visibility for search crawlers and evaluation bots.
