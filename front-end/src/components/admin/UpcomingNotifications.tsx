import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from '@base-ui/react/dialog'
import { listCompromissos } from '../../data/compromissos'
import {
  getPushPublicKey,
  removePushSubscription,
  savePushSubscription,
} from '../../data/pushNotifications'
import { getErrorMessage } from '../../services/api'
import type { Compromisso } from '../../types/Compromisso'
import { BellIcon, CalendarIcon, EditIcon } from './AdminIcons'

interface UpcomingNotificationsProps {
  refreshToken: number
}

const upcomingDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function formatReminder(minutes: number | null): string {
  if (minutes === null) return 'Sem lembrete configurado'
  if (minutes === 0) return 'Lembrete no horário'
  if (minutes < 60) return `Lembrete ${minutes} min antes`
  if (minutes % 1440 === 0) {
    const days = minutes / 1440
    return `Lembrete ${days} ${days === 1 ? 'dia' : 'dias'} antes`
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return `Lembrete ${hours} ${hours === 1 ? 'hora' : 'horas'} antes`
  }
  return `Lembrete ${minutes} min antes`
}

function getSubscriptionData(
  subscription: PushSubscription,
): { endpoint: string; keys: { p256dh: string; auth: string } } {
  const data = subscription.toJSON()
  const p256dh = data.keys?.p256dh
  const auth = data.keys?.auth
  if (
    !data.endpoint ||
    typeof p256dh !== 'string' ||
    typeof auth !== 'string'
  ) {
    throw new Error('O navegador retornou uma assinatura push inválida.')
  }
  return { endpoint: data.endpoint, keys: { p256dh, auth } }
}

export default function UpcomingNotifications({
  refreshToken,
}: UpcomingNotificationsProps) {
  const [compromissos, setCompromissos] = useState<Compromisso[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())
  const [isOpen, setIsOpen] = useState(false)
  const supportsPush =
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  const [pushStatus, setPushStatus] = useState<
    'checking' | 'enabled' | 'disabled' | 'unsupported'
  >(() => (supportsPush ? 'checking' : 'unsupported'))
  const [isPushBusy, setIsPushBusy] = useState(false)
  const [pushError, setPushError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    listCompromissos()
      .then((rows) => {
        if (!active) return
        setCompromissos(rows)
        setError('')
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [refreshToken])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let active = true
    if (!supportsPush) return

    async function checkSubscription() {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        const subscription = await registration?.pushManager.getSubscription()
        if (subscription) {
          await savePushSubscription(getSubscriptionData(subscription))
        }
        if (active) setPushStatus(subscription ? 'enabled' : 'disabled')
      } catch (loadError: unknown) {
        if (!active) return
        setPushStatus('disabled')
        setPushError(getErrorMessage(loadError))
      }
    }

    void checkSubscription()

    return () => {
      active = false
    }
  }, [supportsPush])

  const upcomingCommitments = compromissos
    .filter((compromisso) => {
      const start = Date.parse(compromisso.dataHoraInicio)
      return (
        !compromisso.concluido &&
        !Number.isNaN(start) &&
        start >= now &&
        start <= now + 7 * 24 * 60 * 60 * 1000
      )
    })
    .sort(
      (first, second) =>
        Date.parse(first.dataHoraInicio) - Date.parse(second.dataHoraInicio),
    )

  function editCommitment(compromisso: Compromisso) {
    setIsOpen(false)
    navigate(`/painel/compromissos/${compromisso.idCompromisso}/editar`)
  }

  async function togglePushNotifications() {
    setPushError('')
    setIsPushBusy(true)

    try {
      if (pushStatus === 'enabled') {
        const registration = await navigator.serviceWorker.getRegistration()
        const subscription = await registration?.pushManager.getSubscription()
        if (!subscription) {
          setPushStatus('disabled')
          return
        }

        await removePushSubscription(subscription.endpoint)
        await subscription.unsubscribe()
        setPushStatus('disabled')
        return
      }

      const permission =
        Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission

      if (permission !== 'granted') {
        throw new Error(
          'Permita notificações nas configurações do navegador para continuar.',
        )
      }

      const publicKey = await getPushPublicKey()
      const registration =
        await navigator.serviceWorker.register('/service-worker.js')
      const readyRegistration = await navigator.serviceWorker.ready
      const base64Key = publicKey
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(publicKey.length / 4) * 4, '=')
      const applicationServerKey = Uint8Array.from(
        atob(base64Key),
        (character) => character.charCodeAt(0),
      ).buffer
      const subscription =
        (await readyRegistration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        }))
      await savePushSubscription(getSubscriptionData(subscription))
      setPushStatus('enabled')
    } catch (toggleError: unknown) {
      setPushError(getErrorMessage(toggleError))
    } finally {
      setIsPushBusy(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger
        aria-label={`Notificações${upcomingCommitments.length ? `, ${upcomingCommitments.length} compromissos próximos` : ''}`}
        aria-haspopup="dialog"
        className="auctus-notification-trigger"
        title="Notificações"
      >
        <BellIcon />
        {upcomingCommitments.length > 0 && (
          <span aria-hidden="true" className="auctus-notification-badge">
            {upcomingCommitments.length > 99
              ? '99+'
              : upcomingCommitments.length}
          </span>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="auctus-alert-dialog-backdrop" />
        <Dialog.Viewport className="auctus-alert-dialog-viewport">
          <Dialog.Popup className="auctus-alert-dialog-content auctus-notifications-dialog">
            <header className="auctus-notifications-dialog-header">
              <span className="auctus-upcoming-icon">
                <BellIcon />
              </span>
              <div>
                <Dialog.Title className="auctus-notifications-dialog-title">
                  Notificações e lembretes
                </Dialog.Title>
                <Dialog.Description className="auctus-notifications-dialog-description">
                  Compromissos pendentes nos próximos 7 dias
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Fechar notificações"
                className="auctus-btn-icon auctus-notifications-close"
              >
                <span aria-hidden="true">×</span>
              </Dialog.Close>
            </header>

            {error && (
              <p className="alert alert-danger py-2 px-3 mt-3 mb-0" role="alert">
                {error}
              </p>
            )}

            <section
              aria-label="Notificações do computador"
              className="auctus-push-settings"
            >
              <div>
                <strong>Notificações no computador</strong>
                <span>
                  Receba lembretes mesmo com o painel fechado.
                </span>
              </div>
              <button
                className={
                  pushStatus === 'enabled'
                    ? 'auctus-btn-secondary'
                    : 'auctus-btn-primary'
                }
                disabled={
                  isPushBusy ||
                  pushStatus === 'checking' ||
                  pushStatus === 'unsupported'
                }
                onClick={() => void togglePushNotifications()}
                type="button"
              >
                {isPushBusy
                  ? 'Aguarde…'
                  : pushStatus === 'checking'
                    ? 'Verificando…'
                    : pushStatus === 'enabled'
                      ? 'Desativar'
                      : pushStatus === 'unsupported'
                        ? 'Indisponível'
                        : 'Ativar'}
              </button>
            </section>
            {pushStatus === 'unsupported' && (
              <p className="auctus-push-hint">
                Push exige navegador compatível e site em HTTPS.
              </p>
            )}
            {pushError && (
              <p className="alert alert-danger py-2 px-3 mt-3 mb-0" role="alert">
                {pushError}
              </p>
            )}

            {isLoading ? (
              <div className="auctus-empty auctus-notifications-empty">
                Carregando notificações…
              </div>
            ) : error && compromissos.length === 0 ? (
              <div className="auctus-empty auctus-notifications-empty">
                <h3>Falha ao carregar lembretes.</h3>
                <p>Tente novamente mais tarde.</p>
              </div>
            ) : upcomingCommitments.length === 0 ? (
              <div className="auctus-empty auctus-notifications-empty">
                <span className="auctus-empty-icon">
                  <CalendarIcon />
                </span>
                <h3>Nenhum compromisso próximo.</h3>
                <p>Quando houver um evento nos próximos dias, ele aparecerá aqui.</p>
              </div>
            ) : (
              <ul className="auctus-notifications-list">
                {upcomingCommitments.map((compromisso) => (
                  <li
                    className="auctus-upcoming-item"
                    key={compromisso.idCompromisso}
                  >
                    <span
                      aria-hidden="true"
                      className="auctus-upcoming-accent"
                      style={{
                        backgroundColor:
                          compromisso.categoria?.corHex ?? '#b7c8b8',
                      }}
                    />
                    <div className="auctus-upcoming-info">
                      <strong>{compromisso.titulo}</strong>
                      <span>
                        {upcomingDateFormatter.format(
                          new Date(compromisso.dataHoraInicio),
                        )}
                      </span>
                      <span>
                        {formatReminder(compromisso.antecedenciaAlertaMinutos)}
                      </span>
                    </div>
                    <button
                      aria-label={`Editar ${compromisso.titulo}`}
                      className="auctus-btn-icon"
                      onClick={() => editCommitment(compromisso)}
                      title="Editar compromisso"
                      type="button"
                    >
                      <EditIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
