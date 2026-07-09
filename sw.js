const CACHE_NAME = 'rainly-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/about.html',
  '/blog.html',
  '/gallery.html',
  '/css/kawaii.css',
  '/js/init.js',
  '/js/mouse-trail.js',
  '/js/sakura-petals.js',
  '/js/click-heart.js',
  '/js/scroll-reveal.js',
  '/js/gallery-3d.js',
  '/js/blog-render.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
