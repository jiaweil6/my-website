# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

Jiawei Liu's personal academic site. Forked from Daniel R. Jiang's template (`https://danielrjiang.github.io/`). Pure static site — no build step, no package manager, no tests. Deployed as static files.

## Running locally

No build. Serve the directory with any static server, e.g.:

```
python3 -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000`. Reload after edits — there is no dev server / hot reload.

## Architecture

**Single-page bio + per-post blog.** `index.html` is one long document with anchor-linked sections (`#about-section`, `#education-section`, `#publications-section`, `#projects-section`, `#music-section`, `#blog-section`). Each blog post lives in its own self-contained directory under `blog/<slug>/` with its own `index.html`, `style.css`, `main.js`, `img/`, and `static/` — posts do NOT share the root `css/style.css` or `js/main.js`. Treat each post as an island.

**`js/main.js` (root site only)** is a single IIFE organized into 7 modules listed in the header comment (theme toggle, back-to-top, publication link wrapping, description truncation, tag filtering, menu scroll, menu active state). All selectors, thresholds, storage keys, and labels are centralized in the `CONFIG` object at the top — edit `CONFIG` rather than scattering literals through the modules.

**Publication tag filtering** is driven by `data-tag` on the filter chips and `<span class="tag">` markers inside each `.publication-row`. The filter set (`all`, `RL`, `RLHF`, `OR`, `NLP`) is hardcoded in `index.html`; adding a new category means adding both the chip and matching `<span class="tag">` entries on relevant rows.

**Theming** is `localStorage`-persisted under the key in `CONFIG.themeStorageKey`. The toggle flips a class on `<html>`; light/dark variants live as CSS custom properties in `css/style.css`. The bio portrait has two `<img>` tags (`bio-portrait-image-light` / `bio-portrait-image-dark`) — CSS swaps which is visible per theme.

**Icons** are Font Awesome via CDN. **Fonts** are Cormorant Garamond (display) + Inter (body) via Google Fonts, with a `document.fonts.ready` gate that adds `fonts-loaded` to `<html>` to prevent FOUT.

## Working in this codebase

These guidelines bias toward caution over speed. For trivial tasks, use judgment.

**Think before coding.** State assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If something is unclear, stop and ask.

**Simplicity first.** Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No error handling for impossible scenarios. If you write 200 lines and it could be 50, rewrite it.

**Surgical changes.** Touch only what you must. Don't "improve" adjacent code, comments, or formatting. Match existing style even if you'd do it differently. Every changed line should trace directly to the request. If you notice unrelated dead code, mention it — don't delete it.

**Goal-driven execution.** Transform tasks into verifiable goals. For multi-step work, state a brief plan with verification per step before executing.
