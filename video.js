const PLAYLIST_URL="https://raw.githubusercontent.com/Ashok-Kumar-Yadaw/IPTV-INDIA/main/in.m3u";
const CACHE_KEY="iptv-india-playlist-v2", FAV_KEY="iptv-india-favorites-v2", RECENT_KEY="iptv-india-recent-v2", THEME_KEY="iptv-india-theme-v2";
const state={channels:[],category:"All",query:"",favoritesOnly:false,recentOnly:false};

const $=id=>document.getElementById(id);
const player=videojs("player",{controls:true,responsive:true,fluid:true,liveui:true,preload:"metadata",html5:{vhs:{overrideNative:true,enableLowInitialPlaylist:true,limitRenditionByPlayerDimensions:true}}});

const getJSON=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let favorites=new Set(getJSON(FAV_KEY,[]));
let recent=getJSON(RECENT_KEY,[]);

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function attrs(line){const o={};let m,re=/([A-Za-z0-9_-]+)="([^"]*)"/g;while((m=re.exec(line)))o[m[1]]=m[2];return o;}
function parseM3U(text){
 const lines=text.replace(/\r/g,"").split("\n"), out=[];
 for(let i=0;i<lines.length;i++){
  const l=lines[i].trim(); if(!l.startsWith("#EXTINF"))continue;
  const a=attrs(l), comma=l.indexOf(","), name=(comma>=0?l.slice(comma+1).trim():a["tvg-name"])||"Unknown Channel";
  let url=""; for(let j=i+1;j<lines.length;j++){const n=lines[j].trim();if(!n||n.startsWith("#"))continue;url=n;i=j;break;}
  if(url)out.push({name,group:a["group-title"]||"Other",logo:a["tvg-logo"]||"",url,id:a["tvg-id"]||""});
 } return out;
}
function cat(c){const s=(c.group+" "+c.name).toLowerCase();
 if(/news|न्यूज़|समाचार/.test(s))return"News"; if(/movie|film|cinema|मूवी|फिल्म/.test(s))return"Movies";
 if(/music|म्यूजिक|संगीत/.test(s))return"Music"; if(/sport|खेल/.test(s))return"Sports";
 if(/kids|cartoon|बच्च/.test(s))return"Kids"; if(/bhakti|devotional|spiritual|भक्ति|धार्मिक/.test(s))return"Devotional";
 if(/entertainment|मनोरंजन/.test(s))return"Entertainment"; return c.group||"Other";
}
function renderCats(){
 const counts={};state.channels.forEach(c=>counts[cat(c)]=(counts[cat(c)]||0)+1);
 const all=["All",...Object.keys(counts).sort((a,b)=>a.localeCompare(b))];
 $("categories").innerHTML=all.map(x=>`<button class="cat ${x===state.category?"active":""}" data-cat="${esc(x)}">${esc(x)}${x!=="All"?` (${counts[x]})`:""}</button>`).join("");
 $("categories").querySelectorAll(".cat").forEach(b=>b.onclick=()=>{state.category=b.dataset.cat;renderCats();render();});
}
function visible(){
 const q=state.query.toLowerCase().trim();
 return state.channels.filter(c=>{
  const id=state.channels.indexOf(c), okCat=state.category==="All"||cat(c)===state.category;
  const okQ=!q||(c.name+" "+c.group).toLowerCase().includes(q);
  const okF=!state.favoritesOnly||favorites.has(c.id||c.url);
  const okR=!state.recentOnly||recent.includes(c.url);
  return okCat&&okQ&&okF&&okR;
 });
}
function render(){
 const list=visible();$("count").textContent=`${list.length} / ${state.channels.length} channels`;
 if(!list.length){$("grid").innerHTML='<div class="empty">कोई channel नहीं मिला।</div>';return;}
 // Chunk rendering prevents a huge synchronous DOM update.
 $("grid").innerHTML="";
 let i=0; const draw=()=>{const frag=document.createDocumentFragment();const end=Math.min(i+80,list.length);
  for(;i<end;i++){const c=list[i],key=c.id||c.url,card=document.createElement("article");card.className="card";
   card.innerHTML=`<div class="card-top"><img class="logo" loading="lazy" src="${esc(c.logo)}" alt="" onerror="this.removeAttribute('src');this.alt='📺'"><div class="name">${esc(c.name)}</div><button class="star" aria-label="Favorite">${favorites.has(key)?"★":"☆"}</button></div><div class="meta">${esc(cat(c))} · ${esc(c.group)}</div>`;
   card.onclick=e=>{if(e.target.closest(".star")){e.stopPropagation();toggleFav(key);return}play(c)};
   frag.appendChild(card);
  } $("grid").appendChild(frag); if(i<list.length)requestAnimationFrame(draw);
 };draw();
}
function toggleFav(key){favorites.has(key)?favorites.delete(key):favorites.add(key);save(FAV_KEY,[...favorites]);render();}
function play(c){
 $("nowPlaying").textContent="▶ "+c.name;$("streamStatus").textContent="Connecting…";$("buffering").classList.remove("hidden");
 const key=c.id||c.url;recent=[c.url,...recent.filter(x=>x!==c.url)].slice(0,20);save(RECENT_KEY,recent);
 player.src({src:c.url,type:/\.m3u8($|\?)/i.test(c.url)?"application/x-mpegURL":"video/mp4"});
 player.play().catch(()=>{});
}
player.on("playing",()=>{$("streamStatus").textContent="● Live / Playing";$("buffering").classList.add("hidden")});
player.on("waiting",()=>{$("streamStatus").textContent="Buffering…";$("buffering").classList.remove("hidden")});
player.on("error",()=>{$("streamStatus").textContent="Stream error — retrying…";$("buffering").classList.remove("hidden");setTimeout(()=>{try{player.tech(true).src(player.currentSrc());player.play().catch(()=>{})}catch{}},1200)});
player.on("pause",()=>{$("buffering").classList.add("hidden")});

async function load(force=false){
 $("streamStatus").textContent="Loading playlist…";
 if(!force){try{const c=getJSON(CACHE_KEY,null);if(c?.channels?.length){state.channels=c.channels;renderCats();render();$("streamStatus").textContent="Cached playlist";load(true);return}}catch{}}
 try{const r=await fetch(PLAYLIST_URL+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error(r.status);const text=await r.text();state.channels=parseM3U(text);save(CACHE_KEY,{time:Date.now(),channels:state.channels});renderCats();render();$("streamStatus").textContent=`Updated · ${state.channels.length} channels`}
 catch(e){console.error(e);if(!state.channels.length)$("grid").innerHTML='<div class="empty">Playlist load नहीं हो सकी। Network/CORS या GitHub URL जाँचें।</div>';$("streamStatus").textContent="Playlist update failed";}
}
$("search").oninput=e=>{clearTimeout(window._st);window._st=setTimeout(()=>{state.query=e.target.value;render()},120)};
$("favOnly").onclick=()=>{state.favoritesOnly=!state.favoritesOnly;$("favOnly").classList.toggle("active",state.favoritesOnly);render()};
$("recentOnly").onclick=()=>{state.recentOnly=!state.recentOnly;$("recentOnly").classList.toggle("active",state.recentOnly);render()};
$("refresh").onclick=()=>load(true);
$("pipBtn").onclick=()=>player.requestPictureInPicture?.().catch(()=>{});

function theme(t){document.documentElement.dataset.theme=t;localStorage.setItem(THEME_KEY,t);$("themeBtn").textContent=t==="dark"?"☀️":"🌙"}
theme(localStorage.getItem(THEME_KEY)|| (matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"));
$("themeBtn").onclick=()=>theme(document.documentElement.dataset.theme==="dark"?"light":"dark");

let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt=null;$("installBtn").classList.add("hidden")};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(console.warn));

load();
