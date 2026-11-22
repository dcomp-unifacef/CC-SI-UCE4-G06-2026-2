import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/repositories/clienteRepository', () => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findForReportByCreatedAt: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

import * as clienteRepository from '../src/repositories/clienteRepository'
import * as clienteService from '../src/services/clienteService'
import { AppError } from '../src/types/error'

const repo = vi.mocked(clienteRepository)

beforeEach(() => {
  vi.clearAllMocks()
  repo.create.mockImplementation((async (data: unknown) => data) as never)
  repo.findById.mockResolvedValue({ idCliente: 1 } as never)
  repo.update.mockImplementation((async (_id: number, data: object) => data) as never)
})

describe('telefoneWhatsapp', () => {
  it.each([
    ['(16) 99999-9999', '+5516999999999'],
    ['+55 16 99999-9999', '+5516999999999'],
    ['55163333-4444', '+551633334444'],
  ])('normaliza %s para E.164', async (telefoneWhatsapp, esperado) => {
    await clienteService.create({
      razaoSocialNome: 'Cliente',
      telefoneWhatsapp,
    })

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ telefoneWhatsapp: esperado }),
    )
  })

  it.each([
    'telefone',
    '123',
    '(10) 99999-9999',
    '(16) 1234-5678',
    '+1 202 555 0123',
  ])('rejeita telefone inválido: %s', async (telefoneWhatsapp) => {
    await expect(
      clienteService.create({
        razaoSocialNome: 'Cliente',
        telefoneWhatsapp,
      }),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(repo.create).not.toHaveBeenCalled()
  })

  it('normaliza telefone ao atualizar um cliente', async () => {
    await clienteService.update(1, { telefoneWhatsapp: '16 99999 9999' })

    expect(repo.update).toHaveBeenCalledWith(1, {
      telefoneWhatsapp: '+5516999999999',
    })
  })

  it('rejeita texto vazio com erro de validação da aplicação', async () => {
    await expect(
      clienteService.create({
        razaoSocialNome: 'Cliente',
        telefoneWhatsapp: '   ',
      }),
    ).rejects.toBeInstanceOf(AppError)
  })
})
