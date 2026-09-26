import * as compromissoRepository from '../repositories/compromissoRepository';
import * as clienteService from './customerService';
import type { CreateCompromissoDto, UpdateCompromissoDto } from '../types/compromisso';
import { AppError } from '../types/AppError';

export async function create(data: CreateCompromissoDto) {
  if (!data.titulo || !data.data || !data.horarioInicio || !data.idCliente) {
    throw new AppError('Campos obrigatórios ausentes. Verifique titulo, data, horarioInicio e idCliente.', 400);
  }

  if (isNaN(Date.parse(data.data))) {
    throw new AppError('O formato da data fornecida é inválido.', 400);
  }

  await clienteService.findById(data.idCliente);

  return await compromissoRepository.create(data);
}

export async function findAll() {
  return await compromissoRepository.findAll();
}

export async function findById(id: number) {
  const compromisso = await compromissoRepository.findById(id);
  
  if (!compromisso) {
    throw new AppError('Compromisso não encontrado', 404);
  }
  
  return compromisso;
}

export async function update(id: number, data: UpdateCompromissoDto) {
  await findById(id);

  if (data.idCliente) {
    await clienteService.findById(data.idCliente);
  }

  return await compromissoRepository.update(id, data);
}

export async function remove(id: number) {
  await findById(id);
  
  return await compromissoRepository.remove(id);
}