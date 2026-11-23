/* ---- profilo: nome, foto o avatar ---- */
var pics = get('pics', {}), aka = get('aka', {});
var EMOJI_AV = ['😊', '😎', '🥰', '🦊', '🐻', '🐱', '🐶', '🌸', '🌻', '⭐', '🌙', '🔥', '🍕', '⚽', '🎵', '✈️'];
function validPic(p) { if (p === '') return true; if (typeof p !== 'string') return false; if (/^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+\/=]+$/.test(p)) return p.length <= 20000; return EMOJI_AV.indexOf(p) >= 0; }
function setPic(n, p) { n = clean(n, 30); if (!n || !validPic(p)) return false; if ((pics[n] || '') === p) return false; if (p) pics[n] = p; else delete pics[n]; put('pics', pics); refreshAvatars(); return true; }
function refreshAvatars() { try { status(); } catch (e) {} try { render(); } catch (e) {} try { if (tab === 'chat') renderChat(true); } catch (e) {} }
function renameIn(from, to) {
  from = clean(from, 30); to = clean(to, 30); if (!from || !to || from === to) return false;
  function mv(o) { if (o && Object.prototype.hasOwnProperty.call(o, from)) { if (!Object.prototype.hasOwnProperty.call(o, to)) o[to] = o[from]; delete o[from]; } }
  feed.forEach(function (r) { if (r.n === from) r.n = to; mv(r.x); (r.k || []).forEach(function (c) { if (c.n === from) c.n = to; }); });
  msgs.forEach(function (m) { if (m.n === from) m.n = to; mv(m.rd); });
  ideas.forEach(function (i) { if (i.n === from) i.n = to; mv(i.v); });
  muted = muted.map(function (x) { return x === from ? to : x; });
  mv(pics);
  put('feed', feed); put('msgs', msgs); put('ideas', ideas); put('muted', muted); put('pics', pics);
  refreshAvatars(); try { renderIdeas(); } catch (e) {}
  return true;
}
function ago(ts) {
  var d = (Date.now() - ts) / 1000;
  if (d < 60) return 'adesso'; if (d < 3600) return Math.floor(d / 60) + ' min fa'; if (d < 86400) return Math.floor(d / 3600) + (d < 7200 ? ' ora fa' : ' ore fa');
  if (d < 172800) return 'ieri';
  return new Date(ts).toLocaleDateString(window.LX_LANG === 'en' ? 'en-GB' : window.LX_LANG === 'es' ? 'es-ES' : 'it-IT', { day: 'numeric', month: 'short' });
}
function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
function clean(s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n); }

var me = get('me', null), feed = get('feed', []), outbox = get('outbox', []), peer = null, conns = [], hostConn = null, names = [], retry = null;
var joinId = /^#j=([\w-]{8,100})(?:&|$)/.exec(location.hash) || /[?&]j=([\w-]{8,100})(?:&|$)/.exec(location.search);
joinId = joinId ? joinId[1] : null;
var incoming = null;
(function () {
  var q = new URLSearchParams(location.search);
  var raw = [q.get('url'), q.get('text'), q.get('add'), q.get('title')].join(' ');
  var m = /https?:\/\/[^\s<>"']+/.exec(raw);
  var rf = q.get('r'); if (rf && /^R-[A-Z2-9]{6}$/.test(rf)) { try { if (!localStorage.getItem(LSG + 'refBy') && localStorage.getItem(LSG + 'ref') !== rf) localStorage.setItem(LSG + 'refBy', rf); } catch (e) {} }
  if (m) incoming = m[0].replace(/[.,;)\]]+$/, '');
  if (location.search) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} }
})();

/* ---- link e incorporamento ---- */
function safeUrl(u) { try { var x = new URL(String(u).trim()); return /^https?:$/.test(x.protocol) ? x.href : null; } catch (e) { return null; } }
// 🔊/🔇 come su Instagram: vale per tutti i video che lo permettono (YouTube, TikTok, Vimeo) e se lo ricorda
var vMuted = false; try { vMuted = localStorage.getItem(LSG + 'mute') === '1'; } catch (e) {}
// audio concesso in questa sessione (si azzera chiudendo l'app)
function sndSess(on) { try { if (on) sessionStorage.setItem('lxSnd', '1'); return sessionStorage.getItem('lxSnd') === '1'; } catch (e) { return false; } }
window.addEventListener('message', function (e) {
  if (!/youtube/.test(e.origin || '')) return; var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
  var st = d && (d.event === 'onStateChange' ? d.info : d.event === 'infoDelivery' && d.info && typeof d.info.playerState === 'number' ? d.info.playerState : null); if (st === null || st === undefined) return;
  document.querySelectorAll('iframe').forEach(function (f) { if (f.contentWindow === e.source) f.__st = st; });
});
function muteLabel(b) { b.textContent = vMuted ? '🔇' : '🔊'; b.setAttribute('aria-label', vMuted ? 'Attiva l’audio' : 'Togli l’audio'); }
function muteFrame(fr) {
  var s = fr.src || '', w = fr.contentWindow; if (!w) return;
  try {
    if (/youtube\.com\/embed/.test(s)) w.postMessage(JSON.stringify({ event: 'command', func: vMuted ? 'mute' : 'unMute', args: [] }), '*');
    else if (/tiktok\.com\/player/.test(s)) w.postMessage({ type: vMuted ? 'mute' : 'unMute', value: null, 'x-tiktok-player': true }, '*');
    else if (/player\.vimeo\.com/.test(s)) w.postMessage(JSON.stringify({ method: 'setVolume', value: vMuted ? 0 : 1 }), '*');
  } catch (e) {}
}
function muteAll(on) {
  vMuted = !!on; lsSet(LSG + 'mute', vMuted ? '1' : '0');
  document.querySelectorAll('.mutb').forEach(muteLabel);
  document.querySelectorAll('.mwrap iframe').forEach(muteFrame);
  document.querySelectorAll('.item video, .stage video').forEach(function (v) { v.muted = vMuted; });
}
function yt(id) { return 'https://www.youtube.com/embed/' + id + '?playsinline=1&enablejsapi=1' + (/^http/.test(location.protocol) ? '&origin=' + encodeURIComponent(location.origin) : ''); }
function isIOSdev() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function embedFor(u) {
  var x, m; try { x = new URL(u); } catch (e) { return null; }
  var h = x.hostname.replace(/^(www|m|mobile)\./, ''), p = x.pathname, E = encodeURIComponent;
  // video diretti (mp4, webm, mov)
  if (/\.(mp4|webm|m4v|mov)$/i.test(p)) return 'video:' + x.href;
  // Instagram
  if (h === 'instagram.com' && (m = /^\/(?!share\/)(?:[\w.]+\/)?(?:reels?|p|tv)\/([\w-]{5,})/.exec(p))) return 'https://www.instagram.com/p/' + m[1] + '/embed/';
  // TikTok
  // i caroselli di foto non funzionano nel lettore video di TikTok: usano l'incorporamento classico
  if (h === 'tiktok.com' && (m = /\/photo\/(\d{8,})/.exec(p))) return 'https://www.tiktok.com/embed/v2/' + m[1];
  if (h === 'tiktok.com' && (m = /\/video\/(\d{8,})/.exec(p))) return 'https://www.tiktok.com/player/v1/' + m[1] + '?rel=0&native_context_menu=0&closed_caption=0';
  // YouTube
  if (h === 'youtube.com' || h === 'music.youtube.com') {
    if ((m = /^\/(?:shorts|live|embed)\/([\w-]{6,})/.exec(p))) return yt(m[1]);
    var v = x.searchParams.get('v'); if (v && /^[\w-]{6,}$/.test(v)) return yt(v);
  }
  if (h === 'youtu.be' && (m = /^\/([\w-]{6,})/.exec(p))) return yt(m[1]);
  // Facebook
  // i link di condivisione (facebook.com/share/…, fb.watch) il lettore di Facebook non li apre: scheda con "Guarda il video"
  if (h === 'facebook.com' && /^\/(reel\/\d|watch|[^/]+\/videos\/\d|video)/.test(p))
    return 'https://www.facebook.com/plugins/video.php?href=' + E(x.href) + '&show_text=false&width=500&height=889';
  // Snapchat (Spotlight, Lenti, Storie e profili pubblici hanno l'incorporamento ufficiale)
  if (h === 'snapchat.com' && (m = /^\/(?:@[\w.-]+\/)?(spotlight|lens)\/([\w-]{8,})/.exec(p)))
    return 'https://www.snapchat.com/' + m[1] + '/' + m[2] + '/embed';
  // X / Twitter
  if ((h === 'x.com' || h === 'twitter.com') && (m = /\/status\/(\d+)/.exec(p))) return 'https://platform.twitter.com/embed/Tweet.html?id=' + m[1] + '&theme=dark&dnt=true';
  // Threads
  if ((h === 'threads.net' || h === 'threads.com') && (m = /^\/(@[\w.]+\/post\/[\w-]+)/.exec(p))) return 'https://www.' + h + '/' + m[1] + '/embed';
  // Pinterest
  if (/(^|\.)pinterest\./.test(h) && (m = /\/pin\/(\d+)/.exec(p))) return 'https://assets.pinterest.com/ext/embed.html?id=' + m[1];
  // Reddit
  if (h === 'reddit.com' && /^\/r\/[\w]+\/comments\//.test(p)) return 'https://embed.reddit.com' + p + '?theme=dark';
  // Vimeo
  // LinkedIn (post e video pubblici)
  if (h === 'linkedin.com' && (m = /urn:li:(activity|share|ugcPost):(\d{10,})/.exec(decodeURIComponent(p)) || /-(activity|share|ugcPost)-(\d{10,})/.exec(p)))
    return 'https://www.linkedin.com/embed/feed/update/urn:li:' + m[1] + ':' + m[2];
  if (h === 'vimeo.com' && (m = /\/(\d{5,})(?:\/|$)/.exec(p))) return 'https://player.vimeo.com/video/' + m[1];
  if (h === 'player.vimeo.com' && /^\/video\/\d+/.test(p)) return x.href;
  // Dailymotion
  if (h === 'dailymotion.com' && (m = /^\/video\/([\w]+)/.exec(p))) return 'https://www.dailymotion.com/embed/video/' + m[1];
  if (h === 'dai.ly' && (m = /^\/([\w]+)/.exec(p))) return 'https://www.dailymotion.com/embed/video/' + m[1];
  // Twitch (clip)
  if ((h === 'clips.twitch.tv' && (m = /^\/([\w-]+)/.exec(p))) || (h === 'twitch.tv' && (m = /\/clip\/([\w-]+)/.exec(p))))
    return 'https://clips.twitch.tv/embed?clip=' + m[1] + '&parent=' + E(location.hostname || 'localhost');
  // Twitch (video registrati e dirette)
  if (h === 'twitch.tv' && (m = /^\/videos\/(\d+)/.exec(p))) return 'https://player.twitch.tv/?video=v' + m[1] + '&parent=' + E(location.hostname || 'localhost') + '&autoplay=false';
  if (h === 'twitch.tv' && (m = /^\/([a-zA-Z0-9_]{3,25})\/?$/.exec(p)) && !/^(directory|settings|search|downloads|jobs|turbo|subscriptions|inventory|wallet|drops|videos|p)$/i.test(m[1]))
    return 'https://player.twitch.tv/?channel=' + m[1] + '&parent=' + E(location.hostname || 'localhost') + '&autoplay=false';
  // Spotify (canzoni, podcast, playlist)
  if (h === 'open.spotify.com' && (m = /^\/(?:intl-[\w-]+\/)?(track|album|playlist|episode|show|artist)\/(\w+)/.exec(p))) return 'https://open.spotify.com/embed/' + m[1] + '/' + m[2];
  // SoundCloud
  if (h === 'soundcloud.com' && p.split('/').length >= 3) return 'https://w.soundcloud.com/player/?url=' + E(x.href) + '&visual=true';
  return null;
}
// I link brevi di TikTok (vm.tiktok.com, tiktok.com/t/…) vengono trasformati nel link completo, se TikTok lo permette.
function isShort(u) { try { var x = new URL(u), h = x.hostname.replace(/^(www|m)\./, ''); return h === 'vm.tiktok.com' || h === 'vt.tiktok.com' || (h === 'tiktok.com' && /^\/t\//.test(x.pathname)) || srvShort(u); } catch (e) { return false; } }
// link corti di Facebook, Snapchat, LinkedIn e Spotify: li apre il server e mi dà il link vero
function srvShort(u) { return srvOn() && /^https:\/\/(www\.|m\.)?(facebook\.com\/share\/|fb\.watch\/|t\.snapchat\.com\/|lnkd\.in\/|spotify\.link\/)/.test(u); }
async function resolveShort(u) {
  try {
    var x = new URL(u), h = x.hostname.replace(/^(www|m)\./, '');
    if (srvShort(u)) { var rs = await mbCall({ a: 'res', u: u }); return rs && typeof rs.u === 'string' && /^https:\/\//.test(rs.u) ? rs.u : u; }
    if (!(h === 'vm.tiktok.com' || h === 'vt.tiktok.com' || (h === 'tiktok.com' && /^\/t\//.test(x.pathname)))) return u;
    var ctl = new AbortController(), tm = setTimeout(function () { ctl.abort(); }, 5000);
    var res = await fetch('https://www.tiktok.com/oembed?url=' + encodeURIComponent(u), { signal: ctl.signal }); clearTimeout(tm);
    if (!res.ok) return u;
    var j = await res.json(), m = /data-video-id="(\d{8,})"/.exec(j.html || '');
    var id = m ? m[1] : (/^\d{8,}$/.test(j.embed_product_id || '') ? j.embed_product_id : '');
    var who = String(j.author_unique_id || 'video').replace(/[^\w.]/g, '') || 'video';
    var kind = /\/photo\/\d/.test(j.html || '') ? 'photo' : 'video';
    return id ? 'https://www.tiktok.com/@' + who + '/' + kind + '/' + id : u;
  } catch (e) { return u; }
}

/* ---- feed ---- */
var nodes = {}, unseen = 0, EMO = ['❤️', '😂', '😮', '🔥'];
var SUMTAG = ['😂 Fa ridere', '❤️ Per noi', '🍝 Ricetta', '✈️ Un posto', '🛍️ Da comprare', '💡 Idea', '📰 Notizia'];
function cleanQ(q) { var o = {}; if (q && typeof q === 'object') Object.keys(q).slice(0, 8).forEach(function (n) { var c = clean(n, 30); if (c) o[c] = 1; }); return o; }
function cleanX(x) { var o = {}; if (x && typeof x === 'object') Object.keys(x).slice(0, 8).forEach(function (n) { if (EMO.indexOf(x[n]) >= 0) o[clean(n, 30)] = x[n]; }); return o; }
function cleanK(k) {
  return (Array.isArray(k) ? k : []).slice(-50).map(function (c) {
    return c && typeof c.id === 'string' ? { id: clean(c.id, 20), n: clean(c.n, 30) || 'Ospite', t: clean(c.t, 300), ts: +c.ts || 0 } : null;
  }).filter(function (c) { return c && c.t; });
}
var gone = get('gone', []);
