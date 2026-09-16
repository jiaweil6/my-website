// site-chrome.js — blog pages share the main site's look but wear their
// own minimal masthead.
//
// Two jobs:
//  1. Theme sync. The root site (js/main.js) stores 'light'|'dark' under
//     localStorage "site-theme" and sets html[data-theme]; the book theme
//     (pydata) keeps its own "mode" key and stamps data-theme/data-mode.
//     Adopt the site's choice on load; every toggle writes both keys so
//     the reader never sees a mismatch crossing between site and blog.
//  2. Blog masthead. Inject a pared-down version of the site's fixed top
//     bar — accent-colored "David's Blog" brand plus a single About link
//     back to the main site — and the floating theme toggle. The Sphinx
//     header and sidebar are hidden by custom.css — this replaces them.
//     The brand/menu carry view-transition-names (custom.css) that pair
//     with the home page's, so crossing over morphs the ink-colored
//     "Jiawei Liu" into the accent-colored "David's Blog".
(function () {
  "use strict";
  var SITE_KEY = "site-theme"; // must match CONFIG.themeStorageKey in js/main.js

  function get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function apply(mode) {
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.theme = mode;
    try { localStorage.setItem("mode", mode); } catch (e) {}
    try { localStorage.setItem(SITE_KEY, mode); } catch (e) {}
    updateToggle(mode);
  }

  function current() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  // Adopt the site's stored choice before the first paint settles.
  var site = get(SITE_KEY);
  if (site === "light" || site === "dark") {
    document.documentElement.dataset.mode = site;
    document.documentElement.dataset.theme = site;
    try { localStorage.setItem("mode", site); } catch (e) {}
  }

  // The book root, derived from this script's own src (same trick as
  // live-cells.js); the home page sits two levels above blog/audio/.
  var me = document.currentScript || document.querySelector('script[src*="site-chrome.js"]');
  var prefix = me ? me.getAttribute("src").replace(/_static\/site-chrome\.js.*$/, "") : "";
  var root = prefix ? prefix.replace(/\/$/, "") : ".";
  var home = root + "/../../index.html";

  // Inline stand-ins for the site's Font Awesome moon/sun (FA isn't loaded
  // here; same silhouettes).
  var MOON =
    '<svg viewBox="0 0 384 512" width="15" height="15" fill="currentColor" aria-hidden="true">' +
    '<path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>';
  var SUN =
    '<svg viewBox="0 0 512 512" width="15" height="15" fill="currentColor" aria-hidden="true">' +
    '<path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/></svg>';

  var toggleBtn = null;
  function updateToggle(mode) {
    if (!toggleBtn) return;
    var isDark = mode === "dark";
    toggleBtn.innerHTML = isDark ? SUN : MOON;
    toggleBtn.setAttribute("aria-pressed", String(isDark));
    var label = isDark ? "Switch to light mode" : "Switch to dark mode";
    toggleBtn.setAttribute("aria-label", label);
    toggleBtn.setAttribute("title", label);
  }

  function buildChrome() {
    var nav = document.createElement("nav");
    nav.className = "site-menu";
    nav.setAttribute("aria-label", "Primary");
    nav.innerHTML =
      '<div class="site-menu-shell">' +
      '<a class="site-menu-brand" href="' + root + '/index.html">David’s Blog</a>' +
      '<div class="site-menu-inner">' +
      '<a class="site-menu-link" href="' + home + '#about-section">About</a>' +
      "</div></div>";

    toggleBtn = document.createElement("button");
    toggleBtn.className = "theme-toggle";
    toggleBtn.type = "button";
    toggleBtn.addEventListener("click", function () {
      apply(current() === "dark" ? "light" : "dark");
    });
    updateToggle(current());

    document.body.prepend(nav);
    document.body.appendChild(toggleBtn);
  }

  // Mount as soon as <body> exists rather than at DOMContentLoaded: these
  // pages are long (baked cell outputs), and the cross-document view
  // transition snapshots the first render — the masthead must be in it.
  // The rAF poll catches the first render; the DOMContentLoaded fallback
  // covers tabs that aren't rendering yet (rAF is suspended in background
  // tabs, so the poll alone can starve).
  var mounted = false;
  function tryMount() {
    if (mounted || !document.body) return;
    mounted = true;
    buildChrome();
  }
  (function poll() {
    tryMount();
    if (!mounted && window.requestAnimationFrame) requestAnimationFrame(poll);
  })();
  if (document.readyState !== "loading") tryMount();
  else document.addEventListener("DOMContentLoaded", tryMount);
})();
