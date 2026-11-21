import * as pushSubscriptionRepository from '../repositories/pushSubscriptionRepository'
import { AppError } from '../types/error'

export interface PushSubscriptionInput {
  endpoint: unknown
  keys: {
    p256dh: unknown
    auth: unknown
  }
}

function validateEndpoint(value: unknown): string {
  if (typeof value !== 'string' || value.length > 4096) {
    throw new AppError('Endpoint de notificação inválido.', 400)
  }

  let endpoint: URL
  try {
    endpoint = new URL(value)
  } catch {
    throw new AppError('Endpoint de notificação inválido.', 400)
  }

  if (endpoint.protocol !== 'https:') {
    throw new AppError('Endpoint de notificação deve usar HTTPS.', 400)
  }

  return endpoint.toString()
}

function validateKey(value: unknown, name: string): string {
  if (
    typeof value !== 'string' ||
    value.length < 8 ||
    value.length > 255 ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) {
    throw new AppError(`Chave ${name} da notificação inválida.`, 400)
  }
  return value
}

export async function register(
  idAdministrador: number,
  input: PushSubscriptionInput,
) {
  if (
    !input ||
    typeof input !== 'object' ||
    !input.keys ||
    typeof input.keys !== 'object'
  ) {
    throw new AppError('Assinatura de notificação inválida.', 400)
  }

  return pushSubscriptionRepository.save({
    endpoint: validateEndpoint(input.endpoint),
    p256dh: validateKey(input.keys.p256dh, 'p256dh'),
    auth: validateKey(input.keys.auth, 'auth'),
    idAdministrador,
  })
}

export async function remove(idAdministrador: number, endpoint: unknown) {
  const validatedEndpoint = validateEndpoint(endpoint)
  await pushSubscriptionRepository.removeByAdministratorAndEndpoint(
    idAdministrador,
    validatedEndpoint,
  )
}
