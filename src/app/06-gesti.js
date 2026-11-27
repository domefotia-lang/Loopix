/* ---- gesti, come nelle app social ----
   ← → cambia pagina · doppio tocco = ❤️ · tieni premuto un Reel = menu · tira giù il feed = aggiorna
   nel lettore: ← → Reel dopo / prima, ↓ chiude. (Sopra il video i tocchi vanno al video stesso.) */
var TABS = ['xpl', 'main', 'ideas', 'chat'];
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
  rf.onclick = function () { dwClose(); $('refGo').click(); }; if (feed.length >= 3) P.appendChild(rf); // consigliarla ha senso dopo averla usata un po'
  var pp = el('button', 'it'); pp.type = 'button'; pp.appendChild(el('span', null, '👥')); pp.appendChild(document.createTextNode('Persone e inviti')); pp.onclick = function () { dwGo('circle'); }; var sp = el('div', 'sec'); sp.appendChild(pp); P.appendChild(sp);
  function sec(t, rows) {
    rows = rows.filter(function (r) { return r[5] !== 0; }); if (!rows.length) return; // le voci vuote non si mostrano
    var s = el('div', 'sec'); s.appendChild(el('h4', null, t));
    rows.forEach(function (r) { var b = el('button', 'it'); b.type = 'button'; b.appendChild(el('span', null, r[0])); b.appendChild(document.createTextNode(r[1])); if (r[3]) { var e = el('em', r[4] ? 'hot' : null, String(r[3])); b.appendChild(e); } b.onclick = r[2]; s.appendChild(b); });
    P.appendChild(s);
  }
  if (srvOn()) { var isp = el('button', 'it'); isp.type = 'button'; isp.appendChild(el('span', null, '✨')); isp.appendChild(document.createTextNode('Idee per uscire e video più visti')); isp.onclick = function () { dwClose(); inspOpen(); }; var si = el('div', 'sec'); si.appendChild(isp); P.appendChild(si); }
  if (typeof dropOk === 'function' && dropOk()) { var db2 = el('button', 'it'); db2.type = 'button'; db2.appendChild(el('span', null, '📲')); db2.appendChild(document.createTextNode('Condividi da Instagram → Reelta')); db2.onclick = function () { dwClose(); dropOpen(); }; var sd = el('div', 'sec'); sd.appendChild(db2); P.appendChild(sd); }
  if (typeof inBrowser !== 'undefined' && inBrowser && !window.__inst) { var ib2 = el('button', 'it'); ib2.type = 'button'; ib2.appendChild(el('span', null, '📲')); ib2.appendChild(document.createTextNode('Installa Reelta sulla Home')); ib2.onclick = function () { dwClose(); instGo(); }; var sx = el('div', 'sec'); sx.appendChild(ib2); P.appendChild(sx); }
  sec('I tuoi contenuti', [
    ['⭐', 'Reel tenuti', function () { dwGo('main', null, function () { fview = 'keep'; render(); }); }, n.keep, 0, n.keep ? 1 : 0],
    ['📌', 'Messaggi fissati', function () { dwGo('chat', null, pinOpen); }, n.pin, 0, n.pin ? 1 : 0],
    ['💘', 'Piani da decidere', function () { dwGo('ideas', null, n.dec ? decOpen : null); }, n.dec, 1, n.dec ? 1 : 0]
  ]);
  sec('Impostazioni', [
    ['🔔', 'Notifiche', function () { dwGo('style', 'ntC'); }],
    ['💾', 'Copia di sicurezza', function () { dwGo('style', 'bkC'); }],
    ['🔒', 'Privacy e PIN', function () { dwGo('style', 'rsC'); }],
    ['⚙️', 'Tutte le impostazioni', function () { dwGo('style'); }]
  ]);
  sec('Reelta', [
    ['⭐', 'Reelta Plus · in arrivo', function () { dwClose(); plusAsk(); }],
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
// cestino: un tocco toglie il Reel dal mio telefono (con «Annulla»); se è mio posso anche eliminarlo per tutti
function reelTrash(r) {
  if (r.n === me.name || me.role === 'host') return sheet('🗑 ' + LXT('Togliere questo Reel?'), '', [
    { t: '🙈 ' + LXT('Solo dal mio telefono'), f: function () { trashHide(r); } },
    { t: '🗑 Elimina per tutti', red: true, f: function () { delReel(r.id); } }
  ]);
  trashHide(r);
}
function trashHide(r) {
  var i = feed.indexOf(r), k = !!keeps[r.id]; hideReel(r.id); track('cestino');
  var old = document.querySelector('.undob'); if (old) old.remove();
  var u = el('div', 'undob'); u.setAttribute('role', 'status'); u.appendChild(el('span', null, LXT('Tolto dal tuo telefono.')));
  var b = el('button', null, LXT('Annulla')); b.type = 'button';
  b.onclick = function () { u.remove(); rhid = rhid.filter(function (x) { return x !== r.id; }); put('rhid', rhid); if (!find(r.id)) { feed.splice(Math.max(0, Math.min(i, feed.length)), 0, r); put('feed', feed); } if (k) { keeps[r.id] = keeps[r.id] || 1; put('keep', keeps); } render(); track('cestino-annulla'); $('mh').textContent = LXT('Rimesso.'); };
  u.appendChild(b); document.body.appendChild(u); setTimeout(function () { u.remove(); }, 6000);
}
function reelMenu(r) {
  var opts = [
    { t: keeps[r.id] ? '⭐ Non tenere più' : '⭐ Tieni questo Reel', f: function () { keepToggle(r.id); } },
    { t: '✨ Trasforma in piano', f: function () { openIdea(r.id); } },
    { t: '🎁 ' + LXT('Nella lista regali'), f: function () { giftAdd({ t: r.c || '', r: r.id }); } },
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
    if (item && gestOk(tg) && (!tg.closest('button,a') || tg.closest('.mtap'))) lp = setTimeout(function () { if (moved) return; var r = find(item.dataset.id); if (r) { try { navigator.vibrate && navigator.vibrate(15); } catch (x) {} reelMenu(r); tg = null; } }, 550);
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
    // sul Reel nel feed: verso sinistra = ✨ Piano; sopra i video niente cambio di scheda per sbaglio
    var fit = pane === 'main' && t.closest && t.closest('#feed .item'), onv = fit && t.closest('.mph,.mwrap,.mtap,.igcrop');
    if (onv && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8 && dt < 700) { if (dx < 0 && find(fit.dataset.id)) { track('swipe-piano'); openIdea(fit.dataset.id); } return; }
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
var seenIds = null; setTimeout(function () { seenIds = {}; try { feed.forEach(function (r) { seenIds[r.id] = 1; }); } catch (e) {} }, 0);
function build(r) {
  var d = el('div', 'item'), nd = { el: d, open: false }; d.dataset.id = r.id;
  if (seenIds && !seenIds[r.id] && Date.now() - (+r.ts || 0) < 120000) d.classList.add('fresh'); if (seenIds) seenIds[r.id] = 1; // appena arrivato: entra con un'animazione
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
  // mentre scrivi una risposta il Reel si fa da parte (come i commenti di Instagram): restano nome, pulsanti, risposte e il campo, subito sopra la tastiera
  var it = function () { return nd.cp.parentNode; };
  var show = function () { if (document.activeElement !== inp) return; nd.list.scrollTop = nd.list.scrollHeight; var d0 = it(), fd = d0 && d0.parentNode; if (fd) fd.scrollTop += d0.getBoundingClientRect().top - fd.getBoundingClientRect().top; };
  inp.onfocus = function () { var d0 = it(); if (d0) d0.classList.add('typing'); document.body.classList.add('ctyp'); [0, 120, 350, 700].forEach(function (t) { setTimeout(show, t); }); if (window.visualViewport) visualViewport.addEventListener('resize', show); };
  inp.onblur = function () { if (window.visualViewport) visualViewport.removeEventListener('resize', show); setTimeout(function () { if (document.activeElement === inp) return; var d0 = it(); if (d0) { d0.classList.remove('typing'); var fd = d0.parentNode; if (fd) fd.scrollTop += d0.getBoundingClientRect().top - fd.getBoundingClientRect().top; } document.body.classList.remove('ctyp'); }, 150); };
  go.addEventListener('pointerdown', function (e) { e.preventDefault(); }); // toccare «Invia» non chiude la tastiera
  row.appendChild(inp); row.appendChild(go); nd.cp.appendChild(row); d.appendChild(nd.cp);
  nodes[r.id] = nd; refresh(r); return d;
}
// ✨ la scheda automatica: appena l'AI ha letto il video, sotto compare cosa è, dove, quanto costa e il tasto per andarci
var AIC_IC = { cibo: 'pin', esperienza: 'ticket', viaggio: 'pin', compra: 'share', ricetta: 'spark' };
function aiCard(r, nd) {
  // il piano salvato da voi vince sulla proposta dell'AI (se l'avete cambiato da «ricetta» a «compra», la scheda segue la vostra scelta)
  var pl = typeof ideas !== 'undefined' ? ideas.filter(function (i) { return i.r === r.id && i.p; }).slice(-1)[0] : null;
  var x = pl ? { k: pl.k, p: pl.p, o: pl.o, shop: pl.q || '' } : r.aiX, c = nd.ac; if (!c) return;
  if (!x || !x.p || x.k === 'altro' || x.ask) { c.hidden = true; return; }
  if (c.dataset.k === x.k + x.p + (x.o || '')) { c.hidden = false; return; } c.dataset.k = x.k + x.p + (x.o || ''); c.textContent = ''; c.hidden = false;
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
  if (nd.kb) { var kp = !!keeps[r.id]; nd.kb.hidden = !kp; nd.kb.textContent = ''; nd.kb.appendChild(icoEl('mark')); nd.kb.className = 'keepb' + (kp ? ' on' : ''); nd.kb.setAttribute('aria-label', kp ? 'Tenuto: tocca per non tenerlo più' : 'Tieni questo Reel'); nd.kb.title = kp ? 'Tenuto' : 'Tieni'; }
  nd.bar.textContent = '';
  // reazioni in un solo tasto: un tocco = ❤️, tenuto premuto = 😂 😮 🔥
  var xs = r.x || {}, tot = Object.keys(xs).length, mineE = xs[me.name];
  var kinds = EMO.filter(function (e) { return Object.keys(xs).some(function (k) { return xs[k] === e; }); });
  // icone tutte a linea, stesso stile della barra in basso; il colore solo quando hai già fatto l'azione
  var hb = el('button', 'r-btn rx ic' + (mineE ? ' mine' : ''));
  if (mineE && mineE !== '❤️') hb.appendChild(el('span', 'rxe', mineE)); else { var hi = icoEl('heart'); if (mineE) hi.classList.add('fill'); hb.appendChild(hi); }
  var others = kinds.filter(function (e) { return e !== mineE && e !== '❤️'; }); if (others.length) hb.appendChild(el('span', 'rxo', others.slice(0, 2).join('')));
  if (tot) hb.appendChild(el('span', 'cnt', String(tot)));
  hb.setAttribute('aria-label', (mineE ? LXT('Hai reagito') + ' ' + mineE : LXT('Metti ❤️')) + '. ' + LXT('Tieni premuto per altre reazioni'));
  rxPress(hb, r); nd.bar.appendChild(hb);
  var nk0 = (r.k || []).length, cb = el('button', 'r-btn ic'); cb.appendChild(icoEl('chat')); if (nk0) cb.appendChild(el('span', 'cnt', String(nk0))); cb.setAttribute('aria-label', LXT('Risposte') + (nk0 ? ': ' + nk0 : ''));
  cb.onclick = function () { nd.open = !nd.open; nd.cp.hidden = !nd.open; if (nd.open) { nd.list.scrollTop = nd.list.scrollHeight; nd.cp.scrollIntoView({ block: 'nearest' }); } }; nd.bar.appendChild(cb);
  var kp0 = !!keeps[r.id], sb0 = el('button', 'r-btn ic' + (kp0 ? ' mine' : '')); var mi = icoEl('mark'); if (kp0) mi.classList.add('fill'); sb0.appendChild(mi); sb0.setAttribute('aria-label', kp0 ? 'Tenuto: tocca per non tenerlo più' : 'Tieni questo Reel'); sb0.setAttribute('aria-pressed', String(kp0)); sb0.onclick = function () { keepToggle(r.id); }; nd.bar.appendChild(sb0);
  var mb = el('button', 'r-btn ic'); mb.appendChild(icoEl('dots')); mb.setAttribute('aria-label', 'Altro: di cosa parla, tieni, elimina…'); mb.onclick = function () { reelMenu(r); }; nd.bar.appendChild(mb);
  var tb = el('button', 'r-btn ic trash'); tb.appendChild(icoEl('trash')); tb.setAttribute('aria-label', 'Cestino: togli questo Reel'); tb.onclick = function () { reelTrash(r); }; nd.bar.appendChild(tb);
  var has = ideas.some(function (i) { return i.r === r.id; });
  var tip = !has && !get('ptip', 0) && !document.querySelector('.r-btn.plan.tip');
  var ib = el('button', 'r-btn plan' + (tip ? ' tip' : '')); ib.appendChild(icoEl(has ? 'check' : 'spark')); ib.appendChild(document.createTextNode(LXT('Piano'))); if (tip) setTimeout(function () { put('ptip', 1); }, 6000); ib.setAttribute('aria-label', has ? 'Piano salvato' : 'Trasforma in piano'); ib.onclick = function () { openIdea(r.id); }; nd.bar.appendChild(ib);
  nd.list.textContent = '';
  (r.k || []).forEach(function (c) { var l = el('div', 'cmt'); l.appendChild(el('b', null, c.n)); l.appendChild(document.createTextNode(' ' + c.t)); nd.list.appendChild(l); });
  if (nd.open) nd.list.scrollTop = nd.list.scrollHeight; // l'ultimo messaggio resta in vista
  if (seq && seq.cur === r.id) pbuild(r);
  if (party && party.id === r.id) { pbuild(r); lines(r); }
}
var compOpen = false;
function syncComp() { $('mbox').hidden = !compOpen; }
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
  // con tanti Reel si disegnano solo gli ultimi (il telefono resta veloce); quelli prima arrivano con un tocco
  var L = feed.filter(function (r) { return !isMuted(r.n); }), more = L.length - feedWin;
  if (more > 0) { box.appendChild(olderBtn(more, 'Reel', function () { feedWin += FEED_STEP; render(); })); L = L.slice(-feedWin); }
  L.forEach(function (r) { box.appendChild(build(r)); });
  if (!keepPos) box.scrollTop = box.scrollHeight;
}
var FEED_STEP = 60, feedWin = FEED_STEP, keepPos = false;
// «Mostra i precedenti»: disegna un blocco in più in cima senza far saltare lo schermo
function olderBtn(n, what, go) {
  var b = el('button', 'btn-o wide older', LXT('↑ Mostra i precedenti') + ' (' + n + ')'); b.type = 'button';
  b.onclick = function () { var box = b.parentNode, h0 = box.scrollHeight, t0 = box.scrollTop; keepPos = true; try { go(); } finally { keepPos = false; } box.scrollTop = box.scrollHeight - h0 + t0; track('precedenti-' + what); };
  return b;
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
  else { if (Date.now() - n.ts < 3 * 864e5) actLog('reel', n.n, n.c, n.id); noteIn('reel', n.n, n.c); if (node.offsetTop > box.scrollTop + box.clientHeight * 0.6 && !(typeof newCount === 'function' && newCount() >= 2)) { unseen++; $('nw').textContent = unseen + (unseen === 1 ? ' Reel nuovo' : ' Reel nuovi') + ' ↓'; $('nw').hidden = false; } }
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
