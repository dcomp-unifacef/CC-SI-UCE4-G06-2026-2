import type {
  CategoriaCompromisso,
  CategoriaCompromissoInput,
} from '../types/CategoriaCompromisso'
import { apiRequest, jsonBody } from '../services/api'

export function listCategorias(): Promise<CategoriaCompromisso[]> {
  return apiRequest('/categorias-compromisso')
}

export function getCategoria(id: number): Promise<CategoriaCompromisso> {
  return apiRequest(`/categorias-compromisso/${id}`)
}

export function createCategoria(
  input: CategoriaCompromissoInput,
): Promise<CategoriaCompromisso> {
  return apiRequest('/categorias-compromisso', {
    method: 'POST',
    body: jsonBody(input),
  })
}

export function updateCategoria(
  id: number,
  input: CategoriaCompromissoInput,
): Promise<CategoriaCompromisso> {
  return apiRequest(`/categorias-compromisso/${id}`, {
    method: 'PUT',
    body: jsonBody(input),
  })
}

export function deleteCategoria(id: number): Promise<void> {
  return apiRequest(`/categorias-compromisso/${id}`, { method: 'DELETE' })
}