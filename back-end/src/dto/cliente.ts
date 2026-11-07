export interface CreateClienteDto {
  razaoSocialNome: string
  cnpjCpf?: string | null
  telefoneWhatsapp: string
  email?: string | null
  ramoAtuacao?: string | null
  origemContato?: string
  observacoes?: string | null
}

export interface UpdateClienteDto {
  razaoSocialNome?: string
  cnpjCpf?: string | null
  telefoneWhatsapp?: string
  email?: string | null
  ramoAtuacao?: string | null
  origemContato?: string
  observacoes?: string | null
}
