import type { Compromisso, CompromissoInput } from '../types/Compromisso'
import { apiRequest, jsonBody } from '../services/api'

export function listCompromissos(): Promise<Compromisso[]> {
  return apiRequest('/compromissos')
}

export function getCompromisso(id: number): Promise<Compromisso> {
  return apiRequest(`/compromissos/${id}`)
}

export function createCompromisso(
  input: CompromissoInput,
): Promise<Compromisso> {
  return apiRequest('/compromissos', {
    method: 'POST',
    body: jsonBody(input),
  })
}

export function updateCompromisso(
  id: number,
  input: CompromissoInput,
): Promise<Compromisso> {
  return apiRequest(`/compromissos/${id}`, {
    method: 'PUT',
    body: jsonBody(input),
  })
}

export function toggleCompromissoConcluido(
  id: number,
): Promise<Compromisso> {
  return apiRequest(`/compromissos/${id}/concluido`, { method: 'PATCH' })
}

export function deleteCompromisso(id: number): Promise<void> {
  return apiRequest(`/compromissos/${id}`, { method: 'DELETE' })
}