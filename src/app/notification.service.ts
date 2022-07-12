import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() {
    this.requestPermission()
  }

  async requestPermission() {
    // Prevent the user from clicking the subscribe button multiple times.
    // subscribeButton.disabled = true;
    const result = await Notification.requestPermission();
    if (result === 'denied') {
      console.error('The user explicitly denied the permission request.');
      return;
    }
    if (result === 'granted') {
      console.info('The user accepted the permission request.');
    }
    const registration = await navigator.serviceWorker.getRegistration();
    const subscribed = await registration.pushManager.getSubscription();
    if (subscribed) {
      console.info('User is already subscribed.');
      // notifyMeButton.disabled = false;
      // unsubscribeButton.disabled = false;
      return;
    }
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(environment.VAPID_PUBLIC_KEY)
    });
    // notifyMeButton.disabled = false;
    // Open in browser: https://buiboiybby.requestcatcher.com/
    fetch('https://buiboiybby.requestcatcher.com/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
  }
}
