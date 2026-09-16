# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Jiawei Liu's personal academic site. Forked from Daniel R. Jiang's template (`https://danielrjiang.github.io/`). Static site deployed as static files, with a small Node build step that renders the HTML from markdown. No tests.

## Content is authored in markdown — never hand-edit generated HTML

`index.html`, `blog/<slug>/index.html`, `blog/<slug>/style.css`, and `blog/<slug>/main.js` are **generated**. Edit the markdown sources instead, then rebuild:

- `content/index.md` — the entire main page: YAML frontmatter (site metadata, bio sidebar, `publication_filters`), then `## Section` headings in page order. List entries are `### Title` + a fenced ```yaml block + an optional markdown description paragraph. `content/posts/template-post.md` and the Publications entries in `content/index.md` double as format examples.
- `content/posts/<slug>.md` — one file per blog post: frontmatter (`title`, `title_lines`, `kicker`, `writer`, `editor`, `date`, `description`), then `## Section` markdown with `$...$` / `$$...$$` math (converted to the site's `data-latex` MathJax convention), image-with-title figures (`![alt](img/x.png "Caption")`), and `:::details Summary ... :::` collapsibles. Figures/details go at the end of a section — they render between sections.

```
npm run build   # regenerate all HTML from content/
npm run check   # exit 1 if generated files are stale (markdown edited without rebuild)
```

Commit markdown sources and generated output together. `build/build.js` parses/validates, `build/templates.js` holds the HTML (lifted byte-for-byte from the original hand-written site — do not reformat its strings), `build/post-assets/` is the canonical per-post `style.css`/`main.js` copied into every `blog/<slug>/` on build. `build/verify.js <a.html> <b.html>` is a whitespace/entity-normalizing differ used to prove output equivalence.

## Running locally

Serve the directory with any static server, e.g.:

```
python3 -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000`. Reload after edits — there is no dev server / hot reload (run `npm run build` after markdown edits).

## Architecture

**Single-page bio + per-post blog.** `index.html` is one long document with anchor-linked sections (`#about-section`, `#education-section`, `#publications-section`, `#projects-section`, `#music-section`, `#blog-section`). Each blog post lives in its own self-contained directory under `blog/<slug>/` with its own `index.html`, `style.css`, `main.js`, `img/`, and `static/` — posts do NOT share the root `css/style.css` or `js/main.js`. Deployed posts stay islands, but their `style.css`/`main.js` are stamped from `build/post-assets/` at build time — edit the post look there, not per-post. Post `img/` and `static/` directories are hand-managed and never touched by the build.

**`js/main.js` (root site only)** is a single IIFE organized into 7 modules listed in the header comment (theme toggle, back-to-top, publication link wrapping, description truncation, tag filtering, menu scroll, menu active state). All selectors, thresholds, storage keys, and labels are centralized in the `CONFIG` object at the top — edit `CONFIG` rather than scattering literals through the modules.

**Publication tag filtering** is driven by `data-tag` on the filter chips and `<span class="tag">` markers inside each `.publication-row`. The filter set lives in `publication_filters` in `content/index.md` frontmatter; per-entry `tags:` must be a subset (the build enforces this).

**Theming** is `localStorage`-persisted under the key in `CONFIG.themeStorageKey`. The toggle flips a class on `<html>`; light/dark variants live as CSS custom properties in `css/style.css`. The bio portrait has two `<img>` tags (`bio-portrait-image-light` / `bio-portrait-image-dark`) — CSS swaps which is visible per theme.

**Icons** are Font Awesome via CDN. **Fonts** are Cormorant Garamond (display) + Inter (body) via Google Fonts, with a `document.fonts.ready` gate that adds `fonts-loaded` to `<html>` to prevent FOUT.

## Working in this codebase

These guidelines bias toward caution over speed. For trivial tasks, use judgment.

**Think before coding.** State assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If something is unclear, stop and ask.

**Simplicity first.** Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No error handling for impossible scenarios. If you write 200 lines and it could be 50, rewrite it.

**Surgical changes.** Touch only what you must. Don't "improve" adjacent code, comments, or formatting. Match existing style even if you'd do it differently. Every changed line should trace directly to the request. If you notice unrelated dead code, mention it — don't delete it.

**Goal-driven execution.** Transform tasks into verifiable goals. For multi-step work, state a brief plan with verification per step before executing.
