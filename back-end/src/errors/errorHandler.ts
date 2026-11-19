import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../types/error'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      erro: err.message,
    })
    return
  }

  if (
    err &&
    typeof err === 'object' &&
    'statusCode' in err &&
    typeof (err as { statusCode: unknown }).statusCode === 'number'
  ) {
    const status = (err as { statusCode: number }).statusCode
    const message =
      'message' in err && typeof (err as { message: unknown }).message === 'string'
        ? (err as { message: string }).message
        : 'Erro na requisição.'
    res.status(status).json({
      erro: message,
    })
    return
  }

  console.error('Erro interno inesperado:', err)

  res.status(500).json({
    erro: 'Erro interno do servidor.',
  })
}
