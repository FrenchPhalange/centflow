# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Centflow is a family budget management web app (French-language, mobile-first PWA). Users track monthly income/expenses by category, copy previous months, and view annual summaries with charts.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server on http://localhost:3000
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm db:seed          # Interactive: create tables + user accounts
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio (DB GUI)
tsx scripts/import-csv.ts <file.csv> <email>  # Import bank CSV
```

No test framework is configured.

## Architecture

**Stack:** Nuxt 4 + Nuxt UI + Tailwind CSS v4 + Drizzle ORM + SQLite/Turso (LibSQL) + Better Auth (magic link) + Resend + PWA

### Key Patterns

- **Auth flow:** Better Auth with magic link plugin (no password). Client-side auth via `lib/auth-client.ts` (Better Auth Vue client). Server-side via `server/utils/auth.ts` (`useServerAuth()` singleton). Global client middleware `middleware/auth.global.ts` redirects unauthenticated users to `/login`. Server middleware `server/middleware/auth.ts` protects all `/api/**` routes (except `/api/auth/**`).

- **Database:** SQLite locally (`file:./data/budget.db`), Turso (LibSQL) in production. Connection singleton in `server/database/index.ts` (`useDB()`). Schema defined in `server/database/schema.ts`. Tables are auto-created on server startup via `server/plugins/auth-db.ts` (raw SQL CREATE IF NOT EXISTS).

- **API routes:** File-based under `server/api/budget/[year]/`. All budget endpoints call `requireAuth(event)` from `server/utils/session.ts` to get the authenticated user. Routes: GET/POST `[month]`, PATCH/DELETE `[month]/[entryId]`, POST `[month]/copy-previous`, GET `[month]/category-evolution`, GET `[year]/summary`.

- **State management:** Composable `composables/useBudget.ts` manages all budget state with `useState()` and optimistic updates (rollback on API error). `composables/useAuth.ts` wraps auth state.

- **Shared constants:** `shared/constants.ts` defines `REVENUE_CATEGORIES`, `EXPENSE_CATEGORIES`, `MONTHS`, and `CATEGORY_COLORS`. Types `BudgetType` (`'revenu' | 'depense'`) and `BudgetCategory` are exported from here.

- **Budget entries** have a unique constraint on `(user_id, year, month, type, category)` — one amount per category per month per user.

- **Styling:** Custom CSS variables in `assets/css/main.css` (color palette: sage green, terracotta, etc.). Utility classes: `.card`, `.card-padded`, `.app-container`, `.amount-input`, `.text-input`. Fonts: DM Sans (body) + DM Serif Display (headings). Max width: 720px.

- **PWA:** Configured via `@vite-pwa/nuxt` in `nuxt.config.ts`. Workbox caches budget API (StaleWhileRevalidate) and Google Fonts (CacheFirst). Pull-to-refresh composable: `composables/usePullToRefresh.ts`.

### Pages

- `/login` — Magic link login (layout: `auth`)
- `/` (index) — Monthly budget view with income/expense cards
- `/synthese` — Category evolution chart (last 6 months)
- `/annuel` — Annual summary with KPIs and charts

### Environment Variables

Two sets of DB vars are needed: `NUXT_TURSO_*` (for the app runtime) and `TURSO_*` (for drizzle-kit). Without `NUXT_RESEND_API_KEY`, magic links print to server console — suitable for dev.
