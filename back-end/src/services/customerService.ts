import * as clienteRepository from '../repositories/clienteRepository';
import type { CreateClienteDto, UpdateClienteDto } from '../types/cliente';
import { AppError } from '../types/AppError';

export async function create(data: CreateClienteDto) {
  if (!data.nomeEmpresa || !data.nomeResponsavel || !data.cnpj || !data.telefone || !data.email) {
    throw new AppError('Campos obrigatórios ausentes. Verifique nomeEmpresa, nomeResponsavel, cnpj, telefone e email.', 400);
  }

  return await clienteRepository.create(data);
}

export async function findAll() {
  return await clienteRepository.findAll();
}

export async function findById(id: number) {
  const cliente = await clienteRepository.findById(id);
  
  if (!cliente) {
    throw new AppError('Cliente não encontrado', 404);
  }
  
  return cliente;
}

export async function update(id: number, data: UpdateClienteDto) {
  await findById(id);
  
  return await clienteRepository.update(id, data);
}

export async function remove(id: number) {
  await findById(id);
  
  return await clienteRepository.remove(id);
}