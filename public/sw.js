const OFFLINE_CACHE = 'offline_christmas_2019';
const STATIC_FILES = [
  '/',
  '404.html',
  'app.bundle.js',
  'app.bundle.css',
  'manifest.webmanifest',
  'images/icon.png',
  'images/icon-128x128.png',
  'images/icon-256x256.png',
  'images/icon-512x512.png',
  'images/badge.png',
  'images/big-glow.png',
  'images/small-glow.png',
  'images/christmas-tree.png',
  'images/favicon.ico',
  'images/page-bg.png',
  'images/text-bg.png',
];

self.addEventListener('install', installEvent => {
  self.skipWaiting();
  installEvent.waitUntil((async () => {
    const offlineCache = await caches.open(OFFLINE_CACHE);
    const addCache = await offlineCache.addAll(STATIC_FILES);

    return addCache;
  })());
});

self.addEventListener('activate', activateEvent => {
  activateEvent.waitUntil((async () => {
    const keys = await caches.keys();

    return Promise.all(keys.map(cacheName => {
      if (cacheName !== OFFLINE_CACHE) {
        return caches.delete(cacheName);
      }
    })).then(() => self.clients.claim());
  })());
});

self.addEventListener('fetch', fetchEvent => {
  const { request } = fetchEvent;

  if ((!request.url.startsWith('http')) ||
    (request.method !== 'GET')) {
    return;
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  fetchEvent.respondWith((async () => {
    try {
      const cachedResponse = await caches.match(request);

      if (cachedResponse) {
        return cachedResponse;
      }

      const response = await fetch(request);

      if (response.status === 404) {
        await self.clients.openWindow(`${self.origin}/404.html`);
        return caches.match('404.html');
      }

      return caches.open(OFFLINE_CACHE)
        .then(cache => {
          cache.put(request.url, response.clone());
          return response;
        });
    } catch (err) {
      console.error(err, 'err fetchEvent');
      await self.clients.openWindow(`${self.origin}/404.html`);
      return caches.match('404.html');
    }
  })());
});

self.addEventListener('push', pushEvent => {
  const { title, author, quote } = pushEvent.data.json();
  const time = new Date(self.Date()).toLocaleDateString();

  const options = {
    body: `${quote} - ${author}`,
    icon: 'images/icon.png',
    badge: 'images/badge.png',
    image: 'https://scontent.fsgn1-1.fna.fbcdn.net/v/t1.0-9/48407137_1139274289568031_3613062420815151104_o.jpg?_nc_cat=104&_nc_ht=scontent.fsgn1-1.fna&oh=07e785861d51f5f3dfd2b1c915b46816&oe=5CD63A7D',
    tag: 'christmas',
    renotify: true,
    data: {
      quote,
      author,
      time,
    },
    silent: false,
    dir: 'ltr',
    sound: 'https://notificationsounds.com/soundfiles/ccb1d45fb76f7c5a0bf619f979c6cf36/file-sounds-1099-not-bad.mp3',
    timestamp: Date.parse('01 Jan 2000 00:00:00'),
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500]
  };

  const notificationPromise = self.registration.showNotification(
    `${title} - ${time}`,
    options,
  );
  pushEvent.waitUntil(notificationPromise);
});

self.addEventListener('notificationclick', async clickEvent => {
  const { action, notification } = clickEvent;

  if (!action) {
    await self.clients.openWindow(self.origin);
    notification.close();
  }
});
