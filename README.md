# IPTV INDIA Web Player v3

Features:
- Modern dashboard-style IPTV UI
- Cached startup + background playlist refresh
- Dynamic categories and counts
- Search by channel/category/language
- Favorites + Recently watched
- A-Z sorting
- Auto reconnect attempt
- HLS/Video.js live playback
- PiP + Fullscreen
- Dark/Light mode
- PWA install + service-worker shell cache
- Settings panel: custom playlist URL, refresh interval, last-channel preference
- Mobile bottom navigation
- Chunked rendering and lazy logos for large playlists

Default playlist:
https://raw.githubusercontent.com/Ashok-Kumar-Yadaw/IPTV-INDIA/main/in.m3u

Use a web server (localhost/HTTPS) rather than file:// for PWA/service-worker features.
Browser playback cannot bypass CORS, DRM, geo-blocking, expired links, or incompatible codecs.