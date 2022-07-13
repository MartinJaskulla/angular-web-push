const express = require("express");
const webpush = require("web-push");
const bodyparser = require("body-parser");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const VAPID_PUBLIC_KEY =
  "BGSwY3Q-1kPYEt8nImJYj8bvpvUa6qMTiylb4o646fRb5jQI3x9hsrhlJLAXvgpaLAbFQ3zXERjrZRFltaGWCc8";
const VAPID_PRIVATE_KEY = "VYkMwp9PtoyUEvpgY62Us4Z4CmfJ_-k3MQmO_JarSOI";
const VAPID_SUBJECT = "mailto:test@test.test";
const PORT = "3000";

const adapter = new FileSync(".data/db.json");
const db = low(adapter);
const vapidDetails = {
  publicKey: VAPID_PUBLIC_KEY,
  privateKey: VAPID_PRIVATE_KEY,
  subject: VAPID_SUBJECT,
};

db.defaults({
  subscriptions: [],
}).write();

// Manual (copy subscription from Angular dev tools console)
sendNotifications([
  {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/fjpHYgVIp10:APA91bFigNlElaDDjJ7ntg4Et2izc_u_9SJLhLb0RVIi_2lEnf5Z_fgsRm6j6fE12GIDwFGI6vKeEWW9MZElmGFFuVyAaYPUhdxQ-7_QKXS3lcEfdmzU5ENlgznqO8qpMlogtBkJcG6o",
    expirationTime: null,
    keys: {
      p256dh:
        "BFHTlQtS_rNbrXDbDdXsW0KE186qnhWePX4MR03-atmUX95Wmk97mxS4R2biUc3-5wp0sdTEU2o48y9Wxa6dWj8",
      auth: "CWk-pZroPX6DVYhPgyzjpQ",
    },
  },
]);

function sendNotifications(subscriptions) {
  // Create the notification content.
  const notification = JSON.stringify({
    title: "Hello, Notifications!",
    options: {
      body: `ID: ${Math.floor(Math.random() * 100)}`,
    },
  });
  // Customize how the push service should attempt to deliver the push message.
  // And provide authentication information.
  const options = {
    TTL: 10000,
    vapidDetails: vapidDetails,
  };
  // Send a push message to each client specified in the subscriptions array.
  subscriptions.forEach((subscription) => {
    const endpoint = subscription.endpoint;
    const id = endpoint.substr(endpoint.length - 8, endpoint.length);
    webpush
      .sendNotification(subscription, notification, options)
      .then((result) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Result: ${result.statusCode}`);
      })
      .catch((error) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Error: ${error} `);
      });
  });
}

const app = express();
app.use(bodyparser.json());
app.use(express.static("public"));

app.post("/add-subscription", (request, response) => {
  console.log(`Subscribing ${request.body.endpoint}`);
  db.get("subscriptions").push(request.body).write();
  response.sendStatus(200);
});

app.post("/remove-subscription", (request, response) => {
  console.log(`Unsubscribing ${request.body.endpoint}`);
  db.get("subscriptions").remove({ endpoint: request.body.endpoint }).write();
  response.sendStatus(200);
});

app.post("/notify-me", (request, response) => {
  console.log(`Notifying ${request.body.endpoint}`);
  const subscription = db
    .get("subscriptions")
    .find({ endpoint: request.body.endpoint })
    .value();
  sendNotifications([subscription]);
  response.sendStatus(200);
});

app.post("/notify-all", (request, response) => {
  console.log("Notifying all subscribers");
  const subscriptions = db.get("subscriptions").cloneDeep().value();
  if (subscriptions.length > 0) {
    sendNotifications(subscriptions);
    response.sendStatus(200);
  } else {
    response.sendStatus(409);
  }
});

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(PORT, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
