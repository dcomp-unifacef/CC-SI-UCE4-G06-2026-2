import * as clienteRepository from '../repositories/clienteRepository'
import type { CreateClienteDto, UpdateClienteDto } from '../dto/cliente'
import { AppError } from '../types/error'

function validateId(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('O id do cliente deve ser um inteiro positivo.', 400)
  }
}

function requiredText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string') {
    throw new AppError(`O campo ${field} deve ser um texto.`, 400)
  }

  const normalized = value.trim()

  if (!normalized) {
    throw new AppError(`O campo ${field} é obrigatório.`, 400)
  }

  if (normalized.length > maxLength) {
    throw new AppError(`O campo ${field} deve ter no máximo ${maxLength} caracteres.`, 400)
  }

  return normalized
}

function nullableText(
  value: unknown,
  field: string,
  maxLength?: number,
): string | null | undefined {
  if (value === undefined || value === null) {
    return value
  }

  if (typeof value !== 'string') {
    throw new AppError(`O campo ${field} deve ser um texto ou nulo.`, 400)
  }

  const normalized = value.trim()

  if (!normalized) {
    return null
  }

  if (maxLength !== undefined && normalized.length > maxLength) {
    throw new AppError(`O campo ${field} deve ter no máximo ${maxLength} caracteres.`, 400)
  }

  return normalized
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
}

async function handleUniqueConstraint<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError('Já existe um cliente com este CNPJ/CPF.', 409)
    }

    throw error
  }
}

export async function create(data: CreateClienteDto) {
  if (!data || typeof data !== 'object') {
    throw new AppError('Os dados do cliente são inválidos.', 400)
  }

  const normalizedData: CreateClienteDto = {
    razaoSocialNome: requiredText(data.razaoSocialNome, 'razaoSocialNome', 150),
    telefoneWhatsapp: requiredText(data.telefoneWhatsapp, 'telefoneWhatsapp', 20),
    cnpjCpf: nullableText(data.cnpjCpf, 'cnpjCpf', 20),
    email: nullableText(data.email, 'email', 100),
    ramoAtuacao: nullableText(data.ramoAtuacao, 'ramoAtuacao', 100),
    origemContato:
      data.origemContato === undefined
        ? undefined
        : requiredText(data.origemContato, 'origemContato', 50),
    observacoes: nullableText(data.observacoes, 'observacoes'),
  }

  return handleUniqueConstraint(() => clienteRepository.create(normalizedData))
}

export async function findAll() {
  return clienteRepository.findAll()
}

export async function findById(id: number) {
  validateId(id)

  const cliente = await clienteRepository.findById(id)

  if (!cliente) {
    throw new AppError('Cliente não encontrado.', 404)
  }

  return cliente
}

export async function update(id: number, data: UpdateClienteDto) {
  validateId(id)

  if (!data || typeof data !== 'object') {
    throw new AppError('Os dados do cliente são inválidos.', 400)
  }

  const normalizedData: UpdateClienteDto = {}

  if (data.razaoSocialNome !== undefined) {
    normalizedData.razaoSocialNome = requiredText(data.razaoSocialNome, 'razaoSocialNome', 150)
  }

  if (data.telefoneWhatsapp !== undefined) {
    normalizedData.telefoneWhatsapp = requiredText(data.telefoneWhatsapp, 'telefoneWhatsapp', 20)
  }

  if (data.cnpjCpf !== undefined) {
    normalizedData.cnpjCpf = nullableText(data.cnpjCpf, 'cnpjCpf', 20)
  }

  if (data.email !== undefined) {
    normalizedData.email = nullableText(data.email, 'email', 100)
  }

  if (data.ramoAtuacao !== undefined) {
    normalizedData.ramoAtuacao = nullableText(data.ramoAtuacao, 'ramoAtuacao', 100)
  }

  if (data.origemContato !== undefined) {
    normalizedData.origemContato = requiredText(data.origemContato, 'origemContato', 50)
  }

  if (data.observacoes !== undefined) {
    normalizedData.observacoes = nullableText(
      data.observacoes,
      'observacoes',
    )
  }

  if (Object.keys(normalizedData).length === 0) {
    throw new AppError('Informe ao menos um campo válido para atualizar.', 400)
  }

  await findById(id)

  return handleUniqueConstraint(() => clienteRepository.update(id, normalizedData))
}

export async function remove(id: number) {
  await findById(id)

  return clienteRepository.remove(id)
}
