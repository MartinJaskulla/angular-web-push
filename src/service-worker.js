self.addEventListener('push', event => {
  console.log('push', event)
  const data = event.data.json();
  const image = 'https://cdn.glitch.com/614286c9-b4fc-4303-a6a9-a4cef0601b74%2Flogo.png?v=1605150951230';
  const options = {
    body: data.options.body,
    icon: image
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
  self.registration.showNotification(
    data.title,
    options
  );
});

self.addEventListener('notificationclick', event => {
  console.log('notificationclick', event)
  event.notification.close();
  event.waitUntil(self.clients.openWindow('https://stellular-lolly-5145bc.netlify.app/'));
});
