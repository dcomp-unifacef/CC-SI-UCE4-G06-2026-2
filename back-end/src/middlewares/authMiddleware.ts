import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../types/error'
import * as sessionStore from '../services/sessionStore'

export const SESSION_COOKIE_NAME = 'atelie_session'

export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME]

  if (!sessionId) {
    return next(new AppError('Acesso não autorizado. Sessão inexistente.', 401))
  }

  const session = sessionStore.getSession(sessionId)
  if (!session) {
    return next(new AppError('Acesso não autorizado. Sessão inválida ou expirada.', 401))
  }

  req.session = session
  next()
}

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8888',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8888',
]

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>(defaultAllowedOrigins)
  const envOrigin = process.env.FRONTEND_URL?.trim()
  if (envOrigin) {
    origins.add(envOrigin.replace(/\/$/, ''))
  }
  return origins
}

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin
  const allowed = getAllowedOrigins()

  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Accept,X-Requested-With',
    )
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  next()
}

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (!MUTATION_METHODS.has(req.method)) {
    return next()
  }

  const origin = req.headers.origin
  if (origin) {
    const allowed = getAllowedOrigins()
    if (!allowed.has(origin)) {
      return next(new AppError('Origem de requisição não permitida.', 403))
    }
  }

  const requestedWith = req.headers['x-requested-with']
  const isLeadPublic =
    req.path === '/clientes/contato' ||
    req.originalUrl?.startsWith('/clientes/contato')

  if (!isLeadPublic && !requestedWith && !req.headers.origin) {
    return next(new AppError('Cabeçalho de proteção contra CSRF ausente.', 403))
  }

  next()
}
