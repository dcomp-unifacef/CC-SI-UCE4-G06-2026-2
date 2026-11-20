import type { Cliente, ClienteInput } from '../types/Cliente'
import { apiRequest, jsonBody } from '../services/api'

export function listClientes(): Promise<Cliente[]> {
  return apiRequest('/clientes')
}

export function getCliente(id: number): Promise<Cliente> {
  return apiRequest(`/clientes/${id}`)
}

export function createCliente(input: ClienteInput): Promise<Cliente> {
  return apiRequest('/clientes', {
    method: 'POST',
    body: jsonBody(input),
  })
}

export interface LeadInput {
  razaoSocialNome: string
  telefoneWhatsapp: string
  email?: string | null
}

export function createLead(input: LeadInput): Promise<Cliente> {
  return apiRequest('/clientes/contato', {
    method: 'POST',
    body: jsonBody(input),
  })
}

export function updateCliente(
  id: number,
  input: ClienteInput,
): Promise<Cliente> {
  return apiRequest(`/clientes/${id}`, {
    method: 'PUT',
    body: jsonBody(input),
  })
}

export function deleteCliente(id: number): Promise<void> {
  return apiRequest(`/clientes/${id}`, { method: 'DELETE' })
}