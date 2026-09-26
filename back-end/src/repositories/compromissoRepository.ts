import { prisma } from '../database/client'
import type { CreateCompromissoDto, UpdateCompromissoDto } from '../types/compromisso'

export function findAll() {
  return prisma.compromisso.findMany({
    include: { cliente: true },
    orderBy: { data: 'asc' },
  })
}

export function findById(id: number) {
  return prisma.compromisso.findUnique({
    where: { idCompromisso: id },
    include: { cliente: true },
  })
}

export function create(data: CreateCompromissoDto) {
  return prisma.compromisso.create({ data })
}

export function update(id: number, data: UpdateCompromissoDto) {
  return prisma.compromisso.update({ where: { idCompromisso: id }, data })
}

export function remove(id: number) {
  return prisma.compromisso.delete({ where: { idCompromisso: id } })
}
