import type {
  NextFunction,
  Request,
  Response,
} from 'express'
import * as service from '../services/categoriaCompromissoService'
import type {
  CreateCategoriaCompromissoDto,
  UpdateCategoriaCompromissoDto,
} from '../dto/categoriaCompromisso'

type CategoriaIdParams = {
  id: string
}

type CreateCategoriaRequest = Request<
  Record<string, never>,
  unknown,
  CreateCategoriaCompromissoDto
>

type UpdateCategoriaRequest = Request<
  CategoriaIdParams,
  unknown,
  UpdateCategoriaCompromissoDto
>

export async function retrieveAll(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categorias = await service.findAll()
    res.json(categorias)
  } catch (error) {
    next(error)
  }
}

export async function retrieveOne(
  req: Request<CategoriaIdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categoria = await service.findById(Number(req.params.id))
    res.json(categoria)
  } catch (error) {
    next(error)
  }
}

export async function create(
  req: CreateCategoriaRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categoria = await service.create(req.body)
    res.status(201).json(categoria)
  } catch (error) {
    next(error)
  }
}

export async function update(
  req: UpdateCategoriaRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categoria = await service.update(
      Number(req.params.id),
      req.body,
    )
    res.json(categoria)
  } catch (error) {
    next(error)
  }
}

export async function remove(
  req: Request<CategoriaIdParams>,
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
