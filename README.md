# MOFA Translation (Next)

Production-oriented frontend foundation for a Next.js (App Router) app.

## Structure

- `src/app/` — routes + layouts (server-first)
- `src/components/ui/` — base reusable UI primitives
- `src/components/layout/` — layout building blocks
- `src/components/dashboard/` — feature-level components (example only)
- `src/lib/` — utilities (e.g. `cn`)
- `src/types/` — shared TypeScript types

## Notes for Figma MCP integration

- Prefer composing screens from `src/components/ui/*` primitives.
- Only use `"use client"` in feature components that need it (charts, interactions).

