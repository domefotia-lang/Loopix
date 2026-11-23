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
