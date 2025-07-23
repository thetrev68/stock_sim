// Service Worker for Stock Trading Simulator PWA - Fixed for compatibility
const STATIC_CACHE_NAME = "static-v1";
const DYNAMIC_CACHE_NAME = "dynamic-v1";

// Files to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/styles/main.css",
  "/src/main.js",
  "/src/utils/router.js",
  "/src/services/firebase.js",
  "/src/services/auth.js",
  "/src/services/stocks.js",
  "/src/services/trading.js",
  "/src/views/dashboard.js",
  "/src/views/portfolio.js",
  "/src/views/simulation.js",
  "/manifest.json"
];

// Files that should always be fetched from network (real-time data)
const NETWORK_FIRST_PATTERNS = [
  "firebase",
  "googleapis.com",
  "alpha-vantage",
  "finnhub",
  "polygon"
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Service Worker: Static assets cached");
        return self.skipWaiting();
      })
      .catch((cacheError) => {
        console.error("Service Worker: Error caching static assets:", cacheError);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log("Service Worker: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - handle all network requests
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (shouldUseNetworkFirst(url)) {
    event.respondWith(networkFirst(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Network first strategy (for real-time data)
function networkFirst(request) {
  return fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(DYNAMIC_CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseClone);
          });
      }
      return networkResponse;
    })
    .catch(() => {
      console.log("Service Worker: Network failed, trying cache for:", request.url);
      return caches.match(request);
    });
}

// Cache first strategy (for static assets)
function cacheFirst(request) {
  return caches.match(request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return networkResponse;
        });
    })
    .catch((fetchError) => {
      console.error("Service Worker: Failed to fetch:", request.url, fetchError);
      return getOfflineFallback(request);
    });
}

// Stale while revalidate strategy - SIMPLIFIED
function staleWhileRevalidate(request) {
  return caches.match(request)
    .then((cachedResponse) => {
      // Start fetch in background
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          console.log("Service Worker: Background fetch failed for:", request.url);
          return cachedResponse;
        });
      
      // Return cached version immediately if available
      return cachedResponse || fetchPromise;
    });
}

// Helper functions
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => url.href.includes(pattern));
}

function isStaticAsset(url) {
  return url.pathname.includes("/src/") || 
         url.pathname.includes(".css") || 
         url.pathname.includes(".js") ||
         url.pathname === "/" ||
         url.pathname === "/index.html";
}

function getOfflineFallback(request) {
  if (request.destination === "document") {
    return caches.match("/index.html");
  }
  
  return new Response(
    JSON.stringify({ 
      error: "Offline", 
      message: "This feature requires an internet connection" 
    }),
    {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "application/json" }
    }
  );
}

// Handle background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync triggered:", event.tag);
  
  if (event.tag === "portfolio-sync") {
    event.waitUntil(syncPortfolioData());
  }
});

function syncPortfolioData() {
  console.log("Service Worker: Syncing portfolio data...");
  // Implementation would depend on your offline storage strategy
  return Promise.resolve();
}

// Handle push notifications (future feature)
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received");
  
  const options = {
    body: event.data ? event.data.text() : "New market update available",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: "explore",
        title: "View Portfolio",
        icon: "/icons/icon-192.png"
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/icon-192.png"
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification("Stock Trading Simulator", options)
  );
});