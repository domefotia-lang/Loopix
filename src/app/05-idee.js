/* ---- ✨ Ispirazione: gli Shorts di YouTube più visti su un argomento, da mandare alla propria persona ---- */
// cosa cerchiamo davvero su YouTube per ogni categoria (in inglese: a Londra i video migliori sono in inglese)
var INSP_QEN = ['best restaurants', 'weekend trip from', 'quick easy recipe', 'date night ideas', 'cheap travel tips', 'gift ideas'];
var INSP_T = { it: ['Ristoranti da provare', 'Weekend fuori città', 'Ricette veloci', 'Cose da fare in coppia', 'Viaggi low cost', 'Idee regalo'], en: ['Restaurants to try', 'Weekend getaways', 'Quick recipes', 'Date ideas', 'Cheap travel', 'Gift ideas'], es: ['Restaurantes para probar', 'Escapadas de fin de semana', 'Recetas rápidas', 'Planes en pareja', 'Viajes baratos', 'Ideas de regalo'] };
/* ---- 🗓️ «Cosa facciamo oggi?»: con chi, quando, budget, dove → 6 idee vere vicino a voi (video se c'è, altrimenti il sito) ---- */
// quartieri di Londra: «Vicino a me» trova il più vicino sul telefono e manda solo il nome (mai la posizione)
var OG_AREAS = [['Westminster', 51.4995, -0.1357], ['Soho', 51.5137, -0.1337], ['Covent Garden', 51.5117, -0.124], ['Camden', 51.539, -0.1426], ['King’s Cross', 51.5308, -0.1238], ['Islington', 51.5362, -0.1033], ['Hackney', 51.545, -0.0553], ['Shoreditch', 51.5265, -0.0798], ['Stratford', 51.5416, -0.0033], ['Canary Wharf', 51.5054, -0.0235], ['Greenwich', 51.4826, -0.0077], ['Lewisham', 51.4615, -0.0138], ['Eltham', 51.4508, 0.0525], ['Woolwich', 51.4906, 0.0636], ['Bromley', 51.4039, 0.0198], ['Croydon', 51.3762, -0.0982], ['Brixton', 51.4613, -0.1156], ['Clapham', 51.4618, -0.1384], ['Battersea', 51.4791, -0.1625], ['Southwark', 51.5035, -0.0804], ['Wimbledon', 51.4214, -0.2064], ['Richmond', 51.4613, -0.3037], ['Kingston', 51.4123, -0.3007], ['Hammersmith', 51.4927, -0.2339], ['Chelsea', 51.4875, -0.1687], ['Kensington', 51.5006, -0.1937], ['Notting Hill', 51.5094, -0.1967], ['Marylebone', 51.5194, -0.1499], ['Hampstead', 51.556, -0.1781], ['Highgate', 51.5716, -0.1448], ['Walthamstow', 51.5908, -0.0134], ['Tottenham', 51.5975, -0.0681], ['Wembley', 51.5588, -0.2817], ['Ealing', 51.513, -0.3089], ['Ilford', 51.559, 0.0741], ['Romford', 51.5751, 0.1857], ['Bexleyheath', 51.4573, 0.1427], ['Sutton', 51.3618, -0.1945], ['Harrow', 51.5806, -0.3416], ['Enfield', 51.6523, -0.0807]];
var OG_EM = { food: '🍽️', kids: '🧸', outdoor: '🌳', culture: '🏛️', show: '🎭', night: '🌙', activity: '🎯' };
function ogPref() { var p = {}; try { p = JSON.parse(localStorage.getItem(LSG + 'oggi') || '{}') || {}; } catch (e) {} var w = p.when || 'oggi', dt = p.date || ''; if (w === 'data' && (!/^\d{4}-\d{2}-\d{2}$/.test(dt) || dt < ogIso(new Date()))) { w = 'oggi'; dt = ''; } // un giorno già passato non vale più
  return { who: p.who || 'coppia', when: w, date: dt, bud: p.bud || 'any', where: p.where || '', wl: p.wl || '' }; }
function ogIso(x) { return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); }
function ogNear(cb) {
  if (!navigator.geolocation) { cb(''); return; }
  navigator.geolocation.getCurrentPosition(function (pos) {
    var la = pos.coords.latitude, lo = pos.coords.longitude, best = '', bd = 1e9;
    OG_AREAS.forEach(function (a) { var dd = Math.hypot((a[1] - la) * 111, (a[2] - lo) * 69); if (dd < bd) { bd = dd; best = a[0]; } });
    cb(bd < 15 ? best : (Math.round(la * 10) / 10) + ', ' + (Math.round(lo * 10) / 10)); // fuori Londra: solo una zona larga ~10 km
  }, function () { cb(''); }, { maximumAge: 6e5, timeout: 9000, enableHighAccuracy: false });
}
function ogForm() {
  var p = ogPref(), c = cityGet() || 'Londra', lon = isLon(c), F = el('div', 'ogf');
  F.appendChild(el('h3', null, '🗓️ ' + LXT('Cosa facciamo oggi?')));
  F.appendChild(el('p', 'refn', LXT('Scegli e trovo idee vere vicino a voi: con il video se c’è, altrimenti il sito.')));
  var row = function (lab, key, opts) {
    var r = el('div', 'ogr'); r.dataset.k = key; r.appendChild(el('span', 'ogl', LXT(lab))); var w = el('div', 'ogc');
    opts.forEach(function (o) { var b = el('button', 'chip', LXT(o[1])); b.type = 'button'; b.setAttribute('aria-pressed', String(p[key] === o[0])); b.onclick = function () { if (o[0] === 'near') { b.textContent = '📍 …'; ogNear(function (a) { if (!a) { b.textContent = '📍 ' + LXT('Vicino a me'); $('mh').textContent = LXT('Non riesco a sapere la zona: scegline una qui sotto.'); return; } p.where = a; p.wl = a; b.textContent = '📍 ' + a; mark(); }); return; } p[key] = o[0]; if (key === 'where') p.wl = ''; mark(); }; b._k = o[0]; w.appendChild(b); });
    function mark() { w.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', String(key === 'where' ? (b._k === 'near' ? !!p.wl : p.where === b._k && !p.wl) : p[key] === b._k)); }); lsSet(LSG + 'oggi', JSON.stringify(p)); }
    r.appendChild(w); F.appendChild(r);
  };
  row('Con chi', 'who', [['coppia', '💑 In coppia'], ['bimbi', '🧸 Con i bambini'], ['amici', '🍻 Con amici']]);
  row('Quando', 'when', [['oggi', 'Oggi'], ['sera', 'Stasera'], ['domani', 'Domani'], ['weekend', 'Questo weekend'], ['data', '📅 Un altro giorno']]);
  // 📅 calendarietto: qualsiasi giorno nei prossimi 2 mesi
  (function () {
    var qr = F.lastChild, dc = [].filter.call(qr.querySelectorAll('.chip'), function (b) { return b._k === 'data'; })[0], t0 = new Date();
    var dIn = document.createElement('input'); dIn.type = 'date'; dIn.className = 'ogd'; dIn.min = ogIso(t0); dIn.max = ogIso(new Date(t0.getTime() + 60 * 864e5));
    dIn.value = p.date || ogIso(new Date(t0.getTime() + 2 * 864e5)); dIn.hidden = p.when !== 'data'; dIn.setAttribute('aria-label', LXT('Scegli il giorno'));
    var save = function () { lsSet(LSG + 'oggi', JSON.stringify(p)); if (p.when === 'data' && p.date) dc.textContent = '📅 ' + fmtDay(p.date); else dc.textContent = '📅 ' + LXT('Un altro giorno'); };
    var oc = dc.onclick; dc.onclick = function () { oc(); p.date = p.date || dIn.value; dIn.hidden = false; save(); try { if (dIn.showPicker) dIn.showPicker(); else dIn.focus(); } catch (e) { dIn.focus(); } };
    [].forEach.call(qr.querySelectorAll('.chip'), function (b) { if (b !== dc) b.addEventListener('click', function () { dIn.hidden = true; save(); }); });
    dIn.addEventListener('change', function () { if (!dIn.value) return; p.date = dIn.value; p.when = 'data'; [].forEach.call(qr.querySelectorAll('.chip'), function (b) { b.setAttribute('aria-pressed', String(b === dc)); }); save(); });
    qr.appendChild(dIn); save();
  })();
  row('Budget', 'bud', [['any', 'Qualsiasi'], ['free', 'Gratis'], ['low', '£'], ['mid', '££'], ['high', '£££']]);
  row('Dove', 'where', [['near', p.wl ? p.wl : '📍 Vicino a me']].concat(lon ? [['Central London', 'Centro'], ['North London', 'Nord'], ['South London', 'Sud'], ['East London', 'Est'], ['West London', 'Ovest']] : [['centre', 'Centro'], ['around', 'Dintorni']]));
  if (p.wl) { var nb = F.querySelector('.ogr:last-child .chip'); if (nb) nb.textContent = '📍 ' + p.wl; }
  var go = withIco(el('button', 'btn wide', ''), 'spark', LXT('Trova idee')); go.type = 'button';
  go.onclick = function () { var q = ogPref(); if (!q.where) { q.where = lon ? 'Central London' : 'centre'; lsSet(LSG + 'oggi', JSON.stringify(q)); } ogRun(q, F); };
  F.appendChild(go);
  return F;
}
function ogRun(p, F) {
  var L = $('inspL'), c = cityGet() || 'Londra', lon = isLon(c), city = lon ? 'London' : c;
  L.querySelectorAll('.og').forEach(function (x) { x.remove(); });
  var anchor = F.nextSibling, put0 = function (n) { L.insertBefore(n, anchor); };
  var hd = el('p', 'og ogh', '✨ ' + LXT('Sto cercando idee vere vicino a voi…')); put0(hd);
  for (var sk = 0; sk < 4; sk++) { var sc = el('div', 'insc skel og'); sc.appendChild(el('div', 'inth')); sc.appendChild(el('div', 'skl')); sc.appendChild(el('div', 'skl s2')); put0(sc); }
  hd.scrollIntoView({ behavior: 'smooth', block: 'start' });
  var where = p.where === 'centre' ? 'the centre' : p.where === 'around' ? 'the surroundings' : p.where;
  track('oggi-' + p.who + '-' + p.when);
  mbCall({ a: 'oggi', where: where, city: city, who: p.who, when: p.when, date: p.when === 'data' ? p.date : undefined, bud: p.bud, lang: window.LX_LANG || 'it' }, 20000).then(function (x) {
    L.querySelectorAll('.og.skel').forEach(function (n) { n.remove(); });
    if (!x || x.error || !x.items || !x.items.length) { hd.textContent = x && x.error === 'limite' ? LXT('Per oggi le ricerche sono finite: domani si ricaricano. Intanto guarda le idee qui sotto.') : lon ? LXT('L’AI è molto richiesta in questo momento: riprova tra un minuto. Intanto qui sotto ci sono le idee in città scelte da noi.') : LXT('L’AI è molto richiesta in questo momento: riprova tra un minuto.'); put0(aiAskBtn(ogPrompt(p, city))); return; }
    hd.textContent = '✨ ' + LXT('Idee per voi') + ' · ' + (p.wl || LXT({ 'Central London': 'Centro', 'North London': 'Nord', 'South London': 'Sud', 'East London': 'Est', 'West London': 'Ovest', centre: 'Centro', around: 'Dintorni' }[p.where] || p.where));
    var cards = [];
    x.items.forEach(function (v, i) {
      var link = v.u || gmaps(v.n + ' ' + (v.a || city)), k = 'og-' + v.n.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
      var o = { k: k, it: { s: k, e: OG_EM[v.k] || '🎯', t: v.n, d: [v.a, v.p, v.t].filter(Boolean).join(' · '), l: link, b: v.u ? 'Sito' : 'Mappa' }, st: { u: link } };
      var card = el('div', 'insc og'), th = el('button', 'inth pkth'); th.type = 'button'; th.appendChild(el('span', 'pke', o.it.e)); card.appendChild(th);
      card.appendChild(el('div', 'intt', v.n)); card.appendChild(el('div', 'inch', [v.a, v.p].filter(Boolean).join(' · ')));
      if (v.w) card.appendChild(el('div', 'ogw', v.w)); if (v.t) card.appendChild(el('div', 'inch', '🕒 ' + v.t));
      var a = document.createElement('a'); a.className = 'btn-o wide'; a.href = link; a.target = '_blank'; a.rel = 'noopener'; withIco(a, v.u ? 'pin' : 'pin', LXT(v.u ? 'Sito' : 'Mappa') + ' ↗'); a.onclick = function () { track('oggi-link'); }; card.appendChild(a);
      var go = withIco(el('button', 'btn wide', ''), 'heart', LXT('Fatelo insieme')); go.type = 'button'; go.onclick = function () { ideaWhat(o); }; card.appendChild(go);
      th.onclick = function () { IV.list = cards.map(function (z) { return z.o; }); ideaView(i); };
      put0(card); cards.push({ o: o, th: th });
    });
    put0(el('p', 'refn og', LXT(x.live ? 'Idee trovate dall’AI con la ricerca Google: controlla orari e prezzi sul sito prima di andare.' : 'Idee scelte dall’AI tra posti stabili e conosciuti: controlla orari e prezzi sul sito prima di andare.')));
    // un video per ogni idea, se esiste (canale ufficiale prima)
    mbCall({ a: 'pack', qs: x.items.map(function (v) { return { q: (v.n + ' ' + (v.a || city)).slice(0, 60), o: [v.n.toLowerCase().slice(0, 40)] }; }), lang: lon ? 'en' : (window.LX_LANG || 'it'), reg: lon ? 'GB' : cityRegion(c) }).then(function (y) {
      if (!y || !y.items) return;
      y.items.forEach(function (vv, i) { var z = cards[i]; if (!vv || !z || !z.th.isConnected) return; z.o.st.u = 'https://www.youtube.com/shorts/' + vv.id; z.th.textContent = ''; var im = document.createElement('img'); im.src = 'https://i.ytimg.com/vi/' + vv.id + '/hqdefault.jpg'; im.alt = ''; im.loading = 'lazy'; z.th.appendChild(im); z.th.appendChild(el('span', 'inpl', '▶')); z.th.classList.remove('pkth'); });
    }, function () {});
  }, function () { L.querySelectorAll('.og.skel').forEach(function (n) { n.remove(); }); hd.textContent = navigator.onLine === false ? LXT('Sei offline: ecco le idee pronte. Quelle nuove tornano con la rete.') : LXT('Non sono riuscito a trovare idee adesso: riprova tra poco.'); put0(aiAskBtn(ogPrompt(p, city))); });
}
/* ---- 🎁 Regali: per chi, occasione, budget → 6 idee concrete, con la ricerca nel negozio.
   Al server arrivano solo le tre scelte. I regali salvati restano su questo telefono: gli altri del cerchio non li vedono (sorprese al sicuro). ---- */
var RG_AFF = { 'amazon.co.uk': '', 'amazon.it': '', 'amazon.es': '', 'amazon.com': '' }; // codici affiliato: vuoti finché non c'è il via libera
// idee pronte se l'AI è occupata (mai uno schermo vuoto): [italiano, inglese, ricerca, esperienza?, prezzo]
var RG_FB = {
  lei: [['Corso di fiori freschi e composizioni', 'Floristry workshop', 'flower arranging workshop', 1, '£45–80'], ['Profumo in formato da viaggio', 'Travel-size perfume set', 'perfume discovery set women', 0, '£20–40'], ['Spa per due con tè', 'Spa day for two with tea', 'spa day for two afternoon tea', 1, '£90–160'], ['Libro di ricette illustrato', 'Illustrated cookbook', 'illustrated cookbook gift', 0, '£15–30'], ['Lezione di ballo per due', 'Dance class for two', 'dance class for two couples', 1, '£40–70'], ['Pigiama in cotone di qualità', 'Quality cotton pyjamas', 'women cotton pyjama set gift', 0, '£35–70']],
  lui: [['Kit per cocktail a casa', 'Home cocktail kit', 'cocktail making kit gift', 0, '£25–50'], ['Giro in kart', 'Go-karting session', 'go karting experience', 1, '£40–70'], ['Portafoglio sottile in pelle', 'Slim leather wallet', 'slim leather wallet men', 0, '£20–45'], ['Degustazione di birre artigianali', 'Craft beer tasting', 'craft beer tasting experience', 1, '£25–45'], ['Coltello da cucina giapponese', 'Japanese kitchen knife', 'japanese chef knife gift', 0, '£40–90'], ['Biglietti per una partita', 'Tickets to a match', 'football match tickets', 1, '£40–100']],
  noi: [['Corso di cucina italiana per due', 'Italian cooking class for two', 'italian cooking class for two', 1, '£80–140'], ['Gioco da tavolo per coppie', 'Board game for couples', 'two player board game couples', 0, '£15–35'], ['Notte in un glamping', 'A night glamping', 'glamping night for two', 1, '£90–200'], ['Album di foto da riempire insieme', 'Photo album to fill together', 'couples photo album', 0, '£20–40'], ['Cinema con divani e coperte', 'Cinema with sofas and blankets', 'luxury cinema tickets for two', 1, '£30–50'], ['Set per fondue', 'Fondue set', 'fondue set', 0, '£30–60']],
  bimbi: [['Kit da piccolo scienziato', 'Junior science kit', 'kids science experiment kit', 0, '£15–30'], ['Giornata in una fattoria con animali', 'Day at a petting farm', 'petting farm day out', 1, '£10–25'], ['Costruzioni magnetiche', 'Magnetic building tiles', 'magnetic building tiles kids', 0, '£25–50'], ['Spettacolo per bambini a teatro', 'Children’s theatre show', 'children theatre show tickets', 1, '£15–30'], ['Libro pop-up', 'Pop-up book', 'pop up book kids', 0, '£10–20'], ['Lezione di arrampicata per bambini', 'Kids climbing session', 'kids indoor climbing session', 1, '£15–25']],
  amici: [['Candela profumata artigianale', 'Hand-poured scented candle', 'hand poured scented candle', 0, '£15–30'], ['Quiz serale al pub insieme', 'Pub quiz night together', 'pub quiz night', 1, '£0–10'], ['Tazza fatta a mano', 'Handmade mug', 'handmade ceramic mug', 0, '£15–25'], ['Lezione di yoga all’aperto', 'Outdoor yoga class', 'outdoor yoga class', 1, '£10–20'], ['Gioco di carte da festa', 'Party card game', 'party card game adults', 0, '£15–25'], ['Brunch offerto', 'A brunch on you', 'best brunch spots', 1, '£20–40']],
  casa: [['Pianta grande da interno', 'Large indoor plant', 'large indoor plant delivery', 0, '£30–70'], ['Coperta in lana', 'Wool throw blanket', 'wool throw blanket', 0, '£40–80'], ['Lampada da tavolo calda', 'Warm table lamp', 'table lamp living room', 0, '£30–60'], ['Corso di bricolage per la casa', 'DIY home workshop', 'diy home workshop', 1, '£40–80'], ['Set di bicchieri da vino', 'Wine glass set', 'wine glass set', 0, '£20–45'], ['Macchina per pasta fresca', 'Pasta maker', 'pasta maker machine', 0, '£30–60']]
};
function rgFallback(per) { var en = window.LX_LANG && window.LX_LANG !== 'it'; return (RG_FB[per] || RG_FB.noi).map(function (x) { return { n: en ? x[1] : x[0], s: x[2], k: x[3] ? 'experience' : 'thing', p: x[4], w: '' }; }); }
/* ---- 🤖 «Chiedi alla tua AI»: se la nostra AI è occupata (o lo preferisci), la domanda si apre già scritta nella tua AI (ChatGPT o Gemini).
   La domanda viene anche copiata: se l'app non la inserisce da sola, basta incollarla. A noi non costa niente, e decidi tu cosa mandare. ---- */
function aiAskBtn(prompt) {
  var b = withIco(el('button', 'btn-o wide og', ''), 'spark', LXT('Chiedi alla tua AI (ChatGPT o Gemini)')); b.type = 'button';
  b.onclick = function (e) { if (e) e.stopPropagation(); tuaAi(prompt); }; return b;
}
function tuaAi(prompt) {
  var cp = function () { try { if (navigator.clipboard) navigator.clipboard.writeText(prompt).catch(function () {}); } catch (e) {} };
  var go = function (u, k) { cp(); track('tua-ai-' + k); window.open(u, '_blank', 'noopener'); };
  sheet('🤖 ' + LXT('Chiedi alla tua AI'), LXT('La domanda è già pronta (e copiata): se non compare da sola, incollala.') + '\n\n«' + prompt + '»', [
    { t: 'ChatGPT', f: function () { go('https://chatgpt.com/?q=' + encodeURIComponent(prompt), 'chatgpt'); } },
    { t: 'Gemini', f: function () { go('https://gemini.google.com/app?q=' + encodeURIComponent(prompt), 'gemini'); } },
    { t: LXT('Copia la domanda'), f: function () { cp(); track('tua-ai-copia'); $('mh').textContent = LXT('Domanda copiata: incollala nella tua AI.'); } }
  ]);
}
function ogPrompt(p, city) {
  var en = window.LX_LANG === 'en', W = { 'Central London': 'Central London', 'North London': 'North London', 'South London': 'South London', 'East London': 'East London', 'West London': 'West London', centre: en ? 'the centre' : 'il centro', around: en ? 'the surroundings' : 'i dintorni' }[p.where] || p.wl || p.where;
  var who = { coppia: en ? 'a couple' : 'una coppia', bimbi: en ? 'a family with young children' : 'una famiglia con bambini piccoli', amici: en ? 'a group of friends' : 'un gruppo di amici' }[p.who];
  var when = p.when === 'data' && p.date ? (en ? 'on ' : 'il ') + fmtDay(p.date) : ({ oggi: en ? 'today' : 'oggi', sera: en ? 'this evening' : 'stasera', domani: en ? 'tomorrow' : 'domani', weekend: en ? 'this weekend' : 'questo weekend' }[p.when]);
  var bud = { any: en ? 'any budget' : 'qualsiasi budget', free: en ? 'free only' : 'solo gratis', low: en ? 'cheap' : 'economico', mid: en ? 'mid-range' : 'medio', high: en ? 'special occasion' : 'occasione speciale' }[p.bud];
  return en ? 'Suggest 6 real things to do ' + when + ' in or near ' + W + ', ' + city + ', for ' + who + ', ' + bud + '. For each: name, area, price, why it suits us and the official website. Only places that really exist and are open.'
    : 'Suggeriscimi 6 cose vere da fare ' + when + ' a ' + W + ' o vicino, ' + city + ', per ' + who + ', ' + bud + '. Per ognuna: nome, zona, prezzo, perché è adatta e il sito ufficiale. Solo posti che esistono davvero e sono aperti.';
}
function rgPrompt(p) {
  var en = window.LX_LANG === 'en';
  var per = { lei: en ? 'her (my partner)' : 'lei (la mia compagna)', lui: en ? 'him (my partner)' : 'lui (il mio compagno)', noi: en ? 'the two of us' : 'noi due', bimbi: (en ? 'children aged ' : 'bambini di ') + (p.eta || '4-6') + (en ? '' : ' anni'), amici: en ? 'a friend' : 'un amico', casa: en ? 'our home' : 'la casa' }[p.per];
  var occ = { pensiero: en ? 'just because' : 'un pensiero senza occasione', compleanno: en ? 'a birthday' : 'un compleanno', anniversario: en ? 'an anniversary' : 'un anniversario', natale: en ? 'Christmas' : 'Natale' }[p.occ];
  var bud = { any: en ? 'any reasonable budget' : 'qualsiasi budget ragionevole', low: en ? 'under £25' : 'sotto le 25 £', mid: en ? '£25–75' : 'tra 25 e 75 £', high: en ? '£75–250' : 'tra 75 e 250 £' }[p.bud];
  return en ? 'Suggest 6 concrete, original gift ideas for ' + per + ', for ' + occ + ', budget ' + bud + ', buyable in the UK. Mix things and experiences, no clichés, with a typical price.'
    : 'Suggeriscimi 6 idee regalo concrete e originali per ' + per + ', per ' + occ + ', budget ' + bud + ', acquistabili nel Regno Unito. Mescola oggetti ed esperienze, niente idee banali, con il prezzo indicativo.';
}
function rgPref() { var p = {}; try { p = JSON.parse(lsGet(LSG + 'regali') || '{}') || {}; } catch (e) {} return { per: p.per || 'lei', occ: p.occ || 'pensiero', bud: p.bud || 'any', eta: p.eta || '4-6' }; }
function rgReg() { var c = cityGet(); if (c && isLon(c)) return 'GB'; var r = ((navigator.language || '').split('-')[1] || '').toUpperCase(); return ['GB', 'IT', 'ES', 'US', 'IE'].indexOf(r) >= 0 ? r : (window.LX_LANG === 'it' ? 'IT' : window.LX_LANG === 'es' ? 'ES' : 'GB'); }
function rgShop(v, reg) {
  if (v.k === 'experience') return { u: reg === 'GB' || reg === 'IE' ? gyg(v.s || v.n) : 'https://www.google.com/search?q=' + encodeURIComponent((v.s || v.n) + ' gift experience'), b: LXT('Cerca l’esperienza') };
  var d = { GB: 'amazon.co.uk', IE: 'amazon.co.uk', IT: 'amazon.it', ES: 'amazon.es', US: 'amazon.com' }[reg] || 'amazon.co.uk';
  return { u: 'https://www.' + d + '/s?k=' + encodeURIComponent(v.s || v.n) + (RG_AFF[d] ? '&tag=' + encodeURIComponent(RG_AFF[d]) : ''), b: LXT('Cerca e confronta') };
}
function rgList() { return get('regaliS', []); }
function rgSaved(L) {
  var old = $('rgS'); if (old) old.remove(); var S = rgList(); if (!S.length) return;
  var B = el('div', 'ogf'); B.id = 'rgS'; B.appendChild(el('h3', null, '⭐ ' + LXT('I regali che hai salvato')));
  B.appendChild(el('p', 'refn', LXT('Li vedi solo tu, su questo telefono.')));
  S.forEach(function (v) {
    var r = el('div', 'rgrow'), a = document.createElement('a'), sh = rgShop(v, rgReg()); a.href = sh.u; a.target = '_blank'; a.rel = 'noopener'; a.textContent = (v.k === 'experience' ? '🎟️ ' : '🎁 ') + v.n + (v.p ? ' · ' + v.p : '') + ' ↗'; r.appendChild(a);
    var x = el('button', 'lnk', '✕'); x.type = 'button'; x.setAttribute('aria-label', LXT('Togli')); x.onclick = function () { put('regaliS', rgList().filter(function (z) { return z.n !== v.n; })); rgSaved(L); }; r.appendChild(x); B.appendChild(r);
  });
  L.insertBefore(B, L.firstChild ? L.firstChild.nextSibling : null);
}
function giftPut(t, per, rid) {
  t = clean(t, 80); if (!t) return false;
  if (per === 'sorpresa') { var S = rgList().filter(function (z) { return z.n !== t; }); S.unshift({ n: t, k: 'thing', p: '', s: t }); put('regaliS', S.slice(0, 30)); track('regali-sorpresa'); return true; }
  var out = applyGift({ a: 'gadd', g: { id: 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: t, per: per, r: rid || '', ts: Date.now() } }, me.name);
  if (out) { sendEv(out); track('regali-lista'); } return !!out;
}
// ➕ aggiungere alla lista: dal Reel (tieni premuto) o a mano. Il nome si può correggere, poi si sceglie per chi.
function giftAdd(pre) {
  pre = pre || {}; var per = pre.per || 'fam';
  $('actT').textContent = '🎁 ' + LXT('Nella lista regali'); $('actP').textContent = LXT('Cos’è? Scrivi il regalo, poi scegli per chi.');
  var B = $('actB'); B.textContent = '';
  var inp = document.createElement('input'); inp.type = 'text'; inp.maxLength = 80; inp.id = 'gIn'; inp.placeholder = LXT('es. Lego del treno'); inp.value = clean(pre.t || '', 80); inp.setAttribute('aria-label', LXT('Il regalo')); B.appendChild(inp);
  var w = el('div', 'ogc gper');
  GPER.concat([['sorpresa', '🤫', 'Sorpresa per qualcuno del cerchio']]).forEach(function (o) { var b = el('button', 'chip', o[1] + ' ' + LXT(o[2])); b.type = 'button'; b.dataset.per = o[0]; b.setAttribute('aria-pressed', String(per === o[0])); b.onclick = function () { per = o[0]; w.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); nt.textContent = per === 'sorpresa' ? LXT('Resta solo sul tuo telefono: gli altri non lo vedono.') : LXT('Lo vede tutto il cerchio.'); }; w.appendChild(b); });
  B.appendChild(w);
  var nt = el('p', 'refn', LXT('Lo vede tutto il cerchio.')); B.appendChild(nt);
  var go = el('button', 'btn wide', LXT('Aggiungi')); go.type = 'button'; go.style.marginTop = '8px';
  go.onclick = function () { if (!clean(inp.value, 80)) { inp.focus(); return; } giftPut(inp.value, per, pre.r); $('actM').classList.remove('open'); $('mh').textContent = per === 'sorpresa' ? LXT('🤫 Salvato solo sul tuo telefono · lo trovi in Idee → 🎁 Regali') : LXT('🎁 Nella lista regali · la trovi in Idee → 🎁 Regali'); };
  B.appendChild(go);
  $('actX').onclick = function () { $('actM').classList.remove('open'); };
  $('actM').classList.add('open'); if (!inp.value) setTimeout(function () { try { inp.focus(); } catch (e) {} }, 300);
}
function rgShared(L) {
  var old = $('rgL'), B = el('div', 'ogf'); B.id = 'rgL';
  B.appendChild(el('h3', null, '🎁 ' + LXT('La lista regali del cerchio')));
  B.appendChild(el('p', 'refn', gifts.length ? LXT('La vedete tutti: chi compra segna ✓, così nessuno lo prende due volte.') : LXT('Tieni premuto un Reel → «Nella lista regali», oppure aggiungilo qui. La vedete tutti.')));
  GPER.forEach(function (g) {
    var G = gifts.filter(function (x) { return x.per === g[0]; }); if (!G.length) return;
    B.appendChild(el('div', 'gph', g[1] + ' ' + LXT(g[2])));
    G.forEach(function (v) {
      var r = el('div', 'rgrow' + (v.got ? ' got' : '')), ck = el('button', 'gck', v.got ? '✓' : ''); ck.type = 'button'; ck.setAttribute('aria-pressed', String(!!v.got)); ck.setAttribute('aria-label', v.got ? LXT('Preso: togli il segno') : LXT('Segna come preso'));
      ck.onclick = function () { ideaAct({ t: 'idea', a: 'ggot', id: v.id, on: !v.got }); if (!v.got) return; track('regali-preso'); };
      r.appendChild(ck);
      var a = document.createElement('a'), sh = rgShop({ k: 'thing', s: v.t, n: v.t }, rgReg()); a.href = sh.u; a.target = '_blank'; a.rel = 'noopener'; a.textContent = v.t + ' ↗'; a.onclick = function () { track('regali-lista-cerca'); }; r.appendChild(a);
      r.appendChild(el('span', 'gby', v.got ? LXT('preso da') + ' ' + (v.got === me.name ? LXT('te') : v.got) : (v.n === me.name ? '' : v.n)));
      var x = el('button', 'lnk', '✕'); x.type = 'button'; x.setAttribute('aria-label', LXT('Togli dalla lista')); x.onclick = function () { ask(LXT('Togliere dalla lista?'), v.t, LXT('Togli'), true).then(function (y) { if (y) ideaAct({ t: 'idea', a: 'gdel', id: v.id }); }); }; r.appendChild(x);
      B.appendChild(r);
    });
  });
  var ad = withIco(el('button', 'btn-o wide', ''), 'plus', LXT('Aggiungi un regalo')); ad.type = 'button'; ad.onclick = function () { giftAdd({}); }; B.appendChild(ad);
  if (old) old.replaceWith(B); else L.insertBefore(B, L.firstChild);
}
function rgForm() {
  var p = rgPref(), F = el('div', 'ogf');
  F.appendChild(el('h3', null, '🎁 ' + LXT('Idee regalo')));
  F.appendChild(el('p', 'refn', LXT('Scegli per chi e trovo 6 idee concrete, con il link per cercarle. Quello che salvi lo vedi solo tu.')));
  var row = function (lab, key, opts) {
    var r = el('div', 'ogr'); r.appendChild(el('span', 'ogl', LXT(lab))); var w = el('div', 'ogc');
    opts.forEach(function (o) { var b = el('button', 'chip', LXT(o[1])); b.type = 'button'; b.setAttribute('aria-pressed', String(p[key] === o[0])); b.onclick = function () { p[key] = o[0]; lsSet(LSG + 'regali', JSON.stringify(p)); if (key === 'per') { var ra = F.querySelector('.ogr[data-k="eta"]'); if (ra) ra.hidden = o[0] !== 'bimbi'; } w.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); }; w.appendChild(b); });
    r.appendChild(w); F.appendChild(r);
  };
  row('Per chi', 'per', [['lei', '💁‍♀️ Per lei'], ['lui', '🙋‍♂️ Per lui'], ['noi', '💑 Per noi due'], ['bimbi', '🧸 Per i bimbi'], ['amici', '🤝 Per un amico'], ['casa', '🏡 Per la casa']]);
  row('Età', 'eta', [['0-3', '0–3'], ['4-6', '4–6'], ['7-9', '7–9'], ['10-12', '10–12'], ['13-16', '13–16']]); F.lastChild.hidden = p.per !== 'bimbi';
  row('Occasione', 'occ', [['pensiero', 'Un pensiero'], ['compleanno', 'Compleanno'], ['anniversario', 'Anniversario'], ['natale', 'Natale']]);
  row('Budget', 'bud', [['any', 'Qualsiasi'], ['low', '£'], ['mid', '££'], ['high', '£££']]);
  var go = withIco(el('button', 'btn wide', ''), 'spark', LXT('Trova idee regalo')); go.type = 'button';
  go.onclick = function () { rgRun(rgPref(), F); };
  F.appendChild(go);
  return F;
}
function rgRun(p, F) {
  var L = $('inspL'), reg = rgReg();
  L.querySelectorAll('.og').forEach(function (x) { x.remove(); });
  var anchor = F.nextSibling, put0 = function (n) { L.insertBefore(n, anchor); };
  var hd = el('p', 'og ogh', '🎁 ' + LXT('Cerco idee regalo…')); put0(hd);
  for (var sk = 0; sk < 4; sk++) { var sc = el('div', 'insc skel og'); sc.appendChild(el('div', 'inth')); sc.appendChild(el('div', 'skl')); sc.appendChild(el('div', 'skl s2')); put0(sc); }
  hd.scrollIntoView({ behavior: 'smooth', block: 'start' });
  track('regali-' + p.per + '-' + p.occ);
  var shared = p.per === 'noi' || p.per === 'casa' || p.per === 'bimbi'; // per lei / per lui / per un amico: niente nel cerchio, è una sorpresa
  mbCall({ a: 'regali', per: p.per, eta: p.per === 'bimbi' ? p.eta : undefined, occ: p.occ, bud: p.bud, reg: reg, lang: window.LX_LANG || 'it' }, 16000).catch(function () { return { error: 'net' }; }).then(function (x) {
    L.querySelectorAll('.og.skel').forEach(function (n) { n.remove(); });
    var fb = !x || x.error || !x.items || !x.items.length; // AI occupata: idee pronte, scelte da noi
    if (fb) x = { items: rgFallback(p.per) };
    hd.textContent = fb ? '🎁 ' + LXT(navigator.onLine === false ? 'Idee regalo pronte (sei offline: quelle nuove tornano con la rete)' : 'Idee regalo pronte (l’AI è occupata: riprova tra poco per idee nuove)') : '🎁 ' + LXT('Idee regalo per voi');
    if (fb) put0(aiAskBtn(rgPrompt(p)));
    var cards = [];
    x.items.forEach(function (v, vi) {
      var sh = rgShop(v, reg), card = el('div', 'insc og'), th = el('button', 'inth pkth'); th.type = 'button'; th.appendChild(el('span', 'pke', v.k === 'experience' ? '🎟️' : '🎁')); card.appendChild(th);
      var ko = 'rg-' + v.n.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24), o0 = { k: ko, it: { s: ko, e: v.k === 'experience' ? '🎟️' : '🎁', t: v.n, d: [v.p, v.w].filter(Boolean).join(' · '), l: sh.u, b: 'Cerca' }, st: { u: sh.u } };
      th.onclick = function () { IV.list = cards.map(function (z) { return z.o; }); ideaView(vi); };
      cards.push({ o: o0, th: th });
      card.appendChild(el('div', 'intt', v.n)); card.appendChild(el('div', 'inch', [v.k === 'experience' ? LXT('Esperienza') : LXT('Oggetto'), v.p].filter(Boolean).join(' · ')));
      if (v.w) card.appendChild(el('div', 'ogw', v.w));
      var a = document.createElement('a'); a.className = 'btn-o wide'; a.href = sh.u; a.target = '_blank'; a.rel = 'noopener'; a.textContent = '🔍 ' + sh.b + ' ↗'; a.onclick = function () { track('regali-cerca'); }; card.appendChild(a);
      var gp = { bimbi: 'bimbi', casa: 'casa', noi: 'noi', amici: 'amici' }[p.per];
      if (gp) { var inL = gifts.some(function (z) { return z.t === clean(v.n, 80); }), gl = el('button', inL ? 'btn-o wide' : 'btn wide', inL ? '✓ ' + LXT('Nella lista regali') : '🎁 ' + LXT('Nella lista regali del cerchio')); gl.type = 'button'; gl.disabled = inL; gl.onclick = function () { giftPut(v.n, gp, ''); gl.textContent = '✓ ' + LXT('Nella lista regali'); gl.className = 'btn-o wide'; gl.disabled = true; }; card.appendChild(gl); } else {
      var saved = rgList().some(function (z) { return z.n === v.n; });
      var sv = el('button', saved ? 'btn-o wide' : 'btn wide', saved ? '✓ ' + LXT('Salvato') : '⭐ ' + LXT('Salva (lo vedi solo tu)')); sv.type = 'button'; sv.disabled = saved;
      sv.onclick = function () { var S = rgList().filter(function (z) { return z.n !== v.n; }); S.unshift({ n: v.n, k: v.k, p: v.p, s: v.s }); put('regaliS', S.slice(0, 30)); sv.textContent = '✓ ' + LXT('Salvato'); sv.className = 'btn-o wide'; sv.disabled = true; rgSaved(L); track('regali-salva'); };
      card.appendChild(sv);
      }
      if (shared) {
        var k = 'rg-' + v.n.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24), o = { k: k, it: { s: k, e: v.k === 'experience' ? '🎟️' : '🎁', t: v.n, d: [v.p, v.w].filter(Boolean).join(' · '), l: sh.u, b: 'Cerca' }, st: { u: sh.u } };
        var go = withIco(el('button', 'btn-o wide', ''), 'heart', LXT('Proponilo nel cerchio')); go.type = 'button'; go.onclick = function () { ideaWhat(o); track('regali-proponi'); }; card.appendChild(go);
      }
      put0(card);
    });
    put0(el('p', 'refn og', LXT('Idee scelte dall’AI: prezzi indicativi, controlla sul negozio prima di comprare.')));
    // un video per ogni idea regalo, se ne esiste uno pertinente (altrimenti resta l'icona)
    mbCall({ a: 'pack', qs: x.items.map(function (v) { return { q: (v.s || v.n).slice(0, 60), o: [] }; }), lang: 'en', reg: reg }).then(function (y) {
      if (!y || !y.items) return;
      y.items.forEach(function (vv, i) { var z = cards[i]; if (!vv || !z || !z.th.isConnected) return; z.o.st.u = 'https://www.youtube.com/shorts/' + vv.id; z.th.textContent = ''; var im = document.createElement('img'); im.src = 'https://i.ytimg.com/vi/' + vv.id + '/hqdefault.jpg'; im.alt = ''; im.loading = 'lazy'; z.th.appendChild(im); z.th.appendChild(el('span', 'inpl', '▶')); z.th.classList.remove('pkth'); });
    }, function () {});
  }, function () { L.querySelectorAll('.og.skel').forEach(function (n) { n.remove(); }); hd.textContent = navigator.onLine === false ? LXT('Sei offline: ecco le idee pronte. Quelle nuove tornano con la rete.') : LXT('Non sono riuscito a trovare idee adesso: riprova tra poco.'); });
}
// ✨ Idee per uscire: ora è una scheda fissa in basso (prima era una finestra). inspOpen(q) ci porta e, se serve, apre un argomento.
var xplQ = '';
function xplBuild() {
  var C = $('inspM'); if (!C || C.children.length) return;
  C.appendChild(el('p', 'refn', 'Cose da fare insieme dove vivete e i video più visti. Mandateli alla vostra persona o prenotate.'));
  var tp = el('div', 'fview'); tp.id = 'inspT'; C.appendChild(tp);
  var qi = document.createElement('input'); qi.id = 'inspQ'; qi.maxLength = 60; qi.placeholder = (window.LX_T || String)('Oppure scrivi un argomento…'); qi.setAttribute('aria-label', (window.LX_T || String)('Argomento'));
  var qb = el('button', 'btn-o', '🔍'); qb.type = 'button'; qb.setAttribute('aria-label', (window.LX_T || String)('Cerca'));
  qb.onclick = function () { var v = clean(qi.value, 60); if (v.length >= 3) { qi.blur(); inspLoad(v, /ristorant|cena|pranzo|brunch|colazion|\bbar\b|pub|caff|cosa fare|parc|muse|mercat|event|concert|mostr|teatr|bimbi|famiglia|serata|appuntament|weekend|gita|restaurant|dinner|lunch|cafe|coffee|things to do|park|museum|market|kids|date|night out|show|comer|cenar|restaurante|parque|museo|plan/i.test(v)); } }; qi.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); qb.click(); } });
  var rr = el('div'); rr.style.cssText = 'display:flex;gap:6px;margin:4px 0 8px'; qi.style.cssText = 'flex:1;min-width:0;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--s2);color:var(--t);font-size:16px'; qb.style.width = 'auto'; rr.appendChild(qi); rr.appendChild(qb); C.appendChild(rr);
  var L = el('div', 'insg'); L.id = 'inspL'; C.appendChild(L);
  C.appendChild(el('p', 'refn', 'Video pubblici da YouTube. Reelta manda a YouTube solo l’argomento che scegli.'));
  var T = INSP_T[window.LX_LANG] || INSP_T.it;
  var ob = el('button', 'chip', '🗓️ ' + (window.LX_T || String)('Oggi')); ob.type = 'button'; ob.dataset.q = '§oggi'; ob.onclick = function () { inspLoad('§oggi'); }; tp.appendChild(ob);
  var gb = el('button', 'chip', '🎁 ' + (window.LX_T || String)('Regali')); gb.type = 'button'; gb.dataset.q = '§regali'; gb.onclick = function () { inspLoad('§regali'); }; tp.appendChild(gb);
  var pb = el('button', 'chip', '📍 ' + (window.LX_T || String)('Idee in città')); pb.type = 'button'; pb.dataset.q = '§pack'; pb.onclick = function () { inspLoad('§pack'); }; tp.appendChild(pb);
  T.forEach(function (t, i) { if (INSP_QEN[i] === 'gift ideas') return; var b = el('button', 'chip', t); b.type = 'button'; b.dataset.q = t; b.onclick = function () { inspLoad(t, i === 0 || i === 1 || i === 3, INSP_QEN[i]); }; tp.appendChild(b); });
}
// quando le nostre ricerche finiscono: la stessa ricerca, già scritta, nelle app dei video (risultati veri, nessun limite)
function elsewhere(q) {
  var w = el('div', 'ailinks elsew'), e = encodeURIComponent(q), tag = q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  [['▶ YouTube', 'https://www.youtube.com/results?search_query=' + e, 'yt'], ['🎵 TikTok', 'https://www.tiktok.com/search?q=' + e, 'tt'], ['📸 Instagram', 'https://www.instagram.com/explore/tags/' + encodeURIComponent(tag) + '/', 'ig']].forEach(function (x) {
    if (x[2] === 'ig' && tag.length < 3) return;
    var a = el('a', 'chip', LXT('Guarda su') + ' ' + x[0]); a.href = x[1]; a.target = '_blank'; a.rel = 'noopener'; a.onclick = function () { track('altrove-' + x[2]); }; w.appendChild(a);
  });
  return w;
}
function inspOpen(q) { xplQ = q || ''; track('insp-apri'); showPane('xpl'); }
// loc: ricerche di posti (ristoranti, cose da fare, ricerca libera) → si aggiunge la città, così YouTube trova video del posto e non a caso
function inspCity(q) { var c = cityGet(); if (!c) return q; var cn = isLon(c) ? 'London' : c, l = q.toLowerCase(); return l.indexOf(cn.toLowerCase()) >= 0 || l.indexOf(c.toLowerCase()) >= 0 ? q : q + ' ' + cn; }
function inspLoad(q, loc, qx) {
  document.querySelectorAll('#inspT .chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.q === q)); });
  if (q === '§pack') { packLoad(); return; }
  if (q === '§regali') { var L1 = $('inspL'); L1.textContent = ''; L1.appendChild(rgForm()); rgSaved(L1); rgShared(L1); track('regali-apri'); return; }
  if (q === '§oggi') { var L0 = $('inspL'); L0.textContent = ''; L0.appendChild(ogForm()); packLoad(true); return; }
  var L = $('inspL'); L.textContent = ''; for (var sk = 0; sk < 4; sk++) { var sc = el('div', 'insc skel'); sc.appendChild(el('div', 'inth')); sc.appendChild(el('div', 'skl')); sc.appendChild(el('div', 'skl s2')); L.appendChild(sc); }
  var qq = loc ? inspCity(qx || q) : (qx || q);
  // un oggetto da comprare: cerco recensioni e confronti, non video qualsiasi dove compare per caso
  var buy = !loc && (inspAct(qx || q, qq) || {}).k === 'compra' && !/recension|review|reseña|migliori|best|mejores/i.test(qq);
  var qe = qq; if (buy) qq = qq + ' ' + ({ it: 'recensione', es: 'reseña' }[window.LX_LANG] || 'review');
  mbCall({ a: 'insp', q: qq, lang: window.LX_LANG || 'it', reg: ((navigator.language || '').split('-')[1] || '').slice(0, 2) }).then(function (x) {
    L.textContent = '';
    if (!x || x.error || !x.items) { L.appendChild(el('p', null, x && x.error === 'insp-off' ? 'L’ispirazione non è ancora attiva: arriva a breve.' : x && x.error === 'limite' ? 'Per oggi le nostre ricerche sono finite (domani si ricaricano): intanto guarda i video veri direttamente lì.' : 'Non sono riuscito a cercare adesso: intanto guarda i video veri direttamente lì.')); if (!x || x.error !== 'insp-off') L.appendChild(elsewhere(qe)); return; }
    if (!x.items.length) { L.appendChild(el('p', null, 'Niente su questo argomento: provane un altro.')); L.appendChild(elsewhere(qe)); return; }
    // via i video fuori tema: tengo quelli che nel titolo o nel canale nominano qualcosa della ricerca (se ne restano almeno 4)
    var STOP = { best: 1, from: 1, tips: 1, ideas: 1, with: 1, easy: 1, quick: 1, london: 1, londra: 1, londres: 1 }, W = qq.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(function (w) { return w.length > 3 && !STOP[w]; });
    var keep = x.items.filter(function (v) { var t = (v.t + ' ' + v.ch).toLowerCase(); return !W.length || W.some(function (w) { return t.indexOf(w) >= 0 || t.indexOf(w.slice(0, -1)) >= 0; }); });
    var items = keep.length >= 4 ? keep : x.items;
    if (buy) { var RV = /recension|review|reseña|miglior|best|mejor|vs\b|confronto|comparison|unboxing|prova|test|consigli|guida|guide|quale|which|top \d/i, rv = items.filter(function (v) { return RV.test(v.t); }); if (rv.length >= 3) items = rv; }
    var act = inspAct(qx || q, qq);
    var LV = items.map(function (v) { var u = 'https://www.youtube.com/shorts/' + v.id; return { k: 'yt-' + v.id, it: { s: 'yt-' + v.id, e: '▶', t: v.t, d: v.ch, l: act ? act.u : loc ? gmaps(qq) : u, b: act ? act.t : loc ? 'Mappa' : 'YouTube' }, st: { u: u } }; });
    items.forEach(function (v, vi) {
      var u = 'https://www.youtube.com/shorts/' + v.id, sent = feed.some(function (r) { return r.u === u; });
      var c = el('div', 'insc'), th = el('button', 'inth'); th.type = 'button'; th.setAttribute('aria-label', (window.LX_T || String)('Guarda') + ': ' + v.t);
      var im = document.createElement('img'); im.src = 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg'; im.alt = ''; im.loading = 'lazy'; th.appendChild(im); th.appendChild(el('span', 'inpl', '▶'));
      th.onclick = function () { IV.list = LV; ideaView(vi); track('insp-guarda'); }; // a schermo intero, come le storie: si scorre al video dopo
      c.appendChild(th); c.appendChild(el('div', 'intt', v.t)); c.appendChild(el('div', 'inch', v.ch));
      var go = el('button', sent ? 'btn-o wide' : 'btn', sent ? '✓ Nel cerchio' : '➕ Mandalo'); go.type = 'button'; go.disabled = sent;
      go.onclick = function () { postAll(u, ''); go.textContent = '✓ ' + (window.LX_T || String)('Mandato'); go.className = 'btn-o wide'; go.disabled = true; track('insp-manda'); };
      c.appendChild(go); if (act) { var ab = el('a', 'btn-o wide inact', act.b); ab.href = act.u; ab.target = '_blank'; ab.rel = 'noopener'; ab.onclick = function () { track('insp-' + act.k); }; c.appendChild(ab); } L.appendChild(c);
    });
  }, function () { L.textContent = ''; L.appendChild(el('p', null, navigator.onLine === false ? LXT('Sei offline: la ricerca torna con la rete.') : 'Non sono riuscito a cercare adesso: intanto guarda i video veri direttamente lì.')); L.appendChild(elsewhere(qe)); });
}
/* ---- 📍 Idee in città: cose da fare in due (o in gruppo) dove vivi, con il link per prenotare. Contiamo chi lo tocca. ---- */
// dal video alla realtà: sotto ogni video trovato, dove comprarlo o prenotarlo, in base a cosa si cerca.
// I codici affiliato (RG_AFF e simili) si aggiungono solo dopo il via libera: finché sono vuoti è un link normale.
function inspAct(q, qq) {
  var t = String(q || '').toLowerCase(), reg = rgReg();
  if (/hotel|soggiorn|vacanz|viaggi|weekend a|weekend in|gita|trip|holiday|getaway|stay|city break|vacacion|escapada/.test(t)) return { k: 'prenota-viaggio', t: 'Trova dove dormire', b: '🏨 ' + LXT('Trova dove dormire'), u: 'https://www.booking.com/searchresults.html?ss=' + encodeURIComponent(qq) };
  if (/tour|esperienz|bigliett|ticket|spa|corso|lezion|class|workshop|experience|attivit|activity|concert|show|mostr|teatr|museo|museum|escape room|kart|parco|zoo|actividad|entrada/.test(t)) return { k: 'prenota-esperienza', t: 'Prenota', b: '🎟️ ' + LXT('Prenota'), u: gyg(qq) };
  if (/ristorant|cena|pranzo|brunch|colazion|\bbar\b|pub|caff|cocktail|pizz|sushi|restaurant|dinner|lunch|cafe|coffee|food|comer|cenar|restaurante|mercat|market|parc|park|cosa fare|things to do|date|serata|night/.test(t)) return { k: 'mappa', t: 'Mappa', b: '📍 ' + LXT('Vedi sulla mappa'), u: gmaps(qq) };
  if (/ricett|recipe|receta|cucinar|cook/.test(t)) return null;
  var d = { GB: 'amazon.co.uk', IE: 'amazon.co.uk', IT: 'amazon.it', ES: 'amazon.es', US: 'amazon.com' }[reg] || 'amazon.co.uk';
  return { k: 'compra', t: 'Dove comprarlo', b: '🛒 ' + LXT('Dove comprarlo'), u: 'https://www.' + d + '/s?k=' + encodeURIComponent(q) + (RG_AFF[d] ? '&tag=' + encodeURIComponent(RG_AFF[d]) : '') };
}
function gmaps(q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }
function gyg(q) { return 'https://www.getyourguide.com/s/?q=' + encodeURIComponent(q); }
var PACK_LON = [
  { s: 'stafford-bar', e: '🍸', t: 'American Bar al The Stafford', d: 'St James’s · cocktail in un bar leggendario', q: 'American Bar The Stafford London', l: gmaps('American Bar The Stafford London'), b: 'Prenota', v: 'https://www.instagram.com/reel/Dfo738_RFrq/' },
  { s: 'stafford-tea', e: '🫖', t: 'Afternoon tea al The Stafford', d: 'St James’s · lusso a 5 stelle', q: 'The Stafford London afternoon tea', l: gmaps('The Stafford London'), b: 'Prenota', v: 'https://www.instagram.com/reel/De39FyPRwj-/' },
  { s: 'stafford-caines', e: '⭐', t: 'Cena da Michael Caines al The Stafford', d: 'St James’s · una stella Michelin', q: 'Michael Caines at The Stafford', l: gmaps('Michael Caines at The Stafford London'), b: 'Prenota', v: 'https://www.instagram.com/reel/DZkBViYs7jP/' },
  { s: 'stafford-terrace', e: '🌿', t: 'La terrazza dell’American Bar', d: 'St James’s · cocktail all’aperto, nel cortile', q: 'American Bar terrace The Stafford London', l: gmaps('American Bar The Stafford London'), b: 'Prenota', v: 'https://www.instagram.com/reel/DeolyknIgQl/' },
  { s: 'candlelight', o: ['candlelight', 'fever'], e: '🎶', t: 'Concerto a lume di candela', d: 'Candlelight · musica tra mille candele', q: 'Candlelight concert London', l: 'https://feverup.com/en/london/candlelight', b: 'Biglietti' },
  { s: 'o2', o: ['the o2'], e: '🎤', t: 'Concerti all’O2', d: 'Greenwich · i grandi live', q: 'The O2 arena London gig night', l: 'https://www.theo2.co.uk/events', b: 'Biglietti' },
  { s: 'stadio', o: ['tottenham hotspur', 'spurs'], e: '⚽', t: 'Tour dello stadio Tottenham', d: 'Spogliatoi e tunnel dei giocatori', q: 'Tottenham Hotspur Stadium tour skywalk', l: gyg('Tottenham Hotspur Stadium tour'), b: 'Prenota' },
  { s: 'everyman', o: ['everyman'], e: '🎬', t: 'Cinema Everyman', d: 'Divani, coperte e drink in sala', q: 'Everyman cinema sofa London', l: 'https://www.everymancinema.com/', b: 'Biglietti' },
  { s: 'bobbob', o: ['bob bob ricard'], e: '🥂', t: 'Bob Bob Ricard', d: 'Soho · il tasto «Press for Champagne» al tavolo', q: 'Bob Bob Ricard restaurant', l: gmaps('Bob Bob Ricard Soho London'), b: 'Prenota' },
  { s: 'oxo', o: ['oxo tower', 'harvey nichols'], e: '🌃', t: 'Cena all’OXO Tower', d: 'South Bank · tavoli sul Tamigi', q: 'OXO Tower Brasserie view', l: gmaps('OXO Tower Restaurant London'), b: 'Prenota' },
  { s: 'skygarden', o: ['sky garden'], e: '🌇', t: 'Sky Garden', d: 'City · vista gratis, si prenota', q: 'Sky Garden London', l: 'https://skygarden.london/', b: 'Prenota' },
  { s: 'borough', o: ['borough market'], e: '🥙', t: 'Borough Market', d: 'Street food da dividere', q: 'Borough Market food London', l: gmaps('Borough Market London'), b: 'Portami lì' },
  { s: 'primrose', o: ['royal parks'], e: '🌅', t: 'Primrose Hill al tramonto', d: 'Gratis · la vista più romantica', q: 'Primrose Hill sunset London', l: gmaps('Primrose Hill London'), b: 'Portami lì' }
];
var PACK_XMAS = [
  { s: 'winterwonderland', o: ['winter wonderland'], e: '🎡', t: 'Winter Wonderland a Hyde Park', d: 'Luci, giostre e vin brulé', q: 'Hyde Park Winter Wonderland', l: 'https://hydeparkwinterwonderland.com/', b: 'Biglietti' },
  { s: 'skate', o: ['somerset house', 'skate'], e: '⛸️', t: 'Pattinaggio a Somerset House', d: 'Sotto l’albero più bello di Londra', q: 'Skate at Somerset House', l: gmaps('Skate at Somerset House London'), b: 'Biglietti' },
  { s: 'kew', o: ['kew'], e: '✨', t: 'Christmas at Kew', d: 'Un sentiero di luci nei giardini', q: 'Christmas at Kew Gardens trail', l: gmaps('Kew Gardens London'), b: 'Biglietti' }
];
function xmasOn() { var d = new Date(), m = d.getMonth(), g = d.getDate(); return (m === 10 && g >= 15) || m === 11 || (m === 0 && g <= 6); }
// Stafford nascosta finché l'HR non dà il consenso scritto: per rimetterla basta STAFFORD_OK = true
var STAFFORD_OK = !!window.LX_STAFFORD; // i test la riaccendono per controllarla
function packLon() { return (xmasOn() ? PACK_XMAS : []).concat(PACK_LON).filter(function (x) { return STAFFORD_OK || !/^stafford-/.test(x.s); }); }
// al server: la ricerca e i nomi dei canali ufficiali (vincono su tutti gli altri)
function packQ(x) { return x.o ? { q: x.q, o: x.o } : x.q; }
function isLon(c) { return /^(Londra|London|Londres)$/.test(c); }
// Fuori Londra: solo 2–3 grandi eventi in città (niente piccoli locali), poi le idee di Londra per chi ci viene.
function packFor(c) {
  if (isLon(c)) return [];
  var gs = function (x) { return 'https://www.google.com/search?q=' + encodeURIComponent(x); };
  return [
    { s: 'concerti', e: '🎤', t: 'Un grande concerto', d: { f: 'I prossimi live a', c: c }, q: 'concert ' + c + ' live crowd', l: gs('concerti ' + c + ' biglietti'), b: 'Biglietti' },
    { s: 'partita', e: '⚽', t: 'Una partita allo stadio', d: { f: 'Biglietti ufficiali a', c: c }, q: 'stadium atmosphere ' + c, l: gs('biglietti ufficiali partita ' + c), b: 'Biglietti' },
    { s: 'esperienze', e: '🎟️', t: 'Un’esperienza insieme', d: { f: 'Tour e attività a', c: c }, q: 'things to do ' + c, l: gyg(c), b: 'Prenota' }
  ];
}
var CITY_TZ = { 'Europe/London': 'Londra', 'America/New_York': 'New York', 'Europe/Paris': 'Parigi', 'Europe/Madrid': 'Madrid', 'Europe/Berlin': 'Berlino', 'Europe/Dublin': 'Dublino', 'Europe/Amsterdam': 'Amsterdam', 'America/Los_Angeles': 'Los Angeles', 'America/Chicago': 'Chicago', 'Europe/Lisbon': 'Lisbona' };
var CITY_IT = ['Milano', 'Roma', 'Napoli', 'Torino', 'Firenze', 'Bologna'];
function tzName() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } }
function cityGet() { var c = ''; try { c = localStorage.getItem(LSG + 'city') || ''; } catch (e) {} return c || CITY_TZ[tzName()] || ''; }
function citySet(c) { lsSet(LSG + 'city', c); pkvBusy = 0; setTimeout(function () { try { storiesRender(); packPrefetch(); } catch (e) {} }, 0); track('citta-' + c.toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 24)); }
function cityRegion(c) { return isLon(c) ? 'GB' : CITY_IT.indexOf(c) >= 0 || tzName() === 'Europe/Rome' ? 'IT' : tzName().indexOf('America/') === 0 ? 'US' : ((navigator.language || '').split('-')[1] || 'GB').slice(0, 2); }
function cityPick(then) {
  var opts = (tzName() === 'Europe/Rome' ? CITY_IT : ['Londra', 'Milano', 'Roma', 'New York', 'Parigi', 'Madrid']).map(function (c) { return { t: '📍 ' + c, f: function () { citySet(c); then(c); } }; });
  opts.push({ t: '✏️ ' + (window.LX_T || String)('Un’altra città'), f: function () { var v = clean(prompt((window.LX_T || String)('Scrivi la tua città') + ':') || '', 40).trim(); if (v.length >= 2) { citySet(v); then(v); } } });
  sheet('📍 ' + (window.LX_T || String)('Dove siete?'), (window.LX_T || String)('Vi mostro idee per uscire nella vostra città.'), opts);
}
function packLoad(keep) {
  var L = $('inspL'), c = cityGet(); if (!keep) L.textContent = '';
  if (!c) { cityPick(function () { packLoad(); }); L.appendChild(el('p', 'refn', '📍 ' + (window.LX_T || String)('Scegli la tua città.'))); return; }
  var top = el('div'); top.style.cssText = 'grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:8px';
  top.appendChild(el('b', null, '📍 ' + c)); var ch = el('button', 'chip', (window.LX_T || String)('Cambia città')); ch.type = 'button'; ch.onclick = function () { cityPick(function () { packLoad(); }); }; top.appendChild(ch); L.appendChild(top);
  var loc = packFor(c), P = loc.concat(packLon()), cards = [], slug = c.toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 16);
  P.forEach(function (it, i) {
    if (loc.length && i === loc.length) { var h = el('p', null, '✈️ ' + (window.LX_T || String)('Se venite a Londra')); h.style.cssText = 'grid-column:1/-1;font-weight:800;margin:10px 0 0'; L.appendChild(h); }
    var k = it.s + (i < loc.length ? '-' + slug : '');
    var card = el('div', 'insc'), th = el('div', 'inth pkth'); th.appendChild(el('span', 'pke', it.e)); card.appendChild(th);
    card.appendChild(el('div', 'intt', it.t)); card.appendChild(el('div', 'inch', typeof it.d === 'string' ? it.d : (window.LX_T || String)(it.d.f) + ' ' + it.d.c));
    var a = document.createElement('a'); a.className = 'btn'; a.href = it.l; a.target = '_blank'; a.rel = 'noopener'; withIco(a, it.b === 'Biglietti' ? 'ticket' : it.b === 'Prenota' ? 'cal' : 'pin', (window.LX_T || String)(it.b) + ' ↗');
    a.onclick = function () { track('idea-link-' + k); }; card.appendChild(a);
    var go = withIco(el('button', 'btn-o wide', ''), 'plus', LXT('Mandalo')); go.type = 'button'; card.appendChild(go);
    var st = { u: it.l };
    go.onclick = function () { postAll(st.u, it.t); go.textContent = '✓ ' + (window.LX_T || String)('Mandato'); go.disabled = true; track('idea-manda-' + k); };
    if (it.v) st.u = it.v;
    th.onclick = function () { ideaView(i); };
    L.appendChild(card); cards.push({ th: th, st: st, it: it, k: k, reg: i < loc.length ? cityRegion(c) : 'GB' });
  });
  IV.list = cards;
  var wv = withIco(el('button', 'btn wide', ''), 'play', (window.LX_T || String)('Guarda i video delle idee')); wv.type = 'button'; wv.style.gridColumn = '1/-1'; wv.onclick = function () { ideaView(0); }; L.insertBefore(wv, top.nextSibling);
  L.appendChild(el('p', 'refn', (window.LX_T || String)('Idee scelte da Reelta. I video vengono dai canali ufficiali e da YouTube.')));
  track('idee-viste-' + (loc.length ? 'altra-citta' : 'londra'));
  var fill = function (off) { return function (x) {
    if (!x || !x.items) return;
    x.items.forEach(function (v, i) {
      var o = cards[off + i]; if (!v || !o || !o.th.isConnected) return;
      if (!o.it.v) o.st.u = 'https://www.youtube.com/shorts/' + v.id;
      var b = el('button', 'inth'); b.type = 'button'; b.setAttribute('aria-label', (window.LX_T || String)('Guarda') + ': ' + o.it.t);
      var im = document.createElement('img'); im.src = 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg'; im.alt = ''; im.loading = 'lazy'; b.appendChild(im); b.appendChild(el('span', 'inpl', '▶'));
      b.onclick = function () { ideaView(cards.indexOf(o)); };
      o.th.replaceWith(b); o.th = b;
    });
  }; };
  if (loc.length) mbCall({ a: 'pack', qs: loc.map(packQ), lang: window.LX_LANG || 'it', reg: cityRegion(c) }).then(fill(0), function () {});
  mbCall({ a: 'pack', qs: packLon().map(packQ), lang: 'en', reg: 'GB' }).then(fill(loc.length), function () {});
}
/* ---- icone disegnate (stesso tratto della barra in basso) al posto delle emoji nei tasti ---- */
var ICO = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  mark: '<path d="M6.5 4.5h11v15.5L12 16l-5.5 4z"/>',
  dots: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2h9.2L17.5 7M10.3 10.5v5.5M13.7 10.5v5.5"/>',
  bag: '<path d="M5 8h14l-1.2 12.5H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  bed: '<path d="M3.5 18.5v-11M3.5 14h17v4.5M20.5 14v-2.5a3 3 0 0 0-3-3h-6v5.5"/><circle cx="7.5" cy="11" r="1.8"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  ticket: '<path d="M3.5 7.5h17v3a2 2 0 0 0 0 4v3h-17v-3a2 2 0 0 0 0-4z"/><path d="M14.5 7.5v10" stroke-dasharray="2 2.2"/>',
  pin: '<path d="M12 21s-6.5-5.8-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
  spark: '<path d="M12 3.5l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z"/><path d="M18.5 3.5v3M17 5h3"/>',
  chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16 14.2a4.6 4.6 0 0 1 5 4.8"/>',
  copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  share: '<path d="M12 3.5v11M8 7.5l4-4 4 4M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/>'
};
function icoEl(n) { var w = document.createElement('span'); w.innerHTML = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (ICO[n] || '') + '</svg>'; return w.firstChild; }
var EMOJI_LEAD = /^[☀-➿\uD83C-􏰀-\uDFFF️‍⭐⬆↔-↪⏩-⏺\s]+/;
function withIco(b, n, label) {
  if (!b) return b; var t = label != null ? label : b.textContent.replace(EMOJI_LEAD, '').trim();
  b.textContent = ''; b.appendChild(icoEl(n)); b.appendChild(document.createTextNode(t)); b.classList.add('hasico'); return b;
}
function decorateStatic() {
  [['invWA', 'chat'], ['invSh', 'share'], ['invCp', 'copy'], ['kMore', 'users'], ['haveInv', 'mail'], ['gdDemo', 'play']].forEach(function (x) { try { if ($(x[0]) && !$(x[0]).querySelector('.ico')) withIco($(x[0]), x[1]); } catch (e) {} });
}
setTimeout(decorateStatic, 0);
/* ---- ▶ le idee come i Reel: video a tutto schermo dai canali ufficiali, sotto «Fatelo insieme» e «Prenota» ---- */
var IV = { list: [], i: 0 };
function ideaVidOf(o) { if (o.st && /^\.\/v\/[\w-]+\.mp4$/.test(o.st.u)) return o.st.u; return o.st && /^https:\/\/(www\.)?(youtube\.com|youtu\.be|instagram\.com|tiktok\.com|vm\.tiktok\.com|facebook\.com)\//.test(o.st.u) ? o.st.u : ''; }
function ideaView(i) {
  if (!IV.list.length) return; var V = $('ideaV');
  if (!V) {
    V = el('div'); V.id = 'ideaV'; V.setAttribute('role', 'dialog'); V.setAttribute('aria-modal', 'true');
    V.innerHTML = '<div class="ivtop"><button type="button" class="ivx" id="ivX" aria-label="Chiudi">✕</button><span id="ivN"></span></div><div class="ivst" id="ivS"></div><div class="ivp" id="ivP"><b id="ivT"></b><span id="ivD"></span><div class="ivb"><button type="button" class="btn" id="ivGo"></button><a class="btn-o" id="ivBk" target="_blank" rel="noopener"></a></div><div class="ivnav"><button type="button" class="btn-o" id="ivPr" aria-label="Precedente">‹</button><span id="ivC"></span><button type="button" class="btn-o" id="ivNx" aria-label="Successivo">›</button></div></div>';
    document.body.appendChild(V);
    $('ivX').onclick = ideaViewClose; $('ivPr').onclick = function () { ideaViewAt(IV.i - 1); }; $('ivNx').onclick = function () { ideaViewAt(IV.i + 1); };
    var y0 = null; [$('ivP'), V.querySelector('.ivtop')].forEach(function (z) { z.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true }); z.addEventListener('touchend', function (e) { if (y0 === null) return; var d = e.changedTouches[0].clientY - y0; y0 = null; if (Math.abs(d) > 50) ideaViewAt(IV.i + (d < 0 ? 1 : -1)); }, { passive: true }); });
    document.addEventListener('keydown', function (e) { if (!V.classList.contains('open')) return; if (e.key === 'Escape') ideaViewClose(); if (e.key === 'ArrowDown' || e.key === 'ArrowRight') ideaViewAt(IV.i + 1); if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ideaViewAt(IV.i - 1); });
  }
  withIco($('ivGo'), 'heart', LXT('Fatelo insieme')); $('ivGo').onclick = function () { ideaWhat(IV.list[IV.i]); };
  V.classList.add('open'); track('idee-video-apri'); ideaViewAt(i || 0);
}
function ideaViewAt(i) {
  var n = IV.list.length; if (!n) return; IV.i = (i + n) % n; var o = IV.list[IV.i], it = o.it, S = $('ivS'); S.textContent = '';
  var u = ideaVidOf(o); try { var sn = JSON.parse(localStorage.getItem(LSG + 'ivseen') || '{}'); if (!sn[o.k]) { sn[o.k] = 1; localStorage.setItem(LSG + 'ivseen', JSON.stringify(sn)); } } catch (e) {}
  if (u && /^\.\/v\//.test(u)) { // video del locale caricato da noi (con il loro permesso): parte da solo, in loop; un tocco per l'audio
    var vd = document.createElement('video'); vd.src = u; vd.autoplay = true; vd.muted = true; vd.loop = true; vd.playsInline = true; vd.setAttribute('playsinline', ''); vd.style.objectFit = 'cover';
    var sb = el('button', 'ivsnd', '🔇'); sb.type = 'button'; sb.setAttribute('aria-label', LXT('Audio')); sb.onclick = function () { vd.muted = !vd.muted; sb.textContent = vd.muted ? '🔇' : '🔊'; if (!vd.muted) vd.play().catch(function () {}); };
    vd.onclick = function () { sb.click(); }; var wr = el('div', 'ivvw'); wr.appendChild(vd); wr.appendChild(sb); S.appendChild(wr); vd.play().catch(function () {}); track('idea-guarda-' + o.k);
  } else if (u && /instagram\.com\/(reels?|p|tv)\/([\w-]+)/.test(u)) { // reel di Instagram: il riquadro ufficiale intero, con il nome dell'account, senza ritagli
    var igid = /instagram\.com\/(?:reels?|p|tv)\/([\w-]+)/.exec(u)[1], igw = el('div', 'ivig'), igf = document.createElement('iframe');
    igf.src = 'https://www.instagram.com/p/' + igid + '/embed/'; igf.title = LXT(it.t); igf.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture'; igf.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups'); igf.referrerPolicy = 'strict-origin-when-cross-origin';
    igw.appendChild(igf); S.appendChild(igw); track('idea-guarda-' + o.k);
    var tip = el('div', 'ivtip', '▶ ' + LXT('Tocca il video per farlo partire')); S.appendChild(tip); setTimeout(function () { tip.classList.add('off'); }, 3500);
  } else if (u) { var m = mediaRaw({ u: u, n: LXT(it.t), id: 'iv' + IV.i }, true); S.appendChild(m); track('idea-guarda-' + o.k); }
  else { var ph = el('div', 'ivph'); ph.appendChild(el('span', null, it.e)); S.appendChild(ph); }
  $('ivN').textContent = '📍 ' + (cityGet() || '');
  $('ivT').textContent = LXT(it.t); $('ivD').textContent = typeof it.d === 'string' ? LXT(it.d) : LXT(it.d.f) + ' ' + it.d.c;
  var bk = $('ivBk'); bk.href = it.l; withIco(bk, it.b === 'Biglietti' || it.b === 'Prenota' ? 'ticket' : it.b === 'Trova dove dormire' ? 'bed' : it.b === 'Dove comprarlo' ? 'bag' : 'pin', LXT(it.b) + ' ↗'); bk.onclick = function () { track('idea-link-' + o.k); };
  $('ivC').textContent = (IV.i + 1) + ' / ' + n;
}
function ideaViewClose() { var V = $('ideaV'); if (!V) return; V.classList.remove('open'); $('ivS').textContent = ''; try { storiesRender(); } catch (e) {} }
// «Fatelo insieme»: proporlo alla propria persona (diventa un piano da decidere), scegliere già il giorno, o mandare il video nel cerchio
function ideaWhat(o) {
  var it = o.it, id = ('pi-' + o.k).slice(0, 40), desc = typeof it.d === 'string' ? LXT(it.d) : LXT(it.d.f) + ' ' + it.d.c;
  var mk = function () { var x = findIdea(id); if (x) { if (!x.v[me.name]) ideaAct({ t: 'idea', a: 'vote', id: id, on: true }); return findIdea(id); } var v = {}; v[me.name] = 1; ideaAct({ t: 'idea', a: 'add', i: { id: id, r: '', k: /^(bobbob|oxo|stafford-caines|romantico|brunch)/.test(o.k) ? 'cibo' : 'esperienza', p: clean(LXT(it.t), 60), o: clean(desc, 200), ts: Date.now(), v: v, q: '', u: it.l } }); return findIdea(id); };
  sheet('💞 ' + LXT('Cosa volete fare?'), LXT(it.t), [
    { ic: 'heart', t: LXT('Proponilo alla tua persona'), f: function () { mk(); track('idea-proponi-' + o.k); $('mh').textContent = LXT('Piano proposto: gli altri lo trovano in «Decidete insieme».'); ideaViewClose(); try { $('inspM').classList.remove('open'); } catch (e) {} } },
    { ic: 'cal', t: LXT('Scegliete il giorno'), f: function () { var x = mk(); track('idea-giorno-' + o.k); ideaViewClose(); try { $('inspM').classList.remove('open'); } catch (e) {} if (x) { showPane('ideas'); pickDay(x); } } },
    { ic: 'plus', t: LXT('Manda il video nel cerchio'), f: function () { postAll(o.st.u, LXT(it.t)); track('idea-manda-' + o.k); } }
  ]);
}
/* ---- 📍 le idee come «storie» in cima al feed: sempre a portata di dito, prima quelle con il video ufficiale del locale ---- */
var PK_SHORT = { 'stafford-bar': 'American Bar', 'stafford-tea': 'Afternoon tea', 'stafford-caines': 'Michael Caines', 'stafford-terrace': 'Terrazza', winterwonderland: 'Winter Wonderland', skate: 'Pattinaggio', kew: 'Kew', candlelight: 'Candlelight', o2: 'O2', stadio: 'Tottenham', everyman: 'Cinema', bobbob: 'Bob Bob Ricard', oxo: 'OXO Tower', skygarden: 'Sky Garden', borough: 'Borough', primrose: 'Primrose Hill', concerti: 'Concerti', partita: 'Partita', esperienze: 'Esperienze' };
var PKV = {}, pkvBusy = 0;
function packList() {
  var c = cityGet(), loc = c && !isLon(c) ? packFor(c) : [], slug = (c || '').toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 16);
  var L = loc.map(function (it) { return { it: it, k: it.s + '-' + slug }; }).concat(packLon().map(function (it) { return { it: it, k: it.s }; }));
  L.forEach(function (o) { o.st = { u: o.it.v || (PKV[o.it.q] ? 'https://www.youtube.com/shorts/' + PKV[o.it.q] : o.it.l) }; });
  return L.filter(function (o) { return o.it.v; }).concat(L.filter(function (o) { return !o.it.v; }));
}
function packPrefetch() {
  if (pkvBusy || !srvOn()) return; pkvBusy = 1; var c = cityGet(), loc = c && !isLon(c) ? packFor(c) : [];
  var got = function (qs) { return function (x) { if (x && x.items) x.items.forEach(function (v, i) { if (v && v.id) PKV[qs[i]] = v.id; }); try { storiesRender(); } catch (e) {} }; };
  var q1 = packLon().map(function (x) { return x.q; }); mbCall({ a: 'pack', qs: packLon().map(packQ), lang: 'en', reg: 'GB' }).then(got(q1), function () {});
  if (loc.length) { var q2 = loc.map(function (x) { return x.q; }); mbCall({ a: 'pack', qs: loc.map(packQ), lang: window.LX_LANG || 'it', reg: cityRegion(c) }).then(got(q2), function () {}); }
}
function storiesEl() {
  var c0 = cityGet(); if (!feed.length || !c0 || !isLon(c0) || newCount() > 0) return null; // prima il contenuto: le idee in cima solo per chi vive a Londra, a feed avviato, senza Reel nuovi da vedere
  var L = packList(); if (!L.length || !me || !me.name) return null;
  var seen = {}; try { seen = JSON.parse(localStorage.getItem(LSG + 'ivseen') || '{}'); } catch (e) {}
  var row = el('div', 'stor'); row.id = 'stor'; row.setAttribute('aria-label', LXT('Idee per uscire'));
  L.forEach(function (o, i) {
    var b = el('button', 'sto' + (seen[o.k] ? ' seen' : '')); b.type = 'button'; b.setAttribute('aria-label', LXT(o.it.t));
    var ring = el('span', 'stor-r'), face = el('span', 'stor-f'), yid = /youtube\.com\/shorts\/([\w-]+)/.exec(o.st.u);
    if (yid) { var im = document.createElement('img'); im.src = 'https://i.ytimg.com/vi/' + yid[1] + '/default.jpg'; im.alt = ''; im.loading = 'lazy'; face.appendChild(im); } else face.textContent = o.it.e;
    ring.appendChild(face); b.appendChild(ring); b.appendChild(el('span', 'stor-n', LXT(PK_SHORT[o.it.s] || o.it.t)));
    if (o.it.v) b.appendChild(el('span', 'stor-v', '▶'));
    b.onclick = function () { track('storia-' + o.k); IV.list = packList(); ideaView(i); };
    row.appendChild(b);
  });
  return row;
}
function storiesRender() { var W = $('storW'); if (!W) return; var n = storiesEl(), sl = $('stor') ? $('stor').scrollLeft : 0; W.textContent = ''; if (n) { W.appendChild(n); n.scrollLeft = sl; } }
function packAuto() {
  if (navigator.webdriver || !srvOn() || document.querySelector('.mod.open') || !me || !me.name) return false;
  var seen = 1; try { seen = localStorage.getItem(LSG + 'packSeen'); } catch (e) {} if (seen) return false;
  lsSet(LSG + 'packSeen', '1');
  track('idee-auto'); inspOpen(); return true;
}
function lazyMedia(r) {
  var ph = el('div', 'mph'); ph._r = r;
  if (!('IntersectionObserver' in window)) { mediaIn(ph); ph._on = true; return ph; }
  if (!feedNear) {
    feedNear = new IntersectionObserver(function (es) { es.forEach(function (e) { var p = e.target; if (e.isIntersecting && !p._on) { p._on = true; p.textContent = ''; mediaIn(p); } }); }, { root: $('feed'), rootMargin: '150% 0px' });
    feedFar = new IntersectionObserver(function (es) { es.forEach(function (e) { var p = e.target; if (!e.isIntersecting && p._on && p.isConnected) { p._on = false; p.textContent = ''; } }); }, { root: $('feed'), rootMargin: '500% 0px' });
  }
  setTimeout(function () { feedNear.observe(ph); feedFar.observe(ph); }, 0);
  return ph;
}
