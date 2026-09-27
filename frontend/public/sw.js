self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "Lernraum",
      body: event.data ? event.data.text() : "Neue Benachrichtigung",
    };
  }

  const title = data.title ?? "Lernraum";

  const options = {
    body: data.body ?? "Neue Benachrichtigung",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {
      url: data.url ?? "/session",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/session";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return undefined;
      }),
  );
});
