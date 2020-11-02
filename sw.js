const
  wbScript = "https://storage.googleapis.com/workbox-cdn/releases/5.1.4/workbox-sw.js",
  regex = {
    fbd: new RegExp("^(https://api.football-data.org)"),
    fontG: new RegExp("^(https://fonts.googleapis)"),
  }
  ;

importScripts(wbScript);

workbox.setConfig({ debug: false });

workbox.core.setCacheNameDetails({
  prefix: "",
  precache: "main-static",
  suffix: "v0.1"
});

workbox.precaching.precacheAndRoute([
  { url: "./index.html", revision: "0.0.1" },

  { url: "./dist/goal.js", revision: "0.0.1" },
  { url: "./dist/app.js", revision: "0.0.1" },

  { url: "./dist/style/style.css", revision: "0.0.1" },
  { url: "./dist/style/material.css", revision: "0.0.1" },

  { url: "./dist/style/fonts/MaterialIcons-Regular.eot", revision: "0.0.1" },
  { url: "./dist/style/fonts/MaterialIcons-Regular.ttf", revision: "0.0.1" },
  { url: "./dist/style/fonts/MaterialIcons-Regular.woff", revision: "0.0.1" },
  { url: "./dist/style/fonts/MaterialIcons-Regular.woff2", revision: "0.0.1" },

  { url: "./assets/manifest.json", revision: "0.0.1" },
  { url: "./assets/favicon.ico", revision: "0.0.1" },

  { url: "./assets/logo_blank.webp", revision: "0.0.1" },
  { url: "./assets/logo512.png", revision: "0.0.1" },
  { url: "./assets/logo256.png", revision: "0.0.1" },
  { url: "./assets/logo192.png", revision: "0.0.1" },
  { url: "./assets/logo128.png", revision: "0.0.1" },

  { url: "./assets/apple-icon-57x57.png", revision: "0.0.1" },
  { url: "./assets/apple-icon-76x76.png", revision: "0.0.1" },
  { url: "./assets/apple-icon-144x144.png", revision: "0.0.1" },
]);

workbox.routing.registerRoute(
  regex.fbd,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "football-data",
    plugins: [
      new workbox.expiration.CacheExpiration(
        "footbal-data", {
        maxAgeSeconds: 60 * 60 * 24 * 7,
        maxEntries: 20
      }
      )
    ]
  })
);



self.addEventListener("push", function (e) {
  e.waitUntil(
    self.registration.showNotification("Welcome", {
      body: e.data ? e.data.text() : "Hello, and its working...",
      badge: "assets/logo512.png"
    })
  );
});

