import type { Administrador } from './Administrador'
import type { CategoriaCompromisso } from './CategoriaCompromisso'
import type { Cliente } from './Cliente'

export interface Compromisso {
  idCompromisso: number
  titulo: string
  descricao: string | null
  dataHoraInicio: string
  dataHoraFim: string | null
  concluido: boolean
  alertaEmitido: boolean
  antecedenciaAlertaMinutos: number | null
  criadoEm: string
  idCategoria: number | null
  categoria: CategoriaCompromisso | null
  idCliente: number | null
  cliente: Cliente | null
  idAdministrador: number
  administrador: Pick<Administrador, 'idAdministrador' | 'username' | 'criadoEm'>
}

export interface CompromissoInput {
  titulo: string
  descricao: string | null
  dataHoraInicio: string
  dataHoraFim: string | null
  antecedenciaAlertaMinutos: number | null
  idCategoria: number | null
  idCliente: number | null
  idAdministrador?: number
}