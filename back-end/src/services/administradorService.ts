import { compare, hash } from 'bcryptjs'
import * as administradorRepository from '../repositories/administradorRepository'
import type {
  CreateAdministradorData,
  CreateAdministradorDto,
  UpdateAdministradorData,
  UpdateAdministradorDto,
} from '../dto/administrador'
import { AppError } from '../types/error'

const BCRYPT_ROUNDS = 12

function validateId(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('O id do administrador deve ser um inteiro positivo.', 400)
  }
}

function validateUsername(username: string) {
  if (!username.trim()) {
    throw new AppError('O username do administrador é obrigatório.', 400)
  }

  if (username.trim().length > 50) {
    throw new AppError('O username do administrador deve ter no máximo 50 caracteres.', 400)
  }
}

function validatePassword(senha: string) {
  if (!senha) {
    throw new AppError('A senha do administrador é obrigatória.', 400)
  }

  if (Buffer.byteLength(senha, 'utf8') > 72) {
    throw new AppError('A senha deve ter no máximo 72 bytes para ser processada com bcrypt.', 400)
  }
}

export async function create(data: CreateAdministradorDto) {
  validateUsername(data.username)
  validatePassword(data.senha)

  const record: CreateAdministradorData = {
    username: data.username.trim(),
    senhaHash: await hash(data.senha, BCRYPT_ROUNDS),
  }

  return administradorRepository.create(record)
}

export async function findAll() {
  return administradorRepository.findAll()
}

export async function findById(id: number) {
  validateId(id)

  const administrador = await administradorRepository.findById(id)

  if (!administrador) {
    throw new AppError('Administrador não encontrado.', 404)
  }

  return administrador
}

export async function authenticate(username: string, senha: string) {
  if (
    !username.trim() ||
    !senha ||
    Buffer.byteLength(senha, 'utf8') > 72
  ) {
    throw new AppError('Credenciais inválidas.', 401)
  }

  const administrador = await administradorRepository.findForAuthenticationByUsername(username.trim())

  if (!administrador || !(await compare(senha, administrador.senhaHash))) {
    throw new AppError('Credenciais inválidas.', 401)
  }

  return {
    idAdministrador: administrador.idAdministrador,
    username: administrador.username,
    criadoEm: administrador.criadoEm,
  }
}

export async function update(id: number, data: UpdateAdministradorDto) {
  await findById(id)

  const updateData: UpdateAdministradorData = {}

  if (data.username !== undefined) {
    validateUsername(data.username)
    updateData.username = data.username.trim()
  }

  if (data.senha !== undefined) {
    validatePassword(data.senha)
    updateData.senhaHash = await hash(data.senha, BCRYPT_ROUNDS)
  }

  if (updateData.username === undefined && updateData.senhaHash === undefined) {
    throw new AppError('Informe ao menos um campo para atualizar.', 400)
  }

  return administradorRepository.update(id, updateData)
}

export async function changePassword(id: number, senhaAtual: string, novaSenha: string) {
  validatePassword(novaSenha)
  const dadosPublicos = await findById(id)

  if (!senhaAtual || Buffer.byteLength(senhaAtual, 'utf8') > 72) {
    throw new AppError('Senha atual inválida.', 401)
  }

  const administrador = await administradorRepository.findForAuthenticationByUsername(
    dadosPublicos.username,
  )

  if (!administrador || !(await compare(senhaAtual, administrador.senhaHash))) {
    throw new AppError('Senha atual inválida.', 401)
  }

  return administradorRepository.updatePasswordHash(
    id,
    await hash(novaSenha, BCRYPT_ROUNDS),
  )
}

export async function remove(id: number) {
  await findById(id)

  return administradorRepository.remove(id)
}
