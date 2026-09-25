# IPTV INDIA Web Player v4

New:
- TV Guide shell and EPG-ready metadata view
- Channel Health dashboard (browser-safe status limitation explained)
- Playlist statistics
- HLS quality representation selector when exposed by the stream
- Smart player status/buffering/live indicators
- Cached playlist + background refresh
- Search, categories, favorites, recent, A-Z
- Responsive modern dashboard
- Dark/light mode
- PWA install + service worker
- Settings for custom playlist URL and refresh interval
- Mobile navigation

Default playlist:
https://raw.githubusercontent.com/Ashok-Kumar-Yadaw/IPTV-INDIA/main/in.m3u

Run via localhost/HTTPS for PWA/service-worker features.

Important:
A browser cannot reliably probe arbitrary remote streams because of CORS, DRM, geo-blocking and server restrictions. The Health screen therefore does not claim that untested streams are online/offline. Actual stream playback status comes from Video.js.

EPG:
To show real program schedules, an XMLTV/EPG source is required. The current build provides an EPG-ready UI but does not invent program data.