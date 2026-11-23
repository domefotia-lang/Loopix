/* © 2026 Reelta. Tutti i diritti riservati. File generato da tools/build.py: modifica src/vault.js */
(function () { var f = document.getElementById('lxFonts'); if (f) f.media = 'all'; })();
/* ---- Cassaforte: con il PIN attivo, i dati di Reelta sono salvati cifrati.
   Una chiave dati casuale cifra tutto; la chiave dati è chiusa due volte: con il PIN e (se attivo) con Face ID / impronta. ---- */
// parte dopo l'archivio (store.js), così legge e scrive passando da lì
(window.LX_STORE_READY || Promise.resolve()).then(function () {
  var VK = 'loopixvault', LS = window.localStorage, P = Storage.prototype;
  var oGet = P.getItem, oSet = P.setItem, oDel = P.removeItem;
  var mem = null, dk = null, dkRaw = null, wraps = null, timer = null;
  function isV(k) { return typeof k === 'string' && (k.indexOf('loopix3:') === 0 || k === 'loopixreg'); }
  function enc(t) { return new TextEncoder().encode(t); }
  function b64e(a) { var s = ''; a = new Uint8Array(a); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function b64d(t) { var b = atob(t), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function rnd(n) { return crypto.getRandomValues(new Uint8Array(n)); }
  function pinKey(pin, salt) {
    return crypto.subtle.importKey('raw', enc(pin), 'PBKDF2', false, ['deriveKey']).then(function (k) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 310000, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function aesKey(raw) { return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']); }
  function wrapWith(kek) { var iv = rnd(12); return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, kek, dkRaw).then(function (c) { return { iv: b64e(iv), c: b64e(c) }; }); }
  function unwrapWith(kek, w) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(w.iv) }, kek, b64d(w.c)); }
  function setDK(raw) { dkRaw = new Uint8Array(raw); return aesKey(dkRaw).then(function (k) { dk = k; }); }
  function patch() {
    P.getItem = function (k) { if (mem && this === LS && isV(k)) return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; return oGet.apply(this, arguments); };
    P.setItem = function (k, v) { if (mem && this === LS && isV(k)) { mem[k] = String(v); later(); return; } return oSet.apply(this, arguments); };
    P.removeItem = function (k) { if (mem && this === LS && isV(k)) { delete mem[k]; later(); return; } return oDel.apply(this, arguments); };
  }
  function unpatch() { P.getItem = oGet; P.setItem = oSet; P.removeItem = oDel; }
  function flush() {
    clearTimeout(timer); if (!mem || !dk) return Promise.resolve();
    var iv = rnd(12);
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, dk, enc(JSON.stringify(mem))).then(function (c) {
      oSet.call(LS, VK, JSON.stringify({ v: 2, w: wraps, iv: b64e(iv), data: b64e(c) }));
    });
  }
  function later() { clearTimeout(timer); timer = setTimeout(flush, 250); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
  window.addEventListener('pagehide', flush);
  function plainKeys() { var out = []; for (var i = 0; i < LS.length; i++) { var k = LS.key(i); if (isV(k)) out.push(k); } return out; }
  function openData(box) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(box.iv) }, dk, b64d(box.data)).then(function (pt) { mem = JSON.parse(new TextDecoder().decode(pt)); patch(); }); }
  // ---- Face ID / impronta (passkey con estensione PRF) ----
  function bioSupported() {
    if (!window.PublicKeyCredential || !navigator.credentials || !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) return Promise.resolve(false);
    return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(function () { return false; });
  }
  function prfGet(idB64, saltB64) {
    return navigator.credentials.get({ publicKey: {
      challenge: rnd(32), timeout: 60000, userVerification: 'required',
      allowCredentials: [{ type: 'public-key', id: b64d(idB64), transports: ['internal', 'hybrid'] }],
      extensions: { prf: { eval: { first: b64d(saltB64) } } }
    } }).then(function (cred) {
      var r = cred && cred.getClientExtensionResults && cred.getClientExtensionResults();
      var out = r && r.prf && r.prf.results && r.prf.results.first;
      if (!out) throw new Error('noprf');
      return aesKey(new Uint8Array(out).slice(0, 32));
    });
  }
  window.lxVault = {
    on: function () { return !!oGet.call(LS, VK); },
    enable: function (pin) {
      var salt = rnd(16), raw = rnd(32);
      return setDK(raw).then(function () { return pinKey(pin, salt); }).then(wrapWith).then(function (w) {
        wraps = { p: { s: b64e(salt), iv: w.iv, c: w.c } };
        var m = {}; plainKeys().forEach(function (x) { m[x] = oGet.call(LS, x); }); mem = m; patch();
        return flush().then(function () { Object.keys(m).forEach(function (x) { oDel.call(LS, x); }); });
      });
    },
    rekey: function (pin) {
      var salt = rnd(16);
      return pinKey(pin, salt).then(wrapWith).then(function (w) { wraps.p = { s: b64e(salt), iv: w.iv, c: w.c }; return flush(); });
    },
    disable: function () {
      if (!mem) return Promise.resolve(); var m = mem; mem = null; dk = null; dkRaw = null; wraps = null; unpatch();
      Object.keys(m).forEach(function (x) { oSet.call(LS, x, m[x]); }); oDel.call(LS, VK); return Promise.resolve();
    },
    destroy: function () { mem = null; dk = null; dkRaw = null; wraps = null; unpatch(); plainKeys().forEach(function (x) { oDel.call(LS, x); }); oDel.call(LS, VK); },
    flush: flush,
    bioSupported: bioSupported,
    bioOn: function () { return !!(wraps && wraps.b); },
    bioEnable: function (label) {
      if (!dkRaw) return Promise.reject(new Error('nopin'));
      var salt = rnd(32);
      return navigator.credentials.create({ publicKey: {
        rp: { name: 'Reelta' }, challenge: rnd(32), timeout: 60000,
        user: { id: rnd(16), name: 'loopix-' + (label || 'utente'), displayName: 'Reelta · ' + (label || 'utente') },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'preferred', userVerification: 'required' },
        extensions: { prf: { eval: { first: salt } } }
      } }).then(function (cred) {
        var r = cred.getClientExtensionResults ? cred.getClientExtensionResults() : {};
        if (!r.prf || r.prf.enabled === false) throw new Error('noprf');
        var id = b64e(cred.rawId), first = r.prf.results && r.prf.results.first;
        var keyP = first ? aesKey(new Uint8Array(first).slice(0, 32)) : prfGet(id, b64e(salt));
        return keyP.then(wrapWith).then(function (w) { wraps.b = { id: id, s: b64e(salt), iv: w.iv, c: w.c }; return flush(); });
      });
    },
    bioDisable: function () { if (wraps) delete wraps.b; return flush(); },
    bioCheck: function () { // per lo sblocco al ritorno nell'app: verifica il volto/impronta aprendo davvero la chiave
      if (!wraps || !wraps.b) return Promise.reject(new Error('off'));
      return prfGet(wraps.b.id, wraps.b.s).then(function (k) { return unwrapWith(k, wraps.b); }).then(function () { return true; });
    }
  };
  function runMain() { var sc = document.createElement('script'); sc.src = 'app.js?v183'; sc.async = false; document.body.appendChild(sc); }
  var raw = oGet.call(LS, VK);
  if (!raw) { runMain(); return; }
  var box; try { box = JSON.parse(raw); } catch (e) { box = null; }
  var lk = document.getElementById('lock'), inp = document.getElementById('lockIn'), go = document.getElementById('lockGo'), hint = document.getElementById('lockH'), forgot = document.getElementById('lockF'), bioB = document.getElementById('lockBio');
  lk.classList.add('open');
  var hasBio = !!(box && box.v === 2 && box.w && box.w.b);
  bioB.hidden = !hasBio;
  if (!hasBio) setTimeout(function () { inp.focus(); }, 60);
  function opened() {
    go.onclick = null; inp.onkeydown = null; forgot.onclick = null; bioB.onclick = null; go.disabled = false;
    inp.value = ''; hint.textContent = ''; lk.classList.remove('open'); window.__lxBootUnlocked = true; runMain();
  }
  function attempt() {
    var pin = inp.value; if (!pin) { hint.textContent = 'Inserisci il PIN.'; return; }
    hint.textContent = 'Apro…'; go.disabled = true;
    var p;
    if (box.v === 2) {
      wraps = box.w;
      p = pinKey(pin, b64d(wraps.p.s)).then(function (k) { return unwrapWith(k, wraps.p); }).then(setDK).then(function () { return openData(box); });
    } else { // vecchio formato: il PIN cifrava direttamente i dati → passo al nuovo formato
      p = pinKey(pin, b64d(box.salt)).then(function (k) {
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(box.iv) }, k, b64d(box.data)).then(function (pt) {
          mem = JSON.parse(new TextDecoder().decode(pt)); patch();
          var salt = rnd(16); return setDK(rnd(32)).then(function () { return pinKey(pin, salt); }).then(wrapWith).then(function (w) { wraps = { p: { s: b64e(salt), iv: w.iv, c: w.c } }; return flush(); });
        });
      });
    }
    p.then(opened).catch(function () { mem = null; unpatch(); go.disabled = false; inp.value = ''; hint.textContent = 'PIN errato.'; });
  }
  function bio() {
    hint.textContent = '';
    wraps = box.w;
    prfGet(wraps.b.id, wraps.b.s).then(function (k) { return unwrapWith(k, wraps.b); }).then(setDK).then(function () { return openData(box); })
      .then(opened).catch(function () { hint.textContent = 'Non riconosciuto. Riprova o usa il PIN.'; setTimeout(function () { inp.focus(); }, 60); });
  }
  go.onclick = attempt; inp.onkeydown = function (e) { if (e.key === 'Enter') attempt(); };
  bioB.onclick = bio;
  forgot.onclick = function () {
    if (!window.confirm('Senza PIN i dati di Reelta su questo telefono non si possono aprire. Vuoi cancellarli e ripartire? (Se hai una copia di sicurezza, potrai ripristinarla.)')) return;
    window.lxVault.destroy(); location.reload();
  };
  if (!box) { hint.textContent = 'Dati danneggiati.'; }
});
