export interface ExpressError extends Error {
  code?: string
  errno?: number
  path?: string
  status?: number
  syscall?: string
}

export class AppError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode

    Object.setPrototypeOf(this, AppError.prototype)
  }
}