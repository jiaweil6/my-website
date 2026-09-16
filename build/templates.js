'use strict';

// All fixed markup below is lifted byte-for-byte from the hand-written site so
// the generated files stay identical to the pre-migration HTML. Do not
// reformat, re-indent, or "clean up" these strings.

const EXT = 'target="_blank" rel="noopener noreferrer"';

function chromeTop(meta) {
  return `<!DOCTYPE html>
<!--
================================================================================
Daniel R. Jiang Webpage Design/Template
================================================================================
-->
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>${meta.title}</title>
    <meta name="description"
        content="${meta.description}">
    <meta name="author" content="${meta.author}">

    <!-- Canonical URL -->
    <link rel="canonical" href="${meta.canonical}">

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicon for all devices -->
    <link rel="icon" type="image/svg+xml" href="img/favicon.svg">
    <link rel="apple-touch-icon" href="img/favicon.svg">
    <link rel="shortcut icon" href="img/favicon.svg">

    <!-- Google Fonts with preconnect for faster loading -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&family=Source+Sans+3:ital,wght@0,400..700;1,400..700&family=Ma+Shan+Zheng&display=swap">
    <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&family=Source+Sans+3:ital,wght@0,400..700;1,400..700&family=Ma+Shan+Zheng&display=swap"
        rel="stylesheet">

    <!-- Font Awesome (replace with your preferred icon set if desired) -->
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        crossorigin="anonymous" referrerpolicy="no-referrer">

    <script>
        (function () {
            var storageKey = 'site-theme';
            var theme = null;

            try {
                theme = localStorage.getItem(storageKey);
            } catch (error) {
                theme = null;
            }

            if (theme !== 'light' && theme !== 'dark') {
                theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
            }

            document.documentElement.setAttribute('data-theme', theme);
        })();
    </script>
    <link href="css/style.css" rel="stylesheet">
    <script>
        // Detect when fonts are loaded to prevent FOUT
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                document.documentElement.classList.add('fonts-loaded');
            });
        } else {
            // Fallback for browsers without Font Loading API
            document.documentElement.classList.add('fonts-loaded');
        }
    </script>

</head>

<body>
    <nav class="site-menu" aria-label="Primary">
        <div class="site-menu-shell">
            <a class="site-menu-brand" href="#about-section">${meta.name}</a>
            <div class="site-menu-inner">
                <a class="site-menu-link" href="#about-section">About</a>
                <a class="site-menu-link" href="#education-section">Education</a>
                <a class="site-menu-link" href="#publications-section">Research</a>
                <a class="site-menu-link" href="#projects-section">Projects</a>
                <a class="site-menu-link" href="#music-section">Music</a>
                <a class="site-menu-link" href="#blog-section">Blog</a>
            </div>
        </div>
    </nav>
    <button class="theme-toggle" type="button" aria-label="Switch to dark mode" aria-pressed="false" title="Switch to dark mode">
        <i class="fas fa-moon" aria-hidden="true"></i>
    </button>
    <main>
`;
}

function chromeBottom() {
  return `    </main>

    <p class="template-credit">
        Designed by <a ${EXT} href="https://danielrjiang.github.io/">Daniel R. Jiang</a>.
    </p>
    <button class="back-to-top" aria-label="Back to top">
        <i class="fas fa-arrow-up"></i>
    </button>
    <script src="js/main.js"></script>
</body>

</html>
`;
}

function bioName(meta) {
  if (!meta.native_name) return meta.name;
  return `${meta.name} <span class="bio-name-native-wrap"><span class="bio-name-native-mark">(</span><span class="bio-name-native">${meta.native_name}</span><span class="bio-name-native-mark">)</span></span>`;
}

// Wraps a leading flag-emoji pair (two regional indicator symbols) the way the
// hand-written Languages entries do.
function detailTitle(title) {
  const m = /^([\u{1F1E6}-\u{1F1FF}]{2}) (.*)$/u.exec(title);
  if (!m) return title;
  return `<span aria-hidden="true">${m[1]}</span> ${m[2]}`;
}

function renderDetailSection(sub) {
  const slug = sub.heading.toLowerCase();
  const head = `                            <section class="bio-detail-section" aria-labelledby="bio-${slug}-heading">
                                <h2 class="bio-detail-heading" id="bio-${slug}-heading">${sub.heading}</h2>`;
  if (sub.kind === 'list') {
    const items = sub.items.map((it) => `                                    <li>${it}</li>`).join('\n');
    return `${head}
                                <ul class="bio-detail-list">
${items}
                                </ul>
                            </section>`;
  }
  const items = sub.items.map((it) => `                                    <div class="bio-detail-item">
                                        <p class="bio-detail-title">${detailTitle(it.title)}</p>
                                        <p class="bio-detail-subtitle">${it.subtitle}</p>
                                    </div>`).join('\n');
  return `${head}
                                <div class="bio-detail-stack">
${items}
                                </div>
                            </section>`;
}

function renderBio(meta, about) {
  const social = meta.social.map((s) =>
    `                            <a ${EXT} href="${s.url}" aria-label="${s.label}"><i class="${s.icon}"></i></a>`
  ).join('\n');
  const summary = about.summaryParagraphs.map((p) => `                            <p>
                                ${p}
                            </p>`).join('\n');
  const details = about.subsections.map(renderDetailSection).join('\n\n');
  return `        <!-- Biography Card -->
        <div class="bio-card" id="about-section">
            <div class="container-fluid">
                <div class="bio-layout">
                    <aside class="bio-sidebar">
                        <div class="bio-portrait" role="img" aria-label="${meta.portrait.alt}">
                            <img class="bio-portrait-image bio-portrait-image-light" src="${meta.portrait.light}" alt="" aria-hidden="true" />
                            <img class="bio-portrait-image bio-portrait-image-dark" src="${meta.portrait.dark}" alt="" aria-hidden="true" />
                        </div>

                        <div class="bio-sidebar-stack">
                            <div class="bio-sidebar-block">
                                <span class="bio-sidebar-label">Email</span>
                                <a class="bio-sidebar-emphasis" href="mailto:${meta.email}">${meta.email}</a>
                            </div>
                        </div>

                        <nav class="bio-social-links" aria-label="Social media profiles">
${social}
                        </nav>
                    </aside>

                    <div class="bio-main">
                        <header class="bio-header">
                            <h1 class="bio-name">${bioName(meta)}</h1>
                        </header>

                        <div class="bio-summary">
${summary}
                        </div>

                        <div class="bio-detail-grid">
${details}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- End Biography Card -->`;
}

function sectionHeaderRow(heading, extra) {
  return `                <div class="section-header-row">
                    <h3 class="section-header">${heading}</h3>${extra || ''}
                </div>`;
}

function contentSection(comment, id, heading, headerExtra, body) {
  return `        <!-- ${comment} -->
        <div class="content-section" id="${id}">
            <div class="container-fluid">
${sectionHeaderRow(heading, headerExtra)}

${body}
            </div>
        </div>
        <!-- End ${comment} -->`;
}

function renderEducation(section) {
  const items = section.entries.map((e) => `                    <article class="education-item">
                        <img class="education-logo" src="${e.data.logo}" alt="${e.data.logo_alt}" />
                        <div class="education-copy">
                            <p class="education-school">${e.title}</p>
                            <p class="education-degree">${e.data.degree}</p>
                            <p class="education-meta">${e.data.meta}</p>
                        </div>
                    </article>`).join('\n\n');
  return contentSection('Education', 'education-section', section.heading, '', `                <div class="education-list">
${items}
                </div>`);
}

function renderLinks(links) {
  return links.map((l) => {
    const pair = `<i class="${l.icon}"></i> <a ${EXT} href="${l.url}">${l.label}</a>`;
    return `                            ${l.featured ? `<span class="featured-wrap highlight-organic">${pair}</span>` : pair}`;
  }).join('\n');
}

function renderJournal(data) {
  if (data.status) return `<span class="journal-submitted">${data.status}</span>`;
  return `<a ${EXT} href="${data.venue_url}">${data.venue}</a>, <strong>${data.year}</strong>.`;
}

function renderPublication(e) {
  const tags = e.data.tags.map((t) => `                            <span class="tag">${t}</span>`).join('\n');
  const authors = e.data.authors.replace(/\*\*(.+?)\*\*/g, '<span class="author-self">$1</span>');
  return `                <!-- Publication -->
                <div class="publication-row">
                    <div class="row-icon">
                        <a ${EXT} href="${e.data.url}">
                            <img src="${e.data.icon}" class="publication-icon" loading="lazy" alt="${e.data.icon_alt}" />
                        </a>
                        <div class="icon-tags">
${tags}
                        </div>
                    </div>
                    <div class="row-content">
                        <p class="publication-title"><a ${EXT} href="${e.data.url}">${e.title}</a></p>
                        <p class="publication-authors">${authors}</p>
                        <p class="publication-journal">${renderJournal(e.data)}</p>
                        <p class="publication-description">${e.description}</p>
                        <p class="publication-links">
${renderLinks(e.data.links)}
                        </p>
                    </div>
                </div>
                <!-- End Publication -->`;
}

function renderPublications(section, filters) {
  const chips = filters.map((t) => `                            <span class="tag-filter" data-tag="${t}">${t}</span>`).join('\n');
  const dropdown = `
                    <div class="filter-dropdown">
                        <span class="filter-toggle"><i class="fas fa-filter"></i> Filter</span>
                        <div class="tag-filters">
                            <span class="tag-filter active" data-tag="all">All</span>
${chips}
                        </div>
                    </div>`;
  const rows = section.entries.map(renderPublication).join('\n\n');
  return contentSection('Research', 'publications-section', section.heading, dropdown, rows);
}

function renderTeaching(section) {
  const rows = section.entries.map((e) => `                <div class="course-row">
                    <div class="row-icon">
                        <h5><a ${EXT} href="${e.data.course_url}">${e.data.course}</a></h5>
                    </div>
                    <div class="row-content">
                        <p class="publication-title"><a ${EXT} href="${e.data.url}">${e.title}</a>, <span class="journal-submitted">${e.data.audience}</span></p>
                        <p class="teaching-position">${e.data.position}</p>
                        <p class="publication-description">${e.description}</p>
                        <p class="publication-links">
${renderLinks(e.data.links)}
                        </p>
                    </div>
                </div>`).join('\n\n');
  return contentSection('Teaching', 'teaching-section', section.heading, '', rows);
}

function renderProjects(section) {
  const rows = section.entries.map((e) => `                <div class="publication-row">
                    <div class="row-icon">
                        <a ${EXT} href="${e.data.url}">
                            <img src="${e.data.icon}" class="publication-icon" loading="lazy" alt="${e.data.icon_alt}" />
                        </a>
                    </div>
                    <div class="row-content">
                        <p class="publication-title"><a ${EXT} href="${e.data.url}">${e.title}</a></p>
                        <p class="publication-description">${e.description}</p>
                        <p class="publication-links">
${renderLinks(e.data.links)}
                        </p>
                    </div>
                </div>`).join('\n\n');
  return contentSection('Projects', 'projects-section', section.heading, '', rows);
}

function renderMusic(section) {
  const rows = section.entries.map((e) => `                <div class="music-row">
                    <div class="row-content">
                        <p class="publication-title"><a ${EXT} href="${e.data.url}">${e.title}</a></p>
                        <p class="teaching-position">${e.data.subtitle}</p>
                        <p class="publication-description">${e.description}</p>
                        <p class="publication-links">
${renderLinks(e.data.links)}
                        </p>
                    </div>
                </div>`).join('\n\n');
  return contentSection('Music', 'music-section', section.heading, '', rows);
}

function renderBlog(section) {
  const rows = section.entries.map((e) => `                    <article class="blog-row">
                        <p class="blog-date">${e.data.date}</p>
                        <div class="blog-content">
                            <div class="blog-title-row">
                                <p class="blog-title"><a ${EXT} href="${e.data.url}">${e.title}</a></p>
                                <span class="blog-tag">${e.data.tag}</span>
                            </div>
                            <p class="blog-excerpt">${e.description}</p>
                            <p class="blog-links">
                                <a ${EXT} href="${e.data.url}">${e.data.link_label}</a>
                            </p>
                        </div>
                    </article>`).join('\n\n');
  return contentSection('Blog', 'blog-section', section.heading, '', `                <div class="blog-list">
${rows}
                </div>`);
}

// ---------------------------------------------------------------------------
// Blog post template (shared scaffold of blog/<slug>/index.html)
// ---------------------------------------------------------------------------

function latexAttr(latex) {
  // Only quotes are escaped: the hand-written pages keep &, \ and < raw inside
  // data-latex (MathJax reads the value via getAttribute).
  return latex.replace(/"/g, '&quot;');
}

function equationBlock(eq, indent) {
  const label = eq.label ? ` aria-label="${eq.label}"` : '';
  return `${indent}<div class="equation-block"${label} data-latex="${latexAttr(eq.latex)}"></div>`;
}

function renderPostBlock(block, indent) {
  switch (block.kind) {
    case 'p':
      return `${indent}<p>\n${indent}    ${block.html}\n${indent}</p>`;
    case 'eq':
      return equationBlock(block, indent);
    case 'stack':
      return `${indent}<div class="equation-stack">\n${block.blocks.map((b) => equationBlock(b, indent + '    ')).join('\n')}\n${indent}</div>`;
    case 'figure':
      return `${indent}<figure class="post-figure">
${indent}    <img src="${block.src}" alt="${block.alt}">
${indent}    <figcaption>${block.caption}</figcaption>
${indent}</figure>`;
    case 'details':
      return `${indent}<details class="post-details">
${indent}    <summary>${block.summary}</summary>
${indent}    <div class="details-body">
${block.blocks.map((b) => renderPostBlock(b, indent + '        ')).join('\n')}
${indent}    </div>
${indent}</details>`;
    default:
      return block.html.split('\n').map((l) => (l ? indent + l : l)).join('\n');
  }
}

function renderPostSection(section) {
  const inner = section.blocks.map((b) => renderPostBlock(b, '                    ')).join('\n');
  return `                <section class="post-section">
                    <h2>${section.heading}</h2>
${inner}
                </section>`;
}

function postPage(meta, flow) {
  // flow: array of {kind: 'section', ...} | hoisted figure/details blocks
  const flowHtml = flow.map((item) =>
    item.kind === 'section' ? renderPostSection(item) : renderPostBlock(item, '                ')
  ).join('\n\n');
  const titleLines = meta.title_lines.map((l) =>
    `                    <span class="post-title-line">${l}</span>`
  ).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&family=Source+Sans+3:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
    <script>
        (function () {
            var storageKey = 'site-theme';
            var theme = null;

            try {
                theme = localStorage.getItem(storageKey);
            } catch (error) {
                theme = null;
            }

            if (theme !== 'light' && theme !== 'dark') {
                theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
            }

            document.documentElement.setAttribute('data-theme', theme);
        })();
    </script>
    <link rel="stylesheet" href="style.css">
    <script>
        window.MathJax = {
            tex: {
                inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
                displayMath: [['\\\\[', '\\\\]'], ['$$', '$$']]
            },
            svg: {
                fontCache: 'global'
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
            }
        };
    </script>
    <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
</head>
<body>
    <button class="post-theme-toggle" type="button" aria-label="Switch to dark mode" aria-pressed="false" title="Switch to dark mode">
        <span class="post-theme-toggle-icon" aria-hidden="true">◐</span>
    </button>
    <main class="post-shell">
        <a class="post-back" href="../../index.html">Back to site</a>

        <article class="post-card">
            <header class="post-header">
                <p class="post-kicker">${meta.kicker}</p>
                <h1>
${titleLines}
                </h1>

                <div class="post-meta-grid">
                    <p><span>Writer</span> ${meta.writer}</p>
                    <p><span>Editor</span> ${meta.editor}</p>
                    <p><span>Date</span> ${meta.date}</p>
                </div>
            </header>

            <div class="post-flow">
${flowHtml}
            </div>
        </article>
    </main>

    <script src="main.js"></script>
</body>
</html>
`;
}

module.exports = {
  chromeTop,
  chromeBottom,
  renderBio,
  renderEducation,
  renderPublications,
  renderTeaching,
  renderProjects,
  renderMusic,
  renderBlog,
  postPage,
};
