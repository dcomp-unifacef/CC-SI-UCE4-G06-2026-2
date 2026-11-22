import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import indexRouter from './routes/index'
import clientesRouter from './routes/clientes'
import compromissosRouter from './routes/compromissos'
import administradoresRouter from './routes/administradores'
import categoriasCompromissoRouter from './routes/categoriasCompromisso'
import { errorHandler } from './errors/errorHandler'
import { corsMiddleware, csrfProtection } from './middlewares/authMiddleware'

const app = express()
const isProduction = process.env.NODE_ENV === 'production'
const frontendDistPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../front-end/dist',
)

app.use(logger('dev'))
app.use(corsMiddleware)
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(csrfProtection)

if (isProduction) {
  app.use(express.static(frontendDistPath))
} else {
  app.use('/', indexRouter)
}

app.use('/clientes', clientesRouter)
app.use('/compromissos', compromissosRouter)
app.use('/administradores', administradoresRouter)
app.use('/categorias-compromisso', categoriasCompromissoRouter)

if (isProduction) {
  const apiPathPrefixes = [
    '/api',
    '/clientes',
    '/compromissos',
    '/administradores',
    '/categorias-compromisso',
  ]

  app.use((req, res, next) => {
    const isApiRequest = apiPathPrefixes.some(
      (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`),
    )

    if (
      req.method !== 'GET' ||
      !req.accepts('html') ||
      extname(req.path) ||
      isApiRequest
    ) {
      return next()
    }

    res.sendFile(resolve(frontendDistPath, 'index.html'), (error) => {
      if (error) next(error)
    })
  })
}

app.use(errorHandler)

export default app
