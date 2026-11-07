export interface CreateCompromissoDto {
  titulo: string
  descricao?: string | null
  data: string
  horarioInicio: string
  horarioFim?: string | null
  pregao?: string | null
  statusCompromisso?: string
  antecedenciaAlerta?: number
  idCliente: number
}

export interface UpdateCompromissoDto {
  titulo?: string
  descricao?: string | null
  data?: string
  horarioInicio?: string
  horarioFim?: string | null
  pregao?: string | null
  statusCompromisso?: string
  antecedenciaAlerta?: number
  idCliente?: number
}
