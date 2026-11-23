/* © 2026 Reelta. Tutti i diritti riservati. File generato da tools/build.py: modifica src/boot.js */
window.__qback=/[?&]q=back\b/.test(location.search);window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__bip=e;try{document.dispatchEvent(new Event("lx-bip"))}catch(x){}});window.addEventListener("appinstalled",function(){window.__bip=null;window.__inst=1;try{document.dispatchEvent(new Event("lx-bip"))}catch(x){}});
/* ---- trasloco a un nuovo indirizzo (senza perdere niente) ----
   Il vecchio indirizzo impacchetta tutti i dati del telefono, li cifra con una chiave nuova e li lascia
   sul server per pochi minuti; il nuovo indirizzo li scarica, li decifra e il server li cancella.
   La chiave viaggia solo nel link (dopo il #), mai al server. */
(function () {
  var NEW_HOME = 'https://joinreelta.github.io/'; // nuovo indirizzo di Reelta
  var SB = 'https://rvtxhsasngpqtojntpcn.supabase.co', SK = 'sb_publishable_gJzeHncdMVaGN2wvUAoTBA_TtnFhpC2';
  window.MIG_HOME = NEW_HOME;
  var T = function (x) { return (window.LX_T || String)(x); };
  function call(b) { return fetch(SB + '/functions/v1/relay', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SK }, body: JSON.stringify(b) }).then(function (r) { return r.json(); }); }
  function e64(u) { var s = ''; for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function d64(t) { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var b = atob(t), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function card(html) {
    var go = function () { var d = document.getElementById('migC'); if (!d) { d = document.createElement('div'); d.id = 'migC'; d.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(20,14,10,.92);font-family:system-ui,-apple-system,sans-serif'; d.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-migx]')) d.remove(); }); document.body.appendChild(d); }
      d.innerHTML = '<div style="max-width:380px;width:100%;background:#2a201a;color:#f3e7d6;border-radius:22px;padding:22px;line-height:1.5;font-size:15px">' + html + '</div>'; return d; };
    return document.body ? go() : (document.addEventListener('DOMContentLoaded', go), null);
  }
  var B = 'display:block;width:100%;margin-top:10px;padding:14px;border-radius:999px;font:inherit;font-weight:800;font-size:16px;border:0;cursor:pointer;';
  var BTN = B + 'background:linear-gradient(120deg,#d08a5c,#b3683f);color:#fff', BTN2 = B + 'background:transparent;color:#f3e7d6;border:1px solid rgba(243,231,214,.3)';

  // NUOVO indirizzo: arriva un trasloco
  var mm = /#mig=([a-f0-9]{32})\.([\w-]{20,64})\.([\w-]{10,24})/.exec(location.hash);
  if (mm) {
    history.replaceState(null, '', location.pathname);
    card('<h2 style="margin:0 0 8px">📦 ' + T('Trasloco in corso…') + '</h2><p style="margin:0">' + T('Sto portando qui i tuoi cerchi, i Reel e i messaggi.') + '</p>');
    call({ a: 'dl', id: mm[1] }).then(function (r) {
      if (!r || !r.url) throw new Error('gone');
      return fetch(r.url).then(function (x) { if (!x.ok) throw new Error('gone'); return x.arrayBuffer(); });
    }).then(function (ct) {
      return crypto.subtle.importKey('raw', d64(mm[2]), 'AES-GCM', false, ['decrypt']).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: d64(mm[3]) }, k, ct); });
    }).then(function (pt) {
      var pack = JSON.parse(new TextDecoder().decode(pt)); if (!pack || pack.v !== 1 || !pack.ls) throw new Error('bad');
      var hasMe = false; for (var i = 0; i < localStorage.length; i++) { var kk = localStorage.key(i) || ''; if (/^loopix3:(.*:)?me$/.test(kk) && localStorage.getItem(kk) && localStorage.getItem(kk) !== 'null') hasMe = true; }
      if (hasMe && !confirm(T('Su questo telefono Reelta ha già dei cerchi. Vuoi sostituirli con quelli del trasloco?'))) return;
      Object.keys(pack.ls).forEach(function (k) { try { localStorage.setItem(k, pack.ls[k]); } catch (e) {} });
      try { localStorage.setItem('reelta-mig-ok', String(Date.now())); } catch (e) {}
      call({ a: 'got', id: mm[1] }).catch(function () {});
      location.replace(location.pathname);
    }).catch(function () {
      card('<h2 style="margin:0 0 8px">' + T('Trasloco non riuscito') + '</h2><p style="margin:0 0 6px">' + T('Il pacchetto non è più disponibile o la connessione è caduta. Torna al vecchio indirizzo e tocca di nuovo “Trasloca adesso”.') + '</p><button style="' + BTN2 + '" data-migx="1">' + T('Chiudi') + '</button>');
    });
    return;
  }
  // copia negli appunti anche quando il testo arriva dopo (iPhone vuole la copia dentro il tocco)
  function copyP(pr) {
    var plain = function () { return pr.then(function (t) { return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return false; }); }, function () { return false; }); };
    try { if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) return navigator.clipboard.write([new ClipboardItem({ 'text/plain': pr.then(function (t) { return new Blob([t], { type: 'text/plain' }); }) })]).then(function () { return true; }, plain); } catch (e) {}
    try { return plain(); } catch (e) { return Promise.resolve(false); }
  }
  var IOS = /iphone|ipad|ipod/i.test(navigator.userAgent), HOME = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  // iPhone: l'icona sulla Home ha una memoria sua, separata da Safari. Dopo il trasloco in Safari, porto i dati anche nell'icona.
  function lastStep() {
    card('<h2 style="margin:0 0 8px">📲 ' + T('Ultimo passo: porta tutto nell’icona') + '</h2><p style="margin:0 0 6px">' + T('Su iPhone l’icona della Home non vede i dati di Safari. Fai così:') + '</p><ol style="margin:0;padding-left:20px"><li>' + T('Tocca “Copia il pacchetto” qui sotto.') + '</li><li>' + T('Se non l’hai già fatto: Condividi → “Aggiungi alla schermata Home”.') + '</li><li>' + T('Apri l’icona Reelta e tocca “📋 Incolla l’invito che hai ricevuto”: ritrovi tutto.') + '</li></ol>' +
      '<button id="migCp" style="' + BTN + '">📋 ' + T('Copia il pacchetto') + '</button><input id="migLk" readonly hidden style="width:100%;box-sizing:border-box;margin-top:10px;padding:10px;border-radius:12px;border:1px solid rgba(243,231,214,.3);background:#1c1511;color:#f3e7d6;font-size:13px"><button id="migOk" style="' + BTN2 + '">' + T('Fatto, vedo tutto nell’icona') + '</button><button id="migL2" style="' + BTN2 + '">' + T('Più tardi') + '</button><p id="migH2" style="margin:10px 0 0;font-size:13px;opacity:.85"></p>');
    var c = document.getElementById('migC'); if (!c) return setTimeout(lastStep, 300);
    document.getElementById('migL2').onclick = function () { c.remove(); };
    document.getElementById('migOk').onclick = function () { try { localStorage.setItem('reelta-hs-done', '1'); } catch (e) {} c.remove(); };
    document.getElementById('migCp').onclick = function () {
      var b = this, h = document.getElementById('migH2'), lk = document.getElementById('migLk'); b.disabled = true; b.textContent = '📦 ' + T('Impacchetto…');
      var pr = pack(location.origin + location.pathname);
      copyP(pr).then(function (ok) {
        pr.then(function (link) { lk.value = link; lk.hidden = false; try { localStorage.setItem('reelta-mig-link', link); } catch (e) {} b.disabled = false; b.textContent = ok ? '✓ ' + T('Copiato') : '📋 ' + T('Copia il pacchetto');
          h.textContent = ok ? T('Ora apri l’icona Reelta e tocca “📋 Incolla l’invito che hai ricevuto”. Se non va: tieni premuto nel campo “Hai un invito?” → Incolla. Il pacchetto vale 14 giorni.') : T('Non riesco a copiarlo da solo: tieni premuto il link qui sopra → Copia.');
          if (!ok) { lk.focus(); lk.select(); } });
      });
      pr.catch(function () { b.disabled = false; b.textContent = '📋 ' + T('Riprova'); h.textContent = T('Non è partito: controlla la connessione e riprova.'); });
    };
  }
  try {
    var NEWH = NEW_HOME && (location.origin + location.pathname).indexOf(NEW_HOME) === 0;
    if (NEWH && IOS && !HOME && localStorage.getItem('reelta-mig-ok') && localStorage.getItem('loopixreg') && !localStorage.getItem('reelta-hs-done') && !sessionStorage.getItem('reelta-hs-later')) { sessionStorage.setItem('reelta-hs-later', '1'); setTimeout(lastStep, 600); }
    else if (localStorage.getItem('reelta-mig-ok') && !sessionStorage.getItem('reelta-mig-shown')) { sessionStorage.setItem('reelta-mig-shown', '1'); var ok = +localStorage.getItem('reelta-mig-ok'); if (Date.now() - ok < 6e5) setTimeout(function () { card('<h2 style="margin:0 0 8px">✓ ' + T('Trasloco completato') + '</h2><p style="margin:0">' + T('Ci sono tutti i tuoi cerchi. Se usi Reelta dalla Home, aggiungi questa nuova versione alla Home e cancella la vecchia icona.') + '</p><button style="' + BTN + '" data-migx="1">' + T('Perfetto') + '</button>'); }, 600); }
  } catch (e) {}

  function pack(home0) {
    var ls = {}; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); ls[k] = localStorage.getItem(k); }
    var data = new TextEncoder().encode(JSON.stringify({ v: 1, ts: Date.now(), ls: ls })), iv = crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']).then(function (key) {
      return Promise.all([crypto.subtle.exportKey('raw', key), crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, data)]);
    }).then(function (r) {
      var ct = new Blob([r[1]]);
      return call({ a: 'up', sz: ct.size, n: 3 }).then(function (up) {
        if (!up || !up.id || !up.url) throw new Error('up');
        return fetch(up.url, { method: 'PUT', body: ct, headers: { 'Content-Type': 'application/octet-stream' } }).then(function (x) { if (!x.ok) throw new Error('put'); return (home0 || NEW_HOME) + '#mig=' + up.id + '.' + e64(new Uint8Array(r[0])) + '.' + e64(iv); });
      });
    });
  }
  window.__migPack = pack;
  // VECCHIO indirizzo: porta le persone nella nuova casa
  if (!NEW_HOME || (location.origin + location.pathname).indexOf(NEW_HOME) === 0 || location.protocol.indexOf('http') !== 0 || /^(localhost|127\.)/.test(location.hostname)) return;
  var hasData = !!localStorage.getItem('loopixreg');
  if (!hasData) { location.replace(NEW_HOME + location.search + location.hash); return; }
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent), home = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  function ask() {
    if (sessionStorage.getItem('reelta-mig-later')) return;
    card('<h2 style="margin:0 0 8px">🏡 ' + T('Reelta ha una nuova casa') + '</h2><p style="margin:0 0 4px">' + T('Nuovo indirizzo, più semplice e senza nomi personali. Porto tutto io: cerchi, Reel, piani e messaggi. Ci vogliono 10 secondi.') + '</p><p style="margin:0;opacity:.75;font-size:13px">' + T('Le foto e i video fissati 📌 restano qui: salvali nel telefono se ti servono.') + '</p>' + '<p style="margin:8px 0 0;font-size:13.5px;font-weight:700;color:#f0b48a">⚠️ ' + T('Non cancellare questa icona finché non vedi i tuoi cerchi nella nuova.') + '</p>' +
      '<button id="migGo" style="' + BTN + '">📦 ' + T('Trasloca adesso') + '</button><button id="migL" style="' + BTN2 + '">' + T('Più tardi') + '</button><p id="migH" style="margin:10px 0 0;font-size:13px;opacity:.85"></p>');
    var c = document.getElementById('migC'); if (!c) return setTimeout(ask, 300);
    document.getElementById('migL').onclick = function () { sessionStorage.setItem('reelta-mig-later', '1'); c.remove(); };
    document.getElementById('migGo').onclick = function () {
      var b = this; b.disabled = true; b.textContent = '📦 ' + T('Impacchetto…');
      var pr = pack(); copyP(pr);
      pr.then(function (link) {
        try { localStorage.setItem('reelta-mig-link', link); } catch (e) {}
        if (ios && home) {
          // NON si apre la nuova casa da qui: su iPhone il link si aprirebbe in una finestrella con una memoria sua, e i dati andrebbero persi lì.
          card('<h2 style="margin:0 0 8px">📦 ' + T('Pacchetto pronto') + '</h2><ol style="margin:0;padding-left:20px"><li>' + T('Tocca “Copia il pacchetto” qui sotto.') + '</li><li>' + T('Apri l’app Safari e scrivi:') + ' <b>' + NEW_HOME.replace(/^https:\/\/|\/$/g, '') + '</b></li><li>' + T('In Safari: Condividi → “Aggiungi alla schermata Home”.') + '</li><li>' + T('Apri la nuova icona e tocca “📋 Incolla l’invito che hai ricevuto”: ritrovi tutto.') + '</li><li>' + T('Quando vedi i tuoi cerchi nella nuova icona, cancella questa vecchia.') + '</li></ol>' +
            '<button id="migCp2" style="' + BTN + '">📋 ' + T('Copia il pacchetto') + '</button><input id="migLk2" readonly style="width:100%;box-sizing:border-box;margin-top:10px;padding:10px;border-radius:12px;border:1px solid rgba(243,231,214,.3);background:#1c1511;color:#f3e7d6;font-size:13px"><p id="migH3" style="margin:8px 0 0;font-size:13px;opacity:.85">' + T('Se “Incolla” non va: tieni premuto il link qui sopra → Seleziona tutto → Copia.') + '</p><p style="margin:8px 0 0;font-size:13px;font-weight:700">' + T('Copiato? Ora esci da qui (torna alla schermata Home) e apri Safari.') + '</p><button style="' + BTN2 + '" data-migx="1">' + T('Chiudi') + '</button>');
          var lk2 = document.getElementById('migLk2'); if (lk2) lk2.value = link;
          var cp2 = document.getElementById('migCp2'); if (cp2) cp2.onclick = function () { var bb = this; copyP(Promise.resolve(link)).then(function (ok) { bb.textContent = ok ? '✓ ' + T('Copiato') : '📋 ' + T('Copia il pacchetto'); if (!ok) { lk2.focus(); lk2.select(); } }); };
        } else location.href = link;
      }).catch(function () { b.disabled = false; b.textContent = '📦 ' + T('Riprova'); document.getElementById('migH').textContent = T('Non è partito: controlla la connessione e riprova.'); });
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(ask, 400); }); else setTimeout(ask, 400);
})();
/* iPhone (app sulla Home): con la barra di stato trasparente iOS calcola l'altezza
   senza la barra in alto e lascia un vuoto in fondo. Usiamo l'altezza vera dello schermo. */
(function () {
  function fit() {
    // in Safari normale la barra di stato è fuori dalla pagina (margine sicuro in alto = 0); nell'app sulla Home è dentro (circa 50-60 punti)
    var pr = document.getElementById('saProbe'); if (!pr && document.body) { pr = document.createElement('div'); pr.id = 'saProbe'; pr.style.cssText = 'position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none'; document.body.appendChild(pr); }
    var top0 = pr ? pr.offsetHeight : 0;
    var sa = window.navigator.standalone === true || top0 > 20 || (window.matchMedia && matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches);
    var ios = sa && /iphone|ipod/i.test(navigator.userAgent), h = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);
    if (ios) { var port = window.matchMedia('(orientation: portrait)').matches; h = port ? Math.max(screen.height, screen.width) : Math.min(screen.height, screen.width); }
    var vv = window.visualViewport, a = document.activeElement;
    if (vv && a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && vv.height < h - 120) { h = Math.round(vv.height + (ios ? 0 : 0)); window.scrollTo(0, 0); } // tastiera aperta: l'app sta sopra la tastiera
    document.documentElement.style.setProperty('--apph', h + 'px');
  }
  fit(); document.addEventListener('DOMContentLoaded', fit); ['resize', 'orientationchange', 'pageshow'].forEach(function (e) { window.addEventListener(e, function () { fit(); setTimeout(fit, 300); }); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  document.addEventListener('focusout', function () { setTimeout(fit, 120); });
})();
