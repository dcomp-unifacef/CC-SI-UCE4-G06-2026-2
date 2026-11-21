import type { NextFunction, Request, Response } from 'express'
import * as pushNotificationService from '../services/pushNotificationService'
import * as pushSubscriptionService from '../services/pushSubscriptionService'
import type { PushSubscriptionInput } from '../services/pushSubscriptionService'
import { AppError } from '../types/error'

function getAdministratorId(req: Request): number {
  if (!req.session) {
    throw new AppError('Acesso não autorizado.', 401)
  }
  return req.session.idAdministrador
}

export async function getPublicKey(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ publicKey: pushNotificationService.getPublicKey() })
  } catch (error) {
    next(error)
  }
}

export async function registerSubscription(
  req: Request<Record<string, never>, unknown, PushSubscriptionInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await pushSubscriptionService.register(
      getAdministratorId(req),
      req.body,
    )
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function removeSubscription(
  req: Request<Record<string, never>, unknown, { endpoint: unknown }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await pushSubscriptionService.remove(
      getAdministratorId(req),
      req.body?.endpoint,
    )
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
