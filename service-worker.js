self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('fitcal-v1').then(cache => cache.addAll(['./','./index.html','./style.css','./app.js','./plan.js','./manifest.webmanifest'])));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
});
