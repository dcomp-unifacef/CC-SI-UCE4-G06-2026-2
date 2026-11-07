import { Router } from 'express'
import * as controller from '../controllers/administradorController'

const router = Router()

router.post('/autenticar', controller.authenticate)
router.post('/', controller.create)
router.get('/', controller.retrieveAll)
router.get('/:id', controller.retrieveOne)
router.put('/:id', controller.update)
router.put('/:id/senha', controller.changePassword)
router.delete('/:id', controller.remove)

export default router
