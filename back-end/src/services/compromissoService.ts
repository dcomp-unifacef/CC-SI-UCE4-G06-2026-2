import * as compromissoRepository from '../repositories/compromissoRepository'
import * as clienteService from './clienteService'
import * as administradorService from './administradorService'
import * as categoriaCompromissoService from './categoriaCompromissoService'
import type {
  CompromissoFilterDto,
  CreateCompromissoDto,
  UpdateCompromissoDto,
} from '../dto/compromisso'
import { AppError } from '../types/error'
import type { Prisma } from '@prisma/client'

function validateId(id: number, field: string) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`O campo ${field} deve ser um inteiro positivo.`, 400)
  }
}

function parseValidDate(value: unknown, field: string): Date {
  if (typeof value !== 'string' || isNaN(Date.parse(value))) {
    throw new AppError(`O campo ${field} deve conter uma data/hora ISO válida.`, 400)
  }
  return new Date(value)
}

function requiredText(value: unknown, field: string, maxLength: number): string {
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

function nullableText(value: unknown, field: string): string | null | undefined {
  if (value === undefined || value === null) {
    return value
  }
  if (typeof value !== 'string') {
    throw new AppError(`O campo ${field} deve ser um texto ou nulo.`, 400)
  }
  const normalized = value.trim()
  return normalized || null
}

export async function create(data: CreateCompromissoDto) {
  if (!data || typeof data !== 'object') {
    throw new AppError('Os dados do compromisso são inválidos.', 400)
  }

  const titulo = requiredText(data.titulo, 'titulo', 150)
  const descricao = nullableText(data.descricao, 'descricao')

  if (!data.dataHoraInicio) {
    throw new AppError('O campo dataHoraInicio é obrigatório.', 400)
  }
  const dataHoraInicio = parseValidDate(data.dataHoraInicio, 'dataHoraInicio')

  let dataHoraFim: Date | null = null
  if (data.dataHoraFim !== undefined && data.dataHoraFim !== null) {
    dataHoraFim = parseValidDate(data.dataHoraFim, 'dataHoraFim')
    if (dataHoraFim < dataHoraInicio) {
      throw new AppError('A dataHoraFim não pode ser anterior à dataHoraInicio.', 400)
    }
  }

  if (data.idAdministrador === undefined || data.idAdministrador === null) {
    throw new AppError('O campo idAdministrador é obrigatório.', 400)
  }
  validateId(data.idAdministrador, 'idAdministrador')
  await administradorService.findById(data.idAdministrador)

  let idCategoria: number | null = null
  if (data.idCategoria !== undefined && data.idCategoria !== null) {
    validateId(data.idCategoria, 'idCategoria')
    await categoriaCompromissoService.findById(data.idCategoria)
    idCategoria = data.idCategoria
  }

  let idCliente: number | null = null
  if (data.idCliente !== undefined && data.idCliente !== null) {
    validateId(data.idCliente, 'idCliente')
    await clienteService.findById(data.idCliente)
    idCliente = data.idCliente
  }

  const record: Prisma.CompromissoUncheckedCreateInput = {
    titulo,
    descricao,
    dataHoraInicio,
    dataHoraFim,
    concluido: data.concluido ?? false,
    alertaEmitido: data.alertaEmitido ?? false,
    antecedenciaAlertaMinutos:
      data.antecedenciaAlertaMinutos !== undefined ? data.antecedenciaAlertaMinutos : 1440,
    idAdministrador: data.idAdministrador,
    idCategoria,
    idCliente,
  }

  return compromissoRepository.create(record)
}

export async function findAll(filters?: CompromissoFilterDto) {
  let where: Prisma.CompromissoWhereInput | undefined

  if (filters && filters.idCategoria !== undefined) {
    validateId(filters.idCategoria, 'idCategoria')
    await categoriaCompromissoService.findById(filters.idCategoria)
    where = { idCategoria: filters.idCategoria }
  }

  return compromissoRepository.findAll(where)
}

export async function findById(id: number) {
  validateId(id, 'idCompromisso')

  const compromisso = await compromissoRepository.findById(id)
  if (!compromisso) {
    throw new AppError('Compromisso não encontrado.', 404)
  }

  return compromisso
}

export async function update(id: number, data: UpdateCompromissoDto) {
  validateId(id, 'idCompromisso')

  if (!data || typeof data !== 'object') {
    throw new AppError('Os dados do compromisso são inválidos.', 400)
  }

  const existing = await findById(id)
  const updateData: Prisma.CompromissoUncheckedUpdateInput = {}

  if (data.titulo !== undefined) {
    updateData.titulo = requiredText(data.titulo, 'titulo', 150)
  }

  if (data.descricao !== undefined) {
    updateData.descricao = nullableText(data.descricao, 'descricao')
  }

  let newInicio = existing.dataHoraInicio
  if (data.dataHoraInicio !== undefined) {
    newInicio = parseValidDate(data.dataHoraInicio, 'dataHoraInicio')
    updateData.dataHoraInicio = newInicio

    // Conforme Diagrama REV00: Se a data for alterada e o evento não estiver concluído,
    // redefine alertaEmitido = false para permitir novo alerta.
    if (!existing.concluido && data.alertaEmitido === undefined) {
      updateData.alertaEmitido = false
    }
  }

  if (data.dataHoraFim !== undefined) {
    if (data.dataHoraFim === null) {
      updateData.dataHoraFim = null
    } else {
      const newFim = parseValidDate(data.dataHoraFim, 'dataHoraFim')
      if (newFim < newInicio) {
        throw new AppError('A dataHoraFim não pode ser anterior à dataHoraInicio.', 400)
      }
      updateData.dataHoraFim = newFim
    }
  }

  if (data.concluido !== undefined) {
    if (typeof data.concluido !== 'boolean') {
      throw new AppError('O campo concluido deve ser um booleano.', 400)
    }
    updateData.concluido = data.concluido
  }

  if (data.alertaEmitido !== undefined) {
    if (typeof data.alertaEmitido !== 'boolean') {
      throw new AppError('O campo alertaEmitido deve ser um booleano.', 400)
    }
    updateData.alertaEmitido = data.alertaEmitido
  }

  if (data.antecedenciaAlertaMinutos !== undefined) {
    if (
      data.antecedenciaAlertaMinutos !== null &&
      (!Number.isInteger(data.antecedenciaAlertaMinutos) || data.antecedenciaAlertaMinutos < 0)
    ) {
      throw new AppError('O campo antecedenciaAlertaMinutos deve ser um número inteiro maior ou igual a zero ou nulo.', 400)
    }
    updateData.antecedenciaAlertaMinutos = data.antecedenciaAlertaMinutos
    if (data.antecedenciaAlertaMinutos === null) {
      if (data.alertaEmitido === undefined) {
        updateData.alertaEmitido = true
      }
    } else {
      // Se alterou a antecedência e o compromisso não estiver concluído,
      // recalcula/permite nova emissão se ainda não foi explicitamente cancelado
      if (!existing.concluido && data.alertaEmitido === undefined) {
        updateData.alertaEmitido = false
      }
    }
  }

  if (data.idAdministrador !== undefined) {
    validateId(data.idAdministrador, 'idAdministrador')
    await administradorService.findById(data.idAdministrador)
    updateData.idAdministrador = data.idAdministrador
  }

  if (data.idCategoria !== undefined) {
    if (data.idCategoria === null) {
      updateData.idCategoria = null
    } else {
      validateId(data.idCategoria, 'idCategoria')
      await categoriaCompromissoService.findById(data.idCategoria)
      updateData.idCategoria = data.idCategoria
    }
  }

  if (data.idCliente !== undefined) {
    if (data.idCliente === null) {
      updateData.idCliente = null
    } else {
      validateId(data.idCliente, 'idCliente')
      await clienteService.findById(data.idCliente)
      updateData.idCliente = data.idCliente
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('Informe ao menos um campo para atualizar.', 400)
  }

  return compromissoRepository.update(id, updateData)
}

export async function toggleConcluido(id: number) {
  const compromisso = await findById(id)
  return compromissoRepository.update(id, {
    concluido: !compromisso.concluido,
  })
}

export function calculateAlertTime(
  dataHoraInicio: Date,
  antecedenciaAlertaMinutos: number | null | undefined,
): Date | null {
  if (
    antecedenciaAlertaMinutos === null ||
    antecedenciaAlertaMinutos === undefined ||
    antecedenciaAlertaMinutos < 0
  ) {
    return null
  }
  return new Date(dataHoraInicio.getTime() - antecedenciaAlertaMinutos * 60 * 1000)
}

export function isAlertDue(
  compromisso: {
    dataHoraInicio: Date
    antecedenciaAlertaMinutos: number | null
    concluido: boolean
    alertaEmitido: boolean
  },
  now: Date = new Date(),
): boolean {
  if (compromisso.concluido || compromisso.alertaEmitido) {
    return false
  }

  const alertTime = calculateAlertTime(
    compromisso.dataHoraInicio,
    compromisso.antecedenciaAlertaMinutos,
  )

  if (!alertTime) {
    return false
  }

  return now.getTime() >= alertTime.getTime()
}

export async function findEligibleAlerts(referenceDate: Date = new Date()) {
  const candidates = await compromissoRepository.findPendingAlerts(referenceDate)
  return candidates.filter((item) => isAlertDue(item, referenceDate))
}

export async function markAlertAsEmitted(id: number) {
  validateId(id, 'idCompromisso')
  return compromissoRepository.update(id, { alertaEmitido: true })
}

export async function claimAlertEmission(id: number): Promise<boolean> {
  validateId(id, 'idCompromisso')
  const result = await compromissoRepository.claimAlertEmission(id)
  return result.count > 0
}

export interface DispatchSummary {
  processed: number
  emitted: number
  failed: number
  errors: Array<{ idCompromisso: number; error: string }>
}

export async function dispatchPendingAlerts(
  referenceDate: Date = new Date(),
  sender?: (compromisso: Awaited<ReturnType<typeof findEligibleAlerts>>[number]) => Promise<void>,
): Promise<DispatchSummary> {
  const eligible = await findEligibleAlerts(referenceDate)

  const summary: DispatchSummary = {
    processed: eligible.length,
    emitted: 0,
    failed: 0,
    errors: [],
  }

  for (const comp of eligible) {
    // Bloqueio atômico contra concorrência: reivindica emissão antes do envio
    const claimed = await claimAlertEmission(comp.idCompromisso)
    if (!claimed) {
      // Outra requisição/thread concorrente já reivindicou a emissão deste alerta
      continue
    }

    try {
      if (sender) {
        await sender(comp)
      } else {
        // Disparo via canal de notificação padrão: Registro estruturado em console
        // (Prevenção de interrupção e preparação para integração com canal definitivo)
        console.log(
          `[ALERTA DISPARADO] Compromisso ID ${comp.idCompromisso}: "${comp.titulo}" agendado para ${comp.dataHoraInicio.toISOString()} (Categoria: ${comp.categoria?.nomeCategoria || 'Geral'})`,
        )
      }

      summary.emitted++
    } catch (error: any) {
      // Em caso de falha no canal de envio, desfaz a marcação para permitir retry posterior
      await compromissoRepository.update(comp.idCompromisso, { alertaEmitido: false })
      summary.failed++
      summary.errors.push({
        idCompromisso: comp.idCompromisso,
        error: error?.message || 'Falha desconhecida no disparo',
      })
    }
  }

  return summary
}

export async function remove(id: number) {
  await findById(id)
  return compromissoRepository.remove(id)
}
