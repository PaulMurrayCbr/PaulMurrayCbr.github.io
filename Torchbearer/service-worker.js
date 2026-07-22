const CACHE_NAME = "torchbearer-v1";

const APP_FILES = [
    "./css/styles.css",
    "./favicon.ico",
    "./icons/icon-128.png",
    "./icons/icon-144.png",
    "./icons/icon-192.png",
    "./icons/icon-32.png",
    "./icons/icon-512.png",
    "./icons/icon-72.png",
    "./icons/icon-96.png",
    "./images/LOGO-with-text.png",
    "./images/splash.png",
    "./images/torch0.png",
    "./images/torch1.png",
    "./images/torch2.png",
    "./images/torch3.png",
    "./index.html",
    "./js/app.js",
    "./js/clicklistener.js",
    "./js/gitinfo.js",
    "./js/main.js",
    "./js/toaster.js",
    "./js/torch.js",
    "./lib/rxjs.umd.min.js",
    "./manifest.json",
    "./service-worker.js",
];


self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
    );
});


self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
});


self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});