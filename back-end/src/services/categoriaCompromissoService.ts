import * as categoriaCompromissoRepository from '../repositories/categoriaCompromissoRepository'
import type {
  CreateCategoriaCompromissoDto,
  UpdateCategoriaCompromissoDto,
} from '../dto/categoriaCompromisso'
import { AppError } from '../types/error'

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

function validateId(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('O id da categoria deve ser um inteiro positivo.', 400)
  }
}

function validateNomeCategoria(nome: unknown): string {
  if (typeof nome !== 'string') {
    throw new AppError('O nome da categoria deve ser um texto.', 400)
  }

  const normalized = nome.trim()

  if (!normalized) {
    throw new AppError('O nome da categoria é obrigatório.', 400)
  }

  if (normalized.length > 50) {
    throw new AppError('O nome da categoria deve ter no máximo 50 caracteres.', 400)
  }

  return normalized
}

function validateCorHex(cor: unknown): string {
  if (typeof cor !== 'string') {
    throw new AppError('A cor hexadecimal deve ser um texto.', 400)
  }

  const normalized = cor.trim()

  if (!HEX_COLOR_REGEX.test(normalized)) {
    throw new AppError('A cor hexadecimal deve estar no formato #RRGGBB (ex: #D9D9D9).', 400)
  }

  return normalized
}

function isPrismaError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error
}

async function handleDatabaseErrors<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === 'P2002') {
        throw new AppError('Já existe uma categoria com este nome.', 409)
      }
      if (error.code === 'P2003') {
        throw new AppError(
          'Esta categoria não pode ser excluída pois possui compromissos vinculados.',
          409,
        )
      }
    }
    throw error
  }
}

export async function create(data: CreateCategoriaCompromissoDto) {
  if (!data || typeof data !== 'object') {
    throw new AppError('Os dados da categoria são inválidos.', 400)
  }

  const nomeCategoria = validateNomeCategoria(data.nomeCategoria)
  const corHex = data.corHex !== undefined ? validateCorHex(data.corHex) : undefined

  return handleDatabaseErrors(() =>
    categoriaCompromissoRepository.create({
      nomeCategoria,
      corHex,
    }),
  )
}

export async function findAll() {
  return categoriaCompromissoRepository.findAll()
}

export async function findById(id: number) {
  validateId(id)

  const categoria = await categoriaCompromissoRepository.findById(id)

  if (!categoria) {
    throw new AppError('Categoria não encontrada.', 404)
  }

  return categoria
}

export async function update(id: number, data: UpdateCategoriaCompromissoDto) {
  validateId(id)

  if (!data || typeof data !== 'object') {
    throw new AppError('Os dados da categoria são inválidos.', 400)
  }

  await findById(id)

  const updateData: UpdateCategoriaCompromissoDto = {}

  if (data.nomeCategoria !== undefined) {
    updateData.nomeCategoria = validateNomeCategoria(data.nomeCategoria)
  }

  if (data.corHex !== undefined) {
    updateData.corHex = validateCorHex(data.corHex)
  }

  if (updateData.nomeCategoria === undefined && updateData.corHex === undefined) {
    throw new AppError('Informe ao menos um campo para atualizar.', 400)
  }

  return handleDatabaseErrors(() =>
    categoriaCompromissoRepository.update(id, updateData),
  )
}

export async function remove(id: number) {
  await findById(id)

  return handleDatabaseErrors(() => categoriaCompromissoRepository.remove(id))
}
