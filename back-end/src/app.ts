import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import indexRouter from './routes/index'
import clientesRouter from './routes/clientes'
import compromissosRouter from './routes/compromissos'
import administradoresRouter from './routes/administradores'
import categoriasCompromissoRouter from './routes/categoriasCompromisso'
import { errorHandler } from './errors/errorHandler'
import { corsMiddleware, csrfProtection } from './middlewares/authMiddleware'

const app = express()

app.use(logger('dev'))
app.use(corsMiddleware)
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(csrfProtection)

app.use('/', indexRouter)
app.use('/clientes', clientesRouter)
app.use('/compromissos', compromissosRouter)
app.use('/administradores', administradoresRouter)
app.use('/categorias-compromisso', categoriasCompromissoRouter)

app.use(errorHandler)

export default app
