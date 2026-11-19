import { Router } from 'express'
import * as controller from '../controllers/categoriaCompromissoController'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

router.use(requireAuth)

router.get('/', controller.retrieveAll)
router.get('/:id', controller.retrieveOne)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

export default router
