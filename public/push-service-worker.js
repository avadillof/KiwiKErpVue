self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() || "" }; }
  event.waitUntil(self.registration.showNotification(data.title || "KiwiKERP", {
    body: data.body || "Tienes una nueva notificación.",
    icon: data.icon || "/logos/logo512.png",
    badge: "/logos/logo512.png",
    data: { url: data.url || "/" },
    tag: data.tag || undefined
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const current = windows.find((client) => client.url.startsWith(self.location.origin));
    if (current) { current.navigate(target); return current.focus(); }
    return clients.openWindow(target);
  }));
});
