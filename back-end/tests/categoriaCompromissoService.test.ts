import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/repositories/categoriaCompromissoRepository', () => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

import * as categoriaRepository from '../src/repositories/categoriaCompromissoRepository'
import * as categoriaService from '../src/services/categoriaCompromissoService'
import { AppError } from '../src/types/error'

const repo = vi.mocked(categoriaRepository)
const categoriaExistente = { idCategoria: 1, nomeCategoria: 'Reunião', corHex: '#D9D9D9' }

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
  repo.findById.mockResolvedValue(categoriaExistente as never)
})

describe('create', () => {
  it('normaliza nome e cor', async () => {
    await categoriaService.create({ nomeCategoria: '  Visita  ', corHex: ' #1A2B3C ' })
    expect(repo.create).toHaveBeenCalledWith({ nomeCategoria: 'Visita', corHex: '#1A2B3C' })
  })

  it('deixa a cor a cargo do banco quando não informada', async () => {
    await categoriaService.create({ nomeCategoria: 'Visita' })
    expect(repo.create).toHaveBeenCalledWith({ nomeCategoria: 'Visita', corHex: undefined })
  })

  it.each(['vermelho', '#FFF', '#GGGGGG', '123456'])('rejeita a cor %s', async (cor) => {
    await expectAppError(
      categoriaService.create({ nomeCategoria: 'Visita', corHex: cor }),
      400,
      /#RRGGBB/,
    )
  })

  it('rejeita nome vazio ou com mais de 50 caracteres', async () => {
    await expectAppError(categoriaService.create({ nomeCategoria: '  ' }), 400)
    await expectAppError(categoriaService.create({ nomeCategoria: 'a'.repeat(51) }), 400)
  })

  it('converte nome duplicado (P2002) em 409', async () => {
    repo.create.mockRejectedValue({ code: 'P2002' })
    await expectAppError(categoriaService.create({ nomeCategoria: 'Reunião' }), 409, /Já existe/)
  })
})

describe('findById', () => {
  it('retorna 404 para categoria inexistente', async () => {
    repo.findById.mockResolvedValue(null)
    await expectAppError(categoriaService.findById(5), 404)
  })
})

describe('update', () => {
  it('exige ao menos um campo', async () => {
    await expectAppError(categoriaService.update(1, {}), 400, /ao menos um campo/)
  })
})

describe('remove', () => {
  it('impede excluir categoria com compromissos vinculados (P2003)', async () => {
    repo.remove.mockRejectedValue({ code: 'P2003' })
    await expectAppError(categoriaService.remove(1), 409, /compromissos vinculados/)
  })

  it('repassa erros inesperados', async () => {
    repo.remove.mockRejectedValue(new Error('conexão perdida'))
    await expect(categoriaService.remove(1)).rejects.toThrow('conexão perdida')
  })
})
