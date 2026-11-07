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

function validateCalendarDate(value: unknown, field: string) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(`Informe ${field} no formato AAAA-MM-DD.`, 400)
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new AppError(`A data informada em ${field} não é válida.`, 400)
  }

  return value
}

function saoPauloMidnightToUtc(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const targetAsUtc = Date.UTC(year, month - 1, day)
  let timestamp = targetAsUtc

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(timestamp))
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)]),
    )
    const localAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    )
    const offset = localAsUtc - timestamp
    const nextTimestamp = targetAsUtc - offset

    if (nextTimestamp === timestamp) {
      break
    }

    timestamp = nextTimestamp
  }

  return new Date(timestamp)
}

function nextCalendarDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10)
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

export async function findReportByPeriod(dataInicio: unknown, dataFim: unknown) {
  const startDate = validateCalendarDate(dataInicio, 'dataInicio')
  const endDate = validateCalendarDate(dataFim, 'dataFim')

  if (startDate > endDate) {
    throw new AppError('dataInicio deve ser anterior ou igual a dataFim.', 400)
  }

  return clienteRepository.findForReportByCreatedAt(
    saoPauloMidnightToUtc(startDate),
    saoPauloMidnightToUtc(nextCalendarDate(endDate)),
  )
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
