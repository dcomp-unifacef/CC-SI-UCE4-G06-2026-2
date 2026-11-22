import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/repositories/compromissoRepository', () => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  findPendingAlerts: vi.fn(),
  claimAlertEmission: vi.fn(),
}))
vi.mock('../src/services/administradorService', () => ({ findById: vi.fn() }))
vi.mock('../src/services/categoriaCompromissoService', () => ({ findById: vi.fn() }))
vi.mock('../src/services/clienteService', () => ({ findById: vi.fn() }))

import * as compromissoRepository from '../src/repositories/compromissoRepository'
import * as administradorService from '../src/services/administradorService'
import * as categoriaCompromissoService from '../src/services/categoriaCompromissoService'
import * as compromissoService from '../src/services/compromissoService'
import { AppError } from '../src/types/error'

const repo = vi.mocked(compromissoRepository)

function compromissoFake(overrides: Record<string, unknown> = {}) {
  return {
    idCompromisso: 1,
    titulo: 'Reunião',
    descricao: null,
    dataHoraInicio: new Date('2026-12-01T15:00:00.000Z'),
    dataHoraFim: null,
    concluido: false,
    alertaEmitido: false,
    antecedenciaAlertaMinutos: 60,
    idAdministrador: 1,
    idCategoria: null,
    idCliente: null,
    categoria: null,
    ...overrides,
  }
}

async function expectAppError(promise: Promise<unknown>, statusCode: number, message?: RegExp) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  )
  expect(error).toBeInstanceOf(AppError)
  expect((error as AppError).statusCode).toBe(statusCode)
  if (message) expect((error as AppError).message).toMatch(message)
}

beforeEach(() => {
  vi.clearAllMocks()
  repo.create.mockImplementation((async (data: unknown) => data) as never)
  repo.update.mockImplementation((async (id: number, data: object) => ({ id, ...data })) as never)
})

describe('calculateAlertTime', () => {
  const inicio = new Date('2026-12-01T15:00:00.000Z')

  it('subtrai a antecedência em minutos do início', () => {
    expect(compromissoService.calculateAlertTime(inicio, 90)?.toISOString()).toBe(
      '2026-12-01T13:30:00.000Z',
    )
  })

  it('retorna o próprio início quando a antecedência é zero', () => {
    expect(compromissoService.calculateAlertTime(inicio, 0)?.getTime()).toBe(inicio.getTime())
  })

  it.each([null, undefined, -5])('retorna null para antecedência %s', (valor) => {
    expect(compromissoService.calculateAlertTime(inicio, valor)).toBeNull()
  })
})

describe('isAlertDue', () => {
  const base = {
    dataHoraInicio: new Date('2026-12-01T15:00:00.000Z'),
    antecedenciaAlertaMinutos: 60,
    concluido: false,
    alertaEmitido: false,
  }

  it('é falso antes do horário do alerta', () => {
    expect(compromissoService.isAlertDue(base, new Date('2026-12-01T13:59:59.000Z'))).toBe(false)
  })

  it('é verdadeiro exatamente no horário do alerta e depois dele', () => {
    expect(compromissoService.isAlertDue(base, new Date('2026-12-01T14:00:00.000Z'))).toBe(true)
    expect(compromissoService.isAlertDue(base, new Date('2026-12-01T16:00:00.000Z'))).toBe(true)
  })

  it('ignora compromissos concluídos, já alertados ou sem alerta', () => {
    const agora = new Date('2026-12-01T14:30:00.000Z')
    expect(compromissoService.isAlertDue({ ...base, concluido: true }, agora)).toBe(false)
    expect(compromissoService.isAlertDue({ ...base, alertaEmitido: true }, agora)).toBe(false)
    expect(
      compromissoService.isAlertDue({ ...base, antecedenciaAlertaMinutos: null }, agora),
    ).toBe(false)
  })
})

describe('create', () => {
  const valido = {
    titulo: '  Visita ao cliente  ',
    dataHoraInicio: '2026-12-01T15:00:00.000Z',
    idAdministrador: 1,
  }

  it('normaliza o título e aplica os valores padrão', async () => {
    const criado = (await compromissoService.create({ ...valido })) as Record<string, unknown>

    expect(criado.titulo).toBe('Visita ao cliente')
    expect(criado.concluido).toBe(false)
    expect(criado.alertaEmitido).toBe(false)
    expect(criado.antecedenciaAlertaMinutos).toBe(1440)
    expect(criado.idCategoria).toBeNull()
    expect(criado.idCliente).toBeNull()
    expect(administradorService.findById).toHaveBeenCalledWith(1)
  })

  it('usa o administrador da sessão em vez do enviado no corpo', async () => {
    const criado = (await compromissoService.create({ ...valido, idAdministrador: 99 }, 7)) as {
      idAdministrador: number
    }
    expect(criado.idAdministrador).toBe(7)
  })

  it('valida a categoria quando informada', async () => {
    await compromissoService.create({ ...valido, idCategoria: 3 })
    expect(categoriaCompromissoService.findById).toHaveBeenCalledWith(3)
  })

  it('rejeita título vazio', async () => {
    await expectAppError(compromissoService.create({ ...valido, titulo: '   ' }), 400, /titulo/)
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('rejeita data de início inválida', async () => {
    await expectAppError(
      compromissoService.create({ ...valido, dataHoraInicio: 'amanhã' }),
      400,
      /dataHoraInicio/,
    )
  })

  it('rejeita fim anterior ao início', async () => {
    await expectAppError(
      compromissoService.create({ ...valido, dataHoraFim: '2026-12-01T14:00:00.000Z' }),
      400,
      /anterior/,
    )
  })

  it('rejeita antecedência de alerta negativa ou fracionada', async () => {
    await expectAppError(
      compromissoService.create({ ...valido, antecedenciaAlertaMinutos: -1 }),
      400,
    )
    await expectAppError(
      compromissoService.create({ ...valido, antecedenciaAlertaMinutos: 1.5 }),
      400,
    )
  })
})

describe('findById', () => {
  it('retorna 404 para compromisso inexistente', async () => {
    repo.findById.mockResolvedValue(null)
    await expectAppError(compromissoService.findById(10), 404)
  })

  it('esconde compromissos de outro administrador', async () => {
    repo.findById.mockResolvedValue(compromissoFake({ idAdministrador: 2 }) as never)
    await expectAppError(compromissoService.findById(1, 1), 404)
  })

  it('rejeita id não positivo', async () => {
    await expectAppError(compromissoService.findById(0), 400)
  })
})

describe('update', () => {
  it('reagendar um compromisso pendente reativa o alerta', async () => {
    repo.findById.mockResolvedValue(compromissoFake({ alertaEmitido: true }) as never)

    await compromissoService.update(1, { dataHoraInicio: '2026-12-02T15:00:00.000Z' })

    expect(repo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ alertaEmitido: false }),
    )
  })

  it('remover a antecedência marca o alerta como emitido', async () => {
    repo.findById.mockResolvedValue(compromissoFake() as never)

    await compromissoService.update(1, { antecedenciaAlertaMinutos: null })

    expect(repo.update).toHaveBeenCalledWith(1, {
      antecedenciaAlertaMinutos: null,
      alertaEmitido: true,
    })
  })

  it('rejeita fim anterior ao início já salvo', async () => {
    repo.findById.mockResolvedValue(compromissoFake() as never)
    await expectAppError(
      compromissoService.update(1, { dataHoraFim: '2026-12-01T10:00:00.000Z' }),
      400,
    )
  })

  it('exige ao menos um campo', async () => {
    repo.findById.mockResolvedValue(compromissoFake() as never)
    await expectAppError(compromissoService.update(1, {}), 400, /ao menos um campo/)
  })
})

describe('toggleConcluido', () => {
  it('inverte o status quando nenhum valor é informado', async () => {
    repo.findById.mockResolvedValue(compromissoFake({ concluido: false }) as never)
    await compromissoService.toggleConcluido(1)
    expect(repo.update).toHaveBeenCalledWith(1, { concluido: true })
  })

  it('respeita o status informado', async () => {
    repo.findById.mockResolvedValue(compromissoFake({ concluido: false }) as never)
    await compromissoService.toggleConcluido(1, false)
    expect(repo.update).toHaveBeenCalledWith(1, { concluido: false })
  })
})

describe('dispatchPendingAlerts', () => {
  const agora = new Date('2026-12-01T14:30:00.000Z')

  it('dispara somente alertas vencidos do administrador da sessão', async () => {
    repo.findPendingAlerts.mockResolvedValue([
      compromissoFake({ idCompromisso: 1 }),
      compromissoFake({ idCompromisso: 2, idAdministrador: 2 }),
      compromissoFake({ idCompromisso: 3, antecedenciaAlertaMinutos: 10 }),
    ] as never)
    repo.claimAlertEmission.mockResolvedValue({ count: 1 })
    const sender = vi.fn().mockResolvedValue(undefined)

    const resumo = await compromissoService.dispatchPendingAlerts(agora, sender, 1)

    expect(resumo).toEqual({ processed: 1, emitted: 1, failed: 0, errors: [] })
    expect(sender).toHaveBeenCalledTimes(1)
    expect(sender.mock.calls[0][0].idCompromisso).toBe(1)
  })

  it('não envia alerta já reivindicado por outro processo', async () => {
    repo.findPendingAlerts.mockResolvedValue([compromissoFake()] as never)
    repo.claimAlertEmission.mockResolvedValue({ count: 0 })
    const sender = vi.fn()

    const resumo = await compromissoService.dispatchPendingAlerts(agora, sender)

    expect(sender).not.toHaveBeenCalled()
    expect(resumo.emitted).toBe(0)
  })

  it('libera o alerta para nova tentativa quando o envio falha', async () => {
    repo.findPendingAlerts.mockResolvedValue([compromissoFake()] as never)
    repo.claimAlertEmission.mockResolvedValue({ count: 1 })
    const sender = vi.fn().mockRejectedValue(new Error('push indisponível'))

    const resumo = await compromissoService.dispatchPendingAlerts(agora, sender)

    expect(repo.update).toHaveBeenCalledWith(1, { alertaEmitido: false })
    expect(resumo).toEqual({
      processed: 1,
      emitted: 0,
      failed: 1,
      errors: [{ idCompromisso: 1, error: 'push indisponível' }],
    })
  })
})
