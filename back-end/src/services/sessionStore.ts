import { randomBytes } from 'node:crypto'
import type { SessionData } from '../types/auth'

const DEFAULT_SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 horas

const store = new Map<string, SessionData>()

export function createSession(admin: {
  idAdministrador: number
  username: string
  criadoEm?: Date
}): string {
  const sessionId = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + DEFAULT_SESSION_DURATION_MS)

  store.set(sessionId, {
    idAdministrador: admin.idAdministrador,
    username: admin.username,
    criadoEm: admin.criadoEm ?? new Date(),
    expiresAt,
  })

  return sessionId
}

export function getSession(sessionId: string): SessionData | null {
  if (!sessionId || typeof sessionId !== 'string') {
    return null
  }

  const session = store.get(sessionId)
  if (!session) {
    return null
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    store.delete(sessionId)
    return null
  }

  return session
}

export function destroySession(sessionId: string): boolean {
  return store.delete(sessionId)
}

export function cleanupExpiredSessions(): number {
  const now = Date.now()
  let removedCount = 0

  for (const [id, session] of store.entries()) {
    if (session.expiresAt.getTime() <= now) {
      store.delete(id)
      removedCount++
    }
  }

  return removedCount
}

export function clearAllSessions(): void {
  store.clear()
}

export function getActiveSessionCount(): number {
  return store.size
}

const interval = setInterval(cleanupExpiredSessions, 15 * 60 * 1000)
if (interval.unref) {
  interval.unref()
}
