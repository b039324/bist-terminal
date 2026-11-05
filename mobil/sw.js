// BIST Mobil service worker: önce ağ, olmazsa önbellek.
// Sadece kendi sitenin dosyalarını önbelleğe alır. Worker (veri) istekleri
// şifre içerdiği için önbelleğe ALINMAZ.
const CACHE = "bist-mobil-v6"; // her pakette bir artır: telefon eski dosyaları temizler
const ASSETS = ["./", "./index.html", "./mobil.css?v=6", "./mobil.js?v=6", "./manifest.json", "../config.js"];

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
    fetch(req, { cache: "no-cache" }) // tarayıcı HTTP önbelleğini atla: her seferinde sunucuya sor
      .then((res) => {
        if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
