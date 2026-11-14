import { prisma } from '../database/client'
import type { Prisma } from '@prisma/client'

export function findAll() {
  return prisma.compromisso.findMany({
    include: {
      categoria: true,
      administrador: {
        select: {
          idAdministrador: true,
          username: true,
          criadoEm: true,
        },
      },
      cliente: true,
    },
    orderBy: { dataHoraInicio: 'asc' },
  })
}

export function findById(id: number) {
  return prisma.compromisso.findUnique({
    where: { idCompromisso: id },
    include: {
      categoria: true,
      administrador: {
        select: {
          idAdministrador: true,
          username: true,
          criadoEm: true,
        },
      },
      cliente: true,
    },
  })
}

export function create(data: Prisma.CompromissoUncheckedCreateInput) {
  return prisma.compromisso.create({
    data,
    include: {
      categoria: true,
      administrador: {
        select: {
          idAdministrador: true,
          username: true,
          criadoEm: true,
        },
      },
      cliente: true,
    },
  })
}

export function update(id: number, data: Prisma.CompromissoUncheckedUpdateInput) {
  return prisma.compromisso.update({
    where: { idCompromisso: id },
    data,
    include: {
      categoria: true,
      administrador: {
        select: {
          idAdministrador: true,
          username: true,
          criadoEm: true,
        },
      },
      cliente: true,
    },
  })
}

export function remove(id: number) {
  return prisma.compromisso.delete({
    where: { idCompromisso: id },
  })
}
