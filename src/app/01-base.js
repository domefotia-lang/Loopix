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
var GLOBALK = { big: 1, pin: 1, theme: 1, dev: 1, riserv: 1, rcpt: 1, bkAt: 1, bkFirst: 1, nt: 1, regaliS: 1 };
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
