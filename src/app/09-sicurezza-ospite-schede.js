/* ---- sicurezza: identità verificata in entrambe le direzioni ---- */
function hex(b) { return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join(''); }
function idOf(k) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode('loopix-id:' + k)).then(function (h) { return hex(h).slice(0, 24); }); }
function hmac(k, m) { return crypto.subtle.importKey('raw', new TextEncoder().encode(k), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']).then(function (key) { return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(m)); }).then(hex); }
function keyOfId(id) { var ks = Object.keys(allowed); return Promise.all(ks.map(idOf)).then(function (ids) { var i = ids.indexOf(String(id)); return i >= 0 ? ks[i] : null; }); }
var INV_MS = 24 * 60 * 60 * 1000; // un invito vale 24 ore
function codesNow() { var cs = get('codes', []), now = Date.now(), ch = false; cs = cs.map(function (x) { if (typeof x === 'string') { ch = true; return { c: x, ts: now }; } return x; }).filter(function (x) { return x && x.c && now - x.ts < INV_MS; }); if (ch) put('codes', cs); return cs; }
function validCode(code) { return codesNow().some(function (x) { return x.c === code; }); }
function hostHi(c, d) {
        var nm = clean(d.n, 30) || 'Ospite', k = typeof d.k === 'string' ? d.k.slice(0, 40) : '';
        conns.filter(function (x) { return k && x.k === k; }).forEach(function (x) { conns = conns.filter(function (y) { return y !== x; }); try { x.close(); } catch (e) {} });
        var known = k && allowed[k], code = typeof d.c === 'string' ? d.c.slice(0, 20) : '', codes = [];
        function refuse(why) { try { c.send({ t: 'no', why: why }); } catch (e) {} setTimeout(function () { try { c.close(); } catch (e) {} }, 400); }
        function accept() {
          var prevN = known && allowed[k] !== nm ? allowed[k] : null;
          if (prevN && people().indexOf(nm) >= 0) nm = prevN; // nome già usato da un altro: resta quello di prima
          if (k) { if (!known) { track('ospite-accettato'); setTimeout(starterAuto, 2500); } allowed[k] = nm; put('allowed', allowed); }
          if (prevN && prevN !== nm) { renameIn(prevN, nm); Object.keys(aka).forEach(function (o) { if (aka[o] === prevN) aka[o] = nm; }); aka[prevN] = nm; put('aka', aka); cast({ t: 'ren', a: prevN, b: nm }); }
          if (code && srvOn()) mbBox(me.hostId + '_' + code, 'w').then(function (b) { return mbCall({ a: 'ack', box: b, upto: 9e15 }); }).catch(function () {}); // il pacchetto di benvenuto non serve più
          c.ok = true; c.name = nm; c.k = k; if (!c.virt) conns.push(c); if (!known && srvOn()) pushSync(); ntQuietUntil = Date.now() + 3000; trillOut(c);
          c.send({ t: 'hello', ck: circleKey(), all: roster(), ttl: ttlMs(), max: cap() + 1, gone: gone.slice(-200), msgs: msgs.slice(-200), feed: feed.slice(-100), ideas: ideas.slice(-100), people: people(), pics: pics, aka: aka }); cast({ t: 'people', people: people() }); status();
          actLog('join', nm, '', ''); $('mh').textContent = nm + ' è nel cerchio ✓'; if (!feed.length) render(); setTimeout(function () { if ($('mh').textContent.indexOf(nm) === 0) $('mh').textContent = ''; }, 6000);
        }
        if (!known && code && validCode(code)) {
          var same = Object.keys(allowed).filter(function (x) { return allowed[x].toLowerCase() === nm.toLowerCase(); })[0];
          if (same) { delete allowed[same]; conns.filter(function (x) { return x.k === same; }).forEach(function (x) { conns = conns.filter(function (y) { return y !== x; }); try { x.close(); } catch (e) {} }); put('allowed', allowed); }
        }
        if (known) { accept(); return; }
        if (Object.keys(allowed).length >= cap()) {
          refuse('Questo invito era per un cerchio già completo. ' + me.name + ' ti sta mandando quello giusto: aprilo appena arriva.');
          ask(nm + ' ha aperto un invito sbagliato', (me.kind === 'group' ? 'Questo gruppo è al completo.' : 'Era l’invito di un cerchio già completo.') + ' Ti preparo un gruppo e apro l’invito da rimandare a ' + nm + '.', 'Sistema e rimanda invito').then(function (y) { if (y) goGroupInvite(); });
          return;
        }
        if (code && validCode(code)) { accept(); return; }
        try { c.send({ t: 'wait', why: code ? '⏱️ Il tuo pass è scaduto (valeva 24 ore). Ho chiesto a ' + me.name + ' di farti entrare: aspetta un attimo, oppure chiedigli un nuovo invito.' : 'Aspetta un attimo: ' + me.name + ' deve farti entrare.' }); } catch (e) {}
        try { navigator.vibrate && navigator.vibrate(200); } catch (e) {}
        ask(nm + ' vuole entrare', 'Vuoi accettare ' + nm + ' nel tuo cerchio?', 'Accetta').then(function (y) {
          if (!c.open) return;
          if (!y) { refuse('Richiesta non accettata.'); return; }
          if (Object.keys(allowed).length >= cap()) { refuse('Il cerchio è pieno.'); return; }
          accept();
        });
}
function invLang() { var v = ''; try { v = localStorage.getItem(LSG + 'invLang') || ''; } catch (e) {} return /^(it|en|es)$/.test(v) ? v : (window.LX_LANG || 'it'); }
function homeUrl() { return window.MIG_HOME && location.protocol.indexOf('http') === 0 && !/^(localhost|127\.)/.test(location.hostname) ? window.MIG_HOME : location.origin + location.pathname.replace(/index\.html$/, ''); } // i link da mandare puntano sempre al nuovo indirizzo
// pacchetto di benvenuto: quando nasce un invito, il creatore lascia nella casella dell'invito (cifrata con il codice del link)
// lo stato del cerchio. Chi apre il link entra subito anche se il creatore ha Reelta chiusa; il creatore lo registra appena la riapre.
function welcomePut(c) {
  if (!srvOn() || !me || me.role !== 'host') return;
  try {
    var h = slimHello({ t: 'hello', w: 1, ck: circleKey(), all: roster(), ttl: ttlMs(), max: cap() + 1, gone: gone.slice(-200), msgs: msgs.slice(-200), feed: feed.slice(-100), ideas: ideas.slice(-100), people: people(), pics: {}, aka: aka });
    mbPut(me.hostId + '_' + c, 'w', h, true).catch(function () {});
  } catch (e) {}
}
function link(lg) { var cs = codesNow(), c = uid(5); cs.push({ c: c, ts: Date.now() }); put('codes', cs.slice(-10)); welcomePut(c); return homeUrl() + '#j=' + me.hostId + '_' + c + (lg ? '&l=' + lg : '') + '&n=' + encodeURIComponent(clean(me.name, 30)); }
function invLangUI() {
  var box = $('invL'); if (!box) return; box.textContent = '';
  [['it', '🇮🇹 Italiano'], ['en', '🇬🇧 English'], ['es', '🇪🇸 Español']].forEach(function (x) {
    var b = el('button', 'chip', x[1]); b.type = 'button'; b.style.padding = '6px 10px'; b.setAttribute('aria-pressed', String(invLang() === x[0]));
    b.onclick = function () { lsSet(LSG + 'invLang', x[0]); invLangUI(); };
    box.appendChild(b);
  });
}
var INV_CTX = null; // il reel da cui parte l'invito: arriva insieme al link
function invText() {
  var sc = homeUrl() + 'scopri.html';
  if (INV_CTX) return '🎬 ' + (INV_CTX.t ? INV_CTX.t + '\n' : '') + INV_CTX.u + '\n\n' + invText0();
  return invText0();
}
function invText0() {
  var lg = invLang(), T = lg === 'it' ? String : (window.LX_TL ? function (x) { return window.LX_TL(x, lg); } : (window.LX_T || String));
  return T('Ciao! ' + me.name + ' ti invita su Reelta 🔒, il nostro posto privato per Reel e piani.\n\n👉 Tocca il link e scrivi il tuo nome, fatto:\n' + link(lg) + '\n\n⏱️ Vale 24 ore.');
}
function invite() { try { window.LX_NEEDD && window.LX_NEEDD(); } catch (e) {}
  if (me.role !== 'host') return;
  if (Object.keys(allowed).length >= cap() && !(arguments[0] && arguments[0].again)) {
    var grp = me.kind === 'group' || me.kind === 'big', mem = Object.keys(allowed).map(function (k) { return allowed[k]; });
    sheet(grp ? 'Il gruppo è al completo' : 'Il cerchio è completo', 'Se con ' + mem.join(', ') + ' non vi collegate, rimanda l’invito: aprendolo, il suo telefono si ricollega a questo cerchio senza perdere niente.', [
      { t: '🔗 Rimanda l’invito a ' + (mem.length === 1 ? mem[0] : 'chi è nel cerchio'), f: function () { invite({ again: true }); } },
      { t: grp ? 'Crea un nuovo gruppo e invita' : 'Invita altre persone in un gruppo', f: goGroupInvite }
    ]);
    return;
  }
  if (Object.keys(allowed).length >= cap() && !(arguments[0] && arguments[0].again)) { // «Rimanda l’invito» deve arrivare al link, non al Trio
    var grp = me.kind === 'group' || me.kind === 'big';
    ask(grp ? 'Questo gruppo è al completo' : 'Il cerchio è già completo', grp ? 'Ti preparo un nuovo gruppo e apro subito l’invito da mandare.' : 'Per invitare altre persone ti preparo un gruppo, separato da questo cerchio, e apro subito l’invito da mandare.', grp ? 'Crea nuovo gruppo e invita' : 'Vai al gruppo e invita').then(function (y) { if (y) goGroupInvite(); });
    return;
  }
  var left = cap() - Object.keys(allowed).length;
  if (left <= 0) { $('invT').textContent = 'Rimanda l’invito'; $('invS').textContent = 'Mandalo a chi è già nel cerchio: aprendolo si ricollega. Il link vale 24 ore.'; $('invH').textContent = ''; invLangUI(); $('invM').classList.add('open'); return; }
  $('invT').textContent = LXT(me.kind === 'group' || me.kind === 'big' ? 'Invita qualcuno nel gruppo' : 'Invita la tua persona');
  $('invS').textContent = (left > 1 ? LXT('Posti liberi:') + ' ' + left + '.' : LXT('C’è ancora 1 posto.')) + ' ' + LXT('Il link vale 24 ore.');
  $('invH').textContent = ''; invLangUI(); $('invM').classList.add('open');
}
function invDone(m) { track('invito-inviato'); $('invH').textContent = m; }
// Apre direttamente l'app WhatsApp (dall'app sulla Home l'indirizzo wa.me resta bloccato su una pagina bianca)
function openWA(text, done, fail) {
  try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {}); } catch (e) {}
  if (/iphone|ipad|ipod|android/i.test(navigator.userAgent)) {
    var left = false, onHide = function () { if (document.hidden) left = true; };
    document.addEventListener('visibilitychange', onHide);
    location.href = 'whatsapp://send?text=' + encodeURIComponent(text);
    setTimeout(function () { document.removeEventListener('visibilitychange', onHide); if (left) done(); else fail(); }, 1600);
  } else { window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener'); done(); }
}
$('invWA').onclick = function () { openWA(invText(), function () { invDone('Si è aperto WhatsApp: scegli la persona e premi invia.'); }, function () { invDone('WhatsApp non si è aperto, ma l’invito è già copiato: incollalo in una chat, oppure usa “Altre app…”.'); }); };
$('invSh').onclick = function () { if (navigator.share) navigator.share({ title: 'Reelta', text: invText() }).then(function () { invDone('Invito inviato.'); }).catch(function () {}); else $('invCp').click(); };
$('invCp').onclick = function () { var t = invText(); if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { invDone('Copiato ✓ Ora incollalo in un messaggio a chi vuoi invitare.'); }, function () { $('invH').textContent = t; }); else $('invH').textContent = t; };
$('invX').onclick = function () { $('invM').classList.remove('open'); INV_CTX = null; };
// Da soli? Il reel appena mandato diventa l'invito: arriva su WhatsApp con il video e il link per entrare.
var soloT = 0;
function soloNudge(u, t) {
  if (!me || me.role !== 'host' || Object.keys(allowed).length || Date.now() - soloT < 120000 || navigator.webdriver && !window.__soloTest) return;
  soloT = Date.now();
  sheet('👀 ' + LXT('Per ora lo vedi solo tu'), LXT('Mandalo a chi vuoi: arriva su WhatsApp con il video e un link per entrare con te in Reelta.'), [
    { ic: 'chat', t: LXT('Mandalo alla tua persona'), f: function () { INV_CTX = { u: u, t: clean(t || '', 80) }; track('invito-da-reel'); invite(); } },
    { t: LXT('Più tardi'), f: function () {} }
  ]);
}

/* ---- ospite ---- */
function startGuest() {
  if (!window.Peer) { var pj = document.getElementById('pjs'); if (pj && !startGuest.w) { startGuest.w = 1; pj.addEventListener('load', function () { startGuest.w = 0; if (me && !peer) startGuest(); }, { once: true }); } return; }
  peer = new Peer();
  peer.on('disconnected', function () { again(); });
  peer.on('error', function (e) { $('mh').textContent = e.type === 'peer-unavailable' ? (srvOn() && !me.joined ? 'Chi ti ha invitato ha Reelta chiusa: gli ho mandato un avviso. Entri da solo appena la apre, anche se chiudi l’app.' : (srvOn() ? (get('hn', '') || 'Chi ti ha invitato') + ' ora ha Reelta chiusa: quello che mandi arriva lo stesso.' : 'Chi ti ha invitato non ha Reelta aperta in questo momento. Chiedigli di aprirla: ti colleghi da solo appena lo fa.')) : 'Problema di rete (' + e.type + ').'; if (e.type === 'peer-unavailable' && !me.joined) srvJoin(); again(); });
  peer.on('open', function () {
    hostConn = peer.connect(me.hostId, { reliable: true }); var hc = hostConn; hc.auth = !me.joined || !!me.rejoin; hc.ng = uid(16);
    hostConn.on('open', function () {
      if (me.joined && !me.rejoin) idOf(me.tok).then(function (id) { hc.send({ t: 'hi', n: me.name, id: id, ng: hc.ng }); });
      else hostConn.send({ t: 'hi', n: me.name, k: me.tok, c: me.code || '' }); if (!names.length) $('mh').textContent = 'Collegato. Un attimo che entri nel cerchio…'; });
    hostConn.on('data', function (d) {
      if (!d || typeof d !== 'object') return;
      if (!hc.auth) {
        if (d.t === 'ch' && typeof d.ph === 'string') {
          hmac(me.tok, 'h' + hc.ng).then(function (ph) {
            if (ph !== d.ph) { hc.bad = true; $('mh').textContent = '⚠️ Qualcuno ha provato a fingersi il creatore del cerchio: non ti ho collegato. I tuoi dati sono al sicuro.'; try { hc.close(); } catch (e) {} return; }
            hc.auth = true; hmac(me.tok, 'g' + d.nh).then(function (pg) { hc.send({ t: 'pr', pg: pg }); });
          });
        } else if (d.t === 'no') { blocked = true; clearTimeout(retry); $('mh').textContent = clean(d.why, 180); status(); }
        return;
      }
      guestData(d);
    });
    hostConn.on('close', function () { status(); again(); });
  });
}
// tutto ciò che arriva a un membro dal creatore: dal collegamento diretto o dalla casella del server
function guestData(d) {
      if ((d.t === 'hello' || d.t === 'people') && Array.isArray(d.all)) put('all', d.all.slice(0, 50).map(function (x) { return clean(x, 30); }).filter(Boolean));
      if ((d.t === 'hello' || d.t === 'people') && typeof d.ck === 'string' && /^[a-f0-9]{32}$/.test(d.ck) && d.ck !== get('ck', '')) { put('ck', d.ck); put('cbAt', 0); setTimeout(pushSync, 1500); }
      if (d.t === 'hello') ntQuietUntil = Date.now() + 3000;
      if (d.t === 'hello' && (!me.joined || me.rejoin)) { me.joined = true; delete me.rejoin; if (d.w) me.pend = 1; put('me', me); }
      else if (d.t === 'hello' && !d.w && me.pend) { delete me.pend; put('me', me); }
      if (d.t === 'hello') { actQuiet = !feed.length; try { circMax = +d.max || 0; if (typeof d.ttl === 'number') put('ttl', d.ttl); (Array.isArray(d.msgs) ? d.msgs : []).forEach(function (m) { addMsg(m); }); (Array.isArray(d.gone) ? d.gone : []).forEach(function (g) { if (typeof g === 'string') dropReel(g); }); (Array.isArray(d.feed) ? d.feed : []).forEach(addReel); (Array.isArray(d.ideas) ? d.ideas : []).forEach(function (i) { applyIdea({ a: 'add', i: i }, null); }); names = (d.people || []).map(function (x) { return clean(x, 30); }); } finally { actQuiet = false; } status(); $('mh').textContent = '';
        var ob = outbox; outbox = []; put('outbox', []); ob.forEach(function (o) { gSend(o && o.t ? o : { t: 'reel', r: o }); }); if (tab === 'chat') renderChat(true);
        if (!d.w) clearTimeout(joinT); if (srvOn() && pushOK() && Notification.permission === 'granted') pushSync();
        if (d.aka && typeof d.aka === 'object') Object.keys(d.aka).slice(0, 50).forEach(function (o) { renameIn(o, d.aka[o]); });
        if (d.pics && typeof d.pics === 'object') Object.keys(d.pics).slice(0, 20).forEach(function (n) { if (n !== me.name) setPic(n, d.pics[n]); });
        if (me.pic !== undefined) gSend({ t: 'pf', p: me.pic || '' });
        var hasH = {}; (Array.isArray(d.feed) ? d.feed : []).forEach(function (r) { if (r && r.id) hasH[r.id] = 1; }); (Array.isArray(d.gone) ? d.gone : []).forEach(function (g) { hasH[g] = 1; });
        var miss = feed.filter(function (r) { return !hasH[r.id]; }).slice(-100);
        if (miss.length && (d.feed || []).length < 100 && hostConn && hostConn.open) hostConn.send({ t: 'back', feed: miss }); }
      else if (d.t === 'no') { if (!me.joined) { blocked = true; clearTimeout(retry); clearTimeout(joinT); } $('mh').textContent = clean(d.why, 180); status(); }
      else if (d.t === 'wait') { if (!me.joined) $('mh').textContent = clean(d.why, 180); }
      else if (d.t === 'ren' && typeof d.a === 'string' && typeof d.b === 'string') renameIn(d.a, d.b);
      else if (d.t === 'pf' && typeof d.n === 'string') { if (d.n !== me.name) setPic(d.n, d.p); }
      else if (d.t === 'trill' && typeof d.n === 'string') trillIn(clean(d.n, 30));
      else if (d.t === 'people') { var nb = names.slice(); names = (d.people || []).map(function (x) { return clean(x, 30); }); if (nb.length) names.forEach(function (x) { if (nb.indexOf(x) < 0) actLog('join', x, '', ''); }); put('ppl', get('all', null) || names); status(); trillOut(hostConn); trUI(); }
      else if (d.t === 'tr' && typeof d.n === 'string') { if (d.n !== me.name) trIn(clean(d.n, 30), d); }
      else if (d.t === 'reel') addReel(d.r);
      else if (d.t === 'rdel' && typeof d.id === 'string') dropReel(d.id);
      else if (d.t === 'msg') addMsg(d.m);
      else if (d.t === 'seen') applySeen(d.n, d.ts);
      else if (d.t === 'cfg') { if (typeof d.ttl === 'number') { put('ttl', d.ttl); renderChat(true); } }
      else if (d.t === 'mdel' && typeof d.id === 'string') delMsg(d.id, false);
      else if (d.t === 'mpin' && typeof d.id === 'string') pinMsg(d.id, !!d.on, false, clean(d.n, 30) || '?');
      else if (d.t === 'wait') $('mh').textContent = clean(d.why, 180);
      else if (d.t === 'react' || d.t === 'cmt' || d.t === 'sumq' || d.t === 'sum') applyEv(d, null);
      else if (d.t === 'ses') onSes(d, clean(d.n, 30) || 'Qualcuno');
      else if (d.t === 'live' && EMO.indexOf(d.e) >= 0) floatE(d.e);
      else if (d.t === 'idea') applyIdea(d, null);
      else if (d.t === 'no') { blocked = true; clearTimeout(retry); $('mh').textContent = clean(d.why, 180); status(); }
}
function again() { if (blocked) return; clearTimeout(retry); retry = setTimeout(function () { try { peer.destroy(); } catch (e) {} startGuest(); }, 5000); }

/* ---- schede ---- */
var tab = 'main', ideaSeen = 0, blocked = false;
function stopFeed() {
  document.querySelectorAll('#feed iframe').forEach(function (f) { var u = f.src; f.src = 'about:blank'; f.dataset.u = u; setTimeout(function () { f.src = f.dataset.u; }, 50); });
  document.querySelectorAll('#feed video').forEach(function (v) { try { v.pause(); } catch (e) {} });
}
// nessun video resta acceso dietro le quinte: cambiando schermata o uscendo dall'app si fermano tutti
function pauseFrame(f) {
  var s = f.src || '', w = f.contentWindow; if (!w) return;
  try {
    if (/youtube(-nocookie)?\.com\/embed/.test(s)) w.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
    else if (/tiktok\.com\/player/.test(s)) { f.__pz = true; w.postMessage({ type: 'pause', value: null, 'x-tiktok-player': true }, '*'); }
    else if (/player\.vimeo\.com/.test(s)) w.postMessage(JSON.stringify({ method: 'pause' }), '*');
    else if (/instagram\.com|facebook\.com|dailymotion|twitch|spotify/.test(s)) { f.dataset.u = s; f.src = 'about:blank'; setTimeout(function () { if (f.isConnected && f.dataset.u) f.src = f.dataset.u; }, 60); }
  } catch (e) {}
}
function pauseIn(root) {
  if (!root) return;
  root.querySelectorAll('video,audio').forEach(function (v) { try { v.pause(); } catch (e) {} });
  root.querySelectorAll('iframe').forEach(pauseFrame);
}
// nel feed suona un video solo: se ne tocchi un altro, o se quello acceso esce dallo schermo, si ferma
var liveF = [], liveT = 0;
function feedLive(f) { // f = il video appena toccato: gli altri accesi si fermano
  try { pzQuiet = Date.now(); } catch (e) {}
  liveF.forEach(function (o) { if (o !== f && o.isConnected) pauseFrame(o); }); liveF = f && f.tagName === 'IFRAME' ? [f] : [];
  document.querySelectorAll('#feed video,#feed audio').forEach(function (v) { if (v !== f && !v.paused) try { v.pause(); } catch (e) {} });
  // finché un video del feed è acceso, controllo se il tocco passa a un altro (tra due video incorporati il telefono non avvisa)
  clearInterval(liveT); if (liveF.length) liveT = setInterval(function () { var a = document.activeElement; if (!liveF.length || !liveF[0].isConnected) { clearInterval(liveT); liveF = []; return; } if (a && a.tagName === 'IFRAME' && a !== liveF[0] && a.closest('#feed')) feedLive(a); }, 500);
}
window.addEventListener('blur', function () { setTimeout(function () { var f = document.activeElement; if (f && f.tagName === 'IFRAME' && f.closest('#feed') && liveF[0] !== f) feedLive(f); }, 0); });
document.addEventListener('play', function (e) { var v = e.target; if (v && v.closest && v.closest('#feed')) feedLive(v); }, true);
var feedScT = 0;
function feedScroll() {
  if (feedScT) return; feedScT = setTimeout(function () { feedScT = 0;
    var fr = $('feed').getBoundingClientRect(), out = function (n) { var r = n.getBoundingClientRect(); return Math.min(r.bottom, fr.bottom) - Math.max(r.top, fr.top) < r.height * 0.4; }; // meno del 40% ancora visibile nel feed
    liveF = liveF.filter(function (f) { if (!f.isConnected) return false; if (out(f)) { try { pzQuiet = Date.now(); } catch (e) {} pauseFrame(f); return false; } return true; });
    document.querySelectorAll('#feed video,#feed audio').forEach(function (v) { if (!v.paused && out(v)) try { v.pause(); } catch (e) {} });
  }, 250);
}
document.addEventListener('scroll', function (e) { if (e.target && e.target.id === 'feed') feedScroll(); }, true);
function pauseAll() { try { pzQuiet = Date.now(); } catch (e) {} pauseIn(document); }
document.addEventListener('visibilitychange', function () { if (document.hidden) pauseAll(); });
window.addEventListener('pagehide', pauseAll);
function showPane(id) {
  if (id !== 'pl' && $('pl').classList.contains('show')) { try { pzQuiet = Date.now(); } catch (e) {} pauseIn($('st')); }
  if (id !== 'chat') pauseIn($('chat'));
  if (id === 'style') try { trUI(); } catch (e) {}
  if (id !== 'main') stopFeed();
  ['setup', 'main', 'pl', 'xpl', 'ideas', 'circle', 'style', 'prof', 'chat'].forEach(function (p) { $(p).classList.toggle('show', p === id); });
  var on = id !== 'setup' && id !== 'pl';
  document.querySelector('header').hidden = id === 'pl';
  $('tabs').hidden = !on;
  if (!on) return;
  tab = id;
  document.querySelectorAll('#tabs button[data-p]').forEach(function (b) { if (b.dataset.p === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  if (id === 'ideas') { ideaSeen = 0; ideaTab(); renderIdeas(); }
  if (id === 'chat') { chatSeen = 0; put('chatAt', Date.now()); chatTab(); renderChat(); renderNov(); }
  if (id === 'circle') renderCircle();
  if (id === 'xpl') { xplBuild(); var q0 = xplQ; xplQ = ''; if (q0) inspLoad(q0); else if (!$('inspL').children.length) inspLoad('§oggi'); }
  if (id === 'style' || id === 'prof') renderStyle();
}
var msgs = get('msgs', []), chatSeen = 0;
if (!get('chatAt', 0)) put('chatAt', Date.now());
function appBadge() {
  try { var n = (typeof newCount === 'function' ? newCount() : 0) + (chatSeen || 0); if (!navigator.setAppBadge) return; if (n > 0) navigator.setAppBadge(n).catch(function () {}); else navigator.clearAppBadge().catch(function () {}); } catch (e) {}
}
function chatTab() { appBadge(); if (tab !== 'chat') renderNov(); $('tChat').textContent = chatSeen ? 'Messaggi (' + chatSeen + ')' : 'Messaggi'; }
var lastSeenSent = 0;
function rcptOn() { return get('rcpt', null) === null ? !get('riserv', 0) : !!get('rcpt', 1); }
function ttlMs() { return +get('ttl', 0) || 0; }
function pruneMsgs() { var t = ttlMs(); if (!t) return; var lim = Date.now() - t, n = msgs.length; msgs = msgs.filter(function (m) { return m.pin || m.ts >= lim; }); if (msgs.length !== n) put('msgs', msgs); }
// tiene al massimo 300 messaggi, ma i fissati non si buttano mai
function trimMsgs() { while (msgs.length > 300) { var i = -1; for (var j = 0; j < msgs.length; j++) if (!msgs[j].pin) { i = j; break; } if (i < 0) break; msgs.splice(i, 1); } }
function pinOpt(m) { return { t: m.pin ? '📌 Togli dai fissati' : '📌 Fissa (resta sempre)', f: function () { pinMsg(m.id, !m.pin, true); } }; }
function pinMsg(id, on, spread, who) {
  var m = msgs.filter(function (x) { return x.id === id; })[0]; if (!m) return false;
  var nv = on ? clean(who || me.name, 30) : ''; if ((m.pin || '') === nv) return false;
  m.pin = nv; put('msgs', msgs); if (m.a) { if (nv) mediaKeep(m.a, m.n === me.name); else idbDel(m.a.id); } renderChat(true); if ($('pinM').classList.contains('open')) pinRender();
  if (spread) { var ev = { t: 'mpin', id: id, on: !!on, n: me.name }; if (me.role === 'host') cast(ev); else sendEv(ev); if (on) $('mh').textContent = '📌 Fissato: lo trovi in Messaggi → Fissati.'; }
  return true;
}
function pinRender() {
  var q = clean($('pinQ').value, 60).toLowerCase(), L = $('pinL'); L.textContent = '';
  var vis = msgs.filter(function (m) { return !isMuted(m.n); });
  var pins = vis.filter(function (m) { return m.pin && (!q || m.t.toLowerCase().indexOf(q) >= 0); }).reverse();
  var rest = q ? vis.filter(function (m) { return !m.pin && m.t.toLowerCase().indexOf(q) >= 0; }).reverse().slice(0, 40) : [];
  var row = function (m) {
    var b = el('button', 'pinr'); b.appendChild(el('b', null, (m.pin ? '📌 ' : '') + m.n + ' · ' + ago(m.ts)));
    var t = m.t, i = q ? t.toLowerCase().indexOf(q) : -1;
    if (i >= 0) { b.appendChild(document.createTextNode(t.slice(0, i))); b.appendChild(el('mark', null, t.slice(i, i + q.length))); b.appendChild(document.createTextNode(t.slice(i + q.length))); } else b.appendChild(document.createTextNode(t));
    b.onclick = function () { $('pinM').classList.remove('open'); goMsg(m.id); }; L.appendChild(b);
  };
  if (pins.length) pins.forEach(row);
  else L.appendChild(el('p', 'hint', q ? 'Nessun messaggio fissato con questa parola.' : 'Nessun messaggio fissato. Tocca un messaggio importante e scegli “📌 Fissa”: lo ritrovi qui e non sparisce.'));
  if (rest.length) { L.appendChild(el('p', 'hint', 'Negli altri messaggi:')); rest.forEach(row); }
}
function pinOpen() { $('pinQ').value = ''; pinRender(); $('pinM').classList.add('open'); }
function goMsg(id) {
  showPane('chat'); renderChat(true);
  var n = document.querySelector('#clog .msg[data-id="' + id + '"]'); if (!n) return;
  n.scrollIntoView({ block: 'center' }); n.classList.add('hit'); setTimeout(function () { n.classList.remove('hit'); }, 2200);
}
function ttlNote() { var t = ttlMs(), b = $('ttlNote'); b.hidden = !t; if (t) b.textContent = '⏳ I messaggi si cancellano da soli ' + (t >= 6048e5 ? 'dopo 7 giorni' : 'dopo 24 ore') + ', su tutti i telefoni del cerchio.'; }
setInterval(function () { if (me && ttlMs()) { var n = msgs.length; pruneMsgs(); if (msgs.length !== n && tab === 'chat') renderChat(true); } }, 60000);
function members() { return me.role === 'host' ? Object.keys(allowed).map(function (k) { return allowed[k]; }) : names.filter(function (n) { return n !== me.name; }); }
function readers(m) { var r = m.rd || {}, ms = members(); return ms.filter(function (n) { return r[n]; }); }
function msgPending(m) { return me.role !== 'host' && outbox.some(function (o) { return o && o.t === 'msg' && o.m && o.m.id === m.id; }); }
function tickFor(m) {
  if (msgPending(m)) return el('span', 'tick', '🕓');
  if (!rcptOn()) return el('span', 'tick', '✓');
  var rs = readers(m), all = members().length;
  if (all && rs.length >= all) return el('span', 'tick rd', '✓✓');
  if (rs.length) return el('span', 'tick', '✓✓');
  return el('span', 'tick', '✓');
}
function markSeen() {
  if (!rcptOn() || !msgs.length) return;
  var last = 0; msgs.forEach(function (m) { if (m.n !== me.name && m.ts > last) last = m.ts; });
  if (!last || last <= lastSeenSent) return; lastSeenSent = last;
  if (me.role === 'host') { applySeen(me.name, last); cast({ t: 'seen', n: me.name, ts: last }); } else sendEv({ t: 'seen', ts: last });
}
function applySeen(who, ts) {
  who = clean(who, 30); ts = +ts || 0; if (!who || !ts) return;
  var ch = false; msgs.forEach(function (m) { if (m.n !== who && m.ts <= ts) { m.rd = m.rd || {}; if (!m.rd[who]) { m.rd[who] = 1; ch = true; } } });
  if (ch) { put('msgs', msgs); if (tab === 'chat' && $('chat').classList.contains('show')) renderChat(true); }
}
function msgNode(m) {
  var d = el('div', 'msg' + (m.n === me.name ? ' me' : ''));
  if (m.n === me.name) { d.style.cursor = 'pointer'; d.onclick = function () { var rs = readers(m); sheet('Il tuo messaggio', msgPending(m) ? '🕓 In attesa: partirà appena vi collegate.' : !rcptOn() ? 'Conferme di lettura spente.' : rs.length ? '✓✓ Letto da: ' + rs.join(', ') : '✓ Inviato, non ancora letto.', [{ t: '↩️ Rispondi', f: function () { startReply(m.id); } }, { t: '📋 Copia il testo', f: function () { copyMsg(m); } }, pinOpt(m), { t: '🗑 Elimina per tutti', red: true, f: function () { delMsg(m.id, true); } }]); }; }
  if (m.n !== me.name) { d.appendChild(el('span', 'mn', m.n)); d.style.cursor = 'pointer'; d.title = 'Tocca per segnalare o silenziare'; d.onclick = function () { moreFor('msg', m); }; }
  d.dataset.id = m.id; if (m.pin) d.insertBefore(el('span', 'pinf', '📌 fissato da ' + m.pin), d.firstChild);
  if (m.re) { var q = el('span', 'rq'); q.appendChild(el('b', null, m.re.n)); q.appendChild(el('span', null, m.re.t)); q.onclick = function (e) { e.stopPropagation(); goMsg(m.re.id); }; d.appendChild(q); }
  if (m.a) { d.appendChild(mediaBox(m)); if (!/^(📷 Foto|🎬 Video)$/.test(m.t)) d.appendChild(document.createTextNode(m.t)); } else
  d.appendChild(document.createTextNode(m.t)); var tm = el('time', null, ago(m.ts)); if (m.n === me.name) tm.appendChild(tickFor(m)); d.appendChild(tm); return d;
}
