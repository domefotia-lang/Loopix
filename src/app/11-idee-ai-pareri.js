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
    if (sure) { setKind(x.k); if (x.p) $('ip').value = x.p; if (x.o) { $('io').value = x.o; $('idm').classList.add('note'); } aiLast = { k: x.k, p: clean(x.p || '', 60), q: clean(x.shop || '', 60), done: avoid.concat(x.p ? [x.p] : []) }; lb.textContent = '✨ Un’altra idea dal video'; b.querySelector('span').textContent = 'Non è questo? L’AI ne propone una diversa'; }
    else { lb.textContent = '✨ Riprova'; $('idm').classList.remove('auto'); $('ikS').hidden = true; }
    out.textContent = (x.sum ? '✨ ' + x.sum : '') + (sure ? '' : ' Scegli tu qui sotto: ci metti un attimo.'); out.hidden = !out.textContent;
    if (sure && x.p && x.k !== 'altro') { var lk = el('div', 'ailinks'); linksFor({ k: x.k, p: clean(x.p, 60), q: aiLast.q }).forEach(function (L) { var a = el('a', 'chip', L.t); a.href = L.u; a.target = '_blank'; a.rel = 'noopener'; lk.appendChild(a); }); out.appendChild(lk); }
    ideaSug();
  }, function (e) { b.hidden = false; $('idm').classList.remove('auto'); $('ikS').hidden = true; b.disabled = false; b.classList.remove('busy'); lb.textContent = '✨ Riconosci dal video'; out.textContent = e && e.message === 'limite' ? 'Per oggi l’AI ha finito i suggerimenti: domani si ricarica. Intanto scegli tu qui sotto.' : 'Non sono riuscito a capirlo dal video: scegli tu qui sotto.'; out.hidden = false; });
}
