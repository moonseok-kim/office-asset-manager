// 설치(바로가기) 기능을 위해 필요한 최소한의 서비스 워커입니다.
// 별도의 오프라인 캐싱은 하지 않고, 네트워크 요청을 그대로 통과시킵니다.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // 캐싱 없이 항상 네트워크로 요청을 넘깁니다.
});
