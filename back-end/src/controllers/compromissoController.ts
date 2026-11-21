import type {
  Request,
  Response,
  NextFunction,
} from 'express'
import * as service from '../services/compromissoService'
import * as pushNotificationService from '../services/pushNotificationService'
import type {
  CompromissoFilterDto,
  CreateCompromissoDto,
  UpdateCompromissoDto,
} from '../dto/compromisso'
import { AppError } from '../types/error'

type CompromissoIdParams = {
  id: string
}

type CreateCompromissoRequest = Request<
  Record<string, never>,
  unknown,
  CreateCompromissoDto
>

type UpdateCompromissoRequest = Request<
  CompromissoIdParams,
  unknown,
  UpdateCompromissoDto
>

export async function retrieveAll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const filters: CompromissoFilterDto = {}

    if (req.query.idCategoria !== undefined) {
      const raw = req.query.idCategoria
      const parsed = Number(raw)
      if (
        typeof raw !== 'string' ||
        raw.trim() === '' ||
        !Number.isInteger(parsed) ||
        parsed <= 0
      ) {
        throw new AppError(
          'O parâmetro idCategoria deve ser um número inteiro positivo.',
          400,
        )
      }
      filters.idCategoria = parsed
    }

    const compromissos = await service.findAll(filters, req.session?.idAdministrador)
    res.json(compromissos)
  } catch (error) {
    next(error)
  }
}

export async function retrieveOne(
  req: Request<CompromissoIdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id)
    const compromisso = await service.findById(id, req.session?.idAdministrador)
    res.json(compromisso)
  } catch (error) {
    next(error)
  }
}

export async function create(
  req: CreateCompromissoRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const compromisso = await service.create(req.body, req.session?.idAdministrador)
    res.status(201).json(compromisso)
  } catch (error) {
    next(error)
  }
}

export async function update(
  req: UpdateCompromissoRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id)
    const compromisso = await service.update(id, req.body, req.session?.idAdministrador)
    res.json(compromisso)
  } catch (error) {
    next(error)
  }
}

export async function toggleConcluido(
  req: Request<CompromissoIdParams, unknown, { concluido?: boolean }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id)
    let targetStatus: boolean | undefined

    if (req.body && req.body.concluido !== undefined) {
      if (typeof req.body.concluido !== 'boolean') {
        throw new AppError('O campo concluido deve ser um booleano.', 400)
      }
      targetStatus = req.body.concluido
    }

    const compromisso = await service.toggleConcluido(
      id,
      targetStatus,
      req.session?.idAdministrador,
    )
    res.json(compromisso)
  } catch (error) {
    next(error)
  }
}

export async function getPendingAlerts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const alerts = await service.findEligibleAlerts(new Date(), req.session?.idAdministrador)
    res.json(alerts)
  } catch (error) {
    next(error)
  }
}

export async function triggerAlerts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const summary = await pushNotificationService.dispatchDueNotifications(
      new Date(),
      req.session?.idAdministrador,
    )
    res.json(summary)
  } catch (error) {
    next(error)
  }
}

export async function remove(
  req: Request<CompromissoIdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id)
    await service.remove(id, req.session?.idAdministrador)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
