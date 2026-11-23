# Codice di Reelta

- `boot.js`: in `<head>`: trasloco tra indirizzi, altezza schermo su iPhone, installazione.
- `vault.js`: fine `<body>`: cassaforte PIN / Face ID. Quando i dati sono aperti carica `app.js`.
- `app/NN-*.js`: l'app, divisa per argomento. I pezzi condividono lo spazio globale e vengono uniti in ordine.

Dopo ogni modifica: `python3 tools/build.py` (genera app.js, boot.js, vault.js e controlla versione, service worker e CSP), poi `node test/prove.js`.
Niente script né `onclick=` dentro index.html: la CSP li blocca.
