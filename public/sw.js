// Service Worker — RTS push notifications
// v2 — forces immediate activation so action buttons always work

self.addEventListener("install", (event) => {
  // Skip the waiting phase so this SW takes over all tabs immediately
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  // Claim all open clients so this SW controls them right away
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

  const options = {
    body:               data.body               || "",
    icon:               data.icon               || "/icon-192.png",
    badge:              data.badge              || "/icon-192.png",
    tag:                data.tag                || "rts-notification",
    renotify:           true,
    requireInteraction: data.requireInteraction ?? false,
    actions: [
      { action: "yes", title: "Yes, I'm done" },
      { action: "no",  title: "No, take me there" },
    ],
    data: { url: data.url || "/" },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "RTS", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "yes") {
    // User is done — just dismiss
    return;
  }

  // "no" button click OR tapping the notification body → open food page
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
