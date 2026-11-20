const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
export const API_BASE_URL = (configuredApiUrl || '/api').replace(/\/$/, '')

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('X-Requested-With', 'XMLHttpRequest')

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const responseText = await response.text()
  let responseBody: unknown

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText) as unknown
    } catch {
      responseBody = responseText
    }
  }

  if (response.status === 401 && path !== '/administradores/autenticar' && path !== '/administradores/sessao') {
    window.dispatchEvent(new CustomEvent('atelie:unauthorized'))
  }

  if (!response.ok) {
    const message =
      isRecord(responseBody) && typeof responseBody.erro === 'string'
        ? responseBody.erro
        : isRecord(responseBody) && typeof responseBody.message === 'string'
          ? responseBody.message
          : `Falha na comunicação com o servidor (${response.status}).`
    throw new Error(message)
  }

  return responseBody as T
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação.'
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value)
}