const CACHE_NAME = "pos-system-v1"
const RUNTIME_CACHE = "pos-system-runtime-v1"
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/globals.css",
  "/placeholder.svg",
  "/placeholder-logo.svg",
  "/placeholder-logo.png",
  "/placeholder-user.jpg",
  "/placeholder.jpg",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[v0] Service Worker installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[v0] Caching static assets")
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log("[v0] Some assets failed to cache:", err)
      })
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[v0] Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log("[v0] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip API calls - let them fail gracefully if offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE)
            cache.then((c) => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log("[v0] Returning cached API response:", url.pathname)
              return cached
            }
            // Return offline response
            return new Response(JSON.stringify({ error: "Offline - cached data may be unavailable" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            })
          })
        }),
    )
    return
  }

  // For HTML pages and other assets - network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === "error") {
          return response
        }

        // Cache successful responses
        const cache = caches.open(RUNTIME_CACHE)
        cache.then((c) => c.put(request, response.clone()))
        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cached) => {
          if (cached) {
            console.log("[v0] Returning cached response:", url.pathname)
            return cached
          }

          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/").catch(() => {
              return new Response("Offline - halaman tidak tersedia", {
                status: 503,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
              })
            })
          }

          return new Response("Offline", { status: 503 })
        })
      }),
  )
})

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
