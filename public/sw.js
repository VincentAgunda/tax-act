const CACHE_NAME = 'tax-act-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json'
];

const API_CACHE_URLS = [
  '/api/acts',
  '/api/news',
  '/api/pdfs'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (request.url.startsWith('chrome-extension')) return;

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Serving from cache:', request.url);
          return response;
        }

        // Otherwise fetch from network
        return fetch(request).then((fetchResponse) => {
          // Check if we received a valid response
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          // Clone the response
          const responseToCache = fetchResponse.clone();

          // Cache static assets and API responses
          if (shouldCache(request.url)) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('Caching:', request.url);
                cache.put(request, responseToCache);
              });
          }

          return fetchResponse;
        }).catch((error) => {
          console.log('Fetch failed:', error);
          // Return a fallback response for navigation requests
          if (request.destination === 'document') {
            return caches.match('/');
          }
          throw error;
        });
      })
  );
});

// Determine if URL should be cached
function shouldCache(url) {
  // Cache static assets
  if (url.includes('/static/') || 
      url.includes('.js') || 
      url.includes('.css') || 
      url.includes('.png') || 
      url.includes('.jpg') || 
      url.includes('.svg') ||
      url.includes('.woff') ||
      url.includes('.woff2')) {
    return true;
  }
  
  // Cache API responses (with shorter TTL)
  if (API_CACHE_URLS.some(apiUrl => url.includes(apiUrl))) {
    return true;
  }
  
  return false;
}

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending operations when back online
  console.log('Performing background sync...');
}

// Push notifications (if needed)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png'
  };
  
  event.waitUntil(
    self.registration.showNotification('Tax Act Manager', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});