/**
 * public/sw.js
 * ---------------------------------------------------------------------------
 * Service worker providing offline support (feature 1).
 *
 * Strategy:
 *   - App shell (navigation + entry document) → **cache-first, network-fallback
 *     with a runtime network cache** so every visited route works offline.
 *   - Static Next.js build assets & hashed chunks → **cache-first forever**
 *     (immutable, content-hashed).
 *   - Font & image files → **stale-while-revalidate** for freshness.
 *   - All other / cross-origin requests (e.g. BaniDB API from the client) are
 *     left untouched so nothing is cached accidentally.
 *
 * The version string in `CACHE` busts the cache whenever the build changes.
 */

const CACHE = "sggs-reader-v1";
const SHELL_CACHE = `${CACHE}-shell`;

/** Entry documents we want available offline once visited. */
const SHELL_URLS = ["/", "/search", "/bookmarks", "/ang/1", "/learn"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("sggs-reader-") && key !== SHELL_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/**
 * Returns the cached response for a request, or fetches it over the network
 * and stores it in the runtime cache when the request is GET-only.
 */
async function networkFirstWithCache(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  // Navigation requests: serve the cached shell first, fall back to network.
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Immutable hashed build assets: cache-first.
  if (/\/_next\/static\/.*\.(js|css|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // Public images & fonts: stale-while-revalidate.
  if (/\.(png|jpe?g|webp|gif|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Everything else follows the network untouched.
});