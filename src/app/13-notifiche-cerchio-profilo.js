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
function goReel(id) {
  showPane('main'); var nd = nodes[id];
  if (!nd && fview === 'all') { var L = feed.filter(function (r) { return !isMuted(r.n); }), i = L.map(function (r) { return r.id; }).indexOf(id); if (i >= 0 && L.length - i > feedWin) { feedWin = Math.ceil((L.length - i) / FEED_STEP) * FEED_STEP; render(); nd = nodes[id]; } }
  if (nd) nd.el.scrollIntoView({ behavior: 'smooth' });
}
function ideaFocus() { var w = $('iFoc'); if (!w) { w = aiFocusRow(function (t, img) { aiPlan(t, img); }); w.id = 'iFoc'; var R = $('iAiR'); R.parentNode.insertBefore(w, R.nextSibling); } w.hidden = !(ideaRid && srvOn()); }
function openIdea(rid, opts) {
  ideaRid = rid || ''; $('ip').value = ''; $('io').value = ''; $('iH').textContent = ''; $('idm').classList.remove('note'); $('inote').onclick = function () { $('idm').classList.add('note'); $('io').focus(); };
  var g = $('ikg'); if (!g.children.length) { Object.keys(KINDS).forEach(function (k) { var b = el('button', null, KINDS[k]); b.type = 'button'; b.dataset.k = k; b.setAttribute('role', 'radio'); b.onclick = function () { var re = aiLast && aiLast.k !== k && ideaRid && srvOn() && !$('iAi').classList.contains('busy'); setKind(k); if (re) { $('ip').value = ''; $('io').value = ''; aiPlan(); } }; g.appendChild(b); }); var mo = el('button', 'ikmore', '＋ ' + LXT('Altro')); mo.type = 'button'; mo.onclick = function () { g.classList.add('all'); }; g.appendChild(mo); }
  var r0 = rid && find(rid), prev = rid && !(opts && opts.again) ? ideas.filter(function (i) { return i.r === rid; }).slice(-1)[0] : null, k0 = (prev && prev.k) || guessKind(r0 && r0.c) || 'viaggio'; setKind(k0);
  // tre scelte in vista (posto, mangiare, fare); le altre con «＋ Altro», o già aperte se l'idea è di quel tipo
  g.classList.toggle('all', ['viaggio', 'cibo', 'esperienza'].indexOf(k0) < 0);
  if (!(opts && opts.again)) aiLast = null; $('iok2').hidden = !r0;
  $('iAi').hidden = !(r0 && srvOn()); $('iAi').disabled = false; $('iAi').classList.remove('busy'); $('iAi').querySelector('b').textContent = aiLast ? '✨ Un’altra idea dal video' : '✨ Riconosci dal video'; $('iAi').querySelector('span').textContent = aiLast ? 'Oppure scegli prima un tipo: es. ✈️ per il viaggio' : 'L’AI compila il piano per te'; $('iAiR').hidden = true; $('iQ').textContent = r0 && srvOn() ? 'Oppure scegli tu:' : 'Cosa vi ha colpito?';
  if (!get('ptip', 0)) put('ptip', 1); document.querySelectorAll('.r-btn.plan.tip').forEach(function (b) { b.classList.remove('tip'); });
  $('idT').textContent = rid ? 'Trasforma in piano' : 'Nuovo piano';
  var auto = !!(r0 && srvOn()) && !(opts && opts.again) && !prev;
  if (prev) $('iH').textContent = '✓ ' + LXT('Da questo Reel hai già il piano') + ' «' + prev.p + '» (' + (window.LX_T ? LX_T(KINDS[prev.k] || '') : KINDS[prev.k] || '') + '). ' + LXT('Puoi farne un altro qui sotto.');
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
    (names.length ? names : [me.name]).forEach(function (n, i) { row(n + (n === me.name ? ' (' + LXT('tu') + ')' : i === 0 ? ' (' + LXT('ha creato il cerchio') + ')' : ''), live, null); });
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

