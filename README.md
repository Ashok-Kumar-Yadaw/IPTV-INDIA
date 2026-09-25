# IPTV INDIA Web Player

Files:
- index.html   -> main webpage
- video.js     -> playlist parsing, filters, player and theme logic
- style.css    -> responsive UI and dark/light mode

The page loads:
https://raw.githubusercontent.com/Ashok-Kumar-Yadaw/IPTV-INDIA/main/in.m3u

Features:
- M3U playlist loading
- Category filters (News, Movies, Music, Sports, Kids, Devotional, Entertainment + playlist group titles)
- Search
- Dark/light mode saved in localStorage
- Responsive channel cards
- Video.js HLS/live playback
- Refresh playlist button

Run:
1. Extract the ZIP.
2. Serve the folder through a web server (recommended), e.g. VS Code Live Server.
3. Open index.html through that server.

Important:
Playback depends on each stream being legally accessible, online, and compatible with browser playback. Some streams may be blocked by CORS or DRM restrictions.
