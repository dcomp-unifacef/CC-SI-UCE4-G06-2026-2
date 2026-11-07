import { prisma } from '../database/client'
import type { CreateAdministradorData, UpdateAdministradorData } from '../dto/administrador'

export function findForAuthenticationByUsername(username: string) {
  return prisma.administrador.findUnique({
    where: { username },
    select: {
      idAdministrador: true,
      username: true,
      senhaHash: true,
      criadoEm: true,
    },
  })
}

export function findAll() {
  return prisma.administrador.findMany({
    orderBy: { username: 'asc' },
    select: {
      idAdministrador: true,
      username: true,
      criadoEm: true,
    },
  })
}

export function findById(id: number) {
  return prisma.administrador.findUnique({
    where: { idAdministrador: id },
    select: {
      idAdministrador: true,
      username: true,
      criadoEm: true,
    },
  })
}

export function create(data: CreateAdministradorData) {
  return prisma.administrador.create({
    data,
    select: {
      idAdministrador: true,
      username: true,
      criadoEm: true,
    },
  })
}

export function update(id: number, data: UpdateAdministradorData) {
  return prisma.administrador.update({
    where: { idAdministrador: id },
    data,
    select: {
      idAdministrador: true,
      username: true,
      criadoEm: true,
    },
  })
}

export function updatePasswordHash(id: number, senhaHash: string) {
  return update(id, { senhaHash })
}

export function remove(id: number) {
  return prisma.administrador.delete({
    where: { idAdministrador: id },
    select: {
      idAdministrador: true,
      username: true,
      criadoEm: true,
    },
  })
}
