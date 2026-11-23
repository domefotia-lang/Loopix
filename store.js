/* © 2026 Reelta. Tutti i diritti riservati. File generato da tools/build.py: modifica src/store.js */
/* ---- 🗄️ archivio dei dati: localStorage + copia in IndexedDB ----
   Prima tutto stava solo nel localStorage (circa 5 MB, poi le scritture falliscono in silenzio).
   Ora ogni dato di Reelta viene scritto anche in IndexedDB, che ha molto più spazio:
   - se il localStorage è pieno, il dato resta in memoria + IndexedDB e l'app continua a funzionare;
   - se il localStorage perde i dati ma IndexedDB li ha ancora, all'avvio vengono ripresi da lì.
   L'app continua a usare localStorage come prima: questo file si mette "sotto", senza cambiarla.
   Prima di caricare la cassaforte e l'app si aspetta che l'archivio sia pronto (al massimo 2 secondi). */
(function () {
  var P = Storage.prototype, LS;
  try { LS = window.localStorage; } catch (e) { window.LX_STORE_READY = Promise.resolve(); return; }
  var oGet = P.getItem, oSet = P.setItem, oDel = P.removeItem, oKey = P.key;
  var oLen = Object.getOwnPropertyDescriptor(P, 'length');
  var DEL = 'reelta-del'; // chiavi cancellate ma non ancora cancellate in IndexedDB (così non "risorgono")
  function isM(k) { return typeof k === 'string' && (k.indexOf('loopix3:') === 0 || k === 'loopixreg' || k === 'loopixvault'); }
  var over = {}, nOver = 0;   // dati che il localStorage non ha accettato (pieno)
  var q = {}, qT = null, db = null, late = false;
  function lsLen() { return oLen.get.call(LS); }
  function lsKeys() { var o = []; for (var i = 0; i < lsLen(); i++) { var k = oKey.call(LS, i); if (isM(k)) o.push(k); } return o; }
  function dels() { try { return JSON.parse(oGet.call(LS, DEL) || '[]'); } catch (e) { return []; } }
  function setDels(a) { try { if (a.length) oSet.call(LS, DEL, JSON.stringify(a.slice(-500))); else oDel.call(LS, DEL); } catch (e) {} }
  function tx(mode) { return db.transaction('kv', mode).objectStore('kv'); }
  function flush() {
    clearTimeout(qT); qT = null; if (!db) return;
    var keys = Object.keys(q); if (!keys.length) return;
    var batch = q; q = {};
    try {
      var t = db.transaction('kv', 'readwrite'), s = t.objectStore('kv');
      keys.forEach(function (k) { if (batch[k] === null) s.delete(k); else s.put(batch[k], k); });
      t.oncomplete = function () { var d = dels(), n = d.filter(function (k) { return !(k in batch) || batch[k] !== null; }); if (n.length !== d.length) setDels(n); };
      t.onerror = t.onabort = function () { keys.forEach(function (k) { if (!(k in q)) q[k] = batch[k]; }); };
    } catch (e) { keys.forEach(function (k) { if (!(k in q)) q[k] = batch[k]; }); }
  }
  function later(k, v) { q[k] = v; if (!qT) qT = setTimeout(flush, 300); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
  window.addEventListener('pagehide', flush);
  function patch() {
    P.getItem = function (k) { if (this === LS && isM(k) && Object.prototype.hasOwnProperty.call(over, k)) return over[k]; return oGet.apply(this, arguments); };
    P.setItem = function (k, v) {
      if (this !== LS || !isM(k)) return oSet.apply(this, arguments);
      v = String(v); later(k, v);
      try { oSet.call(LS, k, v); if (Object.prototype.hasOwnProperty.call(over, k)) { delete over[k]; nOver--; } }
      catch (e) { try { oDel.call(LS, k); } catch (x) {} if (!Object.prototype.hasOwnProperty.call(over, k)) nOver++; over[k] = v; }
    };
    P.removeItem = function (k) {
      if (this !== LS || !isM(k)) return oDel.apply(this, arguments);
      if (Object.prototype.hasOwnProperty.call(over, k)) { delete over[k]; nOver--; }
      var d = dels(); if (d.indexOf(k) < 0) { d.push(k); setDels(d); }
      later(k, null); return oDel.call(LS, k);
    };
    P.key = function (i) { if (this !== LS) return oKey.apply(this, arguments); var n = lsLen(); return i < n ? oKey.call(LS, i) : (Object.keys(over)[i - n] || null); };
    Object.defineProperty(P, 'length', { configurable: true, enumerable: true, get: function () { return this === LS ? lsLen() + nOver : oLen.get.call(this); } });
  }
  function open() {
    return new Promise(function (ok, ko) {
      var r = indexedDB.open('reelta-data' + (window.LX_IDBNS ? '-' + window.LX_IDBNS : ''), 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onsuccess = function () { ok(r.result); }; r.onerror = r.onblocked = function () { ko(r.error); };
    });
  }
  function readAll() {
    return new Promise(function (ok, ko) {
      var out = {}, c = tx('readonly').openCursor();
      c.onsuccess = function () { var x = c.result; if (!x) return ok(out); out[x.key] = x.value; x.continue(); };
      c.onerror = function () { ko(c.error); };
    });
  }
  var start = (window.indexedDB ? open() : Promise.reject(new Error('noidb'))).then(function (d) {
    db = d; db.onversionchange = function () { db.close(); db = null; };
    return readAll();
  }).then(function (all) {
    if (late) { try { db.close(); } catch (e) {} db = null; throw new Error('late'); } // l'app è già partita senza: non cambio le regole a metà
    var d = dels(), gone = {}; d.forEach(function (k) { gone[k] = 1; later(k, null); });
    var back = 0;
    Object.keys(all).forEach(function (k) {
      if (!isM(k) || gone[k]) return;
      var v = oGet.call(LS, k);
      if (v === null) { try { oSet.call(LS, k, all[k]); } catch (e) { over[k] = all[k]; nOver++; } back++; }
    });
    lsKeys().forEach(function (k) { var v = oGet.call(LS, k); if (all[k] !== v) later(k, v); }); // il localStorage è il più fresco: lo copio in IndexedDB
    patch(); flush();
    window.LX_STORE = { idb: true, restored: back, overflow: function () { return nOver; }, flush: flush };
    if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(function (p) { if (!p) return navigator.storage.persist(); }).catch(function () {});
  }).catch(function () { window.LX_STORE = { idb: false, restored: 0, overflow: function () { return 0; }, flush: function () {} }; });
  // non aspettare per sempre: se IndexedDB non risponde, l'app parte lo stesso (solo localStorage, come prima)
  window.LX_STORE_READY = Promise.race([start, new Promise(function (ok) { setTimeout(function () { late = !window.LX_STORE; ok(); }, 2000); })]);
})();
