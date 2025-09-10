// Safer SW for iOS PWA
const REV='elite-1.0.1';
const CORE=['./','./index.html?v=101','./style.css?v=101','./app.js?v=101','./plan.js?v=101','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(REV).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>{ if(k!==REV) return caches.delete(k); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Network-first for navigation (index) to avoid stale app in PWA
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r=>{
        const copy=r.clone(); caches.open(REV).then(c=>c.put('./',copy));
        return r;
      }).catch(()=>caches.match('./'))
    );
    return;
  }
  // Stale-while-revalidate for assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(r=>{
        const copy=r.clone(); caches.open(REV).then(c=>c.put(e.request, copy)); return r;
      }).catch(()=>cached);
      return cached || fetched;
    })
  );
});
