#!/usr/bin/env python3
"""Reelta: costruisce i file pubblicati a partire da src/.

  src/boot.js      -> boot.js   (in <head>: trasloco, altezza schermo, installazione)
  src/vault.js     -> vault.js  (fine <body>: cassaforte PIN, poi carica app.js)
  src/app/*.js     -> app.js    (l'app vera, i pezzi uniti in ordine di nome)

I pezzi di src/app condividono lo stesso spazio globale, come prima quando erano un unico
<script>: unirli in ordine dà esattamente lo stesso programma.
Uso: python3 tools/build.py      (dalla cartella Loopix)
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
HEAD = '/* © 2026 Reelta. Tutti i diritti riservati. File generato da tools/build.py: modifica src/%s */\n'

parts = sorted(glob.glob('src/app/*.js'))
ver = re.search(r"var APP_VER = '(v\d+)'", ''.join(open(p, encoding='utf-8').read() for p in parts)).group(1)

out = [HEAD % 'app/*.js']
for p in parts:
    out.append('/* ==== %s ==== */\n' % p)
    out.append(open(p, encoding='utf-8').read())
full = ''.join(out)
open('/tmp/reelta-app.full.js', 'w', encoding='utf-8').write(full)  # versione leggibile, per controlli

# 🚀 file più leggeri: spazi e nomi interni accorciati (i nomi globali restano uguali). Se esbuild non c'è, resta leggibile.
import shutil, subprocess
ESB = shutil.which('esbuild') or ('/opt/npm-tools/node_modules/.bin/esbuild' if os.path.exists('/opt/npm-tools/node_modules/.bin/esbuild') else None)
def mini(code, loader='js'):
    if not ESB: return code
    r = subprocess.run([ESB, '--minify', '--charset=utf8', '--loader=' + loader, '--log-level=warning'], input=code.encode('utf-8'), capture_output=True)
    if r.returncode: print('⚠️  esbuild:', r.stderr.decode()[:300]); sys.exit(1)
    return r.stdout.decode('utf-8')
open('app.js', 'w', encoding='utf-8').write(HEAD % 'app/*.js' + mini(full))

for name in ('store.js', 'boot.js', 'vault.js'):
    s = open('src/' + name, encoding='utf-8').read().replace('__BUILD__', ver)
    open(name, 'w', encoding='utf-8').write(HEAD % name + mini(s))

# controlli: la versione del service worker e nessuno script dentro l'HTML (la CSP li bloccherebbe)
errs = []
sw = open('sw.js', encoding='utf-8').read()
if "'loopix-%s'" % ver not in sw: errs.append('sw.js: la cache non è loopix-%s' % ver)
for f in ('app.js', 'store.js', 'boot.js', 'vault.js'):
    if "'%s'" % f not in sw: errs.append('sw.js: manca %s nella lista dei file' % f)
html = open('index.html', encoding='utf-8').read()
if re.search(r'<script(?![^>]*\bsrc=)[^>]*>', html): errs.append('index.html: c’è uno <script> senza src')
if re.search(r'<[^>]+\son[a-z]+\s*=', html): errs.append('index.html: c’è un gestore inline (onclick=…)')
if "'unsafe-inline'" in re.search(r'script-src[^;]*', html).group(0): errs.append('CSP: script-src permette ancora gli script inline')
for e in errs: print('⚠️ ', e)
print('build %s: app.js %d KB (%d pezzi), boot.js, vault.js%s' % (ver, os.path.getsize('app.js') // 1024, len(parts), '' if not errs else ' — CON AVVISI'))
sys.exit(1 if errs else 0)
