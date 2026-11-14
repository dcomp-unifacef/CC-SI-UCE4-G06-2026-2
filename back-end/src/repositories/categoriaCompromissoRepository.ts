import { prisma } from '../database/client'
import type {
  CreateCategoriaCompromissoDto,
  UpdateCategoriaCompromissoDto,
} from '../dto/categoriaCompromisso'

export function findAll() {
  return prisma.categoriaCompromisso.findMany({
    orderBy: { nomeCategoria: 'asc' },
  })
}

export function findById(id: number) {
  return prisma.categoriaCompromisso.findUnique({
    where: { idCategoria: id },
  })
}

export function findByNome(nome: string) {
  return prisma.categoriaCompromisso.findUnique({
    where: { nomeCategoria: nome },
  })
}

export function create(data: CreateCategoriaCompromissoDto) {
  return prisma.categoriaCompromisso.create({ data })
}

export function update(id: number, data: UpdateCategoriaCompromissoDto) {
  return prisma.categoriaCompromisso.update({
    where: { idCategoria: id },
    data,
  })
}

export function remove(id: number) {
  return prisma.categoriaCompromisso.delete({
    where: { idCategoria: id },
  })
}
