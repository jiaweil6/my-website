(function() {
    'use strict';

    var THEME_STORAGE_KEY = 'site-theme';
    var THEME_TOGGLE_SELECTOR = '.post-theme-toggle';

    function initThemeToggle() {
        var toggle = document.querySelector(THEME_TOGGLE_SELECTOR);
        var icon = toggle ? toggle.querySelector('.post-theme-toggle-icon') : null;

        if (!toggle) return;

        function getTheme() {
            return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        }

        function setStoredTheme(theme) {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, theme);
            } catch (error) {
                return;
            }
        }

        function updateToggle(theme) {
            var isDark = theme === 'dark';
            var label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
            toggle.setAttribute('aria-pressed', String(isDark));
            toggle.setAttribute('aria-label', label);
            toggle.setAttribute('title', label);
            if (icon) {
                icon.textContent = isDark ? '☀' : '☾';
            }
        }

        updateToggle(getTheme());

        toggle.addEventListener('click', function() {
            var nextTheme = getTheme() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', nextTheme);
            setStoredTheme(nextTheme);
            updateToggle(nextTheme);
        });
    }

    function renderMathMarkup() {
        var mathNodes = [];

        document.querySelectorAll('[data-latex]').forEach(function(node) {
            var latex = node.getAttribute('data-latex');
            var isInline = node.classList.contains('math-inline');
            node.textContent = (isInline ? '\\(' : '\\[') + latex + (isInline ? '\\)' : '\\]');
            mathNodes.push(node);
        });

        if (window.MathJax && window.MathJax.typesetPromise) {
            return window.MathJax.typesetPromise(mathNodes);
        }

        return Promise.resolve();
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.documentElement.classList.add('blog-post-ready');
        initThemeToggle();
        renderMathMarkup();
    });
})();
