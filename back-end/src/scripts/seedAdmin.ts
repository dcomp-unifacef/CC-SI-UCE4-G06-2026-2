import { hash } from 'bcryptjs'
import * as administradorRepository from '../repositories/administradorRepository'
import { AppError } from '../types/error'

const BCRYPT_ROUNDS = 12

function validateUsername(username: string) {
  if (!username || !username.trim()) {
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

export async function createInitialAdmin(username: string, senha: string) {
  validateUsername(username)
  validatePassword(senha)

  const existing = await administradorRepository.findForAuthenticationByUsername(username.trim())
  if (existing) {
    throw new AppError('Já existe um administrador cadastrado com este username.', 409)
  }

  const record = {
    username: username.trim(),
    senhaHash: await hash(senha, BCRYPT_ROUNDS),
  }

  return administradorRepository.create(record)
}

async function runFromCli() {
  const [username, senha] = process.argv.slice(2)
  if (!username || !senha) {
    console.error('Uso: npx tsx src/scripts/seedAdmin.ts <username> <senha>')
    process.exit(1)
  }

  try {
    const admin = await createInitialAdmin(username, senha)
    console.log(`Administrador "${admin.username}" criado com sucesso (ID: ${admin.idAdministrador}).`)
    process.exit(0)
  } catch (error) {
    console.error('Erro ao criar administrador inicial:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

if (process.argv[1]?.includes('seedAdmin')) {
  void runFromCli()
}
