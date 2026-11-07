export interface CreateAdministradorDto {
  username: string
  senha: string
}

export interface UpdateAdministradorDto {
  username?: string
  senha?: string
}

export interface CreateAdministradorData {
  username: string
  senhaHash: string
}

export interface UpdateAdministradorData {
  username?: string
  senhaHash?: string
}
