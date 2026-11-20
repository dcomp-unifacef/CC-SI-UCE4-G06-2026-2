import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../types/error'

interface RateLimitRecord {
  count: number
  resetAt: number
}

function createMemoryRateLimiter(options: {
  windowMs: number
  maxRequests: number
  message: string
}) {
  const records = new Map<string, RateLimitRecord>()

  function cleanup() {
    const now = Date.now()
    for (const [key, record] of records.entries()) {
      if (record.resetAt <= now) {
        records.delete(key)
      }
    }
  }

  const timer = setInterval(cleanup, Math.min(options.windowMs, 60_000))
  if (timer.unref) {
    timer.unref()
  }

  return (req: Request, _res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()
    const record = records.get(ip)

    if (!record || record.resetAt <= now) {
      records.set(ip, { count: 1, resetAt: now + options.windowMs })
      return next()
    }

    if (record.count >= options.maxRequests) {
      return next(new AppError(options.message, 429))
    }

    record.count++
    next()
  }
}

export const loginRateLimiter = createMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Muitas tentativas de acesso. Tente novamente em 15 minutos.',
})

export const leadRateLimiter = createMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Limite de mensagens atingido. Aguarde alguns minutos antes de enviar novamente.',
})
