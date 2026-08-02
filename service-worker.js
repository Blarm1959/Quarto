const CACHE_NAME = "quarto-v0.0.7";
const APP_FILES = [
  "./", "./index.html", "./favicon.ico", "./css/style.css",
  "./js/app.js", "./js/board.js", "./js/pieces.js", "./js/rules.js", "./js/storage.js",
  "./manifest.json", "./icons/quarto-192.png", "./icons/quarto-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
