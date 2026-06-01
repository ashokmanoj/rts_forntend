// Service Worker — RTS push notifications
// v4 — removed Yes/No action buttons from food reminder notifications

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "RTS Notification", body: event.data.text() };
  }

  const isRequestNotif = data.type === "new_request";

  const options = {
    body:               data.body               || "",
    icon:               data.icon               || "/rtsLogo.png",
    badge:              data.badge              || "/rtsLogo.png",
    tag:                data.tag                || "rts-notification",
    renotify:           true,
    requireInteraction: data.requireInteraction ?? false,
    data: {
      url:  data.url  || "/",
      type: data.type || "general",
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "RTS", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});
