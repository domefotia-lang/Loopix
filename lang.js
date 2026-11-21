/* Reelta: traduzioni (italiano -> inglese, spagnolo). Generato automaticamente. */
(function () {
  var L = {}, FR = []; // il dizionario arriva da lang-dict.js: subito per inglese e spagnolo, in sottofondo per l'italiano (serve solo per gli inviti in altre lingue)
  var RX = [[/^▶  (\d+) nuov[oi] da (.+)$/, '▶  $1 new from $2', '▶  $1 nuevo(s) de $2'], [/^▶  1 nuovo$/, '▶  1 new', '▶  1 nuevo'], [/^▶  (\d+) nuovi$/, '▶  $1 new', '▶  $1 nuevos'],
    [/^💬 1 messaggio$/, '💬 1 message', '💬 1 mensaje'], [/^💬 (\d+) messaggi$/, '💬 $1 messages', '💬 $1 mensajes'], [/^💘 (\d+) da decidere$/, '💘 $1 to decide', '💘 $1 por decidir'],
    [/ · oggi$/, ' · today', ' · hoy'], [/ · domani$/, ' · tomorrow', ' · mañana'],
    [/^•• Duo con /, '•• Duo with ', '•• Dúo con '], [/^∴ Trio con /, '∴ Trio with ', '∴ Trío con '], [/^∷ Gruppo con /, '∷ Group with ', '∷ Grupo con '], [/^•• Duo · ancora nessuno/, '•• Duo · nobody yet', '•• Dúo · nadie aún'], [/^∴ Trio · ancora nessuno/, '∴ Trio · nobody yet', '∴ Trío · nadie aún'], [/^∷ Gruppo · ancora nessuno/, '∷ Group · nobody yet', '∷ Grupo · nadie aún'], [/^Coppia con /, 'Couple with ', 'Pareja con '], [/^Gruppo da 3 con /, 'Group of 3 with ', 'Grupo de 3 con '], [/^Gruppo grande con /, 'Big group with ', 'Grupo grande con '], [/^Coppia · ancora nessuno/, 'Couple · nobody yet', 'Pareja · nadie aún'], [/^Gruppo da 3 · ancora nessuno/, 'Group of 3 · nobody yet', 'Grupo de 3 · nadie aún'], [/^Gruppo grande · ancora nessuno/, 'Big group · nobody yet', 'Grupo grande · nadie aún'], [/(\d+) nuovi\b/g, '$1 new', '$1 nuevos'], [/(\d+) nuovo\b/g, '$1 new', '$1 nuevo'], [/(\d+) di (\d+) post[oi] usati\./g, '$1 of $2 spots used.', '$1 de $2 plazas usadas.'], [/^da ([A-ZÀ-Ú])/, 'by $1', 'de $1'], [/^ha mandato (\d+) Reel$/, 'sent $1 Reels', 'ha enviado $1 Reels'], [/^(\d+) di (\d+)/, '$1 of $2', '$1 de $2']];
  var lang = 'it';
  try { var hl = /[#&?]l=(it|en|es)(?![a-z])/.exec(location.hash + location.search); if (hl && !localStorage.getItem('lxlang')) localStorage.setItem('lxlang', hl[1]); } catch (e) {}
  try { var s = localStorage.getItem('lxlang'); if (s === 'it' || s === 'en' || s === 'es') lang = s; else { var n = String(navigator.language || 'it').slice(0, 2).toLowerCase(); lang = n === 'it' ? 'it' : n === 'es' ? 'es' : 'en'; } } catch (e) {}
  var ix = lang === 'en' ? 0 : lang === 'es' ? 1 : -1;
  window.LX_LANG = lang;
  try { document.documentElement.lang = lang; } catch (e) {}
  function norm(x) { return x.replace(/\s+/g, ' ').trim(); }
  var map = {};
  window.LX_SETD = function (d) { L = d.L; FR = d.FR; map = {}; window.LX_NK = null; window.LX_DOK = 1; if (ix >= 0) Object.keys(L).forEach(function (k) { map[norm(k)] = L[k][ix]; }); };
  if (ix >= 0) { try { document.write('<script src="lang-dict.js"><\/script>'); } catch (e) {} }
  var asked = ix >= 0; window.LX_NEEDD = function () { if (asked) return; asked = true; var sc = document.createElement('script'); sc.src = 'lang-dict.js'; sc.async = true; document.head.appendChild(sc); };
  if (ix < 0) { var lazy = window.LX_NEEDD; if (document.readyState === 'complete') setTimeout(lazy, 4000); else window.addEventListener('load', function () { setTimeout(lazy, 4000); }); }
  function tr(x) {
    if (ix < 0 || typeof x !== 'string' || !x) return x;
    var n = norm(x); if (!n) return x;
    if (Object.prototype.hasOwnProperty.call(map, n)) { var a = x.match(/^\s*/)[0], b = x.match(/\s*$/)[0]; return a + map[n] + b; }
    var out = x;
    for (var i = 0; i < FR.length; i++) { var f = FR[i]; if (out.indexOf(f) >= 0) out = out.split(f).join(L[f][ix]); }
    RX.forEach(function (r) { out = out.replace(r[0], r[1 + ix]); });
    return out;
  }
  window.LX_T = tr;
  // traduce verso una lingua scelta (per esempio l'invito per chi parla un'altra lingua)
  window.LX_TL = function (x, lg) {
    var j = lg === 'en' ? 0 : lg === 'es' ? 1 : -1; if (j < 0 || typeof x !== 'string') return x;
    if (!window.LX_DOK) { try { var q = new XMLHttpRequest(); q.open('GET', 'lang-dict.js', false); q.send(); if (q.status === 200) { var t = q.responseText; window.LX_SETD(JSON.parse(t.slice(t.indexOf('(') + 1, t.lastIndexOf(')')))); } } catch (e) {} } // raro: invito in un'altra lingua prima che il dizionario sia arrivato
    var n = norm(x), NK = window.LX_NK || (window.LX_NK = (function () { var o = {}; Object.keys(L).forEach(function (k) { o[norm(k)] = k; }); return o; })());
    if (Object.prototype.hasOwnProperty.call(NK, n)) return L[NK[n]][j];
    var out = x; for (var i = 0; i < FR.length; i++) { var f = FR[i]; if (out.indexOf(f) >= 0) out = out.split(f).join(L[f][j]); }
    RX.forEach(function (r) { out = out.replace(r[0], r[1 + j]); }); return out;
  };
  if (ix < 0) return;
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION_NO)$/;
  function own(p) { return p && p.closest && (p.matches('.msg, .cm, .cmt, .cmt b, [data-nt]') || p.closest('[data-nt]')); }
  var done = new WeakMap();
  function doText(t) { var p = t.parentElement; if (!p || SKIP.test(p.tagName) || own(p)) return; var v = t.data; if (done.get(t) === v) return; var w = tr(v); done.set(t, w); if (w !== v) t.data = w; }
  var ATTR = ['placeholder', 'aria-label', 'title', 'alt'];
  function doEl(e) {
    if (e.nodeType !== 1 || SKIP.test(e.tagName) && e.tagName !== 'INPUT' && e.tagName !== 'TEXTAREA') return;
    var dm = done.get(e) || {}; ATTR.forEach(function (a) { var v = e.getAttribute(a); if (v && dm[a] !== v) { var t2 = tr(v); dm[a] = t2; if (t2 !== v) e.setAttribute(a, t2); } }); done.set(e, dm);
    if (e.tagName === 'INPUT' && (e.type === 'button' || e.type === 'submit') && e.value) { var n2 = norm(e.value); if (map[n2]) e.value = map[n2]; }
  }
  function walk(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 11) return;
    if (root.nodeType === 1) { doEl(root); if (SKIP.test(root.tagName)) return; }
    var it = document.createTreeWalker(root, 5, null), n;
    while ((n = it.nextNode())) { if (n.nodeType === 3) doText(n); else doEl(n); }
  }
  var oc = window.confirm; window.confirm = function (m) { return oc.call(window, tr(m)); };
  function start() {
    walk(document.body);
    document.title = tr(document.title);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') doEl(m.target);
        else m.addedNodes.forEach(walk);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
document.addEventListener('DOMContentLoaded', function () {
  var sel = document.getElementById('langSel'); if (!sel) return;
  var cur = ''; try { cur = localStorage.getItem('lxlang') || ''; } catch (e) {}
  sel.value = cur;
  sel.addEventListener('change', function () { try { if (sel.value) localStorage.setItem('lxlang', sel.value); else localStorage.removeItem('lxlang'); } catch (e) {} location.reload(); });
});
