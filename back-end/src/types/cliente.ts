export interface CreateClienteDto {
  nomeEmpresa: string
  nomeResponsavel: string
  cnpj: string
  telefone: string
  email: string
  ramo?: string | null
  participouLicitacoes?: boolean
}

export interface UpdateClienteDto {
  nomeEmpresa?: string
  nomeResponsavel?: string
  cnpj?: string
  telefone?: string
  email?: string
  ramo?: string | null
  participouLicitacoes?: boolean
}
