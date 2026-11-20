import type { SessionData } from './auth'

declare global {
  namespace Express {
    interface Request {
      session?: SessionData
    }
  }
}
