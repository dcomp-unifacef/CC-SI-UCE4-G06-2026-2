export interface CreateCompromissoDto {
  titulo: string
  descricao?: string | null
  dataHoraInicio: string
  dataHoraFim?: string | null
  concluido?: boolean
  alertaEmitido?: boolean
  antecedenciaAlertaMinutos?: number | null
  idCategoria?: number | null
  idAdministrador: number
  idCliente?: number | null
}

export interface UpdateCompromissoDto {
  titulo?: string
  descricao?: string | null
  dataHoraInicio?: string
  dataHoraFim?: string | null
  concluido?: boolean
  alertaEmitido?: boolean
  antecedenciaAlertaMinutos?: number | null
  idCategoria?: number | null
  idAdministrador?: number
  idCliente?: number | null
}
