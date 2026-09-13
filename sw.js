/* ============================================================
   Ajedrez en el Aula · Service Worker
   Guarda TODO el sitio (páginas y recursos) la primera vez que se
   abre con internet. Después funciona sin conexión: puedes navegar
   por todas las páginas y jugar aunque se caiga el internet, incluso
   recargando la página.

   Estrategia:
   - install: precarga todas las páginas y recursos (de forma resistente:
     si algo falla, el resto se guarda igual).
   - fetch (mismo origen): "stale-while-revalidate" — responde al instante
     desde el caché y, si hay internet, actualiza el caché en segundo plano.
     Sin conexión, sirve desde el caché; una navegación sin caché cae en
     index.html.
   - fuentes de Google: caché aparte, para que también funcionen sin conexión.

   Al cambiar el sitio, sube el número de VERSION para renovar el caché.
   ============================================================ */
'use strict';
var VERSION = 'aa-cache-v3';
var FONTS   = 'aa-fonts-v1';

// rutas relativas (funciona tanto en la raíz como en un subdirectorio de GitHub Pages)
var PRECACHE = [
  './',
  'index.html','aprende.html','guia.html','pedagogia.html','reglas.html',
  'practicas.html','estrategias.html','jugar.html','ruta.html','arbitraje.html',
  'imprimibles.html','nivel.html','aviso-legal.html',
  'assets/theme.css','assets/app.js','assets/chess.js','assets/board.js',
  'assets/puzzles.js','assets/i18n-puzzles.js','assets/guia-i18n.js','assets/socratic.js',
  'manifest.webmanifest','icon.svg'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(VERSION).then(function(cache){
      // guarda cada recurso por separado: si uno falla, no se pierde el resto
      return Promise.all(PRECACHE.map(function(url){
        return cache.add(new Request(url, {cache:'reload'})).catch(function(){});
      }));
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k!==VERSION && k!==FONTS) return caches.delete(k);   // limpia versiones viejas
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch(err){ return; }

  // Tipografías de Google: caché aparte, cache-first (para funcionar sin conexión)
  if(/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.hostname)){
    e.respondWith(
      caches.open(FONTS).then(function(cache){
        return cache.match(req).then(function(hit){
          var net = fetch(req).then(function(res){
            if(res && (res.ok || res.type==='opaque')) cache.put(req, res.clone());
            return res;
          }).catch(function(){ return hit; });
          return hit || net;
        });
      })
    );
    return;
  }

  // Solo gestionamos nuestro propio origen
  if(url.origin !== self.location.origin) return;

  // stale-while-revalidate: caché al instante + actualización en segundo plano
  e.respondWith(
    caches.open(VERSION).then(function(cache){
      return cache.match(req).then(function(hit){
        var net = fetch(req).then(function(res){
          if(res && res.status===200 && res.type==='basic') cache.put(req, res.clone());
          return res;
        }).catch(function(){
          // sin conexión y sin caché: una navegación cae en la portada
          if(req.mode==='navigate') return cache.match('index.html') || cache.match('./');
          return undefined;
        });
        return hit || net;
      });
    })
  );
});
