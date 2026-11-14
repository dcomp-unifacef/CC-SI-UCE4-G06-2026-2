import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import indexRouter from './routes/index'
import usersRouter from './routes/users'
import clientesRouter from './routes/clientes'
import compromissosRouter from './routes/compromissos'
import administradoresRouter from './routes/administradores'
import categoriasCompromissoRouter from './routes/categoriasCompromisso'

const app = express()

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

/***************** ROTAS *************************/

app.use('/', indexRouter)
app.use('/users', usersRouter)

app.use('/clientes', clientesRouter)
app.use('/compromissos', compromissosRouter)
app.use('/administradores', administradoresRouter)
app.use('/categorias-compromisso', categoriasCompromissoRouter)

export default app
