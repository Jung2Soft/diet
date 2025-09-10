const REV='elite-1.0.0';
const CORE=['./','./index.html','./style.css','./app.js','./plan.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(REV).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>{if(k!==REV)return caches.delete(k)}))));self.clients.claim();});
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(cached=>{const fetched=fetch(e.request).then(r=>{const copy=r.clone();caches.open(REV).then(c=>c.put(e.request,copy));return r;}).catch(()=>cached);return cached||fetched;}));
});