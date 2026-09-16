#!/usr/bin/env node
// Renders index.html (and blog posts) from the markdown sources in content/.
// Usage: node build/build.js [--check]
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { marked } = require('marked');
const T = require('./templates');

const ROOT = path.join(__dirname, '..');

function fail(msg) {
  console.error(`build error: ${msg}`);
  process.exit(1);
}

function splitFrontmatter(src, file) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  if (!m) fail(`${file}: missing YAML frontmatter`);
  let meta;
  try {
    meta = yaml.load(m[1]);
  } catch (err) {
    fail(`${file}: frontmatter is not valid YAML — ${err.message}`);
  }
  return { meta, body: src.slice(m[0].length) };
}

// Inline markdown -> HTML, with external links given the same attributes (and
// attribute order) the hand-written site uses.
function mdInline(text) {
  return marked.parseInline(text.trim())
    .replace(/&#39;/g, "'") // marked escapes apostrophes; the hand-written site keeps them raw
    .replace(/<a href="(https?:\/\/[^"]*)">/g, '<a target="_blank" rel="noopener noreferrer" href="$1">');
}

// Splits "## Heading" chunks; returns [{heading, content}]. parts[0] is text
// before the first heading and must be empty.
function splitOnHeading(level, text) {
  const re = level === 2 ? /^## (.+)$/m : /^### (.+)$/m;
  const parts = text.split(re);
  const out = { lead: parts[0], chunks: [] };
  for (let i = 1; i < parts.length; i += 2) {
    out.chunks.push({ heading: parts[i].trim(), content: parts[i + 1] });
  }
  return out;
}

function parseEntry(sectionHeading, chunk, file) {
  const entry = { title: chunk.heading, data: {}, description: '' };
  let rest = chunk.content;
  const fence = /```yaml\n([\s\S]*?)\n```/.exec(rest);
  if (fence) {
    try {
      entry.data = yaml.load(fence[1]) || {};
    } catch (err) {
      fail(`${file}: entry "${chunk.heading}" in "${sectionHeading}" has invalid YAML — ${err.message}`);
    }
    rest = rest.slice(fence.index + fence[0].length);
  }
  if (rest.trim()) entry.description = mdInline(rest);
  return entry;
}

const STACK_ITEM = /^\*\*(.+?)\*\*\s+—\s+(.+)$/;

function parseAbout(section) {
  const { lead, chunks } = splitOnHeading(3, section.content);
  const summaryParagraphs = lead.trim().split(/\n\s*\n/).map(mdInline);
  const subsections = chunks.map((sub) => {
    const items = sub.content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('- '))
      .map((l) => l.slice(2).trim());
    if (items.length && items.every((it) => STACK_ITEM.test(it))) {
      return {
        heading: sub.heading,
        kind: 'stack',
        items: items.map((it) => {
          const m = STACK_ITEM.exec(it);
          return { title: m[1], subtitle: m[2] };
        }),
      };
    }
    return { heading: sub.heading, kind: 'list', items: items.map(mdInline) };
  });
  return { heading: section.heading, summaryParagraphs, subsections };
}

function parseIndex(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const { meta, body } = splitFrontmatter(src, file);
  const { lead, chunks } = splitOnHeading(2, body);
  if (lead.trim()) fail(`${file}: unexpected content before the first "## Section" heading`);
  const sections = chunks.map((chunk) => {
    const section = { heading: chunk.heading, content: chunk.content };
    if (chunk.heading !== 'About') {
      const { lead: entryLead, chunks: entryChunks } = splitOnHeading(3, chunk.content);
      if (entryLead.trim()) fail(`${file}: unexpected prose before the first entry in "${chunk.heading}"`);
      section.entries = entryChunks.map((c) => parseEntry(chunk.heading, c, file));
    }
    return section;
  });
  return { meta, sections };
}

function assertImage(relPath, context) {
  if (!fs.existsSync(path.join(ROOT, relPath))) {
    fail(`${context}: image "${relPath}" does not exist`);
  }
}

function requireFields(entry, fields, sectionHeading, file) {
  for (const f of fields) {
    if (entry.data[f] === undefined || entry.data[f] === null || entry.data[f] === '') {
      fail(`${file}: entry "${entry.title}" in "${sectionHeading}" is missing required field "${f}"`);
    }
  }
}

const ENTRY_FIELDS = {
  Education: ['logo', 'logo_alt', 'degree', 'meta'],
  Publications: ['url', 'icon', 'icon_alt', 'tags', 'authors', 'links'],
  Experience: ['label', 'organization', 'details'],
  'Teaching Experience': ['course', 'course_url', 'url', 'audience', 'position', 'links'],
  Projects: ['icon', 'icon_alt'],
  Music: ['url', 'subtitle', 'links'],
  Blog: ['date', 'tag', 'url', 'link_label'],
};

function validateSection(section, meta, file) {
  const fields = ENTRY_FIELDS[section.heading];
  if (!fields) return;
  for (const entry of section.entries) {
    requireFields(entry, fields, section.heading, file);
    const where = `${file}: entry "${entry.title}" in "${section.heading}"`;
    if (entry.data.icon) assertImage(entry.data.icon, where);
    if (entry.data.logo) assertImage(entry.data.logo, where);
    if (section.heading === 'Publications') {
      for (const tag of entry.data.tags) {
        if (!meta.publication_filters.includes(tag)) {
          fail(`${where}: tag "${tag}" is not in publication_filters (${meta.publication_filters.join(', ')})`);
        }
      }
      const published = entry.data.venue || entry.data.venue_url || entry.data.year;
      if (entry.data.status && published) {
        fail(`${where}: use either "status" or "venue"/"venue_url"/"year", not both`);
      }
      if (!entry.data.status && !(entry.data.venue && entry.data.venue_url && entry.data.year)) {
        fail(`${where}: needs "status" (unpublished) or all of "venue", "venue_url", "year" (published)`);
      }
    }
    for (const link of entry.data.links || []) {
      if (!link.icon || !link.label || !link.url) {
        fail(`${where}: every link needs "icon", "label" and "url"`);
      }
    }
  }
}

// Menu anchor and label for each section, in the order the sections appear.
const NAV = {
  About: { id: 'about-section', label: 'About' },
  Education: { id: 'education-section', label: 'Education' },
  Experience: { id: 'experience-section', label: 'Experience' },
  Publications: { id: 'publications-section', label: 'Research' },
  'Teaching Experience': { id: 'teaching-section', label: 'Teaching' },
  Projects: { id: 'projects-section', label: 'Projects' },
  Music: { id: 'music-section', label: 'Music' },
  Blog: { id: 'blog-section', label: 'Blog' },
};

function renderIndex(parsed) {
  const { meta, sections } = parsed;
  const file = 'content/index.md';
  assertImage(meta.portrait.light, `${file}: portrait.light`);
  assertImage(meta.portrait.dark, `${file}: portrait.dark`);
  const rendered = sections.map((section) => {
    validateSection(section, meta, file);
    switch (section.heading) {
      case 'About':
        return T.renderBio(meta, parseAbout(section));
      case 'Education':
        return T.renderEducation(section);
      case 'Experience':
        return T.renderExperience(section);
      case 'Publications':
        return T.renderPublications(section, meta.publication_filters);
      case 'Teaching Experience':
        return T.renderTeaching(section);
      case 'Projects':
        return T.renderProjects(section);
      case 'Music':
        return T.renderMusic(section);
      case 'Blog':
        return T.renderBlog(section);
      default:
        return fail(`${file}: unknown section "## ${section.heading}" — known sections: About, Education, Experience, Publications, Teaching Experience, Projects, Music, Blog`);
    }
  });
  const nav = sections.map((s) => NAV[s.heading]);
  return T.chromeTop(meta, nav) + rendered.join('\n\n') + '\n' + T.chromeBottom();
}

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

function latexAttr(latex) {
  // Only quotes: the hand-written pages keep &, \ and < raw inside data-latex.
  return latex.replace(/"/g, '&quot;');
}

// Inline markdown for post prose; posts put href before target/rel (matching
// the hand-written pages, which differ from index.html's attribute order).
function mdInlinePost(text) {
  return marked.parseInline(text.replace(/\s+/g, ' ').trim())
    .replace(/&#39;/g, "'") // marked escapes apostrophes; the hand-written site keeps them raw
    .replace(/<a href="(https?:\/\/[^"]*)">/g, '<a href="$1" target="_blank" rel="noopener noreferrer">');
}

// Parses one scope (a section body or a :::details body) into post blocks:
// {kind: 'p'|'eq'|'stack'|'figure'|'details'|'raw', ...}
function parsePostScope(md, file) {
  const store = { details: [], eqs: [], inline: [] };
  let src = md;

  src = src.replace(/^:::details[ \t]+(.+)\n([\s\S]*?)\n:::[ \t]*$/gm, (m, summary, body) => {
    store.details.push({ summary: summary.trim(), body });
    return `@@DETAILS${store.details.length - 1}@@`;
  });

  const pushEq = (latex, label) => {
    store.eqs.push({ latex: latex.replace(/\s+/g, ' ').trim(), label });
    return `@@EQ${store.eqs.length - 1}@@`;
  };
  src = src.replace(/^\$\$([^\n]*)\n([\s\S]*?)\n\$\$[ \t]*$/gm, (m, labelPart, latex) => {
    let label = null;
    if (labelPart.trim()) {
      const lm = /^[ \t]*label="([^"]*)"[ \t]*$/.exec(labelPart);
      if (!lm) fail(`${file}: text after $$ must be label="..." — got "${labelPart.trim()}"`);
      label = lm[1];
    }
    return pushEq(latex, label);
  });
  src = src.replace(/^\$\$(.+?)\$\$[ \t]*$/gm, (m, latex) => pushEq(latex, null));

  src = src.replace(/\\\$/g, '@@DOLLAR@@');
  src = src.replace(/\$([^$\n]+?)\$/g, (m, latex) => {
    store.inline.push(latex);
    return `@@IM${store.inline.length - 1}@@`;
  });

  const restore = (s) => s
    .replace(/@@IM(\d+)@@/g, (m, i) => `<span class="math-inline" data-latex="${latexAttr(store.inline[+i])}"></span>`)
    .replace(/@@DOLLAR@@/g, '$');

  const blocks = [];
  for (const tok of marked.lexer(src)) {
    if (tok.type === 'space') continue;
    if (tok.type === 'paragraph') {
      const text = tok.text.trim();
      if (/^(@@EQ\d+@@\s*)+$/.test(text)) {
        for (const m of text.match(/@@EQ(\d+)@@/g)) {
          blocks.push({ kind: 'eq', ...store.eqs[Number(m.slice(4, -2))] });
        }
        continue;
      }
      const dm = /^@@DETAILS(\d+)@@$/.exec(text);
      if (dm) {
        const d = store.details[Number(dm[1])];
        blocks.push({ kind: 'details', summary: d.summary, blocks: parsePostScope(d.body, file) });
        continue;
      }
      if (tok.tokens && tok.tokens.length === 1 && tok.tokens[0].type === 'image') {
        const img = tok.tokens[0];
        blocks.push({ kind: 'figure', src: img.href, alt: img.text, caption: restore(img.title || '') });
        continue;
      }
      blocks.push({ kind: 'p', html: restore(mdInlinePost(tok.text)) });
      continue;
    }
    blocks.push({ kind: 'raw', html: restore(marked.parser([tok]).trim()) });
  }

  // Adjacent display equations render as one .equation-stack panel.
  const grouped = [];
  for (const b of blocks) {
    const prev = grouped[grouped.length - 1];
    if (b.kind === 'eq' && prev && prev.kind === 'eq') {
      grouped[grouped.length - 1] = { kind: 'stack', blocks: [prev, b] };
    } else if (b.kind === 'eq' && prev && prev.kind === 'stack') {
      prev.blocks.push(b);
    } else {
      grouped.push(b);
    }
  }
  return grouped;
}

function parsePost(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const { meta, body } = splitFrontmatter(src, file);
  if (meta.date instanceof Date) meta.date = meta.date.toISOString().slice(0, 10);
  const { lead, chunks } = splitOnHeading(2, body);
  if (lead.trim()) fail(`${file}: unexpected content before the first "## Section" heading`);
  const flow = [];
  for (const chunk of chunks) {
    const blocks = parsePostScope(chunk.content, file);
    const hoisted = [];
    while (blocks.length && (blocks[blocks.length - 1].kind === 'figure' || blocks[blocks.length - 1].kind === 'details')) {
      hoisted.unshift(blocks.pop());
    }
    for (const b of blocks) {
      if (b.kind === 'figure' || b.kind === 'details') {
        fail(`${file}: a figure or :::details block sits mid-section in "## ${chunk.heading}" — move it to the end of the section (it renders between sections)`);
      }
    }
    flow.push({ kind: 'section', heading: chunk.heading, blocks });
    flow.push(...hoisted);
  }
  return { meta, flow };
}

function buildPosts() {
  const postsDir = path.join(ROOT, 'content', 'posts');
  const outputs = [];
  if (!fs.existsSync(postsDir)) return outputs;
  const assets = ['style.css', 'main.js'].map((name) => ({
    name,
    content: fs.readFileSync(path.join(__dirname, 'post-assets', name), 'utf8'),
  }));
  for (const entry of fs.readdirSync(postsDir).sort()) {
    if (!entry.endsWith('.md')) continue;
    const slug = entry.slice(0, -3);
    const file = `content/posts/${entry}`;
    const { meta, flow } = parsePost(file);
    for (const f of ['title', 'title_lines', 'kicker', 'writer', 'editor', 'date', 'description']) {
      if (meta[f] === undefined || meta[f] === null || meta[f] === '') {
        fail(`${file}: frontmatter is missing required field "${f}"`);
      }
    }
    const checkFigures = (blocks) => {
      for (const b of blocks) {
        if (b.kind === 'figure' && !/^[a-z]+:/.test(b.src)) assertImage(`blog/${slug}/${b.src}`, file);
        if (b.blocks) checkFigures(b.blocks);
      }
    };
    for (const item of flow) checkFigures(item.blocks || [item]);
    outputs.push({ file: `blog/${slug}/index.html`, content: T.postPage(meta, flow) });
    for (const a of assets) outputs.push({ file: `blog/${slug}/${a.name}`, content: a.content });
  }
  return outputs;
}

function main() {
  const check = process.argv.includes('--check');
  const outputs = [
    { file: 'index.html', content: renderIndex(parseIndex('content/index.md')) },
    ...buildPosts(),
  ];

  const stale = [];
  for (const out of outputs) {
    const target = path.join(ROOT, out.file);
    if (check) {
      const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
      if (current !== out.content) stale.push(out.file);
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, out.content);
      console.log(`wrote ${out.file}`);
    }
  }
  if (check) {
    if (stale.length) {
      console.error(`stale (rerun "npm run build" and commit): ${stale.join(', ')}`);
      process.exit(1);
    }
    console.log('check OK: generated files are up to date');
  }
}

main();
