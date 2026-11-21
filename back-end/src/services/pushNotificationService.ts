import * as webPush from 'web-push'
import * as compromissoRepository from '../repositories/compromissoRepository'
import * as pushSubscriptionRepository from '../repositories/pushSubscriptionRepository'
import * as compromissoService from './compromissoService'
import { AppError } from '../types/error'

const publicKey = process.env.VAPID_PUBLIC_KEY?.trim() ?? ''
const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() ?? ''
const subject = process.env.VAPID_SUBJECT?.trim() ?? ''

if (publicKey || privateKey) {
  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      'VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY e VAPID_SUBJECT devem ser configuradas em conjunto.',
    )
  }
  webPush.setVapidDetails(subject, publicKey, privateKey)
}

export function isConfigured(): boolean {
  return Boolean(publicKey && privateKey && subject)
}

export function getPublicKey(): string {
  if (!isConfigured()) {
    throw new AppError(
      'Notificações push não estão configuradas no servidor.',
      503,
    )
  }
  return publicKey
}

function getStatusCode(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
  ) {
    return error.statusCode
  }
  return undefined
}

export interface PushDispatchSummary {
  processed: number
  emitted: number
  failed: number
}

export async function dispatchDueNotifications(
  referenceDate: Date = new Date(),
  idAdministrador?: number,
): Promise<PushDispatchSummary> {
  if (!isConfigured()) {
    return { processed: 0, emitted: 0, failed: 0 }
  }

  const eligible = await compromissoService.findEligibleAlerts(
    referenceDate,
    idAdministrador,
  )
  const summary: PushDispatchSummary = {
    processed: eligible.length,
    emitted: 0,
    failed: 0,
  }

  for (const compromisso of eligible) {
    const subscriptions =
      await pushSubscriptionRepository.findByAdministrator(
        compromisso.idAdministrador,
      )
    if (subscriptions.length === 0) continue

    const claimed = await compromissoService.claimAlertEmission(
      compromisso.idCompromisso,
    )
    if (!claimed) continue

    const payload = JSON.stringify({
      title: 'Lembrete de compromisso',
      body: `${compromisso.titulo} · ${new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(compromisso.dataHoraInicio)}`,
      tag: `compromisso-${compromisso.idCompromisso}`,
      url: `/painel/compromissos/${compromisso.idCompromisso}/editar`,
    })

    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        ),
      ),
    )

    let delivered = 0
    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        delivered++
        continue
      }

      const statusCode = getStatusCode(result.reason)
      if (statusCode === 404 || statusCode === 410) {
        await pushSubscriptionRepository.removeByEndpoint(
          subscriptions[index].endpoint,
        )
      }
    }

    if (delivered > 0) {
      summary.emitted++
    } else {
      await compromissoRepository.update(compromisso.idCompromisso, {
        alertaEmitido: false,
      })
      summary.failed++
    }
  }

  return summary
}
