# IPTV INDIA Premium v10.2 — GitHub Pages repair build

## IMPORTANT
Keep your existing `in.m3u` in the repository ROOT next to `index.html`:

IPTV-INDIA/
  index.html
  video.js
  style.css
  manifest.webmanifest
  in.m3u

This build intentionally does NOT use a service worker. That prevents an old cached JS file from making GitHub Pages appear broken.

## What was repaired
- Removed the hard dependency on Video.js at page startup.
- Playlist UI can load even when a player CDN is unavailable.
- Uses local `./in.m3u` first, then GitHub Raw as fallback.
- Validates the M3U response before parsing.
- Uses lazy HLS.js only when an HLS channel is actually opened.
- Added clearer loading/error messages.
- Removed stale service-worker caching.
- Batched channel rendering for large playlists.
- Search, categories, favorites, keyboard navigation and dark/light mode remain.

## GitHub Pages steps
1. Replace `index.html`, `video.js`, `style.css`, and `manifest.webmanifest` in the repository root.
2. Do NOT delete your existing `in.m3u`; it must be in the same root folder.
3. Commit changes to `main`.
4. Open the Pages URL and press Ctrl+F5.
5. If the old page still appears, open DevTools -> Application -> Storage -> Clear site data, then reload.

## If channels show but a stream does not play
That is usually a stream-side issue: HTTP mixed content, CORS, authentication, DRM, geo restriction, or provider availability. The web page cannot bypass those restrictions.
