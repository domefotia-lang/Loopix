/* ---- consiglia Reelta: l'app a un'altra coppia, che crea il suo cerchio ---- */
// data di arrivo in Reelta: decide quali traguardi valgono per questo telefono (i primi tengono i più facili)
(function () { try { if (!localStorage.getItem(LSG + 'since')) localStorage.setItem(LSG + 'since', String(Date.now())); } catch (e) {} })();
function refCode() {
  try { var c = localStorage.getItem(LSG + 'ref'); if (c && /^R-[A-Z2-9]{6}$/.test(c)) return c;
    var A = 'ABCDEFGHJKMNPQRSTVWXYZ23456789', u = crypto.getRandomValues(new Uint8Array(6)); c = 'R-'; for (var i = 0; i < 6; i++) c += A.charAt(u[i] % A.length);
    localStorage.setItem(LSG + 'ref', c); return c; } catch (e) { return ''; }
}
function recommend() {
  var c = refCode(), url = homeUrl() + (c ? '?r=' + c : '');
  var txt = (window.LX_T || String)('Ti consiglio Reelta: per mandarvi i Reel in due in un posto solo, privato e senza account. Create il vostro cerchio da qui: ') + url;
  track('consiglia');
  if (navigator.share) { navigator.share({ text: txt }).catch(function () {}); return; }
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
}
var KINDS = { viaggio: '✈️ Un posto', compra: '🛍️ Da comprare', cibo: '🍝 Da mangiare', esperienza: '🎟️ Da fare', ricetta: '👨‍🍳 Ricetta', altro: '💡 Idea' };
var KPH = {
  viaggio: ['Dove? (es. Lisbona)', 'Quando? (es. a maggio)'],
  compra: ['Cosa? (es. BMW i7, borsa Zara)', 'Budget o nota (es. max 500 €)'],
  cibo: ['Dove o cosa? (es. Sushi Ko, carbonara)', 'Nota (facoltativa)'],
  esperienza: ['Cosa? (es. concerto, spa, escape room)', 'Quando? (facoltativo)'],
  ricetta: ['Quale piatto? (es. tiramisù)', 'Nota (facoltativa)'],
  altro: ['Cosa? (es. idea regalo)', 'Nota (facoltativa)']
};
var KSUG = { viaggio: 'Sembra un posto: lo mettiamo in ✈️ Un posto?', compra: 'Sembra una cosa da comprare: la mettiamo in 🛍️ Da comprare?', cibo: 'Sembra un posto dove mangiare: lo mettiamo in 🍝 Da mangiare?', esperienza: 'Sembra una cosa da fare: la mettiamo in 🎟️ Da fare?', ricetta: 'Sembra una ricetta: la mettiamo in 👨‍🍳 Ricetta?' };
// riconoscimento leggero, tutto sul telefono: nessun dato esce
var KWORDS = {
  ricetta: 'ricetta|recipe|receta|fatto in casa|fatta in casa|homemade|tiramis|lasagn|biscott|cheesecake|pancake|plumcake|crostata|torta',
  compra: 'bmw|mercedes|audi|porsche|ferrari|lamborghini|tesla|fiat|alfa romeo|maserati|volkswagen|vw|toyota|honda|ford|jeep|land rover|range rover|volvo|kia|hyundai|bentley|rolls|mini cooper|peugeot|renault|citro[eë]n|byd|cupra|seat|skoda|dacia|apple|iphone|ipad|macbook|airpods|samsung|galaxy|xiaomi|sony|playstation|ps5|xbox|nintendo|dyson|ikea|zara|h&m|nike|adidas|puma|new balance|gucci|prada|louis vuitton|chanel|dior|herm[eè]s|rolex|omega|cartier|swatch|ray-?ban|lego|sephora|thermomix|nespresso|de.?longhi|smeg|kitchenaid|uniqlo|gopro|dji|canon|nikon|vespa|ducati|yamaha|kawasaki|harley|moncler|stone island|north face|birkenstock|crocs|converse|vans|armani|versace|fendi|bulgari|pandora|swarovski|tiffany|garmin|bose|jbl|sonos|philips|divano|scarpe|sneakers|borsa|orologio|profumo|giacca|smartphone|macchina|auto|moto|e-?bike|bici|car|shoes|bag|watch|coche|zapatos|bolso',
  cibo: 'ristorante|pizzeria|pizza|sushi|trattoria|osteria|bistrot|brunch|gelat|pasticceria|burger|ramen|restaurant|caf[eéè]|aperitivo|cocktail|steakhouse|kebab|tapas|restaurante|street food',
  esperienza: 'concert|spa|muse|escape|mostra|teatro|cinema|parco|festival|corso|lezione|tour|partita|stadio|show|massaggio|terme|karaoke|bowling|kart|paracadut|immersion|surf|sci|yoga|workshop|crociera',
  viaggio: 'lisbo|porto|madrid|barcel|sivigli|sevill|valencia|parigi|paris|londra|london|londres|roma|rome|milano|milan|napoli|naples|firenze|florence|venezia|venice|torino|bologna|palermo|catania|bari|sicilia|sardegna|puglia|calabria|toscana|amalfi|positano|capri|ischia|cinque terre|dolomiti|como|garda|berlin|amsterdam|praga|prague|vienna|budapest|atene|athens|santorini|mykonos|creta|istanbul|dubai|new york|miami|los angeles|tokyo|kyoto|bali|thailand|bangkok|phuket|maldive|mauritius|zanzibar|marrakech|egitto|sharm|ibiza|mallorca|maiorca|tenerife|canarie|island|norveg|norway|svizzera|switzerland|zermatt|copenaghen|stoccolma|dublin|edimburgo|croazia|dubrovnik|spalato|malta|montenegro|albania|grecia|greece|spagna|spain|portogallo|portugal|francia|france|germania|giappone|japan|messico|mexico|tulum|cancun|caraibi|cuba|brasile|rio|australia|sydney|singapore|hong kong|seoul|corea|vietnam|india|sri lanka|safari|kenya|sudafrica|cape town|spiaggia|beach|playa|isola|isla|montagna|mountain|lago|lake|hotel|resort|weekend'
};
function guessKind(t) {
  t = ' ' + String(t || '').toLowerCase() + ' ';
  var order = ['ricetta', 'compra', 'cibo', 'esperienza', 'viaggio'];
  for (var i = 0; i < order.length; i++) if (new RegExp('[^a-zà-ú](' + KWORDS[order[i]] + ')').test(t)) return order[i];
  return '';
}
function setKind(k) {
  $('ik').value = k;
  if (aiLast && aiLast.k !== k && !$('iAi').classList.contains('busy')) { $('iAi').querySelector('b').textContent = '✨ Cerca ' + KAI[k] + ' nel video'; $('iAi').querySelector('span').textContent = 'L’AI riparte con questo tipo'; }
  else if (aiLast && aiLast.k === k) { $('iAi').querySelector('b').textContent = '✨ Un’altra idea dal video'; $('iAi').querySelector('span').textContent = 'L’AI ne propone una diversa'; }
  $('ikg').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.k === k)); });
  var ks = $('ikS'); ks.textContent = ''; ks.appendChild(document.createTextNode(window.LX_T ? LX_T(KINDS[k]) : KINDS[k])); ks.appendChild(el('small', null, 'Cambia'));
  $('ip').placeholder = KPH[k][0]; $('io').placeholder = KPH[k][1];
  ideaSug();
}
function ideaSug() {
  var g = guessKind($('ip').value), b = $('iSg');
  if (g && g !== $('ik').value && KSUG[g]) { b.textContent = KSUG[g]; b.onclick = function () { setKind(g); $('ip').focus(); }; b.hidden = false; }
  else b.hidden = true;
}
var ideas = get('ideas', []), ifilter = 'tutte', ikind = '', ideaRid = '';
var FEEL = ['❤️', '😊', '😐', 'no'];
function cleanF(f) { var o = {}; if (f && typeof f === 'object') Object.keys(f).slice(0, 8).forEach(function (n) { if (FEEL.indexOf(f[n]) >= 0 && clean(n, 30)) o[clean(n, 30)] = f[n]; }); return o; }
function cleanV(v) { var o = {}; if (v && typeof v === 'object') Object.keys(v).slice(0, 8).forEach(function (n) { if (v[n] && clean(n, 30)) o[clean(n, 30)] = 1; }); return o; }
function normIdea(i, who) {
  if (!i || typeof i.id !== 'string' || i.id.length > 40) return null;
  var p = clean(i.p, 60); if (!p) return null;
  return { id: clean(i.id, 40), r: typeof i.r === 'string' ? clean(i.r, 40) : '', k: KINDS[i.k] ? i.k : 'altro', p: p, o: clean(i.o, 200), n: who || clean(i.n, 30) || 'Ospite', ts: +i.ts || Date.now(), v: cleanV(i.v), f: cleanF(i.f), d: !!i.d, w: /^\d{4}-\d{2}-\d{2}$/.test(i.w || '') ? i.w : '', q: clean(i.q || '', 60), u: /^https:\/\/[^\s<>"]{8,300}$/.test(i.u || '') ? String(i.u) : '', wa: Math.max(0, +i.wa || 0) || undefined, da: Math.max(0, +i.da || 0) || undefined };
}
function findIdea(id) { return ideas.filter(function (x) { return x.id === id; })[0]; }
function ideasChanged(rid) {
  put('ideas', ideas);
  if (tab === 'ideas' && $('ideas').classList.contains('show')) renderIdeas();
  var r = rid && find(rid); if (r) refresh(r);
}
function applyIdea(d, who) {
  if (d.a === 'add') {
    var i = normIdea(d.i, who); if (!i) return null;
    var old = findIdea(i.id);
    if (old) { var was0 = isMatch(old); Object.keys(i.v).forEach(function (n) { old.v[n] = 1; }); if (i.u && !old.u) old.u = i.u; old.f = old.f || {}; Object.keys(i.f || {}).forEach(function (n) { if (!old.f[n]) old.f[n] = i.f[n]; }); if (i.d) old.d = true; if (i.w && !old.w) old.w = i.w; ideasChanged(old.r); if (!was0 && isMatch(old)) matchIn(old); return null; }
    ideas.push(i); if (ideas.length > 200) ideas.shift();
    if (i.n !== me.name && Date.now() - (+i.ts || 0) < 3 * 864e5) actLog('idea', i.n, i.p, i.id);
    if (i.n !== me.name && !(tab === 'ideas' && $('ideas').classList.contains('show'))) { ideaSeen++; ideaTab(); noteIn('idea', i.n, i.p); }
    ideasChanged(i.r); return { t: 'idea', a: 'add', i: i };
  }
  var x = findIdea(d.id); if (!x) return null;
  if (d.a === 'vote') { var n = who || clean(d.n, 30); if (!n) return null; var was = isMatch(x); if (d.on) x.v[n] = 1; else delete x.v[n]; ideasChanged(); if (d.on && n !== me.name) actLog('vote', n, x.p, x.id); if (!was && isMatch(x)) { actLog('match', '', x.p, x.id); matchIn(x); } return { t: 'idea', a: 'vote', id: x.id, on: !!d.on, n: n }; }
  // giorno e «fatto»: vince la modifica più recente, uguale su tutti i telefoni anche se arrivano in ordine diverso (es. due offline)
  var at = Math.min(+d.at || 0, Date.now() + 6e4); if (!at && who === me.name) at = Date.now();
  if (d.a === 'when') { if (at && (+x.wa || 0) > at) return null; who = who || clean(d.n, 30); x.w = /^\d{4}-\d{2}-\d{2}$/.test(d.w || '') ? d.w : ''; if (at) x.wa = at; if (x.w && who && who !== me.name) actLog('when', who, x.p + ' · ' + new Date(x.w + 'T12:00').toLocaleDateString(window.LX_LANG === 'en' ? 'en-GB' : window.LX_LANG === 'es' ? 'es-ES' : 'it-IT', { weekday: 'short', day: 'numeric', month: 'short' }), x.id); ideasChanged(); return { t: 'idea', a: 'when', id: x.id, w: x.w, at: at || undefined, n: who || undefined }; }
  if (d.a === 'done') { if (at && (+x.da || 0) > at) return null; x.d = !!d.on; if (at) x.da = at; ideasChanged(); return { t: 'idea', a: 'done', id: x.id, on: x.d, at: at || undefined }; }
  // «com'è andata?» dopo la data del piano: ognuno risponde con un tocco; «non ci siamo andati» toglie la data, così si può riprogrammare
  if (d.a === 'feel') { var fn = who || clean(d.n, 30), fe = FEEL.indexOf(d.e) >= 0 ? d.e : ''; if (!fn || !fe) return null; x.f = x.f || {}; x.f[fn] = fe; if (fe === 'no') { if (!Object.keys(x.f).some(function (k) { return x.f[k] !== 'no'; })) x.w = ''; } else x.d = true; ideasChanged(); if (fn !== me.name && fe !== 'no') noteIn('idea', fn, x.p + ' ' + fe); return { t: 'idea', a: 'feel', id: x.id, e: fe, n: fn }; }
  if (d.a === 'del') { ideas = ideas.filter(function (y) { return y !== x; }); ideasChanged(x.r); return { t: 'idea', a: 'del', id: x.id }; }
  return null;
}
function ideaAct(m) { var out = applyIdea(m, me.name); if (out) sendEv(out); }
function enc(t) { return encodeURIComponent(t); }
function amzDom() { var g = ((navigator.language || '').split('-')[1] || '').toUpperCase(), l = window.LX_LANG || 'it'; return { GB: 'co.uk', IT: 'it', ES: 'es', DE: 'de', FR: 'fr', US: 'com' }[g] || { it: 'it', es: 'es', en: 'co.uk' }[l] || 'co.uk'; }
function linksFor(i) { var L0 = linksFor0(i); if (i.u) L0.unshift({ t: '📅 ' + LXT('Prenota'), u: i.u }); return L0; }
function linksFor0(i) {
  var G = 'https://www.google.com/search?q=', MAP = 'https://www.google.com/maps/search/?api=1&query=';
  var LW = { it: ['sito ufficiale', 'prezzo'], en: ['official site', 'price'], es: ['sitio oficial', 'precio'] }[window.LX_LANG || 'it'] || ['sito ufficiale', 'prezzo'];
  if (i.k === 'compra') return [{ t: '🌐 Sito ufficiale', u: G + enc(i.p + ' ' + LW[0]) }, { t: '💶 Prezzo', u: G + enc(i.p + ' ' + LW[1]) }, { t: '🛒 Dove comprarlo', u: 'https://www.google.com/search?tbm=shop&q=' + enc(i.p) }, { t: '📦 Amazon', u: 'https://www.amazon.' + amzDom() + '/s?k=' + enc(i.p) + (PARTNER.amazon ? '&tag=' + enc(PARTNER.amazon) : ''), p: !!PARTNER.amazon }, { t: '📍 Vicino a te', u: MAP + enc(i.q || i.p) }];
  if (i.k === 'ricetta') return [{ t: '🔎 La ricetta', u: G + enc('ricetta ' + i.p) }, { t: '▶ Video', u: 'https://www.youtube.com/results?search_query=' + enc('ricetta ' + i.p) }];
  if (i.k === 'cibo' && i.q) return [{ t: '📍 Vicino a te', u: MAP + enc(i.q) }, { t: '📍 Mappa', u: MAP + enc(i.p) }];
  if (i.k === 'altro') return [{ t: '🔎 Cerca', u: G + enc(i.p) }, { t: '📍 Mappa', u: MAP + enc(i.p) }];
  var L = [{ t: '📍 Mappa', u: MAP + enc(i.p) }];
  if (i.k === 'viaggio') L.push({ t: '✈️ Voli', u: 'https://www.google.com/travel/flights?q=' + enc('Flights to ' + i.p) });
  if (i.k === 'viaggio') L.push({ t: '🏨 Hotel', u: 'https://www.booking.com/searchresults.html?ss=' + enc(i.p) + (PARTNER.booking ? '&aid=' + enc(PARTNER.booking) : ''), p: !!PARTNER.booking });
  if (i.k === 'viaggio' || i.k === 'esperienza') L.push({ t: '🎟️ Attività', u: 'https://www.getyourguide.com/s/?q=' + enc(i.p) + (PARTNER.gyg ? '&partner_id=' + enc(PARTNER.gyg) : ''), p: !!PARTNER.gyg });
  if (i.k === 'viaggio') L.push({ t: '🍽️ Ristoranti', u: 'https://www.google.com/maps/search/?api=1&query=' + enc('ristoranti ' + i.p) });
  return L;
}
function renderIdeas() {
  try { dwDot(); } catch (e) {}
  renderNov();
  // due viste sole: i piani da fare (divisi per «a che punto siamo») e quelli fatti
  if (ifilter !== 'fatte') ifilter = 'tutte';
  var nDone = ideas.filter(function (i) { return i.d; }).length, ch = $('ichips'); ch.textContent = '';
  [['tutte', 'Da fare'], ['fatte', '✓ Fatti' + (nDone ? ' · ' + nDone : '')]].forEach(function (f) {
    var b = el('button', 'chip', f[1]); b.setAttribute('aria-pressed', String(ifilter === f[0])); b.onclick = function () { ifilter = f[0]; renderIdeas(); }; ch.appendChild(b);
  });
  ch.hidden = !ideas.length;
  var open0 = ideas.filter(function (i) { return !i.d; }), kc = $('ikf'); if (!kc) { kc = el('div', 'chips'); kc.id = 'ikf'; ch.parentNode.insertBefore(kc, ch.nextSibling); } kc.textContent = '';
  var kinds = Object.keys(KINDS).filter(function (k) { return open0.some(function (i) { return i.k === k; }); });
  if (ifilter === 'fatte' || open0.length < 8 || kinds.length < 2) ikind = '';
  kc.hidden = !(ifilter !== 'fatte' && open0.length >= 8 && kinds.length >= 2);
  if (!kc.hidden) [''].concat(kinds).forEach(function (k) { var b = el('button', 'chip', k ? (window.LX_T ? LX_T(KINDS[k]) : KINDS[k]) : 'Tutti i tipi'); b.setAttribute('aria-pressed', String(ikind === k)); b.onclick = function () { ikind = k; renderIdeas(); }; kc.appendChild(b); });
  var box = $('ilist'); box.textContent = '';
  var todo = toDecide();
  if (todo.length > 1 && ifilter !== 'fatte') { var db0 = el('button', 'aibtn love'); db0.appendChild(el('b', null, '💘 Decidete insieme')); db0.appendChild(el('span', null, todo.length + ' piani aspettano il tuo sì o no')); db0.onclick = decOpen; box.appendChild(db0); }
  var list = ideas.filter(function (i) { return ifilter === 'fatte' ? i.d : !i.d && (!ikind || i.k === ikind); });
  if (!list.length) {
    if (ifilter === 'fatte') box.appendChild(el('div', 'empty', 'Nessun piano fatto ancora.\nQuando lo realizzate, toccate ✓ Fatto.'));
    else box.appendChild(ideaGuide());
    return;
  }
  var sk = get('iskip', {}), today = new Date().toISOString().slice(0, 10), all = circleSize() > 2 ? 'tutti' : 'entrambi';
  // a che punto è un piano: 0 da decidere · 1 da organizzare (lo volete, manca la data) · 2 in programma (c'è la data)
  var stage = function (i) { return i.w ? 2 : isMatch(i) ? 1 : 0; };
  var others = function (i) { var ns = me.role === 'host' ? Object.keys(allowed).map(function (k) { return allowed[k]; }) : (names || []).filter(function (n) { return n !== me.name; }); return ns.filter(function (n) { return !i.v[n]; }); };
  var card = function (i) {
    var c = el('div', 'card idea' + (i.d ? ' done' : '')), stg = stage(i), mine = !!i.v[me.name], voters = Object.keys(i.v);
    if (!i.d && stg >= 1 && isMatch(i)) c.appendChild(el('div', 'match', '💞 Lo volete ' + all));
    c.appendChild(el('div', 'k', (window.LX_T ? LX_T(KINDS[i.k]) : KINDS[i.k]) + ', proposto da ' + i.n));
    c.appendChild(el('h3', null, i.p));
    if (i.o) c.appendChild(el('p', null, i.o));
    if (i.w) c.appendChild(el('div', 'when', '📅 ' + fmtDay(i.w)));
    var fk = Object.keys(i.f || {}).filter(function (n) { return i.f[n] !== 'no'; }); if (fk.length) c.appendChild(el('div', 'when', '💭 ' + fk.map(function (n) { return n + ' ' + i.f[n]; }).join(' · ')));
    // un solo passo avanti, ben visibile: quello che serve adesso
    var go = el('div', 'inext'), btn = function (cls, t, f) { var b = el('button', cls, t); b.type = 'button'; b.onclick = f; go.appendChild(b); return b; };
    if (!i.d && stg === 0 && !mine) {
      if (sk[i.id]) { c.classList.add('passed'); go.appendChild(el('span', 'iwait', 'Hai detto “passo”.')); btn('btn-o', '👍 Ci ripenso', function () { ideaAct({ t: 'idea', a: 'vote', id: i.id, on: true }); }); }
      else { btn('btn go', i.k === 'compra' ? '😍 Mi piace' : '👍 Mi va', function () { ideaAct({ t: 'idea', a: 'vote', id: i.id, on: true }); }); btn('btn-o', 'Passo', function () { var k = get('iskip', {}); k[i.id] = 1; put('iskip', k); renderIdeas(); }); }
    } else if (!i.d && stg === 0) { var ot = others(i); go.appendChild(el('span', 'iwait', circleSize() < 2 ? '👍 A te va. Invita qualcuno per decidere insieme.' : ot.length ? '👍 A te va. ⏳ Manca la risposta di ' + ot.slice(0, 3).join(', ') : '👍 A te va. ⏳ Aspettiamo gli altri')); }
    else if (!i.d && stg === 1) btn('btn go', '📅 Scegliete la data', function () { pickDay(i); });
    else if (!i.d && i.w < today && !(i.f && i.f[me.name])) btn('btn go', '💭 Com’è andata?', function () { fbOpen(i); });
    else if (!i.d) btn('btn go', '🗓️ Metti in calendario', function () { toCal(i); });
    if (go.children.length) c.appendChild(go);
    // sotto: al massimo due link utili (mappa, prezzo…) e ⋯ per tutto il resto
    var acts = el('div', 'acts'), L = linksFor(i); L = L.filter(function (l) { return l.p; }).concat(L.filter(function (l) { return !l.p; }));
    var nv = L.some(function (l) { return l.p; }) ? 3 : 2;
    L.slice(0, nv).forEach(function (l) { var a = el('a', 'r-btn', l.t + (l.p ? ' (partner)' : '')); a.href = l.u; a.target = '_blank'; a.rel = 'noopener noreferrer' + (l.p ? ' sponsored' : ''); acts.appendChild(a); });
    var mb = el('button', 'r-btn', '⋯'); mb.type = 'button'; mb.setAttribute('aria-label', 'Altre azioni per questo piano'); mb.onclick = function () { ideaMenu(i, L.slice(nv)); }; acts.appendChild(mb);
    c.appendChild(acts);
    if (voters.length && !(stg === 0 && voters.length === 1 && mine)) c.appendChild(el('div', 'ptag', (i.k === 'compra' ? '😍 ' : '👍 ') + voters.join(', ')));
    return c;
  };
  if (ifilter === 'fatte') { list.sort(function (a, b) { return (b.w || '') < (a.w || '') ? -1 : (b.w || '') > (a.w || '') ? 1 : b.ts - a.ts; }).forEach(function (i) { box.appendChild(card(i)); }); }
  else {
    var S = [[], [], []]; list.forEach(function (i) { S[stage(i)].push(i); });
    S[0].sort(function (a, b) { return (!!a.v[me.name] || !!sk[a.id]) - (!!b.v[me.name] || !!sk[b.id]) || b.ts - a.ts; }); // prima quelli che aspettano la tua risposta
    S[1].sort(function (a, b) { return b.ts - a.ts; }); S[2].sort(function (a, b) { return a.w < b.w ? -1 : 1; });
    [['Da decidere', 'Dite se vi va: quando piace a ' + all + ', si organizza.'], ['Da organizzare', 'Lo volete ' + all + ': manca solo la data.'], ['In programma', '']].forEach(function (h, n) {
      if (!S[n].length) return;
      var hd = el('div', 'isec'); hd.appendChild(el('b', null, h[0])); hd.appendChild(el('i', null, String(S[n].length))); if (h[1]) hd.appendChild(el('small', null, h[1])); box.appendChild(hd);
      S[n].forEach(function (i) { box.appendChild(card(i)); });
    });
  }
  if (PARTNER.booking || PARTNER.gyg || PARTNER.amazon) box.appendChild(el('p', null, '“partner”: prenotando da quel link Reelta riceve una piccola commissione. Per te il prezzo non cambia.'));
  var dm = el('button', 'demob'); dm.type = 'button'; dm.appendChild(el('span', null, '▶')); var dt = el('div'); dt.appendChild(el('b', null, 'Come nasce un piano da un Reel?')); dt.appendChild(el('small', null, 'Guarda la demo · 30 secondi')); dm.appendChild(dt); dm.onclick = demoOpen; box.appendChild(dm);
}
// ⋯ su un piano: tutto quello che non è il passo successivo
function ideaMenu(i, links) {
  var mine = !!i.v[me.name], o = [];
  (links || []).forEach(function (l) { o.push({ t: l.t + (l.p ? ' (partner)' : ''), f: function () { window.open(l.u, '_blank', 'noopener'); } }); });
  if (i.r && find(i.r)) o.push({ t: '▶ Rivedi il Reel', f: function () { goReel(i.r); } });
  if (!i.d) o.push({ t: i.w ? '📅 Cambia data' : '📅 Scegli una data', f: function () { pickDay(i); } });
  if (!i.d && i.w) o.push({ t: '🗓️ Metti in calendario', f: function () { toCal(i); } });
  if (!i.d) o.push({ t: mine ? '👎 Non mi va più' : '👍 Mi va', f: function () { ideaAct({ t: 'idea', a: 'vote', id: i.id, on: !mine }); } });
  o.push({ t: i.d ? '↺ Rimetti tra quelli da fare' : '✓ Segna come fatto', f: function () { ideaAct({ t: 'idea', a: 'done', id: i.id, on: !i.d }); } });
  o.push({ t: '🗑 Elimina', f: function () { ask('Eliminare questo piano?', 'Sparisce per tutto il cerchio.', 'Elimina', true).then(function (y) { if (y) ideaAct({ t: 'idea', a: 'del', id: i.id }); }); } });
  sheet(i.p, '', o);
}
function circleSize() { return me.role === 'host' ? Object.keys(allowed).length + 1 : Math.max(names.length, circMax ? 2 : 2); }
function isMatch(i) { var n = circleSize(); return n >= 2 && Object.keys(i.v || {}).length >= n; }
function toDecide() { var sk = get('iskip', {}); return ideas.filter(function (i) { return !i.d && !i.v[me.name] && !sk[i.id]; }); }
var decCur = null;
function decOpen() { decMode = ''; $('decT').textContent = LXT('Decidete insieme'); $('decP').textContent = LXT('Ti va? Se piace anche all’altra persona, lo organizzate insieme.'); $('decM').classList.add('open'); decShow(); }
/* ---- 🗓 Il piano del weekend: i Reel della settimana, ognuno dice ❤️ o passo; se piace a tutti è un match ---- */
var decMode = '';
function LXT(x) { return (window.LX_T || String)(x); }
function ritMembers() { if (!me) return []; var L = me.role === 'host' ? [me.name].concat(Object.keys(allowed).map(function (k) { return allowed[k]; })) : (names && names.length ? names.slice() : [me.name]); if (L.indexOf(me.name) < 0) L.push(me.name); return L.filter(function (x, i) { return x && L.indexOf(x) === i; }); }
function ritWeek() { var d = new Date(); d.setHours(0, 0, 0, 0); var back = (d.getDay() + 3) % 7; d.setDate(d.getDate() - back); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); } // settimana che parte dal giovedì
function ritAll() { var wk = Date.now() - 7 * 864e5, used = {}; ideas.forEach(function (i) { if (i.r) used[i.r] = 1; }); return feed.filter(function (r) { return r.ts >= wk && !used[r.id] && !isMuted(r.n); }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, 8); }
function ritQueue() { var sk = get('rskip', {}); return ritAll().filter(function (r) { return !(r.x && r.x[me.name] === '❤️') && !sk[r.id]; }); }
function ritMatch(r) { var M = ritMembers(); return M.length >= 2 && M.every(function (n) { return r.x && r.x[n] === '❤️'; }); }
function ritOn() { var wd = new Date().getDay(); return (wd === 4 || wd === 5 || wd === 6 || wd === 0) && ritMembers().length >= 2 && (!!mixCur() || !!packCur() || (ritAll().length >= 2 && ritQueue().length > 0)); }
// 📍 ogni settimana un'idea per uscire entra nel rituale: stessa idea per tutto il cerchio (scelta dalla settimana), se tutti dicono sì è un match con «Prenota»
function packWeekItem() {
  var c = cityGet(), L = (c && !isLon(c) ? packFor(c) : []).concat(packLon()); if (!L.length) return null;
  var p = ritWeek().split('-'), n = Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / (7 * 864e5));
  if (xmasOn()) { var x = n % PACK_XMAS.length; return PACK_XMAS[x]; }
  return L[((n % L.length) + L.length) % L.length];
}
function packIdeaId(it) { return ('pk-' + ritWeek().replace(/-/g, '') + '-' + it.s).slice(0, 40); }
function packCur() {
  var it = packWeekItem(); if (!it) return null;
  var a = get('pkr', {}); if (a[ritWeek()]) return null;
  var ex = findIdea(packIdeaId(it)); if (ex && ex.v && ex.v[me.name]) return null;
  return it;
}
function packRitCard(c, it) {
  c.appendChild(el('div', 'e', it.e)); c.appendChild(el('p', 'refn', '📍 ' + LXT('Un’idea per uscire')));
  c.appendChild(el('h3', null, LXT(it.t))); c.appendChild(el('p', null, typeof it.d === 'string' ? LXT(it.d) : LXT(it.d.f) + ' ' + it.d.c));
  var ex = findIdea(packIdeaId(it)), oth = ex ? Object.keys(ex.v || {}).filter(function (n) { return n !== me.name; }) : [];
  if (oth.length) c.appendChild(el('p', 'refn', '❤️ ' + oth.join(', ')));
  var a = document.createElement('a'); a.className = 'chip'; a.href = it.l; a.target = '_blank'; a.rel = 'noopener'; a.textContent = (it.b === 'Biglietti' ? '🎟 ' : '📅 ') + LXT(it.b) + ' ↗'; a.onclick = function () { track('idea-link-rito-' + it.s); };
  var lk = el('div', 'ailinks'); lk.appendChild(a); c.appendChild(lk);
}
function ritOpen() { decMode = 'rit'; track('rituale-apri'); $('decT').textContent = '🗓 ' + LXT('Il piano del weekend'); $('decP').textContent = LXT('I Reel di questa settimana: quale fate? Se piace a tutti, è un match.'); $('decM').classList.add('open'); ritShow(); }
/* ---- ✨ un'idea per il weekend: l'AI guarda le etichette dei Reel recenti (mai nomi, link o messaggi) e trova cosa vi piace ---- */
var mixBusy = false;
function mixItems() { var since = Date.now() - 30 * 864e5, used = {}; ideas.forEach(function (i) { if (i.r) used[i.r] = 1; });
  return feed.filter(function (r) { return r.ts >= since && r.aiX && r.aiX.k && r.aiX.k !== 'altro' && !used[r.id]; }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, 12)
    .map(function (r) { return { k: r.aiX.k, p: clean(r.aiX.p || '', 60), s: clean(r.aiX.sum || '', 160), h: Object.keys(r.x || {}).filter(function (n) { return r.x[n] === '❤️'; }).length }; }); }
function mixCur() { var m = get('mix', null); return m && m.wk === ritWeek() && m.s && m.s.p && !m.st ? m : null; }
function mixFetch() {
  if (mixBusy || !me || !srvOn()) return; var m = get('mix', null); if (m && m.wk === ritWeek()) return;
  var it = mixItems(); if (it.length < 3) return; mixBusy = true;
  mbCall({ a: 'mix', items: it, lang: window.LX_LANG || 'it', reg: ((navigator.language || '').split('-')[1] || '').slice(0, 2) }).then(function (x) {
    mixBusy = false; if (!x || x.error) return; put('mix', { wk: ritWeek(), s: x.p && x.k !== 'altro' ? x : null, st: '' }); if (x.p) track('idea-weekend'); try { renderNov(); } catch (e) {}
  }, function () { mixBusy = false; });
}
function mixDone(st) { var m = get('mix', null); if (m) { m.st = st; put('mix', m); } }
function mixCard(c, m) {
  var s = m.s; c.appendChild(el('div', 'e', (KINDS[s.k] || '✨').split(' ')[0]));
  c.appendChild(el('p', 'refn', '✨ ' + LXT('Un’idea di Reelta per voi')));
  c.appendChild(el('h3', null, clean(s.p, 60)));
  if (s.why) c.appendChild(el('p', null, clean(s.why, 160)));
  if (s.o) c.appendChild(el('p', 'refn', clean(s.o, 200)));
  var lk = el('div', 'ailinks'); linksFor({ k: s.k, p: clean(s.p, 60), q: clean(s.shop || '', 60) }).slice(0, 3).forEach(function (L) { var a = el('a', 'chip', L.t); a.href = L.u; a.target = '_blank'; a.rel = 'noopener noreferrer' + (L.p ? ' sponsored' : ''); lk.appendChild(a); }); c.appendChild(lk);
}
function ritShow() {
  var mx = mixCur();
  if (mx) { var c0 = $('decC'); c0.className = ''; c0.textContent = ''; decCur = { mix: true }; $('decB').hidden = false; mixCard(c0, mx); return; }
  var pk = packCur(); if (pk) { var c1 = $('decC'); c1.className = ''; c1.textContent = ''; decCur = { pack: pk }; $('decB').hidden = false; packRitCard(c1, pk); return; }
  var c = $('decC'), q = ritQueue(); c.className = ''; c.textContent = ''; decCur = q[0] || null; $('decB').hidden = !decCur;
  if (!decCur) {
    var ms = ritAll().filter(ritMatch);
    c.appendChild(el('div', 'e', ms.length ? '💞' : '🎉')); c.appendChild(el('h3', null, ms.length ? LXT('I vostri match') : LXT('Fatto!')));
    if (!ms.length) c.appendChild(el('p', null, LXT('Hai votato tutti i Reel. Quando gli altri votano, i match compaiono qui e ti avviso.')));
    ms.forEach(function (r) { var b = el('button', 'btn', '📅 ' + (clean(r.c, 40) || LXT('Reel di ') + r.n)); b.style.marginTop = '10px'; b.onclick = function () { $('decM').classList.remove('open'); openIdea(r.id); }; c.appendChild(b); });
    return;
  }
  var r = decCur; c.appendChild(el('div', 'e', (KINDS[guessKind(r.c)] || '🎬').split(' ')[0]));
  c.appendChild(el('h3', null, clean(r.c, 90) || LXT('Un Reel di ') + r.n));
  var others = ritMembers().filter(function (n) { return n !== me.name && r.x && r.x[n] === '❤️'; });
  c.appendChild(el('p', null, LXT('Mandato da ') + r.n + (others.length ? ' · ❤️ ' + others.join(', ') : '') + (q.length > 1 ? ' · ' + LXT('ne restano ') + q.length : '')));
  var w = el('button', 'btn-o', '▶ ' + LXT('Guardalo')); w.type = 'button'; w.style.marginTop = '8px'; w.onclick = function () { $('decM').classList.remove('open'); goReel(r.id); }; c.appendChild(w);
}
function ritAnswer(yes) {
  var r = decCur; if (!r || ritAnswer.busy) return; ritAnswer.busy = true; setTimeout(function () { ritAnswer.busy = false; }, 350); try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
  if (r.pack) {
    var it = r.pack; $('decC').className = yes ? 'r' : 'l';
    setTimeout(function () {
      var a = get('pkr', {}); a[ritWeek()] = yes ? 'si' : 'no'; put('pkr', a);
      if (yes) { var v = {}; v[me.name] = 1; var desc = typeof it.d === 'string' ? LXT(it.d) : LXT(it.d.f) + ' ' + it.d.c;
        var ex0 = findIdea(packIdeaId(it)); if (ex0) ideaAct({ t: 'idea', a: 'vote', id: ex0.id, on: true }); else ideaAct({ t: 'idea', a: 'add', i: { id: packIdeaId(it), r: '', k: /^(bobbob|oxo|stafford-caines|romantico|brunch)$/.test(it.s) ? 'cibo' : 'esperienza', p: clean(LXT(it.t), 60), o: clean(desc, 200), ts: Date.now(), v: v, q: '', u: it.l } });
        track('rituale-idea-si-' + it.s); var ex = findIdea(packIdeaId(it)); if (!(ex && isMatch(ex))) $('mh').textContent = LXT('Piano proposto: gli altri lo trovano in «Decidete insieme».'); }
      else track('rituale-idea-no-' + it.s);
      ritShow(); try { renderNov(); } catch (e) {}
    }, 230); return;
  }
  if (r.mix) {
    var mx = mixCur(); $('decC').className = yes ? 'r' : 'l';
    setTimeout(function () {
      if (yes && mx) { var v = {}; v[me.name] = 1; ideaAct({ t: 'idea', a: 'add', i: { id: uid(8), r: '', k: mx.s.k, p: clean(mx.s.p, 60), o: clean(mx.s.o || mx.s.why || '', 200), ts: Date.now(), v: v, q: clean(mx.s.shop || '', 60) } }); track('idea-weekend-si'); $('mh').textContent = LXT('Piano proposto: gli altri lo trovano in «Decidete insieme».'); }
      mixDone(yes ? 'si' : 'no'); ritShow(); try { renderNov(); } catch (e) {}
    }, 230); return;
  } var c = $('decC'); c.className = yes ? 'r' : 'l';
  try { navigator.vibrate && navigator.vibrate(yes ? 18 : 8); } catch (e) {}
  setTimeout(function () {
    if (yes) { if (!(r.x && r.x[me.name] === '❤️')) react(r.id, '❤️'); track('rituale-si'); }
    else { var sk = get('rskip', {}); sk[r.id] = Date.now(); put('rskip', sk); }
    if (yes && ritMatch(r)) ritMatchIn(r); else ritShow();
    try { renderNov(); } catch (e) {}
  }, 230);
}
// 🎉 piccola festa per un match (niente se il telefono chiede meno movimento)
function confetti() {
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  var C = ['#FF6A4D', '#FFC24D', '#4F46E5', '#E8445A', '#3BD3A8', '#F6E2B4'], box = el('div', 'cft');
  for (var i = 0; i < 28; i++) { var p = el('i'); p.style.left = (5 + Math.random() * 90) + '%'; p.style.background = C[i % C.length]; p.style.animationDelay = (Math.random() * 0.25) + 's'; p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px'); p.style.setProperty('--rt', (Math.random() * 720 - 360) + 'deg'); box.appendChild(p); }
  document.body.appendChild(box); setTimeout(function () { box.remove(); }, 1900);
}
function ritMatchIn(r) {
  var seen = get('rmatch', {}); if (seen[r.id]) { if (decMode === 'rit') ritShow(); return; } seen[r.id] = 1; put('rmatch', seen); track('rituale-match'); confetti();
  try { navigator.vibrate && navigator.vibrate([30, 60, 30]); } catch (e) {}
  decMode = 'rit'; var c = $('decC'), m = $('decM'); $('decT').textContent = '🗓 ' + LXT('Il piano del weekend'); m.classList.add('open'); $('decB').hidden = true; decCur = null; c.className = ''; c.textContent = '';
  c.appendChild(el('div', 'big', '💞')); c.appendChild(el('h3', null, LXT('È un match!')));
  c.appendChild(el('p', null, (ritMembers().length > 2 ? LXT('Lo volete tutti: ') : LXT('Lo volete entrambi: ')) + (clean(r.c, 80) || LXT('il Reel di ') + r.n)));
  var go = el('button', 'btn', '📅 ' + LXT('Fatene un piano')); go.style.marginTop = '14px'; go.onclick = function () { m.classList.remove('open'); openIdea(r.id); }; c.appendChild(go);
  var more = el('button', 'btn-o wide', LXT('Continua a votare')); more.style.marginTop = '8px'; more.onclick = function () { ritShow(); }; c.appendChild(more);
}
function decShow() {
  var c = $('decC'), q = toDecide(); c.className = ''; c.textContent = ''; decCur = q[0] || null;
  $('decB').hidden = !decCur;
  if (!decCur) { c.appendChild(el('div', 'e', '🎉')); c.appendChild(el('h3', null, 'Fatto!')); c.appendChild(el('p', null, 'Hai risposto a tutti i piani. Quelli che piacciono a tutti e due li trovi in cima ai Piani.')); return; }
  c.appendChild(el('div', 'e', (KINDS[decCur.k] || '💡').split(' ')[0]));
  c.appendChild(el('h3', null, decCur.p));
  if (decCur.o) c.appendChild(el('p', null, decCur.o));
  c.appendChild(el('p', null, 'Proposto da ' + decCur.n + (q.length > 1 ? ' · ne restano ' + q.length : '')));
}
function decAnswer(yes) {
  var i = decCur; if (!i) return; var c = $('decC'); c.className = yes ? 'r' : 'l';
  try { navigator.vibrate && navigator.vibrate(yes ? 18 : 8); } catch (e) {}
  setTimeout(function () {
    if (yes) ideaAct({ t: 'idea', a: 'vote', id: i.id, on: true });
    else { var sk = get('iskip', {}); sk[i.id] = Date.now(); put('iskip', sk); renderIdeas(); }
    if (!$('decC').querySelector('.big')) decShow();
  }, 230);
}
function matchIn(i) {
  var seen = get('imatch', {}); if (seen[i.id]) return; seen[i.id] = 1; put('imatch', seen); confetti();
  try { navigator.vibrate && navigator.vibrate([30, 60, 30]); } catch (e) {}
  var c = $('decC'), m = $('decM'); m.classList.add('open'); $('decB').hidden = true; decCur = null; c.className = ''; c.textContent = '';
  c.appendChild(el('div', 'big', '💞')); c.appendChild(el('h3', null, (circleSize() > 2 ? 'Siete tutti d’accordo!' : 'Siete d’accordo!')));
  c.appendChild(el('p', null, (circleSize() > 2 ? 'Lo volete tutti: ' : 'Lo volete entrambi: ') + i.p));
  if (i.u) { var bk = document.createElement('a'); bk.className = 'btn'; bk.href = i.u; bk.target = '_blank'; bk.rel = 'noopener'; bk.textContent = '🎟 ' + LXT('Prenota adesso') + ' ↗'; bk.style.cssText = 'display:block;text-align:center;text-decoration:none;margin-top:14px'; bk.onclick = function () { track('idea-match-prenota-' + (i.id.split('-').pop() || '')); }; c.appendChild(bk); track('idea-match-' + (i.id.split('-').pop() || '')); }
  var go = el('button', i.u ? 'btn-o wide' : 'btn', '📅 Scegliamo quando'); go.style.marginTop = i.u ? '8px' : '14px'; go.onclick = function () { m.classList.remove('open'); showPane('ideas'); pickDay(i); };
  c.appendChild(go);
}
$('decSi').addEventListener('click', function () { if (decMode === 'rit') ritAnswer(true); else decAnswer(true); });
$('decNo').addEventListener('click', function () { if (decMode === 'rit') ritAnswer(false); else decAnswer(false); });
$('decX').addEventListener('click', function () { $('decM').classList.remove('open'); });
(function () { var x0 = null, c = $('decC');
  c.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  c.addEventListener('touchmove', function (e) { if (x0 === null || !decCur) return; var dx = e.touches[0].clientX - x0; c.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 20 + 'deg)'; }, { passive: true });
  c.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; c.style.transform = ''; if (decCur && Math.abs(dx) > 80) { if (decMode === 'rit') ritAnswer(dx > 0); else decAnswer(dx > 0); } });
})();
function fmtDay(w) { try { var d = new Date(w + 'T12:00:00'); return d.toLocaleDateString(window.LX_LANG === 'en' ? 'en-GB' : window.LX_LANG === 'es' ? 'es-ES' : 'it-IT', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { return w; } }
function pickDay(i) {
  // una finestra con i giorni più usati e il calendario del telefono ben visibile (il calendario «nascosto» su iPhone non si apriva)
  var old = $('dayM'); if (old) old.remove();
  var M = el('div', 'mod open'); M.id = 'dayM'; M.setAttribute('role', 'dialog'); M.setAttribute('aria-modal', 'true');
  var C = el('div', 'card'); M.appendChild(C); C.appendChild(el('h2', null, '📅 Quando?')); var pp = el('p', null, i.p); pp.style.marginTop = '0'; C.appendChild(pp);
  var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  var set = function (v) { M.remove(); if (v !== (i.w || '')) { ideaAct({ t: 'idea', a: 'when', id: i.id, w: v }); if (v) $('mh').textContent = '📅 ' + i.p + ': ' + fmtDay(v) + '. Lo vede tutto il cerchio.'; } };
  var now = new Date(), plus = function (n) { return new Date(now.getFullYear(), now.getMonth(), now.getDate() + n); }, toDow = function (w) { var n = (w - now.getDay() + 7) % 7; return plus(n || 7); };
  var row = el('div', 'backc');
  [['Oggi', plus(0)], ['Domani', plus(1)], ['Sabato', toDow(6)], ['Domenica', toDow(0)]].forEach(function (o) { var b = el('button', null, o[0] + ' · ' + fmtDay(iso(o[1]))); b.type = 'button'; b.onclick = function () { set(iso(o[1])); }; row.appendChild(b); });
  C.appendChild(row);
  var lb = el('label', 'hint', 'Oppure scegli un altro giorno:'); lb.style.display = 'block'; lb.style.margin = '12px 0 6px'; C.appendChild(lb);
  var inp = el('input'); inp.type = 'date'; inp.id = 'dayIn'; inp.value = i.w || ''; inp.min = iso(now); inp.style.cssText = 'width:100%;min-height:52px;font-size:17px'; lb.htmlFor = 'dayIn'; C.appendChild(inp);
  var duo = el('div', 'duo'); duo.style.marginTop = '14px';
  var x = el('button', 'btn-o', i.w ? 'Togli la data' : 'Annulla'); x.type = 'button'; x.onclick = function () { if (i.w) set(''); else M.remove(); }; duo.appendChild(x);
  var ok = el('button', 'btn go', 'Salva'); ok.type = 'button'; ok.onclick = function () { if (inp.value) set(inp.value); else inp.focus(); }; duo.appendChild(ok);
  C.appendChild(duo); M.addEventListener('click', function (e) { if (e.target === M) M.remove(); });
  document.body.appendChild(M);
}

function toCal(i) {
  var d = i.w.replace(/-/g, ''), nd = new Date(i.w + 'T12:00:00'); nd.setDate(nd.getDate() + 1);
  var d2 = nd.toISOString().slice(0, 10).replace(/-/g, ''), r = i.r && find(i.r);
  var ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Reelta//IT\r\nBEGIN:VEVENT\r\nUID:' + i.id + '@reelta\r\nDTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z\r\nDTSTART;VALUE=DATE:' + d + '\r\nDTEND;VALUE=DATE:' + d2 + '\r\nSUMMARY:' + i.p.replace(/[,;\\]/g, ' ') + '\r\nDESCRIPTION:' + ((i.o || '') + (r ? ' ' + r.u : '')).replace(/[,;\\\r\n]/g, ' ') + '\r\nBEGIN:VALARM\r\nTRIGGER:-P1D\r\nACTION:DISPLAY\r\nDESCRIPTION:' + i.p.replace(/[,;\\]/g, ' ') + '\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
  var f; try { f = new File([ics], 'reelta-piano.ics', { type: 'text/calendar' }); } catch (e) {}
  if (f && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: i.p }).catch(function () {}); return; }
  if (isIOS) { location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics); return; }
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'reelta-piano.ics'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
// promemoria gentile: al massimo una volta a settimana, solo se ci sono piani fermi da un po'
function planNudge() {
  if (!ideas.length || Date.now() - (+get('inudge', 0)) < 7 * 864e5) return;
  var today = new Date().toISOString().slice(0, 10);
  var soon = ideas.filter(function (i) { if (!i.w || i.d) return false; var dd = (new Date(i.w + 'T12:00:00') - Date.now()) / 864e5; return dd >= -1 && dd <= 2; });
  var old = ideas.filter(function (i) { return !i.d && !i.w && Date.now() - i.ts > 10 * 864e5; });
  var dec = toDecide();
  if (!soon.length && !old.length && !dec.length) return;
  put('inudge', Date.now());
  var t, b;
  if (soon.length) { t = '📅 ' + soon[0].p; b = soon[0].w === today ? 'È oggi! Tutto pronto?' : '📅 ' + fmtDay(soon[0].w) + ' · Tutto pronto?'; }
  else if (dec.length) { t = '💘 ' + (dec.length === 1 ? '1 piano aspetta' : dec.length + ' piani aspettano') + ' il tuo sì'; b = 'Ci metti 10 secondi: sì o passo, e scoprite cosa vi piace a tutti e due.'; }
  else { t = '💡 ' + (old.length === 1 ? '1 piano è fermo' : old.length + ' piani sono fermi') + ' da un po’'; b = '“' + old[0].p + '” e gli altri: scegliete una data, così succede davvero.'; }
  if (document.querySelector('.mod.open')) { put('inudge', 0); return; }
  ask(t, b, dec.length && !soon.length ? 'Decidiamo' : 'Vedi i piani').then(function (y) { if (!y) return; showPane('ideas'); if (dec.length && !soon.length) decOpen(); });
}
function ideaGuide() {
  var g = el('div', 'iempty');
  g.appendChild(el('h3', null, 'Dai Reel ai piani'));
  var ol = el('ol'); ['🎬 Vedete un Reel che vi piace', '✨ Toccate Piano sotto il video', '💘 Dite sì o passo: se piace a entrambi, si fa', '📅 Scegliete la data e mettetela in calendario'].forEach(function (t) { ol.appendChild(el('li', null, t)); }); g.appendChild(ol);
  var ex = el('div', 'card idea ex'); ex.appendChild(el('span', 'tag', 'ESEMPIO'));
  ex.appendChild(el('div', 'k', KINDS.viaggio)); ex.appendChild(el('h3', null, 'Weekend a Lisbona'));
  var ac = el('div', 'acts'); ['👍 2', '📍 Mappa', '✈️ Voli', '🏨 Hotel'].forEach(function (t) { ac.appendChild(el('span', 'r-btn', t)); }); ex.appendChild(ac);
  ex.setAttribute('aria-label', 'Esempio di piano'); g.appendChild(ex);
  var r2 = el('div', 'row2'), a = el('button', 'btn', '▶ Vai ai Reel'), b = el('button', 'btn-o', '+ Crea un piano');
  a.onclick = function () { showPane('main'); }; b.onclick = function () { openIdea(); };
  r2.appendChild(a); r2.appendChild(b); g.appendChild(r2);
  return g;
}
