# IPTV INDIA Web Player v6

New in v6:
- Multiple M3U playlist sources
- Source switcher and add-playlist UI
- Channel-number search
- EPG/XMLTV URL configuration shell
- Reminder/notification UI
- Playlist Cleaner + clean M3U export
- Favorites, recent channels and local playback analytics
- Backup/restore for sources, favorites, history and EPG setting
- HLS quality selector when variants are exposed
- Smart reconnect and buffering indicators
- Cached playlists with background refresh
- Grid/List view, dark/light mode, PWA install
- Mobile navigation

Default playlist:
https://raw.githubusercontent.com/Ashok-Kumar-Yadaw/IPTV-INDIA/main/in.m3u

Limitations:
- Real EPG programme data requires a valid XMLTV source and browser/server CORS access.
- Browser-side arbitrary stream health checks can be blocked by CORS, DRM, geo restrictions or provider policies.
- This project does not bypass DRM, geo-blocking, authentication or provider restrictions.
- Run through localhost/HTTPS for service worker/PWA behavior.
