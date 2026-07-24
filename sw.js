// Basit PWA Service Worker — offline cache ve hızlı yükleme için
const CACHE_NAME = "bist-terminal-v2";
const ASSETS = [
  "/bist-terminal/",
  "/bist-terminal/index.html",
  "/bist-terminal/style.css",
  "/bist-terminal/app.js",
  "/bist-terminal/config.js",
  "/bist-terminal/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Cache'de varsa onu ver, yoksa ağdan al
      const fetchPromise = fetch(event.request).then((response) => {
        // Sadece başarılı yanıtları cache'le
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
});
