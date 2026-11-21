self.addEventListener('push', (event) => {
  if (!event.data) return

  const notification = event.data.json()
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: '/logo-auctus.png',
      badge: '/favicon.svg',
      tag: notification.tag,
      data: { url: notification.url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const relativeUrl = event.notification.data?.url
  const targetUrl =
    typeof relativeUrl === 'string' && relativeUrl.startsWith('/painel/')
      ? new URL(relativeUrl, self.location.origin).href
      : new URL('/painel/compromissos', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(
      (windows) => {
        const existingWindow = windows.find(
          (client) => new URL(client.url).origin === self.location.origin,
        )
        if (existingWindow) {
          return existingWindow.navigate(targetUrl).then((client) => client?.focus())
        }
        return self.clients.openWindow(targetUrl)
      },
    ),
  )
})
