import type {
  NextFunction,
  Request,
  Response,
} from 'express'
import * as service from '../services/administradorService'
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
    const administrador = await service.update(
      Number(req.params.id),
      req.body,
    )
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
    await service.remove(Number(req.params.id))
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
    res.json(administrador)
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
    const administrador = await service.changePassword(
      Number(req.params.id),
      req.body.senhaAtual,
      req.body.novaSenha,
    )
    res.json(administrador)
  } catch (error) {
    next(error)
  }
}
