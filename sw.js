// 電波がない所でも、前に開いたページが動くようにする係（service worker）。
// 教材や画面を直したら、下の VERSION の数字を1つ上げてください（古い保存が入れかわります）。

const VERSION = 'v1';
const CACHE = `manabi-${VERSION}`;

const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/storage.js',
  'js/ui.js',
  'js/speech.js',
  'js/session.js',
  'js/app.js',
  'lessons/catalog.js',
  'lessons/html-01.js',
  'lessons/html-02.js',
  'lessons/html-03.js',
  'lessons/html-04.js',
  'lessons/html-05.js',
  'lessons/html-06.js',
  'lessons/html-07.js',
  'img/cat.svg',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// 保存してあるものをすぐ出しつつ、電波があれば裏で新しいものに入れかえる
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    }),
  );
});
