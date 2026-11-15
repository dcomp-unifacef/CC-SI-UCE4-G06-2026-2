export interface Cliente {
  idCliente: number
  razaoSocialNome: string
  cnpjCpf: string | null
  telefoneWhatsapp: string
  email: string | null
  ramoAtuacao: string | null
  origemContato: string
  observacoes: string | null
  criadoEm: string
}

export interface ClienteInput {
  razaoSocialNome: string
  cnpjCpf: string | null
  telefoneWhatsapp: string
  email: string | null
  ramoAtuacao: string | null
  origemContato: string
  observacoes: string | null
}