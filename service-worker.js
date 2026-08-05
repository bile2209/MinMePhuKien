/* Min Mê Phụ Kiện — minimal offline shell.
   Caches the app shell only; every other request goes to the network
   first so product content, blog posts and embeds always stay fresh. */

const CACHE = "mmpk-shell-v1";
const SHELL = ["/", "/css/style.css", "/js/main.js", "/offline.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        if (SHELL.includes(new URL(event.request.url).pathname)) {
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("/offline.html"))
      )
  );
});
