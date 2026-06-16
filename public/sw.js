/* Minimal service worker — enables “Install app” on Android Chrome. No offline cache. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Required for installability; network requests pass through unchanged.
});
