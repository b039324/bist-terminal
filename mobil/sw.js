// BIST Mobil service worker: önce ağ, olmazsa önbellek.
// Sadece kendi sitenin dosyalarını önbelleğe alır. Worker (veri) istekleri
// şifre içerdiği için önbelleğe ALINMAZ.
const CACHE = "bist-mobil-v1";
const ASSETS = ["./", "./index.html", "./mobil.css", "./mobil.js", "./manifest.json", "../config.js"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return; // veri istekleri geçsin
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
