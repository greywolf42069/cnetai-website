// Service Worker for CNetAI PWA

const CACHE_NAME = 'cnetai-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './styles/main.css',
  './scripts/main.js',
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  './assets/icons/favicon.ico'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications (if implemented)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'CNetAI Notification';
    const options = {
      body: data.body || 'You have a new notification',
      icon: './assets/icons/icon-192x192.png',
      badge: './assets/icons/icon-192x192.png'
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});