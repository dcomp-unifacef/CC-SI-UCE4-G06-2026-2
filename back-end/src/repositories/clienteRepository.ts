import { prisma } from '../database/client'
import type { CreateClienteDto, UpdateClienteDto } from '../dto/cliente'

export function findAll() {
  return prisma.cliente.findMany({ orderBy: { razaoSocialNome: 'asc' } })
}

export function findById(id: number) {
  return prisma.cliente.findUnique({
    where: { idCliente: id },
    include: { compromissos: true },
  })
}

export function findForReportByCreatedAt(start: Date, endExclusive: Date) {
  return prisma.cliente.findMany({
    where: {
      criadoEm: {
        gte: start,
        lt: endExclusive,
      },
    },
    orderBy: [{ criadoEm: 'asc' }, { idCliente: 'asc' }],
    select: {
      idCliente: true,
      razaoSocialNome: true,
      cnpjCpf: true,
      telefoneWhatsapp: true,
      email: true,
      ramoAtuacao: true,
      origemContato: true,
      observacoes: true,
      criadoEm: true,
    },
  })
}

export function create(data: CreateClienteDto) {
  return prisma.cliente.create({ data })
}

export function update(id: number, data: UpdateClienteDto) {
  return prisma.cliente.update({ where: { idCliente: id }, data })
}

export function remove(id: number) {
  return prisma.cliente.delete({ where: { idCliente: id } })
}
