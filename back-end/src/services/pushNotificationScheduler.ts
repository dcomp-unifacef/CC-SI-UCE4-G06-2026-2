import * as pushNotificationService from './pushNotificationService'

const POLL_INTERVAL_MS = 60_000

export function startPushNotificationScheduler(): void {
  if (!pushNotificationService.isConfigured()) {
    console.warn(
      'Notificações push desativadas: configure as variáveis VAPID para ativá-las.',
    )
    return
  }

  let isRunning = false
  const poll = async () => {
    if (isRunning) return
    isRunning = true
    try {
      const summary =
        await pushNotificationService.dispatchDueNotifications()
      if (summary.failed > 0) {
        console.error(
          `Falha ao enviar ${summary.failed} lembrete(s) push.`,
        )
      }
    } catch (error: unknown) {
      console.error('Falha ao verificar lembretes push.', error)
    } finally {
      isRunning = false
    }
  }

  void poll()
  const interval = setInterval(() => void poll(), POLL_INTERVAL_MS)
  interval.unref()
}
