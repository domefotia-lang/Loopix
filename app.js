/* © 2026 Reelta. Tutti i diritti riservati. File generato da tools/build.py: modifica src/app/*.js */
/* ==== src/app/01-base.js ==== */
// ricarica la pagina solo dopo che i dati sono stati scritti davvero (evita di perdere modifiche appena salvate)
function safeReload() { setTimeout(function () { location.reload(); }, 600); }

var $ = function (i) { return document.getElementById(i); };
var LSG = 'loopix3:', REGK = 'loopixreg';
function regGet() { try { var r = JSON.parse(localStorage.getItem(REGK)); if (r && Array.isArray(r.list)) return r; } catch (e) {} return null; }
function regSet(r) { lsSet(REGK, JSON.stringify(r)); }
var REG = regGet();
if (!REG) { REG = { active: 'c1', list: [{ id: 'c1', label: '' }] }; regSet(REG); }
function lsOf(id) { return id === 'c1' ? LSG : LSG + id + ':'; }
try {
  var lxPend = sessionStorage.getItem('lxRestore');
  if (lxPend) { sessionStorage.removeItem('lxRestore'); window.__lxPend = JSON.parse(lxPend); }
} catch (e) {}
var LS = lsOf(REG.active);
var GLOBALK = { big: 1, pin: 1, theme: 1, dev: 1, riserv: 1, rcpt: 1, bkAt: 1, bkFirst: 1, nt: 1 };
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
function get(k, d) { try { var v = localStorage.getItem((GLOBALK[k] ? LSG : LS) + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
var feedSaveT = 0;
function feedSaveNow() { clearTimeout(feedSaveT); feedSaveT = 0; put0('feed', feed); }
function put(k, v) { if (k === 'feed' && v === feed) { if (!feedSaveT) feedSaveT = setTimeout(feedSaveNow, 300); return; } put0(k, v); }
document.addEventListener('visibilitychange', function () { if (document.hidden && feedSaveT) feedSaveNow(); });
window.addEventListener('pagehide', function () { if (feedSaveT) feedSaveNow(); });
function put0(k, v) {
  var key = (GLOBALK[k] ? LSG : LS) + k, txt; try { txt = JSON.stringify(v); } catch (e) { return; }
  try { localStorage.setItem(key, txt); } catch (e) {
    // memoria del telefono piena: libero spazio togliendo le cose più vecchie (mai i messaggi fissati), poi riprovo una volta
    try {
      errLog.push('memoria piena: ' + k); if (errLog.length > 8) errLog.shift();
      if (typeof feed !== 'undefined' && Array.isArray(feed) && feed.length > 80) { feed.splice(0, feed.length - 80); localStorage.setItem(LS + 'feed', JSON.stringify(feed)); }
      if (typeof msgs !== 'undefined' && Array.isArray(msgs) && msgs.length > 150) { msgs = msgs.filter(function (m, i) { return m.pin || i >= msgs.length - 150; }); localStorage.setItem(LS + 'msgs', JSON.stringify(msgs)); }
      ['rhid', 'gone', 'rxNew'].forEach(function (x) { localStorage.removeItem(LS + x); });
      if (k === 'feed' || k === 'msgs') return; localStorage.setItem(key, txt);
    } catch (e2) {}
  }
}
// nome leggibile di un cerchio: con chi è, non solo "Coppia"
function circKind(id) { try { var m = JSON.parse(localStorage.getItem(lsOf(id) + 'me') || 'null'); return m && m.kind || ''; } catch (e) { return ''; } }
function circName(id) {
  try {
    var P = lsOf(id), m = JSON.parse(localStorage.getItem(P + 'me') || 'null'); if (!m || !m.role) return '';
    if (m.role === 'host') {
      var al = JSON.parse(localStorage.getItem(P + 'allowed') || '{}'), who = Object.keys(al).map(function (k) { return al[k]; }).filter(Boolean);
      var AND = window.LX_LANG === 'en' ? ' and ' : window.LX_LANG === 'es' ? ' y ' : ' e ';
      if (!who.length) return (m.kind === 'couple' || !m.kind ? (window.LX_LANG === 'en' ? 'You' : window.LX_LANG === 'es' ? 'Tú' : 'Tu') : (window.LX_LANG === 'en' ? 'Group' : window.LX_LANG === 'es' ? 'Grupo' : 'Gruppo')) + (window.LX_LANG === 'en' ? ' · nobody yet' : window.LX_LANG === 'es' ? ' · nadie aún' : ' · ancora nessuno');
      return m.kind === 'group' || m.kind === 'big' ? (who.length > 2 ? m.name + ', ' + who.slice(0, 2).join(', ') + ' +' + (who.length - 2) : m.name + ', ' + who.join(AND)) : m.name + AND + who[0];
    }
    var hn = JSON.parse(localStorage.getItem(P + 'hn') || '""');
    var AND2 = window.LX_LANG === 'en' ? ' and ' : window.LX_LANG === 'es' ? ' y ' : ' e ';
    return hn ? (m.name ? m.name + AND2 + hn : 'Cerchio di ' + hn) : 'Cerchio di gruppo';
  } catch (e) { return ''; }
}
function regLabel() {
  var e = REG.list.filter(function (x) { return x.id === REG.active; })[0]; if (!e || !me) return;
  if (me.role !== 'host' && names[0] && get('hn', '') !== names[0]) put('hn', names[0]);
  var l = circName(REG.active) || e.label;
  if (e.label !== l) { e.label = l; regSet(REG); }
}
/* ---- modalità sviluppatore (chiave firmata) e beta su invito ---- */
var BETA_CHIUSA = false;          // true = solo lo sviluppatore crea cerchi; gli altri entrano con un invito
var BIG_MAX = 10;                 // persone in un "Gruppo grande" (solo sviluppatore)
var DEV_PUB = { kty: 'EC', crv: 'P-256', x: 'tpTFlyJrTobDI6bpVw9hhnqjNoMqhQQ6FsLvQ4WsSvI', y: 'uHJoIFyyxZBnbfoVqNELDyg4clgRrX12LeQQgCk-zfY', ext: true };
var isDev = false;
function b64u(t) { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var b = atob(t), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
function checkDev(tok) {
  var m = /^LOOPIX-DEV:([\w-]+)\.([\w-]+)$/.exec(String(tok || '').trim()); if (!m) return Promise.resolve(false);
  return crypto.subtle.importKey('jwk', DEV_PUB, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
    .then(function (k) { return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, b64u(m[2]), new TextEncoder().encode(m[1])); })
    .catch(function () { return false; });
}
function tryDev(text) {
  var m = /LOOPIX-DEV:[\w-]+\.[\w-]+/.exec(String(text || '')); if (!m) return false;
  checkDev(m[0]).then(function (ok) {
    if (ok) { put('dev', m[0]); isDev = true; applyDev(); ask('🛠️ Modalità sviluppatore attiva', 'Su questo telefono puoi creare cerchi senza limiti, anche gruppi grandi fino a ' + BIG_MAX + ' persone.', 'Ottimo'); }
    else ask('Chiave non valida', 'Questa chiave sviluppatore non è giusta.', 'Ho capito');
  });
  return true;
}
function hosted() { var out = { couple: 0, group: 0, big: 0 }; REG.list.forEach(function (x) { try { var m = JSON.parse(localStorage.getItem(lsOf(x.id) + 'me')); if (m && m.role === 'host') out[m.kind === 'group' || m.kind === 'big' ? m.kind : 'couple']++; } catch (e) {} }); return out; }
function canCreate(kind) {
  if (isDev) return true;
  if (BETA_CHIUSA || kind === 'big') return false;
  return hosted()[kind] < 1;
}
function canCreateAny() { return canCreate('couple') || canCreate('group') || canCreate('big'); }
function kindName(k) { return k === 'big' ? 'Gruppo grande' : k === 'group' ? 'Gruppo' : 'In due'; }
function applyDev() {
  if ($('kB')) $('kB').hidden = !isDev;
  if ($('devC')) $('devC').hidden = !isDev;
  if ($('newC')) $('newC').hidden = !canCreateAny();
  if ($('setup').classList.contains('show')) syncKind();
}
/* ==== src/app/02-backup.js ==== */
/* ---- copia di sicurezza (cifrata con password) ---- */
var BK_KEYS = ['me', 'feed', 'allowed', 'ideas', 'msgs', 'gone', 'seen', 'codes', 'outbox', 'guided', 'muted', 'reps', 'ttl', 'pics', 'aka', 'mhid', 'keep', 'rhid', 'rkeep'], BK_GLOBAL = ['theme', 'big', 'mode', 'speed', 'riserv', 'nt', 'rcpt'];
if (window.__lxPend) {
  // il ripristino appena fatto non risulta salvato: lo riapplico (succede di rado, se il telefono ricarica troppo in fretta)
  try { if (!REG.list.some(function (x) { return localStorage.getItem(lsOf(x.id) + 'me'); })) { applyBackup(window.__lxPend); LS = lsOf(REG.active); } } catch (e) {}
  window.__lxPend = null;
}
function askPw(t, p) {
  return new Promise(function (res) {
    $('pwT').textContent = t; $('pwP').textContent = p; $('pwI').value = ''; $('pwH').textContent = '';
    function done(v) { $('pwM').classList.remove('open'); $('pwOk').onclick = $('pwNo').onclick = null; res(v); }
    $('pwOk').onclick = function () { var v = $('pwI').value; if (v.length < 6) { $('pwH').textContent = 'Almeno 6 caratteri.'; return; } done(v); };
    $('pwNo').onclick = function () { done(null); };
    $('pwM').classList.add('open'); setTimeout(function () { $('pwI').focus(); }, 60);
  });
}
function b64e(a) { var s = ''; a = new Uint8Array(a); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
function b64d(t) { var b = atob(t), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
function pwKey(pw, salt) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey'])
    .then(function (k) { return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 250000, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); });
}
function bkCollect() {
  var out = { app: 'loopix', v: 1, ts: Date.now(), circles: [], global: {} };
  REG.list.forEach(function (x) {
    var d = {}; BK_KEYS.forEach(function (k) { var v = localStorage.getItem(lsOf(x.id) + k); if (v != null) d[k] = v; });
    if (d.me) out.circles.push({ label: x.label, data: d });
  });
  BK_GLOBAL.forEach(function (k) { var v = localStorage.getItem(LSG + k); if (v != null) out.global[k] = v; });
  return out;
}
async function bkSave() {
  var data = bkCollect();
  if (!data.circles.length) { $('bkH').textContent = 'Non ci sono ancora cerchi da salvare.'; return; }
  var pw = await askPw('Scegli una password', 'Proteggerà la copia: senza password nessuno può aprirla. Scrivila da qualche parte: se la dimentichi, la copia non si può più aprire.');
  if (!pw) return;
  var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  var key = await pwKey(pw, salt);
  var enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(JSON.stringify(data)));
  var body = JSON.stringify({ app: 'loopix-backup', v: 1, salt: b64e(salt), iv: b64e(iv), data: b64e(enc) });
  var name = 'Reelta-copia-' + new Date().toISOString().slice(0, 10) + '.json';
  var file = new File([body], name, { type: 'application/json' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Copia di Reelta' }); put('bkAt', Date.now()); $('bkH').textContent = 'Fatto ✓ Tienila in File o iCloud. Contiene ' + data.circles.length + (data.circles.length === 1 ? ' cerchio.' : ' cerchi.'); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  var a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  put('bkAt', Date.now()); $('bkH').textContent = 'Copia scaricata ✓ (' + name + ')';
}
async function bkRestore(text) {
  var box; try { box = JSON.parse(text); } catch (e) { box = null; }
  if (!box || box.app !== 'loopix-backup') { ask('File non valido', 'Questo non è una copia di Reelta.', 'Ho capito'); return; }
  var data = null;
  while (!data) {
    var pw = await askPw('Password della copia', 'Scrivi la password che hai scelto quando hai salvato la copia.');
    if (!pw) return;
    try { var key = await pwKey(pw, b64d(box.salt)); data = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(box.iv) }, key, b64d(box.data)))); }
    catch (e) { await ask('Password sbagliata', 'Riprova con la password giusta.', 'Riprova'); }
  }
  try { sessionStorage.setItem('lxRestore', JSON.stringify(data)); } catch (e) {}
  var res = applyBackup(data), added = res.added, skipped = res.skipped;
  await ask('Copia ripristinata ✓', added ? 'Ho ripristinato ' + added + (added === 1 ? ' cerchio' : ' cerchi') + (skipped ? ' (' + skipped + ' c’erano già)' : '') + '. Reelta si riapre adesso.' : 'Tutti i cerchi della copia sono già su questo telefono.', 'Ok');
  history.replaceState(null, '', location.pathname); safeReload();
}
function applyBackup(data) {
  var have = {}; REG.list.forEach(function (x) { try { var m = JSON.parse(localStorage.getItem(lsOf(x.id) + 'me')); if (m) have[m.hostId] = 1; } catch (e) {} });
  var added = 0, skipped = 0;
  (data.circles || []).forEach(function (c) {
    var m; try { m = JSON.parse(c.data.me); } catch (e) { return; }
    if (!m || !m.hostId) return; if (have[m.hostId]) { skipped++; return; }
    var empty = REG.list.filter(function (x) { return !localStorage.getItem(lsOf(x.id) + 'me'); })[0], id;
    if (empty) id = empty.id; else { var n = 1; while (REG.list.some(function (x) { return x.id === 'c' + n; })) n++; id = 'c' + n; REG.list.push({ id: id, label: c.label || '' }); }
    REG.list.forEach(function (x) { if (x.id === id) x.label = c.label || x.label; });
    Object.keys(c.data).forEach(function (k) { if (BK_KEYS.indexOf(k) >= 0) lsSet(lsOf(id) + k, c.data[k]); });
    if (!localStorage.getItem(lsOf(REG.active) + 'me')) REG.active = id;
    added++;
  });
  Object.keys(data.global || {}).forEach(function (k) { if (BK_GLOBAL.indexOf(k) >= 0 && localStorage.getItem(LSG + k) == null) lsSet(LSG + k, data.global[k]); });
  delete REG.prev; delete REG.after; regSet(REG);
  return { added: added, skipped: skipped };
}
/* ---- ☁️ copia automatica: cifrata qui sul telefono con il codice di recupero. Il server riceve solo un id (impronta del codice) e byte illeggibili ---- */
var B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function bkFmt(n) { return n.replace(/(.{4})(?!$)/g, '$1-'); }
function bkCode() { var b = crypto.getRandomValues(new Uint8Array(20)), s = ''; for (var i = 0; i < 20; i++) s += B32[b[i] & 31]; return bkFmt(s); }
function bkNorm(c) { var n = String(c || '').toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1').replace(/[^0-9A-Z]/g, ''); return n.length === 20 && n.split('').every(function (ch) { return B32.indexOf(ch) >= 0; }) ? n : ''; }
function bkIds(c) {
  var n = bkNorm(c);
  return Promise.all([crypto.subtle.digest('SHA-256', te8.encode('reelta-bk-id:' + n)), crypto.subtle.digest('SHA-256', te8.encode('reelta-bk-key:' + n))])
    .then(function (h) { return crypto.subtle.importKey('raw', h[1], 'AES-GCM', false, ['encrypt', 'decrypt']).then(function (k) { return { id: mbEnc(h[0]), key: k }; }); });
}
function gzOut(str) { if (typeof CompressionStream !== 'function') return Promise.resolve(null); return new Response(new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer().catch(function () { return null; }); }
function gzIn(buf) { return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text(); }
function bkSeal(c, obj) {
  var js = JSON.stringify(obj);
  return Promise.all([bkIds(c), gzOut(js)]).then(function (v) {
    var iv = crypto.getRandomValues(new Uint8Array(12)), raw = v[1] || te8.encode(js);
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, v[0].key, raw).then(function (e) { return { id: v[0].id, data: JSON.stringify({ app: 'reelta-cloud', v: 1, z: v[1] ? 1 : 0, iv: b64e(iv), data: b64e(e) }) }; });
  });
}
function bkOpen(c, text) {
  var box = JSON.parse(text);
  return bkIds(c).then(function (x) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(box.iv) }, x.key, b64d(box.data)); })
    .then(function (raw) { return box.z ? gzIn(raw) : new TextDecoder().decode(raw); }).then(JSON.parse);
}
function cloudOn() { return srvOn() && !!bkNorm(lsGet(LSG + 'bkc')); }
var cloudBusy = false;
// salva solo se qualcosa è cambiato, al massimo ogni 6 ore (meno dati e batteria); force: subito
function cloudSync(force) {
  if (!cloudOn() || cloudBusy || navigator.onLine === false) return Promise.resolve(false);
  if (!force && Date.now() - (+(lsGet(LSG + 'bkt') || 0)) < 6 * 36e5) return Promise.resolve(false);
  var data = bkCollect(); if (!data.circles.length) return Promise.resolve(false);
  cloudBusy = true;
  return crypto.subtle.digest('SHA-256', te8.encode(JSON.stringify([data.circles, data.global]))).then(function (h) {
    var sig = hex(h).slice(0, 16);
    if (!force && sig === lsGet(LSG + 'bkh')) { lsSet(LSG + 'bkt', String(Date.now())); return false; }
    return bkSeal(lsGet(LSG + 'bkc'), data).then(function (x) {
      if (x.data.length > 2800000) { lsSet(LSG + 'bkbig', '1'); return false; }
      lsDel(LSG + 'bkbig');
      return mbCall({ a: 'bkput', id: x.id, data: x.data }).then(function (r) { if (r && r.ok) { lsSet(LSG + 'bkh', sig); lsSet(LSG + 'bkt', String(Date.now())); put('bkAt', Date.now()); return true; } return false; });
    });
  }).catch(function () { return false; }).then(function (ok) { cloudBusy = false; cloudUI(); return ok; });
}
function cloudUI() {
  var w = $('bkCl'); if (!w) return; w.hidden = !srvOn();
  var on = cloudOn(), t = +(lsGet(LSG + 'bkt') || 0);
  $('bkCp').textContent = on ? LXT('Attiva ✓ Quando cambia qualcosa salvo da sola una copia cifrata di tutti i tuoi cerchi.') + (t ? ' ' + LXT('Ultima copia:') + ' ' + new Date(t).toLocaleString(window.LX_LANG || 'it', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '') + (lsGet(LSG + 'bkbig') ? ' ' + LXT('⚠️ I cerchi sono troppo grandi per la copia automatica: salva anche un file qui sopra.') : '')
    : LXT('Se perdi o cambi telefono, con un codice ritrovi tutto. La copia è cifrata qui sul telefono: il server non può leggerla.');
  $('bkCo').textContent = on ? LXT('🔑 Mostra il codice di recupero') : LXT('☁️ Attiva la copia automatica'); $('bkCo').className = on ? 'btn-o wide' : 'btn';
  $('bkCx').hidden = !on;
}
function cloudStart() {
  if (!srvOn()) return;
  if (cloudOn()) { ask(LXT('🔑 Il tuo codice di recupero'), lsGet(LSG + 'bkc') + '\n\n' + LXT('Serve per ritrovare tutto su un altro telefono: tienilo al sicuro.'), 'Ok'); return; }
  var c = bkCode();
  try { if (navigator.clipboard) navigator.clipboard.writeText(c).catch(function () {}); } catch (e) {}
  ask(LXT('🔑 Il tuo codice di recupero'), c + '\n\n' + LXT('Scrivilo su carta o salvalo nelle note (l’ho anche copiato). Serve per ritrovare tutto su un altro telefono: senza codice la copia non si apre, nemmeno da noi.'), LXT('L’ho salvato')).then(function (y) {
    if (!y) return;
    lsSet(LSG + 'bkc', c); lsDel(LSG + 'bkh'); track('copia-auto-on'); cloudUI(); $('bkH').textContent = LXT('Salvo la prima copia…');
    cloudSync(true).then(function (ok) { $('bkH').textContent = ok ? LXT('Copia automatica attiva ✓') : LXT('Attivata: la prima copia parte appena c’è rete.'); });
  });
}
function cloudStop() {
  ask(LXT('Disattivare la copia automatica?'), LXT('Cancello la copia dal server. I tuoi cerchi su questo telefono restano come sono.'), LXT('Disattiva'), true).then(function (y) {
    if (!y) return; var c = lsGet(LSG + 'bkc');
    if (bkNorm(c)) bkIds(c).then(function (x) { return mbCall({ a: 'bkdel', id: x.id }); }).catch(function () {});
    ['bkc', 'bkh', 'bkt', 'bkbig'].forEach(function (k) { lsDel(LSG + k); }); cloudUI(); $('bkH').textContent = LXT('Copia automatica disattivata.');
  });
}
function askCode() {
  var i = $('pwI'), ph = i.placeholder, ty = i.type; i.type = 'text'; i.setAttribute('autocapitalize', 'characters'); i.placeholder = 'XXXX-XXXX-XXXX-XXXX-XXXX';
  return askPw(LXT('Codice di recupero'), LXT('Scrivi il codice che hai salvato quando hai attivato la copia automatica.')).then(function (v) { i.type = ty; i.placeholder = ph; i.removeAttribute('autocapitalize'); return v; });
}
async function cloudRestore() {
  if (!srvOn()) return;
  for (;;) {
    var c = await askCode(); if (!c) return;
    var n = bkNorm(c);
    if (!n) { if (!(await ask(LXT('Codice non valido'), LXT('Il codice ha 20 caratteri, in gruppi da 4. Controlla e riprova.'), LXT('Riprova')))) return; continue; }
    var x = await bkIds(n), r = null, why = '';
    try { r = await mbCall({ a: 'bkget', id: x.id }, 40000); } catch (e) { why = /404/.test(String(e && e.message)) ? 'none' : 'net'; }
    if (r && r.error === 'limite') why = 'lim';
    if (why === 'none') { if (!(await ask(LXT('Nessuna copia con questo codice'), LXT('Controlla di averlo scritto giusto. Se la copia automatica era stata disattivata, il codice non vale più.'), LXT('Riprova')))) return; continue; }
    if (why || !r || !r.data) { await ask(LXT('Non riesco a scaricare la copia'), why === 'lim' ? LXT('Troppi tentativi per oggi: riprova domani.') : LXT('Controlla la connessione e riprova.'), 'Ok'); return; }
    var data = null; try { data = await bkOpen(n, r.data); } catch (e) { data = null; }
    if (!data || !Array.isArray(data.circles)) { await ask(LXT('Non riesco ad aprire la copia'), LXT('Il codice non corrisponde a questa copia.'), 'Ok'); return; }
    lsSet(LSG + 'bkc', bkFmt(n)); lsSet(LSG + 'bkt', String(Date.now()));
    try { sessionStorage.setItem('lxRestore', JSON.stringify(data)); } catch (e) {}
    var res = applyBackup(data); track('copia-auto-ripristino');
    await ask('Copia ripristinata ✓', res.added ? 'Ho ripristinato ' + res.added + (res.added === 1 ? ' cerchio' : ' cerchi') + (res.skipped ? ' (' + res.skipped + ' c’erano già)' : '') + '. Reelta si riapre adesso.' : 'Tutti i cerchi della copia sono già su questo telefono.', 'Ok');
    history.replaceState(null, '', location.pathname); safeReload(); return;
  }
}
function restoreChoice() {
  if (!srvOn()) { pickBackup(); return; }
  sheet(LXT('Ripristina i tuoi cerchi'), '', [{ t: '🔑 ' + LXT('Ho un codice di recupero'), f: function () { cloudRestore(); } }, { t: '📂 ' + LXT('Ho un file di copia'), f: pickBackup }]);
}
document.addEventListener('visibilitychange', function () { if (document.hidden) cloudSync(false); });
function goGroupInvite() {
  if (!canCreate('group') && !REG.list.some(function (x) { return x.id !== REG.active && circKind(x.id) === 'group'; })) { ask('Per ora non puoi creare gruppi', 'Reelta è in beta su invito: i nuovi cerchi li crea solo chi gestisce l’app. Chiedi a lui di invitarvi in un gruppo.', 'Ho capito'); return; }
  var g = REG.list.filter(function (x) { return x.id !== REG.active && circKind(x.id) === 'group'; })[0];
  REG.after = 'invite'; REG.nm = me ? me.name : '';
  if (g && !(me && me.kind === 'group')) { REG.active = g.id; regSet(REG); safeReload(); }
  else newCircle();
}
function switchCircle(id) { REG.active = id; regSet(REG); safeReload(); }
function newCircle() { var n = 2; while (REG.list.some(function (x) { return x.id === 'c' + n; })) n++; var id = 'c' + n; REG.list.push({ id: id, label: 'Nuovo' }); REG.prev = REG.active; REG.active = id; regSet(REG); safeReload(); }
function uid(n) { return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(function (x) { return x.toString(16).padStart(2, '0'); }).join(''); }
var AVC = ['#7A4FB8', '#B0466E', '#3C7A9E', '#9A7430', '#3F8A63', '#A3577F'];
function avatar(n) {
  n = String(n || '?'); var h = 0; for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0; var a = el('span', 'av', n.trim().charAt(0).toUpperCase() || '?'); a.style.background = AVC[h % AVC.length]; a.title = n;
  var p = (typeof me !== 'undefined' && me && n === me.name && me.pic !== undefined) ? me.pic : (typeof pics !== 'undefined' ? pics[n] : '');
  if (p && /^data:image\//.test(p)) { a.textContent = ''; a.classList.add('ph'); a.style.backgroundImage = 'url("' + p + '")'; }
  else if (p) { a.textContent = p; a.classList.add('emo'); }
  return a;
}
/* ==== src/app/03-profilo-link-feed.js ==== */
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
/* ==== src/app/04-segnala.js ==== */
/* ---- segnala un problema ---- */
var APP_VER = 'v178', errLog = [];
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
function canDel(r) { return me.role === 'host' || r.n === me.name; }
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
function mediaIn(p) { var m = media(p._r, false); p.appendChild(m); if (!get('riserv', 0)) { var t = el('button', 'mtap'); t.type = 'button'; t.setAttribute('aria-label', 'Guarda a schermo intero'); t.onclick = function () { openSeqAt(p._r.id); }; var o = m.querySelector && m.querySelector('.ovl'); if (o) { if (getComputedStyle(m).position === 'static') m.style.position = 'relative'; m.insertBefore(t, o); } else p.appendChild(t); } }
function openSeqAt(id) {
  var vis = feed.filter(function (r) { return !isMuted(r.n); }), q = vis.map(function (r) { return r.id; }), i = q.indexOf(id); if (i < 0) return;
  track('reel-schermo-intero'); setTimeout(fsTip, 1200);
  seq = { q: q, i: i, cur: null }; showPane('pl'); showAt(i);
  if ('ontouchstart' in window && !navigator.webdriver) { seq.auto = true; immSet(true); setTimeout(swTip, 900); }
}
/* ==== src/app/05-idee.js ==== */
/* ---- ✨ Ispirazione: gli Shorts di YouTube più visti su un argomento, da mandare alla propria persona ---- */
// cosa cerchiamo davvero su YouTube per ogni categoria (in inglese: a Londra i video migliori sono in inglese)
var INSP_QEN = ['best restaurants', 'weekend trip from', 'quick easy recipe', 'date night ideas', 'cheap travel tips', 'gift ideas'];
var INSP_T = { it: ['Ristoranti da provare', 'Weekend fuori città', 'Ricette veloci', 'Cose da fare in coppia', 'Viaggi low cost', 'Idee regalo'], en: ['Restaurants to try', 'Weekend getaways', 'Quick recipes', 'Date ideas', 'Cheap travel', 'Gift ideas'], es: ['Restaurantes para probar', 'Escapadas de fin de semana', 'Recetas rápidas', 'Planes en pareja', 'Viajes baratos', 'Ideas de regalo'] };
/* ---- 🗓️ «Cosa facciamo oggi?»: con chi, quando, budget, dove → 6 idee vere vicino a voi (video se c'è, altrimenti il sito) ---- */
// quartieri di Londra: «Vicino a me» trova il più vicino sul telefono e manda solo il nome (mai la posizione)
var OG_AREAS = [['Westminster', 51.4995, -0.1357], ['Soho', 51.5137, -0.1337], ['Covent Garden', 51.5117, -0.124], ['Camden', 51.539, -0.1426], ['King’s Cross', 51.5308, -0.1238], ['Islington', 51.5362, -0.1033], ['Hackney', 51.545, -0.0553], ['Shoreditch', 51.5265, -0.0798], ['Stratford', 51.5416, -0.0033], ['Canary Wharf', 51.5054, -0.0235], ['Greenwich', 51.4826, -0.0077], ['Lewisham', 51.4615, -0.0138], ['Eltham', 51.4508, 0.0525], ['Woolwich', 51.4906, 0.0636], ['Bromley', 51.4039, 0.0198], ['Croydon', 51.3762, -0.0982], ['Brixton', 51.4613, -0.1156], ['Clapham', 51.4618, -0.1384], ['Battersea', 51.4791, -0.1625], ['Southwark', 51.5035, -0.0804], ['Wimbledon', 51.4214, -0.2064], ['Richmond', 51.4613, -0.3037], ['Kingston', 51.4123, -0.3007], ['Hammersmith', 51.4927, -0.2339], ['Chelsea', 51.4875, -0.1687], ['Kensington', 51.5006, -0.1937], ['Notting Hill', 51.5094, -0.1967], ['Marylebone', 51.5194, -0.1499], ['Hampstead', 51.556, -0.1781], ['Highgate', 51.5716, -0.1448], ['Walthamstow', 51.5908, -0.0134], ['Tottenham', 51.5975, -0.0681], ['Wembley', 51.5588, -0.2817], ['Ealing', 51.513, -0.3089], ['Ilford', 51.559, 0.0741], ['Romford', 51.5751, 0.1857], ['Bexleyheath', 51.4573, 0.1427], ['Sutton', 51.3618, -0.1945], ['Harrow', 51.5806, -0.3416], ['Enfield', 51.6523, -0.0807]];
var OG_EM = { food: '🍽️', kids: '🧸', outdoor: '🌳', culture: '🏛️', show: '🎭', night: '🌙', activity: '🎯' };
function ogPref() { var p = {}; try { p = JSON.parse(localStorage.getItem(LSG + 'oggi') || '{}') || {}; } catch (e) {} return { who: p.who || 'coppia', when: p.when || 'oggi', bud: p.bud || 'any', where: p.where || '', wl: p.wl || '' }; }
function ogNear(cb) {
  if (!navigator.geolocation) { cb(''); return; }
  navigator.geolocation.getCurrentPosition(function (pos) {
    var la = pos.coords.latitude, lo = pos.coords.longitude, best = '', bd = 1e9;
    OG_AREAS.forEach(function (a) { var dd = Math.hypot((a[1] - la) * 111, (a[2] - lo) * 69); if (dd < bd) { bd = dd; best = a[0]; } });
    cb(bd < 15 ? best : (Math.round(la * 10) / 10) + ', ' + (Math.round(lo * 10) / 10)); // fuori Londra: solo una zona larga ~10 km
  }, function () { cb(''); }, { maximumAge: 6e5, timeout: 9000, enableHighAccuracy: false });
}
function ogForm() {
  var p = ogPref(), c = cityGet() || 'Londra', lon = isLon(c), F = el('div', 'ogf');
  F.appendChild(el('h3', null, '🗓️ ' + LXT('Cosa facciamo oggi?')));
  F.appendChild(el('p', 'refn', LXT('Scegli e trovo idee vere vicino a voi: con il video se c’è, altrimenti il sito.')));
  var row = function (lab, key, opts) {
    var r = el('div', 'ogr'); r.appendChild(el('span', 'ogl', LXT(lab))); var w = el('div', 'ogc');
    opts.forEach(function (o) { var b = el('button', 'chip', LXT(o[1])); b.type = 'button'; b.setAttribute('aria-pressed', String(p[key] === o[0])); b.onclick = function () { if (o[0] === 'near') { b.textContent = '📍 …'; ogNear(function (a) { if (!a) { b.textContent = '📍 ' + LXT('Vicino a me'); $('mh').textContent = LXT('Non riesco a sapere la zona: scegline una qui sotto.'); return; } p.where = a; p.wl = a; b.textContent = '📍 ' + a; mark(); }); return; } p[key] = o[0]; if (key === 'where') p.wl = ''; mark(); }; b._k = o[0]; w.appendChild(b); });
    function mark() { w.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', String(key === 'where' ? (b._k === 'near' ? !!p.wl : p.where === b._k && !p.wl) : p[key] === b._k)); }); lsSet(LSG + 'oggi', JSON.stringify(p)); }
    r.appendChild(w); F.appendChild(r);
  };
  row('Con chi', 'who', [['coppia', '💑 In coppia'], ['bimbi', '🧸 Con i bambini'], ['amici', '🍻 Con amici']]);
  row('Quando', 'when', [['oggi', 'Oggi'], ['sera', 'Stasera'], ['weekend', 'Questo weekend']]);
  row('Budget', 'bud', [['any', 'Qualsiasi'], ['free', 'Gratis'], ['low', '£'], ['mid', '££'], ['high', '£££']]);
  row('Dove', 'where', [['near', p.wl ? p.wl : '📍 Vicino a me']].concat(lon ? [['Central London', 'Centro'], ['North London', 'Nord'], ['South London', 'Sud'], ['East London', 'Est'], ['West London', 'Ovest']] : [['centre', 'Centro'], ['around', 'Dintorni']]));
  if (p.wl) { var nb = F.querySelector('.ogr:last-child .chip'); if (nb) nb.textContent = '📍 ' + p.wl; }
  var go = withIco(el('button', 'btn wide', ''), 'spark', LXT('Trova idee')); go.type = 'button';
  go.onclick = function () { var q = ogPref(); if (!q.where) { q.where = lon ? 'Central London' : 'centre'; lsSet(LSG + 'oggi', JSON.stringify(q)); } ogRun(q, F); };
  F.appendChild(go);
  return F;
}
function ogRun(p, F) {
  var L = $('inspL'), c = cityGet() || 'Londra', lon = isLon(c), city = lon ? 'London' : c;
  L.querySelectorAll('.og').forEach(function (x) { x.remove(); });
  var anchor = F.nextSibling, put0 = function (n) { L.insertBefore(n, anchor); };
  var hd = el('p', 'og ogh', '✨ ' + LXT('Sto cercando idee vere vicino a voi…')); put0(hd);
  for (var sk = 0; sk < 4; sk++) { var sc = el('div', 'insc skel og'); sc.appendChild(el('div', 'inth')); sc.appendChild(el('div', 'skl')); sc.appendChild(el('div', 'skl s2')); put0(sc); }
  hd.scrollIntoView({ behavior: 'smooth', block: 'start' });
  var where = p.where === 'centre' ? 'the centre' : p.where === 'around' ? 'the surroundings' : p.where;
  track('oggi-' + p.who + '-' + p.when);
  mbCall({ a: 'oggi', where: where, city: city, who: p.who, when: p.when, bud: p.bud, lang: window.LX_LANG || 'it' }, 75000).then(function (x) {
    L.querySelectorAll('.og.skel').forEach(function (n) { n.remove(); });
    if (!x || x.error || !x.items || !x.items.length) { hd.textContent = x && x.error === 'limite' ? LXT('Per oggi le ricerche sono finite: domani si ricaricano. Intanto guarda le idee qui sotto.') : LXT('Non sono riuscito a trovare idee adesso: riprova tra poco.'); return; }
    hd.textContent = '✨ ' + LXT('Idee per voi') + ' · ' + (p.wl || LXT({ 'Central London': 'Centro', 'North London': 'Nord', 'South London': 'Sud', 'East London': 'Est', 'West London': 'Ovest', centre: 'Centro', around: 'Dintorni' }[p.where] || p.where));
    var cards = [];
    x.items.forEach(function (v, i) {
      var link = v.u || gmaps(v.n + ' ' + (v.a || city)), k = 'og-' + v.n.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
      var o = { k: k, it: { s: k, e: OG_EM[v.k] || '🎯', t: v.n, d: [v.a, v.p, v.t].filter(Boolean).join(' · '), l: link, b: v.u ? 'Sito' : 'Mappa' }, st: { u: link } };
      var card = el('div', 'insc og'), th = el('button', 'inth pkth'); th.type = 'button'; th.appendChild(el('span', 'pke', o.it.e)); card.appendChild(th);
      card.appendChild(el('div', 'intt', v.n)); card.appendChild(el('div', 'inch', [v.a, v.p].filter(Boolean).join(' · ')));
      if (v.w) card.appendChild(el('div', 'ogw', v.w)); if (v.t) card.appendChild(el('div', 'inch', '🕒 ' + v.t));
      var a = document.createElement('a'); a.className = 'btn-o wide'; a.href = link; a.target = '_blank'; a.rel = 'noopener'; withIco(a, v.u ? 'pin' : 'pin', LXT(v.u ? 'Sito' : 'Mappa') + ' ↗'); a.onclick = function () { track('oggi-link'); }; card.appendChild(a);
      var go = withIco(el('button', 'btn wide', ''), 'heart', LXT('Fatelo insieme')); go.type = 'button'; go.onclick = function () { ideaWhat(o); }; card.appendChild(go);
      th.onclick = function () { IV.list = cards.map(function (z) { return z.o; }); ideaView(i); };
      put0(card); cards.push({ o: o, th: th });
    });
    put0(el('p', 'refn og', LXT(x.live ? 'Idee trovate dall’AI con la ricerca Google: controlla orari e prezzi sul sito prima di andare.' : 'Idee scelte dall’AI tra posti stabili e conosciuti: controlla orari e prezzi sul sito prima di andare.')));
    // un video per ogni idea, se esiste (canale ufficiale prima)
    mbCall({ a: 'pack', qs: x.items.map(function (v) { return { q: (v.n + ' ' + (v.a || city)).slice(0, 60), o: [v.n.toLowerCase().slice(0, 40)] }; }), lang: lon ? 'en' : (window.LX_LANG || 'it'), reg: lon ? 'GB' : cityRegion(c) }).then(function (y) {
      if (!y || !y.items) return;
      y.items.forEach(function (vv, i) { var z = cards[i]; if (!vv || !z || !z.th.isConnected) return; z.o.st.u = 'https://www.youtube.com/shorts/' + vv.id; z.th.textContent = ''; var im = document.createElement('img'); im.src = 'https://i.ytimg.com/vi/' + vv.id + '/hqdefault.jpg'; im.alt = ''; im.loading = 'lazy'; z.th.appendChild(im); z.th.appendChild(el('span', 'inpl', '▶')); z.th.classList.remove('pkth'); });
    }, function () {});
  }, function () { L.querySelectorAll('.og.skel').forEach(function (n) { n.remove(); }); hd.textContent = LXT('Non sono riuscito a trovare idee adesso: riprova tra poco.'); });
}
// ✨ Idee per uscire: ora è una scheda fissa in basso (prima era una finestra). inspOpen(q) ci porta e, se serve, apre un argomento.
var xplQ = '';
function xplBuild() {
  var C = $('inspM'); if (!C || C.children.length) return;
  C.appendChild(el('p', 'refn', 'Cose da fare insieme dove vivete e i video più visti. Mandateli alla vostra persona o prenotate.'));
  var tp = el('div', 'fview'); tp.id = 'inspT'; C.appendChild(tp);
  var qi = document.createElement('input'); qi.id = 'inspQ'; qi.maxLength = 60; qi.placeholder = (window.LX_T || String)('Oppure scrivi un argomento…'); qi.setAttribute('aria-label', (window.LX_T || String)('Argomento'));
  var qb = el('button', 'btn-o', '🔍'); qb.type = 'button'; qb.setAttribute('aria-label', (window.LX_T || String)('Cerca'));
  qb.onclick = function () { var v = clean(qi.value, 60); if (v.length >= 3) { qi.blur(); inspLoad(v, true); } }; qi.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); qb.click(); } });
  var rr = el('div'); rr.style.cssText = 'display:flex;gap:6px;margin:4px 0 8px'; qi.style.cssText = 'flex:1;min-width:0;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--s2);color:var(--t);font-size:16px'; qb.style.width = 'auto'; rr.appendChild(qi); rr.appendChild(qb); C.appendChild(rr);
  var L = el('div', 'insg'); L.id = 'inspL'; C.appendChild(L);
  C.appendChild(el('p', 'refn', 'Video pubblici da YouTube. Reelta manda a YouTube solo l’argomento che scegli.'));
  var T = INSP_T[window.LX_LANG] || INSP_T.it;
  var ob = el('button', 'chip', '🗓️ ' + (window.LX_T || String)('Oggi')); ob.type = 'button'; ob.dataset.q = '§oggi'; ob.onclick = function () { inspLoad('§oggi'); }; tp.appendChild(ob);
  var pb = el('button', 'chip', '📍 ' + (window.LX_T || String)('Idee in città')); pb.type = 'button'; pb.dataset.q = '§pack'; pb.onclick = function () { inspLoad('§pack'); }; tp.appendChild(pb);
  T.forEach(function (t, i) { var b = el('button', 'chip', t); b.type = 'button'; b.dataset.q = t; b.onclick = function () { inspLoad(t, i === 0 || i === 1 || i === 3, INSP_QEN[i]); }; tp.appendChild(b); });
}
function inspOpen(q) { xplQ = q || ''; track('insp-apri'); showPane('xpl'); }
// loc: ricerche di posti (ristoranti, cose da fare, ricerca libera) → si aggiunge la città, così YouTube trova video del posto e non a caso
function inspCity(q) { var c = cityGet(); if (!c) return q; var cn = isLon(c) ? 'London' : c, l = q.toLowerCase(); return l.indexOf(cn.toLowerCase()) >= 0 || l.indexOf(c.toLowerCase()) >= 0 ? q : q + ' ' + cn; }
function inspLoad(q, loc, qx) {
  document.querySelectorAll('#inspT .chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.q === q)); });
  if (q === '§pack') { packLoad(); return; }
  if (q === '§oggi') { var L0 = $('inspL'); L0.textContent = ''; L0.appendChild(ogForm()); packLoad(true); return; }
  var L = $('inspL'); L.textContent = ''; for (var sk = 0; sk < 4; sk++) { var sc = el('div', 'insc skel'); sc.appendChild(el('div', 'inth')); sc.appendChild(el('div', 'skl')); sc.appendChild(el('div', 'skl s2')); L.appendChild(sc); }
  var qq = loc ? inspCity(qx || q) : (qx || q);
  mbCall({ a: 'insp', q: qq, lang: window.LX_LANG || 'it', reg: ((navigator.language || '').split('-')[1] || '').slice(0, 2) }).then(function (x) {
    L.textContent = '';
    if (!x || x.error || !x.items) { L.appendChild(el('p', null, x && x.error === 'insp-off' ? 'L’ispirazione non è ancora attiva: arriva a breve.' : x && x.error === 'limite' ? 'Per oggi le ricerche sono finite: domani si ricaricano. Intanto guarda le idee già pronte.' : 'Non sono riuscito a cercare adesso: riprova tra poco.')); return; }
    if (!x.items.length) { L.appendChild(el('p', null, 'Niente su questo argomento: provane un altro.')); return; }
    // via i video fuori tema: tengo quelli che nel titolo o nel canale nominano qualcosa della ricerca (se ne restano almeno 4)
    var STOP = { best: 1, from: 1, tips: 1, ideas: 1, with: 1, easy: 1, quick: 1, london: 1, londra: 1, londres: 1 }, W = qq.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(function (w) { return w.length > 3 && !STOP[w]; });
    var keep = x.items.filter(function (v) { var t = (v.t + ' ' + v.ch).toLowerCase(); return !W.length || W.some(function (w) { return t.indexOf(w) >= 0 || t.indexOf(w.slice(0, -1)) >= 0; }); });
    var items = keep.length >= 4 ? keep : x.items;
    var LV = items.map(function (v) { var u = 'https://www.youtube.com/shorts/' + v.id; return { k: 'yt-' + v.id, it: { s: 'yt-' + v.id, e: '▶', t: v.t, d: v.ch, l: loc ? gmaps(qq) : u, b: loc ? 'Mappa' : 'YouTube' }, st: { u: u } }; });
    items.forEach(function (v, vi) {
      var u = 'https://www.youtube.com/shorts/' + v.id, sent = feed.some(function (r) { return r.u === u; });
      var c = el('div', 'insc'), th = el('button', 'inth'); th.type = 'button'; th.setAttribute('aria-label', (window.LX_T || String)('Guarda') + ': ' + v.t);
      var im = document.createElement('img'); im.src = 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg'; im.alt = ''; im.loading = 'lazy'; th.appendChild(im); th.appendChild(el('span', 'inpl', '▶'));
      th.onclick = function () { IV.list = LV; ideaView(vi); track('insp-guarda'); }; // a schermo intero, come le storie: si scorre al video dopo
      c.appendChild(th); c.appendChild(el('div', 'intt', v.t)); c.appendChild(el('div', 'inch', v.ch));
      var go = el('button', sent ? 'btn-o wide' : 'btn', sent ? '✓ Nel cerchio' : '➕ Mandalo'); go.type = 'button'; go.disabled = sent;
      go.onclick = function () { postAll(u, ''); go.textContent = '✓ ' + (window.LX_T || String)('Mandato'); go.className = 'btn-o wide'; go.disabled = true; track('insp-manda'); };
      c.appendChild(go); L.appendChild(c);
    });
  }, function () { L.textContent = ''; L.appendChild(el('p', null, 'Non sono riuscito a cercare adesso: riprova tra poco.')); });
}
/* ---- 📍 Idee in città: cose da fare in due (o in gruppo) dove vivi, con il link per prenotare. Contiamo chi lo tocca. ---- */
function gmaps(q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }
function gyg(q) { return 'https://www.getyourguide.com/s/?q=' + encodeURIComponent(q); }
var PACK_LON = [
  { s: 'stafford-bar', e: '🍸', t: 'American Bar al The Stafford', d: 'St James’s · cocktail in un bar leggendario', q: 'American Bar The Stafford London', l: gmaps('American Bar The Stafford London'), b: 'Prenota', v: 'https://www.instagram.com/reel/Dfo738_RFrq/' },
  { s: 'stafford-tea', e: '🫖', t: 'Afternoon tea al The Stafford', d: 'St James’s · lusso a 5 stelle', q: 'The Stafford London afternoon tea', l: gmaps('The Stafford London'), b: 'Prenota', v: 'https://www.instagram.com/reel/De39FyPRwj-/' },
  { s: 'stafford-caines', e: '⭐', t: 'Cena da Michael Caines al The Stafford', d: 'St James’s · una stella Michelin', q: 'Michael Caines at The Stafford', l: gmaps('Michael Caines at The Stafford London'), b: 'Prenota', v: 'https://www.instagram.com/reel/DZkBViYs7jP/' },
  { s: 'stafford-terrace', e: '🌿', t: 'La terrazza dell’American Bar', d: 'St James’s · cocktail all’aperto, nel cortile', q: 'American Bar terrace The Stafford London', l: gmaps('American Bar The Stafford London'), b: 'Prenota', v: 'https://www.instagram.com/reel/DeolyknIgQl/' },
  { s: 'candlelight', o: ['candlelight', 'fever'], e: '🎶', t: 'Concerto a lume di candela', d: 'Candlelight · musica tra mille candele', q: 'Candlelight concert London', l: 'https://feverup.com/en/london/candlelight', b: 'Biglietti' },
  { s: 'o2', o: ['the o2'], e: '🎤', t: 'Concerti all’O2', d: 'Greenwich · i grandi live', q: 'The O2 arena London gig night', l: 'https://www.theo2.co.uk/events', b: 'Biglietti' },
  { s: 'stadio', o: ['tottenham hotspur', 'spurs'], e: '⚽', t: 'Tour dello stadio Tottenham', d: 'Spogliatoi e tunnel dei giocatori', q: 'Tottenham Hotspur Stadium tour skywalk', l: gyg('Tottenham Hotspur Stadium tour'), b: 'Prenota' },
  { s: 'everyman', o: ['everyman'], e: '🎬', t: 'Cinema Everyman', d: 'Divani, coperte e drink in sala', q: 'Everyman cinema sofa London', l: 'https://www.everymancinema.com/', b: 'Biglietti' },
  { s: 'bobbob', o: ['bob bob ricard'], e: '🥂', t: 'Bob Bob Ricard', d: 'Soho · il tasto «Press for Champagne» al tavolo', q: 'Bob Bob Ricard restaurant', l: gmaps('Bob Bob Ricard Soho London'), b: 'Prenota' },
  { s: 'oxo', o: ['oxo tower', 'harvey nichols'], e: '🌃', t: 'Cena all’OXO Tower', d: 'South Bank · tavoli sul Tamigi', q: 'OXO Tower Brasserie view', l: gmaps('OXO Tower Restaurant London'), b: 'Prenota' },
  { s: 'skygarden', o: ['sky garden'], e: '🌇', t: 'Sky Garden', d: 'City · vista gratis, si prenota', q: 'Sky Garden London', l: 'https://skygarden.london/', b: 'Prenota' },
  { s: 'borough', o: ['borough market'], e: '🥙', t: 'Borough Market', d: 'Street food da dividere', q: 'Borough Market food London', l: gmaps('Borough Market London'), b: 'Portami lì' },
  { s: 'primrose', o: ['royal parks'], e: '🌅', t: 'Primrose Hill al tramonto', d: 'Gratis · la vista più romantica', q: 'Primrose Hill sunset London', l: gmaps('Primrose Hill London'), b: 'Portami lì' }
];
var PACK_XMAS = [
  { s: 'winterwonderland', o: ['winter wonderland'], e: '🎡', t: 'Winter Wonderland a Hyde Park', d: 'Luci, giostre e vin brulé', q: 'Hyde Park Winter Wonderland', l: 'https://hydeparkwinterwonderland.com/', b: 'Biglietti' },
  { s: 'skate', o: ['somerset house', 'skate'], e: '⛸️', t: 'Pattinaggio a Somerset House', d: 'Sotto l’albero più bello di Londra', q: 'Skate at Somerset House', l: gmaps('Skate at Somerset House London'), b: 'Biglietti' },
  { s: 'kew', o: ['kew'], e: '✨', t: 'Christmas at Kew', d: 'Un sentiero di luci nei giardini', q: 'Christmas at Kew Gardens trail', l: gmaps('Kew Gardens London'), b: 'Biglietti' }
];
function xmasOn() { var d = new Date(), m = d.getMonth(), g = d.getDate(); return (m === 10 && g >= 15) || m === 11 || (m === 0 && g <= 6); }
// Stafford nascosta finché l'HR non dà il consenso scritto: per rimetterla basta STAFFORD_OK = true
var STAFFORD_OK = !!window.LX_STAFFORD; // i test la riaccendono per controllarla
function packLon() { return (xmasOn() ? PACK_XMAS : []).concat(PACK_LON).filter(function (x) { return STAFFORD_OK || !/^stafford-/.test(x.s); }); }
// al server: la ricerca e i nomi dei canali ufficiali (vincono su tutti gli altri)
function packQ(x) { return x.o ? { q: x.q, o: x.o } : x.q; }
function isLon(c) { return /^(Londra|London|Londres)$/.test(c); }
// Fuori Londra: solo 2–3 grandi eventi in città (niente piccoli locali), poi le idee di Londra per chi ci viene.
function packFor(c) {
  if (isLon(c)) return [];
  var gs = function (x) { return 'https://www.google.com/search?q=' + encodeURIComponent(x); };
  return [
    { s: 'concerti', e: '🎤', t: 'Un grande concerto', d: { f: 'I prossimi live a', c: c }, q: 'concert ' + c + ' live crowd', l: gs('concerti ' + c + ' biglietti'), b: 'Biglietti' },
    { s: 'partita', e: '⚽', t: 'Una partita allo stadio', d: { f: 'Biglietti ufficiali a', c: c }, q: 'stadium atmosphere ' + c, l: gs('biglietti ufficiali partita ' + c), b: 'Biglietti' },
    { s: 'esperienze', e: '🎟️', t: 'Un’esperienza insieme', d: { f: 'Tour e attività a', c: c }, q: 'things to do ' + c, l: gyg(c), b: 'Prenota' }
  ];
}
var CITY_TZ = { 'Europe/London': 'Londra', 'America/New_York': 'New York', 'Europe/Paris': 'Parigi', 'Europe/Madrid': 'Madrid', 'Europe/Berlin': 'Berlino', 'Europe/Dublin': 'Dublino', 'Europe/Amsterdam': 'Amsterdam', 'America/Los_Angeles': 'Los Angeles', 'America/Chicago': 'Chicago', 'Europe/Lisbon': 'Lisbona' };
var CITY_IT = ['Milano', 'Roma', 'Napoli', 'Torino', 'Firenze', 'Bologna'];
function tzName() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } }
function cityGet() { var c = ''; try { c = localStorage.getItem(LSG + 'city') || ''; } catch (e) {} return c || CITY_TZ[tzName()] || ''; }
function citySet(c) { lsSet(LSG + 'city', c); pkvBusy = 0; setTimeout(function () { try { storiesRender(); packPrefetch(); } catch (e) {} }, 0); track('citta-' + c.toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 24)); }
function cityRegion(c) { return isLon(c) ? 'GB' : CITY_IT.indexOf(c) >= 0 || tzName() === 'Europe/Rome' ? 'IT' : tzName().indexOf('America/') === 0 ? 'US' : ((navigator.language || '').split('-')[1] || 'GB').slice(0, 2); }
function cityPick(then) {
  var opts = (tzName() === 'Europe/Rome' ? CITY_IT : ['Londra', 'Milano', 'Roma', 'New York', 'Parigi', 'Madrid']).map(function (c) { return { t: '📍 ' + c, f: function () { citySet(c); then(c); } }; });
  opts.push({ t: '✏️ ' + (window.LX_T || String)('Un’altra città'), f: function () { var v = clean(prompt((window.LX_T || String)('Scrivi la tua città') + ':') || '', 40).trim(); if (v.length >= 2) { citySet(v); then(v); } } });
  sheet('📍 ' + (window.LX_T || String)('Dove siete?'), (window.LX_T || String)('Vi mostro idee per uscire nella vostra città.'), opts);
}
function packLoad(keep) {
  var L = $('inspL'), c = cityGet(); if (!keep) L.textContent = '';
  if (!c) { cityPick(function () { packLoad(); }); L.appendChild(el('p', 'refn', '📍 ' + (window.LX_T || String)('Scegli la tua città.'))); return; }
  var top = el('div'); top.style.cssText = 'grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:8px';
  top.appendChild(el('b', null, '📍 ' + c)); var ch = el('button', 'chip', (window.LX_T || String)('Cambia città')); ch.type = 'button'; ch.onclick = function () { cityPick(function () { packLoad(); }); }; top.appendChild(ch); L.appendChild(top);
  var loc = packFor(c), P = loc.concat(packLon()), cards = [], slug = c.toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 16);
  P.forEach(function (it, i) {
    if (loc.length && i === loc.length) { var h = el('p', null, '✈️ ' + (window.LX_T || String)('Se venite a Londra')); h.style.cssText = 'grid-column:1/-1;font-weight:800;margin:10px 0 0'; L.appendChild(h); }
    var k = it.s + (i < loc.length ? '-' + slug : '');
    var card = el('div', 'insc'), th = el('div', 'inth pkth'); th.appendChild(el('span', 'pke', it.e)); card.appendChild(th);
    card.appendChild(el('div', 'intt', it.t)); card.appendChild(el('div', 'inch', typeof it.d === 'string' ? it.d : (window.LX_T || String)(it.d.f) + ' ' + it.d.c));
    var a = document.createElement('a'); a.className = 'btn'; a.href = it.l; a.target = '_blank'; a.rel = 'noopener'; withIco(a, it.b === 'Biglietti' ? 'ticket' : it.b === 'Prenota' ? 'cal' : 'pin', (window.LX_T || String)(it.b) + ' ↗');
    a.onclick = function () { track('idea-link-' + k); }; card.appendChild(a);
    var go = withIco(el('button', 'btn-o wide', ''), 'plus', LXT('Mandalo')); go.type = 'button'; card.appendChild(go);
    var st = { u: it.l };
    go.onclick = function () { postAll(st.u, it.t); go.textContent = '✓ ' + (window.LX_T || String)('Mandato'); go.disabled = true; track('idea-manda-' + k); };
    if (it.v) st.u = it.v;
    th.onclick = function () { ideaView(i); };
    L.appendChild(card); cards.push({ th: th, st: st, it: it, k: k, reg: i < loc.length ? cityRegion(c) : 'GB' });
  });
  IV.list = cards;
  var wv = withIco(el('button', 'btn wide', ''), 'play', (window.LX_T || String)('Guarda i video delle idee')); wv.type = 'button'; wv.style.gridColumn = '1/-1'; wv.onclick = function () { ideaView(0); }; L.insertBefore(wv, top.nextSibling);
  L.appendChild(el('p', 'refn', (window.LX_T || String)('Idee scelte da Reelta. I video vengono dai canali ufficiali e da YouTube.')));
  track('idee-viste-' + (loc.length ? 'altra-citta' : 'londra'));
  var fill = function (off) { return function (x) {
    if (!x || !x.items) return;
    x.items.forEach(function (v, i) {
      var o = cards[off + i]; if (!v || !o || !o.th.isConnected) return;
      if (!o.it.v) o.st.u = 'https://www.youtube.com/shorts/' + v.id;
      var b = el('button', 'inth'); b.type = 'button'; b.setAttribute('aria-label', (window.LX_T || String)('Guarda') + ': ' + o.it.t);
      var im = document.createElement('img'); im.src = 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg'; im.alt = ''; im.loading = 'lazy'; b.appendChild(im); b.appendChild(el('span', 'inpl', '▶'));
      b.onclick = function () { ideaView(cards.indexOf(o)); };
      o.th.replaceWith(b); o.th = b;
    });
  }; };
  if (loc.length) mbCall({ a: 'pack', qs: loc.map(packQ), lang: window.LX_LANG || 'it', reg: cityRegion(c) }).then(fill(0), function () {});
  mbCall({ a: 'pack', qs: packLon().map(packQ), lang: 'en', reg: 'GB' }).then(fill(loc.length), function () {});
}
/* ---- icone disegnate (stesso tratto della barra in basso) al posto delle emoji nei tasti ---- */
var ICO = {
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  ticket: '<path d="M3.5 7.5h17v3a2 2 0 0 0 0 4v3h-17v-3a2 2 0 0 0 0-4z"/><path d="M14.5 7.5v10" stroke-dasharray="2 2.2"/>',
  pin: '<path d="M12 21s-6.5-5.8-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
  spark: '<path d="M12 3.5l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z"/><path d="M18.5 3.5v3M17 5h3"/>',
  chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16 14.2a4.6 4.6 0 0 1 5 4.8"/>',
  copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  share: '<path d="M12 3.5v11M8 7.5l4-4 4 4M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/>'
};
function icoEl(n) { var w = document.createElement('span'); w.innerHTML = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (ICO[n] || '') + '</svg>'; return w.firstChild; }
var EMOJI_LEAD = /^[☀-➿\uD83C-􏰀-\uDFFF️‍⭐⬆↔-↪⏩-⏺\s]+/;
function withIco(b, n, label) {
  if (!b) return b; var t = label != null ? label : b.textContent.replace(EMOJI_LEAD, '').trim();
  b.textContent = ''; b.appendChild(icoEl(n)); b.appendChild(document.createTextNode(t)); b.classList.add('hasico'); return b;
}
function decorateStatic() {
  [['invWA', 'chat'], ['invSh', 'share'], ['invCp', 'copy'], ['kMore', 'users'], ['haveInv', 'mail'], ['gdDemo', 'play']].forEach(function (x) { try { if ($(x[0]) && !$(x[0]).querySelector('.ico')) withIco($(x[0]), x[1]); } catch (e) {} });
}
setTimeout(decorateStatic, 0);
/* ---- ▶ le idee come i Reel: video a tutto schermo dai canali ufficiali, sotto «Fatelo insieme» e «Prenota» ---- */
var IV = { list: [], i: 0 };
function ideaVidOf(o) { if (o.st && /^\.\/v\/[\w-]+\.mp4$/.test(o.st.u)) return o.st.u; return o.st && /^https:\/\/(www\.)?(youtube\.com|youtu\.be|instagram\.com|tiktok\.com|vm\.tiktok\.com|facebook\.com)\//.test(o.st.u) ? o.st.u : ''; }
function ideaView(i) {
  if (!IV.list.length) return; var V = $('ideaV');
  if (!V) {
    V = el('div'); V.id = 'ideaV'; V.setAttribute('role', 'dialog'); V.setAttribute('aria-modal', 'true');
    V.innerHTML = '<div class="ivtop"><button type="button" class="ivx" id="ivX" aria-label="Chiudi">✕</button><span id="ivN"></span></div><div class="ivst" id="ivS"></div><div class="ivp" id="ivP"><b id="ivT"></b><span id="ivD"></span><div class="ivb"><button type="button" class="btn" id="ivGo"></button><a class="btn-o" id="ivBk" target="_blank" rel="noopener"></a></div><div class="ivnav"><button type="button" class="btn-o" id="ivPr" aria-label="Precedente">‹</button><span id="ivC"></span><button type="button" class="btn-o" id="ivNx" aria-label="Successivo">›</button></div></div>';
    document.body.appendChild(V);
    $('ivX').onclick = ideaViewClose; $('ivPr').onclick = function () { ideaViewAt(IV.i - 1); }; $('ivNx').onclick = function () { ideaViewAt(IV.i + 1); };
    var y0 = null; [$('ivP'), V.querySelector('.ivtop')].forEach(function (z) { z.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true }); z.addEventListener('touchend', function (e) { if (y0 === null) return; var d = e.changedTouches[0].clientY - y0; y0 = null; if (Math.abs(d) > 50) ideaViewAt(IV.i + (d < 0 ? 1 : -1)); }, { passive: true }); });
    document.addEventListener('keydown', function (e) { if (!V.classList.contains('open')) return; if (e.key === 'Escape') ideaViewClose(); if (e.key === 'ArrowDown' || e.key === 'ArrowRight') ideaViewAt(IV.i + 1); if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ideaViewAt(IV.i - 1); });
  }
  withIco($('ivGo'), 'heart', LXT('Fatelo insieme')); $('ivGo').onclick = function () { ideaWhat(IV.list[IV.i]); };
  V.classList.add('open'); track('idee-video-apri'); ideaViewAt(i || 0);
}
function ideaViewAt(i) {
  var n = IV.list.length; if (!n) return; IV.i = (i + n) % n; var o = IV.list[IV.i], it = o.it, S = $('ivS'); S.textContent = '';
  var u = ideaVidOf(o); try { var sn = JSON.parse(localStorage.getItem(LSG + 'ivseen') || '{}'); if (!sn[o.k]) { sn[o.k] = 1; localStorage.setItem(LSG + 'ivseen', JSON.stringify(sn)); } } catch (e) {}
  if (u && /^\.\/v\//.test(u)) { // video del locale caricato da noi (con il loro permesso): parte da solo, in loop; un tocco per l'audio
    var vd = document.createElement('video'); vd.src = u; vd.autoplay = true; vd.muted = true; vd.loop = true; vd.playsInline = true; vd.setAttribute('playsinline', ''); vd.style.objectFit = 'cover';
    var sb = el('button', 'ivsnd', '🔇'); sb.type = 'button'; sb.setAttribute('aria-label', LXT('Audio')); sb.onclick = function () { vd.muted = !vd.muted; sb.textContent = vd.muted ? '🔇' : '🔊'; if (!vd.muted) vd.play().catch(function () {}); };
    vd.onclick = function () { sb.click(); }; var wr = el('div', 'ivvw'); wr.appendChild(vd); wr.appendChild(sb); S.appendChild(wr); vd.play().catch(function () {}); track('idea-guarda-' + o.k);
  } else if (u && /instagram\.com\/(reels?|p|tv)\/([\w-]+)/.test(u)) { // reel di Instagram: il riquadro ufficiale intero, con il nome dell'account, senza ritagli
    var igid = /instagram\.com\/(?:reels?|p|tv)\/([\w-]+)/.exec(u)[1], igw = el('div', 'ivig'), igf = document.createElement('iframe');
    igf.src = 'https://www.instagram.com/p/' + igid + '/embed/'; igf.title = LXT(it.t); igf.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture'; igf.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups'); igf.referrerPolicy = 'strict-origin-when-cross-origin';
    igw.appendChild(igf); S.appendChild(igw); track('idea-guarda-' + o.k);
    var tip = el('div', 'ivtip', '▶ ' + LXT('Tocca il video per farlo partire')); S.appendChild(tip); setTimeout(function () { tip.classList.add('off'); }, 3500);
  } else if (u) { var m = mediaRaw({ u: u, n: LXT(it.t), id: 'iv' + IV.i }, true); S.appendChild(m); track('idea-guarda-' + o.k); }
  else { var ph = el('div', 'ivph'); ph.appendChild(el('span', null, it.e)); S.appendChild(ph); }
  $('ivN').textContent = '📍 ' + (cityGet() || '');
  $('ivT').textContent = LXT(it.t); $('ivD').textContent = typeof it.d === 'string' ? LXT(it.d) : LXT(it.d.f) + ' ' + it.d.c;
  var bk = $('ivBk'); bk.href = it.l; withIco(bk, it.b === 'Biglietti' ? 'ticket' : it.b === 'Prenota' ? 'cal' : 'pin', LXT(it.b) + ' ↗'); bk.onclick = function () { track('idea-link-' + o.k); };
  $('ivC').textContent = (IV.i + 1) + ' / ' + n;
}
function ideaViewClose() { var V = $('ideaV'); if (!V) return; V.classList.remove('open'); $('ivS').textContent = ''; try { storiesRender(); } catch (e) {} }
// «Fatelo insieme»: proporlo alla propria persona (diventa un piano da decidere), scegliere già il giorno, o mandare il video nel cerchio
function ideaWhat(o) {
  var it = o.it, id = ('pi-' + o.k).slice(0, 40), desc = typeof it.d === 'string' ? LXT(it.d) : LXT(it.d.f) + ' ' + it.d.c;
  var mk = function () { var x = findIdea(id); if (x) { if (!x.v[me.name]) ideaAct({ t: 'idea', a: 'vote', id: id, on: true }); return findIdea(id); } var v = {}; v[me.name] = 1; ideaAct({ t: 'idea', a: 'add', i: { id: id, r: '', k: /^(bobbob|oxo|stafford-caines|romantico|brunch)/.test(o.k) ? 'cibo' : 'esperienza', p: clean(LXT(it.t), 60), o: clean(desc, 200), ts: Date.now(), v: v, q: '', u: it.l } }); return findIdea(id); };
  sheet('💞 ' + LXT('Cosa volete fare?'), LXT(it.t), [
    { ic: 'heart', t: LXT('Proponilo alla tua persona'), f: function () { mk(); track('idea-proponi-' + o.k); $('mh').textContent = LXT('Piano proposto: gli altri lo trovano in «Decidete insieme».'); ideaViewClose(); try { $('inspM').classList.remove('open'); } catch (e) {} } },
    { ic: 'cal', t: LXT('Scegliete il giorno'), f: function () { var x = mk(); track('idea-giorno-' + o.k); ideaViewClose(); try { $('inspM').classList.remove('open'); } catch (e) {} if (x) { showPane('ideas'); pickDay(x); } } },
    { ic: 'plus', t: LXT('Manda il video nel cerchio'), f: function () { postAll(o.st.u, LXT(it.t)); track('idea-manda-' + o.k); } }
  ]);
}
/* ---- 📍 le idee come «storie» in cima al feed: sempre a portata di dito, prima quelle con il video ufficiale del locale ---- */
var PK_SHORT = { 'stafford-bar': 'American Bar', 'stafford-tea': 'Afternoon tea', 'stafford-caines': 'Michael Caines', 'stafford-terrace': 'Terrazza', winterwonderland: 'Winter Wonderland', skate: 'Pattinaggio', kew: 'Kew', candlelight: 'Candlelight', o2: 'O2', stadio: 'Tottenham', everyman: 'Cinema', bobbob: 'Bob Bob Ricard', oxo: 'OXO Tower', skygarden: 'Sky Garden', borough: 'Borough', primrose: 'Primrose Hill', concerti: 'Concerti', partita: 'Partita', esperienze: 'Esperienze' };
var PKV = {}, pkvBusy = 0;
function packList() {
  var c = cityGet(), loc = c && !isLon(c) ? packFor(c) : [], slug = (c || '').toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 16);
  var L = loc.map(function (it) { return { it: it, k: it.s + '-' + slug }; }).concat(packLon().map(function (it) { return { it: it, k: it.s }; }));
  L.forEach(function (o) { o.st = { u: o.it.v || (PKV[o.it.q] ? 'https://www.youtube.com/shorts/' + PKV[o.it.q] : o.it.l) }; });
  return L.filter(function (o) { return o.it.v; }).concat(L.filter(function (o) { return !o.it.v; }));
}
function packPrefetch() {
  if (pkvBusy || !srvOn()) return; pkvBusy = 1; var c = cityGet(), loc = c && !isLon(c) ? packFor(c) : [];
  var got = function (qs) { return function (x) { if (x && x.items) x.items.forEach(function (v, i) { if (v && v.id) PKV[qs[i]] = v.id; }); try { storiesRender(); } catch (e) {} }; };
  var q1 = packLon().map(function (x) { return x.q; }); mbCall({ a: 'pack', qs: packLon().map(packQ), lang: 'en', reg: 'GB' }).then(got(q1), function () {});
  if (loc.length) { var q2 = loc.map(function (x) { return x.q; }); mbCall({ a: 'pack', qs: loc.map(packQ), lang: window.LX_LANG || 'it', reg: cityRegion(c) }).then(got(q2), function () {}); }
}
function storiesEl() {
  var L = packList(); if (!L.length || !me || !me.name) return null;
  var seen = {}; try { seen = JSON.parse(localStorage.getItem(LSG + 'ivseen') || '{}'); } catch (e) {}
  var row = el('div', 'stor'); row.id = 'stor'; row.setAttribute('aria-label', LXT('Idee per uscire'));
  L.forEach(function (o, i) {
    var b = el('button', 'sto' + (seen[o.k] ? ' seen' : '')); b.type = 'button'; b.setAttribute('aria-label', LXT(o.it.t));
    var ring = el('span', 'stor-r'), face = el('span', 'stor-f'), yid = /youtube\.com\/shorts\/([\w-]+)/.exec(o.st.u);
    if (yid) { var im = document.createElement('img'); im.src = 'https://i.ytimg.com/vi/' + yid[1] + '/default.jpg'; im.alt = ''; im.loading = 'lazy'; face.appendChild(im); } else face.textContent = o.it.e;
    ring.appendChild(face); b.appendChild(ring); b.appendChild(el('span', 'stor-n', LXT(PK_SHORT[o.it.s] || o.it.t)));
    if (o.it.v) b.appendChild(el('span', 'stor-v', '▶'));
    b.onclick = function () { track('storia-' + o.k); IV.list = packList(); ideaView(i); };
    row.appendChild(b);
  });
  return row;
}
function storiesRender() { var W = $('storW'); if (!W) return; var n = storiesEl(), sl = $('stor') ? $('stor').scrollLeft : 0; W.textContent = ''; if (n) { W.appendChild(n); n.scrollLeft = sl; } }
function packAuto() {
  if (navigator.webdriver || !srvOn() || document.querySelector('.mod.open') || !me || !me.name) return false;
  var seen = 1; try { seen = localStorage.getItem(LSG + 'packSeen'); } catch (e) {} if (seen) return false;
  lsSet(LSG + 'packSeen', '1');
  track('idee-auto'); inspOpen(); return true;
}
function lazyMedia(r) {
  var ph = el('div', 'mph'); ph._r = r;
  if (!('IntersectionObserver' in window)) { mediaIn(ph); ph._on = true; return ph; }
  if (!feedNear) {
    feedNear = new IntersectionObserver(function (es) { es.forEach(function (e) { var p = e.target; if (e.isIntersecting && !p._on) { p._on = true; p.textContent = ''; mediaIn(p); } }); }, { root: $('feed'), rootMargin: '150% 0px' });
    feedFar = new IntersectionObserver(function (es) { es.forEach(function (e) { var p = e.target; if (!e.isIntersecting && p._on && p.isConnected) { p._on = false; p.textContent = ''; } }); }, { root: $('feed'), rootMargin: '500% 0px' });
  }
  setTimeout(function () { feedNear.observe(ph); feedFar.observe(ph); }, 0);
  return ph;
}
/* ==== src/app/06-gesti.js ==== */
/* ---- gesti, come nelle app social ----
   ← → cambia pagina · doppio tocco = ❤️ · tieni premuto un Reel = menu · tira giù il feed = aggiorna
   nel lettore: ← → Reel dopo / prima, ↓ chiude. (Sopra il video i tocchi vanno al video stesso.) */
var TABS = ['main', 'xpl', 'ideas', 'chat'];
function curPane() { var p = document.querySelector('.pane.show'); return p ? p.id : ''; }
function gestOk(t) { return !document.querySelector('.mod.open,#dw.open') && !(t && t.closest && t.closest('input,textarea,select,.fview,.retr,#decC')); }
// ☰ menu laterale: le cose che si usano ogni tanto. Quelle di tutti i giorni restano nelle schede in basso.
function dwNews() {
  var n = { keep: 0, pin: 0, dec: 0 };
  try { n.keep = Object.keys(keeps).length; } catch (e) {}
  try { n.pin = msgs.filter(function (m) { return m.pin; }).length; } catch (e) {}
  try { n.dec = toDecide().length; } catch (e) {}
  return n;
}
function dwDot() { var d = $('hdDot'); if (d) d.hidden = !dwNews().dec; }
function dwGo(pane, card, f) {
  dwClose(); showPane(pane);
  if (card) setTimeout(function () { var c = $(card); if (!c) return; accOpen(c, true); c.scrollIntoView({ block: 'start', behavior: 'smooth' }); c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); }, 80);
  if (f) setTimeout(f, 120);
}
function dwOpen() {
  if (!me || !me.name) return; // prima di entrare in un cerchio il menu non ha ancora niente da mostrare
  var P = $('dwP'); P.textContent = ''; var n = dwNews();
  var mb = el('button', 'me'); mb.type = 'button'; mb.appendChild(avatar(me.name)); var tx = el('div'); tx.appendChild(el('b', null, me.name)); tx.appendChild(el('small', null, 'Il tuo profilo ›')); mb.appendChild(tx);
  mb.onclick = function () { dwGo('prof'); }; P.appendChild(mb);
  var rf = el('button', 'dwref'); rf.type = 'button'; rf.appendChild(el('b', null, '💌 Consiglia Reelta')); rf.appendChild(el('small', null, 'Mandala a chi vuoi: arriva con il link giusto'));
  rf.onclick = function () { dwClose(); $('refGo').click(); }; P.appendChild(rf);
  var pp = el('button', 'it'); pp.type = 'button'; pp.appendChild(el('span', null, '👥')); pp.appendChild(document.createTextNode('Persone e inviti')); pp.onclick = function () { dwGo('circle'); }; var sp = el('div', 'sec'); sp.appendChild(pp); P.appendChild(sp);
  function sec(t, rows) {
    var s = el('div', 'sec'); s.appendChild(el('h4', null, t));
    rows.forEach(function (r) { var b = el('button', 'it'); b.type = 'button'; b.appendChild(el('span', null, r[0])); b.appendChild(document.createTextNode(r[1])); if (r[3]) { var e = el('em', r[4] ? 'hot' : null, String(r[3])); b.appendChild(e); } b.onclick = r[2]; s.appendChild(b); });
    P.appendChild(s);
  }
  if (srvOn()) { var isp = el('button', 'it'); isp.type = 'button'; isp.appendChild(el('span', null, '✨')); isp.appendChild(document.createTextNode('Idee per uscire e video più visti')); isp.onclick = function () { dwClose(); inspOpen(); }; var si = el('div', 'sec'); si.appendChild(isp); P.appendChild(si); }
  if (typeof dropOk === 'function' && dropOk()) { var db2 = el('button', 'it'); db2.type = 'button'; db2.appendChild(el('span', null, '📲')); db2.appendChild(document.createTextNode('Condividi da Instagram → Reelta')); db2.onclick = function () { dwClose(); dropOpen(); }; var sd = el('div', 'sec'); sd.appendChild(db2); P.appendChild(sd); }
  if (typeof inBrowser !== 'undefined' && inBrowser && !window.__inst) { var ib2 = el('button', 'it'); ib2.type = 'button'; ib2.appendChild(el('span', null, '📲')); ib2.appendChild(document.createTextNode('Installa Reelta sulla Home')); ib2.onclick = function () { dwClose(); instGo(); }; var sx = el('div', 'sec'); sx.appendChild(ib2); P.appendChild(sx); }
  sec('I tuoi contenuti', [
    ['⭐', 'Reel tenuti', function () { dwGo('main', null, function () { fview = 'keep'; render(); }); }, n.keep],
    ['📌', 'Messaggi fissati', function () { dwGo('chat', null, pinOpen); }, n.pin],
    ['💘', 'Piani da decidere', function () { dwGo('ideas', null, n.dec ? decOpen : null); }, n.dec, 1]
  ]);
  sec('Impostazioni', [
    ['🔔', 'Notifiche', function () { dwGo('style', 'ntC'); }],
    ['🎨', 'Aspetto e colori', function () { dwGo('style', 'apC'); }],
    ['🌍', 'Lingua', function () { dwGo('prof', 'lgC'); }],
    ['🔒', 'Privacy e PIN', function () { dwGo('style', 'rsC'); }],
  ].concat(isDuo() && trPartner() ? [['🤝', 'Trasparenza di coppia', function () { dwGo('style', 'trC'); }]] : []).concat([
    ['💾', 'Copia di sicurezza', function () { dwGo('style', 'bkC'); }],
    ['⚙️', 'Tutte le impostazioni', function () { dwGo('style'); }]
  ]));
  sec('Reelta', [
    ['▶', 'Guarda come funziona', function () { dwClose(); demoOpen(); }],
    ['❓', 'Come si usa', function () { dwClose(); $('help').click(); }],
    ['🛠️', 'Segnala un problema', function () { dwClose(); $('bug').click(); }]
  ]);
  P.appendChild(el('div', 'ft', 'Reelta ' + APP_VER + ' · privata e cifrata'));
  P.appendChild(el('div', 'ft', '© 2026 Reelta. Tutti i diritti riservati.'));
  var D = $('dw'); D.classList.add('open'); D.setAttribute('aria-hidden', 'false'); $('hdSet').setAttribute('aria-expanded', 'true');
  setTimeout(function () { var f = P.querySelector('button'); if (f) f.focus({ preventScroll: true }); }, 60);
}
function dwClose() {
  var D = $('dw'); if (!D.classList.contains('open')) return;
  D.classList.remove('open'); D.setAttribute('aria-hidden', 'true'); $('hdSet').setAttribute('aria-expanded', 'false'); try { if (D.contains(document.activeElement)) $('hdSet').focus({ preventScroll: true }); } catch (e) {}
}
function heartAt(item) { var h = el('div', 'bigheart', '❤️'); item.appendChild(h); setTimeout(function () { h.remove(); }, 900); try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} }
function rxPress(b, r) {
  var t = null, long = false;
  function start() { long = false; clearTimeout(t); t = setTimeout(function () { long = true; try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} rxPick(b, r); }, 420); }
  function stop() { clearTimeout(t); }
  b.addEventListener('touchstart', start, { passive: true }); b.addEventListener('mousedown', start);
  ['touchend', 'touchmove', 'touchcancel', 'mouseup', 'mouseleave'].forEach(function (ev) { b.addEventListener(ev, stop, { passive: true }); });
  b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  b.onclick = function (e) { if (long) { long = false; e.preventDefault(); return; } var m = (r.x || {})[me.name]; react(r.id, m || '❤️'); if (!m) { var it = b.closest('.item'); if (it) heartAt(it); } rxHint(); };
}
function rxPick(b, r) {
  var old = document.querySelector('.rxpick'); if (old) old.remove();
  var p = el('div', 'rxpick'); p.setAttribute('role', 'menu');
  EMO.forEach(function (e) { var x = el('button', ((r.x || {})[me.name] === e ? 'mine' : ''), e); x.type = 'button'; x.setAttribute('aria-label', 'Reagisci ' + e); x.onclick = function (ev) { ev.stopPropagation(); react(r.id, e); p.remove(); }; p.appendChild(x); });
  document.body.appendChild(p);
  var q = b.getBoundingClientRect(); p.style.left = Math.max(8, Math.min(innerWidth - p.offsetWidth - 8, q.left)) + 'px'; p.style.top = Math.max(8, q.top - p.offsetHeight - 10) + 'px';
  setTimeout(function () { document.addEventListener('click', function off(e) { if (!p.contains(e.target)) { p.remove(); document.removeEventListener('click', off, true); } }, true); }, 50);
}
function rxHint() { if (get('rxtip', 0)) return; put('rxtip', 1); $('mh').textContent = 'Tieni premuto il cuore per 😂 😮 🔥'; }
function reelMenu(r) {
  var opts = [
    { t: keeps[r.id] ? '⭐ Non tenere più' : '⭐ Tieni questo Reel', f: function () { keepToggle(r.id); } },
    { t: '✨ Trasforma in piano', f: function () { openIdea(r.id); } },
    { t: '📝 Di cosa parla?', f: function () { sumOpen(r); } },
    { t: '🔗 Apri l’originale', f: function () { window.open(r.u, '_blank', 'noopener'); } }
  ];
  if (r.n !== me.name) opts.push({ t: '⋯ Altre azioni', f: function () { moreFor('reel', r); } });
  if (r.n === me.name || me.role === 'host') opts.push({ t: '🗑 Elimina per tutti', f: function () { delReel(r.id); } });
  if (r.n !== me.name) opts.push({ t: '🙈 Togli solo dal mio telefono', f: function () { hideReel(r.id); } });
  sheet(r.c ? '“' + r.c.slice(0, 40) + '”' : 'Reel di ' + r.n, '', opts);
}
(function () {
  var x0 = 0, y0 = 0, t0 = 0, tg = null, lp = null, moved = false, lastTap = { t: 0, x: 0, y: 0 }, pull = 0;
  var ptr = el('div', null, '↓ Tira per aggiornare'); ptr.id = 'ptr';
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { tg = null; return; }
    tg = e.target; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now(); moved = false; pull = 0;
    clearTimeout(lp);
    var item = tg.closest && tg.closest('#feed .item');
    if (item && gestOk(tg) && !tg.closest('button,a')) lp = setTimeout(function () { if (moved) return; var r = find(item.dataset.id); if (r) { try { navigator.vibrate && navigator.vibrate(15); } catch (x) {} reelMenu(r); tg = null; } }, 550);
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    if (!tg) return; var dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) { moved = true; clearTimeout(lp); }
    var bm = tg.closest && tg.closest('#clog .msg');
    if (bm && dx > 0 && dx > Math.abs(dy) * 1.5) { bm.classList.add('swp'); bm.style.transform = 'translateX(' + Math.min(70, dx * 0.6) + 'px)'; }
    var fd = $('feed');
    if (curPane() === 'main' && fd.scrollTop <= 0 && dy > 0 && dy > Math.abs(dx) * 1.5 && gestOk(tg) && fd.contains(tg)) {
      pull = dy; if (!ptr.parentNode) $('main').appendChild(ptr);
      ptr.textContent = dy > 90 ? '↻ Lascia per aggiornare' : '↓ Tira per aggiornare'; ptr.style.transform = 'translate(-50%,' + Math.min(40, dy / 3 - 20) + 'px)';
    }
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    clearTimeout(lp); if (!tg) return; var t = tg; tg = null;
    var c = e.changedTouches[0], dx = c.clientX - x0, dy = c.clientY - y0, dt = Date.now() - t0;
    if (pull) { var go = pull > 90; pull = 0; if (go) { ptr.textContent = '↻ Aggiorno…'; if (srvOn()) mbPull(true); try { if (me && me.role !== 'host' && !(hostConn && hostConn.open)) again(); } catch (x) {} render(); setTimeout(function () { ptr.style.transform = ''; ptr.textContent = '✓ Aggiornato'; setTimeout(function () { ptr.remove(); }, 400); }, 900); } else { ptr.style.transform = ''; setTimeout(function () { ptr.remove(); }, 200); } return; }
    var bm = t.closest && t.closest('#clog .msg');
    if (bm) { bm.classList.remove('swp'); bm.style.transform = ''; if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 20) { if (dx > 55) startReply(bm.dataset.id); return; } }
    var horiz = Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8 && dt < 700;
    if ($('dw').classList.contains('open')) { if (horiz && dx < 0) dwClose(); return; }
    if (horiz && dx > 0 && x0 < 28 && curPane() !== 'pl' && curPane() !== 'setup' && !document.querySelector('.mod.open')) { dwOpen(); return; }
    if (!gestOk(t)) return;
    var pane = curPane();
    // scorrimento orizzontale
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8 && dt < 700) {
      if (pane === 'pl') { var b = dx < 0 ? $('pn') : $('pp'); if (b && !b.hidden && !b.disabled) b.click(); return; }
      var i = TABS.indexOf(pane); if (i < 0) return;
      var j = i + (dx < 0 ? 1 : -1); if (j < 0) { dwOpen(); return; } if ( j >= TABS.length) return;
      var tb = document.querySelector('.tabs button[data-p="' + TABS[j] + '"]'); if (!tb) return; tb.click();
      var np = $(TABS[j]); np.classList.remove('swl', 'swr'); void np.offsetWidth; np.classList.add(dx < 0 ? 'swl' : 'swr'); setTimeout(function () { np.classList.remove('swl', 'swr'); }, 250);
      return;
    }
    // doppio tocco su un Reel = ❤️ (come Instagram: mette il cuore, non lo toglie)
    if (!moved && dt < 300) {
      var item = t.closest && t.closest('#feed .item');
      if (item && !t.closest('button,a')) {
        if (Date.now() - lastTap.t < 320 && Math.abs(c.clientX - lastTap.x) < 40 && Math.abs(c.clientY - lastTap.y) < 40) {
          lastTap.t = 0; var r = find(item.dataset.id); if (r && (r.x || {})[me.name] !== '❤️') react(r.id, '❤️'); heartAt(item); return;
        }
        lastTap = { t: Date.now(), x: c.clientX, y: c.clientY };
      }
    }
  }, { passive: true });
})();
function build(r) {
  var d = el('div', 'item'), nd = { el: d, open: false }; d.dataset.id = r.id;
  var f = el('div', 'from'); f.appendChild(avatar(r.n)); f.appendChild(el('span', null, r.n)); var tm = el('time', null, ago(r.ts)); f.appendChild(tm); nd.sb = el('button', 'sumb'); nd.sb.hidden = true; nd.sb.onclick = function () { sumOpen(r); }; f.appendChild(nd.sb);
  nd.kb = el('button', 'keepb'); nd.kb.onclick = function () { keepToggle(r.id); }; f.appendChild(nd.kb); d.appendChild(f);
  if (r.c) d.appendChild(el('div', 'cm', r.c));
  d.appendChild(lazyMedia(r));
  nd.ac = el('div', 'aic'); nd.ac.hidden = true; d.appendChild(nd.ac);
  nd.bar = el('div', 'bar'); d.appendChild(nd.bar);
  nd.cp = el('div', 'cpanel'); nd.cp.hidden = true; nd.list = el('div', 'cl'); nd.cp.appendChild(nd.list);
  var row = el('div', 'r'), inp = el('input'), go = el('button', 'btn-o', 'Invia');
  inp.placeholder = 'Rispondi…'; inp.maxLength = 300; inp.setAttribute('aria-label', 'Commento');
  go.onclick = function () { var v = clean(inp.value, 300); if (v) { comment(r.id, v); inp.value = ''; } };
  inp.onkeydown = function (e) { if (e.key === 'Enter') go.click(); };
  inp.onfocus = function () { setTimeout(function () { nd.list.scrollTop = nd.list.scrollHeight; row.scrollIntoView({ block: 'nearest' }); }, 350); };
  row.appendChild(inp); row.appendChild(go); nd.cp.appendChild(row); d.appendChild(nd.cp);
  nodes[r.id] = nd; refresh(r); return d;
}
// ✨ la scheda automatica: appena l'AI ha letto il video, sotto compare cosa è, dove, quanto costa e il tasto per andarci
var AIC_IC = { cibo: 'pin', esperienza: 'ticket', viaggio: 'pin', compra: 'share', ricetta: 'spark' };
function aiCard(r, nd) {
  var x = r.aiX, c = nd.ac; if (!c) return;
  if (!x || !x.p || x.k === 'altro' || x.ask) { c.hidden = true; return; }
  if (c.dataset.k === x.k + x.p) { c.hidden = false; return; } c.dataset.k = x.k + x.p; c.textContent = ''; c.hidden = false;
  var L = linksFor0({ k: x.k, p: x.p, q: x.shop || '' }), pick = L[0];
  if (x.k === 'compra') pick = L[2] || L[0]; if (x.k === 'viaggio') pick = L.filter(function (l) { return /Hotel/.test(l.t); })[0] || L[0]; if (x.k === 'esperienza') pick = L.filter(function (l) { return /Attivit/.test(l.t); })[0] || L[0];
  var lab = { cibo: 'Prenota', esperienza: 'Prenota', viaggio: 'Hotel', compra: 'Dove comprarlo', ricetta: 'Ricetta' }[x.k] || 'Mappa';
  var info = el('button', 'aici'); info.type = 'button'; info.appendChild(icoEl(AIC_IC[x.k] || 'pin'));
  var tx = el('span', 'aict'); tx.appendChild(el('b', null, x.p)); if (x.o) tx.appendChild(el('span', null, x.o)); info.appendChild(tx);
  info.setAttribute('aria-label', LXT('Fatene un piano') + ': ' + x.p); info.onclick = function () { track('scheda-apri-' + x.k); openIdea(r.id, { auto: true }); };
  c.appendChild(info);
  if (pick) { var a = document.createElement('a'); a.className = 'aicb'; a.href = pick.u; a.target = '_blank'; a.rel = 'noopener'; a.textContent = LXT(lab) + ' ↗'; a.onclick = function () { track('scheda-link-' + x.k); }; c.appendChild(a); }
}
function sumLabel(r) {
  var has = !!(r.s || r.g), asks = Object.keys(r.q || {}).length;
  if (r.n === me.name) return has ? ['📝 Riassunto', ''] : asks ? ['📝 ' + asks + (asks === 1 ? ' chiede' : ' chiedono'), 'ask'] : null;
  return has ? ['📝 Riassunto', ''] : r.q && r.q[me.name] ? ['📝 Chiesto', ''] : ['📝 Di cosa parla?', ''];
}
function refresh(r) {
  var nd = nodes[r.id]; if (!nd) return; try { aiCard(r, nd); } catch (e) {}
  if (nd.sb) { var sl = sumLabel(r); if (sl && sl[1] !== 'ask') sl = null; nd.sb.hidden = !sl; if (sl) { nd.sb.textContent = sl[0]; nd.sb.className = 'sumb' + (sl[1] ? ' ' + sl[1] : ''); } }
  if (nd.kb) { var kp = !!keeps[r.id]; nd.kb.hidden = !kp; nd.kb.textContent = kp ? '⭐' : '☆'; nd.kb.className = 'keepb' + (kp ? ' on' : ''); nd.kb.setAttribute('aria-label', kp ? 'Tenuto: tocca per non tenerlo più' : 'Tieni questo Reel'); nd.kb.title = kp ? 'Tenuto' : 'Tieni'; }
  nd.bar.textContent = '';
  // reazioni in un solo tasto: un tocco = ❤️, tenuto premuto = 😂 😮 🔥
  var xs = r.x || {}, tot = Object.keys(xs).length, mineE = xs[me.name];
  var kinds = EMO.filter(function (e) { return Object.keys(xs).some(function (k) { return xs[k] === e; }); });
  var hb = el('button', 'r-btn rx' + (mineE ? ' mine' : ''), (kinds.length ? kinds.slice(0, 3).join('') : '🤍') + (tot ? ' ' + tot : ''));
  hb.setAttribute('aria-label', (mineE ? 'Hai reagito ' + mineE : 'Metti ❤️') + '. Tieni premuto per altre reazioni');
  rxPress(hb, r); nd.bar.appendChild(hb);
  var cb = el('button', 'r-btn', '💬 ' + (r.k || []).length); cb.setAttribute('aria-label', 'Risposte');
  cb.onclick = function () { nd.open = !nd.open; nd.cp.hidden = !nd.open; if (nd.open) { nd.list.scrollTop = nd.list.scrollHeight; nd.cp.scrollIntoView({ block: 'nearest' }); } }; nd.bar.appendChild(cb);
  var kp0 = !!keeps[r.id], sb0 = el('button', 'r-btn' + (kp0 ? ' mine' : ''), kp0 ? '⭐' : '☆'); sb0.setAttribute('aria-label', kp0 ? 'Tenuto: tocca per non tenerlo più' : 'Tieni questo Reel'); sb0.setAttribute('aria-pressed', String(kp0)); sb0.onclick = function () { keepToggle(r.id); }; nd.bar.appendChild(sb0);
  var mb = el('button', 'r-btn', '⋯'); mb.setAttribute('aria-label', 'Altro: di cosa parla, tieni, elimina…'); mb.onclick = function () { reelMenu(r); }; nd.bar.appendChild(mb);
  var has = ideas.some(function (i) { return i.r === r.id; });
  var tip = !has && !get('ptip', 0) && !document.querySelector('.r-btn.plan.tip');
  var ib = el('button', 'r-btn plan' + (tip ? ' tip' : ''), has ? '✓ Piano' : '✨ Piano'); if (tip) setTimeout(function () { put('ptip', 1); }, 6000); ib.setAttribute('aria-label', has ? 'Piano salvato' : 'Trasforma in piano'); ib.onclick = function () { openIdea(r.id); }; nd.bar.appendChild(ib);
  nd.list.textContent = '';
  (r.k || []).forEach(function (c) { var l = el('div', 'cmt'); l.appendChild(el('b', null, c.n)); l.appendChild(document.createTextNode(' ' + c.t)); nd.list.appendChild(l); });
  if (nd.open) nd.list.scrollTop = nd.list.scrollHeight; // l'ultimo messaggio resta in vista
  if (seq && seq.cur === r.id) pbuild(r);
  if (party && party.id === r.id) { pbuild(r); lines(r); }
}
var compOpen = false;
function syncComp() { $('mbox').hidden = feed.length > 0 && !compOpen; }
// il campo per il link compare solo quando serve (il telefono non lascia leggere il link) e sparisce appena hai finito
$('ru').addEventListener('blur', function () { setTimeout(function () { if (!$('ru').value.trim() && document.activeElement !== $('ru')) { compOpen = false; syncComp(); } }, 400); });
// ⭐ tenuti: scelta personale, solo su questo telefono. Si conserva il link del Reel, non il video.
var keeps = get('keep', {}), rhid = get('rhid', []), fview = 'all';
var RCATS = { viaggio: '✈️ Viaggi', cibo: '🍝 Cibo', compra: '🛍️ Da comprare', esperienza: '🎟️ Da fare', ricetta: '👨‍🍳 Ricette' };
function rcat(r) { var k = r && r.aiX && r.aiX.k; if (!RCATS[k]) { try { k = r && r.c ? guessKind(r.c) : ''; } catch (e) { k = ''; } } return RCATS[k] ? k : ''; } // categoria del Reel: quella dell'AI, altrimenti dal commento
function keepToggle(id) {
  if (keeps[id]) delete keeps[id]; else { keeps[id] = Date.now(); $('mh').textContent = '⭐ Tenuto: lo ritrovi in “⭐ Tenuti”.'; }
  put('keep', keeps); var r = find(id); if (r) refresh(r); if (fview === 'keep' || Object.keys(keeps).length <= 1) render();
}
function rkeepDays() { return +get('rkeep', 0) || 0; }
// pulizia scelta dall'utente: i Reel non tenuti più vecchi di N giorni spariscono da questo telefono
function cleanReels() {
  var d = rkeepDays(); if (!d || !feed.length) return;
  var lim = Date.now() - d * 864e5, out = feed.filter(function (r) { return !keeps[r.id] && r.ts < lim && (!seq || seq.cur !== r.id); });
  if (!out.length) return;
  out.forEach(function (r) { rhid.push(r.id); }); if (rhid.length > 2000) rhid = rhid.slice(-2000); put('rhid', rhid);
  var ids = {}; out.forEach(function (r) { ids[r.id] = 1; }); feed = feed.filter(function (r) { return !ids[r.id]; }); put('feed', feed); render();
}
function cleanWarn() {
  var d = rkeepDays(); if (!d || Date.now() - (+get('cwarn', 0)) < 20 * 36e5) return;
  var lo = Date.now() - d * 864e5, hi = lo + 864e5, n = feed.filter(function (r) { return !keeps[r.id] && r.ts >= lo && r.ts < hi; }).length;
  if (!n || document.querySelector('.mod.open')) return; put('cwarn', Date.now());
  ask('🧹 Domani si puliscono ' + (n === 1 ? '1 Reel' : n + ' Reel'), 'Sono quelli senza ⭐. Se ne vuoi conservare qualcuno, tocca ☆ accanto al nome.', 'Vedi i Reel').then(function (y) { if (y) { fview = 'all'; showPane('main'); render(); } });
}
function render() {
  var bad = feed.filter(function (r) { return isInvite(r.u); });
  if (bad.length) { bad.forEach(function (r) { if (gone.indexOf(r.id) < 0) gone.push(r.id); }); feed = feed.filter(function (r) { return !isInvite(r.u); }); put('feed', feed); put('gone', gone); }
  syncComp();
  var box = $('feed'); box.textContent = ''; nodes = {}; try { storiesRender(); } catch (e) {}
  var nk = feed.filter(function (r) { return keeps[r.id]; }).length;
  // filtri: ⭐ tenuti e le categorie che l'AI ha riconosciuto (viaggi, cibo…), solo quelle presenti
  var vis0 = feed.filter(function (r) { return !isMuted(r.n); }), cc = {}; vis0.forEach(function (r) { var c = rcat(r); if (c) cc[c] = (cc[c] || 0) + 1; });
  var cats = Object.keys(RCATS).filter(function (c) { return cc[c]; }), showCats = vis0.length >= 3 && cats.length >= 2;
  if (fview.indexOf('c:') === 0 && !cc[fview.slice(2)]) fview = 'all';
  if (feed.length && (nk || fview === 'keep' || showCats)) {
    var fv = el('div', 'fview'), F = [['all', 'Tutti']]; if (nk || fview === 'keep') F.push(['keep', '⭐ Tenuti (' + nk + ')']);
    if (showCats) cats.forEach(function (c) { F.push(['c:' + c, RCATS[c] + ' ' + cc[c]]); });
    F.forEach(function (x) { var b = el('button', 'chip', x[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(fview === x[0])); b.onclick = function () { fview = x[0]; if (x[0] !== 'all') track('filtro-' + x[0].replace('c:', '')); render(); }; fv.appendChild(b); });
    box.appendChild(fv);
  }
  if (fview.indexOf('c:') === 0) { var cf = fview.slice(2); vis0.filter(function (r) { return rcat(r) === cf; }).forEach(function (r) { box.appendChild(build(r)); }); box.scrollTop = box.scrollHeight; return; }
  if (fview === 'keep') { var kl = feed.filter(function (r) { return keeps[r.id] && !isMuted(r.n); }); if (!kl.length) box.appendChild(el('div', 'empty', 'Nessun Reel tenuto.\n\nTocca ☆ accanto al nome su un Reel che vuoi conservare: resta qui anche quando gli altri si puliscono.')); kl.forEach(function (r) { box.appendChild(build(r)); }); return; }
  if (!feed.length) { box.appendChild(emptyFeed()); return; }
  feed.forEach(function (r) { if (!isMuted(r.n)) box.appendChild(build(r)); });
  box.scrollTop = box.scrollHeight;
}
// feed vuoto: non un muro di testo ma il prossimo passo, con i bottoni. Da soli si può già cominciare: chi entra dopo trova tutto.
function emptyFeed() {
  var solo = me && me.role === 'host' && !Object.keys(allowed).length, who = '';
  try { who = me.role === 'host' ? Object.keys(allowed).map(function (k) { return allowed[k]; })[0] || '' : (names || []).filter(function (n) { return n !== me.name; })[0] || ''; } catch (e) {}
  var d = el('div', 'empty e2');
  d.appendChild(el('div', 'ei', solo ? '🎬' : '💌'));
  d.appendChild(el('b', null, solo ? 'Manca solo la tua persona' : 'Manda il primo Reel'));
  d.appendChild(el('p', null, solo ? 'Reelta è fatta per due (o pochi): mandale il link su WhatsApp, entra in 10 secondi. Intanto puoi già mettere qui dei Reel: li trova appena entra.' : who ? 'Copia il link di un Reel da Instagram, TikTok o YouTube: ' + who + ' lo vede qui.' : 'Copia il link di un Reel da Instagram, TikTok o YouTube e incollalo qui.'));
  if (solo) { var bi = el('button', 'btn go', '💌 Invita la tua persona'); bi.type = 'button'; bi.onclick = function () { track('invita-da-vuoto'); invite(); }; d.appendChild(bi); }
  var b1 = el('button', solo ? 'btn-o wide' : 'btn go', '📋 Incolla un Reel');
  if (srvOn()) { var bx = el('button', 'btn-o wide', '✨ Non hai Reel? Guarda le idee per uscire'); bx.type = 'button'; bx.style.marginTop = '8px'; bx.onclick = function () { track('insp-da-vuoto'); inspOpen(); }; setTimeout(function () { if (b1.parentNode) b1.parentNode.insertBefore(bx, b1.nextSibling); }, 0); } b1.type = 'button'; b1.onclick = function () { if (typeof dropOk === 'function' && dropOk() && !get('dropOn', 0)) dropOpen(); else $('paste').click(); }; d.appendChild(b1);
  if (solo) b1.style.marginTop = '8px';
  var b3 = el('button', 'lnk', '▶ Guarda come funziona · 30 secondi'); b3.type = 'button'; b3.onclick = function () { demoOpen(); }; d.appendChild(b3);
  return d;
}
function atEnd() { var b = $('feed'); return b.scrollHeight - b.scrollTop - b.clientHeight < 80; }
function addReel(r, mine) {
  if (!r || typeof r.id !== 'string' || r.id.length > 40) return false;
  if (gone.indexOf(r.id) >= 0) return false;
  if (rhid.indexOf(r.id) >= 0 && !keeps[r.id]) return false;
  if (isInvite(r.u)) return false;
  var u = safeUrl(r.u); if (!u) return false;
  var old = find(r.id);
  if (old) {
    var x = cleanX(r.x); Object.keys(x).forEach(function (n) { if (!(n in (old.x = old.x || {}))) old.x[n] = x[n]; });
    cleanK(r.k).forEach(function (c) { old.k = old.k || []; if (!old.k.some(function (y) { return y.id === c.id; })) old.k.push(c); });
    var sq = cleanQ(r.q); Object.keys(sq).forEach(function (n) { (old.q = old.q || {})[n] = 1; });
    if (!old.s && !old.g && (r.s || r.g)) { old.s = clean(r.s, 200); old.g = SUMTAG.indexOf(r.g) >= 0 ? r.g : ''; }
    put('feed', feed); refresh(old); return false;
  }
  var n = { id: r.id, u: u, c: clean(r.c, 300), n: clean(r.n, 30) || 'Ospite', ts: +r.ts || Date.now(), x: cleanX(r.x), k: cleanK(r.k), q: cleanQ(r.q), s: clean(r.s, 200), g: SUMTAG.indexOf(r.g) >= 0 ? r.g : '' };
  feed.push(n);
  if (seq && !mine) seq.q.push(n.id);
  if (typeof aiPre === 'function') aiPre(n);
  if (feed.length > 200) { var g = feed.shift(); delete nodes[g.id]; }
  put('feed', feed); syncComp();
  var box = $('feed'); if (box.querySelector('.empty')) box.textContent = '';
  if (isMuted(n.n)) { seqLabel(); return true; }
  var node = build(n); box.appendChild(node);
  if (mine) node.scrollIntoView({ behavior: 'smooth' });
  else { if (Date.now() - n.ts < 3 * 864e5) actLog('reel', n.n, n.c, n.id); noteIn('reel', n.n, n.c); if (node.offsetTop > box.scrollTop + box.clientHeight * 0.6) { unseen++; $('nw').textContent = unseen + (unseen === 1 ? ' Reel nuovo' : ' Reel nuovi') + ' ↓'; $('nw').hidden = false; } }
  seqLabel();
  return true;
}
function sendEv(m) {
  if (me.role === 'host') cast(m);
  else if (hostConn && hostConn.open) { hostConn.send(m); if (srvOn() && MBT[m.t] !== undefined) mbToHost(m, null, true); }
  else if (srvOn() && MBT[m.t] !== undefined) mbToHost(m, function () { outbox.push(m); put('outbox', outbox); });
  else { outbox.push(m); put('outbox', outbox); }
}
function react(id, e) {
  var r = find(id); if (!r) return; r.x = r.x || {};
  var cur = r.x[me.name] === e ? '' : e;
  if (cur) r.x[me.name] = cur; else delete r.x[me.name];
  put('feed', feed); refresh(r); sendEv({ t: 'react', id: id, e: cur, n: me.name }); try { renderSteps(); } catch (x) {}
}
function comment(id, text) {
  var r = find(id); if (!r) return;
  var c = { id: uid(6), n: me.name, t: text, ts: Date.now() };
  r.k = r.k || []; r.k.push(c); if (r.k.length > 50) r.k.shift();
  put('feed', feed); refresh(r); sendEv({ t: 'cmt', id: id, c: c });
}
// chi manda un Reel sa che è piaciuto: un avviso discreto e una voce nelle novità
var RXV = { '❤️': 'ha messo ❤️ al tuo Reel', '😂': 'ha riso 😂 al tuo Reel', '😮': 'è rimasto a bocca aperta 😮 col tuo Reel', '🔥': 'ha messo 🔥 al tuo Reel' };
function rxGot(n, e, r) {
  actLog('rx', n, r.c, r.id, e);
  var L = get('rxNew', []); L = L.filter(function (x) { return !(x.id === r.id && x.n === n); }); L.push({ id: r.id, n: n, e: e, ts: Date.now() }); put('rxNew', L.slice(-20));
  showNote({ kind: 'rx', who: n, text: r.c ? '“' + r.c.slice(0, 40) + '”' : '', e: e, rid: r.id }, Object.assign({}, ntCfg(), { pill: true, sound: false }), false);
  try { renderNov(); } catch (x) {}
}
function applyEv(d, who) {
  var r = find(d.id); if (!r) return null;
  if (d.t === 'react') {
    var n = who || clean(d.n, 30); if (!n) return null; r.x = r.x || {};
    if (d.e === '') delete r.x[n]; else if (EMO.indexOf(d.e) >= 0) r.x[n] = d.e; else return null;
    if (party && party.id === r.id && d.e) floatE(d.e);
    if (d.e && r.n === me.name && n !== me.name) rxGot(n, d.e, r);
    if (d.e === '❤️' && n !== me.name && r.x[me.name] === '❤️' && Date.now() - r.ts < 7 * 864e5 && ritMatch(r)) setTimeout(function () { ritMatchIn(r); }, 400);
    put('feed', feed); refresh(r); return { t: 'react', id: r.id, e: d.e, n: n };
  }
  if (d.t === 'sumq') {
    var aq = who || clean(d.n, 30); if (!aq || aq === r.n || r.s || r.g) return null;
    r.q = r.q || {}; if (r.q[aq]) return null; r.q[aq] = 1; put('feed', feed); refresh(r);
    if (r.n === me.name) actLog('sumq', aq, r.c, r.id);
    if (r.n === me.name) showNote({ kind: 'sumq', who: aq, text: 'Rispondi in una riga', n: 1 }, Object.assign({}, ntCfg(), { pill: true }), true);
    return { t: 'sumq', id: r.id, n: aq };
  }
  if (d.t === 'sum') {
    var as = who || clean(d.n, 30); if (as !== r.n) return null;
    var sx = clean(d.s, 200), sg = SUMTAG.indexOf(d.g) >= 0 ? d.g : ''; if (!sx && !sg) return null;
    r.s = sx; r.g = sg; put('feed', feed); refresh(r); sumRefresh(r);
    if (r.q && r.q[me.name]) showNote({ kind: 'sum', who: r.n, text: (sg ? sg + ' · ' : '') + sx, n: 1 }, Object.assign({}, ntCfg(), { pill: true }), true);
    return { t: 'sum', id: r.id, s: sx, g: sg, n: as };
  }
  if (d.t === 'cmt' && d.c && typeof d.c.id === 'string') {
    var c = cleanK([{ id: d.c.id, n: who || d.c.n, t: d.c.t, ts: d.c.ts }])[0]; if (!c) return null;
    r.k = r.k || []; if (r.k.some(function (y) { return y.id === c.id; })) return null;
    r.k.push(c); if (r.k.length > 50) r.k.shift();
    if (Date.now() - (+c.ts || Date.now()) < 3 * 864e5) actLog('cmt', c.n, c.t, r.id);
    put('feed', feed); refresh(r); return { t: 'cmt', id: r.id, c: c };
  }
  return null;
}
$('nw').addEventListener('click', function () { var b = $('feed'); b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' }); unseen = 0; $('nw').hidden = true; });
$('feed').addEventListener('scroll', function () { if (unseen && atEnd()) { unseen = 0; $('nw').hidden = true; } var sc = this.scrollTop > 40, M = $('main'); if (M.classList.contains('scr') !== sc) M.classList.toggle('scr', sc); }, { passive: true });
/* ==== src/app/07-sequenza-insieme.js ==== */
/* ---- sequenza: i Reel di ogni piattaforma, uno dopo l'altro ---- */
var seq = null, seen = get('seen', {}), timer = null;
function newCount() { return feed.filter(function (r) { return !seen[r.id] && !isMuted(r.n) && r.n !== me.name; }).length; } // i Reel che mandi tu non sono «nuovi» per te
function seqLabel() {
  appBadge(); bellUI();
  var n = newCount(), b = $('sq'); b.hidden = !feed.length; $('sp').hidden = !feed.length || !$('app').classList.contains('on');
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

/* ==== src/app/08-stato-server.js ==== */
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
  $('bd').textContent = live ? 'Collegato' : !others.length ? (me.role === 'host' ? '＋ Invita qualcuno' : 'Solo tu, per ora') : others.length === 1 ? others[0].slice(0, 12) + ' offline 🔔' : 'Gli altri sono offline 🔔';
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
/* ==== src/app/09-sicurezza-ospite-schede.js ==== */
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
          if (k) { if (!known) track('ospite-accettato'); allowed[k] = nm; put('allowed', allowed); }
          if (prevN && prevN !== nm) { renameIn(prevN, nm); Object.keys(aka).forEach(function (o) { if (aka[o] === prevN) aka[o] = nm; }); aka[prevN] = nm; put('aka', aka); cast({ t: 'ren', a: prevN, b: nm }); }
          if (code && srvOn()) mbBox(me.hostId + '_' + code, 'w').then(function (b) { return mbCall({ a: 'ack', box: b, upto: 9e15 }); }).catch(function () {}); // il pacchetto di benvenuto non serve più
          c.ok = true; c.name = nm; c.k = k; if (!c.virt) conns.push(c); if (!known && srvOn()) pushSync(); ntQuietUntil = Date.now() + 3000; trillOut(c);
          c.send({ t: 'hello', ck: circleKey(), all: roster(), ttl: ttlMs(), max: cap() + 1, gone: gone.slice(-200), msgs: msgs.slice(-200), feed: feed.slice(-100), ideas: ideas.slice(-100), people: people(), pics: pics, aka: aka }); cast({ t: 'people', people: people() }); status();
          actLog('join', nm, '', ''); $('mh').textContent = nm + ' è entrato nel cerchio ✓'; setTimeout(function () { if ($('mh').textContent.indexOf(nm) === 0) $('mh').textContent = ''; }, 6000);
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
  if (!window.Peer) { $('mh').textContent = 'Connessione assente o lenta: riprova tra poco.'; return; }
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
/* ==== src/app/10-foto-video.js ==== */
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
function renderChat(keep) {
  pruneMsgs(); ttlNote(); var b = $('clog'), st = b.scrollTop, atBottom = b.scrollHeight - b.scrollTop - b.clientHeight < 60; b.textContent = '';
  if (!msgs.length) { b.appendChild(el('div', 'empty', 'Nessun messaggio ancora.\n\nScrivetevi qui: lo legge solo chi è nel cerchio.')); return; }
  msgs.forEach(function (m) { if (!isMuted(m.n)) b.appendChild(msgNode(m)); }); b.scrollTop = keep && !atBottom ? st : b.scrollHeight;
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

/* ==== src/app/11-idee-ai-pareri.js ==== */
/* ---- idee: dal Reel alla realtà ---- */
// Codici affiliato: lasciali vuoti finché Booking (via CJ) e GetYourGuide non ti approvano.
var PARTNER = { booking: '', gyg: '', amazon: '' }; // codici partner (affiliazione): vuoti finché non ci si iscrive
// Link per i contributi volontari (es. Stripe Payment Link o Ko-fi). Vuoto = la scheda non compare.
var SUPPORT_URL = '';
// Statistiche anonime (GoatCounter). Esempio: 'https://loopix.goatcounter.com/count'. Vuoto = spente.
var STATS_URL = 'https://loopix.goatcounter.com/count';
function track(ev) {
  try {
    if (!STATS_URL || get('riserv', 0)) return;
    var send = function () { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'evento/' + ev, title: ev, event: true }); };
    if (window.goatcounter && window.goatcounter.count) send(); else (track.q = track.q || []).push(send);
  } catch (e) {}
}
function startStats() {
  if (get('riserv', 0)) return;
  if (!/^https:\/\/[\w-]+\.goatcounter\.com\/count$/.test(STATS_URL)) { STATS_URL = ''; return; }
  var sc = document.createElement('script'); sc.async = true; sc.src = 'https://gc.zgo.at/count.js'; sc.setAttribute('data-goatcounter', STATS_URL);
  sc.onload = function () { (track.q || []).forEach(function (f) { try { f(); } catch (e) {} }); track.q = []; };
  document.head.appendChild(sc);
  $('statP').hidden = false;
  var inst = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  track(inst ? 'apertura-app-installata' : 'apertura-nel-browser');
}
/* ---- pareri delle prime coppie: i conti restano sul telefono, partono solo se l'utente tocca Invia ---- */
// Server per le risposte (Supabase, tabella "feedback"). Vuoti = si inviano con WhatsApp o mail.
var FEEDBACK = { url: 'https://rvtxhsasngpqtojntpcn.supabase.co', anon: 'sb_publishable_gJzeHncdMVaGN2wvUAoTBA_TtnFhpC2', mail: '' };
function tst() { var t = get('tst', null); if (!t || typeof t !== 'object' || !t.s) { t = { s: Date.now(), w: {}, done: {}, snooze: 0 }; put('tst', t); } return t; }
function tweek(t) { return Math.max(1, Math.min(12, Math.floor((Date.now() - t.s) / 6048e5) + 1)); }
function tcount(k) {
  try { if (!me) return; var t = tst(), w = tweek(t), x = t.w[w] = t.w[w] || { r: 0, p: 0, d: [] }; if (k) x[k] = (x[k] || 0) + 1;
    var d = new Date().getDay(); if (x.d.indexOf(d) < 0) x.d.push(d); put('tst', t); } catch (e) {}
}
var SVQ = {
  s1: [
    { id: 'confuso', q: 'Cosa vi ha confuso o fatto fermare?', txt: 1 },
    { id: 'altrove', q: 'Vi mandate ancora i Reel su altre app?', o: ['Quasi mai', 'A volte', 'Spesso'] },
    { id: 'manca', q: 'Cosa vi manca di più? (facoltativo)', txt: 1 }
  ],
  s4: [
    { id: 'sparisse', q: 'Se domani Reelta sparisse, quanto vi dispiacerebbe?', o: ['Molto', 'Un po’', 'Per niente'] },
    { id: 'consiglio', q: 'La consigliereste a qualcuno?', o: ['Sì', 'Forse', 'No'] },
    { id: 'ogni-giorno', q: 'Cosa dovrebbe fare in più perché la usiate ogni giorno?', txt: 1 }
  ]
};
var svCur = '', svAns = {}, svStep = 0;
function svDue() {
  var t = tst(), days = (Date.now() - t.s) / 864e5;
  if (Date.now() < (t.snooze || 0)) return '';
  if (days >= 28 && !t.done.s4) return 's4';
  if (days >= 7 && !t.done.s1 && days < 28) return 's1';
  return '';
}
function svyCheck() {
  var b = $('svy'); if (!b) return; var due = me && me.joined !== false ? svDue() : '';
  b.hidden = !due; if (!due) return; b.textContent = '';
  b.appendChild(el('b', null, due === 's4' ? 'Un mese con Reelta: com’è andata?' : 'Ci aiutate a migliorare Reelta?'));
  b.appendChild(el('span', null, '3 domande, 30 secondi. Vedete tutto prima di inviare.'));
  var r = el('div', 'r'), y = el('button', 'btn', 'Rispondi'), n = el('button', 'btn-o', 'Non ora');
  y.onclick = function () { svOpen(due); }; n.onclick = function () { var t = tst(); t.snooze = Date.now() + 2 * 864e5; put('tst', t); b.hidden = true; };
  r.appendChild(y); r.appendChild(n); b.appendChild(r);
}
function svOpen(which) {
  var t = tst(); svCur = which || ((Date.now() - t.s) / 864e5 >= 28 ? 's4' : 's1'); svAns = {}; svStep = 0;
  var box = $('svQ'); box.textContent = ''; $('svP').hidden = true; box.hidden = false; $('svH').textContent = ''; $('svOk').textContent = 'Avanti';
  $('svT').textContent = svCur === 's4' ? 'Un mese con Reelta' : 'La prima settimana';
  SVQ[svCur].forEach(function (q) {
    box.appendChild(el('div', 'svq', q.q));
    if (q.o) { var o = el('div', 'svo'); q.o.forEach(function (v) { var b = el('button', null, v); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.onclick = function () { svAns[q.id] = v; o.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; o.appendChild(b); }); box.appendChild(o); }
    else { var ta = el('textarea'); ta.maxLength = 300; ta.dataset.q = q.id; ta.setAttribute('aria-label', q.q); box.appendChild(ta); }
  });
  $('svM').classList.add('open');
}
function svCode() {
  var src = (me && me.hostId) || 'x';
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode('reelta-prova:' + src)).then(function (b) {
    var A = 'ABCDEFGHJKMNPQRSTVWXYZ23456789', u = new Uint8Array(b), c = 'C-'; for (var i = 0; i < 4; i++) c += A.charAt(u[i] % A.length); return c;
  }).catch(function () { return 'C-????'; });
}
function svData(code) {
  var t = tst(), weeks = [];
  for (var w = 1; w <= tweek(t); w++) { var x = t.w[w] || { r: 0, p: 0, d: [] }; weeks.push({ sett: w, reel: x.r || 0, piani: x.p || 0, giorni: (x.d || []).length }); }
  var rb = ''; try { rb = localStorage.getItem(LSG + 'refBy') || ''; } catch (e) {}
  return { consigliato_da: rb, coppia: code, ruolo: me.role === 'host' ? 'creatore' : 'ospite', persone: Math.max(1, (me.role === 'host' ? people() : names).length), giorni: Math.floor((Date.now() - t.s) / 864e5), settimane: weeks, risposte: svAns, questionario: svCur, versione: APP_VER, lingua: (window.LX_LANG || 'it') };
}
function svText(d) {
  var L = ['Reelta · parere ' + (d.questionario === 's4' ? 'dopo un mese' : 'dopo una settimana'), 'Coppia: ' + d.coppia + ' · ' + d.ruolo + ' · ' + d.persone + ' persone · giorno ' + d.giorni];
  if (d.consigliato_da) L.push('Consigliata da: ' + d.consigliato_da);
  d.settimane.forEach(function (w) { L.push('Sett. ' + w.sett + ': ' + w.reel + ' Reel, ' + w.piani + ' piani, ' + w.giorni + (w.giorni === 1 ? ' giorno' : ' giorni') + ' aperta'); });
  SVQ[d.questionario].forEach(function (q) { L.push(q.q + ' → ' + (d.risposte[q.id] || '—')); });
  return L.join('\n');
}
var svPayload = null;
function svNext() {
  if (svStep === 0) {
    $('svQ').querySelectorAll('textarea').forEach(function (ta) { var v = clean(ta.value, 300); if (v) svAns[ta.dataset.q] = v; });
    if (!Object.keys(svAns).length) { $('svH').textContent = 'Rispondi almeno a una domanda.'; return; }
    svCode().then(function (code) {
      svPayload = svData(code); $('svTx').textContent = svText(svPayload);
      $('svQ').hidden = true; $('svP').hidden = false; $('svH').textContent = '';
      $('svOk').textContent = FEEDBACK.url && FEEDBACK.anon ? 'Invia a Reelta' : 'Invia';
      svStep = 1;
    });
    return;
  }
  var done = function (ok) {
    if (!ok) return;
    var t = tst(); t.done[svCur] = Date.now(); put('tst', t); $('svM').classList.remove('open'); svyCheck();
    if (tab === 'main') $('mh').textContent = 'Grazie! Il vostro parere è arrivato.';
  };
  if (FEEDBACK.url && FEEDBACK.anon) {
    $('svOk').disabled = true;
    fetch(FEEDBACK.url + '/rest/v1/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: FEEDBACK.anon, Prefer: 'return=minimal' },
      body: JSON.stringify({ survey: svCur, code: svPayload.coppia, data: svPayload }) })
      .then(function (r) { if (!r.ok) throw 0; done(true); })
      .catch(function () { $('svH').textContent = 'Non è partito: controlla la connessione e riprova.'; })
      .then(function () { $('svOk').disabled = false; });
    return;
  }
  var txt = svText(svPayload);
  if (navigator.share) navigator.share({ text: txt }).then(function () { done(true); }).catch(function () {});
  else { window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener'); done(true); }
}
/* ---- di cosa parla: chi guarda chiede, chi l'ha mandato risponde in una riga ---- */
var sumCur = null;
function sumOpen(r) { sumCur = r; sumRender(); $('sumH').textContent = ''; $('sumM').classList.add('open'); }
function sumRefresh(r) { if (sumCur && sumCur.id === r.id && $('sumM').classList.contains('open')) sumRender(); if (seq && seq.cur === r.id) { var pl2 = sumLabel(r); $('psum').hidden = !pl2; } }
// ✨ cosa c'è nel video + dove comprarlo / prenotarlo. Gemini non inventa prodotti né prezzi precisi: i tasti aprono la ricerca vera nei negozi.
function aiBox(r) {
  var box = el('div', 'aibox');
  var ab = el('button', 'aibtn', '✨ Cosa c’è nel video? Dove si trova?'); ab.type = 'button'; ab.style.whiteSpace = 'normal'; ab.style.fontSize = '17px';
  var out = el('div', 'aiout'); out.hidden = true;
  function show(x) {
    if (!r.aiX) { r.aiX = x; put('feed', feed); } ab.hidden = true; out.hidden = false; out.textContent = '';
    out.appendChild(el('p', 'sumtx', clean(x.sum, 200) || '—'));
    if (x.o) out.appendChild(el('p', 'refn', clean(x.o, 200)));
    if (x.ask && x.opts && x.opts.length) {
      out.appendChild(el('p', null, clean(x.ask, 60)));
      var q = el('div', 'ailinks'); x.opts.forEach(function (o) { var c = el('button', 'chip', clean(o, 30)); c.type = 'button'; c.onclick = function () { run(clean(o, 30)); }; q.appendChild(c); }); out.appendChild(q);
    }
    var sure = x.p && x.k && x.k !== 'altro', anyP = false;
    if (sure) {
      out.appendChild(el('div', 'sumtag', ({ compra: '🛍️ ', viaggio: '✈️ ', cibo: '🍝 ', esperienza: '🎟️ ', ricetta: '👨‍🍳 ' }[x.k] || '') + clean(x.p, 60)));
      var lk = el('div', 'ailinks');
      linksFor({ k: x.k, p: clean(x.p, 60), q: clean(x.shop || '', 60) }).forEach(function (L) { if (L.p) anyP = true; var a = el('a', 'chip', L.t); a.href = L.u; a.target = '_blank'; a.rel = 'noopener noreferrer' + (L.p ? ' sponsored' : ''); a.onclick = function () { track('ai-link-' + x.k); }; lk.appendChild(a); });
      out.appendChild(lk);
      var pb = el('button', 'btn-o wide', '💘 Fanne un piano: decidete insieme'); pb.type = 'button'; pb.onclick = function () { $('sumM').classList.remove('open'); openIdea(r.id); }; out.appendChild(pb);
    }
    out.appendChild(el('p', 'refn', 'Lo scrive l’AI di Google guardando il video pubblico, il titolo e la copertina: niente dei vostri nomi né messaggi.' + (anyP ? ' Alcuni link ci aiutano a tenere Reelta gratis: il prezzo per te non cambia.' : '')));
  }
  function run(focus, img) {
    ab.hidden = false; out.hidden = true; ab.disabled = true; ab.textContent = focus || img ? '✨ Cerco ' + (focus || 'nello screenshot') + '…' : '✨ Guardo il video…'; track('ai-video');
    aiAsk(r, '', [], focus, img).then(show, function (e) { ab.disabled = false; ab.textContent = e && e.message === 'limite' ? 'Per oggi l’AI ha finito i suggerimenti: domani si ricarica.' : r.n === me.name ? 'Non ci sono riuscito: riprova tra poco.' : 'Non ci sono riuscito: chiedilo a ' + r.n + ' qui sotto.'; });
  }
  ab.onclick = function () { run(''); };
  box.appendChild(ab); box.appendChild(out); box.appendChild(aiFocusRow(function (t, img) { run(t, img); }));
  if (r.aiX) show(r.aiX);
  return box;
}
function sumRender() {
  var r = sumCur, b = $('sumB'); b.textContent = ''; if (!r) return;
  var has = !!(r.s || r.g), mine = r.n === me.name, asks = Object.keys(r.q || {});
  if (has && !mine) {
    $('sumH').textContent = '';
    if (r.g) b.appendChild(el('div', 'sumtag', r.g));
    if (r.s) b.appendChild(el('p', 'sumtx', r.s));
    b.appendChild(el('p', 'refn', 'Scritto da ' + r.n + '.'));
    return;
  }
  if (!mine) {
    if (r.q && r.q[me.name]) { b.appendChild(el('p', null, 'Hai già chiesto a ' + r.n + '. Appena risponde lo vedi qui, e ti arriva un avviso.')); return; }
    if (srvOn()) {
      b.appendChild(aiBox(r));
    }
    b.appendChild(el('p', null, 'Chiedi a ' + r.n + ' di raccontartelo in una riga. Così decidi tu se guardarlo tutto.'));
    var go = el('button', 'btn', '📝 Chiedi a ' + r.n); go.onclick = function () { sumAsk(r); }; b.appendChild(go); return;
  }
  if (srvOn()) b.appendChild(aiBox(r));
  b.appendChild(el('p', null, asks.length ? asks.join(', ') + (asks.length === 1 ? ' vuole' : ' vogliono') + ' sapere di cosa parla. Basta un tocco, la riga è facoltativa.' : 'Scrivi in breve di cosa parla: chi non ha tempo di guardarlo tutto lo legge qui.'));
  var pick = r.g || '', o = el('div', 'svo');
  SUMTAG.forEach(function (t) { var x = el('button', null, t); x.type = 'button'; x.setAttribute('aria-pressed', String(t === pick)); x.onclick = function () { pick = pick === t ? '' : t; o.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', String(y.textContent === pick)); }); }; o.appendChild(x); });
  b.appendChild(o);
  var ta = el('textarea'); ta.maxLength = 200; ta.placeholder = 'Es. guarda il finale 😂'; ta.value = r.s || ''; ta.setAttribute('aria-label', 'Di cosa parla'); b.appendChild(ta);
  var ok = el('button', 'btn', has ? 'Aggiorna' : 'Invia'); ok.onclick = function () {
    var sx = clean(ta.value, 200); if (!sx && !pick) { $('sumH').textContent = 'Scegli un motivo o scrivi una riga.'; return; }
    r.s = sx; r.g = pick; put('feed', feed); refresh(r); sendEv({ t: 'sum', id: r.id, s: sx, g: pick, n: me.name });
    $('sumM').classList.remove('open'); sumRefresh(r);
  }; b.appendChild(ok);
}
function sumAsk(r) {
  r.q = r.q || {}; r.q[me.name] = 1; put('feed', feed); refresh(r); sendEv({ t: 'sumq', id: r.id, n: me.name });
  sumRender(); $('sumH').textContent = 'Fatto: ' + r.n + ' riceve la richiesta.'; sumRefresh(r);
}
/* ---- intelligenza artificiale su richiesta: il server legge titolo e descrizione pubblici del video ---- */
var aiLast = null, KAI = { viaggio: 'il viaggio', compra: 'cosa comprare', cibo: 'cosa mangiare', esperienza: 'cosa fare', ricetta: 'la ricetta', altro: 'un’altra idea' };
function aiAsk(r, want, avoid, focus, img) {
  if (!want && !(avoid && avoid.length) && !focus && !img && r.aiX) return Promise.resolve(r.aiX);
  var q = { a: 'ai', u: r.u, c: r.c || '', lang: window.LX_LANG || 'it', reg: ((navigator.language || '').split('-')[1] || '').slice(0, 2), want: want || '', avoid: avoid || [], focus: focus || '' }; if (img) q.img = img;
  return mbCall(q).then(function (x) { if (!x || x.error) throw new Error(x && x.error); return x; });
}
// uno screenshot del momento giusto: rimpicciolito sul telefono (max 1024 px) e mandato solo all'AI per questa ricerca
function shrinkShot(file) {
  return new Promise(function (ok, ko) {
    if (!file || !/^image\//.test(file.type)) return ko(new Error('tipo'));
    var u = URL.createObjectURL(file), im = new Image();
    im.onload = function () { try { var k = Math.min(1, 1024 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', 0.82).split(',')[1]); } catch (e) { ko(e); } };
    im.onerror = function () { URL.revokeObjectURL(u); ko(new Error('img')); }; im.src = u;
  });
}
// «Cosa ti interessa nel video?» + 📸: chi guarda dice all'AI cosa cercare (es. «i pantaloni del ragazzo»)
function aiFocusRow(onGo) {
  var w = el('div', 'aifocus'), row = el('div', 'afr'), inp = document.createElement('input'), fi = document.createElement('input'), shot = '';
  inp.type = 'text'; inp.maxLength = 40; inp.placeholder = (window.LX_T || String)('Cosa ti interessa? Es. i pantaloni'); inp.setAttribute('aria-label', (window.LX_T || String)('Cosa ti interessa nel video?'));
  fi.type = 'file'; fi.accept = 'image/*'; fi.hidden = true;
  var cam = el('button', 'btn-o', '📸 Screenshot'); cam.type = 'button'; cam.setAttribute('aria-label', (window.LX_T || String)('Aggiungi uno screenshot del video'));
  var go = el('button', 'btn-o', '🔍 Cerca'); go.type = 'button';
  var note = el('p', 'refn', 'Fai uno screenshot nel momento giusto del video e aggiungilo con 📸: l’AI guarda solo quello.');
  cam.onclick = function () { fi.click(); };
  fi.onchange = function () { var f = fi.files && fi.files[0]; if (!f) return; note.textContent = '📸 …'; shrinkShot(f).then(function (b) { shot = b; cam.textContent = '📸 ✓ Screenshot'; note.textContent = 'Screenshot pronto: va solo all’AI di Google per questa ricerca, non viene salvato.'; track('ai-screenshot'); }, function () { note.textContent = 'Questo file non è un’immagine.'; }); fi.value = ''; };
  go.onclick = function () { var t = clean(inp.value, 40); if (!t && !shot) { inp.focus(); return; } track('ai-focus'); onGo(t, shot); shot = ''; cam.textContent = '📸 Screenshot'; };
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go.click(); } });
  row.appendChild(inp); row.appendChild(cam); row.appendChild(go); w.appendChild(row); w.appendChild(fi); w.appendChild(note);
  return w;
}
function aiPlan(focus, img) {
  var r = ideaRid && find(ideaRid), b = $('iAi'), lb = b.querySelector('b'), out = $('iAiR'); if (!r) return;
  var cur = $('ik').value, want = !focus && !img && aiLast && cur !== aiLast.k ? cur : '', avoid = focus || img ? [] : (aiLast && aiLast.done) || [];
  b.disabled = true; b.classList.add('busy'); lb.textContent = want ? '✨ Cerco ' + KAI[want] + '…' : '✨ Guardo il video…'; $('iH').textContent = ''; out.hidden = true;
  if (focus || img) lb.textContent = '✨ Cerco ' + (focus || 'nello screenshot') + '…';
  aiAsk(r, want, avoid.slice(-5), focus, img).then(function (x) {
    b.classList.remove('busy'); b.disabled = false;
    var sure = x.k !== 'altro' || (x.p && !/^(sconosciut|unknown|desconocid)/i.test(x.p));
    b.hidden = false;
    if (sure) { setKind(x.k); if (x.p) $('ip').value = x.p; if (x.o) $('io').value = x.o; aiLast = { k: x.k, p: clean(x.p || '', 60), q: clean(x.shop || '', 60), done: avoid.concat(x.p ? [x.p] : []) }; lb.textContent = '✨ Un’altra idea dal video'; b.querySelector('span').textContent = 'Non è questo? L’AI ne propone una diversa'; }
    else { lb.textContent = '✨ Riprova'; $('idm').classList.remove('auto'); $('ikS').hidden = true; }
    out.textContent = (x.sum ? '✨ ' + x.sum : '') + (sure ? '' : ' Scegli tu qui sotto: ci metti un attimo.'); out.hidden = !out.textContent;
    if (sure && x.p && x.k !== 'altro') { var lk = el('div', 'ailinks'); linksFor({ k: x.k, p: clean(x.p, 60), q: aiLast.q }).forEach(function (L) { var a = el('a', 'chip', L.t); a.href = L.u; a.target = '_blank'; a.rel = 'noopener'; lk.appendChild(a); }); out.appendChild(lk); }
    ideaSug();
  }, function (e) { b.hidden = false; $('idm').classList.remove('auto'); $('ikS').hidden = true; b.disabled = false; b.classList.remove('busy'); lb.textContent = '✨ Riconosci dal video'; out.textContent = e && e.message === 'limite' ? 'Per oggi l’AI ha finito i suggerimenti: domani si ricarica. Intanto scegli tu qui sotto.' : 'Non sono riuscito a capirlo dal video: scegli tu qui sotto.'; out.hidden = false; });
}
/* ==== src/app/12-consiglia-weekend.js ==== */
/* ---- consiglia Reelta: l'app a un'altra coppia, che crea il suo cerchio ---- */
// data di arrivo in Reelta: decide quali traguardi valgono per questo telefono (i primi tengono i più facili)
(function () { try { if (!localStorage.getItem(LSG + 'since')) localStorage.setItem(LSG + 'since', String(Date.now())); } catch (e) {} })();
function refCode() {
  try { var c = localStorage.getItem(LSG + 'ref'); if (c && /^R-[A-Z2-9]{6}$/.test(c)) return c;
    var A = 'ABCDEFGHJKMNPQRSTVWXYZ23456789', u = crypto.getRandomValues(new Uint8Array(6)); c = 'R-'; for (var i = 0; i < 6; i++) c += A.charAt(u[i] % A.length);
    localStorage.setItem(LSG + 'ref', c); return c; } catch (e) { return ''; }
}
function recommend() {
  var c = refCode(), url = homeUrl() + (c ? '?r=' + c : '');
  var txt = (window.LX_T || String)('Ti consiglio Reelta: per mandarvi i Reel in due in un posto solo, privato e senza account. Create il vostro cerchio da qui: ') + url;
  track('consiglia');
  if (navigator.share) { navigator.share({ text: txt }).catch(function () {}); return; }
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
}
var KINDS = { viaggio: '✈️ Un posto', compra: '🛍️ Da comprare', cibo: '🍝 Da mangiare', esperienza: '🎟️ Da fare', ricetta: '👨‍🍳 Ricetta', altro: '💡 Idea' };
var KPH = {
  viaggio: ['Dove? (es. Lisbona)', 'Quando? (es. a maggio)'],
  compra: ['Cosa? (es. BMW i7, borsa Zara)', 'Budget o nota (es. max 500 €)'],
  cibo: ['Dove o cosa? (es. Sushi Ko, carbonara)', 'Nota (facoltativa)'],
  esperienza: ['Cosa? (es. concerto, spa, escape room)', 'Quando? (facoltativo)'],
  ricetta: ['Quale piatto? (es. tiramisù)', 'Nota (facoltativa)'],
  altro: ['Cosa? (es. idea regalo)', 'Nota (facoltativa)']
};
var KSUG = { viaggio: 'Sembra un posto: lo mettiamo in ✈️ Un posto?', compra: 'Sembra una cosa da comprare: la mettiamo in 🛍️ Da comprare?', cibo: 'Sembra un posto dove mangiare: lo mettiamo in 🍝 Da mangiare?', esperienza: 'Sembra una cosa da fare: la mettiamo in 🎟️ Da fare?', ricetta: 'Sembra una ricetta: la mettiamo in 👨‍🍳 Ricetta?' };
// riconoscimento leggero, tutto sul telefono: nessun dato esce
var KWORDS = {
  ricetta: 'ricetta|recipe|receta|fatto in casa|fatta in casa|homemade|tiramis|lasagn|biscott|cheesecake|pancake|plumcake|crostata|torta',
  compra: 'bmw|mercedes|audi|porsche|ferrari|lamborghini|tesla|fiat|alfa romeo|maserati|volkswagen|vw|toyota|honda|ford|jeep|land rover|range rover|volvo|kia|hyundai|bentley|rolls|mini cooper|peugeot|renault|citro[eë]n|byd|cupra|seat|skoda|dacia|apple|iphone|ipad|macbook|airpods|samsung|galaxy|xiaomi|sony|playstation|ps5|xbox|nintendo|dyson|ikea|zara|h&m|nike|adidas|puma|new balance|gucci|prada|louis vuitton|chanel|dior|herm[eè]s|rolex|omega|cartier|swatch|ray-?ban|lego|sephora|thermomix|nespresso|de.?longhi|smeg|kitchenaid|uniqlo|gopro|dji|canon|nikon|vespa|ducati|yamaha|kawasaki|harley|moncler|stone island|north face|birkenstock|crocs|converse|vans|armani|versace|fendi|bulgari|pandora|swarovski|tiffany|garmin|bose|jbl|sonos|philips|divano|scarpe|sneakers|borsa|orologio|profumo|giacca|smartphone|macchina|auto|moto|e-?bike|bici|car|shoes|bag|watch|coche|zapatos|bolso',
  cibo: 'ristorante|pizzeria|pizza|sushi|trattoria|osteria|bistrot|brunch|gelat|pasticceria|burger|ramen|restaurant|caf[eéè]|aperitivo|cocktail|steakhouse|kebab|tapas|restaurante|street food',
  esperienza: 'concert|spa|muse|escape|mostra|teatro|cinema|parco|festival|corso|lezione|tour|partita|stadio|show|massaggio|terme|karaoke|bowling|kart|paracadut|immersion|surf|sci|yoga|workshop|crociera',
  viaggio: 'lisbo|porto|madrid|barcel|sivigli|sevill|valencia|parigi|paris|londra|london|londres|roma|rome|milano|milan|napoli|naples|firenze|florence|venezia|venice|torino|bologna|palermo|catania|bari|sicilia|sardegna|puglia|calabria|toscana|amalfi|positano|capri|ischia|cinque terre|dolomiti|como|garda|berlin|amsterdam|praga|prague|vienna|budapest|atene|athens|santorini|mykonos|creta|istanbul|dubai|new york|miami|los angeles|tokyo|kyoto|bali|thailand|bangkok|phuket|maldive|mauritius|zanzibar|marrakech|egitto|sharm|ibiza|mallorca|maiorca|tenerife|canarie|island|norveg|norway|svizzera|switzerland|zermatt|copenaghen|stoccolma|dublin|edimburgo|croazia|dubrovnik|spalato|malta|montenegro|albania|grecia|greece|spagna|spain|portogallo|portugal|francia|france|germania|giappone|japan|messico|mexico|tulum|cancun|caraibi|cuba|brasile|rio|australia|sydney|singapore|hong kong|seoul|corea|vietnam|india|sri lanka|safari|kenya|sudafrica|cape town|spiaggia|beach|playa|isola|isla|montagna|mountain|lago|lake|hotel|resort|weekend'
};
function guessKind(t) {
  t = ' ' + String(t || '').toLowerCase() + ' ';
  var order = ['ricetta', 'compra', 'cibo', 'esperienza', 'viaggio'];
  for (var i = 0; i < order.length; i++) if (new RegExp('[^a-zà-ú](' + KWORDS[order[i]] + ')').test(t)) return order[i];
  return '';
}
function setKind(k) {
  $('ik').value = k;
  if (aiLast && aiLast.k !== k && !$('iAi').classList.contains('busy')) { $('iAi').querySelector('b').textContent = '✨ Cerca ' + KAI[k] + ' nel video'; $('iAi').querySelector('span').textContent = 'L’AI riparte con questo tipo'; }
  else if (aiLast && aiLast.k === k) { $('iAi').querySelector('b').textContent = '✨ Un’altra idea dal video'; $('iAi').querySelector('span').textContent = 'L’AI ne propone una diversa'; }
  $('ikg').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.k === k)); });
  var ks = $('ikS'); ks.textContent = ''; ks.appendChild(document.createTextNode(window.LX_T ? LX_T(KINDS[k]) : KINDS[k])); ks.appendChild(el('small', null, 'Cambia'));
  $('ip').placeholder = KPH[k][0]; $('io').placeholder = KPH[k][1];
  ideaSug();
}
function ideaSug() {
  var g = guessKind($('ip').value), b = $('iSg');
  if (g && g !== $('ik').value && KSUG[g]) { b.textContent = KSUG[g]; b.onclick = function () { setKind(g); $('ip').focus(); }; b.hidden = false; }
  else b.hidden = true;
}
var ideas = get('ideas', []), ifilter = 'tutte', ikind = '', ideaRid = '';
var FEEL = ['❤️', '😊', '😐', 'no'];
function cleanF(f) { var o = {}; if (f && typeof f === 'object') Object.keys(f).slice(0, 8).forEach(function (n) { if (FEEL.indexOf(f[n]) >= 0 && clean(n, 30)) o[clean(n, 30)] = f[n]; }); return o; }
function cleanV(v) { var o = {}; if (v && typeof v === 'object') Object.keys(v).slice(0, 8).forEach(function (n) { if (v[n] && clean(n, 30)) o[clean(n, 30)] = 1; }); return o; }
function normIdea(i, who) {
  if (!i || typeof i.id !== 'string' || i.id.length > 40) return null;
  var p = clean(i.p, 60); if (!p) return null;
  return { id: clean(i.id, 40), r: typeof i.r === 'string' ? clean(i.r, 40) : '', k: KINDS[i.k] ? i.k : 'altro', p: p, o: clean(i.o, 200), n: who || clean(i.n, 30) || 'Ospite', ts: +i.ts || Date.now(), v: cleanV(i.v), f: cleanF(i.f), d: !!i.d, w: /^\d{4}-\d{2}-\d{2}$/.test(i.w || '') ? i.w : '', q: clean(i.q || '', 60), u: /^https:\/\/[^\s<>"]{8,300}$/.test(i.u || '') ? String(i.u) : '', wa: Math.max(0, +i.wa || 0) || undefined, da: Math.max(0, +i.da || 0) || undefined };
}
function findIdea(id) { return ideas.filter(function (x) { return x.id === id; })[0]; }
function ideasChanged(rid) {
  put('ideas', ideas);
  if (tab === 'ideas' && $('ideas').classList.contains('show')) renderIdeas();
  var r = rid && find(rid); if (r) refresh(r);
}
function applyIdea(d, who) {
  if (d.a === 'add') {
    var i = normIdea(d.i, who); if (!i) return null;
    var old = findIdea(i.id);
    if (old) { var was0 = isMatch(old); Object.keys(i.v).forEach(function (n) { old.v[n] = 1; }); if (i.u && !old.u) old.u = i.u; old.f = old.f || {}; Object.keys(i.f || {}).forEach(function (n) { if (!old.f[n]) old.f[n] = i.f[n]; }); if (i.d) old.d = true; if (i.w && !old.w) old.w = i.w; ideasChanged(old.r); if (!was0 && isMatch(old)) matchIn(old); return null; }
    ideas.push(i); if (ideas.length > 200) ideas.shift();
    if (i.n !== me.name && Date.now() - (+i.ts || 0) < 3 * 864e5) actLog('idea', i.n, i.p, i.id);
    if (i.n !== me.name && !(tab === 'ideas' && $('ideas').classList.contains('show'))) { ideaSeen++; ideaTab(); noteIn('idea', i.n, i.p); }
    ideasChanged(i.r); return { t: 'idea', a: 'add', i: i };
  }
  var x = findIdea(d.id); if (!x) return null;
  if (d.a === 'vote') { var n = who || clean(d.n, 30); if (!n) return null; var was = isMatch(x); if (d.on) x.v[n] = 1; else delete x.v[n]; ideasChanged(); if (d.on && n !== me.name) actLog('vote', n, x.p, x.id); if (!was && isMatch(x)) { actLog('match', '', x.p, x.id); matchIn(x); } return { t: 'idea', a: 'vote', id: x.id, on: !!d.on, n: n }; }
  // giorno e «fatto»: vince la modifica più recente, uguale su tutti i telefoni anche se arrivano in ordine diverso (es. due offline)
  var at = Math.min(+d.at || 0, Date.now() + 6e4); if (!at && who === me.name) at = Date.now();
  if (d.a === 'when') { if (at && (+x.wa || 0) > at) return null; who = who || clean(d.n, 30); x.w = /^\d{4}-\d{2}-\d{2}$/.test(d.w || '') ? d.w : ''; if (at) x.wa = at; if (x.w && who && who !== me.name) actLog('when', who, x.p + ' · ' + new Date(x.w + 'T12:00').toLocaleDateString(window.LX_LANG === 'en' ? 'en-GB' : window.LX_LANG === 'es' ? 'es-ES' : 'it-IT', { weekday: 'short', day: 'numeric', month: 'short' }), x.id); ideasChanged(); return { t: 'idea', a: 'when', id: x.id, w: x.w, at: at || undefined, n: who || undefined }; }
  if (d.a === 'done') { if (at && (+x.da || 0) > at) return null; x.d = !!d.on; if (at) x.da = at; ideasChanged(); return { t: 'idea', a: 'done', id: x.id, on: x.d, at: at || undefined }; }
  // «com'è andata?» dopo la data del piano: ognuno risponde con un tocco; «non ci siamo andati» toglie la data, così si può riprogrammare
  if (d.a === 'feel') { var fn = who || clean(d.n, 30), fe = FEEL.indexOf(d.e) >= 0 ? d.e : ''; if (!fn || !fe) return null; x.f = x.f || {}; x.f[fn] = fe; if (fe === 'no') { if (!Object.keys(x.f).some(function (k) { return x.f[k] !== 'no'; })) x.w = ''; } else x.d = true; ideasChanged(); if (fn !== me.name && fe !== 'no') noteIn('idea', fn, x.p + ' ' + fe); return { t: 'idea', a: 'feel', id: x.id, e: fe, n: fn }; }
  if (d.a === 'del') { ideas = ideas.filter(function (y) { return y !== x; }); ideasChanged(x.r); return { t: 'idea', a: 'del', id: x.id }; }
  return null;
}
function ideaAct(m) { var out = applyIdea(m, me.name); if (out) sendEv(out); }
function enc(t) { return encodeURIComponent(t); }
function amzDom() { var g = ((navigator.language || '').split('-')[1] || '').toUpperCase(), l = window.LX_LANG || 'it'; return { GB: 'co.uk', IT: 'it', ES: 'es', DE: 'de', FR: 'fr', US: 'com' }[g] || { it: 'it', es: 'es', en: 'co.uk' }[l] || 'co.uk'; }
function linksFor(i) { var L0 = linksFor0(i); if (i.u) L0.unshift({ t: '📅 ' + LXT('Prenota'), u: i.u }); return L0; }
function linksFor0(i) {
  var G = 'https://www.google.com/search?q=', MAP = 'https://www.google.com/maps/search/?api=1&query=';
  var LW = { it: ['sito ufficiale', 'prezzo'], en: ['official site', 'price'], es: ['sitio oficial', 'precio'] }[window.LX_LANG || 'it'] || ['sito ufficiale', 'prezzo'];
  if (i.k === 'compra') return [{ t: '🌐 Sito ufficiale', u: G + enc(i.p + ' ' + LW[0]) }, { t: '💶 Prezzo', u: G + enc(i.p + ' ' + LW[1]) }, { t: '🛒 Dove comprarlo', u: 'https://www.google.com/search?tbm=shop&q=' + enc(i.p) }, { t: '📦 Amazon', u: 'https://www.amazon.' + amzDom() + '/s?k=' + enc(i.p) + (PARTNER.amazon ? '&tag=' + enc(PARTNER.amazon) : ''), p: !!PARTNER.amazon }, { t: '📍 Vicino a te', u: MAP + enc(i.q || i.p) }];
  if (i.k === 'ricetta') return [{ t: '🔎 La ricetta', u: G + enc('ricetta ' + i.p) }, { t: '▶ Video', u: 'https://www.youtube.com/results?search_query=' + enc('ricetta ' + i.p) }];
  if (i.k === 'cibo' && i.q) return [{ t: '📍 Vicino a te', u: MAP + enc(i.q) }, { t: '📍 Mappa', u: MAP + enc(i.p) }];
  if (i.k === 'altro') return [{ t: '🔎 Cerca', u: G + enc(i.p) }, { t: '📍 Mappa', u: MAP + enc(i.p) }];
  var L = [{ t: '📍 Mappa', u: MAP + enc(i.p) }];
  if (i.k === 'viaggio') L.push({ t: '✈️ Voli', u: 'https://www.google.com/travel/flights?q=' + enc('Flights to ' + i.p) });
  if (i.k === 'viaggio') L.push({ t: '🏨 Hotel', u: 'https://www.booking.com/searchresults.html?ss=' + enc(i.p) + (PARTNER.booking ? '&aid=' + enc(PARTNER.booking) : ''), p: !!PARTNER.booking });
  if (i.k === 'viaggio' || i.k === 'esperienza') L.push({ t: '🎟️ Attività', u: 'https://www.getyourguide.com/s/?q=' + enc(i.p) + (PARTNER.gyg ? '&partner_id=' + enc(PARTNER.gyg) : ''), p: !!PARTNER.gyg });
  if (i.k === 'viaggio') L.push({ t: '🍽️ Ristoranti', u: 'https://www.google.com/maps/search/?api=1&query=' + enc('ristoranti ' + i.p) });
  return L;
}
function renderIdeas() {
  try { dwDot(); } catch (e) {}
  renderNov();
  // due viste sole: i piani da fare (divisi per «a che punto siamo») e quelli fatti
  if (ifilter !== 'fatte') ifilter = 'tutte';
  var nDone = ideas.filter(function (i) { return i.d; }).length, ch = $('ichips'); ch.textContent = '';
  [['tutte', 'Da fare'], ['fatte', '✓ Fatti' + (nDone ? ' · ' + nDone : '')]].forEach(function (f) {
    var b = el('button', 'chip', f[1]); b.setAttribute('aria-pressed', String(ifilter === f[0])); b.onclick = function () { ifilter = f[0]; renderIdeas(); }; ch.appendChild(b);
  });
  ch.hidden = !ideas.length;
  var open0 = ideas.filter(function (i) { return !i.d; }), kc = $('ikf'); if (!kc) { kc = el('div', 'chips'); kc.id = 'ikf'; ch.parentNode.insertBefore(kc, ch.nextSibling); } kc.textContent = '';
  var kinds = Object.keys(KINDS).filter(function (k) { return open0.some(function (i) { return i.k === k; }); });
  if (ifilter === 'fatte' || open0.length < 8 || kinds.length < 2) ikind = '';
  kc.hidden = !(ifilter !== 'fatte' && open0.length >= 8 && kinds.length >= 2);
  if (!kc.hidden) [''].concat(kinds).forEach(function (k) { var b = el('button', 'chip', k ? (window.LX_T ? LX_T(KINDS[k]) : KINDS[k]) : 'Tutti i tipi'); b.setAttribute('aria-pressed', String(ikind === k)); b.onclick = function () { ikind = k; renderIdeas(); }; kc.appendChild(b); });
  var box = $('ilist'); box.textContent = '';
  var todo = toDecide();
  if (todo.length > 1 && ifilter !== 'fatte') { var db0 = el('button', 'aibtn love'); db0.appendChild(el('b', null, '💘 Decidete insieme')); db0.appendChild(el('span', null, todo.length + ' piani aspettano il tuo sì o no')); db0.onclick = decOpen; box.appendChild(db0); }
  var list = ideas.filter(function (i) { return ifilter === 'fatte' ? i.d : !i.d && (!ikind || i.k === ikind); });
  if (!list.length) {
    if (ifilter === 'fatte') box.appendChild(el('div', 'empty', 'Nessun piano fatto ancora.\nQuando lo realizzate, toccate ✓ Fatto.'));
    else box.appendChild(ideaGuide());
    return;
  }
  var sk = get('iskip', {}), today = new Date().toISOString().slice(0, 10), all = circleSize() > 2 ? 'tutti' : 'entrambi';
  // a che punto è un piano: 0 da decidere · 1 da organizzare (lo volete, manca la data) · 2 in programma (c'è la data)
  var stage = function (i) { return i.w ? 2 : isMatch(i) ? 1 : 0; };
  var others = function (i) { var ns = me.role === 'host' ? Object.keys(allowed).map(function (k) { return allowed[k]; }) : (names || []).filter(function (n) { return n !== me.name; }); return ns.filter(function (n) { return !i.v[n]; }); };
  var card = function (i) {
    var c = el('div', 'card idea' + (i.d ? ' done' : '')), stg = stage(i), mine = !!i.v[me.name], voters = Object.keys(i.v);
    if (!i.d && stg >= 1 && isMatch(i)) c.appendChild(el('div', 'match', '💞 Lo volete ' + all));
    c.appendChild(el('div', 'k', (window.LX_T ? LX_T(KINDS[i.k]) : KINDS[i.k]) + ', proposto da ' + i.n));
    c.appendChild(el('h3', null, i.p));
    if (i.o) c.appendChild(el('p', null, i.o));
    if (i.w) c.appendChild(el('div', 'when', '📅 ' + fmtDay(i.w)));
    var fk = Object.keys(i.f || {}).filter(function (n) { return i.f[n] !== 'no'; }); if (fk.length) c.appendChild(el('div', 'when', '💭 ' + fk.map(function (n) { return n + ' ' + i.f[n]; }).join(' · ')));
    // un solo passo avanti, ben visibile: quello che serve adesso
    var go = el('div', 'inext'), btn = function (cls, t, f) { var b = el('button', cls, t); b.type = 'button'; b.onclick = f; go.appendChild(b); return b; };
    if (!i.d && stg === 0 && !mine) {
      if (sk[i.id]) { c.classList.add('passed'); go.appendChild(el('span', 'iwait', 'Hai detto “passo”.')); btn('btn-o', '👍 Ci ripenso', function () { ideaAct({ t: 'idea', a: 'vote', id: i.id, on: true }); }); }
      else { btn('btn go', i.k === 'compra' ? '😍 Mi piace' : '👍 Mi va', function () { ideaAct({ t: 'idea', a: 'vote', id: i.id, on: true }); }); btn('btn-o', 'Passo', function () { var k = get('iskip', {}); k[i.id] = 1; put('iskip', k); renderIdeas(); }); }
    } else if (!i.d && stg === 0) { var ot = others(i); go.appendChild(el('span', 'iwait', circleSize() < 2 ? '👍 A te va. Invita qualcuno per decidere insieme.' : ot.length ? '👍 A te va. ⏳ Manca la risposta di ' + ot.slice(0, 3).join(', ') : '👍 A te va. ⏳ Aspettiamo gli altri')); }
    else if (!i.d && stg === 1) btn('btn go', '📅 Scegliete la data', function () { pickDay(i); });
    else if (!i.d && i.w < today && !(i.f && i.f[me.name])) btn('btn go', '💭 Com’è andata?', function () { fbOpen(i); });
    else if (!i.d) btn('btn go', '🗓️ Metti in calendario', function () { toCal(i); });
    if (go.children.length) c.appendChild(go);
    // sotto: al massimo due link utili (mappa, prezzo…) e ⋯ per tutto il resto
    var acts = el('div', 'acts'), L = linksFor(i); L = L.filter(function (l) { return l.p; }).concat(L.filter(function (l) { return !l.p; }));
    var nv = L.some(function (l) { return l.p; }) ? 3 : 2;
    L.slice(0, nv).forEach(function (l) { var a = el('a', 'r-btn', l.t + (l.p ? ' (partner)' : '')); a.href = l.u; a.target = '_blank'; a.rel = 'noopener noreferrer' + (l.p ? ' sponsored' : ''); acts.appendChild(a); });
    var mb = el('button', 'r-btn', '⋯'); mb.type = 'button'; mb.setAttribute('aria-label', 'Altre azioni per questo piano'); mb.onclick = function () { ideaMenu(i, L.slice(nv)); }; acts.appendChild(mb);
    c.appendChild(acts);
    if (voters.length && !(stg === 0 && voters.length === 1 && mine)) c.appendChild(el('div', 'ptag', (i.k === 'compra' ? '😍 ' : '👍 ') + voters.join(', ')));
    return c;
  };
  if (ifilter === 'fatte') { list.sort(function (a, b) { return (b.w || '') < (a.w || '') ? -1 : (b.w || '') > (a.w || '') ? 1 : b.ts - a.ts; }).forEach(function (i) { box.appendChild(card(i)); }); }
  else {
    var S = [[], [], []]; list.forEach(function (i) { S[stage(i)].push(i); });
    S[0].sort(function (a, b) { return (!!a.v[me.name] || !!sk[a.id]) - (!!b.v[me.name] || !!sk[b.id]) || b.ts - a.ts; }); // prima quelli che aspettano la tua risposta
    S[1].sort(function (a, b) { return b.ts - a.ts; }); S[2].sort(function (a, b) { return a.w < b.w ? -1 : 1; });
    [['Da decidere', 'Dite se vi va: quando piace a ' + all + ', si organizza.'], ['Da organizzare', 'Lo volete ' + all + ': manca solo la data.'], ['In programma', '']].forEach(function (h, n) {
      if (!S[n].length) return;
      var hd = el('div', 'isec'); hd.appendChild(el('b', null, h[0])); hd.appendChild(el('i', null, String(S[n].length))); if (h[1]) hd.appendChild(el('small', null, h[1])); box.appendChild(hd);
      S[n].forEach(function (i) { box.appendChild(card(i)); });
    });
  }
  if (PARTNER.booking || PARTNER.gyg || PARTNER.amazon) box.appendChild(el('p', null, '“partner”: prenotando da quel link Reelta riceve una piccola commissione. Per te il prezzo non cambia.'));
  var dm = el('button', 'demob'); dm.type = 'button'; dm.appendChild(el('span', null, '▶')); var dt = el('div'); dt.appendChild(el('b', null, 'Come nasce un piano da un Reel?')); dt.appendChild(el('small', null, 'Guarda la demo · 30 secondi')); dm.appendChild(dt); dm.onclick = demoOpen; box.appendChild(dm);
}
// ⋯ su un piano: tutto quello che non è il passo successivo
function ideaMenu(i, links) {
  var mine = !!i.v[me.name], o = [];
  (links || []).forEach(function (l) { o.push({ t: l.t + (l.p ? ' (partner)' : ''), f: function () { window.open(l.u, '_blank', 'noopener'); } }); });
  if (i.r && find(i.r)) o.push({ t: '▶ Rivedi il Reel', f: function () { goReel(i.r); } });
  if (!i.d) o.push({ t: i.w ? '📅 Cambia data' : '📅 Scegli una data', f: function () { pickDay(i); } });
  if (!i.d && i.w) o.push({ t: '🗓️ Metti in calendario', f: function () { toCal(i); } });
  if (!i.d) o.push({ t: mine ? '👎 Non mi va più' : '👍 Mi va', f: function () { ideaAct({ t: 'idea', a: 'vote', id: i.id, on: !mine }); } });
  o.push({ t: i.d ? '↺ Rimetti tra quelli da fare' : '✓ Segna come fatto', f: function () { ideaAct({ t: 'idea', a: 'done', id: i.id, on: !i.d }); } });
  o.push({ t: '🗑 Elimina', f: function () { ask('Eliminare questo piano?', 'Sparisce per tutto il cerchio.', 'Elimina', true).then(function (y) { if (y) ideaAct({ t: 'idea', a: 'del', id: i.id }); }); } });
  sheet(i.p, '', o);
}
function circleSize() { return me.role === 'host' ? Object.keys(allowed).length + 1 : Math.max(names.length, circMax ? 2 : 2); }
function isMatch(i) { var n = circleSize(); return n >= 2 && Object.keys(i.v || {}).length >= n; }
function toDecide() { var sk = get('iskip', {}); return ideas.filter(function (i) { return !i.d && !i.v[me.name] && !sk[i.id]; }); }
var decCur = null;
function decOpen() { decMode = ''; $('decT').textContent = LXT('Decidete insieme'); $('decP').textContent = LXT('Ti va? Se piace anche all’altra persona, lo organizzate insieme.'); $('decM').classList.add('open'); decShow(); }
/* ---- 🗓 Il piano del weekend: i Reel della settimana, ognuno dice ❤️ o passo; se piace a tutti è un match ---- */
var decMode = '';
function LXT(x) { return (window.LX_T || String)(x); }
function ritMembers() { if (!me) return []; var L = me.role === 'host' ? [me.name].concat(Object.keys(allowed).map(function (k) { return allowed[k]; })) : (names && names.length ? names.slice() : [me.name]); if (L.indexOf(me.name) < 0) L.push(me.name); return L.filter(function (x, i) { return x && L.indexOf(x) === i; }); }
function ritWeek() { var d = new Date(); d.setHours(0, 0, 0, 0); var back = (d.getDay() + 3) % 7; d.setDate(d.getDate() - back); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); } // settimana che parte dal giovedì
function ritAll() { var wk = Date.now() - 7 * 864e5, used = {}; ideas.forEach(function (i) { if (i.r) used[i.r] = 1; }); return feed.filter(function (r) { return r.ts >= wk && !used[r.id] && !isMuted(r.n); }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, 8); }
function ritQueue() { var sk = get('rskip', {}); return ritAll().filter(function (r) { return !(r.x && r.x[me.name] === '❤️') && !sk[r.id]; }); }
function ritMatch(r) { var M = ritMembers(); return M.length >= 2 && M.every(function (n) { return r.x && r.x[n] === '❤️'; }); }
function ritOn() { var wd = new Date().getDay(); return (wd === 4 || wd === 5 || wd === 6 || wd === 0) && ritMembers().length >= 2 && (!!mixCur() || !!packCur() || (ritAll().length >= 2 && ritQueue().length > 0)); }
// 📍 ogni settimana un'idea per uscire entra nel rituale: stessa idea per tutto il cerchio (scelta dalla settimana), se tutti dicono sì è un match con «Prenota»
function packWeekItem() {
  var c = cityGet(), L = (c && !isLon(c) ? packFor(c) : []).concat(packLon()); if (!L.length) return null;
  var p = ritWeek().split('-'), n = Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / (7 * 864e5));
  if (xmasOn()) { var x = n % PACK_XMAS.length; return PACK_XMAS[x]; }
  return L[((n % L.length) + L.length) % L.length];
}
function packIdeaId(it) { return ('pk-' + ritWeek().replace(/-/g, '') + '-' + it.s).slice(0, 40); }
function packCur() {
  var it = packWeekItem(); if (!it) return null;
  var a = get('pkr', {}); if (a[ritWeek()]) return null;
  var ex = findIdea(packIdeaId(it)); if (ex && ex.v && ex.v[me.name]) return null;
  return it;
}
function packRitCard(c, it) {
  c.appendChild(el('div', 'e', it.e)); c.appendChild(el('p', 'refn', '📍 ' + LXT('Un’idea per uscire')));
  c.appendChild(el('h3', null, LXT(it.t))); c.appendChild(el('p', null, typeof it.d === 'string' ? LXT(it.d) : LXT(it.d.f) + ' ' + it.d.c));
  var ex = findIdea(packIdeaId(it)), oth = ex ? Object.keys(ex.v || {}).filter(function (n) { return n !== me.name; }) : [];
  if (oth.length) c.appendChild(el('p', 'refn', '❤️ ' + oth.join(', ')));
  var a = document.createElement('a'); a.className = 'chip'; a.href = it.l; a.target = '_blank'; a.rel = 'noopener'; a.textContent = (it.b === 'Biglietti' ? '🎟 ' : '📅 ') + LXT(it.b) + ' ↗'; a.onclick = function () { track('idea-link-rito-' + it.s); };
  var lk = el('div', 'ailinks'); lk.appendChild(a); c.appendChild(lk);
}
function ritOpen() { decMode = 'rit'; track('rituale-apri'); $('decT').textContent = '🗓 ' + LXT('Il piano del weekend'); $('decP').textContent = LXT('I Reel di questa settimana: quale fate? Se piace a tutti, è un match.'); $('decM').classList.add('open'); ritShow(); }
/* ---- ✨ un'idea per il weekend: l'AI guarda le etichette dei Reel recenti (mai nomi, link o messaggi) e trova cosa vi piace ---- */
var mixBusy = false;
function mixItems() { var since = Date.now() - 30 * 864e5, used = {}; ideas.forEach(function (i) { if (i.r) used[i.r] = 1; });
  return feed.filter(function (r) { return r.ts >= since && r.aiX && r.aiX.k && r.aiX.k !== 'altro' && !used[r.id]; }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, 12)
    .map(function (r) { return { k: r.aiX.k, p: clean(r.aiX.p || '', 60), s: clean(r.aiX.sum || '', 160), h: Object.keys(r.x || {}).filter(function (n) { return r.x[n] === '❤️'; }).length }; }); }
function mixCur() { var m = get('mix', null); return m && m.wk === ritWeek() && m.s && m.s.p && !m.st ? m : null; }
function mixFetch() {
  if (mixBusy || !me || !srvOn()) return; var m = get('mix', null); if (m && m.wk === ritWeek()) return;
  var it = mixItems(); if (it.length < 3) return; mixBusy = true;
  mbCall({ a: 'mix', items: it, lang: window.LX_LANG || 'it', reg: ((navigator.language || '').split('-')[1] || '').slice(0, 2) }).then(function (x) {
    mixBusy = false; if (!x || x.error) return; put('mix', { wk: ritWeek(), s: x.p && x.k !== 'altro' ? x : null, st: '' }); if (x.p) track('idea-weekend'); try { renderNov(); } catch (e) {}
  }, function () { mixBusy = false; });
}
function mixDone(st) { var m = get('mix', null); if (m) { m.st = st; put('mix', m); } }
function mixCard(c, m) {
  var s = m.s; c.appendChild(el('div', 'e', (KINDS[s.k] || '✨').split(' ')[0]));
  c.appendChild(el('p', 'refn', '✨ ' + LXT('Un’idea di Reelta per voi')));
  c.appendChild(el('h3', null, clean(s.p, 60)));
  if (s.why) c.appendChild(el('p', null, clean(s.why, 160)));
  if (s.o) c.appendChild(el('p', 'refn', clean(s.o, 200)));
  var lk = el('div', 'ailinks'); linksFor({ k: s.k, p: clean(s.p, 60), q: clean(s.shop || '', 60) }).slice(0, 3).forEach(function (L) { var a = el('a', 'chip', L.t); a.href = L.u; a.target = '_blank'; a.rel = 'noopener noreferrer' + (L.p ? ' sponsored' : ''); lk.appendChild(a); }); c.appendChild(lk);
}
function ritShow() {
  var mx = mixCur();
  if (mx) { var c0 = $('decC'); c0.className = ''; c0.textContent = ''; decCur = { mix: true }; $('decB').hidden = false; mixCard(c0, mx); return; }
  var pk = packCur(); if (pk) { var c1 = $('decC'); c1.className = ''; c1.textContent = ''; decCur = { pack: pk }; $('decB').hidden = false; packRitCard(c1, pk); return; }
  var c = $('decC'), q = ritQueue(); c.className = ''; c.textContent = ''; decCur = q[0] || null; $('decB').hidden = !decCur;
  if (!decCur) {
    var ms = ritAll().filter(ritMatch);
    c.appendChild(el('div', 'e', ms.length ? '💞' : '🎉')); c.appendChild(el('h3', null, ms.length ? LXT('I vostri match') : LXT('Fatto!')));
    if (!ms.length) c.appendChild(el('p', null, LXT('Hai votato tutti i Reel. Quando gli altri votano, i match compaiono qui e ti avviso.')));
    ms.forEach(function (r) { var b = el('button', 'btn', '📅 ' + (clean(r.c, 40) || LXT('Reel di ') + r.n)); b.style.marginTop = '10px'; b.onclick = function () { $('decM').classList.remove('open'); openIdea(r.id); }; c.appendChild(b); });
    return;
  }
  var r = decCur; c.appendChild(el('div', 'e', (KINDS[guessKind(r.c)] || '🎬').split(' ')[0]));
  c.appendChild(el('h3', null, clean(r.c, 90) || LXT('Un Reel di ') + r.n));
  var others = ritMembers().filter(function (n) { return n !== me.name && r.x && r.x[n] === '❤️'; });
  c.appendChild(el('p', null, LXT('Mandato da ') + r.n + (others.length ? ' · ❤️ ' + others.join(', ') : '') + (q.length > 1 ? ' · ' + LXT('ne restano ') + q.length : '')));
  var w = el('button', 'btn-o', '▶ ' + LXT('Guardalo')); w.type = 'button'; w.style.marginTop = '8px'; w.onclick = function () { $('decM').classList.remove('open'); goReel(r.id); }; c.appendChild(w);
}
function ritAnswer(yes) {
  var r = decCur; if (!r || ritAnswer.busy) return; ritAnswer.busy = true; setTimeout(function () { ritAnswer.busy = false; }, 350); try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
  if (r.pack) {
    var it = r.pack; $('decC').className = yes ? 'r' : 'l';
    setTimeout(function () {
      var a = get('pkr', {}); a[ritWeek()] = yes ? 'si' : 'no'; put('pkr', a);
      if (yes) { var v = {}; v[me.name] = 1; var desc = typeof it.d === 'string' ? LXT(it.d) : LXT(it.d.f) + ' ' + it.d.c;
        var ex0 = findIdea(packIdeaId(it)); if (ex0) ideaAct({ t: 'idea', a: 'vote', id: ex0.id, on: true }); else ideaAct({ t: 'idea', a: 'add', i: { id: packIdeaId(it), r: '', k: /^(bobbob|oxo|stafford-caines|romantico|brunch)$/.test(it.s) ? 'cibo' : 'esperienza', p: clean(LXT(it.t), 60), o: clean(desc, 200), ts: Date.now(), v: v, q: '', u: it.l } });
        track('rituale-idea-si-' + it.s); var ex = findIdea(packIdeaId(it)); if (!(ex && isMatch(ex))) $('mh').textContent = LXT('Piano proposto: gli altri lo trovano in «Decidete insieme».'); }
      else track('rituale-idea-no-' + it.s);
      ritShow(); try { renderNov(); } catch (e) {}
    }, 230); return;
  }
  if (r.mix) {
    var mx = mixCur(); $('decC').className = yes ? 'r' : 'l';
    setTimeout(function () {
      if (yes && mx) { var v = {}; v[me.name] = 1; ideaAct({ t: 'idea', a: 'add', i: { id: uid(8), r: '', k: mx.s.k, p: clean(mx.s.p, 60), o: clean(mx.s.o || mx.s.why || '', 200), ts: Date.now(), v: v, q: clean(mx.s.shop || '', 60) } }); track('idea-weekend-si'); $('mh').textContent = LXT('Piano proposto: gli altri lo trovano in «Decidete insieme».'); }
      mixDone(yes ? 'si' : 'no'); ritShow(); try { renderNov(); } catch (e) {}
    }, 230); return;
  } var c = $('decC'); c.className = yes ? 'r' : 'l';
  try { navigator.vibrate && navigator.vibrate(yes ? 18 : 8); } catch (e) {}
  setTimeout(function () {
    if (yes) { if (!(r.x && r.x[me.name] === '❤️')) react(r.id, '❤️'); track('rituale-si'); }
    else { var sk = get('rskip', {}); sk[r.id] = Date.now(); put('rskip', sk); }
    if (yes && ritMatch(r)) ritMatchIn(r); else ritShow();
    try { renderNov(); } catch (e) {}
  }, 230);
}
// 🎉 piccola festa per un match (niente se il telefono chiede meno movimento)
function confetti() {
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  var C = ['#FF6A4D', '#FFC24D', '#4F46E5', '#E8445A', '#3BD3A8', '#F6E2B4'], box = el('div', 'cft');
  for (var i = 0; i < 28; i++) { var p = el('i'); p.style.left = (5 + Math.random() * 90) + '%'; p.style.background = C[i % C.length]; p.style.animationDelay = (Math.random() * 0.25) + 's'; p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px'); p.style.setProperty('--rt', (Math.random() * 720 - 360) + 'deg'); box.appendChild(p); }
  document.body.appendChild(box); setTimeout(function () { box.remove(); }, 1900);
}
function ritMatchIn(r) {
  var seen = get('rmatch', {}); if (seen[r.id]) { if (decMode === 'rit') ritShow(); return; } seen[r.id] = 1; put('rmatch', seen); track('rituale-match'); confetti();
  try { navigator.vibrate && navigator.vibrate([30, 60, 30]); } catch (e) {}
  decMode = 'rit'; var c = $('decC'), m = $('decM'); $('decT').textContent = '🗓 ' + LXT('Il piano del weekend'); m.classList.add('open'); $('decB').hidden = true; decCur = null; c.className = ''; c.textContent = '';
  c.appendChild(el('div', 'big', '💞')); c.appendChild(el('h3', null, LXT('È un match!')));
  c.appendChild(el('p', null, (ritMembers().length > 2 ? LXT('Lo volete tutti: ') : LXT('Lo volete entrambi: ')) + (clean(r.c, 80) || LXT('il Reel di ') + r.n)));
  var go = el('button', 'btn', '📅 ' + LXT('Fatene un piano')); go.style.marginTop = '14px'; go.onclick = function () { m.classList.remove('open'); openIdea(r.id); }; c.appendChild(go);
  var more = el('button', 'btn-o wide', LXT('Continua a votare')); more.style.marginTop = '8px'; more.onclick = function () { ritShow(); }; c.appendChild(more);
}
function decShow() {
  var c = $('decC'), q = toDecide(); c.className = ''; c.textContent = ''; decCur = q[0] || null;
  $('decB').hidden = !decCur;
  if (!decCur) { c.appendChild(el('div', 'e', '🎉')); c.appendChild(el('h3', null, 'Fatto!')); c.appendChild(el('p', null, 'Hai risposto a tutti i piani. Quelli che piacciono a tutti e due li trovi in cima ai Piani.')); return; }
  c.appendChild(el('div', 'e', (KINDS[decCur.k] || '💡').split(' ')[0]));
  c.appendChild(el('h3', null, decCur.p));
  if (decCur.o) c.appendChild(el('p', null, decCur.o));
  c.appendChild(el('p', null, 'Proposto da ' + decCur.n + (q.length > 1 ? ' · ne restano ' + q.length : '')));
}
function decAnswer(yes) {
  var i = decCur; if (!i) return; var c = $('decC'); c.className = yes ? 'r' : 'l';
  try { navigator.vibrate && navigator.vibrate(yes ? 18 : 8); } catch (e) {}
  setTimeout(function () {
    if (yes) ideaAct({ t: 'idea', a: 'vote', id: i.id, on: true });
    else { var sk = get('iskip', {}); sk[i.id] = Date.now(); put('iskip', sk); renderIdeas(); }
    if (!$('decC').querySelector('.big')) decShow();
  }, 230);
}
function matchIn(i) {
  var seen = get('imatch', {}); if (seen[i.id]) return; seen[i.id] = 1; put('imatch', seen); confetti();
  try { navigator.vibrate && navigator.vibrate([30, 60, 30]); } catch (e) {}
  var c = $('decC'), m = $('decM'); m.classList.add('open'); $('decB').hidden = true; decCur = null; c.className = ''; c.textContent = '';
  c.appendChild(el('div', 'big', '💞')); c.appendChild(el('h3', null, (circleSize() > 2 ? 'Siete tutti d’accordo!' : 'Siete d’accordo!')));
  c.appendChild(el('p', null, (circleSize() > 2 ? 'Lo volete tutti: ' : 'Lo volete entrambi: ') + i.p));
  if (i.u) { var bk = document.createElement('a'); bk.className = 'btn'; bk.href = i.u; bk.target = '_blank'; bk.rel = 'noopener'; bk.textContent = '🎟 ' + LXT('Prenota adesso') + ' ↗'; bk.style.cssText = 'display:block;text-align:center;text-decoration:none;margin-top:14px'; bk.onclick = function () { track('idea-match-prenota-' + (i.id.split('-').pop() || '')); }; c.appendChild(bk); track('idea-match-' + (i.id.split('-').pop() || '')); }
  var go = el('button', i.u ? 'btn-o wide' : 'btn', '📅 Scegliamo quando'); go.style.marginTop = i.u ? '8px' : '14px'; go.onclick = function () { m.classList.remove('open'); showPane('ideas'); pickDay(i); };
  c.appendChild(go);
}
$('decSi').addEventListener('click', function () { if (decMode === 'rit') ritAnswer(true); else decAnswer(true); });
$('decNo').addEventListener('click', function () { if (decMode === 'rit') ritAnswer(false); else decAnswer(false); });
$('decX').addEventListener('click', function () { $('decM').classList.remove('open'); });
(function () { var x0 = null, c = $('decC');
  c.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  c.addEventListener('touchmove', function (e) { if (x0 === null || !decCur) return; var dx = e.touches[0].clientX - x0; c.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 20 + 'deg)'; }, { passive: true });
  c.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; c.style.transform = ''; if (decCur && Math.abs(dx) > 80) { if (decMode === 'rit') ritAnswer(dx > 0); else decAnswer(dx > 0); } });
})();
function fmtDay(w) { try { var d = new Date(w + 'T12:00:00'); return d.toLocaleDateString(window.LX_LANG === 'en' ? 'en-GB' : window.LX_LANG === 'es' ? 'es-ES' : 'it-IT', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { return w; } }
function pickDay(i) {
  // una finestra con i giorni più usati e il calendario del telefono ben visibile (il calendario «nascosto» su iPhone non si apriva)
  var old = $('dayM'); if (old) old.remove();
  var M = el('div', 'mod open'); M.id = 'dayM'; M.setAttribute('role', 'dialog'); M.setAttribute('aria-modal', 'true');
  var C = el('div', 'card'); M.appendChild(C); C.appendChild(el('h2', null, '📅 Quando?')); var pp = el('p', null, i.p); pp.style.marginTop = '0'; C.appendChild(pp);
  var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  var set = function (v) { M.remove(); if (v !== (i.w || '')) { ideaAct({ t: 'idea', a: 'when', id: i.id, w: v }); if (v) $('mh').textContent = '📅 ' + i.p + ': ' + fmtDay(v) + '. Lo vede tutto il cerchio.'; } };
  var now = new Date(), plus = function (n) { return new Date(now.getFullYear(), now.getMonth(), now.getDate() + n); }, toDow = function (w) { var n = (w - now.getDay() + 7) % 7; return plus(n || 7); };
  var row = el('div', 'backc');
  [['Oggi', plus(0)], ['Domani', plus(1)], ['Sabato', toDow(6)], ['Domenica', toDow(0)]].forEach(function (o) { var b = el('button', null, o[0] + ' · ' + fmtDay(iso(o[1]))); b.type = 'button'; b.onclick = function () { set(iso(o[1])); }; row.appendChild(b); });
  C.appendChild(row);
  var lb = el('label', 'hint', 'Oppure scegli un altro giorno:'); lb.style.display = 'block'; lb.style.margin = '12px 0 6px'; C.appendChild(lb);
  var inp = el('input'); inp.type = 'date'; inp.id = 'dayIn'; inp.value = i.w || ''; inp.min = iso(now); inp.style.cssText = 'width:100%;min-height:52px;font-size:17px'; lb.htmlFor = 'dayIn'; C.appendChild(inp);
  var duo = el('div', 'duo'); duo.style.marginTop = '14px';
  var x = el('button', 'btn-o', i.w ? 'Togli la data' : 'Annulla'); x.type = 'button'; x.onclick = function () { if (i.w) set(''); else M.remove(); }; duo.appendChild(x);
  var ok = el('button', 'btn go', 'Salva'); ok.type = 'button'; ok.onclick = function () { if (inp.value) set(inp.value); else inp.focus(); }; duo.appendChild(ok);
  C.appendChild(duo); M.addEventListener('click', function (e) { if (e.target === M) M.remove(); });
  document.body.appendChild(M);
}

function toCal(i) {
  var d = i.w.replace(/-/g, ''), nd = new Date(i.w + 'T12:00:00'); nd.setDate(nd.getDate() + 1);
  var d2 = nd.toISOString().slice(0, 10).replace(/-/g, ''), r = i.r && find(i.r);
  var ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Reelta//IT\r\nBEGIN:VEVENT\r\nUID:' + i.id + '@reelta\r\nDTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z\r\nDTSTART;VALUE=DATE:' + d + '\r\nDTEND;VALUE=DATE:' + d2 + '\r\nSUMMARY:' + i.p.replace(/[,;\\]/g, ' ') + '\r\nDESCRIPTION:' + ((i.o || '') + (r ? ' ' + r.u : '')).replace(/[,;\\\r\n]/g, ' ') + '\r\nBEGIN:VALARM\r\nTRIGGER:-P1D\r\nACTION:DISPLAY\r\nDESCRIPTION:' + i.p.replace(/[,;\\]/g, ' ') + '\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
  var f; try { f = new File([ics], 'reelta-piano.ics', { type: 'text/calendar' }); } catch (e) {}
  if (f && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: i.p }).catch(function () {}); return; }
  if (isIOS) { location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics); return; }
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'reelta-piano.ics'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
// promemoria gentile: al massimo una volta a settimana, solo se ci sono piani fermi da un po'
function planNudge() {
  if (!ideas.length || Date.now() - (+get('inudge', 0)) < 7 * 864e5) return;
  var today = new Date().toISOString().slice(0, 10);
  var soon = ideas.filter(function (i) { if (!i.w || i.d) return false; var dd = (new Date(i.w + 'T12:00:00') - Date.now()) / 864e5; return dd >= -1 && dd <= 2; });
  var old = ideas.filter(function (i) { return !i.d && !i.w && Date.now() - i.ts > 10 * 864e5; });
  var dec = toDecide();
  if (!soon.length && !old.length && !dec.length) return;
  put('inudge', Date.now());
  var t, b;
  if (soon.length) { t = '📅 ' + soon[0].p; b = soon[0].w === today ? 'È oggi! Tutto pronto?' : '📅 ' + fmtDay(soon[0].w) + ' · Tutto pronto?'; }
  else if (dec.length) { t = '💘 ' + (dec.length === 1 ? '1 piano aspetta' : dec.length + ' piani aspettano') + ' il tuo sì'; b = 'Ci metti 10 secondi: sì o passo, e scoprite cosa vi piace a tutti e due.'; }
  else { t = '💡 ' + (old.length === 1 ? '1 piano è fermo' : old.length + ' piani sono fermi') + ' da un po’'; b = '“' + old[0].p + '” e gli altri: scegliete una data, così succede davvero.'; }
  if (document.querySelector('.mod.open')) { put('inudge', 0); return; }
  ask(t, b, dec.length && !soon.length ? 'Decidiamo' : 'Vedi i piani').then(function (y) { if (!y) return; showPane('ideas'); if (dec.length && !soon.length) decOpen(); });
}
function ideaGuide() {
  var g = el('div', 'iempty');
  g.appendChild(el('h3', null, 'Dai Reel ai piani'));
  var ol = el('ol'); ['🎬 Vedete un Reel che vi piace', '✨ Toccate Piano sotto il video', '💘 Dite sì o passo: se piace a entrambi, si fa', '📅 Scegliete la data e mettetela in calendario'].forEach(function (t) { ol.appendChild(el('li', null, t)); }); g.appendChild(ol);
  var ex = el('div', 'card idea ex'); ex.appendChild(el('span', 'tag', 'ESEMPIO'));
  ex.appendChild(el('div', 'k', KINDS.viaggio)); ex.appendChild(el('h3', null, 'Weekend a Lisbona'));
  var ac = el('div', 'acts'); ['👍 2', '📍 Mappa', '✈️ Voli', '🏨 Hotel'].forEach(function (t) { ac.appendChild(el('span', 'r-btn', t)); }); ex.appendChild(ac);
  ex.setAttribute('aria-label', 'Esempio di piano'); g.appendChild(ex);
  var r2 = el('div', 'row2'), a = el('button', 'btn', '▶ Vai ai Reel'), b = el('button', 'btn-o', '+ Crea un piano');
  a.onclick = function () { showPane('main'); }; b.onclick = function () { openIdea(); };
  r2.appendChild(a); r2.appendChild(b); g.appendChild(r2);
  return g;
}
/* ==== src/app/13-notifiche-cerchio-profilo.js ==== */
/* ---- 🔔 notifiche: cosa è successo nel cerchio (salvato solo sul telefono, per cerchio) ---- */
var actQuiet = false;
var ACT_TXT = { reel: 'ha mandato un Reel', rx: 'ha reagito al tuo Reel', cmt: 'ha commentato un Reel', sumq: 'chiede di cosa parla il tuo Reel', idea: 'ha proposto un piano', vote: 'vuole fare questo piano', when: 'ha scelto il giorno', match: 'Vi piace a tutti! 🎉', msg: 'ti ha scritto', join: 'è entrato nel cerchio' };
function actLog(k, n, t, id, e) {
  if (actQuiet || !me || (n && (n === me.name || isMuted(n)))) return;
  var L = get('acts', []), now = Date.now(), last = L[L.length - 1];
  if (last && last.k === k && last.n === n && (k === 'msg' || last.id === id) && now - last.ts < 30 * 6e4) { last.ts = now; last.t = clean(t, 80); last.c = (last.c || 1) + 1; if (e) last.e = e; }
  else L.push({ k: k, n: n || '', t: clean(t, 80), id: id || '', e: e || '', ts: now });
  put('acts', L.slice(-80)); bellUI();
}
function actUnread() { var s0 = +get('actSeen', 0) || 0; return get('acts', []).filter(function (a) { return a.ts > s0; }).length; }
function bellUI() { var b = $('bellN'); if (!b) return; var n = actUnread(); b.hidden = !n; b.textContent = n > 9 ? '9+' : String(n); $('bell').setAttribute('aria-label', n ? LXT('Notifiche') + ': ' + n : LXT('Notifiche')); }
function actGo(a) {
  $('ntfM').classList.remove('open');
  if (a.k === 'msg') return showPane('chat');
  if (a.k === 'join') return showPane('circle');
  if (a.k === 'idea' || a.k === 'vote' || a.k === 'when' || (a.k === 'match' && !find(a.id))) return showPane('ideas');
  if (a.id && find(a.id)) return goReel(a.id);
  showPane('main');
}
function bellOpen() {
  var L = get('acts', []).slice().reverse(), s0 = +get('actSeen', 0) || 0, box = $('ntfL'); box.textContent = '';
  if (!L.length) box.appendChild(el('p', 'hint', LXT('Qui vedrai i nuovi Reel, i cuori, i commenti, i piani e chi entra nel cerchio.')));
  L.forEach(function (a) {
    var row = el('button', 'ntf' + (a.ts > s0 ? ' new' : '')); row.type = 'button';
    var av = a.k === 'match' ? el('span', 'ntfE', '🎉') : avatar(a.n); row.appendChild(av);
    var tx = el('span', 'ntfX'), l1 = el('span', 'ntfL1');
    if (a.n && a.k !== 'match') l1.appendChild(el('b', '', a.n + ' '));
    l1.appendChild(document.createTextNode(LXT(a.k === 'rx' && a.e ? 'ha messo' : ACT_TXT[a.k] || '') + (a.k === 'rx' && a.e ? ' ' + a.e + ' ' + LXT('al tuo Reel') : '') + (a.c > 1 ? ' (' + a.c + ')' : '')));
    tx.appendChild(l1); if (a.t) tx.appendChild(el('span', 'ntfL2', a.t)); tx.appendChild(el('span', 'ntfT', ago(a.ts)));
    row.appendChild(tx); row.onclick = function () { actGo(a); }; box.appendChild(row);
  });
  put('actSeen', Date.now()); bellUI();
  $('ntfM').classList.add('open'); track('notifiche-aperte');
}
$('bell').addEventListener('click', bellOpen); $('ntfX').addEventListener('click', function () { $('ntfM').classList.remove('open'); });
// Persone non è più in basso: una volta sola, a chi usava già Reelta, una freccia sull'avatar
function pplHint() {
  try { if (localStorage.getItem(LSG + 'pplHint') || navigator.webdriver) return; } catch (e) { return; }
  lsSet(LSG + 'pplHint', '1');
  if (!get('acts', []).length && !feed.length && !msgs.length) return; // nuovo utente: niente da spiegare
  var h = el('button', 'pplh', LXT('👥 Persone ora è qui: tocca la tua foto')); h.type = 'button'; h.id = 'pplH';
  h.onclick = function () { pplHintOff(); showPane('circle'); }; document.body.appendChild(h);
  try { var r = $('av').getBoundingClientRect(), L = Math.max(8, Math.min(window.innerWidth - h.offsetWidth - 8, r.left + r.width / 2 - 34)); h.style.left = L + 'px'; h.style.right = 'auto'; h.style.top = (r.bottom + 10) + 'px'; var ov = h.getBoundingClientRect().right - (document.documentElement.clientWidth - 8); if (ov > 0) { L -= ov; h.style.left = L + 'px'; } h.style.setProperty('--ax', (r.left + r.width / 2 - L - 7) + 'px'); } catch (e) {}
  setTimeout(pplHintOff, 9000);
}
function pplHintOff() { var h = $('pplH'); if (h) h.remove(); }
function goReel(id) { showPane('main'); var nd = nodes[id]; if (nd) nd.el.scrollIntoView({ behavior: 'smooth' }); }
function ideaFocus() { var w = $('iFoc'); if (!w) { w = aiFocusRow(function (t, img) { aiPlan(t, img); }); w.id = 'iFoc'; var R = $('iAiR'); R.parentNode.insertBefore(w, R.nextSibling); } w.hidden = !(ideaRid && srvOn()); }
function openIdea(rid, opts) {
  ideaRid = rid || ''; $('ip').value = ''; $('io').value = ''; $('iH').textContent = '';
  var g = $('ikg'); if (!g.children.length) Object.keys(KINDS).forEach(function (k) { var b = el('button', null, KINDS[k]); b.type = 'button'; b.dataset.k = k; b.setAttribute('role', 'radio'); b.onclick = function () { setKind(k); }; g.appendChild(b); });
  var r0 = rid && find(rid); setKind(guessKind(r0 && r0.c) || 'viaggio');
  if (!(opts && opts.again)) aiLast = null; $('iok2').hidden = !r0;
  $('iAi').hidden = !(r0 && srvOn()); $('iAi').disabled = false; $('iAi').classList.remove('busy'); $('iAi').querySelector('b').textContent = aiLast ? '✨ Un’altra idea dal video' : '✨ Riconosci dal video'; $('iAi').querySelector('span').textContent = aiLast ? 'Oppure scegli prima un tipo: es. ✈️ per il viaggio' : 'L’AI compila il piano per te'; $('iAiR').hidden = true; $('iQ').textContent = r0 && srvOn() ? 'Oppure scegli tu:' : 'Cosa vi ha colpito?';
  if (!get('ptip', 0)) put('ptip', 1); document.querySelectorAll('.r-btn.plan.tip').forEach(function (b) { b.classList.remove('tip'); });
  $('idT').textContent = rid ? 'Trasforma in piano' : 'Nuovo piano';
  var auto = !!(r0 && srvOn()) && !(opts && opts.again);
  $('idm').classList.toggle('auto', auto); $('ikS').hidden = !auto; $('ikS').onclick = function () { $('idm').classList.remove('auto'); $('ikS').hidden = true; };
  $('idm').classList.add('open');
  if (auto) { $('iAi').hidden = true; $('iAiR').hidden = false; aiPlan(); if (!r0.aiX) { $('iAiR').textContent = '✨ Guardo il video…'; $('iAiR').hidden = false; } }
  else setTimeout(function () { $('ip').focus(); }, 50);
  try { ideaFocus(); } catch (e) {}
}
function saveIdea(more) {
  var p = clean($('ip').value, 60);
  if (!p) { $('iH').textContent = 'Scrivi cosa o dove, anche solo una parola.'; $('ip').focus(); return; }
  var v = {}; v[me.name] = 1; track('piano-creato'); tcount('p');
  ideaAct({ t: 'idea', a: 'add', i: { id: uid(8), r: ideaRid, k: $('ik').value, p: p, o: clean($('io').value, 200), ts: Date.now(), v: v, q: aiLast && aiLast.p === p && aiLast.k === $('ik').value ? aiLast.q : '' } });
  if (more === true && ideaRid) { var rr = ideaRid; openIdea(rr, { again: true }); $('iH').textContent = '✓ “' + p + '” salvato. Ora il prossimo: scegli un tipo o chiedi all’AI.'; return; }
  $('idm').classList.remove('open');
  if (tab === 'main') $('mh').textContent = 'Piano salvato: lo trovi in Piani.';
}

/* ---- cerchio e ricordi ---- */
function ask(t, p, ok, red) {
  return new Promise(function (res) {
    $('askT').textContent = t; $('askP').textContent = p; $('askOk').textContent = ok; $('askOk').classList.toggle('red', !!red);
    function done(v) { $('ask').classList.remove('open'); $('askOk').onclick = $('askNo').onclick = null; res(v); }
    $('askOk').onclick = function () { done(true); }; $('askNo').onclick = function () { done(false); };
    $('ask').classList.add('open'); setTimeout(function () { $('askNo').focus(); }, 50);
  });
}
function removeMember(k) {
  delete allowed[k]; put('allowed', allowed);
  conns.filter(function (c) { return c.k === k; }).forEach(function (c) {
    try { c.send({ t: 'no', why: 'Sei stato tolto da questo cerchio.' }); } catch (e) {}
    setTimeout(function () { try { c.close(); } catch (e) {} }, 300);
  });
  conns = conns.filter(function (c) { return c.k !== k; });
  cast({ t: 'people', people: people() }); status(); renderCircle();
}
// Reel di un altro cerchio di questo telefono (es. un cerchio che non si collega più): si possono copiare in quello aperto
function oldReels(id) { try { var L = JSON.parse(localStorage.getItem(lsOf(id) + 'feed') || '[]'); return Array.isArray(L) ? L.filter(function (r) { return r && r.id && !find(r.id); }) : []; } catch (e) { return []; } }
function importReels(id, label) {
  var L = oldReels(id); if (!L.length) return;
  ask('Copiare ' + L.length + ' Reel qui?', 'I Reel di «' + (label || 'quel cerchio') + '» vengono copiati in questo cerchio e li vedrà anche chi ne fa parte. Nell’altro cerchio restano.', 'Copia').then(function (y) {
    if (!y) return;
    L.sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); }).slice(-150).forEach(function (r) { if (addReel(r, true)) cast({ t: 'reel', r: find(r.id) }); });
    track('reel-importati'); renderCircles(); $('mh').textContent = '✓ Reel copiati: li trovi nella scheda Reel.';
  });
}
function renderCircles() {
  $('devC').hidden = !isDev; $('newC').hidden = !canCreateAny();
  var b = $('clist'); b.textContent = '';
  // cerchi "Nuovo" mai completati: li tolgo dall'elenco
  var keep = REG.list.filter(function (x) { return x.id === REG.active || x.label !== 'Nuovo' || circName(x.id); });
  if (keep.length !== REG.list.length) { REG.list = keep; regSet(REG); }
  REG.list.forEach(function (x) { var cn = circName(x.id); if (cn && cn !== x.label) { x.label = cn; regSet(REG); } });
  REG.list.forEach(function (x) {
    var r = el('div', 'mrow'), on = x.id === REG.active, s = el('span', null, (x.label || 'Cerchio') + (on ? ' · aperto' : '')); r.appendChild(s);
    if (!on) { var g = el('button', 'btn-o', 'Apri'); g.onclick = function () { switchCircle(x.id); }; r.appendChild(g); }
    if (!on && me && me.role === 'host' && oldReels(x.id).length) { var im = el('button', 'btn-o', '⤵ Reel qui'); im.title = 'Copia i Reel di questo cerchio in quello aperto'; im.onclick = function () { importReels(x.id, x.label); }; r.appendChild(im); }
    b.appendChild(r);
  });
  if (REG.list.length > 1) b.appendChild(el('p', null, 'Un cerchio alla volta resta collegato: per ricevere i Reel di un altro cerchio, aprilo da qui.'));
}
function renderCircle() {
  renderCircles(); renderReports(); renderMuted();
  try { var duo = isDuo() && !!trPartner(), P0 = get('trP', null); $('trGo').hidden = !duo; if (duo) $('trGoS').textContent = get('trasp', false) ? (P0 && P0.on ? LXT('Attiva per tutti e due ✓') : LXT('Accesa da te: aspetta il sì di') + ' ' + trPartner()) : LXT('Vedere in quali altri gruppi è l’altro, solo se siete d’accordo tutti e due'); } catch (e) {}
  $('ttlBox').hidden = me.role !== 'host'; $('cMore').hidden = me.role !== 'host'; $('ttlS').value = String(ttlMs());
  var m = $('mlist'); m.textContent = '';
  function row(t, on, rm) {
    var r = el('div', 'mrow'), s = el('span'); s.appendChild(avatar(t)); s.appendChild(document.createTextNode(t)); s.appendChild(el('i', 'dot' + (on ? ' on' : ''))); r.appendChild(s);
    if (rm) { var b = el('button', 'btn-o', 'Togli'); b.onclick = rm; r.appendChild(b); }
    m.appendChild(r);
  }
  if (me.role === 'host') {
    row(me.name + ' (tu)', true, null);
    var ks = Object.keys(allowed);
    ks.forEach(function (k) {
      var on = conns.some(function (c) { return c.k === k && c.ok && c.open; });
      row(allowed[k] + (on ? '' : ' · non collegato'), on, function () { var nm = allowed[k]; ask('Togliere ' + nm + '?', nm + ' non vedrà più i nuovi Reel e piani del cerchio. Potrai invitarla di nuovo quando vuoi.', 'Togli dal cerchio', true).then(function (y) { if (y) removeMember(k); }); });
    });
    if (cap() > 1 || !ks.length) m.appendChild(el('p', null, cap() > 1 ? ks.length + ' di ' + cap() + ' posti usati.' : 'Invita la tua persona!'));
    var allOn = ks.length && ks.every(function (k) { return conns.some(function (c) { return c.k === k && c.ok && c.open; }); });
    $('inv2').hidden = ks.length >= cap() && allOn; $('inv2').textContent = ks.length >= cap() ? '🔗 Non vi collegate? Rimanda l’invito' : 'Invita una persona'; $('invKill').hidden = false; // se siete tutti collegati il tasto «rimanda» non serve
  } else {
    var live = !!(hostConn && hostConn.open);
    (names.length ? names : [me.name]).forEach(function (n, i) { row(n + (n === me.name ? ' (tu)' : i === 0 ? ' (centro)' : ''), live, null); });
    $('inv2').hidden = true; $('invKill').hidden = true;
    m.appendChild(el('p', null, blocked ? 'Non fai più parte di questo cerchio. Puoi uscire e chiedere un nuovo invito.' : 'Solo chi ha creato il cerchio può invitare altre persone.'));
  }
  renderRecap();
}
function renderRecap() {
  var box = $('recap'); box.textContent = '';
  var wk = Date.now() - 7 * 864e5, rs = feed.filter(function (r) { return r.ts >= wk; });
  if (!rs.length) { box.appendChild(el('p', null, 'Questa settimana non ci sono ancora Reel. I vostri ricordi compaiono qui.')); return; }
  function stat(a, v) { var r = el('div', 'stat'); r.appendChild(el('span', null, a)); r.appendChild(el('b', null, String(v))); box.appendChild(r); }
  var by = {}, emo = {}, cm = 0, best = null, bs = 0;
  rs.forEach(function (r) {
    by[r.n] = (by[r.n] || 0) + 1;
    var s = 0; Object.keys(r.x || {}).forEach(function (n) { emo[r.x[n]] = (emo[r.x[n]] || 0) + 1; s++; });
    var c = (r.k || []).length; cm += c; s += c;
    if (s > bs) { bs = s; best = r; }
  });
  stat('Reel condivisi', rs.length);
  Object.keys(by).sort(function (a, b) { return by[b] - by[a]; }).forEach(function (n) { stat('da ' + n, by[n]); });
  var te = Object.keys(emo).sort(function (a, b) { return emo[b] - emo[a]; })[0];
  if (te) stat('Reazione preferita', te + ' × ' + emo[te]);
  stat('Commenti', cm);
  var iw = ideas.filter(function (i) { return i.ts >= wk; }).length; if (iw) stat('Nuovi piani', iw);
  if (best) { var b = el('button', 'btn-o wide', '❤️  Rivedi il Reel più amato, di ' + best.n); b.onclick = function () { goReel(best.id); }; box.appendChild(b); }
}

/* ---- stile ---- */
// Stile: «reelta» (Notte scura / Giorno chiara, segue il telefono), «pop» (sempre chiaro, colorato), «classico» (il vecchio oro)
var THEMES = { reelta: ['Reelta', '#FF6A4D', '#FF9A85', '#4F46E5', '#7C74F0', 'Reelta'], pop: ['Pop', '#C8175F', '#E0457F', '#C8175F', '#E0457F', 'Pop'], classico: ['Classico', '#DDB574', '#F6E2B4', '#B5683F', '#D08A63', 'Classico'] };
function curTheme() { var t = get('theme', 'reelta'); return THEMES[t] ? t : 'reelta'; } // i vecchi colori (oro, rosa oro…) passano al nuovo stile
function isLight() { var m = get('mode', 'auto'); if (m === 'light') return true; if (m === 'dark') return false; try { return matchMedia('(prefers-color-scheme: light)').matches; } catch (e) { return false; } }
function applyTheme(t) {
  if (!THEMES[t]) t = 'reelta';
  var c = THEMES[t], L = t === 'pop' ? true : isLight(), r = document.documentElement;
  r.classList.toggle('light', L); r.classList.toggle('rs', t !== 'classico'); r.classList.toggle('pop', t === 'pop');
  r.style.setProperty('--g', L ? c[3] : c[1]); r.style.setProperty('--gl', L ? c[4] : c[2]);
  var tc = document.querySelector('meta[name="theme-color"]'); if (tc) { var bg = ''; try { bg = getComputedStyle(r).getPropertyValue('--bg').trim(); } catch (e) {} tc.setAttribute('content', bg || (L ? '#F5F4FB' : '#0E0E11')); }
}
try { matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () { applyMode(); }); } catch (e) {}
function applyMode() { applyTheme(curTheme()); if (tab === 'style' && $('style').classList.contains('show')) renderStyle(); }
function renderPriv() {
  var on = !!get('riserv', 0); $('rsT').checked = on; $('rcT').checked = rcptOn();
  $('rsP').textContent = on ? 'Attiva: statistiche spente, i video si caricano solo quando tocchi ▶, lo schermo si copre quando esci dall’app. Per coprirlo al volo: doppio tocco con due dita.' : 'Per chi vuole il massimo della discrezione: niente statistiche, video solo al tocco, schermo coperto quando esci dall’app.';
}
/* ---- notifiche dentro l'app: luce sui bordi, avviso in alto, suono, vibrazione ---- */
var NT_DEF = { fx: 'filo', col: 'oro', pill: true, sound: false, vib: false, reel: true, msg: true, idea: true, quiet: false };
function ntCfg() {
  var c = get('nt', {}) || {}, o = {};
  Object.keys(NT_DEF).forEach(function (k) { o[k] = Object.prototype.hasOwnProperty.call(c, k) ? (typeof NT_DEF[k] === 'boolean' ? !!c[k] : c[k]) : NT_DEF[k]; });
  if (c.edge === false && !c.fx) o.fx = 'off';
  if (!NT_FX[o.fx]) o.fx = 'filo'; if (!NT_COL[o.col]) o.col = 'oro';
  return o;
}
// Effetti extra: gratis durante la beta, poi con Reelta Plus. Per bloccarli basta mettere PLUS_LOCK = true.
var PLUS_LOCK = false;
function hasPlus() { return isDev || !!get('plus', 0); }
function ntFree(c) { return (c.fx === 'filo' || c.fx === 'off') && c.col === 'oro'; }
var NT_FX = { filo: '✨ Filo di luce', respiro: '🌫️ Respiro', alto: '🔆 Bagliore in alto', off: '🚫 Nessuna luce' };
var NT_COL = { oro: ['#C8963E', '#FFE7A8', 'Oro'], champagne: ['#D9BF8C', '#FFF6E4', 'Champagne'], rosa: ['#D98A9A', '#FFD9E0', 'Rosa'], azzurro: ['#6FA8DC', '#D9ECFF', 'Azzurro'], verde: ['#6DBE9C', '#D8F5E8', 'Verde'], bianco: ['#D8D8D8', '#FFFFFF', 'Bianco'] };
var ntQ = null, ntT = 0, islT = 0;
var ntQuietUntil = Date.now() + 4000; // niente avvisi per i Reel già arrivati mentre l'app si collega
// trillo: chi aspetta tocca "offline 🔔"; appena l'altra persona apre Reelta, le compare "… ti stava aspettando"
function trillOut(c) {
  var t = +get('trillAt', 0); if (!t || Date.now() - t > 3 * 36e5 || !c || !c.open) return;
  put('trillAt', 0); try { c.send({ t: 'trill', n: me.name }); } catch (e) {}
}
function trillIn(who) { if (!who || who === me.name || isMuted(who)) return; showNote({ kind: 'trill', who: who, text: '', n: 1 }, Object.assign({}, ntCfg(), { pill: true }), true); }
function noteIn(kind, who, text) {
  var c = ntCfg(); if (!c[kind] || document.hidden || isMuted(who) || Date.now() < ntQuietUntil) return;
  if (c.quiet) { var h = new Date().getHours(); if (h >= 23 || h < 7) return; }
  ntQ = ntQ && ntQ.kind === kind && ntQ.who === who ? { kind: kind, who: who, text: text, n: ntQ.n + 1 } : { kind: kind, who: who, text: text, n: 1 };
  clearTimeout(ntT); ntT = setTimeout(function () { var q = ntQ; ntQ = null; if (q) showNote(q, ntCfg()); }, 350);
}
function edgeGlow(c) {
  c = c || ntCfg(); if (c.fx === 'off') return;
  var e = $('edgeL'), k = NT_COL[c.col] || NT_COL.oro;
  e.style.setProperty('--c1', k[0]); e.style.setProperty('--c2', k[1]);
  e.className = 'fx-' + c.fx; void e.offsetWidth; e.classList.add('go');
}
function chime() {
  try {
    var A = window.AudioContext || window.webkitAudioContext; if (!A) return; var a = chime.ctx || (chime.ctx = new A()); if (a.state === 'suspended') a.resume();
    [[880, 0], [1318.5, 0.12]].forEach(function (n) { var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + n[1]; o.type = 'sine'; o.frequency.value = n[0]; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.55); });
  } catch (e) {}
}
var ntLast = 0;
function showNote(q, c, force) {
  var now = Date.now(); if (!force && now - ntLast < 8000) return; ntLast = now; // mai più di un avviso ogni 8 secondi
  if (!force && q.kind === 'reel' && tab === 'main' && $('main').classList.contains('show')) c.pill = false; // stai già guardando i Reel
  edgeGlow(c);
  if (c.vib && navigator.vibrate) try { navigator.vibrate([25, 60, 25]); } catch (e) {}
  if (c.sound) chime();
  if (!c.pill) return;
  var a = $('islA'); a.textContent = ''; a.appendChild(avatar(q.who));
  $('islN').textContent = q.who;
  $('islW').textContent = q.kind === 'rx' ? (RXV[q.e] || 'ha reagito al tuo Reel') : q.kind === 'sumq' ? 'chiede di cosa parla il tuo Reel' : q.kind === 'sum' ? 'ti spiega il Reel' : q.kind === 'trill' ? 'ti stava aspettando 🔔' : q.kind === 'reel' ? (q.n > 1 ? 'ha mandato ' + q.n + ' Reel' : 'ha mandato un Reel') : q.kind === 'msg' ? 'ti ha scritto' : 'ha proposto un piano';
  $('islT').textContent = q.text || '';
  var isl = $('isl'); isl.dataset.k = q.kind; isl.dataset.rid = q.rid || ''; isl.classList.add('on'); clearTimeout(islT); islT = setTimeout(function () { isl.classList.remove('on'); }, 3000);
}
$('isl').addEventListener('click', function () { var k = $('isl').dataset.k, rid = $('isl').dataset.rid; $('isl').classList.remove('on'); if (k === 'rx' && rid) { put('rxNew', []); goReel(rid); return; } showPane(k === 'msg' ? 'chat' : k === 'idea' ? 'ideas' : 'main'); });
var NT_IDS = { pill: 'ntPill', sound: 'ntSound', vib: 'ntVib', reel: 'ntReel', msg: 'ntMsg', idea: 'ntIdea', quiet: 'ntQuiet' };
function renderNt() {
  renderPush();
  var c = ntCfg(); Object.keys(NT_IDS).forEach(function (k) { $(NT_IDS[k]).checked = c[k]; }); $('ntVibL').hidden = !navigator.vibrate;
  var fb = $('ntFx'); fb.textContent = '';
  var locked = PLUS_LOCK && !hasPlus();
  function pick(n) { edgeGlow(n); if (locked && !ntFree(n)) { $('ntH').textContent = 'Questo effetto sarà disponibile con Reelta Plus.'; return; } put('nt', n); $('ntH').textContent = ''; renderNt(); }
  Object.keys(NT_FX).forEach(function (f) { var b = el('button', 'btn-o' + (c.fx === f ? ' on' : ''), NT_FX[f]); if (f === 'respiro' || f === 'alto') b.appendChild(el('span', 'plus', 'Plus')); b.type = 'button'; b.addEventListener('click', function () { var n = ntCfg(); n.fx = f; pick(n); }); fb.appendChild(b); });
  var cb = $('ntCol'); cb.textContent = '';
  Object.keys(NT_COL).forEach(function (k) { var b = el('button', c.col === k ? 'on' : null); b.type = 'button'; b.title = NT_COL[k][2]; b.setAttribute('aria-label', NT_COL[k][2]); b.style.background = 'linear-gradient(135deg,' + NT_COL[k][0] + ',' + NT_COL[k][1] + ')'; if (k !== 'oro') b.classList.add('pl'); b.addEventListener('click', function () { var n = ntCfg(); n.col = k; if (n.fx === 'off') n.fx = 'filo'; pick(n); }); cb.appendChild(b); });
  $('ntPlus').textContent = locked ? 'Effetti e colori con ✦ sono inclusi in Reelta Plus. Puoi provarli toccandoli.' : 'Durante la beta tutti gli effetti sono gratis. Con l’arrivo di Plus, quelli segnati ✦ saranno inclusi in Plus.';
}
Object.keys(NT_IDS).forEach(function (k) { $(NT_IDS[k]).addEventListener('change', function () { var c = ntCfg(); c[k] = $(NT_IDS[k]).checked; put('nt', c); if (k === 'sound' && c.sound) chime(); }); });
$('ntTry').addEventListener('click', function () { var c = ntCfg(); c.pill = c.pill || !c.edge; showNote({ kind: 'reel', who: me && me.name ? me.name : 'Reelta', text: '✨', n: 1 }, c, true); });
/* ---- profilo ---- */
var prPic;
function renderProfile() {
  if (!me || !$('prA')) return;
  var keep = me.pic; if (prPic !== undefined) me.pic = prPic;
  var a = $('prA'); a.textContent = ''; a.appendChild(avatar(me.name)); me.pic = keep;
  if ($('gpA')) { $('gpA').textContent = ''; $('gpA').appendChild(avatar(me.name)); $('gpN').textContent = me.name; }
  $('prN').textContent = me.name; if (document.activeElement !== $('prI') && !$('prI').dataset.edit) $('prI').value = me.name;
  var cur = prPic !== undefined ? prPic : (me.pic || ''), box = $('prE'); box.textContent = '';
  EMOJI_AV.forEach(function (e) { var b = el('button', e === cur ? 'on' : null, e); b.type = 'button'; b.setAttribute('aria-label', 'Avatar ' + e); b.addEventListener('click', function () { prPic = e; renderProfile(); }); box.appendChild(b); });
}
function saveProfile() {
  var nn = clean($('prI').value, 30);
  if (!nn) { $('prH').textContent = 'Scrivi il tuo nome.'; return; }
  var others = people().concat(names || []).filter(function (x) { return x !== me.name; });
  if (nn !== me.name && others.indexOf(nn) >= 0) { $('prH').textContent = 'Questo nome lo usa già un’altra persona del cerchio.'; return; }
  var old = me.name, picCh = prPic !== undefined && prPic !== (me.pic || ''), nameCh = nn !== old;
  if (!picCh && !nameCh) { $('prH').textContent = 'Non c’è niente da cambiare.'; return; }
  if (picCh) me.pic = prPic;
  if (nameCh) me.name = nn;
  put('me', me); prPic = undefined; delete $('prI').dataset.edit;
  if (nameCh) renameIn(old, nn);
  if (me.role === 'host') {
    if (nameCh) { Object.keys(aka).forEach(function (o) { if (aka[o] === old) aka[o] = nn; }); aka[old] = nn; put('aka', aka); cast({ t: 'ren', a: old, b: nn }); cast({ t: 'people', people: people() }); }
    setPic(me.name, me.pic || ''); cast({ t: 'pf', n: me.name, p: me.pic || '' });
  } else if (nameCh) { $('prH').textContent = 'Profilo salvato ✓ Mi ricollego con il nuovo nome…'; setTimeout(function () { safeReload(); }, 900); return; }
  else if (hostConn && hostConn.open) hostConn.send({ t: 'pf', p: me.pic || '' });
  $('prH').textContent = 'Profilo salvato ✓'; refreshAvatars(); renderProfile();
}
function pickPhoto(f) {
  if (!f) return; if (!/^image\//.test(f.type || 'image/')) { $('prH').textContent = 'Scegli un’immagine.'; return; }
  var url = URL.createObjectURL(f), img = new Image();
  img.onload = function () {
    var out = '', tries = [[160, 0.8], [128, 0.7], [112, 0.6], [96, 0.5], [80, 0.45]];
    for (var i = 0; i < tries.length; i++) {
      var S = tries[i][0], c = document.createElement('canvas'); c.width = c.height = S; var x = c.getContext('2d');
      var m = Math.min(img.width, img.height); x.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
      out = c.toDataURL('image/jpeg', tries[i][1]); if (out.length <= 19000) break;
    }
    URL.revokeObjectURL(url);
    if (!validPic(out)) { $('prH').textContent = 'Non riesco a usare questa foto. Provane un’altra.'; return; }
    prPic = out; $('prH').textContent = 'Foto pronta: tocca “Salva il profilo”.'; renderProfile();
  };
  img.onerror = function () { URL.revokeObjectURL(url); $('prH').textContent = 'Non riesco a leggere questa foto. Provane un’altra.'; };
  img.src = url;
}
$('prF').addEventListener('click', function () { $('prFile').value = ''; $('prFile').click(); });
$('prFile').addEventListener('change', function () { pickPhoto($('prFile').files[0]); });
$('prX').addEventListener('click', function () { prPic = ''; $('prH').textContent = ''; renderProfile(); });
$('prS').addEventListener('click', saveProfile);
$('prI').addEventListener('input', function () { $('prI').dataset.edit = '1'; });
function renderStyle() {
  renderProfile(); renderNt();
  renderPriv();
  var box = $('themes'), cur = curTheme(); box.textContent = '';
  Object.keys(THEMES).forEach(function (k) {
    var t = THEMES[k], b = el('button', 'sw', isLight() ? t[5] : t[0]);
    var L = isLight(); b.style.background = 'linear-gradient(135deg,' + (L ? t[3] : t[1]) + ',' + (L ? t[4] : t[2]) + ')'; if (L) b.style.color = '#fff'; b.setAttribute('aria-pressed', String(cur === k)); b.setAttribute('aria-label', 'Colore ' + (isLight() ? t[5] : t[0]));
    b.onclick = function () { put('theme', k); applyTheme(k); renderStyle(); }; box.appendChild(b);
  });
  var md = get('mode', 'auto');
  document.querySelectorAll('#modeB button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.m === md)); });
  $('modeP').textContent = cur === 'pop' ? 'Pop è sempre chiaro.' : md === 'auto' ? 'Segue il telefono: chiaro o scuro come le altre app.' : md === 'light' ? 'Sempre chiaro.' : 'Sempre scuro, riposante per gli occhi la sera.';
  $('pinS').textContent = pinRec ? 'Attivo: Reelta chiede il PIN quando la apri e quando torni dopo 30 secondi. I dati salvati su questo telefono sono cifrati: senza PIN non si leggono.' : 'Nessun PIN. Aggiungine uno se altre persone usano il tuo telefono.';
  $('pinB').textContent = pinRec ? 'Cambia PIN' : 'Imposta un PIN';
  $('pinR').hidden = !pinRec;
  if (window.lxVault) lxVault.bioSupported().then(function (ok) { $('bioBox').hidden = !(ok && pinRec && lxVault.on()); $('bioT').checked = lxVault.bioOn(); });
}

/* ---- PIN ---- */
var pinRec = get('pin', null), pinMode = 'set', hidAt = 0;
async function hashPin(pin, salt) {
  var k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  var b = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 150000, hash: 'SHA-256' }, k, 256);
  return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
}
function showLock() { if (!pinRec) return; $('lockIn').value = ''; $('lockH').textContent = ''; var b = !!(window.lxVault && lxVault.bioOn()); $('lockBio').hidden = !b; $('lock').classList.add('open'); if (!b) setTimeout(function () { $('lockIn').focus(); }, 50); }
async function tryUnlock() {
  var v = $('lockIn').value;
  if (!v) { $('lockH').textContent = 'Inserisci il PIN.'; return; }
  if (await hashPin(v, pinRec.s) === pinRec.h) { $('lock').classList.remove('open'); $('lockIn').value = ''; }
  else { $('lockH').textContent = 'PIN errato.'; $('lockIn').value = ''; }
}
function openPin(mode) {
  pinMode = mode;
  $('pT').textContent = mode === 'set' ? (pinRec ? 'Nuovo PIN' : 'Imposta un PIN') : 'Togli il PIN';
  $('p1').placeholder = mode === 'set' ? 'Nuovo PIN (4–8 cifre)' : 'PIN attuale';
  $('p2').hidden = mode !== 'set'; $('p1').value = ''; $('p2').value = ''; $('pH').textContent = '';
  $('pinm').classList.add('open'); setTimeout(function () { $('p1').focus(); }, 50);
}
async function savePin() {
  var a = $('p1').value;
  if (pinMode === 'set') {
    if (!/^\d{4,8}$/.test(a)) { $('pH').textContent = 'Il PIN deve avere da 4 a 8 cifre.'; return; }
    if (a !== $('p2').value) { $('pH').textContent = 'I due PIN non coincidono.'; return; }
    var s = uid(16); pinRec = { s: s, h: await hashPin(a, s) }; put('pin', pinRec);
    try { if (window.lxVault) { if (lxVault.on()) await lxVault.rekey(a); else await lxVault.enable(a); } } catch (e) { $('pH').textContent = 'PIN salvato, ma non sono riuscito a cifrare i dati.'; return; }
  } else {
    if (!pinRec || await hashPin(a, pinRec.s) !== pinRec.h) { $('pH').textContent = 'PIN errato.'; $('p1').value = ''; return; }
    pinRec = null; lsDel(LSG + 'pin');
    try { if (window.lxVault && lxVault.on()) await lxVault.disable(); } catch (e) {}
  }
  $('pinm').classList.remove('open'); renderStyle();
}
function guide(force) {
  if (!force && get('guided', 0)) return;
  put('guided', 1);
  var host = me.role === 'host', ol = $('gdS'); ol.textContent = '';
  var alone = host && !Object.keys(allowed).length;
  (alone ? [
    'Scegli un’idea in alto, oppure incolla un Reel che ti piace (Condividi → Copia link, poi qui “Incolla”).',
    'Mandalo alla tua persona: le arriva su WhatsApp con il video ed entra con un tocco.'
  ] : host ? [
    'Invita la tua persona: le mandi il link su WhatsApp ed entra da sola, anche più tardi.',
    'Vedi un Reel che vi piace? Condividi → Copia link, poi qui tocca “Incolla”. Lo vede subito.'
  ] : [
    'Sei dentro! Quello che vi mandate resta solo tra voi.',
    'Vedi un Reel che vi piace? Condividi → Copia link, poi qui tocca “Incolla”. Lo vede subito.'
  ]).forEach(function (t, i) { var li = el('li'); li.appendChild(el('span', 'n', String(i + 1))); li.appendChild(el('span', null, t)); ol.appendChild(li); });
  if (alone) withIco($('gdGo'), 'spark', LXT('Guarda le idee')); else if (host) withIco($('gdGo'), 'mail', LXT('Invita adesso')); else $('gdGo').textContent = LXT('Va bene'); $('gdGo').hidden = !host; // per chi è invitato basta «Ho capito» $('gdX').className = host ? 'btn-o wide' : 'btn';
  $('gdGo').onclick = function () { $('gd').classList.remove('open'); if (alone) { lsSet(LSG + 'packSeen', '1'); track('benvenuto-idee'); IV.list = packList(); ideaView(0); } else if (host) invite(); };
  $('gd').classList.add('open');
}
function setBig(on) { document.documentElement.classList.toggle('big', on); put('big', on ? 1 : 0); }
function wipe() {
  ['me', 'feed', 'outbox', 'allowed', 'seen', 'ideas', 'guided', 'gone', 'msgs', 'codes', 'muted', 'reps', 'ttl', 'pics', 'aka', 'mhid'].forEach(function (k) { lsDel(LS + k); });
  if (REG.list.length > 1) { var id = REG.active; REG.list = REG.list.filter(function (x) { return x.id !== id; }); REG.active = REG.list[0].id; regSet(REG); }
  else { lsDel(LSG + 'pin'); }
  safeReload();
}

/* ==== src/app/14-avvio.js ==== */
/* ---- avvio ---- */
// chiede al telefono di non cancellare mai i dati di Reelta per fare spazio
function keepData() { try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(function (p) { if (!p) navigator.storage.persist(); }); } catch (e) {} }
// promemoria gentile per la copia di sicurezza (ogni 7 giorni, solo se ci sono cerchi)
function backupNudge() {
  try {
    var last = +get('bkAt', 0), first = +get('bkFirst', 0), now = Date.now();
    if (!first) { put('bkFirst', now); return; }
    if (cloudOn()) return;
    if (now - Math.max(last, first) < 7 * 864e5 || !feed.length) return;
    put('bkFirst', now);
    if (srvOn()) ask('💾 Attiviamo la copia automatica?', 'Se perdi o cambi telefono, con un codice ritrovi tutti i tuoi cerchi senza nuovi inviti. È cifrata sul telefono e si attiva in 10 secondi.', 'Attiva').then(function (y) { if (y) cloudStart(); });
    else ask('💾 Salviamo una copia?', 'Se cancelli l’app o cambi telefono, con una copia ritrovi tutti i tuoi cerchi senza nuovi inviti. Ci vogliono 10 secondi.', 'Salva adesso').then(function (y) { if (y) { showPane('circle'); bkSave(); } });
  } catch (e) {}
}
function begin() {
  keepData(); setTimeout(backupNudge, 4000); setTimeout(function () { cloudSync(false); }, 20000);
  if (me.role === 'guest' && !me.tok) { me.tok = uid(12); put('me', me); }
  showPane('main'); render(); status(); seqLabel();
  if (!feed.length && srvOn() && !navigator.webdriver) showPane('xpl');
  setTimeout(pplHint, 1500);
  if (pinRec && !window.__lxBootUnlocked) showLock(); else if (!pinRec) guide(false);
  if (me.role === 'host') startHost(); else startGuest();
  srvStart(); setTimeout(planNudge, 15000); setTimeout(pingDay, 8000);
  if (!get('gtip', 0) && 'ontouchstart' in window && !navigator.webdriver) setTimeout(function () { if (document.querySelector('.mod.open') || get('gtip', 0)) return; put('gtip', 1); ask('👆 Gesti più veloci', 'Scorri a destra o a sinistra per cambiare pagina. Doppio tocco su un Reel per il ❤️. Tieni premuto un Reel per il menu. Tira giù il feed per aggiornare. Nel lettore scorri per il Reel dopo.', 'Ok'); }, 6000); setTimeout(function () { cleanReels(); cleanWarn(); }, 9000);
  shareIn(); if (get('guided', 0)) setTimeout(packAuto, 3500); setTimeout(packPrefetch, 2500);
  if (/android/i.test(navigator.userAgent) && ((window.matchMedia && matchMedia('(display-mode: standalone)').matches)) && !navigator.webdriver) setTimeout(shareTip, 20000);
  if (REG.after === 'invite' && me.role === 'host') { delete REG.after; delete REG.nm; regSet(REG); $('gd').classList.remove('open'); setTimeout(invite, 400); }
}
// 📤 Condividi da Instagram/TikTok → Reelta (Android con l'app installata). Con più cerchi chiede dove mandarlo.
function shareIn() {
  var later = null; try { later = sessionStorage.getItem('lx-share'); sessionStorage.removeItem('lx-share'); } catch (e) {}
  var u = incoming || later; incoming = null; if (!u) return;
  if (later) { postAll(u, ''); return; }
  var ok = REG.list.filter(function (x) { try { return !!localStorage.getItem(lsOf(x.id) + 'me'); } catch (e) { return false; } });
  if (ok.length < 2) { postAll(u, ''); return; }
  var short = u.replace(/^https?:\/\/(www\.)?/, '').slice(0, 48);
  sheet('📤 Dove lo mando?', short, ok.map(function (x) {
    return { t: (x.id === REG.active ? '✓ ' : '') + (x.label || 'Cerchio'), f: function () { if (x.id === REG.active) postAll(u, ''); else { try { sessionStorage.setItem('lx-share', u); } catch (e) {} switchCircle(x.id); } } };
  }));
}
function shareTip() {
  try { if (localStorage.getItem(LSG + 'shtip') || document.querySelector('.mod.open')) return; localStorage.setItem(LSG + 'shtip', '1'); } catch (e) { return; }
  ask('📤 Più veloce: condividi da Instagram', 'In Instagram o TikTok tocca Condividi, poi scegli Reelta: il Reel arriva qui da solo, senza copiare il link. (Se non vedi Reelta, tocca “Altro” e aggiungila.)', 'Ok');
}
function pastedId() { var v = $('ic').value.trim(), m = /j=([\w-]{8,100})/.exec(v) || /^([\w-]{8,100})$/.exec(v); return m ? m[1] : null; }
var kindSel = REG.after === 'invite' ? 'group' : REG.list.length > 1 && REG.list.some(function (x) { return x.label === 'Coppia' || /Duo/.test(x.label || '') || circKind(x.id) === 'couple'; }) ? 'group' : 'couple';
function paintKind() {
  ['couple', 'group', 'big'].forEach(function (k) { var b = $(k === 'couple' ? 'kC' : k === 'group' ? 'kG' : 'kB'); b.setAttribute('aria-pressed', kindSel === k); b.hidden = !canCreate(k) || (k === 'big' && !isDev); });
  if (!canCreate(kindSel)) kindSel = ['couple', 'group', 'big'].filter(canCreate)[0] || kindSel;
  ['couple', 'group', 'big'].forEach(function (k) { $(k === 'couple' ? 'kC' : k === 'group' ? 'kG' : 'kB').setAttribute('aria-pressed', kindSel === k); });
  $('sP').textContent = kindSel === 'big' ? 'Tu e fino a ' + (BIG_MAX - 1) + ' persone, in privato.' : kindSel === 'group' ? 'Tu e altre 2 persone, in privato.' : 'Tu e una persona, in privato.';
}
$('kC').onclick = function () { kindSel = 'couple'; paintKind(); };
$('kMore').onclick = function () { kOpen = true; kindSel = canCreate('group') ? 'group' : kindSel; syncKind(); };
$('kG').onclick = function () { kindSel = 'group'; paintKind(); };
$('kB').onclick = function () { kindSel = 'big'; paintKind(); };
var kOpen = false, icOpen = false;
// primo ingresso semplice: solo il nome, si entra subito; le persone si aggiungono dopo (anche mandando un reel)
function firstRun() { return REG.list.length <= 1 && !REG.after && !joinId; }
function syncKind() {
  var j = !!pastedId() || !!joinId, any = canCreateAny(), fr = firstRun() && !j && any;
  $('kindBox').hidden = j || !any || (fr && !kOpen); $('kMore').hidden = !fr || kOpen;
  $('ic').hidden = !!joinId || (fr && !icOpen && !$('ic').value.trim());
  if (!j && any) { $('sT').textContent = REG.after ? 'Nuovo gruppo' : REG.list.length > 1 ? 'Nuovo cerchio' : 'Come ti chiami?'; if (!$('ic').value.trim()) $('go').textContent = fr ? 'Entra' : 'Inizia'; paintKind(); if (fr && !kOpen) $('sP').textContent = 'Entri subito. Le persone con cui uscire le aggiungi dopo, con un tocco.'; }
  $('icHelp').hidden = !!joinId || $('ic').hidden;
  $('icHelp').textContent = any ? 'Se qualcuno ti ha invitato, incolla il suo link. Se no, lascia vuoto: creerai il tuo cerchio.' : 'In WhatsApp tieni premuto il messaggio d’invito → “Copia”, poi tocca “Incolla l’invito” qui sopra e scrivi il tuo nome.';
  var fresh = REG.list.length <= 1 && ((window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone);
  $('haveInv').className = any && !fresh ? 'btn-o wide' : 'btn wide'; $('haveInv').style.margin = '0 0 10px';
  if (!j && !any) { $('sT').textContent = 'Reelta è su invito'; $('sP').textContent = 'Per ora si entra solo con un invito. Apri il link che ti hanno mandato, oppure incollalo qui sotto.'; $('go').textContent = 'Entra con l’invito'; }
}

$('ic').addEventListener('input', function () { if (tryDev($('ic').value)) { $('ic').value = ''; return; } var mg = /#mig=[a-f0-9]{32}\.[\w.-]+/.exec($('ic').value); if (mg) { location.replace(location.pathname + mg[0]); location.reload(); return; } $('go').textContent = pastedId() ? 'Chiedi di entrare' : 'Inizia'; syncKind(); });
$('sCancel').onclick = function () { var id = REG.active; REG.list = REG.list.filter(function (x) { return x.id !== id; }); REG.active = REG.prev && REG.list.some(function (x) { return x.id === REG.prev; }) ? REG.prev : REG.list[0].id; delete REG.prev; delete REG.after; delete REG.nm; regSet(REG); history.replaceState(null, '', location.pathname); safeReload(); };
$('go').addEventListener('click', function () {
  var n = clean($('nm').value, 30);
  if (!n) { $('sH').textContent = 'Scrivi il tuo nome.'; return; }
  var jid = joinId || pastedId();
  var haveP = jid && typeof circleOfHost === 'function' && circleOfHost(jid.split('_')[0]);
  if (haveP) { markRejoin(haveP, jid); REG.list = REG.list.filter(function (x) { return x.id === haveP || x.id !== REG.active || x.label !== 'Nuovo'; }); REG.active = haveP; regSet(REG); history.replaceState(null, '', location.pathname); safeReload(); return; }
  if (!joinId && $('ic').value.trim() && !jid) { $('sH').textContent = 'Il link di invito non sembra giusto.'; return; }
  if (!jid && !canCreate(kindSel)) { $('sH').textContent = 'Per entrare serve un invito: incolla qui sopra il link che ti hanno mandato.'; return; }
  me = jid ? { name: n, role: 'guest', hostId: jid.split('_')[0], code: jid.split('_')[1] || '', tok: /^[\w]{8,40}$/.test(jid.split('_')[2] || '') ? jid.split('_')[2] : uid(12) } : { name: n, role: 'host', hostId: 'lpx' + uid(12), kind: kindSel };
  track(jid ? 'richiesta-ingresso' : 'cerchio-creato');
  if (jid && me.role === 'guest') {
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    if (/iphone|ipad|ipod|android/i.test(navigator.userAgent) && !standalone && navigator.clipboard) navigator.clipboard.writeText(location.origin + location.pathname + '#j=' + me.hostId + '_' + me.code + '_' + me.tok).catch(function () {});
  }
  put('me', me); if (joinId) history.replaceState(null, '', location.pathname); begin();
  if (false) setTimeout(function () { try { if (me && me.role === 'host' && !Object.keys(allowed).length && !$('invM').classList.contains('open') && !$('gd').classList.contains('open')) { track('invita-dopo-creato'); invite(); } } catch (e) {} }, 900); // appena creato il cerchio: subito l'invito
});
$('nm').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('go').click(); });
$('inv').addEventListener('click', invite);
$('add').addEventListener('click', function () { if (postAll($('ru').value, $('rc').value)) { $('ru').value = ''; $('rc').value = ''; $('rc').hidden = true; compOpen = false; syncComp(); } });
$('paste').addEventListener('click', async function () {
  $('pb').hidden = true; if (!$('main').classList.contains('show')) showPane('main');
  try { postAll(await navigator.clipboard.readText(), ''); }
  catch (e) { if (!$('main').classList.contains('show')) showPane('main'); compOpen = true; syncComp(); $('ru').focus(); $('mh').textContent = 'Il telefono non mi lascia leggere il link: tieni premuto nel campo qui sopra e scegli “Incolla”.'; }
});
$('out').addEventListener('click', function () {
  ask('Uscire da questo cerchio?', 'Reel, piani e messaggi di questo cerchio verranno cancellati da questo telefono. Gli altri tuoi cerchi restano. Se vuoi tenerli, prima salva una copia di sicurezza (qui sotto).', 'Esci e cancella', true).then(function (y) { if (y) wipe(); });
});

$('ps').value = get('speed', '0'); if (!$('ps').value) $('ps').value = '0';
$('ps').addEventListener('change', function () { put('speed', $('ps').value); arm(); });
$('sq').addEventListener('click', openSeq); $('px').addEventListener('click', function () { immSet(false); closeSeq(); });
$('pfs').addEventListener('click', function () { immSet(!$('pl').classList.contains('imm')); });
$('immOut').addEventListener('click', function () { var a = seq && seq.auto; immSet(false); if (a) closeSeq(); });
$('pn').addEventListener('click', function () {
  if (party) { var n = neighbor(party.id, 1); if (n) goParty(n); else $('ll').textContent = 'Nessun altro Reel per ora.'; }
  else if (seq) showAt(seq.i + 1);
});
$('pp').addEventListener('click', function () {
  if (party) { var n = neighbor(party.id, -1); if (n) goParty(n); }
  else if (seq) showAt(seq.i - 1);
});
$('sp').addEventListener('click', startParty);
$('ibx').addEventListener('click', function () { $('ib').hidden = true; pending = null; });
$('ij').addEventListener('click', function () { if (pending) { var id = pending.id; pending = null; $('ib').hidden = true; showParty(id); } });
$('pzB').addEventListener('click', function () { if (pzOn) pzGo(); else pzStart(); });
$('p3').addEventListener('click', function () { sendNow({ t: 'ses', a: 'ready', n: me.name }); countdown(); });
$('lsend').addEventListener('click', function () { var v = clean($('li').value, 300); if (v && party) { comment(party.id, v); $('li').value = ''; } });
$('li').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('lsend').click(); });
var isStandalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), isAndroid = /android/i.test(navigator.userAgent);
var inBrowser = (isIOS || isAndroid) && !isStandalone;
var seenBanner = false; try { seenBanner = sessionStorage.getItem('lx-banner') === '1'; } catch (e) {}
var inApp = /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Bytedance|Snapchat|Line\/|LinkedInApp|GSA\//i.test(navigator.userAgent);
var iosChrome = isIOS && /CriOS|FxiOS|EdgiOS/i.test(navigator.userAgent);
var isSamsung = /SamsungBrowser/i.test(navigator.userAgent);
function hereUrl() { return location.origin + location.pathname + (typeof joinId !== 'undefined' && joinId ? '?j=' + joinId : ''); }
function chromeIntent() { return 'intent://' + location.host + location.pathname + (typeof joinId !== 'undefined' && joinId ? '?j=' + joinId : '') + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=com.android.chrome') + ';end'; }
function instArrow(pos) { var a = $('iarr'); a.className = 'iarr ' + (pos || ''); a.hidden = !pos; }
function instClose() { $('instM').classList.remove('open'); instArrow(null); }
function instGuide(steps, act, arrow) {
  var L = $('instL'); L.textContent = '';
  steps.forEach(function (h) { var li = document.createElement('li'); li.innerHTML = '<span>' + (window.LX_T ? LX_T(h) : h) + '</span>'; L.appendChild(li); });
  var A = $('instA'); A.hidden = !act; if (act) { A.textContent = act[0]; A.onclick = act[1]; }
  $('instM').classList.add('open'); instArrow(arrow);
}
function instCopyInvite() {
  try { if (me && me.role !== 'host' && me.hostId && me.code && me.tok && navigator.clipboard) navigator.clipboard.writeText(location.origin + location.pathname + '#j=' + me.hostId + '_' + me.code + '_' + me.tok).catch(function () {}); } catch (e) {}
}
// un tocco: dove il telefono lo permette installa subito, altrimenti guida passo passo con la freccia che indica dove toccare
function instS3() { return me && me.role !== 'host' ? 'Tocca <b>“Aggiungi”</b>. Poi apri Reelta dall’icona e tocca <b>“Ho già un invito”</b> (è già copiato).' : 'Tocca <b>“Aggiungi”</b>. Poi apri Reelta dall’icona.'; }
function instGo() {
  track('installa-tocco');
  if (window.__bip) {
    var ev = window.__bip; window.__bip = null;
    ev.prompt(); (ev.userChoice || Promise.resolve({})).then(function (c) {
      if (c && c.outcome === 'accepted') { $('ios').hidden = true; track('installata'); ask('✅ Fatto!', 'Trovi Reelta tra le app del telefono: d’ora in poi aprila da lì. E da Instagram o TikTok puoi toccare Condividi → Reelta.', 'Ok'); }
    });
    return;
  }
  instCopyInvite();
  if (inApp && isIOS) return instGuide(['Qui dentro non si può installare. Apri Reelta in <b>Safari</b>:', 'Poi tocca di nuovo <span class="k">Installa</span>.'], ['🧭 Apri in Safari', function () { location.href = 'x-safari-' + hereUrl(); setTimeout(function () { instGuide(['Se non si è aperto Safari: tocca <span class="k">⋯</span> in alto a destra → <b>“Apri nel browser”</b>.', 'Poi tocca di nuovo <span class="k">Installa</span>.'], null, 'tr'); }, 1500); }]);
  if (inApp || isSamsung) return instGuide([isSamsung ? 'Samsung Internet a volte blocca l’installazione. Si fa in un attimo con <b>Chrome</b>.' : 'Qui dentro non si può installare. Apri Reelta in <b>Chrome</b>.', 'Lì tocca di nuovo <span class="k">Installa</span>: basta un tocco.'], ['Apri in Chrome', function () { location.href = chromeIntent(); }]);
  if (iosChrome) return instGuide(['Tocca <span class="k">⬆ Condividi</span> in alto a destra, accanto all’indirizzo (la freccia te lo indica).', 'Scorri e tocca <b>“Aggiungi alla schermata Home”</b>.', instS3()], null, 'tr');
  // Safari cambia posto ai tasti a seconda della versione e delle impostazioni: niente freccia (indicherebbe il punto sbagliato), si mostrano i tasti da cercare
  if (isIOS) return instGuide(['Nella barra di Safari, in basso, tocca il tasto che vedi tra questi: <span class="k">⋯</span> <span class="k">≡</span> <span class="k">⬆</span>', 'Tocca <b>“Condividi”</b>, poi scorri e tocca <b>“Aggiungi alla schermata Home”</b>.', instS3()], null, '');
  instGuide(['Tocca <span class="k">⋮</span> in alto a destra (la freccia te lo indica).', 'Tocca <b>“Installa app”</b> o <b>“Aggiungi a schermata Home”</b>.', 'Conferma. Poi apri Reelta dall’icona.'], null, 'tr');
}
if (inBrowser) {
  $('iosT').querySelector('small').textContent = me && me.role !== 'host' ? 'Così ritrovi il cerchio e ricevi le notifiche.' : 'Si apre come un’app, con le notifiche.';
}
$('ios').hidden = !inBrowser || seenBanner;
// chi apre Reelta dal browser per la seconda volta: invito chiaro a installarla (al massimo una volta al giorno, 3 volte in tutto)
(function () {
  if (!inBrowser || inApp || navigator.webdriver) return;
  try {
    var bn = +localStorage.getItem('lx-brN') || 0; localStorage.setItem('lx-brN', String(bn + 1));
    var today = new Date().toDateString(), bc = +localStorage.getItem('lx-brC') || 0;
    if (bn < 1 || bc >= 3 || localStorage.getItem('lx-brD') === today || typeof me === 'undefined' || !me) return;
    localStorage.setItem('lx-brD', today); localStorage.setItem('lx-brC', String(bc + 1));
    setTimeout(function () {
      if (document.getElementById('migC') || $('instM').classList.contains('open') || $('invM').classList.contains('open')) return;
      track('installa-promemoria');
      ask('📲 Installa Reelta', 'Dal browser le notifiche non arrivano e rischi di perderti i Reel che ti mandano. Installala: ci vuole un minuto.', 'Installa ora').then(function (y) { if (y) instGo(); });
    }, 3000);
  } catch (e) {}
})();
$('instGo').addEventListener('click', instGo);
$('instX').addEventListener('click', instClose);
$('instM').addEventListener('click', function (e) { if (e.target === $('instM')) instClose(); });
document.addEventListener('lx-bip', function () { if (window.__inst) $('ios').hidden = true; });
$('ix').addEventListener('click', function () { $('ios').hidden = true; try { sessionStorage.setItem('lx-banner', '1'); } catch (e) {} });
$('haveInv').addEventListener('click', async function () {
  icOpen = true; syncKind();
  var t = '';
  try { t = await navigator.clipboard.readText(); } catch (e) { try { errAuto('incolla: lettura negata ' + (e && e.name), 'haveInv'); } catch (x) {} $('sH').textContent = 'Il telefono non mi lascia leggere: tieni premuto nel campo qui sotto e scegli “Incolla”.'; await ask('Incolla a mano', 'Il telefono non mi lascia leggere gli appunti. Tieni premuto nel campo «Hai un invito? Incolla qui il link» e scegli «Incolla».', 'Ok'); $('ic').scrollIntoView({ block: 'center' }); $('ic').focus(); return; }
  if (tryDev(t)) return;
  var mg = /#mig=[a-f0-9]{32}\.[\w.-]+/.exec(t || ''); if (mg) { location.replace(location.pathname + mg[0]); location.reload(); return; }
  var m = /#j=([\w-]{8,100})/.exec(t || '');
  if (!m) { try { errAuto('incolla: niente invito (' + (t ? t.length : 0) + ' car.)', 'haveInv'); } catch (x) {} $('sH').textContent = 'Non trovo un invito copiato. In WhatsApp tieni premuto il messaggio d’invito → “Copia”, poi torna qui e riprova.'; ask('Non trovo niente da incollare', 'Negli appunti non c’è un invito né un pacchetto del trasloco. Copia di nuovo il link (tieni premuto → Copia) e riprova, oppure incollalo a mano nel campo qui sotto.', 'Ok'); return; }
  $('ic').value = location.origin + location.pathname + '#j=' + m[1];
  $('ic').dispatchEvent(new Event('input'));
  $('sH').textContent = 'Invito trovato ✓ Scrivi il tuo nome e tocca il bottone.';
  if (clean($('nm').value, 30)) $('go').click(); else $('nm').focus();
});
['inf', 'inf2'].forEach(function (i) { $(i).addEventListener('click', function () { $('im').classList.add('open'); }); });
$('imc').addEventListener('click', function () { $('im').classList.remove('open'); });
['im', 'invM', 'actM', 'bugM', 'idm', 'svM', 'refM', 'sumM'].forEach(function (id) { var m = $(id); if (m) m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('open'); }); }); // tocco fuori dalla finestra = chiudi
document.querySelectorAll('#tabs button[data-p]').forEach(function (b) { b.addEventListener('click', function () { showPane(b.dataset.p); }); });
$('inew').addEventListener('click', function () { openIdea(''); });
$('iok').addEventListener('click', function () { saveIdea(false); }); $('iok2').addEventListener('click', function () { saveIdea(true); }); $('iAi').addEventListener('click', aiPlan);
$('pushB').addEventListener('click', pushAsk);
$('svOk').addEventListener('click', svNext); $('svNo').addEventListener('click', function () { $('svM').classList.remove('open'); });
$('svGo').addEventListener('click', function () { svOpen(); });
function refOpen() { $('refM').classList.add('open'); }
$('refGo').addEventListener('click', refOpen); $('refGo2').addEventListener('click', function () { $('invM').classList.remove('open'); refOpen(); });
$('refSend').addEventListener('click', function () { $('refM').classList.remove('open'); recommend(); }); $('refNo').addEventListener('click', function () { $('refM').classList.remove('open'); });
$('sumX').addEventListener('click', function () { $('sumM').classList.remove('open'); }); $('ip').addEventListener('input', ideaSug);
$('ip').addEventListener('keydown', function (e) { if (e.key === 'Enter') saveIdea(); });
$('ino').addEventListener('click', function () { $('idm').classList.remove('open'); });
$('inv2').addEventListener('click', invite);
$('bug').addEventListener('click', openBug);
$('ttlS').addEventListener('change', function () { var v = +$('ttlS').value || 0; put('ttl', v); cast({ t: 'cfg', ttl: v }); pruneMsgs(); renderChat(true); $('ch').textContent = v ? 'Fatto: i messaggi si cancelleranno da soli per tutti.' : 'Fatto: i messaggi restano finché non li cancellate.'; });
$('bugX').addEventListener('click', function () { $('bugM').classList.remove('open'); });
$('bugWA').addEventListener('click', function () { openWA(bugText(), function () {}, function () { $('bugH').textContent = 'WhatsApp non si è aperto, ma il testo è copiato: incollalo in un messaggio.'; }); $('bugH').textContent = 'Si è aperto WhatsApp: mandalo a chi ti ha invitato (o a chi gestisce Reelta).'; });
$('bugSend').addEventListener('click', bugSend);
$('bugCp').addEventListener('click', function () { var t = bugText(); if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { $('bugH').textContent = 'Copiato ✓ Incollalo in un messaggio.'; }, function () { $('bugH').textContent = t; }); else $('bugH').textContent = t; });
$('bkS').addEventListener('click', function () { bkSave().catch(function () { $('bkH').textContent = 'Non sono riuscito a creare la copia.'; }); });
function pickBackup() { $('bkF').value = ''; $('bkF').click(); }
$('bkR').addEventListener('click', restoreChoice); $('bkR2').addEventListener('click', restoreChoice);
$('bkCo').addEventListener('click', cloudStart); $('bkCx').addEventListener('click', cloudStop); cloudUI();
$('bkF').addEventListener('change', function () { var f = $('bkF').files[0]; if (!f) return; if (f.size > 20e6) { ask('File troppo grande', 'Questo non sembra una copia di Reelta.', 'Ho capito'); return; } f.text().then(bkRestore); });
$('invKill').addEventListener('click', function () { ask('Annullare gli inviti già mandati?', 'I link d’invito mandati finora smetteranno di funzionare. Chi è già nel cerchio resta dentro. Per invitare qualcuno ne manderai uno nuovo.', 'Annulla inviti', true).then(function (y) { if (y) { put('codes', []); $('ch').textContent = 'Fatto: i vecchi inviti non funzionano più.'; } }); });
$('csend').addEventListener('click', sendMsg);
$('cin').addEventListener('keydown', function (e) { if (e.key === 'Enter') sendMsg(); });
$('hdSet').addEventListener('click', dwOpen);
$('dwS').addEventListener('click', dwClose);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('dw').classList.contains('open')) dwClose(); });

$('av').addEventListener('click', function () { pplHintOff(); showPane('circle'); }); $('av').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pplHintOff(); showPane('circle'); } });
$('pplProf').addEventListener('click', function () { showPane('prof'); });
$('trGo').addEventListener('click', function () { dwGo('style', 'trC'); });
$('goProf').addEventListener('click', function () { showPane('prof'); });
$('devX').addEventListener('click', function () { ask('Disattivare la modalità sviluppatore?', 'Per riattivarla dovrai incollare di nuovo la tua chiave.', 'Disattiva', true).then(function (y) { if (y) { lsDel(LSG + 'dev'); isDev = false; applyDev(); } }); });
$('newC').addEventListener('click', function () { if (!canCreateAny()) return; ask('Creare un altro cerchio?', 'Sarà separato dagli altri: Reel, piani e persone non si mescolano.', 'Continua').then(function (y) { if (y) newCircle(); }); });
$('pinB').addEventListener('click', function () { openPin('set'); });
$('bioT').addEventListener('change', function () {
  var on = $('bioT').checked; $('bioH').textContent = '';
  if (on) lxVault.bioEnable(me && me.name).then(function () { $('bioH').textContent = 'Fatto ✓ Alla prossima apertura basta il tuo volto o la tua impronta. Il PIN resta come riserva.'; })
    .catch(function (e) { $('bioT').checked = false; $('bioH').textContent = e && e.message === 'noprf' ? 'Questo telefono non permette di usare Face ID/impronta per aprire i dati. Serve iOS 18 o più recente (su Android: Chrome aggiornato). Il PIN funziona come sempre.' : 'Non attivato. Puoi riprovare quando vuoi.'; });
  else lxVault.bioDisable().then(function () { $('bioH').textContent = 'Disattivato: Reelta chiederà solo il PIN.'; });
});
$('lockBio').addEventListener('click', function () { if (!window.__lxBootUnlocked && !$('lock').classList.contains('open')) return; if (!lxVault.bioOn()) return; lxVault.bioCheck().then(function () { $('lock').classList.remove('open'); $('lockIn').value = ''; }).catch(function () { $('lockH').textContent = 'Non riconosciuto. Riprova o usa il PIN.'; }); });
$('pinR').addEventListener('click', function () { openPin('remove'); });
$('pOk').addEventListener('click', savePin);
$('p2').addEventListener('keydown', function (e) { if (e.key === 'Enter') savePin(); });
$('p1').addEventListener('keydown', function (e) { if (e.key === 'Enter' && pinMode !== 'set') savePin(); });
$('pNo').addEventListener('click', function () { $('pinm').classList.remove('open'); });
$('lockGo').addEventListener('click', tryUnlock);
$('lockIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryUnlock(); });
$('lockF').addEventListener('click', function () { if (window.__lxBootUnlocked === undefined && !pinRec) return; if (window.confirm('Senza PIN l’unico modo è cancellare Reelta da questo telefono (Reel, piani, messaggi e cerchi). Se hai una copia di sicurezza potrai ripristinarla. Procedere?')) { if (window.lxVault && lxVault.on()) { lxVault.destroy(); safeReload(); } else wipe(); } });
document.addEventListener('visibilitychange', function () {
  if (!pinRec || !me) return;
  if (document.hidden) hidAt = Date.now();
  else if (hidAt && Date.now() - hidAt > 30000) showLock();
});
applyTheme(curTheme());
document.querySelectorAll('#modeB button').forEach(function (x) { x.addEventListener('click', function () { put('mode', x.dataset.m); applyMode(); }); });
setInterval(applyMode, 60000);
document.addEventListener('visibilitychange', function () { if (!document.hidden) applyMode(); });
function veil(on) { $('veil').classList.toggle('on', !!on); }
document.addEventListener('visibilitychange', function () { if (!get('riserv', 0)) return; if (document.hidden) veil(true); else setTimeout(function () { if (!$('lock').classList.contains('open')) veil(false); }, 350); });
window.addEventListener('pagehide', function () { if (get('riserv', 0)) veil(true); });
$('veil').addEventListener('click', function () { veil(false); });
(function () { var last = 0; document.addEventListener('touchstart', function (e) { if (!get('riserv', 0) || e.touches.length !== 2) return; var now = Date.now(); if (now - last < 450) { veil(true); last = 0; } else last = now; }, { passive: true }); })();
$('bd').addEventListener('click', function () {
  if (!me) return;
  if (me.role === 'host' && !Object.keys(allowed).length) { invite(); return; }
  if ($('app').classList.contains('on')) { $('mh').textContent = 'Siete collegati.'; return; }
  var app = location.origin + location.pathname.replace(/index\.html$/, '');
  var T = window.LX_T || function (x) { return x; };
  var t = '🔔 ' + me.name + T(' ti sta aspettando su Reelta! Apri Reelta dall’icona sulla Home 😊 (non ce l’hai? da qui: ') + app + ')';
  if (srvOn()) {
    var who = (me.role === 'host' ? Object.keys(allowed).map(function (k) { return allowed[k]; }) : names.filter(function (n) { return n !== me.name; }));
    var wn = who.length === 1 ? who[0] : (who.length ? 'gli altri' : '');
    if (!wn) { $('mh').textContent = 'Nel cerchio ci sei solo tu: invita qualcuno.'; return; }
    ask('🔔 Avvisare ' + wn + '?', 'Riceve una notifica sul telefono e, quando apre Reelta, vede che stavi aspettando.', '🔔 Manda l’avviso').then(function (y) {
      if (!y) return;
      track('avviso-inviato'); put('trillAt', Date.now());
      if (me.role === 'host') mbToGuests({ t: 'trill', n: me.name }, null); else mbToHost({ t: 'trill', n: me.name });
      setTimeout(function () { ask('🔔 Avviso mandato', 'Appena ' + wn + ' apre Reelta vi collegate da soli. Intanto puoi mandare Reel e messaggi: arrivano lo stesso.', 'Ok'); }, 250);
    });
    return;
  }
  track('avviso-inviato'); put('trillAt', Date.now());
  if (navigator.share) navigator.share({ text: t }).catch(function () {});
  else if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { $('mh').textContent = 'Messaggio copiato: incollalo su WhatsApp.'; });
});
$('home').addEventListener('click', function () {
  if (!me || $('setup').classList.contains('show')) return;
  if ($('pl').classList.contains('show')) closeSeq();
  showPane('main'); var f = $('feed'); f.scrollTo({ top: f.scrollHeight, behavior: 'smooth' });
});
var pbT = null;
var pbAway = 0, pbLast = 0, pbNo = 0;
function hintPaste() {
  // solo se sei stato fuori almeno 5 secondi (probabilmente a copiare un link), sei sui Reel, e non più di una volta ogni 3 minuti
  if (!me || $('setup').classList.contains('show') || $('lock').classList.contains('open') || !$('main').classList.contains('show')) return;
  var now = Date.now(); if (!pbAway || now - pbAway < 5000 || now - pbLast < 180000 || now - pbNo < 600000) return;
  pbLast = now; $('pb').hidden = false; clearTimeout(pbT); pbT = setTimeout(function () { $('pb').hidden = true; }, 10000);
}
document.addEventListener('visibilitychange', function () { if (document.hidden) pbAway = Date.now(); else hintPaste(); });
$('pb').addEventListener('click', function (e) { if (e.target.id === 'pbx') { $('pb').hidden = true; pbNo = Date.now(); return; } if (!$('main').classList.contains('show')) showPane('main'); $('paste').click(); });
setBig(!!get('big', 0)); $('bigT').checked = !!get('big', 0);
$('rsT').addEventListener('change', function () {
  var on = $('rsT').checked; put('riserv', on ? 1 : 0);
  if (on && get('rcpt', null) === null) put('rcpt', 0);
  renderPriv(); render(); if (on && !pinRec) ask('Modalità riservata attiva 🕶️', 'Per una protezione completa, imposta anche un PIN (qui sotto): così i dati sul telefono sono cifrati.', 'Ok');
});
$('rcT').addEventListener('change', function () { put('rcpt', $('rcT').checked ? 1 : 0); lastSeenSent = 0; if ($('rcT').checked) markSeen(); renderChat(true); });
$('bigT').addEventListener('change', function () { setBig($('bigT').checked); });
$('help').addEventListener('click', function () { guide(true); });
/* ---- 🤝 trasparenza di coppia: solo nei Duo, solo se la accendono tutti e due, sempre visibile quando uno la spegne ---- */
function isDuo() { return !!me && (me.role === 'host' ? me.kind !== 'group' && me.kind !== 'big' : (get('all', null) || names).length <= 2 && (!me.kind || me.kind === 'couple')); }
function trPartner() { if (!me) return ''; if (me.role === 'host') { var k = Object.keys(allowed)[0]; return k ? allowed[k] : ''; } return (get('all', null) || names).filter(function (n) { return n !== me.name; })[0] || get('hn', '') || ''; }
function trSum(x) {
  try {
    var P = lsOf(x.id), m = JSON.parse(localStorage.getItem(P + 'me') || 'null'); if (!m || !m.role) return null;
    var kind, n, w = '';
    if (m.role === 'host') {
      var al = JSON.parse(localStorage.getItem(P + 'allowed') || '{}'), who = Object.keys(al).map(function (k) { return al[k]; }).filter(Boolean);
      kind = m.kind === 'big' ? 'big' : m.kind === 'group' ? 'group' : 'couple'; n = who.length + 1; if (kind === 'couple') w = who[0] || '';
    } else {
      var pp = JSON.parse(localStorage.getItem(P + 'ppl') || '[]'), hn = JSON.parse(localStorage.getItem(P + 'hn') || '""');
      n = Math.max(pp.length, 2); kind = n <= 2 ? 'couple' : n === 3 ? 'group' : 'big'; if (kind === 'couple') w = hn || pp.filter(function (q) { return q !== m.name; })[0] || '';
    }
    return { k: kind, n: n, w: clean(w, 30), l: clean(x.label || '', 30) };
  } catch (e) { return null; }
}
function trMine() { return REG.list.filter(function (x) { return x.id !== REG.active; }).map(trSum).filter(Boolean).slice(0, 20); }
function trSend() {
  if (!me || !isDuo() || !trPartner()) return;
  var on = !!get('trasp', false), P = get('trP', null), both = on && P && P.on;
  var m = { t: 'tr', n: me.name, on: on, list: both ? trMine() : [], at: Date.now() };
  put('trAt', Date.now());
  if (me.role === 'host') cast(m); else gSend(m);
}
function trIn(who, d) {
  var old = get('trP', null), on = !!d.on;
  var list = Array.isArray(d.list) ? d.list.slice(0, 20).map(function (x) { return { k: ['couple', 'group', 'big'].indexOf(x && x.k) >= 0 ? x.k : 'couple', n: Math.max(2, Math.min(99, +x.n || 2)), w: clean(x.w || '', 30), l: clean(x.l || '', 30) }; }) : [];
  put('trP', { on: on, list: on ? list : [], at: Date.now(), was: !!(old && old.on) });
  if (old && old.on && !on) ask('🤝 ' + who + ' ha spento la trasparenza di coppia', 'Da adesso non vedete più i gruppi l’uno dell’altro. Ne potete parlare quando volete.', 'Ok');
  // se l'ho accesa anch'io, rispondo con i miei gruppi (solo ora che lo sappiamo entrambi)
  if (get('trasp', false) && on && (!old || !old.on || !list.length && !d.r)) { var m = { t: 'tr', n: me.name, on: true, list: trMine(), at: Date.now(), r: 1 }; if (me.role === 'host') cast(m); else gSend(m); }
  trUI();
}
function trUI() {
  var C = $('trC'); if (!C) return;
  var duo = isDuo(), pn = trPartner(); C.hidden = !duo || !pn; if (C.hidden) return;
  var on = !!get('trasp', false), P = get('trP', null), S = $('trS'), L = $('trL'); $('trB').checked = on; L.textContent = '';
  if (on && P && P.on) {
    S.textContent = '✓ Attiva per tutti e due.';
    if (!P.list.length) { L.appendChild(el('p', null, pn + ' non è in altri gruppi.')); return; }
    L.appendChild(el('p', null, pn + ' è anche in:')); var ul = el('ul', 'trl');
    P.list.forEach(function (x) { var li = el('li', null, kindName(x.k) + (x.k === 'couple' ? (x.w ? ' con ' + x.w : '') : ' · ' + x.n + ' persone')); if (x.l && x.l !== x.w) li.appendChild(el('small', null, '«' + x.l + '»')); ul.appendChild(li); });
    L.appendChild(ul); return;
  }
  if (on) S.textContent = P && P.was && !P.on ? pn + ' l’ha spenta. Si riattiva quando la riaccende.' : 'Accesa da te. Si attiva quando la accende anche ' + pn + '.';
  else S.textContent = P && P.on ? pn + ' l’ha accesa: accendila anche tu per vedervi a vicenda.' : 'Spenta.';
}
function trAskOnce() {
  if (!isDuo() || !trPartner() || get('trAsk', 0) || document.querySelector('.mod.open') || navigator.webdriver) return;
  put('trAsk', 1);
  sheet('🤝 Trasparenza di coppia', 'Volete vedere l’uno in quali altri gruppi è l’altro? Si attiva solo se lo scegliete entrambi, e si può spegnere quando si vuole.', [
    { t: 'Sì, accendila', f: function () { put('trasp', true); trSend(); trUI(); } },
    { t: 'No, grazie', f: function () {} }
  ]);
}
$('trB').addEventListener('change', function () { put('trasp', this.checked); if (!this.checked) { var P = get('trP', null); if (P) { P.list = []; put('trP', P); } } trSend(); trUI(); track(this.checked ? 'trasp-on' : 'trasp-off'); });
setTimeout(function () { trUI(); if (get('trasp', false) || get('trAt', 0)) trSend(); }, 9000);
setTimeout(trAskOnce, 25000);
/* ---- 🙂 «Bentornato»: chi torna dopo qualche giorno ci dice cosa l'aveva allontanato (una volta sola, anonimo) ---- */
var BACK_WHY = ['📋 Condividere i Reel è scomodo', '🤷 L’altra persona non la usa', '🎬 I video non partono bene', '❓ Non ho capito bene a cosa serve', '⏳ Non ho avuto tempo'];
function backOpen(from) {
  try { if (localStorage.getItem(LSG + 'backAsk')) return; } catch (e) { return; }
  var C = $('backC'); C.textContent = ''; $('backI').hidden = true; $('backOk').hidden = true; $('backH').textContent = '';
  BACK_WHY.forEach(function (w) { var b = el('button', null, w); b.type = 'button'; b.onclick = function () { backSend(w, '', from); }; C.appendChild(b); });
  var o = el('button', null, '✏️ Altro…'); o.type = 'button'; o.onclick = function () { $('backI').hidden = false; $('backOk').hidden = false; $('backI').focus(); }; C.appendChild(o);
  $('backM').classList.add('open'); track('back-' + from);
}
function backSend(w, txt, from) {
  lsSet(LSG + 'backAsk', String(Date.now()));
  $('backM').classList.remove('open');
  if (FEEDBACK.url && FEEDBACK.anon) fetch(FEEDBACK.url + '/rest/v1/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: FEEDBACK.anon, Prefer: 'return=minimal' },
    body: JSON.stringify({ survey: 'back', code: '', data: { motivo: w, testo: clean(txt || '', 400), giorni: backGap, da: from, versione: APP_VER, lingua: window.LX_LANG || 'it', iphone: /iPhone|iPad/.test(navigator.userAgent) } }) }).catch(function () {});
  ask('Grazie! 🙏', 'Lo leggiamo davvero: ci aiuta a capire cosa cambiare.', 'Ok');
}
$('backX').addEventListener('click', function () { $('backM').classList.remove('open'); lsSet(LSG + 'backAsk', 'no'); });
$('backOk').addEventListener('click', function () { var t = clean($('backI').value, 400); if (!t) { $('backH').textContent = 'Scrivi due parole, oppure scegli una risposta sopra.'; return; } backSend('✏️ Altro', t, 'app'); });
var backGap = 0;
(function () {
  var last = 0; try { last = +localStorage.getItem(LSG + 'lastOpen') || 0; } catch (e) {}
  var now = Date.now(); backGap = last ? Math.round((now - last) / 864e5) : 0;
  function mark() { lsSet(LSG + 'lastOpen', String(Date.now())); }
  var viaPush = !!window.__qback;
  if (viaPush && /[?&]q=back/.test(location.search)) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} }
  setTimeout(function () { if (navigator.webdriver && !window.__backTest) return; if (viaPush || (last && now - last > 4 * 864e5)) backOpen(viaPush ? 'notifica' : 'app'); mark(); }, viaPush ? 1200 : 3500);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) mark(); });
  if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.q === 'back') backOpen('notifica'); });
})();
// Impostazioni come un elenco: ogni voce si apre al tocco (niente pagina lunghissima)
function accOpen(id, on) { var c = typeof id === 'string' ? $(id) : id; if (!c || !c.classList.contains('acc')) return; var o = on === undefined ? !c.classList.contains('open') : on; c.classList.toggle('open', o); var h = c.querySelector('h2'); if (h) h.setAttribute('aria-expanded', o ? 'true' : 'false'); }
document.querySelectorAll('#style > .card, #style .card').forEach(function (c) {
  var h = c.querySelector(':scope > h2'); if (!h || c.classList.contains('acc')) return;
  c.classList.add('acc'); h.setAttribute('role', 'button'); h.setAttribute('tabindex', '0'); h.setAttribute('aria-expanded', 'false');
  h.addEventListener('click', function () { accOpen(c); });
  h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); accOpen(c); } });
});
// un tocco dentro un video di Instagram: il tasto «Apri» si illumina un attimo (se Instagram non lo fa partire qui, è lì la strada)
window.addEventListener('blur', function () { setTimeout(function () { var f = document.activeElement; if (!f || f.tagName !== 'IFRAME') return; var w = f.closest('.igw'); var o = w && w.querySelector('.ovl'); if (!o) return; o.classList.remove('glow'); void o.offsetWidth; o.classList.add('glow'); setTimeout(function () { o.classList.remove('glow'); }, 3500);
  // la scritta non sta più fissa sopra il video: compare qualche secondo, solo le prime volte che tocchi un Reel di Instagram
  var n = get('ighN', 0); if (n < 3 && !w.querySelector('.ighint')) { put('ighN', n + 1); var ih = el('div', 'ighint', 'Non parte? Tocca «Apri» ↗'); w.appendChild(ih); setTimeout(function () { ih.remove(); }, 4000); } }, 0); });
/* ---- 📊 la vostra settimana: domenica e lunedì, un riepilogo degli ultimi 7 giorni (tutto calcolato sul telefono) ---- */
function wkData() {
  var t0 = Date.now() - 7 * 864e5, R = feed.filter(function (r) { return r.ts > t0; }), by = {}, rx = 0, top = null, tn = 0;
  R.forEach(function (r) { by[r.n] = (by[r.n] || 0) + 1; var n = Object.keys(r.x || {}).length; rx += n; if (n && n >= tn) { tn = n; top = r; } });
  var pl = ideas.filter(function (i) { return i.ts > t0; }).length;
  var done = ideas.filter(function (i) { return i.d && i.w && new Date(i.w + 'T12:00:00').getTime() > t0 && Object.keys(i.f || {}).some(function (n) { return i.f[n] !== 'no'; }); });
  return { n: R.length, by: by, rx: rx, top: top, pl: pl, done: done };
}
function wkDue() {
  try {
    if (!me) return null; var d = new Date(), wd = d.getDay(); if (wd > 1) return null;
    var sun = new Date(d.getTime() - wd * 864e5), key = sun.getFullYear() + '-' + (sun.getMonth() + 1) + '-' + sun.getDate();
    if (get('wkSeen', '') === key) return null; var w = wkData(); if (w.n < 3 && !w.done.length) return null; w.key = key; return w;
  } catch (e) { return null; }
}
function wkOpen(w) {
  var B = $('wkB'); B.textContent = '';
  var st = el('div', 'wks'); [[w.n, 'Reel'], [w.rx, 'reazioni'], [w.pl, w.pl === 1 ? 'piano' : 'piani']].forEach(function (x) { var c = el('div'); c.appendChild(el('b', null, String(x[0]))); c.appendChild(el('small', null, x[1])); st.appendChild(c); }); B.appendChild(st);
  var who = Object.keys(w.by).sort(function (a, b) { return w.by[b] - w.by[a]; }), mx = who.length ? w.by[who[0]] : 1;
  if (who.length > 1) who.slice(0, 6).forEach(function (n) { var r = el('div', 'wkbar'); r.appendChild(el('span', null, n)); var i = el('i'); i.style.width = Math.max(6, Math.round(w.by[n] / mx * 130)) + 'px'; r.appendChild(i); r.appendChild(el('em', null, String(w.by[n]))); B.appendChild(r); });
  if (w.top) { var p = el('p', 'wkl'); p.style.marginTop = '12px'; p.appendChild(el('b', null, '🏆 Il più amato: ')); p.appendChild(document.createTextNode((w.top.c ? '“' + w.top.c.slice(0, 60) + '”, ' : '') + (window.LX_T || String)('mandato da ') + w.top.n + ' ' + Object.keys(w.top.x).map(function (n) { return w.top.x[n]; }).join(''))); B.appendChild(p);
    var tb = el('button', 'btn-o wide', '▶ Rivedilo'); tb.type = 'button'; tb.style.margin = '0 0 10px'; tb.onclick = function () { $('wkM').classList.remove('open'); goReel(w.top.id); var nd = nodes[w.top.id]; if (nd) { nd.el.classList.remove('flash'); void nd.el.offsetWidth; nd.el.classList.add('flash'); } }; B.appendChild(tb); }
  if (w.done.length) { var q = el('p', 'wkl'); q.appendChild(el('b', null, '💞 Fatto insieme: ')); q.appendChild(document.createTextNode(w.done.slice(0, 3).map(function (i) { return i.p + ' ' + Object.keys(i.f).map(function (n) { return i.f[n] === 'no' ? '' : i.f[n]; }).join(''); }).join(' · '))); B.appendChild(q); }
  put('wkSeen', w.key); track('settimana'); $('wkM').classList.add('open');
}
$('wkX').addEventListener('click', function () { $('wkM').classList.remove('open'); renderNov(); });
/* ---- 💭 com'è andata? il giorno dopo la data di un piano, un tocco a testa: chiude il giro Reel → piano → ricordo ---- */
function fbDue() {
  if (!me) return []; var sk = get('fbSkip', {}), now = Date.now();
  return ideas.filter(function (i) { if (!i.w || (i.f && i.f[me.name]) || sk[i.id]) return false; var t = new Date(i.w + 'T23:59:00').getTime(); return now > t && now - t < 14 * 864e5; }).sort(function (a, b) { return a.w < b.w ? 1 : -1; });
}
var fbCur = null;
function fbOpen(i) {
  fbCur = i; $('fbP').textContent = i.p + ' · ' + fmtDay(i.w); var C = $('fbC'); C.textContent = '';
  [['❤️', '❤️ Bellissimo'], ['😊', '😊 Bello'], ['😐', '😐 Così così'], ['no', 'Non ci siamo andati']].forEach(function (o) {
    var b = el('button', null, o[1]); b.type = 'button';
    b.onclick = function () { ideaAct({ t: 'idea', a: 'feel', id: i.id, e: o[0] }); track('feel-' + (o[0] === 'no' ? 'no' : 'ok')); $('fbM').classList.remove('open'); renderNov(); $('mh').textContent = o[0] === 'no' ? 'Nessun problema: scegliete un’altra data quando volete 📅' : o[0] === '❤️' ? 'Salvato tra i vostri ricordi ❤️' : 'Grazie, salvato ✓'; };
    C.appendChild(b);
  });
  $('fbM').classList.add('open');
}
$('fbX').addEventListener('click', function () { if (fbCur) { var sk = get('fbSkip', {}), n = get('fbLater', {}); n[fbCur.id] = (n[fbCur.id] || 0) + 1; if (n[fbCur.id] >= 2) sk[fbCur.id] = 1; put('fbLater', n); put('fbSkip', sk); } $('fbM').classList.remove('open'); renderNov(); });
// si apre da sola una volta per piano, appena si apre l'app dopo la data (poi resta il tasto in Novità)
function fbAuto() { try { if (!me || document.hidden || document.querySelector('.mod.open')) return; var i = fbDue()[0], a = get('fbAuto', {}); if (!i || a[i.id]) return; a[i.id] = 1; put('fbAuto', a); fbOpen(i); } catch (e) {} }
setTimeout(fbAuto, 4000);
document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(fbAuto, 1500); });
/* ---- ✨ Gemini già pronto: quando arriva un Reel nuovo, la risposta si prepara in sottofondo (pochi al giorno, uno alla volta) ---- */
var aiQ = [], aiBusy = false;
function aiPre(r) {
  try {
    if (!r || r.aiX || !srvOn() || Date.now() - (+r.ts || 0) > 2 * 864e5 || /^(blob|data):/.test(r.u)) return;
    var day = new Date().toISOString().slice(0, 10), c = get('aiDay', { d: '', n: 0 }); if (c.d !== day) c = { d: day, n: 0 }; if (c.n >= 15) return;
    if (aiQ.indexOf(r) < 0) aiQ.push(r); aiNext();
  } catch (e) {}
}
function aiNext() {
  if (aiBusy || !aiQ.length || document.hidden) return; var r = aiQ.shift(); if (r.aiX || !find(r.id)) { aiNext(); return; }
  var day = new Date().toISOString().slice(0, 10), c = get('aiDay', { d: '', n: 0 }); if (c.d !== day) c = { d: day, n: 0 }; if (c.n >= 15) { aiQ = []; return; }
  c.n++; put('aiDay', c); aiBusy = true;
  setTimeout(function () { aiAsk(r, '', [], '').then(function (x) { var o = find(r.id); if (o && !o.aiX) { o.aiX = x; put('feed', feed); try { refresh(o); } catch (e) {} } }, function (e) { if (e && e.message === 'limite') { put('aiDay', { d: day, n: 99 }); aiQ = []; } }).then(function () { aiBusy = false; aiNext(); }); }, 1500);
}
document.addEventListener('visibilitychange', function () { if (!document.hidden) aiNext(); });
/* ---- 📲 «Condividi → Reelta» su iPhone, con un Comando Rapido di Apple ----
   Il comando lascia al server solo il link pubblico del video, sotto un codice casuale di questo telefono; l'app lo ritira e il server lo cancella. */
var SHORTCUT_URL = 'https://www.icloud.com/shortcuts/5d7eb738b2aa4db59e8c56b692fd4a8f'; // link iCloud del Comando Rapido «Reelta» (si attiva appena c'è)
function dropCode() { var c = ''; try { c = localStorage.getItem(LSG + 'dropc') || ''; } catch (e) {} if (!/^[A-Za-z0-9]{24}$/.test(c)) { var A = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; c = Array.from(crypto.getRandomValues(new Uint8Array(24)), function (b) { return A[b % A.length]; }).join(''); lsSet(LSG + 'dropc', c); } return c; }
function dropOk() { return isIOS && !!SHORTCUT_URL && srvOn(); }
function dropOpen() { $('drCd').textContent = dropCode(); $('drM').classList.add('open'); track('drop-open'); }
$('drCp').addEventListener('click', function () { var b = this; try { navigator.clipboard.writeText(dropCode()).then(function () { b.textContent = '✓'; setTimeout(function () { b.textContent = 'Copia'; }, 2000); }, function () {}); } catch (e) {} });
$('drX').addEventListener('click', function () { $('drM').classList.remove('open'); });
$('drGo').addEventListener('click', function () {
  var c = dropCode(); lsSet(LSG + 'dropOn', '1');
  var go = function () { $('drM').classList.remove('open'); track('drop-go'); location.href = SHORTCUT_URL; };
  if (navigator.clipboard) navigator.clipboard.writeText(c).then(go, go); else go();
});
var dropBusy = false;
function dropPull() {
  var on = false; try { on = !!localStorage.getItem(LSG + 'dropOn'); } catch (e) {}
  if (!on || !srvOn() || !me || dropBusy) return; dropBusy = true;
  mbCall({ a: 'pick', c: dropCode() }).then(function (res) {
    var L = (res && res.items) || []; if (!L.length) return;
    track('drop-in');
    if (L.length === 1) { incoming = L[0]; shareIn(); } else L.forEach(function (u) { postAll(u, ''); });
  }).catch(function () {}).then(function () { dropBusy = false; });
}
document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(dropPull, 300); });
setTimeout(dropPull, 2500);
$('gdX').addEventListener('click', function () { $('gd').classList.remove('open'); setTimeout(function () { if (packAuto()) return; var seen = 1; try { seen = localStorage.getItem(LSG + 'demo'); } catch (e) {} if (!seen && !navigator.webdriver) demoOpen(); }, 500); });
// ▶ demo animata: 4 passi su una situazione di prova, nessun file video (pesa niente e si traduce da sola)
var demoI = 0, demoT = null;
function DT(x) { return window.LX_T ? LX_T(x) : x; }
function demoWho() { var o = (names || []).filter(function (n) { return n && me && n !== me.name; })[0]; return o || 'Giulia'; }
function demoBuild() {
  var W = demoWho(), S = $('demoS'); S.textContent = '';
  var sc = [
    ['<div class="dvid"><i>' + W + '</i></div><div class="dbub" style="top:66%"><b>' + W + '</b> ' + DT('ti ha mandato un Reel') + '<br>“' + DT('ci andiamo? 🌊') + '”</div><div class="dtap" style="left:80%;top:88%"></div>', DT('1. Arriva un Reel'), DT('Chi è nel tuo cerchio ti manda un posto, una ricetta o una cosa da comprare.')],
    ['<div class="dvid" style="height:46%"><i>' + W + '</i></div><div class="dbub" style="top:50%"><b>✨ Gemini</b><br>' + DT('Positano, Costiera Amalfitana. Hotel da circa €180 a notte, volo di 2h30.') + '<div class="row"><span>🏨 ' + DT('Hotel') + '</span><span>✈️ ' + DT('Voli') + '</span><span>🎟️ ' + DT('Gita in barca') + '</span></div></div><div class="dtap" style="left:18%;top:75%"></div>', DT('2. Tocchi ✨'), DT('Gemini ti dice cos’è, quanto costa più o meno e dove prenotarlo o comprarlo.')],
    ['<div class="dbub" style="top:22%;text-align:center"><div style="font-size:40px">💘</div><b style="font-size:18px">' + DT('Positano a giugno?') + '</b><br><span style="color:var(--m)">' + W + ' ' + DT('ha detto sì. E tu?') + '</span><div class="row" style="justify-content:center"><span>' + DT('Passo') + '</span><span class="yes">' + DT('Sì!') + '</span></div></div><div class="dtap" style="left:59%;top:58%"></div>', DT('3. Decidete insieme'), DT('Un tocco a testa, sì o passo: se piace a tutti, si fa.')],
    ['<div class="dbub" style="top:20%;text-align:center"><div style="font-size:40px">🎉</div><b style="font-size:20px">' + DT('Siete d’accordo!') + '</b><br><span style="color:var(--m)">Positano · 14–17 ' + DT('giugno') + '</span><div class="row" style="justify-content:center;flex-direction:column"><span class="yes">📅 ' + DT('Aggiungi al calendario') + '</span><span>🏨 ' + DT('Prenota l’hotel') + '</span></div></div>', DT('4. È fatta'), DT('La data va nel calendario e prenoti con un tocco. E se guardate un video insieme, ⏸ lo ferma per tutti.')]
  ];
  sc.forEach(function (x, i) { var d = el('div', 'dsc'); d.innerHTML = x[0]; d.dataset.t = x[1]; d.dataset.p = x[2]; S.appendChild(d); });
  var D = $('demoD'); D.textContent = ''; sc.forEach(function () { D.appendChild(el('i')); });
}
function demoShow(i) {
  clearTimeout(demoT); var all = $('demoS').children; if (i >= all.length) { demoClose(true); return; }
  demoI = i; [].forEach.call(all, function (d, j) { d.classList.toggle('on', j === i); });
  [].forEach.call($('demoD').children, function (d, j) { d.className = j < i ? 'done' : j === i ? 'on' : ''; });
  $('demoT').textContent = all[i].dataset.t; $('demoP').textContent = all[i].dataset.p;
  $('demoN').textContent = i === all.length - 1 ? DT('Ho capito, iniziamo') : DT('Avanti');
  demoT = setTimeout(function () { demoShow(i + 1); }, 6500);
}
function demoOpen() { lsSet(LSG + 'demo', '1'); track('demo'); demoBuild(); $('demoM').classList.add('open'); demoShow(0); }
function demoClose() { clearTimeout(demoT); $('demoM').classList.remove('open'); }
$('demoN').addEventListener('click', function () { demoShow(demoI + 1); });
$('demoX').addEventListener('click', demoClose);
$('demoS').addEventListener('click', function () { demoShow(demoI + 1); });
$('demoGo').addEventListener('click', demoOpen);
$('gdDemo').addEventListener('click', function () { $('gd').classList.remove('open'); demoOpen(); });

$('ru').addEventListener('input', function () { $('rc').hidden = !$('ru').value.trim(); });
$('ru').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('add').click(); });
if (/^https:\/\//.test(SUPPORT_URL)) { $('supA').href = SUPPORT_URL; $('supC').hidden = false; }
startStats(); tcount(); svyCheck();
checkDev(get('dev', '')).then(function (ok) { isDev = ok; applyDev(); });
// un nuovo invito dello stesso creatore: il cerchio che ho già si ricollega con il codice nuovo (ripara pass non più riconosciuti)
function markRejoin(cid, jid) {
  try { var P = lsOf(cid), m = JSON.parse(localStorage.getItem(P + 'me') || 'null'), c = String(jid).split('_')[1] || '';
    if (m && m.role !== 'host' && c) { m.code = c; m.rejoin = Date.now(); localStorage.setItem(P + 'me', JSON.stringify(m)); if (cid === REG.active && me && me.hostId === m.hostId) { me.code = c; me.rejoin = m.rejoin; } } } catch (e) {}
}
function circleOfHost(h) {
  for (var i = 0; i < REG.list.length; i++) { try { var m = JSON.parse(localStorage.getItem(lsOf(REG.list[i].id) + 'me')); if (m && m.hostId === h) return REG.list[i].id; } catch (e) {} }
  return null;
}
if (joinId) {
  var jh = joinId.split('_')[0], have = circleOfHost(jh);
  if (have) markRejoin(have, joinId);
  if (have && have !== REG.active) { REG.active = have; regSet(REG); history.replaceState(null, '', location.pathname); safeReload(); }
  else if (have) { joinId = null; history.replaceState(null, '', location.pathname); }
  else if (me) { var nid = 2; while (REG.list.some(function (x) { return x.id === 'c' + nid; })) nid++; REG.list.push({ id: 'c' + nid, label: 'Nuovo' }); REG.prev = REG.active; REG.active = 'c' + nid; regSet(REG); safeReload(); }
}
if (me && !joinId) begin();
else {
  if (joinId) {
    var invBy = ''; try { invBy = clean(decodeURIComponent((/[#&]n=([^&]{1,120})/.exec(location.hash) || [])[1] || ''), 30); } catch (e) {}
    $('setup').classList.add('inv');
    var hh = document.querySelector('#setup .hero h1'), hp = document.querySelector('#setup .hero p');
    if (hh) hh.textContent = invBy ? '💌 ' + invBy + (window.LX_T || String)(' ti ha invitato') : (window.LX_T || String)('💌 Ti hanno invitato su Reelta');
    if (hp) hp.textContent = 'Un posto privato solo per voi: Reel, piani e messaggi.';
    $('sT').textContent = 'Ti hanno invitato'; $('kindBox').hidden = true; $('haveInv').hidden = true; $('sP').textContent = 'Scrivi il tuo nome e tocca il bottone: entri subito nel cerchio.'; $('go').textContent = 'Entra nel cerchio'; $('ic').hidden = true;
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    var andr = /android/i.test(navigator.userAgent);
    if ((/iphone|ipad|ipod/i.test(navigator.userAgent) || andr) && !standalone) {
      $('ios').hidden = true; $('instQ').hidden = false; $('instQ').onclick = function () { $('inst').hidden = false; $('instQ').hidden = true; };
      if (andr) $('instA').innerHTML = '<b>📲 Hai già Reelta tra le app o sulla Home?</b> I link si aprono nel browser, che è una copia separata: se entri da qui, nell’app non ti ritrovi. Entra dall’app:';
      $('instC').onclick = function () {
        var t = location.origin + location.pathname + '#j=' + joinId;
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { $('instC').textContent = 'Copiato ✓'; $((andr ? 'instTA' : 'instT')).hidden = false; }, function () { $('sH').textContent = 'Copia questo invito a mano: ' + t; });
      };
    }
  }
  if (REG.list.length > 1) { $('sCancel').hidden = false; if (!joinId) $('sT').textContent = 'Nuovo cerchio'; }
  if (REG.after === 'invite' && REG.nm) { $('nm').value = REG.nm; $('sT').textContent = 'Nuovo gruppo'; }
  syncKind(); showPane('setup');
}
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
  // l'app si apre subito dalla memoria del telefono; quando c'è una versione nuova si aggiorna da sola
  var swHad = !!navigator.serviceWorker.controller, swT0 = Date.now(), swDone = false;
  navigator.serviceWorker.register('sw.js').then(function (reg) {
    document.addEventListener('visibilitychange', function () { if (!document.hidden) reg.update().catch(function () {}); });
  }).catch(function () {});
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!swHad || swDone) return; swDone = true;
    var busy = document.querySelector('.mod.open') || /^(INPUT|TEXTAREA)$/.test((document.activeElement || {}).tagName || '') || $('pl').classList.contains('show');
    if (Date.now() - swT0 < 12000 && !busy) { location.reload(); return; }
    var n = $('mh'); if (n) { n.textContent = '⬆️ C’è una versione nuova di Reelta: tocca qui per aggiornare.'; n.style.cursor = 'pointer'; n.onclick = function () { location.reload(); }; }
  });
}
// 🔞 Reelta propone bar e cocktail: è per maggiorenni. Una sola domanda, la prima volta su questo telefono.
function ageGate() {
  var ok = 0; try { ok = localStorage.getItem(LSG + 'age18'); } catch (e) { ok = 1; } if (ok) return;
  var G = el('div'); G.id = 'ageG'; G.setAttribute('role', 'dialog'); G.setAttribute('aria-modal', 'true');
  var C = el('div', 'card'); C.appendChild(el('div', 'agee', '🥂')); C.appendChild(el('h2', null, LXT('Reelta è per maggiorenni')));
  C.appendChild(el('p', null, LXT('Dentro trovi anche idee per uscire con bar e cocktail. Confermi di avere almeno 18 anni?')));
  var y = el('button', 'btn wide', LXT('Sì, ho 18 anni o più')), n = el('button', 'btn-o wide', LXT('No, ho meno di 18 anni')); y.type = n.type = 'button'; n.style.marginTop = '8px';
  y.onclick = function () { lsSet(LSG + 'age18', String(Date.now())); G.remove(); track('eta-ok'); };
  n.onclick = function () { C.textContent = ''; C.appendChild(el('div', 'agee', '👋')); C.appendChild(el('h2', null, LXT('Ci vediamo più avanti'))); C.appendChild(el('p', null, LXT('Reelta è solo per chi ha almeno 18 anni.'))); track('eta-no'); };
  C.appendChild(y); C.appendChild(n);
  var tl = document.createElement('a'); tl.href = 'termini.html'; tl.target = '_blank'; tl.rel = 'noopener'; tl.textContent = LXT('Condizioni d’uso'); tl.className = 'agel'; C.appendChild(tl);
  G.appendChild(C); document.body.appendChild(G);
}
ageGate();
