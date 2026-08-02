const VERSION = "0.0.19";
const STATIC_CACHE = `quarto-static-v${VERSION}`;
const RUNTIME_CACHE = `quarto-runtime-v${VERSION}`;
const APP_SHELL = [
  "./", "./index.html", "./offline.html", "./favicon.ico", "./css/style.css",
  "./js/app.js", "./js/board.js", "./js/pieces.js", "./js/rules.js", "./js/storage.js", "./js/ai.js",
  "./manifest.json", "./package.json", "./release.json", "./build-info.json",
  "./icons/quarto-96.png", "./icons/quarto-128.png", "./icons/quarto-144.png", "./icons/quarto-152.png",
  "./icons/quarto-180.png", "./icons/quarto-192.png", "./icons/quarto-384.png", "./icons/quarto-512.png",
  "./icons/quarto-maskable-192.png", "./icons/quarto-maskable-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => ![STATIC_CACHE,RUNTIME_CACHE].includes(key)).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      const copy=response.clone(); caches.open(RUNTIME_CACHE).then(cache=>cache.put("./index.html",copy)); return response;
    }).catch(async()=> (await caches.match("./index.html")) || caches.match("./offline.html")));
    return;
  }
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(cached => {
    const update = fetch(request).then(response => {
      if (response.ok) caches.open(RUNTIME_CACHE).then(cache=>cache.put(request,response.clone()));
      return response;
    }).catch(()=>cached);
    return cached || update;
  }));
});
