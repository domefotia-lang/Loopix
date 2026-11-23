/* ---- foto e video nei messaggi ----
   Cifrati sul telefono (chiave nuova per ogni file, che viaggia solo dentro il messaggio).
   Sul server stanno solo finché tutti li hanno ricevuti (max 14 giorni).
   Sul telefono NON si salvano: restano solo se li fissi 📌 o li salvi tu nella galleria. */
var MURL = {}; function murl(id, b) { return MURL[id] || (MURL[id] = URL.createObjectURL(b)); }
var MT_OK = /^(image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|webm))$/, MCACHE = {}, MAX_VID_S = 30, MAX_MB = 40;
function cleanAtt(a) {
  if (!a || typeof a !== 'object' || !/^[a-f0-9]{32}$/.test(a.id || '') || typeof a.k !== 'string' || a.k.length > 64 || typeof a.iv !== 'string' || a.iv.length > 24 || !MT_OK.test(a.mt || '')) return null;
  return { id: a.id, k: a.k, iv: a.iv, mt: a.mt, w: Math.min(8000, +a.w || 0), h: Math.min(8000, +a.h || 0), d: Math.min(600, +a.d || 0) };
}
function mdE(u8) { var s = ''; for (var i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function mdD(t) { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var b = atob(t), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
var idbP = null;
function idb() { if (!idbP) idbP = new Promise(function (res, rej) { try { var r = indexedDB.open('reelta-media', 1); r.onupgradeneeded = function () { r.result.createObjectStore('m'); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; } catch (e) { rej(e); } }); return idbP; }
function idbKey(id) { return lsOf(REG.active) + id; }
function idbGet(id) { return idb().then(function (db) { return new Promise(function (res) { var q = db.transaction('m').objectStore('m').get(idbKey(id)); q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { res(null); }; }); }).catch(function () { return null; }); }
function idbPut(id, blob) { return idb().then(function (db) { return new Promise(function (res) { var t = db.transaction('m', 'readwrite'); t.objectStore('m').put(blob, idbKey(id)); t.oncomplete = function () { res(true); }; t.onerror = function () { res(false); }; }); }).catch(function () { return false; }); }
function idbDel(id) { return idb().then(function (db) { db.transaction('m', 'readwrite').objectStore('m').delete(idbKey(id)); }).catch(function () {}); }
function mediaBlob(a, mine) {
  if (MCACHE[a.id]) return Promise.resolve(MCACHE[a.id]);
  return idbGet(a.id).then(function (b) {
    if (b) { MCACHE[a.id] = b; return b; }
    return mbCall({ a: 'dl', id: a.id }).then(function (r) {
      if (!r || !r.url) throw new Error('gone');
      return fetch(r.url).then(function (x) { if (!x.ok) throw new Error('gone'); return x.arrayBuffer(); });
    }).then(function (ct) {
      return crypto.subtle.importKey('raw', mdD(a.k), 'AES-GCM', false, ['decrypt']).then(function (key) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: mdD(a.iv) }, key, ct); });
    }).then(function (pt) {
      var bl = new Blob([pt], { type: a.mt }); MCACHE[a.id] = bl;
      var got = get('mgot', []); if (!mine && got.indexOf(a.id) < 0) { got.push(a.id); put('mgot', got.slice(-500)); mbCall({ a: 'got', id: a.id }).catch(function () {}); }
      return bl;
    });
  });
}
function mediaKeep(a, mine) { return mediaBlob(a, mine).then(function (b) { return idbPut(a.id, b); }).catch(function () { $('mh').textContent = 'Questa foto o video non è più disponibile da salvare.'; }); }
var mObs = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { mObs.unobserve(e.target); if (e.target._load) e.target._load(); } }); }, { rootMargin: '300px' }) : null;
function mediaBox(m) {
  var a = m.a, vid = a.mt.indexOf('video') === 0, box = el('div', 'mbox');
  if (a.w && a.h) box.style.aspectRatio = a.w + '/' + a.h;
  var lab = el('div', 'ml', vid ? '🎬 Carico il video…' : '📷 Carico la foto…'); box.appendChild(lab);
  box._load = function () {
    mediaBlob(a, m.n === me.name).then(function (b) {
      var u = murl(a.id, b), x; box.textContent = '';
      if (vid) { x = el('video'); x.src = u; x.muted = true; x.playsInline = true; x.setAttribute('playsinline', ''); x.preload = 'metadata'; box.appendChild(x); box.appendChild(el('span', 'vb', '▶ ' + (a.d ? Math.round(a.d) + ' s' : 'video'))); }
      else { x = el('img'); x.src = u; x.alt = 'Foto di ' + m.n; box.appendChild(x); }
      box.onclick = function (e) { e.stopPropagation(); mediaView(m, b); };
    }, function () { lab.textContent = (vid ? '🎬 Video' : '📷 Foto') + ' non più disponibile: si conserva solo se viene fissato 📌'; box.style.minHeight = '0'; box.style.aspectRatio = ''; box.style.cursor = 'default'; });
  };
  if (mObs) setTimeout(function () { mObs.observe(box); }, 0); else setTimeout(box._load, 0);
  return box;
}
var mvCur = null;
function mediaView(m, b) {
  mvCur = { m: m, b: b }; var B = $('mvB'); B.textContent = ''; var u = murl(m.a.id, b);
  if (m.a.mt.indexOf('video') === 0) { var v = el('video'); v.src = u; v.controls = true; v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', ''); B.appendChild(v); }
  else { var i = el('img'); i.src = u; i.alt = ''; B.appendChild(i); }
  $('mvP').textContent = m.pin ? '📌 Togli dai fissati' : '📌 Fissa'; $('mvH').textContent = m.pin ? '📌 Fissato: resta in Reelta anche dopo.' : 'Non viene salvato da nessuna parte: fissalo 📌 o salvalo nel telefono se vuoi tenerlo.';
  $('mvM').classList.add('open');
}
function mediaSave(m, b) {
  var ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' }[m.a.mt] || 'bin';
  var f; try { f = new File([b], 'reelta-' + m.id + '.' + ext, { type: m.a.mt }); } catch (e) {}
  if (f && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f] }).catch(function () {}); return; }
  var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'reelta-' + m.id + '.' + ext; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 1000);
}
$('mvX').addEventListener('click', function () { $('mvM').classList.remove('open'); $('mvB').textContent = ''; });
$('mvS').addEventListener('click', function () { if (mvCur) mediaSave(mvCur.m, mvCur.b); });
$('mvP').addEventListener('click', function () { if (!mvCur) return; var m = mvCur.m; pinMsg(m.id, !m.pin, true); m = msgs.filter(function (x) { return x.id === mvCur.m.id; })[0] || m; mvCur.m = m; $('mvP').textContent = m.pin ? '📌 Togli dai fissati' : '📌 Fissa'; $('mvH').textContent = m.pin ? '📌 Fissato: resta in Reelta anche dopo.' : 'Tolto dai fissati.'; });
// foto: rimpicciolita prima di partire (dai 3-4 MB del telefono a circa 300 KB)
function shrinkImg(file) {
  return new Promise(function (res) {
    var u = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      var W = im.naturalWidth, H = im.naturalHeight, sc = Math.min(1, 1600 / Math.max(W, H)), w = Math.round(W * sc), h = Math.round(H * sc);
      var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h); URL.revokeObjectURL(u);
      c.toBlob(function (b) { res(b ? { b: b, mt: 'image/jpeg', w: w, h: h } : { b: file, mt: file.type, w: W, h: H }); }, 'image/jpeg', 0.8);
    };
    im.onerror = function () { URL.revokeObjectURL(u); res(null); };
    im.src = u;
  });
}
function vidInfo(file) {
  return new Promise(function (res) {
    var v = document.createElement('video'), u = URL.createObjectURL(file), done = false;
    var fin = function (x) { if (done) return; done = true; URL.revokeObjectURL(u); res(x); };
    v.preload = 'metadata'; v.muted = true; v.onloadedmetadata = function () { fin({ d: v.duration || 0, w: v.videoWidth || 0, h: v.videoHeight || 0 }); }; v.onerror = function () { fin({ d: 0, w: 0, h: 0 }); };
    setTimeout(function () { fin({ d: 0, w: 0, h: 0 }); }, 8000); v.src = u;
  });
}
function mediaRecipients() { return me.role === 'host' ? Math.max(1, Object.keys(allowed).length) : Math.max(1, names.length - 1); }
var mBusy = false;
function mediaSend(file) {
  if (!file || mBusy) return;
  if (!srvOn()) { $('mh').textContent = 'Foto e video non disponibili in questo momento.'; return; }
  var mt = String(file.type || '').toLowerCase(), isV = mt.indexOf('video') === 0;
  if (!isV && mt.indexOf('image') !== 0) { $('mh').textContent = 'Si possono mandare solo foto e video.'; return; }
  mBusy = true; $('mAdd').textContent = '⏳';
  var stop = function (t) { mBusy = false; $('mAdd').textContent = '📷'; if (t) ask(t.split('|')[0], t.split('|')[1] || '', 'Ok'); };
  (isV ? vidInfo(file).then(function (vi) {
    if (vi.d > MAX_VID_S + 1) throw new Error('Video troppo lungo|Dura ' + Math.round(vi.d) + ' secondi: il massimo è ' + MAX_VID_S + '. Accorcialo dalla galleria del telefono e riprova.');
    if (file.size > MAX_MB * 1048576) throw new Error('Video troppo pesante|Prova a girarlo più corto o in qualità più bassa.');
    return { b: file, mt: MT_OK.test(mt) ? mt : 'video/mp4', w: vi.w, h: vi.h, d: vi.d };
  }) : shrinkImg(file).then(function (x) { if (!x) throw new Error('Foto non leggibile|Questo formato non si apre qui. Prova a scegliere un’altra foto.'); return x; }))
  .then(function (x) {
    $('mh').textContent = isV ? '🎬 Invio il video…' : '📷 Invio la foto…';
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']).then(function (key) {
      return Promise.all([crypto.subtle.exportKey('raw', key), x.b.arrayBuffer().then(function (buf) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, buf); })]);
    }).then(function (r) {
      var ct = new Blob([r[1]]);
      return mbCall({ a: 'up', sz: ct.size, n: mediaRecipients() }).then(function (up) {
        if (up && up.error === 'limite') throw new Error('Per oggi basta video|Oggi avete mandato tanti video e foto: i prossimi partono domani. Link e messaggi funzionano come sempre.');
        if (!up || !up.id || !up.url) throw new Error('Invio non riuscito|Controlla la connessione e riprova.');
        return fetch(up.url, { method: 'PUT', body: ct, headers: { 'Content-Type': 'application/octet-stream' } }).then(function (res) {
          if (!res.ok) throw new Error('Invio non riuscito|Controlla la connessione e riprova.');
          var a = { id: up.id, k: mdE(new Uint8Array(r[0])), iv: mdE(iv), mt: x.mt, w: x.w, h: x.h, d: x.d || 0 };
          MCACHE[a.id] = x.b;
          var cap = clean($('cin').value, 1000); $('cin').value = '';
          var m = addMsg({ id: uid(8), n: me.name, t: cap, ts: Date.now(), a: a });
          if (m) sendEv({ t: 'msg', m: m });
          $('mh').textContent = '';
          stop();
        });
      });
    });
  }).catch(function (e) { var t = String(e && e.message || ''); stop(t.indexOf('|') > 0 ? t : 'Invio non riuscito|Controlla la connessione e riprova.'); });
}
$('mAdd').addEventListener('click', function () {
  sheet('Manda una foto o un video', 'Non si salva da nessuna parte: chi lo riceve può fissarlo 📌 o salvarlo nel telefono. Video al massimo ' + MAX_VID_S + ' secondi.', [
    { t: '🖼️ Dalla galleria', f: function () { $('mFile').click(); } },
    { t: '📸 Scatta una foto', f: function () { $('mCamP').click(); } },
    { t: '🎥 Gira un video (max ' + MAX_VID_S + ' s)', f: function () { $('mCamV').click(); } }
  ]);
});
['mFile', 'mCamP', 'mCamV'].forEach(function (id) { $(id).addEventListener('change', function () { var f = this.files && this.files[0]; this.value = ''; mediaSend(f); }); });
var mhid = get('mhid', []);
$('rkS').value = String(rkeepDays()); $('rkS').addEventListener('change', function () { var v = +$('rkS').value || 0; if (v && !rkeepDays()) { ask('Pulire i Reel non tenuti?', 'I Reel senza ⭐ più vecchi di ' + v + ' giorni spariranno da questo telefono. Quelli con ⭐ restano sempre.', 'Sì, attiva').then(function (y) { if (y) { put('rkeep', v); cleanReels(); } else $('rkS').value = '0'; }); } else { put('rkeep', v); cleanReels(); } });
setInterval(function () { if (me) cleanReels(); }, 36e5);
$('fixB').addEventListener('click', pinOpen); $('rX').addEventListener('click', stopReply); $('pinX').addEventListener('click', function () { $('pinM').classList.remove('open'); }); $('pinQ').addEventListener('input', pinRender);
function hideMsg(id) { if (mhid.indexOf(id) < 0) { mhid.push(id); if (mhid.length > 500) mhid.shift(); put('mhid', mhid); } delMsg(id, false); renderChat(true); }
function copyMsg(m) { try { navigator.clipboard.writeText(m.t).then(function () { $('mh').textContent = 'Copiato ✓'; }, function () {}); } catch (e) {} }
var CHAT_STEP = 150, chatWin = CHAT_STEP;
function renderChat(keep) {
  pruneMsgs(); ttlNote(); var b = $('clog'), st = b.scrollTop, atBottom = b.scrollHeight - b.scrollTop - b.clientHeight < 60; b.textContent = '';
  if (!msgs.length) { b.appendChild(el('div', 'empty', 'Nessun messaggio ancora.\n\nScrivetevi qui: lo legge solo chi è nel cerchio.')); return; }
  var L = msgs.filter(function (m) { return !isMuted(m.n); }), more = L.length - chatWin;
  if (more > 0) { b.appendChild(olderBtn(more, 'chat', function () { chatWin += CHAT_STEP; renderChat(true); })); L = L.slice(-chatWin); }
  L.forEach(function (m) { b.appendChild(msgNode(m)); }); if (!keepPos) b.scrollTop = keep && !atBottom ? st : b.scrollHeight;
  if ($('chat').classList.contains('show')) markSeen();
}
function addMsg(m, who) {
  if (!m || typeof m.id !== 'string' || m.id.length > 30) return null;
  var t = clean(m.t, 1000), att = cleanAtt(m.a); if (!t && !att) return null; if (!t) t = att.mt.indexOf('video') === 0 ? '🎬 Video' : '📷 Foto';
  if (msgs.some(function (x) { return x.id === m.id; })) return null;
  if (typeof mhid !== 'undefined' && mhid.indexOf(m.id) >= 0) return null;
  var rd = {}; if (m.rd && typeof m.rd === 'object') Object.keys(m.rd).slice(0, 12).forEach(function (k) { rd[clean(k, 30)] = 1; });
  var n = { id: m.id, n: who || clean(m.n, 30) || 'Ospite', t: t, ts: +m.ts || Date.now(), rd: rd, pin: clean(m.pin || '', 30) }; if (att) n.a = att;
  if (m.re && typeof m.re === 'object' && typeof m.re.id === 'string' && m.re.id.length <= 30) n.re = { id: m.re.id, n: clean(m.re.n, 30), t: clean(m.re.t, 80) };
  if (ttlMs() && !n.pin && Date.now() - n.ts > ttlMs()) return null;
  msgs.push(n); trimMsgs(); put('msgs', msgs);
  if (isMuted(n.n)) return n;
  if (tab === 'chat' && $('chat').classList.contains('show')) { var b = $('clog'); if (b.querySelector('.empty')) b.textContent = ''; b.appendChild(msgNode(n)); b.scrollTop = b.scrollHeight; if (n.n !== me.name) markSeen(); }
  else if (n.n !== me.name) { chatSeen++; chatTab(); noteIn('msg', n.n, n.t); actLog('msg', n.n, n.t, ''); }
  return n;
}
// ↩️ rispondere a un messaggio: scorri il messaggio verso destra (o toccalo → Rispondi)
var replyTo = null;
function startReply(id) {
  var m = msgs.filter(function (x) { return x.id === id; })[0]; if (!m) return;
  replyTo = { id: m.id, n: m.n, t: (m.a && /^(📷 Foto|🎬 Video)$/.test(m.t) ? m.t : m.t).slice(0, 80) };
  $('rN').textContent = 'Rispondi a ' + (m.n === me.name ? 'te stesso' : m.n); $('rT').textContent = replyTo.t; $('rBar').hidden = false;
  try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} setTimeout(function () { $('cin').focus(); }, 50);
}
function stopReply() { replyTo = null; $('rBar').hidden = true; }
(function () {
  var on = function (e) { var t = e.target; if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && !/^(checkbox|radio|file|button|range|color)$/i.test(t.type || '')))) document.body.classList.add('kb'); };
  var off = function () { setTimeout(function () { var a = document.activeElement; if (!a || !/^(INPUT|TEXTAREA)$/.test(a.tagName)) document.body.classList.remove('kb'); }, 80); };
  document.addEventListener('focusin', on); document.addEventListener('focusout', off);
})();
function sendMsg() {
  var t = clean($('cin').value, 1000); if (!t) return;
  var m = addMsg({ id: uid(8), n: me.name, t: t, ts: Date.now(), re: replyTo }); $('cin').value = ''; stopReply();
  if (m) sendEv({ t: 'msg', m: m });
}
function ideaTab() { $('tIdea').textContent = ideaSeen ? 'Piani (' + ideaSeen + ')' : 'Piani'; try { dwDot(); } catch (e) {} }

