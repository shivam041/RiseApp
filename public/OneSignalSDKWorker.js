// OneSignal Service Worker
// This file is required by OneSignal but we'll handle notifications through our main service worker

console.log('OneSignal Service Worker loaded');

// Basic service worker functionality
self.addEventListener('install', (event) => {
  console.log('OneSignal SW: Install event');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('OneSignal SW: Activate event');
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', (event) => {
  console.log('OneSignal SW: Push event received');
  
  const options = {
    body: 'You have a new notification from Rise!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.title = data.title || 'Rise App';
    } catch (error) {
      console.log('OneSignal SW: Could not parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Rise App', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('OneSignal SW: Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

