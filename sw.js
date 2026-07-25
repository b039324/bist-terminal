// Basit PWA Service Worker — "önce ağ, olmazsa önbellek" (network-first) stratejisi.
// Böylece siteyi her güncellediğimizde tarayıcı eski dosyaları göstermeye devam etmez;
// internet yoksa yine de önbellekten (son başarılı sürümden) çalışabilir.
const CACHE_NAME = "bist-terminal-v3";
const ASSETS = [
  "/bist-terminal/",
  "/bist-terminal/index.html",
  "/bist-terminal/style.css",
  "/bist-terminal/app.js",
  "/bist-terminal/config.js",
  "/bist-terminal/manifest.json",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  // Eski cache sürümlerini temizle
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
