self.addEventListener('push', event => {
  console.log('push', event)
});

self.addEventListener('notificationclick', event => {
  console.log('notificationclick', event)
});
