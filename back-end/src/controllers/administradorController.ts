import type {
  NextFunction,
  Request,
  Response,
} from 'express'
import * as service from '../services/administradorService'
import * as sessionStore from '../services/sessionStore'
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from '../middlewares/authMiddleware'
import { AppError } from '../types/error'
import type {
  CreateAdministradorDto,
  UpdateAdministradorDto,
} from '../dto/administrador'

type AdministradorIdParams = {
  id: string
}

type CreateAdministradorRequest = Request<
  Record<string, never>,
  unknown,
  CreateAdministradorDto
>

type UpdateAdministradorRequest = Request<
  AdministradorIdParams,
  unknown,
  UpdateAdministradorDto
>

type AuthenticateAdministradorRequest = Request<
  Record<string, never>,
  unknown,
  { username: string; senha: string }
>

type ChangePasswordRequest = Request<
  AdministradorIdParams,
  unknown,
  { senhaAtual: string; novaSenha: string }
>

export async function retrieveAll(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const administradores = await service.findAll()
    res.json(administradores)
  } catch (error) {
    next(error)
  }
}

export async function retrieveOne(
  req: Request<AdministradorIdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const administrador = await service.findById(Number(req.params.id))
    res.json(administrador)
  } catch (error) {
    next(error)
  }
}

export async function create(
  req: CreateAdministradorRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const administrador = await service.create(req.body)
    res.status(201).json(administrador)
  } catch (error) {
    next(error)
  }
}

export async function update(
  req: UpdateAdministradorRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const targetId = Number(req.params.id)
    if (req.session?.idAdministrador !== targetId) {
      throw new AppError('Acesso não autorizado para modificar outro administrador.', 403)
    }
    const administrador = await service.update(targetId, req.body)
    res.json(administrador)
  } catch (error) {
    next(error)
  }
}

export async function remove(
  req: Request<AdministradorIdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const targetId = Number(req.params.id)
    if (req.session?.idAdministrador !== targetId) {
      throw new AppError('Acesso não autorizado para remover outro administrador.', 403)
    }
    await service.remove(targetId)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function authenticate(
  req: AuthenticateAdministradorRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const administrador = await service.authenticate(
      req.body.username,
      req.body.senha,
    )
    const sessionId = sessionStore.createSession(administrador)
    res.cookie(SESSION_COOKIE_NAME, sessionId, getSessionCookieOptions())
    res.json(administrador)
  } catch (error) {
    next(error)
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME]
    if (sessionId) {
      sessionStore.destroySession(sessionId)
    }
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function getCurrentSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.session) {
      res.status(401).json({ erro: 'Não autenticado.' })
      return
    }
    res.json({
      idAdministrador: req.session.idAdministrador,
      username: req.session.username,
      criadoEm: req.session.criadoEm,
    })
  } catch (error) {
    next(error)
  }
}

export async function changePassword(
  req: ChangePasswordRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const targetId = Number(req.params.id)
    if (req.session?.idAdministrador !== targetId) {
      throw new AppError('Acesso não autorizado para alterar a senha de outro administrador.', 403)
    }
    const administrador = await service.changePassword(
      targetId,
      req.body.senhaAtual,
      req.body.novaSenha,
    )
    res.json(administrador)
  } catch (error) {
    next(error)
  }
}
