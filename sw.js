/* ★★★ sw.js 开始 ★★★ */
const CACHE_NAME = 'ourchat-v1';

// 安装 Service Worker
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// 激活
self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// 监听来自页面的消息
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    const title = e.data.title || 'TA';
    const options = {
      body: e.data.body || '给你发来了一条新消息',
      icon: 'IMG_20260923_234621.jpg', // 你的图标
      badge: 'IMG_20260923_234621.jpg',
      tag: 'chat-message', // 相同的 tag 会替换掉旧通知，避免刷屏
      renotify: true,
      data: {
        url: self.location.origin + '/our-chat-ttvc7/' // 点击通知跳转的网址
      }
    };
    e.waitUntil(self.registration.showNotification(title, options));
  }
});

// 点击通知时触发
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const urlToOpen = e.notification.data.url;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 如果已经有打开的窗口，直接切过去
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 没有打开的窗口就新开一个
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
/* ★★★ sw.js 结束 ★★★ */
