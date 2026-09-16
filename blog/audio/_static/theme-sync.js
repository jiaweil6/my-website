// theme-sync.js — one light/dark preference across the whole site.
//
// The root site (js/main.js) stores 'light'|'dark' under localStorage
// "site-theme" and sets html[data-theme]. The book theme (pydata) keeps its
// own preference under "mode" and stamps data-theme/data-mode itself. This
// bridges the two: on load the book adopts the site's choice, and flipping
// the book's toggle writes back so the root site follows.
//
// The book's toggle normally cycles light → dark → auto; "auto" has no
// site-side equivalent (and its glyph is hidden in custom.css), so a click
// that lands on auto is bounced straight to the next concrete theme.
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
  }

  // Adopt the site's stored choice (if any) before the first paint settles.
  var site = get(SITE_KEY);
  if (site === "light" || site === "dark") apply(site);

  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest && e.target.closest(".theme-switch-button");
    if (!btn) return;
    // Let the theme's own handler run first, then reconcile.
    requestAnimationFrame(function () {
      var mode = document.documentElement.dataset.mode;
      if (mode === "auto") {
        // Skip auto: continue the cycle to the concrete theme after it.
        apply(get(SITE_KEY) === "dark" ? "light" : "dark");
      } else if (mode === "light" || mode === "dark") {
        apply(mode);
      }
    });
  });
})();
