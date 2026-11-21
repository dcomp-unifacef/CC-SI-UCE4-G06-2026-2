import { apiRequest, jsonBody } from '../services/api'

interface PushPublicKeyResponse {
  publicKey: string
}

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function getPushPublicKey(): Promise<string> {
  const response = await apiRequest<PushPublicKeyResponse>(
    '/administradores/notificacoes/chave-publica',
  )
  return response.publicKey
}

export function savePushSubscription(
  subscription: PushSubscriptionData,
): Promise<void> {
  return apiRequest('/administradores/notificacoes/assinaturas', {
    method: 'POST',
    body: jsonBody(subscription),
  })
}

export function removePushSubscription(endpoint: string): Promise<void> {
  return apiRequest('/administradores/notificacoes/assinaturas', {
    method: 'DELETE',
    body: jsonBody({ endpoint }),
  })
}
