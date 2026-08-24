'use strict';

/* 班主任工作台 · Service Worker（离线缓存）
 * 策略：优先网络（保证更新即时生效），失败回退缓存；首次访问后断网也能打开。 */
const CACHE_NAME = 'homeroom-workbench-v1';
const PRECACHE = [
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/store.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(PRECACHE.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(req, copy))
          .catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then(match => {
          if (match) return match;
          if (req.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        })
      )
  );
});
