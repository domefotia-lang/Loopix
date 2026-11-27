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
  // si apre su 🔍 Cerca, tranne quando ci sono Reel nuovi da vedere insieme
  if (!navigator.webdriver && !window.LX_NOSTART && srvOn() && !newCount()) showPane('xpl');
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
  try { if (!postAll(await navigator.clipboard.readText(), '')) { compOpen = true; syncComp(); } }
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
$('ix').addEventListener('click', function () { $('ios').hidden = true; try { sessionStorage.setItem('lx-banner', '1'); } catch (e) {} renderSteps(); });
$('haveInv').addEventListener('click', async function () {
  icOpen = true; syncKind();
  var t = '';
  try { t = await navigator.clipboard.readText(); } catch (e) { if (!e || e.name !== 'NotAllowedError') try { errAuto('incolla: lettura negata ' + (e && e.name), 'haveInv'); } catch (x) {} /* «Non consentire» è una scelta della persona, non un errore */ $('sH').textContent = 'Il telefono non mi lascia leggere: tieni premuto nel campo qui sotto e scegli “Incolla”.'; await ask('Incolla a mano', 'Il telefono non mi lascia leggere gli appunti. Tieni premuto nel campo «Hai un invito? Incolla qui il link» e scegli «Incolla».', 'Ok'); $('ic').scrollIntoView({ block: 'center' }); $('ic').focus(); return; }
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
$('devN').addEventListener('click', function () {
  ask('📊 Il numero che conta', 'Guarda in quest\'ordine (ultimi 7 giorni):\n\n1. cerca → quante ricerche\n2. cerca-video / insp-video → hanno guardato i video\n3. cerca-azione-compra / -prenota / -mappa → hanno toccato il pulsante (qui nascono i soldi)\n4. cerca-salva, cerca-confronto-manda → tornano o decidono in due\n5. attivo-settimana → tornano ogni settimana\n\nSe si perdono tra 1 e 2 i video non convincono; tra 2 e 3 manca la fiducia o il pulsante giusto.', 'Apri i numeri').then(function (y) { if (y) window.open('https://loopix.goatcounter.com/', '_blank', 'noopener'); });
});
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
  if (navigator.onLine === false) { $('mh').textContent = LXT('Sei offline: quello che mandi parte appena torna la rete.'); return; }
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
(function () { var w = Math.floor((Date.now() / 864e5 + 3) / 7); if (get('attw', 0) !== w && me && me.role) { put('attw', w); track('attivo-settimana'); } })();
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

/* ---- ✨ versione semplice: per chi arriva nuovo (la prova con le prime coppie) si vede solo l'essenziale.
   Reel, piani e idee vicino a voi; «Guardate insieme», Regali e ricerche video restano spenti finché non si sceglie la versione completa. ---- */
function simpleOn() { return lsGet(LSG + 'semplice') === '1'; }
function simpleUI() {
  document.body.classList.toggle('simple', simpleOn());
  var b = $('simpleT'); if (b) b.textContent = simpleOn() ? '✨ ' + LXT('Versione semplice: attiva · passa alla completa') : '✨ ' + LXT('Passa alla versione semplice');
}
(function () {
  if (lsGet(LSG + 'semplice') === null) lsSet(LSG + 'semplice', me && me.name ? '0' : '1'); // chi usa già Reelta resta com'è
  simpleUI();
  $('simpleT').addEventListener('click', function () { lsSet(LSG + 'semplice', simpleOn() ? '0' : '1'); track(simpleOn() ? 'semplice-on' : 'semplice-off'); simpleUI(); });
})();
// ⭐ Reelta Plus non esiste ancora: contiamo solo chi lo vorrebbe (nessun pagamento)
function plusAsk() {
  track('plus-interesse');
  ask('⭐ Reelta Plus', LXT('Stiamo preparando Reelta Plus: idee AI senza limiti, eventi del giorno e altro, per la coppia (un abbonamento per due). Oggi non costa niente e non chiediamo dati: ci serve solo sapere se vi interessa.'), LXT('Mi interessa')).then(function (y) { if (y) { put('plusInt', 1); track('plus-si'); $('mh').textContent = LXT('Grazie! Lo diremo dentro l’app quando sarà pronto.'); } });
}

// 🗓 dalla notifica del venerdì: si apre direttamente «Il piano del weekend» (se c'è qualcosa da scegliere)
function ritFromPush(src) {
  track('rituale-notifica');
  try { if (/[?&]q=rit/.test(location.search)) history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
  setTimeout(function () { if (!me || !me.name) return; if (typeof ritOn === 'function' && ritOn()) ritOpen(); else { showPane('ideas'); } }, 900);
}
if (window.__qrit) ritFromPush('url');
if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.q === 'rit') ritFromPush('sw'); });
