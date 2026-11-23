/* ---- sequenza: i Reel di ogni piattaforma, uno dopo l'altro ---- */
var seq = null, seen = get('seen', {}), timer = null;
function newCount() { return feed.filter(function (r) { return !seen[r.id] && !isMuted(r.n) && r.n !== me.name; }).length; } // i Reel che mandi tu non sono «nuovi» per te
function seqLabel() {
  appBadge(); bellUI();
  var n = newCount(), b = $('sq'); b.hidden = n < 2; // con un Reel solo, il Reel è già lì sotto: niente bottone in mezzo $('sp').hidden = !feed.length || !$('app').classList.contains('on');
  var who = []; feed.forEach(function (r) { if (!seen[r.id] && !isMuted(r.n) && r.n !== me.name && who.indexOf(r.n) < 0) who.push(r.n); });
  b.textContent = n ? '▶  ' + n + (n === 1 ? ' nuovo' : ' nuovi') + (who.length === 1 ? ' da ' + who[0] : '') : '▶  Rivedi tutti';
  renderNov();
}
// striscia "Novità": appena apri, cosa c'è di nuovo per te (un tocco porta al punto giusto)
function unreadMsgs() { var at = +get('chatAt', 0); return msgs.filter(function (m) { return m.n !== me.name && m.ts > at && !isMuted(m.n); }).length; }
// 🚀 primi passi: una lista breve per chi è nuovo, sparisce quando è completa
function stepsList() {
  var host = me && me.role === 'host';
  return [
    { t: host ? 'Invita il tuo partner' : 'Entra in un cerchio', ok: host ? Object.keys(allowed).length > 0 : true, f: function () { invite(); } },
    { t: 'Manda il primo Reel', ok: feed.some(function (r) { return r.n === me.name; }), f: function () { if (typeof dropOk === 'function' && dropOk()) dropOpen(); else $('paste').click(); } },
    { t: 'Reagisci a un Reel (tocca il cuore)', ok: feed.some(function (r) { return r.x && r.x[me.name]; }), f: function () { var r = feed.filter(function (x) { return x.n !== me.name; }).pop() || feed[feed.length - 1]; if (r) goReel(r.id); else $('mh').textContent = 'Appena arriva un Reel, tocca il cuore 🤍 sotto il video.'; } },
    { t: 'Trasforma un Reel in piano (✨)', ok: ideas.length > 0, f: function () { var r = feed[feed.length - 1]; if (r) openIdea(r.id); else showPane('ideas'); } },
    { t: 'Attiva le notifiche', ok: !(pushOK() && srvOn()) || Notification.permission === 'granted', f: function () { pushAsk().then(function () { renderSteps(); }); } }
  ];
}
function renderSteps() {
  var B = $('stp'); if (!B || !me) return;
  var L = stepsList(), done = L.filter(function (x) { return x.ok; }).length, all = done === L.length;
  if (!get('stepsSeen', 0) && feed.length >= 10) put('steps', 1); // chi usa già Reelta da un po' non la vede
  var st = get('steps', 0); // 0 = in corso, 1 = chiusa, 2 = completata e festeggiata
  if (st || (all && !get('stepsSeen', 0))) { if (all && !st) { put('steps', 2); $('mh').textContent = '🎉 Primi passi fatti: ora Reelta è tutta vostra!'; } B.hidden = true; return; }
  if (!feed.length || !$('ios').hidden || newCount() > 0) { B.hidden = true; return; } // una cosa alla volta: prima la scheda vuota o l'avviso «Mettila sulla Home»
  put('stepsSeen', 1); B.textContent = ''; B.hidden = false;
  var nx = L.filter(function (x) { return !x.ok; })[0], open = B.dataset.open === '1';
  var hd = el('button', 'sh'); hd.type = 'button'; hd.setAttribute('aria-expanded', open ? 'true' : 'false');
  hd.appendChild(el('b', null, '🚀 Primi passi')); hd.appendChild(el('small', null, done + '/' + L.length));
  var pg = el('span', 'pg'), bar = el('i'); bar.style.width = Math.round(done / L.length * 100) + '%'; pg.appendChild(bar); hd.appendChild(pg);
  hd.onclick = function () { B.dataset.open = open ? '' : '1'; renderSteps(); }; B.appendChild(hd);
  if (!open && nx) { var nb = el('button', 'nx', 'Ora: ' + nx.t + ' ›'); nb.type = 'button'; nb.onclick = function () { track('step'); nx.f(); }; B.appendChild(nb); }
  if (open) { var ul = el('ul'); L.forEach(function (x) { var li = el('li', x.ok ? 'ok' : null), b = el('button'); b.type = 'button'; b.appendChild(el('i', null, x.ok ? '✓' : '')); b.appendChild(document.createTextNode(x.t)); if (!x.ok) b.onclick = function () { track('step'); x.f(); }; li.appendChild(b); ul.appendChild(li); }); B.appendChild(ul); }
  var xb = el('button', 'x', '✕'); xb.type = 'button'; xb.setAttribute('aria-label', 'Chiudi i primi passi'); xb.onclick = function () { put('steps', 1); B.hidden = true; }; B.appendChild(xb);
}
// un Reel di qualche giorno fa che vi era piaciuto (tenuto o con reazioni): cambia ogni giorno
function memPick() {
  var old = feed.filter(function (r) { return Date.now() - r.ts > 4 * 864e5 && (keeps[r.id] || Object.keys(r.x || {}).length); });
  if (!old.length) return null;
  return old[Math.floor(Date.now() / 864e5) % old.length];
}
function renderNov() {
  try { renderSteps(); } catch (e) {}
  var box = $('nov'); if (!box || !me) return; box.textContent = '';
  var chip = function (t, f) { var c = el('button', 'chip', t); c.onclick = f; box.appendChild(c); };
  var um = unreadMsgs(), dec = typeof toDecide === 'function' ? toDecide().length : 0, today = new Date(); today.setHours(0, 0, 0, 0);
  var soon = ideas.filter(function (i) { if (!i.w || i.d) return false; var d = (new Date(i.w + 'T00:00:00') - today) / 864e5; return d >= 0 && d <= 3; }).sort(function (a, b) { return a.w < b.w ? -1 : 1; })[0];
  if (um) chip('💬 ' + um + (um === 1 ? ' messaggio' : ' messaggi'), function () { showPane('chat'); });
  var rxn = (get('rxNew', []) || []).filter(function (x) { return Date.now() - x.ts < 3 * 864e5 && find(x.id); });
  if (rxn.length) { var lx = rxn[rxn.length - 1]; chip(lx.e + ' ' + (rxn.length === 1 ? lx.n + ' ' + (RXV[lx.e] || 'ha reagito al tuo Reel').replace(/ al tuo Reel| col tuo Reel/, '') : rxn.length + ' reazioni ai tuoi Reel'), function () { put('rxNew', []); goReel(lx.id); renderNov(); }); }
  if (feed.length >= 5 && srvOn() && !cloudOn() && !get('bkAsk', 0) && typeof cloudStart === 'function') chip('☁️ ' + LXT('Non perdere i vostri Reel: attiva la copia'), function () { put('bkAsk', 1); track('copia-da-chip'); cloudStart(); renderNov(); });
  if (dec) chip('💘 ' + dec + ' da decidere', function () { showPane('ideas'); decOpen(); });
  // da soli con qualche Reel già pronto: è il momento giusto per invitare
  var mineN = me.role === 'host' && !Object.keys(allowed).length ? feed.filter(function (r) { return r.n === me.name; }).length : 0;
  if (mineN >= 2) chip('💌 ' + (window.LX_T || String)('Hai ') + mineN + (window.LX_T || String)(' Reel pronti: invita qualcuno a vederli'), function () { track('invita-pronti'); invite(); });
  try { mixFetch(); } catch (e) {}
  if (ritOn()) chip('🗓 ' + LXT('Il piano del weekend') + (mixCur() ? ' · ✨' : '') + (ritQueue().length ? ' · ' + ritQueue().length + ' Reel' : ''), function () { ritOpen(); });
  else if (mixCur() && ritMembers().length >= 2) chip('✨ ' + LXT('Un’idea per voi: ') + clean(mixCur().s.p, 28), function () { ritOpen(); });
  var fbI = fbDue()[0]; if (fbI) chip('💭 Com’è andata: ' + fbI.p.slice(0, 22) + '?', function () { fbOpen(fbI); });
  if (soon) { var dd = Math.round((new Date(soon.w + 'T00:00:00') - today) / 864e5); chip('📅 ' + soon.p.slice(0, 24) + ' · ' + (dd === 0 ? 'oggi' : dd === 1 ? 'domani' : fmtDay(soon.w)), function () { showPane('ideas'); }); }
  if (!um && !dec && !soon && !rxn.length && !newCount() && !ritOn() && mineN < 2) {
    if (!feed.length) { box.hidden = true; return; }
    box.appendChild(el('span', 'ok', 'Tutto visto ✓'));
    var lov = ideas.filter(function (i) { return i.d && i.w && Object.keys(i.f || {}).some(function (n) { return i.f[n] === '❤️'; }) && Date.now() - new Date(i.w + 'T12:00:00') > 7 * 864e5; });
    if (lov.length && Math.floor(Date.now() / 864e5) % 2) { var lm = lov[Math.floor(Date.now() / 1728e5) % lov.length]; chip('🕰 Ricordate? ' + lm.p.slice(0, 22) + ' ❤️', function () { ifilter = 'fatte'; showPane('ideas'); }); }
    var mem = memPick(); if (mem) chip('🕰 Un ricordo · ' + ago(mem.ts), function () { goReel(mem.id); var nd = nodes[mem.id]; if (nd) { nd.el.classList.remove('flash'); void nd.el.offsetWidth; nd.el.classList.add('flash'); } });
    if (Object.keys(keeps).length) chip('⭐ Rivedi i tenuti', function () { fview = 'keep'; render(); });
  }
  box.hidden = !box.children.length;
}
function pbuild(r) {
  var bar = $('pr'); bar.textContent = '';
  EMO.forEach(function (e) {
    var n = Object.keys(r.x || {}).filter(function (k) { return r.x[k] === e; }).length;
    var b = el('button', 'r-btn' + (r.x && r.x[me.name] === e ? ' mine' : ''), e + (n ? ' ' + n : ''));
    b.setAttribute('aria-label', 'Reagisci ' + e); b.onclick = function () { if (party) partyReact(r.id, e); else react(r.id, e); }; bar.appendChild(b);
  });
  if (canDel(r)) { var xb = el('button', 'r-btn', '🗑'); xb.setAttribute('aria-label', 'Elimina Reel'); xb.onclick = function () { pdel(r); }; bar.appendChild(xb); }
  var ib = el('button', 'r-btn plan', '✨ Piano'); ib.setAttribute('aria-label', 'Trasforma in piano'); ib.onclick = function () { openIdea(r.id); }; bar.appendChild(ib);
  immBuild(r);
  var ps = $('psum'); var pl2 = sumLabel(r); ps.hidden = !pl2; ps.onclick = function () { sumOpen(r); };
}
function canDel(r) { return r && (r.n === me.name || me.role === 'host'); }
function pdel(r) {
  ask('Eliminare questo Reel?', 'Sparisce per tutto il cerchio, con reazioni e commenti. Non si può annullare.', 'Elimina', true).then(function (y) {
    if (y && dropReel(r.id)) { sendEv({ t: 'rdel', id: r.id }); if (seq) showAt(seq.i + 1); }
  });
}
/* schermo intero di Reelta: video a tutto schermo, reazioni discrete sul lato */
function immBuild(r) {
  var box = $('immR'); box.textContent = ''; if (!r) return;
  EMO.forEach(function (e) {
    var b = el('button', r.x && r.x[me.name] === e ? 'mine' : null, e); b.setAttribute('aria-label', 'Reagisci ' + e);
    b.onclick = function () { if (party) partyReact(r.id, e); else react(r.id, e); immFloat(e); }; box.appendChild(b);
  });
  box.appendChild(el('i', 'sep'));
  var pb = el('button', null, '✨'); pb.setAttribute('aria-label', 'Trasforma in piano'); pb.onclick = function () { immSet(false); openIdea(r.id); }; box.appendChild(pb);
  if (canDel(r)) { var db = el('button', null, '🗑'); db.setAttribute('aria-label', 'Elimina Reel'); db.onclick = function () { pdel(r); }; box.appendChild(db); }
  var nb = el('button', null, '⏭'); nb.setAttribute('aria-label', 'Prossimo'); nb.onclick = function () { $('pn').click(); }; box.appendChild(nb);
}
function immFloat(e) { var st = $('st'); if (!st) return; var f = el('span', 'fl', e); f.style.left = (18 + Math.random() * 55) + '%'; st.appendChild(f); setTimeout(function () { f.remove(); }, 2100); }
function immSet(on) { $('pl').classList.toggle('imm', on); $('immR').hidden = !on; $('immX').hidden = !on; setTimeout(igFit, 30); setTimeout(igFit, 350); setTimeout(fbFit, 30); setTimeout(fbFit, 350); }
// la prima volta nel lettore: indica dov'è lo schermo intero
function fsTip() {
  if (get('fstip2', 0) || navigator.webdriver) return; put('fstip2', 1);
  var b = $('pfs'); b.classList.add('pulse'); var t = el('div', 'fstip', '⛶ Schermo intero: ora è qui sotto'); $('pl').appendChild(t);
  setTimeout(function () { b.classList.remove('pulse'); t.remove(); }, 4500);
}
// strato per lo scorrimento sopra i video incorporati (lì dentro i tocchi non ci arrivano). Dove il lettore si può comandare copre tutto e il tocco fa pausa/play;
// con Instagram e simili restano liberi il centro (per toccare il video) e si scorre dai due bordi.
function swCtl(fr) { return !!fr && /youtube(-nocookie)?\.com\/embed|tiktok\.com\/player|player\.vimeo\.com/.test(fr.src || ''); }
function swLayer(m) {
  if (!m || !m.classList || !m.classList.contains('mwrap')) return; var fr = m.querySelector('iframe'); if (!fr) return;
  if (swCtl(fr)) { var a = el('div', 'swz'); a.dataset.tap = '1'; m.appendChild(a); }
  else ['l', 'r'].forEach(function (k) { m.appendChild(el('div', 'swz ' + k)); });
}
function swToggle() {
  var fr = $('st').querySelector('iframe'); if (!fr || !fr.contentWindow) return; fr.__pz = !fr.__pz; var s = fr.src, w = fr.contentWindow, on = !fr.__pz;
  try {
    pzQuiet = Date.now();
    if (/youtube/.test(s)) w.postMessage(JSON.stringify({ event: 'command', func: on ? 'playVideo' : 'pauseVideo', args: [] }), '*');
    else if (/tiktok/.test(s)) w.postMessage({ type: on ? 'play' : 'pause', value: null, 'x-tiktok-player': true }, '*');
    else w.postMessage(JSON.stringify({ method: on ? 'play' : 'pause' }), '*');
  } catch (e) {}
  var f = el('div', 'swf', on ? '▶' : '⏸'); $('st').appendChild(f); setTimeout(function () { f.remove(); }, 750);
}
// il lettore ci dice se sta andando o è fermo (anche quando il telefono blocca la partenza automatica): così il primo tocco fa la cosa giusta
window.addEventListener('message', function (e) {
  var fr = $('st') && $('st').querySelector('iframe'); if (!fr || e.source !== fr.contentWindow) return;
  var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; } if (!d) return;
  var stt = d['x-tiktok-player'] && d.type === 'onStateChange' ? d.value : d.event === 'onStateChange' ? d.info : d.event === 'infoDelivery' && d.info && typeof d.info.playerState === 'number' ? d.info.playerState : null;
  if (typeof stt === 'number') fr.__pz = !(stt === 1 || stt === 3);
});
function swGo(d) { // d = +1 prossimo, -1 precedente
  if (!seq) return;
  if (d < 0 && seq.i <= 0) return; if (d > 0 && seq.i >= seq.q.length) { immSet(false); closeSeq(); return; }
  try { navigator.vibrate && navigator.vibrate(6); } catch (e) {}
  seq.dir = d; showAt(seq.i + d);
}
function swTip() { if (get('swtip', 0) || navigator.webdriver) return; put('swtip', 1); var t = el('div', 'swtip', '👆 Scorri in su per il prossimo'); $('pl').appendChild(t); setTimeout(function () { t.remove(); }, 4300); }
function arm() { clearTimeout(timer); var sec = +$('ps').value; if (sec && seq && seq.cur) timer = setTimeout(function () { showAt(seq.i + 1); }, sec * 1000); }
function showAt(i) {
  clearTimeout(timer); var st = $('st'); st.textContent = ''; $('pr').textContent = ''; $('immR').textContent = '';
  if (i < 0) i = 0;
  if (i >= seq.q.length) { seq.cur = null; seq.i = seq.q.length; $('pc').textContent = 'Fine'; st.appendChild(el('div', 'empty', 'Hai visto tutto per ora ✓')); return; }
  var r = find(seq.q[i]); seq.i = i;
  if (!r) { showAt(i + 1); return; }
  seq.cur = r.id; seen[r.id] = 1; put('seen', seen);
  $('pc').textContent = (i + 1) + ' di ' + seq.q.length + ', da ' + r.n;
  var m = media(r, true); if (seq.dir) m.classList.add(seq.dir > 0 ? 'sup' : 'sdn'); seq.dir = 0; st.appendChild(m); swLayer(m); pbuild(r); arm(); setTimeout(fbFit, 30); setTimeout(fbFit, 350);
  if (m.tagName === 'IFRAME' && /youtube\.com\/embed/.test(m.src)) m.addEventListener('load', function () { try { m.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*'); } catch (e) {} });
}
function openSeq() {
  setTimeout(fsTip, 1200);
  var vis = feed.filter(function (r) { return !isMuted(r.n); });
  var q = vis.filter(function (r) { return !seen[r.id] && r.n !== me.name; }).map(function (r) { return r.id; });
  if (!q.length) q = vis.map(function (r) { return r.id; });
  seq = { q: q, i: 0, cur: null };
  showPane('pl'); showAt(0);
  if ('ontouchstart' in window && !navigator.webdriver) { seq.auto = true; immSet(true); setTimeout(swTip, 900); }
}
(function () {
  var pl = $('pl'), y0 = null, x0 = 0, dy = 0;
  pl.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1 || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) { y0 = null; return; }
    y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dy = 0;
  }, { passive: true });
  var dxm = 0, tgt = null;
  pl.addEventListener('touchstart', function (e) { tgt = e.target; dxm = 0; }, { passive: true });
  pl.addEventListener('touchmove', function (e) {
    if (y0 === null) return;
    dy = e.touches[0].clientY - y0; var dx = Math.abs(e.touches[0].clientX - x0); dxm = Math.max(dxm, dx);
    if (pl.classList.contains('imm') && seq) return; // a scorrimento: niente trascinamento della scheda
    if (dy > 8 && dy > dx) { pl.classList.add('drag'); pl.style.transform = 'translateY(' + (dy * 0.7) + 'px)'; pl.style.opacity = String(Math.max(.4, 1 - dy / 600)); }
  }, { passive: true });
  pl.addEventListener('touchend', function (e) {
    if (y0 === null) return; pl.classList.remove('drag');
    if (pl.classList.contains('imm') && seq) {
      var inBar = tgt && tgt.closest && tgt.closest('#immR,#immX,.ovl,.mutb,button,a,input,select');
      if (!inBar && Math.abs(dy) > 60 && Math.abs(dy) > dxm) swGo(dy < 0 ? 1 : -1);
      else if (!inBar && Math.abs(dy) < 8 && dxm < 8 && tgt && tgt.dataset && tgt.dataset.tap) { if (e.cancelable) e.preventDefault(); var snd = $('st').querySelector('.sndp'); if (snd) { snd.click(); track('audio-tocco'); } else swToggle(); } // primo tocco: accende l'audio (su iPhone parte muto), poi pausa/play
      y0 = null; dy = 0; return;
    }
    if (dy > 110) closeSeq(); else { pl.style.transform = ''; pl.style.opacity = ''; }
    y0 = null; dy = 0;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pl.classList.contains('show')) closeSeq(); });
})();
function closeSeq() {
  if ($('pl').classList.contains('imm')) immSet(false);
  $('pl').style.transform = ''; $('pl').style.opacity = ''; clearTimeout(timer); seq = null; party = null; pzHide(); $('pzB').hidden = true; $('ps').hidden = false; $('lv').hidden = true; $('p3').hidden = true; $('cd').hidden = true; $('st').textContent = ''; showPane(tab); seqLabel(); }
window.addEventListener('message', function (e) {
  if (!seq || !seq.cur || !+$('ps').value) return;
  var fr = $('st').querySelector('iframe'); if (!fr || e.source !== fr.contentWindow) return;
  var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
  if (d && ((d.event === 'onStateChange' && d.info === 0) || (d.event === 'infoDelivery' && d.info && d.info.playerState === 0))) showAt(seq.i + 1);
});
/* ---- guardiamo insieme: stesso Reel, emoji e commenti in diretta ---- */
var party = null, pending = null, cdT = null;
function sorted() { return feed.slice().sort(function (a, b) { return (a.ts - b.ts) || (a.id < b.id ? -1 : 1); }); }
function neighbor(id, dir) { var s = sorted(), i = s.findIndex(function (r) { return r.id === id; }); return s[i + dir] ? s[i + dir].id : null; }
function sendNow(m) { if (me.role === 'host') cast(m); else if (hostConn && hostConn.open) hostConn.send(m); }
function others() { return me.role === 'host' ? conns.some(function (c) { return c.ok && c.open; }) : !!(hostConn && hostConn.open && names.length > 1); }
function floatE(e) {
  var st = $('st'); if (!party || !st) return;
  var f = el('span', 'fl', e); f.style.left = (8 + Math.random() * 75) + '%'; st.appendChild(f); setTimeout(function () { f.remove(); }, 2100);
}
function lines(r) {
  var l = $('ll'); l.textContent = '';
  (r.k || []).slice(-20).forEach(function (c) { var d = el('div'); d.appendChild(el('b', null, c.n)); d.appendChild(document.createTextNode(' ' + c.t)); l.appendChild(d); });
  l.scrollTop = l.scrollHeight;
}
function showParty(id) {
  var r = find(id); if (!r) return;
  clearTimeout(timer); seq = null; party = { id: id };
  showPane('pl');
  var st = $('st'); st.textContent = ''; st.appendChild(media(r, true));
  seen[id] = 1; put('seen', seen);
  $('pc').textContent = 'Insieme, Reel di ' + r.n; $('ps').hidden = true; $('lv').hidden = false; $('p3').hidden = false;
  pzHide(); $('pzB').hidden = false;
  var m0 = st.querySelector('iframe'); if (m0 && /youtube\.com\/embed/.test(m0.src)) m0.addEventListener('load', function () { try { m0.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*'); } catch (e) {} });
  pbuild(r); lines(r); seqLabel();
}
function goParty(id) { if (!party) track('guardiamo-insieme'); showParty(id); sendNow({ t: 'ses', a: 'go', id: id, n: me.name }); }
function partyReact(id, e) {
  var r = find(id); if (!r) return;
  if (r.x && r.x[me.name] === e) { floatE(e); sendNow({ t: 'live', e: e, n: me.name }); }
  else { react(id, e); floatE(e); }
}
function startParty() {
  if (!others()) { $('mh').textContent = 'Nessun altro è collegato adesso.'; return; }
  var s = sorted(), u = s.filter(function (r) { return !seen[r.id]; })[0] || s[s.length - 1];
  if (u) goParty(u.id);
}
function countdown(resume) {
  if (!party) return;
  var c = $('cd'), n = 3; clearTimeout(cdT); c.hidden = false; c.textContent = n;
  (function tick() { n--; if (n > 0) { c.textContent = n; cdT = setTimeout(tick, 1000); } else if (resume && canCtl()) { pzQuiet = Date.now(); frameCmd(true); c.textContent = '▶'; cdT = setTimeout(function () { c.hidden = true; }, 600); } else { c.textContent = '▶ Premi play'; cdT = setTimeout(function () { c.hidden = true; }, 1300); } })();
}
/* ---- ⏸ pausa insieme: se uno si ferma, si ferma per tutti, e gli altri sanno perché ---- */
var PZ_WHY = ['⏳ Torno subito', '💬 Parliamone', '🔁 Rivediamo un pezzo'], pzQuiet = 0, pzOn = false;
function playerEl() { var st = $('st'); return st && (st.querySelector('video') || st.querySelector('iframe')); }
function canCtl() { var m = playerEl(); return !!m && (m.tagName === 'VIDEO' || /youtube\.com\/embed|tiktok\.com\/player|player\.vimeo\.com/.test(m.src || '')); }
function frameCmd(play) {
  var m = playerEl(); if (!m) return;
  if (m.tagName === 'VIDEO') { try { if (play) m.play().catch(function () {}); else m.pause(); } catch (e) {} return; }
  var s = m.src || '', w = m.contentWindow; if (!w) return;
  try {
    if (/youtube\.com\/embed/.test(s)) w.postMessage(JSON.stringify({ event: 'command', func: play ? 'playVideo' : 'pauseVideo', args: [] }), '*');
    else if (/tiktok\.com\/player/.test(s)) (m.__pz = !play), w.postMessage({ type: play ? 'play' : 'pause', value: null, 'x-tiktok-player': true }, '*');
    else if (/player\.vimeo\.com/.test(s)) w.postMessage(JSON.stringify({ method: play ? 'play' : 'pause' }), '*');
  } catch (e) {}
}
function pzStart() {
  if (!party || pzOn) return;
  pzQuiet = Date.now(); frameCmd(false); track('pausa-insieme');
  sendNow({ t: 'ses', a: 'pause', id: party.id, n: me.name, w: '' });
  pzShow(me.name, '', true);
}
function pzWhy(w) {
  w = clean(w, 60); if (!party || !w) return;
  sendNow({ t: 'ses', a: 'pause', id: party.id, n: me.name, w: w });
  pzShow(me.name, w, true);
}
function pzGo() { if (!party) return; sendNow({ t: 'ses', a: 'play', id: party.id, n: me.name }); pzHide(); countdown(true); }
function pzShow(who, w, mine) {
  var c = $('pz'), k0 = c.querySelector('.pzw input'), kv = k0 ? k0.value : '', kf = !!k0 && k0 === document.activeElement;
  c.textContent = ''; c.hidden = false; pzOn = true;
  if (mine) {
    c.appendChild(el('b', null, w ? '⏸ In pausa per tutti' : '⏸ Come mai ti fermi?'));
    if (w) { c.appendChild(el('div', 'why', w)); c.appendChild(el('div', 'hint', 'Gli altri lo vedono sul loro schermo.')); }
    else {
      c.appendChild(el('div', 'hint', 'Il video si ferma anche per gli altri. Diglielo con un tocco:'));
      var ch = el('div', 'chips');
      PZ_WHY.forEach(function (x) { var b = el('button', 'chip', x); b.type = 'button'; b.onclick = function () { pzWhy(x); }; ch.appendChild(b); });
      var ob = el('button', 'chip', '✏️ Altro'); ob.type = 'button'; ch.appendChild(ob); c.appendChild(ch);
      var r = el('div', 'r'), inp = el('input'), go = el('button', 'btn-o', 'Invia'); r.hidden = true;
      inp.maxLength = 60; inp.placeholder = 'Scrivi il motivo…'; inp.setAttribute('aria-label', 'Il motivo della pausa');
      go.type = 'button'; go.onclick = function () { if (clean(inp.value, 60)) pzWhy(inp.value); };
      inp.onkeydown = function (e) { if (e.key === 'Enter') go.click(); };
      ob.onclick = function () { r.hidden = false; inp.focus(); };
      r.appendChild(inp); r.appendChild(go); c.appendChild(r);
    }
  } else {
    c.appendChild(el('b', null, '⏸ ' + who + ' ha messo in pausa'));
    c.appendChild(el('div', w ? 'why' : 'hint', w || 'Sta scegliendo il perché…'));
    if (!canCtl()) c.appendChild(el('div', 'hint', 'Questo video non si ferma da solo: mettilo in pausa anche tu.'));
  }
  // in pausa si parla: gli ultimi commenti e un campo per scrivere, senza dover riprendere il video
  var pl = el('div', 'pzl'); pl.id = 'pzl'; c.appendChild(pl); pzLines();
  var rw = el('div', 'r pzw'), pi = el('input'), ps = el('button', 'btn-o', 'Invia');
  pi.maxLength = 300; pi.placeholder = 'Scrivi qualcosa…'; pi.setAttribute('aria-label', 'Scrivi durante la pausa'); ps.type = 'button';
  ps.onclick = function () { var v = clean(pi.value, 300); if (v && party) { comment(party.id, v); pi.value = ''; } };
  pi.onkeydown = function (e) { if (e.key === 'Enter') ps.click(); };
  rw.appendChild(pi); rw.appendChild(ps); c.appendChild(rw); if (kv) pi.value = kv; if (kf) pi.focus({ preventScroll: true });
  var b2 = el('button', 'btn go', '▶ Riprendi insieme'); b2.type = 'button'; b2.onclick = pzGo; c.appendChild(b2);
}
function pzLines() { var L = $('pzl'); if (!L) return; L.textContent = ''; var src = $('ll').children; [].slice.call(src, -3).forEach(function (x) { L.appendChild(x.cloneNode(true)); }); L.hidden = !L.children.length; }
new MutationObserver(function () { if (pzOn) pzLines(); }).observe($('ll'), { childList: true });
function pzHide() { var c = $('pz'); if (c) { c.hidden = true; c.textContent = ''; } pzOn = false; }
// se qualcuno mette in pausa direttamente dal video (YouTube, TikTok), vale come ⏸
window.addEventListener('message', function (e) {
  if (!party || pzOn || Date.now() - pzQuiet < 1800) return;
  var m = playerEl(); if (!m || m.tagName !== 'IFRAME' || e.source !== m.contentWindow) return;
  var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; } if (!d) return;
  var yt2 = (d.event === 'onStateChange' && d.info === 2) || (d.event === 'infoDelivery' && d.info && d.info.playerState === 2);
  var tk2 = d['x-tiktok-player'] && d.type === 'onStateChange' && d.value === 2;
  if (yt2 || tk2) pzStart();
});
function onSes(d, who) {
  if (d.a === 'go' && typeof d.id === 'string' && find(d.id)) {
    if (party) showParty(d.id);
    else { pending = { id: d.id }; $('it').textContent = who + ' vuole guardare i Reel insieme a te'; $('ib').hidden = false; clearTimeout(window.__ibT); window.__ibT = setTimeout(function () { $('ib').hidden = true; pending = null; }, 120000); }
    return { t: 'ses', a: 'go', id: d.id, n: who };
  }
  if (d.a === 'ready') { countdown(); return { t: 'ses', a: 'ready', n: who }; }
  if (d.a === 'pause' && typeof d.id === 'string') {
    var w = PZ_WHY.indexOf(d.w) >= 0 ? d.w : clean(d.w, 60);
    if (party && party.id === d.id) { pzQuiet = Date.now(); frameCmd(false); pzShow(who, w, false); }
    return { t: 'ses', a: 'pause', id: d.id, n: who, w: w };
  }
  if (d.a === 'play' && typeof d.id === 'string') {
    if (party && party.id === d.id) { pzHide(); countdown(true); }
    return { t: 'ses', a: 'play', id: d.id, n: who };
  }
  return null;
}
function isInvite(u) { u = String(u || ''); return /#j=/.test(u) || u.indexOf(location.origin + location.pathname.replace(/index\.html$/, '')) === 0 || /github\.io\/Loopix|joinreelta\.github\.io/i.test(u); }
var skippedInv = 0;
function links(t) {
  var out = [], m, re = /https?:\/\/[^\s<>"']+/g; skippedInv = 0;
  while ((m = re.exec(String(t || ''))) && out.length < 20) { var u = safeUrl(m[0].replace(/[.,;:!?)\]]+$/, '')); if (u && isInvite(u)) { skippedInv++; continue; } if (u && out.indexOf(u) < 0) out.push(u); }
  return out;
}
function postAll(t, c) {
  if (tryDev(t)) return 0;
  var L = links(t), L0 = L.length;
  L = L.filter(function (u) { return !feed.some(function (r) { return r.u === u && me && r.n === me.name && Date.now() - (+r.ts || 0) < 60000; }); }); // doppio tocco: lo stesso Reel parte una volta
  if (L0 && !L.length) { $('mh').textContent = LXT('Già mandato ✓'); return 0; }
  if (!L.length && skippedInv) {
    var jm = /#j=([\w-]{8,100})/.exec(String(t || ''));
    if (jm) { var jh = jm[1].split('_')[0];
      if (me && jh === me.hostId) { $('mh').textContent = 'Questo è il tuo invito: mandalo alla persona che vuoi invitare.'; return 0; }
      ask('Hai copiato un invito di Reelta', circleOfHost(jh) ? 'Sei già in quel cerchio: te lo apro.' : 'Vuoi entrare in questo nuovo cerchio? I tuoi cerchi di adesso restano come sono.', circleOfHost(jh) ? 'Apri' : 'Entra').then(function (y) { if (y) { location.hash = '#j=' + jm[1]; safeReload(); } });
      return 0; }
    $('mh').textContent = 'Questo è un invito di Reelta, non un Reel: non lo metto tra i Reel.'; return 0;
  }
  if (!L.length) { $('mh').textContent = 'Non trovo nessun link. In Instagram o TikTok tocca Condividi e poi “Copia link”.'; return 0; }
  (async function () {
    for (var i = 0; i < L.length; i++) post(await resolveShort(L[i]), L.length === 1 ? c : '');
    if (L.length > 1) $('mh').textContent = L.length + ' Reel aggiunti.';
    try { soloNudge(L[0], c); } catch (e) {}
  })();
  return L.length;
}
function post(u, c) {
  var url = safeUrl(u);
  if (!url) { $('mh').textContent = 'Serve un link che inizi con http o https.'; return; }
  $('mh').textContent = '';
  var r = { id: uid(8), u: url, c: clean(c, 300), n: me.name, ts: Date.now() };
  tcount('r');
  try { track('reel-' + (new URL(url).hostname.replace(/^(www|m|vm|vt)\./, '').split('.')[0] || 'altro')); } catch (e) {}
  addReel(r, true);
  if (me.role === 'host') cast({ t: 'reel', r: r });
  else if (hostConn && hostConn.open) { hostConn.send({ t: 'reel', r: r }); if (srvOn()) mbToHost({ t: 'reel', r: r }, null, true); }
  else if (srvOn()) { mbToHost({ t: 'reel', r: r }, function () { outbox.push(r); put('outbox', outbox); }); $('mh').textContent = 'Mandato: arriva appena l’altra persona apre Reelta.'; }
  else { outbox.push(r); put('outbox', outbox); $('mh').textContent = 'In coda: partirà appena sei collegato.'; }
  if (/(^|\.)(facebook\.com|fb\.watch)$/.test((function () { try { return new URL(url).hostname.replace(/^(www|m)\./, ''); } catch (e) { return ''; } })()) && !get('fbtip', 0)) {
    put('fbtip', 1); setTimeout(function () { ask('Un consiglio sui video di Facebook', 'Facebook spesso non lascia vedere i suoi video dentro altre app: si aprono a parte. Se lo stesso video c’è su Instagram o TikTok, mandalo da lì: si vede direttamente qui.', 'Ok'); }, 600);
  }
}

