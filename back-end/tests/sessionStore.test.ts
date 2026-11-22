import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as sessionStore from '../src/services/sessionStore'

const OITO_HORAS_MS = 8 * 60 * 60 * 1000
const admin = { idAdministrador: 1, username: 'admin' }

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-12-01T12:00:00.000Z'))
  sessionStore.clearAllSessions()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('sessionStore', () => {
  it('cria sessões com ids aleatórios de 64 caracteres hexadecimais', () => {
    const a = sessionStore.createSession(admin)
    const b = sessionStore.createSession(admin)

    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(a).not.toBe(b)
    expect(sessionStore.getActiveSessionCount()).toBe(2)
  })

  it('recupera os dados do administrador da sessão', () => {
    const id = sessionStore.createSession(admin)
    expect(sessionStore.getSession(id)).toMatchObject(admin)
  })

  it('retorna null para sessão desconhecida ou vazia', () => {
    expect(sessionStore.getSession('inexistente')).toBeNull()
    expect(sessionStore.getSession('')).toBeNull()
  })

  it('expira a sessão após 8 horas', () => {
    const id = sessionStore.createSession(admin)

    vi.advanceTimersByTime(OITO_HORAS_MS - 1)
    expect(sessionStore.getSession(id)).not.toBeNull()

    vi.advanceTimersByTime(1)
    expect(sessionStore.getSession(id)).toBeNull()
    expect(sessionStore.getActiveSessionCount()).toBe(0)
  })

  it('encerra a sessão no logout', () => {
    const id = sessionStore.createSession(admin)
    expect(sessionStore.destroySession(id)).toBe(true)
    expect(sessionStore.getSession(id)).toBeNull()
  })

  it('remove apenas as sessões expiradas na limpeza', () => {
    sessionStore.createSession(admin)
    vi.advanceTimersByTime(OITO_HORAS_MS / 2)
    const recente = sessionStore.createSession(admin)
    vi.advanceTimersByTime(OITO_HORAS_MS / 2)

    expect(sessionStore.cleanupExpiredSessions()).toBe(1)
    expect(sessionStore.getSession(recente)).not.toBeNull()
  })
})
