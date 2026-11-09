var C='loopix-v105',F=['./','index.html','privacy.html','scopri.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png', 'logo-reelta.webp', 'lang.js'];
// installa la versione nuova scaricando i file freschi (non dalla cache del browser)
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return Promise.all(F.map(function(f){return fetch(f,{cache:'reload'}).then(function(r){if(r.ok)return c.put(f,r)})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
// apertura istantanea: i file dell'app arrivano subito dalla cache e si aggiornano in sottofondo
self.addEventListener('fetch',function(e){
  var q=e.request;if(q.method!=='GET')return;var u=new URL(q.url);if(u.origin!==location.origin)return;
  var key=u.origin+u.pathname;
  if(q.cache==='no-store'){e.respondWith(fetch(q).catch(function(){return caches.match(key)}));return}
  e.respondWith(caches.open(C).then(function(c){return c.match(key).then(function(hit){
    var net=fetch(key,{cache:'no-cache'}).then(function(r){if(r.ok)c.put(key,r.clone());return r});
    if(hit){e.waitUntil(net.catch(function(){}));return hit}
    return net.catch(function(){return c.match(new URL('index.html',self.registration.scope).href)})})}))});
self.addEventListener('push',function(e){var d={};try{d=e.data?e.data.json():{}}catch(x){}e.waitUntil(self.registration.showNotification(d.title||'Reelta',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.q?'reelta-'+d.q:'reelta',data:{q:d.q==='back'?'back':''}}))});
self.addEventListener('notificationclick',function(e){e.notification.close();var q=(e.notification.data||{}).q;e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(l){for(var i=0;i<l.length;i++){if('focus' in l[i]){if(q)l[i].postMessage({q:q});return l[i].focus()}}return self.clients.openWindow(q?'./?q='+q:'./')}))});
