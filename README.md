# IPTV INDIA Web Player v2

## Improvements
- Cached playlist for faster startup, followed by background refresh
- Chunked channel rendering to keep the UI responsive with large playlists
- Debounced search
- Dynamic category filters with channel counts
- Favorites and recently watched channels
- Automatic local persistence
- HLS/Video.js live playback
- Buffering/recovery handling
- Picture-in-Picture button
- Dark/light/system theme
- Lazy-loaded channel logos
- Responsive mobile layout
- PWA install support and shell caching

## Files
index.html
video.js
style.css
manifest.webmanifest
sw.js

## Run
Use a local web server (VS Code Live Server, Python http.server, or your hosting server).
Service workers/PWA features generally require HTTPS or localhost.

## Playlist
https://raw.githubusercontent.com/Ashok-Kumar-Yadaw/IPTV-INDIA/main/in.m3u

## Important
Browser playback depends on the individual stream. CORS, DRM, geo-blocking, expired links, codecs, or server-side limits can prevent a stream from playing. This player does not bypass those restrictions.
