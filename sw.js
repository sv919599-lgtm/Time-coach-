const CACHE_NAME =
  "time-coach-v1";


const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon.png"
];


/* =========================================
   INSTALL
========================================= */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches.open(
        CACHE_NAME
      )
      .then(
        cache => {

          return cache.addAll(
            FILES_TO_CACHE
          );

        }
      )

    );

    self.skipWaiting();

  }
);


/* =========================================
   ACTIVATE
========================================= */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys()
        .then(
          cacheNames => {

            return Promise.all(

              cacheNames
                .filter(
                  name =>
                    name !== CACHE_NAME
                )
                .map(
                  name =>
                    caches.delete(name)
                )
            );

          }
        )

    );

    self.clients.claim();

  }
);


/* =========================================
   FETCH
========================================= */

self.addEventListener(
  "fetch",
  event => {

    event.respondWith(

      caches.match(
        event.request
      )
      .then(
        cachedResponse => {

          if (cachedResponse) {

            return cachedResponse;

          }

          return fetch(
            event.request
          )
          .then(
            response => {

              if (
                !response ||
                response.status !== 200
              ) {

                return response;

              }

              const copy =
                response.clone();

              caches.open(
                CACHE_NAME
              )
              .then(
                cache => {

                  cache.put(
                    event.request,
                    copy
                  );

                }
              );

              return response;

            }
          );

        }
      )

    );

  }
);


/* =========================================
   NOTIFICATION CLICK
========================================= */

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(
        clientList => {

          for (
            const client of clientList
          ) {

            if (
              "focus" in client
            ) {

              return client.focus();

            }

          }

          if (
            clients.openWindow
          ) {

            return clients.openWindow(
              "./index.html"
            );

          }

        }
      )

    );

  }
);
