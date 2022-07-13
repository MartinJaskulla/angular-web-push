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
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.info('User is already subscribed.');
      console.log({registration, existingSubscription})

      // notifyMeButton.disabled = false;
      // unsubscribeButton.disabled = false;
      return;
    }
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(environment.VAPID_PUBLIC_KEY)
    });
    // notifyMeButton.disabled = false;
    // TODO Send topics along e.g. flag pole and GER26
    // ../angular-web-push-server
    console.log("Send to backend to store in db", subscription)
    // fetch('/add-subscription', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(subscription)
    // });
    // This will be send:
    // {
    //   "endpoint": "https://fcm.googleapis.com/fcm/send/fjpHYgVIp10:APA91bFigNlElaDDjJ7ntg4Et2izc_u_9SJLhLb0RVIi_2lEnf5Z_fgsRm6j6fE12GIDwFGI6vKeEWW9MZElmGFFuVyAaYPUhdxQ-7_QKXS3lcEfdmzU5ENlgznqO8qpMlogtBkJcG6o",
    //   "expirationTime": null,
    //   "keys": {
    //     "p256dh": "BFHTlQtS_rNbrXDbDdXsW0KE186qnhWePX4MR03-atmUX95Wmk97mxS4R2biUc3-5wp0sdTEU2o48y9Wxa6dWj8",
    //     "auth": "CWk-pZroPX6DVYhPgyzjpQ"
    //   }
    // }
  }
}
