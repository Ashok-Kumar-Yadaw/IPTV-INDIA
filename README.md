# IPTV INDIA Web Player v5

Major additions:
- EPG/XMLTV URL field and TV Guide-ready interface
- Playlist Cleaner with duplicate detection and clean M3U export
- Favorites and recent channels
- Settings backup/export and restore/import
- Grid/List view
- HLS quality selector where variants are exposed
- Smart reconnect attempts
- Cached playlist + background refresh
- Search/categories/language metadata filtering
- Dark/light mode and PWA
- Mobile navigation
- Playlist statistics

Default playlist:
https://raw.githubusercontent.com/Ashok-Kumar-Yadaw/IPTV-INDIA/main/in.m3u

Important:
Real programme schedules require a valid XMLTV/EPG feed. The app does not invent EPG data.
Browser-side health probing of arbitrary remote streams is limited by CORS, DRM, geo-blocking and server policies, so the Health screen does not falsely claim untested streams are online/offline.
Run through localhost/HTTPS for service worker/PWA features.
