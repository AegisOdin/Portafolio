# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio of Neftali Odín García Ramírez. Astro 6 + Tailwind 4 static site. CRT/phosphor terminal aesthetic. Spanish (`<html lang="es">`). Node `>=22.12.0`, pnpm.

## Commands

- `pnpm dev` — dev server (`localhost:4321`)
- `pnpm build` — output to `./dist/`
- `pnpm preview` — preview built site
- `pnpm lint` / `pnpm lint:fix` — ESLint over `.astro,.js,.mjs,.cjs,.ts`
- `pnpm astro check` — Astro + TS diagnostics (no dedicated script; run via `pnpm astro ...`)
- No test suite configured.

## Architecture

Single-page portfolio. Everything renders from `src/pages/index.astro` — no router, no content collections, no SSR.

- **Data inlined in page frontmatter.** `projects`, `experience`, and `skills` literals at the top of `src/pages/index.astro` are mapped into sections. To add/edit a portfolio entry, edit those literals — no CMS or markdown source.
- **Layout chain:** `src/layouts/BaseLayout.astro` wraps every page. Imports `src/styles/globals.css`, loads Google Fonts (JetBrains Mono + VT323), applies `scanlines crt` body classes that drive CRT overlay effects.
- **Components** (`src/components/`) are presentational Astro fragments: `BootSequence`, `CommandBar` (exposes `window.__cmd` API used by hero buttons and Konami easter egg), `SectionHeader`.
- **Styling system:** Tailwind 4 via Vite plugin (`@tailwindcss/vite`) — no `tailwind.config`. Design tokens are CSS custom properties in `@theme {}` inside `globals.css` (`--color-phosphor`, `--color-amber`, `--color-bg`, etc.). `--accent` is theme-swappable via `:root[data-theme="amber|magenta"]`. Custom utility classes (`.frame`, `.pill`, `.glow`, `.aberrate`, `.typewrite`, `.wipe`, `.glitch`, `.grid-bg`, `.display`, `.sigil`) defined in `globals.css` — prefer these over reimplementing the look in Tailwind.
- **Effects:** scanlines (`body.scanlines::before`), CRT flicker (`body.crt::after`), section reveal via `IntersectionObserver` adding `.in` to `.wipe` sections (inline script at bottom of `index.astro`), uptime counter, Konami code → `__cmd.hire()`. Respect `prefers-reduced-motion` and the `@media print` block when touching animations.
- **Contact form** posts to FormSubmit (`https://formsubmit.co/odingarra@gmail.com`) — no backend.
- **Static assets** in `public/` (CV served from `/CV_Neftali_Odin_Garcia.pdf`).

## Conventions

- TS uses `astro/tsconfigs/strict`. ESLint disables `no-undef` for `.astro`/`.ts` (Astro handles its own typing).
- Spanish copy throughout user-facing strings; keep locale unless explicitly changing.
- New colors/fonts go into `@theme` as CSS vars, not hardcoded hex in components.

## User preferences (persistent memory)

- The user personally reviews the design in the browser. Do not open a browser, take screenshots, or run browser/Playwright visual checks unless the user explicitly asks. Use code review and build/lint checks for technical validation. Recorded at the user's request on 2026-09-11.
- Preserve the existing CRT/phosphor terminal identity when improving the design.
