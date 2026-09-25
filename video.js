/* IPTV INDIA v10.2 - no hard dependency on Video.js.
   The page can load the playlist even if a player CDN is unavailable. */
const LOCAL="./in.m3u";
const REMOTE="https://raw.githubusercontent.com/Ashok-Kumar-Yadaw/IPTV-INDIA/main/in.m3u";
const $=id=>document.getElementById(id);
const KEY={fav:"iptv-fav-v102",theme:"iptv-theme-v102",cache:"iptv-cache-v102"};
let channels=[],filtered=[],favorites=new Set(JSON.parse(localStorage.getItem(KEY.fav)||"[]")),category="All",query="",current=-1;
const video=$("video");

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function setStatus(t,good=false){$("status").textContent=t;$("status").style.color=good?"#b7ffc9":"#ffd166";}
function parseM3U(text){
  const lines=text.replace(/^\uFEFF/,"").replace(/\r/g,"").split("\n");
  const out=[];
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trim();
    if(!line.startsWith("#EXTINF")) continue;
    const attrs={}; const re=/([A-Za-z0-9_-]+)="([^"]*)"/g; let m;
    while((m=re.exec(line))) attrs[m[1]]=m[2];
    const comma=line.indexOf(",");
    const name=(comma>=0?line.slice(comma+1).trim():attrs["tvg-name"])||"Unknown";
    let url="";
    for(let j=i+1;j<lines.length;j++){
      const x=lines[j].trim();
      if(!x||x.startsWith("#")) continue;
      url=x;i=j;break;
    }
    if(url) out.push({num:out.length+1,name,group:attrs["group-title"]||"Other",logo:attrs["tvg-logo"]||"",lang:attrs["tvg-language"]||"",id:attrs["tvg-id"]||"",url});
  }
  return out;
}
function cat(c){
  const s=(c.group+" "+c.name).toLowerCase();
  if(/news|न्यूज़|समाचार/.test(s)) return "News";
  if(/movie|film|cinema|मूवी|फिल्म/.test(s)) return "Movies";
  if(/music|म्यूजिक|संगीत/.test(s)) return "Music";
  if(/sport|खेल/.test(s)) return "Sports";
  if(/kids|cartoon|बच्च/.test(s)) return "Kids";
  if(/bhakti|devotional|spiritual|भक्ति|धार्मिक/.test(s)) return "Devotional";
  return c.group||"Other";
}
function renderCategories(){
  const counts={}; channels.forEach(c=>counts[cat(c)]=(counts[cat(c)]||0)+1);
  $("categories").innerHTML=["All",...Object.keys(counts).sort()].map(x=>`<button class="cat ${x===category?"active":""}" data-cat="${esc(x)}">${esc(x)}${x==="All"?"":` (${counts[x]})`}</button>`).join("");
  document.querySelectorAll(".cat").forEach(b=>b.onclick=()=>{category=b.dataset.cat;renderCategories();apply()});
}
function apply(){
  const q=query.toLowerCase().trim();
  filtered=channels.filter(c=>(category==="All"||cat(c)===category)&&(!q||(c.name+" "+c.group+" "+c.lang+" "+c.num).toLowerCase().includes(q)));
  $("heading").textContent=category==="All"?"All Channels":category;
  $("count").textContent=`${filtered.length} / ${channels.length}`;
  $("grid").innerHTML="";
  if(!filtered.length){$("grid").innerHTML='<div class="empty">कोई channel नहीं मिला।</div>';return}
  let i=0;
  const batch=()=>{const f=document.createDocumentFragment();for(let n=0;n<70&&i<filtered.length;n++,i++)f.appendChild(card(filtered[i]));$("grid").appendChild(f);if(i<filtered.length)requestAnimationFrame(batch)};
  requestAnimationFrame(batch);
}
function card(c){
  const key=c.id||c.url,d=document.createElement("article");d.className="card";d.tabIndex=0;
  d.innerHTML=`<div class="ct"><img class="logo" loading="lazy" src="${esc(c.logo)}" onerror="this.style.visibility='hidden'"><div class="name">${esc(c.num)}. ${esc(c.name)}</div><button class="star">${favorites.has(key)?"★":"☆"}</button></div><div class="meta">${esc(cat(c))} · ${esc(c.group)}${c.lang?" · "+esc(c.lang):""}</div>`;
  const open=()=>play(c);
  d.onclick=e=>{if(e.target.closest(".star")){e.stopPropagation();favorites.has(key)?favorites.delete(key):favorites.add(key);localStorage.setItem(KEY.fav,JSON.stringify([...favorites]));$("favorites").textContent=favorites.size;apply();return}open()};
  d.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}};
  return d;
}
function play(c){
  current=filtered.findIndex(x=>x.url===c.url);
  $("nowName").textContent="▶ "+c.name;$("nowMeta").textContent=`${cat(c)} · ${c.group}${c.lang?" · "+c.lang:""}`;
  $("nowLogo").src=c.logo||"";setStatus("CONNECTING");
  const isHls=/\.m3u8($|\?)/i.test(c.url);
  video.pause();video.removeAttribute("src");video.load();
  if(video.canPlayType(isHls?"application/vnd.apple.mpegurl":"video/mp4")){
    video.src=c.url;video.play().catch(()=>{});
  }else if(isHls){
    loadHls(c.url);
  }else{
    video.src=c.url;video.play().catch(()=>{});
  }
}
let hlsScript=null;
function loadHls(url){
  if(window.Hls){startHls(url);return}
  if(hlsScript)return;
  hlsScript=document.createElement("script");
  hlsScript.src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
  hlsScript.onload=()=>startHls(url);
  hlsScript.onerror=()=>showError("HLS player library load नहीं हुई। Internet/CDN access check करें।");
  document.head.appendChild(hlsScript);
}
let hls=null;
function startHls(url){
  if(!window.Hls){showError("HLS support उपलब्ध नहीं है।");return}
  if(hls){hls.destroy();hls=null}
  hls=new Hls({enableWorker:true,lowLatencyMode:false,backBufferLength:30});
  hls.loadSource(url);hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED,()=>{setStatus("PLAYING",true);video.play().catch(()=>{})});
  hls.on(Hls.Events.ERROR,(e,d)=>{if(d.fatal){setStatus("ERROR");showError("Stream error: "+(d.details||"fatal HLS error"))}});
}
video.addEventListener("playing",()=>setStatus("PLAYING",true));
video.addEventListener("waiting",()=>setStatus("BUFFERING"));
video.addEventListener("error",()=>{if(video.error)setStatus("ERROR")});
function showError(msg){$("errorBox").innerHTML=esc(msg);$("errorBox").classList.remove("hide")}
function hideError(){$("errorBox").classList.add("hide")}
async function getText(url){
  const r=await fetch(url+(url.includes("?")?"&":"?")+"v="+Date.now(),{cache:"no-store",mode:"cors"});
  if(!r.ok)throw new Error("HTTP "+r.status);
  const t=await r.text();
  if(!/^\s*#EXTM3U/i.test(t))throw new Error("यह valid M3U file नहीं है");
  return t;
}
async function load(){
  hideError();$("loadStatus").textContent="Loading";setStatus("LOADING");
  const cached=JSON.parse(localStorage.getItem(KEY.cache)||"null");
  if(cached?.length){channels=cached;finishLoad();setTimeout(loadNetwork,700);return}
  await loadNetwork();
}
async function loadNetwork(){
  try{
    let text;
    try{text=await getText(LOCAL)}
    catch(localErr){text=await getText(REMOTE)}
    const data=parseM3U(text);
    if(!data.length)throw new Error("M3U में कोई channel नहीं मिला");
    channels=data;localStorage.setItem(KEY.cache,JSON.stringify(data));finishLoad();
  }catch(e){
    $("loadStatus").textContent="ERROR";setStatus("ERROR");
    showError(`Playlist load नहीं हुई: ${e.message}. GitHub repository के root में in.m3u रखें और filename बिल्कुल in.m3u रखें.`);
  }
}
function finishLoad(){
  $("total").textContent=channels.length;$("favorites").textContent=favorites.size;$("loadStatus").textContent="READY";
  setStatus("READY",true);renderCategories();apply();
}
$("search").oninput=e=>{query=e.target.value;clearTimeout(window.t);window.t=setTimeout(apply,80)};
$("clearBtn").onclick=()=>{$("search").value="";query="";apply()};
$("refreshBtn").onclick=()=>{localStorage.removeItem(KEY.cache);load()};
$("themeBtn").onclick=()=>{const t=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=t;localStorage.setItem(KEY.theme,t)};
$("prevBtn").onclick=()=>{if(filtered.length)play(filtered[(current-1+filtered.length)%filtered.length])};
$("nextBtn").onclick=()=>{if(filtered.length)play(filtered[(current+1)%filtered.length])};
$("fullBtn").onclick=()=>{if(video.requestFullscreen)video.requestFullscreen();else video.webkitEnterFullscreen?.()};
document.addEventListener("keydown",e=>{if(["INPUT","TEXTAREA"].includes(document.activeElement.tagName))return;if(e.key==="ArrowLeft")$("prevBtn").click();if(e.key==="ArrowRight")$("nextBtn").click();if(e.key==="ArrowUp"||e.key==="ArrowDown"){$("nextBtn").click();}});
document.documentElement.dataset.theme=localStorage.getItem(KEY.theme)||"dark";
load();
