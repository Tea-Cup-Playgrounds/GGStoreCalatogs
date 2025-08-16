const CACHE_NAME = 'ggcasecatalogs-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Debug mode - set to false in production
const DEBUG = false;

function log(...args) {
  if (DEBUG) {
    console.log('[SW]', ...args);
  }
}

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/brands/,
  /\/api\/categories/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        log('Static assets cached, skipping waiting...');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        log('Cleaning up old caches...');
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map(cacheName => {
              log('Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        log('Service Worker activated, claiming clients...');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('Service Worker activation failed:', error);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP(S) requests (chrome-extension, moz-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    log('Skipping non-HTTP request:', url.protocol, url.href);
    return;
  }

  // Skip requests from different origins (unless it's our API)
  if (url.origin !== self.location.origin && !isApiRequest(url)) {
    log('Skipping cross-origin request:', url.origin, url.href);
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets (JS, CSS, images)
    if (request.destination === 'script' || 
        request.destination === 'style' || 
        request.destination === 'image') {
      event.respondWith(cacheFirst(request));
    }
    // API requests
    else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      event.respondWith(networkFirst(request));
    }
    // HTML pages
    else if (request.destination === 'document') {
      event.respondWith(networkFirst(request));
    }
    // Other same-origin requests
    else if (url.origin === self.location.origin) {
      event.respondWith(networkFirst(request));
    }
  }
});

// Helper function to check if request is to our API
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Helper function to check if request is cacheable
function isCacheableRequest(request) {
  const url = new URL(request.url);
  
  // Only cache HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return false;
  }
  
  // Don't cache requests with query parameters that indicate dynamic content
  const searchParams = url.searchParams;
  if (searchParams.has('_t') || searchParams.has('timestamp') || searchParams.has('nocache')) {
    return false;
  }
  
  // Don't cache POST, PUT, DELETE requests
  if (request.method !== 'GET') {
    return false;
  }
  
  return true;
}

// Cache first strategy (for static assets)
async function cacheFirst(request) {
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Only cache successful responses from same origin
    if (networkResponse.ok && isCacheableRequest(request)) {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('Failed to cache response:', cacheError);
        // Continue without caching
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    
    // Try to return cached version as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy (for dynamic content)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok && isCacheableRequest(request)) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('Failed to cache response:', cacheError);
        // Continue without caching
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Network request failed, trying cache:', error);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Offline - GG Case Catalogs</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
            .offline-message { max-width: 400px; margin: 0 auto; }
            .retry-button { 
              padding: 0.5rem 1rem; 
              background: #3498db; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              cursor: pointer; 
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button class="retry-button" onclick="location.reload()">Retry</button>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any queued requests when back online
  console.log('Background sync triggered');
}