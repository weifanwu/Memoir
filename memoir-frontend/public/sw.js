const CACHE_NAME = "memoir-cache-v2";

self.addEventListener("install", () => {
  console.log('service worker installed');
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

const cacheClone = async (e) => {
  try {
    const res = await fetch(e.request);
    const resClone = res.clone();
    const cache = await caches.open(CACHE_NAME);
    await cache.put(e.request, resClone);

    return res;
  } catch (err) {
    // 网络失败，尝试从缓存中取
    const cached = await caches.match(e.request);
    if (cached) return cached;
    // 如果是页面导航请求，返回 fallback 页面
    if (e.request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Offline',
    });
  }
};

self.addEventListener('fetch', (e) => {
  e.respondWith(cacheClone(e));
});
