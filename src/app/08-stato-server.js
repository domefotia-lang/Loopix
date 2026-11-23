/* ---- stato ---- */
function status() {
  regLabel(); $('cT').textContent = me.role === 'host' ? (me.kind === 'big' ? 'Il tuo Gruppo' : me.kind === 'group' ? 'Il vostro gruppo' : 'Con chi esci') : 'Con chi esci';
  var live = me.role === 'host' ? conns.some(function (c) { return c.ok && c.open; }) : !!(hostConn && hostConn.open);
  $('app').classList.toggle('on', live);
  if ($('sp')) $('sp').hidden = !feed.length || !live; // «Guardate insieme» solo quando c'è qualcuno collegato
  var list = me.role === 'host' ? [me.name].concat(conns.filter(function (c) { return c.ok; }).map(function (c) { return c.name; })) : names;
  $('who').textContent = (list.length ? list.join(', ') : me.name) + ' (' + Math.max(list.length, 1) + '/' + (me.role === 'host' ? cap() + 1 : (circMax || 4)) + ')';
  var av = $('av'); av.textContent = ''; (list.length ? list : [me.name]).slice(0, 4).forEach(function (n) { av.appendChild(avatar(n)); });
  av.setAttribute('aria-label', 'Nel cerchio: ' + (list.length ? list.join(', ') : me.name));
  var others = me.role === 'host' ? Object.keys(allowed).map(function (k) { return allowed[k]; }) : names.filter(function (n) { return n !== me.name; }); if (me.role !== 'host' && !others.length && get('hn', '')) others = [get('hn', '')]; // chi ha creato il cerchio resta in alto anche quando è offline
  $('bd').textContent = live ? 'Collegato' : !others.length ? (me.role === 'host' ? '＋ Invita' : 'Solo tu, per ora') : others.length === 1 ? others[0].slice(0, 12) + ' offline 🔔' : 'Gli altri sono offline 🔔';
  $('bd').setAttribute('aria-label', live ? 'Collegato' : 'Non collegato: tocca per avvisare con un messaggio');
  $('inv').hidden = me.role !== 'host';
  if (tab === 'circle' && $('circle').classList.contains('show')) renderCircle();
}
function roster() { return [me.name].concat(Object.keys(allowed).map(function (k) { return allowed[k]; })).filter(Boolean).slice(0, 50); }
function people() { return [me.name].concat(conns.filter(function (c) { return c.ok; }).map(function (c) { return c.name; })); }
function cast(m) { if (m && m.t === 'people') { m.ck = circleKey(); m.all = roster(); } conns.forEach(function (c) { if (c.ok && c.open) c.send(m); }); mbToGuests(m, null); }

/* ---- io al centro ---- */
var allowed = get('allowed', {}), hostTries = 0;
var GROUP_MAX = 8; // persone in un gruppo (tu compreso)
function cap() { return !me ? 1 : me.kind === 'big' ? BIG_MAX - 1 : me.kind === 'group' ? GROUP_MAX - 1 : 1; }
var circMax = 0;
function startHost() {
  if (!window.Peer) { $('mh').textContent = 'Connessione assente o lenta: riprova tra poco.'; return; }
  peer = new Peer(me.hostId);
  peer.on('open', function () { hostTries = 0; $('mh').textContent = ''; status(); });
  peer.on('disconnected', function () { setTimeout(function () { try { if (peer && !peer.destroyed) peer.reconnect(); } catch (e) {} }, 2000); });
  peer.on('error', function (e) {
    if (e.type === 'unavailable-id' && hostTries < 10) {
      hostTries++; $('mh').textContent = 'Riapro il cerchio…';
      try { peer.destroy(); } catch (x) {} setTimeout(startHost, 4000); return;
    }
    $('mh').textContent = e.type === 'unavailable-id' ? 'Il cerchio è già aperto su un’altra scheda o un altro dispositivo.' : 'Problema di rete (' + e.type + ').';
  });
  peer.on('connection', function (c) {
    c.on('data', function (d) { hostData(c, d); });
    c.on('close', function () { conns = conns.filter(function (x) { return x !== c; }); cast({ t: 'people', people: people() }); status(); });
  });
}
// tutto ciò che arriva al creatore da un membro: dal collegamento diretto o dalla casella del server
function hostData(c, d) {
      if (!d || typeof d !== 'object') return;
      if (d.t === 'hi' && !c.ok && !c.asked) {
        c.asked = true;
        if (typeof d.id === 'string' && !d.k) {
          var nm0 = clean(d.n, 30) || 'Ospite', ng = String(d.ng || '').slice(0, 64);
          keyOfId(d.id).then(function (kk) {
            if (!kk) { try { c.send({ t: 'no', why: 'Non fai più parte di questo cerchio. Chiedi un nuovo invito.' }); } catch (e) {} setTimeout(function () { try { c.close(); } catch (e) {} }, 400); return; }
            c.pk = kk; c.nh = uid(16); c.nm = nm0;
            hmac(kk, 'h' + ng).then(function (ph) { c.send({ t: 'ch', nh: c.nh, ph: ph }); });
          });
          return;
        }
        hostHi(c, d);
      } else if (d.t === 'pr' && !c.ok && c.pk) {
        var pk = c.pk; c.pk = null;
        hmac(pk, 'g' + c.nh).then(function (pg) { if (pg === d.pg) hostHi(c, { n: c.nm, k: pk, c: '' }); else { try { c.close(); } catch (e) {} } });
      } else if ((d.t === 'react' || d.t === 'cmt' || d.t === 'sumq' || d.t === 'sum') && c.ok) {
        var m = applyEv(d, c.name);
        if (m) relay(c, m);
      } else if (d.t === 'ses' && c.ok) {
        var sm = onSes(d, c.name);
        if (sm) relay(c, sm);
      } else if (d.t === 'live' && c.ok && EMO.indexOf(d.e) >= 0) {
        floatE(d.e); relay(c, { t: 'live', e: d.e, n: c.name });
      } else if (d.t === 'idea' && c.ok) {
        var im = applyIdea(d, c.name);
        if (im) relay(c, im);
      } else if (d.t === 'seen' && c.ok) { applySeen(c.name, d.ts); relay(c, { t: 'seen', n: c.name, ts: d.ts });
      } else if (d.t === 'rep' && c.ok) { addReport(d, c.name);
      } else if (d.t === 'mpin' && c.ok && typeof d.id === 'string') {
        if (pinMsg(d.id, !!d.on, false, c.name)) relay(c, { t: 'mpin', id: d.id, on: !!d.on, n: c.name });
      } else if (d.t === 'mdel' && c.ok && typeof d.id === 'string') {
        var om = msgs.filter(function (m) { return m.id === d.id; })[0];
        if (om && om.n === c.name && delMsg(d.id, false)) relay(c, { t: 'mdel', id: d.id });
      } else if (d.t === 'msg' && c.ok) {
        var mm = addMsg(d.m, c.name);
        if (mm) relay(c, { t: 'msg', m: mm });
      } else if (d.t === 'rdel' && c.ok && typeof d.id === 'string') {
        var dr = find(d.id);
        if (dr && dr.n === c.name && dropReel(d.id)) relay(c, { t: 'rdel', id: d.id });
      } else if (d.t === 'trill' && c.ok) { trillIn(c.name);
      } else if (d.t === 'tr' && c.ok) { trIn(c.name, d);
      } else if (d.t === 'pf' && c.ok) {
        if (setPic(c.name, d.p)) relay(c, { t: 'pf', n: c.name, p: d.p });
      } else if (d.t === 'back' && c.ok && Array.isArray(d.feed)) {
        // un membro rimanda i Reel che a questo telefono mancano (es. dopo una reinstallazione)
        var okN = {}; okN[me.name] = 1; Object.keys(allowed).forEach(function (kk) { okN[allowed[kk]] = 1; });
        var got = d.feed.slice(0, 100).filter(function (r) { return r && okN[clean(r.n, 30)] && addReel(r, true); });
        if (got.length) {
          feed.sort(function (a, b) { return a.ts - b.ts; }); put('feed', feed); render();
          got.forEach(function (r) { var nr = find(r.id); if (nr) relay(c, { t: 'reel', r: nr }); });
          $('mh').textContent = 'Recuperati ' + got.length + (got.length === 1 ? ' Reel' : ' Reel') + ' da ' + c.name + ' ✓';
        }
      } else if (d.t === 'reel' && c.ok) {
        var r = d.r || {}; r.n = c.name;
        if (addReel(r)) relay(c, { t: 'reel', r: feed[feed.length - 1] });
      }
}
/* ---- server (Supabase): casella cifrata per chi non è collegato + notifiche ad app chiusa ----
   Ogni membro e il creatore condividono un segreto (il pass del membro). Da quello nascono due caselle
   (una per direzione) e la chiave AES che cifra tutto: il server vede solo nomi casuali e testo illeggibile. */
var SRV = { url: 'https://rvtxhsasngpqtojntpcn.supabase.co', key: 'sb_publishable_gJzeHncdMVaGN2wvUAoTBA_TtnFhpC2', vapid: 'BFnNUqNYQJWQShW4P20aO2uSczOSfZxhg20evZQOYzFzJQDtUCgmjvtxoa6BuCzF0NXGM41zSTMPbTLVGQM-rto' };
// tipi che passano dal server; true = manda anche la notifica
var MBT = { tr: true, reel: true, msg: true, idea: true, sumq: true, sum: true, trill: true, react: true, cmt: true, rdel: false, mdel: false, pf: false, ren: false, jhi: true, hello: true, no: false, wait: false, people: false, mpin: false, knock: false };
function srvOn() { return !!(SRV.url && SRV.key && window.crypto && crypto.subtle && /^https?:/.test(location.protocol)); }
var te8 = new TextEncoder();
function mbEnc(buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function mbDec(x) { x = String(x).replace(/-/g, '+').replace(/_/g, '/'); while (x.length % 4) x += '='; return Uint8Array.from(atob(x), function (ch) { return ch.charCodeAt(0); }); }
function mbBox(sec, dir) { return crypto.subtle.digest('SHA-256', te8.encode('reelta-box:' + sec + ':' + dir)).then(mbEnc); }
var mbKeys = {};
function mbKey(sec) {
  return mbKeys[sec] || (mbKeys[sec] = crypto.subtle.importKey('raw', te8.encode(sec), 'HKDF', false, ['deriveKey']).then(function (k) {
    return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: te8.encode('reelta-relay-v1'), info: te8.encode('msg') }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }));
}
function mbSeal(sec, obj) { var iv = crypto.getRandomValues(new Uint8Array(12)); return mbKey(sec).then(function (k) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, te8.encode(JSON.stringify(obj))); }).then(function (ct) { return mbEnc(iv) + '.' + mbEnc(ct); }); }
function mbOpen(sec, p) { var q = String(p).split('.'); return mbKey(sec).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: mbDec(q[0]) }, k, mbDec(q[1])); }).then(function (b) { return JSON.parse(new TextDecoder().decode(b)); }); }
function mbCall(body, ms) { // con rete pessima la richiesta si ferma da sola invece di restare appesa per minuti
  var ac = typeof AbortController === 'function' ? new AbortController() : null, tt = ac ? setTimeout(function () { ac.abort(); }, ms || (body && (body.a === 'ai' || body.a === 'pack' || body.a === 'mix' || body.a === 'oggi') ? 40000 : 15000)) : 0;
  return fetch(SRV.url + '/functions/v1/relay', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SRV.key }, body: JSON.stringify(body), signal: ac ? ac.signal : undefined })
    .then(function (r) { clearTimeout(tt); if (r.status === 429 || r.status === 503) return r.json().catch(function () { return { error: r.status === 429 ? 'limite' : 'srv' }; }); if (!r.ok) throw new Error('srv ' + r.status); return r.json(); }, function (e) { clearTimeout(tt); throw e; });
}
function mbPut(sec, dir, m, quiet) {
  if (!srvOn() || MBT[m.t] === undefined) return Promise.resolve(false);
  return Promise.all([mbBox(sec, dir), mbSeal(sec, m)]).then(function (v) { return mbCall({ a: 'put', box: v[0], sender: v[0].slice(0, 16), payload: v[1], notify: !quiet && !!MBT[m.t], k: m.t === 'react' ? 'rx' : undefined }); }).then(function () { return true; });
}
// creatore: a chi del cerchio non è collegato adesso
function rxQuiet(m, to) { if (m.t !== 'react') return false; var r = find(m.id); return !(m.e && r && r.n === to && m.n !== to); }
function mbToGuests(m, except) {
  if (!srvOn() || !me || me.role !== 'host' || MBT[m.t] === undefined) return;
  var live = {}; conns.forEach(function (x) { if (x.ok && x.open && x.k) live[x.k] = 1; });
  Object.keys(allowed).forEach(function (k) { if (!except || except.k !== k) mbPut(k, 'g', m, !!live[k] || rxQuiet(m, allowed[k])).catch(function () {}); });
}
// membro: al creatore, se non è collegato
function mbToHost(m, fail, quiet) { if (!quiet && m.t === 'react') quiet = rxQuiet(m, get('hn', '') || (names[0] || '')); if (!quiet) cbPut(m); mbPut(me.tok, 'h', m, quiet).then(function (ok) { if (!ok && fail) fail(); }, function () { if (fail) fail(); }); }
function relay(c, m) { conns.forEach(function (x) { if (x !== c && x.ok && x.open) x.send(m); }); mbToGuests(m, c); }
var mbBusy = false, mbLast = 0, srvSeen = 0;
window.addEventListener('offline', function () { try { $('mh').textContent = LXT('Sei senza rete: quello che mandi parte appena torna.'); } catch (e) {} });
window.addEventListener('online', function () { try { $('mh').textContent = LXT('Rete tornata ✓'); mbPull(true); } catch (e) {} });
function mbPull(force) {
  if (!srvOn() || !me || mbBusy || (!force && Date.now() - mbLast < 8000)) return;
  mbBusy = true; mbLast = Date.now();
  var jobs = me.role === 'host' ? Object.keys(allowed).map(function (k) { return { sec: k, dir: 'h', name: allowed[k] }; }).concat(codesNow().map(function (x) { return { sec: me.hostId + '_' + x.c, dir: 'j' }; })).concat([{ sec: 'door_' + me.hostId, dir: 'd' }]) : (me.tok ? [{ sec: me.tok, dir: 'g' }] : []);
  if (me.role !== 'host' && !me.joined && me.code && me.hostId && joinTries > 0) jobs.push({ sec: me.hostId + '_' + me.code, dir: 'w' });
  var ckP = cbOn(); if (ckP) jobs.push({ sec: ckP, dir: 'c' });
  Promise.all(jobs.map(function (j) {
    return mbBox(j.sec, j.dir).then(function (box) {
      return mbCall(j.dir === 'c' ? { a: 'get', box: box, after: +get('cbAt', 0) || 0 } : { a: 'get', box: box }).then(function (res) {
        var items = (res && res.items) || []; if (!items.length) return;
        return items.reduce(function (p, it) {
          return p.then(function () { return mbOpen(j.sec, it.payload).then(function (d) {
            if (!d || typeof d !== 'object' || MBT[d.t] === undefined) return;
            if (j.dir === 'w') { if (d.t === 'hello' && !me.joined && !blocked) { guestData(d); track('entrato-senza-host'); } }
            else if (j.dir === 'j') { if (d.t === 'jhi') hostJoinVirt(d); }
            else if (j.dir === 'd') { if (d.t === 'knock') hostKnock(d); }
            else if (j.dir === 'c') { if ((d.t === 'reel' || d.t === 'msg') && typeof d.cb === 'string' && d.cb !== me.name && (get('all', []) || []).indexOf(d.cb) >= 0) guestData(d); }
            else if (j.dir === 'h') { if (allowed[j.sec]) hostData({ ok: true, open: false, k: j.sec, name: allowed[j.sec], send: function () {} }, d); }
            else guestData(d);
          }, function () {}); });
        }, Promise.resolve()).then(function () { if (j.dir === 'w') return; if (j.dir === 'c') { put('cbAt', items[items.length - 1].id); return; } return mbCall({ a: 'ack', box: box, upto: items[items.length - 1].id }); });
      }).then(function () { var was = srvSeen; srvSeen = Date.now(); if (me && Date.now() - was > 60000) status(); });
    });
  })).catch(function () {}).then(function () { mbBusy = false; });
}
document.addEventListener('visibilitychange', function () { if (!document.hidden) mbPull(true); });
// controllo del server con meno batteria e dati: spesso mentre usi l'app, più di rado se è ferma o collegata direttamente
var lastAct = Date.now(); ['touchstart', 'keydown', 'click'].forEach(function (ev) { document.addEventListener(ev, function () { lastAct = Date.now(); }, { passive: true, capture: true }); });
setInterval(function () { if (document.hidden || !me) return; var live = me.role === 'host' ? conns.some(function (c) { return c.ok && c.open; }) : !!(hostConn && hostConn.open); var gap = live ? 60000 : (Date.now() - lastAct < 120000 ? 10000 : 30000); if (Date.now() - mbLast >= gap - 500) mbPull(true); }, 5000);
// notifiche ad app chiusa: il telefono si iscrive alle sue caselle (solo un avviso generico, mai il contenuto)
function pushOK() { return srvOn() && 'serviceWorker' in navigator && 'PushManager' in window && window.Notification; }
function pushBoxes() {
  if (me.role === 'host') return Promise.all(Object.keys(allowed).map(function (k) { return mbBox(k, 'h'); }).concat(codesNow().map(function (x) { return mbBox(me.hostId + '_' + x.c, 'j'); })));
  return me.tok ? mbBox(me.tok, 'g').then(function (b) { return [b]; }) : Promise.resolve([]);
}
function pushBoxesAll() { return pushBoxes().then(function (L) { return isDev ? L.concat([DEVBOX]) : L; }); }
// telefono sviluppatore: avvisa delle nuove segnalazioni (i testi restano sul server, li legge chi gestisce Reelta)
function devAlerts() {
  if (!isDev || !srvOn()) return;
  mbCall({ a: 'get', box: DEVBOX }).then(function (res) {
    var it = (res && res.items) || []; if (!it.length) return;
    mbCall({ a: 'ack', box: DEVBOX, upto: it[it.length - 1].id }).catch(function () {});
    ask('🛠️ ' + (it.length === 1 ? '1 nuova segnalazione' : it.length + ' nuove segnalazioni'), 'Qualcuno ha segnalato un problema dall’app. Chiedi a Claude: «leggi le segnalazioni di Reelta».', 'Ok');
  }).catch(function () {});
}
function pushSync() {
  if (!pushOK() || Notification.permission !== 'granted' || !me) return Promise.resolve(false);
  return navigator.serviceWorker.ready.then(function (reg) {
    return reg.pushManager.getSubscription().then(function (sub) { return sub || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: mbDec(SRV.vapid) }); });
  }).then(function (sub) {
    var js = sub.toJSON(), lang = window.LX_LANG || 'it';
    return crypto.subtle.digest('SHA-256', te8.encode('reelta-ep:' + js.endpoint)).then(function (h) { var ep = mbEnc(h).slice(0, 24); put('ep', ep); return ep; }).then(function (ep) {
      var ckS = cbOn();
      return pushBoxesAll().then(function (bs) { return Promise.all(bs.map(function (b) { return mbCall({ a: 'sub', box: b, sub: js, lang: lang }); }).concat(ckS ? [mbBox(ckS, 'c').then(function (cb) { return mbCall({ a: 'sub', box: cb, sub: js, lang: lang, fan: 1, ep: ep }); })] : [])); });
    });
  }).then(function () { return true; }, function () { return false; });
}
function pushAsk() { // restituisce sempre una promessa: chi la chiama può fare .then anche quando gli avvisi non sono possibili
  if (!pushOK()) { $('mh').textContent = isIOS && !isStandalone ? 'Per gli avvisi ad app chiusa apri Reelta dall’icona sulla Home.' : 'Questo telefono non supporta gli avvisi ad app chiusa.'; return Promise.resolve(false); }
  return Notification.requestPermission().then(function (p) {
    if (p !== 'granted') { $('mh').textContent = 'Avvisi non attivati: puoi cambiarlo nelle impostazioni del telefono.'; renderPush(); return; }
    return pushSync().then(function (ok) { $('mh').textContent = ok ? '🔔 Fatto: ti avviso anche ad app chiusa.' : 'Non sono riuscito ad attivare gli avvisi, riprova più tardi.'; renderPush(); });
  });
}
function renderPush() {
  var b = $('pushB'), h = $('pushH'); if (!b) return;
  var on = pushOK() && Notification.permission === 'granted';
  b.hidden = !srvOn(); b.textContent = on ? '🔔 Avvisi ad app chiusa: attivi' : '🔔 Avvisami anche ad app chiusa';
  b.disabled = on; h.hidden = !srvOn();
  h.textContent = on ? 'Ti arriva solo “Hai qualcosa di nuovo su Reelta”: mai chi, né cosa.' : 'Una notifica discreta quando arriva un Reel o un messaggio, anche con Reelta chiusa.';
}
/* primo ingresso anche senza collegamento diretto: l'ospite lascia la richiesta in una casella che solo
   chi ha il link può aprire (la chiave nasce dal codice dell'invito); il creatore la trova e risponde nella casella dell'ospite */
function slimHello(m) {
  var h = Object.assign({}, m, { pics: {} });
  [100, 50, 25, 12, 5, 0].some(function (n) {
    h.feed = (m.feed || []).slice(-n || m.feed.length); h.msgs = (m.msgs || []).slice(-2 * n || m.msgs.length); h.ideas = (m.ideas || []).slice(-n || m.ideas.length); h.gone = (m.gone || []).slice(-2 * n || m.gone.length);
    if (!n) { h.feed = []; h.msgs = []; h.ideas = []; h.gone = []; }
    return JSON.stringify(h).length < 42000;
  });
  return h;
}
function hostJoinVirt(d) {
  var k = typeof d.k === 'string' ? d.k.slice(0, 40) : '';
  if (!k || conns.some(function (x) { return x.ok && x.open && x.k === k; })) return;
  var c = { virt: true, open: true, ok: false, k: k, send: function (m) { if (m && m.t === 'hello') m = slimHello(m); mbPut(k, 'g', m, false).catch(function () {}); }, close: function () { c.open = false; } };
  hostHi(c, { n: d.n, k: k, c: d.c });
}
/* ricollegamento automatico: una volta al giorno chi è stato invitato "bussa" alla porta del cerchio.
   Se il creatore non riconosce più quel telefono (es. app reinstallata) ma conosce il nome, gli chiede
   con un tocco se ricollegarlo: niente più inviti da rimandare. */
function knock(force) {
  if (!srvOn() || !me || me.role === 'host' || !me.joined || !me.tok || !me.hostId || blocked) return;
  if (!force && Date.now() - (+get('knockAt', 0)) < 20 * 36e5) return;
  put('knockAt', Date.now());
  mbPut('door_' + me.hostId, 'd', { t: 'knock', n: me.name, k: me.tok }, true).catch(function () {});
}
var knockAsked = {};
function hostKnock(d) {
  var k = typeof d.k === 'string' ? d.k.slice(0, 40) : '', n = clean(d.n, 30);
  if (!k || !n || allowed[k] || knockAsked[n]) return;
  var mine = Object.keys(allowed).some(function (x) { return allowed[x] === n; });
  if (!mine) return; // nome sconosciuto: un vecchio link, lo ignoro senza disturbare
  knockAsked[n] = 1;
  ask('🔄 ' + n + ' si è scollegato', 'Il telefono di ' + n + ' non viene più riconosciuto (succede se ha reinstallato Reelta o riaperto un vecchio invito). Vuoi ricollegarlo? Non perde niente.', 'Ricollega').then(function (y) {
    if (!y) return;
    var cs = codesNow(), c = uid(5); cs.push({ c: c, ts: Date.now() }); put('codes', cs.slice(-10));
    hostJoinVirt({ n: n, k: k, c: c });
    setTimeout(function () { mbPull(true); }, 1500);
  });
}
var joinTries = 0, joinT = null;
function srvJoin() {
  clearTimeout(joinT);
  if (!srvOn() || !me || me.role === 'host' || (me.joined && !me.rejoin && !me.pend) || blocked || !me.code || !me.tok || !me.hostId || joinTries >= 12) return;
  joinTries++;
  mbPut(me.hostId + '_' + me.code, 'j', { t: 'jhi', n: me.name, k: me.tok, c: me.code }, joinTries > 1 && joinTries % 4).catch(function () {});
  setTimeout(function () { mbPull(true); }, 4000);
  joinT = setTimeout(srvJoin, 60000);
}
function gSend(m) {
  if (hostConn && hostConn.open) { hostConn.send(m); return; }
  if (srvOn() && MBT[m.t] !== undefined) { mbToHost(m, function () { if (m.t === 'reel' || m.t === 'msg') { outbox.push(m); put('outbox', outbox); } }); }
}
/* ---- casella del cerchio: nei Trio e nei Gruppi, se chi ha creato il cerchio è offline, Reel e messaggi arrivano lo stesso agli altri.
   È cifrata con una chiave che conoscono solo i membri; il server vede solo byte illeggibili. ---- */
function circleKey() { var k = get('ck', ''); if (!/^[a-f0-9]{32}$/.test(k)) { k = Array.from(crypto.getRandomValues(new Uint8Array(16)), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); put('ck', k); } return k; }
function cbOn() { var ck = get('ck', ''); return srvOn() && me && me.role !== 'host' && /^[a-f0-9]{32}$/.test(ck) && (get('all', []) || []).length >= 3 ? ck : ''; }
function myEp() { return get('ep', ''); }
function cbPut(m) {
  var ck = cbOn(); if (!ck || (m.t !== 'reel' && m.t !== 'msg')) return;
  var x = { t: m.t, cb: me.name };
  if (m.t === 'reel') x.r = Object.assign({}, m.r, { n: me.name }); else x.m = Object.assign({}, m.m, { n: me.name });
  Promise.all([mbBox(ck, 'c'), mbSeal(ck, x)]).then(function (v) { return mbCall({ a: 'put', box: v[0], sender: v[0].slice(0, 16), payload: v[1], notify: true, fan: 1, ep: myEp() }); }).catch(function () {});
}
function srvStart() {
  if (!srvOn() || !me) return;
  if (me.rejoin && Date.now() - me.rejoin > 2 * 864e5) { delete me.rejoin; put('me', me); }
  setTimeout(function () { mbPull(true); }, 1500);
  setTimeout(devAlerts, 5000); document.addEventListener('visibilitychange', function () { if (!document.hidden) devAlerts(); });
  if (me.role !== 'host' && (!me.joined || me.rejoin || me.pend)) setTimeout(function () { if (!me.joined || me.rejoin || me.pend) srvJoin(); }, me.rejoin ? 1500 : 7000);
  setTimeout(function () { knock(false); }, 12000);
  if (pushOK() && Notification.permission === 'granted') pushSync();
  else if (pushOK() && Notification.permission === 'default' && !get('pushAsked', 0) && (me.joined || me.role === 'host')) {
    setTimeout(function () {
      if (get('pushAsked', 0)) return; put('pushAsked', 1);
      ask('Avvisi anche ad app chiusa?', 'Quando arriva un Reel o un messaggio, una notifica discreta: “Hai qualcosa di nuovo su Reelta”. Mai chi, né cosa.', 'Sì, avvisami').then(function (y) { if (y) pushAsk(); });
    }, 4000);
  }
}
