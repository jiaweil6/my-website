/**
 * Main JavaScript
 *
 * To customize this script for your own site, modify the CONFIG object below.
 * All selectors, thresholds, and timing values are centralized there.
 *
 * Modules:
 * 1. Theme Toggle - Persists light/dark mode preference
 * 2. Back to Top Button - Shows/hides a scroll-to-top button
 * 3. Publication Link Wrapping - Groups icons with their links for better wrapping
 * 4. Publication Description Truncation - Collapses long abstracts with expand/collapse
 * 5. Tag Filtering - Filters publications by category tags
 * 6. Menu Link Scroll - Aligns in-page navigation to section starts
 * 7. Menu Active State - Highlights the current section in the fixed header
 */

(function() {
    'use strict';

    // ==========================================================================
    // Configuration - Edit these values to customize behavior
    // ==========================================================================

    var CONFIG = {
        // Selectors
        selectors: {
            themeToggle: '.theme-toggle',
            backToTop: '.back-to-top',
            publicationLinks: '.publication-links',
            publicationDescription: '.publication-description',
            filterDropdown: '.filter-dropdown',
            filterToggle: '.filter-toggle',
            tagFilter: '.tag-filter',
            publicationRow: '#publications-section .publication-row',
            siteMenu: '.site-menu',
            siteMenuLink: '.site-menu-link[href^="#"]'
        },

        // Theme Toggle
        themeStorageKey: 'site-theme',
        prefersDarkQuery: '(prefers-color-scheme: dark)',

        // Back to Top
        scrollThreshold: 400,          // pixels scrolled before button appears

        // Menu Scroll
        menuScrollGapPx: 8,            // space between header and target section

        // Description Truncation
        maxLines: 3,                   // number of lines before truncating
        lineHeightBuffer: 1.05,        // multiplier for line height tolerance
        fallbackLineHeightRatio: 1.4,  // fallback line-height as ratio of font-size
        descriptionToggleDurationMs: 200, // expand/collapse animation duration

        // Resize Debouncing
        resizeDebounceMs: 50,          // debounce delay in milliseconds
        resizeThresholdPx: 20,         // minimum width change to trigger update

        // Toggle Labels
        labels: {
            themeDark: 'Switch to dark mode',
            themeLight: 'Switch to light mode',
            more: '[more]',
            less: '[less]',
            filterAll: '<i class="fas fa-filter"></i> Filter'
        }
    };

    // ==========================================================================
    // 1. Theme Toggle
    // Persists the chosen theme and updates the menu button state
    // ==========================================================================

    /**
     * Initializes the light/dark theme toggle in the fixed header.
     * Theme state is stored in localStorage and mirrored on <html data-theme>.
     */
    function initThemeToggle() {
        var toggle = document.querySelector(CONFIG.selectors.themeToggle);

        if (!toggle) return;

        var icon = toggle.querySelector('i');
        var mediaQuery = window.matchMedia ? window.matchMedia(CONFIG.prefersDarkQuery) : null;

        function getStoredTheme() {
            try {
                return localStorage.getItem(CONFIG.themeStorageKey);
            } catch (error) {
                return null;
            }
        }

        function setStoredTheme(theme) {
            try {
                localStorage.setItem(CONFIG.themeStorageKey, theme);
            } catch (error) {
                return;
            }
        }

        function getCurrentTheme() {
            return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        }

        function updateToggle(theme) {
            var isDark = theme === 'dark';
            toggle.setAttribute('aria-pressed', String(isDark));
            toggle.setAttribute('aria-label', isDark ? CONFIG.labels.themeLight : CONFIG.labels.themeDark);
            toggle.setAttribute('title', isDark ? CONFIG.labels.themeLight : CONFIG.labels.themeDark);

            if (icon) {
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        }

        function applyTheme(theme, persist) {
            document.documentElement.setAttribute('data-theme', theme);
            updateToggle(theme);

            if (persist) {
                setStoredTheme(theme);
            }
        }

        updateToggle(getCurrentTheme());

        toggle.addEventListener('click', function() {
            var nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme, true);
        });

        if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', function(event) {
                var storedTheme = getStoredTheme();
                if (storedTheme === 'light' || storedTheme === 'dark') {
                    return;
                }

                applyTheme(event.matches ? 'dark' : 'light', false);
            });
        }
    }

    // ==========================================================================
    // 2. Back to Top Button
    // Shows a scroll-to-top button when user scrolls past threshold
    // ==========================================================================

    /**
     * Initializes the back-to-top button functionality.
     * Button appears after scrolling past CONFIG.scrollThreshold pixels.
     */
    function initBackToTop() {
        var button = document.querySelector(CONFIG.selectors.backToTop);
        if (!button) return;

        window.addEventListener('scroll', function() {
            button.classList.toggle('visible', window.scrollY > CONFIG.scrollThreshold);
        });

        button.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==========================================================================
    // 3. Publication Link Wrapping
    // Groups FontAwesome icons with their adjacent links for better line wrapping
    // ==========================================================================

    /**
     * Wraps icon + link pairs in span elements to prevent awkward line breaks.
     * Finds all icons in publication-links containers and groups them with
     * their following anchor element.
     */
    function initLinkWrapping() {
        document.querySelectorAll(CONFIG.selectors.publicationLinks).forEach(function(container) {
            container.querySelectorAll('i').forEach(function(icon) {
                var link = icon.nextElementSibling;
                if (link && link.tagName === 'A') {
                    var wrapper = document.createElement('span');
                    wrapper.className = 'link-item';
                    icon.parentNode.insertBefore(wrapper, icon);
                    wrapper.appendChild(icon);
                    wrapper.appendChild(link);
                }
            });
        });
    }

    // ==========================================================================
    // 4. Publication Description Truncation
    // Collapses long publication abstracts to N lines with expand/collapse toggle
    // ==========================================================================

    /**
     * Initializes description truncation for publication abstracts.
     * Uses binary search to find optimal truncation point that fits within
     * the configured number of lines. Responsive to window resize.
     */
    function initDescriptionTruncation() {
        var wrapperData = [];

        // Set up wrapper elements for each description
        document.querySelectorAll(CONFIG.selectors.publicationDescription).forEach(function(desc) {
            var fullHtml = desc.innerHTML.trim();
            var wrapper = document.createElement('div');
            wrapper.className = 'publication-description-wrapper';
            desc.parentNode.insertBefore(wrapper, desc);

            var textEl = document.createElement('div');
            textEl.className = 'publication-description-text';
            wrapper.appendChild(textEl);

            // Hidden element used for measuring text height
            var measureEl = document.createElement('div');
            measureEl.className = 'publication-description-text publication-measure';
            wrapper.appendChild(measureEl);

            desc.remove();

            var normalizedTemplate = createNormalizedTemplate(fullHtml);
            var normalizedText = normalizedTemplate.content.textContent.trim();

            wrapperData.push({
                wrapper: wrapper,
                textEl: textEl,
                measureEl: measureEl,
                fullHtml: fullHtml,
                normalizedTemplate: normalizedTemplate,
                fullText: normalizedText,
                isExpanded: false,
                needsTruncation: false,
                truncatedCharCount: 0
            });
        });

        /**
         * Gets the computed line height of an element.
         * @param {HTMLElement} element - Element to measure
         * @returns {number} Line height in pixels
         */
        function getLineHeight(element) {
            var computedStyle = window.getComputedStyle(element);
            var lineHeight = parseFloat(computedStyle.lineHeight);
            if (isNaN(lineHeight)) {
                lineHeight = parseFloat(computedStyle.fontSize) * CONFIG.fallbackLineHeightRatio;
            }
            return lineHeight;
        }

        /**
         * Measures the rendered height of text in a hidden element.
         * @param {HTMLElement} measureEl - Hidden element for measurement
         * @param {string} text - Text to measure
         * @param {number} width - Container width in pixels
         * @returns {number} Height in pixels
         */
        function measureHeight(measureEl, fragment, suffixText, width) {
            measureEl.style.width = width + 'px';
            measureEl.innerHTML = '';
            measureEl.appendChild(fragment);
            if (suffixText) {
                measureEl.appendChild(document.createTextNode(suffixText));
            }
            return measureEl.scrollHeight;
        }

        /**
         * Uses binary search to find the maximum number of words that fit
         * within the height constraint. O(log n) complexity.
         * @param {HTMLElement} measureEl - Hidden element for measurement
         * @param {string} fullText - Complete text to truncate
         * @param {number} width - Container width in pixels
         * @param {number} maxHeight - Maximum allowed height in pixels
         * @param {HTMLTemplateElement} normalizedTemplate - Template with normalized HTML
         * @returns {number} Truncated character count without suffix
         */
        function findTruncationPoint(measureEl, fullText, width, maxHeight, normalizedTemplate) {
            var suffix = '... ' + CONFIG.labels.more;
            var words = fullText.split(/\s+/);
            var low = 1;
            var high = words.length;
            var bestFit = 1;

            while (low <= high) {
                var mid = Math.floor((low + high) / 2);
                var testText = words.slice(0, mid).join(' ');
                var fragment = getTruncatedFragment(normalizedTemplate.content.cloneNode(true), testText.length);
                var height = measureHeight(measureEl, fragment, suffix, width);

                if (height <= maxHeight) {
                    bestFit = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }

            return words.slice(0, bestFit).join(' ').length;
        }

        /**
         * Normalizes whitespace in a fragment so text measurements match rendering.
         * @param {DocumentFragment} fragment - Fragment to normalize
         */
        function normalizeWhitespace(fragment) {
            var walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, null);
            var node;
            var prevEndsWithSpace = false;
            while ((node = walker.nextNode())) {
                var text = node.nodeValue.replace(/\s+/g, ' ');
                if (prevEndsWithSpace) {
                    text = text.replace(/^ /, '');
                }
                node.nodeValue = text;
                prevEndsWithSpace = text.length > 0 && text[text.length - 1] === ' ';
            }
        }

        /**
         * Creates a template element with normalized HTML.
         * @param {string} html - HTML string to normalize
         * @returns {HTMLTemplateElement} Template element
         */
        function createNormalizedTemplate(html) {
            var template = document.createElement('template');
            template.innerHTML = html;
            normalizeWhitespace(template.content);
            return template;
        }

        /**
         * Returns a fragment truncated to a character count.
         * @param {DocumentFragment} fragment - Fragment to truncate
         * @param {number} maxChars - Max character count
         * @returns {DocumentFragment} Truncated fragment
         */
        function getTruncatedFragment(fragment, maxChars) {
            if (maxChars <= 0) {
                return document.createDocumentFragment();
            }

            var range = document.createRange();
            range.setStart(fragment, 0);

            var walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, null);
            var node;
            var remaining = maxChars;

            while ((node = walker.nextNode())) {
                var length = node.nodeValue.length;
                if (remaining <= length) {
                    range.setEnd(node, remaining);
                    return range.cloneContents();
                }
                remaining -= length;
            }

            return fragment.cloneNode(true);
        }

        /**
         * Clears inline animation styles from an element.
         * @param {HTMLElement} element - Element to reset
         */
        function resetAnimationStyles(element) {
            element.style.transition = '';
            element.style.height = '';
            element.style.overflow = '';
        }

        /**
         * Renders content with optional height/opacity animation.
         * @param {Object} data - Wrapper data object
         * @param {Function} renderFn - Function that updates textEl content
         * @param {boolean} animate - Whether to animate the change
         */
        function renderWithAnimation(data, renderFn, animate) {
            var textEl = data.textEl;
            resetAnimationStyles(textEl);

            if (!animate) {
                renderFn();
                return;
            }

            var startHeight = textEl.getBoundingClientRect().height;
            textEl.style.overflow = 'hidden';
            textEl.style.height = startHeight + 'px';

            renderFn();

            var width = textEl.offsetWidth;
            if (width === 0) {
                resetAnimationStyles(textEl);
                return;
            }

            data.measureEl.style.width = width + 'px';
            data.measureEl.innerHTML = textEl.innerHTML;
            var endHeight = data.measureEl.scrollHeight;
            if (startHeight === endHeight) {
                resetAnimationStyles(textEl);
                return;
            }

            textEl.offsetHeight;
            textEl.style.transition = 'height ' + CONFIG.descriptionToggleDurationMs + 'ms ease';
            textEl.style.height = endHeight + 'px';

            textEl.addEventListener('transitionend', function(event) {
                if (event.propertyName === 'height') {
                    resetAnimationStyles(textEl);
                }
            }, { once: true });
        }

        /**
         * Creates an accessible toggle element (span acting as button).
         * @param {string} text - Toggle label text
         * @param {Function} onClick - Click handler
         * @returns {HTMLSpanElement} Toggle element
         */
        function createToggle(text, onClick) {
            var toggle = document.createElement('span');
            toggle.className = 'abstract-toggle';
            toggle.textContent = text;
            toggle.tabIndex = 0;
            toggle.setAttribute('role', 'button');
            toggle.addEventListener('click', onClick);
            toggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            });
            return toggle;
        }

        /**
         * Renders a description in collapsed state with [more] toggle.
         * @param {Object} data - Wrapper data object
         */
        function renderCollapsed(data, animate) {
            renderWithAnimation(data, function() {
                var textEl = data.textEl;
                textEl.innerHTML = '';
                textEl.appendChild(getTruncatedFragment(data.normalizedTemplate.content.cloneNode(true), data.truncatedCharCount));
                textEl.appendChild(document.createTextNode('... '));
                textEl.appendChild(createToggle(CONFIG.labels.more, function() {
                    data.isExpanded = true;
                    renderExpanded(data, true);
                }));
            }, animate);
        }

        /**
         * Renders a description in expanded state with [less] toggle.
         * @param {Object} data - Wrapper data object
         */
        function renderExpanded(data, animate) {
            renderWithAnimation(data, function() {
                var textEl = data.textEl;
                textEl.innerHTML = '';
                textEl.innerHTML = data.fullHtml;
                textEl.appendChild(document.createTextNode(' '));
                textEl.appendChild(createToggle(CONFIG.labels.less, function() {
                    data.isExpanded = false;
                    renderCollapsed(data, true);
                }));
            }, animate);
        }

        /**
         * Renders a description that doesn't need truncation.
         * @param {Object} data - Wrapper data object
         */
        function renderNoTruncation(data) {
            resetAnimationStyles(data.textEl);
            data.textEl.innerHTML = data.fullHtml;
        }

        /**
         * Recalculates truncation for all descriptions.
         * Called on initial load and window resize.
         */
        function updateAllDescriptions() {
            wrapperData.forEach(function(data) {
                var textEl = data.textEl;
                var measureEl = data.measureEl;
                var width = textEl.offsetWidth;

                if (width === 0) return;

                var lineHeight = getLineHeight(textEl);
                var maxHeight = lineHeight * CONFIG.maxLines * CONFIG.lineHeightBuffer;
                var fullHeight = measureHeight(
                    measureEl,
                    data.normalizedTemplate.content.cloneNode(true),
                    '',
                    width
                );

                if (fullHeight <= maxHeight) {
                    data.needsTruncation = false;
                    renderNoTruncation(data);
                } else {
                    data.needsTruncation = true;
                    data.truncatedCharCount = findTruncationPoint(
                        measureEl,
                        data.fullText,
                        width,
                        maxHeight,
                        data.normalizedTemplate
                    );

                    if (data.isExpanded) {
                        renderExpanded(data, false);
                    } else {
                        renderCollapsed(data, false);
                    }
                }
            });
        }

        // Initial update after layout (double rAF ensures styles are applied)
        requestAnimationFrame(function() {
            requestAnimationFrame(updateAllDescriptions);
        });

        // Re-check on resize with debouncing
        var resizeTimeout;
        var lastWidth = window.innerWidth;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (Math.abs(window.innerWidth - lastWidth) > CONFIG.resizeThresholdPx) {
                    lastWidth = window.innerWidth;
                    updateAllDescriptions();
                }
            }, CONFIG.resizeDebounceMs);
        });
    }

    // ==========================================================================
    // 5. Tag Filtering
    // Filters publications by category using data-tag attributes
    // ==========================================================================

    /**
     * Initializes the publication tag filtering system.
     * Reads data-tag attributes from filter buttons and publication tags.
     * Toggles visibility of publications based on selected filter.
     */
    function initTagFiltering() {
        var filterDropdown = document.querySelector(CONFIG.selectors.filterDropdown);
        var filterToggle = document.querySelector(CONFIG.selectors.filterToggle);

        if (!filterDropdown || !filterToggle) return;

        filterToggle.addEventListener('click', function() {
            filterDropdown.classList.toggle('open');
        });

        /**
         * Filters publications to show only those with the selected tag.
         * @param {string} selectedTag - Tag to filter by, or 'all' for no filter
         */
        function filterByTag(selectedTag) {
            // Update active state on dropdown filters
            document.querySelectorAll(CONFIG.selectors.tagFilter).forEach(function(f) {
                f.classList.toggle('active',
                    f.dataset.tag === selectedTag || (selectedTag === 'all' && f.dataset.tag === 'all'));
            });

            // Update toggle text to show active filter
            filterToggle.innerHTML = selectedTag === 'all'
                ? CONFIG.labels.filterAll
                : '<i class="fas fa-filter"></i> ' + selectedTag;

            // Filter publications (only in publications section, not personal projects)
            var allRows = document.querySelectorAll(CONFIG.selectors.publicationRow);
            allRows.forEach(function(row) {
                row.classList.remove('last-visible');

                if (selectedTag === 'all') {
                    row.classList.remove('filtered-out');
                } else {
                    var tags = row.querySelectorAll('.icon-tags .tag');
                    var hasTag = Array.from(tags).some(function(tag) {
                        return tag.textContent.trim() === selectedTag;
                    });
                    row.classList.toggle('filtered-out', !hasTag);
                }
            });

            // Mark last visible row (for border styling)
            var visibleRows = document.querySelectorAll(CONFIG.selectors.publicationRow + ':not(.filtered-out)');
            if (visibleRows.length > 0) {
                visibleRows[visibleRows.length - 1].classList.add('last-visible');
            }

            // Close dropdown after selection
            filterDropdown.classList.remove('open');
        }

        // Dropdown filter clicks
        document.querySelectorAll(CONFIG.selectors.tagFilter).forEach(function(filter) {
            filter.addEventListener('click', function() {
                filterByTag(this.dataset.tag);
            });
        });
    }

    // ==========================================================================
    // 6. Menu Link Scroll
    // Aligns anchor navigation so the selected section starts cleanly below the header
    // ==========================================================================

    /**
     * Initializes smooth scrolling for top-menu links with a measured header offset.
     * Prevents previous-section bleed caused by default anchor alignment.
     */
    function initMenuLinkScroll() {
        var menu = document.querySelector(CONFIG.selectors.siteMenu);
        var links = Array.prototype.slice.call(document.querySelectorAll(CONFIG.selectors.siteMenuLink));

        if (!menu || links.length === 0) return;

        function getTargetTop(section) {
            if (section.id === 'about-section') {
                return 0;
            }

            var menuHeight = menu.getBoundingClientRect().height;
            var sectionTop = section.getBoundingClientRect().top + window.scrollY;
            return Math.max(0, Math.round(sectionTop - menuHeight - CONFIG.menuScrollGapPx));
        }

        function scrollToSection(section) {
            var prefersReducedMotion = window.matchMedia
                && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            window.scrollTo({
                top: getTargetTop(section),
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        }

        links.forEach(function(link) {
            link.addEventListener('click', function(event) {
                var href = link.getAttribute('href');
                var section = href ? document.querySelector(href) : null;

                if (!section) return;

                event.preventDefault();
                scrollToSection(section);

                if (window.history && typeof window.history.pushState === 'function') {
                    window.history.pushState(null, '', href);
                } else {
                    window.location.hash = href;
                }
            });
        });
    }

    // ==========================================================================
    // 7. Menu Active State
    // Highlights the active section link in the fixed header
    // ==========================================================================

    /**
     * Initializes active-state tracking for in-page menu links.
     * Uses section offsets so the current link remains active between sections.
     */
    function initMenuActiveState() {
        var menu = document.querySelector(CONFIG.selectors.siteMenu);
        var links = Array.prototype.slice.call(document.querySelectorAll(CONFIG.selectors.siteMenuLink));

        if (!menu || links.length === 0) return;

        var linkMap = links.map(function(link) {
            var href = link.getAttribute('href');
            var section = href ? document.querySelector(href) : null;
            return section ? { link: link, section: section } : null;
        }).filter(Boolean);

        if (linkMap.length === 0) return;

        function updateActiveLink() {
            var currentId = linkMap[0].section.id;
            var threshold = window.scrollY + menu.offsetHeight + 24;

            linkMap.forEach(function(item) {
                if (item.section.offsetTop <= threshold) {
                    currentId = item.section.id;
                }
            });

            // A short last section can never reach the threshold; activate it at page bottom
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                currentId = linkMap[linkMap.length - 1].section.id;
            }

            linkMap.forEach(function(item) {
                item.link.classList.toggle('is-active', item.section.id === currentId);
            });
        }

        updateActiveLink();
        window.addEventListener('scroll', updateActiveLink, { passive: true });
        window.addEventListener('resize', updateActiveLink);
    }

    // ==========================================================================
    // Initialize all modules
    // ==========================================================================

    initThemeToggle();
    initBackToTop();
    initLinkWrapping();
    initDescriptionTruncation();
    initTagFiltering();
    initMenuLinkScroll();
    initMenuActiveState();

})();
