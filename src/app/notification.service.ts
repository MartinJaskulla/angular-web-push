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
  async requestPermission() {
    const result = await Notification.requestPermission();
    if (result === 'denied') {
      console.error('The user explicitly denied the permission request.');
      return "Denied";
    }
    if (result === 'granted') {
      console.info('The user accepted the permission request.');
    }
    const registration = await navigator.serviceWorker.getRegistration();
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.info('User is already subscribed.');
      console.log({registration, existingSubscription})
      return existingSubscription;
    }
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(environment.VAPID_PUBLIC_KEY)
    });
    // Send topics along e.g. flag pole and GER26
    console.log("Send to backend to store in db", subscription)
    // Lambda
    fetch('https://mx1xey75gc.execute-api.eu-central-1.amazonaws.com/Dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "sailNumber": "FRA54861",
        subscription,
        "topics": [
          "FlagPole"
        ]
      })
    });
    // Local server.js
    // fetch('/add-subscription', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(subscription)
    // });
    return subscription
  }
}

/*
navigator.serviceWorker.ready.then(function(reg) {
  reg.pushManager.getSubscription().then(function(subscription) {
    subscription.unsubscribe().then(function(successful) {
      // You've successfully unsubscribed
    }).catch(function(e) {
      // Unsubscribing failed
    })
  })
});

 */
