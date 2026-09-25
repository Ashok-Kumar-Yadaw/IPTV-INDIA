# IPTV INDIA v11

This repair build is intentionally a single self-contained `index.html` (plus manifest). It has no Video.js or service-worker dependency.

## Required repository layout
`index.html`, `in.m3u`, and `manifest.webmanifest` must be in the repository root used by GitHub Pages.

## Playlist loading order
1. `./in.m3u`
2. GitHub Pages `./in.m3u`
3. GitHub Raw URL
4. GitHub API fallback

The page displays the exact load errors if none work.

If the page loads channels but an individual stream fails, the stream may use HTTP on an HTTPS page, CORS/authentication/DRM/geo restrictions, or may simply be unavailable.
