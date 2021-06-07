const CACHE_NAME = "V2";
const STATIC_CACHE_URLS = [
                            "./"
                            , "libs/css/styles.min.css"
                            , "libs/js/script.min.js"
                            , "libs/vendors/jquery/jquery-2.2.3.min.js"
                            , "images/nature/pic1.jpg"
                            , "images/nature/pic2.jpg"
                            , "images/nature/pic3.jpg"
                            , "images/nature/pic4.jpg"
                            , "images/nature/pic5.jpg"
                            , "images/nature/pic6.jpg"
                            , "images/nature/pic7.jpg"
                            , "images/nature/pic8.jpg"
                            , "images/nature/pic9.jpg"
                            , "images/nature/pic10.jpg"
                            , "images/nature/pic11.jpg"
                            , "images/nature/pic12.jpg"
                            , "images/nature/pic13.jpg"
                            , "images/nature/pic14.jpg"
                            , "images/nature/pic15.jpg"
                            , "images/nature/pic16.jpg"
                            , "images/nature/pic17.jpg"
                            , "images/nature/pic18.jpg"
                            , "images/nature/pic19.jpg"
                            , "images/nature/pic20.jpg"
                            , "images/nature/pic21.jpg"
                            , "images/nature/pic22.jpg"
                            , "images/nature/pic23.jpg"
                            , "images/nature/pic24.jpg"
                            , "images/nature/pic25.jpg"
                            , "images/nature/pic26.jpg"
                            , "images/nature/pic27.jpg"
                            , "images/nature/pic28.jpg"
                            , "images/nature/pic29.jpg"
                            , "images/nature/pic30.jpg"
                          ];

self.addEventListener("install", event => {
  console.log("Service Worker installing.");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener("activate", event => {
  // delete any unexpected caches
  event.waitUntil(
    caches
      .keys()
      .then(keys => keys.filter(key => key !== CACHE_NAME))
      .then(keys =>
        Promise.all(
          keys.map(key => {
            console.log(`Deleting cache ${key}`);
            return caches.delete(key);
          })
        )
      )
  );
});

self.addEventListener("fetch", event => {
  // Cache-First Strategy
  event.respondWith(
    caches
      .match(event.request) // check if the request has already been cached
      .then(cached => cached || fetch(event.request)) // otherwise request network
      .then(
        response =>
          cache(event.request, response) // put response in cache
            .then(() => response) // resolve promise with the network response
      )
  );
});

function cache(request, response) {
  if (response.type === "error" || response.type === "opaque") {
    return Promise.resolve(); // do not put in cache network errors
  }

  return caches
    .open(CACHE_NAME)
    .then(cache => cache.put(request, response.clone()));
}
