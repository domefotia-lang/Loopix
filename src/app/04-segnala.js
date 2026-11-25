/* ---- segnala un problema ---- */
var APP_VER = 'v206', errLog = [];
// errori segnalati da soli, anonimi: solo cosa si è rotto e dove (mai nomi, cerchi, link o testi). Al massimo 3 al giorno, uno per tipo; spenti con la modalità riservata.
function errAuto(msg, where, prova) {
  try {
    msg = String(msg || '').replace(/https?:\/\/\S+/g, '[link]').slice(0, 160); where = String(where || '').replace(/^.*\//, '').slice(0, 60);
    if (!msg || /^Script error\.?$/i.test(msg) || /ResizeObserver loop|Load failed|NetworkError|Failed to fetch|AbortError|The operation was aborted|QuotaExceeded|\|/i.test(msg) || /^promessa: (.{0,3}|\[object .*)$/.test(msg)) return;
    if (!prova && (location.protocol !== 'https:' || /^(localhost|127\.)/.test(location.hostname))) return; // solo dall'app vera (le prove automatiche passano «prova»)
    if (typeof FEEDBACK === 'undefined' || !FEEDBACK.url || !FEEDBACK.anon) return;
    var G = function (k, d) { try { var v = JSON.parse(localStorage.getItem(LSG + k)); return v == null ? d : v; } catch (e) { return d; } };
    if (G('riserv', 0)) return;
    var day = new Date().toISOString().slice(0, 10), st = G('errDay', { d: '', n: 0, k: [] }); if (st.d !== day) st = { d: day, n: 0, k: [] };
    var key = (APP_VER + msg + where).slice(0, 90); if (st.n >= 3 || st.k.indexOf(key) >= 0) return;
    st.n++; st.k.push(key); localStorage.setItem(LSG + 'errDay', JSON.stringify(st));
    var ua = navigator.userAgent, dev = /iPhone|iPad/.test(ua) ? 'iOS ' + ((/OS (\d+)/.exec(ua) || [])[1] || '?') : /Android/.test(ua) ? 'Android ' + ((/Android (\d+)/.exec(ua) || [])[1] || '?') : 'computer';
    var sa = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    fetch(FEEDBACK.url + '/rest/v1/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: FEEDBACK.anon, Prefer: 'return=minimal' }, keepalive: true,
      body: JSON.stringify({ survey: 'err', code: '', data: { errore: msg, dove: where, versione: APP_VER, telefono: dev + (sa ? ' · app' : ' · browser'), lingua: window.LX_LANG || 'it', schermo: (document.querySelector('.pane.show') || {}).id || '' } }) }).catch(function () {});
  } catch (e) {}
}
window.addEventListener('error', function (e) { errLog.push(new Date().toISOString().slice(11, 19) + ' ' + String(e.message || 'errore').slice(0, 120)); if (errLog.length > 8) errLog.shift(); if (e.message) errAuto(e.message, (e.filename || '') + ':' + (e.lineno || 0) + ':' + (e.colno || 0)); });
window.addEventListener('unhandledrejection', function (e) { var m = String((e.reason && e.reason.message) || e.reason || 'promessa'); errLog.push(new Date().toISOString().slice(11, 19) + ' ' + m.slice(0, 120)); if (errLog.length > 8) errLog.shift(); errAuto('promessa: ' + m, ((e.reason && e.reason.stack) || '').split('\n')[1] || ''); });
function bugText() {
  var ua = navigator.userAgent, dev = /iPhone|iPad/.test(ua) ? 'iPhone/iPad iOS ' + ((/OS (\d+[_\d]*)/.exec(ua) || [])[1] || '?').replace(/_/g, '.') : /Android/.test(ua) ? 'Android ' + ((/Android ([\d.]+)/.exec(ua) || [])[1] || '?') : 'Computer';
  var sa = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  var live = me ? (me.role === 'host' ? conns.some(function (c) { return c.ok && c.open; }) : !!(hostConn && hostConn.open)) : false;
  var lines = [
    '🛠️ Problema su Reelta', '', 'Cosa è successo: ' + (clean($('bugI').value, 500) || '(non descritto)'), '',
    '— Dettagli tecnici —',
    'Versione: ' + APP_VER + ' · ' + new Date().toLocaleString('it-IT'),
    'Schermo: ' + (scrSnap || scrNow()),
    'Telefono: ' + dev + (sa ? ' · app dalla Home' : ' · nel browser'),
    'Cerchio: ' + (me ? (me.role === 'host' ? 'creatore · ' + kindName(me.kind) + ' · ospiti ' + Object.keys(allowed).length + '/' + cap() : 'ospite') : 'nessuno') + ' · cerchi: ' + REG.list.length,
    'Collegato: ' + (live ? 'sì' : 'no') + (blocked ? ' (bloccato)' : '') + ' · Reel: ' + feed.length + ' · messaggi: ' + msgs.length,
    'PIN: ' + (pinRec ? 'sì' : 'no') + ' · sviluppatore: ' + (isDev ? 'sì' : 'no'),
    'Ultimo avviso: ' + ($('mh').textContent || '-').slice(0, 140),
    'Errori: ' + (errLog.length ? errLog.join(' | ') : 'nessuno')
  ];
  return lines.join('\n');
}
var scrSnap = '';
function scrNow() {
  var r = function (q) { var x = document.querySelector(q); if (!x || !x.offsetParent && q !== '.app') return '-'; var b = x.getBoundingClientRect(); return Math.round(b.top) + '-' + Math.round(b.bottom); };
  return innerHeight + '/' + screen.height + ' vv ' + (window.visualViewport ? Math.round(visualViewport.height) + '@' + Math.round(visualViewport.offsetTop) : '-') + ' apph ' + getComputedStyle(document.documentElement).getPropertyValue('--apph').trim() + ' app ' + r('.app') + ' tabs ' + r('#tabs') + ' html ' + document.documentElement.clientHeight + ' top ' + (($('saProbe') || {}).offsetHeight || 0) + ' sa ' + (navigator.standalone === true);
}
// soluzioni rapide: i problemi più comuni si sistemano da soli, senza scrivere a nessuno
function bugFixes() {
  var L = $('bugFixL'), add = function (t, f) { var b = el('button', 'btn-o wide', t); b.style.margin = '0'; b.onclick = function () { f(b); }; L.appendChild(b); };
  L.textContent = ''; $('bugFix').hidden = true;
  var show = function () { $('bugFix').hidden = !L.children.length; };
  if (me) {
    var live = me.role === 'host' ? conns.some(function (c) { return c.ok && c.open; }) : !!(hostConn && hostConn.open);
    var others = me.role === 'host' ? Object.keys(allowed).length : (names.length > 1 || me.joined ? 1 : 0);
    if (!live && others && me.role === 'host') add('🔗 Non vi collegate? Rimanda l’invito', function () { $('bugM').classList.remove('open'); invite({ again: true }); });
    if (!live && others && me.role !== 'host') add('🔄 Riprova a collegarti adesso', function (b) { b.disabled = true; b.textContent = '🔄 Ci provo…'; if (srvOn()) { mbPull(true); if (!me.joined || me.rejoin) srvJoin(); } try { again(); } catch (e) {} setTimeout(function () { b.textContent = 'Fatto: se non basta, chiedi un nuovo invito a chi ha creato il cerchio.'; }, 2500); });
    if (srvOn() && pushOK() && Notification.permission === 'default') add('🔔 Attiva le notifiche', function (b) { pushAsk().then(function () { b.textContent = Notification.permission === 'granted' ? '🔔 Notifiche attive ✓' : '🔔 Non attivate: puoi farlo nelle impostazioni del telefono'; }); });
  }
  show();
  fetch('index.html?v=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) {
    var v = (/var APP_VER = '(v\d+)'/.exec(t) || [])[1];
    if (v && v !== APP_VER) { add('⬆️ C’è una versione nuova (' + v + '): aggiorna', function () { try { navigator.serviceWorker && navigator.serviceWorker.getRegistration().then(function (r) { if (r) r.update(); }); } catch (e) {} setTimeout(function () { location.reload(); }, 600); }); show(); }
  }).catch(function () {});
}
/* conteggio anonimo: una volta al giorno il telefono dice solo "sono attivo", con un codice casuale.
   Niente nomi, messaggi o Reel. I cerchi sono contati con un'impronta irreversibile, per sapere quanti sono, non quali. */
// imbuto anonimo, solo numeri del cerchio aperto: quanti Reel, quanti diventano piani, quanti hanno un giorno, quanti si fanno
function funnel() {
  try {
    var n = Date.now(), c = function (x) { return Math.max(0, Math.min(999, x | 0)); }, P = (typeof ideas !== 'undefined' ? ideas : []).filter(function (i) { return i && n - (+i.ts || 0) < 30 * 864e5; });
    return { r7: c((typeof feed !== 'undefined' ? feed : []).filter(function (r) { return r && n - (+r.ts || 0) < 7 * 864e5; }).length), p30: c(P.length), w30: c(P.filter(function (i) { return !!i.w; }).length), d30: c(P.filter(function (i) { return !!i.d; }).length) };
  } catch (e) { return {}; }
}
function pingDay() {
  if (!FEEDBACK.url || !FEEDBACK.anon || !window.crypto || !crypto.subtle) return;
  var today = new Date().toISOString().slice(0, 10), last = ''; try { last = localStorage.getItem(LSG + 'pingDay') || ''; } catch (e) {} if (last === today) return;
  var iid = ''; try { iid = localStorage.getItem(LSG + 'iid') || ''; if (!/^[a-z0-9]{16}$/.test(iid)) { iid = Array.from(crypto.getRandomValues(new Uint8Array(16)), function (b) { return 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]; }).join(''); localStorage.setItem(LSG + 'iid', iid); } } catch (e) { return; }
  var hosts = []; (REG.list || []).forEach(function (x) { try { var m = JSON.parse(localStorage.getItem(lsOf(x.id) + 'me') || 'null'); if (m && m.hostId && (m.role === 'host' || m.joined)) hosts.push(m.hostId); } catch (e) {} });
  Promise.all(hosts.slice(0, 12).map(function (h) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode('reelta-c:' + h)).then(function (d) { return Array.from(new Uint8Array(d).slice(0, 6), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }); })).then(function (circ) {
    return fetch(FEEDBACK.url + '/rest/v1/pings', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: FEEDBACK.anon, Prefer: 'return=minimal' },
      body: JSON.stringify(Object.assign({ iid: iid, plat: isIOS ? 'ios' : isAndroid ? 'android' : 'other', ver: APP_VER, circ: circ }, funnel())) });
  }).then(function (r) { if (r && (r.ok || r.status === 409)) lsSet(LSG + 'pingDay', today); }).catch(function () {});
}
var DEVBOX = 'reeltaDevAlerts_v1_7Hq2xP9mL4nB8sK3';
function bugSend() {
  var txt = clean($('bugI').value, 500);
  if (!txt) { $('bugH').textContent = 'Scrivi prima in due parole cosa è successo.'; $('bugI').focus(); return; }
  if (!FEEDBACK.url || !FEEDBACK.anon) { $('bugH').textContent = 'Invio non disponibile: usa WhatsApp o copia il testo.'; return; }
  $('bugSend').disabled = true; $('bugH').textContent = 'Invio…';
  fetch(FEEDBACK.url + '/rest/v1/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: FEEDBACK.anon, Prefer: 'return=minimal' },
    body: JSON.stringify({ survey: 'bug', code: me && me.hostId ? me.hostId.slice(-6) : '', data: { testo: txt, dettagli: bugText().split('\n').slice(5), versione: APP_VER, lingua: window.LX_LANG || 'it' } }) })
    .then(function (r) { if (!r.ok) throw 0;
      try { mbCall({ a: 'put', box: DEVBOX, sender: 'bug', payload: 'bug', notify: true }).catch(function () {}); } catch (e) {}
      $('bugH').textContent = '✓ Inviata a Reelta. Grazie! Se serve una risposta, te la diamo nel prossimo aggiornamento.'; $('bugI').value = ''; })
    .catch(function () { $('bugH').textContent = 'Non è partita: controlla la connessione, oppure mandala su WhatsApp.'; })
    .then(function () { $('bugSend').disabled = false; });
}
function openBug() { scrSnap = scrNow(); bugFixes(); $('bugI').value = ''; $('bugH').textContent = ''; $('bugM').classList.add('open'); setTimeout(function () { $('bugI').focus(); }, 60); }
/* ---- segnala e silenzia ---- */
var muted = get('muted', []), reps = get('reps', []);
function isMuted(n) { return muted.indexOf(n) >= 0; }
function sheet(t, p, opts) {
  $('actT').textContent = t; $('actP').textContent = p || ''; var b = $('actB'); b.textContent = '';
  opts.forEach(function (o) { var x = el('button', o.red ? 'btn-o wide danger' : 'btn-o wide', o.t); if (o.ic) withIco(x, o.ic); x.style.marginTop = '8px'; x.onclick = function () { $('actM').classList.remove('open'); o.f(); }; b.appendChild(x); });
  $('actX').onclick = function () { $('actM').classList.remove('open'); };
  $('actM').classList.add('open');
}
function memberKey(n) { return Object.keys(allowed).filter(function (k) { return allowed[k] === n; })[0]; }
function moreFor(kind, item) {
  var who = item.n, opts = [];
  if (who === me.name) return;
  if (me.role !== 'host') opts.push({ t: '🚩 Segnala a ' + (names[0] || 'chi ha creato il cerchio'), f: function () { report(kind, item); } });
  if (me.role === 'host') opts.push({ t: kind === 'reel' ? '🗑 Elimina questo Reel' : '🗑 Elimina questo messaggio', red: true, f: function () { if (kind === 'reel') delReel(item.id); else ask('Eliminare il messaggio?', 'Sparisce per tutto il cerchio.', 'Elimina', true).then(function (y) { if (y) delMsg(item.id, true); }); } });
  if (kind === 'msg') { opts.unshift({ t: '🙈 Elimina solo per me', f: function () { hideMsg(item.id); } }); opts.unshift(pinOpt(item)); opts.unshift({ t: '📋 Copia il testo', f: function () { copyMsg(item); } }); opts.unshift({ t: '↩️ Rispondi', f: function () { startReply(item.id); } }); }
  opts.push({ t: '🔇 Silenzia ' + who, f: function () { mute(who); } });
  if (me.role === 'host' && memberKey(who)) opts.push({ t: '🚫 Togli ' + who + ' dal cerchio', red: true, f: function () { ask('Togliere ' + who + '?', who + ' non vedrà più i nuovi Reel, piani e messaggi del cerchio.', 'Togli dal cerchio', true).then(function (y) { if (y) removeMember(memberKey(who)); }); } });
  sheet(kind === 'reel' ? 'Reel di ' + who : 'Messaggio di ' + who, '', opts);
}
function report(kind, item) {
  sheet('Perché lo segnali?', 'La segnalazione arriva solo a chi ha creato il cerchio, che può eliminarlo o togliere la persona.', ['Offensivo o violento', 'Contenuto sessuale', 'Spam o truffa', 'Altro'].map(function (why) {
    return { t: why, f: function () { sendEv({ t: 'rep', k: kind, id: item.id, why: why, who: item.n, n: me.name }); ask('Segnalazione inviata ✓', 'Grazie. Se vuoi non vederlo più, puoi anche silenziare ' + item.n + '.', 'Ok'); } };
  }));
}
function addReport(d, from) {
  if (!d || typeof d.id !== 'string' || (d.k !== 'reel' && d.k !== 'msg')) return;
  if (reps.some(function (x) { return x.id === d.id && x.from === from; })) return;
  reps.push({ k: d.k, id: d.id.slice(0, 40), why: clean(d.why, 40), who: clean(d.who, 30), from: from, ts: Date.now() }); if (reps.length > 50) reps.shift(); put('reps', reps);
  $('mh').textContent = '🚩 ' + from + ' ha segnalato ' + (d.k === 'reel' ? 'un Reel' : 'un messaggio') + '. Guarda in Cerchio.';
  try { navigator.vibrate && navigator.vibrate(200); } catch (e) {}
  if (tab === 'circle') renderCircle();
}
function renderReports() {
  var c = $('repC'), l = $('repL'); l.textContent = '';
  c.hidden = me.role !== 'host' || !reps.length; if (c.hidden) return;
  reps.slice().reverse().forEach(function (x) {
    var box = el('div', 'inv2'); box.style.flexDirection = 'column'; box.style.alignItems = 'stretch'; box.style.margin = '0 0 8px';
    box.appendChild(el('span', null, x.from + ' ha segnalato ' + (x.k === 'reel' ? 'un Reel' : 'un messaggio') + ' di ' + x.who + ': “' + x.why + '”'));
    var row = el('div', 'duo'); row.style.margin = '0';
    function done() { reps = reps.filter(function (y) { return y !== x; }); put('reps', reps); renderCircle(); }
    if (x.k === 'reel' && find(x.id)) { var v = el('button', 'btn-o', 'Vedi'); v.onclick = function () { showPane('main'); goReel(x.id); }; row.appendChild(v); }
    var del = el('button', 'btn-o danger', 'Elimina'); del.onclick = function () { if (x.k === 'reel') { if (dropReel(x.id)) cast({ t: 'rdel', id: x.id }); } else delMsg(x.id, true); done(); }; row.appendChild(del);
    var ig = el('button', 'btn-o', 'Ignora'); ig.onclick = done; row.appendChild(ig);
    box.appendChild(row); l.appendChild(box);
  });
}
function mute(n) { if (!isMuted(n)) { muted.push(n); put('muted', muted); } render(); renderChat(); seqLabel(); ask(n + ' è silenziato', 'Non vedrai più i suoi Reel e messaggi su questo telefono. Puoi riattivarlo in Cerchio.', 'Ok'); }
function unmute(n) { muted = muted.filter(function (x) { return x !== n; }); put('muted', muted); render(); renderChat(); seqLabel(); renderCircle(); }
function renderMuted() {
  var c = $('mutC'), l = $('mutL'); l.textContent = ''; c.hidden = !muted.length;
  muted.forEach(function (n) { var r = el('div', 'mrow'), s = el('span'); s.appendChild(avatar(n)); s.appendChild(document.createTextNode(n)); r.appendChild(s); var b = el('button', 'btn-o', 'Riattiva'); b.onclick = function () { unmute(n); }; r.appendChild(b); l.appendChild(r); });
}
function delMsg(id, spread) {
  var before = msgs.length; msgs = msgs.filter(function (m) { return m.id !== id; }); if (msgs.length === before) return false;
  put('msgs', msgs); renderChat(); if (spread) { if (me.role === 'host') cast({ t: 'mdel', id: id }); else sendEv({ t: 'mdel', id: id }); } return true;
}
function dropReel(id) {
  var r = find(id); if (gone.indexOf(id) < 0) { gone.push(id); if (gone.length > 300) gone.shift(); put('gone', gone); }
  if (!r) return false;
  feed = feed.filter(function (x) { return x.id !== id; }); delete seen[id]; put('feed', feed);
  if (seq) seq.q = seq.q.filter(function (x) { return x !== id; });
  render(); seqLabel(); return true;
}
// togli un Reel solo da questo telefono (gli altri lo vedono ancora): non torna più nemmeno se qualcuno lo rimanda
function hideReel(id) {
  if (!find(id)) return; rhid.push(id); if (rhid.length > 2000) rhid = rhid.slice(-2000); put('rhid', rhid); delete keeps[id]; put('keep', keeps);
  feed = feed.filter(function (r) { return r.id !== id; }); put('feed', feed); render(); track('reel-nascosto'); $('mh').textContent = 'Tolto dal tuo telefono.';
}
function delReel(id) {
  var r = find(id); if (!r) return;
  ask('Eliminare questo Reel?', 'Sparisce per tutto il cerchio, con reazioni e commenti. Non si può annullare.', 'Elimina', true).then(function (y) { if (y && dropReel(id)) sendEv({ t: 'rdel', id: id }); });
}
var FIX = { a: null, n: -1, m: null };
function findIdx() { var m = {}; for (var i = 0; i < feed.length; i++) m[feed[i].id] = i; FIX = { a: feed, n: feed.length, m: m }; }
function find(id) { // indice per id: prima scorreva tutto il feed a ogni chiamata
  if (FIX.a !== feed || FIX.n !== feed.length) findIdx();
  var i = FIX.m[id], r = i == null ? undefined : feed[i]; if (r && r.id === id) return r;
  findIdx(); i = FIX.m[id]; return i == null ? undefined : feed[i];
}
function igFit() {
  document.querySelectorAll('.stage .igfit, .ivst .igfit').forEach(function (c) {
    var bx = c.firstChild, fr = bx && bx.firstChild; if (!fr) return;
    var W = c.clientWidth, H = c.clientHeight; if (!W || !H) return;
    var HD = 60, HM = W * 1.24, sc = Math.max(1, Math.min(H / HM, 1.4));
    bx.style.width = W + 'px'; bx.style.height = Math.round(HM * sc) + 'px';
    fr.style.width = W + 'px'; fr.style.height = Math.round(HD + HM + 420) + 'px';
    fr.style.left = Math.round((W - W * sc) / 2) + 'px'; fr.style.top = Math.round(-HD * sc) + 'px';
    fr.style.transform = 'scale(' + sc.toFixed(4) + ')';
  });
}
// Facebook a schermo intero: il video verticale riempie tutto lo schermo (come TikTok), senza la fascia nera sotto
function fbFit() {
  var imm = $('pl').classList.contains('imm');
  document.querySelectorAll('.stage iframe[src*="facebook.com/plugins/video"]').forEach(function (fr) {
    var bx = fr.parentNode, st = fr.closest('.stage'); if (!st) return;
    if (!imm) { fr.style.width = fr.style.height = fr.style.transform = fr.style.position = fr.style.left = fr.style.top = ''; bx.style.overflow = ''; return; }
    var W = st.clientWidth, H = st.clientHeight; if (!W || !H) return;
    var h = Math.round(W * 16 / 9), sc = Math.max(1, H / h);
    bx.style.overflow = 'hidden'; fr.style.position = 'absolute'; fr.style.left = '0'; fr.style.top = Math.round((H - h * sc) / 2) + 'px';
    fr.style.width = W + 'px'; fr.style.height = h + 'px'; fr.style.transformOrigin = 'top center'; fr.style.transform = sc > 1.001 ? 'scale(' + sc.toFixed(4) + ')' : '';
  });
}
window.addEventListener('resize', function () { setTimeout(igFit, 60); setTimeout(fbFit, 60); });
// gesti sul video nel feed, come su Instagram: un tocco = schermo intero, doppio tocco = ❤️, tenuto premuto = menu, scorri a sinistra = ✨ Piano
function glTip() { if (get('gtip', 0) || !me) return; put('gtip', 1); setTimeout(function () { if (document.querySelector('.tipb, .mod.open')) return; var t = el('div', 'tipb'); t.setAttribute('role', 'status'); t.appendChild(document.createTextNode('👆 ' + LXT('Come su Instagram: doppio tocco sul video = ❤️, tieni premuto = menu, scorri a sinistra = ✨ Piano.'))); var x = el('button', null, '✕'); x.type = 'button'; x.setAttribute('aria-label', LXT('Chiudi')); x.onclick = function () { t.remove(); }; t.appendChild(x); document.body.appendChild(t); setTimeout(function () { t.remove(); }, 8000); }, 1500); } // una volta sola, in un fumetto che sparisce: non ruba spazio al video
function glHeart(r, wrap) { var x = find(r.id) || r; if (me && (x.x || {})[me.name] !== '❤️') react(r.id, '❤️'); heartAt(wrap); track('doppio-tocco'); }
function media(r, pl) {
  var s0 = embedFor(r.u);
  if (get('riserv', 0) && !pl && s0 && s0.indexOf('video:') !== 0) {
    var host = (function () { try { return new URL(r.u).hostname.replace(/^(www|m|vm|vt)\./, ''); } catch (e) { return ''; } })();
    var nm = { 'snapchat.com': 'Snapchat', 'tiktok.com': 'TikTok', 'instagram.com': 'Instagram', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube', 'facebook.com': 'Facebook' }[host] || host;
    var box = el('div', 'tap-load'); box.appendChild(el('b', null, '🕶️ Video da ' + nm));
    box.appendChild(el('span', null, 'Modalità riservata: ' + nm + ' non sa che lo guardi finché non lo apri.'));
    var go = el('button', 'btn', '▶ Guarda'); go.onclick = function () { box.replaceWith(mediaRaw(r, true)); }; box.appendChild(go);
    return box;
  }
  return mediaRaw(r, pl);
}
function mediaRaw(r, pl) {
  var src = embedFor((get('fbres', {}) || {})[r.u] || r.u); // link «Condividi» di Facebook già trasformati nel link vero
  if (src && src.indexOf('video:') === 0) {
    var vd = el('video'); vd.src = src.slice(6); vd.controls = true; vd.playsInline = true; vd.preload = 'metadata'; if (pl) { vd.autoplay = true; if (isIOSdev()) vd.muted = true; }
    vd.setAttribute('playsinline', ''); vd.title = 'Video di ' + r.n; return vd;
  }
  if (src) {
    if (pl && /tiktok\.com\/player/.test(src)) src += '&autoplay=1';
    if (pl && /youtube\.com\/embed/.test(src)) src += '&autoplay=1' + (isIOSdev() ? '&mute=1' : '');
    // nel lettore partono da soli dove la piattaforma lo permette (su iPhone senza audio: un tocco per sentirlo)
    if (pl && /player\.vimeo\.com/.test(src)) src += (src.indexOf('?') < 0 ? '?' : '&') + 'autoplay=1&muted=1';
    if (pl && /dailymotion\.com\/embed/.test(src)) src += (src.indexOf('?') < 0 ? '?' : '&') + 'autoplay=1&mute=1';
    if (pl && /player\.twitch\.tv/.test(src)) src = src.replace('autoplay=false', 'autoplay=true&muted=true');
    if (pl && /facebook\.com\/plugins\/video/.test(src)) src += '&autoplay=true&mute=1';
    var fr = el('iframe'); fr.src = src; if (!pl) fr.loading = 'lazy'; fr.title = 'Reel di ' + r.n;
    fr.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    fr.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation' + (/instagram\.com\/p\//.test(src) ? ' allow-popups allow-popups-to-escape-sandbox' : '')); // Instagram: come nelle storie, altrimenti il tocco su ▶ va a vuoto. Gli altri: senza allow-popups: un tocco dentro il video non apre Instagram/TikTok e non fa uscire dall'app (per uscire apposta c'è «Apri»)
    fr.referrerPolicy = 'strict-origin-when-cross-origin';
    var inner = fr;
    if (/instagram\.com\/p\//.test(src)) {
      inner = el('div', 'igcrop');
      // nel lettore i Reel di Instagram riempiono lo schermo: niente parte bianca con likes e commenti sotto il video
      if (pl && /instagram\.com\/(reels?|tv)\//.test(r.u)) { inner.className = 'igcrop igfit'; var bx = el('div', 'igbox'); bx.appendChild(fr); inner.appendChild(bx); setTimeout(igFit, 0); }
      else inner.appendChild(fr);
    }
    if (/tiktok\.com\/player/.test(src)) {
      fr.className = 'tt';
      // cuori e commenti di TikTok non si possono togliere: uno strato invisibile li copre, così un tocco lì non porta su TikTok ma mette in pausa / fa ripartire
      inner = el('div', 'ttbox'); inner.appendChild(fr); var sh = el('div', 'ttsh'); sh.setAttribute('aria-hidden', 'true');
      sh.onclick = function (e) { e.preventDefault(); e.stopPropagation(); fr.__pz = !fr.__pz; try { fr.contentWindow.postMessage({ type: fr.__pz ? 'pause' : 'play', value: null, 'x-tiktok-player': true }, '*'); } catch (x) {} };
      inner.appendChild(sh);
    }
    var wrap = el('div', 'mwrap' + (fr.className === 'tt' ? ' ttw' : '')); wrap.appendChild(inner);
    var ov = el('a', 'ovl'); ov.href = r.u; ov.target = '_blank'; ov.rel = 'noopener noreferrer'; ov.setAttribute('aria-label', 'Apri il video originale');
    ov.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
    ov.appendChild(document.createTextNode('Apri')); wrap.appendChild(ov);
    // Instagram a volte non lascia guardare il Reel fuori da Instagram («Watch on Instagram»): lo diciamo chiaro e diamo la strada
    if (/instagram\.com\/p\//.test(src)) {
      wrap.classList.add('igw');
    }
    if (/youtube\.com\/embed|tiktok\.com\/player|player\.vimeo\.com/.test(src)) {
      var mb = el('button', 'mutb'); mb.type = 'button'; muteLabel(mb); mb.onclick = function (e) { e.stopPropagation(); var sp0 = wrap.querySelector('.sndp'); if (sp0) { sp0.click(); return; } muteAll(!vMuted); }; wrap.appendChild(mb);
      // su iPhone YouTube e Vimeo partono senza audio: serve un tocco. Dato una volta, vale per tutta la sessione (riaprendo l'app si richiede)
      var sndS = sndSess(), needTap = pl && isIOSdev() && !vMuted && !/tiktok/.test(src) && !sndS;
      if (needTap) {
        mb.textContent = '🔇'; var sp = el('button', 'sndp', '🔇 Tocca per l’audio'); sp.type = 'button';
        sp.onclick = function (e) { e.stopPropagation(); sp.remove(); sndSess(1); muteLabel(mb); muteFrame(fr); try { if (/youtube/.test(src)) fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'); } catch (x) {} };
        wrap.appendChild(sp);
      } else fr.addEventListener('load', function () {
        setTimeout(function () { muteFrame(fr); }, 600); setTimeout(function () { muteFrame(fr); }, 1800);
        // iPhone con l'audio già concesso: se il telefono blocca comunque il video con l'audio, torna muto, riparte e rimette il tasto
        if (pl && sndS && isIOSdev() && /youtube/.test(src)) {
          try { fr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*'); } catch (x) {}
          setTimeout(function () {
            if (fr.__st === 1 || !fr.isConnected) return;
            try { fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*'); fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'); } catch (x) {}
            var sp2 = el('button', 'sndp', '🔇 Tocca per l’audio'); sp2.type = 'button'; mb.textContent = '🔇';
            sp2.onclick = function (e) { e.stopPropagation(); sp2.remove(); muteLabel(mb); muteFrame(fr); try { fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'); } catch (x) {} };
            wrap.appendChild(sp2);
          }, 3000);
        }
      });
    }
    return wrap;
  }
  var host = new URL(r.u).hostname.replace(/^(www|m|vm)\./, ''), NAMES = { 'linkedin.com': 'LinkedIn', 'lnkd.in': 'LinkedIn', 'twitch.tv': 'Twitch', 'clips.twitch.tv': 'Twitch', 'open.spotify.com': 'Spotify', 'spotify.link': 'Spotify', 'snapchat.com': 'Snapchat', 't.snapchat.com': 'Snapchat', 'facebook.com': 'Facebook', 'fb.watch': 'Facebook', 'tiktok.com': 'TikTok', 'instagram.com': 'Instagram', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube', 'x.com': 'X', 'twitter.com': 'X', 'pinterest.com': 'Pinterest', 'pin.it': 'Pinterest' };
  var nm = NAMES[host] || host;
  var l = el('div', 'link'); l.appendChild(el('div', null, nm));
  var isFb = /facebook\.com|fb\.watch/.test(host);
  if (isFb && srvShort(r.u) && !(window.__fbTry = window.__fbTry || {})[r.u]) { window.__fbTry[r.u] = 1; resolveShort(r.u).then(function (nu) { if (nu && nu !== r.u && embedFor(nu)) { var m = get('fbres', {}) || {}; m[r.u] = nu; put('fbres', m); track('fb-risolto'); if (l.isConnected) l.replaceWith(mediaRaw(r, pl)); } }, function () {}); }
  var why = el('small', null, isFb ? 'Facebook non lascia vedere questo video qui dentro. Si apre in una finestra sopra Reelta: per i video pubblici non serve l’account. Se compare “Accedi”, chiudilo con la ✕. Poi torna qui.' : 'Questo sito non lascia vedere il video qui dentro: si apre a parte e poi torni qui.'); l.appendChild(why);
  var a = el('a', null, '▶  Guarda il video');
  if (pl) a.addEventListener('click', function () { retPend = { id: r.id, at: Date.now() }; });
  if (isShort(r.u)) {
    a.hidden = true; why.hidden = true; var wait = el('div', null, 'Carico il video…'); l.appendChild(wait);
    resolveShort(r.u).then(function (u2) {
      if (u2 !== r.u && embedFor(u2)) {
        var keep = r.u; r.u = u2; feed.forEach(function (x) { if (x.u === keep) x.u = u2; }); put('feed', feed);
        if (l.isConnected) l.replaceWith(media(r, pl));
      } else { wait.remove(); a.hidden = false; why.hidden = false; }
    });
  } a.href = r.u; a.target = '_blank'; a.rel = 'noopener noreferrer'; l.appendChild(a); return l;
}
// tornando da un video aperto a parte (es. Facebook): reazione e prossimo in un tocco
var retPend = null;
document.addEventListener('visibilitychange', function () {
  if (document.hidden || !retPend) return;
  var rp = retPend; retPend = null; if (Date.now() - rp.at < 1500) return;
  var r = find(rp.id); if (!r || !$('pl').classList.contains('show')) return;
  var lk = $('st').querySelector('.link'); if (!lk || lk.querySelector('.retq')) return;
  var q = el('div', 'retq'); q.appendChild(el('div', null, 'Ti è piaciuto?'));
  var row = el('div', 'retr'); EMO.forEach(function (e) { var b = el('button', 'r-btn', e); b.onclick = function () { react(r.id, e); setTimeout(function () { if (!$('pn').hidden) $('pn').click(); }, 350); }; row.appendChild(b); });
  var nx = el('button', 'btn go', 'Prossimo ⏭'); nx.onclick = function () { $('pn').click(); }; row.appendChild(nx);
  q.appendChild(row); lk.appendChild(q);
});
function orig(r) { var a = el('a', 'orig', 'Non si vede? Apri l’originale'); a.href = r.u; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
// il feed carica i video solo vicino a dove stai guardando e libera quelli lontani: meno memoria, batteria e dati
var feedNear = null, feedFar = null;
// toccare il video nel feed lo apre a schermo intero (come TikTok e Instagram), e da lì si scorre agli altri
// nel feed: la copertina (come la griglia di Instagram) al posto della finestra del sito; il video parte a schermo intero.
// YouTube ci dà la foto vera; per Instagram e gli altri, finché Meta non ce la dà, una copertina nostra con il commento.
function covPlat(u) { var h = ''; try { h = new URL(u).hostname.replace(/^(www|m|vm|vt)\./, ''); } catch (e) {} return { 'tiktok.com': ['TikTok', 'ti-brand-tiktok'], 'instagram.com': ['Instagram', 'ti-brand-instagram'], 'youtube.com': ['YouTube', 'ti-brand-youtube'], 'youtu.be': ['YouTube', 'ti-brand-youtube'], 'facebook.com': ['Facebook', 'ti-brand-facebook'], 'fb.watch': ['Facebook', 'ti-brand-facebook'], 'snapchat.com': ['Snapchat', 'ti-brand-snapchat'], 'vimeo.com': ['Vimeo', 'ti-brand-vimeo'] }[h] || [h || 'Video', '']; }
function coverFor(r) {
  if (get('riserv', 0)) return null;
  var s = embedFor(r.u); if (!s || s.indexOf('video:') === 0) return null;
  var y = s.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/), pk = covPlat(r.u), n = 0;
  for (var i = 0; i < String(r.id).length; i++) n = (n * 31 + String(r.id).charCodeAt(i)) % 997;
  var c = el('div', 'cov ' + (y ? 'img' : 'gen c' + (n % 4))); if (y) c.dataset.yt = y[1];
  if (y) { var im = document.createElement('img'); im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.referrerPolicy = 'no-referrer'; im.onload = function () { im.classList.add('in'); }; im.src = 'https://i.ytimg.com/vi/' + y[1] + '/hqdefault.jpg'; im.onerror = function () { c.className = 'cov gen c' + (n % 4); im.remove(); var k = c.querySelector('.covc'); if (k) k.remove(); c.insertBefore(el('div', 'covq', cap ? '«' + (cap.length > 90 ? cap.slice(0, 88) + '…' : cap) + '»' : LXT('Tocca per guardarlo')), c.querySelector('.covp')); }; c.appendChild(im); }
  var hd = (String(r.u).match(/tiktok\.com\/@([\w.]{2,30})/) || String(r.u).match(/instagram\.com\/(?!reel|reels|p|tv|stories)([\w.]{2,30})\//) || [])[1];
  if (hd && /^(video|videos|photo|p|reel|reels|t|v|share|explore|tv|stories|music|tag)$/i.test(hd)) hd = '';
  var b = el('span', 'covb', pk[0] + (hd ? ' · @' + hd : '')); c.appendChild(b);
  var kk = typeof rcat === 'function' ? rcat(r) : ''; if (kk && RCATS[kk]) c.appendChild(el('span', 'covk', RCATS[kk]));
  var cap = (r.c || (r.aiX && r.aiX.sum) || '').trim();
  if (!y && cap) c.appendChild(el('div', 'covq', '«' + (cap.length > 90 ? cap.slice(0, 88) + '…' : cap) + '»'));
  if (!y && !cap) { // senza commento: niente scritta enorme nel vuoto, ma una copertina ordinata (cosa è e da chi)
    c.classList.add('nocap'); var w = el('div', 'covn');
    c.appendChild(el('span', 'covp', '▶')); w.appendChild(el('div', 'covt', window.LX_LANG === 'en' ? pk[0] + ' Reel' : LXT('Reel di') + ' ' + pk[0]));
    w.appendChild(el('div', 'covs', LXT('Tocca per guardarlo')));
    c.appendChild(w);
  } else c.appendChild(el('span', 'covp', '▶'));
  if (y && cap) c.appendChild(el('div', 'covc', cap.length > 80 ? cap.slice(0, 78) + '…' : cap));
  if (!y && pk[0] === 'TikTok') ttCover(r.u, function (t, a) {
    if (a && /^[\w.]{2,40}$/.test(a)) b.textContent = 'TikTok · @' + a;
    if (!t) return;
    var im = document.createElement('img'); im.alt = ''; im.decoding = 'async'; im.referrerPolicy = 'no-referrer';
    im.onload = function () { c.className = 'cov img tt'; c.insertBefore(im, c.firstChild); requestAnimationFrame(function () { im.classList.add('in'); }); var q = c.querySelector('.covq'); if (q) { q.remove(); if (cap) c.insertBefore(el('div', 'covc', cap.length > 80 ? cap.slice(0, 78) + '…' : cap), c.querySelector('.mtap')); } };
    im.src = t;
  });
  return c;
}
// copertine TikTok: dal nostro server (TikTok le dà gratis), ricordate un giorno su questo telefono
var ttMem = {};
function ttCover(u, cb) {
  var now = Date.now(), m = ttMem[u]; if (!m) { try { m = JSON.parse(localStorage.getItem(LSG + 'ttc') || '{}')[u]; } catch (e) {} }
  if (m && now - m.at < 864e5) { ttMem[u] = m; return cb(m.t, m.a); }
  if (!srvOn()) return cb('');
  mbCall({ a: 'ttcov', u: u }, 7000).then(function (x) {
    var t = x && typeof x.t === 'string' && /^(https:\/\/|\/[\w.-]+$)/.test(x.t) ? x.t : '';
    var v = { t: t, a: x && typeof x.a === 'string' ? x.a.slice(0, 40) : '', at: Date.now() }; ttMem[u] = v;
    try { var all = JSON.parse(localStorage.getItem(LSG + 'ttc') || '{}'); all[u] = v; var ks = Object.keys(all); if (ks.length > 120) ks.sort(function (a, b) { return all[a].at - all[b].at; }).slice(0, ks.length - 120).forEach(function (k) { delete all[k]; }); localStorage.setItem(LSG + 'ttc', JSON.stringify(all)); } catch (e) {}
    cb(t, v.a);
  }, function () { cb(''); });
}
function mediaIn(p) { var cv = coverFor(p._r), m = cv || media(p._r, false); p.appendChild(m); if (cv && cv.querySelector('.covq,.covc') && p._r.c) { var itm = p.closest && p.closest('.item'); if (itm) itm.classList.add('covd'); } if (!get('riserv', 0)) { var t = el('button', 'mtap'); t.type = 'button'; t.setAttribute('aria-label', 'Guarda a schermo intero'); var last = 0, tm = null; glTip(); t.onclick = function () { if (document.querySelector('.mod.open')) return; var now = Date.now(); if (now - last < 330) { clearTimeout(tm); last = 0; glHeart(p._r, m.classList && m.classList.contains('mwrap') ? m : p); return; } last = now; clearTimeout(tm); tm = setTimeout(function () { last = 0; if (!document.querySelector('.mod.open')) openSeqAt(p._r.id); }, 300); }; var o = !cv && m.querySelector && m.querySelector('.ovl'); if (cv) cv.appendChild(t); else if (o) { if (getComputedStyle(m).position === 'static') m.style.position = 'relative'; m.insertBefore(t, o); } else p.appendChild(t); } }
function openSeqAt(id) {
  var vis = feed.filter(function (r) { return !isMuted(r.n); }), q = vis.map(function (r) { return r.id; }), i = q.indexOf(id); if (i < 0) return;
  track('reel-schermo-intero'); setTimeout(fsTip, 1200);
  seq = { q: q, i: i, cur: null }; showPane('pl'); showAt(i);
  if ('ontouchstart' in window && !navigator.webdriver) { seq.auto = true; immSet(true); setTimeout(swTip, 900); }
}
