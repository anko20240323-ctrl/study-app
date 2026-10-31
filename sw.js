// 電波がない所でも、前に開いたページが動くようにする係（service worker）。
// 教材や画面を直したら、下の VERSION の数字を1つ上げてください（古い保存が入れかわります）。

const VERSION = 'v8';
const CACHE = `manabi-${VERSION}`;

const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/storage.js',
  'js/ui.js',
  'js/phrases.js',
  'js/speech.js',
  'js/listen.js',
  'js/editor.js',
  'js/session.js',
  'js/drill.js',
  'js/app.js',
  'lessons/catalog.js',
  'lessons/html-01.js',
  'lessons/html-02.js',
  'lessons/html-03.js',
  'lessons/html-04.js',
  'lessons/html-05.js',
  'lessons/html-06.js',
  'lessons/html-07.js',
  'lessons/talk-01.js',
  'lessons/talk-02.js',
  'lessons/talk-03.js',
  'lessons/grammar-01.js',
  'lessons/grammar-02.js',
  'lessons/grammar-03.js',
  'lessons/html-drills.js',
  'lessons/vocab.js',
  'img/cat.svg',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'audio/manifest.json',
];

// 音声ファイル（audio/*.mp3）は、版が変わっても消さない別の入れ物に保存する。
// ファイル名は中身から作っているので、同じ名前なら中身も同じ（いつでも保存してあるものを使ってよい）
const AUDIO_CACHE = 'manabi-audio';

// iPhone の Safari は、音声を「一部分ずつ」（Range）で取りにくるので、その形で返す
async function audioResponse(req, url) {
  const cache = await caches.open(AUDIO_CACHE);
  let res = await cache.match(url.pathname, { ignoreSearch: true });
  if (!res) {
    res = await fetch(url.pathname);
    if (!res.ok) return res;
    await cache.put(url.pathname, res.clone());
  }
  const range = req.headers.get('range');
  if (!range) return res;
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = m[1] ? Number(m[1]) : 0;
  const end = m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== AUDIO_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// 電波があれば新しいものを取りにいき（直した内容がすぐ届くように）、
// 電波がない・遅いときは保存してあるものを出す
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/\/audio\/.+\.mp3$/.test(url.pathname)) {
    event.respondWith(audioResponse(req, url));
    return;
  }
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      // ブラウザの一時保存を通さずに、いつも最新を取りにいく
      const fresh = fetch(req, { cache: 'no-cache' }).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      });
      if (!cached) return fresh;
      const slow = new Promise((resolve) => setTimeout(() => resolve(cached), 3000));
      return Promise.race([fresh.catch(() => cached), slow]);
    }),
  );
});
