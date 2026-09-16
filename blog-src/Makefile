# Build pipeline for the David Audio blog subsite (blog/audio/ on the site).
# Adapted from CMU 15-322 icmbook: Jupyter Book 1.x + the TeachBooks
# sphinx-thebe fork + thebe-lite, with Pyodide loaded from the jsDelivr CDN
# instead of vendored (see _static/live-cells.js).
#
# Usage (with blog-src/.venv active or its bin/ on PATH):
#   make book      — build to _build/html
#   make publish   — build + rsync into ../blog/audio/ (the committed output)
#   make serve     — serve the whole site repo at http://localhost:8000
.PHONY: all book wheels vendor-thebe check-thebe-fork publish serve clean spotless

all: book

# Fetch the pinned thebe runtime bundles for the live-code layer. Self-hosted
# because the kernel web worker must be same-origin. This stack embeds
# pyodide_kernel 0.4.7, which caps the runtime at Pyodide 0.27.x (the pin
# lives in _static/live-cells.js; stubs/soundfile_stub fills the gap).
# Cached and gitignored; `rm -rf vendor/thebe-dist` to force a re-fetch.
# IMPORTANT: lives under vendor/ (html_extra_path), NOT _static/ — Jupyter
# Book registers every _static .js as a page script, which would eagerly
# execute the bundle's worker-only chunks and ship ~4 MB on every page. The
# service worker must sit at the subsite root to get the right scope.
THEBE_DIST := vendor/thebe-dist
vendor-thebe:
	@if [ ! -f $(THEBE_DIST)/.ok ]; then \
		echo "Fetching thebe-lite 0.5.0 + thebe 0.9.3 bundles..."; \
		rm -rf $(THEBE_DIST); mkdir -p $(THEBE_DIST)/tmp1 $(THEBE_DIST)/tmp2; \
		curl -sL https://registry.npmjs.org/thebe-lite/-/thebe-lite-0.5.0.tgz | tar xz -C $(THEBE_DIST)/tmp1; \
		curl -sL https://registry.npmjs.org/thebe/-/thebe-0.9.3.tgz | tar xz -C $(THEBE_DIST)/tmp2; \
		mv $(THEBE_DIST)/tmp1/package/dist/lib $(THEBE_DIST)/lite; \
		mv $(THEBE_DIST)/tmp2/package/lib $(THEBE_DIST)/core; \
		rm -rf $(THEBE_DIST)/tmp1 $(THEBE_DIST)/tmp2 $(THEBE_DIST)/lite/*.map $(THEBE_DIST)/core/*.map; \
		cp $(THEBE_DIST)/lite/service-worker.js vendor/service-worker.js; \
		touch $(THEBE_DIST)/.ok; \
	fi

# Build the wheels the in-browser kernel installs: the browser stubs (which
# must install BEFORE pyquist so micropip treats sounddevice/soundfile as
# satisfied) and pyquist itself. Output is gitignored and rebuilt on every
# `make book`.
# NOT from PyPI: the 0.1.0 release there still depends on resampy (which
# needs numba — no WASM wheel, so micropip dies). This pin has the soxr dep
# and the browseraudio recording path; keep it in sync with requirements.txt.
PYQUIST_PIN := git+https://github.com/gclef-cmu/pyquist@4193e0651175f258846fa58751ca332e56f90f15
wheels:
	rm -rf _static/wheels
	python3 -m pip wheel --no-deps -q -w _static/wheels ./stubs/sounddevice_stub
	python3 -m pip wheel --no-deps -q -w _static/wheels ./stubs/soundfile_stub
	python3 -m pip wheel --no-deps -q -w _static/wheels "pyquist @ $(PYQUIST_PIN)"
	@# Install-order manifest for live-cells.js: stubs first.
	python3 -c "import glob, json, os; \
		ws = sorted(os.path.basename(p) for p in glob.glob('_static/wheels/*.whl')); \
		ws.sort(key=lambda w: 0 if w.startswith(('sounddevice', 'soundfile')) else 1); \
		open('_static/wheels/manifest.json', 'w').write(json.dumps(ws))"

# The live-code page glue needs the TeachBooks sphinx-thebe FORK, but
# upstream ships the same dist name AND version, so a fresh env silently
# keeps upstream — the build succeeds and the deployed pages break in the
# browser. Detect the fork by a file only it ships and fail loudly.
check-thebe-fork:
	@python3 -c "import pathlib, sphinx_thebe; \
		raise SystemExit(0 if (pathlib.Path(sphinx_thebe.__file__).parent \
		/ '_static' / 'sphinx-thebe-lite.js').exists() else 1)" || { \
		echo "ERROR: upstream sphinx-thebe is installed; the blog needs the TeachBooks fork:"; \
		echo "  pip install --force-reinstall --no-deps 'sphinx-thebe @ git+https://github.com/TeachBooks/Sphinx-Thebe@1f3a80969622b7d63f48f05d8769f5cb933202a0'"; \
		exit 1; }

book: check-thebe-fork wheels vendor-thebe
	PIP_DISABLE_PIP_VERSION_CHECK=1 jupyter-book build ./
	@# Sphinx doesn't track files referenced by the {audio} directive's raw
	@# HTML, so copy the post assets into the build output ourselves.
	@if [ -d posts/assets ]; then \
		mkdir -p _build/html/posts; \
		cp -R posts/assets _build/html/posts/; \
	fi
	@# Incremental builds with no outdated docs skip Sphinx's static-files
	@# phase, leaving stale CSS/JS in the output — refresh them explicitly.
	@cp -R _static/. _build/html/_static/

# The committed build output the site serves (GitHub Pages, deploy-from-branch).
# Source maps (~12 MB, devtools-only) stay out of the committed tree.
publish: book
	rsync -a --delete --exclude='*.map' _build/html/ ../blog/audio/

serve:
	python3 -m http.server 8000 --directory ..

clean:
	jupyter-book clean ./

spotless:
	jupyter-book clean ./ --all
